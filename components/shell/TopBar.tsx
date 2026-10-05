'use client';

import React, { useState } from 'react';
import { UserCheck, IndianRupee, Award, Star, Siren, CalendarDays, Settings, Save, Volume2, VolumeX, LogOut, Map as MapIcon } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import { StatCard, SegmentMeter } from '@/components/ui/primitives';
import { Menu, Tooltip } from '@/components/ui/menus';
import { SaveLoadModal } from '@/components/game/SaveLoadModal';
import { CampaignRoadmapDialog, dayNumber } from './CampaignRoadmap';

const compact = (n: number) =>
  n >= 1e7 ? `${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;

/** Logo + resources + day + settings. Resources are live engine values. */
export function TopBar({ onQuitToTitle }: { onQuitToTitle: () => void }) {
  const { state, dispatch } = useGame();
  const [saveOpen, setSaveOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const m = state.movement;
  const crackdown = state.crackdownLevel ?? 0;
  const soundOn = state.settings.soundEnabled;

  const toggleSound = () => {
    soundManager.setEnabled(!soundOn);
    soundManager.playClick();
    dispatch({ type: 'TOGGLE_SOUND', enabled: !soundOn });
  };

  return (
    <header className="px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3">
        <div className="poster-title -rotate-2 select-none leading-[0.85]">
          <div className="text-2xl sm:text-3xl">Cockroach</div>
          <div className="text-base text-accent sm:text-lg">Janta Party</div>
        </div>

        <div className="grid grid-cols-2 gap-2 max-xl:order-last max-xl:basis-full sm:grid-cols-3 xl:flex-1 xl:grid-cols-6">
          <Tooltip content="People actively working for the movement. Grows with public trust; a share drifts away every day.">
            <div><StatCard icon={UserCheck} label="Volunteers" value={compact(m.volunteerCount)} iconTone="teal" /></div>
          </Tooltip>
          <Tooltip content={`Movement fund. Monthly burn: ₹${m.monthlyBurnRate.toLocaleString('en-IN')}. Two missed payrolls end the campaign.`}>
            <div><StatCard icon={IndianRupee} label="Funds" value={`₹${compact(m.movementFunds)}`} iconTone="success" /></div>
          </Tooltip>
          <Tooltip content="Public trust in the movement. Drives donations, volunteers and votes. Fades if you stop acting.">
            <div><StatCard icon={Award} label="Public Trust" value={`${m.publicTrust}%`} iconTone="pink" /></div>
          </Tooltip>
          <Tooltip content="How seriously the media takes your claims. Raised by corroborated evidence.">
            <div><StatCard icon={Star} label="Credibility" value={`${m.mediaCredibility}%`} iconTone="gold" /></div>
          </Tooltip>
          <Tooltip content={`Police and legal pressure: ${crackdown}%. At 100% your offices are sealed. Legal writs bring it down.`}>
            <div>
              <StatCard icon={Siren} label="Legal Heat" iconTone="saffron">
                <div className="py-1"><SegmentMeter value={crackdown} /></div>
              </StatCard>
            </div>
          </Tooltip>
          <button onClick={() => setRoadmapOpen(true)} className="text-left" aria-label="Open campaign roadmap">
            <StatCard icon={CalendarDays} label={formatDate(state.currentDate)} value={<span className="text-pink">DAY {dayNumber(state.currentDate)}</span>} iconTone="ink" />
          </button>
        </div>

        <Menu
          align="end"
          trigger={
            <button className="chunky-sm pressable ml-auto flex h-12 w-12 items-center justify-center bg-ink text-on-canvas" aria-label="Settings">
              <Settings className="h-6 w-6" strokeWidth={2.5} />
            </button>
          }
          items={[
            { group: 'Game' },
            { label: 'Save / Load', icon: Save, onSelect: () => setSaveOpen(true) },
            { label: 'Campaign roadmap', icon: MapIcon, onSelect: () => setRoadmapOpen(true) },
            'separator',
            { group: 'Options' },
            { label: soundOn ? 'Sound: on' : 'Sound: off', icon: soundOn ? Volume2 : VolumeX, onSelect: toggleSound },
            'separator',
            { label: 'Quit to title', icon: LogOut, danger: true, onSelect: onQuitToTitle },
          ]}
        />
      </div>

      {saveOpen && <SaveLoadModal onClose={() => setSaveOpen(false)} />}
      <CampaignRoadmapDialog open={roadmapOpen} onOpenChange={setRoadmapOpen} />
    </header>
  );
}
