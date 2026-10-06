import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer, migrateState, SAVE_VERSION } from './engine';
import { parseSaveFile } from './persistence';
import { STORY_EVENTS } from '../data/story';
import { CRISIS_EVENT_DECK } from '../data/crises';
import type { GameState } from '../types';

// The save manager validates structure against today's createInitialState. These cases make sure
// states produced by the story, campaign, media and election systems still round-trip.
const roundTrip = (s: GameState) => parseSaveFile(JSON.stringify(s));

function play(days: number, seed = 3): GameState {
  let s = gameReducer(createInitialState('ABHIJEET_CJP', seed), { type: 'FINISH_PROLOGUE', focus: 'EXAMS' });
  s = { ...s, movement: { ...s.movement, movementFunds: 5_000_000 } };
  for (let d = 0; d < days; d++) {
    for (let g = 0; g < 10 && s.story.activeEventId; g++) {
      const ev = STORY_EVENTS.find(e => e.id === s.story.activeEventId)!;
      s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: ev.choices[ev.historicalChoice ?? 0].id });
    }
    if (s.activeCrisis) s = gameReducer(s, { type: 'RESOLVE_CRISIS', choiceId: s.activeCrisis.options[0].id });
    if (d % 3 === 0) s = gameReducer(s, { type: 'MEDIA_ACTION', kind: 'HASHTAG' });
    s = gameReducer({ ...s, gameOver: null, crackdownLevel: Math.min(s.crackdownLevel, 60) }, { type: 'ADVANCE_DAY' });
  }
  return s;
}

describe('save compatibility with the story/campaign/media systems', () => {
  const late = play(150);

  it('a long campaign (Act 2, campaigns, media feed, recruits) round-trips', () => {
    expect(late.story.act).toBe(2);
    expect(late.operations.length).toBeGreaterThan(0);
    expect(late.media.feed.length).toBeGreaterThan(0);
    const back = roundTrip(late);
    expect(back).not.toBeNull();
    expect(back!.story.choices).toEqual(late.story.choices);
    expect(back!.operations).toEqual(late.operations);
  });

  it('a state with an open story event or an open crisis round-trips', () => {
    expect(roundTrip({ ...late, story: { ...late.story, activeEventId: 'evt_0620_lights' } })).not.toBeNull();
    expect(roundTrip({ ...late, activeCrisis: CRISIS_EVENT_DECK.find(c => c.sensitive)! })).not.toBeNull();
    expect(roundTrip({ ...late, activeCrisis: CRISIS_EVENT_DECK[CRISIS_EVENT_DECK.length - 1] })).not.toBeNull();
  });

  it('a finished election and a game over round-trip', () => {
    let s: GameState = { ...late, movement: { ...late.movement, volunteerCount: 30000 } };
    s = gameReducer(s, { type: 'FORM_PARTY', partyName: 'CJP', abbreviation: 'CJP', symbol: 'x' });
    for (const c of s.constituencies.slice(0, 15)) s = gameReducer(s, { type: 'NOMINATE_CANDIDATE', constituencyId: c.id, candidateName: `C${c.id}`, funding: 10000 });
    s = gameReducer(s, { type: 'TRIGGER_ELECTION' });
    for (let i = 0; i < 20; i++) s = gameReducer(s, { type: 'STEP_ELECTION_COUNT' });
    expect(s.party.lastElectionDate).toBeDefined();
    expect(roundTrip(s)).not.toBeNull();
    const over: GameState = { ...s, gameOver: { kind: 'SEALED', victory: false, title: 't', text: 't', date: s.currentDate } };
    expect(roundTrip(over)).not.toBeNull();
  });

  it('an old v2-era save (no story, media, followers) loads and migrates', () => {
    const v2 = { ...createInitialState(), version: 2 } as Partial<GameState>;
    delete v2.story;
    delete v2.media;
    delete v2.govResponse;
    const back = roundTrip(v2 as GameState);
    expect(back).not.toBeNull();
    const migrated = migrateState(back!);
    expect(migrated.version).toBe(SAVE_VERSION);
    expect(migrated.story.act).toBe(1);
    expect(migrated.media.platforms.X).toBe('ACTIVE');
  });

  it('rejects saves from a newer engine version', () => {
    expect(roundTrip({ ...late, version: SAVE_VERSION + 1 })).toBeNull();
  });
});
