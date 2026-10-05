# CLAUDE.md — Cockroach Political Sim

Read this file before every task. It describes what this game is and how to work on it.

## What the game is

A 2D, turn-based political strategy simulation for the web, inspired by India's Cockroach Janta Party (CJP) youth movement of 2026. Set in a parody universe: fictional names for real politicians, parties and institutions (keep a mapping in `docs/name-map.md`).

- **Act 1 — Campaign (16 May 2026 → 5 Oct 2026):** semi-scripted. Historical events fire on their real dates; the player chooses responses, and choices can change outcomes. The historical choice is one path, not the only one.
- **Act 2 — Sandbox (from 5 Oct 2026):** open play. Register the party, build state chapters, contest state elections and the 2029 Lok Sabha, form alliances. Win condition is democratic: form a government.
- **Act 3 — Governing:** policy choices with an integrity vs. speed tradeoff, tracked by a "Clean India Index".

## Core systems

- **Resources:** Followers, Volunteers, Funds, Credibility, Legal Heat.
- **Government response meter:** ignore → block accounts → police action → negotiate.
- **Map:** Indian states, each with support level, active protests, police posture.
- **Events:** loaded from `data/events.json`, never hard-coded in game logic.

## Source material

- `docs/cjp-timeline.md` — sourced day-by-day research timeline of real events (May–Oct 2026). Use it to write events. Do not invent historical facts; if something isn't in the timeline, treat it as fictional sandbox content and mark it so.
- Note: Abhijeet Dipke moved from the US to India once (5–6 June 2026). There was no later return trip to the US.

## Event data format

```json
{
  "id": "evt_0720_sansad_chalo",
  "date": "2026-07-20",
  "act": 1,
  "title": "The March to Parliament",
  "description": "Short, 1–3 sentences.",
  "location": "Delhi",
  "choices": [
    { "label": "March anyway", "effects": { "followers": 15, "legalHeat": 25 }, "next": "evt_0720_crackdown" },
    { "label": "Hold the sit-in", "effects": { "credibility": -5 }, "next": null }
  ],
  "historical_choice": 0,
  "source": "docs/cjp-timeline.md#july-20"
}
```

## How to work

1. Before changing code, summarize what exists and propose a plan. Wait for approval.
2. Work in small phases: one system at a time, test, then continue.
3. Add events in batches of 10–20, one month of the timeline at a time.
4. Never delete or rewrite working systems without asking.
5. Keep the art style consistent: flat 2D satirical comic, maroon (#7A1F2B) / cream / saffron / teal, cockroach mascot.
