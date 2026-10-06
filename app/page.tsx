'use client';

import React, { useState } from 'react';
import { GameProvider, useGame } from '@/lib/game/context/GameContext';
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
import { StoryEventDialog } from '@/components/game/StoryEventDialog';
import { TooltipProvider } from '@/components/ui/menus';
import { TopBar } from '@/components/shell/TopBar';
import { BottomDock } from '@/components/shell/BottomDock';
import { TitleScreen } from '@/components/shell/TitleScreen';

function GameScreenRouter() {
  const { state } = useGame();

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-5">
      {/* Daily actions and quest; becomes part of the Overview screen in the redesign */}
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
  const [onTitle, setOnTitle] = useState(true);

  if (onTitle) return <TitleScreen onStart={() => setOnTitle(false)} />;

  return (
    <div className="app-backdrop flex min-h-screen flex-col">
      <TopBar onQuitToTitle={() => setOnTitle(true)} />

      {/* Bottom padding clears the fixed dock + End Turn */}
      <main className="flex-1 pb-40 md:pb-32">
        <GameScreenRouter />
      </main>

      <BottomDock />

      <PrologueModal />
      <StoryEventDialog />
      <CrisisModal />
      <RallyMiniGameModal />
      <TVDebateMiniGameModal />
      <GameOverModal />
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <TooltipProvider>
        <GameAppContainer />
      </TooltipProvider>
    </GameProvider>
  );
}
