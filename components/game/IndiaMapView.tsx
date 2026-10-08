'use client';

import React, { useState } from 'react';
import { Flag, MapPin, Megaphone, Search, UserCheck, Users } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { BALANCE } from '@/lib/game/simulation/engine';
import { CHAPTER_DECLINE_DAYS, CHAPTER_DECLINE_SHARE, CHAPTER_NAME, CHAPTER_THRESHOLDS, SUPPORT_CAP, supportTarget } from '@/lib/game/simulation/geography';
import { soundManager } from '@/lib/game/simulation/sound';
import type { LokSabhaConstituency, StateData } from '@/lib/game/types';
import { NationalMoodPanel } from './NationalMoodPanel';
import { Badge, Button, Meter, Panel, PanelHeader, SegmentMeter, StatCard, cn } from '@/components/ui/primitives';

const ZONES: Record<string, string[]> = {
  North: ['DL', 'UP', 'PB', 'HR', 'RJ', 'UK', 'HP', 'JK', 'LA', 'CH'],
  South: ['KA', 'TN', 'AP', 'TG', 'KL', 'PY', 'LD'],
  East: ['WB', 'BR', 'JH', 'OD', 'AN'],
  West: ['MH', 'GJ', 'GA', 'DN'],
  Central: ['MP', 'CG'],
  'North-east': ['AS', 'TR', 'MN', 'ML', 'NL', 'MZ', 'AR', 'SK'],
};
const MOOD: Record<StateData['regionalMood'], { label: string; tone: 'success' | 'danger' | 'gold' | 'neutral' }> = {
  REFORM_RECEPTIVE: { label: 'Open to reform', tone: 'success' },
  ANTI_INCUMBENCY: { label: 'Anti-incumbent', tone: 'danger' },
  VOLATILE: { label: 'Volatile', tone: 'gold' },
  RULING_LEAN: { label: 'Leans ruling', tone: 'neutral' },
};
const CHAPTER = CHAPTER_NAME;
const CHAPTER_DOT = ['bg-inset', 'bg-teal', 'bg-accent', 'bg-pink'];
// The engine caps support from grassroots blitzes at this level
const BLITZ_CAP = SUPPORT_CAP;

/** India by state: pick a state, read its mood and issues, and campaign seat by seat. */
export function IndiaMapView() {
  const { state } = useGame();
  const [code, setCode] = useState('DL');
  const [zone, setZone] = useState('All');
  const [query, setQuery] = useState('');

  const current = state.states.find(s => s.code === code) ?? state.states[0];
  const seats = state.constituencies.filter(c => c.state === current.name);
  const q = query.trim().toLowerCase();
  const list = state.states.filter(s => (zone === 'All' || ZONES[zone]?.includes(s.code)) && (!q || s.name.toLowerCase().includes(q)));

  const chapters = state.states.filter(s => s.cjpChapterLevel > 0).length;
  const volunteers = state.states.reduce((n, s) => n + s.volunteerStrength, 0);
  const candidates = state.constituencies.filter(c => c.cjpCandidate).length;
  const globalBlocker =
    state.actionPoints < 1
      ? 'No action points left today.'
      : state.movement.movementFunds < BALANCE.boostCost
        ? `The movement fund is below ₹${BALANCE.boostCost.toLocaleString('en-IN')}.`
        : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Flag} iconTone="pink" label="States with a chapter" value={`${chapters} / ${state.states.length}`} />
        <StatCard icon={Users} iconTone="teal" label="Volunteers in states" value={volunteers.toLocaleString('en-IN')} />
        <StatCard icon={UserCheck} iconTone="saffron" label="Seats contested" value={`${candidates} / 543`} />
      </div>

      <NationalMoodPanel />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Panel className="p-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Region">
            {['All', ...Object.keys(ZONES)].map(z => (
              <button
                key={z}
                aria-pressed={zone === z}
                onClick={() => setZone(z)}
                className={cn('chunky-sm pressable px-2.5 py-1 text-xs font-extrabold', zone === z ? 'bg-brand text-brand-ink' : 'bg-raised text-fg')}
              >
                {z}
              </button>
            ))}
          </div>
          <label className="relative mt-2 block">
            <span className="sr-only">Search states</span>
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search a state or UT"
              className="h-9 w-full rounded-lg border-2 border-ink bg-surface pl-8 pr-2 text-sm font-semibold text-fg"
            />
          </label>
          <ul className="mt-2 max-h-80 space-y-1.5 overflow-y-auto pr-1 lg:max-h-[36rem]" aria-label="States and union territories">
            {list.length === 0 && <li className="py-6 text-center text-sm font-semibold text-muted">No match.</li>}
            {list.map(s => {
              const on = s.code === current.code;
              return (
                <li key={s.code}>
                  <button
                    aria-current={on}
                    onClick={() => {
                      soundManager.playClick();
                      setCode(s.code);
                    }}
                    className={cn('chunky-sm pressable flex w-full items-center gap-2 p-2 text-left', on ? 'bg-brand text-brand-ink' : 'bg-raised text-fg')}
                  >
                    <span className={cn('h-3 w-3 shrink-0 rounded-full border-2 border-ink', CHAPTER_DOT[s.cjpChapterLevel])} aria-label={CHAPTER[s.cjpChapterLevel]} />
                    <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{s.name}</span>
                    <Badge tone={MOOD[s.regionalMood].tone}>{MOOD[s.regionalMood].label}</Badge>
                    <span className="w-7 shrink-0 text-right text-sm font-extrabold tabular-nums">{s.seatsTotal}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-xl text-fg">{current.name}</h2>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge tone="neutral">{current.type === 'UT' ? 'Union territory' : 'State'}</Badge>
                  <Badge tone="neutral">Capital: {current.capital}</Badge>
                  <Badge tone="neutral">{current.seatsTotal} seats</Badge>
                  <Badge tone={MOOD[current.regionalMood].tone}>{MOOD[current.regionalMood].label}</Badge>
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-xs font-bold text-muted">Your presence</div>
                <div className="mt-1 flex sm:justify-end">
                  <SegmentMeter value={current.cjpChapterLevel} max={3} segments={3} tone="pink" />
                </div>
                <div className="mt-0.5 text-sm font-extrabold text-fg">{CHAPTER[current.cjpChapterLevel]}</div>
              </div>
            </div>
            <div className="mt-3 text-sm font-bold text-fg">What people here care about</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {current.dominantIssues.map(i => (
                <Badge key={i} tone="saffron">
                  {i}
                </Badge>
              ))}
            </div>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-fg-2 sm:grid-cols-2">
              <div>
                <span className="font-extrabold text-fg">Local leads: </span>
                {current.keyLeaders.length ? current.keyLeaders.join(', ') : 'None yet'}
              </div>
              <div className="sm:text-right">
                <span className="font-extrabold text-fg">Volunteers here: </span>
                {current.volunteerStrength.toLocaleString('en-IN')}
              </div>
            </div>
            <ChapterProgress st={current} />
          </Panel>

          <Panel className="p-4">
            <PanelHeader title={`Seats (${seats.length})`} icon={MapPin} />
            <p className="mt-1 text-xs font-semibold text-muted">
              Support drifts towards what your presence here justifies: national trust, the local chapter and volunteers. A grassroots blitz (1 AP,
              ₹{BALANCE.boostCost.toLocaleString('en-IN')}) pushes it faster; neither goes past {BLITZ_CAP}%.
            </p>
            {globalBlocker && <p className="chunky-sm mt-2 bg-accent px-3 py-2 text-sm font-bold text-ink">{globalBlocker} Blitzes are paused.</p>}
            <ul className="mt-3 max-h-[32rem] space-y-2 overflow-y-auto pr-1">
              {seats.map(c => (
                <li key={c.id}>
                  <SeatCard seat={c} paused={!!globalBlocker} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function SeatCard({ seat: c, paused }: { seat: LokSabhaConstituency; paused: boolean }) {
  const { state, dispatch } = useGame();
  const target = supportTarget(state, c, state.states.find(st => st.name === c.state));
  const atCap = c.cjpSupportScore >= BLITZ_CAP;
  return (
    <div className="chunky-sm bg-raised p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-base font-extrabold text-fg">{c.name}</span>
            <Badge tone="neutral">{c.category === 'GEN' ? 'General' : c.category}</Badge>
          </div>
          <div className="text-xs font-semibold text-muted">
            Held by {c.incumbentParty} · about {(c.totalVotersEstimated / 100000).toFixed(1)} lakh voters
          </div>
          {c.cjpCandidate && (
            <div className="mt-0.5 text-xs font-bold text-fg">
              Your candidate: {c.cjpCandidate.name} (₹{c.cjpCandidate.campaignFundingAllocated.toLocaleString('en-IN')} fund)
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="pink"
          icon={Megaphone}
          disabled={atCap || paused}
          onClick={() => {
            soundManager.playClick();
            dispatch({ type: 'BOOST_CONSTITUENCY', constituencyId: c.id });
          }}
        >
          Blitz · 1 AP
        </Button>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-xs font-extrabold text-fg">
          <span>
            Your support{' '}
            <span className="font-semibold text-muted">
              {target > c.cjpSupportScore ? `(rising towards ${target}%)` : state.movement.publicTrust < 25 && target < c.cjpSupportScore ? `(falling towards ${target}%)` : ''}
            </span>
          </span>
          <span className="tabular-nums">{c.cjpSupportScore}%</span>
        </div>
        <Meter value={c.cjpSupportScore} tone="brand" showValue={false} className="mt-0.5" />
        <div className="mt-1 flex flex-wrap justify-between gap-x-3 text-xs font-semibold text-muted">
          <span>Ruling alliance last time: {c.rulingVoteShareBaseline}%</span>
          <span>Main opposition: {c.mainOppVoteShareBaseline}%</span>
        </div>
        {atCap && <div className="mt-1 text-xs font-bold text-muted">At the {BLITZ_CAP}% blitz limit: nominate a candidate and fund their campaign to go further.</div>}
      </div>
    </div>
  );
}

/** Local volunteers against the next chapter threshold, and a warning when the chapter is fading */
function ChapterProgress({ st }: { st: StateData }) {
  const level = st.cjpChapterLevel;
  const next = level < 3 ? CHAPTER_THRESHOLDS[(level + 1) as 1 | 2 | 3] : null;
  const floor = level > 0 ? Math.round(CHAPTER_THRESHOLDS[level] * CHAPTER_DECLINE_SHARE) : 0;
  const fading = level > 0 && st.volunteerStrength < floor;
  return (
    <div className="mt-3">
      {next ? (
        <>
          <div className="flex justify-between text-xs font-extrabold text-fg">
            <span>Towards {CHAPTER[level + 1].toLowerCase()}</span>
            <span className="tabular-nums">
              {Math.min(st.volunteerStrength, next).toLocaleString('en-IN')} / {next.toLocaleString('en-IN')} volunteers
            </span>
          </div>
          <Meter value={Math.min(st.volunteerStrength, next)} max={next} tone="pink" showValue={false} className="mt-0.5" />
        </>
      ) : (
        <p className="text-xs font-bold text-success-fg">A mass movement: the strongest a chapter gets.</p>
      )}
      {fading && (
        <p className="mt-1.5 text-xs font-bold text-danger-fg">
          Fading: under {floor.toLocaleString('en-IN')} volunteers for {st.neglectDays ?? 0} of {CHAPTER_DECLINE_DAYS} days before it shrinks. Run a campaign
          here to bring people back.
        </p>
      )}
      <p className="mt-1 text-xs font-semibold text-muted">Volunteers settle where you have chapters, campaigns and support.</p>
    </div>
  );
}
