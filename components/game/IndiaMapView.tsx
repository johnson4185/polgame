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

  const handleBoostConstituency = (conId: number) => {
    soundManager.playClick();
    dispatch({ type: 'BOOST_CONSTITUENCY', constituencyId: conId });
  };

  const totalVolunteers = state.states.reduce((acc, s) => acc + s.volunteerStrength, 0);
  const activeChapters = state.states.filter(s => s.cjpChapterLevel > 0).length;

  return (
    <div className="space-y-4">
      
      {/* 543 Strategic Overview Banner with Black, Red, Yellow Secondary Theme */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-line bg-surface p-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-danger-fg flex items-center gap-1.5 bg-danger-soft px-2 py-0.5 rounded-xs border border-danger-line">
              <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-ping" />
              THE 543 SEAT GEOGRAPHY OF THE REPUBLIC
            </span>
            <span className="text-faint">|</span>
            <span className="text-xs text-fg-2 font-mono">28 States · 8 UTs · 543 Lok Sabha Seats</span>
          </div>
          <h2 className="font-display text-xl font-bold text-fg mt-1 flex items-center gap-2">
            <span>National Constituency Intelligence</span>
            <span className="text-[10px] font-mono font-bold bg-[#FACC15] text-black px-2 py-0.5 rounded-xs">
              MAJORITY: 272 SEATS
            </span>
          </h2>
        </div>

        {/* National Stats Badges */}
        <div className="flex items-center gap-3 text-xs font-tactical">
          <div className="rounded-xs border border-line-strong bg-inset px-3 py-1.5">
            <span className="text-muted">ACTIVE CHAPTERS: </span>
            <span className="font-bold text-accent-fg tabular-nums">
              {activeChapters} / 36
            </span>
          </div>
          <div className="rounded-xs border border-danger-line bg-danger-soft px-3 py-1.5">
            <span className="text-muted">VOLUNTEER CADRE: </span>
            <span className="font-bold text-danger-fg tabular-nums">
              {totalVolunteers.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 272 Majority Progress Gauge with Yellow Hazard Line */}
      <div className="rounded-xs border-2 border-line bg-surface p-3 text-xs font-tactical shadow-md">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <TrendingUp className="h-4 w-4 text-accent-fg" />
            <span className="font-bold text-fg tracking-wider">ROAD TO 272 MAJORITY SEATS</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted">
            <span>0</span>
            <span className="text-accent-fg font-black">272 MAJORITY MARK</span>
            <span>543</span>
          </div>
        </div>
        
        {/* Progress Bar with Majority Pointer */}
        <div className="relative h-4 w-full bg-raised rounded-xs overflow-hidden border border-line-strong">
          {/* Halfway mark indicator (272 / 543 ≈ 50.09%) */}
          <div className="absolute top-0 bottom-0 left-[50.09%] w-1 bg-[#FACC15] z-10 shadow-[0_0_8px_#FACC15]" />
          
          {/* Active movement footprint progress */}
          <div 
            className="h-full bg-gradient-to-r from-[#DC2626] to-[#FACC15] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, (activeChapters / 36) * 45))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted mt-1 font-mono">
          <span>Active Ground Chapters: {activeChapters} Regions Prepared</span>
          <span className="text-accent-fg">⚡ High impact in Delhi, Uttar Pradesh, Bihar, Maharashtra</span>
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
                  : 'border-line bg-raised text-muted hover:text-fg hover:border-accent'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-faint absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search state / UT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xs border border-line-strong bg-inset text-xs font-tactical text-fg placeholder-faint w-52 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Main Grid: State Matrix + Selected State Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Interactive State Matrix (5 cols) */}
        <div className="lg:col-span-5 rounded-xs border-2 border-line bg-surface p-3 text-xs max-h-[600px] overflow-y-auto shadow-md">
          <div className="flex items-center justify-between border-b-2 border-line pb-2 mb-2 font-tactical font-black text-muted">
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
                      ? 'border-accent bg-inset text-fg font-extrabold shadow-md ring-1 ring-[#FACC15]/40'
                      : 'border-line bg-raised text-fg-2 hover:border-line-strong hover:bg-raised'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      st.cjpChapterLevel === 3 ? 'bg-[#DC2626] animate-pulse' :
                      st.cjpChapterLevel === 2 ? 'bg-[#FACC15]' :
                      st.cjpChapterLevel === 1 ? 'bg-blue-500' : 'bg-line-strong'
                    }`} />
                    <span className={isSelected ? 'text-accent-fg' : 'text-fg'}>{st.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs ${
                      st.regionalMood === 'REFORM_RECEPTIVE' ? 'bg-success-soft text-success-fg border border-success-line' :
                      st.regionalMood === 'ANTI_INCUMBENCY' ? 'bg-danger-soft text-danger-fg border border-danger-line' :
                      st.regionalMood === 'VOLATILE' ? 'bg-accent-soft text-accent-fg border border-accent-line' : 
                      'bg-raised text-muted border border-line'
                    }`}>
                      {st.regionalMood.replace('_', ' ')}
                    </span>
                    <span className="w-6 text-right tabular-nums font-black text-fg">
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
          <div className="rounded-xs border-2 border-line bg-surface p-4 text-xs space-y-3 shadow-md">
            <div className="flex items-start justify-between border-b-2 border-line pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="font-display text-lg font-bold text-fg">{currentState.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-inset border border-line-strong text-accent-fg">
                    {currentState.type} · Capital: {currentState.capital}
                  </span>
                </div>
                <p className="text-[11px] font-tactical text-muted mt-1">
                  Lok Sabha Constituencies: <span className="text-fg font-bold">{currentState.seatsTotal} seats</span> · Regional Mood: <span className="text-danger-fg font-bold">{currentState.regionalMood.replace(/_/g, ' ')}</span>
                </p>
              </div>

              <div className="text-right font-tactical">
                <span className="text-[10px] text-faint">CIVIC FOOTPRINT:</span>
                <div className="text-xs font-black text-accent-fg">
                  {currentState.cjpChapterLevel === 3 ? '★ Mass Movement Active' :
                   currentState.cjpChapterLevel === 2 ? '◆ District Units Running' :
                   currentState.cjpChapterLevel === 1 ? '● Volunteer Working Group' : '○ Exploratory Stage'}
                </div>
              </div>
            </div>

            {/* Dominant Local Grievances */}
            <div>
              <span className="font-tactical text-[11px] font-bold text-muted block mb-1.5">
                DOMINANT REGIONAL ISSUES & CONCERNS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentState.dominantIssues.map((issue, idx) => (
                  <span key={idx} className="rounded-xs border border-line-strong bg-inset px-2 py-1 text-[11px] text-fg-2">
                    <span className="text-danger-fg font-bold mr-1">#</span>
                    {issue}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Leaders / Contacts */}
            <div className="flex items-center justify-between border-t border-line pt-2.5 font-tactical text-[11px]">
              <div>
                <span className="text-faint">LEAD CONTACTS: </span>
                <span className="text-fg font-bold">{currentState.keyLeaders.join(', ')}</span>
              </div>
              <div className="bg-inset px-2 py-0.5 rounded-xs border border-line">
                <span className="text-faint">ACTIVE VOLUNTEERS: </span>
                <span className="font-black text-accent-fg tabular-nums">{currentState.volunteerStrength.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Constituencies Breakdown in State */}
          <div className="rounded-xs border-2 border-line bg-surface p-4 text-xs shadow-md">
            <div className="flex items-center justify-between border-b-2 border-line pb-2 mb-3">
              <h4 className="font-tactical font-black text-fg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-danger-fg" />
                <span>LOK SABHA CONSTITUENCIES ({stateConstituencies.length} SEATS)</span>
              </h4>
              <span className="font-tactical text-[11px] text-muted">
                Support Index & Margins
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {stateConstituencies.map((con) => (
                <div
                  key={con.id}
                  className="rounded-xs border border-line bg-raised p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-tactical hover:border-line-strong transition-colors"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold text-fg text-sm">{con.name}</span>
                      <span className="text-[10px] text-muted">({con.category})</span>
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">
                      Incumbent: <span className="text-fg font-semibold">{con.incumbentParty}</span> · Est. Voters: {(con.totalVotersEstimated / 100000).toFixed(1)} Lakhs
                    </div>
                    {con.cjpCandidate && (
                      <div className="text-[11px] text-accent-fg font-bold mt-1">
                        CJP Nominee: {con.cjpCandidate.name} (Funded: ₹{con.cjpCandidate.campaignFundingAllocated.toLocaleString('en-IN')})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:text-right w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-line pt-1.5 sm:pt-0">
                    <div>
                      <div className="text-[10px] text-faint">CJP SUPPORT</div>
                      <div className="text-base font-black text-accent-fg tabular-nums">{con.cjpSupportScore}%</div>
                      <div className="text-[10px] text-faint">
                        Ruling {con.rulingVoteShareBaseline}% · Opp {con.mainOppVoteShareBaseline}%
                      </div>
                    </div>

                    <button
                      onClick={() => handleBoostConstituency(con.id)}
                      title="Dispatch volunteer brigade and pamphlets: raises local support (1 AP, ₹5,000)"
                      className="px-2.5 py-1.5 rounded-xs bg-[#DC2626] hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors shadow-xs"
                    >
                      Campaign · 1 AP
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
