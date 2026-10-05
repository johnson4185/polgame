'use client';

import React from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Trophy, Vote, CheckCircle, Flag, Handshake, ShieldAlert, Sparkles, Radio, Award, AlertTriangle } from 'lucide-react';

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

  const hasElection = live.isCountingUnderway || live.isCountingFinished;
  if (!hasElection) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xs border border-line bg-inset">
          <div className="h-1.5 caution-stripes" />
          <div className="flex items-center justify-between gap-3 px-3 py-2 font-tactical text-xs sm:px-4">
            <span className="font-bold text-fg">Election Commission of India · 543 Lok Sabha tabulation</span>
            <span className="shrink-0 font-bold text-accent-fg">272 for majority</span>
          </div>
        </div>
        <div className="rounded-xs border border-line bg-surface px-6 py-12 text-center">
          <Vote className="mx-auto h-10 w-10 text-faint" aria-hidden="true" />
          <h2 className="mt-3 font-display text-xl font-bold text-fg">No election has been called yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {state.party.isFormed
              ? `Nominate candidates at the Party & ECI desk, then call the general election. You have ${state.party.candidateCount} candidate${state.party.candidateCount === 1 ? '' : 's'} (projected ${state.party.projectedSeats} seat${state.party.projectedSeats === 1 ? '' : 's'}).`
              : 'Register your party with the Election Commission first, then nominate candidates and call the election.'}
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'PARTY_ECI' })}
            className="mt-5 rounded-xs bg-[#DC2626] px-5 py-2.5 font-tactical text-xs font-black text-white transition-colors hover:bg-red-700"
          >
            GO TO PARTY &amp; ECI DESK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Broadcast banner: stripes as an edge accent so the text stays readable */}
      <div className="overflow-hidden rounded-xs border border-line bg-inset">
        <div className="h-1.5 caution-stripes" />
        <div className="flex items-center justify-between gap-3 px-3 py-2 font-tactical text-xs sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-xs bg-[#DC2626] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
              {live.isCountingUnderway ? 'Live' : live.isCountingFinished ? 'Final' : 'Standby'}
            </span>
            <span className="truncate font-bold text-fg">Election Commission of India · 543 Lok Sabha tabulation</span>
          </div>
          <span className="shrink-0 font-bold text-accent-fg">272 for majority</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-line bg-surface p-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-danger-fg flex items-center gap-1.5 bg-danger-soft px-2 py-0.5 rounded-xs border border-danger-line">
              <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-ping" />
              543 CONSTITUENCIES LIVE COUNTING
            </span>
            <span className="text-faint">|</span>
            <span className="text-xs font-bold text-accent-fg bg-inset px-2 py-0.5 rounded-xs border border-line-strong">
              Mandate 2026-2029
            </span>
          </div>
          <h2 className="font-display text-xl font-bold text-fg mt-1">
            EVM Tabulation Room &amp; National Coalition Command
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-tactical">
          <button
            disabled={!live.isCountingUnderway || live.isCountingFinished}
            onClick={handleStepCount}
            className={`rounded-xs border-2 px-5 py-2.5 font-black shadow-md transition-all ${
              live.isCountingUnderway && !live.isCountingFinished
                ? 'bg-[#FACC15] text-black border-accent-line hover:bg-yellow-300 hover:scale-105 active:scale-95'
                : 'bg-line-strong text-faint cursor-not-allowed border-line-strong'
            }`}
          >
            {live.isCountingFinished ? 'COUNTING CONCLUDED' : 'TABULATE NEXT 35 SEATS'}
          </button>
        </div>
      </div>

      {/* Main 543 Tally Bar with 272 Majority Line */}
      <div className="rounded-xs border-2 border-line bg-surface p-5 text-xs space-y-4 shadow-xl">
        
        <div className="flex items-center justify-between font-tactical">
          <span className="font-black text-base text-fg flex items-center gap-2">
            <Radio className="h-4 w-4 text-danger-fg animate-pulse" />
            <span>543 SEAT PARLIAMENTARY ALLOCATION:</span>
          </span>
          <span className="text-xs font-bold text-fg-2">
            Counted: <strong className="text-accent-fg tabular-nums font-black text-base">{live.countedSeatsCount}</strong> / 543 Seats
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
          <div className="relative h-14 w-full overflow-hidden rounded-xs border-2 border-line-strong bg-inset flex shadow-inner">
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
              className="bg-[#3F3F46] h-full flex items-center justify-center text-fg font-tactical text-xs font-black transition-all duration-500"
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
        <div className="flex flex-wrap items-center justify-between gap-3 font-tactical text-xs pt-3 border-t-2 border-line">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-inset px-2.5 py-1 rounded-xs border border-line">
              <span className="h-3 w-3 rounded-xs bg-[#F59E0B]" />
              <span className="font-bold text-fg-2">Ruling NDA:</span>
              <span className="tabular-nums font-black text-sm text-accent-fg">{live.rulingSeats}</span>
            </div>

            <div className="flex items-center gap-2 bg-inset px-2.5 py-1 rounded-xs border border-danger-line">
              <span className="h-3 w-3 rounded-xs bg-[#DC2626]" />
              <span className="font-black text-fg">{state.party.abbreviation || 'CJP'}:</span>
              <span className="tabular-nums font-black text-sm text-danger-fg">{live.cjpSeats}</span>
            </div>

            <div className="flex items-center gap-2 bg-inset px-2.5 py-1 rounded-xs border border-line">
              <span className="h-3 w-3 rounded-xs bg-[#2563EB]" />
              <span className="font-bold text-fg-2">Opposition INDIA:</span>
              <span className="tabular-nums font-black text-sm text-info-fg">{live.oppositionSeats}</span>
            </div>

            <div className="flex items-center gap-2 bg-inset px-2.5 py-1 rounded-xs border border-line">
              <span className="h-3 w-3 rounded-xs bg-[#3F3F46]" />
              <span className="text-muted font-semibold">Others:</span>
              <span className="tabular-nums font-bold text-fg">{live.otherSeats}</span>
            </div>
          </div>

          <div className="text-right text-fg-2 text-xs font-bold">
            Target to Form Union Government: <strong className="text-accent-fg text-sm ml-1">272 Seats</strong>
          </div>
        </div>

      </div>

      {/* Counting Concluded & Coalition Talks Section */}
      {live.isCountingFinished && (
        <div className="rounded-xs border-2 border-line-strong bg-surface p-5 text-xs space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 text-lg font-tactical font-black text-fg">
            <Trophy className="h-7 w-7 text-accent-fg" />
            <span>MANDATE DELIVERED · PARLIAMENTARY VERDICT</span>
          </div>

          <p className="text-fg leading-relaxed font-sans text-sm">
            The Election Commission has certified all 543 constituencies. The Cockroach Janta Party has secured 
            <strong className="text-accent-fg font-tactical font-black text-base mx-1.5 bg-inset px-2 py-0.5 rounded-xs border border-accent">
              {live.cjpSeats} Lok Sabha seats
            </strong>.
            Neither national bloc reached the 272 absolute majority on its own. Your citizen delegation holds the decisive balance of power in the Republic.
          </p>

          {!live.coalitionFormed ? (
            <div className="space-y-3 pt-2">
              <span className="font-tactical font-black text-fg text-xs block uppercase tracking-wider flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-[#DC2626]" />
                <span>CHOOSE YOUR STRATEGIC PARLIAMENTARY PATH:</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-tactical">
                {/* Coalition Option 1 */}
                <button
                  onClick={() => handleCoalition('RULING')}
                  className="rounded-xs border-2 border-accent-line bg-accent-soft p-4 text-left hover:border-accent hover:bg-accent-soft transition-all space-y-1.5 shadow-md group"
                >
                  <div className="font-black text-accent-fg flex items-center gap-1.5 text-xs">
                    <Handshake className="h-4 w-4 text-accent-fg" />
                    <span>Common Minimum Programme</span>
                  </div>
                  <p className="text-[11px] text-fg-2 font-normal leading-relaxed">
                    Form government with Ruling Alliance. Demand Education, Law, and Independent Exam Commission portfolios.
                  </p>
                  <div className="text-[10px] text-success-fg font-black pt-1 bg-success-soft px-2 py-0.5 rounded-xs border border-success-line inline-block">
                    Enters Union Cabinet ({live.rulingSeats + live.cjpSeats} seats)
                  </div>
                </button>

                {/* Coalition Option 2 */}
                <button
                  onClick={() => handleCoalition('OPPOSITION')}
                  className="rounded-xs border-2 border-blue-600/70 bg-surface p-4 text-left hover:border-blue-400 hover:bg-info-soft transition-all space-y-1.5 shadow-md group"
                >
                  <div className="font-black text-info-fg flex items-center gap-1.5 text-xs">
                    <Sparkles className="h-4 w-4 text-info-fg" />
                    <span>Accountability Coalition</span>
                  </div>
                  <p className="text-[11px] text-fg-2 font-normal leading-relaxed">
                    Unite with Opposition Alliance to replace the ruling government and pass whistleblower protection acts.
                  </p>
                  <div className="text-[10px] text-info-fg font-black pt-1 bg-info-soft px-2 py-0.5 rounded-xs border border-info-line inline-block">
                    Reform Coalition ({live.oppositionSeats + live.cjpSeats} seats)
                  </div>
                </button>

                {/* Option 3: Independent Watchdog */}
                <button
                  onClick={() => handleCoalition('THIRD_FRONT')}
                  className="rounded-xs border-2 border-red-600/70 bg-danger-soft p-4 text-left hover:border-red-500 hover:bg-danger-soft transition-all space-y-1.5 shadow-md group"
                >
                  <div className="font-black text-danger-fg flex items-center gap-1.5 text-xs">
                    <Flag className="h-4 w-4 text-danger-fg" />
                    <span>Crossbench Watchdog Bloc</span>
                  </div>
                  <p className="text-[11px] text-fg-2 font-normal leading-relaxed">
                    Decline ministerial perks and red beacons. Hold both sides accountable on every single bill from the floor.
                  </p>
                  <div className="text-[10px] text-white font-black pt-1 bg-[#DC2626] px-2 py-0.5 rounded-xs inline-block">
                    Uncompromised Integrity
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xs bg-accent-soft border-2 border-accent p-4 text-xs text-fg font-tactical shadow-md">
              <div className="font-black flex items-center gap-2 text-sm text-accent-fg">
                <CheckCircle className="h-5 w-5 text-success-fg" />
                <span>GOVERNMENT MANDATE RATIFIED</span>
              </div>
              <p className="text-xs mt-1.5 text-fg leading-relaxed font-sans">{live.coalitionSummary}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
