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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-zinc-800 bg-[#0E1320] p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5 bg-red-950/40 px-2 py-0.5 rounded-xs border border-red-900/60">
              <span className="stamp-red text-[9px]">AUDIT LEVEL 1</span>
              <span>TRANSPARENT PUBLIC AUDIT BOOK</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs text-zinc-300">Triple Ledger Strict Separation</span>
          </div>
          <h2 className="font-tactical text-xl font-black text-white mt-1">
            Personal Savings · Movement Public Fund · Party Account
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-tactical">
          <div className="rounded-xs border border-zinc-700 bg-black px-3.5 py-1.5">
            <span className="text-zinc-400">CASH RUNWAY: </span>
            <span className={`font-black tabular-nums text-sm ${Number(movementRunwayMonths) < 2 ? 'text-[#EF4444] animate-pulse' : 'text-[#FACC15]'}`}>
              {movementRunwayMonths} Months
            </span>
          </div>
        </div>
      </div>

      {/* Account Balances Matrix in Black, Red, Yellow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-tactical text-xs">
        
        {/* Personal Account */}
        <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-bold">1. PERSONAL FOUNDER ACCOUNT</span>
            <Wallet className="h-4 w-4 text-[#FACC15]" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            ₹{state.player.personalSavings.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-zinc-400 font-sans">
            Monthly Living Costs: ₹{state.player.monthlyLivingCost.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Movement Fund */}
        <div className="rounded-xs border-2 border-red-900/80 bg-[#160D12] p-4 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-[#EF4444]">
            <span className="font-black">2. MOVEMENT OPERATIONAL FUND</span>
            <CreditCard className="h-4 w-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-black text-[#FACC15] tabular-nums">
            ₹{state.movement.movementFunds.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-zinc-300 font-sans">
            Monthly Burn: ₹{state.movement.monthlyBurnRate.toLocaleString('en-IN')}/mo
          </div>
        </div>

        {/* Party Account */}
        <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-bold">3. ELECTORAL PARTY ACCOUNT</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            ₹{state.party.partyFunds.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-zinc-400 font-sans">
            {state.party.isFormed ? 'ECI Regulated Candidate Funds' : 'Pending ECI Registration (₹0)'}
          </div>
        </div>

      </div>

      {/* Account Filters */}
      <div className="flex items-center gap-2 text-xs font-tactical">
        <span className="text-zinc-400 font-bold">FILTER ACCOUNT:</span>
        {['ALL', 'PERSONAL', 'MOVEMENT', 'PARTY'].map((acc) => (
          <button
            key={acc}
            onClick={() => {
              soundManager.playClick();
              setAccountFilter(acc as any);
            }}
            className={`px-3 py-1 rounded-xs border font-black transition-all ${
              accountFilter === acc
                ? 'border-[#FACC15] bg-[#FACC15] text-black shadow-xs'
                : 'border-zinc-800 bg-[#121624] text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
          >
            {acc}
          </button>
        ))}
      </div>

      {/* Transactions Ledger Table */}
      <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs shadow-md">
        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2 mb-3">
          <h3 className="font-tactical font-black text-white">
            CHRONOLOGICAL PUBLIC TRANSACTION BOOK ({filteredTxns.length} ENTRIES)
          </h3>
          <span className="text-[10px] font-tactical text-zinc-400">
            Immutable Double-Entry Ledger
          </span>
        </div>

        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {filteredTxns.slice().reverse().map((t) => (
            <div
              key={t.id}
              className="rounded-xs border border-zinc-800 bg-black/80 p-3 flex items-center justify-between font-tactical hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-xs ${
                  t.type === 'INCOME' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-[#EF4444] border border-red-800'
                }`}>
                  {t.type === 'INCOME' ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                </div>

                <div>
                  <div className="font-bold text-white text-xs">{t.description}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {formatDate(t.date)} · Account: <span className="text-[#FACC15] font-bold">{t.account}</span> · Ref: {t.donorName || t.category}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-sm font-black tabular-nums ${
                  t.type === 'INCOME' ? 'text-emerald-400' : 'text-[#EF4444]'
                }`}>
                  {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  {!t.verified ? (
                    <span className="text-[#EF4444] font-black animate-pulse">FLAGGED</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">AUDIT VERIFIED</span>
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
