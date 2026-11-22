// Einsatz (Prüfung): Zeitvorgabe + Mindestgenauigkeit, Hintertür nach mehreren Fehlversuchen.

import type { ErrorMode, SessionResult } from './typing.ts';

export interface ExamCriteria {
  minAccuracy: number;
  /** Mindesttempo in Anschlägen pro Minute – bestimmt zusammen mit der Zeit die Textlänge */
  minApm: number;
  durationSec: number;
  /** Welche Tasten der Einsatz-Text nutzt: nur die des Moduls (Vorgabe) oder alle bis dahin gelernten, mit den Modul-Tasten als Fokus */
  keys?: 'module' | 'learned';
  /** Fehlerbehandlung im Einsatz: strikt (Vorgabe, Fehler muss korrigiert werden) oder Fluss (Fehler leuchtet, man tippt weiter); die Bewertung bleibt Genauigkeit und Tempo */
  mode?: ErrorMode;
}

/** Nach so vielen Fehlversuchen öffnet Ada die Hintertür. */
export const BACKDOOR_AFTER = 3;

export interface ExamState {
  attempts: number;
  /** passed = bestanden, backdoor = über die Hintertür weiter (Einsatz bleibt "unsicher") */
  outcome: 'open' | 'passed' | 'backdoor';
  /** Wurde irgendwann die Hintertür benutzt? */
  usedBackdoor?: boolean;
}

export const NEW_EXAM: ExamState = { attempts: 0, outcome: 'open' };

export function examTextLength(c: ExamCriteria): number {
  return Math.round((c.minApm * c.durationSec) / 60);
}

export interface ExamEvaluation {
  passed: boolean;
  inTime: boolean;
  accuracyOk: boolean;
  /** Wie weit man gekommen ist (0..1) – für "du warst bei 80 %!" */
  progress: number;
}

/**
 * @param typedChars wie viele Zeichen bis zum Ende/Abbruch geschafft wurden
 */
export function evaluateExam(result: SessionResult, typedChars: number, c: ExamCriteria): ExamEvaluation {
  const finished = typedChars >= result.length;
  const inTime = finished && result.durationMs <= c.durationSec * 1000;
  const accuracyOk = result.accuracy >= c.minAccuracy;
  return {
    passed: inTime && accuracyOk,
    inTime,
    accuracyOk,
    progress: result.length === 0 ? 0 : Math.min(1, typedChars / result.length),
  };
}

export function recordAttempt(state: ExamState, passed: boolean): ExamState {
  return { ...state, attempts: state.attempts + 1, outcome: passed ? 'passed' : state.outcome };
}

export function canUseBackdoor(state: ExamState): boolean {
  return state.outcome === 'open' && state.attempts >= BACKDOOR_AFTER;
}

export function applyBackdoor(state: ExamState): ExamState {
  if (!canUseBackdoor(state)) return state;
  return { ...state, outcome: 'backdoor', usedBackdoor: true };
}
