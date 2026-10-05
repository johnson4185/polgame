'use client';

import React from 'react';
import type { SaveMetadata } from '@/lib/game/simulation/persistence';

const format = (value: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);

export function SavePreview({ meta }: { meta: SaveMetadata }) {
  return (
    <div className="space-y-3">
      <div className="min-w-0">
        <p className="break-words font-bold text-fg">{meta.playerName} · {meta.inGameDate}</p>
        <p className="text-xs text-muted">{meta.campaignMode === 'ABHIJEET_CJP' ? 'CJP campaign' : 'Custom citizen campaign'}</p>
        {meta.savedAt && <p className="break-words text-xs text-muted">Saved {/^\d{4}-\d{2}-\d{2}T/.test(meta.savedAt) && Number.isFinite(Date.parse(meta.savedAt)) ? new Date(meta.savedAt).toLocaleString() : meta.savedAt}</p>}
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {[
          ['Movement funds', `₹${format(meta.movementFunds)}`], ['Public trust', `${format(meta.publicTrust)}%`],
          ['Volunteers', meta.volunteers === undefined ? 'Not recorded' : format(meta.volunteers)],
          ['Seats won', meta.seats === undefined ? 'Not recorded' : format(meta.seats)],
        ].map(([label, value]) => <div key={label} className="min-w-0 rounded-lg border border-ink bg-raised p-2">
          <dt className="text-xs text-muted">{label}</dt><dd className="break-words font-bold text-fg">{value}</dd>
        </div>)}
      </dl>
    </div>
  );
}
