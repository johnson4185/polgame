'use client';

// Parchment UI kit: interactive pieces built on Radix primitives
// (keyboard navigation, focus management and ARIA come from Radix).
import React from 'react';
import { DropdownMenu, Tabs as RTabs, Tooltip as RTooltip, HoverCard as RHoverCard, Popover as RPopover, Dialog } from 'radix-ui';
import { ChevronDown, X } from 'lucide-react';
import { cn } from './primitives';

// ─── Tabs ───────────────────────────────────────────────────────────────────

export interface TabDef {
  value: string;
  label: string;
  badge?: number;
}

/** Pill tabs like "News · Social Media · Intel · Tasks③" */
export function Tabs({
  tabs,
  value,
  onValueChange,
  defaultValue,
  children,
  className,
  size = 'md',
}: {
  tabs: TabDef[];
  value?: string;
  onValueChange?: (v: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <RTabs.Root value={value} onValueChange={onValueChange} defaultValue={defaultValue ?? tabs[0]?.value} className={className}>
      <RTabs.List className="flex gap-1 overflow-x-auto rounded-md border border-line bg-raised p-1 scrollbar-none">
        {tabs.map(t => (
          <RTabs.Trigger
            key={t.value}
            value={t.value}
            className={cn(
              'relative flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded font-display font-semibold text-fg-2 transition-colors',
              'hover:bg-surface data-[state=active]:bg-brand data-[state=active]:text-white',
              size === 'sm' ? 'h-8 px-2.5 text-sm' : 'h-10 px-3 text-base',
            )}
          >
            {t.label}
            {t.badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold leading-none text-white">
                {t.badge}
              </span>
            ) : null}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
      {children}
    </RTabs.Root>
  );
}

export const TabPanel = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => (
  <RTabs.Content value={value} className={cn('mt-3 outline-none', className)}>
    {children}
  </RTabs.Content>
);

// ─── Dropdown menu ──────────────────────────────────────────────────────────

export interface MenuItem {
  label: string;
  icon?: React.ElementType;
  hint?: string;
  onSelect?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export type MenuEntry = MenuItem | 'separator' | { group: string };

/** Button that opens a dropdown of actions. Pass a custom trigger or a label. */
export function Menu({
  trigger,
  label,
  items,
  align = 'start',
}: {
  trigger?: React.ReactNode;
  label?: string;
  items: MenuEntry[];
  align?: 'start' | 'center' | 'end';
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger ?? (
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line-strong bg-surface px-3 font-display font-semibold uppercase text-fg hover:border-brand data-[state=open]:border-brand">
            {label}
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align={align} sideOffset={6} className={floatingPanel('min-w-56 p-1.5')}>
          {items.map((entry, i) => {
            if (entry === 'separator') return <DropdownMenu.Separator key={i} className="my-1 h-px bg-line" />;
            if ('group' in entry) {
              return (
                <DropdownMenu.Label key={i} className="px-2.5 pb-1 pt-2 font-tactical text-xs font-bold uppercase tracking-wider text-muted">
                  {entry.group}
                </DropdownMenu.Label>
              );
            }
            const Icon = entry.icon;
            return (
              <DropdownMenu.Item
                key={i}
                disabled={entry.disabled}
                onSelect={entry.onSelect}
                className={cn(
                  'flex cursor-pointer select-none items-center gap-2.5 rounded px-2.5 py-2 text-sm font-semibold outline-none',
                  'data-[highlighted]:bg-brand-soft data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40',
                  entry.danger ? 'text-danger-fg' : 'text-fg',
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0 text-brand-fg" aria-hidden="true" />}
                <span className="flex-1">{entry.label}</span>
                {entry.hint && <span className="font-tactical text-xs text-muted">{entry.hint}</span>}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// ─── Tooltip / hover card / popover ─────────────────────────────────────────

const floatingPanel = (extra = '') =>
  cn(
    'z-[70] rounded-lg border border-line-strong bg-surface text-fg shadow-[0_10px_30px_rgb(60_35_20/0.25)]',
    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
    extra,
  );

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RTooltip.Provider delayDuration={250}>{children}</RTooltip.Provider>;
}

/** Short text hint on hover/focus. Wrap the app in <TooltipProvider>. */
export function Tooltip({ content, children, side = 'top' }: { content: React.ReactNode; children: React.ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content side={side} sideOffset={6} className="z-[80] max-w-xs rounded-md bg-[#2a201b] px-2.5 py-1.5 text-sm font-medium text-[#fbf6ec] shadow-lg">
          {content}
          <RTooltip.Arrow className="fill-[#2a201b]" />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}

/** Rich preview on hover, e.g. the Delhi card on the map */
export function HoverCard({ trigger, children, side = 'top' }: { trigger: React.ReactNode; children: React.ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <RHoverCard.Root openDelay={120} closeDelay={80}>
      <RHoverCard.Trigger asChild>{trigger}</RHoverCard.Trigger>
      <RHoverCard.Portal>
        <RHoverCard.Content side={side} sideOffset={8} className={floatingPanel('w-72 p-3')}>
          {children}
          <RHoverCard.Arrow className="fill-surface" />
        </RHoverCard.Content>
      </RHoverCard.Portal>
    </RHoverCard.Root>
  );
}

/** Click-to-open panel for small forms or option pickers */
export function Popover({ trigger, children, align = 'center', className }: { trigger: React.ReactNode; children: React.ReactNode; align?: 'start' | 'center' | 'end'; className?: string }) {
  return (
    <RPopover.Root>
      <RPopover.Trigger asChild>{trigger}</RPopover.Trigger>
      <RPopover.Portal>
        <RPopover.Content align={align} sideOffset={8} className={floatingPanel(cn('w-80 p-4', className))}>
          {children}
          <RPopover.Arrow className="fill-surface" />
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  );
}

// ─── Dialog / event card ────────────────────────────────────────────────────

/**
 * Modal shell styled like the torn-paper event card. Controlled: pass `open`
 * and `onOpenChange`. Set `dismissible={false}` for decisions the player must make.
 */
export function GameDialog({
  open,
  onOpenChange,
  title,
  tag,
  art,
  children,
  dismissible = true,
  size = 'lg',
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  tag?: React.ReactNode;
  art?: React.ReactNode;
  children: React.ReactNode;
  dismissible?: boolean;
  size?: 'md' | 'lg';
}) {
  return (
    <Dialog.Root open={open} onOpenChange={dismissible ? onOpenChange : undefined}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1a120e]/70 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onEscapeKeyDown={e => !dismissible && e.preventDefault()}
          onPointerDownOutside={e => !dismissible && e.preventDefault()}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto',
            'rounded-xl border-2 border-[#d9c4a0] bg-surface shadow-[0_20px_60px_rgb(30_15_10/0.45)] outline-none',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            size === 'lg' ? 'max-w-3xl' : 'max-w-lg',
          )}
        >
          {art && <div className="relative aspect-[16/7] w-full overflow-hidden rounded-t-[10px] border-b-2 border-[#d9c4a0]">{art}</div>}
          {tag && <div className="absolute left-4 top-4 z-10">{tag}</div>}
          {dismissible && (
            <Dialog.Close
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-lg hover:bg-brand-hover"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          )}
          <div className="p-4 sm:p-6">
            <Dialog.Title className="font-display text-3xl font-bold uppercase leading-none text-brand-fg sm:text-4xl">{title}</Dialog.Title>
            <Dialog.Description asChild>
              <div className="mt-3">{children}</div>
            </Dialog.Description>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** One decision row in an event: icon · title/description · consequence chips */
export function ChoiceCard({
  icon: Icon,
  title,
  description,
  effects,
  onSelect,
  emphasis = false,
  disabled,
  disabledReason,
}: {
  icon?: React.ElementType;
  title: string;
  description: string;
  effects?: React.ReactNode;
  onSelect: () => void;
  emphasis?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={cn(
        'group grid w-full grid-cols-[auto_1fr] items-center gap-3 overflow-hidden rounded-lg border-2 text-left transition-all sm:grid-cols-[auto_1fr_auto]',
        'enabled:hover:-translate-y-0.5 enabled:hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50',
        emphasis ? 'border-brand bg-brand text-white' : 'border-line-strong bg-surface text-fg enabled:hover:border-brand',
      )}
    >
      <span className={cn('flex h-full items-center px-3 py-3', emphasis ? 'text-white' : 'text-fg')}>
        {Icon && <Icon className="h-8 w-8" aria-hidden="true" />}
      </span>
      <span className="py-3 pr-3">
        <span className="block font-display text-xl font-bold leading-tight">{title}</span>
        <span className={cn('mt-0.5 block text-sm leading-snug', emphasis ? 'text-white/85' : 'text-fg-2')}>{description}</span>
      </span>
      {effects && (
        <span className="col-span-2 flex flex-wrap items-center gap-4 border-t border-line bg-raised px-4 py-2 sm:col-span-1 sm:h-full sm:w-64 sm:border-l sm:border-t-0">
          {effects}
        </span>
      )}
    </button>
  );
}
