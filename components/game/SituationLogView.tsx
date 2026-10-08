'use client';

import React, { useMemo, useState } from 'react';
import { ArrowUpDown, FileText, History, Radio, Search, Star } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import type { GameDate } from '@/lib/game/types';
import { Badge, StatCard, cn } from '@/components/ui/primitives';

export type LogCategory = 'ALL' | 'DIRECTIVES' | 'NEWS' | 'CRITICAL';

interface LogItem {
  id: string;
  date: GameDate;
  kind: 'DECISION' | 'NEWS' | 'CRISIS' | 'MILESTONE';
  title: string;
  summary: string;
  source: string;
  critical: boolean;
}

const KIND: Record<LogItem['kind'], { label: string; tone: 'neutral' | 'teal' | 'danger' | 'success'; strip: string }> = {
  DECISION: { label: 'Decision', tone: 'neutral', strip: 'bg-muted' },
  NEWS: { label: 'News', tone: 'teal', strip: 'bg-teal' },
  CRISIS: { label: 'Crisis', tone: 'danger', strip: 'bg-danger' },
  MILESTONE: { label: 'Milestone', tone: 'success', strip: 'bg-success' },
};
const FILTERS: { value: LogCategory; label: string }[] = [
  { value: 'ALL', label: 'Everything' },
  { value: 'DIRECTIVES', label: 'Decisions & crises' },
  { value: 'NEWS', label: 'News' },
  { value: 'CRITICAL', label: 'Turning points' },
];
const dayKey = (d: GameDate) => d.year * 10000 + d.month * 100 + d.day;

/** One searchable feed of the journal and the news. */
export function SituationLogView() {
  const { state } = useGame();
  const [filter, setFilter] = useState<LogCategory>('ALL');
  const [query, setQuery] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);

  const items = useMemo(() => {
    const list: LogItem[] = [
      ...(state.journal ?? []).map(j => {
        const crisis = j.title.toLowerCase().includes('crisis') || j.text.toLowerCase().includes('directive');
        const milestone = j.significance !== 'MINOR';
        return {
          id: j.id,
          date: j.date,
          kind: crisis ? 'CRISIS' : milestone ? 'MILESTONE' : 'DECISION',
          title: j.title,
          summary: j.text,
          source: 'Your journal',
          critical: j.significance === 'HISTORIC_TURNING_POINT',
        } satisfies LogItem;
      }),
      ...(state.newsFeed ?? []).map(
        n =>
          ({
            id: n.id,
            date: n.date,
            kind: 'NEWS',
            title: n.headline,
            summary: n.body,
            source: n.sourceName,
            critical: n.biasTone === 'SENSATIONAL',
          }) satisfies LogItem,
      ),
    ];
    return list.sort((a, b) => (newestFirst ? dayKey(b.date) - dayKey(a.date) : dayKey(a.date) - dayKey(b.date)));
  }, [state.journal, state.newsFeed, newestFirst]);

  const q = query.trim().toLowerCase();
  const shown = items.filter(i => {
    if (filter === 'DIRECTIVES' && i.kind !== 'DECISION' && i.kind !== 'CRISIS') return false;
    if (filter === 'NEWS' && i.kind !== 'NEWS') return false;
    if (filter === 'CRITICAL' && !i.critical) return false;
    return !q || [i.title, i.summary, i.source].some(s => s.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={History} iconTone="ink" label="Entries" value={items.length} />
        <StatCard icon={FileText} iconTone="saffron" label="Decisions" value={items.filter(i => i.kind === 'DECISION' || i.kind === 'CRISIS').length} />
        <StatCard icon={Radio} iconTone="teal" label="News" value={items.filter(i => i.kind === 'NEWS').length} />
        <StatCard icon={Star} iconTone="pink" label="Turning points" value={items.filter(i => i.critical).length} />
      </div>

      <div className="chunky-sm space-y-2 bg-raised p-2.5">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter the log">
          {FILTERS.map(f => (
            <button
              key={f.value}
              aria-pressed={filter === f.value}
              onClick={() => {
                soundManager.playClick();
                setFilter(f.value);
              }}
              className={cn('chunky-sm pressable px-2.5 py-1 text-xs font-extrabold', filter === f.value ? 'bg-brand text-brand-ink' : 'bg-surface text-fg')}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search the log</span>
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search titles, text, sources"
              className="h-9 w-full rounded-lg border-2 border-ink bg-surface pl-8 pr-2 text-sm font-semibold text-fg"
            />
          </label>
          <button
            onClick={() => {
              soundManager.playClick();
              setNewestFirst(v => !v);
            }}
            className="chunky-sm pressable flex shrink-0 items-center gap-1 bg-surface px-2.5 text-xs font-extrabold text-fg"
          >
            <ArrowUpDown className="h-4 w-4" aria-hidden="true" /> {newestFirst ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-8 text-center text-sm font-semibold text-muted">Nothing matches.</p>
      ) : (
        <ul className="space-y-2.5">
          {shown.map(i => {
            const k = KIND[i.kind];
            return (
              <li key={i.id} className="chunky-sm relative overflow-hidden bg-surface py-3 pl-5 pr-3">
                <span className={cn('absolute inset-y-0 left-0 w-2 border-r-2 border-ink', k.strip)} aria-hidden="true" />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-extrabold text-fg">{formatDate(i.date)}</span>
                  <Badge tone={k.tone}>{k.label}</Badge>
                  {i.critical && <Badge tone="pink">Turning point</Badge>}
                  <span className="text-xs font-semibold text-muted">{i.source}</span>
                </div>
                <h4 className="mt-1 text-base font-extrabold leading-snug text-fg">{i.title}</h4>
                <p className="mt-0.5 text-sm font-semibold leading-relaxed text-fg-2">{i.summary}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
