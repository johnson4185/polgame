'use client';

import React, { useState } from 'react';
import { Zap, Brain, Megaphone, Target, Newspaper, ShieldAlert, ListChecks, Award, Users, MapPin, Flag, Map as MapIcon } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { GOV_STAGES, govStage, stateSupport, formatDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import { IndiaMap, type MarkerKind } from '@/components/map/IndiaMap';
import { ArtPlaceholder, Badge, Button, Meter, Panel, PanelHeader } from '@/components/ui/primitives';
import { GameDialog, TabPanel, Tabs } from '@/components/ui/menus';

const LEVEL_NAMES = ['Grassroots Agitators', 'RTI Crusaders', 'Civil Rights Movement', 'National Contender', 'Government in Waiting'];
const MOOD: Record<string, string> = { RULING_LEAN: 'Leans to the ruling party', ANTI_INCUMBENCY: 'Anti-incumbency', VOLATILE: 'Volatile', REFORM_RECEPTIVE: 'Open to reform' };

/** Home screen: profile + campaigns · map · news/intel/tasks. Everything else is one click away. */
export function OverviewView() {
  const { state, dispatch } = useGame();
  const [openState, setOpenState] = useState<string | null>(null);

  const values = Object.fromEntries(state.states.map(s => [s.name, stateSupport(state, s.name)]));
  const markers: { state: string; kind: MarkerKind }[] = [
    ...state.operations.filter(o => o.status === 'ACTIVE').map(o => ({ state: o.stateName, kind: 'protest' as const })),
    ...state.states.filter(s => s.cjpChapterLevel >= 2).map(s => ({ state: s.name, kind: 'flag' as const })),
    ...(govStage(state.govResponse?.pressure ?? 0) === 'POLICE_ACTION'
      ? state.operations.filter(o => o.status === 'ACTIVE' && o.type === 'JANTAR_MANTAR_PROTEST').map(o => ({ state: o.stateName, kind: 'police' as const }))
      : []),
  ];
  const activeOps = state.operations.filter(o => o.status === 'ACTIVE');
  const openQuests = state.activeQuests.filter(q => !q.isCompleted);
  const stage = GOV_STAGES.find(g => g.stage === govStage(state.govResponse?.pressure ?? 0))!;
  const st = openState ? state.states.find(s => s.name === openState) : undefined;
  const p = state.player;

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_360px]">
      {/* Left: you and your campaigns */}
      <div className="space-y-4">
        <Panel className="p-4">
          <div className="flex gap-3">
            <ArtPlaceholder label="Portrait" compact className="chunky-sm h-20 w-20 shrink-0" />
            <div className="min-w-0">
              <div className="font-display text-lg leading-tight text-ink">{p.name}</div>
              <div className="text-xs font-bold text-muted">Founder · CJP</div>
              <p className="mt-1 font-hand text-base leading-snug text-fg-2">&ldquo;What if all cockroaches come together?&rdquo;</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Meter label="Energy" icon={Zap} value={p.energy} tone={p.energy < 25 ? 'danger' : 'success'} />
            <Meter label="Stress" icon={Brain} value={p.stress} tone={p.stress > 70 ? 'danger' : 'pink'} />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg border-2 border-ink bg-accent px-2.5 py-1.5 text-xs font-extrabold text-ink">
            <span className="flex items-center gap-1">
              <Award className="h-4 w-4" /> Rank {state.movementLevel}: {LEVEL_NAMES[state.movementLevel - 1]}
            </span>
            <span>{state.movementXP % 1000}/1000</span>
          </div>
        </Panel>

        <Panel className="p-4">
          <PanelHeader title="Campaigns" icon={Megaphone} action="All" onAction={() => dispatch({ type: 'SET_SCREEN', screen: 'OPERATIONS' })} />
          {activeOps.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-muted">Nothing running. The story will start campaigns, or launch one from Organise.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {activeOps.map(o => (
                <li key={o.id}>
                  <button
                    className="w-full text-left"
                    onClick={() => {
                      soundManager.playClick();
                      dispatch({ type: 'SET_ACTIVE_OPERATION', operationId: o.id });
                      dispatch({ type: 'SET_SCREEN', screen: 'OPERATIONS' });
                    }}
                  >
                    <div className="truncate font-display text-xs text-ink">{o.title}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Meter value={o.currentDay} max={o.durationDays} tone="stripes" showValue={false} className="flex-1" />
                      <span className="shrink-0 text-xs font-bold text-muted">{Math.max(0, o.durationDays - o.currentDay)}d left</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Centre: the map */}
      <Panel className="relative overflow-hidden p-2 sm:p-3">
        <div className="mb-1 flex items-center justify-between px-1">
          <PanelHeader title="India" icon={MapIcon} />
          <span className="text-xs font-bold text-muted">Tap a state</span>
        </div>
        <IndiaMap
          values={values}
          selected={openState}
          markers={markers}
          onSelect={name => {
            soundManager.playClick();
            setOpenState(name);
          }}
          renderTooltip={name => {
            const s = state.states.find(x => x.name === name);
            return (
              <>
                <div className="font-display text-xs">{name}</div>
                <div className="text-sm font-extrabold">{values[name]}% support</div>
                {s && (
                  <div className="mt-0.5 text-xs font-semibold text-muted">
                    {s.seatsTotal} seats · {MOOD[s.regionalMood] ?? s.regionalMood}
                  </div>
                )}
              </>
            );
          }}
        />
      </Panel>

      {/* Right: news, intel, tasks */}
      <Panel className="p-3 lg:col-span-2 xl:col-span-1">
        <Tabs
          size="sm"
          tabs={[
            { value: 'news', label: 'News' },
            { value: 'intel', label: 'Intel' },
            { value: 'tasks', label: 'Tasks', badge: openQuests.length },
          ]}
        >
          <TabPanel value="news">
            <ul className="max-h-[28rem] divide-y-2 divide-line-soft overflow-y-auto">
              {state.newsFeed.slice(0, 12).map(n => (
                <li key={n.id} className="flex gap-2.5 py-2.5">
                  <Newspaper className="mt-0.5 h-5 w-5 shrink-0 text-pink" strokeWidth={2.5} aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold leading-snug text-ink">{n.headline}</div>
                    <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-fg-2">{n.body}</p>
                    <div className="mt-0.5 text-[11px] font-bold text-muted">
                      {n.sourceName} · {formatDate(n.date)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </TabPanel>
          <TabPanel value="intel">
            <div className="space-y-3 text-sm font-semibold text-fg">
              <div className="chunky-sm bg-raised p-3">
                <div className="flex items-center gap-1.5 font-display text-xs">
                  <ShieldAlert className="h-4 w-4" /> Government: {stage.label}
                </div>
                <p className="mt-1 text-fg-2">{stage.effect}</p>
                <Meter value={Math.round(state.govResponse?.pressure ?? 0)} tone="danger" className="mt-2" />
              </div>
              <div className="chunky-sm bg-raised p-3">
                <div className="font-display text-xs">Legal heat: {state.crackdownLevel}%</div>
                <p className="mt-1 text-fg-2">At 100% your offices are sealed. Legal writs bring it down.</p>
              </div>
              <div className="chunky-sm bg-raised p-3">
                <div className="font-display text-xs">Money</div>
                <p className="mt-1 text-fg-2">
                  ₹{state.movement.movementFunds.toLocaleString('en-IN')} in the bank; ₹{state.movement.monthlyBurnRate.toLocaleString('en-IN')} goes out
                  each month.
                </p>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="tasks">
            <ul className="space-y-2.5">
              {state.activeQuests.map(q => (
                <li key={q.id} className={`chunky-sm p-3 ${q.isCompleted ? 'bg-success-soft' : 'bg-raised'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-display text-xs text-ink">
                      {q.isCompleted ? <ListChecks className="h-4 w-4" /> : <Target className="h-4 w-4" />} {q.title}
                    </span>
                    <Badge tone={q.isCompleted ? 'success' : 'gold'}>{q.isCompleted ? 'Done' : `+${q.rewardXP} XP`}</Badge>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-fg-2">{q.description}</p>
                  {!q.isCompleted && (
                    <Meter value={Math.min(q.currentProgress, q.targetProgress)} max={q.targetProgress} tone="stripes" className="mt-2" />
                  )}
                </li>
              ))}
            </ul>
          </TabPanel>
        </Tabs>
      </Panel>

      {/* State card */}
      <GameDialog open={!!st} onOpenChange={o => !o && setOpenState(null)} title={st?.name ?? ''} size="md">
        {st && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="pink">{values[st.name]}% support</Badge>
              <Badge tone="neutral">{st.seatsTotal} Lok Sabha seats</Badge>
              <Badge tone="neutral">{MOOD[st.regionalMood] ?? st.regionalMood}</Badge>
              <Badge tone={st.cjpChapterLevel >= 2 ? 'success' : 'neutral'}>Chapter level {st.cjpChapterLevel}/3</Badge>
            </div>
            <div className="chunky-sm bg-raised p-3 text-sm font-semibold text-fg">
              <div className="flex items-center gap-1.5 font-display text-xs">
                <MapPin className="h-4 w-4" /> Issues people care about
              </div>
              <p className="mt-1 text-fg-2">{st.dominantIssues.join(' · ')}</p>
              <div className="mt-2 flex items-center gap-1.5 font-display text-xs">
                <Users className="h-4 w-4" /> Local contacts <span className="font-sans text-[11px] text-muted">(fictional)</span>
              </div>
              <p className="mt-1 text-fg-2">{st.keyLeaders.join(', ') || 'None yet'}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                icon={Flag}
                onClick={() => {
                  const seat = [...state.constituencies].filter(c => c.state === st.name).sort((a, b) => b.cjpSupportScore - a.cjpSupportScore)[0];
                  if (seat) dispatch({ type: 'BOOST_CONSTITUENCY', constituencyId: seat.id });
                }}
              >
                Grassroots blitz · 1 AP
              </Button>
              <Button
                variant="secondary"
                icon={MapIcon}
                onClick={() => {
                  setOpenState(null);
                  dispatch({ type: 'SET_SCREEN', screen: 'MAP_543' });
                }}
              >
                Seats & details
              </Button>
            </div>
            <p className="text-xs font-semibold text-muted">A blitz (₹5,000) raises support in the state&apos;s strongest seat.</p>
          </div>
        )}
      </GameDialog>
    </div>
  );
}
