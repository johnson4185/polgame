'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import { 
  History, 
  Search, 
  Filter, 
  Radio, 
  BookOpen, 
  ShieldAlert, 
  Award, 
  ArrowUpDown, 
  FileText, 
  Clock, 
  AlertCircle,
  Sparkles,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export type LogCategory = 'ALL' | 'DIRECTIVES' | 'NEWS' | 'CRITICAL';

interface UnifiedLogItem {
  id: string;
  timestamp: string;
  rawDate: { year: number; month: number; day: number };
  category: 'DIRECTIVE' | 'NEWS' | 'CRISIS' | 'MILESTONE';
  title: string;
  summary: string;
  provenance: string;
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
  tags: string[];
}

export function SituationLogView() {
  const { state, dispatch } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<LogCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDescending, setSortDescending] = useState(true);

  // Synthesize unified chronological feed from journal entries and news feed
  const unifiedLogs: UnifiedLogItem[] = useMemo(() => {
    const items: UnifiedLogItem[] = [];

    // 1. Ingest Journal entries (Player decisions, crises, milestones)
    (state.journal || []).forEach((j) => {
      const isCrisis = j.title.toLowerCase().includes('crisis') || j.text.toLowerCase().includes('directive');
      const isMilestone = j.significance === 'HISTORIC_TURNING_POINT' || j.significance === 'MILESTONE';

      let cat: UnifiedLogItem['category'] = 'DIRECTIVE';
      if (isCrisis) cat = 'CRISIS';
      else if (isMilestone) cat = 'MILESTONE';

      items.push({
        id: j.id,
        timestamp: formatDate(j.date),
        rawDate: j.date,
        category: cat,
        title: j.title,
        summary: j.text,
        provenance: isCrisis ? 'Field Command Emergency' : 'Citizen Movement Secretariat',
        priority: j.significance === 'HISTORIC_TURNING_POINT' ? 'CRITICAL' : j.significance === 'MILESTONE' ? 'HIGH' : 'STANDARD',
        tags: [cat, j.significance, j.associatedScreen || 'GENERAL'],
      });
    });

    // 2. Ingest News articles
    (state.newsFeed || []).forEach((n) => {
      items.push({
        id: n.id,
        timestamp: formatDate(n.date),
        rawDate: n.date,
        category: 'NEWS',
        title: n.headline,
        summary: n.body,
        provenance: n.sourceName,
        priority: n.biasTone === 'SENSATIONAL' ? 'CRITICAL' : 'STANDARD',
        tags: ['PRESS', n.biasTone],
      });
    });

    // Sort chronologically
    return items.sort((a, b) => {
      const valA = a.rawDate.year * 10000 + a.rawDate.month * 100 + a.rawDate.day;
      const valB = b.rawDate.year * 10000 + b.rawDate.month * 100 + b.rawDate.day;
      return sortDescending ? valB - valA : valA - valB;
    });
  }, [state.journal, state.newsFeed, sortDescending]);

  // Filtered entries
  const filteredLogs = useMemo(() => {
    return unifiedLogs.filter((item) => {
      // Category filter
      if (selectedCategory === 'DIRECTIVES' && item.category !== 'DIRECTIVE' && item.category !== 'CRISIS') return false;
      if (selectedCategory === 'NEWS' && item.category !== 'NEWS') return false;
      if (selectedCategory === 'CRITICAL' && item.priority !== 'CRITICAL') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const matchesSource = item.provenance.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesSource) return false;
      }

      return true;
    });
  }, [unifiedLogs, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4 font-sans text-white">
      
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tactical text-xs">
        <div className="rounded-xs border border-zinc-800 bg-[#0A0D15] p-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="font-bold flex items-center gap-1">
              <History className="h-3.5 w-3.5 text-[#FACC15]" /> LOGGED CHRONICLES
            </span>
          </div>
          <span className="font-mono text-xl font-black text-white">{unifiedLogs.length}</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Cumulative events recorded</span>
        </div>

        <div className="rounded-xs border border-zinc-800 bg-[#0A0D15] p-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="font-bold flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-blue-400" /> DIRECTIVES &amp; DECISIONS
            </span>
          </div>
          <span className="font-mono text-xl font-black text-blue-400">
            {unifiedLogs.filter(i => i.category === 'DIRECTIVE' || i.category === 'CRISIS').length}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Player actions executed</span>
        </div>

        <div className="rounded-xs border border-zinc-800 bg-[#0A0D15] p-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="font-bold flex items-center gap-1">
              <Radio className="h-3.5 w-3.5 text-red-400" /> NEWS &amp; DISPATCHES
            </span>
          </div>
          <span className="font-mono text-xl font-black text-red-400">
            {unifiedLogs.filter(i => i.category === 'NEWS').length}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Press wires documented</span>
        </div>

        <div className="rounded-xs border border-zinc-800 bg-[#0A0D15] p-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="font-bold flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-emerald-400" /> HIGH IMPACT TURNS
            </span>
          </div>
          <span className="font-mono text-xl font-black text-emerald-400">
            {unifiedLogs.filter(i => i.priority === 'CRITICAL').length}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Major turning points</span>
        </div>
      </div>

      {/* Filter and Search Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-zinc-800 bg-[#0E1320] p-3 shadow-md">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 font-tactical text-xs">
          {(
            [
              { key: 'ALL', label: 'ALL CHRONICLES' },
              { key: 'DIRECTIVES', label: 'DIRECTIVES & CRISES' },
              { key: 'NEWS', label: 'NEWS ALERTS' },
              { key: 'CRITICAL', label: 'HIGH PRIORITY' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory(tab.key);
              }}
              className={`px-3 py-1.5 rounded-xs font-bold transition-all ${
                selectedCategory === tab.key
                  ? 'bg-[#DC2626] text-white border-2 border-red-500 shadow-xs'
                  : 'bg-black text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Sort Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SITREP, keywords, entities..."
              className="w-full rounded-xs border border-zinc-700 bg-black pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-[#FACC15] focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              setSortDescending(!sortDescending);
            }}
            title={sortDescending ? 'Sorting: Newest First' : 'Sorting: Oldest First'}
            className="flex items-center gap-1 rounded-xs border border-zinc-700 bg-black px-2.5 py-1.5 text-xs font-tactical text-zinc-300 hover:text-[#FACC15] transition-colors shrink-0"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{sortDescending ? 'NEWEST' : 'OLDEST'}</span>
          </button>
        </div>

      </div>

      {/* Chronological List of Entries */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="rounded-xs border-2 border-dashed border-zinc-800 bg-[#0A0D15] p-12 text-center text-zinc-500 font-tactical text-xs">
            No chronicles match your search or filter parameters.
          </div>
        ) : (
          filteredLogs.map((item) => {
            const isCrisis = item.category === 'CRISIS';
            const isNews = item.category === 'NEWS';
            const isMilestone = item.category === 'MILESTONE';

            return (
              <div
                key={item.id}
                className={`rounded-xs border-2 bg-[#0C101A] p-4 text-xs transition-all relative shadow-sm ${
                  item.priority === 'CRITICAL'
                    ? 'border-red-600/80 bg-red-950/15'
                    : isCrisis
                    ? 'border-yellow-600/70 bg-yellow-950/15'
                    : isMilestone
                    ? 'border-emerald-600/70 bg-emerald-950/15'
                    : 'border-zinc-800/90 hover:border-zinc-700'
                }`}
              >
                {/* Left Colored Accent Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    item.priority === 'CRITICAL'
                      ? 'bg-[#DC2626]'
                      : isCrisis
                      ? 'bg-[#FACC15]'
                      : isMilestone
                      ? 'bg-emerald-500'
                      : 'bg-zinc-700'
                  }`}
                />

                <div className="pl-2 space-y-2">
                  
                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-[#FACC15] bg-black px-2 py-0.5 rounded-xs border border-zinc-800">
                        {item.timestamp}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wider ${
                          isCrisis
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : isNews
                            ? 'bg-zinc-900 text-blue-300 border border-blue-900/60'
                            : isMilestone
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                        · Source: <strong className="text-zinc-300">{item.provenance}</strong>
                      </span>
                    </div>

                    {item.priority === 'CRITICAL' && (
                      <span className="stamp-red text-[8px] animate-pulse">
                        HIGH STAKES FALLOUT
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-tactical text-sm sm:text-base font-black text-white leading-snug">
                    {item.title}
                  </h4>

                  {/* Narrative Body */}
                  <p className="text-zinc-300 font-serif leading-relaxed text-xs">
                    {item.summary}
                  </p>

                  {/* Tags & Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[9px] text-zinc-500">
                    {item.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="bg-black/60 px-1.5 py-0.5 rounded-xs border border-zinc-800">
                        #{tag}
                      </span>
                    ))}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
