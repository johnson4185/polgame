'use client';

import React, { useSyncExternalStore } from 'react';
import { Megaphone, Map as MapIcon, Users, Search, Vote, Trophy, Landmark, User, Wallet, BookOpen, ScrollText, LayoutGrid } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import type { ScreenTab } from '@/lib/game/types';
import { EndTurnButton, cn } from '@/components/ui/primitives';
import { dayNumber } from './CampaignRoadmap';

interface DockItem {
  id: ScreenTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  /** Shown in the dock on phones; otherwise only under "More" there */
  mobile?: boolean;
}

// Narrow screens fit 4 tabs + More; wide screens fit the main 6
function useIsWide() {
  return useSyncExternalStore(
    cb => {
      const mq = window.matchMedia('(min-width: 768px)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(min-width: 768px)').matches,
    () => true,
  );
}

export function BottomDock() {
  const { state, dispatch } = useGame();
  const wide = useIsWide();

  const go = (screen: ScreenTab) => {
    soundManager.playClick();
    dispatch({ type: 'SET_SCREEN', screen });
  };

  const openCases = state.cases.filter(c => c.currentStage !== 'FILED_PIL' && c.currentStage !== 'EXPOSED').length;
  const main: DockItem[] = [
    { id: 'OPERATIONS', label: 'Campaigns', icon: Megaphone, badge: state.operations.filter(o => o.status === 'ACTIVE').length || undefined, mobile: true },
    { id: 'MAP_543', label: 'Map', icon: MapIcon, mobile: true },
    { id: 'PEOPLE', label: 'People', icon: Users, mobile: true },
    { id: 'EVIDENCE', label: 'Research', icon: Search, badge: openCases || undefined, mobile: true },
    { id: 'PARTY_ECI', label: state.party.isFormed ? state.party.abbreviation : 'Party', icon: Vote },
    { id: 'ELECTION_NIGHT', label: 'Election', icon: Trophy, badge: state.electionLiveState.isCountingUnderway ? 'LIVE' : undefined },
  ];
  const more: DockItem[] = [
    { id: 'PERSONAL', label: 'Personal life', icon: User },
    { id: 'FINANCE', label: 'Ledgers', icon: Wallet },
    { id: 'GOVERNMENT', label: 'Parliament', icon: Landmark },
    { id: 'ARCHIVE', label: 'Archive', icon: BookOpen },
    { id: 'JOURNAL', label: 'Chronicle', icon: ScrollText },
  ];
  const docked = wide ? main : main.filter(i => i.mobile);
  const overflow = wide ? more : [...main.filter(i => !i.mobile), ...more];
  const moreActive = overflow.some(i => i.id === state.activeScreen);

  const tab = (active: boolean) =>
    cn(
      'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 font-display text-[9px] transition-all sm:text-xs md:py-1.5',
      active
        ? '-translate-y-1.5 border-3 border-ink bg-brand text-brand-ink shadow-[3px_3px_0_var(--ink)] md:-translate-y-2 md:scale-105'
        : 'border-3 border-transparent text-ink hover:-translate-y-0.5',
    );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-2 pb-2 sm:px-5 sm:pb-3">
      <div className="mx-auto flex max-w-[1600px] flex-col-reverse items-stretch gap-2 md:flex-row md:items-end md:gap-4">
        <nav className="chunky flex flex-1 gap-1 bg-accent p-1 pt-2.5 md:p-1.5 md:pt-3" aria-label="Game screens">
          {docked.map(item => {
            const active = state.activeScreen === item.id;
            return (
              <button key={item.id} onClick={() => go(item.id)} aria-current={active ? 'page' : undefined} className={tab(active)}>
                <item.icon className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                <span className="max-w-full truncate">{item.label}</span>
                {item.badge !== undefined && <DockBadge value={item.badge} />}
              </button>
            );
          })}

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className={tab(moreActive)} aria-label="More screens">
              <LayoutGrid className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
              <span>More</span>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="top" align="end" sideOffset={12} className="chunky z-[70] grid min-w-60 grid-cols-2 gap-1.5 bg-surface p-2 text-fg">
                {overflow.map(item => (
                  <DropdownMenu.Item
                    key={item.id}
                    onSelect={() => go(item.id)}
                    className={cn(
                      'flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-center text-xs font-extrabold outline-none',
                      state.activeScreen === item.id ? 'border-ink bg-brand' : 'border-transparent data-[highlighted]:border-ink data-[highlighted]:bg-accent',
                    )}
                  >
                    <item.icon className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                    {item.label}
                    {item.badge !== undefined && <span className="text-[10px] text-pink">{item.badge}</span>}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </nav>

        <EndTurnButton
          className="md:w-72"
          day={dayNumber(state.currentDate)}
          disabled={!!state.activeCrisis || !!state.activeMiniGame || !!state.gameOver || !!state.story?.activeEventId}
          onClick={() => {
            soundManager.playPaper();
            dispatch({ type: 'ADVANCE_DAY' });
          }}
        />
      </div>
    </div>
  );
}

function DockBadge({ value }: { value: number | string }) {
  return (
    <span className="absolute right-1 top-0 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-ink bg-pink px-1 font-sans text-[10px] font-extrabold text-white">
      {value}
    </span>
  );
}
