'use client';

import React, { useState } from 'react';
import { CalendarClock, Map as MapIcon, TrendingUp } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate } from '@/lib/game/simulation/engine';
import { progressSnapshot, startProgress } from '@/lib/game/simulation/progress';
import { CHAPTER_NAME } from '@/lib/game/simulation/geography';
import type { ProgressSnapshot } from '@/lib/game/types';
import { Badge, PanelHeader, cn } from '@/components/ui/primitives';
import { dayNumber } from '@/components/shell/CampaignRoadmap';

type Key = Exclude<keyof ProgressSnapshot, 'date'>;
const ROWS: { key: Key; label: string; fmt?: (n: number) => string }[] = [
  { key: 'followers', label: 'Followers' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'trust', label: 'Public trust', fmt: n => `${n}%` },
  { key: 'funds', label: 'Movement fund', fmt: n => `₹${Math.round(n).toLocaleString('en-IN')}` },
  { key: 'chapters', label: 'States with a chapter' },
  { key: 'teamSize', label: 'Team' },
  { key: 'avgSupport', label: 'Average seat support', fmt: n => `${n}%` },
  { key: 'seatsContested', label: 'Seats contested' },
  { key: 'seatsWon', label: 'MPs' },
  { key: 'laws', label: 'Laws passed' },
  { key: 'skillTotal', label: 'Your skills (of 60)' },
];
const CHART: { key: Key; label: string }[] = [
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'followers', label: 'Followers' },
  { key: 'chapters', label: 'Chapters' },
  { key: 'trust', label: 'Trust' },
  { key: 'avgSupport', label: 'Seat support' },
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const num = (n: number) => (Number.isInteger(n) ? n.toLocaleString('en-IN') : n.toFixed(1));
const short = (n: number) => (n >= 1e5 ? `${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : num(n));

/** Day one against today, how the movement grew month by month, and where it stands on the map */
export function ThenAndNow() {
  const { state } = useGame();
  const progress = state.progress ?? startProgress(state);
  const start = progress.start;
  const now = progressSnapshot(state);
  const [metric, setMetric] = useState<Key>('volunteers');
  const series = [start, ...progress.monthly, now];
  const max = Math.max(1, ...series.map(s => s[metric]));
  const chapters = state.states.filter(s => s.cjpChapterLevel > 0).sort((a, b) => b.cjpChapterLevel - a.cjpChapterLevel || b.volunteerStrength - a.volunteerStrength);
  const months = Math.max(0, (state.currentDate.year - start.date.year) * 12 + state.currentDate.month - start.date.month);

  return (
    <div className="space-y-5">
      <div className="chunky-sm flex flex-wrap items-center gap-2 bg-raised px-3 py-2 text-sm font-bold text-fg">
        <CalendarClock className="h-4 w-4 text-brand-fg" aria-hidden="true" />
        Day {dayNumber(state.currentDate)} · {months} month{months === 1 ? '' : 's'} since you started on {formatDate(start.date)}
      </div>

      <div>
        <PanelHeader title="Then and now" icon={TrendingUp} />
        <div className="mt-3 overflow-hidden rounded-xl border-2 border-ink">
          <table className="w-full text-sm">
            <thead className="bg-ink text-left text-xs font-extrabold text-on-canvas">
              <tr>
                <th className="px-3 py-2">What</th>
                <th className="px-3 py-2 text-right">Day 1</th>
                <th className="px-3 py-2 text-right">Now</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => {
                const a = start[r.key];
                const b = now[r.key];
                const up = b > a;
                const down = b < a;
                return (
                  <tr key={r.key} className={i % 2 ? 'bg-surface' : 'bg-raised'}>
                    <td className="px-3 py-1.5 font-bold text-fg">{r.label}</td>
                    <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-muted">{r.fmt ? r.fmt(a) : num(a)}</td>
                    <td className={cn('px-3 py-1.5 text-right font-extrabold tabular-nums', up ? 'text-success-fg' : down ? 'text-danger-fg' : 'text-fg')}>
                      {r.fmt ? r.fmt(b) : num(b)} {up ? '▲' : down ? '▼' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-display text-sm text-fg">Month by month</div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Chart metric">
            {CHART.map(c => (
              <button
                key={c.key}
                aria-pressed={metric === c.key}
                onClick={() => setMetric(c.key)}
                className={cn('chunky-sm pressable px-2.5 py-1 text-xs font-extrabold', metric === c.key ? 'bg-brand text-brand-ink' : 'bg-raised text-fg')}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        {progress.monthly.length === 0 ? (
          <p className="mt-3 text-sm font-semibold text-muted">The first monthly snapshot is taken on the 1st of next month.</p>
        ) : (
          <div className="mt-3 flex h-44 items-end gap-1 overflow-x-auto rounded-xl border-2 border-ink bg-inset p-2" role="img" aria-label={`${metric} by month`}>
            {series.map((s, i) => {
              const last = i === series.length - 1;
              return (
                <div key={i} className="flex min-w-7 flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[10px] font-extrabold tabular-nums text-fg">{short(s[metric])}</span>
                  <div className={cn('w-full rounded-t-md border-2 border-ink', last ? 'bg-pink' : 'bg-brand')} style={{ height: `${Math.max(4, (s[metric] / max) * 110)}px` }} />
                  <span className="text-[10px] font-bold text-muted">{i === 0 ? 'Start' : last ? 'Now' : `${MONTHS[s.date.month - 1]}`}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <PanelHeader title={`On the map (${chapters.length})`} icon={MapIcon} />
        {chapters.length === 0 ? (
          <p className="mt-2 text-sm font-semibold text-muted">No state chapters yet. They open at 300 local volunteers.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {chapters.map(s => (
              <li key={s.code}>
                <Badge tone={s.cjpChapterLevel === 3 ? 'pink' : s.cjpChapterLevel === 2 ? 'gold' : 'teal'}>
                  {s.name} · {CHAPTER_NAME[s.cjpChapterLevel].toLowerCase()}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
