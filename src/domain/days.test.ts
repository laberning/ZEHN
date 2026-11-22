// Agententage: Summe der Trainingstage, ohne Verlust bei Pausen.

import { describe, expect, it } from 'vitest';
import { DAY, T0 } from '../test/factories.ts';
import { countDay, dayKey, daysAway } from './days.ts';

describe('Agententage', () => {
  it('der Tag wechselt um Mitternacht Ortszeit (Tests laufen in Europe/Berlin, siehe vite.config.ts)', () => {
    expect(dayKey(Date.UTC(2026, 9, 26, 22, 59))).toBe('2026-10-26'); // 23:59 MEZ
    expect(dayKey(Date.UTC(2026, 9, 26, 23, 0))).toBe('2026-10-27'); // 00:00 MEZ, in UTC noch der 26.
  });

  // Tage wie im Spiel: lokale Zeit (dayKey), nicht UTC
  const day = (n: number) => dayKey(T0 + n * DAY);
  it('jeder neue Tag zählt; eine Pause kostet nichts', () => {
    let d = { count: 0, lastDay: null as string | null };
    for (const n of [0, 1, 2, 9, 30]) d = countDay(d, day(n));
    expect(d).toEqual({ count: 5, lastDay: day(30) });
  });

  it('mehrmals am selben Tag zählt einmal; zurückgestellte Uhr ändert nichts', () => {
    const d = countDay({ count: 0, lastDay: null }, day(0));
    expect(countDay(d, day(0))).toBe(d);
    const later = countDay(countDay(d, day(1)), day(2));
    expect(countDay(later, day(1))).toBe(later);
  });

  it('daysAway zählt Kalendertage, auch über Monats-, Jahres- und Zeitumstellungsgrenzen', () => {
    expect(daysAway({ count: 0, lastDay: null }, '2026-10-26')).toBeNull();
    expect(daysAway({ count: 1, lastDay: '2026-10-26' }, '2026-10-26')).toBe(0);
    expect(daysAway({ count: 1, lastDay: '2026-01-28' }, '2026-02-04')).toBe(7);
    expect(daysAway({ count: 1, lastDay: '2025-12-30' }, '2026-01-02')).toBe(3);
    expect(daysAway({ count: 1, lastDay: '2026-10-20' }, '2026-10-30')).toBe(10); // Zeitumstellung am 25.10.
    expect(daysAway({ count: 1, lastDay: '2026-10-30' }, '2026-10-26')).toBe(0); // zurückgestellte Uhr
  });
});
