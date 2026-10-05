'use client';

// UI kit preview: every parchment component in one place, laid out like the
// Overview mockup. Not linked from the game; open /kit during development.
import React, { useState } from 'react';
import {
  Users, UserCheck, IndianRupee, Star, Siren, CalendarDays, Settings, Zap, Brain, Megaphone, School, Scale,
  MonitorPlay, Handshake, Home, Map as MapIcon, Search, Tv, Landmark, Vote, Save, Volume2, LogOut, MoreHorizontal,
  Flame, AlertTriangle,
} from 'lucide-react';
import {
  ArtPlaceholder, Badge, Button, Delta, EffectChip, EndTurnButton, Meter, Panel, PanelHeader, SegmentMeter,
  SpeechBubble, StatCard, StickyNote,
} from '@/components/ui/primitives';
import { ChoiceCard, GameDialog, HoverCard, Menu, Popover, TabPanel, Tabs, Tooltip, TooltipProvider } from '@/components/ui/menus';

const campaigns = [
  { icon: Megaphone, title: 'NEET Justice Movement', sub: 'Protests · Legal Action · Awareness', pct: 65, days: 12, tone: 'danger' as const },
  { icon: School, title: 'School Thik Karo', sub: 'School Inspections · Reports · Media', pct: 40, days: 25, tone: 'accent' as const },
  { icon: Users, title: 'Jantar Mantar Sit-in', sub: 'National Mobilisation', pct: 80, days: 5, tone: 'brand' as const },
];

const news = [
  { title: 'CJI’s ‘Cockroach’ remarks spark nationwide outrage', sub: 'Students, activists and opposition leaders condemn the remark.', src: 'The Hindu · 5 hours ago' },
  { title: 'Massive student protest at Jantar Mantar enters Day 5', sub: 'Police increase barricading, several detained.', src: 'NDTV · 3 hours ago' },
];

const nav = [
  { icon: Home, label: 'Overview' }, { icon: Megaphone, label: 'Campaigns' }, { icon: Users, label: 'People' },
  { icon: Search, label: 'Research' }, { icon: Tv, label: 'Media' }, { icon: Scale, label: 'Lawsuits' },
  { icon: Handshake, label: 'Alliances' }, { icon: Vote, label: 'Election' },
];

export default function KitPage() {
  const [eventOpen, setEventOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Overview');

  return (
    <TooltipProvider>
      <div className="app-backdrop min-h-screen p-3 sm:p-5">
        <div className="mx-auto max-w-[1600px] space-y-4">
          {/* Top stat bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-2 font-display text-3xl font-bold uppercase leading-none text-brand-fg">
              Cockroach
              <span className="block text-lg tracking-wide">Janta Party</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-xl:order-last max-xl:basis-full sm:grid-cols-3 xl:flex-1 xl:grid-cols-6">
              <StatCard icon={Users} label="Followers" value="20.4M" delta={8.2} />
              <StatCard icon={UserCheck} label="Volunteers" value="85K" delta={12} iconTone="success" />
              <StatCard icon={IndianRupee} label="Funds" value="₹12L" delta={18} iconTone="gold" />
              <StatCard icon={Star} label="Credibility" value="72%" delta={4} iconTone="brand" />
              <Tooltip content="Police and legal pressure on the movement. At 100% your offices are sealed.">
                <div>
                  <StatCard icon={Siren} label="Legal Heat" iconTone="brand">
                    <div className="py-1.5"><SegmentMeter value={72} /></div>
                  </StatCard>
                </div>
              </Tooltip>
              <StatCard icon={CalendarDays} label="20 June 2026" value={<span className="text-brand-fg">DAY 36</span>} />
            </div>
            <Menu
              align="end"
              trigger={
                <button className="ml-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#2a201b] text-white hover:bg-brand" aria-label="Settings">
                  <Settings className="h-6 w-6" />
                </button>
              }
              items={[
                { group: 'Game' },
                { label: 'Save game', icon: Save, hint: 'Ctrl+S' },
                { label: 'Load game', icon: Save },
                'separator',
                { group: 'Options' },
                { label: 'Sound on', icon: Volume2 },
                'separator',
                { label: 'Quit to title', icon: LogOut, danger: true },
              ]}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[340px_1fr_380px]">
            {/* Left column */}
            <div className="space-y-4">
              <Panel className="p-4">
                <div className="flex gap-3">
                  <ArtPlaceholder label="Portrait" compact className="h-24 w-24 shrink-0 rounded-md" />
                  <div>
                    <div className="font-display text-2xl font-bold leading-tight">Abhijeet Dipke</div>
                    <div className="text-sm text-muted">Founder · CJP</div>
                    <p className="mt-2 font-hand text-lg leading-snug text-fg-2">“What if all cockroaches come together?”</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Meter label="Energy" icon={Zap} value={78} tone="success" />
                  <Meter label="Stress" icon={Brain} value={42} tone="danger" />
                </div>
              </Panel>

              <Panel className="p-4">
                <PanelHeader title="Active Campaigns" action="View all" />
                <div className="mt-3 divide-y divide-line">
                  {campaigns.map(c => (
                    <button key={c.title} className="flex w-full items-center gap-3 py-3 text-left hover:bg-raised">
                      <c.icon className="h-9 w-9 shrink-0 text-brand-fg" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-lg font-semibold leading-tight">{c.title}</div>
                        <div className="truncate text-xs text-muted">{c.sub}</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Meter value={c.pct} tone={c.tone} showValue={false} className="flex-1" />
                          <span className="font-tactical text-sm font-bold">{c.pct}%</span>
                          <span className="font-tactical text-xs text-muted">{c.days} days left</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>

            {/* Centre: map placeholder + hover card demo */}
            <Panel className="relative flex min-h-[520px] flex-col overflow-hidden">
              <ArtPlaceholder label="Interactive India map (SVG) goes here" className="flex-1" />
              <div className="absolute left-[46%] top-[30%]">
                <HoverCard
                  trigger={
                    <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-accent shadow-lg" aria-label="Delhi">
                      <Flame className="h-4 w-4 text-brand" />
                    </button>
                  }
                >
                  <div className="flex gap-3">
                    <ArtPlaceholder label="India Gate" compact className="h-16 w-16 shrink-0 rounded" />
                    <div className="flex-1 text-sm">
                      <div className="font-display text-xl font-bold">DELHI</div>
                      <div className="text-xs font-semibold text-danger-fg">High Protest Activity</div>
                      <dl className="mt-1.5 grid grid-cols-[1fr_auto] gap-y-0.5">
                        <dt className="text-fg-2">Support</dt><dd className="font-bold">78%</dd>
                        <dt className="text-fg-2">Volunteers</dt><dd className="font-bold">12K</dd>
                        <dt className="text-fg-2">Police Presence</dt><dd className="font-bold text-danger-fg">High</dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button size="sm">Campaign here</Button>
                    <Button size="sm" variant="secondary">Details</Button>
                  </div>
                </HoverCard>
              </div>
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <Popover trigger={<Button variant="secondary" size="sm">Launch campaign…</Button>} align="start">
                  <div className="space-y-3">
                    <div className="font-display text-lg font-bold">New campaign</div>
                    <label className="block text-sm font-semibold">
                      Type
                      <select className="mt-1 h-10 w-full rounded-md border border-line-strong bg-surface px-2">
                        <option>Protest / sit-in</option>
                        <option>School inspection drive</option>
                        <option>Legal challenge</option>
                      </select>
                    </label>
                    <Button className="w-full">Launch · 1 AP</Button>
                  </div>
                </Popover>
                <Menu
                  label="Map layer"
                  items={[
                    { label: 'CJP support', icon: MapIcon },
                    { label: 'Volunteer strength', icon: Users },
                    { label: 'Police presence', icon: Siren },
                    { label: 'Seats & incumbents', icon: Landmark },
                  ]}
                />
              </div>
            </Panel>

            {/* Right column */}
            <div className="space-y-4">
              <Panel className="p-3">
                <Tabs
                  tabs={[
                    { value: 'news', label: 'News' },
                    { value: 'social', label: 'Social' },
                    { value: 'intel', label: 'Intel' },
                    { value: 'tasks', label: 'Tasks', badge: 3 },
                  ]}
                >
                  <TabPanel value="news">
                    <div className="divide-y divide-line">
                      {news.map(n => (
                        <article key={n.title} className="flex gap-3 py-2.5">
                          <ArtPlaceholder label="" compact className="h-16 w-24 shrink-0 rounded" />
                          <div className="min-w-0">
                            <h3 className="font-display text-base font-semibold leading-tight">{n.title}</h3>
                            <p className="mt-0.5 text-sm text-fg-2">{n.sub}</p>
                            <p className="mt-0.5 text-xs text-muted">{n.src}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </TabPanel>
                  <TabPanel value="social"><p className="p-4 text-sm text-muted">Social feed…</p></TabPanel>
                  <TabPanel value="intel"><p className="p-4 text-sm text-muted">Intel reports…</p></TabPanel>
                  <TabPanel value="tasks"><p className="p-4 text-sm text-muted">3 pending tasks…</p></TabPanel>
                </Tabs>
              </Panel>

              <Panel className="p-4">
                <PanelHeader title="Trending Now" icon={Flame} action="View all" />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {['#MainBhiCockroach', '#NEETScam', '#SchoolThikKaro', '#LightsOutDemocracy'].map((h, i) => (
                    <div key={h} className="flex items-center gap-2 rounded-md border border-line bg-raised p-2">
                      <span className="font-display text-xl font-bold text-muted">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-sm font-semibold">{h}</div>
                        <Delta value={[1.2, 0.8, 0.4, 0.38][i]} suffix="M posts" />
                      </div>
                      <Menu
                        align="end"
                        trigger={<button className="rounded p-1 hover:bg-surface" aria-label={`Actions for ${h}`}><MoreHorizontal className="h-4 w-4" /></button>}
                        items={[{ label: 'Amplify', hint: '1 AP' }, { label: 'Post a meme', hint: '1 AP' }, { label: 'Counter it' }]}
                      />
                    </div>
                  ))}
                </div>
              </Panel>

              <EndTurnButton day={36} onClick={() => setEventOpen(true)} />
            </div>
          </div>

          {/* Pieces gallery */}
          <Panel className="p-4">
            <PanelHeader title="Pieces" />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger" icon={AlertTriangle}>Danger</Button>
              <Button disabled>Disabled</Button>
              <Badge>3</Badge>
              <Badge tone="accent">LIVE</Badge>
              <Badge tone="success">Corroborated</Badge>
              <Badge tone="danger">Unverified</Badge>
              <StickyNote>Remember: rest before the march!</StickyNote>
              <Tooltip content="Tooltips explain every number."><Button variant="secondary">Hover me</Button></Tooltip>
            </div>
            <SpeechBubble className="mt-5" name="Riya Deshmukh" role="CJP Spokesperson">
              The crowd is strong and in good spirits. Media is here — this is a good time to make our demands louder.
            </SpeechBubble>
          </Panel>

          {/* Bottom nav */}
          <nav className="flex overflow-x-auto rounded-lg border border-line-strong bg-surface shadow-card scrollbar-none" aria-label="Screens">
            {nav.map(n => (
              <button
                key={n.label}
                onClick={() => setActiveNav(n.label)}
                aria-current={activeNav === n.label ? 'page' : undefined}
                className="flex min-w-24 flex-1 flex-col items-center gap-1 px-3 py-2.5 font-display text-sm font-semibold text-fg-2 transition-colors hover:bg-raised aria-[current=page]:bg-brand aria-[current=page]:text-white"
              >
                <n.icon className="h-6 w-6" aria-hidden="true" />
                {n.label}
              </button>
            ))}
          </nav>
        </div>

        <GameDialog
          open={eventOpen}
          onOpenChange={setEventOpen}
          title="The Police Cut the Lights"
          tag={<span className="inline-flex -rotate-3 items-center gap-1.5 rounded bg-brand px-3 py-1 font-display text-lg font-bold uppercase text-white shadow-lg"><Megaphone className="h-5 w-5" />Event</span>}
          art={<ArtPlaceholder label="Event illustration: police cut the lights at Jantar Mantar" className="h-full w-full" />}
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_minmax(0,22rem)] sm:items-end">
            <p className="text-base leading-relaxed text-fg">
              It’s 11:45 PM at Jantar Mantar. Without prior notice, the police have switched off the street lights in the entire protest area.
              Students are continuing the sit-in, and the hunger strike by senior activists is now on its 4th day.
            </p>
            <SpeechBubble name="Riya Deshmukh" role="CJP Spokesperson" side="right">
              They want to break our morale. Whatever we do now will have big consequences.
            </SpeechBubble>
          </div>
          <div className="mt-4 space-y-2.5">
            <ChoiceCard
              emphasis
              icon={MonitorPlay}
              title="Stay and livestream it"
              description="Keep protesting, go live on all channels, show the world what’s happening."
              effects={<><EffectChip icon={Users} value="+2.5M" label="Followers" tone="good" /><EffectChip icon={Flame} value="+30%" label="Legal Heat" tone="bad" /></>}
              onSelect={() => setEventOpen(false)}
            />
            <ChoiceCard
              icon={Handshake}
              title="Negotiate with police"
              description="Send a small delegation to request lights and basic facilities."
              effects={<EffectChip icon={Star} value="+10%" label="Credibility" tone="good" />}
              onSelect={() => setEventOpen(false)}
            />
            <ChoiceCard
              icon={Users}
              title="Call supporters to come now"
              description="Issue an urgent call for more people to reach Jantar Mantar tonight."
              effects={<><EffectChip icon={Users} value="+20K" label="Volunteers" tone="good" /><EffectChip icon={AlertTriangle} value="+20%" label="Risk of Detention" tone="bad" /></>}
              onSelect={() => setEventOpen(false)}
              disabled
              disabledReason="Needs ₹50,000"
            />
          </div>
        </GameDialog>
      </div>
    </TooltipProvider>
  );
}
