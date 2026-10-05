'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { BookOpen, ExternalLink, ShieldCheck, AlertCircle, Calendar, CheckCircle2, Bookmark } from 'lucide-react';

export function HistoricalArchiveView() {
  const { state } = useGame();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredArchive = state.historicalArchive.filter(d => {
    if (!d.isUnlocked) return false;
    if (filterStatus !== 'ALL' && d.verificationStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* Header in Black, Red, Yellow */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-zinc-800 bg-[#0E1320] p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5 bg-red-950/40 px-2 py-0.5 rounded-xs border border-red-900/60">
              <span className="stamp-red text-[9px]">OFFICIAL RECORD</span>
              <span>VERIFIED HISTORICAL ARCHIVE (TARGET CUTOFF: 30 SEP 2026)</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs text-zinc-300">Public Records & Citations</span>
          </div>
          <h2 className="font-tactical text-xl font-black text-white mt-1">
            CJI Remark Context, Student Mobilization, CJP Genesis &amp; Court Records
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-tactical">
          <span className="text-zinc-400 font-bold">FILTER:</span>
          {['ALL', 'DOCUMENTED_FACT', 'COURT_RECORD', 'OFFICIAL_PROCEEDING'].map((f) => (
            <button
              key={f}
              onClick={() => {
                soundManager.playClick();
                setFilterStatus(f);
              }}
              className={`px-3 py-1 rounded-xs border font-black transition-all ${
                filterStatus === f
                  ? 'border-[#FACC15] bg-[#FACC15] text-black shadow-xs'
                  : 'border-zinc-800 bg-[#121624] text-zinc-400 hover:text-white hover:border-zinc-600'
              }`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Archive Disclaimer Notice */}
      <div className="rounded-xs border border-zinc-800 bg-[#0C101A] p-3.5 text-xs text-zinc-300 leading-relaxed font-sans shadow-md">
        <strong className="text-[#FACC15] font-tactical">HISTORICAL INTEGRITY POLICY: </strong>
        Events in this archive reflect verified public reporting, Supreme Court hearing transcripts, and official press bulletins from 2024 to 2026. Private operational conversations and daily simulation variables in the game are labeled as dramatization and simulated values.
      </div>

      {/* Dispatches Timeline */}
      <div className="space-y-3">
        {filteredArchive.map((dispatch) => (
          <div
            key={dispatch.id}
            className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs space-y-2.5 shadow-md hover:border-zinc-700 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-zinc-800 pb-2 font-tactical">
              <div className="flex items-center gap-2">
                <span className="font-black text-[#FACC15] flex items-center gap-1.5 bg-black px-2 py-0.5 rounded-xs border border-zinc-800">
                  <Calendar className="h-3.5 w-3.5 text-[#DC2626]" />
                  {dispatch.historicalDate}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="font-bold text-white">{dispatch.sourcePublication}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-xs px-2 py-0.5 text-[9px] font-black tracking-wider ${
                  dispatch.verificationStatus === 'DOCUMENTED_FACT' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  dispatch.verificationStatus === 'COURT_RECORD' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-purple-950 text-purple-400 border border-purple-800'
                }`}>
                  {dispatch.verificationStatus.replace(/_/g, ' ')}
                </span>

                <a
                  href={dispatch.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#DC2626] hover:text-[#FACC15] text-[10px] font-bold transition-colors"
                >
                  <span>Verified Source</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <h3 className="font-tactical text-sm font-black text-white">{dispatch.title}</h3>
            <p className="text-zinc-300 leading-relaxed font-sans">{dispatch.summary}</p>

            <div className="border-t border-zinc-800 pt-2 flex flex-wrap items-center justify-between text-[11px] font-tactical text-zinc-400">
              <div>
                <span className="text-zinc-500">PEOPLE MENTIONED: </span>
                <span className="text-zinc-200">{dispatch.peopleMentioned.join(', ')}</span>
              </div>
              <div className="text-[10px] text-[#FACC15] font-mono">
                Relevance: {dispatch.relevanceToCJP}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
