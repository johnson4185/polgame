// Campaign templates. Story events launch and end the real ones (docs/cjp-timeline.md);
// players can launch the sandbox ones themselves. Effects are gameplay abstractions.
import type { OperationType, StoryEffects } from '../types';

export interface OperationTemplate {
  id: string;
  type: OperationType;
  title: string;
  /** One line for menus and cards */
  blurb: string;
  location: string;
  stateName: string;
  durationDays: number;
  /** Movement funds to launch (player-launched only; story launches are free) */
  budget: number;
  /** Applied every `every` days while active, scaled by crowd morale */
  dailyEffects: StoryEffects;
  every?: number;
  /** Only story events can launch it (the real campaigns) */
  storyOnly?: boolean;
  /** Invented sandbox campaign rather than the record */
  fictional?: boolean;
  /** Starting crowd for protest-style campaigns */
  crowd?: number;
}

export const OPERATION_TEMPLATES: OperationTemplate[] = [
  // ── The real arc (launched by story events) ──
  {
    id: 'city-tour',
    type: 'STATE_JAN_YATRA',
    title: 'City Tour: Pune, Lucknow, Bengaluru',
    blurb: 'Taking the movement city to city before the Delhi sit-in.',
    location: 'Pune → Lucknow → Bengaluru',
    stateName: 'Maharashtra',
    durationDays: 9,
    budget: 0,
    dailyEffects: { volunteers: 150, followers: 30000 },
    storyOnly: true,
    crowd: 1500,
  },
  {
    id: 'sitin',
    type: 'JANTAR_MANTAR_PROTEST',
    title: 'Indefinite Sit-in at Jantar Mantar',
    blurb: 'Stay until the Education Minister resigns.',
    location: 'Jantar Mantar Road, Connaught Place',
    stateName: 'NCT of Delhi',
    durationDays: 36,
    budget: 0,
    dailyEffects: { followers: 15000 },
    storyOnly: true,
    crowd: 800,
  },
  {
    id: 'stk',
    type: 'SCHOOL_AUDIT_DRIVE',
    title: 'School Thik Karo',
    blurb: 'Volunteers audit government schools with a checklist.',
    location: 'Nationwide',
    stateName: 'Maharashtra',
    durationDays: 40,
    budget: 0,
    dailyEffects: { credibility: 1, volunteers: 150 },
    every: 3,
    storyOnly: true,
    crowd: 1200,
  },
  {
    id: 'adivasi-stk',
    type: 'SCHOOL_AUDIT_DRIVE',
    title: 'Adivasi School Thik Karo',
    blurb: 'Audits of tribal schools and hostels, from Gadchiroli.',
    location: 'Gadchiroli / Rajasthan',
    stateName: 'Maharashtra',
    durationDays: 18,
    budget: 0,
    dailyEffects: { credibility: 1, volunteers: 100 },
    every: 3,
    storyOnly: true,
    crowd: 600,
  },
  {
    id: 'cec',
    type: 'ELECTION_COMMISSION_CAMPAIGN',
    title: '"Gyanesh, It\'s Done Bro"',
    blurb: 'Pressure on the Chief Election Commissioner to resign.',
    location: 'Delhi / Mumbai',
    stateName: 'NCT of Delhi',
    durationDays: 25,
    budget: 0,
    dailyEffects: { followers: 25000, volunteers: 60 },
    storyOnly: true,
    crowd: 2000,
  },

  // ── Sandbox campaigns the player can launch ──
  {
    id: 'jan-yatra',
    type: 'STATE_JAN_YATRA',
    title: 'Jan Yatra',
    blurb: 'A week-long tour of one state: rallies, chai, sign-ups.',
    location: 'Prayagraj and nearby towns',
    stateName: 'Uttar Pradesh',
    durationDays: 7,
    budget: 30000,
    dailyEffects: { volunteers: 120, followers: 15000 },
    fictional: true,
    crowd: 900,
  },
  {
    id: 'audit-drive',
    type: 'SCHOOL_AUDIT_DRIVE',
    title: 'District Audit Drive',
    blurb: 'Two weeks auditing schools and clinics in one district.',
    location: 'Gaya district',
    stateName: 'Bihar',
    durationDays: 14,
    budget: 20000,
    dailyEffects: { credibility: 1, volunteers: 60 },
    every: 3,
    fictional: true,
    crowd: 400,
  },
  {
    id: 'local-protest',
    type: 'JANTAR_MANTAR_PROTEST',
    title: 'Local Protest',
    blurb: 'Three days outside a state secretariat. Loud, risky.',
    location: 'Secretariat, Jaipur',
    stateName: 'Rajasthan',
    durationDays: 3,
    budget: 10000,
    dailyEffects: { followers: 20000, volunteers: 80, legalHeat: 3 },
    fictional: true,
    crowd: 600,
  },
];

export function getOperationTemplate(id: string): OperationTemplate | undefined {
  return OPERATION_TEMPLATES.find(t => t.id === id);
}
