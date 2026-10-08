import type { GameDate } from '../types';

/** L3: people get older. Ages come from birth dates; real people only have one if the record states it. */

export function ageOn(birth: GameDate | undefined, today: GameDate): number | null {
  if (!birth) return null;
  let age = today.year - birth.year;
  if (today.month < birth.month || (today.month === birth.month && today.day < birth.day)) age -= 1;
  return age;
}

export const isBirthday = (birth: GameDate | undefined, today: GameDate) => !!birth && birth.month === today.month && birth.day === today.day;

/** Energy recovered overnight is a little lower each decade past 35 */
export function ageEnergyPenalty(age: number | null): number {
  if (age === null || age < 35) return 0;
  return 1 + Math.floor((age - 35) / 10);
}

/** "31st" */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Days a "week" lasts when skipping time */
export const WEEK_DAYS = 7;
