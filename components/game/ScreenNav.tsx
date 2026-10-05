'use client';

import React from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { ScreenTab } from '@/lib/game/types';
import { 
  Megaphone, 
  User, 
  Map, 
  Users, 
  FileSearch, 
  CreditCard, 
  Vote, 
  Trophy, 
  Landmark, 
  BookOpen, 
  ScrollText 
} from 'lucide-react';

interface TabItem {
  id: ScreenTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export function ScreenNav() {
  const { state, dispatch } = useGame();

  const tabs: TabItem[] = [
    { id: 'OPERATIONS', label: 'Jantar Mantar', icon: Megaphone, badge: state.operations.filter(o => o.status === 'ACTIVE').length || undefined },
    { id: 'PERSONAL', label: 'Personal', icon: User },
    { id: 'MAP_543', label: 'Map', icon: Map },
    { id: 'PEOPLE', label: 'Team', icon: Users, badge: state.people.filter(p => p.isHired).length },
    { id: 'EVIDENCE', label: 'Evidence', icon: FileSearch, badge: state.cases.length },
    { id: 'FINANCE', label: 'Ledgers', icon: CreditCard },
    { id: 'PARTY_ECI', label: state.party.isFormed ? `${state.party.abbreviation} Party` : 'Party & ECI', icon: Vote },
    { id: 'ELECTION_NIGHT', label: 'Election', icon: Trophy, badge: state.electionLiveState.isCountingUnderway ? 'LIVE' : undefined },
    { id: 'GOVERNMENT', label: 'Parliament', icon: Landmark },
    { id: 'ARCHIVE', label: 'Archive', icon: BookOpen, badge: state.historicalArchive.filter(h => h.isUnlocked).length },
    { id: 'JOURNAL', label: 'Chronicle', icon: ScrollText },
  ];

  return (
    <nav className="border-b border-line bg-surface" aria-label="Game screens">
      <div className="scrollbar-none mx-auto flex max-w-7xl gap-0.5 overflow-x-auto px-2 sm:px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = state.activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: tab.id })}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-2.5 font-tactical text-xs transition-colors ${
                isActive ? 'font-bold text-fg' : 'text-muted hover:text-fg'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-danger-fg' : 'text-faint'}`} aria-hidden="true" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`rounded-xs px-1 text-[10px] font-black tabular-nums ${
                    tab.badge === 'LIVE' ? 'bg-[#DC2626] text-white' : isActive ? 'bg-[#FACC15] text-black' : 'bg-raised text-muted'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              <span
                className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-colors ${isActive ? 'bg-[#DC2626]' : 'bg-transparent'}`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
