'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { 
  Users, 
  Droplet, 
  HeartPulse, 
  ShieldAlert, 
  Mic2, 
  Tv, 
  Sun, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  Flame,
  Radio,
  Sparkles,
  Megaphone
} from 'lucide-react';
import Image from 'next/image';

export function JantarMantarScene() {
  const { state, dispatch } = useGame();
  const [selectedStation, setSelectedStation] = useState<'STAGE' | 'WATER' | 'MEDICAL' | 'POLICE' | 'MEDIA' | null>(null);

  const activeOp = state.operations.find(o => o.id === state.activeOperationId) || state.operations[0];

  const handleAction = (choice: 'SUPPLIES' | 'POLICE_TALKS' | 'MEDIA_SPEECH' | 'MEDICAL_AID' | 'MARCH_PARLIAMENT') => {
    if (!activeOp) return;
    soundManager.playGavel();
    dispatch({
      type: 'OPERATION_DECISION',
      operationId: activeOp.id,
      choice,
    });
  };

  if (!activeOp) {
    return (
      <div className="p-12 text-center font-tactical text-xs text-faint bg-surface rounded-xs border border-line">
        No active ground operation in progress. Launch an operation from the Operations bureau.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Set-Piece Header with Black, Red, Yellow Secondary Accents */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-line bg-surface p-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-danger-fg flex items-center gap-1.5 bg-danger-soft px-2 py-0.5 rounded-xs border border-danger-line">
              <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-ping" />
              Active Ground Set-Piece · Day {activeOp.currentDay} of {activeOp.durationDays}
            </span>
            <span className="text-faint">|</span>
            <span className="text-xs font-bold text-fg flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-accent-fg" />
              {activeOp.location}, {activeOp.stateName}
            </span>
          </div>
          <h2 className="font-display text-xl font-bold text-fg mt-1 flex items-center gap-2">
            <span>{activeOp.title}</span>
            <span className="text-[10px] font-mono font-bold bg-[#FACC15] text-black px-1.5 py-0.5 rounded-xs">
              LIVE SECTOR
            </span>
          </h2>
        </div>

        {/* Weather & Permission badges */}
        <div className="flex items-center gap-2 text-xs font-tactical">
          <div className="flex items-center gap-1.5 rounded-xs border border-accent-line bg-accent-soft px-3 py-1 font-bold text-accent-fg">
            <Sun className="h-3.5 w-3.5 text-accent-fg" />
            <span>Heatwave · 41°C</span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-xs border px-3 py-1 font-bold ${
            activeOp.policePermissionStatus === 'GRANTED'
              ? 'border-emerald-600/80 bg-success-soft text-success-fg'
              : 'border-red-600/80 bg-danger-soft text-fg animate-pulse'
          }`}>
            <span className="h-2 w-2 rounded-full bg-current" />
            <span>PERMIT: {activeOp.policePermissionStatus}</span>
          </div>
        </div>
      </div>

      {/* Main Tactical Dials Grid with Black, Red, Yellow Secondary Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-tactical">
        <div className="rounded-xs border-2 border-line bg-surface p-3 shadow-md hover:border-accent transition-colors">
          <div className="flex items-center justify-between text-muted">
            <span className="font-semibold text-[11px]">ASSEMBLED CROWD</span>
            <Users className="h-4 w-4 text-accent-fg" />
          </div>
          <div className="text-xl font-black text-fg mt-1 tabular-nums">
            {activeOp.crowdSize.toLocaleString()}
          </div>
          <div className="text-[10px] text-faint mt-1 font-sans">Students & citizen cadre</div>
        </div>

        <div className="rounded-xs border-2 border-line bg-surface p-3 shadow-md hover:border-[#EF4444] transition-colors">
          <div className="flex items-center justify-between text-muted">
            <span className="font-semibold text-[11px]">CROWD MORALE</span>
            <HeartPulse className="h-4 w-4 text-danger-fg" />
          </div>
          <div className="text-xl font-black text-fg mt-1 tabular-nums flex items-baseline gap-1">
            <span className={activeOp.crowdMorale < 40 ? 'text-danger-fg' : 'text-success-fg'}>{activeOp.crowdMorale}%</span>
            <span className="text-[10px] text-faint font-normal">/ 100</span>
          </div>
          <div className="text-[10px] text-faint mt-1 font-sans">Discipline & stamina</div>
        </div>

        <div className="rounded-xs border-2 border-line bg-surface p-3 shadow-md hover:border-blue-500 transition-colors">
          <div className="flex items-center justify-between text-muted">
            <span className="font-semibold text-[11px]">WATER & FOOD</span>
            <Droplet className="h-4 w-4 text-info-fg" />
          </div>
          <div className={`text-xl font-black mt-1 tabular-nums ${activeOp.suppliesWaterFood < 35 ? 'text-danger-fg animate-pulse' : 'text-info-fg'}`}>
            {activeOp.suppliesWaterFood}%
          </div>
          <div className="text-[10px] text-faint mt-1 font-sans">Hydration tankers</div>
        </div>

        <div className="rounded-xs border-2 border-line bg-surface p-3 shadow-md hover:border-[#EF4444] transition-colors">
          <div className="flex items-center justify-between text-muted">
            <span className="font-semibold text-[11px]">POLICE TENSION</span>
            <ShieldAlert className="h-4 w-4 text-accent-fg" />
          </div>
          <div className={`text-xl font-black mt-1 tabular-nums ${activeOp.policeNegotiationTension > 60 ? 'text-danger-fg' : 'text-accent-fg'}`}>
            {activeOp.policeNegotiationTension}%
          </div>
          <div className="text-[10px] text-faint mt-1 font-sans">Barricade sensitivity</div>
        </div>

        <div className="rounded-xs border-2 border-line bg-surface p-3 col-span-2 sm:col-span-1 shadow-md hover:border-[#EF4444] transition-colors">
          <div className="flex items-center justify-between text-muted">
            <span className="font-semibold text-[11px]">MEDIA SCRUM</span>
            <Tv className="h-4 w-4 text-danger-fg" />
          </div>
          <div className="text-xl font-black text-fg mt-1 tabular-nums text-danger-fg">
            {activeOp.mediaCoverageLevel}%
          </div>
          <div className="text-[10px] text-faint mt-1 font-sans">National live feeds</div>
        </div>
      </div>

      {/* 2D Interactive Illustrated Protest Field Scene */}
      <div className="theme-dark-scope relative h-96 w-full max-sm:flex max-sm:h-auto max-sm:flex-col max-sm:gap-2 max-sm:px-3 max-sm:pb-14 max-sm:pt-16 overflow-hidden rounded-xs border-2 border-line-strong bg-inset shadow-2xl">
        {/* Top Caution Barricade Strip */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between caution-stripes px-3 py-1 font-tactical text-[10px] font-black text-black tracking-wider uppercase">
          <span className="bg-inset text-accent-fg px-1 rounded-xs">DELHI POLICE · PARLIAMENT STREET CORRIDOR</span>
          <span className="hidden sm:inline bg-inset text-fg px-1 rounded-xs">SECTION 144 RESTRICTED ZONE</span>
          <span className="bg-[#DC2626] text-white px-1 rounded-xs">CIVILIAN VIGIL PERMIT #DL-2026-JM</span>
        </div>

        {/* Atmospheric Backdrop Photo with Dramatic Lighting */}
        <Image
          src="/images/hero_cjp_protest_1790774314550.jpg"
          alt="Jantar Mantar Gathering"
          fill
          priority
          className="object-cover opacity-45 filter contrast-125"
          referrerPolicy="no-referrer"
        />

        {/* Ambient Darkened Gradient Overlay with Red/Yellow Warmth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

        {/* Animated Visual Placards Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 max-sm:hidden">
          {/* Animated Slogan Placard 1 */}
          <div className="absolute bottom-16 left-12 animate-bounce duration-1000 bg-inset text-accent-fg border border-accent px-2 py-1 text-[10px] font-tactical font-black rounded-xs shadow-lg transform -rotate-3">
            <span>CLEAN UP INDIA!</span>
          </div>

          {/* Animated Slogan Placard 2 */}
          <div className="absolute bottom-28 left-1/3 bg-[#DC2626] text-white px-2 py-0.5 text-[10px] font-tactical font-black rounded-xs shadow-lg transform rotate-2">
            <span>JUSTICE FOR ASPIRANTS</span>
          </div>

          {/* Animated Slogan Placard 3 */}
          <div className="absolute bottom-20 right-1/3 bg-inset text-fg border border-red-500 px-2 py-0.5 text-[10px] font-tactical font-black rounded-xs shadow-lg transform -rotate-1">
            <span>REPUBLIC: 543</span>
          </div>

          {/* Camera Flashes Effect */}
          <div className="absolute top-1/2 right-1/4 h-3 w-3 bg-white rounded-full animate-ping opacity-75" />
          <div className="absolute top-1/3 right-1/3 h-2 w-2 bg-yellow-300 rounded-full animate-ping opacity-60 delay-300" />
        </div>

        {/* Interactive Tactical Stations (Clickable hot zones) */}
        
        {/* Station 1: The Main Speaker Podium */}
        <button
          onClick={() => {
            soundManager.playMegaphone();
            setSelectedStation('STAGE');
          }}
          className={`absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 p-3 rounded-xs border-2 transition-all z-20 max-sm:static max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:text-left ${
            selectedStation === 'STAGE'
              ? 'border-accent bg-[#DC2626] text-white scale-110 shadow-2xl ring-4 ring-[#FACC15]/50'
              : 'border-line-strong bg-inset text-fg hover:border-accent hover:bg-[#DC2626] hover:scale-105'
          }`}
        >
          <div className="flex items-center gap-1.5 font-tactical text-xs font-black">
            <Mic2 className="h-4 w-4 text-accent-fg" />
            <span>Speaker Podium</span>
          </div>
          <div className="text-[10px] text-fg-2 font-mono mt-0.5">Keynote address</div>
          <div className="flex items-center gap-0.5 mt-1">
            <span className="h-1 w-1.5 bg-[#FACC15] animate-pulse" />
            <span className="h-2 w-1.5 bg-[#FACC15] animate-pulse delay-75" />
            <span className="h-3 w-1.5 bg-[#FACC15] animate-pulse delay-150" />
            <span className="h-1.5 w-1.5 bg-[#FACC15] animate-pulse" />
          </div>
        </button>

        {/* Station 2: Water & Langar Logistics */}
        <button
          onClick={() => {
            soundManager.playClick();
            setSelectedStation('WATER');
          }}
          className={`absolute top-1/3 right-1/4 translate-x-1/2 p-3 rounded-xs border-2 transition-all z-20 max-sm:static max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:text-left ${
            selectedStation === 'WATER'
              ? 'border-accent bg-blue-700 text-white scale-110 shadow-2xl ring-4 ring-blue-500/50'
              : 'border-line-strong bg-inset text-fg hover:border-accent hover:bg-blue-800 hover:scale-105'
          }`}
        >
          <div className="flex items-center gap-1.5 font-tactical text-xs font-black">
            <Droplet className="h-4 w-4 text-info-fg" />
            <span>Water & Langar Tent</span>
          </div>
          <div className="text-[10px] text-fg-2 font-mono mt-0.5">Hydration tankers</div>
        </button>

        {/* Station 3: Medical Aid Camp */}
        <button
          onClick={() => {
            soundManager.playClick();
            setSelectedStation('MEDICAL');
          }}
          className={`absolute bottom-1/4 left-1/5 p-3 rounded-xs border-2 transition-all z-20 max-sm:static max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:text-left ${
            selectedStation === 'MEDICAL'
              ? 'border-accent bg-emerald-800 text-white scale-110 shadow-2xl ring-4 ring-emerald-500/50'
              : 'border-line-strong bg-inset text-fg hover:border-accent hover:bg-success-soft hover:scale-105'
          }`}
        >
          <div className="flex items-center gap-1.5 font-tactical text-xs font-black">
            <HeartPulse className="h-4 w-4 text-danger-fg" />
            <span>Medical Relief Camp</span>
          </div>
          <div className="text-[10px] text-fg-2 font-mono mt-0.5">Heatstroke first aid</div>
        </button>

        {/* Station 4: Police Liaison & Barricades */}
        <button
          onClick={() => {
            soundManager.playClick();
            setSelectedStation('POLICE');
          }}
          className={`absolute top-12 right-6 p-3 rounded-xs border-2 transition-all z-20 max-sm:static max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:text-left ${
            selectedStation === 'POLICE'
              ? 'border-white bg-[#D97706] text-white scale-110 shadow-2xl ring-4 ring-[#FACC15]/50'
              : 'border-accent-line bg-inset text-accent-fg hover:bg-[#D97706] hover:text-white hover:scale-105'
          }`}
        >
          <div className="flex items-center gap-1.5 font-tactical text-xs font-black">
            <ShieldAlert className="h-4 w-4 text-accent-fg" />
            <span>Police Barricade Gate</span>
          </div>
          <div className="text-[10px] text-fg-2 font-mono mt-0.5">Liaison & permits</div>
        </button>

        {/* Station 5: National Media Scrum */}
        <button
          onClick={() => {
            soundManager.playClick();
            setSelectedStation('MEDIA');
          }}
          className={`absolute bottom-1/5 right-1/4 p-3 rounded-xs border-2 transition-all z-20 max-sm:static max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:text-left ${
            selectedStation === 'MEDIA'
              ? 'border-accent bg-inset text-fg scale-110 shadow-2xl ring-4 ring-[#DC2626]/50'
              : 'border-red-500/80 bg-inset text-fg hover:border-[#DC2626] hover:bg-[#DC2626] hover:scale-105'
          }`}
        >
          <div className="flex items-center gap-1.5 font-tactical text-xs font-black">
            <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-ping" />
            <Tv className="h-4 w-4 text-accent-fg" />
            <span>Live Press Enclosure</span>
          </div>
          <div className="text-[10px] text-fg-2 font-mono mt-0.5">National broadcast</div>
        </button>

        {/* Scene Footer Tag in Black & Yellow */}
        <div className="absolute bottom-2 left-3 text-[11px] font-tactical text-accent-fg font-black bg-inset px-3 py-1 rounded-xs border border-[#FACC15]/60 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#FACC15] animate-ping" />
          <span>INTERACTIVE STATIONS · CLICK ANY STATION TO ISSUE ORDERS</span>
        </div>
      </div>

      {/* Station Control Panel & Action Execution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Selected Station Actions */}
        <div className="md:col-span-2 rounded-xs border-2 border-line bg-surface p-4 shadow-md">
          <div className="flex items-center justify-between border-b-2 border-line pb-2 mb-3">
            <h3 className="font-tactical text-xs font-black text-fg flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-[#DC2626]" />
              {selectedStation === 'STAGE' && 'SPEAKER STAGE & PODIUM MANAGEMENT'}
              {selectedStation === 'WATER' && 'WATER LOGISTICS & LANGAR MANAGEMENT'}
              {selectedStation === 'MEDICAL' && 'EMERGENCY FIRST AID & VOLUNTEER MEDICS'}
              {selectedStation === 'POLICE' && 'POLICE & ADMINISTRATIVE NEGOTIATIONS'}
              {selectedStation === 'MEDIA' && 'PRESS CORPS & NATIONAL BROADCAST'}
              {!selectedStation && 'SELECT A FIELD STATION ABOVE'}
            </h3>
            <span className="stamp-yellow text-[10px]">
              IMMEDIATE DIRECTIVE
            </span>
          </div>

          {selectedStation === 'STAGE' && (
            <div className="space-y-3 text-xs">
              <p className="text-fg-2 leading-relaxed font-sans">
                The microphone is your most potent instrument. Speak clearly to the gathered students, address the coaching syndicate corruption, and demand strict implementation of public examination protections.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={() => handleAction('MEDIA_SPEECH')}
                  className="rounded-xs bg-[#DC2626] border-2 border-red-500 px-4 py-2 font-tactical font-black text-white hover:bg-red-700 transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Megaphone className="h-3.5 w-3.5 text-accent-fg" />
                  <span>Deliver Fiery Keynote Address (+Media, +Trust)</span>
                </button>
                <button
                  onClick={() => handleAction('MARCH_PARLIAMENT')}
                  className="rounded-xs border-2 border-accent bg-inset px-4 py-2 font-tactical font-black text-accent-fg hover:bg-[#FACC15] hover:text-black transition-colors shadow-md flex items-center gap-1.5"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-danger-fg" />
                  <span>Authorize March to Sansad Marg (High Risk)</span>
                </button>
              </div>
            </div>
          )}

          {selectedStation === 'WATER' && (
            <div className="space-y-3 text-xs">
              <p className="text-fg-2 leading-relaxed font-sans">
                With Delhi temperatures reaching 41°C, water scarcity is dangerous. If tankers run dry, students faint and panic ensues. Costs ₹15,000 from movement funds.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  disabled={state.movement.movementFunds < 15000}
                  onClick={() => handleAction('SUPPLIES')}
                  className={`rounded-xs border-2 px-4 py-2 font-tactical font-bold transition-colors shadow-xs ${
                    state.movement.movementFunds >= 15000
                      ? 'bg-blue-600 border-blue-400 text-white hover:bg-blue-700'
                      : 'bg-line-strong border-line-strong text-faint cursor-not-allowed'
                  }`}
                >
                  Order 4 Fresh Water Tankers & ORS (-₹15,000)
                </button>
              </div>
            </div>
          )}

          {selectedStation === 'MEDICAL' && (
            <div className="space-y-3 text-xs">
              <p className="text-fg-2 leading-relaxed font-sans">
                Volunteer doctors and nursing students have treated 48 cases of dehydration. Setting up a dedicated shade canopy with saline drips prevents hospital evacuations.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  disabled={state.movement.movementFunds < 10000}
                  onClick={() => handleAction('MEDICAL_AID')}
                  className={`rounded-xs border-2 px-4 py-2 font-tactical font-bold transition-colors shadow-xs ${
                    state.movement.movementFunds >= 10000
                      ? 'bg-emerald-700 border-emerald-500 text-white hover:bg-emerald-800'
                      : 'bg-line-strong border-line-strong text-faint cursor-not-allowed'
                  }`}
                >
                  Fund Mobile Heatstroke Saline Ward (-₹10,000)
                </button>
              </div>
            </div>
          )}

          {selectedStation === 'POLICE' && (
            <div className="space-y-3 text-xs">
              <p className="text-fg-2 leading-relaxed font-sans">
                Delhi Police officers have set up triple-tier iron barricades at Tolstoy Marg. Advocate Meera Tandon can present our approved permission copy to prevent sudden Section 144 lathi-charges.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleAction('POLICE_TALKS')}
                  className="rounded-xs bg-inset border-2 border-accent px-4 py-2 font-tactical font-black text-accent-fg hover:bg-[#FACC15] hover:text-black transition-colors shadow-xs"
                >
                  Send Legal Delegation to ACP Office (-25% Tension)
                </button>
              </div>
            </div>
          )}

          {selectedStation === 'MEDIA' && (
            <div className="space-y-3 text-xs">
              <p className="text-fg-2 leading-relaxed font-sans">
                Camera crews from Hindi and English national news channels are recording live. Frame our struggle strictly around accountability, transparent audits, and youth justice.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleAction('MEDIA_SPEECH')}
                  className="rounded-xs bg-[#DC2626] border-2 border-red-500 px-4 py-2 font-tactical font-black text-white hover:bg-red-700 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Tv className="h-3.5 w-3.5 text-accent-fg" />
                  <span>Release Official 5-Point Charter to Press (+Media)</span>
                </button>
              </div>
            </div>
          )}

          {!selectedStation && (
            <div className="py-8 text-center text-xs text-muted font-tactical">
              Select the Speaker Podium, Water Tent, Medical Bed, Police Gate, or Media Enclosure on the field above to dispatch organizers and manage operations.
            </div>
          )}
        </div>

        {/* Operational Daily Log styled like an intelligence dispatch in black, red, yellow */}
        <div className="rounded-xs border-2 border-line bg-surface p-4 text-xs shadow-md">
          <div className="flex items-center justify-between border-b-2 border-line pb-2 mb-2.5">
            <h3 className="font-tactical font-black text-fg flex items-center gap-1.5">
              <span className="stamp-red text-[10px]">CABLE</span>
              <span>FIELD SITREP</span>
            </h3>
            <span className="text-[10px] font-tactical font-black text-accent-fg">EYES ONLY</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {activeOp.dailyLog.slice().reverse().map((entry, idx) => (
              <div key={idx} className="border-l-2 border-[#DC2626] pl-2.5 py-1 text-[11px] text-fg leading-relaxed bg-inset rounded-r-xs">
                {entry}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
