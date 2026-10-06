'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import type { CrisisOption, StoryEffects } from '@/lib/game/types';
import { ArtPlaceholder } from '@/components/ui/primitives';
import { ChoiceCard, GameDialog } from '@/components/ui/menus';
import { EffectChips } from './StoryEventDialog';

const toEffects = (c: CrisisOption['consequences']): StoryEffects => ({
  trust: c.trustChange,
  funds: c.fundsChange,
  volunteers: c.volunteersChange,
  legalHeat: c.crackdownChange,
  stress: c.stressChange,
  energy: c.energyChange,
  followers: c.followersChange,
});

/** Random (fictional) crisis as a modal card: speaker, 3 options with effect stickers. */
export function CrisisModal() {
  const { state, dispatch } = useGame();
  const crisis = state.activeCrisis;
  // Story events take priority; show the crisis after
  if (!crisis || state.story?.activeEventId) return null;

  const funds = state.movement.movementFunds;
  const resolve = (id: string) => {
    soundManager.playGavel();
    dispatch({ type: 'RESOLVE_CRISIS', choiceId: id });
  };

  return (
    <GameDialog
      open
      dismissible={false}
      title={crisis.title}
      tag={
        <span className="inline-flex -rotate-3 items-center gap-1.5 rounded-lg border-3 border-ink bg-danger px-3 py-1 font-display text-sm text-white shadow-[3px_3px_0_var(--ink)]">
          <ShieldAlert className="h-4 w-4" /> Crisis · {crisis.urgency.toLowerCase()}
        </span>
      }
      art={<ArtPlaceholder label={crisis.title} className="h-full w-full" />}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-muted">
        <span className="rounded-full border border-line-soft px-2 py-0.5">Fictional scenario</span>
      </div>
      <p className="text-base font-semibold leading-relaxed text-fg">{crisis.contextNarrative}</p>
      <p className="mt-3 rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink">
        <span className="font-display text-xs">{crisis.speakerName}</span>
        <span className="text-muted"> · {crisis.speakerRole}</span>
        <br />
        {crisis.quote}
      </p>
      <div className="mt-4 space-y-2.5">
        {crisis.options.map((o, i) => {
          const cost = o.consequences.fundsChange && o.consequences.fundsChange < 0 ? -o.consequences.fundsChange : 0;
          return (
            <ChoiceCard
              key={o.id}
              emphasis={i === 0}
              title={o.label}
              description={o.description}
              effects={<EffectChips effects={toEffects(o.consequences)} />}
              onSelect={() => resolve(o.id)}
              disabled={cost > funds}
              disabledReason={cost ? `Needs ₹${cost.toLocaleString('en-IN')}` : undefined}
            />
          );
        })}
      </div>
      {crisis.sensitive && (
        <p className="mt-4 text-xs font-semibold text-muted">If you or someone you know is struggling, call Tele-MANAS on 14416 (free, 24×7, India).</p>
      )}
    </GameDialog>
  );
}
