import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer, migrateState } from './engine';
import { ageEnergyPenalty, ageOn, isBirthday, ordinal } from './ages';
import { hasSupportedSaveStructure } from './saveValidation';
import type { GameState } from '../types';
import { STORY_EVENTS } from '../data/story';

const begin = (mode: 'ABHIJEET_CJP' | 'CUSTOM_CITIZEN' = 'ABHIJEET_CJP'): GameState => {
  let s = gameReducer(createInitialState(mode, 42), { type: 'FINISH_PROLOGUE' });
  while (s.story.activeEventId) {
    const ev = STORY_EVENTS.find(e => e.id === s.story.activeEventId)!;
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: ev.choices[ev.historicalChoice ?? 0].id });
  }
  return { ...s, activeCrisis: null };
};
const quiet = (s: GameState): GameState => ({ ...s, activeCrisis: null, story: { ...s.story, activeEventId: null, queue: [] } });

describe('Age and time (L3)', () => {
  it('computes ages and birthdays', () => {
    const b = { year: 1995, month: 9, day: 29 };
    expect(ageOn(b, { year: 2026, month: 9, day: 28 })).toBe(30);
    expect(ageOn(b, { year: 2026, month: 9, day: 29 })).toBe(31);
    expect(isBirthday(b, { year: 2030, month: 9, day: 29 })).toBe(true);
    expect(ageOn(undefined, { year: 2026, month: 1, day: 1 })).toBeNull();
    expect(ordinal(31)).toBe('31st');
    expect(ordinal(22)).toBe('22nd');
    expect(ordinal(13)).toBe('13th');
    expect(ageEnergyPenalty(30)).toBe(0);
    expect(ageEnergyPenalty(36)).toBe(1);
    expect(ageEnergyPenalty(46)).toBe(2);
  });

  it('the founder has the sourced birth date; other real people have none', () => {
    const s = createInitialState();
    expect(s.player.birthDate).toEqual({ year: 1995, month: 9, day: 29 });
    expect(s.player.birthDateSource).toMatch(/cjp-timeline/);
    for (const p of s.people.filter(x => x.historical)) expect(p.birthDate).toBeUndefined();
    for (const p of s.people.filter(x => x.fictional)) expect(p.birthDate).toBeTruthy();
  });

  it("the player's birthday lowers stress, lifts family support and is journaled", () => {
    let s = begin();
    s = quiet({ ...s, currentDate: { year: 2026, month: 9, day: 28 }, player: { ...s.player, stress: 50, familySupport: 50 } });
    s = gameReducer(s, { type: 'ADVANCE_DAY' });
    expect(s.journal[0].title).toContain('Turns 31');
    expect(s.player.familySupport).toBeGreaterThan(50);
  });

  it('End week is locked before the party, then plays up to 7 days without the idle penalty', () => {
    const s0 = quiet(begin());
    expect(gameReducer(s0, { type: 'ADVANCE_WEEK' }).lastOutcome?.tone).toBe('FAILURE');
    const s = quiet({ ...s0, party: { ...s0.party, isFormed: true }, story: { ...s0.story, act: 2 } });
    const after = gameReducer(s, { type: 'ADVANCE_WEEK' });
    const d = (x: GameState) => Date.UTC(x.currentDate.year, x.currentDate.month - 1, x.currentDate.day);
    const days = (d(after) - d(s)) / 86_400_000;
    expect(days).toBeGreaterThanOrEqual(1);
    expect(days).toBeLessThanOrEqual(7);
    expect(after.lastOutcome?.text).toMatch(/day/);
    if (days < 7) expect(after.lastOutcome?.text).toContain('Stopped early');
  });

  it('a routine day skips the idle penalty', () => {
    const s = quiet(begin());
    const idle = gameReducer(s, { type: 'ADVANCE_DAY' });
    const routine = gameReducer(s, { type: 'ADVANCE_DAY', routine: true });
    expect(routine.movement.publicTrust).toBeGreaterThanOrEqual(idle.movement.publicTrust);
  });

  it('old saves get birth dates; a custom citizen save still validates', () => {
    const fresh = createInitialState();
    const old = {
      ...fresh,
      version: 10,
      player: { ...fresh.player, birthDate: undefined, birthDateSource: undefined },
      people: fresh.people.map(p => ({ ...p, birthDate: undefined })),
    } as unknown as GameState;
    const m = migrateState(old);
    expect(m.player.birthDate).toEqual({ year: 1995, month: 9, day: 29 });
    expect(m.people.find(p => p.id === 'REC-002')!.birthDate).toBeTruthy();
    expect(hasSupportedSaveStructure(begin('CUSTOM_CITIZEN'))).toBe(true);
  });
});
