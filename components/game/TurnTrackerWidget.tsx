'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Clock, Calendar, Vote, HelpCircle, ChevronRight, Shield, Flame } from 'lucide-react';

export function TurnTrackerWidget() {
  const { state, dispatch } = useGame();
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);

  // Compute Turn Number from start date (June 1, 2026)
  const startDate = new Date(2026, 5, 1);
  const curDate = new Date(state.currentDate.year, state.currentDate.month - 1, state.currentDate.day);
  const diffDays = Math.max(0, Math.floor((curDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const turnNumber = diffDays + 1;

  // Election Day Target: 180 days from start (Late Nov 2026)
  const ELECTION_DAY_TURN = 180;
  const daysUntilElection = Math.max(0, ELECTION_DAY_TURN - turnNumber);

  // Strategic Cycles
  let cycleNumber = 1;
  let cycleName = 'CIVIL VIGIL';
  let cycleDescription = 'Sustain ground resistance at Jantar Mantar, gather public trust, and fend off police dispersal orders.';

  if (turnNumber > 30 && turnNumber <= 90) {
    cycleNumber = 2;
    cycleName = 'INVESTIGATION';
    cycleDescription = 'Corroborate whistleblower paper trails, expose the port/mining scam, and file Supreme Court petitions.';
  } else if (turnNumber > 90 && turnNumber <= 150) {
    cycleNumber = 3;
    cycleName = 'PARTY CADRE';
    cycleDescription = 'Secure Election Commission symbol recognition, crowd-source funds, and nominate candidates in key seats.';
  } else if (turnNumber > 150) {
    cycleNumber = 4;
    cycleName = 'ELECTION BLITZ';
    cycleDescription = 'Final campaign push across 543 Lok Sabha constituencies to break the 272 majority threshold.';
  }

  const isElectionImminent = daysUntilElection <= 30;

  return (
    <>
      <div 
        onClick={() => {
          soundManager.playClick();
          setShowRoadmapModal(true);
        }}
        title="Click to view full Strategic Campaign & Election Roadmap"
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-xs border-2 border-zinc-700 bg-black/80 hover:border-[#FACC15] cursor-pointer transition-all shadow-xs group font-tactical select-none"
      >
        {/* Cycle & Turn Badge */}
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 items-center px-1.5 rounded-xs bg-[#DC2626] text-white font-mono font-black text-[10px] tracking-wider uppercase shadow-xs">
            TURN {turnNumber}
          </span>
          <span className="hidden md:inline-block font-mono text-[10px] text-zinc-400 font-bold uppercase bg-zinc-900 px-1.5 py-0.5 rounded-xs border border-zinc-800 group-hover:text-zinc-200">
            CYC {cycleNumber}: {cycleName}
          </span>
        </div>

        <span className="text-zinc-600 hidden sm:inline">|</span>

        {/* Election Countdown Pill */}
        <div className="flex items-center gap-1">
          <Vote className={`h-3.5 w-3.5 ${isElectionImminent ? 'text-red-500 animate-pulse' : 'text-[#FACC15]'}`} />
          <div className="flex items-baseline gap-1 font-mono text-xs">
            <span className="text-[10px] text-zinc-400 font-bold hidden sm:inline">ELECTION:</span>
            <span className={`font-black tabular-nums ${
              daysUntilElection === 0 
                ? 'bg-red-600 text-white px-1.5 py-0.2 rounded-xs animate-bounce' 
                : isElectionImminent 
                ? 'text-red-400 font-bold' 
                : 'text-[#FACC15]'
            }`}>
              {daysUntilElection === 0 ? 'POLLING DAY' : `T-${daysUntilElection}d`}
            </span>
          </div>
        </div>

        <HelpCircle className="h-3 w-3 text-zinc-600 group-hover:text-[#FACC15] transition-colors ml-0.5 hidden lg:block" />
      </div>

      {/* Campaign Roadmap Modal */}
      {showRoadmapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-xs border-2 border-[#FACC15] bg-[#0A0E17] p-5 shadow-2xl text-white font-sans">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#DC2626] text-white">
                  <Vote className="h-4 w-4" />
                </span>
                <div>
                  <span className="stamp-yellow text-[9px]">STRATEGIC CAMPAIGN ROADMAP</span>
                  <h3 className="font-tactical text-base font-black text-white">
                    TURN {turnNumber} · CYCLE {cycleNumber}: {cycleName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowRoadmapModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-xs border border-zinc-800 px-2 py-1 rounded-xs"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="py-4 space-y-3.5">
              
              {/* Election Countdown Banner */}
              <div className="rounded-xs border border-zinc-800 bg-black/60 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">COUNTDOWN TO GENERAL ELECTION</span>
                  <span className="font-tactical text-lg font-black text-[#FACC15]">
                    {daysUntilElection} DAYS REMAINING UNTIL EVM VOTING
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-zinc-400">Target Date</span>
                  <span className="font-tactical font-black text-white text-sm block">Nov 28, 2026</span>
                </div>
              </div>

              {/* The 4 Cycles */}
              <div className="space-y-2 font-tactical text-xs">
                <span className="font-black text-zinc-400 text-[11px] uppercase tracking-wider block">
                  CAMPAIGN CYCLES & OBJECTIVES:
                </span>

                {[
                  {
                    num: 1,
                    title: 'Cycle I: Civil Vigil (Turns 1–30)',
                    desc: 'Mobilize 5,000 citizens at Jantar Mantar and withstand police Section 144 dispersal orders.',
                    status: turnNumber <= 30 ? 'ACTIVE NOW' : 'COMPLETED',
                  },
                  {
                    num: 2,
                    title: 'Cycle II: The Investigation Dossier (Turns 31–90)',
                    desc: 'Corroborate RTI paper trails on port concessions and table public interest litigation before Supreme Court.',
                    status: turnNumber > 30 && turnNumber <= 90 ? 'ACTIVE NOW' : turnNumber > 90 ? 'COMPLETED' : 'UPCOMING',
                  },
                  {
                    num: 3,
                    title: 'Cycle III: ECI Registration & Candidate Slate (Turns 91–150)',
                    desc: 'Formalize Common Jan Party with Election Commission, collect 10,000 pledges, and nominate candidates.',
                    status: turnNumber > 90 && turnNumber <= 150 ? 'ACTIVE NOW' : turnNumber > 150 ? 'COMPLETED' : 'UPCOMING',
                  },
                  {
                    num: 4,
                    title: 'Cycle IV: General Election Blitz (Turns 151–180)',
                    desc: 'National rally tour, TV news crossfires, EVM counting night, and coalition governance negotiations.',
                    status: turnNumber > 150 ? 'ACTIVE NOW' : 'UPCOMING',
                  },
                ].map((c) => (
                  <div
                    key={c.num}
                    className={`rounded-xs border p-2.5 transition-colors ${
                      c.status === 'ACTIVE NOW'
                        ? 'border-[#FACC15] bg-[#121624]'
                        : c.status === 'COMPLETED'
                        ? 'border-emerald-900 bg-emerald-950/20 text-zinc-400'
                        : 'border-zinc-800 bg-black/40 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-black ${c.status === 'ACTIVE NOW' ? 'text-white' : ''}`}>
                        {c.title}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs ${
                        c.status === 'ACTIVE NOW'
                          ? 'bg-[#FACC15] text-black'
                          : c.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-normal">{c.desc}</p>
                  </div>
                ))}
              </div>

            </div>

            <button
              onClick={() => setShowRoadmapModal(false)}
              className="w-full py-2.5 rounded-xs bg-[#DC2626] font-tactical font-black text-white text-xs uppercase tracking-wider hover:bg-red-700 transition-colors shadow-xs"
            >
              RETURN TO WAR ROOM
            </button>

          </div>
        </div>
      )}
    </>
  );
}
