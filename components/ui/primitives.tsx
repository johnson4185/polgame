'use client';

// "Truck Art Protest Poster" UI kit: static building blocks used across every screen.
// Interactive pieces (tabs, menus, tooltips, dialogs) live in ./menus.tsx.
import React from 'react';
import { ArrowRight, ImageIcon, Play, TrendingDown, TrendingUp } from 'lucide-react';

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

// ─── Buttons ────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'pink' | 'teal' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-ink hover:bg-brand-hover',
  pink: 'bg-pink text-white',
  teal: 'bg-teal text-white',
  secondary: 'bg-surface text-fg hover:bg-raised',
  ghost: 'border-transparent! shadow-none! bg-transparent text-current hover:bg-white/10',
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-16 px-7 text-2xl',
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; icon?: React.ElementType }
>(function Button({ variant = 'primary', size = 'md', icon: Icon, className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        'chunky-sm pressable inline-flex items-center justify-center gap-2 font-display uppercase',
        'disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className={size === 'lg' ? 'h-7 w-7' : 'h-4 w-4'} strokeWidth={2.5} aria-hidden="true" />}
      {children}
    </button>
  );
});

// ─── Panels ─────────────────────────────────────────────────────────────────

/** Cream poster card with ink outline and sticker shadow */
export function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('chunky bg-surface text-fg', className)} {...props}>
      {children}
    </section>
  );
}

/** Section title, e.g. "ACTIVE CAMPAIGNS · View all →" */
export function PanelHeader({
  title,
  icon: Icon,
  action,
  onAction,
  className,
}: {
  title: string;
  icon?: React.ElementType;
  action?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <h2 className="flex items-center gap-2 font-display text-lg leading-none text-fg sm:text-xl">
        {Icon && (
          <span className="flex h-8 w-8 -rotate-6 items-center justify-center rounded-lg border-2 border-ink bg-pink text-white">
            <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          </span>
        )}
        <span className="bg-[linear-gradient(transparent_62%,var(--accent)_62%)] px-0.5">{title}</span>
      </h2>
      {action && (
        <button onClick={onAction} className="flex shrink-0 items-center gap-1 text-sm font-bold text-fg-2 hover:text-brand-fg">
          {action}
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ─── Stats ──────────────────────────────────────────────────────────────────

type IconTone = 'pink' | 'teal' | 'saffron' | 'gold' | 'success' | 'ink';
const iconTones: Record<IconTone, string> = {
  pink: 'bg-pink text-white',
  teal: 'bg-teal text-white',
  saffron: 'bg-brand text-brand-ink',
  gold: 'bg-accent text-ink',
  success: 'bg-success text-white',
  ink: 'bg-ink text-on-canvas',
};

/** Resource tile: coloured icon block + label + big value + delta */
export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  iconTone = 'pink',
  children,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  delta?: number;
  iconTone?: IconTone;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('chunky-sm pressable flex min-w-0 items-center gap-2 bg-surface py-1 pl-1 pr-2.5 text-fg', className)}>
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-ink', iconTones[iconTone])}>
        <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <div className="min-w-0 leading-none">
        <div className="truncate text-[11px] font-bold uppercase tracking-wide text-muted">{label}</div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          {value !== undefined && <span className="truncate text-xl font-extrabold leading-tight">{value}</span>}
          {delta !== undefined && <Delta value={delta} />}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Delta({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <span className={cn('flex items-center gap-0.5 text-xs font-extrabold', up ? 'text-success-fg' : 'text-danger-fg')}>
      {up ? <TrendingUp className="h-3 w-3" strokeWidth={3} aria-hidden="true" /> : <TrendingDown className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
      {up ? '+' : ''}
      {value}
      {suffix}
    </span>
  );
}

type MeterTone = 'success' | 'danger' | 'accent' | 'brand' | 'pink' | 'teal' | 'stripes';
const meterFill: Record<MeterTone, string> = {
  success: 'bg-success',
  danger: 'bg-danger',
  accent: 'bg-accent',
  brand: 'bg-brand',
  pink: 'bg-pink',
  teal: 'bg-teal',
  stripes: 'bg-[repeating-linear-gradient(-45deg,var(--brand)_0_8px,var(--accent)_8px_16px)]',
};

/** Ink-outlined bar: "Energy ▓▓▓▓░ 78/100" */
export function Meter({
  label,
  value,
  max = 100,
  tone = 'success',
  icon: Icon,
  showValue = true,
  className,
}: {
  label?: string;
  value: number;
  max?: number;
  tone?: MeterTone;
  icon?: React.ElementType;
  showValue?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {(Icon || label) && (
        <span className="flex w-20 shrink-0 items-center gap-1.5 text-sm font-bold text-fg-2">
          {Icon && <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />}
          {label}
        </span>
      )}
      <div
        className="h-4 flex-1 overflow-hidden rounded-full border-2 border-ink bg-inset"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className={cn('h-full rounded-full border-r-2 border-ink transition-all duration-500', meterFill[tone])} style={{ width: `${pct}%` }} />
      </div>
      {showValue && <span className="w-14 shrink-0 text-right text-sm font-extrabold text-fg">{value}/{max}</span>}
    </div>
  );
}

/** Blocky meter like "Legal Heat ■■■■■■□□" */
export function SegmentMeter({ value, max = 100, segments = 8, tone = 'danger' }: { value: number; max?: number; segments?: number; tone?: MeterTone }) {
  const filled = Math.round((value / max) * segments);
  return (
    <div className="flex gap-0.5" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={cn('h-3.5 w-3 rounded-[3px] border-2 border-ink', i < filled ? meterFill[tone] : 'bg-transparent')} />
      ))}
    </div>
  );
}

// ─── Chips & badges ─────────────────────────────────────────────────────────

/** Consequence sticker on choices: "+2.5M / Followers" */
export function EffectChip({ icon: Icon, value, label, tone }: { icon?: React.ElementType; value: string; label: string; tone: 'good' | 'bad' | 'neutral' }) {
  const toneClass = tone === 'good' ? 'bg-success text-white' : tone === 'bad' ? 'bg-danger text-white' : 'bg-accent text-ink';
  return (
    <span className={cn('chunky-sm inline-flex rotate-2 items-center gap-1.5 px-2 py-1 leading-tight', toneClass)}>
      {Icon && <Icon className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />}
      <span>
        <span className="block text-base font-extrabold">{value}</span>
        <span className="block text-[11px] font-bold opacity-90">{label}</span>
      </span>
    </span>
  );
}

export function Badge({ children, tone = 'pink', className }: { children: React.ReactNode; tone?: 'pink' | 'saffron' | 'gold' | 'teal' | 'success' | 'danger' | 'neutral'; className?: string }) {
  const tones = {
    pink: 'bg-pink text-white',
    saffron: 'bg-brand text-brand-ink',
    gold: 'bg-accent text-ink',
    teal: 'bg-teal text-white',
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    neutral: 'bg-surface text-fg',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border-2 border-ink px-2 py-0.5 text-xs font-extrabold leading-none', tones[tone], className)}>
      {children}
    </span>
  );
}

// ─── Flavour pieces ─────────────────────────────────────────────────────────

/** Yellow taped note in handwriting, e.g. the "DAY 36" note on End Turn */
export function StickyNote({ children, className, rotate = -6 }: { children: React.ReactNode; className?: string; rotate?: number }) {
  return (
    <div
      className={cn('border-2 border-ink bg-note px-2.5 py-1.5 font-hand font-bold leading-none text-ink shadow-[3px_3px_0_var(--ink)]', className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </div>
  );
}

/** Portrait + comic speech bubble, e.g. the spokesperson's advice */
export function SpeechBubble({ name, role, children, portrait, side = 'left', className }: { name: string; role?: string; children: React.ReactNode; portrait?: React.ReactNode; side?: 'left' | 'right'; className?: string }) {
  return (
    <div className={cn('flex items-end gap-3', side === 'right' && 'flex-row-reverse', className)}>
      <div className="shrink-0 text-center">
        <div className="chunky-sm h-16 w-16 overflow-hidden bg-inset">
          {portrait ?? <ArtPlaceholder label={name} compact className="h-full w-full" />}
        </div>
        <div className="mt-1.5 inline-block -rotate-2 rounded border-2 border-ink bg-accent px-1.5 font-display text-[10px] text-ink">{name}</div>
        {role && <div className="text-[10px] font-semibold text-muted">{role}</div>}
      </div>
      <div className="chunky-sm relative max-w-[16rem] bg-white px-3 py-2 text-sm font-semibold leading-snug text-ink">{children}</div>
    </div>
  );
}

/** Stand-in for an illustration until real art is supplied */
export function ArtPlaceholder({ label, className, compact = false }: { label: string; className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 overflow-hidden text-center text-on-canvas',
        'bg-[repeating-linear-gradient(45deg,#2b2370_0_14px,#241d5e_14px_28px)]',
        className,
      )}
      role="img"
      aria-label={`Illustration placeholder: ${label}`}
    >
      <ImageIcon className={compact ? 'h-5 w-5 text-accent' : 'h-9 w-9 text-accent'} strokeWidth={2.5} aria-hidden="true" />
      {!compact && <span className="px-3 font-display text-xs text-on-canvas-muted">{label}</span>}
    </div>
  );
}

/** The big saffron END TURN button with the handwritten day note */
export function EndTurnButton({ day, onClick, disabled, className }: { day: number; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={onClick}
        disabled={disabled}
        className="chunky pressable flex h-12 w-full items-center justify-center gap-3 bg-brand px-8 font-display text-xl text-brand-ink hover:bg-brand-hover disabled:opacity-50 md:h-16 md:text-3xl"
      >
        <Play className="h-5 w-5 fill-current md:h-7 md:w-7" aria-hidden="true" />
        End Turn
      </button>
      <StickyNote className="pointer-events-none absolute -top-4 right-1 text-center text-xs md:-right-3 md:-top-5 md:text-sm" rotate={8}>
        DAY
        <br />
        <span className="text-lg md:text-2xl">{day}</span>
      </StickyNote>
    </div>
  );
}
