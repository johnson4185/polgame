'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle2, FileText, Gavel, Landmark, Megaphone, ShieldAlert, Vote } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { BALANCE } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import type { ReformPolicy } from '@/lib/game/types';
import { Badge, Button, Meter, Panel, StatCard } from '@/components/ui/primitives';
import { TabPanel, Tabs } from '@/components/ui/menus';

const STATUS: Record<ReformPolicy['status'], { label: string; tone: 'neutral' | 'gold' | 'success' | 'teal' | 'danger' }> = {
  DRAFT: { label: 'Draft', tone: 'neutral' },
  TABLED_PARLIAMENT: { label: 'Tabled', tone: 'gold' },
  PASSED_ACT: { label: 'Passed into law', tone: 'success' },
  ENFORCING: { label: 'Being enforced', tone: 'teal' },
  CHALLENGED_SUPREME_COURT: { label: 'In the Supreme Court', tone: 'danger' },
};
// Mirrors SECTOR_MINISTRY in the engine: holding this ministry speeds up lobbying
const SECTOR_MINISTRY: Record<ReformPolicy['sector'], string> = {
  EXAM_SECURITY: 'MIN-EDU',
  EDUCATION_INFRA: 'MIN-EDU',
  JUDICIAL_ACCOUNTABILITY: 'MIN-LAW',
  CIVIC_PROCUREMENT: 'MIN-FIN',
  HEALTH_CARE: 'MIN-HEALTH',
};

/** Parliament: bills to table and lobby, and the (shadow) cabinet. */
export function GovernanceView() {
  const { state } = useGame();
  const inParliament = state.electionLiveState.coalitionFormed && state.party.actualSeatsWon > 0;
  const inGovernment = inParliament && state.party.isRulingCoalition;
  const passed = state.reforms.filter(r => r.status === 'PASSED_ACT').length;
  const tabled = state.reforms.filter(r => r.status === 'TABLED_PARLIAMENT').length;

  return (
    <div className="space-y-4">
      <div className="chunky theme-dark-scope relative h-40 overflow-hidden sm:h-44">
        <Image src="/images/delhi_parliament_dawn_1790774340629.jpg" alt="Parliament of India at dawn" fill priority className="object-cover" />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink via-ink/50 to-transparent p-4">
          <Badge tone={inGovernment ? 'success' : inParliament ? 'teal' : 'neutral'} className="self-start">
            {inGovernment ? 'In government' : inParliament ? 'In opposition' : 'Not in Parliament yet'}
          </Badge>
          <p className="mt-1.5 font-display text-lg text-on-canvas sm:text-xl">Parliament</p>
          <p className="text-sm font-semibold text-on-canvas-muted">Power doesn&apos;t make you right. It gives you the tools to make it stick.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Vote} iconTone="pink" label="Your MPs" value={state.party.actualSeatsWon} />
        <StatCard icon={FileText} iconTone="saffron" label="Bills tabled" value={tabled} />
        <StatCard icon={CheckCircle2} iconTone="success" label="Laws passed" value={`${passed} / ${BALANCE.reformsForVictory}`}>
          <div className="mt-1 text-xs font-bold text-muted">{BALANCE.reformsForVictory} laws wins the game</div>
        </StatCard>
      </div>

      {!inParliament && (
        <div className="chunky-sm bg-accent p-3 text-sm font-bold text-ink">
          Win seats in a general election to table bills. The cabinet tab shows the line-up you would field if you joined a government.
        </div>
      )}

      <Panel className="p-3 sm:p-4">
        <Tabs
          size="sm"
          tabs={[
            { value: 'bills', label: 'Bills', badge: tabled },
            { value: 'cabinet', label: inGovernment ? 'Cabinet' : 'Shadow cabinet' },
          ]}
        >
          <TabPanel value="bills">
            <ul className="space-y-3">
              {state.reforms.map(r => (
                <li key={r.id}>
                  <BillCard reform={r} inParliament={inParliament} />
                </li>
              ))}
            </ul>
          </TabPanel>
          <TabPanel value="cabinet">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {state.cabinet.map(m => (
                <li key={m.id} className="chunky-sm space-y-2 bg-raised p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display text-xs text-fg">{m.title}</span>
                    <Badge tone={m.isPlayerParty ? 'pink' : 'neutral'}>{m.isPlayerParty ? state.party.abbreviation || 'CJP' : 'Partner'}</Badge>
                  </div>
                  <div className="text-sm font-semibold text-fg-2">{m.ministerName}</div>
                  <Meter label="Performance" icon={Landmark} value={m.performanceScore} tone="teal" />
                  <Meter label="Scandal risk" icon={ShieldAlert} value={m.corruptionScandalRisk} tone={m.corruptionScandalRisk > 30 ? 'danger' : 'success'} />
                </li>
              ))}
            </ul>
          </TabPanel>
        </Tabs>
      </Panel>
    </div>
  );
}

function BillCard({ reform: r, inParliament }: { reform: ReformPolicy; inParliament: boolean }) {
  const { state, dispatch } = useGame();
  const status = STATUS[r.status];
  const ministry = state.cabinet.find(c => c.id === SECTOR_MINISTRY[r.sector]);
  const holdsMinistry = state.party.isRulingCoalition && !!ministry?.isPlayerParty;
  const noAP = state.actionPoints < 1;

  const tableBlocker = !inParliament ? 'You need MPs in the Lok Sabha.' : noAP ? 'No action points left today.' : null;
  const lobbyBlocker = noAP
    ? 'No action points left today.'
    : state.movement.movementFunds < BALANCE.lobbyCost
      ? `Needs ₹${BALANCE.lobbyCost.toLocaleString('en-IN')} in funds.`
      : null;

  return (
    <div className="chunky-sm bg-raised p-3 sm:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-display text-sm text-fg">{r.name}</span>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-sm font-semibold text-fg-2">{r.description}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Badge tone="danger">Resistance {r.bureaucraticResistance}</Badge>
            <Badge tone="neutral">₹{r.costCrores.toLocaleString('en-IN')} crore</Badge>
            <Badge tone="neutral">Needs {r.stateSupportReq} states</Badge>
            {ministry && <Badge tone={holdsMinistry ? 'success' : 'neutral'}>{holdsMinistry ? `You hold ${ministry.title}` : ministry.title}</Badge>}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1 md:items-end">
          {r.status === 'DRAFT' && (
            <Button
              icon={Gavel}
              disabled={!!tableBlocker}
              onClick={() => {
                soundManager.playGavel();
                dispatch({ type: 'TABLE_REFORM', reformId: r.id });
              }}
            >
              Table the bill · 1 AP
            </Button>
          )}
          {r.status === 'TABLED_PARLIAMENT' && (
            <Button
              variant="pink"
              icon={Megaphone}
              disabled={!!lobbyBlocker}
              onClick={() => {
                soundManager.playClick();
                dispatch({ type: 'LOBBY_REFORM', reformId: r.id });
              }}
            >
              Lobby MPs · 1 AP · ₹{BALANCE.lobbyCost / 1000}K
            </Button>
          )}
          {(r.status === 'DRAFT' ? tableBlocker : r.status === 'TABLED_PARLIAMENT' ? lobbyBlocker : null) && (
            <span className="text-xs font-bold text-danger-fg">{r.status === 'DRAFT' ? tableBlocker : lobbyBlocker}</span>
          )}
        </div>
      </div>
      {r.status !== 'DRAFT' && (
        <div className="mt-3">
          <div className="flex justify-between text-xs font-extrabold text-fg">
            <span>Votes secured</span>
            <span className="tabular-nums">{r.implementationProgress}%</span>
          </div>
          <Meter value={r.implementationProgress} tone={r.status === 'PASSED_ACT' ? 'success' : 'stripes'} showValue={false} className="mt-1" />
          {r.status === 'TABLED_PARLIAMENT' && holdsMinistry && (
            <p className="mt-1 text-xs font-semibold text-muted">Holding this ministry makes each round of lobbying go further.</p>
          )}
        </div>
      )}
    </div>
  );
}
