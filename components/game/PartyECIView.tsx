'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
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
  const [nominationFeedback, setNominationFeedback] = useState<string | null>(null);

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
    setNominationFeedback(`Nominated ${candidateName} for Constituency #${targetConstituencyId}`);
    setTimeout(() => setNominationFeedback(null), 3000);
  };

  const handleLaunchElection = () => {
    soundManager.playGavel();
    dispatch({ type: 'TRIGGER_ELECTION' });
  };

  return (
    <div className="space-y-4">
      
      {/* Header with Black, Red, Yellow Secondary Highlights */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-zinc-800 bg-[#0E1320] p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5 bg-red-950/40 px-2 py-0.5 rounded-xs border border-red-900/60">
              <span className="stamp-red text-[9px]">SECTION 29A</span>
              <span>ELECTION COMMISSION OF INDIA (ECI) DESK</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs text-zinc-300">Representation of the People Act, 1951</span>
          </div>
          <h2 className="font-tactical text-xl font-black text-white mt-1">
            Party Registration, 543 Nominees &amp; Election Manifestos
          </h2>
        </div>

        {state.party.isFormed && (
          <button
            onClick={handleLaunchElection}
            className="flex items-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 px-5 py-2.5 font-tactical text-xs font-black text-white hover:bg-red-700 transition-all shadow-md active:translate-y-0.5"
          >
            <Vote className="h-4 w-4 text-[#FACC15]" />
            <span>Launch 543 General Election Tally</span>
          </button>
        )}
      </div>

      {!state.party.isFormed ? (
        /* Party Registration Flow */
        <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-6 text-xs space-y-4 max-w-2xl mx-auto shadow-xl">
          <div className="border-b-2 border-zinc-800 pb-3">
            <h3 className="font-tactical text-lg font-black text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#FACC15]" />
              <span>REGISTRATION APPLICATION WITH ECI</span>
            </h3>
            <p className="text-zinc-300 mt-1 font-sans">
              Transforming from a protest movement into an accredited electoral party under Section 29A of the Representation of the People Act.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 font-tactical">
            <div>
              <label className="block font-bold text-zinc-200 mb-1">PROPOSED PARTY NAME:</label>
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full rounded-xs border-2 border-zinc-700 bg-black px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FACC15]"
                placeholder="e.g. Cockroach Janta Party"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-200 mb-1">ABBREVIATION (TICKER):</label>
              <input
                type="text"
                maxLength={6}
                value={abbreviation}
                onChange={(e) => setAbbreviation(e.target.value.toUpperCase())}
                className="w-36 rounded-xs border-2 border-zinc-700 bg-black px-3.5 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#FACC15]"
                placeholder="CJP"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-200 mb-2">OFFICIAL FREE SYMBOL PREFERENCE:</label>
              <div className="space-y-2">
                {symbolsList.map((sym) => (
                  <label
                    key={sym.name}
                    className={`flex items-start gap-3 p-3 rounded-xs border-2 cursor-pointer transition-all ${
                      symbol === sym.name
                        ? 'border-[#FACC15] bg-black text-white'
                        : 'border-zinc-800 bg-[#121624] text-zinc-300 hover:border-zinc-700'
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
                      <div className="font-bold text-white text-xs">{sym.name}</div>
                      <div className="text-[11px] text-zinc-400 font-sans mt-0.5">{sym.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 py-3 text-sm font-black text-white hover:bg-red-700 transition-all shadow-md active:translate-y-0.5"
            >
              <Flag className="h-4 w-4 text-[#FACC15]" />
              <span>SUBMIT ECI RECOGNITION DOSSIER</span>
            </button>
          </form>
        </div>
      ) : (
        /* Party Registered Status & Candidate Management */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Party Certificate Card */}
          <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-5 text-xs space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
              <div>
                <span className="stamp-yellow text-[9px]">OFFICIALLY ACCREDITED</span>
                <h3 className="font-tactical text-xl font-black text-white mt-1">
                  {state.party.partyName} ({state.party.abbreviation})
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500">SYMBOL ALLOCATED:</span>
                <div className="font-black text-[#FACC15] text-xs mt-0.5">{state.party.symbol}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-tactical pt-1">
              <div className="rounded-xs border border-zinc-800 bg-black p-3">
                <span className="text-zinc-500 text-[10px]">TOTAL 543 NOMINEES:</span>
                <div className="text-xl font-black text-white mt-1 tabular-nums">
                  {state.constituencies.filter(c => !!c.cjpCandidate).length} / 543
                </div>
              </div>

              <div className="rounded-xs border border-zinc-800 bg-black p-3">
                <span className="text-zinc-500 text-[10px]">REGULATED PARTY TREASURY:</span>
                <div className="text-xl font-black text-[#FACC15] mt-1 tabular-nums">
                  ₹{state.party.partyFunds.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Core Manifesto Pledges */}
            <div className="border-t-2 border-zinc-800 pt-3">
              <span className="font-tactical font-black text-white block mb-2">
                CORE ELECTORAL MANIFESTO PILLARS:
              </span>
              <div className="space-y-1.5">
                {state.party.manifestoPledges.map((pl, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-zinc-300 font-sans">
                    <Check className="h-3.5 w-3.5 text-[#FACC15] shrink-0" />
                    <span>{typeof pl === 'string' ? pl : (pl as any).title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rapid Candidate Nomination Tool */}
          <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-5 text-xs space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
              <h3 className="font-tactical text-base font-black text-white flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-[#DC2626]" />
                <span>NOMINATE CANDIDATE TO CONSTITUENCY</span>
              </h3>
              <span className="text-zinc-400 font-mono text-[10px]">Form 2A Certified</span>
            </div>

            {nominationFeedback && (
              <div className="rounded-xs bg-yellow-950/80 border-2 border-[#FACC15] p-2 text-xs font-bold text-[#FDE047] flex items-center gap-2">
                <Award className="h-4 w-4 text-[#FACC15]" />
                <span>{nominationFeedback}</span>
              </div>
            )}

            <form onSubmit={handleNominate} className="space-y-3 font-tactical">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">SELECT LOK SABHA CONSTITUENCY:</label>
                <select
                  value={targetConstituencyId}
                  onChange={(e) => setTargetConstituencyId(Number(e.target.value))}
                  className="w-full rounded-xs border-2 border-zinc-700 bg-black px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FACC15]"
                >
                  {state.constituencies.slice(0, 30).map((con) => (
                    <option key={con.id} value={con.id}>
                      #{con.id} · {con.name} ({con.state}) - Support: {con.cjpSupportScore}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">CANDIDATE NAME:</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full rounded-xs border-2 border-zinc-700 bg-black px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FACC15]"
                  placeholder="Full legal name"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">CAMPAIGN FUND ALLOCATION (₹):</label>
                <input
                  type="number"
                  step="5000"
                  min="5000"
                  value={campaignFund}
                  onChange={(e) => setCampaignFund(Number(e.target.value))}
                  className="w-full rounded-xs border-2 border-zinc-700 bg-black px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 py-2.5 font-black text-white hover:bg-red-700 transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4 text-[#FACC15]" />
                <span>CONFIRM NOMINATION ON FORM 2A</span>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
