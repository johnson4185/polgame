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
} from '../types';
import { INITIAL_STATES, generateFull543Constituencies } from '../data/statesAndConstituencies';
import { HISTORICAL_ARCHIVE } from '../data/historicalArchive';
import { INITIAL_RECRUITS } from '../data/recruits';
import { INITIAL_CASES } from '../data/investigations';
import { INITIAL_REFORMS, INITIAL_CABINET } from '../data/reforms';
import { CRISIS_EVENT_DECK } from '../data/crises';
import { SeededRNG } from './random';

export const SAVE_VERSION = 2;

// Balance constants — tune here rather than inline
export const BALANCE = {
  actionEnergyCost: 6,
  actionStressCost: 2,
  minEnergyToAct: 10,
  overnightEnergyRecovery: 10,
  quest1Volunteers: 5000,
  partyVolunteersRequired: 15000,
  dailyVolunteerAttrition: 0.01,
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

export const INITIAL_GAME_DATE: GameDate = {
  year: 2026,
  month: 6,
  day: 1,
};

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

export function createInitialState(mode: CampaignMode = 'ABHIJEET_CJP', seed: number = 20260601): GameState {
  const constituencies = generateFull543Constituencies();

  const initialOperation: OperationState = {
    id: 'OP-JANTAR-MANTAR',
    title: 'Civic Resilience Demonstration at Jantar Mantar',
    type: 'JANTAR_MANTAR_PROTEST',
    location: 'Jantar Mantar Road, Connaught Place',
    stateName: 'NCT of Delhi',
    status: 'ACTIVE',
    startDate: { year: 2026, month: 6, day: 1 },
    durationDays: 14,
    currentDay: 1,
    budgetAllocated: 75000,
    crowdSize: 1850,
    crowdMorale: 82,
    suppliesWaterFood: 85,
    medicalReadiness: 70,
    legalSupportOnSite: true,
    policePermissionStatus: 'GRANTED',
    policeNegotiationTension: 35,
    mediaCoverageLevel: 58,
    speakerStageStatus: 'ACTIVE',
    weatherCondition: 'HEATWAVE',
    assignedStaffIds: ['REC-001', 'REC-002', 'REC-004'],
    dailyLog: [
      'Day 1: Crowd gathered by 9:00 AM. Sound permit verified with Parliament Street Police Station.',
      'Emergency water distribution counter established behind Stage 1.',
      'Advocate Meera Tandon stationed near media gate with certified permission orders.',
    ],
  };

  const initialNews: NewsArticle[] = [
    {
      id: 'NEWS-INIT-01',
      date: { year: 2026, month: 6, day: 1 },
      headline: 'Students & Civic Groups Gather at Jantar Mantar Over Exam Accountability',
      sourceName: 'The National Dispatch',
      biasTone: 'NEUTRAL_CRITICAL',
      body: 'Hundreds of young students, parents, and civil society members led by Abhijeet Dipke assembled this morning at Jantar Mantar demanding systemic overhaul of public exam security and strict prosecution of coaching center building violations.',
      impactTrust: 5,
      impactTension: 2,
      read: false,
    },
    {
      id: 'NEWS-INIT-02',
      date: { year: 2026, month: 6, day: 1 },
      headline: 'Administration Deploys Multi-tier Barricades; Traffic Diverted Around Tolstoy Marg',
      sourceName: 'Delhi Traffic & City Chronicle',
      biasTone: 'GOVERNMENT_LINE',
      body: 'Delhi Police has placed multi-layer metal barricades around Jantar Mantar Road, emphasizing that protests must remain confined within the designated boundary without marching towards Sansad Marg.',
      impactTrust: 0,
      impactTension: 8,
      read: false,
    }
  ];

  const initialJournal: JournalEntry[] = [
    {
      id: 'JOURNAL-001',
      date: { year: 2026, month: 6, day: 1 },
      title: 'The Outrage Becomes Action',
      text: 'We began with anger on our screens—the court remarks, the leaked papers, the drownings in coaching basements. Today we stand under the scorching sun of Jantar Mantar. We have water, a sound system, and our voices. We cannot afford to back down.',
      significance: 'HISTORIC_TURNING_POINT',
      associatedScreen: 'OPERATIONS',
    }
  ];

  return {
    version: SAVE_VERSION,
    seed,
    currentDate: { ...INITIAL_GAME_DATE },
    clockSpeed: 0, // Paused on start
    hasBegun: false,
    isPrologueComplete: false,
    activeScreen: 'OPERATIONS',
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
      personalSavings: 65000,
      personalDebt: 0,
      monthlyLivingCost: 18000,
      employmentStatus: 'LEAVE_OF_ABSENCE',
      salaryMonthly: 42000,
      familySupport: 75,
      burnoutRisk: false,
    },

    movement: {
      name: 'Cockroach Janta Party (Civic Vigil)',
      publicTrust: 68,
      mediaCredibility: 62,
      volunteerCount: 1420,
      coreStaffCount: 4,
      stateChaptersCount: 6,
      movementFunds: 185000,
      monthlyBurnRate: 48000,
      reformistLoyalty: 88,
      grassrootsLoyalty: 85,
      tacticalPragmatistsLoyalty: 70,
      hasJantarMantarHeld: true,
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
        },
      ],
      candidateCount: 0,
      projectedSeats: 12,
      actualSeatsWon: 0,
      isRulingCoalition: false,
      isOppositionLead: false,
    },

    people: [...INITIAL_RECRUITS],
    transactions: [
      {
        id: 'TXN-001',
        date: { year: 2026, month: 6, day: 1 },
        account: 'MOVEMENT',
        type: 'INCOME',
        category: 'Small Crowdfunding',
        amount: 85000,
        description: 'UPI citizen micro-donations (avg ₹250) for Jantar Mantar drinking water & tent stage',
        verified: true,
      },
      {
        id: 'TXN-002',
        date: { year: 2026, month: 6, day: 1 },
        account: 'MOVEMENT',
        type: 'EXPENSE',
        category: 'Logistics',
        amount: 32000,
        description: 'Sound system, generator diesel, 200 water jars and portable bio-toilets permit fee',
        verified: true,
      }
    ],

    operations: [initialOperation],
    activeOperationId: 'OP-JANTAR-MANTAR',
    cases: [...INITIAL_CASES],
    constituencies,
    states: [...INITIAL_STATES],
    historicalArchive: [...HISTORICAL_ARCHIVE],
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
    crackdownLevel: 15,
    movementXP: 320,
    movementLevel: 1,
    activeQuests: [
      {
        id: 'QUEST-1',
        chapter: 1,
        title: 'The Jantar Mantar Vigil',
        description: 'Sustain ground resistance against Delhi heat & police intimidation. Mobilize 5,000 citizens to make the movement too large to crush.',
        currentProgress: 1420,
        targetProgress: BALANCE.quest1Volunteers,
        unit: 'Volunteers',
        rewardXP: 500,
        isCompleted: false,
      },
      {
        id: 'QUEST-2',
        chapter: 1,
        title: 'Expose the Mining Paper-Trail',
        description: 'File RTIs and corroborate evidence to complete the Port Infrastructure Dossier before the Supreme Court recess.',
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
        description: `Reach ${BALANCE.partyVolunteersRequired.toLocaleString('en-IN')} volunteers, file a PIL or expose a case, then register the party with the ECI.`,
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
  };
}

export type GameAction =
  | { type: 'SET_SCREEN'; screen: GameState['activeScreen'] }
  | { type: 'SET_CLOCK_SPEED'; speed: GameState['clockSpeed'] }
  | { type: 'ADVANCE_DAY' }
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
  | { type: 'FINISH_MINI_GAME'; result: { score: number; trustDelta: number; fundsDelta: number; volunteersDelta: number; xpDelta: number; notes: string } }
  | { type: 'TOGGLE_EMPLOYMENT'; status: GameState['player']['employmentStatus'] }
  | { type: 'PERSONAL_TO_MOVEMENT_DONATION'; amount: number }
  | { type: 'HIRE_STAFF'; personId: string }
  | { type: 'FIRE_STAFF'; personId: string }
  | { type: 'ASSIGN_STAFF'; personId: string; assignment: string }
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
  | { type: 'FINISH_PROLOGUE' }
  | { type: 'LOG_JOURNAL'; entry: JournalEntry };

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
    c.cjpSupportScore * (0.5 + ctx.trust / 100) +
    funding +
    c.cjpCandidate.localReputation / 20 +
    chapter * 2 +
    mood +
    Math.min(4, ctx.volunteers / 10000) -
    ctx.crackdown / 10 +
    noise;
  return clamp(share, 1, 60);
}

export type SeatWinner = 'RULING' | 'OPPOSITION' | 'OTHERS' | 'CJP';

export function contestSeat(c: LokSabhaConstituency, ctx: SeatContext, rng?: SeededRNG) {
  const n = (spread: number) => (rng ? (rng.next() - 0.5) * spread : 0);
  const cjp = cjpVoteShare(c, ctx, n(10));
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
  const ctx = seatContext(state);
  return state.constituencies.filter(c => c.cjpCandidate && contestSeat(c, ctx).winner === 'CJP').length;
}

function runElection(state: GameState): GameState {
  const rng = rngFor(state, 543);
  const ctx = seatContext(state, (rng.next() - 0.5) * 8, (rng.next() - 0.5) * 8);
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
    activeQuests: saved.activeQuests?.length ? saved.activeQuests : fresh.activeQuests,
  };
}

// ─── Reducer ────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.gameOver && !POST_GAME_ACTIONS.has(action.type)) return state;
  const next = reduce(state, action);
  if (next === state) return state;
  return finalize(next, state);
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
      return { ...state, hasBegun: true, isPrologueComplete: true, clockSpeed: 0 };

    // ── Time ──
    case 'ADVANCE_DAY':
      if (state.activeCrisis || state.activeMiniGame) return state;
      return advanceSimulationDay(state);

    case 'REST_DAY': {
      if (state.activeCrisis || state.activeMiniGame) return state;
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
      return withOutcome(next, `Legal aid filed: crackdown −15 (${inr(BALANCE.legalAidCost)}).`);
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
          x.id === c.id ? { ...x, cjpSupportScore: clamp(x.cjpSupportScore + gain, 0, 60) } : x,
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
      const res = action.result;
      const kind = state.activeMiniGame;
      let next = adjustMovement(state, {
        trust: res.trustDelta,
        funds: res.fundsDelta,
        volunteers: res.volunteersDelta,
      });
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
        `${kind === 'RALLY' ? 'Rally' : 'Debate'} result: trust ${signed(trustGain)}, ${signed(volunteerGain)} volunteers, +${inr(res.fundsDelta)}${kind === 'RALLY' ? ', crackdown +3' : ''}.`,
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
      return withOutcome(
        {
          ...state,
          people: state.people.map(p => (p.id === action.personId ? { ...p, isHired: true, morale: 90, workload: 30 } : p)),
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

    // ── Ground operation ──
    case 'OPERATION_DECISION': {
      const op = state.operations.find(o => o.id === action.operationId);
      if (!op) return state;
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
            msg = 'Talks succeeded: police tension −25, crackdown −5.';
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
            msg = 'March succeeded: trust +8, media 100, crackdown +5.';
          } else {
            u.policeNegotiationTension = 90;
            u.policePermissionStatus = 'SECTION_144_WARNING';
            u.crowdMorale = Math.max(10, u.crowdMorale - 15);
            trust = -3;
            crackdown = 15;
            log = 'Barricades rushed at Tolstoy Marg. Police issued a formal dispersal warning.';
            msg = 'March repelled: morale −15, trust −3, crackdown +15.';
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
          msg = 'PIL admitted by the High Court! Trust +8, crackdown −8.';
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
          msg = `Exposé backfired: trust −6, credibility −8, crackdown +${crackdown}.`;
          tone = 'FAILURE';
        } else {
          trust = Math.round(impact / 8);
          cred = Math.round(impact / 10);
          u.outcomeNotes = 'Released the full dossier with banking trails at a Constitution Club press briefing.';
          msg = `Exposé landed: trust +${trust}, credibility +${cred}, crackdown +${crackdown}.`;
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
      if (state.electionLiveState.isCountingUnderway || state.electionLiveState.isCountingFinished) {
        return fail(state, 'Nominations are closed.');
      }
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
      if (live.isCountingUnderway || live.isCountingFinished) return state;
      const next = runElection(state);
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
        party: { ...state.party, actualSeatsWon: t.cjp },
      };
      if (finished) {
        next = addJournal(
          next,
          `Verdict 2026: ${state.party.abbreviation} wins ${t.cjp} seat${t.cjp === 1 ? '' : 's'}`,
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
      const gain = clamp(
        Math.round(8 + seats / 8 + (state.party.isRulingCoalition ? 12 : 0) + state.player.negotiation - r.bureaucraticResistance / 10),
        3,
        40,
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
export function advanceSimulationDay(state: GameState): GameState {
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
  const energy = clamp(p.energy + BALANCE.overnightEnergyRecovery - (p.employmentStatus === 'FULL_TIME_JOB' ? 6 : 2), 0, 100);
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

  // Daily micro-crowdfunding scales with trust and shrinks under crackdown
  if (rng.next() < 0.7) {
    const donation = Math.floor(m.publicTrust * 60 * (0.8 + rng.next() * 0.4) * (1 - crackdown / 200));
    movementFunds += donation;
    if (donation > 3000 && rng.next() > 0.7) {
      txn('TXN-DONATION', 'MOVEMENT', 'INCOME', 'Crowdfunding', donation, `Citizen UPI micro-donations, ${formatDate(nextDate)}`);
    }
  }

  // 3. Ground operations
  let opVolunteers = 0;
  let newCrackdown = crackdown;
  const operations = state.operations.map(op => {
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
  if (m.publicTrust > 45) {
    const decay = (m.publicTrust - 45) / 20;
    trustDelta -= Math.floor(decay) + (rng.next() < decay % 1 ? 1 : 0);
  }
  const attrition = m.volunteerCount > 2000 ? Math.floor(m.volunteerCount * BALANCE.dailyVolunteerAttrition) : 0;
  const volunteerCount = clamp(
    m.volunteerCount + Math.floor((m.publicTrust - 40) * 1.2) + opVolunteers - attrition,
    100,
    500000,
  );

  // 5. Historical archive unlocks
  const dateStr = `${nextDate.year}-${String(nextDate.month).padStart(2, '0')}-${String(nextDate.day).padStart(2, '0')}`;
  const historicalArchive = state.historicalArchive.map(d =>
    !d.isUnlocked && d.historicalDate <= dateStr ? { ...d, isUnlocked: true } : d,
  );

  // 6. Staff morale (immutably — never push into existing arrays)
  const people = state.people.map(person => {
    if (!person.isHired) return person;
    let morale = person.morale;
    if (person.workload > 70) morale -= 2;
    if (isNewMonth && insolventMonths > 0) morale -= 15;
    morale = clamp(morale, 10, 100);
    const memories =
      morale < 30 && rng.next() > 0.95
        ? [...person.memories, `Exhausted from relentless work without rest on ${formatDate(nextDate)}`]
        : person.memories;
    return { ...person, morale, memories };
  });

  // 7. Crisis roll — more likely under heavy crackdown
  let activeCrisis = state.activeCrisis;
  if (!activeCrisis && state.hasBegun && CRISIS_EVENT_DECK.length > 0 && rng.next() < 0.15 + newCrackdown / 400) {
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
      movementFunds,
      volunteerCount,
      publicTrust: clamp(m.publicTrust + trustDelta, 0, 100),
    },
    operations,
    historicalArchive,
    people,
    transactions: transactions.slice(0, 100),
  };

  for (const op of operations) {
    const before = state.operations.find(o => o.id === op.id);
    if (before?.status === 'ACTIVE' && op.status === 'CONCLUDED') {
      next = addJournal(next, `${op.title} Concluded`, op.outcomeSummary ?? '', 'HISTORIC_TURNING_POINT', 'OPERATIONS');
    }
  }
  if (warning) next = withOutcome(next, warning, 'WARNING');
  return next;
}
