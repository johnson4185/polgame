"use client";

import React, { useState } from "react";
import {
  Users,
  UserCheck,
  IndianRupee,
  Award,
  Star,
  Siren,
  Zap,
  Brain,
  Megaphone,
  Landmark,
  BookOpen,
  ExternalLink,
  Shield,
} from "lucide-react";
import { useGame } from "@/lib/game/context/GameContext";
import { getStoryEvent } from "@/lib/game/data/story";
import { soundManager } from "@/lib/game/simulation/sound";
import type { StoryChoice, StoryEffects, StoryEvent } from "@/lib/game/types";
import { ArtPlaceholder, Button, EffectChip } from "@/components/ui/primitives";
import { ChoiceCard, GameDialog } from "@/components/ui/menus";

const short = (n: number) => {
  const a = Math.abs(n);
  const v =
    a >= 1e6
      ? `${(a / 1e6).toFixed(1)}M`
      : a >= 1e3
        ? `${Math.round(a / 1e3)}K`
        : `${a}`;
  return `${n >= 0 ? "+" : "−"}${v}`;
};

// Which direction is good for the player: legal heat, stress and government response going up is bad
const FX: {
  key: { [K in keyof StoryEffects]-?: NonNullable<StoryEffects[K]> extends number ? K : never }[keyof StoryEffects];
  label: string;
  icon: React.ElementType;
  upIsGood: boolean;
  money?: boolean;
}[] = [
  { key: "followers", label: "Followers", icon: Users, upIsGood: true },
  { key: "volunteers", label: "Volunteers", icon: UserCheck, upIsGood: true },
  {
    key: "funds",
    label: "Funds",
    icon: IndianRupee,
    upIsGood: true,
    money: true,
  },
  { key: "trust", label: "Trust", icon: Award, upIsGood: true },
  { key: "credibility", label: "Credibility", icon: Star, upIsGood: true },
  { key: "legalHeat", label: "Legal Heat", icon: Siren, upIsGood: false },
  { key: "govResponse", label: "Govt Response", icon: Shield, upIsGood: false },
  { key: "energy", label: "Energy", icon: Zap, upIsGood: true },
  { key: "stress", label: "Stress", icon: Brain, upIsGood: false },
];

export function EffectChips({
  effects,
  cost,
}: {
  effects: StoryEffects;
  cost?: number;
}) {
  const chips = FX.filter((f) => effects[f.key]).map((f) => {
    const v = effects[f.key]!;
    const good = v > 0 === f.upIsGood;
    const value = f.money
      ? `${v > 0 ? "+" : "−"}₹${short(Math.abs(v)).slice(1)}`
      : f.key === "govResponse"
        ? v > 0
          ? "Escalates"
          : "Eases"
        : short(v);
    return (
      <EffectChip
        key={f.key}
        icon={f.icon}
        value={value}
        label={f.label}
        tone={good ? "good" : "bad"}
      />
    );
  });
  if (cost)
    chips.unshift(
      <EffectChip
        key="cost"
        icon={IndianRupee}
        value={`₹${short(cost).slice(1)}`}
        label="Cost"
        tone="neutral"
      />,
    );
  if (effects.recruit?.length)
    chips.push(<EffectChip key="recruit" icon={UserCheck} value={`+${effects.recruit.length}`} label="Join the team" tone="good" />);
  if (effects.dismiss?.length)
    chips.push(<EffectChip key="dismiss" icon={UserCheck} value={`−${effects.dismiss.length}`} label="Leave the team" tone="bad" />);
  return <>{chips}</>;
}

const HELPLINE =
  "If you or someone you know is struggling, call Tele-MANAS on 14416 (free, 24×7, India).";

/** Dated story event as a dramatic modal card. Choosing shows the result, then Continue resolves it. */
export function StoryEventDialog() {
  const { state } = useGame();
  const activeId = state.story?.activeEventId ?? null;
  const ev = activeId ? getStoryEvent(activeId) : undefined;
  // Keyed by event id so a new event starts with no choice picked
  return ev ? <StoryCard key={ev.id} ev={ev} /> : null;
}

function StoryCard({ ev }: { ev: StoryEvent }) {
  const { state, dispatch } = useGame();
  const [picked, setPicked] = useState<StoryChoice | null>(null);
  const historical =
    ev.historicalChoice !== undefined
      ? ev.choices[ev.historicalChoice]
      : undefined;
  const funds = state.movement.movementFunds;

  const choose = (c: StoryChoice) => {
    soundManager.playStamp();
    setPicked(c);
  };
  const confirm = () => {
    if (!picked) return;
    soundManager.playClick();
    dispatch({ type: "RESOLVE_STORY_CHOICE", choiceId: picked.id });
  };

  const date = ev.date
    ? new Date(`${ev.date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const isSetPiece = ev.kind === "SETPIECE";

  return (
    <GameDialog
      open
      dismissible={false}
      title={picked ? picked.label : ev.title}
      tag={
        <span
          className={`inline-flex -rotate-3 items-center gap-1.5 rounded-lg border-3 border-ink px-3 py-1 font-display text-sm shadow-[3px_3px_0_var(--ink)] ${isSetPiece ? "bg-pink text-white" : "bg-brand text-brand-ink"}`}
        >
          {isSetPiece ? (
            <Landmark className="h-4 w-4" />
          ) : (
            <Megaphone className="h-4 w-4" />
          )}
          {isSetPiece ? "Big Moment" : "Event"}
        </span>
      }
      art={
        <ArtPlaceholder label={ev.art ?? ev.title} className="h-full w-full" />
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-muted">
        {date && (
          <span className="rounded-full border-2 border-ink bg-accent px-2 py-0.5 text-ink">
            {date}
          </span>
        )}
        <span>{ev.location}</span>
        {ev.fictional && (
          <span className="rounded-full border border-line-soft px-2 py-0.5">
            Fictional scenario
          </span>
        )}
      </div>

      {!picked ? (
        <>
          <p className="text-base font-semibold leading-relaxed text-fg">
            {ev.description}
          </p>
          {ev.speaker && (
            <p className="mt-3 rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink">
              <span className="font-display text-xs">{ev.speaker.name}</span>
              <span className="text-muted"> · {ev.speaker.role}</span>
              <br />
              {ev.speaker.line}
            </p>
          )}
          <div className="mt-4 space-y-2.5">
            {ev.choices.map((c, i) => (
              <ChoiceCard
                key={c.id}
                emphasis={i === 0}
                title={c.label}
                description={c.description}
                effects={<EffectChips effects={c.effects} cost={c.cost} />}
                onSelect={() => choose(c)}
                disabled={!!c.cost && funds < c.cost}
                disabledReason={
                  c.cost
                    ? `Needs ₹${c.cost.toLocaleString("en-IN")}`
                    : undefined
                }
              />
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-base font-semibold leading-relaxed text-fg">
            {picked.outcome}
          </p>
          <div className="flex flex-wrap gap-2">
            <EffectChips effects={picked.effects} cost={picked.cost} />
          </div>
          {ev.history && (
            <div className="chunky-sm bg-raised p-3">
              <div className="flex items-center gap-1.5 font-display text-xs text-ink">
                <BookOpen className="h-4 w-4" />
                {historical && historical.id === picked.id
                  ? "Just like it really happened"
                  : "What really happened"}
              </div>
              <p className="mt-1 text-sm font-semibold text-fg-2">
                {ev.history}
              </p>
              {ev.source && (
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted">
                  <ExternalLink className="h-3 w-3" /> From the record:{" "}
                  {ev.source
                    .replace("docs/cjp-timeline.md#", "")
                    .replace(/-/g, " ")}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setPicked(null)}>
              Back
            </Button>
            <Button onClick={confirm}>Continue</Button>
          </div>
        </div>
      )}

      {ev.sensitive && (
        <p className="mt-4 text-xs font-semibold text-muted">{HELPLINE}</p>
      )}
    </GameDialog>
  );
}
