import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer, migrateState } from './engine';
import { MOOD_LIMIT, describeMood, initialMood, settleSeats, shiftStateMoods, stepMood, surfaceIssue } from './country';
import { SeededRNG } from './random';
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

describe('The country moves too (L5)', () => {
  it('anti-incumbency erodes the ruling alliance over the months, within limits', () => {
    const rng = new SeededRNG(5);
    let m = initialMood();
    for (let i = 0; i < 12; i++) m = stepMood(m, rng);
    expect(m.nda).toBeLessThan(0);
    expect(m.india).toBeGreaterThan(0);
    for (let i = 0; i < 100; i++) m = stepMood(m, rng);
    expect(m.nda).toBeGreaterThanOrEqual(-MOOD_LIMIT);
    expect(describeMood({ nda: -7, india: 3 })).toMatch(/Anti-incumbency is strong/);
  });

  it('an exposé that lands dents the government', () => {
    let s = begin();
    const c = s.cases[0];
    s = { ...s, cases: s.cases.map(x => (x.id === c.id ? { ...x, readinessPercentage: 100 } : x)) };
    const after = gameReducer(s, { type: 'INVESTIGATION_ACTION', caseId: c.id, action: 'PUBLIC_EXPOSE' });
    expect(after.cases.find(x => x.id === c.id)!.currentStage).toBe('EXPOSED');
    expect(after.nationalMood!.nda).toBeLessThan(s.nationalMood!.nda);
  });

  it('the monthly step runs in the daily simulation', () => {
    let s = begin();
    s = { ...s, currentDate: { year: 2026, month: 6, day: 30 }, story: { ...s.story, activeEventId: null, queue: [] } };
    const after = gameReducer(s, { type: 'ADVANCE_DAY' });
    expect(after.nationalMood).not.toEqual(s.nationalMood);
  });

  it('state moods shift, leaning anti-incumbent when the government is unpopular', () => {
    const s = createInitialState();
    const { states, changed } = shiftStateMoods(s, { nda: -12, india: 0 }, new SeededRNG(11));
    expect(changed.length).toBeGreaterThan(0);
    const anti = (xs: typeof states) => xs.filter(x => x.regionalMood === 'ANTI_INCUMBENCY').length;
    expect(anti(states)).toBeGreaterThanOrEqual(anti(s.states) - 3);
  });

  it('new grievances surface, and a state keeps at most four', () => {
    let states = createInitialState().states;
    const rng = new SeededRNG(3);
    for (let i = 0; i < 40; i++) states = surfaceIssue(states, rng).states;
    expect(states.every(st => st.dominantIssues.length <= 4)).toBe(true);
  });

  it('after an election seats change hands and baselines move halfway to the result', () => {
    const c = createInitialState().constituencies[0];
    const settled = settleSeats([
      {
        ...c,
        rulingVoteShareBaseline: 50,
        mainOppVoteShareBaseline: 30,
        electionResult: { winnerParty: 'INDIA', winnerCandidate: 'INDIA candidate', votesWon: 1, marginVotes: 1, cjpVotes: 0, cjpVoteShare: 0, rank: 0, rulingShare: 30, oppShare: 50 },
      },
    ])[0];
    expect(settled.incumbentParty).toBe('INDIA');
    expect(settled.rulingVoteShareBaseline).toBe(40);
    expect(settled.mainOppVoteShareBaseline).toBe(40);
  });

  it('old saves get a neutral national mood', () => {
    const fresh = createInitialState();
    const old = { ...fresh, version: 12, nationalMood: undefined } as unknown as GameState;
    expect(migrateState(old).nationalMood).toEqual({ nda: 0, india: 0 });
  });
});
