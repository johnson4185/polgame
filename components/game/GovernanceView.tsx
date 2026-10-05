'use client';

import React from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Landmark, Scale, FileText, CheckCircle2, AlertOctagon, Users, ShieldAlert, Award, Vote } from 'lucide-react';
import Image from 'next/image';

export function GovernanceView() {
  const { state, dispatch } = useGame();

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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-zinc-800 bg-[#0E1320] p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5 bg-red-950/40 px-2 py-0.5 rounded-xs border border-red-900/60">
              <span className="stamp-red text-[9px]">SANSAD BHAVAN</span>
              <span>PARLIAMENT OF INDIA · LOK SABHA</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs text-zinc-300">Legislative Governance & Systemic Reforms</span>
          </div>
          <h2 className="font-tactical text-xl font-black text-white mt-1">
            Passing Structural Laws, Cabinet Portfolios & Systemic Accountability
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-tactical">
          <div className="rounded-xs border border-yellow-500/70 bg-yellow-950/40 px-3.5 py-1.5">
            <span className="text-zinc-400">ACTS RATIFIED: </span>
            <span className="font-black text-[#FACC15] tabular-nums text-sm">
              {state.reforms.filter(r => r.status === 'PASSED_ACT').length} / {state.reforms.length}
            </span>
          </div>
        </div>
      </div>

      {/* Atmospheric Parliament Banner */}
      <div className="relative h-48 w-full overflow-hidden rounded-xs border-2 border-zinc-700 bg-black shadow-xl">
        <Image
          src="/images/delhi_parliament_dawn_1790774340629.jpg"
          alt="Parliament of India"
          fill
          priority
          className="object-cover opacity-60 filter contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-5 flex flex-col justify-end">
          <span className="text-[11px] font-tactical font-black text-[#FACC15] uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#DC2626] animate-pulse" />
            <span>UNION LEGISLATURE & EXECUTIVE DEMOCRATIC AUTHORITY</span>
          </span>
          <h3 className="text-lg font-black text-white font-tactical mt-1">
            &ldquo;Power does not validate the truth; it only gives you the constitutional tools to enforce it.&rdquo;
          </h3>
        </div>
      </div>

      {/* Union Cabinet Portfolios */}
      <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs space-y-3 shadow-md">
        <h3 className="font-tactical font-black text-white border-b-2 border-zinc-800 pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-[#FACC15]" />
            <span>UNION CABINET MINISTRIES & INTEGRITY WATCH</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Performance & Vigilance Bureau</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.cabinet.map((min) => (
            <div key={min.id} className="rounded-xs border-2 border-zinc-800 bg-black/80 p-3.5 text-xs space-y-2 font-tactical hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-black text-white text-xs">{min.title}</span>
                {min.isPlayerParty ? (
                  <span className="rounded-xs bg-[#DC2626] text-white px-2 py-0.5 text-[9px] font-black tracking-wide">
                    CJP PORTFOLIO
                  </span>
                ) : (
                  <span className="rounded-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 text-[9px] font-bold">
                    Coalition Partner
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-300 font-sans">Incumbent Minister: <strong className="text-white font-tactical">{min.ministerName}</strong></div>
              <div className="flex items-center justify-between border-t border-zinc-800 pt-1.5 text-[10px]">
                <span className="text-zinc-400">Integrity: <strong className="text-[#FACC15]">{min.performanceScore}%</strong></span>
                <span className={`font-black ${min.corruptionScandalRisk > 30 ? 'text-[#EF4444] animate-pulse' : 'text-emerald-400'}`}>
                  Scandal Risk: {min.corruptionScandalRisk}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legislative Reforms and Structural Bills */}
      <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs space-y-3 shadow-md">
        <h3 className="font-tactical font-black text-white border-b-2 border-zinc-800 pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#DC2626]" />
            <span>FLAGSHIP REFORM BILLS & LEGISLATIVE VOTING</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Simple Majority Required: 272 Ayes</span>
        </h3>

        <div className="space-y-3">
          {state.reforms.map((reform) => (
            <div
              key={reform.id}
              className="rounded-xs border-2 border-zinc-800 bg-black/80 p-4 space-y-3 font-tactical hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">{reform.name}</span>
                    <span className={`px-2 py-0.5 rounded-xs text-[9px] font-black uppercase tracking-wider ${
                      reform.status === 'PASSED_ACT' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' :
                      reform.status === 'TABLED_PARLIAMENT' ? 'bg-yellow-950 text-[#FACC15] border border-yellow-700' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {reform.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">{reform.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {reform.status === 'DRAFT' && (
                    <button
                      onClick={() => handleTable(reform.id)}
                      className="px-3 py-1.5 rounded-xs bg-[#DC2626] border-2 border-red-500 font-black text-xs text-white hover:bg-red-700 transition-colors shadow-xs"
                    >
                      Table in Lok Sabha
                    </button>
                  )}
                  {reform.status === 'TABLED_PARLIAMENT' && (
                    <button
                      onClick={() => handleLobby(reform.id)}
                      className="px-3 py-1.5 rounded-xs bg-[#FACC15] border-2 border-yellow-400 font-black text-xs text-black hover:bg-white transition-colors shadow-xs"
                    >
                      Lobby MPs &amp; Call Vote
                    </button>
                  )}
                  {reform.status === 'PASSED_ACT' && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs bg-emerald-950/60 px-3 py-1.5 rounded-xs border border-emerald-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>ENACTED LAW OF THE REPUBLIC</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reform progress & resistance stats */}
              <div className="border-t border-zinc-800 pt-2 flex flex-wrap items-center justify-between text-[11px] font-tactical">
                <div className="flex items-center gap-4">
                  <span>PROGRESS: <strong className="text-emerald-400 font-black tabular-nums">{reform.implementationProgress}%</strong></span>
                  <span>RESISTANCE: <strong className="text-[#EF4444] font-black tabular-nums">{reform.bureaucraticResistance}%</strong></span>
                  <span>EST. BUDGET: <strong className="text-[#FACC15] font-black tabular-nums">₹{reform.costCrores} Cr</strong></span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
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
