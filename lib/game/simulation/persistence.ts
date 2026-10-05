// Local Storage & Export/Import Persistence Manager for REPUBLIC: 543
import { GameState } from '../types';

export interface SaveMetadata {
  slotId: string;
  name: string;
  savedAt: string;
  inGameDate: string;
  playerName: string;
  campaignMode: string;
  publicTrust: number;
  movementFunds: number;
}

const AUTOSAVE_KEY = 'republic543_autosave';
const SLOT_PREFIX = 'republic543_slot_';

export function saveGameToSlot(slotId: string, state: GameState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = slotId === 'autosave' ? AUTOSAVE_KEY : `${SLOT_PREFIX}${slotId}`;
    const payload = JSON.stringify(state);
    localStorage.setItem(key, payload);

    // Save metadata index
    const meta: SaveMetadata = {
      slotId,
      name: slotId === 'autosave' ? 'Autosave' : `Slot ${slotId}`,
      savedAt: new Date().toLocaleString(),
      inGameDate: `${state.currentDate.day}/${state.currentDate.month}/${state.currentDate.year}`,
      playerName: state.player.name,
      campaignMode: state.player.campaignMode,
      publicTrust: state.movement.publicTrust,
      movementFunds: state.movement.movementFunds,
    };
    localStorage.setItem(`${key}_meta`, JSON.stringify(meta));
    return true;
  } catch (err) {
    console.error('Failed to save game:', err);
    return false;
  }
}

export function loadGameFromSlot(slotId: string): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = slotId === 'autosave' ? AUTOSAVE_KEY : `${SLOT_PREFIX}${slotId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.version || !parsed.player) return null;
    return parsed;
  } catch (err) {
    console.error('Failed to load save:', err);
    return null;
  }
}

export function getSlotMetadata(slotId: string): SaveMetadata | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = slotId === 'autosave' ? AUTOSAVE_KEY : `${SLOT_PREFIX}${slotId}`;
    const raw = localStorage.getItem(`${key}_meta`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function exportSaveToFile(state: GameState) {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `republic543_save_${state.currentDate.year}_${state.currentDate.month}_${state.currentDate.day}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseSaveFile(fileText: string): GameState | null {
  try {
    const parsed = JSON.parse(fileText);
    if (parsed && parsed.version && parsed.player && parsed.movement) {
      return parsed as GameState;
    }
    return null;
  } catch {
    return null;
  }
}
