# Task Board

Shared between Claude Code and Codex. Claim a task by putting your agent + branch on it
before starting; move it to Done when merged.

## File ownership while tasks are in flight
To avoid merge conflicts, only the owning task may edit these files until it merges:

| Files | Owner |
|-------|-------|
| Everything | Claude — autonomous run (5 Oct 2026). Codex tasks C1, C4, C5 taken over by Claude with the owner's permission; no other agent is active. |

## In progress
| Task | Agent | Branch |
|------|-------|--------|

## Ready for Codex
Each item lists the files it may touch. Do not edit files owned by an in-flight task above.

### C1. Expand the crisis deck (5 → 20+ events) — ✅ done by Claude (R3): 21 crises
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

### C4. Interactive India map component — ✅ done by Claude (R1)
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

### C5. Media content data — ✅ done by Claude (R4), posts by fictional citizens only
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

### S1. Story event system — Claude · ✅ DONE (merged 6 Oct 2026)
**Plan (self-approved, autonomous run):**
- Types: `StoryEvent` (id, ISO date or follow-up only, act, title, description, location, optional
  speaker, art label, `kind` EVENT/SETPIECE, `sensitive`, 2–4 `StoryChoice`s, `historicalChoice`,
  `source`) and `StoryChoice` (label, description, `effects`, optional `cost` gate, `next` follow-up
  with `nextDelayDays`, `outcome` text).
- State `story`: act, startedOn, fired ids, choice per event, follow-up queue, active event,
  divergence count (non-historical choices). Save version 4 migration.
- Engine: `pumpStory` activates the next due event (dated events on/after the campaign start, then
  queued follow-ups); runs after each day advance, after the prologue, and after each choice. The
  day can't advance while an event is open; story events pre-empt the random crisis roll.
  `RESOLVE_STORY_CHOICE` checks the cost, applies effects through the existing helpers, journals the
  choice (noting the historical one), queues the follow-up.
- Registry `lib/game/data/story/index.ts` + a seed batch in `act1-may.ts` (S3 fills the rest).
- UI `components/game/StoryEventDialog.tsx`: modal card with art, speaker, 2–4 ChoiceCards with
  effect chips; after choosing, a result panel with the outcome and "What really happened" + source.
- Tests: fires once on its date, same-day events queue, follow-ups (immediate and delayed), cost
  gate, divergence, day advance blocked, migration.

Files: `lib/game/types.ts`, `lib/game/simulation/engine.ts`, `lib/game/simulation/engine.test.ts`,
new `lib/game/data/story/index.ts`.
- `StoryEvent` type: id, date, act, title, description (1–3 sentences), location, choices
  (label, effects on resources, optional `next` event), `historicalChoice`, `source` (timeline heading).
- Events fire on their date during the day advance; choice chains via `next`; state tracks the
  current act and which events fired and what was chosen. Save migration for the new fields.
- Coexists with the random crisis deck (C1) rather than replacing it.
- Tests: an event fires on its date exactly once, chains resolve, saves migrate.

### S2. Act 1 frame and missing resources — Claude · ✅ DONE (merged 6 Oct 2026)
**Plan (self-approved, autonomous run):**
- Start 16 May 2026. Prologue retold from the 15 May remark and the exam crisis; its focus choice
  (Exams / Jobs / Free speech) gives a small real starting bonus (closes the "prologue choice" backlog item).
- Starting numbers fit a joke that hasn't launched: no followers, little money, no paid staff
  (fictional recruits start un-hired). The Jantar Mantar operation becomes the real indefinite sit-in
  (20 Jun, 36 days); operations in PREPARATION activate on their start date.
- **Followers** (`movement.followers`): grow with trust and media, slowed by account blocks; feed
  volunteers and donations; rallies and debates add followers. Shown first in the top bar.
- **Government response meter** (`govResponse.pressure` 0–100): Ignore (<25) → Block accounts (<50) →
  Police action (<75) → Negotiate. Pressure rises with followers, trust, protests and story choices
  (`govResponse` effect = 10 pts per step), eases when quiet. Stage effects: blocks slow follower
  growth; police action pushes legal heat up daily; negotiation eases it. Shown in the HUD.
- **Act handover**: on 5 Oct the story moves to Act 2 with a "where the record ends" event. Party
  registration (and so nominations/elections) is locked during Act 1, as in the record.
- Tests + balance sim updated for the new opening.
Files: `lib/game/types.ts`, `lib/game/simulation/engine.ts`, `lib/game/simulation/balance.sim.test.ts`,
`components/shell/TopBar.tsx`, `components/game/PrologueModal.tsx`. Depends on S1.
- Start date 16 May 2026; prologue retold from the 15 May remark and the 16 May launch post.
- Add Followers and the government response meter; show both in the top bar.
- Act 1 → Act 2 handover on 5 Oct 2026; party registration locked during Act 1 unless a story
  choice breaks from history (decide in the S2 plan).
- Re-run the balance simulation for the new opening.

### S3. Write Act 1 events — Claude · ✅ DONE (merged 6 Oct 2026)
79 events in `lib/game/data/story/act1-{may,jun,jul,aug-sep,oct}.ts`; tests check every source anchor
against the timeline's headings and play all of Act 1 the historical way.
Files: new `lib/game/data/story/act1-*.ts` only (one file per batch). Depends on S1.
- One month per batch, 10–20 events each: May (16–31) · June · July · August · September ·
  October (1–5). Each event cites its timeline heading in `source` and marks the historical choice.
- Quotes only as reported in the timeline. No duplicate of C5 news content; reference it by trigger
  instead.

### S4. Make existing story content match the record — Claude · ✅ DONE (merged 5 Oct 2026)
**Plan (self-approved, autonomous run):**
1. Add "Contested claims" and "Sensitive subjects" rules to `docs/story-brief.md`.
2. Rebuild `historicalArchive.ts` only from `docs/cjp-timeline.md`: ~30 dated entries, 15 May → 5 Oct
   2026, each with the timeline's source link. Add a `CONTESTED_CLAIM` status for disputed points
   (pellets, who called whom, injury counts) written with attribution. Drop the invented and
   2024 entries (not in the timeline; several were false).
3. Archive screen: filter for the new status, honest disclaimer, sources shown.
4. Real cast in `recruits.ts` (Saurav Das, Ashutosh Ranka, the spokespersons, Ajinkya Shinde) as
   volunteers with `historical: true`, a join date, and roles/notes from the people index; no
   invented quotes, no integrity score shown for real people. Existing recruits kept, flagged
   `fictional: true`.
5. Investigation cases flagged fictional and labelled in the Research screen.
6. Hiring a real cast member before their join date is refused by the engine. Tests updated.

Files: `lib/game/data/historicalArchive.ts`, `lib/game/data/recruits.ts`,
`lib/game/data/investigations.ts`, `lib/game/types.ts` (only to add a "fictional" flag if needed).
- Rebuild the Archive from the timeline (correct 2026 dates, sources, no invented entries).
- Add the real cast (convenors, spokespersons, allies) with roles and dates from the people index;
  keep or mark fictional recruits clearly as fictional.
- Mark the investigation cases as fictional sandbox content.

### S5. Campaigns that follow the real arc — Claude · ✅ DONE (merged 6 Oct 2026)
**Plan (self-approved, autonomous run):**
- Templates in `lib/game/data/operations.ts`: the real City Tour, Indefinite Sit-in, School Thik Karo,
  Adivasi School Thik Karo and CEC campaign (story-only), plus fictional sandbox Jan Yatra, District
  Audit Drive and Local Protest the player can launch (funds + 1 AP).
- Story effects `launchOperation` / `endOperation`: 10 Jun tour, 20 Jun sit-in (only if you refuse to
  leave), 25 Jul end, 12 Aug School Thik Karo, 17 Sep Adivasi drive, 24 Sep CEC campaign. The sit-in
  is no longer pre-seeded: diverge from history and it doesn't happen.
- Daily template effects while a campaign runs (scaled by crowd morale); several at once.
- Campaigns screen: tabs for every campaign, a "Launch campaign" popover, the Jantar Mantar scene for
  protests and a simpler panel for tours, audits and the CEC campaign.
- Elections: more local variance and a new-party penalty so following history no longer guarantees
  victory (balance sim target: balanced wins most but not all seeds).
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
3. [ ] Screens: ~~Overview (map + feeds)~~ ✅ · ~~Event dialog~~ ✅ (S1) · Protest scene → Media room → People, Finance, Research, Lawsuits, Election
   - R1 ✅ India map (`components/map/IndiaMap.tsx`, DataMeet CC BY 4.0, Survey of India depiction) — took over C4
   - R2 ✅ Overview home + ActionBar (Organise · Media · Legal · Politics menus) + global outcome toast
   - R3 ✅ Crisis deck 5 → 21 (fictional minor characters), crises as event cards, pacing and idle penalties
   - R4 ✅ Media room: narrative battle, trending, platforms, social feed, 4 media actions
   - R5 ✅ Mini-game rewards in the engine, ticking numbers with +/- bubbles, interactive tutorial
   - R6 ✅ Election cycles, coalition collapse, manifesto/cabinet → reforms, Act 1 party banner,
     poster styling applied to the older screens (People, Research, Ledgers, Party, Election,
     Parliament, Archive, Chronicle, Personal, Map detail)
4. [ ] Mechanics behind the new UI: followers, concurrent campaigns, narrative battle, trending/social, media actions

## Still open (after the autonomous run)
- [ ] Illustrations for every `ArtPlaceholder` (waiting on the owner — see PROGRESS "Questions")
- [ ] Location-aware protest scene (currently Jantar Mantar visuals for every protest)
- [ ] Act 3 as a full governing phase with the Clean India Index (owner to decide scope)
- [ ] Difficulty pass if the owner wants sensible play to lose sometimes
- [ ] Rebuild the older screens fully with the kit (they now share the poster styling via CSS)

## Backlog
Gameplay gaps (engine work — claim before starting, they touch `engine.ts`):
- [x] **More operations.** Done in S5 (templates, story launches, player launches).
- [ ] The Jantar Mantar scene is used for every protest campaign; a local protest elsewhere still shows
      Delhi-specific banners and the Delhi photo. Make the protest scene location-aware (redesign).
- [x] **Prologue choice is cosmetic.** Done in S2 (focus choice gives a starting bonus).
- [x] **Mini-game rewards are computed in the components.** Done in R5 (`miniGameRewards`).
- [x] **One election per campaign.** Done in R6: next general election a year after the last;
      coalitions collapse if trust falls below 25.
- [x] Manifesto pledges and cabinet ministries wired to reforms (R6): pledges kept when their bill
      passes; holding the sector's ministry speeds lobbying.
- [ ] Election realism: candidates in boosted strongholds win almost every time — add more
      local variance / incumbency effects (verify with `npx vitest run balance.sim`).
      After S2 the balanced sim wins 5/5 with every candidate winning: needs tightening (planned in S5).

Features:
- [ ] Gemini-generated dynamic news headlines via a server route (keeps `GEMINI_API_KEY` secret)
- [ ] Interactive SVG India map (state-level choropleth of CJP support)
- [x] Onboarding/tutorial overlay — done in R5 (4 coach steps, waits for real actions)

## Done
- [x] Initial local setup: install, typecheck, lint, build, dev server verified (2026-10-05)
- [x] Real game mechanics (Claude, `claude/real-mechanics`, 2026-10-05): pure reducer; engine-enforced
      AP/energy/costs with real outcome toasts; turn-based loop; per-constituency election model;
      majority-checked coalitions; reform passage → victory; 4 defeat endings + game-over screen;
      crackdown/insolvency/trust-decay pressure; derived quests & rank-based AP; all 543 seats
      nominatable; save migration; Vitest (engine + balance sim); header no longer overflows
- [x] Headless balance simulation (`lib/game/simulation/balance.sim.test.ts`)
- [x] Campaign statistics (Codex `456953f`) and save manager (Codex `91aed90`) — integrated by Claude
      6 Oct 2026; Followers added as a statistics metric. See `docs/campaign-statistics.md`,
      `docs/save-manager.md`.
- [x] UI overhaul (Claude, 2026-10-05; absorbed Codex task C3): semantic colour tokens with a real
      light theme; next/font typography; rebuilt header, tab bar, HUD, ticker, footer; no horizontal
      scroll on any screen at 390px; election empty state; honest Parliament state before MPs;
      TV debate close button + Escape on mini-games; all 11 tabs fit at 1366px
