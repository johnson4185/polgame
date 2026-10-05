'use client';

// Style exploration: the same mini game screen rendered in three visual directions,
// so the art direction can be chosen by looking rather than describing.
import React, { useState } from 'react';
import { Baloo_2, Bungee, Hind, Lilita_One, Nunito, Teko } from 'next/font/google';
import { Users, IndianRupee, UserCheck, Siren, Megaphone, Home, Map as MapIcon, Tv, Scale, Vote, Play, MonitorPlay, Handshake, Flame, Star } from 'lucide-react';

const bungee = Bungee({ subsets: ['latin'], weight: '400' });
const baloo = Baloo_2({ subsets: ['latin', 'devanagari'], weight: ['500', '700', '800'] });
const lilita = Lilita_One({ subsets: ['latin'], weight: '400' });
const nunito = Nunito({ subsets: ['latin'], weight: ['600', '800', '900'] });
const teko = Teko({ subsets: ['latin', 'devanagari'], weight: ['500', '600', '700'] });
const hind = Hind({ subsets: ['latin', 'devanagari'], weight: ['400', '600', '700'] });

interface Direction {
  id: string;
  name: string;
  pitch: string;
  head: string;            // heading font class
  body: string;            // body font class
  vars: Record<string, string>;
  backdrop: string;        // CSS background for the page area
  headCase?: 'uppercase' | 'none';
}

const DIRECTIONS: Direction[] = [
  {
    id: 'truck',
    name: 'A · Truck Art Protest Poster',
    pitch: 'Hand-painted Indian truck-art and placard energy. Saffron, rani pink and peacock teal on deep indigo, thick black outlines, sticker shadows. Fonts: Bungee (signage) + Baloo 2 (Indian, Hindi-ready).',
    head: bungee.className,
    body: baloo.className,
    headCase: 'uppercase',
    vars: {
      '--bg': '#1d1747', '--panel': '#fff4dc', '--panel-2': '#ffe6b0', '--ink': '#1a1033', '--ink-soft': '#4b3d6b',
      '--primary': '#ff6b1a', '--primary-ink': '#1a1033', '--secondary': '#e8247c', '--tertiary': '#0fa3a3',
      '--gold': '#ffc93c', '--good': '#0f9d58', '--bad': '#e8247c', '--bw': '3px', '--shadow': '5px 5px 0 #1a1033',
      '--radius': '14px', '--dock': '#ffc93c', '--on-bg': '#fff4dc',
    },
    backdrop:
      'radial-gradient(circle at 20% 15%, rgb(255 107 26 / .35) 0 12%, transparent 13%), radial-gradient(circle at 85% 80%, rgb(232 36 124 / .35) 0 14%, transparent 15%), repeating-conic-gradient(from 0deg at 50% 120%, #241c58 0 8deg, #1d1747 8deg 16deg)',
  },
  {
    id: 'cartoon',
    name: 'B · Cartoon Mobile Game',
    pitch: 'Bright, bouncy and friendly like a top-grossing mobile game. Sky blue world, tomato red and sunflower buttons with chunky 3D bevels. Fonts: Lilita One (chunky game titles) + Nunito (rounded).',
    head: lilita.className,
    body: nunito.className,
    headCase: 'uppercase',
    vars: {
      '--bg': '#3fa9f5', '--panel': '#ffffff', '--panel-2': '#e9f5ff', '--ink': '#13305b', '--ink-soft': '#4a6a95',
      '--primary': '#ff4d3d', '--primary-ink': '#ffffff', '--secondary': '#7a4dff', '--tertiary': '#22c55e',
      '--gold': '#ffcc00', '--good': '#16a34a', '--bad': '#ef4444', '--bw': '3px', '--shadow': '0 6px 0 #13305b',
      '--radius': '18px', '--dock': '#13305b', '--on-bg': '#ffffff',
    },
    backdrop:
      'radial-gradient(ellipse at 50% 110%, #8fd14f 0 22%, transparent 23%), radial-gradient(circle at 15% 20%, #fff 0 4%, transparent 4.5%), radial-gradient(circle at 22% 18%, #fff 0 5%, transparent 5.5%), radial-gradient(circle at 78% 12%, #fff 0 4%, transparent 4.5%), linear-gradient(#5bc0ff, #3fa9f5)',
  },
  {
    id: 'rally',
    name: 'C · Night Rally Neon',
    pitch: 'The protest at night: phone torches, stage lights and tricolour neon on near-black. Moody and dramatic but still punchy. Fonts: Teko (Indian condensed, Hindi-ready) + Hind.',
    head: teko.className,
    body: hind.className,
    headCase: 'uppercase',
    vars: {
      '--bg': '#0b0d1a', '--panel': '#171a33', '--panel-2': '#20244a', '--ink': '#f3f1ff', '--ink-soft': '#a9a6d1',
      '--primary': '#ff8a1f', '--primary-ink': '#170c00', '--secondary': '#ff3d7f', '--tertiary': '#2ee59d',
      '--gold': '#ffd23f', '--good': '#2ee59d', '--bad': '#ff3d7f', '--bw': '2px', '--shadow': '0 0 0 2px #ff8a1f, 0 0 22px rgb(255 138 31 / .45)',
      '--radius': '12px', '--dock': '#171a33', '--on-bg': '#f3f1ff',
    },
    backdrop:
      'radial-gradient(circle at 10% 30%, rgb(255 210 63 / .25) 0 2px, transparent 3px), radial-gradient(circle at 70% 20%, rgb(255 210 63 / .3) 0 2px, transparent 3px), radial-gradient(ellipse at 50% 0%, rgb(255 138 31 / .25), transparent 60%), radial-gradient(ellipse at 50% 100%, rgb(46 229 157 / .18), transparent 55%), #0b0d1a',
  },
];

// Shared styling helpers driven by each direction's CSS variables
const chunky = 'border-[length:var(--bw)] border-[var(--ink)] rounded-[var(--radius)] shadow-[var(--shadow)]';
const pressable = 'transition-transform duration-100 hover:-translate-y-1 active:translate-y-1 active:shadow-none';

function Resource({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className={`flex items-center gap-2 bg-[var(--panel)] py-1 pl-1 pr-3 text-[var(--ink)] ${chunky} ${pressable}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-[calc(var(--radius)-4px)] text-white" style={{ background: color }}>
        <Icon className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <div className="leading-none">
        <div className="text-[11px] font-bold uppercase opacity-70">{label}</div>
        <div className="text-xl font-extrabold">{value}</div>
      </div>
    </div>
  );
}

function Mini({ d }: { d: Direction }) {
  const [active, setActive] = useState('Home');
  const [picked, setPicked] = useState<string | null>(null);
  const dock = [
    { icon: Home, label: 'Home' }, { icon: Megaphone, label: 'Campaigns', badge: 2 }, { icon: MapIcon, label: 'Map' },
    { icon: Tv, label: 'Media', badge: 5 }, { icon: Scale, label: 'Courts' }, { icon: Vote, label: 'Election' },
  ];
  return (
    <section className={`${d.body} overflow-hidden rounded-2xl`} style={d.vars as React.CSSProperties}>
      <div className="relative p-4 sm:p-5" style={{ background: d.backdrop }}>
        {/* Logo + resources */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`${d.head} -rotate-2 leading-[0.85] text-[var(--on-bg)] [text-shadow:3px_3px_0_var(--secondary)]`} style={{ textTransform: d.headCase }}>
            <div className="text-4xl">Cockroach</div>
            <div className="text-2xl text-[var(--gold)]">Janta Party</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Resource icon={Users} label="Followers" value="20.4M" color="var(--secondary)" />
            <Resource icon={IndianRupee} label="Funds" value="₹12L" color="var(--good)" />
            <Resource icon={UserCheck} label="Volunteers" value="85K" color="var(--tertiary)" />
            <div className={`flex items-center gap-2 bg-[var(--panel)] px-3 py-1.5 text-[var(--ink)] ${chunky}`}>
              <Siren className="h-5 w-5 text-[var(--bad)]" strokeWidth={2.5} />
              <div>
                <div className="text-[11px] font-bold uppercase opacity-70">Legal Heat</div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 8 }, (_, i) => (
                    <span key={i} className="h-3 w-3 rounded-sm border-2 border-[var(--ink)]" style={{ background: i < 6 ? 'var(--bad)' : 'transparent' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          {/* Campaign card */}
          <div className={`bg-[var(--panel)] p-4 text-[var(--ink)] ${chunky}`}>
            <div className={`${d.head} text-2xl leading-none`} style={{ textTransform: d.headCase }}>Jantar Mantar Sit-in</div>
            <div className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">National mobilisation · 5 days left</div>
            <div className="mt-3 h-5 overflow-hidden rounded-full border-[length:var(--bw)] border-[var(--ink)] bg-[var(--panel-2)]">
              <div className="h-full rounded-full" style={{ width: '80%', background: 'repeating-linear-gradient(-45deg, var(--primary) 0 10px, var(--gold) 10px 20px)' }} />
            </div>
            <div className={`${d.head} mt-3 text-xl text-[var(--secondary)]`} style={{ textTransform: d.headCase }}>हम कॉकरोच नहीं, नागरिक हैं!</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['#MainBhiCockroach', '#NEETScam'].map(t => (
                <span key={t} className={`bg-[var(--gold)] px-2.5 py-1 text-sm font-extrabold text-[var(--ink)] ${chunky} ${pressable} -rotate-1`}>{t}</span>
              ))}
            </div>
          </div>

          {/* Event choice */}
          <div className={`bg-[var(--panel)] p-4 text-[var(--ink)] ${chunky}`}>
            <div className="flex items-center gap-2">
              <span className={`${d.head} -rotate-3 rounded-md bg-[var(--secondary)] px-2 py-0.5 text-sm text-white`}>EVENT!</span>
              <span className={`${d.head} text-2xl leading-none`} style={{ textTransform: d.headCase }}>Police cut the lights</span>
            </div>
            <div className="mt-3 space-y-2.5">
              {[
                { id: 'live', icon: MonitorPlay, title: 'Livestream it', fx: [['+2.5M', 'Followers', 'good'], ['+30%', 'Heat', 'bad']] },
                { id: 'talk', icon: Handshake, title: 'Negotiate with police', fx: [['+10%', 'Credibility', 'good']] },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setPicked(c.id)}
                  className={`flex w-full items-center gap-3 p-2.5 text-left ${chunky} ${pressable} ${picked === c.id ? 'bg-[var(--primary)] text-[var(--primary-ink)]' : 'bg-[var(--panel-2)]'}`}
                >
                  <c.icon className="h-7 w-7 shrink-0" strokeWidth={2.5} />
                  <span className={`${d.head} flex-1 text-lg leading-tight`} style={{ textTransform: d.headCase }}>{c.title}</span>
                  {c.fx.map(([v, l, tone]) => (
                    <span
                      key={l}
                      className="rotate-2 rounded-md border-2 border-[var(--ink)] px-1.5 py-0.5 text-center text-xs font-extrabold leading-tight text-white"
                      style={{ background: tone === 'good' ? 'var(--good)' : 'var(--bad)' }}
                    >
                      {v}
                      <br />
                      {l}
                    </span>
                  ))}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dock + end turn */}
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <nav className={`flex flex-1 gap-1 overflow-x-auto bg-[var(--dock)] p-1.5 ${chunky}`}>
            {dock.map(n => {
              const on = active === n.label;
              return (
                <button
                  key={n.label}
                  onClick={() => setActive(n.label)}
                  className={`relative flex min-w-16 flex-1 flex-col items-center gap-0.5 rounded-[calc(var(--radius)-4px)] px-2 py-1.5 text-xs font-extrabold transition-all ${
                    on ? '-translate-y-2 scale-110 border-[length:var(--bw)] border-[var(--ink)] bg-[var(--primary)] text-[var(--primary-ink)] shadow-[var(--shadow)]' : 'text-[var(--on-bg)] opacity-85 hover:opacity-100'
                  }`}
                  style={!on && d.id === 'truck' ? { color: 'var(--ink)' } : undefined}
                >
                  <n.icon className="h-6 w-6" strokeWidth={2.5} />
                  {n.label}
                  {n.badge && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--secondary)] px-1 text-[10px] text-white">
                      {n.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <button className={`${d.head} flex items-center gap-2 bg-[var(--primary)] px-7 py-3 text-3xl text-[var(--primary-ink)] ${chunky} ${pressable}`} style={{ textTransform: d.headCase }}>
            <Play className="h-7 w-7 fill-current" />
            End Turn
          </button>
        </div>
      </div>
    </section>
  );
}

export default function StylesPage() {
  return (
    <main className="min-h-screen bg-[#111] p-3 text-white sm:p-6">
      <div className="mx-auto max-w-6xl space-y-10">
        <header>
          <h1 className={`${bungee.className} text-3xl`}>Pick a direction</h1>
          <p className={`${baloo.className} mt-1 text-lg text-white/70`}>
            The same mini screen in three styles. Hover and click things: buttons press, the dock tab pops up, choices select.
          </p>
        </header>
        {DIRECTIONS.map(d => (
          <div key={d.id}>
            <h2 className={`${bungee.className} text-2xl`}>{d.name}</h2>
            <p className={`${baloo.className} mb-3 max-w-3xl text-base text-white/75`}>{d.pitch}</p>
            <Mini d={d} />
          </div>
        ))}
      </div>
    </main>
  );
}
