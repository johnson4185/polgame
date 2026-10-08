'use client';

import React from 'react';
import { BookOpen, ExternalLink, Lock, Users } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import type { HistoricalDispatch } from '@/lib/game/types';
import { Badge, Meter, Panel, PanelHeader } from '@/components/ui/primitives';
import { TabPanel, Tabs } from '@/components/ui/menus';

type Status = HistoricalDispatch['verificationStatus'];
const STATUS: Record<Status, { label: string; tone: 'success' | 'teal' | 'gold' | 'neutral' | 'pink' }> = {
  DOCUMENTED_FACT: { label: 'Documented fact', tone: 'success' },
  COURT_RECORD: { label: 'Court record', tone: 'teal' },
  OFFICIAL_PROCEEDING: { label: 'Official proceeding', tone: 'neutral' },
  CONTESTED_CLAIM: { label: 'Contested claim', tone: 'gold' },
  SIMULATED_DRAMATIZATION: { label: 'Dramatised', tone: 'pink' },
};
const FILTERS: { value: 'ALL' | Status; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'DOCUMENTED_FACT', label: 'Facts' },
  { value: 'COURT_RECORD', label: 'Court' },
  { value: 'OFFICIAL_PROCEEDING', label: 'Official' },
  { value: 'CONTESTED_CLAIM', label: 'Contested' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function niceDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return y && m && d ? { day: String(d), month: `${MONTHS[m - 1]} ${y}` } : { day: '', month: iso };
}

/** The real record: sourced entries that unlock as the story reaches their date. */
export function HistoricalArchiveView() {
  const { state } = useGame();
  const all = state.historicalArchive;
  const unlocked = all.filter(d => d.isUnlocked).sort((a, b) => a.historicalDate.localeCompare(b.historicalDate));
  const locked = all.length - unlocked.length;

  return (
    <div className="space-y-4">
      <Panel className="p-4 sm:p-5">
        <PanelHeader title="The real record" icon={BookOpen} />
        <p className="mt-2 text-sm font-semibold text-fg-2">
          How the Cockroach Janta Party really happened, 15 May to 5 October 2026. Every entry comes from published reporting and links its source.
          Where sources disagree, the entry is marked <strong>Contested</strong> and says who claimed what. Gameplay numbers, investigations and some
          characters are fiction and are labelled as such.
        </p>
        <div className="mt-3">
          <div className="flex justify-between text-sm font-extrabold text-fg">
            <span>Entries unlocked</span>
            <span className="tabular-nums">
              {unlocked.length} / {all.length}
            </span>
          </div>
          <Meter value={unlocked.length} max={Math.max(1, all.length)} tone="teal" showValue={false} className="mt-1" />
        </div>
      </Panel>

      <Panel className="p-3 sm:p-4">
        <Tabs
          size="sm"
          tabs={FILTERS.map(f => ({
            value: f.value,
            label: f.label,
            badge: f.value === 'ALL' ? undefined : unlocked.filter(d => d.verificationStatus === f.value).length || undefined,
          }))}
        >
          {FILTERS.map(f => {
            const list = f.value === 'ALL' ? unlocked : unlocked.filter(d => d.verificationStatus === f.value);
            return (
              <TabPanel key={f.value} value={f.value}>
                {list.length === 0 ? (
                  <p className="py-8 text-center text-sm font-semibold text-muted">Nothing here yet.</p>
                ) : (
                  <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[1.6rem] before:top-2 before:w-1 before:rounded-full before:bg-ink/20">
                    {list.map(d => (
                      <Entry key={d.id} entry={d} />
                    ))}
                  </ol>
                )}
                {locked > 0 && (
                  <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-muted">
                    <Lock className="h-4 w-4" aria-hidden="true" /> {locked} more {locked === 1 ? 'entry unlocks' : 'entries unlock'} as the story reaches
                    {locked === 1 ? ' its' : ' their'} date.
                  </p>
                )}
              </TabPanel>
            );
          })}
        </Tabs>
      </Panel>
    </div>
  );
}

function Entry({ entry: d }: { entry: HistoricalDispatch }) {
  const date = niceDate(d.historicalDate);
  const status = STATUS[d.verificationStatus];
  return (
    <li className="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3">
      <div className="chunky-sm z-10 flex h-14 flex-col items-center justify-center self-start bg-brand text-brand-ink">
        <span className="font-display text-lg leading-none">{date.day}</span>
        <span className="mt-0.5 text-center text-[10px] font-extrabold leading-tight">{date.month}</span>
      </div>
      <article className="chunky-sm bg-raised p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={status.tone}>{status.label}</Badge>
          <span className="text-xs font-bold text-muted">{d.sourcePublication}</span>
        </div>
        <h3 className="mt-1.5 text-base font-extrabold leading-snug text-fg">{d.title}</h3>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-fg-2">{d.summary}</p>
        {d.sensitive && (
          <p className="mt-2 rounded-lg border-2 border-ink bg-surface px-2.5 py-1.5 text-xs font-bold text-fg">
            If you or someone you know is struggling, call Tele-MANAS on 14416 (free, 24×7, India).
          </p>
        )}
        <p className="mt-2 border-l-4 border-pink pl-2 text-sm font-semibold text-fg">
          <span className="font-extrabold">Why it matters: </span>
          {d.relevanceToCJP}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <Users className="h-3.5 w-3.5 text-muted" aria-label="People mentioned" />
            {d.peopleMentioned.length ? (
              d.peopleMentioned.map(p => (
                <Badge key={p} tone="neutral">
                  {p}
                </Badge>
              ))
            ) : (
              <span className="text-xs font-semibold text-muted">Not named</span>
            )}
          </div>
          <a
            href={d.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="chunky-sm pressable inline-flex items-center gap-1 bg-surface px-2.5 py-1 text-xs font-extrabold text-fg"
          >
            Source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </article>
    </li>
  );
}
