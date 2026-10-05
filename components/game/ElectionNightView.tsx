'use client';

import React from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Trophy, CheckCircle, Flag, Handshake, ShieldAlert, Sparkles, Radio, Award, AlertTriangle } from 'lucide-react';

export function ElectionNightView() {
  const { state, dispatch } = useGame();
  const live = state.electionLiveState;

  const handleStepCount = () => {
    soundManager.playGavel();
    dispatch({ type: 'STEP_ELECTION_COUNT' });
  };

  const handleCoalition = (partner: 'RULING' | 'OPPOSITION' | 'THIRD_FRONT') => {
    soundManager.playGavel();
    dispatch({ type: 'FORM_COALITION', partner });
  };

  const totalSeats = 543;
  const majorityThreshold = 272;

  // Percentages for bar
  const rulingWidth = (live.rulingSeats / totalSeats) * 100;
  const oppWidth = (live.oppositionSeats / totalSeats) * 100;
  const cjpWidth = (live.cjpSeats / totalSeats) * 100;
  const otherWidth = (live.otherSeats / totalSeats) * 100;

  return (
    <div className="space-y-4">
      
      {/* Live Breaking Election Studio Banner in Black, Red, Yellow */}
      <div className="flex items-center justify-between caution-stripes px-3 sm:px-4 py-2 rounded-xs border-2 border-zinc-700 font-tactical text-xs font-black text-black shadow-lg">
        <div className="flex items-center gap-2">
          <span className="bg-[#DC2626] text-white px-2 py-0.5 rounded-xs animate-pulse text-[10px] tracking-widest uppercase font-mono">
            LIVE BROADCAST
          </span>
          <span className="tracking-wide hidden sm:inline">ELECTION COMMISSION OF INDIA · 543 LOK SABHA TABULATION</span>
          <span className="tracking-wide sm:hidden">ECI 543 COUNTING</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-black text-[#FACC15] px-2 py-0.5 rounded-xs font-bold text-[11px]">
            MAJORITY: 272 SEATS
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-zinc-800 bg-[#0E1320] p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5 bg-red-950/40 px-2 py-0.5 rounded-xs border border-red-900/60">
              <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-ping" />
              543 CONSTITUENCIES LIVE COUNTING
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs font-bold text-[#FACC15] bg-black px-2 py-0.5 rounded-xs border border-zinc-700">
              Mandate 2026-2029
            </span>
          </div>
          <h2 className="font-tactical text-xl font-black text-white mt-1">
            EVM Tabulation Room &amp; National Coalition Command
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-tactical">
          <button
            disabled={!live.isCountingUnderway || live.isCountingFinished}
            onClick={handleStepCount}
            className={`rounded-xs border-2 px-5 py-2.5 font-black shadow-md transition-all ${
              live.isCountingUnderway && !live.isCountingFinished
                ? 'bg-[#FACC15] text-black border-yellow-400 hover:bg-white hover:scale-105 active:scale-95'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-700'
            }`}
          >
            {live.isCountingFinished ? 'COUNTING CONCLUDED' : 'TABULATE NEXT 35 SEATS'}
          </button>
        </div>
      </div>

      {/* Main 543 Tally Bar with 272 Majority Line */}
      <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-5 text-xs space-y-4 shadow-xl">
        
        <div className="flex items-center justify-between font-tactical">
          <span className="font-black text-base text-white flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#DC2626] animate-pulse" />
            <span>543 SEAT PARLIAMENTARY ALLOCATION:</span>
          </span>
          <span className="text-xs font-bold text-zinc-300">
            Counted: <strong className="text-[#FACC15] tabular-nums font-black text-base">{live.countedSeatsCount}</strong> / 543 Seats
          </span>
        </div>

        {/* 272 Majority Indicator Marker */}
        <div className="relative pt-5">
          <div 
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30"
            style={{ left: `${(majorityThreshold / totalSeats) * 100}%` }}
          >
            <span className="bg-[#DC2626] text-white font-tactical text-[10px] font-black px-2 py-0.5 rounded-xs border border-red-400 shadow-lg whitespace-nowrap animate-bounce">
              ▼ 272 MAJORITY LINE
            </span>
          </div>

          {/* Visual Progress Stacked Bar */}
          <div className="relative h-14 w-full overflow-hidden rounded-xs border-2 border-zinc-700 bg-black flex shadow-inner">
            {/* Ruling Coalition (Amber / Saffron) */}
            <div
              style={{ width: `${rulingWidth}%` }}
              className="bg-[#F59E0B] h-full flex items-center justify-center text-black font-tactical text-xs font-black transition-all duration-500 border-r-2 border-black"
              title={`Ruling Alliance (NDA): ${live.rulingSeats} seats`}
            >
              {live.rulingSeats > 20 && `NDA ${live.rulingSeats}`}
            </div>

            {/* Player CJP Party (Crimson Red) */}
            <div
              style={{ width: `${cjpWidth}%` }}
              className="bg-[#DC2626] h-full flex items-center justify-center text-white font-tactical text-xs font-black transition-all duration-500 border-r-2 border-black shadow-[inset_0_0_12px_rgba(0,0,0,0.5)]"
              title={`CJP: ${live.cjpSeats} seats`}
            >
              {live.cjpSeats > 10 && `CJP ${live.cjpSeats}`}
            </div>

            {/* Opposition Alliance (Cobalt Blue) */}
            <div
              style={{ width: `${oppWidth}%` }}
              className="bg-[#2563EB] h-full flex items-center justify-center text-white font-tactical text-xs font-black transition-all duration-500 border-r-2 border-black"
              title={`Opposition Alliance (INDIA): ${live.oppositionSeats} seats`}
            >
              {live.oppositionSeats > 20 && `INDIA ${live.oppositionSeats}`}
            </div>

            {/* Regional Others (Charcoal) */}
            <div
              style={{ width: `${otherWidth}%` }}
              className="bg-[#3F3F46] h-full flex items-center justify-center text-zinc-200 font-tactical text-xs font-black transition-all duration-500"
              title={`Others / Independents: ${live.otherSeats} seats`}
            >
              {live.otherSeats > 15 && `OTH ${live.otherSeats}`}
            </div>

            {/* Majority Threshold 272 Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-[#FACC15] z-20 pointer-events-none shadow-[0_0_10px_#FACC15]"
              style={{ left: `${(majorityThreshold / totalSeats) * 100}%` }}
            />
          </div>
        </div>

        {/* Legend with Color Accents in Black, Red, Yellow */}
        <div className="flex flex-wrap items-center justify-between gap-3 font-tactical text-xs pt-3 border-t-2 border-zinc-800">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-black px-2.5 py-1 rounded-xs border border-zinc-800">
              <span className="h-3 w-3 rounded-xs bg-[#F59E0B]" />
              <span className="font-bold text-zinc-300">Ruling NDA:</span>
              <span className="tabular-nums font-black text-sm text-[#F59E0B]">{live.rulingSeats}</span>
            </div>

            <div className="flex items-center gap-2 bg-black px-2.5 py-1 rounded-xs border border-red-900/60">
              <span className="h-3 w-3 rounded-xs bg-[#DC2626]" />
              <span className="font-black text-white">{state.party.abbreviation || 'CJP'}:</span>
              <span className="tabular-nums font-black text-sm text-[#EF4444]">{live.cjpSeats}</span>
            </div>

            <div className="flex items-center gap-2 bg-black px-2.5 py-1 rounded-xs border border-zinc-800">
              <span className="h-3 w-3 rounded-xs bg-[#2563EB]" />
              <span className="font-bold text-zinc-300">Opposition INDIA:</span>
              <span className="tabular-nums font-black text-sm text-blue-400">{live.oppositionSeats}</span>
            </div>

            <div className="flex items-center gap-2 bg-black px-2.5 py-1 rounded-xs border border-zinc-800">
              <span className="h-3 w-3 rounded-xs bg-[#3F3F46]" />
              <span className="text-zinc-400 font-semibold">Others:</span>
              <span className="tabular-nums font-bold text-zinc-200">{live.otherSeats}</span>
            </div>
          </div>

          <div className="text-right text-zinc-300 text-xs font-bold">
            Target to Form Union Government: <strong className="text-[#FACC15] text-sm ml-1">272 Seats</strong>
          </div>
        </div>

      </div>

      {/* Counting Concluded & Coalition Talks Section */}
      {live.isCountingFinished && (
        <div className="rounded-xs border-2 border-zinc-700 bg-[#0C101A] p-5 text-xs space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 text-lg font-tactical font-black text-white">
            <Trophy className="h-7 w-7 text-[#FACC15]" />
            <span>MANDATE DELIVERED · PARLIAMENTARY VERDICT</span>
          </div>

          <p className="text-zinc-200 leading-relaxed font-sans text-sm">
            The Election Commission has certified all 543 constituencies. The Cockroach Janta Party has secured 
            <strong className="text-[#FACC15] font-tactical font-black text-base mx-1.5 bg-black px-2 py-0.5 rounded-xs border border-[#FACC15]">
              {live.cjpSeats} Lok Sabha seats
            </strong>.
            Neither national bloc reached the 272 absolute majority on its own. Your citizen delegation holds the decisive balance of power in the Republic.
          </p>

          {!live.coalitionFormed ? (
            <div className="space-y-3 pt-2">
              <span className="font-tactical font-black text-white text-xs block uppercase tracking-wider flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-[#DC2626]" />
                <span>CHOOSE YOUR STRATEGIC PARLIAMENTARY PATH:</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-tactical">
                {/* Coalition Option 1 */}
                <button
                  onClick={() => handleCoalition('RULING')}
                  className="rounded-xs border-2 border-yellow-600/70 bg-[#161208] p-4 text-left hover:border-[#FACC15] hover:bg-yellow-950/40 transition-all space-y-1.5 shadow-md group"
                >
                  <div className="font-black text-[#FACC15] flex items-center gap-1.5 text-xs">
                    <Handshake className="h-4 w-4 text-[#FACC15]" />
                    <span>Common Minimum Programme</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-normal leading-relaxed">
                    Form government with Ruling Alliance. Demand Education, Law, and Independent Exam Commission portfolios.
                  </p>
                  <div className="text-[10px] text-emerald-400 font-black pt-1 bg-emerald-950 px-2 py-0.5 rounded-xs border border-emerald-800 inline-block">
                    Enters Union Cabinet ({live.rulingSeats + live.cjpSeats} seats)
                  </div>
                </button>

                {/* Coalition Option 2 */}
                <button
                  onClick={() => handleCoalition('OPPOSITION')}
                  className="rounded-xs border-2 border-blue-600/70 bg-[#091122] p-4 text-left hover:border-blue-400 hover:bg-blue-950/40 transition-all space-y-1.5 shadow-md group"
                >
                  <div className="font-black text-blue-400 flex items-center gap-1.5 text-xs">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span>Accountability Coalition</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-normal leading-relaxed">
                    Unite with Opposition Alliance to replace the ruling government and pass whistleblower protection acts.
                  </p>
                  <div className="text-[10px] text-blue-300 font-black pt-1 bg-blue-950 px-2 py-0.5 rounded-xs border border-blue-800 inline-block">
                    Reform Coalition ({live.oppositionSeats + live.cjpSeats} seats)
                  </div>
                </button>

                {/* Option 3: Independent Watchdog */}
                <button
                  onClick={() => handleCoalition('THIRD_FRONT')}
                  className="rounded-xs border-2 border-red-600/70 bg-[#1A0A0A] p-4 text-left hover:border-red-500 hover:bg-red-950/40 transition-all space-y-1.5 shadow-md group"
                >
                  <div className="font-black text-[#EF4444] flex items-center gap-1.5 text-xs">
                    <Flag className="h-4 w-4 text-[#EF4444]" />
                    <span>Crossbench Watchdog Bloc</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-normal leading-relaxed">
                    Decline ministerial perks and red beacons. Hold both sides accountable on every single bill from the floor.
                  </p>
                  <div className="text-[10px] text-white font-black pt-1 bg-[#DC2626] px-2 py-0.5 rounded-xs inline-block">
                    Uncompromised Integrity
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xs bg-yellow-950/80 border-2 border-[#FACC15] p-4 text-xs text-white font-tactical shadow-md">
              <div className="font-black flex items-center gap-2 text-sm text-[#FACC15]">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>GOVERNMENT MANDATE RATIFIED</span>
              </div>
              <p className="text-xs mt-1.5 text-zinc-200 leading-relaxed font-sans">{live.coalitionSummary}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
