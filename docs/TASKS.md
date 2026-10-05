# Task Board

Shared between Claude Code and Codex. Claim a task by putting your agent + branch on it
before starting; move it to Done when merged.

## File ownership while tasks are in flight
To avoid merge conflicts, only the owning task may edit these files until it merges:

| Files | Owner |
|-------|-------|
| `lib/game/data/crises.ts` | Codex — `codex/crisis-deck` |
| `app/`, `components/game/`, `components/ui/`, `lib/game/**` (except files listed for Codex) | Claude — UI redesign |
| `components/map/**`, `app/kit/map/**`, `public/maps/**` | Codex — `codex/india-map` |
| `lib/game/data/media.ts` | Codex — `codex/media-content` |

## In progress
| Task | Agent | Branch |
|------|-------|--------|
| UI redesign to match the 5 mockups in Truck Art style (see "Redesign plan" below) | Claude | `claude/*` |

## Ready for Codex
Each item lists the files it may touch. Do not edit files owned by an in-flight task above.

### C1. Expand the crisis deck (5 → 20+ events) — `codex/crisis-deck`
Files: `lib/game/data/crises.ts` only.
- Keep the `CrisisEvent` shape from `lib/game/types.ts` exactly (don't change types).
- Add 15+ new events covering: monsoon flooding at protest site, fake-news deepfake of the
  leader, a donor offering dark money, internal faction split, an IT/ED raid notice, a
  coaching-lobby defamation suit, a volunteer injured, a TV channel sting, a state chapter
  going rogue, a celebrity endorsement with strings attached, exam paper leak breaking news,
  student suicide tragedy requiring sensitive response, opposition party poaching staff, etc.
- Each event: 3 options with real trade-offs (no option strictly best). Consequence values
  in the same ranges as existing events (trust ±20, funds ±60000, volunteers ±800,
  crackdown ±25, stress ±20, energy ±25).
- Unique `id`s prefixed `CRISIS-`. Fictional officials/names only — no real living politicians.

### C2. Repo cleanup — `codex/cleanup`
Files: `src/assets/`, `.eslintrc.json`, `package.json`, `package-lock.json`.
- Delete `src/assets/images/` (duplicate of `public/images/`, unused) and the empty `src/`.
- Delete legacy `.eslintrc.json` (flat `eslint.config.mjs` is the active config); confirm `npm run lint` still passes.
- Run `npm audit fix` (non-breaking only, no `--force`); confirm build passes.

### C4. Interactive India map component — `codex/india-map`
Files: `components/map/**`, `app/kit/map/page.tsx`, `public/maps/**` only.
- Build `components/map/IndiaMap.tsx`: an SVG choropleth of India's states/UTs.
- **Boundaries must follow the official Survey of India depiction** (full J&K and Ladakh).
  Use a source that does, e.g. DataMeet's maps (check and note the licence in a comment).
  Simplify paths so the SVG is small (< 300 KB).
- Props: `values: Record<stateName, number>` (0–100) → fill using the support legend
  (80–100 `#7a1a1f`, 60–80 `#a3343a`, 40–60 `#c96a6a`, 20–40 `#e3a7a0`, <20 `#9a9188`);
  `selected?: string`; `onSelect(stateName)`; `onHover(stateName | null)`;
  `markers?: { state: string; kind: 'protest' | 'police' | 'flag'; }[]` rendered at state centroids;
  `renderTooltip?(stateName) => ReactNode` shown in a floating card near the cursor.
- State names must match `INITIAL_STATES[].name` in `lib/game/data/statesAndConstituencies.ts`.
- Keyboard: states focusable (tab), Enter selects; `aria-label` per state.
- Follow the styling rules in AGENTS.md (truck-art tokens, `chunky`, `pressable`).
- Demo page at `/kit/map` with random values. Do not edit any other file.

### C5. Media content data — `codex/media-content`
Files: `lib/game/data/media.ts` only (export types from the same file; don't edit `types.ts`).
- `NEWS_TEMPLATES`: 40+ headlines with `{ id, outlet, headline, summary, tone: 'SYMPATHETIC' | 'NEUTRAL' | 'HOSTILE', trigger: string }`
  where `trigger` names the game event that should surface it (e.g. `'PROTEST_DAY'`, `'CRACKDOWN_HIGH'`,
  `'PARTY_FORMED'`, `'PIL_ADMITTED'`, `'EXPOSE_LANDED'`, `'ELECTION_CALLED'`).
- `SOCIAL_POSTS`: 40+ posts `{ id, author, handle, text, hashtags[], trigger }` in the voice of the
  mockups (students, the founder, the spokesperson, critics).
- `HASHTAGS`: 20+ `{ tag, theme: 'EDUCATION' | 'JOBS' | 'DEMOCRACY' | 'GOVERNANCE' | 'HOSTILE' }`.
- Keep the movement's satirical tone ("Voice of the Lazy & Unemployed"). Hindi/Hinglish welcome.

## Redesign plan (Claude)
Source: 5 mockups the user supplied on 2026-10-05 (title, overview, event, protest scene, media room).
Decisions: real names kept · Truck Art Poster style · bottom dock · placeholder art for now · look first, then mechanics.
1. [x] Foundation: tokens, fonts, Radix-based kit (`components/ui/`), `/kit` preview
   - Restyled same day to **Truck Art Protest Poster** (Bungee + Baloo 2) after the user found
     parchment too "software"; alternatives kept at `/kit/styles`
2. [x] App shell: top resource bar, bottom dock + More menu, END TURN, settings menu, title screen
3. [ ] Screens: Overview (map + feeds) → Event dialog → Protest scene → Media room → People, Finance, Research, Lawsuits, Election
4. [ ] Mechanics behind the new UI: followers, concurrent campaigns, narrative battle, trending/social, media actions

## Backlog
Gameplay gaps (engine work — claim before starting, they touch `engine.ts`):
- [ ] **More operations.** Only the Jantar Mantar vigil exists; once it concludes (day 14) the
      Operations screen has nothing to do. `OperationType` already lists `STATE_JAN_YATRA`,
      `SCHOOL_AUDIT_DRIVE`, `PARLIAMENT_MARCH` — add a "launch operation" action + templates.
- [ ] **Prologue choice is cosmetic.** `PrologueModal` stores `selectedResponse` but never
      dispatches it; make each response set different starting stats.
- [ ] **Mini-game rewards are computed in the components** (`RallyMiniGameModal`,
      `TVDebateMiniGameModal`). Move the formulas into the engine so it can validate them.
- [ ] **One election per campaign.** After the coalition there is no next cycle, by-election,
      or no-confidence motion.
- [ ] Manifesto pledges and cabinet ministries are display-only; wire them to reforms/trust.
- [ ] Election realism: candidates in boosted strongholds win almost every time — add more
      local variance / incumbency effects (verify with `npx vitest run balance.sim`).

Features:
- [ ] Gemini-generated dynamic news headlines via a server route (keeps `GEMINI_API_KEY` secret)
- [ ] Interactive SVG India map (state-level choropleth of CJP support)
- [ ] Onboarding/tutorial overlay explaining AP, energy, crackdown, funds, and END DAY

## Done
- [x] Initial local setup: install, typecheck, lint, build, dev server verified (2026-10-05)
- [x] Real game mechanics (Claude, `claude/real-mechanics`, 2026-10-05): pure reducer; engine-enforced
      AP/energy/costs with real outcome toasts; turn-based loop; per-constituency election model;
      majority-checked coalitions; reform passage → victory; 4 defeat endings + game-over screen;
      crackdown/insolvency/trust-decay pressure; derived quests & rank-based AP; all 543 seats
      nominatable; save migration; Vitest (engine + balance sim); header no longer overflows
- [x] Headless balance simulation (`lib/game/simulation/balance.sim.test.ts`)
- [x] UI overhaul (Claude, 2026-10-05; absorbed Codex task C3): semantic colour tokens with a real
      light theme; next/font typography; rebuilt header, tab bar, HUD, ticker, footer; no horizontal
      scroll on any screen at 390px; election empty state; honest Parliament state before MPs;
      TV debate close button + Escape on mini-games; all 11 tabs fit at 1366px
