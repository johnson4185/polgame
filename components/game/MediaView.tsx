'use client';

import React from 'react';
import { Image as ImageIcon, Hash, Radio, ShieldCheck, Heart, Flame, Tv, MessageCircle, Ban } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { MEDIA_ACTIONS, formatDate } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import type { MediaActionKind, Platform } from '@/lib/game/types';
import { ArtPlaceholder, Badge, Panel, PanelHeader } from '@/components/ui/primitives';
import { Tooltip } from '@/components/ui/menus';

const compact = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : `${n}`);
const ACTION_ICONS: Record<MediaActionKind, React.ElementType> = { MEME: ImageIcon, HASHTAG: Hash, LIVE: Radio, DEBUNK: ShieldCheck };
const ACTION_COLORS: Record<MediaActionKind, string> = { MEME: 'bg-pink text-white', HASHTAG: 'bg-accent text-ink', LIVE: 'bg-brand text-brand-ink', DEBUNK: 'bg-teal text-white' };
const PLATFORM_LABEL: Record<Platform, string> = { X: 'X', INSTAGRAM: 'Instagram', YOUTUBE: 'YouTube', TELEGRAM: 'Telegram', WHATSAPP: 'WhatsApp' };
const HOSTILE = new Set(['#CockroachForeignAgent', '#AntiNationalAgenda', '#ToolkitGang', '#KeyboardKranti']);

/** The media room: social feed · TV wall · narrative battle, plus four media actions. */
export function MediaView() {
  const { state, dispatch } = useGame();
  const media = state.media;
  const nar = media.narrative;
  const mainstream = Math.max(0, 100 - nar.movement - nar.government);
  const tv = state.newsFeed.slice(0, 4);

  const act = (kind: MediaActionKind) => {
    soundManager.playCameraShutter();
    dispatch({ type: 'MEDIA_ACTION', kind });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_340px]">
        {/* Social feed */}
        <Panel className="p-3 sm:p-4">
          <PanelHeader title="Social" icon={MessageCircle} />
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl text-ink">{compact(state.movement.followers)}</span>
            <span className="text-xs font-bold text-muted">followers</span>
          </div>
          <ul className="mt-3 max-h-[30rem] space-y-2.5 overflow-y-auto pr-1">
            {media.feed.length === 0 && <li className="text-sm font-semibold text-muted">Nobody is talking about you yet. Post something.</li>}
            {media.feed.map(p => (
              <li key={p.id} className="chunky-sm bg-white p-2.5 text-ink">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-extrabold">{p.author}</span>
                  <span className="shrink-0 font-semibold text-muted">{formatDate(p.date)}</span>
                </div>
                <div className="text-[11px] font-semibold text-muted">{p.handle}</div>
                <p className="mt-1 text-sm font-semibold leading-snug">{p.text}</p>
                <div className="mt-1 flex items-center gap-1 text-xs font-bold text-pink">
                  <Heart className="h-3.5 w-3.5 fill-current" /> {compact(p.likes)}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] font-semibold text-muted">Posts are by fictional citizens.</p>
        </Panel>

        {/* TV wall */}
        <Panel className="p-3 sm:p-4">
          <PanelHeader title="On air" icon={Tv} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {tv.map((n, i) => (
              <article key={n.id} className="chunky-sm theme-dark-scope relative overflow-hidden bg-[#160f36]">
                <ArtPlaceholder label="" compact className="aspect-video w-full opacity-60" />
                <span className="absolute left-2 top-2 rounded border-2 border-ink bg-danger px-1.5 font-display text-[10px] text-white">{i === 0 ? 'Breaking' : 'Live'}</span>
                <div className="absolute inset-x-0 bottom-0 bg-white/95 p-2 text-ink">
                  <div className="line-clamp-2 font-display text-xs leading-tight">{n.headline}</div>
                  <div className="mt-0.5 truncate text-[10px] font-bold text-muted">{n.sourceName}</div>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        {/* Narrative battle */}
        <Panel className="p-3 sm:p-4 lg:col-span-2 xl:col-span-1">
          <PanelHeader title="Narrative battle" icon={Flame} />
          <div className="mt-3 space-y-3">
            {[
              { label: 'CJP / the movement', value: nar.movement, color: 'bg-pink' },
              { label: 'Government', value: nar.government, color: 'bg-brand' },
              { label: 'Mainstream media', value: mainstream, color: 'bg-faint' },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-sm font-extrabold text-ink">
                  <span>{r.label}</span>
                  <span>{Math.round(r.value)}%</span>
                </div>
                <div className="mt-1 h-4 overflow-hidden rounded-full border-2 border-ink bg-inset">
                  <div className={`h-full ${r.color} transition-all duration-500`} style={{ width: `${r.value}%` }} />
                </div>
              </div>
            ))}
            <p className="text-xs font-semibold text-muted">Winning the narrative speeds up follower growth. It drifts toward your public trust; government pressure pulls it back.</p>
          </div>

          <div className="mt-4 font-display text-xs text-ink">Trending now</div>
          <ol className="mt-2 grid grid-cols-2 gap-2">
            {media.trending.length === 0 && <li className="col-span-2 text-sm font-semibold text-muted">Nothing trending. Launch a hashtag.</li>}
            {media.trending.slice(0, 6).map((t, i) => (
              <li key={t.tag} className={`chunky-sm p-2 ${HOSTILE.has(t.tag) ? 'bg-danger-soft' : 'bg-raised'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-sm text-muted">{i + 1}</span>
                  <span className="truncate text-xs font-extrabold text-ink">{t.tag}</span>
                </div>
                <div className="text-[11px] font-bold text-muted">{compact(t.posts)} posts{HOSTILE.has(t.tag) ? ' · against you' : ''}</div>
              </li>
            ))}
          </ol>

          <div className="mt-4 font-display text-xs text-ink">Platforms</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(media.platforms) as Platform[]).map(p => (
              <Badge key={p} tone={media.platforms[p] === 'WITHHELD' ? 'danger' : 'success'}>
                {media.platforms[p] === 'WITHHELD' && <Ban className="mr-1 h-3 w-3" />}
                {PLATFORM_LABEL[p]}: {media.platforms[p] === 'WITHHELD' ? 'withheld in India' : 'active'}
              </Badge>
            ))}
          </div>
        </Panel>
      </div>

      {/* Media actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(Object.keys(MEDIA_ACTIONS) as MediaActionKind[]).map(k => {
          const a = MEDIA_ACTIONS[k];
          const Icon = ACTION_ICONS[k];
          const disabled = state.actionPoints < 1 || state.movement.movementFunds < a.cost;
          return (
            <Tooltip key={k} content={a.blurb}>
              <button
                onClick={() => act(k)}
                disabled={disabled}
                className={`chunky pressable flex items-center gap-3 p-3 text-left disabled:cursor-not-allowed disabled:opacity-50 ${ACTION_COLORS[k]}`}
              >
                <Icon className="h-8 w-8 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                <span>
                  <span className="block font-display text-sm leading-tight">{a.label}</span>
                  <span className="block text-xs font-bold opacity-85">1 AP{a.cost ? ` · ₹${a.cost / 1000}K` : ''}</span>
                </span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
