// Fehlerart je Anschlag, Anteile im Tastenprofil und die häufigste Bewegung.

import { describe, expect, it } from 'vitest';
import { keyStat } from '../test/factories.ts';
import { SHIFT_LEFT, SHIFT_RIGHT } from './keyboard.ts';
import { ALPHA, applyKeystrokes, updateKeyStat, type ScoredKeystroke } from './keyStats.ts';
import { applyLatched } from './mastery.ts';
import { HOW_KINDS, dominantHow, missKind, strokeHow, type HowShares } from './movement.ts';

const slip = (expected: string, typed: string, extra: Partial<ScoredKeystroke> = {}): ScoredKeystroke => ({ expected, correct: false, ms: null, typed, ...extra });
const hit = (expected: string, extra: Partial<ScoredKeystroke> = {}): ScoredKeystroke => ({ expected, correct: true, ms: 300, typed: expected, ...extra });
const shares = (over: Partial<HowShares> = {}): HowShares => ({ up: 0, down: 0, hand: 0, ahead: 0, shift: 0, ...over });

describe('strokeHow', () => {
  it('Fehlerart über missKind, mit dem folgenden Zeichen für „vorgegriffen“', () => {
    expect(strokeHow([slip('k', 'i')], 0)).toBe('up');
    expect(strokeHow([slip('k', ',')], 0)).toBe('down');
    expect(strokeHow([slip('k', 'd')], 0)).toBe('hand');
    expect(strokeHow([slip('k', 'i'), hit('i')], 0)).toBe('ahead');
    expect(missKind(slip('k', 'i'), 'i')).toBe('ahead');
  });

  it('richtige Anschläge, unerkannte Fehler und fehlende Anschläge: keine Art', () => {
    expect(strokeHow([hit('k')], 0)).toBeNull();
    expect(strokeHow([slip('k', 'e')], 0)).toBeNull();
    expect(strokeHow([slip('k', 'i')], 3)).toBeNull();
  });

  it('Großbuchstaben: jeder mit bekannter Umschalt-Hand zählt (falsche Hand: shift, richtige: fine), auch bei falschem Anschlag; nie eine Fingerart', () => {
    expect(strokeHow([hit('K', { shift: 'right' })], 0)).toBe('shift'); // K verlangt links
    expect(strokeHow([hit('K', { shift: 'left' })], 0)).toBe('fine');
    expect(strokeHow([hit('K')], 0)).toBeNull(); // Hand unbekannt
    expect(strokeHow([slip('K', 'I', { shift: 'left' })], 0)).toBe('fine');
    expect(strokeHow([hit('Ä', { shift: 'right' })], 0)).toBe('shift'); // Ä verlangt die linke Umschalttaste
  });
});

describe('updateKeyStat mit Fehlerart', () => {
  it('der erste erkannte Fehler setzt die Anteile, danach echter Mittelwert', () => {
    const one = updateKeyStat(undefined, false, null, 'up');
    expect(one.how).toEqual(shares({ up: 1 }));
    expect(one.howSamples).toBe(1);
    const two = updateKeyStat(one, false, null, 'down');
    expect(two.how?.up).toBeCloseTo(0.5);
    expect(two.how?.down).toBeCloseTo(0.5);
    const three = updateKeyStat(two, false, null, 'up');
    expect(three.how?.up).toBeCloseTo(2 / 3);
    expect(three.howSamples).toBe(3);
  });

  it('nach dem Mittelwert gleitend mit ALPHA; die Anteile bleiben eine Verteilung', () => {
    let s = updateKeyStat(undefined, false, null, 'up');
    for (let i = 0; i < 40; i++) s = updateKeyStat(s, false, null, 'up');
    const before = s.how!.up;
    s = updateKeyStat(s, false, null, 'hand');
    expect(s.how!.hand).toBeCloseTo(ALPHA);
    expect(s.how!.up).toBeCloseTo(before * (1 - ALPHA));
    expect(HOW_KINDS.reduce((sum, k) => sum + s.how![k], 0)).toBeCloseTo(1);
  });

  it('richtige Anschläge und Fehler ohne Art lassen die Anteile unverändert', () => {
    const base = updateKeyStat(undefined, false, null, 'up');
    const after = updateKeyStat(updateKeyStat(base, true, 400), false, null, null);
    expect(after.how).toEqual(base.how);
    expect(after.howSamples).toBe(1);
    expect(after.samples).toBe(3);
    // ohne je eine Art bleibt das Feld ganz weg
    expect(updateKeyStat(undefined, false, null)).not.toHaveProperty('how');
  });

  it('applyKeystrokes zählt die Art an der Lerneinheit (Umschalttaste statt Großbuchstabe)', () => {
    const stats = applyKeystrokes({}, [slip('k', 'i'), slip('k', 'i'), hit('K', { shift: 'right' }), hit('K', { shift: 'left' })]);
    expect(stats.k?.how?.up).toBe(1);
    expect(stats.k?.howSamples).toBe(2);
    expect(stats[SHIFT_LEFT]?.howSamples).toBe(2); // beide Großbuchstaben mit bekannter Hand
    expect(stats[SHIFT_LEFT]?.how?.shift).toBe(0.5);
    expect(stats[SHIFT_LEFT]?.samples).toBe(2);
  });

  it('applyLatched (Einsatz) zählt dieselben Arten mit', () => {
    const { stats } = applyLatched({}, {}, [slip('k', 'i'), hit('K', { shift: 'right' })], () => undefined);
    expect(stats.k?.how?.up).toBe(1);
    expect(stats[SHIFT_LEFT]?.how?.shift).toBe(1);
    expect(stats[SHIFT_RIGHT]).toBeUndefined();
  });
});

describe('dominantHow', () => {
  const stat = (how: HowShares, howSamples: number) => keyStat({ how, howSamples });

  it('ab vier erkannten Fehlern und mindestens der Hälfte derselben Art', () => {
    expect(dominantHow(stat(shares({ up: 0.75, down: 0.25 }), 4))).toBe('up');
    expect(dominantHow(stat(shares({ up: 0.5, down: 0.25, hand: 0.25 }), 8))).toBe('up');
    expect(dominantHow(stat(shares({ up: 0.4, down: 0.3, hand: 0.3 }), 10))).toBeNull();
  });

  it('unter vier Fehlern, ohne Anteile und ohne Profil: nichts', () => {
    expect(dominantHow(stat(shares({ up: 1 }), 3))).toBeNull();
    expect(dominantHow(keyStat())).toBeNull();
    expect(dominantHow(undefined)).toBeNull();
  });

  it('Gleichstand zweier Arten ist kein klares Muster', () => {
    expect(dominantHow(stat(shares({ up: 0.5, down: 0.5 }), 6))).toBeNull();
  });

  it('aus echten Anschlägen: vier Griffe zu hoch, ein Griff zur anderen Hand', () => {
    const s = applyKeystrokes({}, [...Array(4).fill(slip('k', 'i')), slip('k', 'd')]);
    expect(dominantHow(s.k)).toBe('up');
    expect(dominantHow(applyKeystrokes({}, [slip('k', 'i'), slip('k', 'i'), slip('k', 'i')]).k)).toBeNull();
  });
});

describe('Umschalt-Muster verblasst', () => {
  const capitals = (n: number, shift: 'left' | 'right'): ScoredKeystroke[] => Array.from({ length: n }, () => hit('K', { shift }));

  it('ohne bekannte Hand zählt nichts; ein Satz, der erschien, verschwindet nach genug richtigen Großbuchstaben wieder', () => {
    expect(applyKeystrokes({}, Array.from({ length: 5 }, () => hit('K')))[SHIFT_LEFT]?.howSamples).toBeUndefined();
    let stats = applyKeystrokes({}, capitals(5, 'right')); // K verlangt die linke Hand
    expect(dominantHow(stats[SHIFT_LEFT])).toBe('shift');
    stats = applyKeystrokes(stats, capitals(5, 'left'));
    expect(dominantHow(stats[SHIFT_LEFT])).toBe('shift'); // 5 von 10: noch die Hälfte
    stats = applyKeystrokes(stats, capitals(5, 'left'));
    expect(dominantHow(stats[SHIFT_LEFT])).toBeNull(); // 5 von 15: verblasst
    expect(stats[SHIFT_LEFT]?.howSamples).toBe(15);
  });
});
