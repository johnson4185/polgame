'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Activity, Bed, Briefcase, Coffee, Flame, HandHeart, Heart, Landmark, MessageSquare, Newspaper, Send, Wallet, Zap } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate } from '@/lib/game/simulation/engine';
import { SKILL_FADE_AFTER_DAYS, SKILL_KEYS, SKILL_LABEL, SKILL_MAX, emptySkillProgress, xpToNext } from '@/lib/game/simulation/skills';
import { soundManager } from '@/lib/game/simulation/sound';
import type { GameState } from '@/lib/game/types';
import { ArtPlaceholder, Badge, Button, EffectChip, Meter, Panel, PanelHeader, StatCard, cn } from '@/components/ui/primitives';
import { ChoiceCard, TabPanel, Tabs } from '@/components/ui/menus';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
type Employment = GameState['player']['employmentStatus'];

/** Your own life: vitals, money, work, skills and your phone. */
export function PersonalLifeView() {
  const { state, dispatch } = useGame();
  const p = state.player;
  const blocked = !!(state.activeCrisis || state.activeMiniGame || state.story?.activeEventId);

  return (
    <div className="space-y-4">
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-[3px] border-ink">
              {p.campaignMode === 'ABHIJEET_CJP' ? (
                <Image src="/images/portrait_abhijeet_1790774328368.jpg" alt={p.name} fill className="object-cover" />
              ) : (
                <ArtPlaceholder label={p.name} compact className="h-full w-full" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl text-fg">{p.name}</h2>
              <p className="text-sm font-semibold text-fg-2">{p.roleTitle}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge tone={p.campaignMode === 'ABHIJEET_CJP' ? 'teal' : 'neutral'}>{p.campaignMode === 'ABHIJEET_CJP' ? 'Real person' : 'Your citizen'}</Badge>
                <Badge tone="neutral">{p.background.replace(/_/g, ' ').toLowerCase()}</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:items-end">
            <Button
              icon={Bed}
              variant="teal"
              disabled={blocked}
              onClick={() => {
                soundManager.playClick();
                dispatch({ type: 'REST_DAY' });
              }}
            >
              Take a day off
            </Button>
            <span className="text-xs font-bold text-muted">{blocked ? 'Finish the current event first.' : 'Skips to tomorrow: +35 energy, −25 stress, +5 health'}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <Meter label="Health" icon={Heart} value={p.health} tone={p.health < 40 ? 'danger' : 'success'} />
          <Meter label="Energy" icon={Zap} value={p.energy} tone={p.energy < 30 ? 'danger' : 'accent'} />
          <Meter label="Stress" icon={Activity} value={p.stress} tone={p.stress > 65 ? 'danger' : 'pink'} />
        </div>
        {p.burnoutRisk && <p className="mt-2 text-sm font-bold text-danger-fg">Burnout risk: your stress is very high. Rest before your health starts to fall.</p>}
      </Panel>

      <Panel className="p-3 sm:p-4">
        <Tabs
          size="sm"
          tabs={[
            { value: 'money', label: 'Money' },
            { value: 'work', label: 'Work' },
            { value: 'skills', label: 'Skills' },
            { value: 'phone', label: 'Phone', badge: state.newsFeed.filter(n => !n.read).length || undefined },
          ]}
        >
          <TabPanel value="money">
            <Money />
          </TabPanel>
          <TabPanel value="work">
            <Work />
          </TabPanel>
          <TabPanel value="skills">
            <Skills />
          </TabPanel>
          <TabPanel value="phone">
            <Phone />
          </TabPanel>
        </Tabs>
      </Panel>
    </div>
  );
}

// What practises each skill, in plain words
const SKILL_HOW: Record<(typeof SKILL_KEYS)[number], string> = {
  communication: 'Media posts, going public, rallies and TV debates',
  organizing: 'Campaigns, blitzes and running protest logistics',
  research: 'RTIs, corroboration and court petitions',
  negotiation: 'Police talks, legal aid, lobbying bills and coalitions',
  leadership: 'Crises, story decisions, marches and building the team',
  financialAcumen: 'Funding candidates and putting in your own money',
};

function Skills() {
  const { state } = useGame();
  const p = state.player;
  const progress = p.skillProgress ?? emptySkillProgress();
  return (
    <div className="space-y-3">
      <ul className="grid gap-3 sm:grid-cols-2">
        {SKILL_KEYS.map(k => {
          const level = p[k];
          const maxed = level >= SKILL_MAX;
          const need = xpToNext(level);
          const have = progress.xp[k];
          return (
            <li key={k} className="chunky-sm bg-raised p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-xs text-fg">{SKILL_LABEL[k]}</span>
                <span className="font-display text-lg text-fg tabular-nums">
                  {level}
                  <span className="text-xs text-muted">/{SKILL_MAX}</span>
                </span>
              </div>
              <Meter value={level} max={SKILL_MAX} tone="brand" showValue={false} className="mt-1" />
              <div className="mt-2 flex justify-between text-xs font-bold text-muted">
                <span>{maxed ? 'Mastered' : `Next level`}</span>
                {!maxed && (
                  <span className="tabular-nums">
                    {have} / {need}
                  </span>
                )}
              </div>
              {!maxed && <Meter value={have} max={need} tone="teal" showValue={false} className="mt-0.5" />}
              <p className="mt-1.5 text-xs font-semibold text-fg-2">{SKILL_HOW[k]}</p>
            </li>
          );
        })}
      </ul>
      <p className="text-xs font-semibold text-muted">
        You get better at what you do. Each action practises a skill, and higher levels take longer to reach. A skill you haven&apos;t used for{' '}
        {SKILL_FADE_AFTER_DAYS} days loses a little progress each month, but never a whole level. Research makes RTIs stronger, organising makes
        blitzes stronger, and negotiation helps bills through Parliament.
      </p>
    </div>
  );
}

function Money() {
  const { state, dispatch } = useGame();
  const p = state.player;
  const [amount, setAmount] = useState(10000);
  const presets = [5000, 10000, 25000, 50000];
  const tooMuch = amount > p.personalSavings;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Wallet} iconTone="teal" label="Savings" value={inr(p.personalSavings)} />
        <StatCard icon={Coffee} iconTone="saffron" label="Living costs a month" value={inr(p.monthlyLivingCost)} />
        <StatCard icon={Flame} iconTone={p.personalDebt > 0 ? 'pink' : 'ink'} label="Debt" value={inr(p.personalDebt)} />
        <StatCard icon={HandHeart} iconTone="success" label="Family support" value={`${p.familySupport}%`} />
      </div>
      <p className="text-sm font-semibold text-fg-2">
        Living costs come out of your savings at the start of each month. If savings run out, the rest becomes debt and your family&apos;s patience wears
        thin.
      </p>

      <div className="chunky-sm space-y-2 bg-raised p-3">
        <div className="font-display text-xs text-fg">Give to the movement</div>
        <p className="text-sm font-semibold text-fg-2">Moves your own money into the movement fund. It is recorded in the ledger as a founder contribution.</p>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(v => (
            <button
              key={v}
              aria-pressed={amount === v}
              onClick={() => setAmount(v)}
              className={cn('chunky-sm pressable px-3 py-1.5 text-sm font-extrabold', amount === v ? 'bg-brand text-brand-ink' : 'bg-surface text-fg')}
            >
              ₹{v / 1000}K
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            icon={Send}
            disabled={tooMuch || amount <= 0}
            onClick={() => {
              soundManager.playGavel();
              dispatch({ type: 'PERSONAL_TO_MOVEMENT_DONATION', amount });
            }}
          >
            Give {inr(amount)}
          </Button>
          {tooMuch && <span className="text-sm font-bold text-danger-fg">You only have {inr(p.personalSavings)} saved.</span>}
        </div>
      </div>
    </div>
  );
}

function Work() {
  const { state, dispatch } = useGame();
  const p = state.player;
  const options: { id: Employment; icon: React.ElementType; title: string; desc: string; effects: React.ReactNode }[] = [
    {
      id: 'FULL_TIME_JOB',
      icon: Briefcase,
      title: 'Keep the day job',
      desc: 'Steady money, but you go to bed more tired every night.',
      effects: (
        <>
          <EffectChip value={inr(p.salaryMonthly)} label="per month" tone="good" />
          <EffectChip value="−6" label="energy/night" tone="bad" />
        </>
      ),
    },
    {
      id: 'LEAVE_OF_ABSENCE',
      icon: Landmark,
      title: 'Take leave',
      desc: 'Your job waits for you on half pay.',
      effects: (
        <>
          <EffectChip value={inr(p.salaryMonthly / 2)} label="per month" tone="good" />
          <EffectChip value="−2" label="energy/night" tone="neutral" />
        </>
      ),
    },
    {
      id: 'FULL_TIME_ACTIVISM',
      icon: Flame,
      title: 'Go full-time',
      desc: 'No salary. You live on savings and give everything to the movement.',
      effects: (
        <>
          <EffectChip value="₹0" label="per month" tone="bad" />
          <EffectChip value="−2" label="energy/night" tone="neutral" />
        </>
      ),
    },
  ];
  return (
    <div className="space-y-3">
      {options.map(o => {
        const current = p.employmentStatus === o.id;
        return (
          <ChoiceCard
            key={o.id}
            icon={o.icon}
            title={current ? `${o.title} (current)` : o.title}
            description={o.desc}
            emphasis={current}
            effects={o.effects}
            onSelect={() => {
              if (current) return;
              soundManager.playClick();
              dispatch({ type: 'TOGGLE_EMPLOYMENT', status: o.id });
            }}
          />
        );
      })}
      <p className="text-xs font-semibold text-muted">Pay arrives at the start of each month. Every option loses some energy overnight; the job loses more.</p>
    </div>
  );
}

function Phone() {
  const { state } = useGame();
  const news = state.newsFeed.slice(0, 4);
  const latest = state.journal[0];
  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-[2rem] border-[3px] border-ink bg-ink p-2 shadow-[5px_5px_0_var(--pink)]">
        <div className="rounded-[1.5rem] bg-surface p-3">
          <div className="flex items-center justify-between px-1 text-xs font-extrabold text-fg">
            <span>{formatDate(state.currentDate)}</span>
            <span>{state.player.energy}% ⚡</span>
          </div>
          <div className="mt-3 space-y-2">
            {latest && (
              <div className="chunky-sm bg-success-soft p-2.5">
                <div className="flex items-center gap-1 text-xs font-extrabold text-success-fg">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> Volunteer group
                </div>
                <p className="mt-0.5 text-sm font-bold text-fg">{latest.title}</p>
              </div>
            )}
            {news.map(n => (
              <div key={n.id} className="chunky-sm bg-raised p-2.5">
                <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-muted">
                  <span className="flex min-w-0 items-center gap-1 truncate">
                    <Newspaper className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {n.sourceName}
                  </span>
                  <span className="shrink-0">{formatDate(n.date)}</span>
                </div>
                <p className="mt-0.5 text-sm font-bold leading-snug text-fg">{n.headline}</p>
              </div>
            ))}
            {!latest && news.length === 0 && <p className="py-6 text-center text-sm font-semibold text-muted">No notifications.</p>}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-muted">The full news is on the Media screen.</p>
    </div>
  );
}
