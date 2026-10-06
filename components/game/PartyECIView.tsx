'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { BALANCE, formatDate, isoDate, nextElectionDate } from '@/lib/game/simulation/engine';
import { Vote, Shield, Check, Plus, AlertCircle, ArrowRight, UserCheck, Award, Flag, Flame } from 'lucide-react';

export function PartyECIView() {
  const { state, dispatch } = useGame();
  
  // Registration Form
  const [partyName, setPartyName] = useState('Cockroach Janta Party');
  const [abbreviation, setAbbreviation] = useState('CJP');
  const [symbol, setSymbol] = useState('The Resilient Bug (Cockroach)');

  // Candidate Nomination quick tool
  const [targetConstituencyId, setTargetConstituencyId] = useState<number>(1);
  const [candidateName, setCandidateName] = useState<string>('Advocate Meera Tandon');
  const [campaignFund, setCampaignFund] = useState<number>(25000);

  const symbolsList = [
    { name: 'The Resilient Bug (Cockroach)', desc: 'Survives political radiation and systemic apathy.' },
    { name: 'The RTI Torch', desc: 'Illuminates dark files, audits, and tender records.' },
    { name: 'The Citizen Whistle', desc: 'Blows loud when public trust is compromised.' },
    { name: 'The Scales of Justice', desc: 'Strict equal accountability under the Constitution.' },
    { name: 'The Student Pen', desc: 'Symbol of competitive exam integrity and youth future.' },
  ];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim() || !abbreviation.trim()) return;
    soundManager.playGavel();
    dispatch({
      type: 'FORM_PARTY',
      partyName: partyName.trim(),
      abbreviation: abbreviation.trim().toUpperCase(),
      symbol,
    });
  };

  const handleNominate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) return;
    soundManager.playClick();
    dispatch({
      type: 'NOMINATE_CANDIDATE',
      constituencyId: Number(targetConstituencyId),
      candidateName: candidateName.trim(),
      funding: campaignFund,
    });
  };

  // Group all 543 seats by state for the nomination picker
  const seatsByState = state.constituencies.reduce<Record<string, typeof state.constituencies>>((acc, c) => {
    (acc[c.state] ||= []).push(c);
    return acc;
  }, {});
  const targetSeat = state.constituencies.find(c => c.id === targetConstituencyId);
  const deposit = targetSeat?.category === 'GEN' ? BALANCE.securityDepositGeneral : BALANCE.securityDepositReserved;
  const requirements = [
    {
      label: `${BALANCE.partyVolunteersRequired.toLocaleString('en-IN')} volunteers`,
      have: state.movement.volunteerCount.toLocaleString('en-IN'),
      met: state.movement.volunteerCount >= BALANCE.partyVolunteersRequired,
    },
    {
      label: `₹${BALANCE.partyRegistrationCost.toLocaleString('en-IN')} registration & office costs`,
      have: `₹${state.movement.movementFunds.toLocaleString('en-IN')}`,
      met: state.movement.movementFunds >= BALANCE.partyRegistrationCost,
    },
  ];
  const counting = state.electionLiveState.isCountingUnderway;
  const nextDue = nextElectionDate(state);
  const waitingForNext = !!nextDue && isoDate(state.currentDate) < isoDate(nextDue);
  // Locked while votes are counted, or until a year after the last election
  const electionHeld = counting || waitingForNext;
  const act1 = (state.story?.act ?? 1) === 1;

  const handleLaunchElection = () => {
    soundManager.playGavel();
    dispatch({ type: 'TRIGGER_ELECTION' });
  };

  return (
    <div className="space-y-4">
      
      {/* Header with Black, Red, Yellow Secondary Highlights */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-line bg-surface p-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-danger-fg flex items-center gap-1.5 bg-danger-soft px-2 py-0.5 rounded-xs border border-danger-line">
              <span className="stamp-red text-[9px]">SECTION 29A</span>
              <span>ELECTION COMMISSION OF INDIA (ECI) DESK</span>
            </span>
            <span className="text-faint">|</span>
            <span className="text-xs text-fg-2">Representation of the People Act, 1951</span>
          </div>
          <h2 className="font-display text-xl font-bold text-fg mt-1">
            Party Registration, 543 Nominees &amp; Election Manifestos
          </h2>
        </div>

        {state.party.isFormed && (
          <div className="flex items-center gap-3">
            <div className="font-tactical text-xs text-right">
              <div className="text-muted text-[10px]">CANDIDATES · PROJECTED SEATS</div>
              <div className="font-black text-fg tabular-nums">
                {state.party.candidateCount} · <span className="text-accent-fg">{state.party.projectedSeats}</span>
              </div>
            </div>
            <button
              onClick={handleLaunchElection}
              disabled={electionHeld || state.party.candidateCount < 1}
              title={state.party.candidateCount < 1 ? 'Nominate at least one candidate first' : undefined}
              className="flex items-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 px-5 py-2.5 font-tactical text-xs font-black text-white hover:bg-red-700 transition-all shadow-md active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Vote className="h-4 w-4 text-accent-fg" />
              <span>
                {counting
                  ? 'Counting under way'
                  : waitingForNext
                    ? `Next election from ${formatDate(nextDue!)}`
                    : nextDue
                      ? 'Call the next general election'
                      : 'Launch 543 General Election Tally'}
              </span>
            </button>
          </div>
        )}
      </div>

      {act1 && !state.party.isFormed && (
        <div className="chunky-sm bg-accent p-3 text-sm font-bold text-ink">
          Party registration opens on 5 October 2026, when Act 1 ends. In the real record CJP had not registered as a party by then.
          Until then, build volunteers and money so you&apos;re ready.
        </div>
      )}

      {!state.party.isFormed ? (
        /* Party Registration Flow */
        <div className="rounded-xs border-2 border-line bg-surface p-6 text-xs space-y-4 max-w-2xl mx-auto shadow-xl">
          <div className="border-b-2 border-line pb-3">
            <h3 className="font-display text-lg font-bold text-fg flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent-fg" />
              <span>REGISTRATION APPLICATION WITH ECI</span>
            </h3>
            <p className="text-fg-2 mt-1 font-sans">
              Transforming from a protest movement into an accredited electoral party under Section 29A of the Representation of the People Act.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 font-tactical">
            <div>
              <label className="block font-bold text-fg mb-1">PROPOSED PARTY NAME:</label>
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full rounded-xs border-2 border-line-strong bg-inset px-3.5 py-2 text-xs text-fg focus:outline-none focus:border-accent"
                placeholder="e.g. Cockroach Janta Party"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-fg mb-1">ABBREVIATION (TICKER):</label>
              <input
                type="text"
                maxLength={6}
                value={abbreviation}
                onChange={(e) => setAbbreviation(e.target.value.toUpperCase())}
                className="w-36 rounded-xs border-2 border-line-strong bg-inset px-3.5 py-2 text-xs text-fg uppercase focus:outline-none focus:border-accent"
                placeholder="CJP"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-fg mb-2">OFFICIAL FREE SYMBOL PREFERENCE:</label>
              <div className="space-y-2">
                {symbolsList.map((sym) => (
                  <label
                    key={sym.name}
                    className={`flex items-start gap-3 p-3 rounded-xs border-2 cursor-pointer transition-all ${
                      symbol === sym.name
                        ? 'border-accent bg-inset text-fg'
                        : 'border-line bg-raised text-fg-2 hover:border-line-strong'
                    }`}
                  >
                    <input
                      type="radio"
                      name="symbol"
                      value={sym.name}
                      checked={symbol === sym.name}
                      onChange={() => setSymbol(sym.name)}
                      className="mt-0.5 accent-[#DC2626]"
                    />
                    <div>
                      <div className="font-bold text-fg text-xs">{sym.name}</div>
                      <div className="text-[11px] text-muted font-sans mt-0.5">{sym.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xs border-2 border-line bg-inset p-3 space-y-1.5">
              <div className="font-bold text-fg">ECI REQUIREMENTS:</div>
              {requirements.map(r => (
                <div key={r.label} className={`flex items-center justify-between gap-2 ${r.met ? 'text-success-fg' : 'text-danger-fg'}`}>
                  <span className="flex items-center gap-1.5">
                    {r.met ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {r.label}
                  </span>
                  <span className="tabular-nums text-fg-2">have {r.have}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={!requirements.every(r => r.met)}
              className="w-full flex items-center justify-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed font-black text-white hover:bg-red-700 transition-all shadow-md active:translate-y-0.5"
            >
              <Flag className="h-4 w-4 text-accent-fg" />
              <span>SUBMIT ECI RECOGNITION DOSSIER</span>
            </button>
          </form>
        </div>
      ) : (
        /* Party Registered Status & Candidate Management */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Party Certificate Card */}
          <div className="rounded-xs border-2 border-line bg-surface p-5 text-xs space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b-2 border-line pb-3">
              <div>
                <span className="stamp-yellow text-[9px]">OFFICIALLY ACCREDITED</span>
                <h3 className="font-display text-xl font-bold text-fg mt-1">
                  {state.party.partyName} ({state.party.abbreviation})
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-faint">SYMBOL ALLOCATED:</span>
                <div className="font-black text-accent-fg text-xs mt-0.5">{state.party.symbol}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-tactical pt-1">
              <div className="rounded-xs border border-line bg-inset p-3">
                <span className="text-faint text-[10px]">TOTAL 543 NOMINEES:</span>
                <div className="text-xl font-black text-fg mt-1 tabular-nums">
                  {state.constituencies.filter(c => !!c.cjpCandidate).length} / 543
                </div>
              </div>

              <div className="rounded-xs border border-line bg-inset p-3">
                <span className="text-faint text-[10px]">REGULATED PARTY TREASURY:</span>
                <div className="text-xl font-black text-accent-fg mt-1 tabular-nums">
                  ₹{state.party.partyFunds.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Core Manifesto Pledges */}
            <div className="border-t-2 border-line pt-3">
              <span className="font-tactical font-black text-fg block mb-2">
                CORE ELECTORAL MANIFESTO PILLARS:
              </span>
              <div className="space-y-1.5">
                {state.party.manifestoPledges.map((pl, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-fg-2 font-sans">
                    <Check className="h-3.5 w-3.5 text-accent-fg shrink-0" />
                    <span>{typeof pl === 'string' ? pl : (pl as any).title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rapid Candidate Nomination Tool */}
          <div className="rounded-xs border-2 border-line bg-surface p-5 text-xs space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b-2 border-line pb-3">
              <h3 className="font-display text-base font-bold text-fg flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-danger-fg" />
                <span>NOMINATE CANDIDATE TO CONSTITUENCY</span>
              </h3>
              <span className="text-muted font-mono text-[10px]">Form 2A Certified</span>
            </div>


            <form onSubmit={handleNominate} className="space-y-3 font-tactical">
              <div>
                <label className="block font-bold text-fg-2 mb-1">SELECT LOK SABHA CONSTITUENCY:</label>
                <select
                  value={targetConstituencyId}
                  onChange={(e) => setTargetConstituencyId(Number(e.target.value))}
                  className="w-full rounded-xs border-2 border-line-strong bg-inset px-3 py-2 text-xs text-fg focus:outline-none focus:border-accent"
                >
                  {Object.entries(seatsByState).map(([stateName, seats]) => (
                    <optgroup key={stateName} label={stateName}>
                      {seats.map((con) => (
                        <option key={con.id} value={con.id} disabled={!!con.cjpCandidate}>
                          {con.cjpCandidate ? '✓ ' : ''}#{con.id} · {con.name} ({con.category}) - Support: {con.cjpSupportScore}%
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-fg-2 mb-1">CANDIDATE NAME:</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full rounded-xs border-2 border-line-strong bg-inset px-3 py-2 text-xs text-fg focus:outline-none focus:border-accent"
                  placeholder="Full legal name"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-fg-2 mb-1">CAMPAIGN FUND ALLOCATION (₹):</label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={campaignFund}
                  onChange={(e) => setCampaignFund(Number(e.target.value))}
                  className="w-full rounded-xs border-2 border-line-strong bg-inset px-3 py-2 text-xs text-fg focus:outline-none focus:border-accent"
                />
                <p className="mt-1 text-[10px] text-muted font-sans">
                  Total ₹{(campaignFund + deposit).toLocaleString('en-IN')} (₹{deposit.toLocaleString('en-IN')} security deposit + campaign fund) from movement funds of ₹{state.movement.movementFunds.toLocaleString('en-IN')}. More funding raises vote share, with diminishing returns.
                </p>
              </div>

              <button
                type="submit"
                disabled={electionHeld}
                className="w-full flex items-center justify-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed font-black text-white hover:bg-red-700 transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4 text-accent-fg" />
                <span>CONFIRM NOMINATION ON FORM 2A</span>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
