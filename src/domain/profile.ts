// Spielstand eines Kindes. Wird komplett lokal gespeichert.

import type { Medal } from './arcade/levels.ts';
import type { ExamState } from './exam.ts';
import type { KeyStats } from './keyStats.ts';
import type { LatchName } from './mastery.ts';
import { pickOne, type Rng } from './rng.ts';

export type Gender = 'w' | 'm';

/** Farben sind Namen von LPC-Palettenvarianten, Teile sind IDs aus content/wardrobe.ts */
export interface Avatar {
  gender: Gender;
  skin: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  outfit: string;
  outfitColor: string;
  pants: string;
  pantsColor: string;
  shoes: string;
  shoesColor: string;
  glasses: string;
  /** Kopfbedeckung ('none' = keine) */
  head: string;
  /** Farbe der Kopfbedeckung (Kleiderfarbe; wirkt bei färbbaren Teilen wie dem Stirnband) */
  headColor: string;
  /** Zubehör (Schal, später mehr; 'none' = keins) */
  accessory: string;
  /** Farbe des Zubehörs (Kleiderfarbe, wirkt bei färbbaren Teilen wie dem Schal) */
  accessoryColor: string;
}

export interface LessonProgress {
  exercises: number;
  bestStars: 0 | 1 | 2 | 3;
  mastered: boolean;
  /** Höchster erreichter Fortschritt 0..1 (sinkt nie, auch wenn Tastenwerte sinken) */
  best: number;
}

export interface HistoryEntry {
  t: number;
  lessonId: string;
  kind: ExerciseKind;
  apm: number;
  accuracy: number;
  chars: number;
}

export type ExerciseKind = 'warmup' | 'exercise' | 'training' | 'tippstunde' | 'exam';

/** Trainingsrunden: Spezialtraining, Extra-Fall und Bennos Tippstunde zählen im Verlauf, bei EP, Rekorden und Tastenwerten gleich (nie als Übung eines Auftrags) */
export const isTrainingKind = (kind: ExerciseKind): boolean => kind === 'training' || kind === 'tippstunde';

/** Agententage: an wie vielen Kalendertagen trainiert wurde (sinkt nie) */
export interface AgentDays {
  count: number;
  /** YYYY-MM-DD (lokal), zuletzt gezählter Tag */
  lastDay: string | null;
}

export interface Settings {
  flow: boolean;
  sound: boolean;
  /** Blindflug: der Schreibtisch zeigt keine Bildschirmtastatur */
  blind: boolean;
}

export type ArcadeGame = 'regen' | 'tresor';

export interface ArcadeRecord {
  best: number;
  plays: number;
  /** höchstes geschafftes Level (Welle, Tresor …) */
  bestLevel: number;
  /** beste Medaille */
  medal: Medal | null;
}

/** Story-Stand: ausgelöste und gelesene Szenen, gewählte Antworten (der Chatverlauf wird daraus berechnet) */
export interface StoryState {
  /** Inhaltsversion, mit der der Stand zuletzt abgeglichen wurde (siehe app/profileMigration.ts) */
  v: number;
  /** ausgelöste Szenen in Reihenfolge */
  log: { id: string; t: number }[];
  /** Szene → gewählte Antwort-IDs in Reihenfolge */
  picks: Record<string, string[]>;
  /** gelesene Szenen */
  read: string[];
}

export interface Profile {
  id: string;
  schema: 1;
  createdAt: number;
  firstName: string;
  codename: string;
  avatar: Avatar;
  xp: number;
  stats: KeyStats;
  /** Riegel der Tastensiegel, die schon einmal offen waren (schließen erst bei deutlich schlechteren Werten, siehe domain/mastery.ts) */
  latches: Record<string, LatchName[]>;
  lessons: Record<string, LessonProgress>;
  exams: Record<string, ExamState>;
  /** Abzeichen-ID → Zeitpunkt */
  badges: Record<string, number>;
  days: AgentDays;
  history: HistoryEntry[];
  bestApm: number;
  settings: Settings;
  /** Bestwerte in Krümels Spielhalle */
  arcade: Partial<Record<ArcadeGame, ArcadeRecord>>;
  /** Merker „schon gesehen“ (Schlüssel aus domain/seen.ts) */
  seen: string[];
  story: StoryState;
  /** Extra-Fall → Zeitpunkt des ersten Lösens */
  cases: Record<string, number>;
}

/** Stimmt die Eingabe mit dem Codenamen überein? Groß-/Kleinschreibung und Leerzeichen am Rand zählen nicht (Rückfrage vor dem Löschen). */
export function codenameMatches(input: string, codename: string): boolean {
  return input.trim().toLowerCase() === codename.trim().toLowerCase();
}

/** „Agentin“ oder „Agent“ – für ein Profil oder ein Geschlecht */
export function agentTitle(who: Pick<Profile, 'avatar'> | Gender): string {
  const g = typeof who === 'string' ? who : who.avatar.gender;
  return g === 'w' ? 'Agentin' : 'Agent';
}

const DEFAULT_SETTINGS: Settings = { flow: false, sound: true, blind: false };

/** Neues Profil mit allen Startwerten (fehlende Felder alter Spielstände bekommen diese Werte, siehe app/profileMigration.ts) */
export function createProfile(input: { id: string; firstName: string; codename: string; avatar: Avatar }, now: number, storyVersion: number): Profile {
  return {
    ...input,
    schema: 1,
    createdAt: now,
    xp: 0,
    stats: {},
    latches: {},
    lessons: {},
    exams: {},
    badges: {},
    days: { count: 0, lastDay: null },
    history: [],
    bestApm: 0,
    settings: { ...DEFAULT_SETTINGS },
    arcade: {},
    seen: [],
    story: { v: storyVersion, log: [], picks: {}, read: [] },
    cases: {},
  };
}

/** Codename würfeln, z. B. „Vektor-07“ – die Namen kommen aus content/codenames.ts */
export function rollCodename(names: readonly string[], rng: Rng): string {
  const name = pickOne(names, rng);
  const num = String(1 + Math.floor(rng() * 99)).padStart(2, '0');
  return `${name}-${num}`;
}
