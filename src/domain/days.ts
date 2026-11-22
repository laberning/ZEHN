// Agententage: an wie vielen Kalendertagen trainiert wurde. Die Zahl sinkt nie – eine Pause kostet nichts.
// Reine Funktionen; der Tag kommt als Schlüssel (dayKey) herein.

import type { AgentDays } from './profile.ts';

/**
 * Kalendertag als „YYYY-MM-DD“ – bewusst in lokaler Zeit (Ausnahme vom Rechnen ohne Zeitzone):
 * Kinder erleben ihren Tag, nicht den UTC-Tag.
 */
export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Kalendertage zwischen zwei Schlüsseln (b - a); gerechnet in UTC, damit keine Sommerzeit dazwischenfunkt */
function dayDiff(a: string, b: string): number {
  const ms = (k: string) => Date.UTC(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8, 10)));
  return Math.round((ms(b) - ms(a)) / 86_400_000);
}

/** Kalendertage seit dem letzten Agententag; `null`, solange es keinen gibt. Eine zurückgestellte Uhr ergibt 0. */
export function daysAway(d: AgentDays, today: string): number | null {
  return d.lastDay === null ? null : Math.max(0, dayDiff(d.lastDay, today));
}

/** Ein neuer Kalendertag zählt einmal. Derselbe Tag oder eine zurückgestellte Uhr ändern nichts. */
export function countDay(d: AgentDays, today: string): AgentDays {
  if (d.lastDay !== null && today <= d.lastDay) return d;
  return { count: d.count + 1, lastDay: today };
}
