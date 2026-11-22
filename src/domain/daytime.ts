// Echte Tageszeit in der Geschichte: Wochentag und grobe Tageszeit aus der Uhr des Geräts.
// Gerechnet wird bewusst in lokaler Zeit (wie `dayKey`): Kinder erleben ihren Tag, nicht die UTC-Zeit.
// Nichts davon wird gespeichert; die Zeit steuert nur, welche Texte erscheinen.

export type Daypart = 'morgen' | 'mittag' | 'nachmittag' | 'abend' | 'nacht';

export interface TimeInfo {
  /** „Montag“ … „Sonntag“ */
  weekday: string;
  daypart: Daypart;
  /** Zwischen 0 und 4 Uhr: der Wochentag des Vortags (die Nacht gehört noch zu seinem Abend), sonst nicht gesetzt */
  nightOf?: string;
  /** Hat die Bäckerei gerade offen? (Mo–Sa 6–18 Uhr, So 7–11 Uhr) */
  shopOpen: boolean;
  sunday: boolean;
}

/** Bedingung an einer Zeile: Sie erscheint nur, wenn alle genannten Angaben zur Zeit passen */
export interface TimeCondition {
  daypart?: readonly Daypart[];
  shopOpen?: boolean;
  sunday?: boolean;
}

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'] as const;

/** Ohne Angabe (alte Aufrufer, Tests) gilt der heutige Text: Dienstagmorgen, Bäckerei offen */
export const NEUTRAL_TIME: TimeInfo = { weekday: 'Dienstag', daypart: 'morgen', shopOpen: true, sunday: false };

/** Tageszeit einer Stunde: morgens 5–10, mittags 11–13, nachmittags 14–17, abends 18–21, nachts 22–4 */
export function daypartOf(hour: number): Daypart {
  if (hour >= 5 && hour <= 10) return 'morgen';
  if (hour >= 11 && hour <= 13) return 'mittag';
  if (hour >= 14 && hour <= 17) return 'nachmittag';
  if (hour >= 18 && hour <= 21) return 'abend';
  return 'nacht';
}

/** Wochentag und Tageszeit zu einem Zeitstempel, in lokaler Zeit */
export function timeOf(t: number): TimeInfo {
  const d = new Date(t);
  const day = d.getDay();
  const hour = d.getHours();
  const sunday = day === 0;
  const shopOpen = sunday ? hour >= 7 && hour < 11 : hour >= 6 && hour < 18;
  const info: TimeInfo = { weekday: WEEKDAYS[day]!, daypart: daypartOf(hour), shopOpen, sunday };
  if (hour < 5) info.nightOf = WEEKDAYS[(day + 6) % 7]!;
  return info;
}

/** Passt die Zeile zur Zeit? Ohne Bedingung immer. */
export function matchesTime(cond: TimeCondition | undefined, time: TimeInfo): boolean {
  if (!cond) return true;
  if (cond.daypart && !cond.daypart.includes(time.daypart)) return false;
  if (cond.shopOpen !== undefined && cond.shopOpen !== time.shopOpen) return false;
  if (cond.sunday !== undefined && cond.sunday !== time.sunday) return false;
  return true;
}

const GREETING: Record<Daypart, string> = {
  morgen: 'Guten Morgen',
  mittag: 'Guten Tag',
  nachmittag: 'Guten Tag',
  abend: 'Guten Abend',
  nacht: 'Guten Abend',
};

/** Platzhalter für Story-Texte: {wochentag} „Dienstag“, {jetzt} „Dienstagmorgen“ (nach Mitternacht bis 4 Uhr „Montagnacht“: der Vortag), {gruss} „Guten Morgen“ */
export function timeVars(time: TimeInfo): Record<string, string> {
  return { wochentag: time.weekday, jetzt: `${time.nightOf ?? time.weekday}${time.daypart}`, gruss: GREETING[time.daypart] };
}
