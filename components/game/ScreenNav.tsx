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
    { id: 'PERSONAL', label: 'Personal Life', icon: User },
    { id: 'MAP_543', label: 'India 543 Map', icon: Map },
    { id: 'PEOPLE', label: 'Team Roster', icon: Users, badge: state.people.filter(p => p.isHired).length },
    { id: 'EVIDENCE', label: 'Evidence Board', icon: FileSearch, badge: state.cases.length },
    { id: 'FINANCE', label: 'Ledgers', icon: CreditCard },
    { id: 'PARTY_ECI', label: state.party.isFormed ? `${state.party.abbreviation} Party` : 'Party & ECI', icon: Vote },
    { id: 'ELECTION_NIGHT', label: 'Election 543', icon: Trophy, badge: state.electionLiveState.isCountingUnderway ? 'LIVE' : undefined },
    { id: 'GOVERNMENT', label: 'Parliament', icon: Landmark },
    { id: 'ARCHIVE', label: 'Historical Archive', icon: BookOpen, badge: state.historicalArchive.filter(h => h.isUnlocked).length },
    { id: 'JOURNAL', label: 'Chronicle', icon: ScrollText },
  ];

  return (
    <nav className="border-b-2 border-zinc-800 bg-[#0B0F19] px-2 sm:px-4 overflow-x-auto shadow-inner">
      <div className="mx-auto flex max-w-7xl items-center gap-1.5 py-1.5 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = state.activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: tab.id })}
              className={`relative flex items-center gap-2 px-3 py-1.5 text-xs font-tactical transition-all rounded-xs whitespace-nowrap border ${
                isActive
                  ? 'bg-black text-white font-extrabold border-[#DC2626] shadow-md shadow-red-950/30'
                  : 'bg-[#121622] text-zinc-400 border-zinc-800 hover:text-white hover:border-[#FACC15] hover:bg-[#1A2030]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#FACC15]' : 'text-zinc-500'}`} />
              <span className={isActive ? 'text-white' : ''}>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] tabular-nums font-mono px-1.5 py-0.2 rounded-xs font-black ${
                  isActive 
                    ? 'bg-[#DC2626] text-white animate-pulse' 
                    : 'bg-[#FACC15] text-black border border-yellow-600'
                }`}>
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute -bottom-1.5 left-2 right-2 h-0.5 bg-[#DC2626] shadow-[0_0_8px_#DC2626]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

