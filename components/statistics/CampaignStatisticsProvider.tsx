'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { campaignKey, DailySnapshot, parseHistory, recordSnapshot, snapshot } from '@/lib/game/statistics/history';

const StatisticsContext = createContext<{ history: DailySnapshot[]; persistent: boolean }>({ history: [], persistent: true });

/** Observe committed game state; statistics never dispatch or alter simulation/saves. */
export function CampaignStatisticsProvider({ children }: { children: React.ReactNode }) {
  const { state } = useGame();
  const key = campaignKey(state);
  const cache = useRef<{ key: string; history: DailySnapshot[] } | null>(null);
  const [view, setView] = useState({ key: '', history: [] as DailySnapshot[], persistent: true });

  useEffect(() => {
    if (!state.hasBegun) return;
    let persistent = true;
    let history = cache.current?.key === key ? cache.current.history : [];
    if (cache.current?.key !== key) {
      try { history = parseHistory(localStorage.getItem(key)); }
      catch { persistent = false; }
    }
    const next = recordSnapshot(history, snapshot(state));
    if (next !== history) {
      try { localStorage.setItem(key, JSON.stringify(next)); }
      catch { persistent = false; }
    } else if (cache.current?.key === key) {
      return;
    }
    cache.current = { key, history: next };
    setView({ key, history: next, persistent });
  }, [state, key]);

  return (
    <StatisticsContext.Provider value={view.key === key && state.hasBegun ? view : { history: [], persistent: true }}>
      {children}
    </StatisticsContext.Provider>
  );
}

export function useCampaignStatistics() { return useContext(StatisticsContext); }
