// Bewegung hinter einem Fehlanschlag: wie eine Taste danebenging (zu hoch, zu tief, andere Hand, vorgegriffen, falsche Umschalt-Hand).
// Liegt eigenständig, weil das Tastenprofil (`keyStats.ts`) und der Rundenhinweis (`roundReview.ts`) sie beide brauchen.

import { isCapitalLetter, isCapitalUmlaut, isCapitalUnit, keystrokeFor, learnKey, mirrorFinger } from './keyboard.ts';

/** Wie ein Fehler danebenging: eine Reihe zu hoch / zu tief (gleicher Finger), mit der anderen Hand (gespiegelter Finger), vorgegriffen (das nächste Zeichen getippt) */
export type MissHow = 'up' | 'down' | 'hand' | 'ahead';

/** Wie eine Lerneinheit danebenging; `shift` (falsche Umschalt-Hand) kommt nur an den Umschalt-Einheiten vor */
export type HowKind = MissHow | 'shift';

export const HOW_KINDS: readonly HowKind[] = ['up', 'down', 'hand', 'ahead', 'shift'];

/** Gleitende Anteile 0..1 der erkannten Fehlerarten an einer Lerneinheit */
export type HowShares = Readonly<Record<HowKind, number>>;

/** Ab so vielen gezählten Anschlägen mit Art (Tasten: erkannte Fehler; Umschalt-Einheiten: Großbuchstaben mit bekannter Hand) nennt die Akte die häufigste Bewegung */
export const DOMINANT_MIN = 4;
/** … wenn mindestens dieser Anteil davon dieselbe Art ist */
export const DOMINANT_SHARE = 0.5;

/** Was ein Anschlag für das Profil zeigt: eine Fehlerart, oder `fine` = die Umschalt-Hand war bekannt und richtig (schiebt `shift` zurück) */
export type HowSeen = HowKind | 'fine';

/** Was ein Anschlag für die Fehlerart braucht (ein `ScoredKeystroke` passt) */
export interface HowStroke {
  expected: string;
  correct: boolean;
  typed?: string;
  shift?: 'left' | 'right';
}

/**
 * Fehlerart eines Fehlanschlags über Finger und Reihe (nicht über Geometrie); `next` ist das erwartete folgende Zeichen.
 * Vorgegriffen wird zuerst geprüft; „zu hoch/zu tief“ nur bei der Nachbarreihe (Krümel sagt „eine Reihe“).
 * null, wenn keine Art passt (oder der Anschlag richtig war).
 */
export function missKind(stroke: Pick<HowStroke, 'expected' | 'correct' | 'typed'>, next?: string): MissHow | null {
  const { expected, typed } = stroke;
  if (stroke.correct || typed === undefined || typed === expected) return null;
  if (next !== undefined && typed === next) return 'ahead';
  const want = keystrokeFor(expected)?.key;
  const got = keystrokeFor(typed)?.key;
  if (!want || !got) return null;
  if (got.finger === want.finger && Math.abs(got.row - want.row) === 1) return got.row < want.row ? 'up' : 'down';
  if (got.finger === mirrorFinger(want.finger) && got.row === want.row) return 'hand';
  return null;
}

/** Großbuchstabe, dessen Umschalttaste die falsche Hand hielt (nur wenn die gehaltene Hand bekannt ist); auch bei richtigem Anschlag */
export const wrongShiftHand = (x: HowStroke): boolean =>
  x.shift !== undefined && (isCapitalLetter(x.expected) || isCapitalUmlaut(x.expected)) && keystrokeFor(x.expected)?.shift !== x.shift;

/**
 * Was der Anschlag `i` für das Profil seiner Lerneinheit (`learnKey`) zeigt. An den Umschalt-Einheiten zählt jeder Großbuchstabe mit
 * bekannter Umschalt-Hand: `shift`, wenn die falsche Hand hielt, sonst `fine` (so verblasst ein Muster wieder). Sonst die Art des
 * Fehlers (`missKind` mit dem folgenden Zeichen); richtige Anschläge und unerkannte Fehler: null.
 */
export function strokeHow(strokes: readonly HowStroke[], i: number): HowSeen | null {
  const x = strokes[i];
  if (!x) return null;
  const unit = learnKey(x.expected);
  if (isCapitalUnit(unit)) return x.shift === undefined ? null : wrongShiftHand(x) ? 'shift' : 'fine';
  return missKind(x, strokes[i + 1]?.expected);
}

/** Anteile nach einem weiteren Anschlag mit Art (`fine` zieht alle Anteile Richtung 0): am Anfang echter Mittelwert, danach gleitend mit `alpha` */
export function nextShares(shares: HowShares | undefined, howSamples: number, kind: HowSeen, alpha: number): HowShares {
  const a = Math.max(1 / (howSamples + 1), alpha);
  const base = shares ?? { up: 0, down: 0, hand: 0, ahead: 0, shift: 0 };
  const next = { ...base };
  for (const k of HOW_KINDS) next[k] = base[k] + a * ((k === kind ? 1 : 0) - base[k]);
  return next;
}

/**
 * Häufigste Bewegung, wenn das Muster klar ist: mindestens `DOMINANT_MIN` gezählte Anschläge mit Art, die häufigste Art mit mindestens
 * der Hälfte; bei Gleichstand zweier Arten (je die Hälfte) ist nichts klar. Sonst null.
 */
export function dominantHow(stat: { how?: HowShares; howSamples?: number } | undefined): HowKind | null {
  if (!stat?.how || (stat.howSamples ?? 0) < DOMINANT_MIN) return null;
  const how = stat.how;
  const eps = 1e-9;
  const top = HOW_KINDS.reduce((best, k) => (how[k] > how[best] ? k : best), HOW_KINDS[0]!);
  if (how[top] < DOMINANT_SHARE - eps) return null;
  if (HOW_KINDS.some((k) => k !== top && how[k] >= how[top] - eps)) return null;
  return top;
}
