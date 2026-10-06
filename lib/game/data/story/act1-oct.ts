// Act 1 · October 2026 (to 5 Oct, where the record ends). Source: docs/cjp-timeline.md
import type { StoryEvent } from '../../types';

const T = 'docs/cjp-timeline.md#';

export const ACT1_OCT: StoryEvent[] = [
  {
    id: 'evt_1002_gandhi',
    date: '2026-10-02',
    act: 1,
    kind: 'SETPIECE',
    title: 'Gandhi Jayanti: Two Cities',
    description:
      'Delhi Police have imposed Section 163 around Jantar Mantar; arrivals are being bundled into buses. In Mumbai, crowds are gathering at Shivaji Park despite the permission refusal. Where do you lead from?',
    location: 'New Delhi / Mumbai',
    art: 'Split screen: buses at Jantar Mantar, a sea of young people at Shivaji Park',
    choices: [
      {
        id: 'mumbai',
        label: 'Lead the Mumbai rally',
        description: 'Maharashtra is where, you say, the roll irregularities began.',
        effects: { volunteers: 3000, followers: 600000, govResponse: 1 },
        next: 'evt_1002_night',
        outcome: 'Thousands at Shivaji Park chant "Gyanu it’s done bro". Shabana Azmi joins. "Mumbai is just a trailer."',
      },
      {
        id: 'delhi',
        label: 'Go to Jantar Mantar',
        description: 'Stand with the people being detained.',
        effects: { legalHeat: 15, trust: 4, govResponse: 1 },
        next: 'evt_1002_night',
        outcome: 'You are put on a bus with hundreds of others.',
      },
    ],
    historicalChoice: 0,
    history:
      'Dipke led the Mumbai rally, where thousands gathered. In Delhi police detained 500+ (Hindustan Times later said 700+), including former CM Atishi. Saurav Das said Delhi Police "again resorted to brutality".',
    source: `${T}2-october--mumbai-shivaji-park`,
  },
  {
    id: 'evt_1002_night',
    act: 1,
    title: 'Chalo Delhi?',
    description: 'Night. Hundreds are detained in Delhi; Mumbai stayed peaceful. Kumar still hasn’t resigned. What’s the next date?',
    location: 'Mumbai',
    art: 'A phone drafting a post that starts "If Gyanesh Kumar doesn’t resign…"',
    choices: [
      {
        id: 'oct10',
        label: 'Call a nationwide march to Jantar Mantar on 10 October',
        description: '"Wherever police stop us becomes our Jantar Mantar."',
        effects: { volunteers: 2000, govResponse: 1, legalHeat: 6 },
        outcome: 'Outlets nationwide report the 10 October call.',
      },
      {
        id: 'tour',
        label: 'Take it to Goa, Kolkata and Bengaluru first',
        description: 'Build pressure city by city.',
        effects: { followers: 300000, credibility: 3 },
        outcome: 'The tour dates go up.',
      },
    ],
    historicalChoice: 0,
    history:
      'Dipke posted that if Kumar didn’t resign, "cockroaches from across India will march to Delhi & protest at Jantar Mantar on October 10." Das said the campaign would also go to Goa, Kolkata and Bengaluru.',
    source: `${T}2-october--mumbai-shivaji-park`,
  },
  {
    id: 'evt_1004_fir',
    date: '2026-10-04',
    act: 1,
    title: 'FIR in Mumbai',
    description: 'Mumbai Police have registered an FIR against the Shivaji Park organisers for unlawful assembly.',
    location: 'Mumbai',
    art: 'An FIR copy on a police station counter',
    choices: [
      {
        id: 'contest',
        label: 'Contest it in court',
        description: 'A peaceful rally isn’t a crime.',
        effects: { credibility: 4, legalHeat: -4 },
        cost: 15000,
        outcome: 'Lawyers file for quashing.',
      },
      {
        id: 'shrug',
        label: '"Add it to the pile"',
        description: 'Turn it into a badge of honour.',
        effects: { followers: 200000, legalHeat: 5 },
        outcome: 'Supporters print it on T-shirts.',
      },
    ],
    history: 'Mumbai Police registered the FIR. As of 5 October Kumar had not resigned or commented.',
    source: `${T}45-october`,
  },
  {
    id: 'evt_1005_record_ends',
    date: '2026-10-05',
    act: 1,
    kind: 'SETPIECE',
    title: 'Where the Record Ends',
    description:
      'As of 5 October the Chief Election Commissioner has not resigned, and no Delhi permission for the 10 October march has been reported. This is where history stops. What does CJP become next?',
    location: 'Everywhere',
    art: 'A blank page with a cockroach doodle in the margin',
    fictional: true,
    choices: [
      {
        id: 'party',
        label: 'Become a political party',
        description: 'File with the Election Commission and aim for the ballot box.',
        effects: { volunteers: 500, trust: 2 },
        outcome: 'Registration paperwork begins. The road to 272 starts here.',
      },
      {
        id: 'movement',
        label: 'Stay a people\'s movement',
        description: 'Keep pressure from the street, outside electoral politics, for now.',
        effects: { followers: 200000, credibility: 5 },
        outcome: 'Supporters cheer the independence. Registration stays open if you change your mind.',
      },
      {
        id: 'chapters',
        label: 'Build state chapters first',
        description: 'Organise on the ground in every state before any election.',
        effects: { volunteers: 1500 },
        cost: 20000,
        outcome: 'Chapter conveners are named in a dozen states.',
      },
    ],
    source: `${T}45-october`,
  },
];
