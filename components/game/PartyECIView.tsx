'use client';

import React, { useMemo, useState } from 'react';
import { Check, Flag, Landmark, ListChecks, Plus, Users, Vote, Wallet, X } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { BALANCE, formatDate, isoDate, nextElectionDate } from '@/lib/game/simulation/engine';
import { Badge, Button, Meter, Panel, PanelHeader, StatCard, cn } from '@/components/ui/primitives';
import { TabPanel, Tabs } from '@/components/ui/menus';
import type { LokSabhaConstituency } from '@/lib/game/types';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const field = 'h-10 w-full rounded-lg border-2 border-ink bg-surface px-3 text-sm font-semibold text-fg';

const SYMBOLS = [
  { name: 'The Resilient Bug (Cockroach)', desc: 'Survives political radiation and systemic apathy.' },
  { name: 'The RTI Torch', desc: 'Lights up dark files, audits and tender records.' },
  { name: 'The Citizen Whistle', desc: 'Blows loud when public trust is betrayed.' },
  { name: 'The Scales of Justice', desc: 'Equal accountability under the Constitution.' },
  { name: 'The Student Pen', desc: 'Exam integrity and the future of the young.' },
];
const FUND_PRESETS = [0, 10000, 25000, 50000, 100000];

/** Party: ECI registration before the party exists; nominations, candidates and manifesto after. */
export function PartyECIView() {
  const { state } = useGame();
  return state.party.isFormed ? <PartyDesk /> : <Registration />;
}

function Registration() {
  const { state, dispatch } = useGame();
  const [partyName, setPartyName] = useState('Cockroach Janta Party');
  const [abbreviation, setAbbreviation] = useState('CJP');
  const [symbol, setSymbol] = useState(SYMBOLS[0].name);
  const act1 = (state.story?.act ?? 1) === 1;
  const { volunteerCount, movementFunds } = state.movement;
  const reqs = [
    { label: 'Volunteers', icon: Users, have: volunteerCount, need: BALANCE.partyVolunteersRequired, fmt: (n: number) => n.toLocaleString('en-IN') },
    { label: 'Registration and office costs', icon: Wallet, have: movementFunds, need: BALANCE.partyRegistrationCost, fmt: inr },
  ];
  const blocker = act1
    ? 'Registration opens in Act 2 (5 October 2026).'
    : !partyName.trim() || !abbreviation.trim()
      ? 'Enter a name and abbreviation.'
      : reqs.find(r => r.have < r.need)
        ? 'Meet both requirements first.'
        : null;

  const register = () => {
    soundManager.playGavel();
    dispatch({ type: 'FORM_PARTY', partyName: partyName.trim(), abbreviation: abbreviation.trim().toUpperCase(), symbol });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {act1 && (
        <div className="chunky-sm bg-accent p-3 text-sm font-bold text-ink">
          Party registration opens on 5 October 2026, when Act 1 ends. In the real record CJP had not registered as a party by then. Build
          volunteers and money until then so you&apos;re ready.
        </div>
      )}

      <Panel className="p-4 sm:p-5">
        <PanelHeader title="Register with the ECI" icon={Landmark} />
        <p className="mt-2 text-sm font-semibold text-fg-2">
          Turn the movement into a party under Section 29A of the Representation of the People Act. You can then field candidates in any of the 543
          seats.
        </p>

        <div className="mt-4 space-y-3">
          {reqs.map(r => {
            const met = r.have >= r.need;
            return (
              <div key={r.label}>
                <div className="flex items-center justify-between gap-2 text-sm font-bold text-fg">
                  <span className="flex items-center gap-1.5">
                    {met ? <Check className="h-4 w-4 text-success" strokeWidth={3} /> : <X className="h-4 w-4 text-danger-fg" strokeWidth={3} />}
                    {r.label}
                  </span>
                  <span className="tabular-nums">
                    {r.fmt(r.have)} / {r.fmt(r.need)}
                  </span>
                </div>
                <Meter value={r.have} max={r.need} tone={met ? 'success' : 'brand'} showValue={false} className="mt-1" />
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
          <label className="block text-sm font-bold text-fg">
            Party name
            <input value={partyName} onChange={e => setPartyName(e.target.value)} className={cn(field, 'mt-1')} />
          </label>
          <label className="block text-sm font-bold text-fg">
            Abbreviation
            <input value={abbreviation} maxLength={6} onChange={e => setAbbreviation(e.target.value.toUpperCase())} className={cn(field, 'mt-1 uppercase')} />
          </label>
        </div>

        <div className="mt-4 text-sm font-bold text-fg" id="symbol-label">
          Election symbol
        </div>
        <div role="radiogroup" aria-labelledby="symbol-label" className="mt-2 grid gap-2 sm:grid-cols-2">
          {SYMBOLS.map(s => {
            const on = s.name === symbol;
            return (
              <button
                key={s.name}
                role="radio"
                aria-checked={on}
                onClick={() => {
                  soundManager.playClick();
                  setSymbol(s.name);
                }}
                className={cn('chunky-sm pressable p-3 text-left', on ? 'bg-brand text-brand-ink' : 'bg-raised text-fg')}
              >
                <div className="font-display text-xs">{s.name}</div>
                <div className="mt-0.5 text-xs font-semibold opacity-80">{s.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          {blocker && <span className="text-sm font-bold text-danger-fg">{blocker}</span>}
          <Button size="lg" icon={Flag} disabled={!!blocker} onClick={register}>
            Register · {inr(BALANCE.partyRegistrationCost)}
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function PartyDesk() {
  const { state, dispatch } = useGame();
  const nominated = state.constituencies.filter(c => !!c.cjpCandidate);
  const counting = state.electionLiveState.isCountingUnderway;
  const nextDue = nextElectionDate(state);
  const waitingForNext = !!nextDue && isoDate(state.currentDate) < isoDate(nextDue);
  const electionLocked = counting || waitingForNext;
  const electionBlocker = counting
    ? 'Counting is under way.'
    : waitingForNext
      ? `The next election can be called from ${formatDate(nextDue!)}.`
      : state.party.candidateCount < 1
        ? 'Nominate at least one candidate first.'
        : null;

  return (
    <div className="space-y-4">
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge tone="success">Recognised by the ECI</Badge>
            <h2 className="mt-1.5 font-display text-xl text-fg">
              {state.party.partyName} ({state.party.abbreviation})
            </h2>
            <p className="text-sm font-semibold text-fg-2">Symbol: {state.party.symbol}</p>
          </div>
          <div className="flex w-full flex-col gap-1 sm:w-auto sm:items-end">
            <Button
              icon={Vote}
              disabled={!!electionBlocker}
              onClick={() => {
                soundManager.playGavel();
                dispatch({ type: 'TRIGGER_ELECTION' });
              }}
            >
              {nextDue ? 'Call the next election' : 'Call the general election'}
            </Button>
            {electionBlocker && <span className="text-xs font-bold text-muted">{electionBlocker}</span>}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatCard icon={Users} iconTone="pink" label="Candidates" value={`${nominated.length} / 543`} />
          <StatCard icon={Vote} iconTone="saffron" label="Projected seats" value={state.party.projectedSeats} />
          <StatCard icon={Wallet} iconTone="teal" label="Party account" value={inr(state.party.partyFunds)} />
        </div>
      </Panel>

      <Panel className="p-3 sm:p-4">
        <Tabs
          size="sm"
          tabs={[
            { value: 'nominate', label: 'Nominate' },
            { value: 'candidates', label: 'Candidates', badge: nominated.length },
            { value: 'manifesto', label: 'Manifesto' },
          ]}
        >
          <TabPanel value="nominate">
            <Nominate locked={electionLocked} />
          </TabPanel>
          <TabPanel value="candidates">
            {nominated.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-muted">No candidates yet.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {nominated.map(c => (
                  <li key={c.id} className="chunky-sm bg-raised p-3">
                    <div className="font-display text-xs text-fg">{c.name}</div>
                    <div className="text-xs font-bold text-muted">
                      {c.state} · #{c.id}
                    </div>
                    <div className="mt-1 text-sm font-bold text-fg">{c.cjpCandidate!.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge tone="neutral">{c.category}</Badge>
                      <Badge tone="saffron">Support {c.cjpSupportScore}%</Badge>
                      <Badge tone="teal">Fund {inr(c.cjpCandidate!.campaignFundingAllocated)}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>
          <TabPanel value="manifesto">
            {state.party.manifestoPledges.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-muted">No pledges yet.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {state.party.manifestoPledges.map(p => (
                  <li key={p.id} className="chunky-sm bg-raised p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-display text-xs text-fg">{p.title}</span>
                      {p.fulfilled && <Badge tone="success">Delivered</Badge>}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-fg-2">{p.description}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Badge tone="neutral">{p.category.toLowerCase()}</Badge>
                      <Badge tone="success">Appeal {p.publicAppeal}</Badge>
                      <Badge tone="danger">Resistance {p.vestedResistance}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>
        </Tabs>
      </Panel>
    </div>
  );
}

function Nominate({ locked }: { locked: boolean }) {
  const { state, dispatch } = useGame();
  const byState = useMemo(() => {
    const m: Record<string, LokSabhaConstituency[]> = {};
    for (const c of state.constituencies) (m[c.state] ||= []).push(c);
    return m;
  }, [state.constituencies]);
  const states = Object.keys(byState).sort();
  const [stateName, setStateName] = useState(states[0] ?? '');
  const seats = byState[stateName] ?? [];
  const [seatId, setSeatId] = useState<number | null>(null);
  const seat = seats.find(c => c.id === seatId && !c.cjpCandidate) ?? seats.find(c => !c.cjpCandidate);
  const [candidateName, setCandidateName] = useState('');
  const [fund, setFund] = useState(25000);

  const deposit = seat?.category === 'GEN' ? BALANCE.securityDepositGeneral : BALANCE.securityDepositReserved;
  const total = fund + deposit;
  const blocker = locked
    ? 'Nominations are closed right now.'
    : !seat
      ? 'Every seat in this state already has a candidate.'
      : !candidateName.trim()
        ? 'Enter the candidate’s name.'
        : state.movement.movementFunds < total
          ? `Needs ${inr(total)}; the movement fund has ${inr(state.movement.movementFunds)}.`
          : null;

  const nominate = () => {
    if (!seat) return;
    soundManager.playStamp();
    dispatch({ type: 'NOMINATE_CANDIDATE', constituencyId: seat.id, candidateName: candidateName.trim(), funding: fund });
    setCandidateName('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold text-fg">
            State
            <select
              value={stateName}
              onChange={e => {
                setStateName(e.target.value);
                setSeatId(null);
              }}
              className={cn(field, 'mt-1')}
            >
              {states.map(s => (
                <option key={s} value={s}>
                  {s} ({byState[s].filter(c => !c.cjpCandidate).length} open)
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-fg">
            Constituency
            <select value={seat?.id ?? ''} onChange={e => setSeatId(Number(e.target.value))} className={cn(field, 'mt-1')} disabled={!seat}>
              {seats.map(c => (
                <option key={c.id} value={c.id} disabled={!!c.cjpCandidate}>
                  {c.cjpCandidate ? '✓ ' : ''}
                  {c.name} ({c.category}) · {c.cjpSupportScore}%
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-bold text-fg">
          Candidate name
          <input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Full name" className={cn(field, 'mt-1')} />
        </label>
        <div>
          <div className="text-sm font-bold text-fg">Campaign fund</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {FUND_PRESETS.map(v => (
              <button
                key={v}
                onClick={() => setFund(v)}
                aria-pressed={fund === v}
                className={cn('chunky-sm pressable px-3 py-1.5 text-sm font-extrabold', fund === v ? 'bg-brand text-brand-ink' : 'bg-raised text-fg')}
              >
                {v === 0 ? 'None' : `₹${v / 1000}K`}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs font-semibold text-muted">More money raises vote share, with diminishing returns.</p>
        </div>
      </div>

      <div className="chunky-sm space-y-2 bg-raised p-4">
        <div className="font-display text-xs text-fg">{seat ? `${seat.name}, ${seat.state}` : 'No open seat'}</div>
        {seat && (
          <>
            <div className="flex flex-wrap gap-1">
              <Badge tone="neutral">{seat.category === 'GEN' ? 'General' : `Reserved (${seat.category})`}</Badge>
              <Badge tone="neutral">Held by {seat.incumbentParty}</Badge>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold text-fg">
                <span>Your support here</span>
                <span className="tabular-nums">{seat.cjpSupportScore}%</span>
              </div>
              <Meter value={seat.cjpSupportScore} tone="brand" showValue={false} className="mt-1" />
            </div>
            <dl className="space-y-1 text-sm font-semibold text-fg-2">
              <div className="flex justify-between">
                <dt>Security deposit</dt>
                <dd className="tabular-nums">{inr(deposit)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Campaign fund</dt>
                <dd className="tabular-nums">{inr(fund)}</dd>
              </div>
              <div className="flex justify-between border-t-2 border-ink pt-1 font-extrabold text-fg">
                <dt>Total from movement fund</dt>
                <dd className="tabular-nums">{inr(total)}</dd>
              </div>
            </dl>
          </>
        )}
        <Button className="w-full" icon={Plus} disabled={!!blocker} onClick={nominate}>
          Nominate
        </Button>
        {blocker && <p className="text-xs font-bold text-danger-fg">{blocker}</p>}
        <p className="flex items-center gap-1 text-xs font-semibold text-muted">
          <ListChecks className="h-3.5 w-3.5" /> {state.party.candidateCount} nominated so far
        </p>
      </div>
    </div>
  );
}
