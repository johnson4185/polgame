'use client';

import React from 'react';
import { Megaphone, Plus, MapPin, Users, Heart, Newspaper, Package, Scale, Clock, Flag } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { OPERATION_TEMPLATES, getOperationTemplate } from '@/lib/game/data/operations';
import { soundManager } from '@/lib/game/simulation/sound';
import type { OperationState } from '@/lib/game/types';
import { Badge, Button, Meter, Panel, PanelHeader } from '@/components/ui/primitives';
import { Popover } from '@/components/ui/menus';
import { JantarMantarScene } from './JantarMantarScene';
import { EffectChips } from './StoryEventDialog';

const isProtest = (op: OperationState) => op.type === 'JANTAR_MANTAR_PROTEST' || op.type === 'PARLIAMENT_MARCH';

/** All campaigns: switch between them, launch new ones, run the selected one. */
export function CampaignsView() {
  const { state, dispatch } = useGame();
  const ops = [...state.operations].sort((a, b) => Number(b.status === 'ACTIVE') - Number(a.status === 'ACTIVE'));
  const selected = state.operations.find(o => o.id === state.activeOperationId) ?? ops[0];
  const launchable = OPERATION_TEMPLATES.filter(t => !t.storyOnly);

  const launch = (id: string) => {
    soundManager.playMegaphone();
    dispatch({ type: 'LAUNCH_OPERATION', templateId: id });
  };

  const launcher = (
    <Popover
      align="end"
      trigger={
        <Button size="sm" icon={Plus}>
          Launch campaign
        </Button>
      }
    >
      <div className="font-display text-sm text-ink">New campaign · 1 AP</div>
      <p className="mt-1 text-xs font-semibold text-muted">The real campaigns start through the story. These are your own (fictional) ones.</p>
      <div className="mt-3 space-y-2">
        {launchable.map(t => {
          const running = state.operations.some(o => o.templateId === t.id && o.status === 'ACTIVE');
          const broke = state.movement.movementFunds < t.budget;
          return (
            <button
              key={t.id}
              onClick={() => launch(t.id)}
              disabled={running || broke || state.actionPoints < 1}
              className="chunky-sm pressable block w-full bg-raised p-2.5 text-left disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-xs text-ink">{t.title}</span>
                <Badge tone={broke ? 'danger' : 'gold'}>₹{(t.budget / 1000).toFixed(0)}K</Badge>
              </div>
              <div className="mt-0.5 text-xs font-semibold text-fg-2">{t.blurb}</div>
              <div className="mt-1 text-[11px] font-bold text-muted">
                {t.durationDays} days · {t.stateName}
                {running ? ' · running' : ''}
              </div>
            </button>
          );
        })}
      </div>
    </Popover>
  );

  return (
    <div className="space-y-4">
      <Panel className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PanelHeader title="Campaigns" icon={Megaphone} />
          {launcher}
        </div>
        {ops.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Campaigns">
            {ops.map(op => {
              const on = op.id === selected?.id;
              return (
                <button
                  key={op.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    soundManager.playClick();
                    dispatch({ type: 'SET_ACTIVE_OPERATION', operationId: op.id });
                  }}
                  className={`chunky-sm shrink-0 px-3 py-2 text-left transition-transform ${on ? '-translate-y-0.5 bg-brand text-brand-ink' : 'bg-raised text-fg'}`}
                >
                  <div className="max-w-56 truncate font-display text-xs">{op.title}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold opacity-80">
                    {op.status === 'ACTIVE' ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" /> Day {op.currentDay} of {op.durationDays}
                      </>
                    ) : op.status === 'CONCLUDED' ? (
                      'Concluded'
                    ) : (
                      'Planned'
                    )}
                    {op.fictional && ' · fictional'}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Panel>

      {!selected ? (
        <Panel className="px-6 py-12 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-faint" aria-hidden="true" />
          <h2 className="mt-3 font-display text-xl text-ink">No campaigns yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-muted">
            The real campaigns (the city tour, the Jantar Mantar sit-in, School Thik Karo…) begin when the story reaches them. You can also launch
            your own.
          </p>
          <div className="mt-5 flex justify-center">{launcher}</div>
        </Panel>
      ) : isProtest(selected) ? (
        <JantarMantarScene />
      ) : (
        <CampaignPanel op={selected} />
      )}
    </div>
  );
}

/** Tours, audits and the CEC campaign: progress, effects and three generic actions */
function CampaignPanel({ op }: { op: OperationState }) {
  const { state, dispatch } = useGame();
  const t = op.templateId ? getOperationTemplate(op.templateId) : undefined;
  const active = op.status === 'ACTIVE';
  const decide = (choice: 'SUPPLIES' | 'POLICE_TALKS' | 'MEDIA_SPEECH') => {
    soundManager.playStamp();
    dispatch({ type: 'OPERATION_DECISION', operationId: op.id, choice });
  };
  const actions = [
    { choice: 'MEDIA_SPEECH' as const, icon: Newspaper, label: 'Media push', hint: '1 AP · media +20, trust +' },
    { choice: 'SUPPLIES' as const, icon: Package, label: 'Resupply', hint: '1 AP · ₹15K · supplies +30, morale +10' },
    { choice: 'POLICE_TALKS' as const, icon: Scale, label: 'Smooth things over', hint: '1 AP · tension −25 if it works' },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted">
          <Badge tone={active ? 'success' : 'neutral'}>{active ? 'Running' : op.status === 'CONCLUDED' ? 'Concluded' : 'Planned'}</Badge>
          {op.fictional && <Badge tone="neutral">Fictional campaign</Badge>}
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {op.location}
          </span>
        </div>
        <h2 className="mt-2 font-display text-2xl text-ink">{op.title}</h2>
        {t && <p className="mt-1 text-sm font-semibold text-fg-2">{t.blurb}</p>}

        <div className="mt-4 space-y-2.5">
          <Meter label="Progress" icon={Clock} value={Math.min(op.currentDay, op.durationDays)} max={op.durationDays} tone="stripes" />
          <Meter label="Morale" icon={Heart} value={op.crowdMorale} tone={op.crowdMorale < 40 ? 'danger' : 'success'} />
          <Meter label="Resources" icon={Package} value={op.suppliesWaterFood} tone={op.suppliesWaterFood < 30 ? 'danger' : 'accent'} />
          <Meter label="Media" icon={Newspaper} value={op.mediaCoverageLevel} tone="pink" />
        </div>

        {t && (
          <div className="mt-4">
            <div className="font-display text-xs text-ink">{t.every && t.every > 1 ? `Every ${t.every} days` : 'Every day'} it runs:</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <EffectChips effects={t.dailyEffects} />
            </div>
            <p className="mt-1.5 text-xs font-semibold text-muted">Scaled by morale: keep resources up to keep morale high.</p>
          </div>
        )}

        {op.outcomeSummary && <p className="chunky-sm mt-4 bg-raised p-3 text-sm font-semibold text-fg">{op.outcomeSummary}</p>}
      </Panel>

      <div className="space-y-4">
        <Panel className="p-4">
          <PanelHeader title="Actions" icon={Flag} />
          <div className="mt-3 grid gap-2">
            {actions.map(a => (
              <button
                key={a.choice}
                onClick={() => decide(a.choice)}
                disabled={!active || state.actionPoints < 1}
                className="chunky-sm pressable flex items-center gap-3 bg-raised p-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
              >
                <a.icon className="h-6 w-6 shrink-0 text-brand-fg" strokeWidth={2.5} aria-hidden="true" />
                <span>
                  <span className="block font-display text-xs text-ink">{a.label}</span>
                  <span className="block text-xs font-semibold text-muted">{a.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel className="p-4">
          <PanelHeader title="Field log" icon={Users} />
          <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto text-sm font-semibold text-fg-2">
            {[...op.dailyLog].reverse().map((line, i) => (
              <li key={i} className="border-l-4 border-pink pl-2">
                {line}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
