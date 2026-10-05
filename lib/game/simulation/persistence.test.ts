import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialState, gameReducer, SAVE_VERSION } from './engine';
import { CRISIS_EVENT_DECK } from '../data/crises';
import {
  exportSlotToFile, getSlotMetadata, inspectSaveSlot, loadGameFromSlot, MAX_SAVE_FILE_BYTES, normalizeSaveName,
  parseSaveFile, renameSaveSlot, saveGameToSlot,
} from './persistence';

let storage: Map<string, string>;
let write: ReturnType<typeof vi.fn>;
beforeEach(() => {
  storage = new Map();
  write = vi.fn((key: string, value: string) => storage.set(key, value));
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) ?? null, setItem: write });
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('named checkpoints', () => {
  it('writes the state and its label atomically and strips storage metadata on load', () => {
    const state = createInitialState();
    expect(saveGameToSlot('1', state, ' Before the election ')).toBe(true);
    expect(write).toHaveBeenCalledTimes(1);
    expect(loadGameFromSlot('1')).toEqual(state);
    expect(getSlotMetadata('1')).toMatchObject({ name: 'Before the election', playerName: state.player.name, movementFunds: state.movement.movementFunds });
  });
  it('renames without replacing gameplay or changing the checkpoint timestamp', () => {
    const state = createInitialState();
    saveGameToSlot('2', state, 'Original');
    const savedAt = getSlotMetadata('2')!.savedAt;
    expect(renameSaveSlot('2', 'Campaign launch')).toBe(true);
    expect(loadGameFromSlot('2')).toEqual(state);
    expect(getSlotMetadata('2')).toMatchObject({ name: 'Campaign launch', savedAt });
    saveGameToSlot('2', state);
    expect(getSlotMetadata('2')?.name).toBe('Campaign launch');
  });
  it('preserves an existing checkpoint when storage rejects an overwrite', () => {
    saveGameToSlot('1', createInitialState(), 'Keep me');
    const before = storage.get('republic543_slot_1');
    write.mockImplementation(() => { throw new Error('QuotaExceededError'); });
    expect(saveGameToSlot('1', createInitialState('CUSTOM_CITIZEN'), 'Replacement')).toBe(false);
    expect(renameSaveSlot('1', 'Changed')).toBe(false);
    expect(storage.get('republic543_slot_1')).toBe(before);
  });
  it('keeps the autosave label fixed and refuses to rename empty slots', () => {
    saveGameToSlot('autosave', createInitialState(), 'Custom');
    expect(getSlotMetadata('autosave')?.name).toBe('Autosave');
    expect(renameSaveSlot('autosave', 'Custom')).toBe(false);
    expect(renameSaveSlot('3', 'Custom')).toBe(false);
    expect(normalizeSaveName('   ', 'Slot 1')).toBe('Slot 1');
    expect(normalizeSaveName('x'.repeat(100), 'Slot 1')).toHaveLength(60);
  });
});

describe('compatibility and recovery', () => {
  it('reads legacy separate metadata and derives preview totals from the real save', () => {
    const state = createInitialState();
    storage.set('republic543_slot_1', JSON.stringify(state));
    storage.set('republic543_slot_1_meta', JSON.stringify({ name: 'Old checkpoint', savedAt: '5/10/2026', movementFunds: -999 }));
    expect(getSlotMetadata('1')).toMatchObject({ name: 'Old checkpoint', savedAt: '5/10/2026', movementFunds: state.movement.movementFunds });
    storage.set('republic543_slot_1_meta', '{broken');
    expect(getSlotMetadata('1')?.name).toBe('Slot 1');
  });
  it('accepts older saves with fields supplied by migration', () => {
    const legacy: Record<string, unknown> = { ...createInitialState(), version: 1 };
    for (const key of ['seed', 'gameOver', 'lastOutcome', 'idCounter', 'insolventMonths', 'activeQuests']) delete legacy[key];
    expect(parseSaveFile(JSON.stringify(legacy))).not.toBeNull();
  });
  it('accepts progressed campaigns with crisis choices, candidates, and nullable operation selection', () => {
    let state = gameReducer(createInitialState(), { type: 'FINISH_PROLOGUE' });
    state = { ...state, activeCrisis: CRISIS_EVENT_DECK[0], activeOperationId: null };
    state.constituencies = state.constituencies.map((seat, index) => index ? seat : { ...seat, cjpCandidate: { name: 'Candidate', isCoreMember: false, localReputation: 50, campaignFundingAllocated: 10000 } });
    expect(parseSaveFile(JSON.stringify(state))).not.toBeNull();
  });
  it('rejects malformed JSON, incomplete structures, invalid dates, and newer save versions', () => {
    const state = createInitialState();
    const invalid = [null, [], { version: 1, player: {}, movement: {} },
      { ...state, version: SAVE_VERSION + 1 }, { ...state, currentDate: { year: 2026, month: 2, day: 30 } },
      { ...state, people: [null] }, { ...state, people: [{}] }, { ...state, player: { ...state.player, health: 'bad' } },
      { ...state, cases: [{ ...state.cases[0], evidenceItems: 'bad' }] }];
    for (const value of invalid) expect(parseSaveFile(JSON.stringify(value))).toBeNull();
    expect(parseSaveFile('{broken')).toBeNull();
    expect(parseSaveFile(' '.repeat(MAX_SAVE_FILE_BYTES + 1))).toBeNull();
  });
  it('distinguishes missing, unreadable, and unavailable slots', () => {
    expect(inspectSaveSlot('1').status).toBe('empty');
    storage.set('republic543_slot_1', '{broken');
    expect(inspectSaveSlot('1').status).toBe('unreadable');
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('Blocked'); } });
    expect(inspectSaveSlot('1').status).toBe('unavailable');
    expect(loadGameFromSlot('1')).toBeNull();
  });
  it('downloads unreadable checkpoints unchanged and releases the blob after the browser can use it', async () => {
    vi.useFakeTimers();
    const raw = '{damaged but worth recovering';
    storage.set('republic543_slot_1', raw);
    const anchor = { href: '', download: '', click: vi.fn(), remove: vi.fn() };
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.stubGlobal('document', { createElement: () => anchor, body: { appendChild: vi.fn() } });
    expect(exportSlotToFile('1')).toBe(true);
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(anchor.download).toBe('republic543_slot-1_backup.json');
    const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
    expect(await blob.text()).toBe(raw);
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
    expect(exportSlotToFile('3')).toBe(false);
  });
});
