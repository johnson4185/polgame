import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer, BALANCE, GameAction, migrateState } from './engine';
import type { GameState } from '../types';

const begin = () => gameReducer(createInitialState('ABHIJEET_CJP', 42), { type: 'FINISH_PROLOGUE' });

const run = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state);

// Recursively freeze so any in-place mutation inside the reducer throws
function deepFreeze<T>(o: T): T {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) deepFreeze(v);
  }
  return o;
}

describe('purity', () => {
  it('never mutates the previous state', () => {
    let s = begin();
    const actions: GameAction[] = [
      { type: 'OPERATION_DECISION', operationId: 'OP-JANTAR-MANTAR', choice: 'SUPPLIES' },
      { type: 'INVESTIGATION_ACTION', caseId: 'CASE-EXAM-LEAK', action: 'CORROBORATE_EVIDENCE' },
      { type: 'ADVANCE_DAY' },
      { type: 'HIRE_STAFF', personId: 'REC-003' },
      { type: 'ADVANCE_DAY' },
    ];
    for (const a of actions) {
      deepFreeze(s);
      s = gameReducer(s, a);
    }
    expect(s.currentDate.day).toBe(3);
  });

  it('is deterministic for the same seed and actions', () => {
    const days: GameAction[] = Array.from({ length: 40 }, () => ({ type: 'ADVANCE_DAY' as const }));
    const strip = (s: GameState) => ({ ...s, activeCrisis: null });
    const a = run(begin(), ...days);
    const b = run(begin(), ...days);
    expect(strip(a)).toEqual(strip(b));
  });
});

describe('action points', () => {
  it('starts turn-based (clock paused) after the prologue', () => {
    expect(begin().clockSpeed).toBe(0);
  });

  it('enforces AP in the engine and refills them on a new day', () => {
    let s = begin();
    for (let i = 0; i < 3; i++) s = gameReducer(s, { type: 'FIELD_REST' });
    expect(s.actionPoints).toBe(0);
    const blocked = gameReducer(s, { type: 'LEGAL_AID' });
    expect(blocked.lastOutcome?.tone).toBe('FAILURE');
    expect(blocked.crackdownLevel).toBe(s.crackdownLevel);
    expect(gameReducer(s, { type: 'ADVANCE_DAY' }).actionPoints).toBe(s.maxActionPoints);
  });

  it('legal aid actually lowers crackdown and costs money', () => {
    const s = begin();
    const next = gameReducer(s, { type: 'LEGAL_AID' });
    expect(next.crackdownLevel).toBe(Math.max(0, s.crackdownLevel - 15));
    expect(next.movement.movementFunds).toBe(s.movement.movementFunds - BALANCE.legalAidCost);
  });

  it('blocks actions when exhausted', () => {
    const s = { ...begin(), player: { ...begin().player, energy: 5 } };
    expect(gameReducer(s, { type: 'LEGAL_AID' }).lastOutcome?.tone).toBe('FAILURE');
  });
});

describe('day advance', () => {
  it('does not advance while a crisis is open', () => {
    const s = gameReducer(begin(), { type: 'TRIGGER_CRISIS', crisis: { id: 'X', title: 't', urgency: 'HIGH', speakerName: '', speakerRole: '', speakerFaction: '', contextNarrative: '', quote: '', options: [] } });
    expect(gameReducer(s, { type: 'ADVANCE_DAY' })).toBe(s);
  });

  it('rolls into the next month and charges the burn rate', () => {
    let s = begin();
    s = { ...s, currentDate: { year: 2026, month: 6, day: 30 } };
    const before = s.movement.movementFunds;
    s = gameReducer(s, { type: 'ADVANCE_DAY' });
    expect(s.currentDate).toEqual({ year: 2026, month: 7, day: 1 });
    expect(s.transactions.some(t => t.category === 'Operational Overhead')).toBe(true);
    expect(s.movement.movementFunds).toBeLessThan(before + 20000);
  });
});

describe('investigations', () => {
  it('rejects a PIL below the readiness threshold', () => {
    const s = begin();
    const next = gameReducer(s, { type: 'INVESTIGATION_ACTION', caseId: 'CASE-PROCUREMENT-KICKBACK', action: 'LEGAL_PETITION_HC' });
    expect(next.lastOutcome?.tone).toBe('FAILURE');
    expect(next.cases).toEqual(s.cases);
  });

  it('cannot farm trust from a concluded case', () => {
    let s = begin();
    s = { ...s, cases: s.cases.map(c => (c.id === 'CASE-EXAM-LEAK' ? { ...c, currentStage: 'EXPOSED' as const } : c)) };
    const next = gameReducer(s, { type: 'INVESTIGATION_ACTION', caseId: 'CASE-EXAM-LEAK', action: 'RTI_FILING' });
    expect(next.movement.publicTrust).toBe(s.movement.publicTrust);
  });

  it('corroborates one evidence item at a time and advances QUEST-2', () => {
    const s = gameReducer(begin(), { type: 'INVESTIGATION_ACTION', caseId: 'CASE-EXAM-LEAK', action: 'CORROBORATE_EVIDENCE' });
    expect(s.activeQuests.find(q => q.id === 'QUEST-2')?.currentProgress).toBe(1);
  });
});

describe('party and election', () => {
  const richMovement = (s: GameState): GameState => ({
    ...s,
    movement: { ...s.movement, volunteerCount: 20000, movementFunds: 5_000_000 },
  });

  it('requires volunteers to register the party', () => {
    const s = gameReducer(begin(), { type: 'FORM_PARTY', partyName: 'P', abbreviation: 'P', symbol: 'x' });
    expect(s.party.isFormed).toBe(false);
  });

  it('runs a full election whose seats add up to 543', () => {
    let s = richMovement(begin());
    s = gameReducer(s, { type: 'FORM_PARTY', partyName: 'Cockroach Janta Party', abbreviation: 'CJP', symbol: 'x' });
    expect(s.party.isFormed).toBe(true);
    for (const c of s.constituencies.slice(0, 60)) {
      s = gameReducer(s, { type: 'NOMINATE_CANDIDATE', constituencyId: c.id, candidateName: `Cand ${c.id}`, funding: 20000 });
    }
    expect(s.party.candidateCount).toBe(60);
    // Can't nominate twice in the same seat
    const dup = gameReducer(s, { type: 'NOMINATE_CANDIDATE', constituencyId: s.constituencies[0].id, candidateName: 'Dup', funding: 0 });
    expect(dup.party.candidateCount).toBe(60);

    s = gameReducer(s, { type: 'TRIGGER_ELECTION' });
    for (let i = 0; i < 20; i++) s = gameReducer(s, { type: 'STEP_ELECTION_COUNT' });
    const live = s.electionLiveState;
    expect(live.isCountingFinished).toBe(true);
    expect(live.rulingSeats + live.oppositionSeats + live.cjpSeats + live.otherSeats).toBe(543);
    // Seats can only be won where the party fielded candidates
    expect(live.cjpSeats).toBeLessThanOrEqual(60);
    expect(s.party.actualSeatsWon).toBe(live.cjpSeats);
  });

  it('refuses a coalition that does not reach a majority', () => {
    let s = richMovement(begin());
    s = {
      ...s,
      party: { ...s.party, isFormed: true },
      electionLiveState: { ...s.electionLiveState, isCountingUnderway: false, isCountingFinished: true, rulingSeats: 200, oppositionSeats: 265, cjpSeats: 10, otherSeats: 68 },
    };
    const next = gameReducer(s, { type: 'FORM_COALITION', partner: 'RULING' });
    expect(next.lastOutcome?.tone).toBe('FAILURE');
    expect(next.electionLiveState.coalitionFormed).toBe(false);
    const ok = gameReducer(s, { type: 'FORM_COALITION', partner: 'OPPOSITION' });
    expect(ok.party.isRulingCoalition).toBe(true);
  });
});

describe('endings', () => {
  it('ends the campaign when crackdown hits 100 and then ignores gameplay', () => {
    let s = begin();
    s = { ...s, crackdownLevel: 95 };
    s = gameReducer(s, {
      type: 'TRIGGER_CRISIS',
      crisis: { id: 'X', title: 't', urgency: 'HIGH', speakerName: '', speakerRole: '', speakerFaction: '', contextNarrative: '', quote: '', options: [{ id: 'A', label: 'a', description: '', consequences: { crackdownChange: 10 } }] },
    });
    s = gameReducer(s, { type: 'RESOLVE_CRISIS', choiceId: 'A' });
    expect(s.gameOver?.kind).toBe('SEALED');
    expect(gameReducer(s, { type: 'ADVANCE_DAY' })).toBe(s);
  });

  it('ends after two insolvent months', () => {
    let s = begin();
    s = { ...s, movement: { ...s.movement, movementFunds: 0, publicTrust: 6, monthlyBurnRate: 10_000_000 } };
    for (let i = 0; i < 70 && !s.gameOver; i++) {
      s = gameReducer({ ...s, activeCrisis: null }, { type: 'ADVANCE_DAY' });
    }
    expect(s.gameOver).not.toBeNull();
  });
});

describe('save migration', () => {
  it('fills fields missing from version-1 saves', () => {
    const v1 = { ...createInitialState(), version: 1 } as Partial<GameState>;
    delete v1.lastOutcome;
    delete v1.gameOver;
    delete v1.insolventMonths;
    delete v1.idCounter;
    const migrated = migrateState(v1 as GameState);
    expect(migrated.version).toBe(2);
    expect(migrated.gameOver).toBeNull();
    expect(migrated.insolventMonths).toBe(0);
  });
});
