import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer, migrateState } from './engine';
import { SKILL_FADE_PER_MONTH, emptySkillProgress, fadeSkills, trainSkills, xpToNext } from './skills';
import type { GameState } from '../types';
import { STORY_EVENTS } from '../data/story';

const begin = (): GameState => {
  let s = gameReducer(createInitialState('ABHIJEET_CJP', 42), { type: 'FINISH_PROLOGUE' });
  while (s.story.activeEventId) {
    const ev = STORY_EVENTS.find(e => e.id === s.story.activeEventId)!;
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: ev.choices[ev.historicalChoice ?? 0].id });
  }
  return { ...s, activeCrisis: null };
};
const day = { year: 2026, month: 6, day: 1 };

describe('Skills grow by doing (L1)', () => {
  it('collects XP and levels up at the threshold, carrying the remainder', () => {
    const p = { ...createInitialState().player, research: 7, skillProgress: emptySkillProgress() };
    const a = trainSkills(p, { research: xpToNext(7) - 1 }, day);
    expect(a.player.research).toBe(7);
    expect(a.levelUps).toEqual([]);
    const b = trainSkills(a.player, { research: 5 }, day);
    expect(b.player.research).toBe(8);
    expect(b.player.skillProgress!.xp.research).toBe(4);
    expect(b.levelUps).toEqual(['Research rose to 8.']);
  });

  it('stops at 10', () => {
    const p = { ...createInitialState().player, communication: 9, skillProgress: emptySkillProgress() };
    const { player } = trainSkills(p, { communication: 10_000 }, day);
    expect(player.communication).toBe(10);
    expect(player.skillProgress!.xp.communication).toBe(0);
  });

  it('an RTI trains research; a refused action trains nothing', () => {
    const s = begin();
    const caseId = s.cases[0].id;
    const after = gameReducer(s, { type: 'INVESTIGATION_ACTION', caseId, action: 'RTI_FILING' });
    expect(after.player.skillProgress!.xp.research).toBeGreaterThan(s.player.skillProgress!.xp.research);

    // A PIL below the readiness threshold is refused: no AP spent, no practice
    const refused = gameReducer({ ...s, cases: s.cases.map(c => ({ ...c, readinessPercentage: 0 })) }, { type: 'INVESTIGATION_ACTION', caseId, action: 'LEGAL_PETITION_HC' });
    expect(refused.lastOutcome?.tone).toBe('FAILURE');
    expect(refused.player.skillProgress).toEqual(s.player.skillProgress);
  });

  it('a level-up is announced in the outcome toast', () => {
    const s = begin();
    const primed = { ...s, player: { ...s.player, research: 7, skillProgress: { ...s.player.skillProgress!, xp: { ...s.player.skillProgress!.xp, research: xpToNext(7) - 1 } } } };
    const after = gameReducer(primed, { type: 'INVESTIGATION_ACTION', caseId: s.cases[0].id, action: 'RTI_FILING' });
    expect(after.player.research).toBe(8);
    expect(after.lastOutcome?.text).toContain('Research rose to 8.');
  });

  it('unpractised skills lose progress monthly, but never a level', () => {
    const base = trainSkills({ ...createInitialState().player, skillProgress: emptySkillProgress() }, { organizing: 25 }, day).player;
    const soon = fadeSkills(base, { year: 2026, month: 6, day: 20 });
    expect(soon.skillProgress!.xp.organizing).toBe(25);
    const later = fadeSkills(base, { year: 2026, month: 8, day: 1 });
    expect(later.skillProgress!.xp.organizing).toBe(25 - SKILL_FADE_PER_MONTH);
    let p = later;
    for (let i = 0; i < 10; i++) p = fadeSkills(p, { year: 2026, month: 9 + (i % 3), day: 1 });
    expect(p.skillProgress!.xp.organizing).toBe(0);
    expect(p.organizing).toBe(base.organizing);
  });

  it('old saves get empty skill progress', () => {
    const fresh = createInitialState();
    const old = { ...fresh, version: 8, player: { ...fresh.player, skillProgress: undefined } } as unknown as GameState;
    expect(migrateState(old).player.skillProgress).toEqual(emptySkillProgress());
  });
});
