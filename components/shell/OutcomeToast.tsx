'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, XCircle } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import type { ActionOutcome } from '@/lib/game/types';

/** Shows the engine's real result of the last action (state.lastOutcome) for a few seconds. */
export function OutcomeToast() {
  const { state } = useGame();
  const [dismissedId, setDismissedId] = useState(0);
  const outcome = state.lastOutcome;
  const toast: ActionOutcome | null = outcome && outcome.id !== dismissedId ? outcome : null;

  useEffect(() => {
    if (!outcome) return;
    const t = setTimeout(() => setDismissedId(outcome.id), 3800);
    return () => clearTimeout(t);
  }, [outcome]);

  if (!toast) return null;
  const tone =
    toast.tone === 'FAILURE'
      ? { bg: 'bg-danger text-white', Icon: XCircle }
      : toast.tone === 'WARNING'
        ? { bg: 'bg-accent text-ink', Icon: AlertTriangle }
        : { bg: 'bg-success text-white', Icon: Sparkles };

  return (
    <div
      key={toast.id}
      role="status"
      onClick={() => setDismissedId(toast.id)}
      className={`chunky fixed left-3 right-3 top-3 z-[90] flex cursor-pointer items-start gap-2 px-4 py-3 text-sm font-bold animate-in slide-in-from-top-6 fade-in-0 duration-300 sm:left-auto sm:max-w-md ${tone.bg}`}
    >
      <tone.Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
      <span className="leading-snug">{toast.text}</span>
    </div>
  );
}
