'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import { Award, Skull, RotateCcw, ScrollText } from 'lucide-react';

export function GameOverModal() {
  const { state, dispatch, startNewGame } = useGame();
  const [collapsed, setCollapsed] = useState(false);
  const ending = state.gameOver;
  if (!ending) return null;

  const passedLaws = state.reforms.filter(r => r.status === 'PASSED_ACT').length;
  const stats = [
    { label: 'PUBLIC TRUST', value: `${state.movement.publicTrust}%` },
    { label: 'VOLUNTEERS', value: state.movement.volunteerCount.toLocaleString('en-IN') },
    { label: 'LOK SABHA SEATS', value: String(state.party.actualSeatsWon) },
    { label: 'LAWS PASSED', value: String(passedLaws) },
  ];

  const handleNewGame = () => {
    soundManager.playClick();
    setCollapsed(false);
    startNewGame(state.player.campaignMode);
  };

  const handleReadJournal = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'JOURNAL' });
    setCollapsed(true);
  };

  if (collapsed) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-50 flex flex-wrap items-center justify-between gap-2 border-t-2 border-red-600 bg-[#0C101A] px-4 py-2.5 font-tactical text-xs">
        <span className="font-black text-white">
          {ending.victory ? 'VICTORY' : 'CAMPAIGN OVER'}: <span className="text-zinc-300">{ending.title}</span>
        </span>
        <div className="flex gap-2">
          <button onClick={() => setCollapsed(false)} className="rounded-xs border border-zinc-700 px-3 py-1.5 font-bold text-zinc-200 hover:border-[#FACC15]">
            SUMMARY
          </button>
          <button onClick={handleNewGame} className="rounded-xs bg-[#DC2626] px-3 py-1.5 font-black text-white hover:bg-red-700">
            NEW CAMPAIGN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md"
    >
      <div className={`relative w-full max-w-xl rounded-xs border-2 bg-[#0C101A] shadow-2xl overflow-hidden text-zinc-100 ${ending.victory ? 'border-[#FACC15]' : 'border-red-600'}`}>
        <div className={`h-2 w-full ${ending.victory ? 'caution-stripes' : 'caution-stripes-red'}`} />

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xs ${ending.victory ? 'bg-[#FACC15] text-black' : 'bg-red-600 text-white'}`}>
              {ending.victory ? <Award className="h-5 w-5" /> : <Skull className="h-5 w-5" />}
            </span>
            <div>
              <span className={`font-tactical text-[10px] font-black uppercase tracking-widest ${ending.victory ? 'text-[#FACC15]' : 'text-red-400'}`}>
                {ending.victory ? 'Victory' : 'Campaign Over'} · {formatDate(ending.date)}
              </span>
              <h2 id="game-over-title" className="font-tactical text-xl font-black text-white">
                {ending.title}
              </h2>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-zinc-300">{ending.text}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-tactical">
            {stats.map(s => (
              <div key={s.label} className="rounded-xs border border-zinc-800 bg-black p-2.5">
                <div className="text-[9px] text-zinc-500">{s.label}</div>
                <div className="text-lg font-black text-white tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={handleNewGame}
              className="flex flex-1 items-center justify-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 px-4 py-2.5 text-xs font-black font-tactical text-white hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              START A NEW CAMPAIGN
            </button>
            <button
              onClick={handleReadJournal}
              className="flex flex-1 items-center justify-center gap-2 rounded-xs border-2 border-zinc-700 bg-black px-4 py-2.5 text-xs font-black font-tactical text-zinc-200 hover:border-[#FACC15] transition-colors"
            >
              <ScrollText className="h-4 w-4" />
              READ THE CHRONICLE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
