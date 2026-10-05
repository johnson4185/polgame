// REPUBLIC: 543 — Authoritative Core Simulation Engine
import { 
  GameState, 
  GameDate, 
  OperationState, 
  CampaignMode,
  LokSabhaConstituency,
  NewsArticle,
  JournalEntry
} from '../types';
import { INITIAL_STATES, generateFull543Constituencies } from '../data/statesAndConstituencies';
import { HISTORICAL_ARCHIVE } from '../data/historicalArchive';
import { INITIAL_RECRUITS } from '../data/recruits';
import { INITIAL_CASES } from '../data/investigations';
import { INITIAL_REFORMS, INITIAL_CABINET } from '../data/reforms';
import { CRISIS_EVENT_DECK } from '../data/crises';
import { SeededRNG } from './random';
import { soundManager } from './sound';

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
    version: 1,
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
        currentProgress: 3500,
        targetProgress: 5000,
        unit: 'Volunteers',
        rewardXP: 500,
        isCompleted: false,
      },
      {
        id: 'QUEST-2',
        chapter: 1,
        title: 'Expose the Mining Paper-Trail',
        description: 'File RTIs and corroborate evidence to complete the Port Infrastructure Dossier before the Supreme Court recess.',
        currentProgress: 2,
        targetProgress: 3,
        unit: 'Corroborations',
        rewardXP: 750,
        isCompleted: false,
      },
      {
        id: 'QUEST-3',
        chapter: 2,
        title: 'Road to 272: Form the People’s Party',
        description: 'Collect registered pledges and complete Election Commission of India recognition requirements.',
        currentProgress: 1,
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
  | { type: 'USE_ACTION_POINT'; cost: number }
  | { type: 'RESOLVE_CRISIS'; choiceId: string }
  | { type: 'TRIGGER_CRISIS'; crisis: import('../types').CrisisEvent }
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

export function gameReducer(state: GameState, action: GameAction): GameState {
  const rng = new SeededRNG(state.seed);

  switch (action.type) {
    case 'USE_ACTION_POINT': {
      return {
        ...state,
        actionPoints: Math.max(0, (state.actionPoints ?? 3) - action.cost),
      };
    }

    case 'OPEN_MINI_GAME': {
      return {
        ...state,
        activeMiniGame: action.miniGame,
      };
    }

    case 'CLOSE_MINI_GAME': {
      soundManager.playClick();
      return {
        ...state,
        activeMiniGame: null,
      };
    }

    case 'TRIGGER_CRISIS': {
      soundManager.playCrisisSting();
      return {
        ...state,
        activeCrisis: action.crisis,
      };
    }

    case 'FINISH_MINI_GAME': {
      const res = action.result;
      const newXp = (state.movementXP ?? 250) + res.xpDelta;
      const newLevel = Math.min(5, Math.floor(newXp / 1000) + 1);

      return {
        ...state,
        activeMiniGame: null,
        movementXP: newXp,
        movementLevel: newLevel,
        movement: {
          ...state.movement,
          publicTrust: Math.min(100, state.movement.publicTrust + res.trustDelta),
          movementFunds: state.movement.movementFunds + res.fundsDelta,
          volunteerCount: state.movement.volunteerCount + res.volunteersDelta,
        },
        journal: [
          {
            id: `JOURNAL-MINIGAME-${Date.now()}`,
            date: { ...state.currentDate },
            title: `Mini-Game Milestone: Victory Report`,
            text: res.notes,
            significance: 'MILESTONE',
            associatedScreen: 'OPERATIONS',
          },
          ...state.journal,
        ],
      };
    }

    case 'RESOLVE_CRISIS': {
      const crisis = state.activeCrisis;
      if (!crisis) return state;

      const opt = crisis.options.find(o => o.id === action.choiceId) || crisis.options[0];
      const c = opt.consequences;

      const newTrust = Math.max(0, Math.min(100, state.movement.publicTrust + (c.trustChange ?? 0)));
      const newFunds = Math.max(0, state.movement.movementFunds + (c.fundsChange ?? 0));
      const newVolunteers = Math.max(100, state.movement.volunteerCount + (c.volunteersChange ?? 0));
      const newCrackdown = Math.max(0, Math.min(100, (state.crackdownLevel ?? 15) + (c.crackdownChange ?? 0)));
      const newStress = Math.max(0, Math.min(100, state.player.stress + (c.stressChange ?? 0)));
      const newEnergy = Math.max(0, Math.min(100, state.player.energy + (c.energyChange ?? 0)));

      return {
        ...state,
        activeCrisis: null,
        crackdownLevel: newCrackdown,
        player: {
          ...state.player,
          stress: newStress,
          energy: newEnergy,
        },
        movement: {
          ...state.movement,
          publicTrust: newTrust,
          movementFunds: newFunds,
          volunteerCount: newVolunteers,
        },
        journal: [
          {
            id: `JOURNAL-CRISIS-${Date.now()}`,
            date: { ...state.currentDate },
            title: `Crisis Encounter Resolved: ${crisis.title}`,
            text: `Selected directive: "${opt.label}". ${opt.description}`,
            significance: 'MILESTONE',
            associatedScreen: 'OPERATIONS',
          },
          ...state.journal,
        ],
      };
    }
    case 'TOGGLE_THEME': {
      const nextTheme = state.settings.theme === 'LIGHT' ? 'DARK' : 'LIGHT';
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: nextTheme,
        },
      };
    }
    case 'SET_THEME': {
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: action.theme,
        },
      };
    }
    case 'LOG_JOURNAL': {
      return {
        ...state,
        journal: [action.entry, ...state.journal],
      };
    }
    case 'FINISH_PROLOGUE': {
      soundManager.playChime();
      return {
        ...state,
        hasBegun: true,
        isPrologueComplete: true,
        clockSpeed: 1,
      };
    }

    case 'SET_SCREEN': {
      soundManager.playClick();
      return {
        ...state,
        activeScreen: action.screen,
      };
    }

    case 'SET_CLOCK_SPEED': {
      soundManager.playClick();
      return {
        ...state,
        clockSpeed: action.speed,
      };
    }

    case 'TOGGLE_SOUND': {
      return {
        ...state,
        settings: {
          ...state.settings,
          soundEnabled: action.enabled,
        },
      };
    }

    case 'REST_DAY': {
      soundManager.playPaper();
      const newEnergy = Math.min(100, state.player.energy + 35);
      const newStress = Math.max(5, state.player.stress - 25);
      const newHealth = Math.min(100, state.player.health + 5);

      // Advance one day as well
      return advanceSimulationDay({
        ...state,
        player: {
          ...state.player,
          energy: newEnergy,
          stress: newStress,
          health: newHealth,
        },
      });
    }

    case 'TOGGLE_EMPLOYMENT': {
      soundManager.playStamp();
      return {
        ...state,
        player: {
          ...state.player,
          employmentStatus: action.status,
        },
      };
    }

    case 'PERSONAL_TO_MOVEMENT_DONATION': {
      if (state.player.personalSavings < action.amount || action.amount <= 0) {
        return state;
      }
      soundManager.playPaper();
      const newTxn = {
        id: `TXN-${Date.now()}`,
        date: { ...state.currentDate },
        account: 'MOVEMENT' as const,
        type: 'INCOME' as const,
        category: 'Personal Founder Contribution',
        amount: action.amount,
        description: 'Personal savings transferred to movement operational fund',
        verified: true,
      };

      return {
        ...state,
        player: {
          ...state.player,
          personalSavings: state.player.personalSavings - action.amount,
        },
        movement: {
          ...state.movement,
          movementFunds: state.movement.movementFunds + action.amount,
        },
        transactions: [newTxn, ...state.transactions],
      };
    }

    case 'HIRE_STAFF': {
      const person = state.people.find(p => p.id === action.personId);
      if (!person) return state;
      soundManager.playStamp();

      return {
        ...state,
        people: state.people.map(p =>
          p.id === action.personId ? { ...p, isHired: true, morale: 90, workload: 30 } : p
        ),
        movement: {
          ...state.movement,
          coreStaffCount: state.movement.coreStaffCount + 1,
          monthlyBurnRate: state.movement.monthlyBurnRate + person.salaryMonthly,
        },
      };
    }

    case 'FIRE_STAFF': {
      const person = state.people.find(p => p.id === action.personId);
      if (!person) return state;
      soundManager.playPaper();

      return {
        ...state,
        people: state.people.map(p =>
          p.id === action.personId ? { ...p, isHired: false, currentAssignment: null } : p
        ),
        movement: {
          ...state.movement,
          coreStaffCount: Math.max(0, state.movement.coreStaffCount - 1),
          monthlyBurnRate: Math.max(10000, state.movement.monthlyBurnRate - person.salaryMonthly),
        },
      };
    }

    case 'ASSIGN_STAFF': {
      soundManager.playClick();
      return {
        ...state,
        people: state.people.map(p =>
          p.id === action.personId ? { ...p, currentAssignment: action.assignment } : p
        ),
      };
    }

    case 'OPERATION_DECISION': {
      const op = state.operations.find(o => o.id === action.operationId);
      if (!op) return state;

      soundManager.playClick();
      let updatedOp = { ...op };
      let trustGain = 0;
      let cost = 0;

      if (action.choice === 'SUPPLIES') {
        cost = 15000;
        if (state.movement.movementFunds >= cost) {
          updatedOp.suppliesWaterFood = Math.min(100, updatedOp.suppliesWaterFood + 30);
          updatedOp.crowdMorale = Math.min(100, updatedOp.crowdMorale + 10);
          updatedOp.dailyLog.push(`Procured emergency cold water tankers and glucose packets (-₹15,000).`);
        }
      } else if (action.choice === 'POLICE_TALKS') {
        updatedOp.policeNegotiationTension = Math.max(10, updatedOp.policeNegotiationTension - 25);
        updatedOp.policePermissionStatus = 'GRANTED';
        updatedOp.dailyLog.push(`Advocate Meera and delegation submitted compliant march perimeter map. Police tension eased.`);
        trustGain = 2;
      } else if (action.choice === 'MEDIA_SPEECH') {
        updatedOp.mediaCoverageLevel = Math.min(100, updatedOp.mediaCoverageLevel + 20);
        trustGain = 4;
        updatedOp.dailyLog.push(`Abhijeet addressed 14 regional and national reporters, articulating 5 core non-negotiable student demands.`);
      } else if (action.choice === 'MEDICAL_AID') {
        cost = 10000;
        updatedOp.medicalReadiness = Math.min(100, updatedOp.medicalReadiness + 35);
        updatedOp.dailyLog.push(`Dr. Nilesh Patil set up volunteer first-aid camp with heatstroke hydration beds.`);
      } else if (action.choice === 'MARCH_PARLIAMENT') {
        // High risk high reward
        if (updatedOp.policeNegotiationTension > 50) {
          soundManager.playAlert();
          updatedOp.policeNegotiationTension = 90;
          updatedOp.policePermissionStatus = 'SECTION_144_WARNING';
          updatedOp.crowdMorale = Math.max(30, updatedOp.crowdMorale - 15);
          updatedOp.dailyLog.push(`Barricades rushed at Tolstoy Marg. Police issued formal dispersal warning.`);
        } else {
          updatedOp.mediaCoverageLevel = 100;
          trustGain = 8;
          updatedOp.dailyLog.push(`Delegation submitted memorandum directly to Ministry of Personnel gate under heavy media spotlight.`);
        }
      }

      return {
        ...state,
        movement: {
          ...state.movement,
          movementFunds: Math.max(0, state.movement.movementFunds - cost),
          publicTrust: Math.min(100, state.movement.publicTrust + trustGain),
        },
        operations: state.operations.map(o => o.id === action.operationId ? updatedOp : o),
      };
    }

    case 'INVESTIGATION_ACTION': {
      const c = state.cases.find(x => x.id === action.caseId);
      if (!c) return state;

      let updatedCase = { ...c };
      let newReadiness = c.readinessPercentage;
      let cost = 0;

      if (action.action === 'RTI_FILING') {
        soundManager.playPaper();
        cost = 2500;
        newReadiness = Math.min(100, newReadiness + 15);
        updatedCase.currentStage = 'GATHERING_RECORDS';
      } else if (action.action === 'CORROBORATE_EVIDENCE') {
        soundManager.playPaper();
        cost = 8000;
        newReadiness = Math.min(100, newReadiness + 20);
        updatedCase.evidenceItems = updatedCase.evidenceItems.map(e => ({ ...e, isCorroborated: true }));
        updatedCase.currentStage = 'CORROBORATING';
      } else if (action.action === 'LEGAL_PETITION_HC') {
        soundManager.playGavel();
        cost = 25000;
        newReadiness = 100;
        updatedCase.currentStage = 'FILED_PIL';
        updatedCase.outcomeNotes = 'Admitted before High Court Division Bench. Formal notice issued to respondents with 3-week counter-affidavit deadline.';
      } else if (action.action === 'PUBLIC_EXPOSE') {
        soundManager.playChime();
        newReadiness = 100;
        updatedCase.currentStage = 'EXPOSED';
        updatedCase.outcomeNotes = 'Released full 48-page dossier with banking trails and encrypted chat logs at Constitution Club press briefing.';
      }

      updatedCase.readinessPercentage = newReadiness;

      return {
        ...state,
        movement: {
          ...state.movement,
          movementFunds: Math.max(0, state.movement.movementFunds - cost),
          publicTrust: Math.min(100, state.movement.publicTrust + (newReadiness === 100 ? 10 : 3)),
          mediaCredibility: Math.min(100, state.movement.mediaCredibility + (newReadiness === 100 ? 8 : 2)),
        },
        cases: state.cases.map(x => x.id === action.caseId ? updatedCase : x),
      };
    }

    case 'FORM_PARTY': {
      soundManager.playFanfare();
      return {
        ...state,
        party: {
          ...state.party,
          isFormed: true,
          partyName: action.partyName,
          abbreviation: action.abbreviation,
          symbol: action.symbol,
          registrationStatus: 'ECI_RECOGNIZED',
        },
        movement: {
          ...state.movement,
          hasFormedParty: true,
        },
        journal: [
          {
            id: `JOURNAL-${Date.now()}`,
            date: { ...state.currentDate },
            title: `Party Registered: ${action.partyName} (${action.abbreviation})`,
            text: `The Election Commission of India has formally recognized ${action.partyName} with the symbol "${action.symbol}". We enter electoral democracy not for power, but to deliver the accountability that street protests alone cannot enforce.`,
            significance: 'HISTORIC_TURNING_POINT',
            associatedScreen: 'PARTY_ECI',
          },
          ...state.journal,
        ],
      };
    }

    case 'NOMINATE_CANDIDATE': {
      soundManager.playStamp();
      const constItem = state.constituencies.find(c => c.id === action.constituencyId);
      if (!constItem) return state;

      const updatedConst: LokSabhaConstituency = {
        ...constItem,
        cjpCandidate: {
          name: action.candidateName,
          isCoreMember: true,
          localReputation: 75,
          campaignFundingAllocated: action.funding,
        },
      };

      const newCandidateCount = state.party.candidateCount + (constItem.cjpCandidate ? 0 : 1);

      return {
        ...state,
        constituencies: state.constituencies.map(c => c.id === action.constituencyId ? updatedConst : c),
        party: {
          ...state.party,
          candidateCount: newCandidateCount,
          projectedSeats: Math.floor(newCandidateCount * 0.35) + 3,
        },
      };
    }

    case 'TRIGGER_ELECTION': {
      soundManager.playGavel();
      return {
        ...state,
        activeScreen: 'ELECTION_NIGHT',
        electionLiveState: {
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

      const increment = 35; // count 35 seats per step
      const newCount = Math.min(543, live.countedSeatsCount + increment);
      const isFinished = newCount >= 543;

      // Realistic proportion computation
      const cjpRatio = (state.movement.publicTrust / 100) * (state.party.candidateCount / 543) * 0.45;
      const cjpSeats = Math.round(newCount * cjpRatio);
      const remaining = newCount - cjpSeats;
      const rulingSeats = Math.round(remaining * 0.47);
      const oppositionSeats = Math.round(remaining * 0.42);
      const otherSeats = remaining - rulingSeats - oppositionSeats;

      let leading = rulingSeats > oppositionSeats ? 'NDA' : 'INDIA';
      if (cjpSeats > rulingSeats && cjpSeats > oppositionSeats) leading = state.party.abbreviation;

      if (isFinished) {
        soundManager.playFanfare();
      } else {
        soundManager.playClick();
      }

      return {
        ...state,
        electionLiveState: {
          ...live,
          countedSeatsCount: newCount,
          rulingSeats,
          oppositionSeats,
          cjpSeats,
          otherSeats,
          leadingParty: leading,
          isCountingFinished: isFinished,
        },
        party: {
          ...state.party,
          actualSeatsWon: cjpSeats,
        },
      };
    }

    case 'FORM_COALITION': {
      soundManager.playStamp();
      const live = state.electionLiveState;
      const cjp = live.cjpSeats;
      let summary = '';
      let isRuling = false;

      if (action.partner === 'RULING') {
        isRuling = true;
        summary = `CJP entered Common Minimum Programme governance with ruling coalition (${live.rulingSeats + cjp} seats). Secured Ministries of Education & Youth, and Law.`;
      } else if (action.partner === 'OPPOSITION') {
        isRuling = true;
        summary = `CJP partnered with Opposition alliance (${live.oppositionSeats + cjp} seats) to form National Accountability Coalition government.`;
      } else {
        isRuling = false;
        summary = `CJP declined cabinet ministries and opted to lead an independent parliamentary watchdog bloc in opposition.`;
      }

      return {
        ...state,
        party: {
          ...state.party,
          isRulingCoalition: isRuling,
          isOppositionLead: !isRuling,
        },
        electionLiveState: {
          ...live,
          coalitionFormed: true,
          coalitionSummary: summary,
        },
        journal: [
          {
            id: `JOURNAL-COALITION-${Date.now()}`,
            date: { ...state.currentDate },
            title: 'Parliamentary Mandate & Coalition Government Formed',
            text: summary,
            significance: 'HISTORIC_TURNING_POINT',
            associatedScreen: 'GOVERNMENT',
          },
          ...state.journal,
        ],
      };
    }

    case 'TABLE_REFORM': {
      soundManager.playGavel();
      return {
        ...state,
        reforms: state.reforms.map(r =>
          r.id === action.reformId ? { ...r, status: 'TABLED_PARLIAMENT' } : r
        ),
      };
    }

    case 'LOBBY_REFORM': {
      soundManager.playStamp();
      return {
        ...state,
        reforms: state.reforms.map(r =>
          r.id === action.reformId ? { 
            ...r, 
            implementationProgress: Math.min(100, r.implementationProgress + 25),
            status: r.implementationProgress + 25 >= 100 ? 'PASSED_ACT' : r.status 
          } : r
        ),
      };
    }

    case 'DISMISS_DIALOGUE': {
      soundManager.playClick();
      return {
        ...state,
        activeDialogue: null,
      };
    }

    case 'LOAD_STATE': {
      return action.state;
    }

    case 'ADVANCE_DAY': {
      return advanceSimulationDay(state);
    }

    default:
      return state;
  }
}

/**
 * Daily simulation engine advance step
 */
export function advanceSimulationDay(state: GameState): GameState {
  const nextDate = { ...state.currentDate };
  const daysInCurMonth = getDaysInMonth(nextDate.year, nextDate.month);

  let isNewMonth = false;
  if (nextDate.day >= daysInCurMonth) {
    nextDate.day = 1;
    if (nextDate.month >= 12) {
      nextDate.month = 1;
      nextDate.year += 1;
    } else {
      nextDate.month += 1;
    }
    isNewMonth = true;
  } else {
    nextDate.day += 1;
  }

  const rng = new SeededRNG(state.seed + nextDate.year * 1000 + nextDate.month * 50 + nextDate.day);

  // 1. Personal Vitals Decay
  let newEnergy = Math.max(0, state.player.energy - (state.player.employmentStatus === 'FULL_TIME_JOB' ? 8 : 4));
  let newStress = state.player.stress;
  if (newEnergy < 20) {
    newStress = Math.min(100, newStress + 5);
  }
  let newHealth = state.player.stress > 80 ? Math.max(20, state.player.health - 3) : state.player.health;

  // Monthly personal salary & expenses
  let personalSavings = state.player.personalSavings;
  let movementFunds = state.movement.movementFunds;
  const newTransactions = [...state.transactions];

  if (isNewMonth) {
    // Living expenses
    personalSavings = Math.max(0, personalSavings - state.player.monthlyLivingCost);
    newTransactions.unshift({
      id: `TXN-RENT-${Date.now()}`,
      date: { ...nextDate },
      account: 'PERSONAL',
      type: 'EXPENSE',
      category: 'Living Expenses',
      amount: state.player.monthlyLivingCost,
      description: 'Monthly flat rent, groceries, electricity, and mobile bills',
      verified: true,
    });

    // Salary if employed
    if (state.player.employmentStatus === 'FULL_TIME_JOB') {
      personalSavings += state.player.salaryMonthly;
      newTransactions.unshift({
        id: `TXN-SALARY-${Date.now()}`,
        date: { ...nextDate },
        account: 'PERSONAL',
        type: 'INCOME',
        category: 'Job Salary',
        amount: state.player.salaryMonthly,
        description: 'Monthly salary credited',
        verified: true,
      });
    }

    // Movement staff salaries & office rent
    movementFunds = Math.max(0, movementFunds - state.movement.monthlyBurnRate);
    newTransactions.unshift({
      id: `TXN-BURN-${Date.now()}`,
      date: { ...nextDate },
      account: 'MOVEMENT',
      type: 'EXPENSE',
      category: 'Operational Overhead',
      amount: state.movement.monthlyBurnRate,
      description: 'Office rent, staff salaries, server costs, and legal retainer fees',
      verified: true,
    });
  }

  // Daily micro crowdfunding based on public trust
  const dailyDonationChance = rng.next();
  if (dailyDonationChance > 0.3) {
    const dailyDonationAmount = Math.floor((state.movement.publicTrust * 150) * (0.8 + rng.next() * 0.4));
    movementFunds += dailyDonationAmount;
    if (dailyDonationAmount > 5000 && rng.next() > 0.8) {
      newTransactions.unshift({
        id: `TXN-DONATION-${Date.now()}-${nextDate.day}`,
        date: { ...nextDate },
        account: 'MOVEMENT',
        type: 'INCOME',
        category: 'Crowdfunding',
        amount: dailyDonationAmount,
        description: `Citizen UPI micro-donations received for day ${formatDate(nextDate)}`,
        verified: true,
      });
    }
  }

  // 2. Operations Daily Progression
  const updatedOperations = state.operations.map(op => {
    if (op.status !== 'ACTIVE') return op;
    const newDay = op.currentDay + 1;
    const supplies = Math.max(0, op.suppliesWaterFood - 6);
    const tension = Math.min(100, Math.max(10, op.policeNegotiationTension + (supplies < 30 ? 4 : -1)));
    const crowdSize = Math.max(500, op.crowdSize + (supplies > 60 ? 80 : -50));
    const morale = Math.max(10, Math.min(100, op.crowdMorale + (supplies > 50 ? 1 : -4)));

    return {
      ...op,
      currentDay: newDay,
      suppliesWaterFood: supplies,
      policeNegotiationTension: tension,
      crowdSize,
      crowdMorale: morale,
      status: (newDay > op.durationDays ? 'CONCLUDED' : op.status) as OperationState['status'],
    };
  });

  // 3. Historical Archive Unlock Check
  const dateStr = `${nextDate.year}-${nextDate.month.toString().padStart(2, '0')}-${nextDate.day.toString().padStart(2, '0')}`;
  const updatedArchive = state.historicalArchive.map(disp => {
    if (disp.historicalDate <= dateStr) {
      return { ...disp, isUnlocked: true };
    }
    return disp;
  });

  // 4. Team Morale & Workload Updates
  const updatedPeople = state.people.map(p => {
    if (!p.isHired) return p;
    let morale = p.morale;
    if (p.workload > 70) morale = Math.max(10, morale - 2);
    if (morale < 30 && rng.next() > 0.95) {
      p.memories.push(`Exhausted from relentless work without proper rest on ${formatDate(nextDate)}`);
    }
    return { ...p, morale };
  });

  // 5. Turn & Action Points Reset
  const actionPoints = state.maxActionPoints ?? 3;

  // 6. Dynamic Crisis Event Roll (Every 3-4 days if no active crisis)
  let nextCrisis = state.activeCrisis;
  if (!nextCrisis && (nextDate.day === 3 || nextDate.day === 7 || nextDate.day === 12 || nextDate.day === 18 || nextDate.day === 24)) {
    const crisisIndex = (nextDate.day + nextDate.month) % CRISIS_EVENT_DECK.length;
    nextCrisis = CRISIS_EVENT_DECK[crisisIndex];
    soundManager.playCrisisSting();
  }

  // 7. Quests and Movement XP Progression
  const newVolunteers = Math.min(50000, state.movement.volunteerCount + Math.floor(state.movement.publicTrust * 0.4));
  let currentXp = state.movementXP ?? 320;

  const updatedQuests = (state.activeQuests || []).map(q => {
    if (q.id === 'QUEST-1') {
      const isNowComplete = newVolunteers >= q.targetProgress;
      if (isNowComplete && !q.isCompleted) {
        currentXp += q.rewardXP;
        soundManager.playLevelUp();
      }
      return {
        ...q,
        currentProgress: newVolunteers,
        isCompleted: isNowComplete,
      };
    }
    return q;
  });

  const newLevel = Math.min(5, Math.floor(currentXp / 1000) + 1);

  return {
    ...state,
    currentDate: nextDate,
    actionPoints,
    activeCrisis: nextCrisis,
    activeQuests: updatedQuests,
    movementXP: currentXp,
    movementLevel: newLevel,
    player: {
      ...state.player,
      energy: newEnergy,
      stress: newStress,
      health: newHealth,
      personalSavings,
      burnoutRisk: newStress > 85,
    },
    movement: {
      ...state.movement,
      movementFunds,
      volunteerCount: newVolunteers,
    },
    operations: updatedOperations,
    historicalArchive: updatedArchive,
    people: updatedPeople,
    transactions: newTransactions.slice(0, 100), // maintain clean memory
  };
}
