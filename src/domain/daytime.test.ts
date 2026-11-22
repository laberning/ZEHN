import { describe, expect, it } from 'vitest';
import { daypartOf, matchesTime, NEUTRAL_TIME, timeOf, timeVars } from './daytime.ts';

/** 2026-11-01 ist ein Sonntag; lokale Zeit */
const at = (day: number, hour: number, min = 0) => new Date(2026, 10, day, hour, min).getTime();

describe('Tageszeit', () => {
  it('Grenzen der Tageszeiten', () => {
    const parts = Array.from({ length: 24 }, (_, h) => daypartOf(h));
    expect(parts.slice(0, 5)).toEqual(Array(5).fill('nacht'));
    expect(parts.slice(5, 11)).toEqual(Array(6).fill('morgen'));
    expect(parts.slice(11, 14)).toEqual(Array(3).fill('mittag'));
    expect(parts.slice(14, 18)).toEqual(Array(4).fill('nachmittag'));
    expect(parts.slice(18, 22)).toEqual(Array(4).fill('abend'));
    expect(parts.slice(22)).toEqual(['nacht', 'nacht']);
  });

  it('Wochentag in lokaler Zeit', () => {
    expect(timeOf(at(1, 12)).weekday).toBe('Sonntag');
    expect(timeOf(at(3, 12)).weekday).toBe('Dienstag');
    expect(timeOf(at(7, 12)).weekday).toBe('Samstag');
    expect(timeOf(at(1, 12)).sunday).toBe(true);
    expect(timeOf(at(2, 12)).sunday).toBe(false);
  });

  it('Bäckerei: Mo–Sa 6–18, So 7–11', () => {
    expect(timeOf(at(3, 5, 59)).shopOpen).toBe(false);
    expect(timeOf(at(3, 6)).shopOpen).toBe(true);
    expect(timeOf(at(3, 17, 59)).shopOpen).toBe(true);
    expect(timeOf(at(3, 18)).shopOpen).toBe(false);
    expect(timeOf(at(7, 10)).shopOpen).toBe(true);
    expect(timeOf(at(1, 6, 59)).shopOpen).toBe(false);
    expect(timeOf(at(1, 7)).shopOpen).toBe(true);
    expect(timeOf(at(1, 10, 59)).shopOpen).toBe(true);
    expect(timeOf(at(1, 11)).shopOpen).toBe(false);
  });

  it('Platzhalter', () => {
    expect(timeVars(timeOf(at(1, 19)))).toEqual({ wochentag: 'Sonntag', jetzt: 'Sonntagabend', gruss: 'Guten Abend' });
    expect(timeVars(timeOf(at(3, 8))).gruss).toBe('Guten Morgen');
    expect(timeVars(timeOf(at(3, 12))).gruss).toBe('Guten Tag');
    expect(timeVars(timeOf(at(3, 15))).jetzt).toBe('Dienstagnachmittag');
    expect(timeVars(NEUTRAL_TIME).jetzt).toBe('Dienstagmorgen');
  });

  it('{jetzt} zwischen 0 und 4 Uhr nennt den Vortag, {wochentag} bleibt der heutige', () => {
    // Dienstag (3.) 00:30 und 04:59 gehören noch zur Montagnacht; ab 05:00 gilt der Dienstag
    expect(timeVars(timeOf(at(3, 0, 30)))).toEqual({ wochentag: 'Dienstag', jetzt: 'Montagnacht', gruss: 'Guten Abend' });
    expect(timeVars(timeOf(at(3, 4, 59))).jetzt).toBe('Montagnacht');
    expect(timeVars(timeOf(at(3, 5))).jetzt).toBe('Dienstagmorgen');
    // 22–23 Uhr: derselbe Tag; Sonntag 1:00 zählt zum Samstag (Wochenwechsel)
    expect(timeVars(timeOf(at(3, 23))).jetzt).toBe('Dienstagnacht');
    expect(timeVars(timeOf(at(1, 1))).jetzt).toBe('Samstagnacht');
  });

  it('Bedingungen', () => {
    const sunEve = timeOf(at(1, 19));
    expect(matchesTime(undefined, sunEve)).toBe(true);
    expect(matchesTime({ daypart: ['abend', 'nacht'] }, sunEve)).toBe(true);
    expect(matchesTime({ daypart: ['morgen'] }, sunEve)).toBe(false);
    expect(matchesTime({ shopOpen: false }, sunEve)).toBe(true);
    expect(matchesTime({ shopOpen: true }, sunEve)).toBe(false);
    expect(matchesTime({ sunday: true, shopOpen: false }, sunEve)).toBe(true);
    expect(matchesTime({ sunday: false }, sunEve)).toBe(false);
  });
});
