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
- Unique `id`s prefixed `CRISIS-`. These are invented (non-historical) events, so use fictional
  minor characters (officers, reporters, volunteers). Real people may only appear as described in
  `docs/cjp-timeline.md` (see "Names" in `docs/story-brief.md`).

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

## Story campaign (Act 1)
Goal: Act 1 plays out the real CJP arc from `docs/cjp-timeline.md` (16 May → 5 Oct 2026) as dated
events with choices, then hands over to the sandbox (Act 2). Rules: `docs/story-brief.md`
(real names; don't invent history; mark anything not in the timeline as fictional).

**Gaps found (timeline vs current game, 5 Oct 2026):**
- The game starts 1 Jun 2026 with an invented Section 144 prologue; Act 1 starts 16 May (the remark
  on 15 May, the launch on 16 May).
- `lib/game/data/historicalArchive.ts` contradicts the timeline but is labelled `DOCUMENTED_FACT`:
  CJP's genesis is dated 2024-07-18 (real: 16 May 2026), a Jantar Mantar rally is dated 2024, and a
  "national convention to form a party" (June 2026) doesn't exist in the record.
- Events are 5 invented crises picked at random; there are no dated events, chains, or "historical
  choice".
- Missing systems from the brief: the Followers resource and the government response meter
  (ignore → block accounts → police action → negotiate). There is no act tracking.
- The team (`recruits.ts`) is entirely fictional; the real cast (Saurav Das, Ashutosh Ranka, the
  spokespersons, Sonam Wangchuk as ally) is absent. Investigation cases are fictional but not marked so.
- Party registration and elections are available in Act 1; in the record CJP had not registered by
  5 Oct, so registration belongs to Act 2 (or to a choice that deliberately breaks from history).
- The only operation is a 14-day Jantar Mantar vigil; the real arc has a one-day protest (6 Jun),
  a city tour, a 36-day sit-in (20 Jun–25 Jul), the Sansad Chalo march (20 Jul), School Thik Karo
  (from 15 Aug), the Adivasi drive (17 Sep) and the CEC campaign (from 23 Sep).

**Ownership:** these tasks edit `lib/game/**`, which is held by the Claude UI redesign, so they are
Claude's and run in sequence with it. They must not touch Codex-owned files: `lib/game/data/crises.ts`
(C1), `lib/game/data/media.ts` (C5), `components/map/**` (C4). S1, S2 and S5 are big changes:
plan first, owner approval before code.

### S1. Story event system — Claude (plan → approval → build)
Files: `lib/game/types.ts`, `lib/game/simulation/engine.ts`, `lib/game/simulation/engine.test.ts`,
new `lib/game/data/story/index.ts`.
- `StoryEvent` type: id, date, act, title, description (1–3 sentences), location, choices
  (label, effects on resources, optional `next` event), `historicalChoice`, `source` (timeline heading).
- Events fire on their date during the day advance; choice chains via `next`; state tracks the
  current act and which events fired and what was chosen. Save migration for the new fields.
- Coexists with the random crisis deck (C1) rather than replacing it.
- Tests: an event fires on its date exactly once, chains resolve, saves migrate.

### S2. Act 1 frame and missing resources — Claude (plan → approval → build)
Files: `lib/game/types.ts`, `lib/game/simulation/engine.ts`, `lib/game/simulation/balance.sim.test.ts`,
`components/shell/TopBar.tsx`, `components/game/PrologueModal.tsx`. Depends on S1.
- Start date 16 May 2026; prologue retold from the 15 May remark and the 16 May launch post.
- Add Followers and the government response meter; show both in the top bar.
- Act 1 → Act 2 handover on 5 Oct 2026; party registration locked during Act 1 unless a story
  choice breaks from history (decide in the S2 plan).
- Re-run the balance simulation for the new opening.

### S3. Write Act 1 events — Claude, or Codex once S1 merges
Files: new `lib/game/data/story/act1-*.ts` only (one file per batch). Depends on S1.
- One month per batch, 10–20 events each: May (16–31) · June · July · August · September ·
  October (1–5). Each event cites its timeline heading in `source` and marks the historical choice.
- Quotes only as reported in the timeline. No duplicate of C5 news content; reference it by trigger
  instead.

### S4. Make existing story content match the record — Claude
Files: `lib/game/data/historicalArchive.ts`, `lib/game/data/recruits.ts`,
`lib/game/data/investigations.ts`, `lib/game/types.ts` (only to add a "fictional" flag if needed).
- Rebuild the Archive from the timeline (correct 2026 dates, sources, no invented entries).
- Add the real cast (convenors, spokespersons, allies) with roles and dates from the people index;
  keep or mark fictional recruits clearly as fictional.
- Mark the investigation cases as fictional sandbox content.

### S5. Campaigns that follow the real arc — Claude (plan → approval → build)
Files: `lib/game/simulation/engine.ts`, `lib/game/types.ts`, new `lib/game/data/operations.ts`,
`components/game/JantarMantarScene.tsx` (or its redesign successor), `lib/game/simulation/balance.sim.test.ts`.
Depends on S1–S2.
- Operation templates for the real campaigns: one-day protest, city tour, indefinite sit-in,
  Sansad Chalo march, School Thik Karo, Adivasi School Thik Karo, CEC campaign.
- Story events launch and end them on their dates; the government response meter escalates with
  them. Several campaigns can run at once (matches the Overview mockup's "Active Campaigns").

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
