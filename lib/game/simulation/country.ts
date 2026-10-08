import type { GameState, LokSabhaConstituency, NationalMood, StateData } from '../types';
import type { SeededRNG } from './random';

/** L5: the rest of the country moves too. National mood, shifting state moods, new local issues, seats changing hands. */

export const MOOD_LIMIT = 12;
/** Monthly anti-incumbency against the ruling alliance (vote-share points) */
export const ANTI_INCUMBENCY_PER_MONTH = 0.6;
/** Part of that the main opposition picks up */
export const OPPOSITION_GAIN_PER_MONTH = 0.7;
/** Random spread on top of the national mood on election day (each side, ±half of this) */
export const ELECTION_DAY_NOISE = 6;
/** How far seat baselines move towards an election's actual result */
export const BASELINE_SHIFT = 0.5;

export const initialMood = (): NationalMood => ({ nda: 0, india: 0 });

const clampMood = (v: number) => Math.max(-MOOD_LIMIT, Math.min(MOOD_LIMIT, Math.round(v * 10) / 10));

/** Plain-English reading of the mood for the screens */
export function describeMood(m: NationalMood): string {
  if (m.nda <= -6) return 'Anti-incumbency is strong: the NDA is losing ground fast.';
  if (m.nda <= -2) return 'Anti-incumbency is building against the NDA.';
  if (m.nda >= 3) return 'The NDA is riding high.';
  if (m.india >= 3) return 'INDIA is gaining momentum.';
  return 'The national mood is steady.';
}

/** Monthly national drift */
export function stepMood(m: NationalMood, rng: SeededRNG): NationalMood {
  return {
    nda: clampMood(m.nda - ANTI_INCUMBENCY_PER_MONTH + (rng.next() - 0.5) * 2),
    india: clampMood(m.india + OPPOSITION_GAIN_PER_MONTH + (rng.next() - 0.5) * 2),
  };
}

/** The government takes a hit (an exposé, an admitted PIL) */
export const dentGovernment = (m: NationalMood, points: number): NationalMood => ({ ...m, nda: clampMood(m.nda - points) });

const MOODS: StateData['regionalMood'][] = ['RULING_LEAN', 'ANTI_INCUMBENCY', 'VOLATILE', 'REFORM_RECEPTIVE'];

/** Quarterly: a few states change mood, nudged by the national mood and your chapters */
export function shiftStateMoods(state: GameState, mood: NationalMood, rng: SeededRNG): { states: StateData[]; changed: { name: string; mood: StateData['regionalMood'] }[] } {
  const changed: { name: string; mood: StateData['regionalMood'] }[] = [];
  const states = state.states.map(st => {
    if (rng.next() > 0.25) return st;
    const w = {
      RULING_LEAN: 1 + Math.max(0, mood.nda),
      ANTI_INCUMBENCY: 1 + Math.max(0, -mood.nda),
      VOLATILE: 1,
      REFORM_RECEPTIVE: 1 + st.cjpChapterLevel + state.movement.publicTrust / 30,
    };
    const total = MOODS.reduce((n, k) => n + w[k], 0);
    let roll = rng.next() * total;
    let pick: StateData['regionalMood'] = 'VOLATILE';
    for (const k of MOODS) {
      roll -= w[k];
      if (roll <= 0) {
        pick = k;
        break;
      }
    }
    if (pick === st.regionalMood) return st;
    changed.push({ name: st.name, mood: pick });
    return { ...st, regionalMood: pick };
  });
  return { states, changed };
}

/** Grievances that can surface anywhere */
export const ISSUE_POOL = [
  'Paper leaks in state recruitment exams',
  'Unpaid guest teachers',
  'Hospital beds and doctor shortages',
  'Road and bridge collapses',
  'Groundwater running dry',
  'Crop prices and farm debt',
  'Flood relief that never arrived',
  'Coaching-centre fees and safety',
  'Contract jobs with no security',
  'Power cuts in the summer',
  'Land acquisition disputes',
  'Delayed exam results',
];

/** Every couple of months a new grievance surfaces in one state (oldest drops off past four) */
export function surfaceIssue(states: StateData[], rng: SeededRNG): { states: StateData[]; surfaced: { name: string; issue: string } | null } {
  if (!states.length) return { states, surfaced: null };
  const st = states[Math.floor(rng.next() * states.length)];
  const fresh = ISSUE_POOL.filter(i => !st.dominantIssues.includes(i));
  if (!fresh.length) return { states, surfaced: null };
  const issue = fresh[Math.floor(rng.next() * fresh.length)];
  const dominantIssues = [...st.dominantIssues, issue].slice(-4);
  return { states: states.map(x => (x.code === st.code ? { ...x, dominantIssues } : x)), surfaced: { name: st.name, issue } };
}

/** After an election, seats change hands and baselines move towards what actually happened */
export function settleSeats(constituencies: LokSabhaConstituency[]): LokSabhaConstituency[] {
  return constituencies.map(c => {
    const r = c.electionResult;
    if (!r || r.rulingShare === undefined || r.oppShare === undefined) return c;
    return {
      ...c,
      incumbentParty: r.winnerParty,
      rulingVoteShareBaseline: Math.round(c.rulingVoteShareBaseline + (r.rulingShare - c.rulingVoteShareBaseline) * BASELINE_SHIFT),
      mainOppVoteShareBaseline: Math.round(c.mainOppVoteShareBaseline + (r.oppShare - c.mainOppVoteShareBaseline) * BASELINE_SHIFT),
    };
  });
}
