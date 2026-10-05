'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { StateData, LokSabhaConstituency } from '@/lib/game/types';
import { 
  MapPin, 
  Search, 
  Filter, 
  Users, 
  Shield, 
  CheckCircle, 
  ChevronRight, 
  Flame, 
  Compass, 
  Award,
  Zap,
  TrendingUp,
  AlertOctagon
} from 'lucide-react';

export function IndiaMapView() {
  const { state, dispatch } = useGame();
  const [selectedStateCode, setSelectedStateCode] = useState<string>('DL');
  const [filterMood, setFilterMood] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  const currentState = state.states.find(s => s.code === selectedStateCode) || state.states[0];
  const stateConstituencies = state.constituencies.filter(c => c.state === currentState.name);

  // Zonal classification for India's 543 map
  const zoneMap: Record<string, string[]> = {
    NORTH: ['DL', 'UP', 'PB', 'HR', 'RJ', 'UK', 'HP', 'JK', 'LA', 'CH'],
    SOUTH: ['KA', 'TN', 'AP', 'TG', 'KL', 'PY', 'LD'],
    EAST: ['WB', 'BR', 'JH', 'OD', 'AN'],
    WEST: ['MH', 'GJ', 'GA', 'DN'],
    CENTRAL: ['MP', 'CG'],
    NORTHEAST: ['AS', 'TR', 'MN', 'ML', 'NL', 'MZ', 'AR', 'SK'],
  };

  const filteredStates = state.states.filter(st => {
    if (selectedZone !== 'ALL') {
      const allowedCodes = zoneMap[selectedZone] || [];
      if (!allowedCodes.includes(st.code)) return false;
    }
    if (filterMood !== 'ALL' && st.regionalMood !== filterMood) return false;
    if (searchQuery.trim() && !st.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSelectState = (code: string) => {
    soundManager.playClick();
    setSelectedStateCode(code);
  };

  const handleBoostConstituency = (conId: number | string) => {
    if (state.movement.movementFunds < 5000) return;
    soundManager.playClick();
    // Simulate tactical boost
    dispatch({
      type: 'LOG_JOURNAL',
      entry: {
        id: `BOOST-${conId}-${state.journal.length + 1}`,
        date: state.currentDate,
        title: `Grassroots Blitz in ${currentState.name}`,
        text: `Dispatched volunteer flyers and audio van to constituency #${conId}. Citizen awareness elevated.`,
        significance: 'MINOR',
        associatedScreen: 'MAP_543',
      },
    });
  };

  const totalVolunteers = state.states.reduce((acc, s) => acc + s.volunteerStrength, 0);
  const activeChapters = state.states.filter(s => s.cjpChapterLevel > 0).length;

  return (
    <div className="space-y-4">
      
      {/* 543 Strategic Overview Banner with Black, Red, Yellow Secondary Theme */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-zinc-800 bg-[#0E1320] p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5 bg-red-950/40 px-2 py-0.5 rounded-xs border border-red-900/60">
              <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-ping" />
              THE 543 SEAT GEOGRAPHY OF THE REPUBLIC
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs text-zinc-300 font-mono">28 States · 8 UTs · 543 Lok Sabha Seats</span>
          </div>
          <h2 className="font-tactical text-xl font-black text-white mt-1 flex items-center gap-2">
            <span>National Constituency Intelligence</span>
            <span className="text-[10px] font-mono font-bold bg-[#FACC15] text-black px-2 py-0.5 rounded-xs">
              MAJORITY: 272 SEATS
            </span>
          </h2>
        </div>

        {/* National Stats Badges */}
        <div className="flex items-center gap-3 text-xs font-tactical">
          <div className="rounded-xs border border-zinc-700 bg-black/70 px-3 py-1.5">
            <span className="text-zinc-400">ACTIVE CHAPTERS: </span>
            <span className="font-bold text-[#FACC15] tabular-nums">
              {activeChapters} / 36
            </span>
          </div>
          <div className="rounded-xs border border-red-800/80 bg-red-950/40 px-3 py-1.5">
            <span className="text-zinc-400">VOLUNTEER CADRE: </span>
            <span className="font-bold text-[#EF4444] tabular-nums">
              {totalVolunteers.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 272 Majority Progress Gauge with Yellow Hazard Line */}
      <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-3 text-xs font-tactical shadow-md">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#FACC15]" />
            <span className="font-bold text-white tracking-wider">ROAD TO 272 MAJORITY SEATS</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span>0</span>
            <span className="text-[#FACC15] font-black">272 MAJORITY MARK</span>
            <span>543</span>
          </div>
        </div>
        
        {/* Progress Bar with Majority Pointer */}
        <div className="relative h-4 w-full bg-zinc-950 rounded-xs overflow-hidden border border-zinc-700">
          {/* Halfway mark indicator (272 / 543 ≈ 50.09%) */}
          <div className="absolute top-0 bottom-0 left-[50.09%] w-1 bg-[#FACC15] z-10 shadow-[0_0_8px_#FACC15]" />
          
          {/* Active movement footprint progress */}
          <div 
            className="h-full bg-gradient-to-r from-[#DC2626] to-[#FACC15] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, (activeChapters / 36) * 45))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1 font-mono">
          <span>Active Ground Chapters: {activeChapters} Regions Prepared</span>
          <span className="text-[#FACC15]">⚡ High impact in Delhi, Uttar Pradesh, Bihar, Maharashtra</span>
        </div>
      </div>

      {/* Regional Zone Selector & Search Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-tactical">
        
        {/* Regional Zones */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {['ALL', 'NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL', 'NORTHEAST'].map(zone => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1 rounded-xs border transition-all whitespace-nowrap font-bold ${
                selectedZone === zone
                  ? 'border-[#DC2626] bg-[#DC2626] text-white shadow-xs'
                  : 'border-zinc-800 bg-[#121622] text-zinc-400 hover:text-white hover:border-[#FACC15]'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search state / UT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xs border border-zinc-700 bg-black text-xs font-tactical text-zinc-100 placeholder-zinc-500 w-52 focus:outline-none focus:border-[#FACC15]"
          />
        </div>
      </div>

      {/* Main Grid: State Matrix + Selected State Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Interactive State Matrix (5 cols) */}
        <div className="lg:col-span-5 rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-3 text-xs max-h-[600px] overflow-y-auto shadow-md">
          <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2 mb-2 font-tactical font-black text-zinc-400">
            <span>STATE / UNION TERRITORY</span>
            <div className="flex items-center gap-4">
              <span>MOOD</span>
              <span>SEATS</span>
            </div>
          </div>

          <div className="space-y-1">
            {filteredStates.map((st) => {
              const isSelected = st.code === selectedStateCode;
              return (
                <button
                  key={st.code}
                  onClick={() => handleSelectState(st.code)}
                  className={`w-full text-left p-2.5 rounded-xs border transition-all flex items-center justify-between font-tactical ${
                    isSelected
                      ? 'border-[#FACC15] bg-black text-white font-extrabold shadow-md ring-1 ring-[#FACC15]/40'
                      : 'border-zinc-900 bg-[#121624]/60 text-zinc-300 hover:border-zinc-700 hover:bg-[#181F30]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      st.cjpChapterLevel === 3 ? 'bg-[#DC2626] animate-pulse' :
                      st.cjpChapterLevel === 2 ? 'bg-[#FACC15]' :
                      st.cjpChapterLevel === 1 ? 'bg-blue-500' : 'bg-zinc-700'
                    }`} />
                    <span className={isSelected ? 'text-[#FACC15]' : 'text-zinc-200'}>{st.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs ${
                      st.regionalMood === 'REFORM_RECEPTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      st.regionalMood === 'ANTI_INCUMBENCY' ? 'bg-red-950 text-[#EF4444] border border-red-800' :
                      st.regionalMood === 'VOLATILE' ? 'bg-yellow-950 text-[#FACC15] border border-yellow-800' : 
                      'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {st.regionalMood.replace('_', ' ')}
                    </span>
                    <span className="w-6 text-right tabular-nums font-black text-white">
                      {st.seatsTotal}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected State Intelligence & Constituencies (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* State Dossier Card with Black, Red, Yellow Secondary Highlights */}
          <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs space-y-3 shadow-md">
            <div className="flex items-start justify-between border-b-2 border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-tactical text-lg font-black text-white">{currentState.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-black border border-zinc-700 text-[#FACC15]">
                    {currentState.type} · Capital: {currentState.capital}
                  </span>
                </div>
                <p className="text-[11px] font-tactical text-zinc-400 mt-1">
                  Lok Sabha Constituencies: <span className="text-white font-bold">{currentState.seatsTotal} seats</span> · Regional Mood: <span className="text-[#EF4444] font-bold">{currentState.regionalMood.replace(/_/g, ' ')}</span>
                </p>
              </div>

              <div className="text-right font-tactical">
                <span className="text-[10px] text-zinc-500">CIVIC FOOTPRINT:</span>
                <div className="text-xs font-black text-[#FACC15]">
                  {currentState.cjpChapterLevel === 3 ? '★ Mass Movement Active' :
                   currentState.cjpChapterLevel === 2 ? '◆ District Units Running' :
                   currentState.cjpChapterLevel === 1 ? '● Volunteer Working Group' : '○ Exploratory Stage'}
                </div>
              </div>
            </div>

            {/* Dominant Local Grievances */}
            <div>
              <span className="font-tactical text-[11px] font-bold text-zinc-400 block mb-1.5">
                DOMINANT REGIONAL ISSUES & CONCERNS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentState.dominantIssues.map((issue, idx) => (
                  <span key={idx} className="rounded-xs border border-zinc-700 bg-black/80 px-2 py-1 text-[11px] text-zinc-300">
                    <span className="text-[#DC2626] font-bold mr-1">#</span>
                    {issue}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Leaders / Contacts */}
            <div className="flex items-center justify-between border-t border-zinc-800 pt-2.5 font-tactical text-[11px]">
              <div>
                <span className="text-zinc-500">LEAD CONTACTS: </span>
                <span className="text-zinc-200 font-bold">{currentState.keyLeaders.join(', ')}</span>
              </div>
              <div className="bg-black/60 px-2 py-0.5 rounded-xs border border-zinc-800">
                <span className="text-zinc-500">ACTIVE VOLUNTEERS: </span>
                <span className="font-black text-[#FACC15] tabular-nums">{currentState.volunteerStrength.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Constituencies Breakdown in State */}
          <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs shadow-md">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2 mb-3">
              <h4 className="font-tactical font-black text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#DC2626]" />
                <span>LOK SABHA CONSTITUENCIES ({stateConstituencies.length} SEATS)</span>
              </h4>
              <span className="font-tactical text-[11px] text-zinc-400">
                Support Index & Margins
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {stateConstituencies.map((con) => (
                <div
                  key={con.id}
                  className="rounded-xs border border-zinc-800 bg-[#121624] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-tactical hover:border-zinc-600 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{con.name}</span>
                      <span className="text-[10px] text-zinc-400">({con.category})</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Incumbent: <span className="text-zinc-200 font-semibold">{con.incumbentParty}</span> · Est. Voters: {(con.totalVotersEstimated / 100000).toFixed(1)} Lakhs
                    </div>
                    {con.cjpCandidate && (
                      <div className="text-[11px] text-[#FACC15] font-bold mt-1">
                        CJP Nominee: {con.cjpCandidate.name} (Funded: ₹{con.cjpCandidate.campaignFundingAllocated.toLocaleString('en-IN')})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:text-right w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-zinc-800 pt-1.5 sm:pt-0">
                    <div>
                      <div className="text-[10px] text-zinc-500">CJP SUPPORT</div>
                      <div className="text-base font-black text-[#FACC15] tabular-nums">{con.cjpSupportScore}%</div>
                      <div className="text-[10px] text-zinc-500">
                        Ruling {con.rulingVoteShareBaseline}% · Opp {con.mainOppVoteShareBaseline}%
                      </div>
                    </div>

                    <button
                      onClick={() => handleBoostConstituency(con.id)}
                      title="Dispatch volunteer brigade and informational pamphlets"
                      className="px-2.5 py-1.5 rounded-xs bg-[#DC2626] hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors shadow-xs"
                    >
                      Campaign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
