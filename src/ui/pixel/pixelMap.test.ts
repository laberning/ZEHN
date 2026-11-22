import { describe, expect, it } from 'vitest';
import { PALETTE } from './palette.ts';
import { fromPalette, patch } from './pixelMap.ts';

describe('fromPalette', () => {
  it('übersetzt Zeichen über die Legende in Palettenfarben und fasst gleiche Zeichen einer Zeile zusammen; „.“ bleibt leer', () => {
    expect(fromPalette(['KKP.', '.PPK'], { K: 'outline', P: 'paper' })).toEqual([
      [0, 0, 2, 1, PALETTE.outline],
      [2, 0, 1, 1, PALETTE.paper],
      [1, 1, 2, 1, PALETTE.paper],
      [3, 1, 1, 1, PALETTE.outline],
    ]);
  });

  it('ein Zeichen ohne Farbe in der Legende ist ein Fehler', () => {
    expect(() => fromPalette(['KX'], { K: 'outline' })).toThrow(/„X“ in Zeile 0/);
  });

  it('ungleich lange Zeilen sind ein Fehler', () => {
    expect(() => fromPalette(['KK', 'K'], { K: 'outline' })).toThrow(/Zeile 1 hat 1 statt 2/);
  });

  it('„.“ gehört nicht in die Legende', () => {
    expect(() => fromPalette(['K.'], { K: 'outline', '.': 'paper' })).toThrow(/immer leer/);
  });
});

describe('patch (Stufe eines Stufenbilds)', () => {
  it('zeichnet das Rechteck an (x, y) über die Grundkarte; die Grundkarte bleibt unverändert davor', () => {
    const base = fromPalette(['KKK', 'KKK'], { K: 'outline' });
    const stage = patch(base, 1, 1, ['Y'], { Y: 'gold' });
    expect(stage.slice(0, base.length)).toEqual(base);
    expect(stage.slice(base.length)).toEqual([[1, 1, 1, 1, PALETTE.gold]]);
  });
});
