'use client';

import React, { useState } from 'react';
import { GraduationCap, Briefcase, Megaphone, Zap, Moon, Siren, BookOpen } from 'lucide-react';
import { useGame } from '@/lib/game/context/GameContext';
import { PROLOGUE_FOCUS, PrologueFocus } from '@/lib/game/simulation/engine';
import { soundManager } from '@/lib/game/simulation/sound';
import { ArtPlaceholder, Button } from '@/components/ui/primitives';
import { ChoiceCard, GameDialog } from '@/components/ui/menus';
import { EffectChips } from './StoryEventDialog';

const FOCUS_ICONS: Record<PrologueFocus, React.ElementType> = { EXAMS: GraduationCap, JOBS: Briefcase, SPEECH: Megaphone };

/** Three-step opening: the remark (15 May), the crisis + your focus, then Boston on 16 May. */
export function PrologueModal() {
  const { state, dispatch } = useGame();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focus, setFocus] = useState<PrologueFocus | null>(null);

  if (state.isPrologueComplete) return null;

  const next = () => {
    soundManager.playClick();
    setStep(s => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  };
  const begin = () => {
    soundManager.playChime();
    dispatch({ type: 'FINISH_PROLOGUE', focus: focus ?? undefined });
  };

  const tag = (
    <span className="inline-flex -rotate-3 items-center gap-1.5 rounded-lg border-3 border-ink bg-pink px-3 py-1 font-display text-sm text-white shadow-[3px_3px_0_var(--ink)]">
      Prologue · {step}/3
    </span>
  );

  if (step === 1) {
    return (
      <GameDialog open dismissible={false} tag={tag} title="15 May 2026 · Supreme Court" art={<ArtPlaceholder label="Supreme Court of India, a news ticker crawling below" className="h-full w-full" />}>
        <p className="text-base font-semibold leading-relaxed text-fg">
          A bench of Chief Justice Surya Kant and Justice Joymalya Bagchi refuses to hear a contempt plea. Rebuking the petitioner&apos;s counsel, the
          Chief Justice compares unemployed youth who turn to media, social media and RTI activism to:
        </p>
        <blockquote className="chunky-sm my-4 -rotate-1 bg-white px-4 py-3 text-center font-display text-2xl text-ink">
          &ldquo;cockroaches&rdquo; and &ldquo;parasites of society&rdquo;
        </blockquote>
        <p className="text-sm font-semibold text-muted">
          The context was fake law degrees. The next day he said he had been misquoted. The label stuck anyway.
        </p>
        <div className="mt-5 flex justify-end">
          <Button onClick={next}>Next</Button>
        </div>
      </GameDialog>
    );
  }

  if (step === 2) {
    return (
      <GameDialog open dismissible={false} tag={tag} title="A Country of Angry Students" art={<ArtPlaceholder label="Exam hall, empty desks, a 'cancelled' stamp" className="h-full w-full" />}>
        <p className="text-base font-semibold leading-relaxed text-fg">
          NEET-UG 2026 has been cancelled over a paper leak and the CBI is investigating. CBSE&apos;s on-screen marking has left thousands waiting for
          results. Organisers would later say more than 20 students died by suicide amid the turmoil; their families are at the heart of what comes next.
        </p>
        <p className="mt-2 text-xs font-semibold text-muted">If you or someone you know is struggling, call Tele-MANAS on 14416 (free, 24×7, India).</p>

        <h3 className="mt-5 font-display text-base text-ink">What do you lead with?</h3>
        <div className="mt-2 space-y-2.5">
          {(Object.keys(PROLOGUE_FOCUS) as PrologueFocus[]).map(k => {
            const f = PROLOGUE_FOCUS[k];
            return (
              <ChoiceCard
                key={k}
                icon={FOCUS_ICONS[k]}
                emphasis={focus === k}
                title={f.label}
                description={f.blurb}
                effects={<EffectChips effects={f.effects} />}
                onSelect={() => {
                  soundManager.playStamp();
                  setFocus(k);
                }}
              />
            );
          })}
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={next} disabled={!focus}>
            Next
          </Button>
        </div>
      </GameDialog>
    );
  }

  return (
    <GameDialog open dismissible={false} tag={tag} title="16 May 2026 · Boston" art={<ArtPlaceholder label="A small Boston apartment at night, laptop open, phone glowing" className="h-full w-full" />}>
      <p className="text-base font-semibold leading-relaxed text-fg">
        You are <strong>Abhijeet Dipke</strong>: journalism graduate from Pune, MS in Public Relations from Boston University, once on AAP&apos;s
        social media team. You are job-hunting in the US. You have a phone, a joke, and a very angry country.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[
          { icon: Zap, text: 'Each day you get action points. Spend them on rallies, TV debates, legal moves and more.' },
          { icon: Moon, text: 'Press END TURN to move to the next day. Nothing happens until you do.' },
          { icon: BookOpen, text: 'Real events arrive on their real dates. Follow history or rewrite it.' },
          { icon: Siren, text: 'Watch Legal Heat and the government response. At 100% heat your offices are sealed.' },
        ].map(t => (
          <div key={t.text} className="chunky-sm flex items-start gap-2 bg-raised p-2.5 text-sm font-semibold text-fg">
            <t.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-fg" strokeWidth={2.5} />
            {t.text}
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <Button size="lg" onClick={begin}>
          Begin
        </Button>
      </div>
    </GameDialog>
  );
}
