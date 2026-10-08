import type { GameDate, GameState, OperationState, RecruitablePerson, StaffRank } from '../types';
import type { SeededRNG } from './random';

/** L2: the team works, learns, gets tired, gets promoted, and sometimes walks out. */

export type Desk = 'MEDIA' | 'VOLUNTEERS' | 'FUNDRAISING' | 'RESEARCH' | 'LEGAL' | 'CAMPAIGN';
type PersonSkill = keyof RecruitablePerson['skills'];

export const RANK_LABEL: Record<StaffRank, string> = { MEMBER: 'Member', COORDINATOR: 'Coordinator', LEAD: 'Lead' };
const RANK_MULT: Record<StaffRank, number> = { MEMBER: 1, COORDINATOR: 1.5, LEAD: 2 };
/** Days on the team before each promotion is possible */
export const PROMOTION_DAYS: Record<Exclude<StaffRank, 'MEMBER'>, number> = { COORDINATOR: 60, LEAD: 180 };
export const PROMOTION_MIN_MORALE = 40;
/** A paid stipend rises by this factor on promotion */
export const PROMOTION_PAY_RISE = 1.4;
/** Morale below this counts towards quitting */
export const QUIT_MORALE = 20;
export const QUIT_WARNING_DAYS = 7;
export const QUIT_DAYS = 14;
/** Days at a desk for each skill point learned there */
export const LEARN_EVERY_DAYS = 30;

export const DESK_LABEL: Record<Desk, string> = {
  MEDIA: 'Media room',
  VOLUNTEERS: 'Volunteer coordination',
  FUNDRAISING: 'Fundraising',
  RESEARCH: 'Research desk',
  LEGAL: 'Legal desk',
  CAMPAIGN: 'Campaign',
};
const DESK_SKILL: Record<Desk, PersonSkill> = {
  MEDIA: 'communication',
  VOLUNTEERS: 'organizing',
  FUNDRAISING: 'financialAcumen',
  RESEARCH: 'research',
  LEGAL: 'negotiation',
  CAMPAIGN: 'organizing',
};

export const rankOf = (p: RecruitablePerson): StaffRank => p.rank ?? 'MEMBER';

export function nextRank(p: RecruitablePerson): Exclude<StaffRank, 'MEMBER'> | null {
  const r = rankOf(p);
  return r === 'MEMBER' ? 'COORDINATOR' : r === 'COORDINATOR' ? 'LEAD' : null;
}

/** Why this person can't be promoted yet, or null if they can */
export function promotionBlocker(p: RecruitablePerson): string | null {
  const to = nextRank(p);
  if (!p.isHired) return 'Not on the team.';
  if (!to) return 'Already a Lead.';
  const days = p.daysServed ?? 0;
  if (days < PROMOTION_DAYS[to]) return `Needs ${PROMOTION_DAYS[to]} days on the team (${days} so far).`;
  if (p.morale < PROMOTION_MIN_MORALE) return `Morale is too low (needs ${PROMOTION_MIN_MORALE}).`;
  return null;
}

/** Which desk an assignment means. Campaign titles count only while that campaign is running. */
export function deskOf(assignment: string | null, operations: OperationState[]): Desk | null {
  if (!assignment) return null;
  if (operations.some(o => o.status === 'ACTIVE' && o.title === assignment)) return 'CAMPAIGN';
  const a = assignment.toLowerCase();
  if (a.includes('legal') || a.includes('court') || a.includes('bail')) return 'LEGAL';
  if (a.includes('media') || a.includes('press') || a.includes('social')) return 'MEDIA';
  if (a.includes('research') || a.includes('rti') || a.includes('investigat')) return 'RESEARCH';
  if (a.includes('fund') || a.includes('donor') || a.includes('finance')) return 'FUNDRAISING';
  if (a.includes('volunteer') || a.includes('mobilis') || a.includes('mobiliz') || a.includes('coordinat')) return 'VOLUNTEERS';
  return null;
}

function workloadTarget(desk: Desk | null, assignment: string | null): number {
  if (desk === 'CAMPAIGN') return 80;
  if (assignment) return 55;
  return 20;
}

export interface TeamOutput {
  followers: number;
  volunteers: number;
  funds: number;
  /** Chance today to ease the crackdown by 1 */
  legalChance: number;
  research: number;
  campaignMorale: number;
}
const zeroOutput = (): TeamOutput => ({ followers: 0, volunteers: 0, funds: 0, legalChance: 0, research: 0, campaignMorale: 0 });

/** One person's daily output at their desk. `crowding` is how many colleagues share the desk ahead of them. */
export function personOutput(p: RecruitablePerson, desk: Desk | null, crowding = 0): TeamOutput {
  const out = zeroOutput();
  if (!p.isHired || !desk) return out;
  const m = RANK_MULT[rankOf(p)] * (p.morale / 100) * (1 / (1 + 0.6 * crowding));
  const skill = p.skills[DESK_SKILL[desk]];
  if (desk === 'MEDIA') out.followers = Math.round(skill * 40 * m);
  if (desk === 'VOLUNTEERS') out.volunteers = Math.round(skill * 2 * m);
  if (desk === 'FUNDRAISING') out.funds = Math.round(skill * 60 * m);
  if (desk === 'RESEARCH') out.research = Math.round((skill / 5) * m * 10) / 10;
  if (desk === 'LEGAL') out.legalChance = Math.min(0.9, (skill / 30) * m);
  if (desk === 'CAMPAIGN') out.campaignMorale = Math.round((skill / 4) * m * 10) / 10;
  return out;
}

/** Everyone's output today, with diminishing returns for a crowded desk */
export function teamOutput(state: GameState): { total: TeamOutput; byPerson: Record<string, TeamOutput> } {
  const total = zeroOutput();
  const byPerson: Record<string, TeamOutput> = {};
  const seen: Partial<Record<Desk, number>> = {};
  // Best people first, so crowding falls on the weaker hands
  const hired = state.people.filter(p => p.isHired).sort((a, b) => b.morale - a.morale || a.id.localeCompare(b.id));
  for (const p of hired) {
    const desk = deskOf(p.currentAssignment, state.operations);
    const k = desk ? (seen[desk] ?? 0) : 0;
    if (desk) seen[desk] = k + 1;
    const o = personOutput(p, desk, k);
    byPerson[p.id] = o;
    total.followers += o.followers;
    total.volunteers += o.volunteers;
    total.funds += o.funds;
    total.research += o.research;
    total.campaignMorale += o.campaignMorale;
    total.legalChance = 1 - (1 - total.legalChance) * (1 - o.legalChance);
  }
  return { total, byPerson };
}

export interface TeamDayResult {
  people: RecruitablePerson[];
  /** Plain-English lines for the outcome toast and journal */
  warnings: string[];
  quits: string[];
  joined: string[];
}

/** Advance everyone on (and waiting to join) the team by one day. Pure. */
export function stepTeam(
  state: GameState,
  ctx: { date: GameDate; dateLabel: string; isNewMonth: boolean; missedPayroll: boolean; concludedOps: OperationState[]; rng: SeededRNG },
): TeamDayResult {
  const warnings: string[] = [];
  const quits: string[] = [];
  const joined: string[] = [];
  const when = ctx.dateLabel;

  const people = state.people.map(person => {
    // New recruits appear once the movement is big enough to attract them
    if (!person.isHired && person.unlockVolunteers && !person.availableSince && state.movement.volunteerCount >= person.unlockVolunteers) {
      joined.push(person.name);
      return { ...person, availableSince: { ...ctx.date } };
    }
    if (!person.isHired) return person;

    const desk = deskOf(person.currentAssignment, state.operations);
    const target = workloadTarget(desk, person.currentAssignment);
    const workload = person.workload + Math.sign(target - person.workload) * Math.min(5, Math.abs(target - person.workload));

    let morale = person.morale;
    if (workload > 70) morale -= 2;
    else if (workload <= 55 && morale < 90) morale += 1;
    if (ctx.missedPayroll) morale -= 15;
    morale = Math.max(0, Math.min(100, morale));

    let loyalty = person.loyalty;
    if (ctx.isNewMonth) loyalty = Math.max(0, Math.min(100, loyalty + (ctx.missedPayroll ? (person.isVolunteer ? -3 : -10) : 2)));

    const daysServed = (person.daysServed ?? 0) + 1;
    let skills = person.skills;
    let memories = person.memories;
    // Learning on the job
    if (desk && daysServed % LEARN_EVERY_DAYS === 0) {
      const k = DESK_SKILL[desk];
      if (skills[k] < 10) {
        skills = { ...skills, [k]: skills[k] + 1 };
      }
    }
    // Being there when a campaign ended
    for (const op of ctx.concludedOps) {
      if (person.currentAssignment === op.title) memories = [...memories, `Saw ${op.title} through to the end (${when}).`];
    }
    if (morale < 30 && ctx.rng.next() > 0.95) memories = [...memories, `Exhausted after weeks without rest (${when}).`];

    const lowMoraleDays = morale < QUIT_MORALE ? (person.lowMoraleDays ?? 0) + 1 : 0;
    if (lowMoraleDays === QUIT_WARNING_DAYS) warnings.push(`${person.name} is close to quitting. Lighten their load or they will leave within a week.`);
    if (lowMoraleDays >= QUIT_DAYS) {
      quits.push(person.name);
      return {
        ...person,
        isHired: false,
        currentAssignment: null,
        morale,
        workload: 20,
        loyalty: Math.max(0, loyalty - 20),
        lowMoraleDays: 0,
        memories: [...memories, `Left the team, worn out (${when}).`],
      };
    }
    return { ...person, workload, morale, loyalty, daysServed, skills, memories, lowMoraleDays };
  });

  return { people, warnings, quits, joined };
}
