# Task Board

Shared between Claude Code and Codex. Claim a task by putting your agent + branch on it
before starting; move it to Done when merged.

## In progress
| Task | Agent | Branch |
|------|-------|--------|

## Backlog
- [ ] Add a test runner (Vitest) with reducer tests for `gameReducer` / `advanceSimulationDay`
- [ ] Save-compat: merge loaded saves over `createInitialState` defaults
- [ ] Decide on Gemini: wire up `@google/genai` (needs a server route to keep the key secret) or remove the dependency
- [ ] Remove duplicate `src/assets/images/` (only `public/images/` is used)
- [ ] Remove legacy `.eslintrc.json` (flat `eslint.config.mjs` is what runs)

## Done
- [x] Initial local setup: install, typecheck, lint, build, dev server verified (2026-10-05)
