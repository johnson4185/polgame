// Headless balance simulation: plays full campaigns with scripted strategies across seeds,
// prints a summary table, and guards the intended difficulty curve.
// Print the table: npx vitest run balance.sim
import { it, expect } from 'vitest';
import { createInitialState, gameReducer, GameAction, BALANCE } from './engine';
import type { GameState } from '../types';

type Strategy = 'BALANCED' | 'RECKLESS' | 'PASSIVE';

function act(s: GameState, a: GameAction) {
  return gameReducer(s, a);
}

function playDay(s: GameState, strat: Strategy): GameState {
  // Resolve crisis: pick affordable option with best trust − crackdown trade-off
  if (s.activeCrisis) {
    const opts = s.activeCrisis.options.filter(o => (o.consequences.fundsChange ?? 0) >= -s.movement.movementFunds);
    const score = (o: (typeof opts)[0]) =>
      strat === 'RECKLESS'
        ? (o.consequences.trustChange ?? 0)
        : (o.consequences.trustChange ?? 0) - (o.consequences.crackdownChange ?? 0) * (s.crackdownLevel > 50 ? 1.5 : 0.5);
    const pick = opts.sort((a, b) => score(b) - score(a))[0] ?? s.activeCrisis.options[0];
    s = act(s, { type: 'RESOLVE_CRISIS', choiceId: pick.id });
    if (s.activeCrisis) s = { ...s, activeCrisis: null }; // unaffordable everything: skip
  }
  if (strat === 'PASSIVE') return act(s, { type: 'ADVANCE_DAY' });

  if (strat === 'BALANCED' && (s.player.energy < 25 || s.player.stress > 75)) return act(s, { type: 'REST_DAY' });

  for (let guard = 0; guard < 6 && s.actionPoints > 0 && !s.gameOver; guard++) {
    const before = s;
    const op = s.operations.find(o => o.status === 'ACTIVE');
    const openCase = s.cases.find(c => c.currentStage !== 'FILED_PIL' && c.currentStage !== 'EXPOSED');

    if (strat === 'BALANCED' && s.crackdownLevel > 55 && s.movement.movementFunds > 60000) {
      s = act(s, { type: 'LEGAL_AID' });
    } else if (op && op.suppliesWaterFood < 45 && s.movement.movementFunds > 40000) {
      s = act(s, { type: 'OPERATION_DECISION', operationId: op.id, choice: 'SUPPLIES' });
    } else if (op && strat === 'RECKLESS') {
      s = act(s, { type: 'OPERATION_DECISION', operationId: op.id, choice: 'MARCH_PARLIAMENT' });
    } else if (op && op.mediaCoverageLevel < 85) {
      s = act(s, { type: 'OPERATION_DECISION', operationId: op.id, choice: 'MEDIA_SPEECH' });
    } else if (s.electionLiveState.coalitionFormed && s.party.actualSeatsWon > 0) {
      const draft = s.reforms.find(r => r.status === 'DRAFT');
      const tabled = s.reforms.find(r => r.status === 'TABLED_PARLIAMENT');
      if (tabled && s.movement.movementFunds > 30000) s = act(s, { type: 'LOBBY_REFORM', reformId: tabled.id });
      else if (draft) s = act(s, { type: 'TABLE_REFORM', reformId: draft.id });
      else s = act(s, { type: 'FIELD_REST' });
    } else if (openCase && openCase.readinessPercentage >= BALANCE.pilMinReadiness && s.movement.movementFunds > 60000) {
      s = act(s, { type: 'INVESTIGATION_ACTION', caseId: openCase.id, action: 'LEGAL_PETITION_HC' });
    } else if (openCase && s.movement.movementFunds > 30000 && s.currentDate.day % 2 === 0) {
      s = act(s, { type: 'INVESTIGATION_ACTION', caseId: openCase.id, action: openCase.evidenceItems.some(e => !e.isCorroborated) ? 'CORROBORATE_EVIDENCE' : 'RTI_FILING' });
    } else {
      // Mini-games with an average performance (one of each per day), then grassroots campaigning
      const today = s.currentDate.year * 10000 + s.currentDate.month * 100 + s.currentDate.day;
      const game = s.miniGameLastPlayed?.RALLY !== today ? 'RALLY' : s.miniGameLastPlayed?.TV_DEBATE !== today ? 'TV_DEBATE' : null;
      if (game) {
        s = act(s, { type: 'OPEN_MINI_GAME', miniGame: game });
        if (s.activeMiniGame) {
          s = act(s, { type: 'FINISH_MINI_GAME', result: { score: 55, trustDelta: 15, fundsDelta: 13400, volunteersDelta: 640, xpDelta: 350, notes: 'sim' } });
        }
      } else if (s.party.isFormed) {
        const seat = s.constituencies.filter(c => c.cjpCandidate).sort((a, b) => a.cjpSupportScore - b.cjpSupportScore)[0];
        s = seat ? act(s, { type: 'BOOST_CONSTITUENCY', constituencyId: seat.id }) : act(s, { type: 'FIELD_REST' });
      } else {
        s = act(s, { type: 'FIELD_REST' });
      }
    }
    if (s === before || s.lastOutcome?.tone === 'FAILURE') break;
  }

  // Party & election milestones
  if (!s.party.isFormed) s = act(s, { type: 'FORM_PARTY', partyName: 'Cockroach Janta Party', abbreviation: 'CJP', symbol: 'x' });
  if (s.party.isFormed && !s.electionLiveState.isCountingUnderway && !s.electionLiveState.isCountingFinished) {
    const targets = [...s.constituencies]
      .filter(c => !c.cjpCandidate)
      .sort((a, b) => b.cjpSupportScore - a.cjpSupportScore)
      .slice(0, 3);
    for (const c of targets) {
      if (s.movement.movementFunds > 250000) {
        s = act(s, { type: 'NOMINATE_CANDIDATE', constituencyId: c.id, candidateName: `C${c.id}`, funding: 100000 });
      }
    }
    const elapsed = (s.currentDate.year - 2026) * 12 + s.currentDate.month - 6;
    if (elapsed >= 8 && s.party.candidateCount > 0) {
      s = act(s, { type: 'TRIGGER_ELECTION' });
      while (!s.electionLiveState.isCountingFinished) s = act(s, { type: 'STEP_ELECTION_COUNT' });
      for (const p of ['OPPOSITION', 'RULING', 'THIRD_FRONT'] as const) {
        if (!s.electionLiveState.coalitionFormed) s = act(s, { type: 'FORM_COALITION', partner: p });
      }
    }
  }
  return act(s, { type: 'ADVANCE_DAY' });
}

it('balance: strategies produce the intended outcomes', () => {
  const rows: string[] = [];
  const results: Record<Strategy, GameState[]> = { BALANCED: [], RECKLESS: [], PASSIVE: [] };
  for (const strat of ['BALANCED', 'RECKLESS', 'PASSIVE'] as Strategy[]) {
    for (const seed of [1, 2, 3, 4, 5]) {
      let s = gameReducer(createInitialState('ABHIJEET_CJP', seed), { type: 'FINISH_PROLOGUE' });
      let day = 0;
      let partyDay = -1;
      for (; day < 730 && !s.gameOver; day++) {
        s = playDay(s, strat);
        if (partyDay < 0 && s.party.isFormed) partyDay = day;
      }
      results[strat].push(s);
      rows.push(
        [
          strat.padEnd(8),
          `seed ${seed}`,
          `day ${String(day).padStart(3)}`,
          (s.gameOver?.kind ?? 'ongoing').padEnd(10),
          `trust ${String(s.movement.publicTrust).padStart(3)}`,
          `vol ${String(s.movement.volunteerCount).padStart(6)}`,
          `funds ${String(Math.round(s.movement.movementFunds / 1000)).padStart(5)}k`,
          `crack ${String(s.crackdownLevel).padStart(3)}`,
          `hp ${String(s.player.health).padStart(3)}`,
          `party@${partyDay}`,
          `cands ${s.party.candidateCount}`,
          `seats ${s.party.actualSeatsWon}`,
          `laws ${s.reforms.filter(r => r.status === 'PASSED_ACT').length}`,
        ].join(' | '),
      );
    }
  }
  console.log('\n' + rows.join('\n'));

  // Sensible play forms a party, wins seats, and usually (not always) wins the campaign
  expect(results.BALANCED.every(s => s.party.isFormed && s.party.actualSeatsWon > 0)).toBe(true);
  expect(results.BALANCED.filter(s => s.gameOver?.victory).length).toBeGreaterThanOrEqual(2);
  // Spamming the riskiest action gets the movement shut down; doing nothing never builds a party
  expect(results.RECKLESS.every(s => s.gameOver?.kind === 'SEALED')).toBe(true);
  expect(results.PASSIVE.every(s => !s.party.isFormed && !s.gameOver?.victory)).toBe(true);
}, 60_000);
