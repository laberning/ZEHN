// Alle Abzeichen aus content/badges.ts: je knapp unter und knapp über der Schwelle.

import { describe, expect, it } from 'vitest';
import { BADGES } from '../content/badges.ts';
import { DAY, T0, mastered, profile } from '../test/factories.ts';
import { awardBadges, isBadgeHidden, type BadgeEvent } from './badges.ts';
import { badgeTitleFor } from '../content/texts/badges.ts';
import { NEW_EXAM } from './exam.ts';
import type { Medal } from './arcade/levels.ts';
import type { AgentDays, HistoryEntry, LessonProgress, Profile } from './profile.ts';
import { countDay, dayKey } from './days.ts';
import type { SessionResult } from './typing.ts';

const result = (r: Partial<SessionResult> = {}): SessionResult => ({ length: 60, errors: 0, accuracy: 1, durationMs: 60_000, apm: 40, ...r });
const exercise = (r: Partial<SessionResult> = {}): BadgeEvent => ({ kind: 'exercise', lessonId: 'm1-l1', result: result(r) });

const entries = (n: number): HistoryEntry[] =>
  Array.from({ length: n }, (_, i) => ({ t: T0 + i, lessonId: 'm1-l1', kind: 'exercise', apm: 40, accuracy: 1, chars: 60 }));

/** Aufträge mit den angegebenen besten Sternen */
const stars = (...best: (0 | 1 | 2 | 3)[]): Record<string, LessonProgress> =>
  Object.fromEntries(best.map((s, i) => [`m1-l${i + 1}`, { exercises: 2, bestStars: s, mastered: true, best: 1 }]));

/** Agententage wie im Spiel: an n Tagen geübt, mit Pausen dazwischen (Tage in lokaler Zeit über dayKey) */
function daysOf(n: number): AgentDays {
  let d: AgentDays = { count: 0, lastDay: null };
  for (let i = 0; i < n; i++) d = countDay(d, dayKey(T0 + i * 3 * DAY));
  return d;
}

const exam = (moduleId: string, passed: boolean, r: Partial<SessionResult> = {}): BadgeEvent => ({ kind: 'exam', moduleId, examPassed: passed, result: result(r) });
const arcade = (game: 'regen' | 'tresor', score: number, count: number, level = 0, medal: Medal | null = null): BadgeEvent => ({ kind: 'arcade', arcade: { game, score, count, level, medal } });

interface Case {
  /** Spielstand und Ereignis knapp unter der Schwelle – kein Abzeichen */
  below: [Partial<Profile>, BadgeEvent];
  /** knapp darüber bzw. genau erreicht – Abzeichen */
  above: [Partial<Profile>, BadgeEvent];
}

const CASES: Record<string, Case> = {
  'erster-auftrag': { below: [{ history: [] }, exercise()], above: [{ history: entries(1) }, exercise()] },
  tastsinn: {
    below: [{ lessons: { 'm1-l1': { exercises: 5, bestStars: 3, mastered: false, best: 0 } } }, exercise()],
    above: [{ lessons: mastered('m1-l1') }, exercise()],
  },
  entschluesselt: { below: [{ lessons: mastered('m1-l1', 'm1-l2', 'm1-l3') }, exercise()], above: [{ lessons: mastered('m1-l4') }, exercise()] },
  grundreihe: {
    below: [{ exams: { m1: { ...NEW_EXAM, attempts: 1, outcome: 'backdoor', usedBackdoor: true } } }, exam('m1', false)],
    above: [{ exams: { m1: { ...NEW_EXAM, attempts: 1, outcome: 'passed' } } }, exam('m1', true)],
  },
  'obere-reihe': {
    below: [{ exams: { m2: { ...NEW_EXAM, attempts: 1, outcome: 'backdoor', usedBackdoor: true } } }, exam('m2', false)],
    above: [{ exams: { m2: { ...NEW_EXAM, attempts: 1, outcome: 'passed' } } }, exam('m2', true)],
  },
  'untere-reihe': {
    below: [{ exams: { m3: { ...NEW_EXAM, attempts: 1, outcome: 'backdoor', usedBackdoor: true } } }, exam('m3', false)],
    above: [{ exams: { m3: { ...NEW_EXAM, attempts: 1, outcome: 'passed' } } }, exam('m3', true)],
  },
  grossschreibung: {
    below: [{ exams: { m4: { ...NEW_EXAM, attempts: 1, outcome: 'backdoor', usedBackdoor: true } } }, exam('m4', false)],
    above: [{ exams: { m4: { ...NEW_EXAM, attempts: 1, outcome: 'passed' } } }, exam('m4', true)],
  },
  satzzeichen: {
    below: [{ exams: { m5: { ...NEW_EXAM, attempts: 1, outcome: 'backdoor', usedBackdoor: true } } }, exam('m5', false)],
    above: [{ exams: { m5: { ...NEW_EXAM, attempts: 1, outcome: 'passed' } } }, exam('m5', true)],
  },
  zahlen: {
    below: [{ exams: { m6: { ...NEW_EXAM, attempts: 1, outcome: 'backdoor', usedBackdoor: true } } }, exam('m6', false)],
    above: [{ exams: { m6: { ...NEW_EXAM, attempts: 1, outcome: 'passed' } } }, exam('m6', true)],
  },
  sonderzeichen: {
    below: [{ exams: { m7: { ...NEW_EXAM, attempts: 1, outcome: 'backdoor', usedBackdoor: true } } }, exam('m7', false)],
    above: [{ exams: { m7: { ...NEW_EXAM, attempts: 1, outcome: 'passed' } } }, exam('m7', true)],
  },
  'sauber-100': {
    below: [{}, exercise({ length: 99, errors: 0 })],
    above: [{}, exercise({ length: 100, errors: 0 })],
  },
  'drei-sterne': { below: [{ lessons: stars(3, 3, 2) }, exercise()], above: [{ lessons: stars(3, 3, 3) }, exercise()] },
  'sterne-12': { below: [{ lessons: stars(2, 2, 2, 2, 3) }, exercise()], above: [{ lessons: stars(2, 2, 2, 2, 2, 2) }, exercise()] },
  'tempo-60': { below: [{}, exercise({ apm: 59.9, accuracy: 1 })], above: [{}, exercise({ apm: 60, accuracy: 0.9 })] },
  'tempo-100': { below: [{}, exercise({ apm: 99.9, accuracy: 1 })], above: [{}, exercise({ apm: 100, accuracy: 0.9 })] },
  'serie-3': { below: [{ days: daysOf(2) }, exercise()], above: [{ days: daysOf(3) }, exercise()] },
  'serie-7': { below: [{ days: daysOf(6) }, exercise()], above: [{ days: daysOf(7) }, exercise()] },
  tippstunde: {
    below: [{ history: [...entries(30), ...entries(9).map((e) => ({ ...e, kind: 'tippstunde' as const }))] }, exercise()],
    above: [{ history: [...entries(5), ...entries(10).map((e) => ({ ...e, kind: 'tippstunde' as const }))] }, exercise()],
  },
  'uebungen-25': { below: [{ history: entries(24) }, exercise()], above: [{ history: entries(25) }, exercise()] },
  spielhalle: { below: [{}, exercise()], above: [{}, arcade('regen', 0, 0)] },
  regenmacher: { below: [{}, arcade('regen', 149, 30)], above: [{}, arcade('regen', 150, 30)] },
  tresorknacker: { below: [{}, arcade('tresor', 200, 14)], above: [{}, arcade('tresor', 0, 15)] },
  'regen-gold': { below: [{}, arcade('regen', 500, 99, 8, 'silber')], above: [{}, arcade('regen', 0, 0, 9, 'gold')] },
  'tresor-gold': { below: [{}, arcade('regen', 500, 99, 9, 'gold')], above: [{}, arcade('tresor', 0, 0, 3, 'gold')] },
  'null-fehler': { below: [{}, exam('m1', true, { errors: 1 })], above: [{}, exam('m1', true, { errors: 0 })] },
  ehrenkodex: {
    below: [{ exams: { m1: { ...NEW_EXAM, attempts: 4, outcome: 'backdoor', usedBackdoor: true } } }, exam('m1', false)],
    above: [{ exams: { m1: { ...NEW_EXAM, attempts: 5, outcome: 'passed', usedBackdoor: true } } }, exam('m1', true)],
  },
};

const newBadges = ([p, e]: [Partial<Profile>, BadgeEvent]) => awardBadges(profile(p), e, BADGES, T0).newBadges;

describe('Abzeichen', () => {
  it('jedes Abzeichen hat einen Schwellen-Test', () => {
    expect(Object.keys(CASES).sort()).toEqual(BADGES.map((b) => b.id).sort());
  });

  it.each(BADGES.map((b) => b.id))('%s: knapp unter der Schwelle nicht, knapp darüber schon', (id) => {
    const c = CASES[id]!;
    expect(newBadges(c.below)).not.toContain(id);
    expect(newBadges(c.above)).toContain(id);
  });

  it('Tempo zählt nur bei mindestens 90 % Genauigkeit', () => {
    const won = newBadges([{}, exercise({ apm: 120, accuracy: 0.89 })]);
    expect(won).not.toContain('tempo-60');
    expect(won).not.toContain('tempo-100');
  });

  it('Null Fehler nur bei bestandenem Einsatz, nicht bei einer Übung', () => {
    expect(newBadges([{}, exam('m1', false, { errors: 0 })])).not.toContain('null-fehler');
    expect(newBadges([{}, exercise({ errors: 0 })])).not.toContain('null-fehler');
  });

  it('Agententage: Pausen zwischen den Tagen kosten nichts', () => {
    const d = countDay(daysOf(2), dayKey(T0 + 30 * DAY)); // drei Tage, weit auseinander
    expect(newBadges([{ days: d }, exercise()])).toContain('serie-3');
  });
});

describe('Geheime Abzeichen', () => {
  it('bleiben verborgen, bis das Kind sie hat; normale nie', () => {
    const secret = { title: 'Null Fehler', secret: true };
    expect(isBadgeHidden(secret, false)).toBe(true);
    expect(isBadgeHidden(secret, true)).toBe(false);
    expect(isBadgeHidden({}, false)).toBe(false);
    expect(badgeTitleFor(secret, false)).toBe('Geheimes Abzeichen');
    expect(badgeTitleFor(secret, true)).toBe('Null Fehler');
    expect(badgeTitleFor({ title: 'Tastsinn' }, false)).toBe('Tastsinn');
  });
});
