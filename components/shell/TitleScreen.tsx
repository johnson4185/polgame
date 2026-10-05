'use client';

import React, { useSyncExternalStore } from 'react';
import { Play, Save, Settings, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Button } from '@/components/ui/primitives';
import { Menu } from '@/components/ui/menus';

const AUTOSAVE_KEY = 'republic543_autosave';

function useHasAutosave() {
  return useSyncExternalStore(
    cb => {
      window.addEventListener('storage', cb);
      return () => window.removeEventListener('storage', cb);
    },
    () => {
      try {
        return !!localStorage.getItem(AUTOSAVE_KEY);
      } catch {
        return false;
      }
    },
    () => false,
  );
}

const SLOGANS = ['Degree hua hai, kya karein?', 'Jobs kab?', 'Rozgaar nahi to kya hua, zinda to hai!', 'Kaam nahi, aandolan karenge'];

/** Full-screen title: New Campaign / Continue / Settings */
export function TitleScreen({ onStart }: { onStart: () => void }) {
  const { state, dispatch, startNewGame } = useGame();
  const hasSave = useHasAutosave();
  const soundOn = state.settings.soundEnabled;

  const newCampaign = () => {
    soundManager.playChime();
    startNewGame('ABHIJEET_CJP');
    onStart();
  };
  const continueGame = () => {
    soundManager.playClick();
    onStart();
  };

  return (
    <div className="app-backdrop fixed inset-0 z-[60] overflow-y-auto">
      {/* Key art slot: cockroach mascot with tricolour over Jantar Mantar at sunset (illustration pending) */}

      {/* Floating placards */}
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden="true">
        {SLOGANS.map((s, i) => (
          <div
            key={s}
            className="chunky-sm absolute max-w-44 bg-surface px-3 py-2 text-center font-hand text-lg font-bold leading-tight text-ink"
            style={{
              left: i % 2 === 0 ? `${6 + i * 3}%` : undefined,
              right: i % 2 === 1 ? `${5 + i * 2}%` : undefined,
              top: `${18 + i * 17}%`,
              transform: `rotate(${i % 2 === 0 ? -8 : 7}deg)`,
            }}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-10 text-center">
        <div className="-rotate-3">
          <h1 className="poster-title text-6xl leading-[0.85] sm:text-8xl [text-shadow:5px_5px_0_var(--pink)]">Cockroach</h1>
          <div className="mt-2 inline-block rotate-1 rounded-xl border-3 border-ink bg-brand px-4 py-1 font-display text-2xl text-brand-ink shadow-[4px_4px_0_var(--ink)] sm:text-4xl">
            Janta Party
          </div>
          <p className="mt-4 inline-block rounded-lg border-2 border-ink bg-accent px-3 py-0.5 font-hand text-lg font-bold text-ink sm:text-xl">
            Voice of the Lazy &amp; Unemployed
          </p>
        </div>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-4">
          <Button size="lg" icon={Play} onClick={newCampaign}>
            New Campaign
          </Button>
          <Button size="lg" variant="secondary" icon={Save} onClick={continueGame} disabled={!hasSave}>
            Continue
          </Button>
          <Menu
            align="center"
            trigger={
              <Button size="lg" variant="secondary" icon={Settings}>
                Settings
              </Button>
            }
            items={[
              {
                label: soundOn ? 'Sound: on' : 'Sound: off',
                icon: soundOn ? Volume2 : VolumeX,
                onSelect: () => {
                  soundManager.setEnabled(!soundOn);
                  dispatch({ type: 'TOGGLE_SOUND', enabled: !soundOn });
                },
              },
            ]}
          />
        </div>
        <p className="mt-8 text-sm font-semibold text-on-canvas-muted">REPUBLIC: 543 · A political satire</p>
      </div>
    </div>
  );
}
