'use client';

import React from 'react';
import { CheckCircle, Flag, Handshake, Landmark, Radio, Sparkles, Trophy, Vote } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { BALANCE } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import { Badge, Button, EffectChip, Meter, Panel, PanelHeader, cn } from '@/components/ui/primitives';
import { ChoiceCard } from '@/components/ui/menus';
import { NationalMoodPanel } from './NationalMoodPanel';

const TOTAL = 543;
const MAJORITY = BALANCE.majority;

/** Election night: live count, the 543-seat bar with the 272 line, then the coalition choice. */
export function ElectionNightView() {
  const { state, dispatch } = useGame();
  const live = state.electionLiveState;
  const abbr = state.party.abbreviation || 'CJP';

  if (!live.isCountingUnderway && !live.isCountingFinished) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Panel className="px-6 py-10 text-center">
          <Vote className="mx-auto h-12 w-12 text-brand-fg" strokeWidth={2.5} aria-hidden="true" />
          <h2 className="mt-3 font-display text-xl text-fg">No election called yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-fg-2">
            {state.party.isFormed
              ? `Nominate candidates on the Party screen, then call the general election. You have ${state.party.candidateCount} candidate${state.party.candidateCount === 1 ? '' : 's'}, projected to win ${state.party.projectedSeats} seat${state.party.projectedSeats === 1 ? '' : 's'}.`
              : 'Register the party with the Election Commission first, then nominate candidates and call the election.'}
          </p>
          <Button className="mt-5" icon={Landmark} onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'PARTY_ECI' })}>
            Go to the Party screen
          </Button>
        </Panel>
        <NationalMoodPanel />
      </div>
    );
  }

  const blocs = [
    { key: 'NDA', label: 'NDA (ruling)', seats: live.rulingSeats, fill: 'bg-brand', text: 'text-brand-ink' },
    { key: abbr, label: abbr, seats: live.cjpSeats, fill: 'bg-pink', text: 'text-white' },
    { key: 'INDIA', label: 'INDIA (opposition)', seats: live.oppositionSeats, fill: 'bg-teal', text: 'text-white' },
    { key: 'OTH', label: 'Others', seats: live.otherSeats, fill: 'bg-muted', text: 'text-white' },
  ];

  const count = () => {
    soundManager.playGavel();
    dispatch({ type: 'STEP_ELECTION_COUNT' });
  };

  return (
    <div className="space-y-4">
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone={live.isCountingFinished ? 'success' : 'danger'}>{live.isCountingFinished ? 'Final result' : 'Live count'}</Badge>
            <h2 className="mt-1.5 font-display text-xl text-fg">Lok Sabha election count</h2>
            <p className="text-sm font-semibold text-fg-2">{MAJORITY} seats for a majority</p>
          </div>
          {live.isCountingUnderway && (
            <Button size="lg" icon={Radio} onClick={count} className="w-full sm:w-auto">
              Count the next 35 seats
            </Button>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm font-extrabold text-fg">
            <span>Seats counted</span>
            <span className="tabular-nums">
              {live.countedSeatsCount} / {TOTAL}
            </span>
          </div>
          <Meter value={live.countedSeatsCount} max={TOTAL} tone="stripes" showValue={false} className="mt-1" />
        </div>

        {/* 543-seat bar with the majority line */}
        <div className="relative mt-6">
          <span
            className="absolute -top-5 -translate-x-1/2 whitespace-nowrap text-[11px] font-extrabold text-fg"
            style={{ left: `${(MAJORITY / TOTAL) * 100}%` }}
          >
            ▼ {MAJORITY}
          </span>
          <div className="flex h-12 overflow-hidden rounded-xl border-[3px] border-ink bg-inset" role="img" aria-label={blocs.map(b => `${b.label} ${b.seats}`).join(', ')}>
            {blocs.map(b => (
              <div
                key={b.key}
                className={cn('flex h-full items-center justify-center overflow-hidden border-ink font-display text-xs transition-all duration-500 [&:not(:last-child)]:border-r-2', b.fill, b.text)}
                style={{ width: `${(b.seats / TOTAL) * 100}%` }}
              >
                {b.seats >= 30 && b.seats}
              </div>
            ))}
          </div>
          <span className="absolute top-0 h-12 w-1 -translate-x-1/2 bg-ink" style={{ left: `${(MAJORITY / TOTAL) * 100}%` }} aria-hidden="true" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {blocs.map(b => (
            <div key={b.key} className={cn('chunky-sm flex items-center gap-2 p-2.5', b.key === abbr ? 'bg-raised' : 'bg-surface')}>
              <span className={cn('h-4 w-4 shrink-0 rounded border-2 border-ink', b.fill)} aria-hidden="true" />
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-muted">{b.label}</div>
                <div className="font-display text-lg text-fg tabular-nums">{b.seats}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {live.isCountingFinished && <Verdict />}
      {!live.isCountingFinished && <NationalMoodPanel />}
    </div>
  );
}

function Verdict() {
  const { state, dispatch } = useGame();
  const live = state.electionLiveState;
  const abbr = state.party.abbreviation || 'CJP';
  const cjp = live.cjpSeats;
  const outright = cjp >= MAJORITY;
  const someoneWon = [live.rulingSeats, live.oppositionSeats].some(s => s >= MAJORITY);
  const choose = (partner: 'RULING' | 'OPPOSITION' | 'THIRD_FRONT') => {
    soundManager.playGavel();
    dispatch({ type: 'FORM_COALITION', partner });
  };

  const headline = outright
    ? `${abbr} wins an outright majority: ${cjp} seats.`
    : cjp === 0
      ? `${abbr} won no seats this time.`
      : `${abbr} wins ${cjp} seat${cjp === 1 ? '' : 's'}.`;
  const sub = outright
    ? 'You can form the government on your own.'
    : cjp === 0
      ? 'The movement goes back to the streets to rebuild.'
      : someoneWon
        ? 'One alliance has a majority without you. You can still join it, or sit as a watchdog.'
        : 'No alliance has a majority. Your MPs may decide who governs.';

  const join = (partner: 'RULING' | 'OPPOSITION') => {
    const seats = (partner === 'RULING' ? live.rulingSeats : live.oppositionSeats) + cjp;
    return { seats, short: seats < MAJORITY };
  };
  const nda = join('RULING');
  const india = join('OPPOSITION');

  return (
    <Panel className="p-4 sm:p-5">
      <PanelHeader title="The verdict" icon={Trophy} />
      <p className="mt-3 font-display text-lg text-fg">{headline}</p>
      <p className="text-sm font-semibold text-fg-2">{sub}</p>

      {live.coalitionFormed ? (
        <div className="chunky-sm mt-4 bg-raised p-4">
          <div className="flex items-center gap-2 font-display text-sm text-fg">
            <CheckCircle className="h-5 w-5 text-success" strokeWidth={2.5} aria-hidden="true" /> Decided
          </div>
          <p className="mt-1 text-sm font-semibold text-fg-2">{live.coalitionSummary}</p>
          {cjp > 0 && (
            <Button className="mt-3" icon={Landmark} onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'GOVERNMENT' })}>
              Go to Parliament
            </Button>
          )}
        </div>
      ) : outright ? (
        <div className="mt-4">
          <ChoiceCard icon={Landmark} emphasis title="Form the government" description={`${abbr} governs alone with ${cjp} seats.`} onSelect={() => choose('THIRD_FRONT')} />
        </div>
      ) : cjp === 0 ? (
        <div className="mt-4">
          <ChoiceCard icon={Flag} title="Back to the streets" description="Keep organising for the next election." onSelect={() => choose('THIRD_FRONT')} />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <ChoiceCard
            icon={Handshake}
            title="Join the NDA government"
            description="Ministries and power, in partnership with the establishment you protested against."
            disabled={nda.short}
            disabledReason={`NDA + ${abbr} = ${nda.seats}, short of ${MAJORITY}.`}
            effects={
              <>
                <EffectChip value={`${nda.seats}`} label="seats" tone={nda.short ? 'bad' : 'neutral'} />
                <EffectChip value="−12" label="trust" tone="bad" />
              </>
            }
            onSelect={() => choose('RULING')}
          />
          <ChoiceCard
            icon={Sparkles}
            title="Join an INDIA government"
            description="Replace the ruling alliance on a common minimum programme."
            disabled={india.short}
            disabledReason={`INDIA + ${abbr} = ${india.seats}, short of ${MAJORITY}.`}
            effects={
              <>
                <EffectChip value={`${india.seats}`} label="seats" tone={india.short ? 'bad' : 'neutral'} />
                <EffectChip value="−3" label="trust" tone="bad" />
              </>
            }
            onSelect={() => choose('OPPOSITION')}
          />
          <ChoiceCard
            icon={Flag}
            title="Sit as a watchdog bloc"
            description="No ministries. Hold both sides to account on every bill."
            effects={<EffectChip value="+4" label="trust" tone="good" />}
            onSelect={() => choose('THIRD_FRONT')}
          />
          {(nda.short || india.short) && (
            <p className="text-xs font-semibold text-muted">Greyed-out options don&apos;t add up to {MAJORITY} seats.</p>
          )}
        </div>
      )}
    </Panel>
  );
}
