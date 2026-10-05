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

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # typecheck
npm run lint         # eslint
npm run build        # production build (also typechecks)
```

Before declaring work done: `npx tsc --noEmit && npm run lint && npm run build` must all pass.
There is no test suite yet.

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

### Adding a feature — the usual path
1. Add/extend types in `lib/game/types.ts`
2. Add initial values in `createInitialState` (engine.ts)
3. Add a `GameAction` variant + reducer case (engine.ts)
4. Add static content in `lib/game/data/` if needed
5. Render/dispatch from a component in `components/game/`
6. New screen? Add to the `ScreenTab` union, `ScreenNav.tsx`, and the router in `app/page.tsx`

### Save compatibility
Changing `GameState` shape can break existing localStorage saves. When you add fields,
give them defaults so `LOAD_STATE` of an older save doesn't crash (merge over `createInitialState`).

## Conventions
- `'use client'` at the top of every component/hook file (the whole app is client-rendered)
- Import via `@/` alias (maps to repo root)
- Keep simulation deterministic: use `SeededRNG` from state, not `Math.random()`
- Images are served from `public/images/` (`src/assets/images/` is an unused duplicate)
- Match existing style: Tailwind utility classes, dark "war room" palette (`#080B11`, red `#DC2626`, yellow `#FACC15`)

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
