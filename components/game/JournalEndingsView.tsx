'use client';

import React from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate } from '@/lib/game/simulation/engine';
import { ScrollText, Award, Shield, CheckCircle, Scale, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

export function JournalEndingsView() {
  const { state } = useGame();

  const passedLawsCount = state.reforms.filter(r => r.status === 'PASSED_ACT').length;
  const casesWonCount = state.cases.filter(c => c.currentStage === 'FILED_PIL' || c.currentStage === 'EXPOSED').length;

  return (
    <div className="space-y-4">
      
      {/* Header in Black, Red, Yellow */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-zinc-800 bg-[#0E1320] p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5 bg-red-950/40 px-2 py-0.5 rounded-xs border border-red-900/60">
              <span className="stamp-red text-[9px]">CHRONICLE</span>
              <span>CAMPAIGN ARCHIVE &amp; DEMOCRATIC LEGACY</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs text-zinc-300">The Living Record of Your Decisions</span>
          </div>
          <h2 className="font-tactical text-xl font-black text-white mt-1">
            The Long Struggle for Institutional Accountability
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-tactical">
          <div className="rounded-xs border border-zinc-700 bg-black px-3.5 py-1.5 font-bold">
            <span className="text-zinc-400">EVENTS LOGGED: </span>
            <span className="font-black text-[#FACC15] tabular-nums text-sm">{state.journal.length}</span>
          </div>
        </div>
      </div>

      {/* Legacy Audit Report Card in Black, Red, Yellow */}
      <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-5 text-xs space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
          <h3 className="font-tactical text-base font-black text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-[#FACC15]" />
            <span>ETHICAL AUDIT &amp; CONSTITUTIONAL ASSESSMENT</span>
          </h3>
          <span className="stamp-yellow text-[10px]">VERDICT OF HISTORY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-tactical">
          <div className="rounded-xs border-2 border-zinc-800 bg-black p-3.5 space-y-1">
            <span className="text-zinc-400 text-[10px]">PUBLIC INTEGRITY INDEX</span>
            <div className="text-2xl font-black text-[#FACC15] tabular-nums">
              {state.movement.publicTrust}%
            </div>
            <p className="text-[10px] text-zinc-400 font-sans">
              Maintained strictly separate personal vs movement ledgers with zero dark corporate money.
            </p>
          </div>

          <div className="rounded-xs border-2 border-zinc-800 bg-black p-3.5 space-y-1">
            <span className="text-zinc-400 text-[10px]">SYSTEMIC LAWS ENACTED</span>
            <div className="text-2xl font-black text-emerald-400 tabular-nums">
              {passedLawsCount} Enacted
            </div>
            <p className="text-[10px] text-zinc-400 font-sans">
              Structural reforms passed into the official statute books of the Republic.
            </p>
          </div>

          <div className="rounded-xs border-2 border-zinc-800 bg-black p-3.5 space-y-1">
            <span className="text-zinc-400 text-[10px]">COURT &amp; RTI VICTORIES</span>
            <div className="text-2xl font-black text-[#EF4444] tabular-nums">
              {casesWonCount} Completed
            </div>
            <p className="text-[10px] text-zinc-400 font-sans">
              Forensic corruption cartels exposed before High Court and Supreme Court benches.
            </p>
          </div>
        </div>

        <div className="rounded-xs border border-zinc-700 bg-black/80 p-4 text-xs text-zinc-200 leading-relaxed font-sans">
          <strong className="text-[#FACC15] font-tactical">THE HISTORIAN&apos;S VERDICT: </strong>
          You began in June 2026 as a citizen outside power, armed with only indignation and a phone. Through the heatwave of Jantar Mantar, legal scrutiny, and the treacherous calculus of 543 parliamentary seats, you built an organization that refused to be squashed. You proved that ordinary citizens in modern India do not have to accept corruption as an inevitable weather condition.
        </div>
      </div>

      {/* Chronicle Timeline Entries */}
      <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs space-y-3 shadow-md">
        <h3 className="font-tactical font-black text-white border-b-2 border-zinc-800 pb-2.5 flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-[#DC2626]" />
          <span>CHRONOLOGICAL CAMPAIGN DIARY</span>
        </h3>

        <div className="space-y-2.5">
          {state.journal.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xs border border-zinc-800 bg-black/80 p-3.5 text-xs space-y-1 font-tactical hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-white text-xs flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15]" />
                  <span>{entry.title}</span>
                </span>
                <span className="text-[10px] text-[#FACC15] font-mono bg-zinc-900 px-2 py-0.5 rounded-xs border border-zinc-800">
                  {formatDate(entry.date)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 font-sans leading-relaxed pt-0.5">{entry.text}</p>
              <div className="text-[9px] text-zinc-500 font-mono pt-1">
                Domain: <strong className="text-zinc-400">{entry.associatedScreen || 'GENERAL'}</strong> · Significance: <strong className="text-[#DC2626]">{entry.significance}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
