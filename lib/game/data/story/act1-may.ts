// Act 1 · May 2026: launch, viral surge, crackdown. Source: docs/cjp-timeline.md
// Real people's words are quoted only as reported. Effects are gameplay abstractions.
import type { StoryEvent } from '../../types';

export const ACT1_MAY: StoryEvent[] = [
  {
    id: 'evt_0516_launch',
    date: '2026-05-16',
    act: 1,
    kind: 'SETPIECE',
    title: 'What If All Cockroaches Come Together?',
    description:
      'Yesterday the Chief Justice compared unemployed youth to "cockroaches". Today the clip is everywhere. You are job-hunting in Boston with a phone, a joke and a very angry country.',
    location: 'Boston, USA',
    art: 'A phone screen glowing in a dark room, a cockroach emoji mid-send',
    choices: [
      {
        id: 'post',
        label: 'Post six words',
        description: '"What if all cockroaches come together?" Then a sign-up link.',
        effects: { followers: 300000, volunteers: 600, trust: 4 },
        outcome: 'It goes viral within hours. By night a website is live: "Voice of the Lazy & Unemployed".',
      },
      {
        id: 'thread',
        label: 'Write a careful thread',
        description: 'Explain the exam crisis and fake-degree context, point by point.',
        effects: { followers: 60000, credibility: 6 },
        outcome: 'Respected, shared by journalists, but the internet scrolls on.',
      },
      {
        id: 'quiet',
        label: 'Stay quiet, keep job-hunting',
        description: 'It is not your fight. Is it?',
        effects: { energy: 10, trust: -3 },
        outcome: 'Someone else makes the joke. The anger has nowhere to go, for now.',
      },
    ],
    historicalChoice: 0,
    history:
      'Dipke posted "What if all cockroaches come together?", then a launch line and sign-up link. cockroachjantaparty.org went live the same day.',
    source: 'docs/cjp-timeline.md#16-may-sat',
  },
  {
    id: 'evt_0521_x_block',
    date: '2026-05-21',
    act: 1,
    kind: 'EVENT',
    title: 'Account Withheld in India',
    description:
      'Instagram has passed 10 million followers, more than BJP\'s handle. Now MeitY has ordered X to block the CJP account under IT Act section 69A, citing national security.',
    location: 'Online',
    art: 'An X profile page stamped "Account withheld in India"',
    choices: [
      {
        id: 'back',
        label: 'Come back in minutes',
        description: 'Open a new account: "Cockroach is Back".',
        effects: { followers: 400000, legalHeat: 6, govResponse: 1 },
        outcome: 'The new handle trends instantly. The block becomes the story.',
      },
      {
        id: 'court',
        label: 'Challenge it in court',
        description: 'File in the Delhi High Court against the block.',
        effects: { credibility: 6, legalHeat: -2 },
        cost: 15000,
        next: 'evt_0526_hc_petition',
        nextDelayDays: 5,
        outcome: 'Lawyers start drafting. It will take a few days.',
      },
      {
        id: 'lie_low',
        label: 'Lie low for a week',
        description: 'Let things cool down before the next move.',
        effects: { followers: -150000, legalHeat: -5, trust: -2 },
        outcome: 'The pressure eases, and so does the momentum.',
      },
    ],
    historicalChoice: 0,
    history:
      'Minutes after the block, CJP reappeared as "Cockroach is Back" (@Cockroachisback). Dipke also moved the Delhi High Court against the block on 26 May.',
    source: 'docs/cjp-timeline.md#21-may-thu',
  },
  {
    id: 'evt_0526_hc_petition',
    act: 1,
    kind: 'EVENT',
    title: 'Petition Filed in the Delhi High Court',
    description: 'Your challenge to the X block is in the Delhi High Court. How loudly do you fight it?',
    location: 'Delhi High Court',
    art: 'Court steps, a lawyer holding a thick file',
    choices: [
      {
        id: 'publicise',
        label: 'Make it a public campaign',
        description: 'Explain the case to followers every day.',
        effects: { followers: 120000, legalHeat: 3 },
        outcome: 'The case becomes a free-speech rallying point.',
      },
      {
        id: 'quiet_case',
        label: 'Let the lawyers work quietly',
        description: 'No commentary on a matter before the court.',
        effects: { credibility: 4 },
        outcome: 'Commentators note the restraint.',
      },
    ],
    history: 'Dipke moved the Delhi High Court against the X block on 26 May. The outcome had not been reported as of 5 October.',
    source: 'docs/cjp-timeline.md#24-26-may',
  },
];

export const ACT1_JUNE_SEED: StoryEvent[] = [
  {
    id: 'evt_0606_first_protest',
    date: '2026-06-06',
    act: 1,
    kind: 'SETPIECE',
    title: 'First Protest at Jantar Mantar',
    description:
      'You have landed in Delhi holding Ambedkar\'s autobiography. About 5,000 police are deployed across New Delhi district. Permission runs until 5 pm as a "one-time exception".',
    location: 'Jantar Mantar, New Delhi',
    speaker: { name: 'Sonam Wangchuk', role: 'Ally', line: 'Sonam Wangchuk has come to stand with you.' },
    art: 'Crowd at Jantar Mantar in cockroach masks, tricolours and books held up',
    choices: [
      {
        id: 'end_on_time',
        label: 'End at 5 pm, set a deadline',
        description: 'Keep it peaceful and within the permission. Give the minister seven days.',
        effects: { volunteers: 900, credibility: 6, trust: 4 },
        outcome: 'The protest ends on time. The seven-day deadline makes headlines.',
      },
      {
        id: 'stay_on',
        label: 'Stay past 5 pm',
        description: 'Refuse to leave until the minister resigns.',
        effects: { volunteers: 1400, legalHeat: 15, govResponse: 1 },
        outcome: 'Police move in after dark. The crowd scatters but the images spread.',
      },
      {
        id: 'march',
        label: 'Lead the crowd toward Parliament',
        description: 'Turn a protest into a march.',
        effects: { followers: 500000, legalHeat: 25, trust: -3, govResponse: 2 },
        outcome: 'Barricades, detentions, and a very different story in the morning papers.',
      },
    ],
    historicalChoice: 0,
    history:
      'The protest ended; The Hindu reported six detained. CJP set a seven-day deadline for the Education Minister\'s resignation.',
    source: 'docs/cjp-timeline.md#6-june-sat-arrival-and-first-protest',
  },
];
