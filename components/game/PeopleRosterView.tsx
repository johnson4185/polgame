'use client';

import React, { useState } from 'react';
import { Users, UserPlus, UserX, Briefcase, Heart, ShieldCheck, Award, ChevronDown, Pencil, TrendingUp, AlertTriangle, Lock } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate, isoDate } from '@/lib/game/simulation/engine';
import { ageOn } from '@/lib/game/simulation/ages';
import { soundManager } from '@/lib/game/simulation/sound';
import type { RecruitablePerson } from '@/lib/game/types';
import { ArtPlaceholder, Badge, Button, Meter, Panel, PanelHeader } from '@/components/ui/primitives';
import { GameDialog, Menu, TabPanel, Tabs } from '@/components/ui/menus';
import {
  DESK_LABEL,
  PROMOTION_DAYS,
  PROMOTION_PAY_RISE,
  QUIT_MORALE,
  RANK_LABEL,
  deskOf,
  nextRank,
  promotionBlocker,
  rankOf,
  teamOutput,
  type TeamOutput,
} from '@/lib/game/simulation/team';

/** "+320 followers, +₹540" — today's output in words */
function outputText(o: TeamOutput | undefined): string {
  if (!o) return '';
  const parts = [
    o.followers && `+${o.followers.toLocaleString('en-IN')} followers`,
    o.volunteers && `+${o.volunteers} volunteers`,
    o.funds && `+₹${o.funds.toLocaleString('en-IN')}`,
    o.research && `+${o.research} case readiness`,
    o.legalChance && `${Math.round(o.legalChance * 100)}% chance to ease police pressure`,
    o.campaignMorale && `+${o.campaignMorale} crowd morale`,
  ].filter(Boolean);
  return parts.join(', ');
}
const months = (days: number) => (days < 30 ? `${days} day${days === 1 ? '' : 's'}` : `${Math.floor(days / 30)} month${days < 60 ? '' : 's'}`);
/** Recruits who only appear once the movement is big enough */
const isLocked = (p: RecruitablePerson) => !!p.unlockVolunteers && !p.availableSince && !p.isHired;

const ROLE_LABEL: Record<RecruitablePerson['role'], string> = {
  ORGANIZER: 'Organiser',
  LAWYER: 'Lawyer',
  INVESTIGATOR: 'Investigator',
  COMMUNICATIONS: 'Communications',
  FUNDRAISER: 'Fundraiser',
  REGIONAL_LEAD: 'Regional lead',
};

/** The team: filter tabs, a card grid, and a profile dialog with recruit/relieve/assign. */
export function PeopleRosterView() {
  const { state } = useGame();
  const [openId, setOpenId] = useState<string | null>(null);
  const people = state.people.filter(p => !isLocked(p));
  const locked = state.people.filter(isLocked).sort((a, b) => a.unlockVolunteers! - b.unlockVolunteers!);
  const team = people.filter(p => p.isHired);
  const daily = teamOutput(state).total;
  const burn = team.reduce((n, p) => n + p.salaryMonthly, 0);
  const open = people.find(p => p.id === openId) ?? null;

  const grid = (list: RecruitablePerson[], empty: string) =>
    list.length === 0 ? (
      <p className="py-8 text-center text-sm font-semibold text-muted">{empty}</p>
    ) : (
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map(p => (
          <li key={p.id}>
            <PersonCard person={p} onOpen={() => setOpenId(p.id)} />
          </li>
        ))}
      </ul>
    );

  return (
    <div className="space-y-4">
      <Panel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PanelHeader title="Your team" icon={Users} />
          <div className="flex flex-wrap gap-2">
            <Badge tone="teal">{team.length} on the team</Badge>
            <Badge tone="gold">₹{burn.toLocaleString('en-IN')}/month in stipends</Badge>
          </div>
        </div>
        <p className="mt-2 text-sm font-semibold text-fg-2">
          Real CJP members join when the record says they did (most through the story). Give people a desk (Media room, Fundraising, Research desk,
          Legal desk, Volunteer coordination) or a running campaign and they produce something every day. Campaigns wear people out; desks let
          them recover.
        </p>
        <div className="chunky-sm mt-3 flex flex-wrap items-center gap-2 bg-raised px-3 py-2 text-sm font-bold text-fg">
          <TrendingUp className="h-4 w-4 text-success" aria-hidden="true" />
          {outputText(daily) ? <span>Team output per day: {outputText(daily)}</span> : <span className="text-muted">No one has a desk yet, so the team produces nothing.</span>}
        </div>
        {locked.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-muted">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> {locked.length} more {locked.length === 1 ? 'person' : 'people'} will want to join as the
            movement grows. Next at {locked[0].unlockVolunteers!.toLocaleString('en-IN')} volunteers.
          </p>
        )}
      </Panel>

      <Panel className="p-3 sm:p-4">
        <Tabs
          size="sm"
          tabs={[
            { value: 'team', label: 'Team', badge: team.length },
            { value: 'real', label: 'Real people' },
            { value: 'fictional', label: 'Fictional' },
            { value: 'all', label: 'All' },
          ]}
        >
          <TabPanel value="team">{grid(team, 'Nobody on the team yet. Recruit from the other tabs, or wait for the story.')}</TabPanel>
          <TabPanel value="real">{grid(people.filter(p => p.historical), 'No real people in this save.')}</TabPanel>
          <TabPanel value="fictional">{grid(people.filter(p => p.fictional), 'No fictional recruits.')}</TabPanel>
          <TabPanel value="all">{grid(people, 'Nobody here.')}</TabPanel>
        </Tabs>
      </Panel>

      <ProfileDialog person={open} onClose={() => setOpenId(null)} />
    </div>
  );
}

function PersonCard({ person: p, onOpen }: { person: RecruitablePerson; onOpen: () => void }) {
  const { state } = useGame();
  const notYet = !!p.joinDate && isoDate(state.currentDate) < isoDate(p.joinDate);
  const out = p.isHired ? outputText(teamOutput(state).byPerson[p.id]) : '';
  const atRisk = p.isHired && p.morale < QUIT_MORALE;
  return (
    <button onClick={onOpen} className="chunky-sm pressable flex w-full gap-3 bg-raised p-3 text-left">
      <ArtPlaceholder label={p.name} compact className="h-14 w-14 shrink-0 rounded-lg border-2 border-ink" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-xs text-ink">{p.name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          <Badge tone="neutral">{ROLE_LABEL[p.role]}</Badge>
          {p.historical && <Badge tone="teal">Real</Badge>}
          {p.fictional && <Badge tone="neutral">Fictional</Badge>}
          {rankOf(p) !== 'MEMBER' && <Badge tone="gold">{RANK_LABEL[rankOf(p)]}</Badge>}
          {atRisk && <Badge tone="danger">May quit</Badge>}
          {p.isHired && !promotionBlocker(p) && <Badge tone="success">Can be promoted</Badge>}
        </div>
        <div className="mt-1 truncate text-xs font-bold text-muted">
          {p.isHired ? p.currentAssignment ?? 'Awaiting assignment' : notYet ? `Joins ${formatDate(p.joinDate!)}` : 'Available to recruit'}
        </div>
        {out && <div className="truncate text-xs font-bold text-success-fg">{out} a day</div>}
      </div>
      {p.isHired && <span className="h-3 w-3 shrink-0 rounded-full border-2 border-ink bg-success" aria-label="On the team" />}
    </button>
  );
}

function ProfileDialog({ person: p, onClose }: { person: RecruitablePerson | null; onClose: () => void }) {
  const { state, dispatch } = useGame();
  const [custom, setCustom] = useState('');
  if (!p) return null;
  const notYet = !!p.joinDate && isoDate(state.currentDate) < isoDate(p.joinDate);
  const assignments = [
    ...state.operations.filter(o => o.status === 'ACTIVE').map(o => o.title),
    'Legal desk',
    'Media room',
    'Research desk',
    'Fundraising',
    'Volunteer coordination',
  ];
  const assign = (assignment: string) => {
    soundManager.playClick();
    dispatch({ type: 'ASSIGN_STAFF', personId: p.id, assignment });
  };

  return (
    <GameDialog open onOpenChange={o => !o && onClose()} title={p.name} size="md">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="gold">{ROLE_LABEL[p.role]}</Badge>
          {p.historical && <Badge tone="teal">Real person</Badge>}
          {p.fictional && <Badge tone="neutral">Fictional character</Badge>}
          <Badge tone="neutral">{p.state}</Badge>
          {p.birthDate && <Badge tone="neutral">Age {ageOn(p.birthDate, state.currentDate)}</Badge>}
          <Badge tone="neutral">{p.isVolunteer ? 'Volunteer (unpaid)' : `₹${p.salaryMonthly.toLocaleString('en-IN')}/month`}</Badge>
        </div>

        <p className="text-sm font-semibold leading-relaxed text-fg">{p.observation}</p>

        <div className="space-y-2">
          <Meter label="Morale" icon={Heart} value={p.morale} tone={p.morale < 40 ? 'danger' : 'success'} />
          <Meter label="Loyalty" icon={Award} value={p.loyalty} tone="accent" />
          {/* Real people aren't given an integrity score */}
          {!p.historical && <Meter label="Integrity" icon={ShieldCheck} value={p.integrity} tone="teal" />}
          <Meter label="Workload" icon={Briefcase} value={p.workload} tone={p.workload > 70 ? 'danger' : 'pink'} />
        </div>

        {p.isHired && <Career person={p} />}

        {p.isHired && (
          <div className="chunky-sm space-y-2 bg-raised p-3">
            <div className="font-display text-xs text-ink">Assignment</div>
            <div className="text-sm font-bold text-fg-2">{p.currentAssignment ?? 'None yet'}</div>
            <DeskNote person={p} />
            <div className="flex flex-wrap gap-2">
              <Menu
                trigger={
                  <Button size="sm" variant="secondary">
                    Assign to… <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                }
                items={assignments.map(a => ({ label: a, onSelect: () => assign(a) }))}
              />
              <div className="flex min-w-0 flex-1 gap-2">
                <input
                  value={custom}
                  onChange={e => setCustom(e.target.value)}
                  placeholder="Or type a task"
                  aria-label="Custom assignment"
                  className="h-9 min-w-0 flex-1 rounded-lg border-2 border-ink bg-surface px-2 text-sm text-fg"
                />
                <Button
                  size="sm"
                  icon={Pencil}
                  disabled={!custom.trim()}
                  onClick={() => {
                    assign(custom.trim());
                    setCustom('');
                  }}
                >
                  Set
                </Button>
              </div>
            </div>
          </div>
        )}

        {p.memories.length > 0 && (
          <div>
            <div className="font-display text-xs text-ink">Memories</div>
            <ul className="mt-1 space-y-1">
              {p.memories.map((m, i) => (
                <li key={i} className="border-l-4 border-pink pl-2 text-sm font-semibold text-fg-2">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          {p.isHired ? (
            <Button
              variant="secondary"
              icon={UserX}
              onClick={() => {
                soundManager.playClick();
                dispatch({ type: 'FIRE_STAFF', personId: p.id });
              }}
            >
              Relieve from team
            </Button>
          ) : (
            <Button
              icon={UserPlus}
              disabled={notYet}
              title={notYet ? `Joins the movement on ${formatDate(p.joinDate!)}` : undefined}
              onClick={() => {
                soundManager.playStamp();
                dispatch({ type: 'HIRE_STAFF', personId: p.id });
              }}
            >
              {notYet ? `Joins ${formatDate(p.joinDate!)}` : p.isVolunteer ? 'Invite to the team' : `Recruit · ₹${(p.salaryMonthly / 1000).toFixed(0)}K/mo`}
            </Button>
          )}
        </div>
      </div>
    </GameDialog>
  );
}

function DeskNote({ person: p }: { person: RecruitablePerson }) {
  const { state } = useGame();
  const desk = deskOf(p.currentAssignment, state.operations);
  const out = outputText(teamOutput(state).byPerson[p.id]);
  if (!p.currentAssignment) return <p className="text-xs font-semibold text-muted">No desk: no daily output, but morale recovers.</p>;
  if (!desk)
    return <p className="text-xs font-semibold text-muted">This isn&apos;t a desk the game recognises, so it produces nothing. Pick one from the menu.</p>;
  return (
    <p className="text-xs font-semibold text-fg-2">
      {DESK_LABEL[desk]}: <span className="font-extrabold text-success-fg">{out || 'nothing yet'}</span> a day.
      {desk === 'CAMPAIGN' ? ' Campaign work is heavy: watch their workload.' : ''}
    </p>
  );
}

function Career({ person: p }: { person: RecruitablePerson }) {
  const { dispatch } = useGame();
  const rank = rankOf(p);
  const to = nextRank(p);
  const days = p.daysServed ?? 0;
  const blocker = promotionBlocker(p);
  const newPay = p.isVolunteer ? 0 : Math.round((p.salaryMonthly * PROMOTION_PAY_RISE) / 500) * 500;
  return (
    <div className="chunky-sm space-y-2 bg-raised p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-display text-xs text-ink">Experience</div>
        <Badge tone="gold">{RANK_LABEL[rank]}</Badge>
      </div>
      <p className="text-sm font-semibold text-fg-2">On the team for {months(days)}. Coordinators produce 1.5× and Leads 2× at their desk.</p>
      {p.morale < QUIT_MORALE && (
        <p className="flex items-center gap-1.5 text-sm font-bold text-danger-fg">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Morale is very low{p.lowMoraleDays ? ` (${p.lowMoraleDays} days)` : ''}. Two weeks like
          this and they quit.
        </p>
      )}
      {to && (
        <>
          <div>
            <div className="flex justify-between text-xs font-extrabold text-fg">
              <span>Days towards {RANK_LABEL[to]}</span>
              <span className="tabular-nums">
                {Math.min(days, PROMOTION_DAYS[to])} / {PROMOTION_DAYS[to]}
              </span>
            </div>
            <Meter value={Math.min(days, PROMOTION_DAYS[to])} max={PROMOTION_DAYS[to]} tone="teal" showValue={false} className="mt-0.5" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              icon={Award}
              disabled={!!blocker}
              onClick={() => {
                soundManager.playStamp();
                dispatch({ type: 'PROMOTE_STAFF', personId: p.id });
              }}
            >
              Promote to {RANK_LABEL[to]}
            </Button>
            <span className="text-xs font-bold text-muted">
              {blocker ?? (p.isVolunteer ? 'Volunteer: no pay change.' : `Stipend ₹${p.salaryMonthly.toLocaleString('en-IN')} → ₹${newPay.toLocaleString('en-IN')}`)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
