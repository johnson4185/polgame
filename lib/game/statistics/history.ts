import type { GameDate, GameState } from '@/lib/game/types';

export const HISTORY_LIMIT = 730;
export const METRICS = ['funds', 'followers', 'trust', 'volunteers', 'credibility', 'legalHeat'] as const;
export type Metric = typeof METRICS[number];
export type DailySnapshot = Record<Metric, number> & { date: string };

export function dateKey(date: GameDate): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

export function campaignKey(state: GameState): string {
  return `republic543_statistics_v1_${state.player.campaignMode}_${state.seed}`;
}

export function snapshot(state: GameState): DailySnapshot {
  return {
    date: dateKey(state.currentDate),
    funds: state.movement.movementFunds,
    followers: state.movement.followers ?? 0,
    trust: state.movement.publicTrust,
    volunteers: state.movement.volunteerCount,
    credibility: state.movement.mediaCredibility,
    legalHeat: state.crackdownLevel,
  };
}

/** Keep the last observation per date. Loading an earlier save discards its future. */
export function recordSnapshot(history: DailySnapshot[], current: DailySnapshot): DailySnapshot[] {
  const last = history[history.length - 1];
  if (last?.date === current.date && METRICS.every(metric => last[metric] === current[metric])) return history;
  return [...history.filter(item => item.date < current.date), current].slice(-HISTORY_LIMIT);
}

export function parseHistory(raw: string | null): DailySnapshot[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? 'null');
    if (!Array.isArray(parsed)) return [];
    const valid = parsed.filter((item): item is DailySnapshot => {
      if (!item || typeof item !== 'object' || typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) return false;
      const time = Date.parse(`${item.date}T00:00:00Z`);
      return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === item.date
        && METRICS.every(metric => typeof item[metric] === 'number' && Number.isFinite(item[metric]) && item[metric] >= 0)
        && item.trust <= 100 && item.credibility <= 100 && item.legalHeat <= 100;
    });
    // Normalize unsorted or duplicated records without trusting browser storage.
    return [...new Map(valid.map(item => [item.date, item])).values()]
      .sort((a, b) => a.date.localeCompare(b.date)).slice(-HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function recentHistory(history: DailySnapshot[], days: number | null): DailySnapshot[] {
  if (!days || !history.length) return history;
  const end = Date.parse(`${history[history.length - 1].date}T00:00:00Z`);
  const start = end - (days - 1) * 86400000;
  return history.filter(item => Date.parse(`${item.date}T00:00:00Z`) >= start);
}
