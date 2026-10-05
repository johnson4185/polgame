'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { 
  User, 
  Heart, 
  Zap, 
  Smile, 
  Briefcase, 
  Wallet, 
  CreditCard, 
  BookOpen, 
  Send, 
  Bed, 
  AlertCircle,
  Smartphone,
  MessageSquare,
  Twitter,
  TrendingUp,
  BatteryCharging,
  Activity
} from 'lucide-react';
import Image from 'next/image';

export function PersonalLifeView() {
  const { state, dispatch } = useGame();
  const [donateAmount, setDonateAmount] = useState<number>(10000);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleDonate = () => {
    if (donateAmount <= 0 || donateAmount > state.player.personalSavings) {
      setFeedback('Insufficient personal savings');
      return;
    }
    soundManager.playGavel();
    dispatch({ type: 'PERSONAL_TO_MOVEMENT_DONATION', amount: donateAmount });
    setFeedback(`Injected ₹${donateAmount.toLocaleString('en-IN')} from personal savings to movement war chest`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRest = () => {
    soundManager.playClick();
    dispatch({ type: 'REST_DAY' });
  };

  const handleEmploymentChange = (status: 'FULL_TIME_JOB' | 'LEAVE_OF_ABSENCE' | 'FULL_TIME_ACTIVISM') => {
    soundManager.playClick();
    dispatch({ type: 'TOGGLE_EMPLOYMENT', status });
  };

  return (
    <div className="space-y-4">
      
      {/* Profile Overview Card with Black, Red, Yellow Secondary Highlights */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xs border-2 border-line bg-surface p-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-xs border-2 border-accent bg-inset shadow-md">
            <Image
              src="/images/portrait_abhijeet_1790774328368.jpg"
              alt={state.player.name}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="font-display text-2xl font-bold text-fg">{state.player.name}</h2>
              <span className="stamp-red text-[10px]">
                {state.player.campaignMode === 'ABHIJEET_CJP' ? 'HISTORICAL PROTAGONIST' : 'CITIZEN STRATEGIST'}
              </span>
            </div>
            <p className="text-xs text-fg-2 font-medium mt-0.5">{state.player.roleTitle}</p>
            <p className="text-[11px] font-tactical text-muted mt-1 flex items-center gap-1.5">
              <span>Background:</span>
              <span className="bg-inset text-accent-fg font-bold px-2 py-0.5 rounded-xs border border-line-strong">
                {state.player.background.replace(/_/g, ' ')}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleRest}
          className="flex items-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 px-4 py-2.5 font-tactical text-xs font-black text-white hover:bg-red-700 transition-all shadow-md active:translate-y-0.5"
        >
          <Bed className="h-4 w-4 text-accent-fg" />
          <span>Rest &amp; Recover Energy (24h)</span>
        </button>
      </div>

      {feedback && (
        <div className="rounded-xs bg-accent-soft border-2 border-accent px-4 py-2.5 text-xs font-bold text-accent-fg shadow-md flex items-center gap-2 animate-bounce">
          <Zap className="h-4 w-4 text-accent-fg" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Vitals and Daily Health Status Grid in Red, Yellow, Black */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Physical Health */}
        <div className="rounded-xs border-2 border-line bg-surface p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs font-tactical text-muted">
            <span className="font-bold">PHYSICAL HEALTH</span>
            <Heart className="h-4 w-4 text-danger-fg" />
          </div>
          <div className="text-2xl font-black font-tactical text-fg mt-1 tabular-nums flex items-baseline gap-1">
            <span className={state.player.health < 40 ? 'text-danger-fg' : 'text-success-fg'}>{state.player.health}%</span>
            <span className="text-xs text-faint font-normal">/ 100</span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-xs bg-inset border border-line overflow-hidden">
            <div className={`h-full rounded-xs ${state.player.health < 40 ? "bg-[#DC2626]" : "bg-emerald-500"} transition-all duration-300`} style={{ width: `${state.player.health}%` }} />
          </div>
        </div>

        {/* Stamina & Energy in Yellow */}
        <div className="rounded-xs border-2 border-line bg-surface p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs font-tactical text-muted">
            <span className="font-bold">STAMINA &amp; ENERGY</span>
            <Zap className="h-4 w-4 text-accent-fg" />
          </div>
          <div className="text-2xl font-black font-tactical text-fg mt-1 tabular-nums flex items-baseline gap-1">
            <span className={state.player.energy < 30 ? 'text-danger-fg' : 'text-accent-fg'}>{state.player.energy}%</span>
            <span className="text-xs text-faint font-normal">/ 100</span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-xs bg-inset border border-line overflow-hidden">
            <div className="h-full rounded-xs bg-[#FACC15] transition-all duration-300" style={{ width: `${state.player.energy}%` }} />
          </div>
        </div>

        {/* Stress & Burnout in Red */}
        <div className="rounded-xs border-2 border-line bg-surface p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs font-tactical text-muted">
            <span className="font-bold">STRESS &amp; PRESSURE</span>
            <Activity className="h-4 w-4 text-danger-fg" />
          </div>
          <div className={`text-2xl font-black font-tactical mt-1 tabular-nums flex items-baseline gap-1 ${state.player.stress > 65 ? 'text-danger-fg' : 'text-fg'}`}>
            <span>{state.player.stress}%</span>
            <span className="text-xs text-faint font-normal">/ 100</span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-xs bg-inset border border-line overflow-hidden">
            <div 
              className={`h-full rounded-xs transition-all duration-300 ${state.player.stress > 65 ? 'bg-[#EF4444] animate-pulse' : 'bg-orange-500'}`} 
              style={{ width: `${state.player.stress}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Interactive Smartphone Desk Widget + Finances Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Personal Finances & Employment (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Personal Finances */}
          <div className="rounded-xs border-2 border-line bg-surface p-4 text-xs space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b-2 border-line pb-2">
              <h3 className="font-tactical font-black text-fg flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-accent-fg" />
                <span>PERSONAL SAVINGS & HOUSEHOLD LEDGER</span>
              </h3>
              <span className="stamp-yellow text-[10px]">INDEPENDENT AUDIT</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-tactical">
              <div className="rounded-xs border border-line-strong bg-inset p-3">
                <span className="text-muted text-[11px]">PERSONAL BANK SAVINGS:</span>
                <div className="text-xl font-black text-success-fg mt-1 tabular-nums">
                  ₹{state.player.personalSavings.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="rounded-xs border border-line-strong bg-inset p-3">
                <span className="text-muted text-[11px]">MONTHLY LIVING EXPENSE:</span>
                <div className="text-xl font-black text-danger-fg mt-1 tabular-nums">
                  ₹{state.player.monthlyLivingCost.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-3">
              <label className="font-tactical font-bold text-fg block mb-1.5">
                Inject Personal Capital into Movement War Chest:
              </label>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <input
                  type="number"
                  step="5000"
                  min="1000"
                  max={state.player.personalSavings}
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(Number(e.target.value))}
                  className="w-40 rounded-xs border-2 border-line-strong bg-inset px-3 py-2 font-tactical text-xs text-fg focus:outline-none focus:border-accent"
                />
                <button
                  onClick={handleDonate}
                  disabled={state.player.personalSavings < donateAmount}
                  className="flex items-center gap-1.5 rounded-xs bg-[#DC2626] border-2 border-red-500 px-4 py-2 font-tactical font-black text-white hover:bg-red-700 transition-colors disabled:bg-line-strong disabled:border-line-strong disabled:text-faint disabled:cursor-not-allowed shadow-xs"
                >
                  <Send className="h-3.5 w-3.5 text-accent-fg" />
                  <span>Transfer Funds</span>
                </button>
              </div>
              <p className="text-[11px] text-faint mt-1.5 font-mono">
                *Separation of personal and public movement accounts strictly enforced by simulation ethics.
              </p>
            </div>
          </div>

          {/* Employment & Day Commitments */}
          <div className="rounded-xs border-2 border-line bg-surface p-4 text-xs space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b-2 border-line pb-2">
              <h3 className="font-tactical font-black text-fg flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-accent-fg" />
                <span>EMPLOYMENT STATUS & TIME ALLOCATION</span>
              </h3>
              <span className="text-muted font-mono text-[11px]">Salary: ₹{state.player.salaryMonthly.toLocaleString('en-IN')}/mo</span>
            </div>

            <div className="space-y-2 pt-1 font-tactical">
              {[
                {
                  id: 'FULL_TIME_JOB',
                  label: 'Maintain Corporate Employment',
                  desc: `Guarantees ₹${state.player.salaryMonthly.toLocaleString('en-IN')}/mo income, but drains 8 extra energy points every day.`,
                },
                {
                  id: 'LEAVE_OF_ABSENCE',
                  label: 'Official Unpaid Leave of Absence',
                  desc: 'Job held in reserve. No monthly income, but gives maximum daily stamina for ground organizing.',
                },
                {
                  id: 'FULL_TIME_ACTIVISM',
                  label: 'Resign & Dedicate 100% to Public Service',
                  desc: 'Sever corporate ties completely. Live exclusively on personal savings and transparent community stipends.',
                },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleEmploymentChange(option.id as any)}
                  className={`w-full text-left p-3 rounded-xs border-2 transition-all ${
                    state.player.employmentStatus === option.id
                      ? 'border-accent bg-inset text-fg font-bold shadow-md ring-1 ring-[#FACC15]/40'
                      : 'border-line bg-raised text-fg-2 hover:border-line-strong hover:bg-raised'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={state.player.employmentStatus === option.id ? 'text-accent-fg' : 'text-fg'}>
                      {option.label}
                    </span>
                    {state.player.employmentStatus === option.id && (
                      <span className="text-[10px] bg-[#DC2626] text-white px-1.5 py-0.5 rounded-xs font-black">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted font-normal mt-1 font-sans">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Citizen Smartphone Widget (5 cols) */}
        <div className="lg:col-span-5 rounded-xs border-2 border-line bg-canvas p-4 text-xs shadow-xl space-y-3">
          
          {/* Smartphone Frame Header */}
          <div className="flex items-center justify-between border-b-2 border-line pb-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Smartphone className="h-4 w-4 text-accent-fg" />
              <span className="font-tactical font-black text-fg text-xs">CITIZEN COMMUNICATOR</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
              <span className="text-accent-fg">5G CONNECTED</span>
              <span>● 88%</span>
            </div>
          </div>

          {/* Social Media & Instant Messaging Feed */}
          <div className="space-y-2.5">
            {/* WhatsApp Group Notification */}
            <div className="rounded-xs border border-success-line bg-success-soft p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-success-fg">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-success-fg" />
                  <span>WhatsApp: Jantar Mantar Volunteer Core</span>
                </span>
                <span className="text-[9px] text-muted">Just now</span>
              </div>
              <p className="text-[11px] text-fg">
                &ldquo;Buses carrying 400 NEET aspirants from Rajasthan just arrived at Delhi border. Police checking banners.&rdquo;
              </p>
            </div>

            {/* X / Twitter Trend Alert */}
            <div className="rounded-xs border border-line bg-inset p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-info-fg">
                <span className="flex items-center gap-1">
                  <Twitter className="h-3 w-3 text-info-fg" />
                  <span>X Viral Trend India</span>
                </span>
                <span className="stamp-red text-[8px]">#1 TRENDING</span>
              </div>
              <p className="text-[11px] text-fg font-mono">
                #CockroachJanta · 184K Posts
              </p>
              <p className="text-[10px] text-muted">
                Citizens posting videos of paper leaks and judicial accountability debates across colleges.
              </p>
            </div>

            {/* Delhi Power Discom SMS */}
            <div className="rounded-xs border border-accent-line bg-accent-soft p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-accent-fg">
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-accent-fg" />
                  <span>BSES Electricity Bill</span>
                </span>
                <span className="text-[9px] text-muted">Due in 5 days</span>
              </div>
              <p className="text-[11px] text-fg-2">
                Bill amount ₹2,840 for June cycle. Auto-debited from personal account if not deferred.
              </p>
            </div>
          </div>

          {/* Quick Motivational Quote */}
          <div className="border-t border-line pt-2 text-[11px] text-muted italic font-serif">
            &ldquo;When an ordinary citizen becomes angry enough to challenge the system, history begins to bend.&rdquo;
          </div>
        </div>

      </div>

      {/* Skills Matrix in Black, Red, Yellow */}
      <div className="rounded-xs border-2 border-line bg-surface p-4 text-xs shadow-md">
        <h3 className="font-tactical font-black text-fg border-b-2 border-line pb-2 mb-3 flex items-center justify-between">
          <span>PERSONAL LEADERSHIP & CIVIC SKILLS PROFILE</span>
          <span className="text-accent-fg text-[11px] font-mono">MAX: 10/10</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 font-tactical">
          {[
            { label: 'COMMUNICATION', val: state.player.communication },
            { label: 'ORGANIZING', val: state.player.organizing },
            { label: 'RESEARCH & RTI', val: state.player.research },
            { label: 'NEGOTIATION', val: state.player.negotiation },
            { label: 'LEADERSHIP', val: state.player.leadership },
            { label: 'FINANCES', val: state.player.financialAcumen },
          ].map((skill, idx) => (
            <div key={idx} className="rounded-xs border border-line bg-inset p-2.5 text-center">
              <span className="text-muted text-[10px] font-bold block">{skill.label}</span>
              <div className="text-xl font-black text-accent-fg mt-1 tabular-nums">{skill.val}/10</div>
              <div className="mt-1.5 h-1.5 w-full bg-raised rounded-xs overflow-hidden">
                <div className="h-full bg-[#FACC15]" style={{ width: `${skill.val * 10}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
