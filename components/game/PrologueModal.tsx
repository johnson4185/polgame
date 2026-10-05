'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Radio, PhoneCall, AlertTriangle, ShieldCheck, FileText, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function PrologueModal() {
  const { state, dispatch } = useGame();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);

  if (state.isPrologueComplete) return null;

  const handleNextStep = () => {
    soundManager.playClick();
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
    } else {
      soundManager.playGavel();
      dispatch({ type: 'FINISH_PROLOGUE' });
    }
  };

  return (
    <div className="theme-dark-scope fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-xs border-2 border-line-strong bg-surface p-6 shadow-2xl space-y-4">
        
        {/* Step Indicator in Black, Red, Yellow */}
        <div className="flex items-center justify-between border-b-2 border-line pb-3 text-xs font-tactical">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="stamp-red text-[10px]">PROLOGUE</span>
            <span className="text-faint">|</span>
            <span className="text-fg font-bold">June 2026 · The Spark in Delhi &amp; Pune</span>
          </div>
          <span className="text-accent-fg font-black bg-inset px-2 py-0.5 rounded-xs border border-line-strong">
            Phase {step} of 3
          </span>
        </div>

        {/* Phase 1: Modest Personal Environment & News Notification */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative h-52 w-full overflow-hidden rounded-xs border-2 border-line-strong bg-inset">
              <Image
                src="/images/hero_cjp_protest_1790774314550.jpg"
                alt="Jantar Mantar Student Rally"
                fill
                priority
                className="object-cover opacity-70 filter contrast-125"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[11px] font-tactical font-black text-accent-fg uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#DC2626] animate-pulse" />
                  <span>Breaking National Dispatch · Verified Archive</span>
                </span>
                <h3 className="text-base font-bold text-fg font-display mt-0.5">
                  Supreme Court Hearings on Public Examinations &amp; The &ldquo;Cockroach&rdquo; Metaphor
                </h3>
              </div>
            </div>

            <div className="rounded-xs border border-line bg-inset p-4 text-xs space-y-2.5 leading-relaxed text-fg-2 font-sans">
              <p>
                You sit at your small laminate desk in a modest rented room. On your cracked smartphone screen, hundreds of student group messages flood in simultaneously.
              </p>
              <p>
                A high-profile courtroom remark describing ordinary citizens surviving like stubborn insects amidst deep bureaucratic inertia has touched a raw nerve. For months, millions of students who studied through heatwaves in Kota, Patna, and Prayagraj watched examination papers leak on encrypted apps while coaching libraries flooded.
              </p>
              <p className="font-bold text-accent-fg italic font-serif">
                &ldquo;They think we are insects who will scatter when stepped on. But a cockroach survives radiation, floods, and poison. We will become uncrushable.&rdquo;
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 px-5 py-2.5 font-tactical text-xs font-black text-white hover:bg-red-700 transition-all shadow-md active:translate-y-0.5"
              >
                <span>Answer Urgent Call</span>
                <ArrowRight className="h-4 w-4 text-accent-fg" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: High-Stakes Conversation with Fellow Organiser */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xs border-2 border-line bg-inset p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xs bg-[#DC2626] text-white">
                <PhoneCall className="h-5 w-5 text-accent-fg animate-bounce" />
              </div>
              <div className="text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-tactical">
                  <span className="font-black text-fg text-sm">Kunal Verma</span>
                  <span className="text-accent-fg text-[10px] font-mono">[Patna Aspirants Forum]</span>
                </div>
                <p className="text-fg-2 leading-relaxed font-sans">
                  &ldquo;Abhijeet, police in Delhi just issued Section 144 around Parliament Street, but more than 1,500 students from UP and Haryana are already on trains to New Delhi railway station. If we don’t set up water, legal representation, and an authorized perimeter at Jantar Mantar right now, this will either collapse into chaos or get brutally dispersed.&rdquo;
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-tactical font-black text-fg text-xs block">
                CHOOSE YOUR OPERATIONAL POSTURE:
              </span>
              {[
                {
                  text: 'Take personal responsibility. Organize legal permissions, medical aid, and sound permits at Jantar Mantar.',
                  tag: 'DISCIPLINED CIVIC RESISTANCE',
                },
                {
                  text: 'File immediate High Court RTI appeals and petition benches while students hold the ground.',
                  tag: 'LEGAL & INSTITUTIONAL COMBAT',
                },
                {
                  text: 'Call for widespread nationwide student assemblies across state capitals simultaneously.',
                  tag: 'MAXIMUM MOBILIZATION',
                },
              ].map((resp, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedResponse(idx)}
                  className={`w-full text-left p-3.5 rounded-xs border-2 transition-all font-tactical ${
                    selectedResponse === idx
                      ? 'border-accent bg-inset text-fg font-black ring-1 ring-accent'
                      : 'border-line bg-raised text-fg-2 hover:border-line-strong'
                  }`}
                >
                  <div className="text-xs text-fg">{resp.text}</div>
                  <span className="stamp-red text-[8px] mt-1 inline-block">{resp.tag}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                disabled={selectedResponse === null}
                onClick={handleNextStep}
                className="flex items-center gap-2 rounded-xs bg-[#DC2626] border-2 border-red-500 px-5 py-2.5 font-tactical text-xs font-black text-white hover:bg-red-700 disabled:bg-line-strong disabled:border-line-strong disabled:text-faint transition-all shadow-md"
              >
                <span>Commit Priorities &amp; Launch Campaign</span>
                <ArrowRight className="h-4 w-4 text-accent-fg" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Immediate Briefing & Field Deployment */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xs border-2 border-line bg-inset p-5 space-y-3">
              <div className="flex items-center gap-2 font-tactical">
                <CheckCircle2 className="h-5 w-5 text-accent-fg" />
                <h3 className="font-black text-fg text-base">THE MOVEMENT TAKES FORM</h3>
              </div>
              <p className="text-xs text-fg-2 leading-relaxed font-sans">
                You have stepped outside the role of an onlooker. You are now the driving force behind the Jantar Mantar vigil and the newly formed Cockroach Janta Party movement.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-2 font-tactical text-xs">
                <div className="border border-line bg-raised p-3 rounded-xs">
                  <span className="text-muted text-[10px]">INITIAL TREASURY:</span>
                  <div className="text-lg font-black text-accent-fg mt-0.5">₹1,50,000</div>
                  <p className="text-[10px] text-faint font-sans">Crowdfunded via micro-UPI donations</p>
                </div>
                <div className="border border-line bg-raised p-3 rounded-xs">
                  <span className="text-muted text-[10px]">FIRST MISSION:</span>
                  <div className="text-lg font-black text-danger-fg mt-0.5">Jantar Mantar Ground</div>
                  <p className="text-[10px] text-faint font-sans">Sustain crowd against heatwave and police pressure</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 rounded-xs bg-[#FACC15] border-2 border-accent-line px-6 py-3 font-tactical text-sm font-black text-black hover:bg-yellow-300 transition-all shadow-xl active:translate-y-0.5"
              >
                <span>ENTER REPUBLIC: 543</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
