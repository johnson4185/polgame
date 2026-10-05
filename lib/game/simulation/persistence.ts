// Local browser storage and JSON backups. Save payloads remain plain GameState objects.
import { GameState } from '../types';
import { SAVE_VERSION } from './engine';
import { hasSupportedSaveStructure } from './saveValidation';

export interface SaveMetadata {
  slotId: string;
  name: string;
  savedAt: string;
  inGameDate: string;
  playerName: string;
  campaignMode: string;
  publicTrust: number;
  movementFunds: number;
  volunteers?: number;
  seats?: number;
}

export const SAVE_NAME_LIMIT = 60;
export const MAX_SAVE_FILE_BYTES = 5 * 1024 * 1024;
const keyFor = (slot: string) => slot === 'autosave' ? 'republic543_autosave' : `republic543_slot_${slot}`;
type StoredSave = GameState & { _slotMetadata?: SaveMetadata };
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export function normalizeSaveName(name: string | undefined, fallback: string): string {
  return name?.trim().replace(/\s+/g, ' ').slice(0, SAVE_NAME_LIMIT) || fallback;
}

export function describeSave(state: GameState, slotId: string, name?: string, savedAt = ''): SaveMetadata {
  return {
    slotId,
    name: slotId === 'autosave' ? 'Autosave' : normalizeSaveName(name, `Slot ${slotId}`),
    savedAt,
    inGameDate: `${state.currentDate.day}/${state.currentDate.month}/${state.currentDate.year}`,
    playerName: state.player.name,
    campaignMode: state.player.campaignMode,
    publicTrust: state.movement.publicTrust,
    movementFunds: state.movement.movementFunds,
    volunteers: state.movement.volunteerCount,
    seats: state.party.actualSeatsWon,
  };
}

/** Basic structure checks before a file can reach the game's migration path. */
export function parseSaveFile(fileText: string): GameState | null {
  try {
    if (fileText.length > MAX_SAVE_FILE_BYTES) return null;
    const parsed: unknown = JSON.parse(fileText);
    if (!isRecord(parsed) || !Number.isInteger(parsed.version) || (parsed.version as number) < 1 || (parsed.version as number) > SAVE_VERSION) return null;
    const { player, movement, party, currentDate } = parsed;
    if (!isRecord(player) || !isRecord(movement) || !isRecord(party) || !isRecord(currentDate)) return null;
    if (typeof player.name !== 'string' || !['ABHIJEET_CJP', 'CUSTOM_CITIZEN'].includes(String(player.campaignMode))) return null;
    if (!['health', 'energy', 'stress', 'personalSavings'].every(key => finite(player[key]))) return null;
    if (!['publicTrust', 'movementFunds', 'volunteerCount', 'mediaCredibility'].every(key => finite(movement[key]))) return null;
    if (typeof party.isFormed !== 'boolean' || !finite(party.actualSeatsWon)) return null;
    if (!['year', 'month', 'day'].every(key => Number.isInteger(currentDate[key]))) return null;
    const { year, month, day } = currentDate as { year: number; month: number; day: number };
    const date = new Date(Date.UTC(year, month - 1, day));
    if (year < 1900 || year > 9999 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    for (const field of ['people', 'operations', 'cases', 'constituencies', 'states', 'reforms', 'cabinet', 'journal', 'transactions', 'newsFeed', 'historicalArchive']) {
      if (!Array.isArray(parsed[field]) || !parsed[field].every(isRecord)) return null;
    }
    // Metadata belongs to storage, never to the simulation state.
    const { _slotMetadata: ignored, ...state } = parsed;
    return hasSupportedSaveStructure(state as unknown as GameState) ? state as unknown as GameState : null;
  } catch { return null; }
}

export function loadGameFromSlot(slotId: string): GameState | null {
  if (typeof window === 'undefined') return null;
  try { return parseSaveFile(localStorage.getItem(keyFor(slotId)) ?? ''); }
  catch { return null; }
}

export function getSlotMetadata(slotId: string): SaveMetadata | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(keyFor(slotId));
    const state = parseSaveFile(raw ?? '');
    if (!state || !raw) return null;
    const stored = JSON.parse(raw) as StoredSave;
    let meta: unknown = stored._slotMetadata;
    if (!isRecord(meta)) {
      try { meta = JSON.parse(localStorage.getItem(`${keyFor(slotId)}_meta`) ?? 'null'); }
      catch { meta = null; }
    }
    return describeSave(state, slotId, isRecord(meta) && typeof meta.name === 'string' ? meta.name : undefined,
      isRecord(meta) && typeof meta.savedAt === 'string' ? meta.savedAt : '');
  } catch { return null; }
}

export function inspectSaveSlot(slotId: string): { status: 'empty' | 'ready' | 'unreadable' | 'unavailable'; meta: SaveMetadata | null } {
  if (typeof window === 'undefined') return { status: 'empty', meta: null };
  try {
    if (localStorage.getItem(keyFor(slotId)) === null) return { status: 'empty', meta: null };
    const meta = getSlotMetadata(slotId);
    return { status: meta ? 'ready' : 'unreadable', meta };
  } catch { return { status: 'unavailable', meta: null }; }
}

/** A single atomic storage write keeps the name and actual campaign together. */
export function saveGameToSlot(slotId: string, state: GameState, name?: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const meta = describeSave(state, slotId, name ?? getSlotMetadata(slotId)?.name, new Date().toISOString());
    localStorage.setItem(keyFor(slotId), JSON.stringify({ ...state, _slotMetadata: meta }));
    return true;
  } catch { return false; }
}

export function renameSaveSlot(slotId: string, name: string): boolean {
  if (slotId === 'autosave' || typeof window === 'undefined') return false;
  try {
    const state = loadGameFromSlot(slotId);
    const meta = getSlotMetadata(slotId);
    if (!state || !meta) return false;
    localStorage.setItem(keyFor(slotId), JSON.stringify({ ...state, _slotMetadata: { ...meta, name: normalizeSaveName(name, `Slot ${slotId}`) } }));
    return true;
  } catch { return false; }
}

function downloadJson(contents: string, filename: string): boolean {
  let url: string | undefined;
  let anchor: HTMLAnchorElement | undefined;
  try {
    const blob = new Blob([contents], { type: 'application/json' });
    url = URL.createObjectURL(blob);
    anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    return true;
  } catch { return false; }
  finally {
    anchor?.remove();
    if (url) setTimeout(() => URL.revokeObjectURL(url!), 1000);
  }
}

export function exportSaveToFile(state: GameState, name?: string): boolean {
  try {
    const label = normalizeSaveName(name, 'campaign').replace(/[^a-z0-9_-]+/gi, '_');
    return downloadJson(JSON.stringify(state, null, 2), `republic543_${label}_${state.currentDate.year}-${state.currentDate.month}-${state.currentDate.day}.json`);
  } catch { return false; }
}

/** Preserve even a damaged or newer-version checkpoint so it can be recovered elsewhere. */
export function exportSlotToFile(slotId: string): boolean {
  try {
    const raw = localStorage.getItem(keyFor(slotId));
    return raw !== null && downloadJson(raw, `republic543_slot-${slotId}_backup.json`);
  } catch { return false; }
}
