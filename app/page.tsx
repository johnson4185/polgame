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
    <div className="border-b border-line bg-inset">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-1.5 font-tactical text-xs sm:px-4">
        <span className="flex shrink-0 items-center gap-1.5 rounded-xs bg-[#DC2626] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
          <Radio className="h-3 w-3" aria-hidden="true" />
          Wire
        </span>
        <p className="min-w-0 truncate">
          <span className="font-bold text-accent-fg">{latestArticle?.sourceName || 'PTI / ANI'}:</span>{' '}
          <span className="text-fg-2">{latestArticle?.headline || 'Students assemble at Jantar Mantar demanding transparency in central testing agencies.'}</span>
        </p>
        <span className="ml-auto hidden shrink-0 text-[11px] text-muted md:inline">
          543 seats · <span className="font-bold text-accent-fg">272 for majority</span>
        </span>
      </div>
    </div>
  );
}

function GameScreenRouter() {
  const { state } = useGame();

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
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
    <div className={`app-backdrop min-h-screen flex flex-col transition-colors duration-200 selection:bg-[#DC2626] selection:text-white ${isLight ? 'theme-light' : ''}`}>
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
      <footer className="border-t border-line bg-surface px-4 py-3 font-tactical text-[11px] text-muted">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1.5 text-center sm:flex-row sm:text-left">
          <span>
            <span className="font-display font-bold text-fg">REPUBLIC <span className="text-danger-fg">543</span></span>
            <span className="hidden md:inline"> · Citizen resistance &amp; electoral strategy</span>
          </span>
          <span>History cutoff 30 Sept 2026 · Personal dialogues dramatized</span>
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

