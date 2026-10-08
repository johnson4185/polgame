import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer } from './engine';
import { CHAPTER_DECLINE_DAYS, CHAPTER_THRESHOLDS, SUPPORT_CAP, stepGeography, supportTarget } from './geography';
import { SeededRNG } from './random';
import type { GameState } from '../types';

const base = (): GameState => ({ ...createInitialState('ABHIJEET_CJP', 7), hasBegun: true });
const rng = () => new SeededRNG(99);
const run = (s: GameState, days: number): GameState => {
  for (let i = 0; i < days; i++) {
    const g = stepGeography(s, { rng: rng() });
    s = { ...s, states: g.states, constituencies: g.constituencies };
  }
  return s;
};

describe('The movement spreads on the map (L4)', () => {
  it('national volunteers settle into states, and the totals roughly match', () => {
    let s = base();
    s = { ...s, movement: { ...s.movement, volunteerCount: 20000 } };
    s = run(s, 60);
    const spread = s.states.reduce((n, st) => n + st.volunteerStrength, 0);
    expect(spread).toBeGreaterThan(18000);
    expect(spread).toBeLessThan(22000);
  });

  it('states with a chapter or an active campaign attract more volunteers', () => {
    let s = base();
    s = {
      ...s,
      movement: { ...s.movement, volunteerCount: 20000 },
      states: s.states.map(st => (st.name === 'Bihar' ? { ...st, cjpChapterLevel: 2 } : st)),
    };
    s = run(s, 60);
    const bihar = s.states.find(st => st.name === 'Bihar')!.volunteerStrength;
    const jharkhand = s.states.find(st => st.name === 'Jharkhand')!.volunteerStrength;
    expect(bihar).toBeGreaterThan(jharkhand);
  });

  it('a chapter opens when enough local volunteers gather', () => {
    let s = base();
    s = { ...s, states: s.states.map(st => (st.name === 'Kerala' ? { ...st, volunteerStrength: CHAPTER_THRESHOLDS[1] + 50 } : st)) };
    // keep national volunteers high enough that Kerala doesn't drain below the threshold
    s = { ...s, movement: { ...s.movement, volunteerCount: 60000 } };
    const g = stepGeography(s, { rng: rng() });
    expect(g.states.find(st => st.name === 'Kerala')!.cjpChapterLevel).toBe(1);
    expect(g.opened).toContainEqual({ name: 'Kerala', level: 1 });
  });

  it('a neglected chapter shrinks after the decline period', () => {
    let s = base();
    s = {
      ...s,
      movement: { ...s.movement, volunteerCount: 0 },
      states: s.states.map(st => (st.name === 'Goa' ? { ...st, cjpChapterLevel: 2, volunteerStrength: 0 } : st)),
    };
    let shrank = false;
    for (let i = 0; i < CHAPTER_DECLINE_DAYS; i++) {
      const g = stepGeography(s, { rng: rng() });
      s = { ...s, states: g.states, constituencies: g.constituencies };
      if (g.shrank.some(x => x.name === 'Goa')) shrank = true;
    }
    expect(shrank).toBe(true);
    expect(s.states.find(st => st.name === 'Goa')!.cjpChapterLevel).toBe(1);
  });

  it('seat support rises towards presence, never past the cap, and only drains when trust collapses', () => {
    let s = base();
    s = {
      ...s,
      movement: { ...s.movement, publicTrust: 90 },
      states: s.states.map(st => (st.name === 'Bihar' ? { ...st, cjpChapterLevel: 3, volunteerStrength: 50000 } : st)),
    };
    const seat = s.constituencies.find(c => c.state === 'Bihar')!;
    const target = supportTarget(s, seat, s.states.find(st => st.name === 'Bihar'));
    expect(target).toBeLessThanOrEqual(SUPPORT_CAP);
    const before = seat.cjpSupportScore;
    s = run(s, 200);
    const after = s.constituencies.find(c => c.id === seat.id)!.cjpSupportScore;
    expect(after).toBeGreaterThanOrEqual(Math.min(before, target));
    if (target > before) expect(after).toBeGreaterThan(before);

    // Healthy trust: a seat above its target keeps its support
    const high = { ...s, constituencies: s.constituencies.map(c => (c.id === seat.id ? { ...c, cjpSupportScore: SUPPORT_CAP } : c)) };
    expect(run(high, 30).constituencies.find(c => c.id === seat.id)!.cjpSupportScore).toBe(SUPPORT_CAP);
    // Collapsing trust: it drains
    const collapsing = { ...high, movement: { ...high.movement, publicTrust: 10 } };
    expect(run(collapsing, 60).constituencies.find(c => c.id === seat.id)!.cjpSupportScore).toBeLessThan(SUPPORT_CAP);
  });

  it('runs inside the daily simulation and journals new chapters', () => {
    let s = gameReducer(createInitialState('ABHIJEET_CJP', 3), { type: 'FINISH_PROLOGUE' });
    s = {
      ...s,
      activeCrisis: null,
      story: { ...s.story, activeEventId: null, queue: [] },
      states: s.states.map(st => (st.name === 'Kerala' ? { ...st, volunteerStrength: 5000 } : st)),
      movement: { ...s.movement, volunteerCount: 80000 },
    };
    s = gameReducer(s, { type: 'ADVANCE_DAY' });
    expect(s.states.find(st => st.name === 'Kerala')!.cjpChapterLevel).toBeGreaterThanOrEqual(1);
    expect(s.journal.some(j => j.title.includes('Kerala'))).toBe(true);
    expect(s.movement.stateChaptersCount).toBe(s.states.filter(st => st.cjpChapterLevel > 0).length);
  });
});
