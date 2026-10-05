'use client';

import React, { useEffect, useState } from 'react';
import type { ActionOutcome } from '@/lib/game/types';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Zap, Megaphone, Tv, Search, Scale, Coffee, ShieldAlert, Target, Award, Sparkles } from 'lucide-react';

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

  const handleDayOff = () => {
    soundManager.playPaper();
    dispatch({ type: 'REST_DAY' });
  };

  const today = state.currentDate.year * 10000 + state.currentDate.month * 100 + state.currentDate.day;
  const actions: { label: string; hint: string; icon: React.ElementType; onClick: () => void; disabled?: boolean; title: string }[] = [
    { label: 'Stage Rally', hint: '1 AP', icon: Megaphone, onClick: handleActionRally, disabled: state.miniGameLastPlayed?.RALLY === today, title: 'Mini-game, once per day. Raises legal heat slightly.' },
    { label: 'TV Debate', hint: '1 AP', icon: Tv, onClick: handleActionDebate, disabled: state.miniGameLastPlayed?.TV_DEBATE === today, title: 'Mini-game, once per day.' },
    { label: 'Whistleblower', hint: '1 AP · ₹8k', icon: Search, onClick: handleActionInvestigate, disabled: !openCase, title: openCase ? `Corroborate evidence: ${openCase.title}` : 'All cases concluded' },
    { label: 'Legal Writ', hint: '1 AP · ₹10k', icon: Scale, onClick: handleActionLegal, title: 'Legal heat −15' },
    { label: 'Chai Break', hint: '1 AP', icon: Coffee, onClick: handleActionRest, title: '+25 energy, −15 stress' },
  ];
  const questPct = activeQuest ? Math.min(100, Math.round((activeQuest.currentProgress / activeQuest.targetProgress) * 100)) : 0;
  const xpInLevel = xp % 1000;

  const toastTone =
    floatingToast?.tone === 'FAILURE' ? 'border-danger-line' :
    floatingToast?.tone === 'WARNING' ? 'border-accent-line' :
    'border-success-line';
  const toastIcon =
    floatingToast?.tone === 'FAILURE' ? 'text-danger-fg' :
    floatingToast?.tone === 'WARNING' ? 'text-accent-fg' :
    'text-success-fg';

  return (
    <div className="relative mb-4">
      {/* Outcome toast: always the engine's real result */}
      {floatingToast && (
        <div
          role="status"
          className={`fixed left-4 right-4 top-4 z-[60] flex items-start gap-2 rounded-xs border-l-4 border bg-surface px-4 py-3 font-tactical text-xs font-semibold text-fg shadow-2xl sm:left-auto sm:max-w-md ${toastTone}`}
        >
          <Sparkles className={`mt-0.5 h-4 w-4 shrink-0 ${toastIcon}`} aria-hidden="true" />
          <span className="leading-relaxed">{floatingToast.text}</span>
        </div>
      )}

      <section className="rounded-xs border border-line bg-surface shadow-sm" aria-label="Daily actions">
        <div className="grid gap-4 p-3 sm:p-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          {/* Action points + end day */}
          <div className="flex items-center justify-between gap-4 lg:justify-start">
            <div>
              <div className="font-tactical text-[10px] font-bold uppercase tracking-wider text-muted">Action points</div>
              <div className="mt-1.5 flex items-center gap-1.5">
                {Array.from({ length: maxAp }, (_, i) => (
                  <span
                    key={i}
                    className={`flex h-7 w-7 items-center justify-center rounded-xs border ${
                      i < ap ? 'border-accent bg-[#FACC15] text-black' : 'border-line bg-inset text-faint'
                    }`}
                    aria-hidden="true"
                  >
                    <Zap className="h-3.5 w-3.5" />
                  </span>
                ))}
                <span className="ml-1 font-tactical text-xs font-bold tabular-nums text-fg">{ap}/{maxAp}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleDayOff}
                title="Spend the whole day resting: +35 energy, −25 stress, +5 health"
                className="h-7 rounded-xs border border-line px-2 font-tactical text-[10px] font-bold uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-fg"
              >
                Take day off
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:border-x lg:border-line lg:px-4 xl:grid-cols-5">
            {actions.map(({ label, hint, icon: Icon, onClick, disabled, title }) => {
              const off = ap <= 0 || disabled;
              return (
                <button
                  key={label}
                  onClick={onClick}
                  disabled={off}
                  title={title}
                  className="flex h-12 flex-col items-start justify-center rounded-xs border border-line bg-raised px-3 text-left transition-colors enabled:hover:border-accent enabled:hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span className="flex items-center gap-1.5 font-tactical text-xs font-bold text-fg">
                    <Icon className="h-3.5 w-3.5 text-accent-fg" aria-hidden="true" />
                    {label}
                  </span>
                  <span className="font-tactical text-[10px] text-muted">{hint}</span>
                </button>
              );
            })}
          </div>

          {/* Pressure + rank */}
          <div className="grid grid-cols-2 gap-2 lg:w-56 lg:grid-cols-1">
            <div className="rounded-xs border border-line bg-inset p-2">
              <div className="flex items-center justify-between font-tactical text-[10px] font-bold uppercase tracking-wide">
                <span className="flex items-center gap-1 text-muted">
                  <ShieldAlert className={`h-3 w-3 ${crackdown > 60 ? 'text-danger-fg' : ''}`} aria-hidden="true" />
                  Legal heat
                </span>
                <span className={`tabular-nums ${crackdown > 60 ? 'text-danger-fg' : 'text-fg'}`}>{crackdown}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full transition-all ${crackdown > 60 ? 'bg-[#DC2626]' : crackdown > 35 ? 'bg-orange-500' : 'bg-[#FACC15]'}`}
                  style={{ width: `${crackdown}%` }}
                />
              </div>
            </div>
            <div className="rounded-xs border border-line bg-inset p-2">
              <div className="flex items-center justify-between font-tactical text-[10px] font-bold uppercase tracking-wide">
                <span className="flex items-center gap-1 text-accent-fg">
                  <Award className="h-3 w-3" aria-hidden="true" />
                  Rank {level}
                </span>
                <span className="tabular-nums text-muted">{level >= 5 ? 'MAX' : `${xpInLevel}/1000 XP`}</span>
              </div>
              <div className="mt-1 truncate font-tactical text-[11px] font-semibold text-fg" title={LEVEL_NAMES[level - 1]}>
                {LEVEL_NAMES[level - 1] || 'Movement'}
              </div>
            </div>
          </div>
        </div>

        {/* Quest strip */}
        {activeQuest && (
          <div className="flex flex-col gap-2 border-t border-line px-3 py-2.5 sm:px-4 md:flex-row md:items-center md:gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-danger-fg" aria-hidden="true" />
              <div className="min-w-0">
                <div className="font-tactical text-xs font-bold uppercase tracking-wide text-fg">
                  Chapter {activeQuest.chapter}: {activeQuest.title}
                </div>
                <p className="line-clamp-2 text-xs text-muted">{activeQuest.description}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 md:w-80">
              <div className="flex-1">
                <div className="flex justify-between font-tactical text-[10px] text-muted">
                  <span className="tabular-nums text-fg">
                    {activeQuest.currentProgress.toLocaleString('en-IN')} / {activeQuest.targetProgress.toLocaleString('en-IN')} {activeQuest.unit}
                  </span>
                  <span className="tabular-nums">{questPct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-[#FACC15] transition-all" style={{ width: `${questPct}%` }} />
                </div>
              </div>
              <span className="stamp-yellow shrink-0 text-[9px]">
                {activeQuest.isCompleted ? 'Complete' : `+${activeQuest.rewardXP} XP`}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
