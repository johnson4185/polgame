// REPUBLIC: 543 — Core Game Types & Interfaces

export type CampaignMode = 'ABHIJEET_CJP' | 'CUSTOM_CITIZEN';

export type CareerRoute = 'CIVIC_FORCE' | 'ELECTORAL_PARTY';

export type ScreenTab =
  | 'OVERVIEW'
  | 'MEDIA'
  | 'PERSONAL'
  | 'OPERATIONS'
  | 'MAP_543'
  | 'PEOPLE'
  | 'EVIDENCE'
  | 'FINANCE'
  | 'PARTY_ECI'
  | 'ELECTION_NIGHT'
  | 'GOVERNMENT'
  | 'ARCHIVE'
  | 'JOURNAL';

export interface GameDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export type SkillKey = 'communication' | 'organizing' | 'research' | 'negotiation' | 'leadership' | 'financialAcumen';
export interface SkillProgress {
  /** XP collected towards the next level */
  xp: Record<SkillKey, number>;
  /** Day number (days since 1970) the skill was last practised; 0 = never */
  lastTrained: Record<SkillKey, number>;
}

export interface PlayerStats {
  name: string;
  roleTitle: string;
  avatarUrl: string;
  campaignMode: CampaignMode;
  background: 'STUDENT_ACTIVIST' | 'INVESTIGATIVE_JOURNALIST' | 'JUNIOR_ADVOCATE' | 'GRASSROOTS_ORGANIZER';
  
  // Vitals (0 - 100)
  energy: number;
  stress: number;
  health: number;

  // Skills (1 - 10)
  communication: number;
  organizing: number;
  research: number;
  negotiation: number;
  leadership: number;
  financialAcumen: number;
  /** Practice towards the next level of each skill (see simulation/skills.ts) */
  skillProgress?: SkillProgress;
  /** L3: birth date. For a real person only when the public record states it (see birthDateSource). */
  birthDate?: GameDate;
  birthDateSource?: string;

  // Personal Finances (₹)
  personalSavings: number;
  personalDebt: number;
  monthlyLivingCost: number; // Rent, food, bills
  employmentStatus: 'FULL_TIME_JOB' | 'LEAVE_OF_ABSENCE' | 'FULL_TIME_ACTIVISM';
  salaryMonthly: number;

  // Personal relationships
  familySupport: number; // 0 - 100
  burnoutRisk: boolean;
}

export interface MovementStats {
  name: string;
  /** Social media followers across platforms */
  followers: number;
  publicTrust: number; // 0 - 100
  mediaCredibility: number; // 0 - 100
  volunteerCount: number;
  coreStaffCount: number;
  stateChaptersCount: number;
  movementFunds: number; // ₹
  monthlyBurnRate: number; // ₹
  
  // Factions balance
  reformistLoyalty: number; // 0 - 100
  grassrootsLoyalty: number; // 0 - 100
  tacticalPragmatistsLoyalty: number; // 0 - 100

  // Movement milestone status
  hasJantarMantarHeld: boolean;
  hasFormedParty: boolean;
  isBannedOrSealed: boolean;
}

export interface PartyStats {
  isFormed: boolean;
  partyName: string;
  abbreviation: string;
  symbol: string;
  registrationStatus: 'UNREGISTERED' | 'APPLICATION_FILED' | 'ECI_RECOGNIZED';
  partyFunds: number; // ₹ strictly separated from movement & personal
  ideologicalPillars: string[];
  manifestoPledges: ManifestoPledge[];
  candidateCount: number; // max 543
  projectedSeats: number;
  actualSeatsWon: number;
  isRulingCoalition: boolean;
  isOppositionLead: boolean;
  /** Date the most recent general election was counted */
  lastElectionDate?: GameDate;
  electionsHeld?: number;
}

export interface ManifestoPledge {
  id: string;
  category: 'EDUCATION' | 'GOVERNANCE' | 'HEALTH' | 'LABOUR' | 'ENVIRONMENT';
  title: string;
  description: string;
  costEstimateCrores: number;
  publicAppeal: number; // 0 - 100
  vestedResistance: number; // 0 - 100
  fulfilled: boolean;
  /** Passing this reform fulfils the pledge */
  reformId?: string;
}

export interface RecruitablePerson {
  id: string;
  name: string;
  role: 'ORGANIZER' | 'LAWYER' | 'INVESTIGATOR' | 'COMMUNICATIONS' | 'FUNDRAISER' | 'REGIONAL_LEAD';
  state: string;
  avatarSeed: string;
  portraitUrl?: string;
  skills: {
    communication: number;
    organizing: number;
    research: number;
    negotiation: number;
    financialAcumen: number;
  };
  salaryMonthly: number; // 0 if pure volunteer
  isVolunteer: boolean;
  morale: number; // 0 - 100
  workload: number; // 0 - 100
  loyalty: number; // 0 - 100
  integrity: number; // 0 - 100
  isHired: boolean;
  currentAssignment: string | null;
  memories: string[];
  observation: string;
  /** A real person from docs/cjp-timeline.md. No integrity score is shown and no words are invented for them. */
  historical?: boolean;
  /** An invented character (not in the record) */
  fictional?: boolean;
  /** First date the person appears in the record; they can't be recruited before it */
  joinDate?: GameDate;
  /** Timeline citation for historical people */
  source?: string;
  // L2: the team grows and changes (all optional so old saves load)
  rank?: StaffRank;
  /** Days on the team in total */
  daysServed?: number;
  /** Consecutive days below quitting morale */
  lowMoraleDays?: number;
  /** Only appears once the movement has this many volunteers */
  unlockVolunteers?: number;
  /** Date this recruit became available (set when unlockVolunteers is reached) */
  availableSince?: GameDate;
  /** L3: fictional characters only; real people have no age unless the record states one */
  birthDate?: GameDate;
}

export type StaffRank = 'MEMBER' | 'COORDINATOR' | 'LEAD';

export interface Transaction {
  id: string;
  date: GameDate;
  account: 'PERSONAL' | 'MOVEMENT' | 'PARTY';
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  donorName?: string;
  verified: boolean;
}

// Jantar Mantar and Operations
export type OperationType =
  | 'JANTAR_MANTAR_PROTEST'
  | 'EXAM_SCAM_INVESTIGATION'
  | 'SCHOOL_AUDIT_DRIVE'
  | 'STATE_JAN_YATRA'
  | 'PARLIAMENT_MARCH'
  | 'GENERAL_ELECTION_CAMPAIGN'
  | 'ELECTION_COMMISSION_CAMPAIGN';

export interface OperationState {
  id: string;
  title: string;
  type: OperationType;
  location: string;
  stateName: string;
  status: 'PREPARATION' | 'ACTIVE' | 'CONCLUDED' | 'DISRUPTED';
  startDate: GameDate;
  durationDays: number;
  currentDay: number;
  budgetAllocated: number;
  
  // Tactical Jantar Mantar parameters
  crowdSize: number;
  crowdMorale: number; // 0 - 100
  suppliesWaterFood: number; // 0 - 100
  medicalReadiness: number; // 0 - 100
  legalSupportOnSite: boolean;
  policePermissionStatus: 'PENDING' | 'GRANTED' | 'SECTION_144_WARNING' | 'REVOKED';
  policeNegotiationTension: number; // 0 - 100
  mediaCoverageLevel: number; // 0 - 100
  speakerStageStatus: 'ACTIVE' | 'DISRUPTED' | 'STANDBY';
  weatherCondition: 'SUNNY' | 'HEATWAVE' | 'MONSOON_RAIN' | 'SMOG_DELHI';
  
  assignedStaffIds: string[];
  dailyLog: string[];
  outcomeSummary?: string;
  /** Template this campaign came from (lib/game/data/operations.ts) */
  templateId?: string;
  /** Invented sandbox campaign */
  fictional?: boolean;
}

// Evidence & Case Management
export interface EvidenceItem {
  id: string;
  title: string;
  category: 'RTI_REPLY' | 'INTERNAL_LEAK' | 'FINANCIAL_TRAIL' | 'WITNESS_STATEMENT' | 'FORENSIC_AUDIT';
  provenance: string;
  reliability: 'RUMOR' | 'UNVERIFIED' | 'CORROBORATED' | 'OFFICIAL_DOCUMENT';
  summary: string;
  discoveryDate: GameDate;
  linkedTarget: string;
  isCorroborated: boolean;
  connectedEvidenceIds: string[];
}

export interface InvestigationCase {
  id: string;
  title: string;
  targetMinistryOrEntity: string;
  evidenceItems: EvidenceItem[];
  currentStage: 'TIP_OFF' | 'GATHERING_RECORDS' | 'CORROBORATING' | 'LEGAL_REVIEW' | 'FILED_PIL' | 'EXPOSED';
  readinessPercentage: number;
  legalRisk: 'LOW' | 'MEDIUM' | 'SEVERE';
  publicImpactPotential: number; // 0 - 100
  outcomeNotes?: string;
  /** Invented sandbox content, not part of the historical record */
  isFictional?: boolean;
}

// Geography & 543 Lok Sabha Constituencies
export interface LokSabhaConstituency {
  id: number; // 1 to 543
  name: string;
  state: string;
  category: 'GEN' | 'SC' | 'ST';
  totalVotersEstimated: number;
  incumbentParty: string;
  rulingVoteShareBaseline: number;
  mainOppVoteShareBaseline: number;
  cjpSupportScore: number; // 0 - 100
  cjpCandidate?: {
    name: string;
    isCoreMember: boolean;
    localReputation: number;
    campaignFundingAllocated: number;
  };
  electionResult?: {
    winnerParty: string;
    winnerCandidate: string;
    votesWon: number;
    marginVotes: number;
    cjpVotes: number;
    cjpVoteShare: number;
    rank: number;
    /** L5: the alliances' actual shares, used to shift baselines after the election */
    rulingShare?: number;
    oppShare?: number;
  };
}

export interface StateData {
  code: string;
  name: string;
  type: 'STATE' | 'UT';
  capital: string;
  seatsTotal: number;
  dominantIssues: string[];
  regionalMood: 'RULING_LEAN' | 'ANTI_INCUMBENCY' | 'VOLATILE' | 'REFORM_RECEPTIVE';
  cjpChapterLevel: 0 | 1 | 2 | 3; // 0 = none, 1 = informal, 2 = verified office, 3 = mass branch
  volunteerStrength: number;
  keyLeaders: string[];
  /** L4: days this chapter has been neglected (volunteers far below its level) */
  neglectDays?: number;
}

// Real Historical Archive
export interface HistoricalDispatch {
  id: string;
  historicalDate: string; // ISO date, e.g. "2026-07-20"
  title: string;
  sourcePublication: string;
  sourceUrl: string;
  // CONTESTED_CLAIM: sources disagree; the summary attributes each side (see docs/story-brief.md)
  verificationStatus: 'DOCUMENTED_FACT' | 'OFFICIAL_PROCEEDING' | 'COURT_RECORD' | 'CONTESTED_CLAIM' | 'SIMULATED_DRAMATIZATION';
  peopleMentioned: string[];
  summary: string;
  relevanceToCJP: string;
  isUnlocked: boolean;
  /** Mentions student suicides or serious harm: the UI shows a helpline note */
  sensitive?: boolean;
}

// Media & News feed
export interface NewsArticle {
  id: string;
  date: GameDate;
  headline: string;
  sourceName: string;
  biasTone: 'SYMPATHETIC' | 'NEUTRAL_CRITICAL' | 'GOVERNMENT_LINE' | 'SENSATIONAL';
  body: string;
  impactTrust: number;
  impactTension: number;
  read: boolean;
}

// Governance & Reforms
export interface ReformPolicy {
  id: string;
  name: string;
  sector: 'EXAM_SECURITY' | 'JUDICIAL_ACCOUNTABILITY' | 'CIVIC_PROCUREMENT' | 'HEALTH_CARE' | 'EDUCATION_INFRA';
  description: string;
  stateSupportReq: number; // How many states needed
  bureaucraticResistance: number; // 0 - 100
  costCrores: number;
  implementationProgress: number; // 0 - 100
  status: 'DRAFT' | 'TABLED_PARLIAMENT' | 'PASSED_ACT' | 'ENFORCING' | 'CHALLENGED_SUPREME_COURT';
}

export interface CabinetMinistry {
  id: string;
  title: string;
  ministerName: string;
  isPlayerParty: boolean;
  performanceScore: number; // 0 - 100
  corruptionScandalRisk: number; // 0 - 100
}

// Journal / Legacy Chronicle
export interface JournalEntry {
  id: string;
  date: GameDate;
  title: string;
  text: string;
  significance: 'MINOR' | 'MILESTONE' | 'HISTORIC_TURNING_POINT';
  associatedScreen?: ScreenTab;
}

export interface GameQuest {
  id: string;
  chapter: number;
  title: string;
  description: string;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  rewardXP: number;
  isCompleted: boolean;
}

export interface CrisisOption {
  id: string;
  label: string;
  description: string;
  consequences: {
    trustChange?: number;
    fundsChange?: number;
    volunteersChange?: number;
    crackdownChange?: number;
    stressChange?: number;
    energyChange?: number;
    followersChange?: number;
  };
}

export interface CrisisEvent {
  id: string;
  title: string;
  urgency: 'HIGH' | 'CRITICAL' | 'EXTREME';
  speakerName: string;
  speakerRole: string;
  speakerFaction: string;
  contextNarrative: string;
  quote: string;
  options: CrisisOption[];
  /** Touches student deaths or serious harm: show the helpline */
  sensitive?: boolean;
}

// ─── Story events ───────────────────────────────────────────────────────────

/** Resource changes a story choice can make. Positive legalHeat/stress are bad for the player. */
export interface StoryEffects {
  followers?: number;
  volunteers?: number;
  funds?: number;
  trust?: number;
  credibility?: number;
  legalHeat?: number;
  energy?: number;
  stress?: number;
  /** Moves the government response meter (S2) */
  govResponse?: number;
  /** People (ids from recruits.ts) who join the team as a result */
  recruit?: string[];
  /** People who leave the team as a result */
  dismiss?: string[];
  /** Start a campaign from lib/game/data/operations.ts */
  launchOperation?: string;
  /** End a running campaign (by template id) */
  endOperation?: string;
  /** Open (or grow) CJP chapters in this many of the strongest states */
  chapters?: number;
  /** A platform withholds the movement's account */
  blockPlatform?: Platform;
  /** A hashtag starts trending */
  trend?: string;
}

export interface StoryChoice {
  id: string;
  label: string;
  description: string;
  effects: StoryEffects;
  /** Movement funds needed to pick this choice */
  cost?: number;
  /** Follow-up event id */
  next?: string;
  /** Days until the follow-up fires (0 = straight away) */
  nextDelayDays?: number;
  /** Shown after choosing: what happens as a result */
  outcome: string;
}

export interface StoryEvent {
  id: string;
  /** ISO date the event fires; omit for follow-ups reached only through `next` */
  date?: string;
  act: 1 | 2 | 3;
  kind?: 'EVENT' | 'SETPIECE' | 'NEWS';
  title: string;
  /** 1–3 sentences */
  description: string;
  location: string;
  speaker?: { name: string; role: string; line: string };
  /** Label for the illustration slot until art exists */
  art?: string;
  choices: StoryChoice[];
  /** Index into `choices` of what really happened (Act 1) */
  historicalChoice?: number;
  /** What really happened, in one or two sentences (Act 1) */
  history?: string;
  /** Timeline heading this event comes from, e.g. "docs/cjp-timeline.md#20-june-sat" */
  source?: string;
  /** Mentions student suicides or serious harm: show the helpline */
  sensitive?: boolean;
  /** Invented sandbox content rather than the record */
  fictional?: boolean;
  /** Don't fire this dated event if the player already made one of these choices */
  skipIfChosen?: { event: string; choice: string }[];
  /** Conditions that must hold before the event fires; it waits (from its date) until they do */
  requires?: { party?: boolean; noParty?: boolean; inGovernment?: boolean; minSeats?: number };
}

export interface StoryState {
  act: 1 | 2 | 3;
  /** ISO date the campaign began; dated events before it never fire */
  startedOn: string;
  firedIds: string[];
  /** eventId → choiceId */
  choices: Record<string, string>;
  /** Follow-ups waiting for their date */
  queue: { eventId: string; due: string }[];
  activeEventId: string | null;
  /** Number of choices that differ from what really happened */
  divergence: number;
}

export type Platform = 'X' | 'INSTAGRAM' | 'YOUTUBE' | 'TELEGRAM' | 'WHATSAPP';
export type MediaActionKind = 'MEME' | 'HASHTAG' | 'LIVE' | 'DEBUNK';

export interface SocialPost {
  id: string;
  author: string;
  handle: string;
  text: string;
  likes: number;
  date: GameDate;
}

export interface MediaState {
  /** Share of the national conversation (0–100). Mainstream media is the remainder. */
  narrative: { movement: number; government: number };
  trending: { tag: string; posts: number }[];
  platforms: Record<Platform, 'ACTIVE' | 'WITHHELD'>;
  feed: SocialPost[];
}

export interface ActionOutcome {
  id: number;
  text: string;
  tone: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

export type EndingKind =
  | 'COLLAPSE'        // player health gave out
  | 'SEALED'          // crackdown reached 100
  | 'BANKRUPT'        // movement insolvent too long
  | 'IRRELEVANT'      // public trust collapsed
  | 'REFORMER';       // passed enough reforms into law

export interface GameEnding {
  kind: EndingKind;
  victory: boolean;
  title: string;
  text: string;
  date: GameDate;
}

// Authoritative Master Game State
export interface GameState {
  version: number;
  seed: number;
  currentDate: GameDate;
  clockSpeed: 0 | 1 | 2 | 5; // 0 is paused
  hasBegun: boolean;
  isPrologueComplete: boolean;
  activeScreen: ScreenTab;
  theme: 'DARK' | 'LIGHT';

  // Game Loop Mechanics (Turn & Action System)
  actionPoints: number; // 0 to 3 per day
  maxActionPoints: number; // 3
  crackdownLevel: number; // 0 - 100%
  movementXP: number;
  movementLevel: number;
  activeQuests: GameQuest[];
  activeCrisis: CrisisEvent | null;
  activeMiniGame: 'RALLY' | 'TV_DEBATE' | null;
  
  // Core Subsystems
  player: PlayerStats;
  movement: MovementStats;
  party: PartyStats;
  people: RecruitablePerson[];
  transactions: Transaction[];
  operations: OperationState[];
  activeOperationId: string | null;
  cases: InvestigationCase[];
  constituencies: LokSabhaConstituency[];
  states: StateData[];
  historicalArchive: HistoricalDispatch[];
  newsFeed: NewsArticle[];
  reforms: ReformPolicy[];
  cabinet: CabinetMinistry[];
  journal: JournalEntry[];
  
  // Election Night State
  electionLiveState: {
    isCountingUnderway: boolean;
    isCountingFinished: boolean;
    countedSeatsCount: number;
    rulingSeats: number;
    oppositionSeats: number;
    cjpSeats: number;
    otherSeats: number;
    leadingParty: string;
    coalitionFormed: boolean;
    coalitionSummary?: string;
  };

  // Sound and UI Settings
  settings: {
    soundEnabled: boolean;
    volume: number;
    reducedMotion: boolean;
    theme?: 'DARK' | 'LIGHT';
  };

  // Result of the most recent player action, surfaced as a toast by the HUD.
  // `id` increments on every outcome so the UI can detect repeats of the same text.
  lastOutcome: ActionOutcome | null;

  // dateKey of the last day each mini-game was played (one of each per day)
  miniGameLastPlayed?: Partial<Record<'RALLY' | 'TV_DEBATE', number>>;

  // Incremented once per state-changing action; used to build unique, deterministic ids
  idCounter: number;

  // Consecutive month-starts where the movement could not cover its burn rate
  insolventMonths: number;

  // Set when the campaign ends (victory or defeat); the engine ignores gameplay actions after this
  gameOver: GameEnding | null;

  // Dated story events (Act 1 follows docs/cjp-timeline.md)
  story: StoryState;

  /** Government response meter: pressure 0–100 → Ignore / Block accounts / Police action / Negotiate */
  govResponse: { pressure: number };

  media: MediaState;
  /** L5: national vote-share swing for each alliance (points, ±12) */
  nationalMood?: NationalMood;

  // Active dialogue or notification alert
  activeDialogue: {
    id: string;
    speakerName: string;
    speakerRole: string;
    text: string;
    options: {
      label: string;
      consequenceHint: string;
      actionPayload: string;
    }[];
  } | null;
}

export interface NationalMood {
  nda: number;
  india: number;
}
