import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer, migrateState } from './engine';
import { PROMOTION_DAYS, QUIT_DAYS, QUIT_WARNING_DAYS, deskOf, personOutput, teamOutput } from './team';
import type { GameState, RecruitablePerson } from '../types';
import { STORY_EVENTS } from '../data/story';

const begin = (): GameState => {
  let s = gameReducer(createInitialState('ABHIJEET_CJP', 42), { type: 'FINISH_PROLOGUE' });
  while (s.story.activeEventId) {
    const ev = STORY_EVENTS.find(e => e.id === s.story.activeEventId)!;
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: ev.choices[ev.historicalChoice ?? 0].id });
  }
  return { ...s, activeCrisis: null };
};
// Advance a day with no story or crisis interruptions
const day = (s: GameState): GameState =>
  gameReducer({ ...s, activeCrisis: null, story: { ...s.story, activeEventId: null, queue: [] } }, { type: 'ADVANCE_DAY' });
const withPerson = (s: GameState, id: string, patch: Partial<RecruitablePerson>): GameState => ({
  ...s,
  people: s.people.map(p => (p.id === id ? { ...p, ...patch } : p)),
});
const KUNAL = 'REC-002';

describe('The team grows and changes (L2)', () => {
  it('maps assignments to desks; campaign titles count only while running', () => {
    expect(deskOf('Media room', [])).toBe('MEDIA');
    expect(deskOf('Jantar Mantar Legal Desk', [])).toBe('LEGAL');
    expect(deskOf('Something else entirely', [])).toBeNull();
    expect(deskOf(null, [])).toBeNull();
  });

  it('a person at a desk produces output; crowding a desk gives less each', () => {
    const p = { ...createInitialState().people.find(x => x.id === KUNAL)!, isHired: true, morale: 100 };
    const solo = personOutput(p, 'VOLUNTEERS', 0).volunteers;
    const second = personOutput(p, 'VOLUNTEERS', 1).volunteers;
    expect(solo).toBeGreaterThan(0);
    expect(second).toBeLessThan(solo);
    expect(personOutput({ ...p, rank: 'LEAD' }, 'VOLUNTEERS', 0).volunteers).toBe(solo * 2);
  });

  it('the fundraising desk raises money every day', () => {
    let s = begin();
    s = gameReducer(s, { type: 'HIRE_STAFF', personId: KUNAL });
    s = gameReducer(s, { type: 'ASSIGN_STAFF', personId: KUNAL, assignment: 'Fundraising' });
    expect(teamOutput(s).total.funds).toBeGreaterThan(0);
  });

  it('a campaign assignment drives workload up and morale down; a desk lets it recover', () => {
    let s = begin();
    s = gameReducer(s, { type: 'HIRE_STAFF', personId: KUNAL });
    // Pretend a campaign is running and Kunal is on it
    s = { ...s, operations: [{ ...(s.operations[0] ?? ({} as GameState['operations'][number])), id: 'OP-T', title: 'Test Vigil', status: 'ACTIVE', currentDay: 1, durationDays: 99 } as GameState['operations'][number]] };
    s = gameReducer(s, { type: 'ASSIGN_STAFF', personId: KUNAL, assignment: 'Test Vigil' });
    const m0 = s.people.find(p => p.id === KUNAL)!.morale;
    for (let i = 0; i < 20; i++) s = day(s);
    const k = s.people.find(p => p.id === KUNAL)!;
    expect(k.workload).toBeGreaterThan(70);
    expect(k.morale).toBeLessThan(m0);
  });

  it('warns after a week of misery, then they quit and the burn drops', () => {
    let s = begin();
    const lawyer = 'REC-001';
    s = gameReducer(s, { type: 'HIRE_STAFF', personId: lawyer });
    const burnHired = s.movement.monthlyBurnRate;
    s = withPerson(s, lawyer, { morale: 5, workload: 95, currentAssignment: null });
    let warned = false;
    for (let i = 0; i < QUIT_DAYS + 2; i++) {
      // keep them miserable
      s = withPerson(day(s), lawyer, { morale: 5 });
      if (s.lastOutcome?.text.includes('close to quitting')) warned = true;
    }
    const p = s.people.find(x => x.id === lawyer)!;
    expect(warned).toBe(true);
    expect(p.isHired).toBe(false);
    expect(s.movement.monthlyBurnRate).toBeLessThan(burnHired);
    expect(s.journal.some(j => j.title.includes('Left the Team'))).toBe(true);
    expect(QUIT_WARNING_DAYS).toBeLessThan(QUIT_DAYS);
  });

  it('promotion needs time served, then raises rank, pay and morale', () => {
    let s = begin();
    const lawyer = 'REC-001';
    s = gameReducer(s, { type: 'HIRE_STAFF', personId: lawyer });
    const early = gameReducer(s, { type: 'PROMOTE_STAFF', personId: lawyer });
    expect(early.lastOutcome?.tone).toBe('FAILURE');
    s = withPerson(s, lawyer, { daysServed: PROMOTION_DAYS.COORDINATOR, morale: 60 });
    const before = s.people.find(p => p.id === lawyer)!;
    s = gameReducer(s, { type: 'PROMOTE_STAFF', personId: lawyer });
    const after = s.people.find(p => p.id === lawyer)!;
    expect(after.rank).toBe('COORDINATOR');
    expect(after.salaryMonthly).toBeGreaterThan(before.salaryMonthly);
    expect(after.morale).toBe(75);
  });

  it('staff learn on the job: a skill point every 30 days at a desk', () => {
    let s = begin();
    s = gameReducer(s, { type: 'HIRE_STAFF', personId: KUNAL });
    s = gameReducer(s, { type: 'ASSIGN_STAFF', personId: KUNAL, assignment: 'Research desk' });
    const r0 = s.people.find(p => p.id === KUNAL)!.skills.research;
    for (let i = 0; i < 30; i++) s = day(s);
    expect(s.people.find(p => p.id === KUNAL)!.skills.research).toBe(r0 + 1);
  });

  it('new recruits appear once the movement is big enough, and not before', () => {
    let s = begin();
    const rohit = 'REC-L2-01';
    const locked = gameReducer(s, { type: 'HIRE_STAFF', personId: rohit });
    expect(locked.lastOutcome?.tone).toBe('FAILURE');
    s = { ...s, movement: { ...s.movement, volunteerCount: 5000 } };
    s = day(s);
    expect(s.people.find(p => p.id === rohit)!.availableSince).toBeTruthy();
    s = gameReducer(s, { type: 'HIRE_STAFF', personId: rohit });
    expect(s.people.find(p => p.id === rohit)!.isHired).toBe(true);
  });

  it('old saves gain the new recruits without duplicates', () => {
    const fresh = createInitialState();
    const old = { ...fresh, version: 9, people: fresh.people.filter(p => !p.unlockVolunteers) } as GameState;
    const migrated = migrateState(old);
    expect(migrated.people.filter(p => p.unlockVolunteers)).toHaveLength(6);
    expect(new Set(migrated.people.map(p => p.id)).size).toBe(migrated.people.length);
  });
});
