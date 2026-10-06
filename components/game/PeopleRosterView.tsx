'use client';

import React, { useState } from 'react';
import { Users, UserPlus, UserX, Briefcase, Heart, ShieldCheck, Award, ChevronDown, Pencil } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate, isoDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import type { RecruitablePerson } from '@/lib/game/types';
import { ArtPlaceholder, Badge, Button, Meter, Panel, PanelHeader } from '@/components/ui/primitives';
import { GameDialog, Menu, TabPanel, Tabs } from '@/components/ui/menus';

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
  const people = state.people;
  const team = people.filter(p => p.isHired);
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
          Real CJP members join when the record says they did (most through the story). Fictional recruits can be hired any time.
        </p>
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
  return (
    <button onClick={onOpen} className="chunky-sm pressable flex w-full gap-3 bg-raised p-3 text-left">
      <ArtPlaceholder label={p.name} compact className="h-14 w-14 shrink-0 rounded-lg border-2 border-ink" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-xs text-ink">{p.name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          <Badge tone="neutral">{ROLE_LABEL[p.role]}</Badge>
          {p.historical && <Badge tone="teal">Real</Badge>}
          {p.fictional && <Badge tone="neutral">Fictional</Badge>}
        </div>
        <div className="mt-1 truncate text-xs font-bold text-muted">
          {p.isHired ? p.currentAssignment ?? 'Awaiting assignment' : notYet ? `Joins ${formatDate(p.joinDate!)}` : 'Available to recruit'}
        </div>
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

        {p.isHired && (
          <div className="chunky-sm space-y-2 bg-raised p-3">
            <div className="font-display text-xs text-ink">Assignment</div>
            <div className="text-sm font-bold text-fg-2">{p.currentAssignment ?? 'None yet'}</div>
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
