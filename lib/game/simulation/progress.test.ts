import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer, migrateState } from './engine';
import { PROGRESS_MONTHS, progressSnapshot, recordMonth, sinceStart } from './progress';
import type { GameState } from '../types';

const started = (): GameState => gameReducer(createInitialState('ABHIJEET_CJP', 42), { type: 'FINISH_PROLOGUE' });
const quiet = (s: GameState): GameState => ({ ...s, activeCrisis: null, story: { ...s.story, activeEventId: null, queue: [] } });

describe('Progress you can see (L6)', () => {
  it('takes a starting snapshot when the prologue ends', () => {
    const s = started();
    expect(s.progress?.start.date).toEqual(s.currentDate);
    expect(s.progress?.monthly).toEqual([]);
  });

  it('records a snapshot at the turn of each month', () => {
    let s = quiet(started());
    s = quiet({ ...s, currentDate: { year: 2026, month: 5, day: 31 } });
    s = gameReducer(s, { type: 'ADVANCE_DAY' });
    expect(s.progress!.monthly).toHaveLength(1);
    expect(s.progress!.monthly[0].date).toEqual({ year: 2026, month: 6, day: 1 });
  });

  it('keeps at most five years of months', () => {
    let s = started();
    for (let i = 0; i < PROGRESS_MONTHS + 5; i++) s = recordMonth(s);
    expect(s.progress!.monthly).toHaveLength(PROGRESS_MONTHS);
  });

  it('marks the founding anniversary with a look back', () => {
    let s = quiet(started());
    s = quiet({
      ...s,
      currentDate: { year: 2027, month: 5, day: 15 },
      movement: { ...s.movement, followers: s.movement.followers + 50000, volunteerCount: s.movement.volunteerCount + 4000 },
    });
    s = gameReducer(s, { type: 'ADVANCE_DAY' });
    const entry = s.journal.find(j => j.title === '1 Year of the Movement');
    expect(entry).toBeTruthy();
    expect(entry!.text).toMatch(/volunteers/);
  });

  it('summarises what changed since the start', () => {
    const s = started();
    const later = { ...s, movement: { ...s.movement, volunteerCount: s.movement.volunteerCount + 1000, publicTrust: 70 } };
    expect(sinceStart(later)).toMatch(/\+1,000 volunteers/);
    expect(sinceStart(later)).toMatch(/trust 70%/);
  });

  it('old saves compare against the campaign’s day-1 values', () => {
    const s = started();
    const old = { ...s, version: 13, progress: undefined } as unknown as GameState;
    const m = migrateState(old);
    expect(m.progress?.start).toEqual(progressSnapshot(createInitialState('ABHIJEET_CJP', s.seed)));
  });
});
