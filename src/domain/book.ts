// Bilderbuch, Einsatz-Story, Modul-Beschriftung und Fallakte: Formen und reine Nachschlagefunktionen über das Bündel
// (BookContent, Teil von StoryContent, siehe domain/storyContent.ts). Die Texte stehen in content/story/, verdrahtet in app/rules.ts.
// StoryRef liegt hier (nicht in story.ts), damit story.ts -> storyContent.ts -> book.ts keinen Kreis bildet.

import type { Line } from './dialog.ts';
import type { Profile } from './profile.ts';
import { isLogged } from './scenes.ts';
import type { PictureId, PortraitPictureId } from './storyObject.ts';

/**
 * Welche Bilderbuch-Szene ist gemeint? Navigation und Store speichern nur diese Verweise,
 * `storyLines` löst die Textzeilen erst beim Anzeigen auf.
 */
export type StoryRef =
  | { kind: 'prolog' }
  | { kind: 'briefing'; lessonId: string }
  | { kind: 'mastered'; lessonId: string }
  | { kind: 'examIntro'; moduleId: string }
  | { kind: 'examSuccess'; moduleId: string }
  | { kind: 'examBackdoor'; moduleId: string };

/** Bilderbuch-Szenen eines Auftrags (nur große Momente; alles andere erzählt der Chat) */
export interface LessonStory {
  briefing?: Line[];
  /** Wenn der Auftrag geschafft ist: die Story geht weiter */
  mastered?: Line[];
}

export interface ExamStory {
  /** Überschrift auf Karte und Einsatz-Bildschirm */
  title: string;
  /** Überschrift des Einsatz-Bildschirms bei Erfolg */
  won: string;
  /** Überschrift des Einsatz-Bildschirms bei Misserfolg */
  lost: string;
  /** Vorlese-Beschriftung der Segmente; Platzhalter {n} (gesichert) und {gesamt} */
  segments: string;
  /** Überschrift über dem Tipptext */
  frame: string;
  /** Spruch des Gegners vor dem Start */
  ready: string;
  /** Sprüche während des Einsatzes (wechseln bei Tippfehlern) */
  taunts: readonly string[];
  /** Wer die Sprüche über dem Tipptext sagt: der Baron (Standard) oder eine Lautsprecherstimme (Akt 5 bis 7) */
  voice?: 'baron' | 'speaker';
  intro: Line[];
  success: Line[];
  /** Platzhalter {prozent}: wie weit man gekommen ist */
  fail: Line[];
  backdoorOffer: Line[];
  backdoorTaken: Line[];
}

/** Wie ein Modul auf der Missionskarte heißt */
export interface ModuleLabel {
  act: string;
  place: string;
}

/** Eine Zeile der Fallakte: Text, optional ein kleines Bild (vorhandene Story-Bilder) und der Text einer Goldrand-Karte */
export interface FallakteEntry {
  text: string;
  picture?: PictureId;
  card?: string;
  /** Nur zeigen, wenn das Kind so geantwortet hat (wie bei Chat-Zeilen) */
  ifPicked?: Line['ifPicked'];
}

/** Stand eines Verdächtigen; die Fallakte zeigt ihn als Stempel */
export type SuspectStatus = 'verdaechtig' | 'gesucht' | 'entlastet' | 'ueberfuehrt';

/** Ein Verdächtiger der Fallakte: Stand, eine Zeile Text, sein Porträt und Treffer-Zeilen (nur bei passender Antwort des Kindes) */
export interface Suspect {
  name: string;
  status: SuspectStatus;
  text: string;
  /** Jeder Verdächtige hat ein Porträt (ui/pictures/portraits.tsx), damit die Texte untereinander stehen */
  picture: PortraitPictureId;
  hits: readonly FallakteEntry[];
}

/** Die Fallakte eines Akts: was gelöst ist, was offen bleibt, Krümels Schlusssatz */
export interface Fallakte {
  title: string;
  /** Adas Satz in der Kopfzeile */
  header: string;
  solved: readonly FallakteEntry[];
  /** Die Firewall-Zeile unter „Gelöst“: je nach Ergebnis des Einsatzes */
  firewall: { passed: string; backdoor: string };
  open: readonly FallakteEntry[];
  suspects: readonly Suspect[];
  closing: string;
}

/** Der Teil des Story-Bündels, den die Nachschlagefunktionen brauchen */
export interface BookContent {
  /** Bilderbuch: Prolog, Szenen je Auftrag, Einsatz-Story je Modul */
  book: { prolog: readonly Line[]; lessons: Readonly<Record<string, LessonStory>>; exams: Readonly<Record<string, ExamStory>> };
  /** Beschriftung je Modul */
  labels: Readonly<Record<string, ModuleLabel>>;
  /** Fallakte je Modul */
  fallakten: Readonly<Record<string, Fallakte>>;
  /** Zeiträume, in denen die Fallakten der früheren Akte zerkratzt sind (aus den Bündeln; ohne Feld: nie) */
  fallaktenDamage?: readonly FallaktenDamage[];
}

/**
 * Zeitraum, in dem die Fallakten im HQ zerkratzt sind: ab der gesehenen Szene `from` bis zur gesehenen Szene `until`
 * (beide im Story-Log des Profils; ein abgeleiteter Anzeigezustand, kein Profilfeld).
 */
export interface FallaktenDamage {
  from: string;
  until: string;
}

/** Sind die Fallakten gerade zerkratzt? Wahr, wenn für einen Eintrag die Szene `from` im Story-Log steht und `until` noch nicht */
export function fallaktenScratched(p: Pick<Profile, 'story'>, story: Pick<BookContent, 'fallaktenDamage'>): boolean {
  return (story.fallaktenDamage ?? []).some((d) => isLogged(p, d.from) && !isLogged(p, d.until));
}

/** Fallakte eines Moduls (undefined: es gibt noch keine) */
export function fallakte(story: Pick<BookContent, 'fallakten'>, moduleId: string): Fallakte | undefined {
  return story.fallakten[moduleId];
}

/** Einsatz-Story eines Moduls (Titel, Sprüche, Szenen); wirft, wenn es keine gibt */
export function examStory(story: Pick<BookContent, 'book'>, moduleId: string): ExamStory {
  const s = story.book.exams[moduleId];
  if (!s) throw new Error(`Keine Einsatz-Story für Modul ${moduleId}`);
  return s;
}

/** Beschriftung eines Moduls auf der Missionskarte (Akt, Ort) */
export function moduleLabel(story: Pick<BookContent, 'labels'>, moduleId: string): ModuleLabel | undefined {
  return story.labels[moduleId];
}

/** Bilderbuch-Zeilen zu einem Verweis (leer, wenn es dazu nichts gibt; nur die Einsatz-Story wirft wie `examStory`) */
export function storyLines(story: Pick<BookContent, 'book'>, ref: StoryRef): readonly Line[] {
  switch (ref.kind) {
    case 'prolog':
      return story.book.prolog;
    case 'briefing':
      return story.book.lessons[ref.lessonId]?.briefing ?? [];
    case 'mastered':
      return story.book.lessons[ref.lessonId]?.mastered ?? [];
    case 'examIntro':
      return examStory(story, ref.moduleId).intro;
    case 'examSuccess':
      return examStory(story, ref.moduleId).success;
    case 'examBackdoor':
      return examStory(story, ref.moduleId).backdoorTaken;
  }
}
