'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { GameState, CampaignMode } from '../types';
import { createInitialState, gameReducer, GameAction } from '../simulation/engine';
import { saveGameToSlot, loadGameFromSlot } from '../simulation/persistence';
import { soundManager } from '../simulation/sound';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startNewGame: (mode: CampaignMode) => void;
  loadSavedGame: (slotId: string) => boolean;
  saveCurrentGame: (slotId: string) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => {
    return createInitialState('ABHIJEET_CJP');
  });

  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Safely restore autosave on client after initial hydration mount
  useEffect(() => {
    const saved = loadGameFromSlot('autosave');
    if (saved) {
      dispatch({ type: 'LOAD_STATE', state: saved });
    }
  }, []);

  // The reducer is pure, so engine-driven events get their sounds here
  const prevRef = useRef(state);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = state;
    if (prev === state) return;
    if (state.activeCrisis && state.activeCrisis !== prev.activeCrisis) soundManager.playCrisisSting();
    if (state.story?.activeEventId && state.story.activeEventId !== prev.story?.activeEventId) soundManager.playCrisisSting();
    if ((state.movementLevel ?? 1) > (prev.movementLevel ?? 1)) soundManager.playLevelUp();
    if (state.electionLiveState.isCountingFinished && !prev.electionLiveState.isCountingFinished) soundManager.playFanfare();
    if (state.gameOver && !prev.gameOver) {
      if (state.gameOver.victory) soundManager.playFanfare();
      else soundManager.playAlert();
    }
    if (state.lastOutcome && state.lastOutcome !== prev.lastOutcome && state.lastOutcome.tone === 'FAILURE') {
      soundManager.playAlert();
    }
  }, [state]);

  useEffect(() => {
    soundManager.setEnabled(state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);

  // Auto-advance clock (optional; the default is turn-based via END DAY).
  // Pauses while a crisis or mini-game needs the player's attention.
  const clockBlocked = !!state.activeCrisis || !!state.activeMiniGame || !!state.gameOver || !!state.story?.activeEventId;
  useEffect(() => {
    if (state.clockSpeed === 0 || !state.hasBegun || clockBlocked) return;

    const intervalMs = state.clockSpeed === 1 ? 2400 : state.clockSpeed === 2 ? 1200 : 450;
    const timer = setInterval(() => {
      dispatch({ type: 'ADVANCE_DAY' });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [state.clockSpeed, state.hasBegun, clockBlocked]);

  // Periodic autosave every 20 seconds
  useEffect(() => {
    if (!state.hasBegun) return;
    const autosaveTimer = setInterval(() => {
      saveGameToSlot('autosave', stateRef.current);
    }, 20000);

    return () => clearInterval(autosaveTimer);
  }, [state.hasBegun]);

  const startNewGame = (mode: CampaignMode) => {
    // Fresh seed per campaign so crises, donations and elections differ between runs
    const newState = createInitialState(mode, Math.floor(Math.random() * 2 ** 31));
    dispatch({ type: 'LOAD_STATE', state: newState });
    saveGameToSlot('autosave', newState);
  };

  const loadSavedGame = (slotId: string) => {
    const loaded = loadGameFromSlot(slotId);
    if (loaded) {
      dispatch({ type: 'LOAD_STATE', state: loaded });
      return true;
    }
    return false;
  };

  const saveCurrentGame = (slotId: string) => {
    return saveGameToSlot(slotId, state);
  };

  return (
    <GameContext.Provider value={{ state, dispatch, startNewGame, loadSavedGame, saveCurrentGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
