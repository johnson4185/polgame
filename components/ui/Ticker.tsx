'use client';

import React, { useEffect, useRef, useState } from 'react';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * A number that counts to its new value and floats a "+N" / "−N" bubble when it changes.
 * `format` turns the (animated) number into text, e.g. compact rupees.
 */
export function Ticker({ value, format = n => Math.round(n).toLocaleString('en-IN'), deltaFormat }: { value: number; format?: (n: number) => string; deltaFormat?: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  const [bubble, setBubble] = useState<{ id: number; delta: number } | null>(null);
  const from = useRef(value);
  const seq = useRef(0);

  useEffect(() => {
    const start = from.current;
    const delta = value - start;
    if (delta === 0) return;
    from.current = value;
    const id = ++seq.current;
    let raf = 0;
    const t0 = performance.now();
    const duration = reducedMotion() ? 0 : 600;
    const step = (t: number) => {
      if (t === t0 || id === seq.current) setBubble(b => (b?.id === id ? b : { id, delta }));
      const p = duration ? Math.min(1, (t - t0) / duration) : 1;
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(start + delta * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const clear = setTimeout(() => setBubble(b => (b?.id === id ? null : b)), 1400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(clear);
    };
  }, [value]);

  const fmtDelta = deltaFormat ?? format;
  return (
    <span className="relative inline-block">
      {format(shown)}
      {bubble && (
        <span
          key={bubble.id}
          aria-hidden="true"
          className={`pointer-events-none absolute -top-4 left-full ml-1 whitespace-nowrap rounded-md border-2 border-ink px-1 text-[11px] font-extrabold leading-tight shadow-[2px_2px_0_var(--ink)] animate-in fade-in-0 slide-in-from-bottom-2 ${
            bubble.delta > 0 ? 'bg-success text-white' : 'bg-danger text-white'
          }`}
        >
          {bubble.delta > 0 ? '+' : '−'}
          {fmtDelta(Math.abs(bubble.delta))}
        </span>
      )}
    </span>
  );
}
