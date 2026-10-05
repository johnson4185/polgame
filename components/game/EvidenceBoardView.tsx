'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { InvestigationCase, EvidenceItem } from '@/lib/game/types';
import { 
  FileSearch, 
  FileText, 
  Scale, 
  Share2, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Layers,
  Sparkles,
  Search,
  Pin,
  History
} from 'lucide-react';
import Image from 'next/image';
import { SituationLogView } from './SituationLogView';

export function EvidenceBoardView() {
  const { state, dispatch } = useGame();
  const [viewMode, setViewMode] = useState<'DOSSIERS' | 'SITUATION_LOG'>('DOSSIERS');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(state.cases[0]?.id || 'CASE-EXAM-LEAK');

  const selectedCase = state.cases.find(c => c.id === selectedCaseId) || state.cases[0];

  const handleAction = (action: 'RTI_FILING' | 'CORROBORATE_EVIDENCE' | 'LEGAL_PETITION_HC' | 'PUBLIC_EXPOSE') => {
    if (!selectedCase) return;
    soundManager.playPaper();
    dispatch({
      type: 'INVESTIGATION_ACTION',
      caseId: selectedCase.id,
      action,
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Evidence Board Header in Black, Red, Yellow */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-zinc-800 bg-[#0E1320] p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5 bg-red-950/40 px-2 py-0.5 rounded-xs border border-red-900/60">
              <span className="stamp-red text-[9px]">EXHIBIT A</span>
              <span>FORENSIC INVESTIGATION &amp; RTI WAR ROOM</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs font-bold text-zinc-300">Direct Documentary Proof</span>
          </div>
          <h2 className="font-tactical text-xl font-black text-white mt-1">
            Paper Trails, Banking Flows &amp; Whistleblower Dossiers
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-tactical">
          <div className="rounded-xs border border-zinc-700 bg-black px-3 py-1.5 font-bold">
            <span className="text-zinc-400">ACTIVE DOSSIERS: </span>
            <span className="text-white tabular-nums">{state.cases.length}</span>
          </div>
          <div className="rounded-xs border border-yellow-500/70 bg-yellow-950/40 px-3 py-1.5 font-bold text-[#FDE047]">
            <span>CASE READINESS: </span>
            <span className="tabular-nums font-black text-sm">
              {selectedCase ? `${selectedCase.readinessPercentage}%` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Switcher: Dossiers vs. Situation Log */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-zinc-800 pb-2">
        <button
          onClick={() => {
            soundManager.playClick();
            setViewMode('DOSSIERS');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xs font-tactical text-xs font-black transition-all ${
            viewMode === 'DOSSIERS'
              ? 'bg-[#DC2626] text-white border-2 border-red-500 shadow-md'
              : 'bg-[#101420] text-zinc-400 border border-zinc-800 hover:border-[#FACC15] hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>FORENSIC DOSSIERS &amp; PINBOARD</span>
          <span className="bg-black/60 px-1.5 py-0.2 rounded-xs font-mono text-[10px]">
            {state.cases.length}
          </span>
        </button>

        <button
          onClick={() => {
            soundManager.playPaper();
            setViewMode('SITUATION_LOG');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xs font-tactical text-xs font-black transition-all ${
            viewMode === 'SITUATION_LOG'
              ? 'bg-[#FACC15] text-black border-2 border-yellow-400 shadow-md'
              : 'bg-[#101420] text-zinc-400 border border-zinc-800 hover:border-[#FACC15] hover:text-white'
          }`}
        >
          <History className="h-4 w-4" />
          <span>SITUATION LOG &amp; STRATEGIC CHRONICLE</span>
          <span className="bg-black px-1.5 py-0.2 rounded-xs font-mono text-[10px] text-[#FACC15] border border-zinc-800">
            {(state.journal?.length || 0) + (state.newsFeed?.length || 0)}
          </span>
        </button>
      </div>

      {/* View Mode Branch */}
      {viewMode === 'SITUATION_LOG' ? (
        <SituationLogView />
      ) : (
        <>
          {/* Case Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-tactical">
            {state.cases.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedCaseId(c.id);
                }}
                className={`px-4 py-2 rounded-xs border-2 transition-all whitespace-nowrap font-black ${
                  selectedCaseId === c.id
                    ? 'border-[#DC2626] bg-black text-[#FACC15] shadow-lg ring-1 ring-[#DC2626]'
                    : 'border-zinc-800 bg-[#121624] text-zinc-400 hover:border-[#FACC15] hover:text-white'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>

          {/* Selected Case Overview */}
          {selectedCase && (
            <div className="space-y-4">
          
          <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs space-y-3 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-zinc-800 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="stamp-black text-[10px]">CLASSIFIED DOSSIER</span>
                  <h3 className="font-tactical text-lg font-black text-white">{selectedCase.title}</h3>
                </div>
                <p className="text-[11px] font-tactical text-zinc-400 mt-1">
                  Target Entity: <span className="font-bold text-zinc-200">{selectedCase.targetMinistryOrEntity}</span> · Legal Exposure: <span className="font-black text-[#EF4444]">{selectedCase.legalRisk}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xs bg-black text-zinc-300 border border-zinc-700 px-2 py-0.5 text-[10px] font-tactical font-black">
                  STAGE: {selectedCase.currentStage.replace(/_/g, ' ')}
                </span>
                <span className="rounded-xs bg-yellow-950 text-[#FDE047] border border-yellow-600 px-2 py-0.5 text-[10px] font-tactical font-black">
                  IMPACT INDEX: {selectedCase.publicImpactPotential}/100
                </span>
              </div>
            </div>

            <p className="text-zinc-300 leading-relaxed font-sans">{selectedCase.outcomeNotes}</p>

            {/* Action Bar with Black/Red/Yellow Accent Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 border-t-2 border-zinc-800 pt-3 font-tactical">
              <button
                onClick={() => handleAction('RTI_FILING')}
                className="flex items-center gap-1.5 rounded-xs border-2 border-zinc-700 bg-black px-3.5 py-2 text-xs font-black text-zinc-200 hover:border-[#FACC15] hover:text-[#FACC15] transition-colors shadow-xs"
              >
                <FileText className="h-3.5 w-3.5 text-[#FACC15]" />
                <span>File Targeted RTI Application (-₹2,500)</span>
              </button>

              <button
                onClick={() => handleAction('CORROBORATE_EVIDENCE')}
                className="flex items-center gap-1.5 rounded-xs border-2 border-yellow-500 bg-[#FACC15] px-3.5 py-2 text-xs font-black text-black hover:bg-white transition-colors shadow-xs"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Forensic Corroboration (-₹8,000)</span>
              </button>

              <button
                onClick={() => handleAction('LEGAL_PETITION_HC')}
                className="flex items-center gap-1.5 rounded-xs bg-black border-2 border-[#EF4444] px-3.5 py-2 text-xs font-black text-white hover:bg-zinc-900 transition-colors shadow-xs"
              >
                <Scale className="h-3.5 w-3.5 text-[#EF4444]" />
                <span>File PIL in High Court (-₹25,000)</span>
              </button>

              <button
                onClick={() => handleAction('PUBLIC_EXPOSE')}
                className="flex items-center gap-1.5 rounded-xs bg-[#DC2626] border-2 border-red-500 px-3.5 py-2 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-xs"
              >
                <Share2 className="h-3.5 w-3.5 text-[#FACC15]" />
                <span>Publish 48-Page National Media Dossier</span>
              </button>
            </div>
          </div>

          {/* Interactive Evidence Clue Cards (Pinboard Grid) */}
          <div className="rounded-xs border-2 border-zinc-700 evidence-pinboard p-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2 mb-4 bg-black/80 p-2.5 rounded-xs">
              <h4 className="font-tactical font-black text-xs text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#DC2626]" />
                <span>FORENSIC EVIDENCE PINBOARD ({selectedCase.evidenceItems.length} CLUES DISCOVERED)</span>
              </h4>
              <span className="font-tactical text-[10px] font-black text-[#FACC15] flex items-center gap-1.5">
                <span className="h-1.5 w-6 bg-[#DC2626] inline-block shadow-[0_0_8px_#DC2626]" />
                <span>CRIMSON THREAD CONNECTOR MATRIX</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCase.evidenceItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xs border-2 border-zinc-700 bg-[#0F1420] p-4 text-xs space-y-2 relative shadow-xl hover:border-[#FACC15] transition-all"
                >
                  {/* Adhesive Tape Accent in Yellow & Red Pushpin */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-4 w-14 bg-[#FACC15]/90 border border-yellow-400 shadow-md rotate-1" />
                  <div className="absolute top-2.5 right-2.5 h-3.5 w-3.5 rounded-full bg-[#DC2626] border-2 border-white shadow-md animate-pulse" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-tactical font-black text-sm text-white">{item.title}</span>
                    <span className="stamp-red text-[8px]">CLUE #{idx + 1}</span>
                  </div>

                  <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                    {item.summary.includes('68 matched') ? (
                      <>
                        <span className="highlight-yellow">68 matched questions</span> identical to the main examination booklet recovered from a playschool premises where 35 students memorized keys 24h before exam.
                      </>
                    ) : item.summary.includes('₹40 Lakh') ? (
                      <>
                        Sequential RTGS transactions made from 12 candidates’ parents to an entity incorporated with <span className="highlight-red">zero actual tech revenue</span>.
                      </>
                    ) : (
                      item.summary
                    )}
                  </p>

                  <div className="border-t-2 border-zinc-800 pt-2 space-y-1 font-tactical text-[10px]">
                    <div className="text-zinc-400">
                      <span className="text-zinc-500 font-bold">SOURCE: </span>{item.provenance}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-200 font-bold">TARGET: {item.linkedTarget}</span>
                      <span className={`font-black px-2 py-0.5 rounded-xs ${
                        item.reliability === 'OFFICIAL_DOCUMENT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                        item.reliability === 'CORROBORATED' ? 'bg-yellow-950 text-[#FACC15] border border-yellow-700' : 'bg-red-950 text-[#EF4444] border border-red-800'
                      }`}>
                        {item.reliability.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
        </>
      )}

    </div>
  );
}
