'use client';

import React from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { BALANCE } from '@/lib/game/simulation/engine';
import type { GameDate } from '@/lib/game/types';
import { GameDialog } from '@/components/ui/menus';
import { Badge } from '@/components/ui/primitives';

/** Day 1 = 1 June 2026 */
export function dayNumber(d: GameDate): number {
  const start = Date.UTC(2026, 5, 1);
  const cur = Date.UTC(d.year, d.month - 1, d.day);
  return Math.max(0, Math.floor((cur - start) / 86400000)) + 1;
}

const CYCLES = [
  { from: 1, to: 30, title: 'Civil Vigil', desc: `Hold Jantar Mantar and mobilise ${BALANCE.quest1Volunteers.toLocaleString('en-IN')} citizens without getting crushed.` },
  { from: 31, to: 90, title: 'The Investigation', desc: 'Corroborate the paper trails, file a PIL or go public with an exposé.' },
  { from: 91, to: 150, title: 'Party Cadre', desc: `Register with the ECI (${BALANCE.partyVolunteersRequired.toLocaleString('en-IN')} volunteers + ₹${BALANCE.partyRegistrationCost.toLocaleString('en-IN')}) and nominate candidates.` },
  { from: 151, to: Infinity, title: 'Election Blitz', desc: 'Call the election, win seats, build a coalition and pass reforms.' },
];

export function CampaignRoadmapDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state } = useGame();
  const day = dayNumber(state.currentDate);
  return (
    <GameDialog open={open} onOpenChange={onOpenChange} title={`Day ${day} · Campaign Roadmap`} size="md">
      <ol className="space-y-2.5">
        {CYCLES.map((c, i) => {
          const status = day > c.to ? 'done' : day >= c.from ? 'now' : 'next';
          return (
            <li
              key={c.title}
              className={`chunky-sm p-3 ${status === 'now' ? 'bg-accent' : status === 'done' ? 'bg-success-soft' : 'bg-raised opacity-75'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm">
                  {i + 1}. {c.title}
                </span>
                <Badge tone={status === 'now' ? 'pink' : status === 'done' ? 'success' : 'neutral'}>
                  {status === 'now' ? 'NOW' : status === 'done' ? 'DONE' : `DAY ${c.from}+`}
                </Badge>
              </div>
              <p className="mt-1 text-sm font-semibold text-fg-2">{c.desc}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm font-semibold text-muted">The cycles are a guide. You decide when to call the election from the Party desk.</p>
    </GameDialog>
  );
}
