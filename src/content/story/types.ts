// Typen der Akt-Bündel (ActContent, Prüfprofil). Bilderbuch, Einsatz-Story, Beschriftung und Fallakte liegen im Kern (domain/book.ts).

import type { Module } from '../../domain/course.ts';
import type { ExtraCase } from '../../domain/cases.ts';
import type { Line } from '../../domain/dialog.ts';
import type { StoryScene } from '../../domain/scenes.ts';
import type { StoryObject } from '../../domain/storyObject.ts';
import type { ExamStory, Fallakte, FallaktenDamage, LessonStory, ModuleLabel } from '../../domain/book.ts';

/**
 * Prüfprofil eines Akts für die Inhaltstests:
 * welche Aufträge eine getippte Antwort verlangen, ab welchem Auftrag der Name des Barons fallen darf,
 * welche Wörter die Fallakte nicht verraten darf.
 */
export interface ActCheck {
  /** Getippte Antworten (Antwort mit `typed`): Auftrag und erwartetes Wort */
  typed: { lessonId: string; word: string }[];
  /** Auftrag, ab dessen Abschluss der Name des Barons fallen darf (ohne: kein Name in diesem Akt) */
  revealFrom?: string;
  /** Wörter, die in der Fallakte nicht vorkommen dürfen (Spoiler späterer Akte) */
  spoilers: string[];
}

/** Alles, was zu einem Akt gehört – ein neuer Akt kommt als ein Bündel hinzu (content/story/acts.ts) */
export interface ActContent {
  module: Module;
  label: ModuleLabel;
  /** Bilderbuch: Prolog (nur Akt 1), Szenen je Auftrag, Einsatz-Story */
  book: { prolog?: Line[]; lessons: Record<string, LessonStory>; exam: ExamStory };
  /** Haupt-Szenen im Chat (Briefing, Stufen, Abschlüsse, Szene nach dem Einsatz) */
  chat: StoryScene[];
  side: StoryScene[];
  /** Extra-Fälle dieses Akts */
  cases: ExtraCase[];
  /** Ankündigung, Intro und Outro der Extra-Fälle */
  caseScenes: StoryScene[];
  /** Belohnungs-Szenen, die zur Geschichte dieses Akts gehören (Geschenke, Abzeichen des Akts) */
  rewards: StoryScene[];
  objects: StoryObject[];
  fallakte: Fallakte;
  /** Dieser Akt zerkratzt die Fallakten der früheren Akte im HQ (abgeleiteter Anzeigezustand, `fallaktenScratched`); ohne Feld: nichts */
  fallaktenDamage?: FallaktenDamage;
  check: ActCheck;
}

/** Das Training „Bennos Tippstunde“ (content/story/training/): Szenen und Fälle ohne Modul – kein Akt */
export interface TrainingContent {
  /** Szenen nach Tippstunden-Runden und die Abzeichen-Szene */
  scenes: StoryScene[];
  /** Fälle der Woche (ohne Gadget) */
  cases: ExtraCase[];
  /** Ankündigung, Intro und Outro der Fälle */
  caseScenes: StoryScene[];
}
