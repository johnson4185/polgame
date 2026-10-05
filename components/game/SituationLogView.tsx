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
    <div className="space-y-4 font-sans text-fg">
      
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tactical text-xs">
        <div className="rounded-xs border border-line bg-surface p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-1">
            <span className="font-bold flex items-center gap-1">
              <History className="h-3.5 w-3.5 text-accent-fg" /> LOGGED CHRONICLES
            </span>
          </div>
          <span className="font-mono text-xl font-black text-fg">{unifiedLogs.length}</span>
          <span className="text-[10px] text-faint block mt-0.5">Cumulative events recorded</span>
        </div>

        <div className="rounded-xs border border-line bg-surface p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-1">
            <span className="font-bold flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-info-fg" /> DIRECTIVES &amp; DECISIONS
            </span>
          </div>
          <span className="font-mono text-xl font-black text-info-fg">
            {unifiedLogs.filter(i => i.category === 'DIRECTIVE' || i.category === 'CRISIS').length}
          </span>
          <span className="text-[10px] text-faint block mt-0.5">Player actions executed</span>
        </div>

        <div className="rounded-xs border border-line bg-surface p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-1">
            <span className="font-bold flex items-center gap-1">
              <Radio className="h-3.5 w-3.5 text-danger-fg" /> NEWS &amp; DISPATCHES
            </span>
          </div>
          <span className="font-mono text-xl font-black text-danger-fg">
            {unifiedLogs.filter(i => i.category === 'NEWS').length}
          </span>
          <span className="text-[10px] text-faint block mt-0.5">Press wires documented</span>
        </div>

        <div className="rounded-xs border border-line bg-surface p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-1">
            <span className="font-bold flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-success-fg" /> HIGH IMPACT TURNS
            </span>
          </div>
          <span className="font-mono text-xl font-black text-success-fg">
            {unifiedLogs.filter(i => i.priority === 'CRITICAL').length}
          </span>
          <span className="text-[10px] text-faint block mt-0.5">Major turning points</span>
        </div>
      </div>

      {/* Filter and Search Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-line bg-surface p-3 shadow-md">
        
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
                  : 'bg-inset text-muted border border-line hover:border-line-strong hover:text-fg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Sort Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-faint" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SITREP, keywords, entities..."
              className="w-full rounded-xs border border-line-strong bg-inset pl-8 pr-3 py-1.5 text-xs text-fg placeholder-faint focus:border-accent focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              setSortDescending(!sortDescending);
            }}
            title={sortDescending ? 'Sorting: Newest First' : 'Sorting: Oldest First'}
            className="flex items-center gap-1 rounded-xs border border-line-strong bg-inset px-2.5 py-1.5 text-xs font-tactical text-fg-2 hover:text-accent-fg transition-colors shrink-0"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{sortDescending ? 'NEWEST' : 'OLDEST'}</span>
          </button>
        </div>

      </div>

      {/* Chronological List of Entries */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="rounded-xs border-2 border-dashed border-line bg-surface p-12 text-center text-faint font-tactical text-xs">
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
                className={`rounded-xs border-2 bg-surface p-4 text-xs transition-all relative shadow-sm ${
                  item.priority === 'CRITICAL'
                    ? 'border-red-600/80 bg-danger-soft'
                    : isCrisis
                    ? 'border-accent-line bg-accent-soft'
                    : isMilestone
                    ? 'border-emerald-600/70 bg-success-soft'
                    : 'border-line hover:border-line-strong'
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
                      : 'bg-line-strong'
                  }`}
                />

                <div className="pl-2 space-y-2">
                  
                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-mono font-black text-xs text-accent-fg bg-inset px-2 py-0.5 rounded-xs border border-line">
                        {item.timestamp}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wider ${
                          isCrisis
                            ? 'bg-danger-soft text-danger-fg border border-danger-line'
                            : isNews
                            ? 'bg-raised text-info-fg border border-info-line'
                            : isMilestone
                            ? 'bg-success-soft text-success-fg border border-success-line'
                            : 'bg-raised text-fg-2 border border-line-strong'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] text-muted font-mono hidden sm:inline">
                        · Source: <strong className="text-fg-2">{item.provenance}</strong>
                      </span>
                    </div>

                    {item.priority === 'CRITICAL' && (
                      <span className="stamp-red text-[8px] animate-pulse">
                        HIGH STAKES FALLOUT
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-tactical text-sm sm:text-base font-black text-fg leading-snug">
                    {item.title}
                  </h4>

                  {/* Narrative Body */}
                  <p className="text-fg-2 font-serif leading-relaxed text-xs">
                    {item.summary}
                  </p>

                  {/* Tags & Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[9px] text-faint">
                    {item.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="bg-inset px-1.5 py-0.5 rounded-xs border border-line">
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
