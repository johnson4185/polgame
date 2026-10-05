'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { formatDate } from '@/lib/game/simulation/engine';
import { CreditCard, Wallet, TrendingUp, TrendingDown, ShieldCheck, ArrowDownRight, ArrowUpRight, Award, AlertCircle } from 'lucide-react';

export function FinanceLedgerView() {
  const { state } = useGame();
  const [accountFilter, setAccountFilter] = useState<'ALL' | 'PERSONAL' | 'MOVEMENT' | 'PARTY'>('ALL');

  const filteredTxns = state.transactions.filter(t => {
    if (accountFilter !== 'ALL' && t.account !== accountFilter) return false;
    return true;
  });

  const movementRunwayMonths = state.movement.monthlyBurnRate > 0
    ? (state.movement.movementFunds / state.movement.monthlyBurnRate).toFixed(1)
    : '∞';

  return (
    <div className="space-y-4">
      
      {/* Finance Header in Black, Red, Yellow */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-line bg-surface p-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-danger-fg flex items-center gap-1.5 bg-danger-soft px-2 py-0.5 rounded-xs border border-danger-line">
              <span className="stamp-red text-[9px]">AUDIT LEVEL 1</span>
              <span>TRANSPARENT PUBLIC AUDIT BOOK</span>
            </span>
            <span className="text-faint">|</span>
            <span className="text-xs text-fg-2">Triple Ledger Strict Separation</span>
          </div>
          <h2 className="font-display text-xl font-bold text-fg mt-1">
            Personal Savings · Movement Public Fund · Party Account
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-tactical">
          <div className="rounded-xs border border-line-strong bg-inset px-3.5 py-1.5">
            <span className="text-muted">CASH RUNWAY: </span>
            <span className={`font-black tabular-nums text-sm ${Number(movementRunwayMonths) < 2 ? 'text-danger-fg animate-pulse' : 'text-accent-fg'}`}>
              {movementRunwayMonths} Months
            </span>
          </div>
        </div>
      </div>

      {/* Account Balances Matrix in Black, Red, Yellow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-tactical text-xs">
        
        {/* Personal Account */}
        <div className="rounded-xs border-2 border-line bg-surface p-4 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-muted">
            <span className="font-bold">1. PERSONAL FOUNDER ACCOUNT</span>
            <Wallet className="h-4 w-4 text-accent-fg" />
          </div>
          <div className="text-2xl font-black text-fg tabular-nums">
            ₹{state.player.personalSavings.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-muted font-sans">
            Monthly Living Costs: ₹{state.player.monthlyLivingCost.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Movement Fund */}
        <div className="rounded-xs border-2 border-danger-line bg-danger-soft p-4 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-danger-fg">
            <span className="font-black">2. MOVEMENT OPERATIONAL FUND</span>
            <CreditCard className="h-4 w-4 text-danger-fg" />
          </div>
          <div className="text-2xl font-black text-accent-fg tabular-nums">
            ₹{state.movement.movementFunds.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-fg-2 font-sans">
            Monthly Burn: ₹{state.movement.monthlyBurnRate.toLocaleString('en-IN')}/mo
          </div>
        </div>

        {/* Party Account */}
        <div className="rounded-xs border-2 border-line bg-surface p-4 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-muted">
            <span className="font-bold">3. ELECTORAL PARTY ACCOUNT</span>
            <ShieldCheck className="h-4 w-4 text-success-fg" />
          </div>
          <div className="text-2xl font-black text-fg tabular-nums">
            ₹{state.party.partyFunds.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-muted font-sans">
            {state.party.isFormed ? 'ECI Regulated Candidate Funds' : 'Pending ECI Registration (₹0)'}
          </div>
        </div>

      </div>

      {/* Account Filters */}
      <div className="flex items-center gap-2 text-xs font-tactical">
        <span className="text-muted font-bold">FILTER ACCOUNT:</span>
        {['ALL', 'PERSONAL', 'MOVEMENT', 'PARTY'].map((acc) => (
          <button
            key={acc}
            onClick={() => {
              soundManager.playClick();
              setAccountFilter(acc as any);
            }}
            className={`px-3 py-1 rounded-xs border font-black transition-all ${
              accountFilter === acc
                ? 'border-accent bg-[#FACC15] text-black shadow-xs'
                : 'border-line bg-raised text-muted hover:text-fg hover:border-line-strong'
            }`}
          >
            {acc}
          </button>
        ))}
      </div>

      {/* Transactions Ledger Table */}
      <div className="rounded-xs border-2 border-line bg-surface p-4 text-xs shadow-md">
        <div className="flex items-center justify-between border-b-2 border-line pb-2 mb-3">
          <h3 className="font-tactical font-black text-fg">
            CHRONOLOGICAL PUBLIC TRANSACTION BOOK ({filteredTxns.length} ENTRIES)
          </h3>
          <span className="text-[10px] font-tactical text-muted">
            Immutable Double-Entry Ledger
          </span>
        </div>

        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {filteredTxns.slice().reverse().map((t) => (
            <div
              key={t.id}
              className="rounded-xs border border-line bg-inset p-3 flex items-center justify-between font-tactical hover:border-line-strong transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-xs ${
                  t.type === 'INCOME' ? 'bg-success-soft text-success-fg border border-success-line' : 'bg-danger-soft text-danger-fg border border-danger-line'
                }`}>
                  {t.type === 'INCOME' ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                </div>

                <div>
                  <div className="font-bold text-fg text-xs">{t.description}</div>
                  <div className="text-[10px] text-muted mt-0.5">
                    {formatDate(t.date)} · Account: <span className="text-accent-fg font-bold">{t.account}</span> · Ref: {t.donorName || t.category}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-sm font-black tabular-nums ${
                  t.type === 'INCOME' ? 'text-success-fg' : 'text-danger-fg'
                }`}>
                  {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-faint font-mono">
                  {!t.verified ? (
                    <span className="text-danger-fg font-black animate-pulse">FLAGGED</span>
                  ) : (
                    <span className="text-success-fg font-bold">AUDIT VERIFIED</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
