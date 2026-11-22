// Rundenhinweis: Aus den Anschlägen einer Runde ableiten, woran Krümel erinnert (nur melden, nichts werten, nichts speichern).

import { SHIFT_LEFT, SHIFT_RIGHT, UMLAUTE_GROSS, handOf, isCapitalUnit, keystrokeFor, learnKey, type Hand } from './keyboard.ts';
import { isTimed, type ScoredKeystroke } from './keyStats.ts';
import { missKind, wrongShiftHand, type MissHow } from './movement.ts';

/** Ab so vielen Fehlern auf derselben Lerneinheit nennt Krümel die Taste */
export const KEY_MISS_MIN = 2;
/** Ab so vielen Fehlern insgesamt (über beide Hände, keine Taste mit zwei) erinnert er an die Grundstellung */
export const SPREAD_MISS_MIN = 3;

/** Ab so vielen Großbuchstaben mit der falschen Umschalt-Hand in einer Runde sagt Krümel es */
export const SHIFT_HAND_MIN = 2;
/** Ab so vielen Fehlern desselben Musters (Wortanfang, Hast, derselbe Finger), die mindestens die Hälfte der Fehler der Runde sind, nennt Krümel es */
export const PATTERN_MIN = 3;
/** Hastig: ein Fehlanschlag schneller als dieser Anteil der mittleren Zeit der richtigen Anschläge dieser Runde */
export const HASTE_RATIO = 0.6;
/** Ab so vielen gleichartigen Fehlern auf derselben Taste nennt Krümel die Fehlerart */
export const HOW_MIN = 2;

export type RoundReview =
  | { kind: 'shift-hand'; letter: string; misses: number }
  | { kind: 'key'; unit: string; misses: number; how?: MissHow; next?: string }
  | { kind: 'word-start'; misses: number }
  | { kind: 'haste'; misses: number }
  | { kind: 'same-finger'; misses: number }
  | { kind: 'spread'; misses: number };

/** Hand, die die Lerneinheit „besitzt“: bei Umschalt-Einheiten die haltende; Leertaste und Unbekanntes: keine */
function unitHand(unit: string): Hand | null {
  if (unit === SHIFT_LEFT || unit === UMLAUTE_GROSS) return 'left';
  if (unit === SHIFT_RIGHT) return 'right';
  const key = keystrokeFor(unit)?.key;
  const hand = key ? handOf(key.finger) : 'both';
  return hand === 'both' ? null : hand;
}

/** Muster hinter den Fehlanschlägen der Runde: Wortanfang, Hast, derselbe Finger (ein Fehler kann in mehreren zählen) */
function patternReview(scored: readonly ScoredKeystroke[]): RoundReview | null {
  const wrong = scored.filter((x) => !x.correct);
  const times = scored.flatMap((x) => (x.correct && isTimed(x.ms) ? [x.ms] : []));
  const mean = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  const counts = {
    'word-start': wrong.filter((x) => x.prev === ' ').length,
    haste: mean === null ? 0 : wrong.filter((x) => isTimed(x.ms) && x.ms < HASTE_RATIO * mean).length,
    // derselbe Finger auf einer anderen physischen Taste (f nach F ist dieselbe Taste und zählt nicht)
    'same-finger': wrong.filter((x) => {
      const before = x.prev === undefined ? undefined : keystrokeFor(x.prev)?.key;
      const want = keystrokeFor(x.expected)?.key;
      return before !== undefined && want !== undefined && before !== want && before.finger === want.finger;
    }).length,
  } as const;
  for (const kind of ['word-start', 'haste', 'same-finger'] as const) {
    const n = counts[kind];
    if (n >= PATTERN_MIN && n * 2 >= wrong.length) return { kind, misses: n };
  }
  return null;
}

/**
 * Ein Satz je Runde, in dieser Reihenfolge: Umschalt-Hand (ab zwei Großbuchstaben mit der falschen Hand, auch wenn sie richtig
 * waren), dann die Taste mit den meisten Fehlern (ab zwei; bei Gleichstand die zuerst danebengegangene; mit Fehlerart, wenn mindestens
 * zwei ihrer Fehler dieselbe Art haben), dann ein Muster (Wortanfang, Hast, derselbe Finger; je ab drei Fehlern, die
 * mindestens die Hälfte der Fehler ausmachen), sonst, ab drei Fehlern über beide Hände, die Streuung. Sonst nichts (kein Füllsatz).
 */
export function roundReview(scored: readonly ScoredKeystroke[]): RoundReview | null {
  const wrong = new Map<string, number>();
  for (const x of scored) if (wrongShiftHand(x)) wrong.set(x.expected, (wrong.get(x.expected) ?? 0) + 1);
  const wrongTotal = [...wrong.values()].reduce((a, b) => a + b, 0);
  if (wrongTotal >= SHIFT_HAND_MIN) {
    let letter = '';
    for (const [l, n] of wrong) if (!letter || n > wrong.get(letter)!) letter = l;
    return { kind: 'shift-hand', letter, misses: wrongTotal };
  }

  const misses = new Map<string, number>(); // Einfügereihenfolge = erster Fehler
  const hows = new Map<string, Map<MissHow, { n: number; next?: string }>>();
  scored.forEach((x, i) => {
    if (x.correct) return;
    const unit = learnKey(x.expected);
    misses.set(unit, (misses.get(unit) ?? 0) + 1);
    const next = scored[i + 1]?.expected;
    const how = isCapitalUnit(unit) ? null : missKind(x, next);
    if (!how) return;
    const byHow = hows.get(unit) ?? new Map<MissHow, { n: number; next?: string }>();
    const entry = byHow.get(how) ?? { n: 0, next: how === 'ahead' ? next : undefined };
    byHow.set(how, { ...entry, n: entry.n + 1 });
    hows.set(unit, byHow);
  });
  let best: { unit: string; misses: number } | null = null;
  for (const [unit, n] of misses) if (!best || n > best.misses) best = { unit, misses: n };
  if (best && best.misses >= KEY_MISS_MIN) {
    let how: MissHow | undefined;
    let next: string | undefined;
    let top = HOW_MIN - 1;
    for (const [h, e] of hows.get(best.unit) ?? []) {
      if (e.n > top) {
        top = e.n;
        how = h;
        next = e.next;
      }
    }
    return how ? { kind: 'key', ...best, how, ...(next === undefined ? {} : { next }) } : { kind: 'key', ...best };
  }
  const pattern = patternReview(scored);
  if (pattern) return pattern;
  const total = [...misses.values()].reduce((a, b) => a + b, 0);
  const hands = new Set([...misses.keys()].map(unitHand));
  if (total >= SPREAD_MISS_MIN && hands.has('left') && hands.has('right')) return { kind: 'spread', misses: total };
  return null;
}
