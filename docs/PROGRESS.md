# Progress log

Plain-English notes after each task: what changed and what a player will notice.
Newest first.

## Questions for Johnson

1. **Art.** Every illustration is still a striped placeholder (title key art, event cards, portraits,
   TV wall). Shall I generate them with Higgsfield in the Truck Art style, or will you supply them?
   The slots are labelled with what each picture should show.
2. **Difficulty.** In the headless simulation, a player who follows history and plays sensibly wins the
   long game in all 5 test seeds (about day 265, by passing 3 laws). Reckless and passive play lose
   quickly. Do you want the "sensible" path to fail sometimes (e.g. 1 in 3)?
3. **Act 3.** The brief describes a governing act with a "Clean India Index". Today the game ends in
   victory when 3 reforms pass. Should Act 3 become a full phase of its own (integrity vs speed policy
   choices), or is the current ending enough for now?
4. **Protest visuals.** Every protest campaign reuses the Jantar Mantar scene and photo (Delhi banners
   even for a protest in Rajasthan). Fine as is, or do you want location-specific scenes once art exists?

## Status after the autonomous run (6 Oct 2026)

All of S1–S5 and R1–R6 are merged to `main`. 53 automated tests, lint, typecheck and the
production build pass; every screen was checked at 1440px and 390px with no horizontal scroll and
no console errors after a 12-day scripted playthrough.

---

## L4 · The movement spreads on the map (8 Oct 2026)

**Before:** volunteers in every state stayed at 0, chapters only grew when a story event said
so, and seat support only moved with blitzes.

**What changed**
- **Volunteers settle into states every day.** They go where the movement is strongest: states
  with chapters, active campaigns, existing support, and more seats. The Map's "Volunteers in
  states" figure is now real.
- **Chapters grow by themselves.** A state reaches "volunteer group" at 300 local volunteers,
  "district offices" at 1,500 and "mass movement" at 6,000. Each step is journaled, and a new
  chapter shows as good news.
- **Chapters fade if neglected.** If a state stays under a quarter of its level's threshold for
  45 days, the chapter drops a level. A warning appears (it also stops End week), and the state
  panel shows the countdown and suggests running a campaign there.
- **Seat support follows presence.** Each seat drifts towards a target set by national trust,
  the state's chapter, local volunteers and the regional mood. It is capped at 45%, the same cap
  as blitzes. Support only falls back if trust collapses below 25, so you don't lose ground just
  for standing still. Seat cards say "rising towards X%".
- On the Map's state panel, a bar shows local volunteers against the next chapter threshold.
- Fixed a phone-only layout bug: the Map's grid column could be stretched wider than the screen.

**Balance:** sensible play now wins 25–37 seats (17–27 before), because presence finally
counts. It still wins on about day 266–273, as before. Reckless and passive play are unchanged.
I lowered the drift strength after a first version gave 39–47 seats, which made a first-time
party's election too easy.

**Technical:** the logic lives in `lib/game/simulation/geography.ts`. `SAVE_VERSION` is 12, and
states have an optional `neglectDays`. 6 new tests (104 in total).

**Checked:** in the browser, after 6 days 489 volunteers had spread across the states, and Delhi
showed "15 / 300 volunteers" towards a volunteer group. 1440px and 390px, no horizontal scroll, no
console errors.

---

## L3 · Age and time (8 Oct 2026)

**What changed**
- **People have ages.**
  - Abhijeet Dipke's birth date (29 September 1995) comes from the public record (the Khaleej Times
    profile in docs/cjp-timeline.md), and the Personal screen says so. He turns 31 in-game on
    29 September 2026.
  - A custom citizen is 26 (born 14 March 2000, invented).
  - All 14 fictional staff have birth dates, and their profiles show their age.
  - Other real people show no age, because the record doesn't give one (your rule).
- **Birthdays happen.**
  - Yours: −5 stress, +3 family support, and a journal entry.
  - Staff on your team: +5 morale and a toast.
- **Age has a mild effect.** Past 35, you recover 1 less energy each night, plus 1 more for every
  further 10 years. It only matters in long campaigns.
- **End week.** Once the party is registered, a teal "Week" button sits next to End Turn.
  - It plays up to 7 days and stops early for any story event, crisis or warning (for example
    someone about to quit, or missed payroll), saying why.
  - Skipped days count as routine work, not idleness, so there's no "the movement looks asleep"
    trust penalty. Normal trust decay still applies, so you can't coast for ever.
- Good news (birthdays, new people wanting to join) no longer shows as a warning, so it doesn't
  stop a week.

**Technical:** the logic lives in `lib/game/simulation/ages.ts`. There is a new `ADVANCE_WEEK`
action, and `ADVANCE_DAY` takes `routine`. `SAVE_VERSION` is 11; migration fills in birth dates.
The save validator now treats the living-world fields (birth dates, rank, days served and so on)
as optional, because only some people have them. 6 new tests (98 in total). The balance
simulation is unchanged.

**Checked:** in the browser, there's no Week button before the party exists. In a patched save
with a party, Week moved day 1 to day 6 and stopped for the 21 May story event. Kunal shows
Age 22; Saurav Das (a real person) shows no age. 1440px and 390px, no horizontal scroll, no
console errors.

---

## L2 · The team grows and changes (8 Oct 2026)

**Before:** staff did nothing except cost money. Only their morale changed, and it only ever fell.

**What changed**
- **Desks produce something every day.** Each output scales with the person's skill, rank and
  morale:
  - Media room: followers.
  - Volunteer coordination: volunteers.
  - Fundraising: money.
  - Research desk: readiness on your open case.
  - Legal desk: a daily chance to ease police pressure.
  - A running campaign: crowd morale.

  A second or third person on the same desk adds less each.
- **Workload follows the job.** Campaigns are heavy (workload climbs towards 80 and morale
  drains), desks are moderate, and no assignment is light. Morale recovers on a desk or without an
  assignment.
- **Staff learn on the job.** A skill point every 30 days at a desk.
- **Loyalty moves with payroll.** +2 each month you pay on time, −10 when you miss it
  (−3 for volunteers).
- **People can quit.** Below 20 morale for 7 days triggers a warning; at 14 days they walk out. The
  stipend comes off your burn rate and the journal records it.
- **Promotions.** Promoting someone to Coordinator needs 60 days on the team; Lead needs 180.
  Both need morale of 40 or more. A promotion gives 1.5× or 2× output, +40% stipend for paid staff,
  +15 morale and +10 loyalty.
- **New people turn up as you grow.** Six new fictional recruits ask to join at 3,000, 6,000,
  10,000, 15,000, 25,000 and 40,000 volunteers. The People screen says how many are still to come
  and the next threshold.
- **Memories come from real events,** for example seeing a campaign through to its end, a
  promotion, or leaving.
- **People screen:**
  - the team's total daily output;
  - each card shows the person's output and "May quit" or "Can be promoted" badges;
  - the profile has an Experience section (rank, time on the team, days towards promotion, the
    Promote button and the pay change) and a desk note explaining what the assignment produces.

**Technical:** the logic lives in `lib/game/simulation/team.ts`. There is a new `PROMOTE_STAFF`
action. `SAVE_VERSION` is 10, and migration adds the new recruits to old saves without
duplicates. 9 new tests (92 in total). The balance simulation is unchanged, because staff only
produce once you assign them.

**Checked:** in the browser, hired Kunal and put him on Fundraising: ₹216 a day, shown on his
card and in the team header. Promotion is blocked at 0 of 60 days with the reason. 1440px and
390px, no horizontal scroll, no console errors.

---

## L1 · Skills grow by doing (8 Oct 2026)

**What changed**
- Your six skills now grow with practice:
  - RTIs, corroboration and court petitions train research;
  - media, going public, rallies and debates train communication;
  - campaigns and blitzes train organising;
  - police talks, legal aid, lobbying and coalitions train negotiation;
  - crises, story choices, marches and hiring train leadership;
  - funding candidates and giving your own money train finances.
- Each level needs more practice than the last (7→8 takes 210 XP, 9→10 takes 270), and a skill
  stops at 10.
- A skill you haven't used for 45 days loses a little progress each month, but never a whole level.
- A refused action (such as a PIL below 70% readiness) teaches nothing. A real attempt that fails
  (a dismissed PIL) still teaches.
- When a skill goes up, the result toast says so ("Research rose to 8.").
- On the Personal screen, the Skills tab shows each level, a "next level" bar with the XP figures,
  and what practises the skill. The old line "Skills rise as you rank up" was untrue and has been
  replaced.

**Why it matters:** skills already powered the game (research makes RTIs stronger, organising
makes blitzes stronger, negotiation moves bills), but they never changed. Now playing a style
makes you better at it.

**Technical:** the logic lives in `lib/game/simulation/skills.ts`. The reducer trains skills
after any action that actually happened. `SAVE_VERSION` is 9, and old saves get empty progress.
6 new tests (83 in total). The balance simulation is unchanged: sensible play wins around day 266.

**Checked:** in the browser, one RTI took research from 0 to 12 out of 210, and the opening story
choice gave 6 leadership XP. 1440px and 390px, no horizontal scroll, no console errors.

---

## A4j · Map screen rebuilt (8 Oct 2026)

**What changed**
- Top cards: states with a chapter, volunteers in the states, and seats contested out of 543.
- The state list has region chips (North, South, East, West, Central, North-east) and a search
  box. Each row shows a coloured dot for your chapter level, a mood badge and the seat count.
- The state panel shows the type, capital, seat count, mood, a 3-step "your presence" meter, the
  issues people care about, local leads and volunteers.
- Seat cards show who holds the seat, voters, your candidate, a support bar and last election's
  vote shares. Each card has a **Blitz** button (1 AP and ₹5,000).
- When blitzes are paused (no AP or not enough money), the reason appears once above the list,
  not on every card. A seat at the 45% blitz limit says so. The 45% limit is the engine's cap,
  and it is now explained.
- **Removed:**
  - A "Road to 272" bar whose fill was really just the chapter count.
  - A fixed line claiming "high impact in Delhi, UP, Bihar, Maharashtra".
  - The mood filter, which existed in code but had no control on screen.

**Checked:** 1440px and 390px. 36 states; the South chip and the "bih" search both filter; Bihar
detail. Blitzes in Patna Sahib went 17% → 21% → 29% until AP ran out, then the paused note
appeared. No horizontal scroll, no console errors. Typecheck, lint, 77 tests and the build all pass.

**A4 is complete:** every screen on the old list now uses the kit.

---

## A4i · Personal screen rebuilt (8 Oct 2026)

**What changed**
- The header has your portrait, name and role, and health, energy and stress meters, plus a
  burnout warning when it applies. "Take a day off" says exactly what it does: skip to tomorrow,
  +35 energy, −25 stress, +5 health. It is locked while an event is open.
- There are four tabs:
  - **Money:** savings, living costs, debt and family support, and how monthly costs work. "Give to
    the movement" has quick amounts and tells you when you don't have enough saved.
  - **Work:** the three job options as choice cards with the real effects.
  - **Skills:** six meters out of 10.
  - **Phone:** a phone showing your latest journal entry and news headlines.
- **Bugs and accuracy fixes:**
  - The donate button used to show its own "Injected ₹…" message whether or not the transfer
    worked. Now only the game's own result toast appears.
  - The job descriptions were wrong: leave pays half salary, not nothing, and a job costs 4 more
    energy a night, not 8. They now match the engine.
  - The phone widget was invented content (a June electricity bill, buses from Rajasthan, a fake
    trend count). It now shows real in-game news and your journal.
  - A custom citizen no longer shows the real founder's photo; they get a placeholder portrait.

**Checked:** 1440px and 390px. Gave ₹25K (savings went from ₹65,000 to ₹40,000 and the movement
fund rose); a ₹50K gift was blocked with the reason; switched to leave; skills and phone render;
a day off moved day 1 to day 2. No horizontal scroll, no console errors. Typecheck, lint, 77 tests
and the build all pass.

---

## A4h · Chronicle and Situation log rebuilt (8 Oct 2026)

**What changed**
- The Chronicle screen has three tabs: **Chronicle**, **Full log** and **Statistics**. Statistics
  is the existing campaign statistics, unchanged.
- **Chronicle** shows cards for public trust, laws passed and cases concluded, a "Your story so
  far" summary, and your diary as cards with turning-point and milestone badges.
- **The summary is now written from what actually happened.** It covers your start date, whether
  you formed a party, MPs, laws, cases and current trust. The old one was a fixed boast ("you
  began in June 2026 …", although the game starts on 16 May) that read the same whether or not
  you'd done any of it.
- **The Situation log** (used in both Chronicle and Research) is rebuilt with the kit:
  - four stat cards;
  - filter chips (Everything, Decisions & crises, News, Turning points);
  - a search box and a newest/oldest toggle;
  - entry cards with a coloured edge by type.
  The noisy hashtag tags are gone.

**Checked:** 1440px and 390px after playing to day 4: the diary lists the real journal; the log
filters (5 entries in total, 3 of them news), shows "Nothing matches" for a junk search, and the
sort flips the order; Statistics renders; the log inside Research still works. No horizontal scroll,
no console errors. Typecheck, lint, 77 tests and the build all pass.

---

## A4g · Archive screen rebuilt (8 Oct 2026)

**What changed**
- The Archive ("The real record") is now a timeline in date order. Each entry has a saffron date
  sticker, then a card with:
  - its verification badge and source publication;
  - the summary, plus the Tele-MANAS helpline note on sensitive entries;
  - a "Why it matters" callout;
  - the people mentioned, as chips;
  - a Source button.
- An "entries unlocked" bar (for example 4 / 39) shows how much of the record you've reached, and a
  line at the bottom says how many entries are still locked.
- The filter row is now tabs (All, Facts, Court, Official, Contested), each showing its count.

**Checked:** 1440px and 390px on day 1 (4 of 39 unlocked; the filter counts add up), no horizontal
scroll, no console errors. Typecheck, lint, 77 tests and the build all pass.

---

## A4f · Parliament screen rebuilt (8 Oct 2026)

**What changed**
- A photo banner says where you stand: in government, in opposition, or not in Parliament yet.
- Below it are cards for your MPs, bills tabled, and laws passed out of 3, with "3 laws wins the
  game" spelled out.
- **Bills tab:**
  - Each bill shows its status, description, resistance, cost, how many states it needs, and which
    ministry it belongs to (green when you hold that ministry, since that makes lobbying go further).
  - Once tabled, a "votes secured" bar shows progress towards passing.
  - The Table and Lobby buttons show their cost. When one can't be used, it says why: no MPs, no
    action points, or not enough money.
- **Cabinet tab** (called "Shadow cabinet" outside government): one card per ministry with
  performance and scandal-risk meters.

**Checked:** 1440px and 390px. Outside Parliament the Table buttons are locked with the reason. In
a patched in-government save, tabling put a bill at 25% of votes and one round of lobbying took it
to 60%; the Cabinet tab rendered. No horizontal scroll, no console errors. Typecheck, lint, 77 tests
and the build all pass.

**Noticed, not changed:** a party in government holds every ministry (the starting cabinet is all
yours), and the Law minister is still the fictional "Advocate Meera Tandon". Both are content and
engine decisions, left for a later pass.

---

## A4e · Election screen rebuilt (8 Oct 2026)

**What changed**
- A "seats counted" bar and one big "Count the next 35 seats" button.
- The 543-seat bar uses the game colours (NDA saffron, CJP pink, INDIA teal, others grey) with the
  272 majority line marked. Below it is a card per bloc with its seat count.
- **The verdict now tells the truth.** The old text always said "neither bloc reached 272, you hold
  the balance of power", even when you won 0 seats or one alliance already had a majority. It now
  says one of:
  - you won an outright majority;
  - you won no seats;
  - one alliance has a majority without you;
  - nobody has a majority.
- The coalition options are choice cards that show the combined seats and the trust cost
  (NDA −12, INDIA −3, watchdog +4). A partnership that wouldn't reach 272 is greyed out, because
  the engine refuses it anyway. With 0 seats the only option is "Back to the streets". With 272+
  it is "Form the government".
- Once decided, a "Go to Parliament" button appears.

**Checked:** at 1440px and 390px:
- a real election from the UI (3 nominees, counted to 543; 0 seats leads to "Back to the streets");
- a patched hung parliament: NDA 230 + CJP 40 = 270 greys out both alliance options; NDA 240
  makes joining the NDA possible, which forms a 280-seat government.

No horizontal scroll and no console errors. Typecheck, lint, 77 tests and the build all pass.

---

## A4d · Party screen rebuilt (8 Oct 2026)

**What changed**
- **Before the party exists:** progress bars show volunteers (out of 15,000) and money (out of
  ₹50,000), each with a tick or a cross. You pick the election symbol from a grid of cards. The
  Register button says what is still missing, including "Registration opens in Act 2" during Act 1.
- **After it exists:** a header shows the party name, symbol, candidates out of 543, projected
  seats and the party account, plus the Call election button with the reason when it is locked.
  Below are three tabs:
  - **Nominate.** Pick the state first, then the seat. The full list of 543 seats was one huge
    dropdown before. The panel beside it shows support in that seat, the security deposit, the
    campaign fund (quick picks from None to ₹100K) and the total cost.
  - **Candidates.** Cards for every seat you have contested.
  - **Manifesto.** Pledge cards with appeal and resistance.
- The candidate-name box now starts empty. It used to be pre-filled with a fictional lawyer's name.

**Checked:** 1440px and 390px. Act 1 lock, then an Act 2 save: registered with a chosen symbol,
nominated a candidate in Patna Sahib with ₹50K, and saw them under Candidates. Manifesto tab, no
horizontal scroll, no console errors. Typecheck, lint, 77 tests and the build all pass.

---

## A4c · Ledgers screen rebuilt (6 Oct 2026)

**What changed**
- The three accounts (your savings, the movement fund, the party account) are now resource cards,
  each showing its monthly cost or status.
- A runway badge turns gold below 4 months and red below 2. Under 2 months it also tells you to
  hold a fundraiser or cut stipends.
- The transaction book has tabs (All, Movement, Personal, Party), plus money-in and money-out
  totals for the selected account.
- **Bug fixed:** the book used to show the oldest entry first. It now shows the newest first.

**Checked:** 1440px and 390px with real spending (an RTI and a corroboration): totals, account
tabs, no horizontal scroll, no console errors. Typecheck, lint, 77 tests and the build all pass.

---

## A4b · Research screen rebuilt (6 Oct 2026)

**What changed**
- Research now has two tabs: **Investigations** and **Situation log**.
- Each case is a card you can pick, showing its stage and readiness.
- The open case shows its stage, legal risk, impact and a "fictional case" badge. The readiness bar
  marks the two thresholds: going public at 50% and filing a PIL at 70%.
- The four actions (File RTIs, Corroborate, File a PIL, Go public) show their cost: 1 AP plus money.
  When one is blocked, the button says why (for example "Needs 70% readiness" or "Needs ₹25,000 in
  funds"), and hovering over it explains what it does.
- Evidence is a list of cards with reliability and type badges, a tick once corroborated, and the
  source and date.

**What a player will notice:** it is now clear what each action costs and why you can't file a PIL
yet. Before, the buttons always looked clickable and failed with a toast.

**Checked:** 1440px and 390px, no horizontal scroll, no console errors. A blocked PIL did nothing;
RTI took readiness from 45% to 58%, and Corroborate took it to 78%. Switching cases and the log tab
both work. Typecheck, lint, 77 tests and the build all pass.

**Not yet:** the Situation log tab still uses the older card styling. It will be redone with the
Chronicle screen.

---

## A4a · People screen rebuilt (6 Oct 2026)

**What changed**
- Tabs for **Team / Real people / Fictional / All**, a grid of person cards, and a profile pop-up with
  morale, loyalty, workload (and integrity for fictional characters only).
- **Assign to…** dropdown with your running campaigns and desks (Legal, Media room, Research,
  Fundraising, Volunteers), or type your own task.
- Real people show when they join ("Joins 03 Jun 2026") and can't be recruited before then.

## A3 · Protests outside Delhi look like it (6 Oct 2026)

**What changed**
- The protest scene now reads from the campaign: the right state police, the state's capital, a
  permit code with the state's code and date, the season's weather, and a march on the State
  Secretariat instead of Sansad Marg. Delhi street names only appear for Delhi protests.
- Sandbox campaigns now name real places (Jaipur Secretariat, Gaya district, Prayagraj).
- The police station text no longer names a fictional lawyer who might not be on your team.

## A2 · Act 2 gets a story (6 Oct 2026)

**What changed**
- **13 new events after 5 October**, all labelled "Fictional scenario": the 10 October march (called
  in the record; how it goes is up to you), "When do we register?", the first party convention, an
  alliance offer, a ticket for ₹50 lakh, the 2027 state elections (Punjab, UP, Uttarakhand, Goa and
  Manipur early in the year; Gujarat and Himachal at the end, as scheduled), defectors at the door,
  a year of burnout, your MPs' first day in the Lok Sabha, a scandal in your ministry, a no-confidence
  threat, and the run-up to 2029.
- Events can now wait for conditions: party events only happen once you've registered, government
  events only when you're in power, Lok Sabha events only once you have MPs.

**What a player will notice**
- The game keeps telling a story after the real record ends, shaped by what you've built.

## Codex features integrated (6 Oct 2026)

**What changed**
- **Save & load** (Settings → Save / Load): autosave plus three named checkpoints with a preview of
  each (date, funds, trust, volunteers, seats), rename, a confirmation before overwriting, download of
  the current campaign or any checkpoint, and import of a JSON backup with a preview before loading.
  Broken or newer-version files are rejected.
- **Statistics** (More → Chronicle → Statistics): charts of funds, followers, trust, volunteers,
  credibility and legal heat over the last 7 or 30 days or all recorded days, a date slider, exact
  values, and a list of major decisions. History is kept in this browser, separately from saves.

**What a player will notice**
- Old saves still load; the save menu explains that browser saves aren't encrypted.

## R6 · Politics after the election (6 Oct 2026)

**What changed**
- **Elections repeat**: a year after an election you can call the next one. Old results clear,
  nominations reopen and your seats are won again (or lost).
- **Coalitions can collapse**: if you're in government and public trust falls below 25% at the start
  of a month, your partners walk out.
- **Manifesto promises matter**: the two pledges are linked to bills. Passing one marks the promise
  as kept (+10 trust in total, +4 credibility).
- **Cabinet matters**: in government, holding the ministry for a bill's sector (Education, Law,
  Finance, Health) makes lobbying much faster.
- The Party desk explains that registration opens on 5 October (Act 2), as in the record.
- The older screens (People, Research, Ledgers, Party, Election, Parliament, Archive, Chronicle,
  Personal life, Map detail) now use the same chunky poster cards as the new ones.

## R5 · Game feel and a tutorial (6 Oct 2026)

**What changed**
- **Numbers tick**: followers, volunteers, funds, trust and credibility count up or down, with a small
  green "+300K" or red "−2" sticker floating next to them.
- **A tutorial for the first days**: four coach cards highlight the top bar, the action menus, the map
  and END TURN. The action and END TURN steps wait until you actually do them. Skip any time; replay it
  from Settings → "Show tutorial again".
- Rally and TV debate rewards are now worked out by the game engine from your score (it can't be
  over-rewarded by the screen).

**What a player will notice**
- Every action visibly moves the numbers.
- A new player is walked through day 1 instead of facing a wall of buttons.

## R4 · The Media room (6 Oct 2026)

**What changed**
- A new **Media** tab (your fifth mockup): a social feed, an "On air" TV wall of the latest headlines, the
  **narrative battle** (the movement vs the government vs mainstream media), trending hashtags and
  platform status.
- Four **media actions** (1 AP each): Post a meme (can backfire), Launch a hashtag (the government
  notices), Go live (followers and volunteers, some legal heat), Counter fake news (₹5,000, wins back
  credibility). They're also in the Media menu on every screen.
- Winning the narrative makes followers grow faster. It drifts toward your public trust; government
  pressure pulls it back. Hostile hashtags (#CockroachForeignAgent…) appear once the government starts
  pushing back.
- **Real moments show up**: the 21 May block marks X as "withheld in India" (memes and hashtags reach
  less there), and #MainBhiCockroach, #PradhanGoBack, #SchoolThikKaro and #GyaneshItsDoneBro trend when
  the story reaches them.
- Social posts are written by fictional citizens with invented handles, so no words are put in real
  people's mouths.

**What a player will notice**
- The dock now reads Home · Campaigns · Map · Media · People · Research · Election · More
  (Party & ECI moved into More and the Politics menu).

## R3 · Crises and pacing (6 Oct 2026)

**What changed**
- **21 random crises** (was 5): monsoon floods, a deepfake, dark money from Mauritius, a team split, a
  ₹100 crore defamation suit, a TV sting, a rogue state chapter, a celebrity with strings attached,
  poaching, another paper leak, an internet shutdown, inflated crowd numbers, and more. All are labelled
  "Fictional scenario" and use invented minor characters.
- Crises now appear as the same dramatic card as story events, with effect stickers; options you can't
  afford are greyed out with the reason.
- The three old crises that put invented words and deeds on the real founder were rewritten; the
  hunger-strike one is now about a volunteer and puts his health first.
- A crisis about a bereaved family is handled the way the story rules require: no rewards from a death,
  the family's wishes first, and the helpline shown.
- **Pacing**: random crises are half as frequent during Act 1 (the story already fills most days).
  Followers now fade a little every day unless you keep giving people reasons to follow, and a day where
  you take no actions costs a point of trust. Doing nothing now ends in "Faded from the headlines".
- The game autosaves at the start of every day and after every story decision, not just every 20 seconds.

**What a player will notice**
- More variety between the story beats; idling is punished.

## R1–R2 · The map and the new home screen (6 Oct 2026)

**What changed**
- A real **interactive map of India**: every state and UT coloured by your support, hover for a quick
  card, click for a state card with issues, seats and a "Grassroots blitz" action. Boundaries follow
  the Survey of India's official depiction (DataMeet data, CC BY 4.0).
- A new **Home** screen like your Overview mockup: you (energy, stress, rank), running campaigns, the
  map in the middle, and News / Intel / Tasks tabs. Story outcomes now appear in the News tab.
- The long row of action buttons is gone. Daily actions now live in four **menus — Organise, Media,
  Legal, Politics** — on every screen, next to your action points and the government meter.
- Results of every action pop up as a coloured toast (green good, yellow warning, red refused).
- **State chapters** start at zero and grow when a campaign in that state completes (or through the
  5 October "build chapters" choice). Map flags show where you have chapters.

**What a player will notice**
- The game opens on the map. The bottom dock now starts with Home.
- Fewer buttons on screen; everything is a tap away in a menu.

## S5 · Campaigns (6 Oct 2026)

**What changed**
- **Real campaigns follow the story**: the City Tour (10 June), the Indefinite Sit-in (only if you refuse
  to leave on 20 June), School Thik Karo (12 Aug), Adivasi School Thik Karo (17 Sep) and the
  "Gyanesh, It's Done Bro" campaign (24 Sep). The sit-in ends when you call off the agitation. If you
  diverge from history, the campaigns you never started don't happen.
- **Several at once**: each running campaign pays out every day or every few days (followers,
  volunteers, credibility), scaled by its morale.
- **Your own campaigns**: Jan Yatra, District Audit Drive and Local Protest (fictional, labelled),
  launched from a "Launch campaign" pop-up for money and an action point.
- **New Campaigns screen**: tabs for every campaign; protests use the Jantar Mantar scene, tours and
  audits get a panel with progress, morale, resources and three actions.
- **Elections are less predictable**: a first-time-party penalty, more local swing and lower weight on
  local support. In the simulation a balanced campaign now wins 56–90% of the seats it contests
  instead of all of them.

**What a player will notice**
- The Campaigns tab is empty until the story (or you) starts something.
- Running two or three campaigns at once is possible but costs money, AP and attention.

## S3 · The whole of Act 1 (6 Oct 2026)

**What changed**
- **79 story events** cover the real arc from the 16 May launch to 5 October, written month by
  month from the research timeline. Each cites the timeline section it comes from (a test checks
  every citation exists) and marks what really happened.
- Highlights: the five-point manifesto, the X block, "49% Pakistani", the 6 June first protest, the
  Pune Exam Manifesto, **"The Police Cut the Lights"** (your mockup) on the first night of the sit-in,
  Wangchuk's fast and removal, the resignation, School Thik Karo, the court win, "Gyanesh, it's done
  bro!" and Gandhi Jayanti in two cities.
- **20 July is a branching set-piece**: lockdown → barricades → talks with the Health Minister → the
  night the camp was cleared. Choosing not to march opens fictional branches (clearly labelled).
- The real team joins and leaves through the story: three spokespersons on 3 June, four more on
  26 June, and the "burger row" dismissal on 21 July.
- When the record doesn't say what CJP chose, the event has no "historical" option; disputed points
  are attributed ("CJP alleged…", "police said…"); events touching student deaths or injuries show the
  helpline and never turn a death into a reward.

**What a player will notice**
- Something happens almost every day: news, decisions, big moments.
- A playthrough that follows history ends Act 1 with "You followed history in N of N decisions".

**Balance note:** a player who follows history wins the long game every time in the simulation;
tightening that is part of S5.

## S2 · Act 1 opens on 16 May (6 Oct 2026)

**What changed**
- The campaign now starts on **16 May 2026**, the day after the "cockroach" remark, with a new
  three-step prologue: the remark (attributed), the exam crisis (with the helpline), and you in
  Boston. Your prologue choice (Exam justice / Jobs / The right to speak) now gives a real starting edge.
- You start as a joke that hasn't launched: 0 followers, ₹40,000, no paid staff. The launch event
  fires straight after the prologue.
- New **Followers** resource (top bar): grows with trust and levels off near CJP's real peak reach;
  brings volunteers and donations. Rallies and TV debates now add followers too.
- New **government response meter** (action panel): Ignore → Block accounts → Police action →
  Negotiate. Reach, trust and street protests push it up; blocks slow follower growth, police action
  raises legal heat daily, negotiation eases it.
- The Jantar Mantar operation is now the real **indefinite sit-in**: planned for 20 June, 36 days.
- **5 October** hands over to **Act 2** with a "Where the record ends" event. Party registration (and
  so elections) is locked in Act 1, as in the record.
- The roadmap (click the date) follows the real arc: Go Viral → Offline → The Long Sit-in → School
  Thik Karo → The Election Commission → Act 2.

**What a player will notice**
- A much more grounded opening and slower start: you build from zero.
- The sit-in screen says "Planned · starts 20/6/2026" until then.
- Trying to register the party before 5 October explains why you can't.

## S1 · Story events (6 Oct 2026)

**What changed**
- A new story-event system: real events fire on their real dates as big modal cards with 2–4 choices.
  Each choice shows its effects as stickers, can cost money, and can lead to a follow-up event days
  later. The game records which choice matches what really happened and counts how far you've
  strayed from history.
- After you choose, the card shows the result and a "What really happened" note with its source.
- Story events take priority over random crises, and the day can't end while one is open.
- Three May events and the 6 June first protest are in as a seed; S3 writes the full calendar.

**What a player will notice**
- On day 6 (6 June) a "Big Moment" card: the first Jantar Mantar protest, with three ways to play it.
- Picking the historical option says "Just like it really happened"; picking another tells you what
  actually happened instead. Both are logged in the Chronicle.

## S4 · The real record (5 Oct 2026)

**What changed**
- The **Archive** was rebuilt from the research timeline: 41 dated entries from the cockroach remark
  (15 May) to the Mumbai FIR (4 Oct), each linking its news source. The old entries, some of them
  false (CJP "founded" in 2024, an invented party convention), are gone.
- Disputed points (who called whom for talks, pellets, the website takedown, the EC exposé) are marked
  **Contested claim** and say who claimed what.
- Entries that mention student suicides or serious harm show the **Tele-MANAS helpline (14416)**.
- The **real CJP team** joins the roster: Saurav Das, Ashutosh Ranka, Vijeta Dahiya, Vaishnavi Gaur,
  Aafreen Nawaz, Deepak Baliyan, Ratna Singh and Ajinkya Shinde, as unpaid volunteers who can only be
  recruited from the date they appear in the record. Real people get no integrity score.
- The older invented characters and the three investigation cases stay in the game but are labelled
  **Fictional**.
- `docs/story-brief.md` gained rules for contested claims and sensitive subjects.

**What a player will notice**
- A trustworthy Archive tab that fills in as the story reaches each date, with a "Contested claim" filter.
- "REAL" and "FICTIONAL" tags on the People screen and a "FICTIONAL CASE" tag on Research.
- Trying to recruit Saurav Das on day 1 says he joins on 3 June.
- Existing saves are upgraded automatically.
