'use client';

// Parchment UI kit: static building blocks used across every screen.
// Interactive pieces (tabs, menus, tooltips, dialogs) live in ./menus.tsx.
import React from 'react';
import { ArrowRight, ImageIcon, Play, TrendingDown, TrendingUp } from 'lucide-react';

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

// ─── Buttons ────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white border-brand-hover hover:bg-brand-hover shadow-[inset_0_-2px_0_rgb(0_0_0/0.2)]',
  secondary: 'bg-surface text-fg border-line-strong hover:border-brand hover:text-brand-fg',
  ghost: 'bg-transparent text-fg-2 border-transparent hover:bg-raised',
  danger: 'bg-danger text-white border-danger hover:brightness-95',
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-14 px-6 text-xl',
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; icon?: React.ElementType }
>(function Button({ variant = 'primary', size = 'md', icon: Icon, className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border font-display font-semibold uppercase tracking-wide transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className={size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} aria-hidden="true" />}
      {children}
    </button>
  );
});

// ─── Panels ─────────────────────────────────────────────────────────────────

export function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('rounded-lg border border-line bg-surface shadow-card', className)} {...props}>
      {children}
    </section>
  );
}

/** Section title with the maroon left rule, e.g. "ACTIVE CAMPAIGNS · View All →" */
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
      <h2 className="flex items-center gap-2 border-l-4 border-brand pl-2.5 font-display text-xl font-bold uppercase leading-none text-fg">
        {Icon && <Icon className="h-5 w-5 text-brand-fg" aria-hidden="true" />}
        {title}
      </h2>
      {action && (
        <button onClick={onAction} className="flex items-center gap-1 text-sm font-semibold text-fg-2 hover:text-brand-fg">
          {action}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ─── Stats ──────────────────────────────────────────────────────────────────

/** Top-bar stat tile: dark icon block + label + big value + delta */
export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  iconTone = 'ink',
  children,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  delta?: number;
  iconTone?: 'ink' | 'brand' | 'gold' | 'success';
  children?: React.ReactNode;
  className?: string;
}) {
  const tones = {
    ink: 'bg-[#2a201b] text-white',
    brand: 'bg-brand text-white',
    gold: 'bg-accent text-[#2a201b]',
    success: 'bg-success text-white',
  };
  return (
    <div className={cn('flex min-w-0 items-stretch overflow-hidden rounded-md border border-line-strong bg-surface shadow-card', className)}>
      <div className={cn('flex w-11 shrink-0 items-center justify-center', tones[iconTone])}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 px-2.5 py-1">
        <div className="truncate font-tactical text-sm font-semibold text-muted">{label}</div>
        <div className="flex items-baseline gap-1.5">
          {value !== undefined && <span className="truncate font-display text-xl font-bold leading-tight text-fg">{value}</span>}
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
    <span className={cn('flex items-center gap-0.5 font-tactical text-xs font-bold', up ? 'text-success-fg' : 'text-danger-fg')}>
      {up ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
      {up ? '+' : ''}
      {value}
      {suffix}
    </span>
  );
}

type MeterTone = 'success' | 'danger' | 'accent' | 'brand';
const meterFill: Record<MeterTone, string> = {
  success: 'bg-success',
  danger: 'bg-danger',
  accent: 'bg-accent',
  brand: 'bg-brand',
};

/** Labelled horizontal bar: "Energy ▓▓▓▓░ 78/100" */
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
        <span className="flex w-20 shrink-0 items-center gap-1.5 text-sm font-semibold text-fg-2">
          {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
          {label}
        </span>
      )}
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-inset"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className={cn('h-full rounded-full transition-all duration-500', meterFill[tone])} style={{ width: `${pct}%` }} />
      </div>
      {showValue && (
        <span className="w-14 shrink-0 text-right font-tactical text-sm font-semibold text-fg-2">
          {value}/{max}
        </span>
      )}
    </div>
  );
}

/** Blocky meter like "Legal Heat ▮▮▮▮▮▮▯▯" */
export function SegmentMeter({ value, max = 100, segments = 8, tone = 'danger' }: { value: number; max?: number; segments?: number; tone?: MeterTone }) {
  const filled = Math.round((value / max) * segments);
  return (
    <div className="flex gap-0.5" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={cn('h-3 w-2.5 rounded-[2px]', i < filled ? meterFill[tone] : 'bg-inset')} />
      ))}
    </div>
  );
}

// ─── Chips & badges ─────────────────────────────────────────────────────────

/** Consequence chip on choices: icon + "+2.5M" over "Followers" */
export function EffectChip({ icon: Icon, value, label, tone }: { icon?: React.ElementType; value: string; label: string; tone: 'good' | 'bad' | 'neutral' }) {
  const toneClass =
    tone === 'good' ? 'text-success-fg' :
    tone === 'bad' ? 'text-danger-fg' :
    'text-fg-2';
  return (
    <div className={cn('flex items-center gap-1.5', toneClass)}>
      {Icon && <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />}
      <div className="leading-tight">
        <div className="font-display text-lg font-bold">{value}</div>
        <div className="text-xs font-semibold">{label}</div>
      </div>
    </div>
  );
}

export function Badge({ children, tone = 'brand', className }: { children: React.ReactNode; tone?: 'brand' | 'accent' | 'success' | 'neutral' | 'danger'; className?: string }) {
  const tones = {
    brand: 'bg-brand text-white',
    accent: 'bg-accent text-[#2a201b]',
    success: 'bg-success-soft text-success-fg',
    danger: 'bg-danger-soft text-danger-fg',
    neutral: 'bg-raised text-fg-2 border border-line',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-1.5 py-0.5 font-tactical text-xs font-bold leading-none', tones[tone], className)}>
      {children}
    </span>
  );
}

// ─── Flavour pieces ─────────────────────────────────────────────────────────

/** Yellow taped note in handwriting, e.g. the "DAY 36" note on End Turn */
export function StickyNote({ children, className, rotate = -6 }: { children: React.ReactNode; className?: string; rotate?: number }) {
  return (
    <div
      className={cn('bg-note px-2.5 py-1.5 font-hand font-bold leading-none text-fg shadow-[2px_3px_6px_rgb(60_35_20/0.25)]', className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </div>
  );
}

/** Portrait + speech bubble, e.g. the spokesperson's advice */
export function SpeechBubble({ name, role, children, portrait, side = 'left', className }: { name: string; role?: string; children: React.ReactNode; portrait?: React.ReactNode; side?: 'left' | 'right'; className?: string }) {
  return (
    <div className={cn('flex items-end gap-3', side === 'right' && 'flex-row-reverse', className)}>
      <div className="shrink-0 text-center">
        <div className="h-16 w-16 overflow-hidden rounded-md border-2 border-surface bg-inset shadow-card">
          {portrait ?? <ArtPlaceholder label={name} compact className="h-full w-full" />}
        </div>
        <div className="mt-1 font-display text-xs font-bold text-fg">{name}</div>
        {role && <div className="text-[10px] text-muted">{role}</div>}
      </div>
      <div className="relative max-w-xs rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm leading-snug text-fg shadow-card">
        {children}
      </div>
    </div>
  );
}

/** Stand-in for an illustration until real art is supplied */
export function ArtPlaceholder({ label, className, compact = false }: { label: string; className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 overflow-hidden bg-[linear-gradient(135deg,#d9c3a1_0%,#c8a77f_45%,#a8794f_100%)] text-center text-[#3b2a20]',
        className,
      )}
      role="img"
      aria-label={`Illustration placeholder: ${label}`}
    >
      <ImageIcon className={compact ? 'h-5 w-5 opacity-60' : 'h-8 w-8 opacity-60'} aria-hidden="true" />
      {!compact && <span className="px-3 font-tactical text-sm font-semibold opacity-80">{label}</span>}
    </div>
  );
}

/** The big maroon END TURN button with the handwritten day note */
export function EndTurnButton({ day, onClick, disabled }: { day: number; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex h-16 w-full items-center justify-center gap-3 rounded-lg border-2 border-brand-hover bg-brand px-8 font-display text-3xl font-bold uppercase tracking-wide text-white shadow-[inset_0_-4px_0_rgb(0_0_0/0.25),0_4px_12px_rgb(90_20_20/0.3)] transition-colors hover:bg-brand-hover disabled:opacity-50"
      >
        <Play className="h-7 w-7 fill-current" aria-hidden="true" />
        End Turn
      </button>
      <StickyNote className="pointer-events-none absolute -right-2 -top-4 text-center text-sm" rotate={8}>
        DAY
        <br />
        <span className="text-2xl">{day}</span>
      </StickyNote>
    </div>
  );
}
