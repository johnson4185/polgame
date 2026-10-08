// REPUBLIC: 543 — Authoritative Core Simulation Engine
// The reducer is pure: no sound, timers, Date.now() or Math.random() in here.
// Sounds for engine events are played by GameContext when it observes state changes.
import {
  GameState,
  GameDate,
  OperationState,
  CampaignMode,
  LokSabhaConstituency,
  NewsArticle,
  JournalEntry,
  StateData,
  CrisisEvent,
  GameEnding,
  ActionOutcome,
  StoryEvent,
  StoryEffects,
  StoryState,
  MediaState,
  MediaActionKind,
  Platform,
} from '../types';
import { INITIAL_STATES, generateFull543Constituencies } from '../data/statesAndConstituencies';
import { HISTORICAL_ARCHIVE } from '../data/historicalArchive';
import { INITIAL_RECRUITS } from '../data/recruits';
import { INITIAL_CASES } from '../data/investigations';
import { INITIAL_REFORMS, INITIAL_CABINET } from '../data/reforms';
import { CRISIS_EVENT_DECK } from '../data/crises';
import { SeededRNG } from './random';
import { STORY_EVENTS, getStoryEvent } from '../data/story';
import { getOperationTemplate, type OperationTemplate } from '../data/operations';
import { HASHTAGS, POST_TEMPLATES } from '../data/media';
import { emptySkillProgress, fadeSkills, trainSkills } from './skills';
import { WEEK_DAYS, ageEnergyPenalty, ageOn, isBirthday, ordinal } from './ages';
import { CHAPTER_NAME, stepGeography } from './geography';
import { ELECTION_DAY_NOISE, dentGovernment, initialMood, settleSeats, shiftStateMoods, stepMood, surfaceIssue } from './country';
import { PROMOTION_PAY_RISE, RANK_LABEL, nextRank, promotionBlocker, stepTeam, teamOutput } from './team';
import type { SkillKey } from '../types';

export const SAVE_VERSION = 13;

// Balance constants — tune here rather than inline
export const BALANCE = {
  actionEnergyCost: 6,
  actionStressCost: 2,
  minEnergyToAct: 10,
  overnightEnergyRecovery: 10,
  quest1Volunteers: 5000,
  partyVolunteersRequired: 15000,
  dailyVolunteerAttrition: 0.01,
  /** Followers level off near this (roughly CJP's real peak reach) */
  followerCap: 25_000_000,
  /** Share of followers who become volunteers each day */
  followerToVolunteer: 0.00001,
  /** Share of followers lost each day to attention decay */
  followerDecay: 0.012,
  partyRegistrationCost: 50000,
  securityDepositGeneral: 25000,
  securityDepositReserved: 12500,
  legalAidCost: 10000,
  boostCost: 5000,
  lobbyCost: 10000,
  pilMinReadiness: 70,
  exposeMinReadiness: 50,
  reformsForVictory: 3,
  majority: 272,
};

const INITIAL_CORROBORATED = INITIAL_CASES.reduce(
  (n, c) => n + c.evidenceItems.filter(e => e.isCorroborated).length,
  0,
);

/** Act 1 opens the day after the "cockroach" remark (docs/story-brief.md) */
export const INITIAL_GAME_DATE: GameDate = {
  year: 2026,
  month: 5,
  day: 16,
};

/** The record ends here; Act 2 (sandbox) begins */
export const ACT2_START = '2026-10-05';

export type GovStage = 'IGNORE' | 'BLOCK_ACCOUNTS' | 'POLICE_ACTION' | 'NEGOTIATE';
export const GOV_STAGES: { stage: GovStage; label: string; from: number; effect: string }[] = [
  { stage: 'IGNORE', label: 'Ignore', from: 0, effect: 'The government pretends you don\'t exist.' },
  { stage: 'BLOCK_ACCOUNTS', label: 'Block accounts', from: 25, effect: 'Accounts get withheld: follower growth slows.' },
  { stage: 'POLICE_ACTION', label: 'Police action', from: 50, effect: 'Detentions and barricades: legal heat rises every day.' },
  { stage: 'NEGOTIATE', label: 'Negotiate', from: 75, effect: 'Ministers come to the table: legal heat eases.' },
];
export function govStage(pressure: number): GovStage {
  return [...GOV_STAGES].reverse().find(g => pressure >= g.from)!.stage;
}

export function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function formatDate(date: GameDate): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.day.toString().padStart(2, '0')} ${months[date.month - 1]} ${date.year}`;
}

export function isoDate(d: GameDate): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

export function initialMediaState(): MediaState {
  return {
    narrative: { movement: 5, government: 45 },
    trending: [],
    platforms: { X: 'ACTIVE', INSTAGRAM: 'ACTIVE', YOUTUBE: 'ACTIVE', TELEGRAM: 'ACTIVE', WHATSAPP: 'ACTIVE' },
    feed: [],
  };
}

export const MEDIA_ACTIONS: Record<MediaActionKind, { label: string; blurb: string; cost: number }> = {
  MEME: { label: 'Post a meme', blurb: 'Followers and narrative up; might backfire.', cost: 0 },
  HASHTAG: { label: 'Launch a hashtag', blurb: 'Start a trend. The government notices.', cost: 0 },
  LIVE: { label: 'Go live', blurb: 'Big reach and volunteers, some legal heat.', cost: 0 },
  DEBUNK: { label: 'Counter fake news', blurb: 'Win back the narrative and credibility.', cost: 5000 },
};

export function initialStoryState(start: GameDate): StoryState {
  return { act: 1, startedOn: isoDate(start), firedIds: [], choices: {}, queue: [], activeEventId: null, divergence: 0 };
}

/**
 * Support for the movement in a state (0–100), for the map: local seat support plus a share of
 * national trust and the state chapter's strength.
 */
export function stateSupport(state: GameState, stateName: string): number {
  const seats = state.constituencies.filter(c => c.state === stateName);
  const local = seats.length ? seats.reduce((n, c) => n + c.cjpSupportScore, 0) / seats.length : 0;
  const chapter = state.states.find(s => s.name === stateName)?.cjpChapterLevel ?? 0;
  return clamp(Math.round(local * 1.5 + state.movement.publicTrust * 0.3 + chapter * 5), 0, 100);
}

/** Fresh copy of the archive with entries up to `date` unlocked */
export function archiveUnlockedBy(date: GameDate) {
  const iso = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  return HISTORICAL_ARCHIVE.map(d => ({ ...d, isUnlocked: d.historicalDate <= iso }));
}

/** A running campaign built from a template, starting on `start` */
export function operationFromTemplate(t: OperationTemplate, start: GameDate, seq: number): OperationState {
  const protest = t.type === 'JANTAR_MANTAR_PROTEST' || t.type === 'PARLIAMENT_MARCH';
  return {
    id: `OP-${t.id}-${dateKey(start)}-${seq}`,
    templateId: t.id,
    fictional: t.fictional,
    title: t.title,
    type: t.type,
    location: t.location,
    stateName: t.stateName,
    status: 'ACTIVE',
    startDate: { ...start },
    durationDays: t.durationDays,
    currentDay: 1,
    budgetAllocated: t.budget,
    crowdSize: t.crowd ?? 500,
    crowdMorale: 80,
    suppliesWaterFood: 75,
    medicalReadiness: 55,
    legalSupportOnSite: false,
    policePermissionStatus: protest ? 'PENDING' : 'GRANTED',
    policeNegotiationTension: protest ? 40 : 15,
    mediaCoverageLevel: 45,
    speakerStageStatus: 'ACTIVE',
    weatherCondition: start.month >= 4 && start.month <= 6 ? 'HEATWAVE' : start.month >= 7 && start.month <= 9 ? 'MONSOON_RAIN' : 'SUNNY',
    assignedStaffIds: [],
    dailyLog: [`Day 1: ${t.blurb}`],
  };
}

/** Add or boost a trending hashtag */
function trendTag(state: GameState, tag: string, posts: number): GameState {
  const others = state.media.trending.filter(t => t.tag !== tag);
  const prev = state.media.trending.find(t => t.tag === tag)?.posts ?? 0;
  const trending = [{ tag, posts: prev + Math.round(posts) }, ...others].sort((a, b) => b.posts - a.posts).slice(0, 8);
  return { ...state, media: { ...state.media, trending } };
}

/** Add a post by a fictional citizen to the feed */
function addPost(state: GameState, trigger: string, rng: SeededRNG): GameState {
  const pool = POST_TEMPLATES.filter(p => p.trigger === trigger || p.trigger === 'any');
  if (!pool.length) return state;
  const t = pool[Math.floor(rng.next() * pool.length)];
  const tag = state.media.trending[0]?.tag ?? '#MainBhiCockroach';
  const post = {
    id: uid(state, `POST-${state.media.feed.length}`),
    author: t.author,
    handle: t.handle,
    text: t.text.replace('{tag}', tag),
    likes: Math.round((state.movement.followers * 0.002 + 50) * (0.5 + rng.next())),
    date: { ...state.currentDate },
  };
  return { ...state, media: { ...state.media, feed: [post, ...state.media.feed].slice(0, 30) } };
}

/** Move the narrative split; the two shares never exceed 100 together */
function shiftNarrative(state: GameState, movement: number, government: number): GameState {
  const m = clamp(state.media.narrative.movement + movement, 0, 90);
  const g = clamp(state.media.narrative.government + government, 0, 100 - m);
  return { ...state, media: { ...state.media, narrative: { movement: m, government: g } } };
}

/**
 * Rewards for a mini-game score (0–100). Computed here, not in the UI, so the engine stays the
 * single source of truth.
 */
/** Which ministry drives each reform sector */
const SECTOR_MINISTRY: Record<string, string> = {
  EXAM_SECURITY: 'MIN-EDU',
  EDUCATION_INFRA: 'MIN-EDU',
  JUDICIAL_ACCOUNTABILITY: 'MIN-LAW',
  CIVIC_PROCUREMENT: 'MIN-FIN',
  HEALTH_CARE: 'MIN-HEALTH',
};

/** Earliest date the next general election can be called (a year after the last count) */
export function nextElectionDate(state: GameState): GameDate | null {
  const last = state.party.lastElectionDate;
  if (!last) return null;
  return { year: last.year + 1, month: last.month, day: last.day };
}

export function miniGameRewards(kind: 'RALLY' | 'TV_DEBATE', rawScore: number) {
  const score = clamp(Math.round(rawScore), 0, 100);
  if (kind === 'RALLY') {
    return {
      score,
      trustDelta: Math.floor(score * 0.18 + 5),
      fundsDelta: Math.floor(score * 180 + 3500),
      volunteersDelta: Math.floor(score * 8 + 200),
      xpDelta: 350,
      notes: `A ground rally with crowd energy at ${score}%. Volunteers signed up at the stage.`,
    };
  }
  return {
    score,
    trustDelta: Math.floor(score * 0.15 + 6),
    fundsDelta: Math.floor(score * 220 + 4000),
    volunteersDelta: Math.floor(score * 7 + 150),
    xpDelta: 400,
    notes: `A prime-time TV debate with public approval at ${score}%. Clips spread across social media.`,
  };
}

/** Start a campaign (no cost here; LAUNCH_OPERATION charges the player) */
function startOperation(state: GameState, templateId: string): GameState {
  const t = getOperationTemplate(templateId);
  if (!t) return state;
  if (state.operations.some(o => o.templateId === templateId && (o.status === 'ACTIVE' || o.status === 'PREPARATION'))) return state;
  const op = operationFromTemplate(t, state.currentDate, state.operations.length);
  let next: GameState = { ...state, operations: [...state.operations, op], activeOperationId: op.id };
  next = addJournal(next, `${t.title} Begins`, t.blurb, 'MILESTONE', 'OPERATIONS');
  return next;
}

/** Grow the CJP chapter (0–3) in each named state */
function growChapters(state: GameState, names: string[]): GameState {
  if (!names.length) return state;
  const states = state.states.map(s =>
    names.includes(s.name) ? { ...s, cjpChapterLevel: Math.min(3, s.cjpChapterLevel + 1) as 0 | 1 | 2 | 3 } : s,
  );
  return { ...state, states, movement: { ...state.movement, stateChaptersCount: states.filter(s => s.cjpChapterLevel > 0).length } };
}

/** End a running campaign early (story-driven), judged on how it went */
function endOperation(state: GameState, templateId: string): GameState {
  const op = state.operations.find(o => o.templateId === templateId && o.status === 'ACTIVE');
  if (!op) return state;
  const outcomeSummary = `${op.title} ended after ${op.currentDay} day${op.currentDay === 1 ? '' : 's'}.`;
  return {
    ...addJournal(state, `${op.title} Concluded`, outcomeSummary, 'HISTORIC_TURNING_POINT', 'OPERATIONS'),
    operations: state.operations.map(o => (o.id === op.id ? { ...o, status: 'CONCLUDED' as const, outcomeSummary } : o)),
  };
}

export function createInitialState(mode: CampaignMode = 'ABHIJEET_CJP', seed: number = 20260601): GameState {
  const constituencies = generateFull543Constituencies();

  const initialNews: NewsArticle[] = [
    {
      id: 'NEWS-INIT-01',
      date: { year: 2026, month: 5, day: 15 },
      headline: 'CJI compares unemployed youth to "cockroaches"',
      sourceName: 'Court reporting',
      biasTone: 'NEUTRAL_CRITICAL',
      body: 'Rebuking a counsel in a case about senior-advocate designation, CJI Surya Kant compared unemployed youth who turn to media, social media and RTI activism to "cockroaches" and "parasites of society". The context was fake law degrees.',
      impactTrust: 0,
      impactTension: 0,
      read: false,
    },
    {
      id: 'NEWS-INIT-02',
      date: { year: 2026, month: 5, day: 16 },
      headline: 'CJI says he was misquoted; the label sticks anyway',
      sourceName: 'Court reporting',
      biasTone: 'NEUTRAL_CRITICAL',
      body: 'Kant said he meant people entering "noble professions" on fake degrees, and that he held India\'s youth in high regard.',
      impactTrust: 0,
      impactTension: 0,
      read: false,
    },
  ];

  const initialJournal: JournalEntry[] = [
    {
      id: 'JOURNAL-001',
      date: { year: 2026, month: 5, day: 16 },
      title: 'The Remark',
      text: 'On 15 May, in the Supreme Court, the Chief Justice compared unemployed youth to "cockroaches". NEET-UG has been cancelled over a paper leak and thousands of students are waiting on results. The clip is everywhere.',
      significance: 'HISTORIC_TURNING_POINT',
      associatedScreen: 'JOURNAL',
    },
  ];

  return {
    version: SAVE_VERSION,
    seed,
    currentDate: { ...INITIAL_GAME_DATE },
    clockSpeed: 0, // Paused on start
    hasBegun: false,
    isPrologueComplete: false,
    activeScreen: 'OVERVIEW',
    theme: 'DARK',

    player: {
      name: mode === 'ABHIJEET_CJP' ? 'Abhijeet Dipke' : 'Kavita Sundaram',
      roleTitle: mode === 'ABHIJEET_CJP' ? 'Movement Convener & Activist' : 'Independent Citizen Petitioner',
      avatarUrl: '/images/portrait_abhijeet_1790774328368.jpg',
      campaignMode: mode,
      background: mode === 'ABHIJEET_CJP' ? 'STUDENT_ACTIVIST' : 'INVESTIGATIVE_JOURNALIST',
      energy: 85,
      stress: 30,
      health: 92,
      communication: 9,
      organizing: 8,
      research: 7,
      negotiation: 7,
      leadership: 8,
      financialAcumen: 6,
      skillProgress: emptySkillProgress(),
      // Abhijeet Dipke's birth date is in the public record; the custom citizen is invented
      birthDate: mode === 'ABHIJEET_CJP' ? { year: 1995, month: 9, day: 29 } : { year: 2000, month: 3, day: 14 },
      ...(mode === 'ABHIJEET_CJP' ? { birthDateSource: 'docs/cjp-timeline.md (Khaleej Times profile)' } : {}),
      personalSavings: 65000,
      personalDebt: 0,
      monthlyLivingCost: 18000,
      employmentStatus: 'FULL_TIME_ACTIVISM',
      salaryMonthly: 42000,
      familySupport: 75,
      burnoutRisk: false,
    },

    // Before the launch post: a joke with no followers, little money and no paid staff
    movement: {
      name: 'Cockroach Janta Party',
      followers: 0,
      publicTrust: 35,
      mediaCredibility: 40,
      volunteerCount: 100,
      coreStaffCount: 0,
      stateChaptersCount: 0,
      movementFunds: 40000,
      monthlyBurnRate: 10000,
      reformistLoyalty: 88,
      grassrootsLoyalty: 85,
      tacticalPragmatistsLoyalty: 70,
      hasJantarMantarHeld: false,
      hasFormedParty: false,
      isBannedOrSealed: false,
    },

    party: {
      isFormed: false,
      partyName: 'Cockroach Janta Party',
      abbreviation: 'CJP',
      symbol: 'The Resilient Bug (Cockroach)',
      registrationStatus: 'UNREGISTERED',
      partyFunds: 0,
      ideologicalPillars: [
        'Radical Transparency in Public Procurement',
        'Decentralized Autonomous Examination Security',
        'Student Mental Health & Coaching Regulation',
        'Unconditional Protection for Whistleblowers',
      ],
      manifestoPledges: [
        {
          id: 'MAN-01',
          category: 'EDUCATION',
          title: 'Autonomous Testing Authority with Zero Private Outsourcing',
          description: 'Transfer all national examinations back to public universities and autonomous judicial boards.',
          costEstimateCrores: 3500,
          publicAppeal: 92,
          vestedResistance: 75,
          fulfilled: false,
          reformId: 'REFORM-EXAM-ACT',
        },
        {
          id: 'MAN-02',
          category: 'GOVERNANCE',
          title: 'Real-Time Online Public Expenditure Tracking System',
          description: 'Every rupee spent on public works visible to taxpayers within 48 hours.',
          costEstimateCrores: 1200,
          publicAppeal: 88,
          vestedResistance: 85,
          fulfilled: false,
          reformId: 'REFORM-RTI-FASTTRACK',
        },
      ],
      candidateCount: 0,
      projectedSeats: 12,
      actualSeatsWon: 0,
      isRulingCoalition: false,
      isOppositionLead: false,
    },

    people: INITIAL_RECRUITS.map(p => ({ ...p, isHired: false, currentAssignment: null })),
    transactions: [] as GameState['transactions'],
    // Campaigns start through story events or the player (lib/game/data/operations.ts)
    operations: [],
    activeOperationId: null,
    cases: [...INITIAL_CASES],
    constituencies,
    // No chapters on 16 May: they are built through campaigns and the story
    states: INITIAL_STATES.map(s => ({ ...s, cjpChapterLevel: 0 as const, volunteerStrength: 0 })),
    historicalArchive: archiveUnlockedBy(INITIAL_GAME_DATE),
    newsFeed: initialNews,
    reforms: [...INITIAL_REFORMS],
    cabinet: [...INITIAL_CABINET],
    journal: initialJournal,

    electionLiveState: {
      isCountingUnderway: false,
      isCountingFinished: false,
      countedSeatsCount: 0,
      rulingSeats: 240,
      oppositionSeats: 232,
      cjpSeats: 0,
      otherSeats: 71,
      leadingParty: 'NDA',
      coalitionFormed: false,
    },

    // Turn & Action Point Game Mechanics
    actionPoints: 3,
    maxActionPoints: 3,
    crackdownLevel: 0,
    movementXP: 0,
    movementLevel: 1,
    activeQuests: [
      {
        id: 'QUEST-1',
        chapter: 1,
        title: 'The Cockroaches Come Together',
        description: 'Turn a joke into a movement: recruit 5,000 volunteers.',
        currentProgress: 100,
        targetProgress: BALANCE.quest1Volunteers,
        unit: 'Volunteers',
        rewardXP: 500,
        isCompleted: false,
      },
      {
        id: 'QUEST-2',
        chapter: 1,
        title: 'Expose the Mining Paper-Trail',
        description: 'File RTIs and corroborate evidence in the investigation cases (fictional sandbox content).',
        currentProgress: 0,
        targetProgress: 3,
        unit: 'Corroborations',
        rewardXP: 750,
        isCompleted: false,
      },
      {
        id: 'QUEST-3',
        chapter: 2,
        title: 'Road to 272: Form the People’s Party',
        description: `From 5 October (Act 2): reach ${BALANCE.partyVolunteersRequired.toLocaleString('en-IN')} volunteers, win a PIL or exposé, then register the party with the ECI.`,
        currentProgress: 0,
        targetProgress: 3,
        unit: 'Milestones',
        rewardXP: 1200,
        isCompleted: false,
      }
    ],
    activeCrisis: null,
    activeMiniGame: null,

    settings: {
      soundEnabled: true,
      volume: 0.5,
      reducedMotion: false,
      theme: 'DARK',
    },

    activeDialogue: null,
    lastOutcome: null,
    idCounter: 0,
    insolventMonths: 0,
    gameOver: null,
    story: initialStoryState(INITIAL_GAME_DATE),
    govResponse: { pressure: 0 },
    media: initialMediaState(),
    nationalMood: initialMood(),
  };
}

export type GameAction =
  | { type: 'SET_SCREEN'; screen: GameState['activeScreen'] }
  | { type: 'SET_CLOCK_SPEED'; speed: GameState['clockSpeed'] }
  | { type: 'ADVANCE_DAY'; routine?: boolean }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'REST_DAY' }
  | { type: 'TOGGLE_SOUND'; enabled: boolean }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; theme: 'DARK' | 'LIGHT' }
  | { type: 'FIELD_REST' }
  | { type: 'LEGAL_AID' }
  | { type: 'BOOST_CONSTITUENCY'; constituencyId: number }
  | { type: 'RESOLVE_CRISIS'; choiceId: string }
  | { type: 'TRIGGER_CRISIS'; crisis: CrisisEvent }
  | { type: 'OPEN_MINI_GAME'; miniGame: 'RALLY' | 'TV_DEBATE' }
  | { type: 'CLOSE_MINI_GAME' }
  | { type: 'FINISH_MINI_GAME'; score: number }
  | { type: 'TOGGLE_EMPLOYMENT'; status: GameState['player']['employmentStatus'] }
  | { type: 'PERSONAL_TO_MOVEMENT_DONATION'; amount: number }
  | { type: 'HIRE_STAFF'; personId: string }
  | { type: 'FIRE_STAFF'; personId: string }
  | { type: 'ASSIGN_STAFF'; personId: string; assignment: string }
  | { type: 'PROMOTE_STAFF'; personId: string }
  | { type: 'OPERATION_DECISION'; operationId: string; choice: 'SUPPLIES' | 'POLICE_TALKS' | 'MEDIA_SPEECH' | 'MEDICAL_AID' | 'MARCH_PARLIAMENT' }
  | { type: 'INVESTIGATION_ACTION'; caseId: string; action: 'RTI_FILING' | 'CORROBORATE_EVIDENCE' | 'LEGAL_PETITION_HC' | 'PUBLIC_EXPOSE' }
  | { type: 'FORM_PARTY'; partyName: string; abbreviation: string; symbol: string }
  | { type: 'NOMINATE_CANDIDATE'; constituencyId: number; candidateName: string; funding: number }
  | { type: 'TRIGGER_ELECTION' }
  | { type: 'STEP_ELECTION_COUNT' }
  | { type: 'FORM_COALITION'; partner: 'RULING' | 'OPPOSITION' | 'THIRD_FRONT' }
  | { type: 'TABLE_REFORM'; reformId: string }
  | { type: 'LOBBY_REFORM'; reformId: string }
  | { type: 'DISMISS_DIALOGUE' }
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'FINISH_PROLOGUE'; focus?: PrologueFocus }
  | { type: 'LOG_JOURNAL'; entry: JournalEntry }
  | { type: 'RESOLVE_STORY_CHOICE'; choiceId: string }
  | { type: 'LAUNCH_OPERATION'; templateId: string }
  | { type: 'SET_ACTIVE_OPERATION'; operationId: string }
  | { type: 'MEDIA_ACTION'; kind: MediaActionKind };

/** The issue the player leads with in the prologue; each gives a small starting edge */
export type PrologueFocus = 'EXAMS' | 'JOBS' | 'SPEECH';
export const PROLOGUE_FOCUS: Record<PrologueFocus, { label: string; effects: StoryEffects; blurb: string }> = {
  EXAMS: { label: 'Exam justice', effects: { credibility: 6, trust: 4 }, blurb: 'Students and parents trust you: +6 credibility, +4 trust.' },
  JOBS: { label: 'Jobs for the young', effects: { volunteers: 400, trust: 2 }, blurb: 'Job-seekers sign up early: +400 volunteers, +2 trust.' },
  SPEECH: { label: 'The right to speak', effects: { followers: 25000, legalHeat: 3 }, blurb: 'Free-speech crowd amplifies you: +25K followers, +3 legal heat.' },
};

// Actions still allowed after the campaign has ended
const POST_GAME_ACTIONS = new Set<GameAction['type']>([
  'SET_SCREEN', 'SET_CLOCK_SPEED', 'TOGGLE_SOUND', 'TOGGLE_THEME', 'SET_THEME',
  'DISMISS_DIALOGUE', 'LOAD_STATE',
]);

// ─── Helpers ────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

function dateKey(d: GameDate): number {
  return d.year * 10000 + d.month * 100 + d.day;
}

// Integer hash so nearby seeds don't produce correlated streams
function mix(...parts: number[]): number {
  let h = 0x811c9dc5;
  for (const p of parts) {
    h ^= p >>> 0;
    h = Math.imul(h, 0x01000193) >>> 0;
    h ^= h >>> 15;
  }
  return h >>> 0;
}

function rngFor(state: GameState, salt: number): SeededRNG {
  const rng = new SeededRNG(mix(state.seed, dateKey(state.currentDate), state.idCounter ?? 0, salt));
  for (let i = 0; i < 4; i++) rng.next();
  return rng;
}

function uid(state: GameState, prefix: string): string {
  return `${prefix}-${dateKey(state.currentDate)}-${state.idCounter ?? 0}`;
}

function withOutcome(state: GameState, text: string, tone: ActionOutcome['tone'] = 'SUCCESS'): GameState {
  return { ...state, lastOutcome: { id: (state.lastOutcome?.id ?? 0) + 1, text, tone } };
}

const fail = (state: GameState, text: string) => withOutcome(state, text, 'FAILURE');

function addJournal(
  state: GameState,
  title: string,
  text: string,
  significance: JournalEntry['significance'],
  associatedScreen: JournalEntry['associatedScreen'],
): GameState {
  const entry: JournalEntry = {
    id: uid(state, `JOURNAL-${state.journal.length}`),
    date: { ...state.currentDate },
    title,
    text,
    significance,
    associatedScreen,
  };
  return { ...state, journal: [entry, ...state.journal] };
}

/**
 * Spend one action point and the energy/stress it costs.
 * Returns an error message instead of a state when the player can't act.
 */
function spendAction(state: GameState, opts: { energy?: boolean } = {}): GameState | string {
  const useEnergy = opts.energy ?? true;
  if ((state.actionPoints ?? 0) <= 0) return 'No action points left today. End the day to recover.';
  if (useEnergy && state.player.energy < BALANCE.minEnergyToAct) {
    return `Too exhausted to act (energy ${state.player.energy}). Rest first.`;
  }
  return {
    ...state,
    actionPoints: state.actionPoints - 1,
    player: useEnergy
      ? {
          ...state.player,
          energy: clamp(state.player.energy - BALANCE.actionEnergyCost, 0, 100),
          stress: clamp(state.player.stress + BALANCE.actionStressCost, 0, 100),
        }
      : state.player,
  };
}

function spendFunds(state: GameState, amount: number, category: string, description: string): GameState {
  if (amount <= 0) return state;
  return {
    ...state,
    movement: { ...state.movement, movementFunds: state.movement.movementFunds - amount },
    transactions: [
      {
        id: uid(state, `TXN-${category.replace(/\W+/g, '').toUpperCase()}`),
        date: { ...state.currentDate },
        account: 'MOVEMENT' as const,
        type: 'EXPENSE' as const,
        category,
        amount,
        description,
        verified: true,
      },
      ...state.transactions,
    ].slice(0, 100),
  };
}

/**
 * Apply movement stat changes. Gains have diminishing returns so the movement can't snowball:
 * trust gains shrink above 50%, and volunteer gains shrink as the movement grows.
 * Losses always apply in full.
 */
function adjustMovement(
  state: GameState,
  d: { trust?: number; credibility?: number; volunteers?: number; funds?: number },
): GameState {
  const m = state.movement;
  const trust = d.trust ?? 0;
  const volunteers = d.volunteers ?? 0;
  const trustGain = trust > 0 ? Math.round(trust * Math.min(1, (100 - m.publicTrust) / 50)) : trust;
  const volunteerGain = volunteers > 0 ? Math.round((volunteers * 5000) / (5000 + m.volunteerCount)) : volunteers;
  return {
    ...state,
    movement: {
      ...m,
      publicTrust: clamp(m.publicTrust + trustGain, 0, 100),
      mediaCredibility: clamp(m.mediaCredibility + (d.credibility ?? 0), 0, 100),
      volunteerCount: Math.max(100, m.volunteerCount + volunteerGain),
      movementFunds: Math.max(0, m.movementFunds + (d.funds ?? 0)),
    },
  };
}

const adjustCrackdown = (state: GameState, delta: number): GameState => ({
  ...state,
  crackdownLevel: clamp((state.crackdownLevel ?? 15) + delta, 0, 100),
});

// ─── Election model ─────────────────────────────────────────────────────────

export interface SeatContext {
  trust: number;
  volunteers: number;
  crackdown: number;
  statesByName: Map<string, StateData>;
  swingRuling: number;
  swingOpp: number;
}

export function seatContext(state: GameState, swingRuling = 0, swingOpp = 0): SeatContext {
  return {
    trust: state.movement.publicTrust,
    volunteers: state.movement.volunteerCount,
    crackdown: state.crackdownLevel ?? 15,
    statesByName: new Map(state.states.map(s => [s.name, s])),
    swingRuling,
    swingOpp,
  };
}

/** Expected CJP vote share (%) in a seat; 0 when the party fields no candidate there. */
export function cjpVoteShare(c: LokSabhaConstituency, ctx: SeatContext, noise = 0): number {
  if (!c.cjpCandidate) return 0;
  const st = ctx.statesByName.get(c.state);
  const chapter = st?.cjpChapterLevel ?? 0;
  const mood =
    st?.regionalMood === 'REFORM_RECEPTIVE' ? 4 :
    st?.regionalMood === 'ANTI_INCUMBENCY' ? 3 :
    st?.regionalMood === 'VOLATILE' ? 1 : 0;
  const funding = 4 * Math.log10(1 + c.cjpCandidate.campaignFundingAllocated / 10000);
  const share =
    c.cjpSupportScore * (0.25 + ctx.trust / 200) +
    funding +
    c.cjpCandidate.localReputation / 20 +
    chapter * 2 +
    mood +
    Math.min(4, ctx.volunteers / 10000) -
    ctx.crackdown / 10 -
    // First-time parties lose votes to habit and doubt about whether they can win
    5 +
    noise;
  return clamp(share, 1, 55);
}

export type SeatWinner = 'RULING' | 'OPPOSITION' | 'OTHERS' | 'CJP';

export function contestSeat(c: LokSabhaConstituency, ctx: SeatContext, rng?: SeededRNG) {
  const n = (spread: number) => (rng ? (rng.next() - 0.5) * spread : 0);
  const cjp = cjpVoteShare(c, ctx, n(18));
  const ruling = Math.max(1, c.rulingVoteShareBaseline + ctx.swingRuling + n(6) - cjp * 0.45);
  const opp = Math.max(1, c.mainOppVoteShareBaseline + ctx.swingOpp + n(6) - cjp * 0.4);
  const others = Math.max(1, Math.max(4, 100 - c.rulingVoteShareBaseline - c.mainOppVoteShareBaseline) - cjp * 0.15);
  const total = ruling + opp + others + cjp;
  const shares: Record<SeatWinner, number> = {
    RULING: (ruling / total) * 100,
    OPPOSITION: (opp / total) * 100,
    OTHERS: (others / total) * 100,
    CJP: (cjp / total) * 100,
  };
  const ranked = (Object.keys(shares) as SeatWinner[]).sort((a, b) => shares[b] - shares[a]);
  return { shares, winner: ranked[0], runnerUp: ranked[1], cjpRank: ranked.indexOf('CJP') + 1 };
}

function projectSeats(state: GameState): number {
  if (!state.party.isFormed) return 0;
  const mood = state.nationalMood ?? initialMood();
  const ctx = seatContext(state, mood.nda, mood.india);
  return state.constituencies.filter(c => c.cjpCandidate && contestSeat(c, ctx).winner === 'CJP').length;
}

function runElection(state: GameState): GameState {
  const rng = rngFor(state, 543);
  // Election-day swing: the national mood plus a little uncertainty
  const mood = state.nationalMood ?? initialMood();
  const ctx = seatContext(state, mood.nda + (rng.next() - 0.5) * ELECTION_DAY_NOISE, mood.india + (rng.next() - 0.5) * ELECTION_DAY_NOISE);
  const labels: Record<SeatWinner, string> = {
    RULING: 'NDA',
    OPPOSITION: 'INDIA',
    OTHERS: 'OTHERS',
    CJP: state.party.abbreviation,
  };

  const constituencies = state.constituencies.map(c => {
    const r = contestSeat(c, ctx, rng);
    const turnout = c.totalVotersEstimated * (0.6 + rng.next() * 0.1);
    const votes = (w: SeatWinner) => Math.round((turnout * r.shares[w]) / 100);
    return {
      ...c,
      electionResult: {
        winnerParty: labels[r.winner],
        winnerCandidate: r.winner === 'CJP' ? c.cjpCandidate!.name : `${labels[r.winner]} candidate`,
        votesWon: votes(r.winner),
        marginVotes: votes(r.winner) - votes(r.runnerUp),
        cjpVotes: votes('CJP'),
        cjpVoteShare: Math.round(r.shares.CJP * 10) / 10,
        rank: c.cjpCandidate ? r.cjpRank : 0,
        rulingShare: Math.round(r.shares.RULING),
        oppShare: Math.round(r.shares.OPPOSITION),
      },
    };
  });
  return { ...state, constituencies };
}

function tallyCounted(state: GameState, counted: number) {
  const t = { ruling: 0, opp: 0, cjp: 0, others: 0 };
  for (const c of state.constituencies.slice(0, counted)) {
    const w = c.electionResult?.winnerParty;
    if (w === 'NDA') t.ruling++;
    else if (w === 'INDIA') t.opp++;
    else if (w === state.party.abbreviation) t.cjp++;
    else t.others++;
  }
  return t;
}

// ─── Quests, progression and endings (derived after every action) ───────────

function deriveQuests(state: GameState): GameState {
  let xp = state.movementXP ?? 0;
  const corroborated =
    state.cases.reduce((n, c) => n + c.evidenceItems.filter(e => e.isCorroborated).length, 0) -
    INITIAL_CORROBORATED;
  const caseWon = state.cases.some(c => c.currentStage === 'FILED_PIL' || c.currentStage === 'EXPOSED');
  const enoughVolunteers = state.movement.volunteerCount >= BALANCE.partyVolunteersRequired;

  const progressFor: Record<string, number> = {
    'QUEST-1': state.movement.volunteerCount,
    'QUEST-2': Math.max(0, corroborated),
    'QUEST-3': Number(enoughVolunteers) + Number(caseWon) + Number(state.party.isFormed),
  };

  const activeQuests = (state.activeQuests || []).map(q => {
    if (!(q.id in progressFor)) return q;
    const currentProgress = progressFor[q.id];
    const done = q.isCompleted || currentProgress >= q.targetProgress;
    if (done && !q.isCompleted) xp += q.rewardXP;
    return { ...q, currentProgress, isCompleted: done };
  });

  const movementLevel = clamp(Math.floor(xp / 1000) + 1, 1, 5);
  const maxActionPoints = 3 + (movementLevel >= 3 ? 1 : 0) + (movementLevel >= 5 ? 1 : 0);
  // Levelling up grants the new AP immediately
  const actionPoints = state.actionPoints + Math.max(0, maxActionPoints - (state.maxActionPoints ?? 3));

  return { ...state, activeQuests, movementXP: xp, movementLevel, maxActionPoints, actionPoints };
}

function checkEnding(state: GameState): GameEnding | null {
  const date = { ...state.currentDate };
  const passed = state.reforms.filter(r => r.status === 'PASSED_ACT').length;
  if (passed >= BALANCE.reformsForVictory) {
    return {
      kind: 'REFORMER', victory: true, date,
      title: 'The Accountability Republic',
      text: `${passed} reforms passed into law. What began as a heatwave vigil at Jantar Mantar is now written into the statute books — enforceable, auditable, and harder for any future government to undo.`,
    };
  }
  if (state.player.health <= 15) {
    return {
      kind: 'COLLAPSE', victory: false, date,
      title: 'The Body Gives Out',
      text: `${state.player.name} collapsed from exhaustion and was hospitalised. Without its convener the movement fractured within weeks. Rest is not surrender — it is strategy.`,
    };
  }
  if ((state.crackdownLevel ?? 0) >= 100) {
    return {
      kind: 'SEALED', victory: false, date,
      title: 'Offices Sealed',
      text: 'Under mounting cases and preventive detentions, the movement’s offices were sealed and its accounts frozen. Pressure without legal cover invited the full weight of the state.',
    };
  }
  if ((state.insolventMonths ?? 0) >= 2) {
    return {
      kind: 'BANKRUPT', victory: false, date,
      title: 'The Money Ran Out',
      text: 'Two months of unpaid salaries and rent. Staff left, the office closed, and the movement became a WhatsApp group. Ideals need a ledger.',
    };
  }
  if (state.movement.publicTrust <= 5) {
    return {
      kind: 'IRRELEVANT', victory: false, date,
      title: 'Faded From the Headlines',
      text: 'Public trust evaporated. Reporters stopped calling and volunteers drifted home. A movement survives on credibility, and it was spent.',
    };
  }
  return null;
}

function finalize(next: GameState, prev: GameState): GameState {
  let s: GameState = { ...next, idCounter: (prev.idCounter ?? 0) + 1 };
  s = deriveQuests(s);
  if (s.party.isFormed && !s.electionLiveState.isCountingUnderway && !s.electionLiveState.isCountingFinished) {
    s = { ...s, party: { ...s.party, projectedSeats: projectSeats(s) } };
  }
  if (!s.gameOver) {
    const ending = checkEnding(s);
    if (ending) {
      s = addJournal({ ...s, gameOver: ending, clockSpeed: 0 }, `Campaign Ended: ${ending.title}`, ending.text, 'HISTORIC_TURNING_POINT', 'JOURNAL');
    }
  }
  return s;
}

/** Bring a saved game from any earlier version up to the current shape. */
export function migrateState(saved: GameState): GameState {
  const fresh = createInitialState(saved.player?.campaignMode ?? 'ABHIJEET_CJP', saved.seed);
  return {
    ...fresh,
    ...saved,
    version: SAVE_VERSION,
    settings: { ...fresh.settings, ...saved.settings },
    electionLiveState: { ...fresh.electionLiveState, ...saved.electionLiveState },
    lastOutcome: null,
    idCounter: saved.idCounter ?? 0,
    insolventMonths: saved.insolventMonths ?? 0,
    gameOver: saved.gameOver ?? null,
    // v4: story events. Old saves start the story from their current date so past events don't flood in.
    story: saved.story ?? initialStoryState(saved.currentDate ?? fresh.currentDate),
    // v9: skills grow with practice
    player: {
      ...saved.player,
      skillProgress: saved.player?.skillProgress ?? emptySkillProgress(),
      // v11: ages
      birthDate: saved.player?.birthDate ?? fresh.player.birthDate,
      birthDateSource: saved.player?.birthDateSource ?? fresh.player.birthDateSource,
    },
    // v5: followers and the government response meter
    movement: { ...saved.movement, followers: saved.movement?.followers ?? 0 },
    govResponse: saved.govResponse ?? { pressure: 0 },
    activeOperationId: saved.activeOperationId ?? saved.operations?.[0]?.id ?? null,
    // v7: media room
    media: saved.media ?? initialMediaState(),
    // v13: the country moves
    nationalMood: saved.nationalMood ?? initialMood(),
    // v8: manifesto pledges linked to reforms
    party: {
      ...saved.party,
      manifestoPledges: (saved.party?.manifestoPledges ?? fresh.party.manifestoPledges).map(pl => ({
        ...pl,
        reformId: pl.reformId ?? fresh.party.manifestoPledges.find(f => f.id === pl.id)?.reformId,
      })),
    },
    activeQuests: saved.activeQuests?.length ? saved.activeQuests : fresh.activeQuests,
    // v3: the archive was rebuilt from the record, and the real CJP team was added
    historicalArchive: (saved.version ?? 1) < 3 ? archiveUnlockedBy(saved.currentDate ?? fresh.currentDate) : saved.historicalArchive,
    // v3 added the real CJP team; v10 adds recruits who appear as the movement grows
    people: [...(saved.people ?? []), ...fresh.people.filter(p => !(saved.people ?? []).some(sp => sp.id === p.id))].map(p =>
      p.birthDate ? p : { ...p, birthDate: fresh.people.find(f => f.id === p.id)?.birthDate },
    ),
  };
}

// ─── Reducer ────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.gameOver && !POST_GAME_ACTIONS.has(action.type)) return state;
  if (action.type === 'ADVANCE_WEEK') return advanceWeek(state);
  const next = reduce(state, action);
  if (next === state) return state;
  return finalize(react(practise(next, state, action), state, action), state);
}

/** L5: the country reacts to what you do */
function react(next: GameState, prev: GameState, action: GameAction): GameState {
  if (action.type !== 'INVESTIGATION_ACTION') return next;
  const before = prev.cases.find(c => c.id === action.caseId)?.currentStage;
  const after = next.cases.find(c => c.id === action.caseId)?.currentStage;
  if (before === after || next.lastOutcome?.tone === 'FAILURE') return next;
  const hit = after === 'EXPOSED' ? 1.5 : after === 'FILED_PIL' ? 0.5 : 0;
  return hit ? { ...next, nationalMood: dentGovernment(next.nationalMood ?? initialMood(), hit) } : next;
}

/** End week (L3): play up to a week of routine days, stopping for anything that needs the player */
function advanceWeek(state: GameState): GameState {
  if (!state.party.isFormed) return fail(state, 'End week unlocks once the party is registered.');
  if (state.activeCrisis || state.activeMiniGame || state.story?.activeEventId) return state;
  let s = state;
  let days = 0;
  let stop: string | null = null;
  while (days < WEEK_DAYS) {
    const before = s;
    s = gameReducer(s, { type: 'ADVANCE_DAY', routine: true });
    if (s === before) break;
    days += 1;
    if (s.gameOver) return s;
    if (s.activeCrisis) stop = 'a crisis needs you';
    else if (s.story?.activeEventId) stop = 'something happened that needs a decision';
    else if (s.lastOutcome !== before.lastOutcome && s.lastOutcome?.tone === 'WARNING') stop = s.lastOutcome.text;
    if (stop) break;
  }
  const head = `${days} day${days === 1 ? '' : 's'} passed`;
  return stop ? withOutcome(s, `${head}. Stopped early: ${stop}`, 'WARNING') : withOutcome(s, `${head}. The team kept working.`);
}

/** Which skills an action trains, and by how much (L1: learning by doing) */
function skillGains(action: GameAction, prev: GameState): Partial<Record<SkillKey, number>> {
  switch (action.type) {
    case 'INVESTIGATION_ACTION':
      return action.action === 'LEGAL_PETITION_HC'
        ? { research: 6, negotiation: 10 }
        : action.action === 'PUBLIC_EXPOSE'
          ? { communication: 12 }
          : { research: 12 };
    case 'MEDIA_ACTION':
      return { communication: 10 };
    case 'BOOST_CONSTITUENCY':
      return { organizing: 10 };
    case 'LAUNCH_OPERATION':
      return { organizing: 15, leadership: 5 };
    case 'OPERATION_DECISION':
      return action.choice === 'POLICE_TALKS'
        ? { negotiation: 10 }
        : action.choice === 'MEDIA_SPEECH'
          ? { communication: 10 }
          : action.choice === 'MARCH_PARLIAMENT'
            ? { leadership: 12 }
            : { organizing: 8 };
    case 'LEGAL_AID':
      return { negotiation: 6 };
    case 'TABLE_REFORM':
      return { negotiation: 6 };
    case 'LOBBY_REFORM':
      return { negotiation: 12 };
    case 'FORM_COALITION':
      return { negotiation: 20 };
    case 'FORM_PARTY':
      return { leadership: 20, organizing: 10 };
    case 'NOMINATE_CANDIDATE':
      return { financialAcumen: 6, organizing: 4 };
    case 'PERSONAL_TO_MOVEMENT_DONATION':
      return { financialAcumen: 6 };
    case 'HIRE_STAFF':
    case 'ASSIGN_STAFF':
      return { leadership: 4 };
    case 'PROMOTE_STAFF':
      return { leadership: 6 };
    case 'RESOLVE_CRISIS':
      return { leadership: 12 };
    case 'RESOLVE_STORY_CHOICE':
      return { leadership: 6 };
    case 'FINISH_MINI_GAME': {
      // Practice scales with how well it went (score 0-100)
      const amount = 5 + Math.round(Math.max(0, Math.min(100, action.score)) / 7);
      return prev.activeMiniGame === 'TV_DEBATE' ? { communication: amount, negotiation: Math.round(amount / 2) } : { communication: amount, leadership: Math.round(amount / 2) };
    }
    default:
      return {};
  }
}

/** Train skills for an action that actually happened (a refused action teaches nothing). */
function practise(next: GameState, prev: GameState, action: GameAction): GameState {
  const gains = skillGains(action, prev);
  if (!Object.keys(gains).length) return next;
  const spentAP = next.actionPoints < prev.actionPoints;
  const outcome = next.lastOutcome !== prev.lastOutcome ? next.lastOutcome : null;
  const refused = !spentAP && outcome?.tone === 'FAILURE';
  if (refused) return next;
  const { player, levelUps } = trainSkills(next.player, gains, next.currentDate);
  let out: GameState = { ...next, player };
  if (levelUps.length) {
    const line = levelUps.join(' ');
    out = outcome ? { ...out, lastOutcome: { ...outcome, text: `${outcome.text} ${line}` } } : withOutcome(out, line);
  }
  return out;
}

function reduce(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // ── Meta / UI ──
    case 'SET_SCREEN':
      return { ...state, activeScreen: action.screen };

    case 'SET_CLOCK_SPEED':
      return { ...state, clockSpeed: action.speed };

    case 'TOGGLE_SOUND':
      return { ...state, settings: { ...state.settings, soundEnabled: action.enabled } };

    case 'TOGGLE_THEME':
      return {
        ...state,
        settings: { ...state.settings, theme: state.settings.theme === 'LIGHT' ? 'DARK' : 'LIGHT' },
      };

    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.theme } };

    case 'DISMISS_DIALOGUE':
      return { ...state, activeDialogue: null };

    case 'LOAD_STATE':
      return migrateState(action.state);

    case 'LOG_JOURNAL':
      return { ...state, journal: [action.entry, ...state.journal] };

    case 'FINISH_PROLOGUE':
      // Turn-based by default: the player ends each day; auto-advance is opt-in via the clock
      return pumpStory(
        applyStoryEffects(
          { ...state, hasBegun: true, isPrologueComplete: true, clockSpeed: 0 },
          action.focus ? PROLOGUE_FOCUS[action.focus].effects : {},
        ),
      );

    case 'RESOLVE_STORY_CHOICE':
      return resolveStoryChoice(state, action.choiceId);

    case 'MEDIA_ACTION': {
      const def = MEDIA_ACTIONS[action.kind];
      if (state.movement.movementFunds < def.cost) return fail(state, `${def.label} needs ${inr(def.cost)}.`);
      const spent = spendAction(state);
      if (typeof spent === 'string') return fail(state, spent);
      const rng = rngFor(state, 19);
      // A withheld X account cuts the reach of memes and hashtags
      const reach = state.media.platforms.X === 'WITHHELD' ? 0.7 : 1;
      const f = state.movement.followers;
      let next = def.cost ? spendFunds(spent, def.cost, 'Media', def.label) : spent;
      let msg = '';
      let tone: ActionOutcome['tone'] = 'SUCCESS';
      if (action.kind === 'MEME') {
        if (rng.next() < 0.15) {
          next = applyStoryEffects(next, { trust: -2 });
          next = shiftNarrative(next, -2, 3);
          msg = 'The meme was misread and went viral for the wrong reasons: trust −2.';
          tone = 'WARNING';
        } else {
          const gain = Math.round(Math.max(20000, f * 0.02) * reach);
          next = applyStoryEffects(next, { followers: gain });
          next = shiftNarrative(next, 4, -1);
          msg = `The meme lands: +${Math.round(gain / 1000)}K followers, narrative +4.`;
        }
        next = addPost(next, 'MEME', rng);
      } else if (action.kind === 'HASHTAG') {
        const used = new Set(next.media.trending.map(t => t.tag));
        const pool = HASHTAGS.filter(h => h.theme !== 'HOSTILE' && !h.real && !used.has(h.tag));
        const tag = (pool.length ? pool : HASHTAGS.filter(h => h.theme !== 'HOSTILE'))[Math.floor(rng.next() * Math.max(1, pool.length))].tag;
        next = trendTag(next, tag, Math.max(5000, f * 0.04) * reach);
        next = applyStoryEffects(next, { followers: Math.round(f * 0.01 * reach), govResponse: 0.5 });
        next = shiftNarrative(next, 6, 1);
        next = addPost(next, HASHTAGS.find(h => h.tag === tag)!.theme, rng);
        msg = `${tag} is trending. Narrative +6; the government is watching.`;
      } else if (action.kind === 'LIVE') {
        const gain = Math.round(Math.max(30000, f * 0.04));
        next = applyStoryEffects(next, { followers: gain, volunteers: 200, legalHeat: 4 });
        next = shiftNarrative(next, 5, 0);
        next = addPost(next, 'LIVE', rng);
        msg = `You went live: +${Math.round(gain / 1000)}K followers, +200 volunteers, legal heat +4.`;
      } else {
        next = applyStoryEffects(next, { credibility: 3 });
        next = shiftNarrative(next, 3, -6);
        next = addPost(next, 'DEBUNK', rng);
        msg = 'Fake news debunked: credibility +3, the government loses ground in the narrative.';
      }
      return withOutcome(next, msg, tone);
    }

    case 'SET_ACTIVE_OPERATION':
      return state.operations.some(o => o.id === action.operationId) ? { ...state, activeOperationId: action.operationId } : state;

    case 'LAUNCH_OPERATION': {
      const t = getOperationTemplate(action.templateId);
      if (!t) return state;
      if (t.storyOnly) return fail(state, `${t.title} is part of the story; it starts when the story gets there.`);
      if (state.operations.some(o => o.templateId === t.id && o.status === 'ACTIVE')) return fail(state, `${t.title} is already running.`);
      if (state.movement.movementFunds < t.budget) return fail(state, `${t.title} needs ${inr(t.budget)}.`);
      const spent = spendAction(state);
      if (typeof spent === 'string') return fail(state, spent);
      const next = startOperation(spendFunds(spent, t.budget, 'Campaign', `Launch: ${t.title}`), t.id);
      return withOutcome(next, `${t.title} launched (${inr(t.budget)}, ${t.durationDays} days).`);
    }

    // ── Time ──
    case 'ADVANCE_DAY':
      if (state.activeCrisis || state.activeMiniGame || state.story?.activeEventId) return state;
      return advanceSimulationDay(state, { routine: action.routine });

    case 'REST_DAY': {
      if (state.activeCrisis || state.activeMiniGame || state.story?.activeEventId) return state;
      const rested = advanceSimulationDay({
        ...state,
        player: {
          ...state.player,
          energy: clamp(state.player.energy + 35, 0, 100),
          stress: clamp(state.player.stress - 25, 0, 100),
          health: clamp(state.player.health + 5, 0, 100),
        },
      });
      // Don't mask an insolvency warning raised during the simulated day
      if (rested.lastOutcome !== state.lastOutcome) return rested;
      return withOutcome(rested, 'Took a full day off: +35 energy, −25 stress, +5 health.');
    }

    // ── Daily actions (cost AP) ──
    case 'FIELD_REST': {
      const s = spendAction(state, { energy: false });
      if (typeof s === 'string') return fail(state, s);
      return withOutcome(
        {
          ...s,
          player: {
            ...s.player,
            energy: clamp(s.player.energy + 25, 0, 100),
            stress: clamp(s.player.stress - 15, 0, 100),
          },
        },
        'Strategy session over chai: +25 energy, −15 stress.',
      );
    }

    case 'LEGAL_AID': {
      if (state.movement.movementFunds < BALANCE.legalAidCost) {
        return fail(state, `Legal aid needs ${inr(BALANCE.legalAidCost)} in movement funds.`);
      }
      const s = spendAction(state);
      if (typeof s === 'string') return fail(state, s);
      let next = spendFunds(s, BALANCE.legalAidCost, 'Legal', 'Senior counsel fees for bail and anticipatory protection');
      next = adjustCrackdown(next, -15);
      next = addJournal(next, 'High Court Relief Secured', 'Senior advocates secured ad-interim protection for detained volunteers.', 'MINOR', 'OPERATIONS');
      return withOutcome(next, `Legal aid filed: legal heat −15 (${inr(BALANCE.legalAidCost)}).`);
    }

    case 'BOOST_CONSTITUENCY': {
      const c = state.constituencies.find(x => x.id === action.constituencyId);
      if (!c) return state;
      if (state.movement.movementFunds < BALANCE.boostCost) {
        return fail(state, `A grassroots blitz needs ${inr(BALANCE.boostCost)}.`);
      }
      const s = spendAction(state);
      if (typeof s === 'string') return fail(state, s);
      const gain = 2 + Math.floor(state.player.organizing / 4);
      let next = spendFunds(s, BALANCE.boostCost, 'Outreach', `Audio van and flyers in ${c.name}`);
      next = {
        ...next,
        constituencies: next.constituencies.map(x =>
          x.id === c.id ? { ...x, cjpSupportScore: clamp(x.cjpSupportScore + gain, 0, 45) } : x,
        ),
      };
      return withOutcome(next, `Blitz in ${c.name}: local support +${gain}.`);
    }

    // ── Crises ──
    case 'TRIGGER_CRISIS':
      return { ...state, activeCrisis: action.crisis };

    case 'RESOLVE_CRISIS': {
      const crisis = state.activeCrisis;
      if (!crisis) return state;
      const opt = crisis.options.find(o => o.id === action.choiceId);
      if (!opt) return state;
      const c = opt.consequences;
      if ((c.fundsChange ?? 0) < 0 && state.movement.movementFunds < -(c.fundsChange ?? 0)) {
        return fail(state, `Can't afford that response (needs ${inr(-(c.fundsChange ?? 0))}).`);
      }

      let next = adjustMovement(state, {
        trust: c.trustChange,
        funds: c.fundsChange,
        volunteers: c.volunteersChange,
      });
      next = adjustCrackdown(next, c.crackdownChange ?? 0);
      if (c.followersChange) {
        next = { ...next, movement: { ...next.movement, followers: Math.max(0, next.movement.followers + c.followersChange) } };
      }
      next = {
        ...next,
        activeCrisis: null,
        player: {
          ...next.player,
          stress: clamp(next.player.stress + (c.stressChange ?? 0), 0, 100),
          energy: clamp(next.player.energy + (c.energyChange ?? 0), 0, 100),
        },
      };
      next = addJournal(next, `Crisis Resolved: ${crisis.title}`, `Directive: "${opt.label}". ${opt.description}`, 'MILESTONE', 'OPERATIONS');

      const dTrust = next.movement.publicTrust - state.movement.publicTrust;
      const dVol = next.movement.volunteerCount - state.movement.volunteerCount;
      const parts = [
        dTrust ? `trust ${signed(dTrust)}` : '',
        c.fundsChange ? `funds ${c.fundsChange > 0 ? '+' : '−'}${inr(Math.abs(c.fundsChange))}` : '',
        dVol ? `volunteers ${signed(dVol)}` : '',
        c.crackdownChange ? `crackdown ${signed(c.crackdownChange)}` : '',
      ].filter(Boolean);
      return withOutcome(next, `${opt.label}: ${parts.join(', ') || 'situation contained'}.`, 'WARNING');
    }

    // ── Mini-games ──
    case 'OPEN_MINI_GAME': {
      if (state.activeMiniGame) return state;
      const today = dateKey(state.currentDate);
      if (state.miniGameLastPlayed?.[action.miniGame] === today) {
        return fail(state, action.miniGame === 'RALLY' ? 'You already held a rally today.' : 'You already did a TV debate today.');
      }
      const s = spendAction(state);
      if (typeof s === 'string') return fail(state, s);
      return {
        ...s,
        activeMiniGame: action.miniGame,
        miniGameLastPlayed: { ...state.miniGameLastPlayed, [action.miniGame]: today },
      };
    }

    case 'CLOSE_MINI_GAME':
      return { ...state, activeMiniGame: null };

    case 'FINISH_MINI_GAME': {
      if (!state.activeMiniGame) return state;
      const kind = state.activeMiniGame;
      const res = miniGameRewards(kind, action.score);
      let next = adjustMovement(state, {
        trust: res.trustDelta,
        funds: res.fundsDelta,
        volunteers: res.volunteersDelta,
      });
      // TV reaches far more people than a rally; both spread online
      const followerGain = Math.max(0, Math.round(res.volunteersDelta * (kind === 'TV_DEBATE' ? 150 : 50)));
      next = { ...next, movement: { ...next.movement, followers: next.movement.followers + followerGain } };
      if (kind === 'RALLY') next = adjustCrackdown(next, 3);
      next = {
        ...next,
        activeMiniGame: null,
        movementXP: (next.movementXP ?? 0) + res.xpDelta,
      };
      next = addJournal(next, kind === 'RALLY' ? 'Ground Rally Report' : 'Prime-Time Debate Report', res.notes, 'MILESTONE', 'OPERATIONS');
      const trustGain = next.movement.publicTrust - state.movement.publicTrust;
      const volunteerGain = next.movement.volunteerCount - state.movement.volunteerCount;
      return withOutcome(
        next,
        `${kind === 'RALLY' ? 'Rally' : 'Debate'} result: trust ${signed(trustGain)}, ${signed(volunteerGain)} volunteers, +${inr(res.fundsDelta)}${kind === 'RALLY' ? ', legal heat +3' : ''}.`,
      );
    }

    // ── Personal ──
    case 'TOGGLE_EMPLOYMENT':
      return { ...state, player: { ...state.player, employmentStatus: action.status } };

    case 'PERSONAL_TO_MOVEMENT_DONATION': {
      if (action.amount <= 0) return state;
      if (state.player.personalSavings < action.amount) return fail(state, 'Not enough personal savings.');
      const next: GameState = {
        ...state,
        player: { ...state.player, personalSavings: state.player.personalSavings - action.amount },
        movement: { ...state.movement, movementFunds: state.movement.movementFunds + action.amount },
        transactions: [
          {
            id: uid(state, 'TXN-FOUNDER'),
            date: { ...state.currentDate },
            account: 'MOVEMENT' as const,
            type: 'INCOME' as const,
            category: 'Personal Founder Contribution',
            amount: action.amount,
            description: 'Personal savings transferred to movement operational fund',
            verified: true,
          },
          ...state.transactions,
        ].slice(0, 100),
      };
      return withOutcome(next, `Transferred ${inr(action.amount)} from savings to the movement.`);
    }

    // ── Staff ──
    case 'HIRE_STAFF': {
      const person = state.people.find(p => p.id === action.personId);
      if (!person || person.isHired) return state;
      if (person.joinDate && dateKey(state.currentDate) < dateKey(person.joinDate)) {
        return fail(state, `${person.name} joins the movement on ${formatDate(person.joinDate)}.`);
      }
      if (person.unlockVolunteers && !person.availableSince) {
        return fail(state, `${person.name} isn't looking to join yet. Grow to ${person.unlockVolunteers.toLocaleString('en-IN')} volunteers.`);
      }
      return withOutcome(
        {
          ...state,
          people: state.people.map(p => (p.id === action.personId ? { ...p, isHired: true, morale: 90, workload: 30, lowMoraleDays: 0 } : p)),
          movement: {
            ...state.movement,
            coreStaffCount: state.movement.coreStaffCount + 1,
            monthlyBurnRate: state.movement.monthlyBurnRate + person.salaryMonthly,
          },
        },
        `${person.name} joined the team${person.salaryMonthly ? ` (+${inr(person.salaryMonthly)}/month burn)` : ''}.`,
      );
    }

    case 'FIRE_STAFF': {
      const person = state.people.find(p => p.id === action.personId);
      if (!person || !person.isHired) return state;
      return withOutcome(
        {
          ...state,
          people: state.people.map(p => (p.id === action.personId ? { ...p, isHired: false, currentAssignment: null } : p)),
          movement: {
            ...state.movement,
            coreStaffCount: Math.max(0, state.movement.coreStaffCount - 1),
            monthlyBurnRate: Math.max(10000, state.movement.monthlyBurnRate - person.salaryMonthly),
          },
        },
        `${person.name} has left the team.`,
        'WARNING',
      );
    }

    case 'ASSIGN_STAFF':
      return {
        ...state,
        people: state.people.map(p => (p.id === action.personId ? { ...p, currentAssignment: action.assignment } : p)),
      };

    case 'PROMOTE_STAFF': {
      const person = state.people.find(p => p.id === action.personId);
      if (!person) return state;
      const blocker = promotionBlocker(person);
      const to = nextRank(person);
      if (blocker || !to) return fail(state, `${person.name}: ${blocker ?? 'cannot be promoted.'}`);
      const salary = person.isVolunteer ? 0 : Math.round((person.salaryMonthly * PROMOTION_PAY_RISE) / 500) * 500;
      const rise = salary - person.salaryMonthly;
      return withOutcome(
        {
          ...state,
          people: state.people.map(p =>
            p.id === person.id
              ? {
                  ...p,
                  rank: to,
                  salaryMonthly: salary,
                  morale: clamp(p.morale + 15, 0, 100),
                  loyalty: clamp(p.loyalty + 10, 0, 100),
                  memories: [...p.memories, `Promoted to ${RANK_LABEL[to]} (${formatDate(state.currentDate)}).`],
                }
              : p,
          ),
          movement: { ...state.movement, monthlyBurnRate: state.movement.monthlyBurnRate + rise },
        },
        `${person.name} is now ${RANK_LABEL[to]}${rise ? ` (+${inr(rise)}/month)` : ''}. Morale +15, loyalty +10.`,
      );
    }

    // ── Ground operation ──
    case 'OPERATION_DECISION': {
      const op = state.operations.find(o => o.id === action.operationId);
      if (!op) return state;
      if (op.status === 'PREPARATION') return fail(state, `${op.title} hasn't started yet (from ${formatDate(op.startDate)}).`);
      if (op.status !== 'ACTIVE') return fail(state, 'This operation has concluded.');

      const cost = action.choice === 'SUPPLIES' ? 15000 : action.choice === 'MEDICAL_AID' ? 10000 : 0;
      if (state.movement.movementFunds < cost) return fail(state, `Needs ${inr(cost)} in movement funds.`);
      const spent = spendAction(state);
      if (typeof spent === 'string') return fail(state, spent);

      const rng = rngFor(state, 7);
      const u = { ...op };
      let trust = 0;
      let crackdown = 0;
      let log = '';
      let msg = '';
      let tone: ActionOutcome['tone'] = 'SUCCESS';

      switch (action.choice) {
        case 'SUPPLIES':
          u.suppliesWaterFood = Math.min(100, u.suppliesWaterFood + 30);
          u.crowdMorale = Math.min(100, u.crowdMorale + 10);
          log = 'Procured emergency cold water tankers and glucose packets.';
          msg = 'Supplies +30, morale +10.';
          break;
        case 'POLICE_TALKS': {
          const ok = rng.next() < 0.45 + state.player.negotiation / 20;
          if (ok) {
            u.policeNegotiationTension = Math.max(10, u.policeNegotiationTension - 25);
            u.policePermissionStatus = 'GRANTED';
            trust = 2;
            crackdown = -5;
            log = 'Delegation submitted a compliant perimeter map. Police tension eased.';
            msg = 'Talks succeeded: police tension −25, legal heat −5.';
          } else {
            u.policeNegotiationTension = Math.min(100, u.policeNegotiationTension + 5);
            log = 'Talks with the station house officer broke down without agreement.';
            msg = 'Talks broke down: police tension +5.';
            tone = 'FAILURE';
          }
          break;
        }
        case 'MEDIA_SPEECH':
          u.mediaCoverageLevel = Math.min(100, u.mediaCoverageLevel + 20);
          trust = Math.round(2 + state.player.communication / 3);
          log = `${state.player.name} addressed national reporters on the movement’s core demands.`;
          msg = `Media coverage +20, trust +${trust}.`;
          break;
        case 'MEDICAL_AID':
          u.medicalReadiness = Math.min(100, u.medicalReadiness + 35);
          u.crowdMorale = Math.min(100, u.crowdMorale + 4);
          log = 'Volunteer doctors set up a heatstroke hydration camp.';
          msg = 'Medical readiness +35.';
          break;
        case 'MARCH_PARLIAMENT': {
          // High risk, high reward: success odds fall as police tension rises
          const ok = rng.next() < 0.85 - u.policeNegotiationTension / 100;
          if (ok) {
            u.mediaCoverageLevel = 100;
            trust = 8;
            crackdown = 5;
            log = 'Delegation delivered the memorandum to the ministry gate under a full media spotlight.';
            msg = 'March succeeded: trust +8, media 100, legal heat +5.';
          } else {
            u.policeNegotiationTension = 90;
            u.policePermissionStatus = 'SECTION_144_WARNING';
            u.crowdMorale = Math.max(10, u.crowdMorale - 15);
            trust = -3;
            crackdown = 15;
            log = 'Barricades rushed at Tolstoy Marg. Police issued a formal dispersal warning.';
            msg = 'March repelled: morale −15, trust −3, legal heat +15.';
            tone = 'FAILURE';
          }
          break;
        }
      }
      u.dailyLog = [...u.dailyLog, `Day ${u.currentDay}: ${log}`];

      let next = spendFunds(spent, cost, 'Logistics', `${action.choice === 'SUPPLIES' ? 'Water and food' : 'Medical'} supplies for ${op.title}`);
      next = adjustMovement(next, { trust });
      next = adjustCrackdown(next, crackdown);
      next = { ...next, operations: next.operations.map(o => (o.id === op.id ? u : o)) };
      return withOutcome(next, msg + (cost ? ` (${inr(cost)})` : ''), tone);
    }

    // ── Investigations ──
    case 'INVESTIGATION_ACTION': {
      const c = state.cases.find(x => x.id === action.caseId);
      if (!c) return state;
      if (c.currentStage === 'FILED_PIL' || c.currentStage === 'EXPOSED') {
        return fail(state, 'This case is already concluded.');
      }
      const cost =
        action.action === 'RTI_FILING' ? 2500 :
        action.action === 'CORROBORATE_EVIDENCE' ? 8000 :
        action.action === 'LEGAL_PETITION_HC' ? 25000 : 0;
      if (action.action === 'LEGAL_PETITION_HC' && c.readinessPercentage < BALANCE.pilMinReadiness) {
        return fail(state, `A PIL needs ${BALANCE.pilMinReadiness}% case readiness (now ${c.readinessPercentage}%).`);
      }
      if (action.action === 'PUBLIC_EXPOSE' && c.readinessPercentage < BALANCE.exposeMinReadiness) {
        return fail(state, `Going public needs ${BALANCE.exposeMinReadiness}% readiness (now ${c.readinessPercentage}%).`);
      }
      if (state.movement.movementFunds < cost) return fail(state, `Needs ${inr(cost)} in movement funds.`);
      const spent = spendAction(state);
      if (typeof spent === 'string') return fail(state, spent);

      const rng = rngFor(state, 11);
      const research = state.player.research;
      const u = { ...c };
      let trust = 0;
      let cred = 0;
      let crackdown = 0;
      let msg = '';
      let tone: ActionOutcome['tone'] = 'SUCCESS';

      if (action.action === 'RTI_FILING') {
        const gain = 10 + Math.floor(research / 2);
        u.readinessPercentage = Math.min(100, u.readinessPercentage + gain);
        if (u.currentStage === 'TIP_OFF') u.currentStage = 'GATHERING_RECORDS';
        trust = 1;
        msg = `RTI replies received: readiness +${gain}%.`;
      } else if (action.action === 'CORROBORATE_EVIDENCE') {
        const idx = u.evidenceItems.findIndex(e => !e.isCorroborated);
        const gain = idx >= 0 ? 20 : 8;
        u.evidenceItems = u.evidenceItems.map((e, i) => (i === idx ? { ...e, isCorroborated: true, reliability: 'CORROBORATED' as const } : e));
        u.readinessPercentage = Math.min(100, u.readinessPercentage + gain);
        if (u.currentStage === 'TIP_OFF' || u.currentStage === 'GATHERING_RECORDS') u.currentStage = 'CORROBORATING';
        cred = 2;
        msg = idx >= 0
          ? `Corroborated "${c.evidenceItems[idx].title}": readiness +${gain}%.`
          : `No uncorroborated leads left; cross-checks add +${gain}%.`;
      } else if (action.action === 'LEGAL_PETITION_HC') {
        const riskMod = c.legalRisk === 'LOW' ? 0.15 : c.legalRisk === 'SEVERE' ? -0.15 : 0;
        const ok = rng.next() < 0.2 + u.readinessPercentage / 200 + riskMod + research / 50;
        if (ok) {
          u.currentStage = 'FILED_PIL';
          u.readinessPercentage = 100;
          u.outcomeNotes = 'Admitted before the High Court Division Bench. Notice issued to respondents.';
          trust = 8;
          cred = 6;
          crackdown = -8;
          msg = 'PIL admitted by the High Court! Trust +8, legal heat −8.';
        } else {
          u.currentStage = 'LEGAL_REVIEW';
          u.readinessPercentage = Math.max(0, u.readinessPercentage - 30);
          u.outcomeNotes = 'Petition dismissed at admission stage for insufficient material.';
          trust = -3;
          msg = 'PIL dismissed at admission: readiness −30%, trust −3.';
          tone = 'FAILURE';
        }
      } else {
        const impact = (c.publicImpactPotential * u.readinessPercentage) / 100;
        const backfire = u.readinessPercentage < 70 && rng.next() < (70 - u.readinessPercentage) / 40;
        crackdown = c.legalRisk === 'SEVERE' ? 15 : c.legalRisk === 'MEDIUM' ? 8 : 3;
        u.currentStage = 'EXPOSED';
        if (backfire) {
          trust = -6;
          cred = -8;
          u.outcomeNotes = 'Dossier released early; gaps were picked apart on prime time and a defamation notice followed.';
          msg = `Exposé backfired: trust −6, credibility −8, legal heat +${crackdown}.`;
          tone = 'FAILURE';
        } else {
          trust = Math.round(impact / 8);
          cred = Math.round(impact / 10);
          u.outcomeNotes = 'Released the full dossier with banking trails at a Constitution Club press briefing.';
          msg = `Exposé landed: trust +${trust}, credibility +${cred}, legal heat +${crackdown}.`;
        }
      }

      let next = spendFunds(spent, cost, 'Investigation', `${action.action.replace(/_/g, ' ').toLowerCase()} — ${c.title}`);
      next = adjustMovement(next, { trust, credibility: cred });
      next = adjustCrackdown(next, crackdown);
      next = { ...next, cases: next.cases.map(x => (x.id === c.id ? u : x)) };
      return withOutcome(next, msg + (cost ? ` (${inr(cost)})` : ''), tone);
    }

    // ── Party & election ──
    case 'FORM_PARTY': {
      if (state.party.isFormed) return state;
      if ((state.story?.act ?? 1) === 1) {
        return fail(state, 'In the record CJP had not registered as a party by 5 October 2026. Registration opens in Act 2.');
      }
      if (state.movement.volunteerCount < BALANCE.partyVolunteersRequired) {
        return fail(state, `ECI registration needs ${BALANCE.partyVolunteersRequired.toLocaleString('en-IN')} volunteers (you have ${state.movement.volunteerCount.toLocaleString('en-IN')}).`);
      }
      if (state.movement.movementFunds < BALANCE.partyRegistrationCost) {
        return fail(state, `Registration, office and legal costs need ${inr(BALANCE.partyRegistrationCost)}.`);
      }
      let next = spendFunds(state, BALANCE.partyRegistrationCost, 'Party Registration', 'ECI application, party office and legal compliance');
      next = {
        ...next,
        party: {
          ...next.party,
          isFormed: true,
          partyName: action.partyName,
          abbreviation: action.abbreviation,
          symbol: action.symbol,
          registrationStatus: 'ECI_RECOGNIZED',
        },
        movement: { ...next.movement, hasFormedParty: true },
      };
      next = addJournal(
        next,
        `Party Registered: ${action.partyName} (${action.abbreviation})`,
        `The Election Commission of India has formally recognized ${action.partyName} with the symbol "${action.symbol}". We enter electoral democracy not for power, but to deliver the accountability that street protests alone cannot enforce.`,
        'HISTORIC_TURNING_POINT',
        'PARTY_ECI',
      );
      return withOutcome(next, `${action.partyName} is registered with the ECI.`);
    }

    case 'NOMINATE_CANDIDATE': {
      if (!state.party.isFormed) return fail(state, 'Register the party before nominating candidates.');
      if (state.electionLiveState.isCountingUnderway) return fail(state, 'Nominations are closed while votes are counted.');
      const c = state.constituencies.find(x => x.id === action.constituencyId);
      if (!c) return fail(state, `No constituency #${action.constituencyId}.`);
      if (c.cjpCandidate) return fail(state, `${c.name} already has a candidate (${c.cjpCandidate.name}).`);
      const funding = Math.max(0, Math.round(action.funding));
      const deposit = c.category === 'GEN' ? BALANCE.securityDepositGeneral : BALANCE.securityDepositReserved;
      const total = funding + deposit;
      if (state.movement.movementFunds < total) {
        return fail(state, `Needs ${inr(total)} (${inr(deposit)} deposit + ${inr(funding)} campaign).`);
      }
      let next = spendFunds(state, total, 'Election', `Nomination in ${c.name}: deposit + campaign fund`);
      next = {
        ...next,
        constituencies: next.constituencies.map(x =>
          x.id === c.id
            ? {
                ...x,
                cjpCandidate: {
                  name: action.candidateName,
                  isCoreMember: true,
                  localReputation: 50 + Math.round(state.movement.mediaCredibility / 4),
                  campaignFundingAllocated: funding,
                },
              }
            : x,
        ),
        party: { ...next.party, candidateCount: next.party.candidateCount + 1 },
      };
      return withOutcome(next, `${action.candidateName} nominated in ${c.name} (${inr(total)}).`);
    }

    case 'TRIGGER_ELECTION': {
      const live = state.electionLiveState;
      if (!state.party.isFormed) return fail(state, 'Register the party first.');
      if (state.party.candidateCount < 1) return fail(state, 'Nominate at least one candidate first.');
      if (live.isCountingUnderway) return state;
      let base = state;
      if (live.isCountingFinished) {
        const due = nextElectionDate(state);
        if (due && dateKey(state.currentDate) < dateKey(due)) {
          return fail(state, `The next general election can be called from ${formatDate(due)}.`);
        }
        // A new cycle: clear old results and the old mandate; candidates stand again
        base = {
          ...state,
          constituencies: state.constituencies.map(c => ({ ...c, electionResult: undefined })),
          party: { ...state.party, isRulingCoalition: false, isOppositionLead: false, actualSeatsWon: 0 },
        };
      }
      const next = runElection(base);
      return {
        ...next,
        activeScreen: 'ELECTION_NIGHT',
        electionLiveState: {
          ...live,
          isCountingUnderway: true,
          isCountingFinished: false,
          countedSeatsCount: 0,
          rulingSeats: 0,
          oppositionSeats: 0,
          cjpSeats: 0,
          otherSeats: 0,
          leadingParty: 'TALLYING...',
          coalitionFormed: false,
        },
      };
    }

    case 'STEP_ELECTION_COUNT': {
      const live = state.electionLiveState;
      if (!live.isCountingUnderway || live.isCountingFinished) return state;
      const counted = Math.min(543, live.countedSeatsCount + 35);
      const t = tallyCounted(state, counted);
      const finished = counted >= 543;
      const leaders: [string, number][] = [['NDA', t.ruling], ['INDIA', t.opp], [state.party.abbreviation, t.cjp], ['OTHERS', t.others]];
      leaders.sort((a, b) => b[1] - a[1]);

      let next: GameState = {
        ...state,
        electionLiveState: {
          ...live,
          countedSeatsCount: counted,
          rulingSeats: t.ruling,
          oppositionSeats: t.opp,
          cjpSeats: t.cjp,
          otherSeats: t.others,
          leadingParty: leaders[0][0],
          isCountingUnderway: !finished,
          isCountingFinished: finished,
        },
        party: {
          ...state.party,
          actualSeatsWon: t.cjp,
          ...(finished ? { lastElectionDate: { ...state.currentDate }, electionsHeld: (state.party.electionsHeld ?? 0) + 1 } : {}),
        },
      };
      if (finished) {
        // Seats change hands and baselines move towards the result; the new mandate resets the mood
        next = { ...next, constituencies: settleSeats(next.constituencies), nationalMood: initialMood() };
        next = addJournal(
          next,
          `Verdict ${state.currentDate.year}: ${state.party.abbreviation} wins ${t.cjp} seat${t.cjp === 1 ? '' : 's'}`,
          `Final tally — NDA ${t.ruling}, INDIA ${t.opp}, ${state.party.abbreviation} ${t.cjp}, others ${t.others}. ${t.cjp >= BALANCE.majority ? 'An outright majority.' : t.cjp > 0 ? 'We have a voice in the Lok Sabha.' : 'Not a single seat. The movement must rebuild.'}`,
          'HISTORIC_TURNING_POINT',
          'ELECTION_NIGHT',
        );
        next = withOutcome(next, `Counting complete: ${state.party.abbreviation} won ${t.cjp} seats.`, t.cjp > 0 ? 'SUCCESS' : 'FAILURE');
      }
      return next;
    }

    case 'FORM_COALITION': {
      const live = state.electionLiveState;
      if (!live.isCountingFinished || live.coalitionFormed) return state;
      const cjp = live.cjpSeats;
      const abbr = state.party.abbreviation;
      let isRuling = false;
      let trust = 0;
      let summary: string;

      if (cjp >= BALANCE.majority) {
        isRuling = true;
        summary = `${abbr} won an outright majority of ${cjp} seats and formed the government on its own.`;
      } else if (action.partner === 'THIRD_FRONT' || cjp === 0) {
        trust = cjp > 0 ? 4 : 0;
        summary = cjp > 0
          ? `${abbr} declined ministries and will lead an independent watchdog bloc of ${cjp} MPs.`
          : `${abbr} has no MPs and will continue as a street movement.`;
      } else {
        const partnerSeats = action.partner === 'RULING' ? live.rulingSeats : live.oppositionSeats;
        if (partnerSeats + cjp < BALANCE.majority) {
          return fail(state, `${action.partner === 'RULING' ? 'NDA' : 'INDIA'} + ${abbr} = ${partnerSeats + cjp} seats, short of ${BALANCE.majority}.`);
        }
        isRuling = true;
        // Joining the establishment you protested against costs credibility
        trust = action.partner === 'RULING' ? -12 : -3;
        summary = `${abbr} joined the ${action.partner === 'RULING' ? 'NDA' : 'INDIA'} government (${partnerSeats + cjp} seats) on a Common Minimum Programme.`;
      }

      let next = adjustMovement(state, { trust });
      next = {
        ...next,
        party: { ...next.party, isRulingCoalition: isRuling, isOppositionLead: !isRuling && cjp > 0 },
        electionLiveState: { ...live, coalitionFormed: true, coalitionSummary: summary },
        cabinet: next.cabinet.map(m => (isRuling ? m : { ...m, isPlayerParty: false })),
      };
      next = addJournal(next, 'Parliamentary Mandate Decided', summary, 'HISTORIC_TURNING_POINT', 'GOVERNMENT');
      return withOutcome(next, summary + (trust ? ` Trust ${signed(trust)}.` : ''));
    }

    // ── Governance ──
    case 'TABLE_REFORM': {
      const r = state.reforms.find(x => x.id === action.reformId);
      if (!r || r.status !== 'DRAFT') return state;
      if (!state.electionLiveState.coalitionFormed || state.party.actualSeatsWon < 1) {
        return fail(state, 'You need MPs in the Lok Sabha to table a bill.');
      }
      const s = spendAction(state);
      if (typeof s === 'string') return fail(state, s);
      return withOutcome(
        { ...s, reforms: s.reforms.map(x => (x.id === r.id ? { ...x, status: 'TABLED_PARLIAMENT' as const } : x)) },
        `${r.name} tabled in Parliament.`,
      );
    }

    case 'LOBBY_REFORM': {
      const r = state.reforms.find(x => x.id === action.reformId);
      if (!r || r.status !== 'TABLED_PARLIAMENT') return fail(state, 'Table the bill before lobbying for it.');
      if (state.movement.movementFunds < BALANCE.lobbyCost) return fail(state, `Lobbying needs ${inr(BALANCE.lobbyCost)}.`);
      const s = spendAction(state);
      if (typeof s === 'string') return fail(state, s);
      const seats = state.party.actualSeatsWon;
      // Holding the relevant ministry in government makes a bill much easier to move
      const ministry = state.cabinet.find(c => c.id === SECTOR_MINISTRY[r.sector]);
      const ministryBonus = state.party.isRulingCoalition && ministry?.isPlayerParty ? 5 + Math.round(ministry.performanceScore / 20) : 0;
      const gain = clamp(
        Math.round(8 + seats / 8 + (state.party.isRulingCoalition ? 12 : 0) + ministryBonus + state.player.negotiation - r.bureaucraticResistance / 10),
        3,
        45,
      );
      const progress = Math.min(100, r.implementationProgress + gain);
      const passed = progress >= 100;
      let next = spendFunds(s, BALANCE.lobbyCost, 'Legislative', `Committee briefings for ${r.name}`);
      next = {
        ...next,
        reforms: next.reforms.map(x =>
          x.id === r.id ? { ...x, implementationProgress: progress, status: passed ? ('PASSED_ACT' as const) : x.status } : x,
        ),
      };
      if (passed) {
        next = adjustMovement(next, { trust: 6 });
        next = addJournal(next, `Act Passed: ${r.name}`, r.description, 'HISTORIC_TURNING_POINT', 'GOVERNMENT');
        const pledge = next.party.manifestoPledges.find(pl => pl.reformId === r.id && !pl.fulfilled);
        if (pledge) {
          next = {
            ...adjustMovement(next, { trust: 4, credibility: 4 }),
            party: { ...next.party, manifestoPledges: next.party.manifestoPledges.map(pl => (pl.id === pledge.id ? { ...pl, fulfilled: true } : pl)) },
          };
          next = addJournal(next, `Promise Kept: ${pledge.title}`, 'A manifesto pledge is now law.', 'MILESTONE', 'PARTY_ECI');
          return withOutcome(next, `${r.name} passed into law, and a manifesto promise is kept! Trust +10.`);
        }
        return withOutcome(next, `${r.name} passed into law! Trust +6.`);
      }
      return withOutcome(next, `${r.name}: support +${gain}% (now ${progress}%).`);
    }

    default:
      return state;
  }
}

// ─── Daily simulation ───────────────────────────────────────────────────────

/**
 * Advance the world by one day. Pure: randomness comes from the seeded RNG.
 */
export function advanceSimulationDay(state: GameState, opts: { routine?: boolean } = {}): GameState {
  const nextDate = { ...state.currentDate };
  const isNewMonth = nextDate.day >= getDaysInMonth(nextDate.year, nextDate.month);
  if (isNewMonth) {
    nextDate.day = 1;
    if (nextDate.month >= 12) {
      nextDate.month = 1;
      nextDate.year += 1;
    } else {
      nextDate.month += 1;
    }
  } else {
    nextDate.day += 1;
  }

  const rng = new SeededRNG(mix(state.seed, dateKey(nextDate)));
  for (let i = 0; i < 4; i++) rng.next();
  const p = state.player;
  const m = state.movement;
  const crackdown = state.crackdownLevel ?? 15;
  let warning: string | null = null;

  // 1. Personal vitals: overnight recovery, job fatigue, and health consequences
  const energy = clamp(
    p.energy + BALANCE.overnightEnergyRecovery - (p.employmentStatus === 'FULL_TIME_JOB' ? 6 : 2) - ageEnergyPenalty(ageOn(p.birthDate, nextDate)),
    0,
    100,
  );
  let stress = clamp(p.stress - 3 + (energy < 20 ? 5 : 0) + (crackdown > 60 ? 2 : 0), 0, 100);
  let health = p.health;
  if (p.stress > 80) health -= 3;
  if (p.energy === 0) health -= 2;
  if (p.stress < 50 && p.energy > 40) health += 1;
  health = clamp(health, 0, 100);

  // 2. Money
  let personalSavings = p.personalSavings;
  let personalDebt = p.personalDebt;
  let familySupport = p.familySupport;
  let movementFunds = m.movementFunds;
  let insolventMonths = state.insolventMonths ?? 0;
  let trustDelta = 0;
  const transactions = [...state.transactions];
  const txn = (id: string, account: 'PERSONAL' | 'MOVEMENT', type: 'INCOME' | 'EXPENSE', category: string, amount: number, description: string) =>
    transactions.unshift({ id: `${id}-${dateKey(nextDate)}`, date: { ...nextDate }, account, type, category, amount, description, verified: true });

  if (isNewMonth) {
    if (p.employmentStatus === 'FULL_TIME_JOB') {
      personalSavings += p.salaryMonthly;
      txn('TXN-SALARY', 'PERSONAL', 'INCOME', 'Job Salary', p.salaryMonthly, 'Monthly salary credited');
    } else if (p.employmentStatus === 'LEAVE_OF_ABSENCE') {
      const half = Math.round(p.salaryMonthly / 2);
      personalSavings += half;
      txn('TXN-SALARY', 'PERSONAL', 'INCOME', 'Leave Allowance', half, 'Half-pay during leave of absence');
    }
    if (personalSavings >= p.monthlyLivingCost) {
      personalSavings -= p.monthlyLivingCost;
    } else {
      personalDebt += p.monthlyLivingCost - personalSavings;
      personalSavings = 0;
      familySupport = clamp(familySupport - 5, 0, 100);
      stress = clamp(stress + 8, 0, 100);
    }
    txn('TXN-RENT', 'PERSONAL', 'EXPENSE', 'Living Expenses', p.monthlyLivingCost, 'Monthly rent, groceries, electricity, and mobile bills');

    txn('TXN-BURN', 'MOVEMENT', 'EXPENSE', 'Operational Overhead', m.monthlyBurnRate, 'Office rent, staff salaries, server costs, and legal retainers');
    if (movementFunds >= m.monthlyBurnRate) {
      movementFunds -= m.monthlyBurnRate;
      insolventMonths = 0;
    } else {
      movementFunds = 0;
      insolventMonths += 1;
      trustDelta -= 3;
      warning = insolventMonths >= 2
        ? 'The movement missed payroll again.'
        : 'The movement could not cover this month’s salaries and rent. Raise funds or cut staff — one more missed month ends the campaign.';
    }
  }

  // Daily micro-crowdfunding scales with trust (and the follower base) and shrinks under crackdown
  if (rng.next() < 0.7) {
    const donation = Math.floor((m.publicTrust * 60 + m.followers * 0.0004) * (0.8 + rng.next() * 0.4) * (1 - crackdown / 200));
    movementFunds += donation;
    if (donation > 3000 && rng.next() > 0.7) {
      txn('TXN-DONATION', 'MOVEMENT', 'INCOME', 'Crowdfunding', donation, `Citizen UPI micro-donations, ${formatDate(nextDate)}`);
    }
  }

  // 3. Ground operations
  let opVolunteers = 0;
  let newCrackdown = crackdown;
  const operations = state.operations.map(op => {
    // Planned operations begin on their start date
    if (op.status === 'PREPARATION') {
      return dateKey(nextDate) >= dateKey(op.startDate) ? { ...op, status: 'ACTIVE' as const, currentDay: 1 } : op;
    }
    if (op.status !== 'ACTIVE') return op;
    const currentDay = op.currentDay + 1;
    const suppliesWaterFood = Math.max(0, op.suppliesWaterFood - 6);
    const heat = op.weatherCondition === 'HEATWAVE';
    const medicalReadiness = Math.max(0, op.medicalReadiness - (heat ? 4 : 2));
    const policeNegotiationTension = clamp(op.policeNegotiationTension + (suppliesWaterFood < 30 ? 4 : -1), 10, 100);
    const crowdMorale = clamp(
      op.crowdMorale + (suppliesWaterFood > 50 ? 1 : -4) + (heat && medicalReadiness < 30 ? -3 : 0),
      10,
      100,
    );
    const crowdSize = Math.max(500, op.crowdSize + (suppliesWaterFood > 60 ? 80 : -50));
    if (crowdMorale > 60) opVolunteers += Math.floor(crowdSize * 0.02);
    if (policeNegotiationTension > 70) newCrackdown += 2;

    const concluded = currentDay > op.durationDays;
    let outcomeSummary = op.outcomeSummary;
    if (concluded) {
      const score = crowdMorale * 0.5 + suppliesWaterFood * 0.2 + op.mediaCoverageLevel * 0.3;
      if (score >= 60) {
        trustDelta += 6;
        opVolunteers += Math.floor(crowdSize * 0.3);
        outcomeSummary = `The ${op.durationDays}-day vigil ended in strength: a disciplined crowd of ${crowdSize.toLocaleString('en-IN')} and national coverage.`;
      } else {
        trustDelta -= 4;
        outcomeSummary = 'The vigil petered out — thinning crowds and weak coverage let the government wait it out.';
      }
    }
    return {
      ...op,
      currentDay: Math.min(currentDay, op.durationDays),
      suppliesWaterFood,
      medicalReadiness,
      policeNegotiationTension,
      crowdSize,
      crowdMorale,
      status: (concluded ? 'CONCLUDED' : op.status) as OperationState['status'],
      outcomeSummary,
    };
  });

  // Crackdown eases slowly when nothing provokes it
  if (newCrackdown === crackdown && crackdown > 10 && rng.next() < 0.5) newCrackdown -= 1;

  // 4. Movement momentum. Attention fades faster the higher trust is, so it must be actively
  // maintained; volunteers grow with trust but a share drifts away every day.
  // A day with no actions at all: the movement looks asleep
  // (Days skipped with End week are routine work, not idleness)
  if (state.hasBegun && !opts.routine && state.actionPoints >= state.maxActionPoints) trustDelta -= 1;
  if (m.publicTrust > 45) {
    const decay = (m.publicTrust - 45) / 20;
    trustDelta -= Math.floor(decay) + (rng.next() < decay % 1 ? 1 : 0);
  }
  // Government response: pressure builds with reach, trust and street protests, eases when quiet
  const pressure = state.govResponse?.pressure ?? 0;
  const stage = govStage(pressure);
  const activeOps = operations.filter(o => o.status === 'ACTIVE').length;
  const reach = m.followers > 0 ? Math.max(0, Math.log10(m.followers) - 5) * 0.4 : 0;
  const newPressure = clamp(pressure + reach + activeOps * 1.2 + (m.publicTrust > 60 ? 0.4 : 0) - 1.1, 0, 100);
  if (stage === 'POLICE_ACTION') newCrackdown += 1;
  if (stage === 'NEGOTIATE' && newCrackdown > 0) newCrackdown -= 1;

  // Narrative: a winning narrative boosts follower growth; computed from yesterday's split
  const nar = state.media?.narrative ?? { movement: 0, government: 50 };
  const narrativeBoost = (nar.movement - nar.government) / 4000;

  // Followers grow with trust (shrink when it's low) and level off near the cap; account blocks slow growth
  const saturation = Math.max(0, 1 - m.followers / BALANCE.followerCap);
  const rawRate = clamp((m.publicTrust - 40) / 1500, -0.02, 0.03);
  // Attention decays every day: the feed moves on unless you keep giving it reasons to follow
  const growthRate = (rawRate > 0 ? rawRate * saturation : rawRate) * (stage === 'BLOCK_ACCOUNTS' ? 0.6 : 1) - BALANCE.followerDecay + narrativeBoost;
  const followers = Math.max(0, Math.round(m.followers * (1 + growthRate)));

  const attrition = m.volunteerCount > 2000 ? Math.floor(m.volunteerCount * BALANCE.dailyVolunteerAttrition) : 0;
  const volunteerCount = clamp(
    m.volunteerCount + Math.floor((m.publicTrust - 40) * 1.2) + Math.floor(m.followers * BALANCE.followerToVolunteer) + opVolunteers - attrition,
    100,
    500000,
  );

  // 5. Historical archive unlocks
  const dateStr = `${nextDate.year}-${String(nextDate.month).padStart(2, '0')}-${String(nextDate.day).padStart(2, '0')}`;
  const historicalArchive = state.historicalArchive.map(d =>
    !d.isUnlocked && d.historicalDate <= dateStr ? { ...d, isUnlocked: true } : d,
  );

  // 6. The team: workload, morale, learning, loyalty, quitting, and new people wanting to join (L2)
  const concludedOps = operations.filter(op => op.status === 'CONCLUDED' && state.operations.find(o => o.id === op.id)?.status === 'ACTIVE');
  const team = stepTeam(state, {
    date: nextDate,
    dateLabel: formatDate(nextDate),
    isNewMonth,
    missedPayroll: isNewMonth && insolventMonths > 0,
    concludedOps,
    rng,
  });
  const people = team.people;
  // What the team produced today, from yesterday's assignments
  const output = teamOutput(state);

  // 7. Crisis roll — more likely under heavy crackdown
  let activeCrisis = state.activeCrisis;
  const crisisChance = (0.15 + newCrackdown / 400) * ((state.story?.act ?? 1) === 1 ? 0.5 : 1);
  if (!activeCrisis && state.hasBegun && CRISIS_EVENT_DECK.length > 0 && rng.next() < crisisChance) {
    activeCrisis = CRISIS_EVENT_DECK[Math.floor(rng.next() * CRISIS_EVENT_DECK.length)];
  }

  // Concluded-operation journal entries
  let next: GameState = {
    ...state,
    currentDate: nextDate,
    actionPoints: state.maxActionPoints ?? 3,
    crackdownLevel: clamp(newCrackdown, 0, 100),
    insolventMonths,
    activeCrisis,
    player: {
      ...p,
      energy,
      stress,
      health,
      personalSavings,
      personalDebt,
      familySupport,
      burnoutRisk: stress > 85,
    },
    movement: {
      ...m,
      followers,
      movementFunds,
      volunteerCount,
      publicTrust: clamp(m.publicTrust + trustDelta, 0, 100),
    },
    govResponse: { pressure: Math.round(newPressure * 10) / 10 },
    operations,
    historicalArchive,
    people,
    transactions: transactions.slice(0, 100),
  };
  if (isNewMonth) next = { ...next, player: fadeSkills(next.player, nextDate) };

  // Team output (L2)
  next = {
    ...adjustMovement(next, { volunteers: output.total.volunteers, funds: output.total.funds }),
  };
  next = { ...next, movement: { ...next.movement, followers: next.movement.followers + output.total.followers } };
  if (output.total.legalChance > 0 && rng.next() < output.total.legalChance) next = adjustCrackdown(next, -1);
  if (output.total.research > 0) {
    const open = next.cases.find(c => c.currentStage !== 'FILED_PIL' && c.currentStage !== 'EXPOSED' && c.readinessPercentage < 100);
    const gain = Math.floor(output.total.research) + (rng.next() < output.total.research % 1 ? 1 : 0);
    if (open && gain > 0) {
      next = { ...next, cases: next.cases.map(c => (c.id === open.id ? { ...c, readinessPercentage: Math.min(100, c.readinessPercentage + gain) } : c)) };
    }
  }
  for (const person of state.people) {
    const o = output.byPerson[person.id];
    if (!o?.campaignMorale) continue;
    const boost = Math.round(o.campaignMorale);
    next = {
      ...next,
      operations: next.operations.map(op =>
        op.status === 'ACTIVE' && op.title === person.currentAssignment ? { ...op, crowdMorale: clamp(op.crowdMorale + boost, 10, 100) } : op,
      ),
    };
  }
  // Team news: people who walked out, people who want to join
  for (const name of team.quits) {
    const quitter = state.people.find(p => p.name === name);
    next = {
      ...next,
      movement: {
        ...next.movement,
        coreStaffCount: Math.max(0, next.movement.coreStaffCount - 1),
        monthlyBurnRate: Math.max(10000, next.movement.monthlyBurnRate - (quitter?.salaryMonthly ?? 0)),
      },
    };
    next = addJournal(next, `${name} Left the Team`, `${name} walked away, worn out after too long under too much pressure.`, 'MILESTONE', 'PEOPLE');
  }
  for (const name of team.joined) {
    next = addJournal(next, `${name} Wants to Join`, `The movement has grown big enough to draw new people. ${name} has asked to join the team.`, 'MINOR', 'PEOPLE');
  }
  // Birthdays (L3)
  if (isBirthday(next.player.birthDate, nextDate)) {
    const age = ageOn(next.player.birthDate, nextDate)!;
    next = {
      ...next,
      player: { ...next.player, stress: clamp(next.player.stress - 5, 0, 100), familySupport: clamp(next.player.familySupport + 3, 0, 100) },
    };
    next = addJournal(next, `${next.player.name} Turns ${age}`, `A ${ordinal(age)} birthday, with family on the phone and volunteers bringing sweets.`, 'MINOR', 'PERSONAL');
  }
  const birthdays = next.people.filter(x => x.isHired && isBirthday(x.birthDate, nextDate));
  for (const b of birthdays) {
    next = { ...next, people: next.people.map(x => (x.id === b.id ? { ...x, morale: clamp(x.morale + 5, 0, 100) } : x)) };
  }
  // The map (L4): volunteers settle into states, chapters grow or fade, seat support follows presence
  const geo = stepGeography(next, { rng });
  next = {
    ...next,
    states: geo.states,
    constituencies: geo.constituencies,
    movement: { ...next.movement, stateChaptersCount: geo.states.filter(st => st.cjpChapterLevel > 0).length },
  };
  for (const o of geo.opened) {
    next = addJournal(
      next,
      o.level === 1 ? `Chapter Opens in ${o.name}` : `${o.name}: ${CHAPTER_NAME[o.level]}`,
      o.level === 1
        ? `Enough volunteers in ${o.name} now meet every week to call themselves a chapter.`
        : `The ${o.name} chapter has grown into ${CHAPTER_NAME[o.level].toLowerCase()}.`,
      o.level === 3 ? 'MILESTONE' : 'MINOR',
      'MAP_543',
    );
  }
  for (const o of geo.shrank) {
    next = addJournal(next, `${o.name} Chapter Shrinks`, `Too few volunteers kept showing up in ${o.name}. The chapter is now: ${CHAPTER_NAME[o.level].toLowerCase()}.`, 'MINOR', 'MAP_543');
  }

  // The country (L5): national mood monthly, state moods quarterly, new grievances every two months
  if (isNewMonth) {
    next = { ...next, nationalMood: stepMood(next.nationalMood ?? initialMood(), rng) };
    if (nextDate.month % 3 === 0) {
      const shifted = shiftStateMoods(next, next.nationalMood!, rng);
      next = { ...next, states: shifted.states };
      if (shifted.changed.length) {
        const label = { RULING_LEAN: 'leans to the ruling alliance', ANTI_INCUMBENCY: 'turned anti-incumbent', VOLATILE: 'is volatile', REFORM_RECEPTIVE: 'is open to reform' } as const;
        next = addJournal(
          next,
          'The Mood Shifts in the States',
          shifted.changed.map(c => `${c.name} ${label[c.mood]}`).join('; ') + '.',
          'MINOR',
          'MAP_543',
        );
      }
    }
    if (nextDate.month % 2 === 0) {
      const raised = surfaceIssue(next.states, rng);
      next = { ...next, states: raised.states };
      if (raised.surfaced) {
        next = addJournal(next, `New Grievance in ${raised.surfaced.name}`, `${raised.surfaced.issue} is now what people in ${raised.surfaced.name} talk about.`, 'MINOR', 'MAP_543');
      }
    }
  }

  // Bad news is a warning (and stops End week); good news is shown only on a quiet day
  const teamWarnings = [
    ...team.quits.map(n => `${n} has quit the team.`),
    ...team.warnings,
    ...geo.shrank.map(o => `The ${o.name} chapter is shrinking for lack of volunteers.`),
  ];
  if (teamWarnings.length) warning = [warning, ...teamWarnings].filter(Boolean).join(' ');
  const goodNews = [
    ...(isBirthday(next.player.birthDate, nextDate) ? [`Happy ${ordinal(ageOn(next.player.birthDate, nextDate)!)} birthday!`] : []),
    ...birthdays.map(b => `It's ${b.name}'s ${ordinal(ageOn(b.birthDate, nextDate)!)} birthday. Morale +5.`),
    ...(team.joined.length ? [`${team.joined.join(' and ')} want${team.joined.length === 1 ? 's' : ''} to join the team.`] : []),
    ...geo.opened.map(o => (o.level === 1 ? `A chapter opened in ${o.name}.` : `${o.name} grew to ${CHAPTER_NAME[o.level].toLowerCase()}.`)),
  ].join(' ');

  next = growChapters(
    next,
    operations.filter(op => op.status === 'CONCLUDED' && state.operations.find(o => o.id === op.id)?.status === 'ACTIVE').map(op => op.stateName),
  );
  for (const op of operations) {
    const before = state.operations.find(o => o.id === op.id);
    if (before?.status === 'PREPARATION' && op.status === 'ACTIVE') {
      next = addJournal(next, `${op.title} Begins`, op.dailyLog[0] ?? op.title, 'MILESTONE', 'OPERATIONS');
      next = { ...next, activeOperationId: op.id };
    }
    if (before?.status === 'ACTIVE' && op.status === 'CONCLUDED') {
      next = addJournal(next, `${op.title} Concluded`, op.outcomeSummary ?? '', 'HISTORIC_TURNING_POINT', 'OPERATIONS');
    }
  }
  if (warning) next = withOutcome(next, warning, 'WARNING');
  else if (goodNews) next = withOutcome(next, goodNews);

  // Media: the narrative drifts toward what trust and government pressure support; trends cool off
  {
    const media = next.media ?? initialMediaState();
    const mTarget = next.movement.publicTrust * 0.6;
    const gTarget = 30 + (next.govResponse?.pressure ?? 0) * 0.3;
    const movementShare = clamp(media.narrative.movement + (mTarget - media.narrative.movement) * 0.08, 0, 90);
    const governmentShare = clamp(media.narrative.government + (gTarget - media.narrative.government) * 0.08, 0, 100 - movementShare);
    const trending = media.trending.map(t => ({ ...t, posts: Math.round(t.posts * 0.82) })).filter(t => t.posts > 2000);
    next = { ...next, media: { ...media, narrative: { movement: Math.round(movementShare * 10) / 10, government: Math.round(governmentShare * 10) / 10 }, trending } };
    // Hostile trends appear when the government is pushing back
    if (stage !== 'IGNORE' && rng.next() < 0.12) {
      const hostile = HASHTAGS.filter(h => h.theme === 'HOSTILE');
      next = trendTag(next, hostile[Math.floor(rng.next() * hostile.length)].tag, Math.max(10000, next.movement.followers * 0.02));
      next = addPost(next, 'HOSTILE', rng);
    } else if (next.movement.followers > 0 && rng.next() < 0.6) {
      next = addPost(next, ['EDUCATION', 'JOBS', 'DEMOCRACY', 'any'][Math.floor(rng.next() * 4)], rng);
    }
  }

  // The record ends on 5 Oct: Act 2 (sandbox) begins
  if (next.story.act === 1 && isoDate(nextDate) >= ACT2_START) {
    next = { ...next, story: { ...next.story, act: 2 } };
    next = addJournal(
      next,
      'Act 2: History Is Yours',
      `The record ends on 5 October 2026. You followed history in ${Object.keys(next.story.choices).length - next.story.divergence} of ${Object.keys(next.story.choices).length} big decisions. From here the story is yours: party registration is now open.`,
      'HISTORIC_TURNING_POINT',
      'JOURNAL',
    );
  }

  // In government with collapsing trust: partners walk out at the start of a month
  if (isNewMonth && next.party.isRulingCoalition && next.movement.publicTrust < 25) {
    next = {
      ...next,
      party: { ...next.party, isRulingCoalition: false, isOppositionLead: next.party.actualSeatsWon > 0 },
    };
    next = addJournal(next, 'The Coalition Collapses', 'With public trust below 25%, coalition partners withdrew support. You are back in opposition.', 'HISTORIC_TURNING_POINT', 'GOVERNMENT');
    next = withOutcome(next, 'Coalition partners walked out: you are back in opposition.', 'WARNING');
  }

  // Running campaigns pay out their template effects, scaled by crowd morale
  for (const op of next.operations) {
    if (op.status !== 'ACTIVE' || !op.templateId) continue;
    const t = getOperationTemplate(op.templateId);
    if (!t || (op.currentDay - 1) % (t.every ?? 1) !== 0) continue;
    const scale = clamp(op.crowdMorale / 80, 0.3, 1.25);
    const scaled = Object.fromEntries(
      Object.entries(t.dailyEffects).map(([k, v]) => [k, typeof v === 'number' ? Math.round(v * (k === 'legalHeat' ? 1 : scale)) : v]),
    ) as StoryEffects;
    next = applyStoryEffects(next, scaled);
  }

  // Dated story events fire on their day and take priority over a freshly rolled random crisis
  next = pumpStory(next);
  if (next.story.activeEventId && !state.activeCrisis) next = { ...next, activeCrisis: null };
  return next;
}

// ─── Story events ───────────────────────────────────────────────────────────

/**
 * Activate the next due story event if none is open: queued follow-ups and dated events
 * (on or after the campaign start) whose date has arrived, earliest first.
 */
export function pumpStory(state: GameState, registry: StoryEvent[] = STORY_EVENTS): GameState {
  const st = state.story;
  if (!st || st.activeEventId || !state.hasBegun || state.gameOver) return state;
  const today = isoDate(state.currentDate);

  const candidates: { id: string; due: string; queued: boolean }[] = [
    ...st.queue.filter(q => q.due <= today).map(q => ({ id: q.eventId, due: q.due, queued: true })),
    ...registry
      .filter(e => e.date && e.date >= st.startedOn && e.date <= today && !st.firedIds.includes(e.id))
      .filter(e => !e.skipIfChosen?.some(k => st.choices[k.event] === k.choice))
      .filter(e => requirementsMet(state, e))
      .map(e => ({ id: e.id, due: e.date!, queued: false })),
  ].sort((a, b) => a.due.localeCompare(b.due) || Number(b.queued) - Number(a.queued));

  const pick = candidates[0];
  if (!pick) return state;
  const queue = pick.queued ? st.queue.filter(q => !(q.eventId === pick.id && q.due === pick.due)) : st.queue;
  return { ...state, story: { ...st, queue, activeEventId: pick.id, firedIds: [...st.firedIds, pick.id] } };
}

/** Whether an event's `requires` conditions hold right now */
export function requirementsMet(state: GameState, e: StoryEvent): boolean {
  const r = e.requires;
  if (!r) return true;
  if (r.party && !state.party.isFormed) return false;
  if (r.noParty && state.party.isFormed) return false;
  if (r.inGovernment && !state.party.isRulingCoalition) return false;
  if (r.minSeats !== undefined && state.party.actualSeatsWon < r.minSeats) return false;
  return true;
}

/** Human-readable effect list, e.g. "+300K followers, legal heat +6" */
export function describeEffects(e: StoryEffects): string {
  const short = (n: number) => (Math.abs(n) >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : Math.abs(n) >= 1e3 ? `${Math.round(n / 1e3)}K` : `${n}`);
  const parts: string[] = [];
  if (e.followers) parts.push(`${e.followers > 0 ? '+' : ''}${short(e.followers)} followers`);
  if (e.volunteers) parts.push(`${signed(e.volunteers)} volunteers`);
  if (e.funds) parts.push(`funds ${e.funds > 0 ? '+' : '−'}${inr(Math.abs(e.funds))}`);
  if (e.trust) parts.push(`trust ${signed(e.trust)}`);
  if (e.credibility) parts.push(`credibility ${signed(e.credibility)}`);
  if (e.legalHeat) parts.push(`legal heat ${signed(e.legalHeat)}`);
  if (e.energy) parts.push(`energy ${signed(e.energy)}`);
  if (e.stress) parts.push(`stress ${signed(e.stress)}`);
  if (e.govResponse) parts.push(e.govResponse > 0 ? 'government escalates' : 'government eases off');
  if (e.blockPlatform) parts.push(`${e.blockPlatform} account withheld`);
  if (e.trend) parts.push(`${e.trend} trends`);
  if (e.launchOperation) parts.push(`starts ${getOperationTemplate(e.launchOperation)?.title ?? 'a campaign'}`);
  if (e.endOperation) parts.push(`ends ${getOperationTemplate(e.endOperation)?.title ?? 'a campaign'}`);
  if (e.recruit?.length) parts.push(`${e.recruit.length} join${e.recruit.length === 1 ? 's' : ''} the team`);
  if (e.dismiss?.length) parts.push(`${e.dismiss.length} leave${e.dismiss.length === 1 ? 's' : ''} the team`);
  return parts.join(', ');
}

function applyStoryEffects(state: GameState, e: StoryEffects): GameState {
  let next = adjustMovement(state, { trust: e.trust, credibility: e.credibility, volunteers: e.volunteers, funds: e.funds });
  if (e.followers) {
    next = { ...next, movement: { ...next.movement, followers: Math.max(0, next.movement.followers + e.followers) } };
  }
  if (e.govResponse) {
    next = { ...next, govResponse: { pressure: clamp((next.govResponse?.pressure ?? 0) + e.govResponse * 10, 0, 100) } };
  }
  if (e.chapters) {
    const strongest = [...next.states]
      .filter(s => s.cjpChapterLevel < 3)
      .sort((a, b) => stateSupport(next, b.name) - stateSupport(next, a.name))
      .slice(0, e.chapters)
      .map(s => s.name);
    next = growChapters(next, strongest);
  }
  if (e.blockPlatform) {
    next = { ...next, media: { ...next.media, platforms: { ...next.media.platforms, [e.blockPlatform]: 'WITHHELD' } } };
  }
  if (e.trend) next = trendTag(next, e.trend, Math.max(20000, next.movement.followers * 0.05));
  if (e.launchOperation) next = startOperation(next, e.launchOperation);
  if (e.endOperation) next = endOperation(next, e.endOperation);
  // Team changes driven by the story (real people join on the day the record says they did)
  for (const [ids, hired] of [[e.recruit, true], [e.dismiss, false]] as const) {
    for (const id of ids ?? []) {
      const person = next.people.find(p => p.id === id);
      if (!person || person.isHired === hired) continue;
      next = {
        ...next,
        people: next.people.map(p => (p.id === id ? { ...p, isHired: hired, currentAssignment: hired ? p.currentAssignment : null } : p)),
        movement: {
          ...next.movement,
          coreStaffCount: Math.max(0, next.movement.coreStaffCount + (hired ? 1 : -1)),
          monthlyBurnRate: Math.max(10000, next.movement.monthlyBurnRate + (hired ? 1 : -1) * person.salaryMonthly),
        },
      };
    }
  }
  if (e.legalHeat) next = adjustCrackdown(next, e.legalHeat);
  if (e.energy || e.stress) {
    next = {
      ...next,
      player: {
        ...next.player,
        energy: clamp(next.player.energy + (e.energy ?? 0), 0, 100),
        stress: clamp(next.player.stress + (e.stress ?? 0), 0, 100),
      },
    };
  }
  return next;
}

function resolveStoryChoice(state: GameState, choiceId: string): GameState {
  const st = state.story;
  const ev = st?.activeEventId ? getStoryEvent(st.activeEventId) : undefined;
  if (!ev) return state;
  const choice = ev.choices.find(c => c.id === choiceId);
  if (!choice) return state;
  if (choice.cost && state.movement.movementFunds < choice.cost) {
    return fail(state, `"${choice.label}" needs ${inr(choice.cost)} in movement funds.`);
  }

  let next = choice.cost ? spendFunds(state, choice.cost, 'Campaign', `${ev.title}: ${choice.label}`) : state;
  next = applyStoryEffects(next, choice.effects);

  const hasHistory = ev.historicalChoice !== undefined;
  const historical = hasHistory && ev.choices[ev.historicalChoice!]?.id === choice.id;
  const today = isoDate(state.currentDate);
  next = {
    ...next,
    story: {
      ...next.story,
      activeEventId: null,
      choices: { ...next.story.choices, [ev.id]: choice.id },
      queue: choice.next ? [...next.story.queue, { eventId: choice.next, due: addDaysIso(today, choice.nextDelayDays ?? 0) }] : next.story.queue,
      divergence: next.story.divergence + (hasHistory && !historical ? 1 : 0),
    },
  };

  next = {
    ...next,
    newsFeed: [
      {
        id: uid(next, `NEWS-${ev.id}`),
        date: { ...state.currentDate },
        headline: ev.title,
        sourceName: ev.location,
        biasTone: 'NEUTRAL_CRITICAL' as const,
        body: `${choice.label}. ${choice.outcome}`,
        impactTrust: choice.effects.trust ?? 0,
        impactTension: choice.effects.legalHeat ?? 0,
        read: false,
      },
      ...next.newsFeed,
    ].slice(0, 40),
  };

  const note = !hasHistory ? '' : historical ? ' (As it really happened.)' : ev.history ? ` In reality: ${ev.history}` : '';
  next = addJournal(
    next,
    ev.title,
    `${choice.label}. ${choice.outcome}${note}`,
    ev.kind === 'SETPIECE' ? 'HISTORIC_TURNING_POINT' : 'MILESTONE',
    'JOURNAL',
  );
  const fx = describeEffects(choice.effects);
  next = withOutcome(next, `${choice.label}${fx ? `: ${fx}` : ''}.`, historical || !hasHistory ? 'SUCCESS' : 'WARNING');
  return pumpStory(next);
}
