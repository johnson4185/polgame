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
