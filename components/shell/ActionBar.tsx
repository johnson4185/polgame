'use client';

import React from 'react';
import {
  Zap, Users, Megaphone, Tv, Coffee, Moon, Scale, Search, FileText, Vote, Landmark, Trophy, ChevronDown, Newspaper, ShieldAlert,
} from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { GOV_STAGES, govStage, isoDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import { Menu, Tooltip, type MenuEntry } from '@/components/ui/menus';
import type { ScreenTab } from '@/lib/game/types';

/**
 * Daily actions grouped into four menus (Organise · Media · Legal · Politics), action points and
 * the government response meter. Shown on every screen.
 */
export function ActionBar() {
  const { state, dispatch } = useGame();
  const ap = state.actionPoints;
  const maxAp = state.maxActionPoints;
  const noAp = ap <= 0;
  const today = Number(isoDate(state.currentDate).replace(/-/g, ''));
  const openCase = state.cases.find(c => c.currentStage !== 'FILED_PIL' && c.currentStage !== 'EXPOSED');
  const activeOp = state.operations.find(o => o.status === 'ACTIVE');
  const act1 = (state.story?.act ?? 1) === 1;
  const go = (screen: ScreenTab) => {
    soundManager.playClick();
    dispatch({ type: 'SET_SCREEN', screen });
  };

  const organise: MenuEntry[] = [
    { group: 'Organise' },
    {
      label: 'Stage a rally',
      icon: Megaphone,
      hint: '1 AP · mini-game',
      disabled: noAp || state.miniGameLastPlayed?.RALLY === today,
      onSelect: () => {
        soundManager.playMegaphone();
        dispatch({ type: 'OPEN_MINI_GAME', miniGame: 'RALLY' });
      },
    },
    { label: 'Campaigns…', icon: Users, hint: 'launch & run', onSelect: () => go('OPERATIONS') },
    { label: 'Chai break', icon: Coffee, hint: '1 AP · +25 energy', disabled: noAp, onSelect: () => dispatch({ type: 'FIELD_REST' }) },
    'separator',
    {
      label: 'Take the day off',
      icon: Moon,
      hint: 'ends the day',
      onSelect: () => {
        soundManager.playPaper();
        dispatch({ type: 'REST_DAY' });
      },
    },
  ];
  const media: MenuEntry[] = [
    { group: 'Media' },
    {
      label: 'Prime-time TV debate',
      icon: Tv,
      hint: '1 AP · mini-game',
      disabled: noAp || state.miniGameLastPlayed?.TV_DEBATE === today,
      onSelect: () => {
        soundManager.playCameraShutter();
        dispatch({ type: 'OPEN_MINI_GAME', miniGame: 'TV_DEBATE' });
      },
    },
    {
      label: activeOp ? `Media push: ${activeOp.title}` : 'Media push (needs a campaign)',
      icon: Newspaper,
      hint: '1 AP',
      disabled: noAp || !activeOp,
      onSelect: () => activeOp && dispatch({ type: 'OPERATION_DECISION', operationId: activeOp.id, choice: 'MEDIA_SPEECH' }),
    },
    'separator',
    { label: 'Post a meme', icon: Newspaper, hint: '1 AP', disabled: noAp, onSelect: () => dispatch({ type: 'MEDIA_ACTION', kind: 'MEME' }) },
    { label: 'Launch a hashtag', icon: Newspaper, hint: '1 AP', disabled: noAp, onSelect: () => dispatch({ type: 'MEDIA_ACTION', kind: 'HASHTAG' }) },
    { label: 'Media room…', icon: Tv, onSelect: () => go('MEDIA') },
  ];
  const legal: MenuEntry[] = [
    { group: 'Legal' },
    { label: 'Legal writ', icon: Scale, hint: '1 AP · ₹10K · heat −15', disabled: noAp, onSelect: () => dispatch({ type: 'LEGAL_AID' }) },
    {
      label: 'Corroborate evidence',
      icon: Search,
      hint: '1 AP · ₹8K',
      disabled: noAp || !openCase,
      onSelect: () => openCase && dispatch({ type: 'INVESTIGATION_ACTION', caseId: openCase.id, action: 'CORROBORATE_EVIDENCE' }),
    },
    {
      label: 'File an RTI',
      icon: FileText,
      hint: '1 AP · ₹2.5K',
      disabled: noAp || !openCase,
      onSelect: () => openCase && dispatch({ type: 'INVESTIGATION_ACTION', caseId: openCase.id, action: 'RTI_FILING' }),
    },
    { label: 'Research desk…', icon: Search, onSelect: () => go('EVIDENCE') },
  ];
  const politics: MenuEntry[] = [
    { group: 'Politics' },
    { label: state.party.isFormed ? `${state.party.abbreviation} party desk…` : act1 ? 'Party desk (opens in Act 2)' : 'Register the party…', icon: Vote, onSelect: () => go('PARTY_ECI') },
    { label: 'Election night…', icon: Trophy, onSelect: () => go('ELECTION_NIGHT') },
    { label: 'Parliament…', icon: Landmark, onSelect: () => go('GOVERNMENT') },
  ];

  const stage = govStage(state.govResponse?.pressure ?? 0);
  const stageIdx = GOV_STAGES.findIndex(g => g.stage === stage);

  const trigger = (label: string, Icon: React.ElementType) => (
    <button className="chunky-sm pressable flex h-11 min-w-0 flex-col items-center justify-center gap-0.5 bg-surface px-1 font-display text-[9px] text-ink data-[state=open]:bg-accent sm:flex-row sm:gap-1.5 sm:px-3 sm:text-xs">
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
      <span className="max-w-full truncate">{label}</span>
      <ChevronDown className="hidden h-3.5 w-3.5 sm:block" aria-hidden="true" />
    </button>
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
      <Tooltip content={`${ap} of ${maxAp} action points left today. END TURN refills them.`}>
        <div className="chunky-sm flex h-11 items-center gap-1.5 bg-surface px-2.5" aria-label={`${ap} of ${maxAp} action points`}>
          {Array.from({ length: maxAp }, (_, i) => (
            <span
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded-md border-2 border-ink ${i < ap ? 'bg-accent text-ink' : 'bg-inset text-faint'}`}
            >
              <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          ))}
        </div>
      </Tooltip>
      <div className="order-last grid basis-full grid-cols-4 gap-1.5 sm:order-none sm:flex sm:basis-auto sm:gap-2">
        <Menu trigger={trigger('Organise', Users)} items={organise} />
        <Menu trigger={trigger('Media', Tv)} items={media} />
        <Menu trigger={trigger('Legal', Scale)} items={legal} />
        <Menu trigger={trigger('Politics', Vote)} items={politics} />
      </div>
      <Tooltip content={GOV_STAGES[stageIdx].effect}>
        <div className="chunky-sm ml-auto flex h-11 items-center gap-2 bg-surface px-3" aria-label={`Government response: ${GOV_STAGES[stageIdx].label}`}>
          <ShieldAlert className="h-4 w-4 text-ink" strokeWidth={2.5} aria-hidden="true" />
          <div>
            <div className="font-display text-[10px] leading-none text-ink">Govt: {GOV_STAGES[stageIdx].label}</div>
            <div className="mt-1 flex gap-0.5">
              {GOV_STAGES.map((g, i) => (
                <span key={g.stage} className={`h-2 w-6 rounded-sm border border-ink ${i <= stageIdx ? ['bg-teal', 'bg-accent', 'bg-danger', 'bg-pink'][i] : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </Tooltip>
    </div>
  );
}
