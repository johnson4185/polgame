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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border-2 border-line bg-surface p-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-tactical text-xs font-black uppercase tracking-wider text-danger-fg flex items-center gap-1.5 bg-danger-soft px-2 py-0.5 rounded-xs border border-danger-line">
              <span className="stamp-red text-[9px]">CADRE</span>
              <span>THE LEADERSHIP CORE WHO REMEMBER</span>
            </span>
            <span className="text-faint">|</span>
            <span className="text-xs text-fg-2">Organizers, Advocates &amp; Researchers</span>
          </div>
          <h2 className="font-display text-xl font-bold text-fg mt-1">
            Personnel Dossiers, Morale &amp; Operational Assignments
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-tactical">
          <div className="rounded-xs border border-line-strong bg-inset px-3.5 py-1.5">
            <span className="text-muted">CORE STAFF: </span>
            <span className="font-black text-accent-fg tabular-nums">
              {state.people.filter(p => p.isHired).length} / {state.people.length}
            </span>
          </div>
          <div className="rounded-xs border border-danger-line bg-danger-soft px-3.5 py-1.5">
            <span className="text-muted">MONTHLY STIPEND: </span>
            <span className="font-black text-danger-fg tabular-nums">
              ₹{state.people.filter(p => p.isHired).reduce((acc, p) => acc + p.salaryMonthly, 0).toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xs bg-accent-soft border-2 border-accent px-4 py-2.5 text-xs font-bold text-accent-fg shadow-md flex items-center gap-2">
          <Award className="h-4 w-4 text-accent-fg" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid: Roster List (5 cols) + Selected Member Profile (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: People Roster */}
        <div className="lg:col-span-5 rounded-xs border-2 border-line bg-surface p-3 text-xs space-y-2 shadow-md">
          <div className="border-b-2 border-line pb-2 font-tactical font-black text-muted flex justify-between">
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
                      ? 'border-accent bg-inset text-fg font-black shadow-md ring-1 ring-[#FACC15]/40'
                      : 'border-line bg-raised text-fg-2 hover:border-line-strong hover:bg-raised'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold text-fg text-xs">{person.name}</span>
                      <span className="text-[10px] text-accent-fg font-mono">[{person.role}]</span>
                      {person.historical && <span className="rounded-full border border-ink bg-teal px-1.5 text-[9px] font-extrabold text-white">REAL</span>}
                      {person.fictional && <span className="rounded-full border border-line px-1.5 text-[9px] font-bold text-muted">FICTIONAL</span>}
                    </div>
                    <div className="text-[10px] text-muted mt-0.5 font-sans">
                      {person.currentAssignment || 'Awaiting assignment'}
                    </div>
                  </div>

                  <div>
                    {person.isHired ? (
                      <span className="stamp-red text-[9px]">ACTIVE</span>
                    ) : (
                      <span className="rounded-xs bg-line-strong text-muted border border-line-strong px-1.5 py-0.5 text-[9px] font-bold">
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
          <div className="rounded-xs border-2 border-line bg-surface p-5 text-xs space-y-4 shadow-md">
            
            <div className="flex items-start justify-between border-b-2 border-line pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="font-display text-xl font-bold text-fg">{selectedPerson.name}</h3>
                  <span className="stamp-yellow text-[9px]">{selectedPerson.role}</span>
                  {selectedPerson.historical && <span className="rounded-full border-2 border-ink bg-teal px-2 py-0.5 text-[10px] font-extrabold text-white">REAL PERSON</span>}
                  {selectedPerson.fictional && <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-bold text-muted">FICTIONAL CHARACTER</span>}
                </div>
                <p className="text-[11px] font-tactical text-muted mt-1">
                  Region: {selectedPerson.state} · {selectedPerson.isVolunteer ? 'Volunteer (unpaid)' : <>Monthly Stipend: <strong className="text-fg">₹{selectedPerson.salaryMonthly.toLocaleString('en-IN')}/mo</strong></>}
                </p>
                {selectedPerson.joinDate && !selectedPerson.isHired && (
                  <p className="mt-1 text-[11px] font-semibold text-fg-2">
                    In the record from {selectedPerson.joinDate.day}/{selectedPerson.joinDate.month}/{selectedPerson.joinDate.year}; can join from then.
                  </p>
                )}
              </div>

              <div>
                {selectedPerson.isHired ? (
                  <button
                    onClick={() => handleFire(selectedPerson.id)}
                    className="flex items-center gap-1.5 rounded-xs border-2 border-red-500 bg-danger-soft px-3 py-1.5 text-xs font-bold text-danger-fg hover:bg-[#DC2626] hover:text-white transition-colors"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    <span>Relieve from Core</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleHire(selectedPerson.id)}
                    className="flex items-center gap-1.5 rounded-xs bg-[#DC2626] border-2 border-red-500 px-4 py-2 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-xs"
                  >
                    <UserPlus className="h-4 w-4 text-accent-fg" />
                    <span>Recruit to Movement</span>
                  </button>
                )}
              </div>
            </div>

            {/* Backstory */}
            <div>
              <span className="font-tactical font-black text-fg-2 block mb-1">FIELD OBSERVATION:</span>
              <p className="text-fg-2 leading-relaxed font-sans">{selectedPerson.observation}</p>
            </div>

            {/* Vitals: Loyalty, Morale, Integrity */}
            <div className="grid grid-cols-3 gap-3 font-tactical">
              <div className="rounded-xs border border-line bg-inset p-2.5 text-center">
                <span className="text-muted text-[10px]">LOYALTY</span>
                <div className="text-lg font-black text-accent-fg mt-0.5">{selectedPerson.loyalty}%</div>
              </div>
              <div className="rounded-xs border border-line bg-inset p-2.5 text-center">
                <span className="text-muted text-[10px]">INTEGRITY</span>
                {/* Real people aren't given an integrity score */}
                <div className="text-lg font-black text-success-fg mt-0.5">{selectedPerson.historical ? '—' : `${selectedPerson.integrity}%`}</div>
              </div>
              <div className="rounded-xs border border-line bg-inset p-2.5 text-center">
                <span className="text-muted text-[10px]">MORALE</span>
                <div className="text-lg font-black text-danger-fg mt-0.5">{selectedPerson.morale}%</div>
              </div>
            </div>

            {/* Assignment Section */}
            {selectedPerson.isHired && (
              <div className="border-t-2 border-line pt-3 space-y-2">
                <span className="font-tactical font-black text-fg block">OPERATIONAL ASSIGNMENT:</span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <input
                    type="text"
                    placeholder="e.g. Lead Jantar Mantar legal team / Manage RTI appeals"
                    value={newAssignmentText}
                    onChange={(e) => setNewAssignmentText(e.target.value)}
                    className="flex-1 rounded-xs border-2 border-line-strong bg-inset px-3 py-2 text-xs text-fg focus:outline-none focus:border-accent font-tactical"
                  />
                  <button
                    onClick={handleAssign}
                    className="px-4 py-2 rounded-xs bg-[#FACC15] font-tactical font-black text-xs text-black hover:bg-yellow-300 transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            )}

            {/* Memory & Observations Log */}
            <div className="border-t-2 border-line pt-3">
              <span className="font-tactical font-black text-fg block mb-1.5">OBSERVATIONS &amp; MEMORY LOG:</span>
              <div className="space-y-1">
                {(selectedPerson.memories || []).map((mem, idx) => (
                  <div key={idx} className="border-l-2 border-[#DC2626] pl-2 text-[11px] text-fg-2 font-sans">
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
