# Story Brief — Cockroach Political Sim

The game vision and story rules. For code, styling and workflow rules, see `AGENTS.md`.
For the real events this story is based on, see `docs/cjp-timeline.md`.

## What the game is

A 2D, turn-based political strategy simulation for the web, inspired by India's
Cockroach Janta Party (CJP) youth movement of 2026.

The game runs in three acts:

- **Act 1: Campaign (16 May 2026 → 5 Oct 2026).** Semi-scripted. Historical events fire on
  their real dates and the player chooses how to respond. Choices can change outcomes: what
  really happened is one path, not the only one.
- **Act 2: Sandbox (from 5 Oct 2026).** Open play. Register the party, build state chapters,
  contest state elections and the 2029 Lok Sabha, form alliances. The win condition is
  democratic: form a government.
- **Act 3: Governing.** Policy choices that trade integrity against speed, tracked by a
  "Clean India Index".

## Core systems

- **Resources:** Followers, Volunteers, Funds, Credibility, Legal Heat.
- **Government response meter:** escalates from ignore → block accounts → police action → negotiate.
- **Map:** Indian states, each with a support level, active protests, and police posture.

## Writing events

Each event has a date, the act it belongs to, a title, a short description (1–3 sentences),
a location, and 2–3 choices. Each choice lists its effects on the resources above and,
optionally, the event it leads to next. Act 1 events also record which choice matches what
really happened (the "historical choice") and cite the timeline entry they come from.

- **Don't invent history.** Every Act 1 event must come from `docs/cjp-timeline.md`. Anything
  not in the timeline is fictional sandbox content and must be marked as such.
- Write events in batches of 10–20, one month of the timeline at a time.

## Historical notes

- Abhijeet Dipke moved from the US to India **once**, on 5–6 June 2026. He never went back to
  the US afterwards (a viral claim that he did was fact-checked as false). Model a single
  US-to-India move, not a round trip.

## Names (decided 5 Oct 2026)

- **Use real names** for people, parties, institutions and media, as they appear in
  `docs/cjp-timeline.md`. No parody names and no name map.
- Because the names are real, what real people say and do in the game must come from the
  timeline. Quote them only as reported. Invented events (sandbox content, generic crises) use
  fictional minor characters (officers, reporters, volunteers) rather than putting new words or
  actions in a real person's mouth.
