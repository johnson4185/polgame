'use client';

import React from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { BALANCE, isoDate } from '@/lib/game/simulation/engine';
import type { GameDate } from '@/lib/game/types';
import { GameDialog } from '@/components/ui/menus';
import { Badge } from '@/components/ui/primitives';

/** Day 1 = 16 May 2026, the day the campaign opens */
export function dayNumber(d: GameDate): number {
  const start = Date.UTC(2026, 4, 16);
  const cur = Date.UTC(d.year, d.month - 1, d.day);
  return Math.max(0, Math.floor((cur - start) / 86400000)) + 1;
}

// The real arc of Act 1 (docs/cjp-timeline.md), then the sandbox
const PHASES = [
  { from: '2026-05-16', to: '2026-05-31', title: 'Go Viral', desc: 'A six-word post becomes a movement. Expect blocks, takedowns and attacks online.' },
  { from: '2026-06-01', to: '2026-06-19', title: 'Offline', desc: 'Come home, take the movement to Jantar Mantar and tour the cities.' },
  { from: '2026-06-20', to: '2026-07-25', title: 'The Long Sit-in', desc: 'Hold Jantar Mantar until the Education Minister resigns. The 20 July march is the big test.' },
  { from: '2026-07-26', to: '2026-09-22', title: 'School Thik Karo', desc: 'Turn protest into audits of government schools, and hold the government to its promises.' },
  { from: '2026-09-23', to: '2026-10-04', title: 'The Election Commission', desc: 'A new target: the Chief Election Commissioner.' },
  {
    from: '2026-10-05',
    to: '9999-12-31',
    title: 'Act 2: Your History',
    desc: `The record ends. Register the party (${BALANCE.partyVolunteersRequired.toLocaleString('en-IN')} volunteers + ₹${BALANCE.partyRegistrationCost.toLocaleString('en-IN')}), contest elections, form a government.`,
  },
];

const fmt = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export function CampaignRoadmapDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state } = useGame();
  const today = isoDate(state.currentDate);
  return (
    <GameDialog open={open} onOpenChange={onOpenChange} title={`Day ${dayNumber(state.currentDate)} · Roadmap`} size="md">
      <ol className="space-y-2.5">
        {PHASES.map((p, i) => {
          const status = today > p.to ? 'done' : today >= p.from ? 'now' : 'next';
          return (
            <li key={p.title} className={`chunky-sm p-3 ${status === 'now' ? 'bg-accent' : status === 'done' ? 'bg-success-soft' : 'bg-raised opacity-80'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm">
                  {i + 1}. {p.title}
                </span>
                <Badge tone={status === 'now' ? 'pink' : status === 'done' ? 'success' : 'neutral'}>
                  {status === 'now' ? 'NOW' : status === 'done' ? 'DONE' : `FROM ${fmt(p.from).toUpperCase()}`}
                </Badge>
              </div>
              <p className="mt-1 text-sm font-semibold text-fg-2">{p.desc}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm font-semibold text-muted">Act 1 follows the real record. Your choices can change how it goes.</p>
    </GameDialog>
  );
}
