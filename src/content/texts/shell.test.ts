import { describe, expect, it } from 'vitest';
import { START_TEXTS, brokenProfilesText } from './shell.ts';

/** Namen, die vor Akt 1 geheim bleiben (der Dieb ist nur „B. v. B.“), und Druck-Wörter (Story-Regel 11) */
const SPOILERS = /otti|korrekt|benno|tippi|baron|backspace|juna|hubbel/iu;
const PRESSURE = /\b(bald|jeden tag|täglich\p{L}*|schnell\p{L}*|beeil\p{L}*|sofort|musst|müsst|pflicht\p{L}*)(?!\p{L})/iu;

describe('Oberflächentexte: Start und Schale', () => {
  it('kaputte Akten: eine oder mehrere', () => {
    expect(brokenProfilesText(1)).toBe('Eine gespeicherte Akte ließ sich nicht lesen und wird nicht angezeigt.');
    expect(brokenProfilesText(2)).toBe('2 gespeicherte Akten ließen sich nicht lesen und werden nicht angezeigt.');
  });

  it('Startseite: Längen (Überschrift ≤ 60, Krümel ≤ 80, Absatz ≤ 300 Zeichen und höchstens drei Sätze, Chips drei Stück mit höchstens vier Wörtern wie „alle Tasten, zehn Finger“)', () => {
    expect([...START_TEXTS.headline].length).toBeLessThanOrEqual(60);
    expect([...START_TEXTS.kruemel].length).toBeLessThanOrEqual(80);
    expect([...START_TEXTS.pitch].length).toBeLessThanOrEqual(300);
    expect(START_TEXTS.pitch.split(/[.!?](?:\s|$)/u).filter(Boolean).length).toBeLessThanOrEqual(3);
    expect(START_TEXTS.chips).toHaveLength(3);
    for (const c of START_TEXTS.chips) expect(c.split(/[\s,]+/u).filter(Boolean).length, c).toBeLessThanOrEqual(4);
  });

  it('Startseite: keine Spoiler-Namen, keine Druck-Wörter, Chips ohne Zeitangabe, Zettel nur „B. v. B.“', () => {
    const all = [START_TEXTS.headline, START_TEXTS.kruemel, START_TEXTS.pitch, ...START_TEXTS.chips];
    for (const t of all) {
      expect(t, t).not.toMatch(SPOILERS);
      expect(t, t).not.toMatch(PRESSURE);
    }
    for (const c of START_TEXTS.chips) expect(c, c).not.toMatch(/minute|stunde|tag\b|woche/iu);
    expect(START_TEXTS.note).toBe('B. v. B.');
  });
});
