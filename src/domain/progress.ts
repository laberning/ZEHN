// Spielfortschritt: Abfragen zum Stand, Verlauf, Siegel und Training. Die Auswertung (Schreibseite) steht in record.ts.
// Reine Funktionen. Kurs und Abzeichen kommen als `rules` herein; gespeichert wird in app/.

import type { Medal } from './arcade/levels.ts';
import { findLesson, findModule, keysUpTo, lastLessonOf, lessonOrder, moduleKeys, type Course, type Module } from './course.ts';
import { NEW_EXAM, canUseBackdoor, type ExamState } from './exam.ts';
import { isCapitalLetter, learnKeys } from './keyboard.ts';
import type { ScoredKeystroke } from './keyStats.ts';
import { applyLatched, masteryScore, openedLatches, sealOf, sealsFor, slippedSeal, type LatchName, type Latches, type MasteryCriteria, type Seal } from './mastery.ts';
import type { ArcadeGame, HistoryEntry, Profile } from './profile.ts';
import { hasSeen, seenKey } from './seen.ts';

// ---------- Abfragen ----------

/** So viele der letzten Übungen zählen für das Durchschnittstempo */
export const APM_WINDOW = 10;

/** Übungen, die das Tempo messen (Aufwärmen zählt nicht) */
export const scoredHistory = (p: Pick<Profile, 'history'>): HistoryEntry[] => p.history.filter((e) => e.kind !== 'warmup');

/** Durchschnittstempo der letzten Übungen (für relative Sterne und Textlänge) */
export function averageApm(p: Pick<Profile, 'history'>, last = APM_WINDOW): number | null {
  const h = scoredHistory(p).slice(-last);
  if (h.length === 0) return null;
  return h.reduce((s, e) => s + e.apm, 0) / h.length;
}

/** Durchschnittliche Genauigkeit der letzten Übungen (0..1); ohne gewertete Übung `null` */
export function averageAccuracy(p: Pick<Profile, 'history'>, last = APM_WINDOW): number | null {
  const h = scoredHistory(p).slice(-last);
  if (h.length === 0) return null;
  return h.reduce((s, e) => s + e.accuracy, 0) / h.length;
}

/** Ein Auftrag ist frei, wenn der davor geschafft ist; der erste eines neuen Moduls erst, wenn der Einsatz davor geschafft ist (auch über die Hintertür) */
export function isLessonUnlocked(p: Pick<Profile, 'lessons' | 'exams'>, course: Course, lessonId: string): boolean {
  const order = lessonOrder(course);
  const i = order.indexOf(lessonId);
  if (i <= 0) return i === 0;
  if (p.lessons[order[i - 1]!]?.mastered !== true) return false;
  const { module } = findLesson(course, lessonId);
  const previous = course.modules[course.modules.indexOf(module) - 1];
  return !previous || module.lessons[0]!.id !== lessonId || isModuleDone(p, previous.id);
}

/** Der Auftrag, an dem gerade gearbeitet wird (erster nicht geschaffter) */
export function currentLessonId(p: Pick<Profile, 'lessons'>, course: Course): string | null {
  return lessonOrder(course).find((id) => !p.lessons[id]?.mastered) ?? null;
}

/**
 * Der Auftrag, der dran ist: der aktuelle, sobald er frei ist. Null, solange vorher der Einsatz des Moduls ansteht
 * (der erste Auftrag des nächsten Moduls ist bis dahin gesperrt) und nach dem ganzen Kurs.
 */
export function activeLessonId(p: Pick<Profile, 'lessons' | 'exams'>, course: Course): string | null {
  const current = currentLessonId(p, course);
  return current !== null && isLessonUnlocked(p, course, current) ? current : null;
}

/**
 * Der zuletzt begonnene Auftrag: der aktuelle, sobald er begonnen ist (Briefing gesehen),
 * sonst der letzte geschaffte; nach dem Kurs der letzte. Null, solange noch nichts begonnen ist.
 */
export function begunLessonId(p: Pick<Profile, 'lessons' | 'seen'>, course: Course): string | null {
  const order = lessonOrder(course);
  const current = currentLessonId(p, course);
  if (current === null) return order.at(-1) ?? null;
  if (p.lessons[current] || hasSeen(p, seenKey.briefing(current))) return current;
  return order[order.indexOf(current) - 1] ?? null;
}

export const examState = (p: Profile, moduleId: string): ExamState => p.exams[moduleId] ?? NEW_EXAM;

export function isExamUnlocked(p: Pick<Profile, 'lessons'>, module: Module): boolean {
  return module.lessons.every((l) => p.lessons[l.id]?.mastered);
}

/** Modul geschafft: Einsatz bestanden oder über die Hintertür weiter */
export function isModuleDone(p: Pick<Profile, 'exams'>, moduleId: string): boolean {
  const o = p.exams[moduleId]?.outcome;
  return o === 'passed' || o === 'backdoor';
}

/** Das Ende der Geschichte: das letzte Modul des Kurses und ob sein Einsatz nur über die Hintertür geschafft ist */
export interface StoryEnd {
  moduleId: string;
  backdoor: boolean;
}

/**
 * Das Ende der Geschichte, sobald der Einsatz des letzten Moduls im Kurs gespielt ist (bestanden oder Hintertür), sonst null.
 * Das letzte Modul ist das Finale (Akt 7).
 */
export function storyEnd(p: Pick<Profile, 'exams'>, course: Course): StoryEnd | null {
  const last = course.modules.at(-1);
  if (!last || !isModuleDone(p, last.id)) return null;
  return { moduleId: last.id, backdoor: p.exams[last.id]?.outcome === 'backdoor' };
}

/**
 * Der Einsatz wurde schon einmal begonnen: das Intro lief (mit ihm die Antworten, für die Gadgets aus
 * Extra-Fällen gut sind). Ein Abbruch vor dem ersten Tippen zählt mit – anders als bei `examAttempted`.
 */
export const examBegun = (p: Pick<Profile, 'seen'>, moduleId: string): boolean => hasSeen(p, seenKey.examIntro(moduleId));

/** Der Einsatz wurde schon einmal gespielt (ein Ergebnis steht fest) oder per Hintertür übersprungen */
export const examAttempted = (p: Pick<Profile, 'exams'>, moduleId: string): boolean => p.exams[moduleId] !== undefined;

/**
 * Der Einsatz, der ansteht: zuerst einer, der noch offen ist,
 * sonst einer, der nur über die Hintertür geschafft wurde (zum Nachholen).
 */
export function examDue(p: Pick<Profile, 'lessons' | 'exams'>, course: Course): Module | null {
  const unlocked = course.modules.filter((m) => isExamUnlocked(p, m));
  return unlocked.find((m) => !isModuleDone(p, m.id)) ?? unlocked.find((m) => p.exams[m.id]?.outcome === 'backdoor') ?? null;
}

/** 0..1: wie weit die neuen Tasten des Auftrags sitzen – bestimmt die schwächste Taste */
export function lessonMastery(p: Pick<Profile, 'stats'>, course: Course, lessonId: string): number {
  const { module, lesson } = findLesson(course, lessonId);
  return Math.min(...learnKeys(lesson.newKeys).map((k) => masteryScore(p.stats[k], module.mastery)));
}

/**
 * Gleicht die gemerkten Riegel aller Kurstasten mit den jetzigen Werten ab (Maßstab: das Modul der Taste), beim Laden
 * eines Spielstands. Ein offener Riegel bleibt vermerkt, solange er nicht unter seine Schließschwelle fällt; ein Riegel,
 * den die Werte erreichen, kommt dazu. Gewertete Durchgänge schreiben die Riegel Anschlag für Anschlag fort (`recordStrokes`).
 */
export function updateLatches(latches: Latches, stats: Profile['stats'], course: Course): Record<string, LatchName[]> {
  const out: Record<string, LatchName[]> = {};
  for (const [key, c] of keyCriteria(course)) {
    const open = openedLatches(stats[key], c, latches[key]);
    if (open.length > 0) out[key] = open;
  }
  return out;
}

/**
 * Die früher gelernte Taste (nicht die neuen des Auftrags), die im Durchgang abgerutscht ist: Riegel „Genau“ vorher offen
 * (Stand zu Beginn des Durchgangs), jetzt zu. Mehrere: die mit dem größten Abfall. Siehe `slippedSeal`.
 */
export function slippedOldKey(
  p: Pick<Profile, 'stats' | 'latches'>,
  course: Course,
  lessonId: string,
  runStartStats: Profile['stats'],
  runStartLatches: Latches,
): { before: Seal; after: Seal } | null {
  const criteria = keyCriteria(course);
  const newUnits = new Set(learnKeys(findLesson(course, lessonId).lesson.newKeys));
  const old = learnKeys(keysUpTo(course, lessonId)).filter((k) => !newUnits.has(k));
  const seals = (stats: Profile['stats'], latches: Latches): Seal[] =>
    old.flatMap((k) => {
      const c = criteria.get(k);
      return c ? [sealOf(k, stats[k], c, latches[k])] : [];
    });
  return slippedSeal(seals(runStartStats, runStartLatches), seals(p.stats, p.latches));
}

/** Maßstab der Siegel je Lerneinheit: die Schwellen des Moduls, das sie einführt */
function keyCriteria(course: Course): Map<string, MasteryCriteria> {
  return new Map(course.modules.flatMap((m) => learnKeys(moduleKeys(m)).map((k) => [k, m.mastery] as const)));
}

/**
 * Anschläge eines gewerteten Durchgangs einrechnen; die Riegel werden nach jedem Anschlag fortgeschrieben (siehe `applyLatched`),
 * danach für alle Kurstasten mit den Werten abgeglichen (ändert nichts, wenn die Merker zum Stand passen).
 */
export function recordStrokes(p: Pick<Profile, 'stats' | 'latches'>, scored: readonly ScoredKeystroke[], course: Course) {
  const criteria = keyCriteria(course);
  const run = applyLatched(p.stats, p.latches, scored, (k) => criteria.get(k));
  return { stats: run.stats, latches: updateLatches(run.latches, run.stats, course) };
}

export interface LessonStatus {
  /** Siegel der neuen Tasten */
  keys: Seal[];
  exercises: number;
  minExercises: number;
  mastered: boolean;
}

/** Was fehlt noch, damit der Auftrag geschafft ist? */
export function lessonStatus(p: Pick<Profile, 'stats' | 'latches' | 'lessons'>, course: Course, lessonId: string): LessonStatus {
  const { module, lesson } = findLesson(course, lessonId);
  const lp = p.lessons[lessonId];
  return {
    keys: sealsFor(p.stats, lesson.newKeys, module.mastery, p.latches),
    exercises: lp?.exercises ?? 0,
    minExercises: course.practice.exercisesPerLesson,
    mastered: lp?.mastered ?? false,
  };
}

/** Die schwächsten Lerneinheiten – für das Spezialtraining (Großbuchstaben als Umschalttaste, nie einzeln) */
export function weakestKeys(p: Pick<Profile, 'stats'>, keys: readonly string[], criteria: MasteryCriteria, count = 3): string[] {
  return learnKeys(keys)
    .map((k) => ({ k, s: masteryScore(p.stats[k], criteria) }))
    .sort((a, b) => a.s - b.s)
    .slice(0, count)
    .map((x) => x.k);
}

/** Spezialtraining vor dem Einsatz: die schwächsten Tasten des ganzen Moduls, gespielt im letzten Auftrag */
export function examTraining(p: Pick<Profile, 'stats'>, course: Course, moduleId: string): { lessonId: string; keys: string[] } {
  const module = findModule(course, moduleId);
  return { lessonId: lastLessonOf(module).id, keys: weakestKeys(p, moduleKeys(module), module.mastery) };
}

/** Extra-Fall: die schwächsten Tasten bis zum Auftrag – keine fremden Tasten */
export function caseTrainingKeys(p: Pick<Profile, 'stats'>, course: Course, lessonId: string): string[] {
  return weakestKeys(p, keysUpTo(course, lessonId), findLesson(course, lessonId).module.mastery);
}

/** Bennos Tippstunde: gespielt im letzten Auftrag des Kurses (alle Tasten), Fokus auf die drei schwächsten Lerneinheiten */
export function tippstundeTraining(p: Pick<Profile, 'stats'>, course: Course): { lessonId: string; keys: string[] } {
  const last = course.modules.at(-1);
  if (!last) throw new Error('tippstundeTraining: kein Kurs');
  const lessonId = lastLessonOf(last).id;
  return { lessonId, keys: caseTrainingKeys(p, course, lessonId) };
}

/** Nach dem Auftrag direkt zum Einsatz? Ja (Modul-ID), wenn sein Einsatz jetzt ansteht und noch nie gespielt wurde */
export function examNext(p: Pick<Profile, 'lessons' | 'exams'>, course: Course, lessonId: string): string | null {
  const { module } = findLesson(course, lessonId);
  return examDue(p, course)?.id === module.id && !examAttempted(p, module.id) ? module.id : null;
}

export const examCanUseBackdoor = (p: Profile, moduleId: string): boolean => canUseBackdoor(examState(p, moduleId));

/** Bestwert in einem Spielhallen-Spiel (0, wenn noch nie gespielt) */
export const arcadeBest = (p: Pick<Profile, 'arcade'>, game: ArcadeGame): number => p.arcade[game]?.best ?? 0;

/** Höchstes geschafftes Level in einem Spielhallen-Spiel (0, wenn keins) */
export const arcadeBestLevel = (p: Pick<Profile, 'arcade'>, game: ArcadeGame): number => p.arcade[game]?.bestLevel ?? 0;

/** Beste Medaille in einem Spielhallen-Spiel */
export const arcadeMedal = (p: Pick<Profile, 'arcade'>, game: ArcadeGame): Medal | null => p.arcade[game]?.medal ?? null;

/** Alle Zeichen aus geschafften Aufträgen */
export function masteredKeys(p: Pick<Profile, 'lessons'>, course: Course): string[] {
  return course.modules
    .flatMap((m) => m.lessons)
    .filter((l) => p.lessons[l.id]?.mastered)
    .flatMap((l) => l.newKeys);
}

/** Tasten, die in der Spielhalle erlaubt sind: alle aus geschafften Aufträgen, ohne Großbuchstaben A–Z (Regen und Tresorcodes bleiben klein) */
export const safeKeys = (p: Pick<Profile, 'lessons'>, course: Course): string[] => masteredKeys(p, course).filter((k) => !isCapitalLetter(k));
