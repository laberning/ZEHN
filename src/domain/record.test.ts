// Auswertung (Schreibseite): Übungen, Einsatz-Hintertür, Spielhalle, Belohnungen – mit Mini-Kurs (TEST_COURSE) und echten Abzeichen.

import { describe, expect, it } from 'vitest';
import { T0, TEST_COURSE, TEST_RULES, keyStat, mastered, profile, strokes } from '../test/factories.ts';
import { awardBadges } from './badges.ts';
import { findModule } from './course.ts';
import { BACKDOOR_AFTER } from './exam.ts';
import { averageApm, caseTrainingKeys, currentLessonId, examCanUseBackdoor, examTraining, isModuleDone, lessonMastery, lessonStatus, weakestKeys } from './progress.ts';
import { recordArcade, recordExam, recordExercise, takeBackdoor } from './record.ts';
import { REWARDS } from '../content/rewards.ts';
import { arcadeXp, nextRank, rankFor, rankProgress, starsFor, xpFor } from './rewards.ts';

const RANKS = REWARDS.ranks;

const good = { length: 60, errors: 0, accuracy: 1, durationMs: 45000, apm: 80 };
const pass = { passed: true, inTime: true, accuracyOk: true, progress: 1 };
const fail = { passed: false, inTime: false, accuracyOk: true, progress: 0.8 };

describe('Übungen auswerten', () => {
  it('ein Auftrag gilt erst nach genug Runden und sicheren Tasten als geschafft', () => {
    const scored = [...strokes('f', 12), ...strokes('j', 12)];
    const r1 = recordExercise(profile(), { lessonId: 'a1', kind: 'exercise', result: good, scored, now: T0 }, TEST_RULES);
    expect(r1.profile.lessons.a1?.mastered).toBe(false);
    expect(r1.reward.newBadges).toContain('erster-auftrag');
    const r2 = recordExercise(r1.profile, { lessonId: 'a1', kind: 'exercise', result: good, scored, now: T0 + 1000 }, TEST_RULES);
    expect(r2.reward.lessonJustMastered).toBe(true);
    expect(r2.profile.lessons.a1).toMatchObject({ exercises: 2, mastered: true });
    expect(currentLessonId(r2.profile, TEST_COURSE)).toBe('a2');
  });

  it('Aufwärmen zählt nicht als Übungsrunde und gibt halbe EP', () => {
    const full = recordExercise(profile(), { lessonId: 'a1', kind: 'exercise', result: good, scored: [], now: T0 }, TEST_RULES);
    const warm = recordExercise(profile(), { lessonId: 'a1', kind: 'warmup', result: good, scored: [], now: T0 }, TEST_RULES);
    expect(warm.profile.lessons.a1?.exercises).toBe(0);
    expect(warm.reward.xp).toBeLessThan(full.reward.xp);
    expect(warm.reward.newRecord).toBe(false);
  });

  it('merkt Tempo-Rekord, Verlauf und Tastenprofil', () => {
    const r = recordExercise(profile(), { lessonId: 'a1', kind: 'exercise', result: good, scored: strokes('f', 3), now: T0 }, TEST_RULES);
    expect(r.reward.newRecord).toBe(true);
    expect(r.profile.bestApm).toBe(80);
    expect(r.profile.history).toHaveLength(1);
    expect(r.profile.stats.f?.samples).toBe(3);
    expect(averageApm(r.profile)).toBe(80);
    expect(averageApm(profile())).toBeNull();
  });

  it('merkt sich offene Riegel; ein Fehler schließt sie nicht, ein deutlicher Abfall schon', () => {
    const sitting = { f: keyStat({ samples: 40, accuracy: 0.9, avgMs: 500 }), j: keyStat({ samples: 40, accuracy: 0.9, avgMs: 500 }) };
    const run = (p: ReturnType<typeof profile>, ch: string, n: number) =>
      recordExercise(p, { lessonId: 'a1', kind: 'exercise', result: good, scored: strokes(ch, n, { correct: false }), now: T0 }, TEST_RULES).profile;
    const p0 = recordExercise(profile({ stats: sitting }), { lessonId: 'a1', kind: 'exercise', result: good, scored: [], now: T0 }, TEST_RULES).profile;
    expect(p0.latches.f).toEqual(['training', 'precision', 'tempo']);
    const p1 = run(p0, 'f', 1); // 0,9 -> 0,83: unter der Schwelle, aber über 0,8
    expect(p1.stats.f!.accuracy).toBeLessThan(0.9);
    expect(p1.latches.f).toContain('precision');
    expect(lessonStatus(p1, TEST_COURSE, 'a1').keys[0]!.secured).toBe(true);
    const p2 = run(p1, 'f', 2);
    expect(p2.latches.f).not.toContain('precision');
    expect(lessonStatus(p2, TEST_COURSE, 'a1').keys[0]!.secured).toBe(false);
  });

  it('der Auftrag gilt mit derselben Regel wie die Anzeige als geschafft', () => {
    const stats = { f: keyStat({ samples: 40, accuracy: 0.85, avgMs: 500 }), j: keyStat({ samples: 40, accuracy: 0.95, avgMs: 500 }) };
    const lessons = { a1: { exercises: 1, bestStars: 1 as const, mastered: false, best: 0 } };
    const last = (latches: Record<string, ('training' | 'precision' | 'tempo')[]>) =>
      recordExercise(profile({ stats, latches, lessons }), { lessonId: 'a1', kind: 'exercise', result: good, scored: [], now: T0 }, TEST_RULES).profile;
    // 85 % ohne Merker: Riegel waren zu, bleiben zu
    expect(last({}).lessons.a1!.mastered).toBe(false);
    // 85 % mit gemerktem Riegel: bleibt offen, Auftrag geschafft
    const withLatch = last({ f: ['training', 'precision', 'tempo'] });
    expect(withLatch.lessons.a1!.mastered).toBe(true);
    expect(lessonStatus(withLatch, TEST_COURSE, 'a1').keys.every((k) => k.secured)).toBe(true);
  });

  it('ein Riegel, der im Durchgang aufgeht, bleibt nach einem Fehler im selben Durchgang offen', () => {
    const almost = { f: keyStat({ samples: 40, accuracy: 0.88, avgMs: 500 }), j: keyStat({ samples: 40, accuracy: 0.95, avgMs: 500 }) };
    const lessons = { a1: { exercises: 1, bestStars: 1 as const, mastered: false, best: 0 } };
    const scored = [...strokes('f', 3), ...strokes('f', 1, { correct: false })]; // 88 % -> über 90 % -> ein Fehler: 83 %
    const p = recordExercise(profile({ stats: almost, lessons }), { lessonId: 'a1', kind: 'exercise', result: good, scored, now: T0 }, TEST_RULES).profile;
    expect(p.stats.f!.accuracy).toBeLessThan(0.9);
    expect(p.latches.f).toContain('precision');
    expect(p.lessons.a1!.mastered).toBe(true);
    expect(lessonStatus(p, TEST_COURSE, 'a1').keys.every((k) => k.secured)).toBe(true);
  });

  it('Einsatz-Wertung merkt Riegel ebenfalls', () => {
    const p = recordExam(profile(), { moduleId: 'a', result: good, evaluation: fail, scored: strokes('f', 40), now: T0 }, TEST_RULES).profile;
    expect(p.latches.f).toEqual(['training', 'precision', 'tempo']);
  });

  it('zeigt, was im Auftrag noch fehlt', () => {
    const p = profile({ stats: { f: keyStat({ avgMs: 400 }) } });
    const st = lessonStatus(p, TEST_COURSE, 'a1');
    expect(st.keys.map((k) => k.secured)).toEqual([true, false]);
    expect(lessonMastery(p, TEST_COURSE, 'a1')).toBe(0); // die schwächste Taste (J) bestimmt
    expect(weakestKeys(p, ['f', 'j'], findModule(TEST_COURSE, 'a').mastery, 1)).toEqual(['j']);
  });

  it('Trainingstasten: Einsatz = die schwächsten des Moduls im letzten Auftrag; Fall = die schwächsten bis zum Auftrag', () => {
    const p = profile({ stats: { f: keyStat({ avgMs: 400 }) } });
    expect(examTraining(p, TEST_COURSE, 'a')).toEqual({ lessonId: 'a2', keys: ['j', 'd', 'k'] });
    expect(caseTrainingKeys(p, TEST_COURSE, 'a1')).toEqual(['j', 'f']);
  });
});

const REGEN_MEDALS = [3, 6, 9] as const;

describe('Spielhalle', () => {
  it('speichert Bestwert und Spiele, gibt knappe EP und Abzeichen', () => {
    let r = recordArcade(profile(), 'regen', 90, 30, 4, REGEN_MEDALS, T0, TEST_RULES);
    expect(r.profile.arcade.regen).toEqual({ best: 90, plays: 1, bestLevel: 4, medal: 'bronze' });
    expect(r.reward.xp).toBeLessThanOrEqual(25);
    expect(r.reward.newBadges).toContain('spielhalle');
    expect(r.reward.newRecord).toBe(false); // erstes Spiel ist kein „neuer“ Rekord
    r = recordArcade(r.profile, 'regen', 150, 10, 2, REGEN_MEDALS, T0, TEST_RULES);
    expect(r.reward.newRecord).toBe(true);
    // schlechtere Runde: Level und Medaille bleiben, die Abzeichen für Gold gibt es nicht
    expect(r.profile.arcade.regen).toMatchObject({ bestLevel: 4, medal: 'bronze' });
    expect(r.reward.newBadges).not.toContain('regen-gold');
    expect(r.reward.newBadges).toContain('regenmacher');
    r = recordArcade(r.profile, 'tresor', 120, 15, 3, [1, 2, 3], T0, TEST_RULES);
    expect(r.reward.newBadges).toContain('tresorknacker');
    expect(r.reward.newBadges).toContain('tresor-gold');
    r = recordArcade(r.profile, 'regen', 300, 50, 9, REGEN_MEDALS, T0, TEST_RULES);
    expect(r.profile.arcade.regen).toMatchObject({ bestLevel: 9, medal: 'gold' });
    expect(r.reward.newBadges).toContain('regen-gold');
  });
});

describe('Belohnungen', () => {
  const base = { length: 100, errors: 0, durationMs: 60000 };
  it('vergibt Sterne relativ zum eigenen Schnitt', () => {
    const st = REWARDS.stars;
    expect(starsFor({ ...base, accuracy: 0.9, apm: 100 }, 50, st)).toBe(1);
    expect(starsFor({ ...base, accuracy: 0.95, apm: 100 }, 50, st)).toBe(2);
    expect(starsFor({ ...base, accuracy: 0.98, apm: 100 }, 90, st)).toBe(3);
    expect(starsFor({ ...base, accuracy: 0.98, apm: 80 }, 90, st)).toBe(2);
    expect(xpFor({ ...base, accuracy: 1, apm: 1 }, 3, REWARDS.xp)).toBeGreaterThan(xpFor({ ...base, accuracy: 1, apm: 1 }, 1, REWARDS.xp));
    expect(arcadeXp(60, REWARDS.arcade)).toBe(10);
    expect(arcadeXp(10_000, REWARDS.arcade)).toBe(REWARDS.arcade.maxXp);
  });

  it('ermittelt den Rang und meldet Beförderungen', () => {
    expect(rankFor(0, RANKS).title).toBe('Rekrut');
    expect(rankFor(200, RANKS).title).toBe('Anwärter');
    expect(rankFor(600, RANKS).title).toBe('Agent');
    expect(nextRank(600, RANKS)?.title).toBe('Spezialagent');
    expect(nextRank(1e9, RANKS)).toBeNull();
    expect(() => rankFor(0, [])).toThrow();
    const p = profile({ xp: RANKS[1]!.minXp - 1 });
    expect(recordExercise(p, { lessonId: 'a1', kind: 'exercise', result: good, scored: [], now: T0 }, TEST_RULES).reward.rankUp?.title).toBe('Anwärter');
  });

  it('rankProgress: Anteil des Wegs zum nächsten Rang, beim höchsten Rang voll', () => {
    const [r0, r1] = RANKS;
    expect(rankProgress(r0!.minXp, RANKS)).toEqual({ rank: r0, next: r1, fraction: 0 });
    const half = (r0!.minXp + r1!.minXp) / 2;
    expect(rankProgress(half, RANKS).fraction).toBeCloseTo(0.5);
    expect(rankProgress(r1!.minXp, RANKS)).toMatchObject({ rank: r1, fraction: 0 });
    expect(rankProgress(1e9, RANKS)).toEqual({ rank: RANKS.at(-1), next: null, fraction: 1 });
  });

  it('vergibt jedes Abzeichen nur einmal', () => {
    const once = awardBadges(profile({ history: [{ t: 0, lessonId: 'a1', kind: 'exercise', apm: 1, accuracy: 1, chars: 1 }] }), { kind: 'exercise' }, TEST_RULES.badges, T0);
    expect(once.newBadges).toContain('erster-auftrag');
    expect(awardBadges(once.profile, { kind: 'exercise' }, TEST_RULES.badges, T0).newBadges).not.toContain('erster-auftrag');
  });
});

describe('Einsatz: Hintertür', () => {
  it(`Hintertür nach ${BACKDOOR_AFTER} Fehlversuchen, Ehrenkodex beim späteren Bestehen`, () => {
    let p = profile({ lessons: mastered('a1', 'a2') });
    for (let i = 0; i < BACKDOOR_AFTER; i++) {
      expect(examCanUseBackdoor(p, 'a')).toBe(false);
      p = recordExam(p, { moduleId: 'a', result: good, evaluation: fail, scored: [], now: T0 }, TEST_RULES).profile;
    }
    expect(examCanUseBackdoor(p, 'a')).toBe(true);
    p = takeBackdoor(p, 'a', T0, TEST_RULES);
    expect(p.exams.a?.outcome).toBe('backdoor');
    expect(isModuleDone(p, 'a')).toBe(true);
    expect(isModuleDone(p, 'b')).toBe(false);
    const r = recordExam(p, { moduleId: 'a', result: good, evaluation: pass, scored: [], now: T0 }, TEST_RULES);
    expect(r.profile.exams.a?.outcome).toBe('passed');
    expect(r.reward.newBadges).toEqual(expect.arrayContaining(['ehrenkodex', 'null-fehler']));
    expect(r.profile.history.at(-1)).toMatchObject({ kind: 'exam', lessonId: 'a2' });
  });
});
