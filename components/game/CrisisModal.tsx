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
    <div className="theme-dark-scope fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-xs border-2 border-red-600 bg-surface shadow-2xl overflow-hidden text-fg font-sans">
        
        {/* Top Warning Stripe Accent */}
        <div className="h-2 w-full caution-stripes-red" />

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-line bg-canvas p-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-red-600 text-white font-black text-xs animate-pulse">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div>
              <span className="stamp-red text-[9px] tracking-wider">CRISIS INTERVENTION · HIGH STAKES</span>
              <h2 className="font-display text-lg sm:text-xl font-bold text-fg leading-tight mt-0.5">
                {crisis.title}
              </h2>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-xs font-mono text-[10px] font-black bg-danger-soft border border-danger-line text-danger-fg">
            {crisis.urgency} URGENCY
          </span>
        </div>

        {/* Narrative & Speaker Section */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Speaker Dossier Card */}
          <div className="flex items-start gap-3 rounded-xs border border-line bg-inset p-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xs border-2 border-line-strong bg-raised text-accent-fg">
              <User className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-tactical font-black text-fg text-sm">{crisis.speakerName}</span>
                <span className="text-[10px] font-mono text-muted">· {crisis.speakerFaction}</span>
              </div>
              <span className="text-xs text-danger-fg font-medium block">{crisis.speakerRole}</span>
              <p className="text-xs italic text-accent-fg font-serif pt-1 border-t border-line mt-1">
                {crisis.quote}
              </p>
            </div>
          </div>

          {/* Context Narrative */}
          <div className="text-xs text-fg-2 leading-relaxed font-sans bg-raised p-3 rounded-xs border border-line">
            {crisis.contextNarrative}
          </div>

          {/* Decision Choices */}
          <div className="space-y-2.5 pt-2">
            <span className="font-tactical text-[11px] font-black text-muted tracking-wider uppercase block">
              TACTICAL DIRECTIVES — CHOOSE YOUR RESPONSE:
            </span>

            {crisis.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleResolve(opt.id)}
                className="w-full text-left rounded-xs border-2 border-line bg-raised p-3.5 transition-all hover:border-accent hover:bg-raised group shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-tactical font-black text-sm text-fg group-hover:text-accent-fg transition-colors">
                    {opt.label}
                  </div>
                  <span className="shrink-0 text-[10px] font-mono font-bold text-muted uppercase bg-inset px-1.5 py-0.5 rounded-xs border border-line">
                    DIRECTIVE
                  </span>
                </div>

                <p className="text-xs text-muted mt-1 group-hover:text-fg-2">
                  {opt.description}
                </p>

                {/* Consequences Preview Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-line font-mono text-[10px]">
                  {opt.consequences.trustChange !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-xs font-bold ${
                      opt.consequences.trustChange > 0 ? 'bg-success-soft text-success-fg border border-success-line' : 'bg-danger-soft text-danger-fg border border-danger-line'
                    }`}>
                      {opt.consequences.trustChange > 0 ? `+${opt.consequences.trustChange}` : opt.consequences.trustChange}% Trust
                    </span>
                  )}
                  {opt.consequences.volunteersChange !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-xs bg-accent-soft text-accent-fg border border-accent-line font-bold">
                      +{opt.consequences.volunteersChange} Volunteers
                    </span>
                  )}
                  {opt.consequences.fundsChange !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-xs font-bold ${
                      opt.consequences.fundsChange > 0 ? 'bg-success-soft text-success-fg border border-success-line' : 'bg-danger-soft text-danger-fg border border-danger-line'
                    }`}>
                      {opt.consequences.fundsChange > 0 ? `+₹${opt.consequences.fundsChange.toLocaleString('en-IN')}` : `-₹${Math.abs(opt.consequences.fundsChange).toLocaleString('en-IN')}`}
                    </span>
                  )}
                  {opt.consequences.crackdownChange !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-xs font-bold ${
                      opt.consequences.crackdownChange < 0 ? 'bg-info-soft text-info-fg border border-info-line' : 'bg-danger-soft text-danger-fg border border-danger-line'
                    }`}>
                      {opt.consequences.crackdownChange > 0 ? `+${opt.consequences.crackdownChange}` : opt.consequences.crackdownChange}% Crackdown
                    </span>
                  )}
                  {opt.consequences.stressChange !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-xs font-bold ${
                      opt.consequences.stressChange < 0 ? 'bg-info-soft text-info-fg border border-info-line' : 'bg-accent-soft text-accent-fg border border-accent-line'
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
