import type { GameDate, PlayerStats, SkillKey, SkillProgress } from '../types';

/** Learning by doing: actions train the matching skill; untouched skills slowly lose progress. */

export const SKILL_KEYS: SkillKey[] = ['communication', 'organizing', 'research', 'negotiation', 'leadership', 'financialAcumen'];
export const SKILL_LABEL: Record<SkillKey, string> = {
  communication: 'Communication',
  organizing: 'Organising',
  research: 'Research',
  negotiation: 'Negotiation',
  leadership: 'Leadership',
  financialAcumen: 'Finances',
};
export const SKILL_MAX = 10;
/** Days without practice before progress starts to fade */
export const SKILL_FADE_AFTER_DAYS = 45;
/** Progress lost each month by a skill left unpractised (never a whole level) */
export const SKILL_FADE_PER_MONTH = 10;

/** XP needed to go from `level` to `level + 1`: the higher you are, the slower it gets */
export const xpToNext = (level: number) => 30 * level;

const dayNumber = (d: GameDate) => Math.floor(Date.UTC(d.year, d.month - 1, d.day) / 86_400_000);

export function emptySkillProgress(): SkillProgress {
  const zero = Object.fromEntries(SKILL_KEYS.map(k => [k, 0])) as Record<SkillKey, number>;
  return { xp: { ...zero }, lastTrained: { ...zero } };
}

/**
 * Add practice to the player's skills. Returns the updated player and a line for each level gained.
 * `gains` may name several skills (e.g. a PIL trains research and negotiation).
 */
export function trainSkills(player: PlayerStats, gains: Partial<Record<SkillKey, number>>, today: GameDate): { player: PlayerStats; levelUps: string[] } {
  const progress = player.skillProgress ?? emptySkillProgress();
  const xp = { ...progress.xp };
  const lastTrained = { ...progress.lastTrained };
  const next: PlayerStats = { ...player };
  const levelUps: string[] = [];

  for (const key of SKILL_KEYS) {
    const gain = Math.max(0, Math.round(gains[key] ?? 0));
    if (!gain) continue;
    lastTrained[key] = dayNumber(today);
    let level = next[key];
    let pool = xp[key] + gain;
    while (level < SKILL_MAX && pool >= xpToNext(level)) {
      pool -= xpToNext(level);
      level += 1;
    }
    if (level >= SKILL_MAX) pool = 0;
    if (level > next[key]) levelUps.push(`${SKILL_LABEL[key]} rose to ${level}.`);
    next[key] = level;
    xp[key] = pool;
  }
  next.skillProgress = { xp, lastTrained };
  return { player: next, levelUps };
}

/** Monthly: skills not practised for a while lose some progress towards their next level. */
export function fadeSkills(player: PlayerStats, today: GameDate): PlayerStats {
  const progress = player.skillProgress ?? emptySkillProgress();
  const now = dayNumber(today);
  const xp = { ...progress.xp };
  let changed = false;
  for (const key of SKILL_KEYS) {
    // A skill never practised in this campaign has lastTrained 0, i.e. long ago
    if (now - progress.lastTrained[key] >= SKILL_FADE_AFTER_DAYS && xp[key] > 0) {
      xp[key] = Math.max(0, xp[key] - SKILL_FADE_PER_MONTH);
      changed = true;
    }
  }
  return changed ? { ...player, skillProgress: { ...progress, xp } } : player;
}
