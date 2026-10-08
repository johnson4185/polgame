'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { MOOD_LIMIT, describeMood, initialMood } from '@/lib/game/simulation/country';
import { Panel, PanelHeader, cn } from '@/components/ui/primitives';

const MOOD_MIN = -MOOD_LIMIT;

/** One alliance's swing, drawn from the centre: right is gaining, left is losing */
function SwingBar({ label, value, fill }: { label: string; value: number; fill: string }) {
  const pct = (Math.min(MOOD_LIMIT, Math.abs(value)) / MOOD_LIMIT) * 50;
  return (
    <div>
      <div className="flex justify-between text-xs font-extrabold text-fg">
        <span>{label}</span>
        <span className="tabular-nums">
          {value > 0 ? '+' : ''}
          {value.toFixed(1)} pts
        </span>
      </div>
      <div className="relative mt-0.5 h-3.5 overflow-hidden rounded-full border-2 border-ink bg-inset" role="meter" aria-label={`${label} swing`} aria-valuenow={value} aria-valuemin={MOOD_MIN} aria-valuemax={MOOD_LIMIT}>
        <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-ink" aria-hidden="true" />
        <span className={cn('absolute inset-y-0', fill)} style={value >= 0 ? { left: '50%', width: `${pct}%` } : { right: '50%', width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** The country's mood (L5): how the two big alliances are doing nationally */
export function NationalMoodPanel({ className }: { className?: string }) {
  const { state } = useGame();
  const mood = state.nationalMood ?? initialMood();
  return (
    <Panel className={cn('p-4', className)}>
      <PanelHeader title="National mood" icon={Activity} />
      <p className="mt-1 text-sm font-semibold text-fg-2">{describeMood(mood)}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SwingBar label="NDA (ruling)" value={mood.nda} fill="bg-brand" />
        <SwingBar label="INDIA (opposition)" value={mood.india} fill="bg-teal" />
      </div>
      <p className="mt-2 text-xs font-semibold text-muted">
        Swings apply to every seat on election day. Anti-incumbency wears the government down month by month, and your exposés and court wins hurt it
        too. After each election the slate is wiped clean and seats change hands.
      </p>
    </Panel>
  );
}
