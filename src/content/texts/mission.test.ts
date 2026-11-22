import { describe, expect, it } from 'vitest';
import { blindNote } from './mission.ts';

describe('Oberflächentexte: Mission', () => {
  it('Krümels Blindflug-Satz: höchstens 100 Zeichen, keine Zahl, kein Vergleich (Regel 11); die Brille ändert nur die Worte', () => {
    for (const hasBrille of [false, true]) {
      const t = blindNote(hasBrille);
      expect(t.length).toBeLessThanOrEqual(100);
      expect(t).not.toMatch(/\d|besser|schneller|andere|Rekord|Rang/i);
    }
    expect(blindNote(true)).toMatch(/Brille/);
    expect(blindNote(false)).not.toMatch(/Brille/);
  });
});
