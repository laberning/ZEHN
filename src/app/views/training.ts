// Ansicht der Nachbesprechung von Bennos Tippstunde: die eigene Entwicklung seit Akt 1. Rein, aus dem Verlauf berechnet.
// Nur Vergleich mit sich selbst: kein Vergleich mit Figuren, keine Bestenliste.

import type { Course } from '../../domain/course.ts';
import type { HistoryEntry, Profile } from '../../domain/profile.ts';
import { scoredHistory } from '../../domain/progress.ts';
import type { SessionResult } from '../../domain/typing.ts';

export interface Pace {
  apm: number;
  accuracy: number;
}

export interface TrainingDebrief {
  /** diese Runde */
  now: Pace;
  /** der eigene Stand zu Beginn; null, wenn der Verlauf nichts hergibt */
  then: (Pace & { label: string }) | null;
}

/** So viele älteste gewertete Einträge ersetzen den Stand aus Akt 1, wenn dessen Übungen aus dem Verlauf gefallen sind (der Verlauf ist gedeckelt) */
export const OLDEST_ENTRIES = 10;

const mean = (entries: readonly HistoryEntry[], pick: (e: HistoryEntry) => number): number => entries.reduce((s, e) => s + pick(e), 0) / entries.length;

/**
 * Tempo und Genauigkeit der Runde neben dem eigenen Stand aus Akt 1: Mittel der Übungen von Modul 1 aus dem Verlauf;
 * fehlen sie, die ältesten zehn gewerteten Einträge vor der Tippstunde (Runden der Tippstunde selbst sind kein Stand von früher);
 * fehlt alles, steht nur die Runde da.
 */
export function trainingDebrief(p: Pick<Profile, 'history'>, course: Course, result: Pick<SessionResult, 'apm' | 'accuracy'>): TrainingDebrief {
  const now = { apm: result.apm, accuracy: result.accuracy };
  const first = course.modules[0];
  const firstLessons = new Set(first?.lessons.map((l) => l.id));
  const scored = scoredHistory(p);
  const act1 = scored.filter((e) => e.kind === 'exercise' && firstLessons.has(e.lessonId));
  const basis = act1.length > 0 ? act1 : scored.filter((e) => e.kind !== 'tippstunde').slice(0, OLDEST_ENTRIES);
  if (basis.length === 0) return { now, then: null };
  return { now, then: { apm: Math.round(mean(basis, (e) => e.apm)), accuracy: mean(basis, (e) => e.accuracy), label: 'Akt 1' } };
}
