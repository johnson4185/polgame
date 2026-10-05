'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Vote, HelpCircle } from 'lucide-react';
import { BALANCE } from '@/lib/game/simulation/engine';

export function TurnTrackerWidget() {
  const { state } = useGame();
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


  return (
    <>
      <button
        onClick={() => {
          soundManager.playClick();
          setShowRoadmapModal(true);
        }}
        title="View the campaign roadmap"
        className="group flex h-8 items-center gap-2 rounded-xs border border-line bg-inset px-2 font-tactical text-xs transition-colors hover:border-accent"
      >
        <span className="rounded-xs bg-[#DC2626] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
          Day {turnNumber}
        </span>
        <span className="hidden text-[10px] font-bold uppercase tracking-wide text-muted group-hover:text-fg md:inline">
          {cycleName}
        </span>
        <HelpCircle className="hidden h-3.5 w-3.5 text-faint group-hover:text-accent-fg md:block" aria-hidden="true" />
      </button>

      {/* Campaign Roadmap Modal */}
      {showRoadmapModal && (
        <div role="dialog" aria-modal="true" aria-label="Campaign roadmap" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-xs border-2 border-accent bg-surface p-5 shadow-2xl text-fg font-sans">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#DC2626] text-white">
                  <Vote className="h-4 w-4" />
                </span>
                <div>
                  <span className="stamp-yellow text-[9px]">STRATEGIC CAMPAIGN ROADMAP</span>
                  <h3 className="font-display text-base font-bold text-fg">
                    TURN {turnNumber} · CYCLE {cycleNumber}: {cycleName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowRoadmapModal(false)}
                className="text-faint hover:text-fg font-mono text-xs border border-line px-2 py-1 rounded-xs"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="py-4 space-y-3.5">
              
              {/* Election Countdown Banner */}
              <div className="rounded-xs border border-line bg-inset p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">SUGGESTED ELECTION WINDOW</span>
                  <span className="font-tactical text-lg font-black text-accent-fg">
                    {daysUntilElection > 0 ? `~${daysUntilElection} days of preparation left` : 'Ready when you are'}
                  </span>
                  <span className="block text-xs text-muted">You call the election from the Party &amp; ECI desk once candidates are nominated.</span>
                </div>
              </div>

              {/* The 4 Cycles */}
              <div className="space-y-2 font-tactical text-xs">
                <span className="font-black text-muted text-[11px] uppercase tracking-wider block">
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
                    desc: `Register the party with the Election Commission (${BALANCE.partyVolunteersRequired.toLocaleString('en-IN')} volunteers + ₹${BALANCE.partyRegistrationCost.toLocaleString('en-IN')}) and nominate candidates.`,
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
                        ? 'border-accent bg-raised'
                        : c.status === 'COMPLETED'
                        ? 'border-success-line bg-success-soft text-muted'
                        : 'border-line bg-inset text-faint'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-black ${c.status === 'ACTIVE NOW' ? 'text-fg' : ''}`}>
                        {c.title}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs ${
                        c.status === 'ACTIVE NOW'
                          ? 'bg-[#FACC15] text-black'
                          : c.status === 'COMPLETED'
                          ? 'bg-success-soft text-success-fg border border-success-line'
                          : 'bg-raised text-faint border border-line'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-fg-2 leading-normal">{c.desc}</p>
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
