'use client';

import React, { useRef, useState } from 'react';
import { Flame, Shield, Flag } from 'lucide-react';
import { INDIA_STATES, MAP_VIEWBOX } from '@/lib/game/data/indiaMap';
import { cn } from '@/components/ui/primitives';

export type MarkerKind = 'protest' | 'police' | 'flag';

// Support legend (0–100) from the Overview mockup
const LEGEND: { from: number; color: string; label: string }[] = [
  { from: 80, color: '#7a1a1f', label: '80–100%' },
  { from: 60, color: '#a3343a', label: '60–80%' },
  { from: 40, color: '#c96a6a', label: '40–60%' },
  { from: 20, color: '#e3a7a0', label: '20–40%' },
  { from: 0, color: '#9a9188', label: '< 20%' },
];
export const supportColor = (v: number) => LEGEND.find(l => v >= l.from)!.color;

const MARKER: Record<MarkerKind, { icon: React.ElementType; bg: string; label: string }> = {
  protest: { icon: Flame, bg: 'bg-brand', label: 'Protest' },
  police: { icon: Shield, bg: 'bg-info-fg', label: 'Police presence' },
  flag: { icon: Flag, bg: 'bg-success', label: 'Chapter' },
};

export interface IndiaMapProps {
  /** Support 0–100 by state name (names as in statesAndConstituencies.ts) */
  values: Record<string, number>;
  selected?: string | null;
  onSelect?: (state: string) => void;
  markers?: { state: string; kind: MarkerKind }[];
  /** Content of the hover card for a state */
  renderTooltip?: (state: string) => React.ReactNode;
  className?: string;
  showLegend?: boolean;
}

/**
 * Choropleth map of India's states and UTs. Boundaries: DataMeet "States/Admin2" (CC BY 4.0),
 * following the Survey of India's official depiction.
 */
export function IndiaMap({ values, selected, onSelect, markers = [], renderTooltip, className, showLegend = true }: IndiaMapProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ name: string; x: number; y: number; w: number } | null>(null);

  const track = (name: string, e: React.PointerEvent | React.FocusEvent) => {
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return;
    if ('clientX' in e) {
      setHover({ name, x: e.clientX - box.left, y: e.clientY - box.top, w: box.width });
    } else {
      const r = (e.target as SVGGraphicsElement).getBoundingClientRect();
      setHover({ name, x: r.left + r.width / 2 - box.left, y: r.top - box.top, w: box.width });
    }
  };

  const anchor = new Map(INDIA_STATES.map(s => [s.name, s]));

  return (
    <div ref={wrap} className={cn('relative select-none', className)} onPointerLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
        className="h-full w-full drop-shadow-[4px_4px_0_var(--ink)]"
        role="img"
        aria-label="Map of India by state, coloured by support"
      >
        {INDIA_STATES.map(s => {
          const v = values[s.name] ?? 0;
          const isSel = selected === s.name;
          const isHover = hover?.name === s.name;
          return (
            <path
              key={s.name}
              d={s.d}
              fill={supportColor(v)}
              stroke="var(--ink)"
              strokeWidth={isSel ? 3.5 : 1.2}
              strokeLinejoin="round"
              className={cn('cursor-pointer outline-none transition-[filter] duration-150', (isHover || isSel) && 'brightness-125')}
              tabIndex={0}
              role="button"
              aria-label={`${s.name}: ${Math.round(v)}% support`}
              aria-pressed={isSel}
              onPointerMove={e => track(s.name, e)}
              onFocus={e => track(s.name, e)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect?.(s.name)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect?.(s.name);
                }
              }}
            />
          );
        })}
        {/* Selected state redrawn on top so its thick outline isn't hidden by neighbours */}
        {selected && anchor.get(selected) && (
          <path d={anchor.get(selected)!.d} fill="none" stroke="var(--accent)" strokeWidth={4} pointerEvents="none" />
        )}
      </svg>

      {/* Markers (HTML so they stay crisp and get icons) */}
      {markers.map((m, i) => {
        const a = anchor.get(m.state);
        if (!a) return null;
        const M = MARKER[m.kind];
        return (
          <span
            key={`${m.state}-${m.kind}-${i}`}
            className={cn('pointer-events-none absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink text-white shadow-[2px_2px_0_var(--ink)]', M.bg)}
            style={{ left: `${(a.ax / MAP_VIEWBOX.width) * 100}%`, top: `${(a.ay / MAP_VIEWBOX.height) * 100}%` }}
            title={`${M.label}: ${m.state}`}
          >
            <M.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        );
      })}

      {hover && (
        <div
          className="chunky-sm pointer-events-none absolute z-10 w-56 bg-surface p-2.5 text-fg"
          style={{
            left: Math.max(0, Math.min(hover.x + 14, hover.w - 232)),
            top: Math.max(hover.y - 10, 0),
          }}
        >
          {renderTooltip ? (
            renderTooltip(hover.name)
          ) : (
            <>
              <div className="font-display text-xs">{hover.name}</div>
              <div className="text-sm font-bold">{Math.round(values[hover.name] ?? 0)}% support</div>
            </>
          )}
        </div>
      )}

      {showLegend && (
        <div className="chunky-sm absolute bottom-2 left-2 bg-surface p-2 text-fg">
          <div className="font-display text-[10px]">Support</div>
          {LEGEND.map(l => (
            <div key={l.label} className="mt-1 flex items-center gap-1.5 text-[11px] font-bold">
              <span className="h-3 w-3 rounded-sm border border-ink" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
