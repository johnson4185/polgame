'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { GraduationCap, X } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { Button } from '@/components/ui/primitives';

const KEY = 'republic543_tutorial_step';
const DONE = 99;
const listeners = new Set<() => void>();

function readStep(): number {
  try {
    return Number(localStorage.getItem(KEY) ?? 0);
  } catch {
    return DONE;
  }
}
function writeStep(n: number) {
  try {
    localStorage.setItem(KEY, String(n));
  } catch {
    /* storage unavailable: tutorial just won't persist */
  }
  listeners.forEach(l => l());
}
/** Restart the tutorial (Settings → "Show tutorial again") */
export function restartTutorial() {
  writeStep(0);
}

const STEPS: { target: string; title: string; text: string; waitFor?: 'ACTION' | 'END_TURN' }[] = [
  { target: 'resources', title: 'Your movement', text: 'Followers, volunteers, money, trust, credibility and legal heat. Hover any of them to see what it does. If legal heat hits 100%, your offices are sealed.' },
  { target: 'actions', title: 'Spend your day', text: 'Each day you get action points. Open one of these menus and do something: a chai break, a meme, a legal writ.', waitFor: 'ACTION' },
  { target: 'map', title: 'India', text: 'States are coloured by your support. Tap one to see its issues and campaign there.' },
  { target: 'endturn', title: 'End the day', text: 'When you\'re out of action points, press END TURN. Real events from 2026 arrive on their real dates. Try it now.', waitFor: 'END_TURN' },
];

/** Coach marks for the first days. Highlights a [data-tour] element and waits for real actions. */
export function Tutorial() {
  const { state } = useGame();
  const step = useSyncExternalStore(
    cb => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readStep,
    () => DONE,
  );
  const startDay = useRef<string | null>(null);
  const [startAp, setStartAp] = useState<number | null>(null);

  const blocked = !state.isPrologueComplete || !!state.story?.activeEventId || !!state.activeCrisis || !!state.activeMiniGame || !!state.gameOver;
  const current = step < STEPS.length ? STEPS[step] : null;
  const dayKey = `${state.currentDate.year}-${state.currentDate.month}-${state.currentDate.day}`;

  // Advance "do it" steps when the player actually does it
  useEffect(() => {
    if (!current || blocked) return;
    if (current.waitFor === 'ACTION') {
      if (startAp === null) {
        const t = setTimeout(() => setStartAp(state.actionPoints), 0);
        return () => clearTimeout(t);
      }
      if (state.actionPoints < startAp) writeStep(step + 1);
    }
    if (current.waitFor === 'END_TURN') {
      if (startDay.current === null) startDay.current = dayKey;
      else if (startDay.current !== dayKey) writeStep(DONE);
    }
  }, [current, blocked, state.actionPoints, startAp, dayKey, step]);

  // Bring the highlighted part of the screen into view (it can be below the fold on phones)
  const target = current && !blocked ? current.target : null;
  useEffect(() => {
    if (!target) return;
    const el = document.querySelector(`[data-tour="${target}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [target]);

  if (!current || blocked) return null;

  return (
    <>
      <style>{`[data-tour="${current.target}"]{outline:4px dashed var(--pink);outline-offset:4px;border-radius:14px;position:relative;z-index:45}`}</style>
      <div
        role="dialog"
        aria-label={`Tutorial: ${current.title}`}
        className="chunky fixed inset-x-3 bottom-44 z-[55] mx-auto max-w-md bg-white p-4 text-ink animate-in fade-in-0 slide-in-from-bottom-4 md:bottom-28"
      >
        <button onClick={() => writeStep(DONE)} className="absolute right-2 top-2 rounded-full p-1 text-muted hover:text-ink" aria-label="Skip tutorial">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 font-display text-sm">
          <GraduationCap className="h-5 w-5 text-pink" strokeWidth={2.5} />
          {current.title}
          <span className="ml-auto mr-6 font-sans text-xs font-bold text-muted">
            {step + 1}/{STEPS.length}
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold leading-snug">{current.text}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button onClick={() => writeStep(DONE)} className="text-xs font-bold text-muted underline">
            Skip tutorial
          </button>
          {current.waitFor ? (
            <span className="rounded-lg border-2 border-ink bg-accent px-2 py-1 text-xs font-extrabold">{current.waitFor === 'ACTION' ? 'Waiting for you to act…' : 'Press END TURN…'}</span>
          ) : (
            <Button size="sm" onClick={() => writeStep(step + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
