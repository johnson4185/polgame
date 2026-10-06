// Act 1 · October 2026 (to 5 Oct, where the record ends). Source: docs/cjp-timeline.md
import type { StoryEvent } from '../../types';

export const ACT1_OCT: StoryEvent[] = [
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
        effects: { volunteers: 1500, funds: -20000 },
        cost: 20000,
        outcome: 'Chapter conveners are named in a dozen states.',
      },
    ],
    source: 'docs/cjp-timeline.md#4-5-october',
  },
];
