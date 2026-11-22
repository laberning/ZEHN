// Rundenhinweis: Anschläge → Hinweis → Krümels Satz.

import { describe, expect, it } from 'vitest';
import { keyRuleText, roundAdvice, slippedAdvice } from './format.ts';
import { SHIFT_LEFT, SHIFT_RIGHT, UMLAUTE_GROSS, handOf, homeKeyOf, mirrorFinger } from './keyboard.ts';
import type { ScoredKeystroke } from './keyStats.ts';
import { missKind } from './movement.ts';
import { roundReview } from './roundReview.ts';
import { roundLabel } from '../content/texts/mission.ts';
import { KRUEMEL_TIPS, ALL_KRUEMEL_TIPS, tipsFor } from '../content/texts/mission.ts';

const hit = (expected: string): ScoredKeystroke => ({ expected, correct: true, ms: 300 });
const miss = (expected: string): ScoredKeystroke => ({ expected, correct: false, ms: null });

describe('roundReview', () => {
  it('ohne oder mit einem einzelnen Fehler kein Hinweis', () => {
    expect(roundReview([])).toBeNull();
    expect(roundReview([hit('k'), hit('d')])).toBeNull();
    expect(roundReview([hit('k'), miss('k'), hit('d')])).toBeNull();
  });

  it('zwei Fehler auf K: die Taste; die meisten gewinnen, bei Gleichstand die zuerst danebengegangene', () => {
    expect(roundReview([miss('k'), hit('d'), miss('k')])).toEqual({ kind: 'key', unit: 'k', misses: 2 });
    expect(roundReview([miss('d'), miss('k'), miss('k'), miss('d')])).toEqual({ kind: 'key', unit: 'd', misses: 2 });
    expect(roundReview([miss('d'), miss('k'), miss('k'), miss('k')])).toEqual({ kind: 'key', unit: 'k', misses: 3 });
  });

  it('Großbuchstaben zählen für ihre Umschalttaste, die großen Umlaute zusammen', () => {
    expect(roundReview([miss('K'), miss('L')])).toEqual({ kind: 'key', unit: SHIFT_LEFT, misses: 2 });
    expect(roundReview([miss('A'), miss('S')])).toEqual({ kind: 'key', unit: SHIFT_RIGHT, misses: 2 });
    expect(roundReview([miss('Ä'), miss('Ü')])).toEqual({ kind: 'key', unit: UMLAUTE_GROSS, misses: 2 });
  });

  it('drei Fehler über beide Hände ohne dominierende Taste: Streuung; über eine Hand: nichts', () => {
    expect(roundReview([miss('a'), miss('k'), miss('e')])).toEqual({ kind: 'spread', misses: 3 });
    expect(roundReview([miss('a'), miss('s'), miss('d')])).toBeNull();
    expect(roundReview([miss('a'), miss('k')])).toBeNull();
    // Umschalt-Einheiten zählen zur haltenden Hand
    expect(roundReview([miss('A'), miss('s'), miss('d')])).toEqual({ kind: 'spread', misses: 3 });
  });
});

/** Fehlanschlag: erwartet `expected`, getippt `typed` */
const slip = (expected: string, typed: string, extra: Partial<ScoredKeystroke> = {}): ScoredKeystroke => ({ expected, correct: false, ms: 200, typed, ...extra });
/** Großbuchstabe mit gehaltener Umschalt-Hand (richtig getippt) */
const held = (expected: string, shift: 'left' | 'right'): ScoredKeystroke => ({ expected, correct: true, ms: 300, typed: expected, shift });

describe('mirrorFinger', () => {
  it('spiegelt jeden Finger auf die andere Hand, der Daumen nicht', () => {
    expect(mirrorFinger('lPinky')).toBe('rPinky');
    expect(mirrorFinger('rIndex')).toBe('lIndex');
    expect(mirrorFinger('lMiddle')).toBe('rMiddle');
    expect(mirrorFinger('thumb')).toBeNull();
  });
});

describe('missKind', () => {
  it('gleicher Finger, andere Reihe: zu hoch oder zu tief', () => {
    expect(missKind(slip('k', 'i'))).toBe('up');
    expect(missKind(slip('k', ','))).toBe('down');
    expect(missKind(slip('f', 't'))).toBe('up'); // Zeigefinger: zwei Tasten je Reihe, gleicher Finger
    expect(missKind(slip('f', '4'))).toBeNull(); // zwei Reihen: keine „eine Reihe zu hoch“
  });

  it('gespiegelter Finger, gleiche Reihe: andere Hand', () => {
    expect(missKind(slip('k', 'd'))).toBe('hand');
    expect(missKind(slip('f', 'j'))).toBe('hand');
  });

  it('vorgegriffen: getippt wurde das nächste Zeichen (vor den anderen Arten geprüft)', () => {
    expect(missKind(slip('e', 'i'), 'i')).toBe('ahead');
    expect(missKind(slip('k', 'i'), 'i')).toBe('ahead');
    expect(missKind(slip('e', 'i'), 'u')).toBe('hand'); // nicht vorgegriffen: e/i sind gespiegelte Finger
  });

  it('sonst keine Art: andere Hand und andere Reihe, Ziffer/Buchstabe, richtiger Anschlag, Zeichen fehlt', () => {
    expect(missKind(slip('k', 'e'))).toBeNull();
    expect(missKind(slip('a', '5'))).toBeNull();
    expect(missKind(slip('k', 'K'))).toBeNull();
    expect(missKind({ expected: 'k', correct: true, typed: 'k' })).toBeNull();
    expect(missKind({ expected: 'k', correct: false })).toBeNull();
    expect(missKind(slip('k', '€'))).toBeNull();
  });
});

describe('roundReview: Fehlerart und Umschalt-Hand', () => {
  it('Fehlerart ab zwei gleichen Fehlern der Taste, die meisten gewinnen', () => {
    expect(roundReview([slip('k', 'i'), hit('d'), slip('k', 'i')])).toEqual({ kind: 'key', unit: 'k', misses: 2, how: 'up' });
    expect(roundReview([slip('k', 'd'), slip('k', 'd'), slip('k', 'i')])).toEqual({ kind: 'key', unit: 'k', misses: 3, how: 'hand' });
    expect(roundReview([slip('k', ','), slip('k', ',')])).toMatchObject({ how: 'down' });
  });

  it('nur ein Fehler der Art: der heutige Satz ohne Art', () => {
    expect(roundReview([slip('k', 'i'), slip('k', 'd')])).toEqual({ kind: 'key', unit: 'k', misses: 2 });
    expect(roundReview([slip('k', 'i'), slip('k', 'e')])).toEqual({ kind: 'key', unit: 'k', misses: 2 });
  });

  it('vorgegriffen: das nächste erwartete Zeichen kommt mit', () => {
    expect(roundReview([slip('e', 'i'), hit('i'), slip('e', 'i'), hit('i')])).toEqual({ kind: 'key', unit: 'e', misses: 2, how: 'ahead', next: 'i' });
  });

  it('Umschalttasten und große Umlaute bekommen keine Art', () => {
    expect(roundReview([slip('K', 'k'), slip('L', 'l')])).toEqual({ kind: 'key', unit: SHIFT_LEFT, misses: 2 });
  });

  it('Umschalt-Hand: ab zwei Großbuchstaben mit der falschen Hand, auch wenn sie richtig waren; der häufigste', () => {
    expect(roundReview([held('T', 'left'), held('T', 'left'), held('K', 'left')])).toEqual({ kind: 'shift-hand', letter: 'T', misses: 2 });
    expect(roundReview([held('T', 'left'), held('K', 'right'), held('K', 'right')])).toEqual({ kind: 'shift-hand', letter: 'K', misses: 3 });
    // richtige Hand, ein einziger Ausrutscher, Hand unbekannt: nichts
    expect(roundReview([held('T', 'right'), held('K', 'left')])).toBeNull();
    expect(roundReview([held('T', 'left')])).toBeNull();
    expect(roundReview([{ expected: 'T', correct: true, ms: 1, typed: 'T' }, { expected: 'T', correct: true, ms: 1, typed: 'T' }])).toBeNull();
  });

  it('Vorrang: Umschalt-Hand vor Fehlerart vor Streuung', () => {
    const shifts = [held('T', 'left'), held('T', 'left')];
    expect(roundReview([slip('k', 'i'), slip('k', 'i'), ...shifts])).toMatchObject({ kind: 'shift-hand' });
    expect(roundReview([slip('k', 'i'), slip('k', 'i'), slip('a', 's')])).toMatchObject({ kind: 'key', how: 'up' });
  });
});

describe('roundAdvice', () => {
  it('Fehlerart und Umschalt-Hand', () => {
    expect(roundAdvice({ kind: 'key', unit: 'k', misses: 3, how: 'up' })).toBe('Die Taste K ging dreimal daneben, meist eine Reihe zu hoch: rechter Mittelfinger, bleib auf der Grundreihe.');
    expect(roundAdvice({ kind: 'key', unit: 'k', misses: 2, how: 'down' })).toBe('Die Taste K ging zweimal daneben, meist eine Reihe zu tief: rechter Mittelfinger, bleib auf der Grundreihe.');
    expect(roundAdvice({ kind: 'key', unit: 'k', misses: 2, how: 'hand' })).toBe('Die Taste K ging zweimal daneben, meist mit der anderen Hand: rechter Mittelfinger, bleib auf der Grundreihe.');
    expect(roundAdvice({ kind: 'key', unit: 'e', misses: 2, how: 'ahead', next: 'i' })).toBe(
      'Die Taste E ging zweimal daneben, meist vorgegriffen: erst das E, dann das I. Linker Mittelfinger, Griff nach oben und zurück auf D.',
    );
    expect(roundAdvice({ kind: 'key', unit: 'n', misses: 2, how: 'ahead', next: ' ' })).toBe(
      'Die Taste N ging zweimal daneben, meist vorgegriffen: erst das N, dann die Leertaste. Rechter Zeigefinger, Griff nach unten und zurück auf J.',
    );
    expect(roundAdvice({ kind: 'key', unit: 'k', misses: 2, how: 'ahead', next: ',' })).toMatch(/erst das K, dann die Taste Komma\./);
    expect(roundAdvice({ kind: 'shift-hand', letter: 'T', misses: 2 })).toBe('Das große T: die Umschalttaste hielt die falsche Hand. Rechter kleiner Finger hält, die linke Hand tippt.');
    expect(roundAdvice({ kind: 'shift-hand', letter: 'K', misses: 3 })).toBe('Das große K: die Umschalttaste hielt die falsche Hand. Linker kleiner Finger hält, die rechte Hand tippt.');
  });
});

describe('roundAdvice (heutige Sätze)', () => {
  it('die Leertaste heißt „Die Leertaste“, nicht „Die Taste Leertaste“', () => {
    expect(roundAdvice({ kind: 'key', unit: ' ', misses: 2 })).toBe('Die Leertaste ging zweimal daneben: Daumen, locker über der Leertaste bleiben.');
  });

  it('kein Hinweis ohne Befund', () => {
    expect(roundAdvice(null)).toBeNull();
  });

  it('Taste je Reihe, mit Zahlwort und Rückweg', () => {
    expect(roundAdvice({ kind: 'key', unit: '4', misses: 3 })).toBe('Die 4 ging dreimal daneben: linker Zeigefinger, hoch und zurück auf F.');
    expect(roundAdvice({ kind: 'key', unit: 'k', misses: 2 })).toBe('Die Taste K ging zweimal daneben: rechter Mittelfinger, bleib auf der Grundreihe.');
    expect(roundAdvice({ kind: 'key', unit: 'e', misses: 5 })).toBe('Die Taste E ging fünfmal daneben: linker Mittelfinger, Griff nach oben und zurück auf D.');
    expect(roundAdvice({ kind: 'key', unit: 'm', misses: 6 })).toBe('Die Taste M ging 6-mal daneben: rechter Zeigefinger, Griff nach unten und zurück auf J.');
    expect(roundAdvice({ kind: 'key', unit: ' ', misses: 2 })).toMatch(/Daumen/);
  });

  it('Umschalt, große Umlaute, Streuung', () => {
    expect(roundAdvice({ kind: 'key', unit: SHIFT_RIGHT, misses: 2 })).toBe('Umschalt rechts hielt nicht: rechter kleiner Finger hält, die linke Hand tippt.');
    expect(roundAdvice({ kind: 'key', unit: SHIFT_LEFT, misses: 2 })).toBe('Umschalt links hielt nicht: linker kleiner Finger hält, die rechte Hand tippt.');
    expect(roundAdvice({ kind: 'key', unit: UMLAUTE_GROSS, misses: 3 })).toBe('Die großen Umlaute gingen dreimal daneben: rechter kleiner Finger auf Ä Ö Ü, linke Hand hält.');
    expect(roundAdvice({ kind: 'spread', misses: 4 })).toBe('Viele kleine Ausrutscher: Finger zurück auf F und J, Hubbel fühlen, dann weiter.');
  });
});

describe('Finger-Helfer', () => {
  it('Grundstellungstasten und Hand', () => {
    expect(['lPinky', 'lRing', 'lMiddle', 'lIndex', 'rIndex', 'rMiddle', 'rRing', 'rPinky', 'thumb'].map((f) => homeKeyOf(f as 'lPinky'))).toEqual(['a', 's', 'd', 'f', 'j', 'k', 'l', 'ö', ' ']);
    expect(handOf('lRing')).toBe('left');
    expect(handOf('thumb')).toBe('both');
  });

  it('Finger-Regel der neuen Tasten', () => {
    expect(keyRuleText(['d', 'k'])).toBe('D – linker Mittelfinger · K – rechter Mittelfinger');
    expect(keyRuleText([])).toBe('');
  });
});

describe('Krümels Tipps nach Thema', () => {
  it('Liste nach den Lerneinheiten des Moduls', () => {
    expect(tipsFor(['f', 'j'])).toBe(KRUEMEL_TIPS.allgemein);
    expect(tipsFor(['f', SHIFT_RIGHT, '4'])).toBe(KRUEMEL_TIPS.shift);
    expect(tipsFor([UMLAUTE_GROSS])).toBe(KRUEMEL_TIPS.shift);
    expect(tipsFor(['f', '4'])).toBe(KRUEMEL_TIPS.digits);
    expect(tipsFor(['f', '@'])).toBe(KRUEMEL_TIPS.altgr);
    expect(ALL_KRUEMEL_TIPS.length).toBeGreaterThan(10);
  });
});

describe('Rundenüberschrift des Spezialtrainings', () => {
  it('nennt die Tasten; Extra-Fälle behalten ihre Überschrift', () => {
    const base = { kind: 'training' as const, seconds: 60 };
    expect(roundLabel({ ...base, focus: ['k', 'ö', 's'] }, 'x')).toBe('Spezialtraining: K Ö S');
    expect(roundLabel({ ...base, focus: ['k'], frame: 'Seifenblasen fangen' }, 'x')).toBe('Seifenblasen fangen');
    expect(roundLabel({ ...base, focus: [] }, 'x')).toBe('Spezialtraining');
  });
});

describe('slippedAdvice', () => {
  const tail = ' Nächste Runde langsam und genau, dann sitzt sie wieder.';
  const say = (key: string) => slippedAdvice({ before: { key } });

  it('Buchstabe mit Finger und Rückweg', () => {
    expect(say('k')).toBe(`Die Taste K ist abgerutscht: rechter Mittelfinger, bleib auf der Grundreihe.${tail}`);
    expect(say('e')).toBe(`Die Taste E ist abgerutscht: linker Mittelfinger, Griff nach oben und zurück auf D.${tail}`);
  });

  it('Ziffer', () => {
    expect(say('4')).toBe(`Die 4 ist abgerutscht: linker Zeigefinger, hoch und zurück auf F.${tail}`);
  });

  it('Umschalttaste und Große Umlaute mit eigenem Halbsatz', () => {
    expect(say(SHIFT_RIGHT)).toBe(`Umschalt rechts ist abgerutscht: rechter kleiner Finger hält, die linke Hand tippt.${tail}`);
    expect(say(UMLAUTE_GROSS)).toMatch(/^Die großen Umlaute sind abgerutscht: .* auf Ä Ö Ü, linke Hand hält\./);
  });
});

describe('roundReview: Muster', () => {
  // Fehlanschläge auf verschiedenen Tasten (kein Tastentreffer), je mit vorigem Zeichen und Zeit
  const m = (expected: string, prev: string | undefined, ms: number | null = null): ScoredKeystroke => ({ expected, correct: false, ms, prev });
  const ok = (expected: string, ms: number | null = 300): ScoredKeystroke => ({ expected, correct: true, ms });
  const WORDS = ['a', 'e', 'k'] as const; // linke und rechte Hand, je ein Fehler

  it('Wortanfang: genau drei, zwei nicht, Hälfte, kein prev am Rundenanfang', () => {
    expect(roundReview([m('a', ' '), m('e', ' '), m('k', ' ')])).toEqual({ kind: 'word-start', misses: 3 });
    expect(roundReview([m('a', ' '), m('e', ' ')])).toBeNull();
    // drei von sieben: weniger als die Hälfte
    expect(roundReview([m('a', ' '), m('e', ' '), m('k', ' '), m('d', 'x'), m('s', 'x'), m('f', 'x'), m('l', 'x')])).toEqual({ kind: 'spread', misses: 7 });
    // genau die Hälfte (3 von 6)
    expect(roundReview([m('a', ' '), m('e', ' '), m('k', ' '), m('d', 'x'), m('s', 'x'), m('f', 'x')])).toEqual({ kind: 'word-start', misses: 3 });
    // ohne prev (Rundenanfang) zählt nichts
    expect(roundReview(WORDS.map((c) => m(c, undefined)))).toEqual({ kind: 'spread', misses: 3 });
  });

  it('Hast: schneller als 60 % des Mittels richtiger Anschläge; ohne Zeit oder Mittel nichts', () => {
    const fast = [m('a', 'x', 100), m('e', 'x', 100), m('k', 'x', 100)];
    expect(roundReview([ok('d'), ok('s'), ...fast])).toEqual({ kind: 'haste', misses: 3 });
    expect(roundReview([ok('d'), ok('s'), m('a', 'x', 100), m('e', 'x', 100)])).toBeNull();
    // genau 60 % gilt nicht als hastig
    expect(roundReview([ok('d'), ok('s'), m('a', 'x', 180), m('e', 'x', 180), m('k', 'x', 180)])).toEqual({ kind: 'spread', misses: 3 });
    // keine Zeitmessung bei den Fehlern, Pause über 3 s
    expect(roundReview([ok('d'), ...WORDS.map((c) => m(c, 'x', null))])).toEqual({ kind: 'spread', misses: 3 });
    expect(roundReview([ok('d', 4000), ...fast])).toEqual({ kind: 'spread', misses: 3 });
    // kein richtiger Anschlag: kein Mittel
    expect(roundReview(fast)).toEqual({ kind: 'spread', misses: 3 });
  });

  it('derselbe Finger: prev auf anderer Taste mit demselben Finger', () => {
    // f/r/v/g/t/b: linker Zeigefinger; j/u/m: rechter
    expect(roundReview([m('f', 'r'), m('j', 'u'), m('t', 'g')])).toEqual({ kind: 'same-finger', misses: 3 });
    expect(roundReview([m('f', 'r'), m('j', 'u')])).toBeNull();
    // gleiches Zeichen zählt nicht, anderer Finger auch nicht
    expect(roundReview([m('f', 'f'), m('j', 'j'), m('a', 'k')])).toEqual({ kind: 'spread', misses: 3 });
    // Groß nach klein auf derselben Taste ist kein Fingerwechsel
    expect(roundReview([m('F', 'f'), m('J', 'j'), m('Ä', 'ä')])).toEqual({ kind: 'spread', misses: 3 });
  });

  it('Reihenfolge: Taste vor Muster, Muster vor Streuung, Wortanfang vor Hast vor Finger', () => {
    expect(roundReview([m('k', ' '), m('k', ' '), m('k', ' ')])).toEqual({ kind: 'key', unit: 'k', misses: 3 });
    expect(roundReview([m('a', ' ', 100), m('e', ' ', 100), m('k', ' ', 100), ok('d')])).toEqual({ kind: 'word-start', misses: 3 });
    expect(roundReview([ok('d'), ok('s'), m('f', 'r', 100), m('j', 'u', 100), m('t', 'g', 100)])).toEqual({ kind: 'haste', misses: 3 });
  });

  it('Sätze: Wortlaut, höchstens 100 Zeichen, nie „zu langsam“', () => {
    for (const kind of ['word-start', 'haste', 'same-finger'] as const) {
      const text = roundAdvice({ kind, misses: 3 })!;
      expect(text.length).toBeLessThanOrEqual(100);
      expect(text).not.toMatch(/zu langsam|langsamer als|schneller!/i);
    }
    expect(roundAdvice({ kind: 'word-start', misses: 3 })).toContain('Wortanfang');
    expect(roundAdvice({ kind: 'haste', misses: 3 })).toContain('einen Tick langsamer');
    expect(roundAdvice({ kind: 'same-finger', misses: 3 })).toContain('derselbe Finger');
  });
});
