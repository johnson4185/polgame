'use client';

// Map preview with random support values. Not linked from the game.
import React, { useMemo, useState } from 'react';
import { IndiaMap } from '@/components/map/IndiaMap';
import { INDIA_STATES } from '@/lib/game/data/indiaMap';

export default function MapKit() {
  const values = useMemo(() => Object.fromEntries(INDIA_STATES.map((s, i) => [s.name, (i * 37) % 100])), []);
  const [sel, setSel] = useState<string | null>('NCT of Delhi');
  return (
    <main className="app-backdrop min-h-screen p-4">
      <h1 className="poster-title text-3xl">Map kit</h1>
      <p className="mt-1 font-semibold text-on-canvas-muted">Selected: {sel ?? 'none'}</p>
      <div className="chunky mx-auto mt-4 max-w-3xl bg-surface p-3">
        <IndiaMap
          values={values}
          selected={sel}
          onSelect={setSel}
          markers={[
            { state: 'NCT of Delhi', kind: 'protest' },
            { state: 'Maharashtra', kind: 'flag' },
            { state: 'Rajasthan', kind: 'police' },
          ]}
        />
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-on-canvas-muted">
        Boundaries: DataMeet &quot;States/Admin2&quot; (CC BY 4.0), official depiction per the Survey of India.
      </p>
    </main>
  );
}
