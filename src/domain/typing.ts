// Tippen: unveränderliche Zustandsmaschine. Jeder Tastendruck liefert einen neuen Zustand.

import type { ScoredKeystroke } from './keyStats.ts';

/**
 * strict: Bei einem Fehler geht es erst mit der richtigen Taste weiter.
 * flow:   Fehler werden markiert, man tippt weiter (Flow-Chip).
 */
export type ErrorMode = 'strict' | 'flow';

export type CharState = 'pending' | 'correct' | 'corrected' | 'wrong';

export interface TypingState {
  readonly text: string;
  readonly mode: ErrorMode;
  readonly chars: readonly CharState[];
  readonly position: number;
  /** Erster Versuch je Textstelle – Grundlage für das Tastenprofil */
  readonly scored: readonly ScoredKeystroke[];
  readonly missedHere: boolean;
  readonly startTime: number | null;
  readonly lastTime: number | null;
  readonly lastCorrectTime: number | null;
  readonly endTime: number | null;
}

export type KeyStatus = 'correct' | 'wrong' | 'ignored';

/** Letzter Tastendruck – für Animation und Ton in der UI */
export interface KeyPress {
  /** getipptes Zeichen (die UI findet daraus die Taste) */
  ch: string;
  ok: boolean;
  /** Zählt hoch, damit jede Animation neu startet */
  n: number;
}

export interface SessionResult {
  length: number;
  /** Stellen, die beim ersten Versuch falsch waren */
  errors: number;
  /** Anteil der Stellen, die beim ersten Versuch richtig waren (0..1) */
  accuracy: number;
  durationMs: number;
  /** Richtige Anschläge pro Minute */
  apm: number;
}

export function startTyping(text: string, mode: ErrorMode = 'strict'): TypingState {
  if (text.length === 0) throw new Error('startTyping: leerer Text');
  return {
    text,
    mode,
    chars: Array.from(text, () => 'pending' as const),
    position: 0,
    scored: [],
    missedHere: false,
    startTime: null,
    lastTime: null,
    lastCorrectTime: null,
    endTime: null,
  };
}

export const isDone = (s: TypingState): boolean => s.position >= s.text.length;
export const expectedChar = (s: TypingState): string | undefined => s.text[s.position];

/** Verarbeitet ein getipptes Zeichen. `now` in ms; `shift`: gehaltene Umschalt-Hand, wenn bekannt (nur fürs Rundenprotokoll). */
export function typeChar(s: TypingState, char: string, now: number, shift?: 'left' | 'right'): { state: TypingState; status: KeyStatus } {
  if (isDone(s) || char.length !== 1) return { state: s, status: 'ignored' };
  const expected = s.text[s.position] as string;
  const correct = char === expected;
  // Zeit für eine Taste: seit dem letzten richtigen Anschlag (inkl. Fehlversuchen dazwischen)
  const ms = s.lastCorrectTime === null ? null : now - s.lastCorrectTime;
  const stroke: ScoredKeystroke = { expected, correct, ms, typed: char, shift, prev: s.text[s.position - 1] };
  const scored = s.missedHere ? s.scored : [...s.scored, stroke];
  const base = { ...s, scored, startTime: s.startTime ?? now, lastTime: now };

  if (!correct && s.mode === 'strict') return { state: { ...base, missedHere: true }, status: 'wrong' };

  const chars = [...s.chars];
  chars[s.position] = correct ? (s.missedHere ? 'corrected' : 'correct') : 'wrong';
  const position = s.position + 1;
  const state: TypingState = {
    ...base,
    chars,
    position,
    missedHere: false,
    lastCorrectTime: now,
    endTime: position >= s.text.length ? now : null,
  };
  return { state, status: correct ? 'correct' : 'wrong' };
}

/** Anteil der Stellen, die beim ersten Versuch richtig waren; 1, solange noch nichts getippt ist */
export function liveAccuracy(s: Pick<TypingState, 'scored'>): number {
  if (s.scored.length === 0) return 1;
  return s.scored.filter((x) => x.correct).length / s.scored.length;
}

/** Ein Tastendruck in einem Ablauf: neuer Tippzustand und Animations-Zähler. null = ignoriert. */
export function applyKey(typing: TypingState, press: KeyPress | null, ch: string, now: number, shift?: 'left' | 'right'): { typing: TypingState; press: KeyPress; ok: boolean } | null {
  const { state, status } = typeChar(typing, ch, now, shift);
  if (status === 'ignored') return null;
  const ok = status === 'correct';
  return { typing: state, press: { ch, ok, n: (press?.n ?? 0) + 1 }, ok };
}

/** Ergebnis; funktioniert auch bei Abbruch (z. B. Zeit abgelaufen). */
export function typingResult(s: TypingState, now?: number): SessionResult {
  const errors = s.scored.filter((x) => !x.correct).length;
  const end = s.endTime ?? now ?? s.lastTime ?? 0;
  const durationMs = s.startTime === null ? 0 : Math.max(0, end - s.startTime);
  const correctChars = s.chars.filter((c) => c === 'correct' || c === 'corrected').length;
  // Der erste Anschlag startet die Uhr; gezählt werden die richtigen Anschläge danach.
  // War der erste Anschlag richtig, liegt er selbst vor dem Start und zählt nicht mit.
  const counted = s.scored[0]?.correct ? Math.max(0, correctChars - 1) : correctChars;
  return {
    length: s.text.length,
    errors,
    accuracy: s.scored.length === 0 ? 0 : liveAccuracy(s),
    durationMs,
    apm: durationMs > 0 ? (counted / durationMs) * 60000 : 0,
  };
}

/** Englisches Tastaturlayout? (y/z vertauscht, ; statt ö) */
export function layoutMismatch(expected: string | undefined, typed: string): boolean {
  return (expected === 'z' && typed === 'y') || (expected === 'y' && typed === 'z') || (expected === 'ö' && typed === ';');
}
