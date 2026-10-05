'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Tv, Clock, Mic, Sparkles, Award, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DebateQuestion {
  questionNumber: number;
  anchorQuestion: string;
  options: {
    id: string;
    text: string;
    verdict: string;
    approvalDelta: number;
    mediaDelta: number;
  }[];
}

const DEBATE_QUESTIONS: DebateQuestion[] = [
  {
    questionNumber: 1,
    anchorQuestion: '"MR. ABHIJEET! THE NATION WANTS TO KNOW: Ruling party ministers claim your Karol Bagh war room received ₹40 Lakhs from suspicious foreign shell corporations! DENY IT OR RESIGN FROM PUBLIC LIFE!"',
    options: [
      {
        id: 'BANK_AUDIT',
        text: '"Anchor, here is our live public bank statement URL. Every rupee is authenticated via verified Indian UPI and PAN cards. Can the ruling party show their ₹6,000 Crore electoral bond donors?!"',
        verdict: 'FACTUAL SMACKDOWN · ANCHOR TEMPORARILY SILENCED',
        approvalDelta: 16,
        mediaDelta: 14,
      },
      {
        id: 'POPULIST_SHOUT',
        text: '"You are reading a fabricated WhatsApp press note handed to you by the Home Ministry five minutes ago! Stop functioning like a government loudspeaker!"',
        verdict: 'FIERY CLASH · GOES VIRAL ON REELS & TWITTER',
        approvalDelta: 20,
        mediaDelta: 6,
      },
      {
        id: 'CALM_INSPECTION',
        text: '"We invite the Enforcement Directorate, the CBI, and your camera crew to inspect our balance sheets right now on live television."',
        verdict: 'MEASURED TRANSPARENCY · EARNS EDITORIAL RESPECT',
        approvalDelta: 12,
        mediaDelta: 18,
      },
    ],
  },
  {
    questionNumber: 2,
    anchorQuestion: '"YOU ARE CAUSING MASS INCONVENIENCE! Ambulances are stuck, office commuters are delayed on Ring Road because of your tents! IS THIS DEMOCRACY OR RECKLESS MOB ANARCHY?!"',
    options: [
      {
        id: 'AMBULANCE_ROUTE',
        text: '"Our volunteers created a dedicated green corridor that allowed 14 ambulances through today without a second of delay. Why isn’t your channel reporting that?!"',
        verdict: 'GROUND PROOF DISMANTLES SENSATIONALISM',
        approvalDelta: 18,
        mediaDelta: 12,
      },
      {
        id: 'FREEDOM_STRUGGLE_ANALOGY',
        text: '"When Mahatma Gandhi marched to Dandi, did British newspapers ask if the salt march was blocking commuter traffic?! Constitutional rights are not a luxury!"',
        verdict: 'HISTORICAL WEIGHT · MASSIVE PUBLIC RESONANCE',
        approvalDelta: 22,
        mediaDelta: 8,
      },
      {
        id: 'CONCILIATORY',
        text: '"We regret any citizen hardship. That is why we urge the government to table the anti-corruption bill tomorrow so every citizen can return to normal life."',
        verdict: 'REASONABLE STATESMANSHIP · PRAISED BY NEUTRALS',
        approvalDelta: 14,
        mediaDelta: 15,
      },
    ],
  },
  {
    questionNumber: 3,
    anchorQuestion: '"IF YOU THINK YOU REPRESENT 1.4 BILLION INDIANS, WHY DON’T YOU CONTEST ELECTIONS?! WHY SIT ON FOOTPATHS INSTEAD OF FACING THE BALLOT BOX?!"',
    options: [
      {
        id: 'ACCEPT_CHALLENGE',
        text: '"Mark my words on this broadcast: If the parliament refuses to pass the Jan Lokpal Bill, the citizens of this country will enter all 543 constituencies and defeat your corrupt masters!"',
        verdict: 'HISTORIC GAUNTLET THROWN · ELEVATES LEADER STATURE',
        approvalDelta: 25,
        mediaDelta: 20,
      },
      {
        id: 'WATCHDOG_DOCTRINE',
        text: '"Elections don’t give leaders a 5-year license to loot. Democracy requires vigilant citizens every single day, not just on voting day."',
        verdict: 'CIVIC PHILOSOPHY · WON INTELLECTUAL CONSENSUS',
        approvalDelta: 15,
        mediaDelta: 14,
      },
    ],
  },
];

export function TVDebateMiniGameModal() {
  const { state, dispatch } = useGame();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [publicApproval, setPublicApproval] = useState(45);
  const [mediaRating, setMediaRating] = useState(40);
  const [, setChosenResponses] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectOption = useCallback((opt: DebateQuestion['options'][0]) => {
    soundManager.playCameraShutter();
    setPublicApproval((p) => Math.min(100, p + opt.approvalDelta));
    setMediaRating((m) => Math.min(100, m + opt.mediaDelta));
    setChosenResponses((prev) => [...prev, opt.verdict]);

    if (currentQIndex < DEBATE_QUESTIONS.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setTimeLeft(15);
    } else {
      soundManager.playFanfare();
      setIsCompleted(true);
    }
  }, [currentQIndex]);

  useEffect(() => {
    if (state.activeMiniGame !== 'TV_DEBATE' || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSelectOption(DEBATE_QUESTIONS[currentQIndex].options[0]);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.activeMiniGame, currentQIndex, isCompleted, handleSelectOption]);

  if (state.activeMiniGame !== 'TV_DEBATE') return null;

  const currentQ = DEBATE_QUESTIONS[currentQIndex];

  const handleFinish = () => {
    soundManager.playGavel();
    const trustGain = Math.floor(publicApproval * 0.15 + 6);
    const mediaGain = Math.floor(mediaRating * 0.15 + 5);
    const fundsGain = Math.floor(publicApproval * 220 + 4000);
    const volunteersGain = Math.floor(publicApproval * 7 + 150);
    const xpGain = 400;

    dispatch({
      type: 'FINISH_MINI_GAME',
      result: {
        score: publicApproval,
        trustDelta: trustGain,
        fundsDelta: fundsGain,
        volunteersDelta: volunteersGain,
        xpDelta: xpGain,
        notes: `Dominated the 9 PM Prime Time TV Crossfire. Public approval surged to ${publicApproval}%. Clip viral across social media.`,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/92 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-xs border-2 border-red-500 bg-[#070A11] shadow-2xl overflow-hidden font-sans text-white">
        
        {/* Live TV Breaking News Top Bar */}
        <div className="bg-[#DC2626] px-4 py-2 flex items-center justify-between text-xs font-black font-tactical">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-ping" />
            <span className="tracking-wider uppercase">LIVE PRIME-TIME BROADCAST · SPECIAL REPORT</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-black/40 px-2 py-0.5 rounded-xs">TRP: 18.4M VIEWERS</span>
            <span className="text-yellow-300">STUDIO 1</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Split Screen Studio View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Host Side */}
            <div className="rounded-xs border-2 border-red-800 bg-[#120B0F] p-4 text-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-red-900/60 pb-2">
                <span className="font-tactical font-black text-red-400">VIKRAM GOSWAMI · NEWS CHAIR</span>
                <span className="stamp-red text-[8px]">AGGRESSIVE</span>
              </div>
              <p className="text-amber-100 font-serif italic text-xs leading-relaxed pt-1">
                {currentQ.anchorQuestion}
              </p>
            </div>

            {/* Player Side */}
            <div className="rounded-xs border-2 border-[#FACC15] bg-[#0A101D] p-4 text-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-tactical font-black text-[#FACC15]">ABHIJEET VERMA · JANTAR MANTAR FEED</span>
                <div className="flex items-center gap-1 text-[11px] font-mono text-red-400 font-black">
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                  <span>00:{timeLeft.toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* Live Public Pulse Bar */}
              <div className="pt-1 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>PUBLIC APPROVAL: <strong className="text-emerald-400">{publicApproval}%</strong></span>
                  <span>MEDIA SCORE: <strong className="text-[#FACC15]">{mediaRating}%</strong></span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-xs overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${publicApproval}%` }}
                  />
                </div>
              </div>

            </div>

          </div>

          {!isCompleted ? (
            <div className="space-y-2.5 pt-2">
              <span className="font-tactical text-xs font-black text-zinc-300 block">
                DELIVER REBUTTAL UNDER 15 SECONDS:
              </span>

              <div className="grid grid-cols-1 gap-2">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className="w-full text-left rounded-xs border-2 border-zinc-800 bg-[#0F1422] p-3 text-xs hover:border-[#FACC15] hover:bg-zinc-900 transition-all group"
                  >
                    <p className="font-serif text-zinc-100 group-hover:text-white leading-relaxed">
                      {opt.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800/60 font-mono text-[10px]">
                      <span className="text-emerald-400 font-bold">+{opt.approvalDelta}% Public Trust</span>
                      <span className="text-[#FACC15] font-bold">+{opt.mediaDelta}% Media Standing</span>
                      <span className="text-zinc-500 italic ml-auto">{opt.verdict}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xs border-2 border-emerald-500 bg-emerald-950/40 p-5 text-center space-y-4 animate-in zoom-in-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-black mx-auto">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <span className="stamp-yellow text-[10px]">DEBATE TELECAST CONCLUDED</span>
                <h3 className="font-tactical text-xl font-black text-white mt-1">
                  PRIME-TIME TRIUMPH · {publicApproval}% NATIONAL APPROVAL
                </h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-md mx-auto">
                  Over 18 million households watched the confrontation. Social media viral clips trending #VoiceOfJanLokpal nationally.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 font-tactical text-xs max-w-md mx-auto">
                <div className="rounded-xs border border-emerald-800 bg-black/60 p-2">
                  <span className="text-[10px] text-zinc-400 block">PUBLIC TRUST</span>
                  <span className="font-black text-emerald-400 text-base">+{Math.floor(publicApproval * 0.15 + 6)}%</span>
                </div>
                <div className="rounded-xs border border-emerald-800 bg-black/60 p-2">
                  <span className="text-[10px] text-zinc-400 block">UPI DONATIONS</span>
                  <span className="font-black text-[#FACC15] text-base">₹{Math.floor(publicApproval * 220 + 4000).toLocaleString('en-IN')}</span>
                </div>
                <div className="rounded-xs border border-emerald-800 bg-black/60 p-2">
                  <span className="text-[10px] text-zinc-400 block">MOVEMENT XP</span>
                  <span className="font-black text-white text-base">+400 XP</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3 rounded-xs bg-[#FACC15] font-tactical font-black text-black text-xs uppercase tracking-wider hover:bg-white transition-colors shadow-md"
              >
                WRAP BROADCAST & RETURN TO COMMAND
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
