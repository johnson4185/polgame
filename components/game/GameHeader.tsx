'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import { Volume2, VolumeX, Pause, Play, FastForward, RotateCcw, Save, Bed, Flame, Zap, ShieldAlert, Award, Sun, Moon } from 'lucide-react';
import { SaveLoadModal } from './SaveLoadModal';
import { TurnTrackerWidget } from './TurnTrackerWidget';

export function GameHeader() {
  const { state, dispatch } = useGame();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const isLight = state.settings.theme === 'LIGHT';

  const toggleSound = () => {
    const nextVal = !state.settings.soundEnabled;
    soundManager.setEnabled(nextVal);
    soundManager.playClick();
    dispatch({ type: 'TOGGLE_SOUND', enabled: nextVal });
  };

  const handleRest = () => {
    dispatch({ type: 'REST_DAY' });
  };

  const handleSpeed = (speed: 0 | 1 | 2 | 5) => {
    dispatch({ type: 'SET_CLOCK_SPEED', speed });
  };

  return (
    <>
      {/* Top Yellow/Black Caution Strip Accent */}
      <div className="h-1.5 w-full caution-stripes" />

      <header className="border-b-2 border-zinc-800 bg-[#0A0E17] px-3 sm:px-4 py-2.5 shadow-md">
        {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (Tactical stats & nav) — Zone 3 (Primary Actions) */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          
          {/* Zone 1: Striking Brand Wordmark with Black, Red, Yellow Badge */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="font-tactical text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>REPUBLIC:</span>
                <span className="bg-[#DC2626] text-white px-2 py-0.5 rounded-xs text-sm font-black tracking-wider shadow-xs">
                  543
                </span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#FACC15] text-black rounded-xs">
                INDIA
              </span>
            </div>
            
            <span className="hidden text-xs text-zinc-600 sm:inline">|</span>
            
            {/* Live In-Game Date */}
            <div className="hidden sm:flex items-center gap-1.5 font-tactical text-xs text-zinc-200 bg-black/80 px-2.5 py-1 rounded-xs border border-zinc-700">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15] animate-pulse" />
              <span className="text-[#FACC15] font-bold">{formatDate(state.currentDate)}</span>
            </div>

            {/* Persistent Strategic Turn Tracker Widget */}
            <TurnTrackerWidget />
          </div>

          {/* Zone 2: Tactical Clock Controls & Core Status Meters */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Clock speeds with Black/Yellow/Red tactile states */}
            <div className="flex items-center rounded-xs border-2 border-zinc-700 bg-black p-0.5 shadow-inner">
              <button
                onClick={() => handleSpeed(0)}
                title="Pause simulation"
                className={`p-1.5 transition-colors rounded-xs ${state.clockSpeed === 0 ? 'bg-[#DC2626] text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
              >
                <Pause className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleSpeed(1)}
                title="1x Normal speed (1 day / 2.4s)"
                className={`p-1.5 transition-colors rounded-xs ${state.clockSpeed === 1 ? 'bg-[#FACC15] text-black font-bold' : 'text-zinc-400 hover:text-white'}`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
              <button
                onClick={() => handleSpeed(2)}
                title="2x Fast speed"
                className={`p-1.5 transition-colors rounded-xs ${state.clockSpeed === 2 ? 'bg-[#DC2626] text-white animate-pulse' : 'text-zinc-400 hover:text-white'}`}
              >
                <FastForward className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Advance Day Primary Button */}
            <button
              onClick={() => dispatch({ type: 'ADVANCE_DAY' })}
              className="flex items-center gap-1.5 rounded-xs border-2 border-[#FACC15] bg-black px-2.5 py-1 text-xs font-bold text-[#FACC15] hover:bg-[#FACC15] hover:text-black transition-all shadow-xs active:translate-y-0.5"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#DC2626]" />
              <span className="font-tactical whitespace-nowrap">NEXT DAY</span>
            </button>

            {/* Tactical Resource Meters in Black, Red, Yellow */}
            <div className="hidden lg:flex items-center gap-3 text-xs font-tactical">
              {/* Energy Meter */}
              <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-xs border border-zinc-800">
                <Zap className="h-3.5 w-3.5 text-[#FACC15]" />
                <span className="text-zinc-400 font-medium">ENERGY:</span>
                <span className={`font-bold tabular-nums px-1.5 py-0.2 rounded-xs ${
                  state.player.energy < 25 
                    ? 'bg-red-950/80 text-[#EF4444] border border-red-600 animate-pulse' 
                    : state.player.energy < 50 
                    ? 'bg-yellow-950/80 text-[#FACC15] border border-yellow-600' 
                    : 'text-zinc-100'
                }`}>
                  {state.player.energy}%
                </span>
              </div>

              {/* Stress Meter */}
              <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-xs border border-zinc-800">
                <ShieldAlert className="h-3.5 w-3.5 text-[#EF4444]" />
                <span className="text-zinc-400 font-medium">STRESS:</span>
                <span className={`font-bold tabular-nums px-1.5 py-0.2 rounded-xs ${
                  state.player.stress > 65 
                    ? 'bg-red-950/80 text-[#EF4444] border border-red-600 animate-pulse' 
                    : 'text-zinc-200'
                }`}>
                  {state.player.stress}%
                </span>
              </div>

              {/* Movement Funds */}
              <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-xs border border-zinc-800">
                <span className="text-zinc-400 font-medium">FUNDS:</span>
                <span className="font-bold text-[#FACC15] tabular-nums bg-zinc-900 border border-zinc-700 px-1.5 py-0.2 rounded-xs">
                  ₹{state.movement.movementFunds.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Public Trust */}
              <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-xs border border-zinc-800">
                <Award className="h-3.5 w-3.5 text-[#DC2626]" />
                <span className="text-zinc-400 font-medium">TRUST:</span>
                <span className="font-bold text-[#EF4444] tabular-nums bg-red-950/40 border border-red-900 px-1.5 py-0.2 rounded-xs">
                  {state.movement.publicTrust}/100
                </span>
              </div>
            </div>
          </div>

          {/* Zone 3: 1-2 Primary Actions & Utility */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRest}
              title="Rest for 24 hours to recover energy and relieve stress"
              className="flex items-center gap-1.5 rounded-xs border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-bold text-zinc-200 hover:bg-[#FACC15] hover:text-black hover:border-[#FACC15] transition-colors"
            >
              <Bed className="h-3.5 w-3.5 text-[#FACC15]" />
              <span className="hidden sm:inline font-tactical">Rest</span>
            </button>

            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 rounded-xs bg-[#DC2626] px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 border-2 border-red-500 transition-colors shadow-xs"
            >
              <Save className="h-3.5 w-3.5 text-[#FACC15]" />
              <span className="font-tactical whitespace-nowrap">Save/Load</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                dispatch({ type: 'TOGGLE_THEME' });
              }}
              title={isLight ? 'Switch to Dark War Room Theme' : 'Switch to Light Editorial Theme'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs border border-zinc-700 bg-black/60 text-zinc-200 hover:border-[#FACC15] hover:text-[#FACC15] transition-colors font-tactical text-xs font-bold"
            >
              {isLight ? (
                <>
                  <Moon className="h-3.5 w-3.5 text-[#DC2626]" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5 text-[#FACC15]" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            <button
              onClick={toggleSound}
              title={state.settings.soundEnabled ? 'Mute sound' : 'Enable sound'}
              className="p-1.5 text-zinc-400 hover:text-[#FACC15] transition-colors rounded-xs border border-zinc-800 bg-black/50"
            >
              {state.settings.soundEnabled ? <Volume2 className="h-4 w-4 text-[#FACC15]" /> : <VolumeX className="h-4 w-4 text-zinc-600" />}
            </button>
          </div>

        </div>
      </header>

      {showSaveModal && <SaveLoadModal onClose={() => setShowSaveModal(false)} />}
    </>
  );
}

