import type { GameState, ProgressSnapshot } from '../types';

/** L6: progress you can see. A snapshot at the start, then one a month, kept in the save. */

/** Months of history kept (five years) */
export const PROGRESS_MONTHS = 60;
/** The movement's founding day, celebrated every year */
export const FOUNDING = { month: 5, day: 16 } as const;

export function progressSnapshot(state: GameState): ProgressSnapshot {
  const seats = state.constituencies;
  const p = state.player;
  return {
    date: { ...state.currentDate },
    followers: state.movement.followers ?? 0,
    volunteers: state.movement.volunteerCount,
    trust: state.movement.publicTrust,
    funds: state.movement.movementFunds,
    chapters: state.states.filter(s => s.cjpChapterLevel > 0).length,
    teamSize: state.people.filter(x => x.isHired).length,
    seatsContested: seats.filter(c => c.cjpCandidate).length,
    seatsWon: state.party.actualSeatsWon,
    laws: state.reforms.filter(r => r.status === 'PASSED_ACT').length,
    avgSupport: seats.length ? Math.round((seats.reduce((n, c) => n + c.cjpSupportScore, 0) / seats.length) * 10) / 10 : 0,
    skillTotal: p.communication + p.organizing + p.research + p.negotiation + p.leadership + p.financialAcumen,
  };
}

export const startProgress = (state: GameState): NonNullable<GameState['progress']> => ({ start: progressSnapshot(state), monthly: [] });

export function recordMonth(state: GameState): GameState {
  const progress = state.progress ?? startProgress(state);
  return { ...state, progress: { ...progress, monthly: [...progress.monthly, progressSnapshot(state)].slice(-PROGRESS_MONTHS) } };
}

/** "+12,400 followers, 3 new chapters …" — what changed since the start, for the anniversary entry */
export function sinceStart(state: GameState): string {
  const start = state.progress?.start;
  if (!start) return '';
  const now = progressSnapshot(state);
  const parts: string[] = [];
  const d = (n: number) => (n >= 0 ? `+${n.toLocaleString('en-IN')}` : n.toLocaleString('en-IN'));
  parts.push(`${d(now.followers - start.followers)} followers`);
  parts.push(`${d(now.volunteers - start.volunteers)} volunteers`);
  if (now.chapters !== start.chapters) parts.push(`chapters in ${now.chapters} state${now.chapters === 1 ? '' : 's'}`);
  if (now.teamSize) parts.push(`a team of ${now.teamSize}`);
  if (now.seatsWon) parts.push(`${now.seatsWon} MP${now.seatsWon === 1 ? '' : 's'}`);
  if (now.laws) parts.push(`${now.laws} law${now.laws === 1 ? '' : 's'} passed`);
  parts.push(`trust ${now.trust}% (was ${start.trust}%)`);
  return parts.join(', ');
}
