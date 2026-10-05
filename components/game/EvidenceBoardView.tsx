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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-line bg-surface p-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-danger-fg flex items-center gap-1.5 bg-danger-soft px-2 py-0.5 rounded-xs border border-danger-line">
              <span className="stamp-red text-[9px]">EXHIBIT A</span>
              <span>FORENSIC INVESTIGATION &amp; RTI WAR ROOM</span>
            </span>
            <span className="text-faint">|</span>
            <span className="text-xs font-bold text-fg-2">Direct Documentary Proof</span>
          </div>
          <h2 className="font-display text-xl font-bold text-fg mt-1">
            Paper Trails, Banking Flows &amp; Whistleblower Dossiers
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-tactical">
          <div className="rounded-xs border border-line-strong bg-inset px-3 py-1.5 font-bold">
            <span className="text-muted">ACTIVE DOSSIERS: </span>
            <span className="text-fg tabular-nums">{state.cases.length}</span>
          </div>
          <div className="rounded-xs border border-accent-line bg-accent-soft px-3 py-1.5 font-bold text-accent-fg">
            <span>CASE READINESS: </span>
            <span className="tabular-nums font-black text-sm">
              {selectedCase ? `${selectedCase.readinessPercentage}%` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Switcher: Dossiers vs. Situation Log */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-line pb-2">
        <button
          onClick={() => {
            soundManager.playClick();
            setViewMode('DOSSIERS');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xs font-tactical text-xs font-black transition-all ${
            viewMode === 'DOSSIERS'
              ? 'bg-[#DC2626] text-white border-2 border-red-500 shadow-md'
              : 'bg-surface text-muted border border-line hover:border-accent hover:text-fg'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>FORENSIC DOSSIERS &amp; PINBOARD</span>
          <span className="rounded-xs bg-black/25 px-1.5 py-0.2 font-mono text-[10px]">
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
              ? 'bg-[#FACC15] text-black border-2 border-accent-line shadow-md'
              : 'bg-surface text-muted border border-line hover:border-accent hover:text-fg'
          }`}
        >
          <History className="h-4 w-4" />
          <span>SITUATION LOG &amp; STRATEGIC CHRONICLE</span>
          <span className="bg-inset px-1.5 py-0.2 rounded-xs font-mono text-[10px] text-accent-fg border border-line">
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
                    ? 'border-[#DC2626] bg-inset text-accent-fg shadow-lg ring-1 ring-[#DC2626]'
                    : 'border-line bg-raised text-muted hover:border-accent hover:text-fg'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>

          {/* Selected Case Overview */}
          {selectedCase && (
            <div className="space-y-4">
          
          <div className="rounded-xs border-2 border-line bg-surface p-4 text-xs space-y-3 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-line pb-2.5">
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="stamp-black text-[10px]">CLASSIFIED DOSSIER</span>
                  <h3 className="font-display text-lg font-bold text-fg">{selectedCase.title}</h3>
                </div>
                <p className="text-[11px] font-tactical text-muted mt-1">
                  Target Entity: <span className="font-bold text-fg">{selectedCase.targetMinistryOrEntity}</span> · Legal Exposure: <span className="font-black text-danger-fg">{selectedCase.legalRisk}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="rounded-xs bg-inset text-fg-2 border border-line-strong px-2 py-0.5 text-[10px] font-tactical font-black">
                  STAGE: {selectedCase.currentStage.replace(/_/g, ' ')}
                </span>
                <span className="rounded-xs bg-accent-soft text-accent-fg border border-accent-line px-2 py-0.5 text-[10px] font-tactical font-black">
                  IMPACT INDEX: {selectedCase.publicImpactPotential}/100
                </span>
              </div>
            </div>

            <p className="text-fg-2 leading-relaxed font-sans">{selectedCase.outcomeNotes}</p>

            {/* Action Bar with Black/Red/Yellow Accent Buttons */}
            <div className="grid grid-cols-1 gap-2 border-t border-line pt-3 font-tactical sm:grid-cols-2 xl:grid-cols-4 [&>button]:justify-center">
              <button
                onClick={() => handleAction('RTI_FILING')}
                className="flex items-center gap-1.5 rounded-xs border-2 border-line-strong bg-inset px-3.5 py-2 text-xs font-black text-fg hover:border-accent hover:text-accent-fg transition-colors shadow-xs"
              >
                <FileText className="h-3.5 w-3.5 text-accent-fg" />
                <span>File Targeted RTI Application (-₹2,500)</span>
              </button>

              <button
                onClick={() => handleAction('CORROBORATE_EVIDENCE')}
                className="flex items-center gap-1.5 rounded-xs border-2 border-accent-line bg-[#FACC15] px-3.5 py-2 text-xs font-black text-black hover:bg-yellow-300 transition-colors shadow-xs"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Forensic Corroboration (-₹8,000)</span>
              </button>

              <button
                onClick={() => handleAction('LEGAL_PETITION_HC')}
                className="flex items-center gap-1.5 rounded-xs bg-inset border-2 border-[#EF4444] px-3.5 py-2 text-xs font-black text-fg hover:bg-raised transition-colors shadow-xs"
              >
                <Scale className="h-3.5 w-3.5 text-danger-fg" />
                <span>File PIL in High Court (-₹25,000)</span>
              </button>

              <button
                onClick={() => handleAction('PUBLIC_EXPOSE')}
                className="flex items-center gap-1.5 rounded-xs bg-[#DC2626] border-2 border-red-500 px-3.5 py-2 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-xs"
              >
                <Share2 className="h-3.5 w-3.5 text-accent-fg" />
                <span>Publish 48-Page National Media Dossier</span>
              </button>
            </div>
          </div>

          {/* Interactive Evidence Clue Cards (Pinboard Grid) */}
          <div className="rounded-xs border-2 border-line-strong evidence-pinboard p-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b-2 border-line pb-2 mb-4 bg-inset p-2.5 rounded-xs">
              <h4 className="font-tactical font-black text-xs text-fg flex items-center gap-2">
                <Layers className="h-4 w-4 text-danger-fg" />
                <span>FORENSIC EVIDENCE PINBOARD ({selectedCase.evidenceItems.length} CLUES DISCOVERED)</span>
              </h4>
              <span className="font-tactical text-[10px] font-black text-accent-fg flex items-center gap-1.5">
                <span className="h-1.5 w-6 bg-[#DC2626] inline-block shadow-[0_0_8px_#DC2626]" />
                <span>CRIMSON THREAD CONNECTOR MATRIX</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCase.evidenceItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xs border-2 border-line-strong bg-raised p-4 text-xs space-y-2 relative shadow-xl hover:border-accent transition-all"
                >
                  {/* Adhesive Tape Accent in Yellow & Red Pushpin */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-4 w-14 bg-[#FACC15]/90 border border-accent-line shadow-md rotate-1" />
                  <div className="absolute top-2.5 right-2.5 h-3.5 w-3.5 rounded-full bg-[#DC2626] border-2 border-white shadow-md animate-pulse" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-tactical font-black text-sm text-fg">{item.title}</span>
                    <span className="stamp-red text-[8px]">CLUE #{idx + 1}</span>
                  </div>

                  <p className="text-[11px] text-fg-2 leading-relaxed font-sans">
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

                  <div className="border-t-2 border-line pt-2 space-y-1 font-tactical text-[10px]">
                    <div className="text-muted">
                      <span className="text-faint font-bold">SOURCE: </span>{item.provenance}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-fg font-bold">TARGET: {item.linkedTarget}</span>
                      <span className={`font-black px-2 py-0.5 rounded-xs ${
                        item.reliability === 'OFFICIAL_DOCUMENT' ? 'bg-success-soft text-success-fg border border-success-line' :
                        item.reliability === 'CORROBORATED' ? 'bg-accent-soft text-accent-fg border border-accent-line' : 'bg-danger-soft text-danger-fg border border-danger-line'
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
