// Ansicht der Akte: Hinweistext und Elternbericht.

import { describe, expect, it } from 'vitest';
import { COURSE } from '../../content/course.ts';
import { findLesson, keysUpTo } from '../../domain/course.ts';
import { DAY, PUNCT_COURSE, SHIFT_COURSE, T0, keyStat, mastered, masteredModule, profile } from '../../test/factories.ts';
import { SHIFT_LEFT } from '../../domain/keyboard.ts';
import { applyKeystrokes, type ScoredKeystroke } from '../../domain/keyStats.ts';
import { parentTexts } from '../../content/texts/akte.ts';
import { RULES } from '../rules.ts';
import { akteView } from './akte.ts';

describe('akteView: Hinweistext', () => {
  const stat = (samples: number, accuracy: number) => keyStat({ samples, accuracy });
  const begun = { lessons: mastered('m1-l1'), seen: ['briefing:m1-l2'] };

  it('nichts gemessen → kein Text; alles sicher → Lob; wacklig → Liste', () => {
    expect(akteView(profile(begun), RULES, T0).shakyText).toBeNull();
    expect(akteView(profile({ ...begun, stats: { f: stat(30, 1) } }), RULES, T0).shakyText).toBe('Alle gemessenen Tasten sitzen. Stark!');
    expect(akteView(profile({ ...begun, stats: { f: stat(30, 0.84) } }), RULES, T0).shakyText).toBe('Übe besonders: F (linker Zeigefinger, 84 %)');
  });
});

describe('akteView: Teil für Eltern', () => {
  it('leeres Profil: nichts geschafft, aktuelle Tasten, keine Übungen', () => {
    expect(akteView(profile(), RULES, T0).parent).toEqual({
      moduleTitle: COURSE.modules[0]!.title,
      lessonsDone: 0,
      lessonsTotal: COURSE.modules[0]!.lessons.length,
      currentKeys: ['f', 'j'],
      safeKeys: [],
      days: 0,
      exercisesLastWeek: 0,
      accuracy: null,
    });
  });

  it('gefülltes Profil: sichere Tasten ohne Leertaste, Übungen nur der letzten 7 Tage, Genauigkeit gemittelt', () => {
    const entry = (t: number, accuracy: number, kind: 'exercise' | 'warmup' = 'exercise') => ({ t, lessonId: 'm1-l1', kind, apm: 50, accuracy, chars: 40 });
    const history = [entry(T0 - 8 * DAY, 0.5), entry(T0 - 6 * DAY, 0.9), entry(T0 - DAY, 0.94), entry(T0, 0.1, 'warmup')];
    const p = profile({ lessons: mastered('m1-l1', 'm1-l2'), history, days: { count: 12, lastDay: '2026-10-26' } });
    const { parent } = akteView(p, RULES, T0);
    expect(parent).toMatchObject({ lessonsDone: 2, currentKeys: ['s', 'l'], days: 12, exercisesLastWeek: 3 });
    expect(parent.safeKeys).toEqual(expect.arrayContaining(['f', 'j', 'd', 'k']));
    expect(parent.safeKeys).not.toContain(' ');
    expect(parent.accuracy).toBeCloseTo((0.5 + 0.9 + 0.94) / 3);
  });

  it('alle Aufträge geschafft: keine aktuellen Tasten', () => {
    const lessons = Object.assign({}, ...COURSE.modules.map((m) => masteredModule(COURSE, m.id)));
    // die Zählung gilt für das Modul, in dem das Kind steht (das letzte)
    const total = COURSE.modules.at(-1)!.lessons.length;
    expect(akteView(profile({ lessons }), RULES, T0).parent).toMatchObject({ currentKeys: null, lessonsDone: total });
  });

  it('Einsatz von Akt 1 steht an: wie im HQ ist kein Auftrag von Akt 2 dran, seine Tasten zählen noch nicht', () => {
    const lessons = masteredModule(COURSE, 'm1');
    const view = akteView(profile({ lessons }), RULES, T0);
    expect(view.parent).toMatchObject({ moduleTitle: COURSE.modules[0]!.title, currentKeys: null, lessonsDone: COURSE.modules[0]!.lessons.length });
    expect(view.keys).toEqual(keysUpTo(COURSE, 'm1-l6'));
    // nach dem Einsatz (auch über die Hintertür) ist Auftrag 1 von Akt 2 dran
    const after = akteView(profile({ lessons, exams: { m1: { attempts: 3, outcome: 'backdoor' } } }), RULES, T0);
    expect(after.parent.currentKeys).toEqual(findLesson(COURSE, 'm2-l1').lesson.newKeys.filter((k) => k !== ' '));
  });
});


describe('akteView: Großschreibung', () => {
  const rules = { ...RULES, course: SHIFT_COURSE };
  const begun = { lessons: mastered('s1a', 's1b', 's1c', 's1d', 's2a'), exams: { s1: { attempts: 1, outcome: 'passed' as const } }, seen: ['briefing:s2b'] };

  it('Wärmekarte und „Übe besonders“ färben nur Buchstabentasten; Großbuchstaben zählen für die Umschalttaste', () => {
    const stats = { 'shift-right': keyStat({ samples: 30, accuracy: 0.5 }), a: keyStat({ samples: 30, accuracy: 0.84 }), Ä: keyStat({ samples: 30, accuracy: 0.5 }) };
    const v = akteView(profile({ ...begun, stats }), rules, T0);
    expect(Object.keys(v.heat)).toContain('a');
    expect(Object.keys(v.heat).filter((k) => /^[A-ZÄÖÜ]$|shift/.test(k))).toEqual([]);
    expect(v.shakyKeys.map((k) => k.key)).toEqual(['a']);
  });

  it('Elternbericht nennt Lerneinheiten: die Umschalttaste statt der Großbuchstaben', () => {
    const v = akteView(profile(begun), rules, T0);
    expect(v.parent.currentKeys).toEqual(['shift-left']);
    expect(v.parent.safeKeys).toContain('shift-right');
    expect(v.parent.safeKeys.filter((k) => /^[A-Z]$/.test(k))).toEqual([]);
  });
});

describe('akteView: Zeichen mit Umschalttaste', () => {
  const rules = { ...RULES, course: PUNCT_COURSE };
  const begun = { lessons: mastered('p1a', 'p1b', 'p2a', 'p2b', 'p2c', 'p3k', 'p3g', 'p3a'), exams: { p1: { attempts: 1, outcome: 'passed' as const }, p2: { attempts: 1, outcome: 'passed' as const } }, seen: ['briefing:p3b'] };

  it('Wärmekarte und „Übe besonders“ finden ? und ! (Zeichen der Taste, Namen im Text)', () => {
    const stats = { '?': keyStat({ samples: 30, accuracy: 0.8 }), '!': keyStat({ samples: 30, accuracy: 1 }) };
    const v = akteView(profile({ ...begun, stats }), rules, T0);
    expect(Object.keys(v.heat)).toEqual(expect.arrayContaining(['?', '!', ',']));
    expect(v.heat['?']).not.toBeNull();
    expect(v.shakyKeys.map((k) => k.key)).toEqual(['?']);
    expect(v.shakyText).toBe('Übe besonders: Fragezeichen (rechter kleiner Finger + linke Shift-Taste, 80 %)');
    expect(parentTexts({ ...v.parent, apm: null, shaky: v.shakyKeys }).attention).toContain('Fragezeichen (rechter kleiner Finger + linke Shift-Taste) wird noch oft vertippt');
  });
});

describe('akteView: Bewegung je Taste', () => {
  const begun = { lessons: mastered('m1-l1', 'm1-l2', 'm1-l3'), seen: ['briefing:m1-l4'] };
  const slip = (expected: string, typed: string): ScoredKeystroke => ({ expected, correct: false, ms: null, typed });
  const ok = (expected: string, n: number): ScoredKeystroke[] => Array.from({ length: n }, () => ({ expected, correct: true, ms: 400, typed: expected }));
  /** Taste mit 30 Anschlägen, `wrong` davon Griffe zu `typed` (zu hoch oder zu tief), Rest richtig */
  const shaky = (key: string, typed: string, wrong: number): ScoredKeystroke[] => [...ok(key, 30 - wrong), ...Array.from({ length: wrong }, () => slip(key, typed))];
  const view = (strokes: ScoredKeystroke[]) => akteView(profile({ ...begun, stats: applyKeystrokes({}, strokes) }), RULES, T0);

  it('ein Satz je Wackeltaste mit klarem Muster, in der Reihenfolge der Wackeltasten', () => {
    const v = view([...shaky('k', 'i', 6), ...shaky('d', 'e', 4)]);
    expect(v.shakyKeys.map((k) => k.key)).toEqual(['k', 'd']);
    expect(v.movementTexts).toEqual([
      'Beim K greifst du meist eine Reihe zu hoch: rechter Mittelfinger, bleib auf der Grundreihe.',
      'Beim D greifst du meist eine Reihe zu hoch: linker Mittelfinger, bleib auf der Grundreihe.',
    ]);
  });

  it('kein klares Muster, zu wenige erkannte Fehler oder keine Wackeltaste: kein Satz', () => {
    expect(view(shaky('k', 'i', 3)).movementTexts).toEqual([]); // nur 3 erkannt
    expect(view([...shaky('k', 'i', 3), ...Array.from({ length: 3 }, () => slip('k', 'd'))]).movementTexts).toEqual([]); // 3 : 3
    expect(view(shaky('k', 'e', 6)).movementTexts).toEqual([]); // Fehler ohne erkannte Art
    expect(view(ok('k', 30)).movementTexts).toEqual([]);
  });

  it('höchstens drei Sätze', () => {
    const v = view([...shaky('k', 'i', 7), ...shaky('d', 'e', 6), ...shaky('s', 'w', 5), ...shaky('l', 'o', 4)]);
    expect(v.shakyKeys).toHaveLength(3);
    expect(v.movementTexts).toHaveLength(3);
  });

  it('falsche Umschalt-Hand wird an der Umschalttaste gezeigt, nicht am Buchstaben', () => {
    const strokes: ScoredKeystroke[] = Array.from({ length: 5 }, () => ({ expected: 'K', correct: true, ms: 400, typed: 'K', shift: 'right' as const }));
    const stats = applyKeystrokes({}, strokes);
    expect(stats[SHIFT_LEFT]?.howSamples).toBe(5);
    const v = akteView(profile({ ...begun, stats }), RULES, T0);
    expect(v.movementTexts).toEqual(['Beim Großschreiben hält meist die falsche Hand: linker kleiner Finger hält, die rechte Hand tippt.']);
  });
});
