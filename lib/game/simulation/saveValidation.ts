import { createInitialState, migrateState } from './engine';
import { CRISIS_EVENT_DECK } from '../data/crises';
import type { GameState } from '../types';

const optional = new Set([
  'portraitUrl', 'historical', 'fictional', 'joinDate', 'source', 'donorName',
  'outcomeSummary', 'outcomeNotes', 'isFictional', 'cjpCandidate', 'electionResult',
  'sensitive', 'associatedScreen', 'coalitionSummary', 'miniGameLastPlayed', 'theme',
  // living world (L2, L3): only some people have these
  'birthDate', 'birthDateSource', 'rank', 'daysServed', 'lowMoraleDays', 'unlockVolunteers', 'availableSince',
]);
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const date = { year: 2026, month: 1, day: 1 };
const extraShapes: Record<string, unknown> = {
  activeCrisis: CRISIS_EVENT_DECK[0],
  activeDialogue: { id: '', speakerName: '', speakerRole: '', text: '', options: [{ label: '', consequenceHint: '', actionPayload: '' }] },
  gameOver: { kind: '', victory: false, title: '', text: '', date },
  lastOutcome: { id: 0, text: '', tone: '' },
  cjpCandidate: { name: '', isCoreMember: false, localReputation: 0, campaignFundingAllocated: 0 },
  electionResult: { winnerParty: '', winnerCandidate: '', votesWon: 0, marginVotes: 0, cjpVotes: 0, cjpVoteShare: 0, rank: 0 },
  joinDate: date,
  birthDate: date,
  availableSince: date,
};
let template: GameState | undefined;

/** Check the structural fields consumed by screens without imposing today's balance rules. */
function matches(value: unknown, example: unknown, key = '', depth = 0): boolean {
  if (depth > 30) return false;
  if (value === null && ['currentAssignment', 'activeOperationId', 'activeCrisis', 'activeDialogue', 'gameOver', 'lastOutcome'].includes(key)) return true;
  if (key === 'consequences' || key === 'miniGameLastPlayed') return record(value) && Object.values(value).every(item => typeof item === 'number' && Number.isFinite(item));
  if (key in extraShapes && value !== null) example = extraShapes[key];
  if (example === null) return value === null || typeof value === 'string';
  if (typeof example === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (Array.isArray(example)) {
    return Array.isArray(value) && (!example.length || value.every(item => matches(item, example[0], '', depth + 1)));
  }
  if (record(example)) {
    if (!record(value)) return false;
    if (!Object.entries(example).every(([field, sample]) => value[field] === undefined && optional.has(field)
      || matches(value[field], sample, field, depth + 1))) return false;
    return Object.keys(extraShapes).every(field => !(field in value) || field in example || matches(value[field], extraShapes[field], field, depth + 1));
  }
  return typeof value === typeof example;
}

export function hasSupportedSaveStructure(state: GameState): boolean {
  try {
    template ??= createInitialState();
    return matches(migrateState(state), template);
  } catch { return false; }
}
