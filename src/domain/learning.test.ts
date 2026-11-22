// Tastatur, Tastenprofil, Mastery und Textgenerator.

import { describe, expect, it } from 'vitest';
import { COURSE } from '../content/course.ts';
import { TEST_MASTERY as M, strokes } from '../test/factories.ts';
import { allWords, keysUpTo } from './course.ts';
import { SHIFT_LEFT, SHIFT_RIGHT, UMLAUTE_GROSS, charsOf, isShiftKey, isTypeable, keystrokeFor, learnKey, learnKeys } from './keyboard.ts';
import { describeKey, keyName } from './format.ts';
import { applyKeystrokes, updateKeyStat, type KeyStats } from './keyStats.ts';
import { blockingLatch, isMastered, masteryScore, sealOf, sealScore, weakness } from './mastery.ts';
import { createRng, nextRandom, pickWeighted, rngStream } from './rng.ts';
import { charWeights, generateText, lengthForDuration, usableWords } from './textGenerator.ts';

describe('Tastatur (QWERTZ)', () => {
  it('ordnet Finger und Shift-Seite richtig zu', () => {
    expect(keystrokeFor('f')?.key.finger).toBe('lIndex');
    expect(keystrokeFor('j')?.key.bump).toBe(true);
    expect(keystrokeFor('ö')?.key.finger).toBe('rPinky');
    expect(keystrokeFor('z')?.key.code).toBe('KeyY');
    expect(keystrokeFor('A')?.shift).toBe('right');
    expect(keystrokeFor('L')?.shift).toBe('left');
    expect(keystrokeFor('@')?.altGr).toBe(true);
    expect(keystrokeFor(' ')?.key.finger).toBe('thumb');
  });

  it('Tottasten sind nicht direkt tippbar', () => {
    expect(isTypeable('^')).toBe(false);
    expect(isTypeable('´')).toBe(false);
  });
});

describe('Lerneinheiten', () => {
  it('ein Großbuchstabe A–Z gehört zur Umschalttaste der Gegenhand, jedes andere Zeichen zu sich selbst', () => {
    expect(['Q', 'T', 'A', 'G', 'Y', 'B'].map(learnKey)).toEqual(Array(6).fill(SHIFT_RIGHT));
    expect(['Z', 'U', 'J', 'M', 'P', 'H'].map(learnKey)).toEqual(Array(6).fill(SHIFT_LEFT));
    expect(['a', 'ß', 'ä', 'ö', 'ü', '.', ' '].map(learnKey)).toEqual(['a', 'ß', 'ä', 'ö', 'ü', '.', ' ']);
    // Ä Ö Ü sind zusammen eine Lerneinheit (ein gemeinsames Siegel), keiner Umschalttaste zugeordnet
    expect(['Ä', 'Ö', 'Ü'].map(learnKey)).toEqual(Array(3).fill(UMLAUTE_GROSS));
    expect(learnKey(UMLAUTE_GROSS)).toBe(UMLAUTE_GROSS);
    expect(isShiftKey(UMLAUTE_GROSS)).toBe(false);
    expect(learnKey(SHIFT_LEFT)).toBe(SHIFT_LEFT); // eine Lerneinheit bleibt, was sie ist
    expect(isShiftKey(SHIFT_LEFT) && isShiftKey(SHIFT_RIGHT) && !isShiftKey('A')).toBe(true);
  });

  it('learnKeys: eindeutig, Reihenfolge bleibt; 15 Großbuchstaben einer Hand sind eine Lerneinheit', () => {
    expect(learnKeys([...'QWERTASDFGYXCVB'])).toEqual([SHIFT_RIGHT]);
    expect(learnKeys(['a', 'Q', 'b', 'W', 'Z', 'Ä'])).toEqual(['a', SHIFT_RIGHT, 'b', SHIFT_LEFT, UMLAUTE_GROSS]);
    expect(learnKeys([...'ÄÖÜ'])).toEqual([UMLAUTE_GROSS]);
    expect(learnKeys(learnKeys(['a', 'Q']))).toEqual(['a', SHIFT_RIGHT]);
  });

  it('charsOf: die Zeichen einer Lerneinheit unter den gegebenen', () => {
    expect(charsOf(SHIFT_LEFT, [...'aQZJb'])).toEqual(['Z', 'J']);
    expect(charsOf('a', [...'aQ'])).toEqual(['a']);
    expect(charsOf(UMLAUTE_GROSS, [...'aÄQÖÜ'])).toEqual(['Ä', 'Ö', 'Ü']);
  });

  it('Anschläge auf Großbuchstaben zählen für das Profil ihrer Umschalttaste', () => {
    const st = applyKeystrokes({}, [...strokes('Q', 3), ...strokes('T', 2, { correct: false }), ...strokes('Z', 1), ...strokes('Ä', 1), ...strokes('Ü', 2)]);
    expect(Object.keys(st).sort()).toEqual([SHIFT_LEFT, SHIFT_RIGHT, UMLAUTE_GROSS]);
    expect(st[UMLAUTE_GROSS]).toMatchObject({ samples: 3 });
    expect(st[SHIFT_RIGHT]).toMatchObject({ samples: 5 });
    expect(st[SHIFT_LEFT]).toMatchObject({ samples: 1 });
  });

  it('Namen: „Umschalt rechts“ / „Umschalt links“; die Beschreibung nennt den kleinen Finger', () => {
    expect(keyName(SHIFT_RIGHT)).toBe('Umschalt rechts');
    expect(keyName(SHIFT_LEFT)).toBe('Umschalt links');
    expect(describeKey(SHIFT_RIGHT)).toBe('Umschalt rechts – rechter kleiner Finger hält, die andere Hand tippt');
    expect(describeKey(SHIFT_LEFT)).toBe('Umschalt links – linker kleiner Finger hält, die andere Hand tippt');
    expect(keyName(UMLAUTE_GROSS)).toBe('Große Umlaute');
    expect(describeKey(UMLAUTE_GROSS)).toBe('Große Umlaute – rechter kleiner Finger + linke Shift-Taste');
    expect(describeKey('J')).toBe('J – rechter Zeigefinger + linke Shift-Taste');
  });
});

describe('Tastenprofil und Mastery', () => {
  it('misst Trefferquote und Tempo', () => {
    let s = updateKeyStat(undefined, true, 500);
    s = updateKeyStat(s, false, null);
    expect(s.samples).toBe(2);
    expect(s.accuracy).toBeCloseTo(0.5);
    expect(s.avgMs).toBe(500);
  });

  it('Fehlzeiten ändern das Tempo nicht', () => {
    const base = applyKeystrokes({}, [{ expected: 'f', correct: true, ms: 500 }]);
    const after = applyKeystrokes(base, [{ expected: 'f', correct: false, ms: 120, typed: 'd' }]);
    expect(after.f!.avgMs).toBe(500);
    expect(after.f!.timedSamples).toBe(1);
  });

  it('ignoriert lange Pausen beim Tempo', () => {
    expect(updateKeyStat(updateKeyStat(undefined, true, 400), true, 10000).avgMs).toBe(400);
  });

  it('erkennt eine sichere Taste', () => {
    const stats: KeyStats = applyKeystrokes({}, strokes('f', 50, { ms: 600 }));
    expect(isMastered(stats.f, M)).toBe(true);
    expect(masteryScore(stats.f, M)).toBe(1);
    expect(isMastered(stats.j, M)).toBe(false);
    expect(masteryScore(undefined, M)).toBe(0);
  });

  it('bewertet fehlerhafte und langsame Tasten als schwach', () => {
    expect(weakness(applyKeystrokes({}, strokes('k', 40, { correct: (i) => i % 3 !== 0 })).k, M)).toBeGreaterThan(0.5);
    expect(weakness(applyKeystrokes({}, strokes('k', 40, { ms: 2500 })).k, M)).toBeGreaterThan(0.5);
    expect(weakness(applyKeystrokes({}, strokes('k', 5, { correct: false })).k, M)).toBe(0); // zu wenig Daten
  });

  it('erklärt, was einer Taste noch fehlt', () => {
    const c = { minSamples: 20, minAccuracy: 0.9, maxAvgMs: 1000 };
    expect(blockingLatch(sealOf('f', undefined, c))).toBe('training');
    const slow = sealOf('f', applyKeystrokes({}, strokes('f', 30, { ms: 2000 })).f, c);
    expect(blockingLatch(slow)).toBe('tempo');
    expect(slow.training.value).toBe(1);
    const sloppy = sealOf('f', applyKeystrokes({}, strokes('f', 30, { correct: (i) => i % 2 === 0 })).f, c);
    expect(blockingLatch(sloppy)).toBe('precision');
    const good = sealOf('f', applyKeystrokes({}, strokes('f', 30)).f, c);
    expect(good.secured).toBe(true);
    expect(blockingLatch(good)).toBeNull();
  });

  it('der Gesamtwert ist das Produkt der Riegelwerte', () => {
    const c = { minSamples: 20, minAccuracy: 0.9, maxAvgMs: 1000 };
    const samples = [undefined, ...[strokes('f', 5), strokes('f', 30, { ms: 2000 }), strokes('f', 30, { correct: (i) => i % 2 === 0, ms: 1300 }), strokes('f', 30)].map((k) => applyKeystrokes({}, k).f)];
    for (const st of samples) expect(sealScore(sealOf('f', st, c))).toBeCloseTo(masteryScore(st, c), 12);
  });
});

describe('Zufall', () => {
  it('ist reproduzierbar und als Zustand speicherbar', () => {
    const a = createRng(5);
    const b = createRng(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    const s = rngStream(5);
    s.next();
    expect(s.state()).toBe(nextRandom(5).state);
    expect(pickWeighted(['x', 'y'], [0, 1], createRng(1))).toBe('y');
    expect(() => pickWeighted([], [], createRng(1))).toThrow();
  });
});

describe('Textgenerator', () => {
  const allowed = ['f', 'j'];

  it('nutzt nur erlaubte Zeichen, ohne doppelte oder Rand-Leerzeichen', () => {
    const text = generateText({ allowed, length: 60, rng: createRng(1) });
    expect(text.length).toBeGreaterThanOrEqual(60);
    expect(text).toMatch(/^[fj]+( [fj]+)*$/);
  });

  it('ist mit gleichem Seed reproduzierbar', () => {
    expect(generateText({ allowed, length: 50, rng: createRng(42) })).toBe(generateText({ allowed, length: 50, rng: createRng(42) }));
  });

  it('verwendet Wörter, sobald genug Buchstaben gelernt sind', () => {
    const keys = keysUpTo(COURSE, 'm1-l6');
    const words = allWords(COURSE);
    expect(usableWords(words, keys).length).toBeGreaterThanOrEqual(8);
    const text = generateText({ allowed: keys, words, length: 300, rng: createRng(7) });
    expect(text.split(' ').filter((u) => words.includes(u)).length).toBeGreaterThan(5);
  });

  it('allWords: alle Wörter des Kurses; gewählt werden nur Wörter aus gelernten Tasten', () => {
    expect(allWords(COURSE)).toEqual(COURSE.modules.flatMap((m) => m.words));
    const text = generateText({ allowed: ['a', 's', 'd', 'f', 'j', 'k', 'l', 'e'], words: ['das', 'ade', 'üben', 'sack', 'dass', 'fad', 'lass', 'klasse', 'fass'], length: 200, rng: createRng(3) });
    expect(text).not.toContain('ü');
    expect(text).not.toContain('n');
  });

  describe('Nachsteuerung der Fokus-Tasten', () => {
    const allowed = [...'asdfgjkl' + 'ö'];
    const words = ['da', 'ja', 'ah', 'als', 'das', 'lass', 'fass', 'fall', 'hals', 'glas', 'gas', 'sag', 'las', 'kalk'];
    const mean = (n: number, f: (seed: number) => number): number => Array.from({ length: n }, (_, i) => f(i + 1)).reduce((a, b) => a + b, 0) / n;
    const count = (text: string, c: string): number => [...text].filter((x) => x === c).length;

    it('ohne Fokus unverändert (fester Seed, feste Wortliste)', () => {
      const text = generateText({ allowed: [...'asdfgjkl'], words, length: 60, rng: createRng(5) });
      expect(text).toBe('sag glas lskj da das kjd sag das fass akd kalk lass las gkjsj');
    });

    it('Fokus-Taste ohne passende Wörter erreicht im Mittel mindestens 80 % ihres Gewichts', () => {
      const focus = ['ö'];
      const share = charWeights({ allowed, focus }).get('ö') ?? 0;
      const fraction = mean(300, (seed) => {
        const t = generateText({ allowed, focus, words, length: 60, rng: createRng(seed) });
        return count(t, 'ö') / t.replaceAll(' ', '').length;
      });
      expect(fraction).toBeGreaterThanOrEqual(0.8 * share);
    });

    it('kein Wort doppelt hintereinander, auch wenn nur ein Wort die Taste enthält', () => {
      for (let seed = 1; seed <= 100; seed++) {
        const t = generateText({ allowed, focus: ['ö'], words: [...words, 'öl'], length: 120, rng: createRng(seed) });
        const units = t.split(' ');
        for (let i = 1; i < units.length; i++) if (words.includes(units[i] as string) || units[i] === 'öl') expect(units[i]).not.toBe(units[i - 1]);
      }
    });

    it('Übungsgruppen bestehen nicht nur aus der Fokus-Taste', () => {
      const t = generateText({ allowed, focus: ['ö'], length: 400, rng: createRng(9) });
      const groups = t.split(' ');
      expect(groups.some((g) => g.includes('ö'))).toBe(true);
      expect(groups.filter((g) => new Set(g).size === 1).length / groups.length).toBeLessThan(0.2);
      expect(new Set(t.replaceAll(' ', '')).size).toBeGreaterThan(5);
    });

    it('gleicher Seed, gleicher Text', () => {
      const make = () => generateText({ allowed, focus: ['ö', 'a'], words, length: 100, rng: createRng(11) });
      expect(make()).toBe(make());
    });
  });

  it('eine Taste mit offenem Riegel, aber 86 % Trefferquote gilt weiter als schwach', () => {
    const c = { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 };
    const st = { samples: 40, accuracy: 0.86, avgMs: 500, timedSamples: 40 };
    const opened = ['training', 'precision', 'tempo'] as const;
    expect(sealOf('k', st, c, opened).secured).toBe(true);
    expect(weakness(st, c)).toBeGreaterThan(0);
    expect(masteryScore(st, c)).toBeLessThan(1);
    const weak = charWeights({ allowed: ['k', 'j'], weak: { stats: { k: st }, criteria: c, maxShare: 0.3 } });
    expect(weak.get('k')!).toBeGreaterThan(charWeights({ allowed: ['k', 'j'] }).get('k')!);
  });

  it('übt schwache Tasten öfter, aber höchstens mit dem gedeckelten Anteil', () => {
    const keys = keysUpTo(COURSE, 'm1-l4');
    const weakStats = applyKeystrokes({}, strokes('k', 40, { correct: (i) => i % 2 === 0, ms: 900 }));
    const k0 = charWeights({ allowed: keys }).get('k') ?? 0;
    const weighted = charWeights({ allowed: keys, weak: { stats: weakStats, criteria: M, maxShare: 0.3 } });
    const k1 = weighted.get('k') ?? 0;
    expect(k1).toBeGreaterThan(k0);
    expect(k1).toBeLessThanOrEqual(0.7 * k0 + 0.3 + 1e-9);
    expect([...weighted.values()].reduce((s, w) => s + w, 0)).toBeCloseTo(1);
  });

  it('passt die Länge an das Tempo an', () => {
    const limits = { minTextLength: 40, maxTextLength: 400 };
    expect(lengthForDuration(40, 90, limits)).toBe(60);
    expect(lengthForDuration(120, 90, limits)).toBe(180);
    expect(lengthForDuration(1000, 90, limits)).toBe(400);
    expect(lengthForDuration(null, 60, limits)).toBe(40);
    expect(lengthForDuration(null, 10, limits)).toBe(40);
  });
});
