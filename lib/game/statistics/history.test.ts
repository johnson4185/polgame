import { describe, expect, it } from 'vitest';
import { createInitialState } from '@/lib/game/simulation/engine';
import { campaignKey, DailySnapshot, HISTORY_LIMIT, parseHistory, recentHistory, recordSnapshot, snapshot } from './history';

const point = (date: string, funds = 100): DailySnapshot => ({ date, funds, trust: 50, volunteers: 100, credibility: 40, legalHeat: 10 });

describe('observed campaign history', () => {
  it('replaces the current day without mutating history, and ignores unchanged UI updates', () => {
    const history = [Object.freeze(point('2026-06-01'))];
    const updated = recordSnapshot(history, point('2026-06-01', 250));
    expect(updated).toEqual([point('2026-06-01', 250)]);
    expect(history[0].funds).toBe(100);
    expect(recordSnapshot(updated, point('2026-06-01', 250))).toBe(updated);
  });

  it('prunes abandoned future dates when an older save is loaded', () => {
    const history = [point('2026-06-01'), point('2026-06-02'), point('2026-06-03')];
    expect(recordSnapshot(history, point('2026-06-02', 70)))
      .toEqual([point('2026-06-01'), point('2026-06-02', 70)]);
  });

  it('does not fabricate days between observations, including across month boundaries', () => {
    const history = [point('2026-05-29'), point('2026-05-31'), point('2026-06-05')];
    expect(recentHistory(history, 7)).toEqual(history.slice(1));
    expect(recentHistory(history, null)).toBe(history);
  });

  it('isolates campaigns by seed and mode, and captures actual engine totals', () => {
    const state = createInitialState('ABHIJEET_CJP', 7);
    expect(campaignKey(state)).not.toBe(campaignKey(createInitialState('ABHIJEET_CJP', 8)));
    expect(campaignKey(state)).not.toBe(campaignKey(createInitialState('CUSTOM_CITIZEN', 7)));
    expect(snapshot(state).funds).toBe(state.movement.movementFunds);
    expect(snapshot(state).legalHeat).toBe(state.crackdownLevel);
  });

  it('recovers from malformed storage and rejects invalid dates and values', () => {
    expect(parseHistory('{bad')).toEqual([]);
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory(JSON.stringify([
      point('2026-02-30'), { ...point('2026-06-01'), trust: 101 },
      { ...point('2026-06-01'), funds: '100' }, null,
      point('2026-06-02'), point('2026-06-01'), point('2026-06-02', 200),
    ]))).toEqual([point('2026-06-01'), point('2026-06-02', 200)]);
  });

  it('bounds stored history to two years of observations', () => {
    const history = Array.from({ length: HISTORY_LIMIT + 10 }, (_, index) =>
      point(new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10)));
    expect(parseHistory(JSON.stringify(history))).toHaveLength(HISTORY_LIMIT);
    const recorded = recordSnapshot(history, point('2030-01-01'));
    expect(recorded).toHaveLength(HISTORY_LIMIT);
    expect(recorded[recorded.length - 1].date).toBe('2030-01-01');
  });
});
