# Save manager handoff

Owner-approved feature on `codex/save-manager`, worktree
`C:/Aurliqlabs/polgame-codex-saves`. This branch builds on campaign statistics
(`456953f`); Claude's active story work is untouched.

## Player experience

Open the settings menu and choose **Save / Load**. Four tabs show autosave and
three manual checkpoints. Each readable checkpoint previews its player, campaign
date, funds, trust, volunteers and seats. Manual checkpoints support custom names,
renaming without replacing gameplay, and explicit overwrite confirmation.

Download the current campaign or any individual checkpoint, including an unreadable
checkpoint for later recovery. Imported JSON files are previewed before loading.
Canceling that preview leaves gameplay unchanged. Loading replaces unsaved progress;
other manual checkpoints remain intact, and autosave follows the loaded campaign.

The dialog uses the shared GameDialog, Tabs and Button kit, with focus containment,
Escape to close, keyboard controls, responsive button grids and scrollable content.
It explains accurately that saves are local browser data, not encrypted storage.

## Storage compatibility

- Original localStorage slot keys and plain JSON campaign payloads are retained.
- New saves embed optional `_slotMetadata` next to the existing GameState fields.
  This makes the checkpoint and label one atomic localStorage write. A quota/write
  failure preserves the prior checkpoint. Load/import strips this storage metadata
  before passing the state to the simulation.
- Legacy `_meta` records remain readable, but preview resource totals come from
  the actual checkpoint. Missing/corrupt metadata does not hide a readable save.
- Save names persist across subsequent writes; autosave is always named Autosave.
- Rename preserves gameplay and the original save timestamp.
- Import/load verifies version, dates, key resources and migrated structural fields.
  Saves newer than the current engine version are rejected, not downgraded. The
  version follows the engine's SAVE_VERSION automatically after integration.
- Files larger than 5 MB are rejected before reading. Browser-only statistics
  history is not part of these campaign backups.
- If future types add optional fields populated in createInitialState, update the
  optional-field list in saveValidation.ts and add a compatibility test as needed.

## Integration scope

Changes are limited to SaveLoadModal, the new SavePreview component, persistence
helpers, structural validation, tests and handoff notes. No engine, GameState,
GameContext or story-system changes. The existing two-argument saveGameToSlot API
still works; an optional third argument supplies a checkpoint name.

The branch includes statistics in its ancestry. Integrate both commits in order,
or cherry-pick just the save-manager commit if statistics is not wanted yet.

## Verification

Passed on 5 Oct 2026: `npx tsc --noEmit`, `npm run lint` (no warnings),
`npm test` (39 tests) and `npm run build:check`. Preview HTTP check returned 200.
Persistence tests cover atomic writes, naming, rename preservation, quota failures,
legacy metadata, migrated old saves, progressed campaigns, malformed inputs,
unavailable storage, and downloading unreadable checkpoints unchanged.

Preview: `npm run dev -- --hostname 127.0.0.1 --port 3002` from this worktree.
This separate origin keeps its browser saves apart from the other previews.

No browser automation was available for visual checks. Manual verification remains:
check at 390px, create and rename a checkpoint, cancel/confirm an overwrite, download
both current and saved campaigns, preview/cancel/load a backup, and use keyboard
navigation and Escape. The required code checks are recorded in docs/TASKS.md.
