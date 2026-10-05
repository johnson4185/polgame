'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { Megaphone, Users, Sparkles, AlertCircle, Award, Volume2, CheckCircle2 } from 'lucide-react';

interface SpeechCard {
  id: string;
  rhetoric: string;
  text: string;
  hypeDelta: number;
  riskPenalty: number;
}

const ROUNDS_DATA: {
  round: number;
  stageName: string;
  cards: SpeechCard[];
}[] = [
  {
    round: 1,
    stageName: 'Opening Gambit: The Citizen Grievance',
    cards: [
      {
        id: 'R1-PERSONAL',
        rhetoric: 'Personal Humiliation in Babu Offices',
        text: '"Yesterday, an 80-year-old pensioner sat outside the Sub-Divisional Magistrate office for four hours just to get his ration stamped. We are not begging for charity; we are demanding what is constitutionally ours!"',
        hypeDelta: 28,
        riskPenalty: 0,
      },
      {
        id: 'R1-FIERY',
        rhetoric: 'Direct Attack on Ruling Tycoons',
        text: '"While millions struggle for ₹200 a day, two billionaire oligarchs bought 80% of our ports and airports on zero-down-payment loans! Whose country is this anyway?!"',
        hypeDelta: 35,
        riskPenalty: 12,
      },
      {
        id: 'R1-CONSTITUTION',
        rhetoric: 'The Preamble & Dr. Ambedkar’s Warning',
        text: '"Babasaheb warned us that democracy in India is only a top-dressing on an undemocratic soil unless citizens fight for constitutional fraternity every single day!"',
        hypeDelta: 24,
        riskPenalty: 0,
      },
    ],
  },
  {
    round: 2,
    stageName: 'Mid-Speech Rebuttal: Hecklers & Media Propaganda',
    cards: [
      {
        id: 'R2-RTI-PROOF',
        rhetoric: 'Hold Up Official RTI Documents on Stage',
        text: '"The government channels say we are sponsored by foreign agents. I hold here 400 pages of the Comptroller and Auditor General’s own unreleased audit! Let the Prime Minister answer this page!"',
        hypeDelta: 32,
        riskPenalty: 5,
      },
      {
        id: 'R2-DEFIANT-CHALLENGE',
        rhetoric: 'Defiant Challenge to Delhi Police',
        text: '"Bring your water cannons! Bring your Section 144! The waters of the Yamuna cannot wash away the collective conscience of five hundred million working Indians!"',
        hypeDelta: 38,
        riskPenalty: 18,
      },
      {
        id: 'R2-UNITY',
        rhetoric: 'Inter-Faith & Cross-State Solidarity',
        text: '"Look around you! From Punjab to Tamil Nadu, from auto drivers to software engineers, hunger knows no caste, and corruption spares no religion!"',
        hypeDelta: 26,
        riskPenalty: 0,
      },
    ],
  },
  {
    round: 3,
    stageName: 'The Climax: The Call to Mass Resistance',
    cards: [
      {
        id: 'R3-LOKPAL-VOW',
        rhetoric: 'The 100,000 Citizen Fast Unto Death Vow',
        text: '"If they do not table the Jan Lokpal Bill by Monday noon, not one of us leaves this asphalt! Let every home send one Satyagrahi to Delhi!"',
        hypeDelta: 40,
        riskPenalty: 15,
      },
      {
        id: 'R3-VOTER-REVOLT',
        rhetoric: 'Transform Anger into Electoral Defeat',
        text: '"Do not just protest. Register. Organize in all 543 constituencies. Let every corrupt MP know that the EVM is our weapon of peaceful revolution!"',
        hypeDelta: 34,
        riskPenalty: 5,
      },
      {
        id: 'R3-POEM-CALL',
        rhetoric: 'Recite Dushyant Kumar’s Revolutionary Couplet',
        text: '"Ho gayi hai peer parvat si pighalni chahiye, is Himalaya se koi Ganga nikalni chahiye! Sirf hungama khada karna mera maqsad nahi, saari koshish hai ki yeh soorat badalni chahiye!"',
        hypeDelta: 36,
        riskPenalty: 2,
      },
    ],
  },
];

export function RallyMiniGameModal() {
  const { state, dispatch } = useGame();

  // Escape aborts the mini-game (the action point is already spent)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'CLOSE_MINI_GAME' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);
  const [currentRound, setCurrentRound] = useState(1);
  const [crowdHype, setCrowdHype] = useState(30);
  const [policeTension, setPoliceTension] = useState(state.crackdownLevel || 15);
  const [selectedCards, setSelectedCards] = useState<SpeechCard[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  if (state.activeMiniGame !== 'RALLY') return null;

  const currentRoundData = ROUNDS_DATA.find((r) => r.round === currentRound);

  const handleSelectCard = (card: SpeechCard) => {
    soundManager.playMegaphone();
    const newHype = Math.min(100, crowdHype + card.hypeDelta);
    const newTension = Math.min(100, policeTension + card.riskPenalty);
    setCrowdHype(newHype);
    setPoliceTension(newTension);

    const updated = [...selectedCards, card];
    setSelectedCards(updated);

    if (currentRound < 3) {
      setCurrentRound(currentRound + 1);
    } else {
      soundManager.playCrowdCheer();
      setIsFinished(true);
    }
  };

  const handleClaimResults = () => {
    soundManager.playFanfare();
    const volunteerBonus = Math.floor(crowdHype * 8 + 200);
    const trustBonus = Math.floor(crowdHype * 0.18 + 5);
    const fundsBonus = Math.floor(crowdHype * 180 + 3500);
    const xpBonus = 350;

    dispatch({
      type: 'FINISH_MINI_GAME',
      result: {
        score: crowdHype,
        trustDelta: trustBonus,
        fundsDelta: fundsBonus,
        volunteersDelta: volunteerBonus,
        xpDelta: xpBonus,
        notes: `Addressed 15,000 citizens from the Jantar Mantar wooden stage. Generated national front-page coverage and galvanized volunteer enrollment.`,
      },
    });
  };

  return (
    <div className="theme-dark-scope fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-xs border-2 border-accent bg-surface shadow-2xl overflow-hidden font-sans text-fg">
        
        {/* Top Caution Stripes */}
        <div className="h-2 w-full caution-stripes" />

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-line bg-canvas p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xs bg-[#DC2626] text-white">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <span className="stamp-yellow text-[9px]">TACTICAL MINIGAME · LIVE STAGE</span>
              <h2 className="font-display text-lg font-bold text-fg">
                THE JANTAR MANTAR MEGAPHONE RALLY
              </h2>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_MINI_GAME' })}
            className="text-faint hover:text-fg font-mono text-xs px-2 py-1 rounded-xs border border-line"
          >
            ABORT [ESC]
          </button>
        </div>

        {/* Stage Atmosphere & Crowd Meters */}
        <div className="p-4 sm:p-5 space-y-4">
          
          <div className="grid grid-cols-2 gap-3 font-tactical text-xs">
            {/* Crowd Enthusiasm Meter */}
            <div className="rounded-xs border border-line bg-inset p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-muted font-bold flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-accent-fg" /> CROWD ENTHUSIASM
                </span>
                <span className="font-black text-accent-fg tabular-nums text-sm">{crowdHype}%</span>
              </div>
              <div className="h-2.5 w-full bg-raised rounded-xs overflow-hidden border border-line">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${crowdHype}%` }}
                />
              </div>
              <span className="text-[10px] text-faint mt-1 block">
                {crowdHype > 80 ? '⚡ HISTORIC SURGE · ROARING APPLAUSE' : crowdHype > 50 ? '🔥 FIRED UP & CHANTING' : 'RESTLESS & WAITING'}
              </span>
            </div>

            {/* Police Alert Meter */}
            <div className="rounded-xs border border-line bg-inset p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-muted font-bold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-danger-fg" /> POLICE RADAR
                </span>
                <span className="font-black text-danger-fg tabular-nums text-sm">{policeTension}%</span>
              </div>
              <div className="h-2.5 w-full bg-raised rounded-xs overflow-hidden border border-line">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${policeTension}%` }}
                />
              </div>
              <span className="text-[10px] text-faint mt-1 block">
                {policeTension > 60 ? '⚠️ WATER CANNON ARMED' : 'MONITORING BARRICADES'}
              </span>
            </div>
          </div>

          {!isFinished && currentRoundData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-tactical font-black text-xs text-accent-fg uppercase tracking-wider">
                  ROUND {currentRound}/3 — {currentRoundData.stageName}
                </span>
                <span className="text-[11px] font-mono text-muted">CHOOSE 1 RHETORICAL GAMBIT</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {currentRoundData.cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    className="w-full text-left rounded-xs border-2 border-line bg-raised p-3.5 hover:border-accent hover:bg-raised transition-all group shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-tactical font-black text-fg group-hover:text-accent-fg transition-colors">
                        {card.rhetoric}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-success-fg font-bold">+{card.hypeDelta}% HYPE</span>
                        {card.riskPenalty > 0 && (
                          <span className="text-danger-fg">+{card.riskPenalty}% POLICE RISK</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-fg-2 font-serif italic leading-relaxed">
                      {card.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isFinished && (
            <div className="rounded-xs border-2 border-emerald-500 bg-success-soft p-5 text-center space-y-4 animate-in zoom-in-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-black mx-auto">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <span className="stamp-yellow text-[10px]">RALLY CONCLUDED SUCCESSFULLY</span>
                <h3 className="font-display text-xl font-bold text-fg mt-1">
                  HISTORIC GROUND OVATION: {crowdHype}% APPLAUSE INDEX
                </h3>
                <p className="text-xs text-fg-2 mt-1 max-w-md mx-auto">
                  Over 15,000 citizens chanted slogans in unison. News broadcast vans beam the speech live across 14 vernacular channels.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 font-tactical text-xs max-w-md mx-auto">
                <div className="rounded-xs border border-success-line bg-inset p-2">
                  <span className="text-[10px] text-muted block">VOLUNTEERS</span>
                  <span className="font-black text-success-fg text-base">+{Math.floor(crowdHype * 8 + 200)}</span>
                </div>
                <div className="rounded-xs border border-success-line bg-inset p-2">
                  <span className="text-[10px] text-muted block">PUBLIC TRUST</span>
                  <span className="font-black text-accent-fg text-base">+{Math.floor(crowdHype * 0.18 + 5)}%</span>
                </div>
                <div className="rounded-xs border border-success-line bg-inset p-2">
                  <span className="text-[10px] text-muted block">MICRO-FUNDS</span>
                  <span className="font-black text-fg text-base">₹{Math.floor(crowdHype * 180 + 3500).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleClaimResults}
                className="w-full py-3 rounded-xs bg-[#FACC15] font-tactical font-black text-black text-xs uppercase tracking-wider hover:bg-yellow-300 transition-colors shadow-md"
              >
                CLAIM SPOILS & RETURN TO FIELD COMMAND
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
