'use client';

import React from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { ShieldAlert, AlertTriangle, Scale, User, Zap, Award, Flame } from 'lucide-react';

export function CrisisModal() {
  const { state, dispatch } = useGame();
  const crisis = state.activeCrisis;

  if (!crisis) return null;

  const handleResolve = (choiceId: string) => {
    soundManager.playGavel();
    dispatch({ type: 'RESOLVE_CRISIS', choiceId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-xs border-2 border-red-600 bg-[#0C101A] shadow-2xl overflow-hidden text-zinc-100 font-sans">
        
        {/* Top Warning Stripe Accent */}
        <div className="h-2 w-full caution-stripes-red" />

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-800 bg-[#080B11] p-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-red-600 text-white font-black text-xs animate-pulse">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div>
              <span className="stamp-red text-[9px] tracking-wider">CRISIS INTERVENTION · HIGH STAKES</span>
              <h2 className="font-tactical text-lg sm:text-xl font-black text-white leading-tight mt-0.5">
                {crisis.title}
              </h2>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-xs font-mono text-[10px] font-black bg-red-950/80 border border-red-800 text-red-300">
            {crisis.urgency} URGENCY
          </span>
        </div>

        {/* Narrative & Speaker Section */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Speaker Dossier Card */}
          <div className="flex items-start gap-3 rounded-xs border border-zinc-800 bg-black/60 p-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xs border-2 border-zinc-700 bg-zinc-900 text-[#FACC15]">
              <User className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-tactical font-black text-white text-sm">{crisis.speakerName}</span>
                <span className="text-[10px] font-mono text-zinc-400">· {crisis.speakerFaction}</span>
              </div>
              <span className="text-xs text-red-400 font-medium block">{crisis.speakerRole}</span>
              <p className="text-xs italic text-amber-200/90 font-serif pt-1 border-t border-zinc-800/80 mt-1">
                {crisis.quote}
              </p>
            </div>
          </div>

          {/* Context Narrative */}
          <div className="text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-950/40 p-3 rounded-xs border border-zinc-800/80">
            {crisis.contextNarrative}
          </div>

          {/* Decision Choices */}
          <div className="space-y-2.5 pt-2">
            <span className="font-tactical text-[11px] font-black text-zinc-400 tracking-wider uppercase block">
              TACTICAL DIRECTIVES — CHOOSE YOUR RESPONSE:
            </span>

            {crisis.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleResolve(opt.id)}
                className="w-full text-left rounded-xs border-2 border-zinc-800 bg-[#121624] p-3.5 transition-all hover:border-[#FACC15] hover:bg-zinc-900 group shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-tactical font-black text-sm text-white group-hover:text-[#FACC15] transition-colors">
                    {opt.label}
                  </div>
                  <span className="shrink-0 text-[10px] font-mono font-bold text-zinc-400 uppercase bg-black px-1.5 py-0.5 rounded-xs border border-zinc-800">
                    DIRECTIVE
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mt-1 group-hover:text-zinc-300">
                  {opt.description}
                </p>

                {/* Consequences Preview Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-zinc-800/60 font-mono text-[10px]">
                  {opt.consequences.trustChange !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-xs font-bold ${
                      opt.consequences.trustChange > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                    }`}>
                      {opt.consequences.trustChange > 0 ? `+${opt.consequences.trustChange}` : opt.consequences.trustChange}% Trust
                    </span>
                  )}
                  {opt.consequences.volunteersChange !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-xs bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                      +{opt.consequences.volunteersChange} Volunteers
                    </span>
                  )}
                  {opt.consequences.fundsChange !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-xs font-bold ${
                      opt.consequences.fundsChange > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                    }`}>
                      {opt.consequences.fundsChange > 0 ? `+₹${opt.consequences.fundsChange.toLocaleString('en-IN')}` : `-₹${Math.abs(opt.consequences.fundsChange).toLocaleString('en-IN')}`}
                    </span>
                  )}
                  {opt.consequences.crackdownChange !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-xs font-bold ${
                      opt.consequences.crackdownChange < 0 ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-red-950 text-red-300 border border-red-800'
                    }`}>
                      {opt.consequences.crackdownChange > 0 ? `+${opt.consequences.crackdownChange}` : opt.consequences.crackdownChange}% State Alert
                    </span>
                  )}
                  {opt.consequences.stressChange !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-xs font-bold ${
                      opt.consequences.stressChange < 0 ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-orange-950 text-orange-300 border border-orange-800'
                    }`}>
                      {opt.consequences.stressChange > 0 ? `+${opt.consequences.stressChange}` : opt.consequences.stressChange}% Stress
                    </span>
                  )}
                </div>
              </button>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}
