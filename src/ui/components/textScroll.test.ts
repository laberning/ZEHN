import { describe, expect, it } from 'vitest';
import { cutBelow, lineTopOf, nextScrollTop } from './textScroll.ts';

const LH = 30;
/** 6 Zeilen Text, Feld für 3,5 Zeilen */
const base = { lineHeight: LH, viewHeight: 105, contentHeight: 180 };
const at = (line: number, scrollTop: number) => nextScrollTop({ ...base, cursorTop: line * LH, scrollTop });

describe('nextScrollTop (Roll-Regel)', () => {
  it('Marke und nächste Zeile passen: nichts bewegt sich', () => {
    expect(at(0, 0)).toBe(0);
    expect(at(1, 0)).toBe(0); // Zeilen 1 und 2 sind ganz sichtbar (bis 90 von 105)
  });

  it('keine Zeile mehr darunter Platz: die Zeile der Marke wird die erste sichtbare, zeilenweise', () => {
    expect(at(2, 0)).toBe(2 * LH); // Zeile 3 (bis 120) passt nicht mehr in 105
    expect(at(3, 2 * LH)).toBe(2 * LH); // Marke in Zeile 3, sichtbar ab Zeile 2: beide Zeilen passen (60 + 105 = 165 ≥ 150)
    expect(at(4, 2 * LH)).toBe(4 * LH);
  });

  it('innerhalb einer Zeile ruckelt nichts: dieselbe Zeile ergibt dieselbe Rollhöhe', () => {
    const first = at(2, 0);
    expect(at(2, first)).toBe(first);
  });

  it('die letzte Zeile braucht keine Zeile darunter', () => {
    // Zeile 5 (die letzte) bei Rollhöhe 3·LH: sichtbar 90 bis 195, Ende des Texts bei 180 – es bleibt
    expect(at(5, 3 * LH)).toBe(3 * LH);
    // sonst würde man auf 5·LH rollen und unten leeren Raum zeigen
  });

  it('liegt die Marke oberhalb (Fenster wurde größer, neue Runde): der Text rückt zurück', () => {
    expect(at(0, 3 * LH)).toBe(0);
    expect(at(1, 4 * LH)).toBe(LH);
  });

  it('passt nur eine Zeile, bleibt die Marke sichtbar', () => {
    const one = { lineHeight: LH, viewHeight: 40, contentHeight: 180 };
    expect(nextScrollTop({ ...one, cursorTop: 0, scrollTop: 0 })).toBe(0);
    expect(nextScrollTop({ ...one, cursorTop: LH, scrollTop: 0 })).toBe(LH); // Zeile 1 passt nur bis 60 > 40
    expect(nextScrollTop({ ...one, cursorTop: LH, scrollTop: LH })).toBe(LH);
  });

  it('ein neuer Text beginnt bei 0 (Marke in Zeile 0)', () => {
    expect(nextScrollTop({ ...base, cursorTop: 0, scrollTop: 4 * LH })).toBe(0);
  });

  it('Rundung bis 1 px stört nicht', () => {
    expect(nextScrollTop({ ...base, cursorTop: LH, scrollTop: 0.4 })).toBe(0.4);
    expect(nextScrollTop({ ...base, cursorTop: 0, scrollTop: 0.8 })).toBe(0.8);
  });
});

describe('lineTopOf', () => {
  it('liefert die Oberkante der Zeile, in der die Mitte eines Zeichens liegt', () => {
    expect(lineTopOf(0, LH)).toBe(0);
    expect(lineTopOf(14, LH)).toBe(0);
    expect(lineTopOf(44, LH)).toBe(LH);
    expect(lineTopOf(2 * LH + 15, LH)).toBe(2 * LH);
  });
});

describe('cutBelow', () => {
  it('unten angeschnittene Zeile mit Text darunter: ausblenden', () => {
    expect(cutBelow(0, 105, LH, 180)).toBe(true); // 3,5 Zeilen
    expect(cutBelow(2 * LH, 105, LH, 180)).toBe(true);
  });
  it('ganze Zeilen unten: nichts ausblenden', () => {
    expect(cutBelow(0, 90, LH, 180)).toBe(false);
  });
  it('Ende des Texts im Feld: nichts ausblenden', () => {
    expect(cutBelow(3 * LH, 105, LH, 180)).toBe(false);
  });
});
