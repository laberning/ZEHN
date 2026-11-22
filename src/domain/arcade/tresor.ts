// Tresorknacker als reine Zustandsmaschine: Codes fehlerfrei abtippen, fünf Codes öffnen einen Tresor.

import { rngStream } from '../rng.ts';
import type { KeyPress } from '../typing.ts';
import { makeCode } from './common.ts';
import { levelsDone } from './levels.ts';

export const TRESOR_SECONDS = 60;
export const CODES_PER_VAULT = 5;
/** Takt der Uhr in der Anzeige */
export const TRESOR_TICK_MS = 100;

export type TresorEvent = 'key' | 'miss' | 'cracked' | 'vault';

export interface TresorState {
  keys: readonly string[];
  code: string;
  typed: number;
  /** geöffnete Tresore (Start: Startlevel - 1) */
  vault: number;
  startLevel: number;
  lamps: number;
  cracked: number;
  score: number;
  streak: number;
  started: number;
  now: number;
  rng: number;
  shakeUntil: number;
  openUntil: number;
  over: boolean;
  events: TresorEvent[];
  /** letzter Anschlag (Treffer/Fehler leuchten auf der Bildschirmtastatur) */
  press: KeyPress | null;
}

export const codeLength = (vault: number): number => Math.min(7, 3 + vault);

function newCode(keys: readonly string[], vault: number, rng: number): { code: string; rng: number } {
  const stream = rngStream(rng);
  return { code: makeCode(keys, codeLength(vault), stream.next), rng: stream.state() };
}

/** Startlevel n: man beginnt bei Tresor n (gleiche Zeit, längere Codes) */
export function tresorStart(keys: readonly string[], seed: number, now: number, startLevel = 1): TresorState {
  const { code, rng } = newCode(keys, startLevel - 1, seed >>> 0);
  return { keys, code, typed: 0, vault: startLevel - 1, startLevel, lamps: 0, cracked: 0, score: 0, streak: 0, started: now, now, rng, shakeUntil: 0, openUntil: 0, over: false, events: [], press: null };
}

/** Zuletzt geöffneter Tresor (0: keiner) */
export const tresorReached = (s: Pick<TresorState, 'startLevel' | 'vault'>): number => levelsDone(s.startLevel, s.vault + 1);

export const tresorTimeLeft = (s: Pick<TresorState, 'started' | 'now'>): number => Math.max(0, TRESOR_SECONDS - (s.now - s.started) / 1000);

export function tresorTick(s: TresorState, now: number): TresorState {
  if (s.over) return s;
  const next = { ...s, now, events: [] };
  return tresorTimeLeft(next) <= 0 ? { ...next, over: true } : next;
}

export function tresorType(s: TresorState, ch: string, now: number): TresorState {
  if (s.over) return s;
  const next = typeInto(s, ch, now);
  return { ...next, press: { ch, ok: !next.events.includes('miss'), n: (s.press?.n ?? 0) + 1 } };
}

/** Das nächste Zeichen des Codes */
export const tresorNextChar = (s: TresorState): string | undefined => s.code[s.typed];

function typeInto(s: TresorState, ch: string, now: number): TresorState {
  if (s.code[s.typed] !== ch) return { ...s, now, typed: 0, streak: 0, shakeUntil: now + 300, events: ['miss'] };
  const typed = s.typed + 1;
  if (typed < s.code.length) return { ...s, now, typed, events: ['key'] };

  const streak = s.streak + 1;
  let { lamps, vault, score, openUntil } = s;
  score += s.code.length * 2 + Math.min(streak, 10);
  lamps += 1;
  const events: TresorEvent[] = ['cracked'];
  if (lamps >= CODES_PER_VAULT) {
    vault += 1;
    lamps = 0;
    score += 15;
    openUntil = now + 900;
    events.push('vault');
  }
  const { code, rng } = newCode(s.keys, vault, s.rng);
  return { ...s, now, code, rng, typed: 0, streak, lamps, vault, score, openUntil, cracked: s.cracked + 1, events };
}
