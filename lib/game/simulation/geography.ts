import type { GameState, LokSabhaConstituency, StateData } from '../types';
import type { SeededRNG } from './random';

/** L4: the movement spreads across the map. Volunteers settle into states, chapters grow and fade, seat support follows presence. */

/** Volunteers living in a state needed for chapter level 1, 2 and 3 */
export const CHAPTER_THRESHOLDS = [0, 300, 1500, 6000] as const;
export const CHAPTER_NAME = ['No chapter yet', 'Volunteer group', 'District offices', 'Mass movement'] as const;
/** A chapter shrinks after this many days with volunteers below a quarter of its level's threshold */
export const CHAPTER_DECLINE_DAYS = 45;
export const CHAPTER_DECLINE_SHARE = 0.25;
/** Seat support from presence alone stops here (same cap as grassroots blitzes) */
export const SUPPORT_CAP = 45;
/** Below this trust, support drains back towards what presence alone justifies */
export const SUPPORT_COLLAPSE_TRUST = 25;

const levelFor = (volunteers: number) => (volunteers >= CHAPTER_THRESHOLDS[3] ? 3 : volunteers >= CHAPTER_THRESHOLDS[2] ? 2 : volunteers >= CHAPTER_THRESHOLDS[1] ? 1 : 0);

/** How strongly a state pulls in volunteers */
function weight(st: StateData, avgSupport: number, activeOpStates: Set<string>): number {
  return 1 + st.cjpChapterLevel * 3 + (activeOpStates.has(st.name) ? 6 : 0) + avgSupport / 10 + st.seatsTotal / 20;
}

/** Where support in a seat is heading, given presence in its state and national trust */
export function supportTarget(state: GameState, c: LokSabhaConstituency, st: StateData | undefined): number {
  const chapter = st?.cjpChapterLevel ?? 0;
  const density = st ? Math.min(5, st.volunteerStrength / Math.max(1, st.seatsTotal * 80)) : 0;
  const mood = st?.regionalMood === 'REFORM_RECEPTIVE' ? 2 : st?.regionalMood === 'ANTI_INCUMBENCY' ? 1 : 0;
  return Math.max(0, Math.min(SUPPORT_CAP, Math.round(state.movement.publicTrust / 10 + chapter * 3 + density + mood)));
}

export interface GeographyDayResult {
  states: StateData[];
  constituencies: LokSabhaConstituency[];
  opened: { name: string; level: number }[];
  shrank: { name: string; level: number }[];
}

export function stepGeography(state: GameState, ctx: { rng: SeededRNG }): GeographyDayResult {
  const activeOpStates = new Set(state.operations.filter(o => o.status === 'ACTIVE').map(o => o.stateName));
  const seatsByState = new Map<string, LokSabhaConstituency[]>();
  for (const c of state.constituencies) {
    const list = seatsByState.get(c.state);
    if (list) list.push(c);
    else seatsByState.set(c.state, [c]);
  }
  const avg = (name: string) => {
    const seats = seatsByState.get(name) ?? [];
    return seats.length ? seats.reduce((n, c) => n + c.cjpSupportScore, 0) / seats.length : 0;
  };

  // 1. Volunteers settle where the movement is strongest
  const weights = state.states.map(st => weight(st, avg(st.name), activeOpStates));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const opened: GeographyDayResult['opened'] = [];
  const shrank: GeographyDayResult['shrank'] = [];
  const states = state.states.map((st, i) => {
    const target = Math.round((state.movement.volunteerCount * weights[i]) / total);
    const gap = target - st.volunteerStrength;
    const step = gap === 0 ? 0 : Math.sign(gap) * Math.max(1, Math.round(Math.abs(gap) * 0.1));
    const volunteerStrength = Math.max(0, st.volunteerStrength + step);

    // 2. Chapters grow with local volunteers (one level a day at most) and fade when neglected
    let level = st.cjpChapterLevel;
    let neglectDays = st.neglectDays ?? 0;
    if (levelFor(volunteerStrength) > level) {
      level = (level + 1) as StateData['cjpChapterLevel'];
      neglectDays = 0;
      opened.push({ name: st.name, level });
    } else if (level > 0 && volunteerStrength < CHAPTER_THRESHOLDS[level] * CHAPTER_DECLINE_SHARE) {
      neglectDays += 1;
      if (neglectDays >= CHAPTER_DECLINE_DAYS) {
        level = (level - 1) as StateData['cjpChapterLevel'];
        neglectDays = 0;
        shrank.push({ name: st.name, level });
      }
    } else {
      neglectDays = 0;
    }
    return { ...st, volunteerStrength, cjpChapterLevel: level, neglectDays };
  });

  // 3. Seat support follows presence: it rises towards the target, and only drains when trust collapses
  const byName = new Map(states.map(st => [st.name, st]));
  const collapsing = state.movement.publicTrust < SUPPORT_COLLAPSE_TRUST;
  const constituencies = state.constituencies.map(c => {
    const target = supportTarget(state, c, byName.get(c.state));
    const gap = target - c.cjpSupportScore;
    if (gap > 0 && ctx.rng.next() < Math.min(1, gap * 0.05)) return { ...c, cjpSupportScore: c.cjpSupportScore + 1 };
    if (gap < 0 && collapsing && ctx.rng.next() < Math.min(1, -gap * 0.03)) return { ...c, cjpSupportScore: c.cjpSupportScore - 1 };
    return c;
  });

  return { states, constituencies, opened, shrank };
}
