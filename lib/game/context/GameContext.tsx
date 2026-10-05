'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { GameState, CampaignMode } from '../types';
import { createInitialState, gameReducer, GameAction } from '../simulation/engine';
import { saveGameToSlot, loadGameFromSlot } from '../simulation/persistence';

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

  // Running clock timer
  useEffect(() => {
    if (state.clockSpeed === 0 || !state.hasBegun) return;

    const intervalMs = state.clockSpeed === 1 ? 2400 : state.clockSpeed === 2 ? 1200 : 450;
    const timer = setInterval(() => {
      dispatch({ type: 'ADVANCE_DAY' });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [state.clockSpeed, state.hasBegun]);

  // Periodic autosave every 30 seconds
  useEffect(() => {
    if (!state.hasBegun) return;
    const autosaveTimer = setInterval(() => {
      saveGameToSlot('autosave', stateRef.current);
    }, 20000);

    return () => clearInterval(autosaveTimer);
  }, [state.hasBegun]);

  const startNewGame = (mode: CampaignMode) => {
    const newState = createInitialState(mode);
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
