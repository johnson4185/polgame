# Task Board

Shared between Claude Code and Codex. Claim a task by putting your agent + branch on it
before starting; move it to Done when merged.

## File ownership while tasks are in flight
To avoid merge conflicts, only the owning task may edit these files until it merges:

| Files | Owner |
|-------|-------|
| `lib/game/simulation/engine.ts`, `lib/game/types.ts`, `lib/game/context/GameContext.tsx`, `lib/game/simulation/persistence.ts` | Claude — `claude/real-mechanics` |
| `components/game/GameActionHUD.tsx`, `ElectionNightView.tsx`, `PartyECIView.tsx`, `IndiaMapView.tsx`, `EvidenceBoardView.tsx`, `JantarMantarScene.tsx`, `GovernanceView.tsx`, `GameHeader.tsx`, `app/page.tsx` | Claude — `claude/real-mechanics` |
| `lib/game/data/crises.ts` | Codex — `codex/crisis-deck` |

## In progress
| Task | Agent | Branch |
|------|-------|--------|
| Real game mechanics: turn-based loop, engine-enforced AP, real election model, game-over endings, pure reducer, save compat, Vitest | Claude | `claude/real-mechanics` |

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

### C3. Responsive / accessibility pass on non-core views — `codex/a11y-views`
Files: `components/game/PersonalLifeView.tsx`, `PeopleRosterView.tsx`, `HistoricalArchiveView.tsx`,
`FinanceLedgerView.tsx`, `SituationLogView.tsx`, `ScreenNav.tsx`, `SaveLoadModal.tsx`.
- Check at 375px width: no horizontal page scroll, tap targets ≥ 40px.
- Icon-only buttons get `aria-label`; modals get `role="dialog"` + `aria-modal`.
- Do not change any `dispatch(...)` calls or game logic.

## Backlog (after `claude/real-mechanics` merges)
- [ ] Gemini-generated dynamic news headlines via a server route (keeps `GEMINI_API_KEY` secret)
- [ ] Interactive SVG India map (state-level choropleth of CJP support)
- [ ] Onboarding/tutorial overlay explaining AP, crackdown, funds
- [ ] Balance pass using a headless simulation script (play N games with a scripted strategy)

## Done
- [x] Initial local setup: install, typecheck, lint, build, dev server verified (2026-10-05)
