'use client';

import React from 'react';
import { Award, CheckCircle2, Scale, ScrollText } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { INITIAL_GAME_DATE, formatDate } from '@/lib/game/simulation/engine';
import type { GameState, JournalEntry } from '@/lib/game/types';
import { Badge, Panel, PanelHeader, StatCard } from '@/components/ui/primitives';
import { TabPanel, Tabs } from '@/components/ui/menus';
import { CampaignStatistics } from '@/components/statistics/CampaignStatistics';
import { SituationLogView } from './SituationLogView';
import { ThenAndNow } from './ThenAndNow';

const SIGNIFICANCE: Record<JournalEntry['significance'], { label: string; tone: 'neutral' | 'gold' | 'pink' }> = {
  MINOR: { label: 'Note', tone: 'neutral' },
  MILESTONE: { label: 'Milestone', tone: 'gold' },
  HISTORIC_TURNING_POINT: { label: 'Turning point', tone: 'pink' },
};

/** Chronicle: your diary and legacy, the combined log, and campaign statistics. */
export function JournalEndingsView() {
  return (
    <Panel className="p-3 sm:p-4">
      <Tabs
        size="sm"
        tabs={[
          { value: 'chronicle', label: 'Chronicle' },
          { value: 'progress', label: 'Then & now' },
          { value: 'log', label: 'Full log' },
          { value: 'statistics', label: 'Statistics' },
        ]}
      >
        <TabPanel value="chronicle">
          <Chronicle />
        </TabPanel>
        <TabPanel value="progress">
          <ThenAndNow />
        </TabPanel>
        <TabPanel value="log">
          <SituationLogView />
        </TabPanel>
        <TabPanel value="statistics">
          <CampaignStatistics />
        </TabPanel>
      </Tabs>
    </Panel>
  );
}

/** A short, honest summary of the campaign so far, built from the state */
function legacy(state: GameState, laws: number, cases: number) {
  const parts: string[] = [];
  parts.push(`You started on ${formatDate(INITIAL_GAME_DATE)}, a citizen with a phone and a grievance.`);
  if (state.party.isFormed) parts.push(`The movement became ${state.party.partyName}.`);
  if (state.party.actualSeatsWon > 0) parts.push(`It sent ${state.party.actualSeatsWon} MP${state.party.actualSeatsWon === 1 ? '' : 's'} to the Lok Sabha${state.party.isRulingCoalition ? ' and joined the government' : ''}.`);
  if (laws > 0) parts.push(`${laws} reform${laws === 1 ? '' : 's'} became law.`);
  if (cases > 0) parts.push(`${cases} investigation${cases === 1 ? '' : 's'} reached court or the front pages.`);
  if (!state.party.isFormed && laws === 0 && cases === 0) parts.push('The record is still being written.');
  parts.push(`Public trust stands at ${state.movement.publicTrust}%.`);
  return parts.join(' ');
}

function Chronicle() {
  const { state } = useGame();
  const laws = state.reforms.filter(r => r.status === 'PASSED_ACT').length;
  const cases = state.cases.filter(c => c.currentStage === 'FILED_PIL' || c.currentStage === 'EXPOSED').length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Award} iconTone="saffron" label="Public trust" value={`${state.movement.publicTrust}%`} />
        <StatCard icon={CheckCircle2} iconTone="success" label="Laws passed" value={laws} />
        <StatCard icon={Scale} iconTone="teal" label="Cases concluded" value={cases} />
      </div>

      <div className="chunky-sm bg-raised p-4">
        <div className="font-display text-xs text-fg">Your story so far</div>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-fg-2">{legacy(state, laws, cases)}</p>
      </div>

      <div>
        <PanelHeader title={`Diary (${state.journal.length})`} icon={ScrollText} />
        {state.journal.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-muted">Nothing written yet.</p>
        ) : (
          <ol className="mt-3 space-y-2.5">
            {state.journal.map(e => {
              const sig = SIGNIFICANCE[e.significance];
              return (
                <li key={e.id} className="chunky-sm bg-surface p-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-extrabold text-fg">{formatDate(e.date)}</span>
                    <Badge tone={sig.tone}>{sig.label}</Badge>
                  </div>
                  <h4 className="mt-1 text-base font-extrabold leading-snug text-fg">{e.title}</h4>
                  <p className="mt-0.5 text-sm font-semibold leading-relaxed text-fg-2">{e.text}</p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
