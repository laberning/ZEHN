// Ablauf eines Einsatzes als reine Zustandsmaschine:
// ready → countdown → run → saving → result (→ countdown bei „Nochmal“).

import { findModule, keysUpTo, lastLessonOf, moduleKeys, allWords, type Course, type Module } from './course.ts';
import { examTextLength, type ExamEvaluation } from './exam.ts';
import type { Reward } from './record.ts';
import { createRng } from './rng.ts';
import { generateText } from './textGenerator.ts';
import { applyKey, isDone, startTyping, type KeyPress, type SessionResult, type TypingState } from './typing.ts';

export const COUNTDOWN_FROM = 3;
export const COUNTDOWN_STEP_MS = 700;
/** So oft prüft der Bildschirm, ob die Zeit um ist */
export const TICK_MS = 100;

export type ExamPhase = 'ready' | 'countdown' | 'run' | 'saving' | 'result';

export interface ExamOutcome {
  result: SessionResult;
  evaluation: ExamEvaluation;
  reward: Reward;
}

export interface ExamRunState {
  phase: ExamPhase;
  count: number;
  typing: TypingState;
  durationMs: number;
  startedAt: number;
  now: number;
  errors: number;
  press: KeyPress | null;
  outcome: ExamOutcome | null;
}

export type ExamAction =
  | { type: 'begin' }
  | { type: 'countdown'; now: number }
  | { type: 'key'; ch: string; now: number }
  | { type: 'tick'; now: number }
  | { type: 'recorded'; outcome: ExamOutcome }
  | { type: 'retry'; typing: TypingState };

/** Text für einen Einsatz: alle Tasten des Moduls (mit `keys: 'learned'` alle bis dahin gelernten, die des Moduls als Fokus), Länge aus Mindesttempo × Zeit */
export function examTyping(course: Course, moduleId: string, seed: number): TypingState {
  const module = findModule(course, moduleId);
  const learned = module.exam.keys === 'learned';
  const text = generateText({
    allowed: learned ? keysUpTo(course, lastLessonOf(module).id) : moduleKeys(module),
    focus: learned ? moduleKeys(module) : undefined,
    words: allWords(course),
    length: examTextLength(module.exam),
    rng: createRng(seed),
  });
  return startTyping(text, module.exam.mode ?? 'strict');
}

export function examRunStart(module: Module, typing: TypingState): ExamRunState {
  return { phase: 'ready', count: COUNTDOWN_FROM, typing, durationMs: module.exam.durationSec * 1000, startedAt: 0, now: 0, errors: 0, press: null, outcome: null };
}

export const timeLeftMs = (s: ExamRunState): number => (s.phase === 'run' || s.phase === 'saving' ? Math.max(0, s.durationMs - (s.now - s.startedAt)) : s.durationMs);

export function examReducer(s: ExamRunState, a: ExamAction): ExamRunState {
  switch (a.type) {
    case 'begin':
      return s.phase === 'ready' ? { ...s, phase: 'countdown', count: COUNTDOWN_FROM } : s;
    case 'countdown':
      if (s.phase !== 'countdown') return s;
      return s.count > 1 ? { ...s, count: s.count - 1 } : { ...s, phase: 'run', startedAt: a.now, now: a.now };
    case 'key': {
      if (s.phase !== 'run') return s;
      // Zeit schon um (der letzte Takt kam noch nicht)? Dann zählt die Taste nicht mehr.
      if (timeLeftMs({ ...s, now: a.now }) <= 0) return { ...s, now: a.now, phase: 'saving' };
      const k = applyKey(s.typing, s.press, a.ch, a.now);
      if (!k) return s;
      return {
        ...s,
        typing: k.typing,
        now: a.now,
        errors: s.errors + (k.ok ? 0 : 1),
        press: k.press,
        phase: isDone(k.typing) ? 'saving' : 'run',
      };
    }
    case 'tick': {
      if (s.phase !== 'run') return s;
      const next = { ...s, now: a.now };
      return timeLeftMs(next) <= 0 ? { ...next, phase: 'saving' } : next;
    }
    case 'recorded':
      return s.phase === 'saving' ? { ...s, phase: 'result', outcome: a.outcome } : s;
    case 'retry':
      return s.phase === 'result'
        ? { ...s, phase: 'countdown', count: COUNTDOWN_FROM, typing: a.typing, errors: 0, press: null, outcome: null }
        : s;
  }
}

/** Firewall: ein Segment pro Wort; ein Segment steht, sobald das Wort komplett getippt ist. */
export function firewallSegments(text: string, position: number): { total: number; done: number } {
  let pos = 0;
  let done = 0;
  const words = text.split(' ');
  for (const w of words) {
    pos += w.length;
    if (position >= pos) done++;
    pos += 1;
  }
  return { total: words.length, done };
}

/** Spruch des Gegners: wechselt alle zwei Tippfehler */
export function tauntFor(errors: number, taunts: readonly string[]): string {
  return taunts[Math.floor(errors / 2) % taunts.length] ?? '';
}
