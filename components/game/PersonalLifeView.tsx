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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-xs border-2 border-[#FACC15] bg-black shadow-md">
            <Image
              src="/images/portrait_abhijeet_1790774328368.jpg"
              alt={state.player.name}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tactical text-2xl font-black text-white">{state.player.name}</h2>
              <span className="stamp-red text-[10px]">
                {state.player.campaignMode === 'ABHIJEET_CJP' ? 'HISTORICAL PROTAGONIST' : 'CITIZEN STRATEGIST'}
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-medium mt-0.5">{state.player.roleTitle}</p>
            <p className="text-[11px] font-tactical text-zinc-400 mt-1 flex items-center gap-1.5">
              <span>Background:</span>
              <span className="bg-black text-[#FACC15] font-bold px-2 py-0.5 rounded-xs border border-zinc-700">
                {state.player.background.replace(/_/g, ' ')}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleRest}
          className="flex items-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 px-4 py-2.5 font-tactical text-xs font-black text-white hover:bg-red-700 transition-all shadow-md active:translate-y-0.5"
        >
          <Bed className="h-4 w-4 text-[#FACC15]" />
          <span>Rest &amp; Recover Energy (24h)</span>
        </button>
      </div>

      {feedback && (
        <div className="rounded-xs bg-yellow-950/80 border-2 border-[#FACC15] px-4 py-2.5 text-xs font-bold text-[#FDE047] shadow-md flex items-center gap-2 animate-bounce">
          <Zap className="h-4 w-4 text-[#FACC15]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Vitals and Daily Health Status Grid in Red, Yellow, Black */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Physical Health */}
        <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs font-tactical text-zinc-400">
            <span className="font-bold">PHYSICAL HEALTH</span>
            <Heart className="h-4 w-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-black font-tactical text-white mt-1 tabular-nums flex items-baseline gap-1">
            <span className={state.player.health < 40 ? 'text-[#EF4444]' : 'text-emerald-400'}>{state.player.health}%</span>
            <span className="text-xs text-zinc-500 font-normal">/ 100</span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-xs bg-black border border-zinc-800 overflow-hidden">
            <div className="h-full rounded-xs bg-[#EF4444] transition-all duration-300" style={{ width: `${state.player.health}%` }} />
          </div>
        </div>

        {/* Stamina & Energy in Yellow */}
        <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs font-tactical text-zinc-400">
            <span className="font-bold">STAMINA &amp; ENERGY</span>
            <Zap className="h-4 w-4 text-[#FACC15]" />
          </div>
          <div className="text-2xl font-black font-tactical text-white mt-1 tabular-nums flex items-baseline gap-1">
            <span className={state.player.energy < 30 ? 'text-[#EF4444]' : 'text-[#FACC15]'}>{state.player.energy}%</span>
            <span className="text-xs text-zinc-500 font-normal">/ 100</span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-xs bg-black border border-zinc-800 overflow-hidden">
            <div className="h-full rounded-xs bg-[#FACC15] transition-all duration-300" style={{ width: `${state.player.energy}%` }} />
          </div>
        </div>

        {/* Stress & Burnout in Red */}
        <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs font-tactical text-zinc-400">
            <span className="font-bold">STRESS &amp; PRESSURE</span>
            <Activity className="h-4 w-4 text-[#EF4444]" />
          </div>
          <div className={`text-2xl font-black font-tactical mt-1 tabular-nums flex items-baseline gap-1 ${state.player.stress > 65 ? 'text-[#EF4444]' : 'text-zinc-200'}`}>
            <span>{state.player.stress}%</span>
            <span className="text-xs text-zinc-500 font-normal">/ 100</span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-xs bg-black border border-zinc-800 overflow-hidden">
            <div 
              className={`h-full rounded-xs transition-all duration-300 ${state.player.stress > 65 ? 'bg-[#EF4444] animate-pulse' : 'bg-purple-600'}`} 
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
          <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2">
              <h3 className="font-tactical font-black text-white flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#FACC15]" />
                <span>PERSONAL SAVINGS & HOUSEHOLD LEDGER</span>
              </h3>
              <span className="stamp-yellow text-[10px]">INDEPENDENT AUDIT</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-tactical">
              <div className="rounded-xs border border-zinc-700 bg-black p-3">
                <span className="text-zinc-400 text-[11px]">PERSONAL BANK SAVINGS:</span>
                <div className="text-xl font-black text-emerald-400 mt-1 tabular-nums">
                  ₹{state.player.personalSavings.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="rounded-xs border border-zinc-700 bg-black p-3">
                <span className="text-zinc-400 text-[11px]">MONTHLY LIVING EXPENSE:</span>
                <div className="text-xl font-black text-[#EF4444] mt-1 tabular-nums">
                  ₹{state.player.monthlyLivingCost.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3">
              <label className="font-tactical font-bold text-zinc-200 block mb-1.5">
                Inject Personal Capital into Movement War Chest:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="5000"
                  min="1000"
                  max={state.player.personalSavings}
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(Number(e.target.value))}
                  className="w-40 rounded-xs border-2 border-zinc-700 bg-black px-3 py-2 font-tactical text-xs text-white focus:outline-none focus:border-[#FACC15]"
                />
                <button
                  onClick={handleDonate}
                  disabled={state.player.personalSavings < donateAmount}
                  className="flex items-center gap-1.5 rounded-xs bg-[#DC2626] border-2 border-red-500 px-4 py-2 font-tactical font-black text-white hover:bg-red-700 transition-colors disabled:bg-zinc-800 disabled:border-zinc-700 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-xs"
                >
                  <Send className="h-3.5 w-3.5 text-[#FACC15]" />
                  <span>Transfer Funds</span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
                *Separation of personal and public movement accounts strictly enforced by simulation ethics.
              </p>
            </div>
          </div>

          {/* Employment & Day Commitments */}
          <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2">
              <h3 className="font-tactical font-black text-white flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-[#FACC15]" />
                <span>EMPLOYMENT STATUS & TIME ALLOCATION</span>
              </h3>
              <span className="text-zinc-400 font-mono text-[11px]">Salary: ₹{state.player.salaryMonthly.toLocaleString('en-IN')}/mo</span>
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
                      ? 'border-[#FACC15] bg-black text-white font-bold shadow-md ring-1 ring-[#FACC15]/40'
                      : 'border-zinc-800 bg-[#121624] text-zinc-300 hover:border-zinc-700 hover:bg-[#181F30]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={state.player.employmentStatus === option.id ? 'text-[#FACC15]' : 'text-zinc-200'}>
                      {option.label}
                    </span>
                    {state.player.employmentStatus === option.id && (
                      <span className="text-[10px] bg-[#DC2626] text-white px-1.5 py-0.5 rounded-xs font-black">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-normal mt-1 font-sans">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Citizen Smartphone Widget (5 cols) */}
        <div className="lg:col-span-5 rounded-xs border-2 border-zinc-800 bg-[#080B11] p-4 text-xs shadow-xl space-y-3">
          
          {/* Smartphone Frame Header */}
          <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-[#FACC15]" />
              <span className="font-tactical font-black text-white text-xs">CITIZEN COMMUNICATOR</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="text-[#FACC15]">5G CONNECTED</span>
              <span>● 88%</span>
            </div>
          </div>

          {/* Social Media & Instant Messaging Feed */}
          <div className="space-y-2.5">
            {/* WhatsApp Group Notification */}
            <div className="rounded-xs border border-emerald-800/80 bg-emerald-950/40 p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-emerald-400" />
                  <span>WhatsApp: Jantar Mantar Volunteer Core</span>
                </span>
                <span className="text-[9px] text-zinc-400">Just now</span>
              </div>
              <p className="text-[11px] text-zinc-200">
                &ldquo;Buses carrying 400 NEET aspirants from Rajasthan just arrived at Delhi border. Police checking banners.&rdquo;
              </p>
            </div>

            {/* X / Twitter Trend Alert */}
            <div className="rounded-xs border border-zinc-800 bg-black/80 p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#38BDF8]">
                <span className="flex items-center gap-1">
                  <Twitter className="h-3 w-3 text-[#38BDF8]" />
                  <span>X Viral Trend India</span>
                </span>
                <span className="stamp-red text-[8px]">#1 TRENDING</span>
              </div>
              <p className="text-[11px] text-white font-mono">
                #CockroachJanta · 184K Posts
              </p>
              <p className="text-[10px] text-zinc-400">
                Citizens posting videos of paper leaks and judicial accountability debates across colleges.
              </p>
            </div>

            {/* Delhi Power Discom SMS */}
            <div className="rounded-xs border border-yellow-800/60 bg-yellow-950/30 p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#FDE047]">
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-[#FACC15]" />
                  <span>BSES Electricity Bill</span>
                </span>
                <span className="text-[9px] text-zinc-400">Due in 5 days</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Bill amount ₹2,840 for June cycle. Auto-debited from personal account if not deferred.
              </p>
            </div>
          </div>

          {/* Quick Motivational Quote */}
          <div className="border-t border-zinc-800 pt-2 text-[11px] text-zinc-400 italic font-serif">
            &ldquo;When an ordinary citizen becomes angry enough to challenge the system, history begins to bend.&rdquo;
          </div>
        </div>

      </div>

      {/* Skills Matrix in Black, Red, Yellow */}
      <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-4 text-xs shadow-md">
        <h3 className="font-tactical font-black text-white border-b-2 border-zinc-800 pb-2 mb-3 flex items-center justify-between">
          <span>PERSONAL LEADERSHIP & CIVIC SKILLS PROFILE</span>
          <span className="text-[#FACC15] text-[11px] font-mono">MAX: 10/10</span>
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
            <div key={idx} className="rounded-xs border border-zinc-800 bg-black p-2.5 text-center">
              <span className="text-zinc-400 text-[10px] font-bold block">{skill.label}</span>
              <div className="text-xl font-black text-[#FACC15] mt-1 tabular-nums">{skill.val}/10</div>
              <div className="mt-1.5 h-1.5 w-full bg-zinc-900 rounded-xs overflow-hidden">
                <div className="h-full bg-[#DC2626]" style={{ width: `${skill.val * 10}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
