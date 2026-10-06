'use client';

import React, { useId, useState } from 'react';
import { BarChart3, Flag } from 'lucide-react';
import { Panel, PanelHeader, Button } from '@/components/ui/primitives';
import { useGame } from '@/lib/game/context/GameContext';
import { useCampaignStatistics } from './CampaignStatisticsProvider';
import { DailySnapshot, dateKey, METRICS, Metric, recentHistory } from '@/lib/game/statistics/history';

const LABELS: Record<Metric, string> = { funds: 'Movement funds', followers: 'Followers', trust: 'Public trust', volunteers: 'Volunteers', credibility: 'Credibility', legalHeat: 'Legal heat' };
const number = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });
function valueLabel(metric: Metric, value: number) {
  return metric === 'funds' ? `₹${number.format(value)}` : `${number.format(value)}${metric === 'volunteers' || metric === 'followers' ? '' : '%'}`;
}
function dateLabel(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function TrendChart({ points, metric }: { points: DailySnapshot[]; metric: Metric }) {
  const id = useId();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const matchingIndex = points.findIndex(point => point.date === selectedDate);
  const selectedIndex = matchingIndex >= 0 ? matchingIndex : points.length - 1;
  const point = points[selectedIndex];
  if (!point) return <p className="py-8 text-muted">Begin your campaign to record its first snapshot.</p>;
  const max = metric === 'funds' || metric === 'volunteers' || metric === 'followers' ? Math.max(1, ...points.map(item => item[metric])) : 100;
  const time = (date: string) => Date.parse(`${date}T00:00:00Z`);
  const start = time(points[0].date);
  const span = time(points[points.length - 1].date) - start;
  const x = (item: DailySnapshot) => span ? 52 + (time(item.date) - start) / span * 290 : 197;
  const y = (item: DailySnapshot) => 190 - item[metric] / max * 160;
  const polyline = points.map(item => `${x(item)},${y(item)}`).join(' ');
  return (
    <div className="min-w-0 space-y-3">
      <p id={`${id}-reading`} className="text-center font-bold text-fg" aria-live="polite">
        {dateLabel(point.date)} · {valueLabel(metric, point[metric])}
      </p>
      <svg viewBox="0 0 360 220" className="mx-auto w-full max-w-xl text-brand-fg" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{LABELS[metric]} over time</title>
        <desc id={`${id}-desc`}>Recorded dates from {dateLabel(points[0].date)} to {dateLabel(points[points.length - 1].date)}. Use the date slider or data table below for exact values.</desc>
        {[0, 0.5, 1].map(fraction => (
          <g key={fraction}>
            <line x1="52" x2="342" y1={190 - fraction * 160} y2={190 - fraction * 160} stroke="var(--ink)" opacity="0.15" />
            <text x="44" y={194 - fraction * 160} textAnchor="end" fill="var(--fg-2)" fontSize="12">
              {new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(max * fraction)}
            </text>
          </g>
        ))}
        <polyline points={polyline} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <line x1={x(point)} x2={x(point)} y1="24" y2="190" stroke="var(--ink)" strokeDasharray="4 4" opacity="0.4" />
        <circle cx={x(point)} cy={y(point)} r="6" fill="var(--brand)" stroke="var(--ink)" strokeWidth="2" />
      </svg>
      {points.length > 1 ? (
        <div>
          <label htmlFor={`${id}-date`} className="text-sm font-bold">Explore recorded dates</label>
          <input id={`${id}-date`} type="range" min="0" max={points.length - 1} value={selectedIndex}
            onChange={event => setSelectedDate(points[Number(event.target.value)].date)}
            aria-valuetext={`${dateLabel(point.date)}: ${valueLabel(metric, point[metric])}`}
            className="block min-h-11 w-full accent-brand" />
          <div className="flex flex-wrap justify-between gap-2 text-xs text-muted">
            <span>{dateLabel(points[0].date)}</span><span>{dateLabel(points[points.length - 1].date)}</span>
          </div>
        </div>
      ) : <p className="text-sm text-muted">Your first snapshot is ready. End a day to start a trend.</p>}
    </div>
  );
}

export function CampaignStatistics() {
  const { state } = useGame();
  const { history, persistent } = useCampaignStatistics();
  const [metric, setMetric] = useState<Metric>('funds');
  const [days, setDays] = useState('30');
  const [eventLimit, setEventLimit] = useState(10);
  const id = useId();
  const points = recentHistory(history, days === 'all' ? null : Number(days));
  const first = points[0];
  const last = points[points.length - 1];
  const events = state.journal.filter(entry => entry.significance !== 'MINOR' && dateKey(entry.date) <= dateKey(state.currentDate))
    .sort((a, b) => dateKey(b.date).localeCompare(dateKey(a.date)));
  return (
    <div className="min-w-0 space-y-5">
      <Panel className="space-y-4 p-4 sm:p-5">
        <PanelHeader title="Campaign statistics" icon={BarChart3} />
        <p className="text-sm text-fg-2">See how your movement changes. Each recorded day keeps its latest resource totals; today updates as you play.</p>
        {!persistent && <p role="status" className="rounded-lg border border-danger-line bg-danger-soft p-3 text-sm text-danger-fg">Browser storage is unavailable or full. Statistics are available for this session but may not survive a reload.</p>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label htmlFor={`${id}-metric`} className="text-sm font-bold">Resource
            <select id={`${id}-metric`} value={metric} onChange={event => setMetric(event.target.value as Metric)} className="mt-1 block min-h-11 w-full rounded-lg border-2 border-ink bg-raised px-3 text-fg">
              {METRICS.map(key => <option key={key} value={key}>{LABELS[key]}</option>)}
            </select>
          </label>
          <label htmlFor={`${id}-window`} className="text-sm font-bold">Period
            <select id={`${id}-window`} value={days} onChange={event => setDays(event.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border-2 border-ink bg-raised px-3 text-fg">
              <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="all">All recorded days</option>
            </select>
          </label>
        </div>
        {first && last && <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ['Latest recorded', valueLabel(metric, last[metric])],
            ['Change in period', `${last[metric] - first[metric] > 0 ? '+' : ''}${metric === 'funds' || metric === 'volunteers' || metric === 'followers' ? valueLabel(metric, last[metric] - first[metric]) : `${number.format(last[metric] - first[metric])} percentage points`}`],
            ['Peak in period', valueLabel(metric, Math.max(...points.map(point => point[metric])))],
          ].map(([label, value]) => <div key={label} className="chunky-sm min-w-0 bg-inset p-3"><p className="text-xs text-muted">{label}</p><p className="break-words text-lg font-bold text-fg">{value}</p></div>)}
        </div>}
        {metric === 'legalHeat' && <p className="text-sm text-fg-2">Lower legal heat means less pressure on your movement.</p>}
        <TrendChart points={points} metric={metric} />
        <p className="text-xs text-muted">{history.length ? `Recording since ${dateLabel(history[0].date)}. ` : ''}Up to 730 recorded days, stored in this browser separately from saves. Missing days are not reconstructed. Loading an earlier save replaces this campaign’s later statistics.</p>
        {points.length > 0 && <details className="rounded-lg border-2 border-ink bg-inset p-3">
          <summary className="cursor-pointer font-bold">View exact values ({points.length} recorded days)</summary>
          <div className="mt-3 max-h-72 overflow-y-auto">
            <table className="w-full text-left text-sm"><caption className="sr-only">{LABELS[metric]} by recorded date</caption>
              <thead><tr><th scope="col" className="py-2">Date</th><th scope="col" className="py-2 text-right">{LABELS[metric]}</th></tr></thead>
              <tbody>{[...points].reverse().map(point => <tr key={point.date} className="border-t border-ink/15"><th scope="row" className="py-2 font-normal">{dateLabel(point.date)}</th><td className="py-2 text-right tabular-nums">{valueLabel(metric, point[metric])}</td></tr>)}</tbody>
            </table>
          </div>
        </details>}
      </Panel>
      <Panel className="space-y-4 p-4 sm:p-5">
        <PanelHeader title="Major decisions" icon={Flag} />
        <p className="text-sm text-fg-2">Milestones and turning points from your campaign journal, newest first.</p>
        {!events.length && <p className="text-muted">Your first major decision will appear here when it reaches the journal.</p>}
        <ol className="space-y-3">
          {events.slice(0, eventLimit).map(entry => <li key={entry.id} className="border-l-4 border-ink pl-3">
            <time dateTime={dateKey(entry.date)} className="text-xs font-bold text-brand-fg">{dateLabel(dateKey(entry.date))}</time>
            <h3 className="font-bold text-fg">{entry.title}</h3><p className="break-words text-sm text-fg-2">{entry.text}</p>
          </li>)}
        </ol>
        {events.length > eventLimit && <Button variant="secondary" size="sm" onClick={() => setEventLimit(limit => limit + 10)}>Show more</Button>}
      </Panel>
    </div>
  );
}
