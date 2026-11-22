// Fortschritt: Abfragen, Freischaltung, Siegel, Einsatz-Stand – mit Mini-Kurs (TEST_COURSE) und echten Abzeichen.

import { describe, expect, it } from 'vitest';
import { NUMBER_COURSE, SHIFT_COURSE, T0, TEST_COURSE, TEST_RULES, keyStat, mastered, profile, strokes } from '../test/factories.ts';
import { SHIFT_RIGHT, learnKeys } from './keyboard.ts';
import { findLesson, findModule, type Module, keysUpTo, lessonOrder, moduleKeys, allWords } from './course.ts';
import { BACKDOOR_AFTER, NEW_EXAM, applyBackdoor, canUseBackdoor, evaluateExam, recordAttempt } from './exam.ts';
import { begunLessonId, currentLessonId, examAttempted, examBegun, examDue, examNext, isExamUnlocked, activeLessonId, isLessonUnlocked, lessonMastery, safeKeys, masteredKeys, storyEnd, weakestKeys, examTraining, caseTrainingKeys, slippedOldKey } from './progress.ts';
import { recordExam, recordExercise } from './record.ts';
import { COURSE } from '../content/course.ts';
import { objectPercent } from './storyObject.ts';
import { markSeen, seenKey } from './seen.ts';


const good = { length: 60, errors: 0, accuracy: 1, durationMs: 45000, apm: 80 };
const fail = { passed: false, inTime: false, accuracyOk: true, progress: 0.8 };

describe('Kursmodell', () => {
  it('findet Aufträge, Module, Tasten und Wörter', () => {
    expect(lessonOrder(TEST_COURSE)).toEqual(['a1', 'a2', 'b1']);
    expect(findLesson(TEST_COURSE, 'a2').module.id).toBe('a');
    expect(keysUpTo(TEST_COURSE, 'b1')).toEqual(['f', 'j', 'd', 'k', 's', 'l']);
    expect(moduleKeys(findModule(TEST_COURSE, 'b'))).toEqual(['s', 'l']);
    expect(allWords(TEST_COURSE)).toEqual(['dd', 'kk', 'lass']);
    expect(() => findLesson(TEST_COURSE, 'x')).toThrow();
    expect(() => findModule(TEST_COURSE, 'x')).toThrow();
    expect(() => keysUpTo(TEST_COURSE, 'x')).toThrow();
  });
});

describe('Freischaltung', () => {
  it('schaltet Aufträge der Reihe nach frei', () => {
    const p = profile();
    expect(isLessonUnlocked(p, TEST_COURSE, 'a1')).toBe(true);
    expect(isLessonUnlocked(p, TEST_COURSE, 'a2')).toBe(false);
    expect(isLessonUnlocked(p, TEST_COURSE, 'nope')).toBe(false);
    expect(currentLessonId(p, TEST_COURSE)).toBe('a1');
    const q = profile({ lessons: mastered('a1') });
    expect(isLessonUnlocked(q, TEST_COURSE, 'a2')).toBe(true);
    expect(currentLessonId(profile({ lessons: mastered('a1', 'a2', 'b1') }), TEST_COURSE)).toBeNull();
  });

  it('der erste Auftrag eines Moduls erst nach dem Einsatz davor (bestanden oder Hintertür); bis dahin ist kein Auftrag dran', () => {
    const lessons = mastered('a1', 'a2');
    const open = profile({ lessons });
    expect(isLessonUnlocked(open, TEST_COURSE, 'b1')).toBe(false);
    expect(currentLessonId(open, TEST_COURSE)).toBe('b1');
    expect(activeLessonId(open, TEST_COURSE)).toBeNull();
    expect(isLessonUnlocked(profile({ lessons, exams: { a: { attempts: 2, outcome: 'open' } } }), TEST_COURSE, 'b1')).toBe(false);
    for (const outcome of ['passed', 'backdoor'] as const) {
      const done = profile({ lessons, exams: { a: { attempts: 1, outcome } } });
      expect(isLessonUnlocked(done, TEST_COURSE, 'b1'), outcome).toBe(true);
      expect(activeLessonId(done, TEST_COURSE), outcome).toBe('b1');
    }
    // innerhalb eines Moduls zählt nur der Auftrag davor; nach dem Kurs ist nichts mehr dran
    expect(activeLessonId(profile({ lessons: mastered('a1') }), TEST_COURSE)).toBe('a2');
    expect(activeLessonId(profile({ lessons: mastered('a1', 'a2', 'b1'), exams: { a: { attempts: 1, outcome: 'passed' } } }), TEST_COURSE)).toBeNull();
  });

  it('Einsatz erst nach allen Aufträgen eines Moduls; Spielhalle mit sicheren Tasten', () => {
    const p = profile({ lessons: mastered('a1', 'a2') });
    expect(isExamUnlocked(p, findModule(TEST_COURSE, 'a'))).toBe(true);
    expect(examDue(p, TEST_COURSE)?.id).toBe('a');
    expect(examDue(profile(), TEST_COURSE)).toBeNull();
    expect(safeKeys(p, TEST_COURSE)).toEqual(['f', 'j', 'd', 'k']);
    expect(safeKeys(profile(), TEST_COURSE)).toEqual([]);
  });

  it('offene Einsätze gehen vor solchen, die nur über die Hintertür geschafft sind', () => {
    const lessons = mastered('a1', 'a2', 'b1');
    const backdoorA = { a: { attempts: 3, outcome: 'backdoor' as const, usedBackdoor: true } };
    expect(examDue(profile({ lessons, exams: backdoorA }), TEST_COURSE)?.id).toBe('b');
    const bPassed = { ...backdoorA, b: { attempts: 1, outcome: 'passed' as const } };
    expect(examDue(profile({ lessons, exams: bPassed }), TEST_COURSE)?.id).toBe('a'); // zum Nachholen
    expect(examDue(profile({ lessons, exams: { a: { attempts: 1, outcome: 'passed' }, b: { attempts: 1, outcome: 'passed' } } }), TEST_COURSE)).toBeNull();
  });
});

describe('Fortschrittswert', () => {
  const stat = (samples: number, avgMs = 400) => keyStat({ samples, avgMs });

  it('lessonMastery ist das Minimum der neuen Tasten', () => {
    const p = profile({ stats: { f: stat(10), j: stat(5) } });
    expect(lessonMastery(p, TEST_COURSE, 'a1')).toBeCloseTo(0.5);
    expect(lessonMastery(profile({ stats: { f: stat(10), j: stat(10) } }), TEST_COURSE, 'a1')).toBe(1);
  });

  it('best steigt mit jeder Runde und sinkt nie', () => {
    let p = profile();
    const run = (ch: string, n: number, ms: number) => {
      p = recordExercise(p, { lessonId: 'a1', kind: 'warmup', result: good, scored: strokes(ch, n, { ms }), now: T0 }, TEST_RULES).profile;
      return p.lessons.a1!.best;
    };
    run('f', 10, 400);
    const b1 = run('j', 10, 400);
    expect(b1).toBeGreaterThan(0);
    const b2 = run('j', 200, 2900); // sehr langsam: Tastenwert sinkt
    expect(lessonMastery(p, TEST_COURSE, 'a1')).toBeLessThan(b1);
    expect(b2).toBe(b1);
  });

  it('geschafft setzt best auf 1; das Objekt zeigt vorher höchstens 99 %', () => {
    const lp = { exercises: 1, bestStars: 1 as const, mastered: false, best: 1 };
    expect(objectPercent(lp)).toBe(0.99);
    expect(objectPercent({ ...lp, best: 0.4 })).toBe(0.4);
    expect(objectPercent({ ...lp, mastered: true })).toBe(1);
    expect(objectPercent(undefined)).toBe(0);
    const stats = { f: stat(10), j: stat(10) };
    const r = recordExercise(profile({ stats, lessons: { a1: { exercises: 1, bestStars: 1, mastered: false, best: 0.5 } } }), { lessonId: 'a1', kind: 'exercise', result: good, scored: strokes('f', 2), now: T0 }, TEST_RULES);
    expect(r.profile.lessons.a1).toMatchObject({ mastered: true, best: 1 });
  });
});

describe('Einsatz', () => {
  const c = { minAccuracy: 0.9, minApm: 60, durationSec: 10 };

  it('besteht nur in der Zeit und genau genug', () => {
    expect(evaluateExam({ length: 10, errors: 0, accuracy: 1, durationMs: 9000, apm: 66 }, 10, c).passed).toBe(true);
    const slow = evaluateExam({ length: 10, errors: 0, accuracy: 1, durationMs: 12000, apm: 50 }, 8, c);
    expect(slow.passed).toBe(false);
    expect(slow.progress).toBeCloseTo(0.8);
    expect(evaluateExam({ length: 10, errors: 5, accuracy: 0.5, durationMs: 5000, apm: 60 }, 10, c).accuracyOk).toBe(false);
  });

  it('examNext: nach dem letzten Auftrag direkt zum Einsatz – nur, wenn er ansteht und noch nie gespielt wurde', () => {
    const p = profile({ lessons: mastered('a1', 'a2') });
    expect(examNext(p, TEST_COURSE, 'a2')).toBe('a');
    expect(examNext(profile({ lessons: mastered('a1') }), TEST_COURSE, 'a1')).toBeNull();
    expect(examNext({ ...p, exams: { a: recordAttempt(NEW_EXAM, false) } }, TEST_COURSE, 'a2')).toBeNull();
    expect(examNext({ ...p, lessons: mastered('a1', 'a2', 'b1') }, TEST_COURSE, 'b1')).toBeNull(); // ansteht Einsatz A, nicht B
  });

  it('Einsatz begonnen (Intro gesehen) ist nicht dasselbe wie gespielt', () => {
    const fresh = profile({ lessons: mastered('a1', 'a2') });
    expect([examBegun(fresh, 'a'), examAttempted(fresh, 'a')]).toEqual([false, false]);
    const introOnly = markSeen(fresh, seenKey.examIntro('a'));
    expect([examBegun(introOnly, 'a'), examAttempted(introOnly, 'a')]).toEqual([true, false]);
    const played = recordExam(introOnly, { moduleId: 'a', result: good, evaluation: fail, scored: [], now: T0 }, TEST_RULES).profile;
    expect([examBegun(played, 'a'), examAttempted(played, 'a')]).toEqual([true, true]);
  });

  it('Prüfungsstand: Hintertür nur einmal, nur wenn offen', () => {
    let st = NEW_EXAM;
    for (let i = 0; i < BACKDOOR_AFTER; i++) st = recordAttempt(st, false);
    expect(canUseBackdoor(st)).toBe(true);
    st = applyBackdoor(st);
    expect(applyBackdoor(st)).toBe(st);
    expect(recordAttempt(st, true)).toMatchObject({ outcome: 'passed', usedBackdoor: true });
  });
});

describe('Zuletzt begonnener Auftrag', () => {
  it('der aktuelle, sobald begonnen; sonst der letzte geschaffte; nach dem Kurs der letzte', () => {
    const two = mastered('m1-l1', 'm1-l2');
    expect(begunLessonId(profile(), COURSE)).toBeNull();
    expect(begunLessonId(profile({ seen: ['briefing:m1-l1'] }), COURSE)).toBe('m1-l1');
    expect(begunLessonId(profile({ lessons: two }), COURSE)).toBe('m1-l2');
    expect(begunLessonId(profile({ lessons: two, seen: ['briefing:m1-l3'] }), COURSE)).toBe('m1-l3');
    expect(begunLessonId(profile({ lessons: mastered(...COURSE.modules[0]!.lessons.map((l) => l.id)) }), COURSE)).toBe('m1-l6');
  });
});

describe('storyEnd: Ende der Geschichte', () => {
  it('erst, wenn der Einsatz des letzten Moduls gespielt ist; Hintertür zählt und wird gemeldet', () => {
    const done = (a: 'passed' | 'backdoor') => ({ attempts: 1, outcome: a });
    expect(storyEnd(profile(), TEST_COURSE)).toBeNull();
    expect(storyEnd(profile({ exams: { a: done('passed') } }), TEST_COURSE)).toBeNull(); // vorletztes Modul
    expect(storyEnd(profile({ exams: { b: done('passed') } }), TEST_COURSE)).toEqual({ moduleId: 'b', backdoor: false });
    expect(storyEnd(profile({ exams: { b: done('backdoor') } }), TEST_COURSE)).toMatchObject({ moduleId: 'b', backdoor: true });
    expect(storyEnd(profile({ exams: { b: { attempts: 2, outcome: 'open' } } }), TEST_COURSE)).toBeNull();
  });

  it('hängt am letzten Modul des Kurses: ein weiterer Akt verschiebt es', () => {
    const more = { ...TEST_COURSE, modules: [...TEST_COURSE.modules, { ...TEST_COURSE.modules[1]!, id: 'c' }] };
    const p = profile({ exams: { b: { attempts: 1, outcome: 'passed' } } });
    expect(storyEnd(p, TEST_COURSE)?.moduleId).toBe('b');
    expect(storyEnd(p, more)).toBeNull();
    expect(seenKey.storyEnd('b')).not.toBe(seenKey.storyEnd('c'));
  });
});

describe('Großschreibung im Fortschritt', () => {
  const stat = (samples: number, accuracy = 1) => keyStat({ samples, accuracy, avgMs: 500 });
  const M = { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 };

  it('lessonMastery: das Siegel der Umschalttaste ist die einzige neue Taste des Auftrags', () => {
    const p = profile({ stats: { 'shift-right': stat(5) } });
    expect(lessonMastery(p, SHIFT_COURSE, 's2a')).toBeCloseTo(0.5);
    expect(lessonMastery(profile({ stats: { 'shift-right': stat(10) } }), SHIFT_COURSE, 's2a')).toBe(1);
    // Anschläge auf Q zählen nicht unter „Q“ (kein eigenes Profil)
    expect(lessonMastery(profile({ stats: { Q: stat(10) } }), SHIFT_COURSE, 's2a')).toBe(0);
  });

  it('schwächste Tasten: die Umschalttaste, nie ein einzelner Großbuchstabe', () => {
    const good = Object.fromEntries(learnKeys(keysUpTo(SHIFT_COURSE, 's2d')).map((k) => [k, stat(20)]));
    const stats = { ...good, 'shift-right': stat(20, 0.5) };
    const keys = [...'asd', ...'QWERTASDFGYXCVB'];
    expect(weakestKeys({ stats }, keys, M, 2)).toEqual(['shift-right', expect.any(String)]);
    const all = weakestKeys({ stats }, keys, M, 10);
    expect(all.filter((k) => /^[A-Z]$/.test(k))).toEqual([]);
    expect(all).toEqual(expect.arrayContaining(['shift-right']));
    expect(examTraining({ stats }, SHIFT_COURSE, 's2').keys).toContain('shift-right');
    expect(caseTrainingKeys({ stats }, SHIFT_COURSE, 's2a')).toContain('shift-right');
    expect(examTraining({ stats }, SHIFT_COURSE, 's2').keys.some((k) => /^[A-Z]$/.test(k))).toBe(false);
  });

  it('Spielhalle: safeKeys lässt Großbuchstaben A–Z weg, ß und Ä Ö Ü bleiben', () => {
    const p = profile({ lessons: mastered('s1a', 's2a', 's2b', 's2c', 's2d') });
    const safe = safeKeys(p, SHIFT_COURSE);
    expect(safe.filter((k) => /^[A-Z]$/.test(k))).toEqual([]);
    expect(safe).toEqual(expect.arrayContaining([...'asdß', 'Ä', 'Ö', 'Ü']));
    expect(masteredKeys(p, SHIFT_COURSE)).toContain('Q');
  });

  it('Spielhalle: safeKeys enthält die Ziffern geschaffter Aufträge', () => {
    const p = profile({ lessons: mastered('p1a', 'p1b', 'p2a', 'p2b', 'p2c', 'p3k', 'p3g', 'p3a', 'p3b', 'p3c', 'n1a', 'n1b') });
    const safe = safeKeys(p, NUMBER_COURSE);
    expect(safe).toEqual(expect.arrayContaining([...'45673', '8']));
    expect(safe.some((k) => ['1', '0', '2', '9'].includes(k))).toBe(false);
  });
});

describe('slippedOldKey', () => {
  const all = ['training', 'precision', 'tempo'] as const;
  const before = { f: keyStat({ accuracy: 0.95 }), j: keyStat({ accuracy: 0.95 }), d: keyStat({ accuracy: 0.95 }) };
  const latches = { f: [...all], j: [...all], d: [...all] };

  it('meldet nur früher gelernte Tasten, nicht die neuen des Auftrags', () => {
    const after = { f: keyStat({ accuracy: 0.85 }), j: keyStat({ accuracy: 0.7 }), d: keyStat({ accuracy: 0.5 }) };
    const r = slippedOldKey({ stats: after, latches: { f: [...all], j: [], d: [] } }, TEST_COURSE, 'a2', before, latches);
    expect(r?.before.key).toBe('j'); // d gehört zu a2 und wird nicht gemeldet
    expect(r?.after.precision.open).toBe(false);
  });

  it('nichts, wenn nichts abgerutscht ist; im ersten Auftrag gibt es keine alten Tasten', () => {
    expect(slippedOldKey({ stats: before, latches }, TEST_COURSE, 'a2', before, latches)).toBeNull();
    expect(slippedOldKey({ stats: { f: keyStat({ accuracy: 0.3 }) }, latches: {} }, TEST_COURSE, 'a1', before, latches)).toBeNull();
  });

  it('Kriterien des Moduls der Taste: Modul B schließt „Genau“ früher als Modul A', () => {
    const [a, b] = TEST_COURSE.modules as [Module, Module];
    const course = { ...TEST_COURSE, modules: [a, { ...b, lessons: [...b.lessons, { id: 'b2', title: 'Vier', newKeys: ['a'] }], mastery: { minSamples: 10, minAccuracy: 0.99, maxAvgMs: 1000 } }] };
    const one = (accuracy: number) => ({ s: keyStat({ accuracy }) });
    const l = { s: [...all] };
    // 0,85 liegt über der Schließschwelle von Modul A (0,8), aber unter der von Modul B (0,89)
    expect(slippedOldKey({ stats: one(0.85), latches: {} }, course, 'b2', one(0.995), l)?.before.key).toBe('s');
    expect(slippedOldKey({ stats: one(0.95), latches: l }, course, 'b2', one(0.995), l)).toBeNull();
  });

  it('eine Lerneinheit des Auftrags zählt nicht als alt, auch wenn frühere Aufträge Zeichen von ihr hatten', () => {
    const [m1, m2] = SHIFT_COURSE.modules as [Module, Module];
    const [a, b, ...rest] = m2.lessons;
    const course = { ...SHIFT_COURSE, modules: [m1, { ...m2, lessons: [a!, { ...b!, newKeys: [...b!.newKeys, 'Q'] }, ...rest] }] };
    const l = { [SHIFT_RIGHT]: [...all] };
    const st = (accuracy: number) => ({ [SHIFT_RIGHT]: keyStat({ accuracy }) });
    expect(slippedOldKey({ stats: st(0.5), latches: {} }, course, 's2b', st(0.95), l)).toBeNull();
  });
});
