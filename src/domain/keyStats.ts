// Tastenprofil: pro Zeichen Trefferquote und Tempo als gleitender Durchschnitt.
// Neuere Anschläge zählen stärker, damit Fortschritte schnell sichtbar werden.
// „Zeichen“ heißt hier Lerneinheit (`learnKey`): Großbuchstaben A–Z zählen für das Profil ihrer Umschalttaste.

import { learnKey } from './keyboard.ts';
import { nextShares, strokeHow, type HowSeen, type HowShares } from './movement.ts';

export interface KeyStat {
  /** Anzahl gewerteter Anschläge (erster Versuch pro Textstelle) */
  samples: number;
  /** Gleitende Trefferquote 0..1 */
  accuracy: number;
  /** Gleitende Zeit bis zum richtigen Anschlag in ms; null, solange es keine Messung gibt */
  avgMs: number | null;
  timedSamples: number;
  /** Gleitende Anteile der erkannten Fehlerarten (Tasten: nur erkannte Fehler; Umschalt-Einheiten: jeder Großbuchstabe mit bekannter Hand); fehlt, solange nichts gezählt wurde */
  how?: HowShares;
  /** Anzahl der Anschläge, aus denen `how` besteht */
  howSamples?: number;
}

export type KeyStats = Readonly<Record<string, KeyStat>>;

/** Gewicht neuer Messungen, sobald genug Daten vorliegen. */
export const ALPHA = 0.08;
/** Längere Pausen sind Nachdenken oder Ablenkung, kein Tipptempo. */
const MAX_MS = 3000;

/** Gültige Zeitmessung eines Anschlags: vorhanden, größer 0, keine Pause (über `MAX_MS`) */
export const isTimed = (ms: number | null): ms is number => ms !== null && ms > 0 && ms <= MAX_MS;

function emptyStat(): KeyStat {
  return { samples: 0, accuracy: 0, avgMs: null, timedSamples: 0 };
}

/** `how`: erkannte Fehlerart dieses Anschlags (an den Umschalt-Einheiten auch `fine`); ohne bleibt sie unverändert (richtige Anschläge, unerkannte Fehler) */
export function updateKeyStat(stat: KeyStat | undefined, correct: boolean, ms: number | null, how?: HowSeen | null): KeyStat {
  const s = stat ?? emptyStat();
  const samples = s.samples + 1;
  // Am Anfang echter Mittelwert, danach gleitend.
  const a = Math.max(1 / samples, ALPHA);
  const accuracy = s.accuracy + a * ((correct ? 1 : 0) - s.accuracy);

  let { avgMs, timedSamples } = s;
  if (correct && isTimed(ms)) {
    timedSamples += 1;
    const b = Math.max(1 / timedSamples, ALPHA);
    avgMs = avgMs === null ? ms : avgMs + b * (ms - avgMs);
  }
  const base = { samples, accuracy, avgMs, timedSamples };
  if (how) return { ...base, how: nextShares(s.how, s.howSamples ?? 0, how, ALPHA), howSamples: (s.howSamples ?? 0) + 1 };
  return s.how ? { ...base, how: s.how, howSamples: s.howSamples ?? 0 } : base;
}

export interface ScoredKeystroke {
  expected: string;
  correct: boolean;
  /** Zeit seit dem letzten richtigen Anschlag (auch bei Fehlern); null beim ersten Anschlag. Gewertet werden nur Treffer-Zeiten. */
  ms: number | null;
  /** Getipptes Zeichen (nur im flüchtigen Rundenprotokoll, nie im Profil) */
  typed?: string;
  /** Gehaltene Umschalt-Hand; fehlt, wenn unbekannt (Bildschirmtastatur, beide gedrückt) */
  shift?: 'left' | 'right';
  /** Vorheriges erwartetes Zeichen; fehlt am Textanfang */
  prev?: string;
}

export function applyKeystrokes(stats: KeyStats, strokes: readonly ScoredKeystroke[]): KeyStats {
  const next: Record<string, KeyStat> = { ...stats };
  strokes.forEach((s, i) => {
    const unit = learnKey(s.expected);
    next[unit] = updateKeyStat(next[unit], s.correct, s.ms, strokeHow(strokes, i));
  });
  return next;
}
