'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import { Volume2, VolumeX, Pause, Play, FastForward, Save, Zap, Activity, Wallet, Award, Sun, Moon } from 'lucide-react';
import { SaveLoadModal } from './SaveLoadModal';
import { TurnTrackerWidget } from './TurnTrackerWidget';

type Tone = 'normal' | 'warn' | 'danger';

function StatChip({ icon: Icon, label, value, tone = 'normal' }: { icon: React.ElementType; label: string; value: string; tone?: Tone }) {
  const toneClass =
    tone === 'danger' ? 'border-danger-line bg-danger-soft text-danger-fg' :
    tone === 'warn' ? 'border-accent-line bg-accent-soft text-accent-fg' :
    'border-line bg-inset text-fg';
  return (
    <div className={`flex min-w-0 items-center gap-1.5 rounded-xs border px-2 py-1 font-tactical text-xs ${toneClass}`} title={label}>
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
      <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-muted xl:inline">{label}</span>
      <span className="truncate font-bold tabular-nums">{value}</span>
    </div>
  );
}

const iconButton = 'flex h-8 w-8 items-center justify-center rounded-xs border border-line bg-inset text-muted transition-colors hover:border-accent hover:text-fg';

export function GameHeader() {
  const { state, dispatch } = useGame();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const isLight = state.settings.theme === 'LIGHT';
  const { energy, stress } = state.player;
  const { movementFunds, publicTrust } = state.movement;

  const toggleSound = () => {
    const nextVal = !state.settings.soundEnabled;
    soundManager.setEnabled(nextVal);
    soundManager.playClick();
    dispatch({ type: 'TOGGLE_SOUND', enabled: nextVal });
  };

  const speeds: { speed: 0 | 1 | 2; icon: React.ElementType; label: string }[] = [
    { speed: 0, icon: Pause, label: 'Pause auto-advance (turn-based)' },
    { speed: 1, icon: Play, label: 'Auto-advance: 1 day every 2.4s' },
    { speed: 2, icon: FastForward, label: 'Auto-advance: 1 day every 1.2s' },
  ];

  const stats = (
    <>
      <StatChip icon={Zap} label="Energy" value={`${energy}%`} tone={energy < 25 ? 'danger' : energy < 50 ? 'warn' : 'normal'} />
      <StatChip icon={Activity} label="Stress" value={`${stress}%`} tone={stress > 75 ? 'danger' : stress > 55 ? 'warn' : 'normal'} />
      <StatChip icon={Wallet} label="Funds" value={`₹${movementFunds.toLocaleString('en-IN')}`} tone={movementFunds < state.movement.monthlyBurnRate ? 'warn' : 'normal'} />
      <StatChip icon={Award} label="Trust" value={`${publicTrust}%`} tone={publicTrust < 25 ? 'danger' : publicTrust < 40 ? 'warn' : 'normal'} />
    </>
  );

  return (
    <>
      <div className="h-1.5 w-full caution-stripes" />

      <header className="border-b-2 border-line bg-surface px-3 py-2.5 sm:px-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2.5">
          {/* Brand + date + turn */}
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight text-fg sm:text-xl">
              REPUBLIC
              <span className="rounded-xs bg-[#DC2626] px-1.5 py-0.5 font-tactical text-sm font-black text-white">543</span>
            </span>
            <span className="hidden items-center gap-1.5 rounded-xs border border-line bg-inset px-2 py-1 font-tactical text-xs font-bold text-accent-fg sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15]" aria-hidden="true" />
              {formatDate(state.currentDate)}
            </span>
            <TurnTrackerWidget />
          </div>

          {/* Desktop stats */}
          <div className="ml-auto hidden items-center gap-2 lg:flex">{stats}</div>

          {/* Controls */}
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <div className="flex items-center rounded-xs border border-line bg-inset p-0.5" role="group" aria-label="Clock speed">
              {speeds.map(({ speed, icon: Icon, label }) => {
                const active = state.clockSpeed === speed;
                return (
                  <button
                    key={speed}
                    onClick={() => dispatch({ type: 'SET_CLOCK_SPEED', speed })}
                    title={label}
                    aria-label={label}
                    aria-pressed={active}
                    className={`flex h-7 w-7 items-center justify-center rounded-xs transition-colors ${
                      active ? (speed === 0 ? 'bg-[#DC2626] text-white' : 'bg-[#FACC15] text-black') : 'text-muted hover:text-fg'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowSaveModal(true)}
              className="flex h-8 items-center gap-1.5 rounded-xs bg-[#DC2626] px-3 font-tactical text-xs font-bold text-white transition-colors hover:bg-red-700"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save / Load</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                dispatch({ type: 'TOGGLE_THEME' });
              }}
              title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
              aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
              className={iconButton}
            >
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <button
              onClick={toggleSound}
              title={state.settings.soundEnabled ? 'Mute sound' : 'Enable sound'}
              aria-label={state.settings.soundEnabled ? 'Mute sound' : 'Enable sound'}
              className={iconButton}
            >
              {state.settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          {/* Mobile / tablet stats */}
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">{stats}</div>
        </div>
      </header>

      {showSaveModal && <SaveLoadModal onClose={() => setShowSaveModal(false)} />}
    </>
  );
}
