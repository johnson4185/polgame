'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, CreditCard, Landmark, ReceiptText, Wallet } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { formatDate } from '@/lib/game/simulation/engine';
import type { Transaction } from '@/lib/game/types';
import { Badge, Panel, PanelHeader, StatCard } from '@/components/ui/primitives';
import { TabPanel, Tabs } from '@/components/ui/menus';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const ACCOUNT_LABEL: Record<Transaction['account'], string> = { PERSONAL: 'Personal', MOVEMENT: 'Movement', PARTY: 'Party' };

/** Ledgers: three separate accounts, runway, and the transaction book by account. */
export function FinanceLedgerView() {
  const { state } = useGame();
  const { movementFunds, monthlyBurnRate } = state.movement;
  const runway = monthlyBurnRate > 0 ? movementFunds / monthlyBurnRate : Infinity;
  const txns = state.transactions;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Wallet} iconTone="teal" label="Your savings" value={inr(state.player.personalSavings)}>
          <div className="mt-1 text-xs font-bold text-muted">Living costs {inr(state.player.monthlyLivingCost)}/month</div>
        </StatCard>
        <StatCard icon={CreditCard} iconTone="saffron" label="Movement fund" value={inr(movementFunds)}>
          <div className="mt-1 text-xs font-bold text-muted">Spending {inr(monthlyBurnRate)}/month</div>
        </StatCard>
        <StatCard icon={Landmark} iconTone="pink" label="Party account" value={inr(state.party.partyFunds)}>
          <div className="mt-1 text-xs font-bold text-muted">{state.party.isFormed ? 'Regulated by the ECI' : 'Opens when the party registers'}</div>
        </StatCard>
      </div>

      <Panel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PanelHeader title="Runway" icon={ReceiptText} />
          <Badge tone={runway < 2 ? 'danger' : runway < 4 ? 'gold' : 'success'}>
            {Number.isFinite(runway) ? `${runway.toFixed(1)} months of movement funds` : 'No monthly spending'}
          </Badge>
        </div>
        <p className="mt-2 text-sm font-semibold text-fg-2">
          The three accounts are kept apart: personal money never pays for the movement, and movement money never pays
          for party campaigns. {runway < 2 && 'Funds are running low. Hold a fundraiser or cut stipends.'}
        </p>
      </Panel>

      <Panel className="p-3 sm:p-4">
        <Tabs
          size="sm"
          tabs={[
            { value: 'ALL', label: 'All', badge: txns.length },
            { value: 'MOVEMENT', label: 'Movement' },
            { value: 'PERSONAL', label: 'Personal' },
            { value: 'PARTY', label: 'Party' },
          ]}
        >
          {(['ALL', 'MOVEMENT', 'PERSONAL', 'PARTY'] as const).map(acc => (
            <TabPanel key={acc} value={acc}>
              <Book list={acc === 'ALL' ? txns : txns.filter(t => t.account === acc)} />
            </TabPanel>
          ))}
        </Tabs>
      </Panel>
    </div>
  );
}

function Book({ list }: { list: Transaction[] }) {
  if (list.length === 0) return <p className="py-8 text-center text-sm font-semibold text-muted">No entries yet.</p>;
  const income = list.filter(t => t.type === 'INCOME').reduce((n, t) => n + t.amount, 0);
  const spent = list.filter(t => t.type === 'EXPENSE').reduce((n, t) => n + t.amount, 0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge tone="success">In {inr(income)}</Badge>
        <Badge tone="danger">Out {inr(spent)}</Badge>
        <Badge tone="neutral">{list.length} entries</Badge>
      </div>
      {/* the engine keeps the newest entry first */}
      <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
        {list.map(t => {
          const inc = t.type === 'INCOME';
          return (
            <li key={t.id} className="chunky-sm flex items-center gap-3 bg-raised p-2.5">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-ink text-white ${inc ? 'bg-success' : 'bg-danger'}`}>
                {inc ? <ArrowDownRight className="h-4 w-4" strokeWidth={3} aria-label="Income" /> : <ArrowUpRight className="h-4 w-4" strokeWidth={3} aria-label="Expense" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm font-bold text-fg first-letter:uppercase">{t.description}</div>
                <div className="truncate text-xs font-semibold text-muted">
                  {formatDate(t.date)} · {ACCOUNT_LABEL[t.account]} · {t.donorName || t.category}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className={`text-sm font-extrabold tabular-nums ${inc ? 'text-success-fg' : 'text-danger-fg'}`}>
                  {inc ? '+' : '−'}
                  {inr(t.amount)}
                </div>
                {!t.verified && <Badge tone="danger">Flagged</Badge>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
