'use client';

import React from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Landmark, Scale, FileText, CheckCircle2, AlertOctagon, Users, ShieldAlert, Award, Vote } from 'lucide-react';
import Image from 'next/image';

export function GovernanceView() {
  const { state, dispatch } = useGame();

  const inParliament = state.electionLiveState.coalitionFormed && state.party.actualSeatsWon > 0;
  const inGovernment = inParliament && state.party.isRulingCoalition;

  const handleTable = (id: string) => {
    soundManager.playGavel();
    dispatch({ type: 'TABLE_REFORM', reformId: id });
  };

  const handleLobby = (id: string) => {
    soundManager.playClick();
    dispatch({ type: 'LOBBY_REFORM', reformId: id });
  };

  return (
    <div className="space-y-4">
      
      {/* Header in Black, Red, Yellow */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-line bg-surface p-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-danger-fg flex items-center gap-1.5 bg-danger-soft px-2 py-0.5 rounded-xs border border-danger-line">
              <span className="stamp-red text-[9px]">SANSAD BHAVAN</span>
              <span>PARLIAMENT OF INDIA · LOK SABHA</span>
            </span>
            <span className="text-faint">|</span>
            <span className="text-xs text-fg-2">Legislative Governance & Systemic Reforms</span>
          </div>
          <h2 className="font-display text-xl font-bold text-fg mt-1">
            Passing Structural Laws, Cabinet Portfolios & Systemic Accountability
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-tactical">
          <div className="rounded-xs border border-accent-line bg-accent-soft px-3.5 py-1.5">
            <span className="text-muted">ACTS RATIFIED: </span>
            <span className="font-black text-accent-fg tabular-nums text-sm">
              {state.reforms.filter(r => r.status === 'PASSED_ACT').length} / {state.reforms.length}
            </span>
          </div>
        </div>
      </div>

      {/* Atmospheric Parliament Banner */}
      <div className="relative h-48 w-full overflow-hidden rounded-xs border-2 border-line-strong bg-inset shadow-xl">
        <Image
          src="/images/delhi_parliament_dawn_1790774340629.jpg"
          alt="Parliament of India"
          fill
          priority
          className="object-cover opacity-60 filter contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-5 flex flex-col justify-end">
          <span className="text-[11px] font-tactical font-black text-accent-fg uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#DC2626] animate-pulse" />
            <span>UNION LEGISLATURE & EXECUTIVE DEMOCRATIC AUTHORITY</span>
          </span>
          <h3 className="text-lg font-bold text-fg font-display mt-1">
            &ldquo;Power does not validate the truth; it only gives you the constitutional tools to enforce it.&rdquo;
          </h3>
        </div>
      </div>

      {/* Union Cabinet Portfolios */}
      {!inParliament && (
        <div className="rounded-xs border border-accent-line bg-accent-soft px-4 py-3 text-xs text-fg">
          <strong className="font-tactical text-accent-fg">NOT YET IN PARLIAMENT · </strong>
          Win seats in the general election to table bills. The cabinet below is the shadow line-up you would field if you join a government.
        </div>
      )}

      <div className="rounded-xs border-2 border-line bg-surface p-4 text-xs space-y-3 shadow-md">
        <h3 className="font-tactical font-black text-fg border-b-2 border-line pb-2.5 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Landmark className="h-4 w-4 text-accent-fg" />
            <span>{inGovernment ? 'UNION CABINET' : 'SHADOW CABINET'} · MINISTRIES &amp; INTEGRITY WATCH</span>
          </div>
          <span className="text-[10px] text-muted font-mono">Performance & Vigilance Bureau</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.cabinet.map((min) => (
            <div key={min.id} className="rounded-xs border-2 border-line bg-inset p-3.5 text-xs space-y-2 font-tactical hover:border-line-strong transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-black text-fg text-xs">{min.title}</span>
                {min.isPlayerParty ? (
                  <span className="rounded-xs bg-[#DC2626] text-white px-2 py-0.5 text-[9px] font-black tracking-wide">
                    CJP PORTFOLIO
                  </span>
                ) : (
                  <span className="rounded-xs bg-line-strong text-fg-2 px-2 py-0.5 text-[9px] font-bold">
                    Coalition Partner
                  </span>
                )}
              </div>
              <div className="text-[11px] text-fg-2 font-sans">Incumbent Minister: <strong className="text-fg font-tactical">{min.ministerName}</strong></div>
              <div className="flex items-center justify-between border-t border-line pt-1.5 text-[10px]">
                <span className="text-muted">Integrity: <strong className="text-accent-fg">{min.performanceScore}%</strong></span>
                <span className={`font-black ${min.corruptionScandalRisk > 30 ? 'text-danger-fg animate-pulse' : 'text-success-fg'}`}>
                  Scandal Risk: {min.corruptionScandalRisk}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legislative Reforms and Structural Bills */}
      <div className="rounded-xs border-2 border-line bg-surface p-4 text-xs space-y-3 shadow-md">
        <h3 className="font-tactical font-black text-fg border-b-2 border-line pb-2.5 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <FileText className="h-4 w-4 text-danger-fg" />
            <span>FLAGSHIP REFORM BILLS & LEGISLATIVE VOTING</span>
          </div>
          <span className="text-[10px] text-muted font-mono">Simple Majority Required: 272 Ayes</span>
        </h3>

        <div className="space-y-3">
          {state.reforms.map((reform) => (
            <div
              key={reform.id}
              className="rounded-xs border-2 border-line bg-inset p-4 space-y-3 font-tactical hover:border-line-strong transition-colors"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-fg">{reform.name}</span>
                    <span className={`px-2 py-0.5 rounded-xs text-[9px] font-black uppercase tracking-wider ${
                      reform.status === 'PASSED_ACT' ? 'bg-success-soft text-success-fg border border-success-line' :
                      reform.status === 'TABLED_PARLIAMENT' ? 'bg-accent-soft text-accent-fg border border-accent-line' : 'bg-line-strong text-muted'
                    }`}>
                      {reform.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted font-sans mt-0.5">{reform.description}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {reform.status === 'DRAFT' && (
                    <button
                      onClick={() => handleTable(reform.id)}
                      disabled={!inParliament}
                      title={inParliament ? 'Table this bill (1 AP)' : 'Requires MPs in the Lok Sabha'}
                      className="whitespace-nowrap rounded-xs bg-[#DC2626] px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Table in Lok Sabha · 1 AP
                    </button>
                  )}
                  {reform.status === 'TABLED_PARLIAMENT' && (
                    <button
                      onClick={() => handleLobby(reform.id)}
                      title="Lobby committees (1 AP, ₹10,000)"
                      className="whitespace-nowrap rounded-xs bg-[#FACC15] px-3 py-1.5 text-xs font-black text-black transition-colors hover:bg-yellow-300"
                    >
                      Lobby MPs · 1 AP · ₹10k
                    </button>
                  )}
                  {reform.status === 'PASSED_ACT' && (
                    <div className="flex items-center gap-1.5 text-success-fg font-black text-xs bg-success-soft px-3 py-1.5 rounded-xs border border-success-line">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>ENACTED LAW OF THE REPUBLIC</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reform progress & resistance stats */}
              <div className="border-t border-line pt-2 flex flex-wrap items-center justify-between text-[11px] font-tactical">
                <div className="flex items-center gap-4">
                  <span>PROGRESS: <strong className="text-success-fg font-black tabular-nums">{reform.implementationProgress}%</strong></span>
                  <span>RESISTANCE: <strong className="text-danger-fg font-black tabular-nums">{reform.bureaucraticResistance}%</strong></span>
                  <span>EST. BUDGET: <strong className="text-accent-fg font-black tabular-nums">₹{reform.costCrores} Cr</strong></span>
                </div>
                <div className="text-[10px] text-faint font-mono">
                  State Support Needed: {reform.stateSupportReq} States
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
