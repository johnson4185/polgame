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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-line bg-surface p-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-danger-fg flex items-center gap-1.5 bg-danger-soft px-2 py-0.5 rounded-xs border border-danger-line">
              <span className="stamp-red text-[9px]">OFFICIAL RECORD</span>
              <span>VERIFIED HISTORICAL ARCHIVE (TARGET CUTOFF: 30 SEP 2026)</span>
            </span>
            <span className="text-faint">|</span>
            <span className="text-xs text-fg-2">Public Records & Citations</span>
          </div>
          <h2 className="font-display text-xl font-bold text-fg mt-1">
            CJI Remark Context, Student Mobilization, CJP Genesis &amp; Court Records
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-tactical">
          <span className="text-muted font-bold">FILTER:</span>
          {['ALL', 'DOCUMENTED_FACT', 'COURT_RECORD', 'OFFICIAL_PROCEEDING'].map((f) => (
            <button
              key={f}
              onClick={() => {
                soundManager.playClick();
                setFilterStatus(f);
              }}
              className={`px-3 py-1 rounded-xs border font-black transition-all ${
                filterStatus === f
                  ? 'border-accent bg-[#FACC15] text-black shadow-xs'
                  : 'border-line bg-raised text-muted hover:text-fg hover:border-line-strong'
              }`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Archive Disclaimer Notice */}
      <div className="rounded-xs border border-line bg-surface p-3.5 text-xs text-fg-2 leading-relaxed font-sans shadow-md">
        <strong className="text-accent-fg font-tactical">HISTORICAL INTEGRITY POLICY: </strong>
        Events in this archive reflect verified public reporting, Supreme Court hearing transcripts, and official press bulletins from 2024 to 2026. Private operational conversations and daily simulation variables in the game are labeled as dramatization and simulated values.
      </div>

      {/* Dispatches Timeline */}
      <div className="space-y-3">
        {filteredArchive.map((dispatch) => (
          <div
            key={dispatch.id}
            className="rounded-xs border-2 border-line bg-surface p-4 text-xs space-y-2.5 shadow-md hover:border-line-strong transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-line pb-2 font-tactical">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-black text-accent-fg flex items-center gap-1.5 bg-inset px-2 py-0.5 rounded-xs border border-line">
                  <Calendar className="h-3.5 w-3.5 text-danger-fg" />
                  {dispatch.historicalDate}
                </span>
                <span className="text-faint">·</span>
                <span className="font-bold text-fg">{dispatch.sourcePublication}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={`rounded-xs px-2 py-0.5 text-[9px] font-black tracking-wider ${
                  dispatch.verificationStatus === 'DOCUMENTED_FACT' ? 'bg-success-soft text-success-fg border border-success-line' :
                  dispatch.verificationStatus === 'COURT_RECORD' ? 'bg-info-soft text-info-fg border border-info-line' : 'bg-info-soft text-purple-400 border border-info-line'
                }`}>
                  {dispatch.verificationStatus.replace(/_/g, ' ')}
                </span>

                <a
                  href={dispatch.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-danger-fg hover:text-accent-fg text-[10px] font-bold transition-colors"
                >
                  <span>Verified Source</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <h3 className="font-tactical text-sm font-black text-fg">{dispatch.title}</h3>
            <p className="text-fg-2 leading-relaxed font-sans">{dispatch.summary}</p>

            <div className="border-t border-line pt-2 flex flex-wrap items-center justify-between text-[11px] font-tactical text-muted">
              <div>
                <span className="text-faint">PEOPLE MENTIONED: </span>
                <span className="text-fg">{dispatch.peopleMentioned.join(', ')}</span>
              </div>
              <div className="text-[10px] text-accent-fg font-mono">
                Relevance: {dispatch.relevanceToCJP}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
