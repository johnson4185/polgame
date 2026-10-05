'use client';

import React from 'react';
import { GameProvider, useGame } from '@/lib/game/context/GameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { ScreenNav } from '@/components/game/ScreenNav';
import { PrologueModal } from '@/components/game/PrologueModal';

import { JantarMantarScene } from '@/components/game/JantarMantarScene';
import { PersonalLifeView } from '@/components/game/PersonalLifeView';
import { IndiaMapView } from '@/components/game/IndiaMapView';
import { PeopleRosterView } from '@/components/game/PeopleRosterView';
import { EvidenceBoardView } from '@/components/game/EvidenceBoardView';
import { FinanceLedgerView } from '@/components/game/FinanceLedgerView';
import { PartyECIView } from '@/components/game/PartyECIView';
import { ElectionNightView } from '@/components/game/ElectionNightView';
import { GovernanceView } from '@/components/game/GovernanceView';
import { HistoricalArchiveView } from '@/components/game/HistoricalArchiveView';
import { JournalEndingsView } from '@/components/game/JournalEndingsView';
import { GameActionHUD } from '@/components/game/GameActionHUD';
import { CrisisModal } from '@/components/game/CrisisModal';
import { RallyMiniGameModal } from '@/components/game/RallyMiniGameModal';
import { TVDebateMiniGameModal } from '@/components/game/TVDebateMiniGameModal';
import { GameOverModal } from '@/components/game/GameOverModal';
import { Radio, ShieldAlert } from 'lucide-react';

function LiveNewsTicker() {
  const { state } = useGame();
  const latestArticle = state.newsFeed?.[0];

  return (
    <div className="border-b border-zinc-800 bg-[#0C0F17] px-3 py-1.5 text-xs font-tactical flex items-center gap-3 overflow-hidden">
      <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-xs bg-[#DC2626] text-white font-black text-[10px] uppercase tracking-wider animate-pulse">
        <Radio className="h-3 w-3" />
        <span>FLASH WIRE</span>
      </div>
      <div className="truncate text-zinc-300 font-mono text-xs flex items-center gap-2">
        <span className="text-[#FACC15] font-bold">[{latestArticle?.sourceName || 'PTI / ANI'}]</span>
        <span className="text-zinc-100">{latestArticle?.headline || 'Students assemble at Jantar Mantar demanding transparency in central testing agencies.'}</span>
      </div>
      <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto text-[11px] text-zinc-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-zinc-300">543 SEATS ACTIVE</span>
        <span className="text-zinc-600">|</span>
        <span className="text-[#FACC15] font-bold">MAJORITY: 272</span>
      </div>
    </div>
  );
}

function GameScreenRouter() {
  const { state } = useGame();

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 py-4">
      {/* Interactive Turn-Based Game Action & Quest HUD */}
      <GameActionHUD />

      {state.activeScreen === 'OPERATIONS' && <JantarMantarScene />}
      {state.activeScreen === 'PERSONAL' && <PersonalLifeView />}
      {state.activeScreen === 'MAP_543' && <IndiaMapView />}
      {state.activeScreen === 'PEOPLE' && <PeopleRosterView />}
      {state.activeScreen === 'EVIDENCE' && <EvidenceBoardView />}
      {state.activeScreen === 'FINANCE' && <FinanceLedgerView />}
      {state.activeScreen === 'PARTY_ECI' && <PartyECIView />}
      {state.activeScreen === 'ELECTION_NIGHT' && <ElectionNightView />}
      {state.activeScreen === 'GOVERNMENT' && <GovernanceView />}
      {state.activeScreen === 'ARCHIVE' && <HistoricalArchiveView />}
      {state.activeScreen === 'JOURNAL' && <JournalEndingsView />}
    </div>
  );
}

function GameAppContainer() {
  const { state } = useGame();
  const isLight = state.settings.theme === 'LIGHT';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isLight 
        ? 'theme-light bg-[#F8F9FA] text-slate-900 selection:bg-[#DC2626] selection:text-white' 
        : 'theme-dark bg-[#080B11] text-zinc-100 selection:bg-[#DC2626] selection:text-white'
    }`}>
      {/* Top Header */}
      <GameHeader />

      {/* Live News Ticker */}
      <LiveNewsTicker />

      {/* Tab Navigation */}
      <ScreenNav />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        <GameScreenRouter />
      </main>

      {/* Playable Prologue Dialog on initial load */}
      <PrologueModal />

      {/* Suzerain-Style Interactive Crisis Modal */}
      <CrisisModal />

      {/* Playable Megaphone Ground Rally Mini-Game */}
      <RallyMiniGameModal />

      {/* Playable Prime-Time TV News Debate Mini-Game */}
      <TVDebateMiniGameModal />

      {/* Campaign ending (victory or defeat) */}
      <GameOverModal />

      {/* Tactical War Room / Editorial Footer */}
      <footer className={`border-t-2 px-4 py-3 text-xs font-tactical transition-colors ${
        isLight ? 'border-zinc-300 bg-white text-zinc-600' : 'border-zinc-800 bg-[#0A0D15] text-zinc-400'
      }`}>
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className={`font-extrabold tracking-wider ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              REPUBLIC: <span className="text-[#DC2626]">543</span>
            </span>
            <span className="stamp-red text-[10px]">POLITICAL SIMULATION</span>
            <span className="hidden md:inline text-zinc-500">·</span>
            <span className="hidden md:inline">Citizen Resistance &amp; Electoral Strategy</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-zinc-500">HISTORY CUTOFF:</span>
            <span className="text-[#DC2626] font-bold">30 SEPT 2026</span>
            <span className="text-zinc-400">|</span>
            <span>Values &amp; Personal Dialogues Dramatized</span>
          </div>
        </div>
      </footer>

      {/* Bottom Caution Stripes Accent */}
      <div className="h-1.5 w-full caution-stripes" />
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <GameAppContainer />
    </GameProvider>
  );
}

