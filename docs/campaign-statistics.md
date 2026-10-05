# Campaign statistics handoff

Owner-approved separate feature, developed on `codex/campaign-statistics` in
`C:/Aurliqlabs/polgame-codex-stats`, based on commit `a0b3b74`.
Claude's uncommitted S1 story work is not included or modified.

## Player experience

Open **More → Chronicle → Statistics**. Select movement funds, public trust,
volunteers, credibility, or legal heat and a 7-day, 30-day, or all-recorded period.
The chart has a keyboard-accessible date slider and an exact-value table.
Summary cards show the latest value, change, and peak for the selected period.
Major decisions show milestones and turning points already recorded in the journal.

## Integration

- `components/statistics/CampaignStatisticsProvider.tsx` observes committed game
  state throughout play. It must remain inside `GameProvider` and above the screen router.
- `components/statistics/CampaignStatistics.tsx` contains the dashboard.
- `lib/game/statistics/history.ts` contains the independently tested data functions.
- `app/page.tsx` adds the provider wrapper.
- `components/game/JournalEndingsView.tsx` wraps the existing Chronicle in kit tabs
  and adds Statistics. Existing Chronicle content remains intact.

There are no engine, game type, context, dependency, or save-format changes. If
Claude's redesign changes either integration file, keep the provider wrapper and
mount `CampaignStatistics` in the redesigned Chronicle or another appropriate tab.
The feature is committed on its own branch for later integration; it is not merged
into Claude's active branch.

## Data behavior

- Record one latest snapshot per observed game date, including updates during a day.
- Retain up to 730 recorded days per campaign, keyed by campaign mode and seed.
- Store under `republic543_statistics_v1_*`, independently of save slots. Statistics
  stay in this browser; save exports do not carry them to another browser.
- Existing saves start a series when observed. Never infer past totals or fabricate
  unobserved days. Chart lines connect observed dates, using actual elapsed time.
- Loading an earlier save truncates later statistics for that campaign; alternate
  save branches share one active history. Loading a save on the same date replaces
  that day's totals. Separate seeds/modes have separate series.
- Missing or malformed history recovers to valid observations. Storage failures
  show an explicit session-only notice without interrupting gameplay.
- Journal entries come from the loaded save, independently of chart history.

## Verification

Passed on 5 Oct 2026: `npx tsc --noEmit`, `npm run lint`, `npm test` (29 tests), and
`npm run build:check`. Six new tests cover daily replacement, save rewind, date
gaps/window boundaries, campaign separation, malformed data, and retention limits.

Browser automation exposed no available browser in this environment, so visual
verification at 390px remains a manual check. The dashboard uses responsive grids,
bounded SVG width, wrapping text, and a two-column exact-value table.

Manual check: play several days, open Statistics, change resources and periods,
use arrow keys on the date slider, expand exact values, reload, load an earlier
save, and start a different campaign. Repeat at 390px and desktop width.

Preview from this worktree with `npm run dev -- --hostname 127.0.0.1 --port 3001`.
The different port isolates preview browser saves from Claude's port-3000 app.
