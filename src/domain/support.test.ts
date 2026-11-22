// Formatierung, Garderobe-Regeln, Merker.

import { describe, expect, it } from 'vitest';
import { profile } from '../test/factories.ts';
import { keyLabel, describeKey, formatDate, formatResult, formatSeconds, keyList, kruemelTip, keyName, lessonAdvice, lessonRuleText, percent, sealAdvice } from './format.ts';
import type { LatchName, Seal } from './mastery.ts';
import { hasSeen, markSeen, seenKey } from './seen.ts';
import { isUnlocked, type WardrobeItem } from './wardrobe.ts';

/** Siegel, das an `blocking` hängt (null = gesichert); `value` ist der Wert dieses Riegels */
const seal = (key: string, blocking: LatchName | null, value = 0.5): Seal => {
  const latch = (name: LatchName) => (name === blocking ? { value, open: false } : { value: 1, open: true });
  return { key, training: latch('training'), precision: latch('precision'), tempo: latch('tempo'), measuring: false, secured: blocking === null, samples: 40, accuracy: 0.95, avgMs: 800, hitsToOpen: null, goal: { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1000 } };
};

describe('Formatierung', () => {
  it('Prozent, Ergebnis, Tastennamen', () => {
    expect(percent(0.934)).toBe('93 %');
    expect(formatResult({ accuracy: 0.93, apm: 41.4 })).toBe('93 % genau · 41 Anschläge pro Minute');
    expect(keyName('ö')).toBe('Ö');
    expect(keyName(' ')).toBe('Leertaste');
    expect(keyName(',')).toBe('Komma');
    expect(keyName('4')).toBe('4');
    expect(keyLabel('4')).toBe('4');
    expect(keyList(['f', 'j'])).toBe('F J');
  });

  it('Namen der neun Satzzeichen in Sätzen, in Listen und Chips das Zeichen selbst', () => {
    const names = { ',': 'Komma', '.': 'Punkt', '-': 'Bindestrich', '?': 'Fragezeichen', '!': 'Ausrufezeichen', ':': 'Doppelpunkt', ';': 'Semikolon', '"': 'Anführungszeichen', "'": 'Apostroph' };
    for (const [c, name] of Object.entries(names)) {
      expect(keyName(c)).toBe(name);
      expect(keyLabel(c)).toBe(c);
    }
    expect(keyLabel('ö')).toBe('Ö');
    expect(keyLabel(' ')).toBe('Leertaste');
    expect(keyList(['?', '!', 'k'])).toBe('? ! K');
    expect(lessonAdvice({ keys: [seal('?', 'training', 0.4)], exercises: 0, minExercises: 2, mastered: false })).toMatch(/^Fragezeichen \(rechter kleiner Finger \+ linke Shift-Taste\) braucht/);
    expect(sealAdvice([seal('!', null), seal(';', 'precision', 0.2)])).toMatch(/^Ausrufezeichen sitzt! Semikolon /);
  });

  it('Namen der neun Sonderzeichen in Sätzen (am Satzanfang groß), in Listen und Chips das Zeichen selbst', () => {
    const names = { '@': 'At-Zeichen', '€': 'Euro-Zeichen', '{': 'Geschweifte Klammer auf', '}': 'Geschweifte Klammer zu', '[': 'Eckige Klammer auf', ']': 'Eckige Klammer zu', '\\': 'Backslash', '~': 'Tilde', '|': 'Senkrechter Strich' };
    for (const [c, name] of Object.entries(names)) {
      expect(keyName(c)).toBe(name);
      expect(keyLabel(c)).toBe(c);
    }
    expect(keyList(['@', '€'])).toBe('@ €');
    expect(sealAdvice([seal('@', null), seal('€', 'precision', 0.2)])).toMatch(/^At-Zeichen sitzt! Euro-Zeichen /);
    expect(describeKey('@')).toBe('@ – linker kleiner Finger + Alt Gr');
  });

  it('Krümels Tipps kommen der Reihe nach dran, nach jeder Übung der nächste', () => {
    expect([0, 1, 2, 3].map((n) => kruemelTip(['a', 'b', 'c'], n))).toEqual(['a', 'b', 'c', 'a']);
    expect(() => kruemelTip([], 0)).toThrow();
  });

  it('Sekunden, Datum (lokaler Tag wie de-DE, ohne führende Nullen), Regelsatz unter den Siegeln', () => {
    expect(formatSeconds(1234)).toBe('1,2 s');
    expect(formatSeconds(null)).toBe('–');
    expect(formatDate(new Date(2026, 2, 5, 23, 30).getTime())).toBe('5.3.2026');
    expect(formatDate(new Date(2026, 9, 26, 0, 5).getTime())).toBe('26.10.2026');
    expect(lessonRuleText({ exercises: 1, minExercises: 3 })).toBe('Geschafft, wenn alle Siegel offen sind und 3 Übungsrunden gespielt sind: 1 / 3.');
    expect(lessonRuleText({ exercises: 5, minExercises: 3 })).toBe('Geschafft, wenn alle Siegel offen sind und 3 Übungsrunden gespielt sind: 3 / 3.');
    expect(lessonRuleText({ exercises: 0, minExercises: 1 })).toBe('Geschafft, wenn alle Siegel offen sind: 0 / 1.');
  });

  it('Fingerhinweis mit Shift und AltGr', () => {
    expect(describeKey('j')).toBe('J – rechter Zeigefinger');
    expect(describeKey('A')).toBe('A – linker kleiner Finger + rechte Shift-Taste');
    expect(describeKey('@')).toBe('@ – linker kleiner Finger + Alt Gr');
    expect(describeKey('^')).toBe('');
    expect(describeKey('4')).toBe('4 – linker Zeigefinger');
    expect(describeKey('1')).toBe('1 – linker kleiner Finger');
    expect(describeKey('0')).toBe('0 – rechter kleiner Finger');
    expect(describeKey('?')).toBe('Fragezeichen – rechter kleiner Finger + linke Shift-Taste');
    expect(describeKey('!')).toBe('Ausrufezeichen – linker kleiner Finger + rechte Shift-Taste');
    expect(describeKey(';')).toBe('Semikolon – rechter Mittelfinger + linke Shift-Taste');
    expect(describeKey('"')).toBe('Anführungszeichen – linker Ringfinger + rechte Shift-Taste');
    expect(describeKey("'")).toBe('Apostroph – rechter kleiner Finger + linke Shift-Taste');
  });

  it('Krümels Hinweis nennt die schwächste Taste und was fehlt', () => {
    expect(lessonAdvice({ keys: [seal('f', null), seal('k', 'precision', 0.2)], exercises: 2, minExercises: 2, mastered: false })).toMatch(/^K .*vertippt/);
    expect(lessonAdvice({ keys: [seal('f', 'training', 0.4)], exercises: 0, minExercises: 2, mastered: false })).toMatch(/^F \(linker Zeigefinger\) braucht/);
    expect(lessonAdvice({ keys: [seal('f', null)], exercises: 1, minExercises: 2, mastered: false })).toMatch(/Noch eine Runde zur Bestätigung/);
    expect(lessonAdvice({ keys: [seal('f', null)], exercises: 0, minExercises: 3, mastered: false })).toMatch(/Noch 3 Runden/);
    expect(lessonAdvice({ keys: [], exercises: 2, minExercises: 2, mastered: true })).toMatch(/geschafft/);
  });
});

describe('Garderobe', () => {
  const items: WardrobeItem[] = [
    { id: 'frei', name: 'Frei', parts: [] },
    { id: 'brille', name: 'Brille', parts: [], source: { badge: 'tastsinn' } },
  ];

  it('Teile mit Quelle sind erst frei, wenn man sie besitzt', () => {
    expect(isUnlocked(items[0]!, new Set())).toBe(true);
    expect(isUnlocked(items[1]!, new Set())).toBe(false);
    expect(isUnlocked(items[1]!, new Set(['brille']))).toBe(true);
  });

  it('Merker werden nur einmal gesetzt', () => {
    const p = markSeen(profile(), 'a', 'a', 'b');
    expect(p.seen).toEqual(['a', 'b']);
    expect(markSeen(p, 'a')).toBe(p);
    expect(hasSeen(p, 'b')).toBe(true);
    expect(seenKey.briefing('x')).not.toBe(seenKey.examIntro('x'));
  });
});
