# REPUBLIC: 543 — Agent Guide

Shared instructions for every coding agent on this repo (Claude Code, Codex, others).
`CLAUDE.md` imports this file — edit here, not there.

## What this is

A 2D political strategy / life-sim set in modern India (citizen movement → Jantar Mantar
protest → party formation → 543-seat general election → governance). Originally exported
from Google AI Studio.

- Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, `motion`, `lucide-react`
- 100% client-side: a single page (`app/page.tsx`), no API routes, no backend
- Saves live in browser `localStorage` (`lib/game/simulation/persistence.ts`)
- `@google/genai` is a dependency but is **not used anywhere** yet; `GEMINI_API_KEY` is unused

## Working rules
- **Propose a plan and wait for the owner's approval before big changes** (new systems,
  restructures, large rewrites). Small fixes and docs updates don't need approval.
- **Never delete working systems without asking**, even if you're replacing them.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # typecheck
npm run lint         # eslint
npm test             # vitest: engine unit tests + headless balance simulation
npm run build        # production build (also typechecks)
npm run build:check  # same build into .next-check/, safe while `npm run dev` is running
```

Before declaring work done: `npx tsc --noEmit && npm run lint && npm test && npm run build:check` must all pass.
Don't run plain `npm run build` while `npm run dev` is running — they share `.next/` and the dev
server starts returning 500s (fix: stop dev, `rm -rf .next`, restart). Use `build:check` instead.

`npx vitest run balance.sim` prints a table of full simulated campaigns (balanced / reckless /
passive strategies × 5 seeds). Run it after any balance change; it fails if the difficulty
curve breaks (e.g. balanced play stops winning, or passive play can form a party).

## Architecture

```
app/page.tsx                      GameProvider + screen router (switch on state.activeScreen)
lib/game/types.ts                 All game types (GameState, PlayerStats, MovementStats, ...)
lib/game/simulation/engine.ts     createInitialState, GameAction union, gameReducer, advanceSimulationDay
lib/game/simulation/random.ts     SeededRNG — use this, never Math.random(), in simulation logic
lib/game/simulation/persistence.ts  save/load slots + JSON export/import
lib/game/simulation/sound.ts      WebAudio sound engine (soundManager singleton)
lib/game/context/GameContext.tsx  React context: { state, dispatch, startNewGame, load/save }
lib/game/data/*.ts                Static content: states & constituencies, crises, recruits,
                                  reforms, investigations, historical archive
components/game/*View.tsx         One component per ScreenTab
components/game/*Modal.tsx        Prologue, crisis, mini-games (rally, TV debate), save/load
```

State flow: components call `useGame()` → `dispatch({ type: ... })` → `gameReducer` in
`engine.ts` returns new state. All game rules belong in the reducer/engine, not in components.

### Engine rules (enforced by tests)
- **The reducer is pure.** No `soundManager`, `Date.now()`, `Math.random()`, timers, or in-place
  mutation (`array.push`) inside `engine.ts`. Randomness: `rngFor(state, salt)`. Ids: `uid(state, prefix)`.
  Sounds for engine events (crisis, level-up, election result, game over, failures) are played by
  `GameContext` when it sees the state change; components play their own click sounds.
- **The engine validates everything.** Costs, action points (`spendAction`), energy, and
  prerequisites are checked in the reducer, never only in the UI. A refused action returns
  `fail(state, reason)`; a successful one returns `withOutcome(state, text)`. The HUD shows
  `state.lastOutcome` as a toast, so **never write a UI toast that claims an effect** — report
  what the engine actually did.
- **Movement stat changes go through `adjustMovement`**, which applies diminishing returns to
  trust and volunteer gains. Don't write to `movement.publicTrust` / `volunteerCount` directly.
- Tunable numbers live in `BALANCE` at the top of `engine.ts`.
- `gameReducer` = `reduce` (the switch) + `finalize` (derives quests/XP/level/AP cap, projected
  seats, and checks endings). Game-over blocks all gameplay actions.
- Turn-based by default: days advance via END DAY. The header clock is optional auto-advance and
  pauses itself during crises, mini-games and game over.

### Core loop
Each day the player has 3 AP (4 at rank 3, 5 at rank 5). Actions cost AP + energy + often money.
Pressure: **crackdown** (100 = sealed), **funds** (2 missed payrolls = bankrupt), **health**
(collapse), **trust** (≤5 = irrelevant). Arc: Jantar Mantar vigil → investigations/PIL →
register party (15k volunteers + ₹50k) → nominate candidates (deposit + campaign fund) → election
(per-constituency vote-share model in `contestSeat`) → coalition (needs 272) → table & lobby
reforms → 3 laws passed = victory.

### Adding a feature — the usual path
1. Add/extend types in `lib/game/types.ts`
2. Add initial values in `createInitialState` (engine.ts)
3. Add a `GameAction` variant + reducer case (engine.ts)
4. Add static content in `lib/game/data/` if needed
5. Render/dispatch from a component in `components/game/`
6. New screen? Add to the `ScreenTab` union, `ScreenNav.tsx`, and the router in `app/page.tsx`

### Save compatibility
Changing `GameState` shape can break existing localStorage saves. `LOAD_STATE` runs
`migrateState`, which merges the save over `createInitialState`. When you add a field, add it to
`createInitialState` and, if it needs a non-default value for old saves, handle it in `migrateState`.
Bump `SAVE_VERSION` for breaking changes.

## Conventions
- `'use client'` at the top of every component/hook file (the whole app is client-rendered)
- Import via `@/` alias (maps to repo root)
- Keep simulation deterministic: use `SeededRNG` from state, not `Math.random()`
- Images are served from `public/images/` (`src/assets/images/` is an unused duplicate)

### Styling ("Truck Art Protest Poster", single theme)
The game should feel like a game, not software: chunky pieces with thick ink outlines, hard
"sticker" shadows, buttons that press down, bold Indian truck-art colours. Tokens live in
`app/globals.css`. **Never use raw hex, `zinc-*`, or `black`/`white` for surfaces and text.**

| Purpose | Classes |
|---|---|
| Indigo page / text on it | `app-backdrop` · `text-on-canvas` · `text-on-canvas-muted` · `poster-title` |
| Cream card / nested / well | `bg-surface` · `bg-raised` · `bg-inset` (text on them: `text-fg`, `text-fg-2`, `text-muted`) |
| Outline + shadow | `chunky` (3px ink + 5px shadow) · `chunky-sm` · ink colour `border-ink` |
| Press feedback | `pressable` (lifts on hover, presses on click) |
| Saffron primary | `bg-brand text-brand-ink` · `text-brand-fg` on cream |
| Rani pink / peacock teal / marigold | `bg-pink` · `bg-teal` · `bg-accent` (`text-accent-fg` on cream) |
| Status | `success` · `danger` · `info` (each with `-fg`, `-soft`, `-line`) |

Text over photos/illustrations goes inside `theme-dark-scope`.

**Use the kit, don't hand-roll.** `components/ui/primitives.tsx` (Button, Panel, PanelHeader,
StatCard, Meter, SegmentMeter, EffectChip, Badge, StickyNote, SpeechBubble, ArtPlaceholder,
EndTurnButton) and `components/ui/menus.tsx` (Tabs, Menu dropdown, Tooltip, HoverCard, Popover,
GameDialog, ChoiceCard; Radix-based). Preview at `/kit`. Prefer dropdowns, popovers and tabs
over long vertical option lists. App frame: `components/shell/` (TopBar, BottomDock, TitleScreen).

Fonts (next/font, `app/layout.tsx`): `font-display` **Bungee** for short titles, buttons and
labels only (it is all-caps and Latin-only; Devanagari falls back to Baloo 2) · default **Baloo 2**
for everything else, including long headlines · `font-hand` **Kalam** for placards/sticky notes.

Layout: navigation is the bottom dock (4 tabs + More on phones, 6 + More on desktop).
Badge/chip rows `flex-wrap`; button groups use a responsive `grid`. Check at 390px — no
horizontal page scroll.

## Working with multiple agents in parallel
Claude Code and Codex may both be working on this repo at the same time.
- **Never work directly on `main`.** One branch per task: `claude/<topic>` or `codex/<topic>`.
- For true parallel work, use a separate git worktree per agent so they don't share a working tree:
  `git worktree add ../polgame-codex -b codex/<topic>`
- Hot spots for merge conflicts: `lib/game/types.ts`, `lib/game/simulation/engine.ts`
  (the `GameAction` union and `gameReducer` switch). Keep edits there small and focused;
  avoid reformatting or reordering code you didn't need to touch.
- Commit small and often; rebase on `main` before opening a PR.
- Record in-flight work and decisions in `docs/TASKS.md` so the other agent can see them.
