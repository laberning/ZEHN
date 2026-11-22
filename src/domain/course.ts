// Kursmodell: Module (= Akte) mit Aufträgen (= Lektionen). Die Module liegen im Bündel ihres Akts (content/story/aktN/), der Kurs entsteht in content/course.ts;
// hier stehen nur Typen und Abfragen. Alle Funktionen bekommen den Kurs als Parameter,
// damit Regeln auch mit kleinen Test-Kursen geprüft werden können.

import type { ExamCriteria } from './exam.ts';
import type { MasteryCriteria } from './mastery.ts';

export interface Lesson {
  id: string;
  title: string;
  /** Neue Zeichen dieses Auftrags (Großbuchstaben A–Z einer Hand zählen für das Siegel ihrer Umschalttaste, siehe `learnKey`) */
  newKeys: string[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  mastery: MasteryCriteria;
  exam: ExamCriteria;
  /** Kuratierter Wortschatz für dieses Modul (nur Wörter aus bis dahin gelernten Zeichen werden genutzt) */
  words: readonly string[];
}

/** Wie ein Auftrag abläuft – gilt für den ganzen Kurs */
export interface PracticeRules {
  /** Übungsrunden je Auftrag; erst danach kann er als geschafft gelten */
  exercisesPerLesson: number;
  exerciseSec: number;
  warmupSec: number;
  /** Aufwärmen gibt es erst, wenn mehr als so viele Tasten gelernt sind */
  warmupAfterKeys: number;
  trainingSec: number;
  /** Höchstanteil schwacher Tasten im Text (Übung / Spezialtraining) */
  weakShare: number;
  trainingWeakShare: number;
  /** Mindest- und Höchstlänge eines Übungstexts in Zeichen */
  minTextLength: number;
  maxTextLength: number;
}

export interface Course {
  modules: Module[];
  practice: PracticeRules;
}

export function lessonOrder(course: Course): string[] {
  return course.modules.flatMap((m) => m.lessons.map((l) => l.id));
}

export function findLesson(course: Course, lessonId: string): { module: Module; lesson: Lesson } {
  for (const module of course.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return { module, lesson };
  }
  throw new Error(`Unbekannter Auftrag: ${lessonId}`);
}

export function findModule(course: Course, moduleId: string): Module {
  const m = course.modules.find((x) => x.id === moduleId);
  if (!m) throw new Error(`Unbekanntes Modul: ${moduleId}`);
  return m;
}

/** Alle Zeichen, die bis einschließlich dieses Auftrags gelernt sind. */
export function keysUpTo(course: Course, lessonId: string): string[] {
  const keys: string[] = [];
  for (const id of lessonOrder(course)) {
    keys.push(...findLesson(course, id).lesson.newKeys);
    if (id === lessonId) return keys;
  }
  throw new Error(`Unbekannter Auftrag: ${lessonId}`);
}

/** Alle Zeichen eines Moduls */
export function moduleKeys(module: Module): string[] {
  return module.lessons.flatMap((l) => l.newKeys);
}

/** Alle Wörter des Kurses (auch mit später gelernten Buchstaben; gewählt wird nach den gelernten Tasten, siehe usableWords) */
export const allWords = (course: Course): string[] => course.modules.flatMap((m) => m.words);

export function lastLessonOf(module: Module): Lesson {
  const l = module.lessons.at(-1);
  if (!l) throw new Error(`Modul ohne Aufträge: ${module.id}`);
  return l;
}
