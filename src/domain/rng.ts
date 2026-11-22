// Kleiner, deterministischer Zufallsgenerator (mulberry32), damit Abläufe und Tests reproduzierbar sind.
// Der Kern erzeugt nie selbst Zufall: Startwerte (seed) kommen von außen (app/env).

export type Rng = () => number;

/** Ein Schritt: liefert Zufallszahl 0..1 und den nächsten Zustand (für speicherbare Spielzustände). */
export function nextRandom(state: number): { value: number; state: number } {
  const a = (state + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, state: a };
}

export function createRng(seed: number): Rng {
  return rngStream(seed).next;
}

/** Zieht einen Eintrag proportional zu seinem Gewicht. */
export function pickWeighted<T>(items: readonly T[], weights: readonly number[], rng: Rng): T {
  const total = weights.reduce((s, w) => s + w, 0);
  if (items.length === 0 || total <= 0) throw new Error('pickWeighted: keine Auswahl möglich');
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i] ?? 0;
    if (r < 0) return items[i] as T;
  }
  return items[items.length - 1] as T;
}

export function pickOne<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) throw new Error('pickOne: leere Liste');
  return items[Math.floor(rng() * items.length)] as T;
}

/** Zufallsstrom mit abfragbarem Zustand – für Spielzustände, die ihren Zufall als Zahl speichern. */
export function rngStream(state: number): { next: Rng; state: () => number } {
  let s = state >>> 0;
  return {
    next: () => {
      const r = nextRandom(s);
      s = r.state;
      return r.value;
    },
    state: () => s,
  };
}
