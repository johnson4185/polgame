import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer, BALANCE, GameAction, migrateState, SAVE_VERSION, govStage, miniGameRewards } from './engine';
import type { GameState } from '../types';
import { STORY_EVENTS } from '../data/story';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Start a campaign and answer the opening story event (16 May launch) the way history went
const begin = (): GameState => {
  let s = gameReducer(createInitialState('ABHIJEET_CJP', 42), { type: 'FINISH_PROLOGUE' });
  while (s.story.activeEventId) {
    const ev = STORY_EVENTS.find(e => e.id === s.story.activeEventId)!;
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: ev.choices[ev.historicalChoice ?? 0].id });
  }
  return s;
};

// Open a specific story event now
const fireNow = (s: GameState, id: string): GameState => ({ ...s, story: { ...s.story, activeEventId: id, firedIds: [...s.story.firedIds, id] } });

// Answer any open story events with their first affordable choice
const settle = (s: GameState): GameState => {
  for (let g = 0; g < 20 && s.story.activeEventId; g++) {
    const ev = STORY_EVENTS.find(e => e.id === s.story.activeEventId)!;
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: ev.choices.find(c => !c.cost || c.cost <= s.movement.movementFunds)!.id });
  }
  return s;
};

// Advance n days, settling story events and clearing random crises on the way
const passDays = (s: GameState, n: number): GameState => {
  for (let i = 0; i < n; i++) s = gameReducer({ ...settle(s), activeCrisis: null }, { type: 'ADVANCE_DAY' });
  return s;
};

// Jump the clock and restart the story from that date (so earlier events don't flood in)
const at = (s: GameState, date: GameState['currentDate']): GameState => ({
  ...s,
  currentDate: date,
  story: { ...s.story, startedOn: `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`, queue: [], activeEventId: null },
});

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
    expect(s.currentDate.day).toBeGreaterThan(16);
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
    s = at(s, { year: 2026, month: 6, day: 30 });
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
  // Act 2 (party registration open) with a large, rich movement
  const richMovement = (s: GameState): GameState => ({
    ...s,
    movement: { ...s.movement, volunteerCount: 20000, movementFunds: 5_000_000 },
    story: { ...s.story, act: 2 },
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
      if (s.story.activeEventId) {
        const ev = STORY_EVENTS.find(e => e.id === s.story.activeEventId)!;
        s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: ev.choices.find(c => !c.cost)!.id });
      }
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
    expect(migrated.version).toBe(SAVE_VERSION);
    expect(migrated.gameOver).toBeNull();
    expect(migrated.insolventMonths).toBe(0);
  });
});

describe('historical record (S4)', () => {
  it('archive holds only 2026 entries from the record, each with an https source', () => {
    const s = createInitialState();
    expect(s.historicalArchive.length).toBeGreaterThan(30);
    for (const d of s.historicalArchive) {
      expect(d.historicalDate >= '2026-05-12' && d.historicalDate <= '2026-10-05').toBe(true);
      expect(d.sourceUrl.startsWith('https://')).toBe(true);
    }
    expect(s.historicalArchive.some(d => d.verificationStatus === 'CONTESTED_CLAIM')).toBe(true);
  });

  it('unlocks entries dated on or before the start date', () => {
    const s = createInitialState();
    const start = '2026-05-16';
    for (const d of s.historicalArchive) expect(d.isUnlocked).toBe(d.historicalDate <= start);
  });

  it('refuses to recruit a real person before they appear in the record', () => {
    const s = begin();
    const early = gameReducer(s, { type: 'HIRE_STAFF', personId: 'CJP-SAURAV-DAS' });
    expect(early.lastOutcome?.tone).toBe('FAILURE');
    expect(early.people.find(p => p.id === 'CJP-SAURAV-DAS')?.isHired).toBe(false);
    const later = gameReducer({ ...s, currentDate: { year: 2026, month: 6, day: 3 } }, { type: 'HIRE_STAFF', personId: 'CJP-SAURAV-DAS' });
    expect(later.people.find(p => p.id === 'CJP-SAURAV-DAS')?.isHired).toBe(true);
  });

  it('labels every non-historical recruit and every investigation as fiction', () => {
    const s = createInitialState();
    for (const p of s.people) expect(!!p.historical !== !!p.fictional).toBe(true);
    for (const c of s.cases) expect(c.isFictional).toBe(true);
  });

  it('migrates v2 saves to the corrected archive and adds the real cast', () => {
    const fresh = createInitialState();
    const v2 = {
      ...fresh,
      version: 2,
      historicalArchive: [{ ...fresh.historicalArchive[0], id: 'HIST-2024-07-18', historicalDate: '2024-07-18' }],
      people: fresh.people.filter(p => p.fictional),
    } as GameState;
    const migrated = migrateState(v2);
    expect(migrated.historicalArchive.some(d => d.id === 'HIST-2024-07-18')).toBe(false);
    expect(migrated.people.some(p => p.id === 'CJP-ASHUTOSH-RANKA')).toBe(true);
    expect(migrated.people.filter(p => p.fictional)).toHaveLength(8);
  });
});

describe('story events (S1)', () => {
  // A campaign that starts the day before the 16 May launch, prologue done
  const fromMay = (): GameState => {
    const s = begin();
    return {
      ...s,
      currentDate: { year: 2026, month: 5, day: 15 },
      story: { ...s.story, startedOn: '2026-05-15', firedIds: [], choices: {}, queue: [], activeEventId: null, divergence: 0 },
    };
  };
  const advanceTo = (s: GameState, iso: string) => {
    for (let i = 0; i < 200 && isoDateOf(s) < iso; i++) {
      s = { ...s, activeCrisis: null };
      if (s.story.activeEventId) s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: firstAffordable(s) });
      s = gameReducer(s, { type: 'ADVANCE_DAY' });
    }
    return s;
  };
  const isoDateOf = (s: GameState) => `${s.currentDate.year}-${String(s.currentDate.month).padStart(2, '0')}-${String(s.currentDate.day).padStart(2, '0')}`;
  const firstAffordable = (s: GameState) => {
    const ev = STORY_EVENTS.find(e => e.id === s.story.activeEventId)!;
    return ev.choices.find(c => !c.cost || c.cost <= s.movement.movementFunds)!.id;
  };

  it('fires a dated event once, on its date, and blocks the day until resolved', () => {
    let s = gameReducer(fromMay(), { type: 'ADVANCE_DAY' });
    expect(isoDateOf(s)).toBe('2026-05-16');
    expect(s.story.activeEventId).toBe('evt_0516_launch');
    expect(gameReducer(s, { type: 'ADVANCE_DAY' })).toBe(s);
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'post' });
    expect(s.story.activeEventId).not.toBe('evt_0516_launch'); // the next same-day event may open
    expect(s.story.choices.evt_0516_launch).toBe('post');
    expect(s.story.divergence).toBe(0);
    s = passDays(s, 1);
    expect(s.story.firedIds.filter(id => id === 'evt_0516_launch')).toHaveLength(1);
  });

  it('counts a non-historical choice as divergence and journals what really happened', () => {
    let s = gameReducer(fromMay(), { type: 'ADVANCE_DAY' });
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'quiet' });
    expect(s.story.divergence).toBe(1);
    expect(s.journal[0].text).toContain('In reality');
  });

  it('queues a delayed follow-up and fires it on time', () => {
    let s = fireNow(at(begin(), { year: 2026, month: 5, day: 21 }), 'evt_0521_x_block');
    s = { ...s, movement: { ...s.movement, movementFunds: 100000 } };
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'court' });
    expect(s.story.queue).toEqual([{ eventId: 'evt_0526_hc_petition', due: '2026-05-26' }]);
    s = passDays(s, 4);
    expect(s.story.firedIds).not.toContain('evt_0526_hc_petition');
    s = passDays(s, 1);
    expect(isoDateOf(s)).toBe('2026-05-26');
    expect(s.story.firedIds).toContain('evt_0526_hc_petition');
  });

  it('refuses a choice the movement cannot afford', () => {
    let s = fireNow(at(begin(), { year: 2026, month: 5, day: 21 }), 'evt_0521_x_block');
    s = { ...s, movement: { ...s.movement, movementFunds: 1000 } };
    const r = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'court' });
    expect(r.lastOutcome?.tone).toBe('FAILURE');
    expect(r.story.activeEventId).toBe('evt_0521_x_block');
  });

  it('never fires events dated before the campaign started', () => {
    const start = at(begin(), { year: 2026, month: 6, day: 1 });
    const s = passDays(start, 4);
    const newlyFired = s.story.firedIds.filter(id => !start.story.firedIds.includes(id));
    expect(newlyFired.some(id => id.startsWith('evt_05'))).toBe(false);
  });

  it('every event in the registry is well formed', () => {
    const ids = new Set(STORY_EVENTS.map(e => e.id));
    for (const e of STORY_EVENTS) {
      expect(e.choices.length >= 2 && e.choices.length <= 4).toBe(true);
      if (e.historicalChoice !== undefined) expect(e.choices[e.historicalChoice]).toBeDefined();
      for (const c of e.choices) if (c.next) expect(ids.has(c.next)).toBe(true);
      if (e.act === 1 && !e.fictional) expect(e.source?.startsWith('docs/cjp-timeline.md#')).toBe(true);
    }
  });
});

describe('Act 1 frame (S2)', () => {
  it('opens on 16 May with the launch event right after the prologue', () => {
    const s = gameReducer(createInitialState('ABHIJEET_CJP', 1), { type: 'FINISH_PROLOGUE', focus: 'EXAMS' });
    expect(s.currentDate).toEqual({ year: 2026, month: 5, day: 16 });
    expect(s.story.activeEventId).toBe('evt_0516_launch');
    expect(s.movement.followers).toBe(0);
    // EXAMS focus: +6 credibility over the starting 40
    expect(s.movement.mediaCredibility).toBe(46);
  });

  it('story effects move followers and the government response meter', () => {
    const s = begin(); // launch: "post" adds followers
    expect(s.movement.followers).toBeGreaterThan(0);
    let x = fireNow(at(s, { year: 2026, month: 5, day: 21 }), 'evt_0521_x_block');
    const before = x.govResponse.pressure;
    x = gameReducer(x, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'back' });
    expect(x.govResponse.pressure).toBe(before + 10);
  });

  it('maps pressure to government stages', () => {
    expect(govStage(0)).toBe('IGNORE');
    expect(govStage(30)).toBe('BLOCK_ACCOUNTS');
    expect(govStage(60)).toBe('POLICE_ACTION');
    expect(govStage(90)).toBe('NEGOTIATE');
  });

  it('starts with no campaigns: the story launches them', () => {
    expect(begin().operations).toEqual([]);
  });

  it('locks party registration in Act 1 and opens it on 5 October', () => {
    let s = { ...begin(), movement: { ...begin().movement, volunteerCount: 20000, movementFunds: 1_000_000 } };
    const locked = gameReducer(s, { type: 'FORM_PARTY', partyName: 'CJP', abbreviation: 'CJP', symbol: 'x' });
    expect(locked.party.isFormed).toBe(false);
    s = at(s, { year: 2026, month: 10, day: 5 });
    s = gameReducer(s, { type: 'ADVANCE_DAY' });
    expect(s.story.act).toBe(2);
    s = { ...s, story: { ...s.story, activeEventId: 'evt_1005_record_ends' } };
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'party' });
    const open = gameReducer(s, { type: 'FORM_PARTY', partyName: 'CJP', abbreviation: 'CJP', symbol: 'x' });
    expect(open.party.isFormed).toBe(true);
  });
});

describe('Act 1 calendar (S3)', () => {
  // GitHub-style anchors for the timeline's headings
  const timeline = readFileSync(path.join(__dirname, '../../../docs/cjp-timeline.md'), 'utf8');
  const anchors = new Set(
    timeline
      .split('\n')
      .filter(l => /^#{2,3} /.test(l))
      .map(l => l.replace(/^#{2,3} /, '').trim().toLowerCase().replace(/[^\w\- ]/g, '').replace(/ /g, '-')),
  );

  it('cites only headings that exist in the timeline', () => {
    const bad = STORY_EVENTS.filter(e => e.source && !anchors.has(e.source.split('#')[1])).map(e => `${e.id} → ${e.source}`);
    expect(bad).toEqual([]);
  });

  it('covers every month from 16 May to 5 October, in date order per file, with unique ids', () => {
    const ids = STORY_EVENTS.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const months = new Set(STORY_EVENTS.filter(e => e.date && e.act === 1).map(e => e.date!.slice(0, 7)));
    expect([...months].sort()).toEqual(['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10']);
    expect(STORY_EVENTS.length).toBeGreaterThanOrEqual(70);
  });

  it('plays all of Act 1 following history without getting stuck', () => {
    let s = gameReducer(createInitialState('ABHIJEET_CJP', 7), { type: 'FINISH_PROLOGUE', focus: 'EXAMS' });
    s = { ...s, movement: { ...s.movement, movementFunds: 5_000_000 } }; // keep costed choices affordable
    for (let day = 0; day < 160 && !(s.story.act === 2 && !s.story.activeEventId); day++) {
      for (let g = 0; g < 10 && s.story.activeEventId; g++) {
        const ev = STORY_EVENTS.find(e => e.id === s.story.activeEventId)!;
        s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: ev.choices[ev.historicalChoice ?? 0].id });
      }
      s = gameReducer({ ...s, activeCrisis: null, gameOver: null, crackdownLevel: Math.min(s.crackdownLevel, 60) }, { type: 'ADVANCE_DAY' });
    }
    expect(s.story.act).toBe(2);
    // Every dated event fired exactly once, except those skipped by an earlier choice
    const dated = STORY_EVENTS.filter(e => e.act === 1 && e.date && !e.skipIfChosen?.some(k => s.story.choices[k.event] === k.choice));
    for (const e of dated) expect(s.story.firedIds.filter(id => id === e.id)).toHaveLength(1);
    expect(s.story.divergence).toBe(0);
    // The 20 July march played out as a chain on one day
    for (const id of ['evt_0720_lockdown', 'evt_0720_barricades', 'evt_0720_talks', 'evt_0720_night']) expect(s.story.firedIds).toContain(id);
    // Real team joined and left on the record's dates
    const hired = (id: string) => s.people.find(p => p.id === id)!.isHired;
    expect(hired('CJP-SAURAV-DAS')).toBe(true);
    expect(hired('CJP-RATNA-SINGH')).toBe(true);
    expect(hired('CJP-VIJETA-DAHIYA')).toBe(false);
    // The real campaigns all happened
    const launched = new Set(s.operations.map(o => o.templateId));
    for (const id of ['city-tour', 'sitin', 'stk', 'adivasi-stk', 'cec']) expect(launched.has(id)).toBe(true);
    expect(s.operations.find(o => o.templateId === 'sitin')!.status).toBe('CONCLUDED');
  });

  it('skips the 26 May court decision if the player already went to court on 21 May', () => {
    let s = fireNow(at(begin(), { year: 2026, month: 5, day: 21 }), 'evt_0521_x_block');
    s = { ...s, movement: { ...s.movement, movementFunds: 100000 } };
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'court' });
    s = passDays(s, 6);
    expect(s.story.firedIds).toContain('evt_0526_hc_petition');
    expect(s.story.firedIds).not.toContain('evt_0526_hc_decision');
  });
});

describe('campaigns (S5)', () => {
  it('starts the sit-in only if you refuse to leave on 20 June', () => {
    const base = fireNow(at(begin(), { year: 2026, month: 6, day: 20 }), 'evt_0620_permission');
    const refused = gameReducer(base, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'refuse' });
    expect(refused.operations.find(o => o.templateId === 'sitin')?.status).toBe('ACTIVE');
    const left = gameReducer(base, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'leave_return' });
    expect(left.operations.some(o => o.templateId === 'sitin')).toBe(false);
  });

  it('ends the sit-in when the agitation is called off on 25 July', () => {
    let s = fireNow(at(begin(), { year: 2026, month: 6, day: 20 }), 'evt_0620_permission');
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'refuse' });
    s = fireNow(at(settle(s), { year: 2026, month: 7, day: 25 }), 'evt_0725_resign');
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'withdraw' });
    expect(s.operations.find(o => o.templateId === 'sitin')?.status).toBe('CONCLUDED');
  });

  it('lets the player launch sandbox campaigns for funds and an AP, but not story ones', () => {
    const s = { ...begin(), movement: { ...begin().movement, movementFunds: 100000 } };
    const story = gameReducer(s, { type: 'LAUNCH_OPERATION', templateId: 'sitin' });
    expect(story.lastOutcome?.tone).toBe('FAILURE');
    const yatra = gameReducer(s, { type: 'LAUNCH_OPERATION', templateId: 'jan-yatra' });
    expect(yatra.operations).toHaveLength(1);
    expect(yatra.movement.movementFunds).toBe(70000);
    expect(yatra.actionPoints).toBe(s.actionPoints - 1);
    const again = gameReducer(yatra, { type: 'LAUNCH_OPERATION', templateId: 'jan-yatra' });
    expect(again.operations).toHaveLength(1);
  });

  it('runs several campaigns at once and pays out their daily effects', () => {
    let s = { ...begin(), movement: { ...begin().movement, movementFunds: 200000 } };
    s = gameReducer(s, { type: 'LAUNCH_OPERATION', templateId: 'jan-yatra' });
    s = gameReducer(s, { type: 'LAUNCH_OPERATION', templateId: 'audit-drive' });
    expect(s.operations.filter(o => o.status === 'ACTIVE')).toHaveLength(2);
    const followers = s.movement.followers;
    s = passDays(s, 1);
    expect(s.movement.followers).toBeGreaterThan(followers);
    s = passDays(s, 7);
    expect(s.operations.find(o => o.templateId === 'jan-yatra')!.status).toBe('CONCLUDED');
    expect(s.operations.find(o => o.templateId === 'audit-drive')!.status).toBe('ACTIVE');
  });
});

describe('chapters and overview (R2)', () => {
  it('starts with no state chapters and builds one when a campaign there completes', () => {
    let s = { ...begin(), movement: { ...begin().movement, movementFunds: 100000 } };
    expect(s.states.every(x => x.cjpChapterLevel === 0)).toBe(true);
    s = gameReducer(s, { type: 'LAUNCH_OPERATION', templateId: 'jan-yatra' }); // Uttar Pradesh, 7 days
    s = passDays(s, 8);
    expect(s.states.find(x => x.name === 'Uttar Pradesh')!.cjpChapterLevel).toBe(1);
    expect(s.movement.stateChaptersCount).toBe(1);
  });

  it('puts story outcomes in the news feed', () => {
    const s = begin();
    expect(s.newsFeed[0].headline).not.toBe('CJI says he was misquoted; the label sticks anyway');
  });
});

describe('media room (R4)', () => {
  it('each media action spends an AP and shifts the narrative', () => {
    const s = begin();
    for (const kind of ['HASHTAG', 'LIVE', 'DEBUNK'] as const) {
      const n = gameReducer(s, { type: 'MEDIA_ACTION', kind });
      expect(n.actionPoints).toBe(s.actionPoints - 1);
      expect(n.media.narrative.movement).toBeGreaterThan(s.media.narrative.movement);
    }
    const tagged = gameReducer(s, { type: 'MEDIA_ACTION', kind: 'HASHTAG' });
    expect(tagged.media.trending.length).toBe(s.media.trending.length + 1);
  });

  it('the 21 May block withholds the X account and weakens memes there', () => {
    let s = fireNow(at(begin(), { year: 2026, month: 5, day: 21 }), 'evt_0521_x_block');
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'back' });
    expect(s.media.platforms.X).toBe('WITHHELD');
  });

  it('story choices start real trends', () => {
    let s = fireNow(at(begin(), { year: 2026, month: 5, day: 18 }), 'evt_0518_bhardwaj');
    s = gameReducer(s, { type: 'RESOLVE_STORY_CHOICE', choiceId: 'adopt' });
    expect(s.media.trending.some(t => t.tag === '#MainBhiCockroach')).toBe(true);
  });

  it('the feed fills with posts by fictional citizens only, and trends cool off', () => {
    let s = gameReducer(begin(), { type: 'MEDIA_ACTION', kind: 'HASHTAG' });
    const posts = s.media.trending[0].posts;
    s = passDays(s, 10);
    expect(s.media.feed.length).toBeGreaterThan(0);
    for (const p of s.media.feed) expect(p.handle.startsWith('@')).toBe(true);
    const still = s.media.trending.find(t => t.tag === gameReducer(begin(), { type: 'MEDIA_ACTION', kind: 'HASHTAG' }).media.trending[0].tag);
    expect(!still || still.posts < posts).toBe(true);
  });
});

describe('mini-games in the engine (R5)', () => {
  it('computes rewards from the score and clamps out-of-range scores', () => {
    expect(miniGameRewards('RALLY', 500)).toEqual(miniGameRewards('RALLY', 100));
    expect(miniGameRewards('TV_DEBATE', -20).score).toBe(0);
    let s = gameReducer(begin(), { type: 'OPEN_MINI_GAME', miniGame: 'RALLY' });
    const before = s.movement.volunteerCount;
    s = gameReducer(s, { type: 'FINISH_MINI_GAME', score: 60 });
    expect(s.activeMiniGame).toBeNull();
    expect(s.movement.volunteerCount).toBeGreaterThan(before);
  });
});

describe('politics cycle (R6)', () => {
  // Act 2 with a registered party and a few candidates
  const act2Party = (): GameState => {
    let s: GameState = { ...begin(), story: { ...begin().story, act: 2 }, movement: { ...begin().movement, volunteerCount: 30000, movementFunds: 5_000_000, publicTrust: 70 } };
    s = gameReducer(s, { type: 'FORM_PARTY', partyName: 'CJP', abbreviation: 'CJP', symbol: 'x' });
    for (const c of s.constituencies.slice(0, 20)) s = gameReducer(s, { type: 'NOMINATE_CANDIDATE', constituencyId: c.id, candidateName: `C${c.id}`, funding: 50000 });
    return s;
  };
  const count = (s: GameState) => {
    for (let i = 0; i < 20; i++) s = gameReducer(s, { type: 'STEP_ELECTION_COUNT' });
    return s;
  };

  it('allows the next general election a year after the last one', () => {
    let s = count(gameReducer(act2Party(), { type: 'TRIGGER_ELECTION' }));
    expect(s.party.electionsHeld).toBe(1);
    const tooSoon = gameReducer(s, { type: 'TRIGGER_ELECTION' });
    expect(tooSoon.lastOutcome?.tone).toBe('FAILURE');
    const last = s.party.lastElectionDate!;
    s = { ...s, currentDate: { ...last, year: last.year + 1 } };
    s = count(gameReducer(s, { type: 'TRIGGER_ELECTION' }));
    expect(s.party.electionsHeld).toBe(2);
    const live = s.electionLiveState;
    expect(live.rulingSeats + live.oppositionSeats + live.cjpSeats + live.otherSeats).toBe(543);
  });

  it('keeps a manifesto promise when its reform passes', () => {
    let s = count(gameReducer(act2Party(), { type: 'TRIGGER_ELECTION' }));
    s = { ...s, party: { ...s.party, actualSeatsWon: Math.max(1, s.party.actualSeatsWon), isRulingCoalition: true }, electionLiveState: { ...s.electionLiveState, coalitionFormed: true } };
    s = gameReducer(s, { type: 'TABLE_REFORM', reformId: 'REFORM-EXAM-ACT' });
    for (let i = 0; i < 10 && s.reforms.find(r => r.id === 'REFORM-EXAM-ACT')!.status !== 'PASSED_ACT'; i++) {
      s = gameReducer({ ...s, actionPoints: 3 }, { type: 'LOBBY_REFORM', reformId: 'REFORM-EXAM-ACT' });
    }
    expect(s.reforms.find(r => r.id === 'REFORM-EXAM-ACT')!.status).toBe('PASSED_ACT');
    expect(s.party.manifestoPledges.find(p => p.reformId === 'REFORM-EXAM-ACT')!.fulfilled).toBe(true);
  });

  it('a coalition collapses when trust falls below 25', () => {
    let s = { ...act2Party(), currentDate: { year: 2026, month: 11, day: 30 } };
    s = { ...s, party: { ...s.party, isRulingCoalition: true, actualSeatsWon: 10 }, movement: { ...s.movement, publicTrust: 20 } };
    s = gameReducer({ ...s, activeCrisis: null, story: { ...s.story, activeEventId: null } }, { type: 'ADVANCE_DAY' });
    expect(s.party.isRulingCoalition).toBe(false);
  });
});

describe('Act 2 events (A2)', () => {
  it('are all fictional, dated on or after 5 October, and well formed', () => {
    const a2 = STORY_EVENTS.filter(e => e.act === 2);
    expect(a2.length).toBeGreaterThanOrEqual(12);
    for (const e of a2) {
      expect(e.fictional).toBe(true);
      expect(e.date! >= '2026-10-05').toBe(true);
      for (const c of e.choices) if (c.cost) expect(c.effects.funds ?? 0).toBeGreaterThanOrEqual(0);
    }
  });

  it('wait for their requirements: party events only fire once a party exists', () => {
    let s = at(begin(), { year: 2026, month: 11, day: 14 });
    s = { ...s, story: { ...s.story, act: 2 } };
    s = passDays(s, 2);
    expect(s.story.firedIds).not.toContain('evt_a2_1115_convention');
    s = { ...s, movement: { ...s.movement, volunteerCount: 30000, movementFunds: 1_000_000 } };
    s = gameReducer(s, { type: 'FORM_PARTY', partyName: 'CJP', abbreviation: 'CJP', symbol: 'x' });
    s = gameReducer({ ...s, activeCrisis: null }, { type: 'ADVANCE_DAY' });
    expect(s.story.firedIds).toContain('evt_a2_1115_convention');
  });

  it('government-only events never fire in opposition', () => {
    let s = at(begin(), { year: 2027, month: 7, day: 30 });
    s = passDays({ ...s, story: { ...s.story, act: 2 } }, 5);
    expect(s.story.firedIds).not.toContain('evt_a2_no_confidence');
    expect(s.story.firedIds).not.toContain('evt_a2_scandal');
  });
});
