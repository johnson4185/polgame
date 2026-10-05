'use client';

import React, { useEffect, useState } from 'react';
import type { ActionOutcome } from '@/lib/game/types';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { 
  Zap, 
  Megaphone, 
  Tv, 
  Search, 
  Scale, 
  Coffee, 
  Moon, 
  ShieldAlert, 
  Target, 
  Award, 
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const LEVEL_NAMES = [
  'Grassroots Street Agitators',
  'RTI Crusaders & Legal Watchdogs',
  'Civil Rights Mass Movement',
  'National Electoral Contender',
  'Alternative Government in Waiting',
];

export function GameActionHUD() {
  const { state, dispatch } = useGame();
  const [dismissedOutcomeId, setDismissedOutcomeId] = useState(0);

  const ap = state.actionPoints ?? 3;
  const maxAp = state.maxActionPoints ?? 3;
  const crackdown = state.crackdownLevel ?? 15;
  const level = state.movementLevel ?? 1;
  const xp = state.movementXP ?? 0;
  const activeQuest = state.activeQuests?.find(q => !q.isCompleted) ?? state.activeQuests?.[state.activeQuests.length - 1];
  const openCase = state.cases.find(c => c.currentStage !== 'FILED_PIL' && c.currentStage !== 'EXPOSED');

  // Every engine action reports its real result via lastOutcome; show it as a toast
  const outcome = state.lastOutcome;
  const floatingToast: ActionOutcome | null = outcome && outcome.id !== dismissedOutcomeId ? outcome : null;
  useEffect(() => {
    if (!outcome) return;
    const t = setTimeout(() => setDismissedOutcomeId(outcome.id), 3500);
    return () => clearTimeout(t);
  }, [outcome]);

  const handleActionRally = () => {
    soundManager.playMegaphone();
    dispatch({ type: 'OPEN_MINI_GAME', miniGame: 'RALLY' });
  };

  const handleActionDebate = () => {
    soundManager.playCameraShutter();
    dispatch({ type: 'OPEN_MINI_GAME', miniGame: 'TV_DEBATE' });
  };

  const handleActionInvestigate = () => {
    if (!openCase) return;
    soundManager.playPaper();
    dispatch({ type: 'INVESTIGATION_ACTION', caseId: openCase.id, action: 'CORROBORATE_EVIDENCE' });
  };

  const handleActionLegal = () => {
    soundManager.playGavel();
    dispatch({ type: 'LEGAL_AID' });
  };

  const handleActionRest = () => {
    soundManager.playClick();
    dispatch({ type: 'FIELD_REST' });
  };

  const handleEndDay = () => {
    soundManager.playPaper();
    dispatch({ type: 'ADVANCE_DAY' });
  };

  return (
    <div className="relative mb-4 space-y-2.5">
      
      {/* Floating Consequence Toast */}
      {floatingToast && (
        <div
          role="status"
          className={`fixed top-20 right-4 left-4 sm:left-auto sm:max-w-md z-[60] flex items-center gap-2 rounded-xs border-2 bg-[#0A0E17] px-4 py-2.5 shadow-2xl font-tactical text-xs font-bold text-white animate-in slide-in-from-top-4 ${
            floatingToast.tone === 'FAILURE' ? 'border-red-500' : floatingToast.tone === 'WARNING' ? 'border-orange-400' : 'border-[#FACC15]'
          }`}
        >
          <Sparkles className={`h-4 w-4 shrink-0 ${floatingToast.tone === 'FAILURE' ? 'text-red-400' : 'text-[#FACC15]'}`} />
          <span>{floatingToast.text}</span>
        </div>
      )}

      {/* Main HUD Banner */}
      <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-3 sm:p-4 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
          
          {/* Section 1: Daily Turn & Action Points (AP) */}
          <div className="lg:col-span-4 flex items-center justify-between gap-3 border-b lg:border-b-0 lg:border-r border-zinc-800 pb-3 lg:pb-0 lg:pr-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="stamp-yellow text-[9px]">TACTICAL TURNS</span>
                <span className="font-tactical text-xs font-black text-white">DAILY ACTION POINTS</span>
              </div>
              
              {/* AP Battery Pips */}
              <div className="flex items-center gap-1.5 mt-1.5">
                {Array.from({ length: maxAp }, (_, i) => i + 1).map((pip) => (
                  <div
                    key={pip}
                    className={`flex h-7 w-7 items-center justify-center rounded-xs border-2 font-mono font-black text-xs transition-all ${
                      pip <= ap
                        ? 'border-[#FACC15] bg-[#FACC15] text-black shadow-xs shadow-yellow-500/20'
                        : 'border-zinc-800 bg-black/60 text-zinc-600'
                    }`}
                  >
                    ⚡
                  </div>
                ))}
                <span className="font-mono text-xs font-bold text-zinc-300 ml-1.5">
                  {ap} / {maxAp} AP
                </span>
              </div>
            </div>

            {/* End Day Button */}
            <button
              onClick={handleEndDay}
              title="Conclude today's operations and advance to the next day"
              className="flex items-center gap-1.5 rounded-xs bg-[#DC2626] border-2 border-red-500 px-3.5 py-2 text-xs font-black font-tactical text-white hover:bg-red-700 transition-colors shadow-xs group"
            >
              <Moon className="h-3.5 w-3.5 text-[#FACC15] group-hover:rotate-12 transition-transform" />
              <span>END DAY</span>
            </button>
          </div>

          {/* Section 2: Quick Tactical Actions */}
          <div className="lg:col-span-5 flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleActionRally}
              disabled={ap <= 0}
              className={`flex items-center gap-1.5 rounded-xs border px-2.5 py-1.5 text-xs font-bold font-tactical transition-all ${
                ap > 0
                  ? 'border-yellow-600/70 bg-yellow-950/40 text-yellow-300 hover:bg-[#FACC15] hover:text-black hover:border-[#FACC15]'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Megaphone className="h-3.5 w-3.5 text-[#FACC15]" />
              <span>Stage Rally (1 AP)</span>
            </button>

            <button
              onClick={handleActionDebate}
              disabled={ap <= 0}
              className={`flex items-center gap-1.5 rounded-xs border px-2.5 py-1.5 text-xs font-bold font-tactical transition-all ${
                ap > 0
                  ? 'border-red-600/70 bg-red-950/40 text-red-300 hover:bg-red-600 hover:text-white hover:border-red-500'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-red-400" />
              <span>TV Crossfire (1 AP)</span>
            </button>

            <button
              onClick={handleActionInvestigate}
              disabled={ap <= 0 || !openCase}
              title={openCase ? `Corroborate evidence: ${openCase.title}` : 'All cases concluded'}
              className={`flex items-center gap-1.5 rounded-xs border px-2.5 py-1.5 text-xs font-bold font-tactical transition-all ${
                ap > 0
                  ? 'border-zinc-700 bg-black/60 text-zinc-300 hover:border-[#FACC15] hover:text-white'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Search className="h-3.5 w-3.5 text-amber-400" />
              <span>Whistleblower (1 AP)</span>
            </button>

            <button
              onClick={handleActionLegal}
              disabled={ap <= 0}
              className={`flex items-center gap-1.5 rounded-xs border px-2.5 py-1.5 text-xs font-bold font-tactical transition-all ${
                ap > 0
                  ? 'border-zinc-700 bg-black/60 text-zinc-300 hover:border-blue-400 hover:text-white'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Scale className="h-3.5 w-3.5 text-blue-400" />
              <span>Legal Writ (1 AP · ₹10k)</span>
            </button>

            <button
              onClick={handleActionRest}
              disabled={ap <= 0}
              className={`flex items-center gap-1.5 rounded-xs border px-2.5 py-1.5 text-xs font-bold font-tactical transition-all ${
                ap > 0
                  ? 'border-zinc-700 bg-black/60 text-zinc-300 hover:border-emerald-400 hover:text-white'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Coffee className="h-3.5 w-3.5 text-emerald-400" />
              <span>Rest (1 AP · +25 energy)</span>
            </button>
          </div>

          {/* Section 3: State Crackdown Threat & Level Badges */}
          <div className="lg:col-span-3 flex items-center justify-end gap-3 border-t lg:border-t-0 lg:border-l border-zinc-800 pt-3 lg:pt-0 lg:pl-4 text-xs font-tactical">
            
            {/* Crackdown Danger Meter */}
            <div className="rounded-xs border border-zinc-800 bg-black/70 p-2 min-w-[125px]">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 font-bold flex items-center gap-1">
                  <ShieldAlert className={`h-3 w-3 ${crackdown > 50 ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`} />
                  STATE ALERT
                </span>
                <span className={`font-black tabular-nums ${crackdown > 50 ? 'text-red-400' : 'text-zinc-300'}`}>
                  {crackdown}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-xs overflow-hidden mt-1 border border-zinc-800">
                <div
                  className={`h-full transition-all duration-300 ${crackdown > 60 ? 'bg-red-500' : 'bg-yellow-500'}`}
                  style={{ width: `${crackdown}%` }}
                />
              </div>
            </div>

            {/* Movement Rank Badge */}
            <div className="rounded-xs border border-zinc-800 bg-black/70 p-2 min-w-[130px]">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#FACC15] font-bold flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  RANK {level}
                </span>
                <span className="text-zinc-500 font-mono text-[9px]">{xp} XP</span>
              </div>
              <span className="text-[10px] text-white font-bold truncate block mt-0.5" title={LEVEL_NAMES[level - 1] || 'Movement'}>
                {LEVEL_NAMES[level - 1] || 'Movement'}
              </span>
            </div>

          </div>

        </div>

        {/* Sub-strip: Active Campaign Quest */}
        {activeQuest && (
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-tactical">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-5 w-5 items-center justify-center rounded-xs bg-[#DC2626] text-white shrink-0">
              <Target className="h-3 w-3" />
            </span>
            <div className="flex items-center gap-2 truncate">
              <span className="font-black text-white uppercase tracking-wider">
                MAIN QUEST {activeQuest.chapter}: {activeQuest.title}
              </span>
              <span className="hidden sm:inline text-zinc-400 truncate">
                · {activeQuest.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400">PROGRESS:</span>
              <span className="font-bold text-[#FACC15] tabular-nums text-xs">
                {activeQuest.currentProgress.toLocaleString('en-IN')} / {activeQuest.targetProgress.toLocaleString('en-IN')} {activeQuest.unit}
              </span>
            </div>
            <span className="stamp-yellow text-[9px]">{activeQuest.isCompleted ? 'COMPLETE' : `REWARD: +${activeQuest.rewardXP} XP`}</span>
          </div>
        </div>
        )}

      </div>

    </div>
  );
}
