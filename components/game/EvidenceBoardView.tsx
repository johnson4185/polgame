'use client';

import React, { useState } from 'react';
import { FileSearch, FileText, CheckCircle, Scale, Megaphone, ShieldCheck, AlertTriangle, History } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { BALANCE, formatDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import type { EvidenceItem, InvestigationCase } from '@/lib/game/types';
import { Badge, Panel, PanelHeader } from '@/components/ui/primitives';
import { TabPanel, Tabs, Tooltip } from '@/components/ui/menus';
import { SituationLogView } from './SituationLogView';

type CaseAction = 'RTI_FILING' | 'CORROBORATE_EVIDENCE' | 'LEGAL_PETITION_HC' | 'PUBLIC_EXPOSE';

const STAGE_LABEL: Record<InvestigationCase['currentStage'], string> = {
  TIP_OFF: 'Tip-off',
  GATHERING_RECORDS: 'Gathering records',
  CORROBORATING: 'Corroborating',
  LEGAL_REVIEW: 'Legal review',
  FILED_PIL: 'PIL admitted',
  EXPOSED: 'Exposed',
};
const RELIABILITY_TONE: Record<EvidenceItem['reliability'], 'danger' | 'gold' | 'success' | 'teal'> = {
  RUMOR: 'danger',
  UNVERIFIED: 'gold',
  CORROBORATED: 'success',
  OFFICIAL_DOCUMENT: 'teal',
};
const RISK_TONE = { LOW: 'success', MEDIUM: 'gold', SEVERE: 'danger' } as const;
const words = (s: string) => s.replace(/_/g, ' ').toLowerCase();

const ACTIONS: { id: CaseAction; label: string; hint: string; icon: React.ElementType; cost: number; minReadiness?: number }[] = [
  { id: 'RTI_FILING', label: 'File RTIs', hint: 'Raises readiness; better with high research.', icon: FileText, cost: 2500 },
  { id: 'CORROBORATE_EVIDENCE', label: 'Corroborate', hint: 'Verifies the next unchecked lead.', icon: CheckCircle, cost: 8000 },
  { id: 'LEGAL_PETITION_HC', label: 'File a PIL', hint: 'Can be admitted or dismissed. Riskier on severe cases.', icon: Scale, cost: 25000, minReadiness: BALANCE.pilMinReadiness },
  { id: 'PUBLIC_EXPOSE', label: 'Go public', hint: 'Can backfire if readiness is under 70%.', icon: Megaphone, cost: 0, minReadiness: BALANCE.exposeMinReadiness },
];

/** Research: investigations (cases, evidence, court or press) and the situation log. */
export function EvidenceBoardView() {
  const { state } = useGame();
  return (
    <Panel className="p-3 sm:p-4">
      <Tabs
        size="sm"
        tabs={[
          { value: 'cases', label: 'Investigations', badge: state.cases.length },
          { value: 'log', label: 'Situation log' },
        ]}
      >
        <TabPanel value="cases">
          <Cases />
        </TabPanel>
        <TabPanel value="log">
          <SituationLogView />
        </TabPanel>
      </Tabs>
    </Panel>
  );
}

function Cases() {
  const { state, dispatch } = useGame();
  const [selectedId, setSelectedId] = useState(state.cases[0]?.id ?? '');
  const c = state.cases.find(x => x.id === selectedId) ?? state.cases[0];
  if (!c) return <p className="py-8 text-center text-sm font-semibold text-muted">No investigations in this campaign.</p>;

  const done = c.currentStage === 'FILED_PIL' || c.currentStage === 'EXPOSED';
  const act = (action: CaseAction) => {
    soundManager.playPaper();
    dispatch({ type: 'INVESTIGATION_ACTION', caseId: c.id, action });
  };
  const blocker = (a: (typeof ACTIONS)[number]) =>
    done
      ? 'This case is concluded.'
      : a.minReadiness && c.readinessPercentage < a.minReadiness
        ? `Needs ${a.minReadiness}% readiness.`
        : state.movement.movementFunds < a.cost
          ? `Needs ₹${a.cost.toLocaleString('en-IN')} in funds.`
          : state.actionPoints < 1
            ? 'No action points left today.'
            : null;

  return (
    <div className="space-y-4">
      {/* Case picker */}
      <div className="grid gap-2 sm:grid-cols-3" role="list" aria-label="Investigations">
        {state.cases.map(x => {
          const on = x.id === c.id;
          return (
            <button
              key={x.id}
              role="listitem"
              aria-current={on}
              onClick={() => {
                soundManager.playClick();
                setSelectedId(x.id);
              }}
              className={`chunky-sm pressable p-3 text-left ${on ? 'bg-brand text-brand-ink' : 'bg-raised text-fg'}`}
            >
              <div className="line-clamp-2 font-display text-xs">{x.title}</div>
              <div className="mt-1 text-xs font-bold opacity-80">
                {STAGE_LABEL[x.currentStage]} · {x.readinessPercentage}%
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="chunky-sm bg-surface p-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={done ? 'success' : 'saffron'}>{STAGE_LABEL[c.currentStage]}</Badge>
            <Badge tone={RISK_TONE[c.legalRisk]}>Legal risk: {words(c.legalRisk)}</Badge>
            <Badge tone="neutral">Impact {c.publicImpactPotential}/100</Badge>
            {c.isFictional && <Badge tone="neutral">Fictional case</Badge>}
          </div>
          <h2 className="mt-2 font-display text-lg text-fg">{c.title}</h2>
          <p className="mt-0.5 text-sm font-semibold text-fg-2">Target: {c.targetMinistryOrEntity}</p>

          {/* Readiness, with the go-public and PIL thresholds marked */}
          <div className="mt-4">
            <div className="flex justify-between text-sm font-extrabold text-fg">
              <span>Case readiness</span>
              <span className="tabular-nums">{c.readinessPercentage}%</span>
            </div>
            <div className="relative mt-1 h-5 overflow-hidden rounded-full border-2 border-ink bg-inset">
              <div className="h-full bg-brand transition-all duration-500" style={{ width: `${c.readinessPercentage}%` }} />
              {[BALANCE.exposeMinReadiness, BALANCE.pilMinReadiness].map(t => (
                <span key={t} className="absolute top-0 h-full w-0.5 bg-ink" style={{ left: `${t}%` }} aria-hidden="true" />
              ))}
            </div>
            <div className="relative mt-1 h-4 text-[11px] font-bold text-muted" aria-hidden="true">
              <span className="absolute -translate-x-1/2" style={{ left: `${BALANCE.exposeMinReadiness}%` }}>Go public</span>
              <span className="absolute -translate-x-1/2" style={{ left: `${BALANCE.pilMinReadiness}%` }}>PIL</span>
            </div>
          </div>

          {c.outcomeNotes && <p className="mt-3 border-l-4 border-pink pl-3 text-sm font-semibold text-fg-2">{c.outcomeNotes}</p>}

          <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-4">
            {ACTIONS.map(a => {
              const reason = blocker(a);
              return (
                <Tooltip key={a.id} content={reason ?? a.hint}>
                  <button
                    // aria-disabled rather than disabled, so the tooltip still explains why
                    onClick={() => !reason && act(a.id)}
                    aria-disabled={!!reason}
                    className={`chunky-sm pressable flex flex-col items-start gap-0.5 bg-raised p-2.5 text-left ${reason ? 'cursor-not-allowed opacity-55' : ''}`}
                  >
                    <a.icon className="h-5 w-5 text-brand-fg" strokeWidth={2.5} aria-hidden="true" />
                    <span className="font-display text-xs text-fg">{a.label}</span>
                    <span className="text-[11px] font-bold text-muted">1 AP{a.cost ? ` · ₹${(a.cost / 1000).toLocaleString('en-IN')}K` : ' · free'}</span>
                    {reason && <span className="text-[11px] font-bold leading-tight text-danger-fg">{reason}</span>}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="chunky-sm bg-surface p-4">
          <PanelHeader title={`Evidence (${c.evidenceItems.length})`} icon={FileSearch} />
          <ul className="mt-3 max-h-[32rem] space-y-2.5 overflow-y-auto pr-1">
            {c.evidenceItems.map(e => (
              <li key={e.id} className="chunky-sm bg-raised p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-xs leading-tight text-fg">{e.title}</span>
                  {e.isCorroborated ? (
                    <ShieldCheck className="h-5 w-5 shrink-0 text-success" aria-label="Corroborated" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 shrink-0 text-accent-fg" aria-label="Not yet corroborated" />
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <Badge tone={RELIABILITY_TONE[e.reliability]}>{words(e.reliability)}</Badge>
                  <Badge tone="neutral">{words(e.category)}</Badge>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-fg-2">{e.summary}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-muted">
                  <History className="h-3 w-3 shrink-0" aria-hidden="true" /> {e.provenance} · {formatDate(e.discoveryDate)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {state.cases.some(x => x.isFictional) && (
        <p className="text-xs font-semibold text-muted">Cases marked fictional are invented for the game and are not part of the historical record.</p>
      )}
    </div>
  );
}
