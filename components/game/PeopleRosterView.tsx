'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/game/context/GameContext';
import { soundManager } from '@/lib/game/simulation/sound';
import { RecruitablePerson } from '@/lib/game/types';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  Heart, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  PlusCircle, 
  UserX,
  Award,
  Zap,
  Send
} from 'lucide-react';

export function PeopleRosterView() {
  const { state, dispatch } = useGame();
  const [selectedPersonId, setSelectedPersonId] = useState<string>('REC-001');
  const [newAssignmentText, setNewAssignmentText] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedPerson = state.people.find(p => p.id === selectedPersonId) || state.people[0];

  const handleHire = (id: string) => {
    soundManager.playGavel();
    dispatch({ type: 'HIRE_STAFF', personId: id });
    setFeedback('Recruited to movement leadership core. Added to monthly operational commitments.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFire = (id: string) => {
    soundManager.playClick();
    dispatch({ type: 'FIRE_STAFF', personId: id });
    setFeedback('Relieved from core commitments.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAssign = () => {
    if (!newAssignmentText.trim()) return;
    soundManager.playClick();
    dispatch({
      type: 'ASSIGN_STAFF',
      personId: selectedPerson.id,
      assignment: newAssignmentText.trim(),
    });
    setNewAssignmentText('');
    setFeedback(`Assigned ${selectedPerson.name} to strategic duty.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-4">
      
      {/* Team Header in Black, Red, Yellow */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-zinc-800 bg-[#0E1320] p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-[#EF4444] flex items-center gap-1.5 bg-red-950/40 px-2 py-0.5 rounded-xs border border-red-900/60">
              <span className="stamp-red text-[9px]">CADRE</span>
              <span>THE LEADERSHIP CORE WHO REMEMBER</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-xs text-zinc-300">Organizers, Advocates &amp; Researchers</span>
          </div>
          <h2 className="font-tactical text-xl font-black text-white mt-1">
            Personnel Dossiers, Morale &amp; Operational Assignments
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-tactical">
          <div className="rounded-xs border border-zinc-700 bg-black px-3.5 py-1.5">
            <span className="text-zinc-400">CORE STAFF: </span>
            <span className="font-black text-[#FACC15] tabular-nums">
              {state.people.filter(p => p.isHired).length} / {state.people.length}
            </span>
          </div>
          <div className="rounded-xs border border-red-800/80 bg-red-950/40 px-3.5 py-1.5">
            <span className="text-zinc-400">MONTHLY STIPEND: </span>
            <span className="font-black text-[#EF4444] tabular-nums">
              ₹{state.people.filter(p => p.isHired).reduce((acc, p) => acc + p.salaryMonthly, 0).toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xs bg-yellow-950/80 border-2 border-[#FACC15] px-4 py-2.5 text-xs font-bold text-[#FDE047] shadow-md flex items-center gap-2">
          <Award className="h-4 w-4 text-[#FACC15]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid: Roster List (5 cols) + Selected Member Profile (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: People Roster */}
        <div className="lg:col-span-5 rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-3 text-xs space-y-2 shadow-md">
          <div className="border-b-2 border-zinc-800 pb-2 font-tactical font-black text-zinc-400 flex justify-between">
            <span>PERSONNEL &amp; ACTIVIST ROSTER</span>
            <span>STATUS</span>
          </div>

          <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
            {state.people.map((person) => {
              const isSelected = person.id === selectedPersonId;
              return (
                <button
                  key={person.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedPersonId(person.id);
                  }}
                  className={`w-full text-left p-3 rounded-xs border-2 transition-all flex items-center justify-between font-tactical ${
                    isSelected
                      ? 'border-[#FACC15] bg-black text-white font-black shadow-md ring-1 ring-[#FACC15]/40'
                      : 'border-zinc-800 bg-[#121624] text-zinc-300 hover:border-zinc-700 hover:bg-[#181F30]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{person.name}</span>
                      <span className="text-[10px] text-[#FACC15] font-mono">[{person.role}]</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 font-sans">
                      {person.currentAssignment || 'Awaiting assignment'}
                    </div>
                  </div>

                  <div>
                    {person.isHired ? (
                      <span className="stamp-red text-[9px]">ACTIVE</span>
                    ) : (
                      <span className="rounded-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 text-[9px] font-bold">
                        RECRUITABLE
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Person Profile */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xs border-2 border-zinc-800 bg-[#0C101A] p-5 text-xs space-y-4 shadow-md">
            
            <div className="flex items-start justify-between border-b-2 border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-tactical text-xl font-black text-white">{selectedPerson.name}</h3>
                  <span className="stamp-yellow text-[9px]">{selectedPerson.role}</span>
                </div>
                <p className="text-[11px] font-tactical text-zinc-400 mt-1">
                  Region: {selectedPerson.state} · Monthly Stipend: <strong className="text-white">₹{selectedPerson.salaryMonthly.toLocaleString('en-IN')}/mo</strong>
                </p>
              </div>

              <div>
                {selectedPerson.isHired ? (
                  <button
                    onClick={() => handleFire(selectedPerson.id)}
                    className="flex items-center gap-1.5 rounded-xs border-2 border-red-500 bg-red-950/60 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-[#DC2626] hover:text-white transition-colors"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    <span>Relieve from Core</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleHire(selectedPerson.id)}
                    className="flex items-center gap-1.5 rounded-xs bg-[#DC2626] border-2 border-red-500 px-4 py-2 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-xs"
                  >
                    <UserPlus className="h-4 w-4 text-[#FACC15]" />
                    <span>Recruit to Movement</span>
                  </button>
                )}
              </div>
            </div>

            {/* Backstory */}
            <div>
              <span className="font-tactical font-black text-zinc-300 block mb-1">FIELD OBSERVATION:</span>
              <p className="text-zinc-300 leading-relaxed font-sans">{selectedPerson.observation}</p>
            </div>

            {/* Vitals: Loyalty, Morale, Integrity */}
            <div className="grid grid-cols-3 gap-3 font-tactical">
              <div className="rounded-xs border border-zinc-800 bg-black p-2.5 text-center">
                <span className="text-zinc-400 text-[10px]">LOYALTY</span>
                <div className="text-lg font-black text-[#FACC15] mt-0.5">{selectedPerson.loyalty}%</div>
              </div>
              <div className="rounded-xs border border-zinc-800 bg-black p-2.5 text-center">
                <span className="text-zinc-400 text-[10px]">INTEGRITY</span>
                <div className="text-lg font-black text-emerald-400 mt-0.5">{selectedPerson.integrity}%</div>
              </div>
              <div className="rounded-xs border border-zinc-800 bg-black p-2.5 text-center">
                <span className="text-zinc-400 text-[10px]">MORALE</span>
                <div className="text-lg font-black text-[#EF4444] mt-0.5">{selectedPerson.morale}%</div>
              </div>
            </div>

            {/* Assignment Section */}
            {selectedPerson.isHired && (
              <div className="border-t-2 border-zinc-800 pt-3 space-y-2">
                <span className="font-tactical font-black text-white block">OPERATIONAL ASSIGNMENT:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Lead Jantar Mantar legal team / Manage RTI appeals"
                    value={newAssignmentText}
                    onChange={(e) => setNewAssignmentText(e.target.value)}
                    className="flex-1 rounded-xs border-2 border-zinc-700 bg-black px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FACC15] font-tactical"
                  />
                  <button
                    onClick={handleAssign}
                    className="px-4 py-2 rounded-xs bg-[#FACC15] font-tactical font-black text-xs text-black hover:bg-white transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            )}

            {/* Memory & Observations Log */}
            <div className="border-t-2 border-zinc-800 pt-3">
              <span className="font-tactical font-black text-white block mb-1.5">OBSERVATIONS &amp; MEMORY LOG:</span>
              <div className="space-y-1">
                {(selectedPerson.memories || []).map((mem, idx) => (
                  <div key={idx} className="border-l-2 border-[#DC2626] pl-2 text-[11px] text-zinc-300 font-sans">
                    {mem}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
