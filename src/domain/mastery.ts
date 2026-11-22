// Wann sitzt eine Taste? Und wie "schwach" ist sie im Vergleich?

import { learnKey, learnKeys } from './keyboard.ts';
import { strokeHow } from './movement.ts';
import { ALPHA, updateKeyStat, type KeyStat, type KeyStats, type ScoredKeystroke } from './keyStats.ts';

export interface MasteryCriteria {
  /** Mindestanzahl gewerteter Anschläge */
  minSamples: number;
  /** Mindest-Trefferquote 0..1 */
  minAccuracy: number;
  /** Höchste durchschnittliche Zeit pro Anschlag in ms */
  maxAvgMs: number;
}

/** Erst ab so vielen Anschlägen sagen Präzision und Tempo etwas aus */
export const MEASURE_MIN = 10;

/** Riegelwerte 0..1 je Kriterium: Training (Anschläge), Präzision, Tempo */
function latchValues(stat: KeyStat | undefined, c: MasteryCriteria): Record<LatchName, number> {
  const samples = stat?.samples ?? 0;
  return {
    training: Math.min(samples / c.minSamples, 1),
    precision: stat && samples ? Math.min(stat.accuracy / c.minAccuracy, 1) : 0,
    tempo: stat?.avgMs ? Math.min(c.maxAvgMs / stat.avgMs, 1) : 0,
  };
}

/** 0..1: wie nah die Taste am Ziel ist (Produkt der Riegelwerte). 1 = sicher. */
export function masteryScore(stat: KeyStat | undefined, c: MasteryCriteria): number {
  const v = latchValues(stat, c);
  return v.training * v.precision * v.tempo;
}

/**
 * Riegel, die eine Taste schon einmal offen hatte, je Taste (im Profil gemerkt). Ein solcher Riegel
 * schließt sich nicht wegen eines einzelnen Fehlers, sondern erst unterhalb der Schließschwelle.
 */
export type Latches = Readonly<Record<string, readonly LatchName[]>>;

/** Wie weit die Trefferquote unter die Schwelle fallen darf, bevor ein offener Riegel „Genau“ wieder zugeht (Schwelle 92 % → 82 %) */
export const CLOSE_ACCURACY_MARGIN = 0.1;
/** Um das Wievielfache der Zeitgrenze das Tempo schlechter werden darf, bevor ein offener Riegel „Tempo“ wieder zugeht */
export const CLOSE_TEMPO_FACTOR = 1.25;

/** Spielraum für Rundungsfehler an den Schwellen: 0,92 - 0,1 ist als Gleitkommazahl knapp über 0,82 */
const EPSILON = 1e-9;
/** Mindest-Trefferquote für „Genau“: die Schwelle, für einen schon offenen Riegel die Schließschwelle */
const precisionLimit = (c: MasteryCriteria, wasOpen: boolean): number => (wasOpen ? c.minAccuracy - CLOSE_ACCURACY_MARGIN : c.minAccuracy) - EPSILON;
/** Höchste Zeit je Anschlag für „Tempo“, ebenso */
const tempoLimit = (c: MasteryCriteria, wasOpen: boolean): number => (wasOpen ? c.maxAvgMs * CLOSE_TEMPO_FACTOR : c.maxAvgMs) + EPSILON;

/** Welche Riegel sind offen? `opened` = die Riegel, die schon einmal offen waren (sie haben die weitere Schließschwelle). */
function openLatches(stat: KeyStat | undefined, c: MasteryCriteria, opened: readonly LatchName[] = []): Record<LatchName, boolean> {
  const measured = !!stat && stat.samples >= MEASURE_MIN;
  const acc = stat?.accuracy ?? 0;
  const ms = stat?.avgMs ?? null;
  return {
    training: (stat?.samples ?? 0) >= c.minSamples,
    precision: measured && acc >= precisionLimit(c, opened.includes('precision')),
    tempo: measured && ms !== null && ms <= tempoLimit(c, opened.includes('tempo')),
  };
}

/** Die Riegel, die diese Taste jetzt offen hat (zum Merken im Profil) */
export function openedLatches(stat: KeyStat | undefined, c: MasteryCriteria, opened: readonly LatchName[] = []): LatchName[] {
  const o = openLatches(stat, c, opened);
  return LATCH_NAMES.filter((n) => o[n]);
}

/** Gesichert = alle drei Riegel offen (mit der Schließschwelle für schon einmal offene Riegel) */
export function isMastered(stat: KeyStat | undefined, c: MasteryCriteria, opened: readonly LatchName[] = []): boolean {
  const o = openLatches(stat, c, opened);
  return o.training && o.precision && o.tempo;
}

export function allMastered(stats: KeyStats, chars: readonly string[], c: MasteryCriteria, latches: Latches = {}): boolean {
  return learnKeys(chars).every((ch) => isMastered(stats[ch], c, latches[ch]));
}

/**
 * Rechnet Anschläge ein und schreibt nach jedem Anschlag die gemerkten Riegel seiner Taste fort. So bleibt ein Riegel,
 * der mitten in der Runde aufgeht, auch dann offen, wenn kurz danach ein einzelner Fehler kommt. `criteriaOf` = Maßstab
 * je Lerneinheit (`learnKey`); Tasten ohne Maßstab behalten ihre Riegel unverändert.
 */
export function applyLatched(
  stats: KeyStats,
  latches: Latches,
  strokes: readonly ScoredKeystroke[],
  criteriaOf: (key: string) => MasteryCriteria | undefined,
): { stats: KeyStats; latches: Record<string, LatchName[]> } {
  const st: Record<string, KeyStat> = { ...stats };
  const la: Record<string, LatchName[]> = Object.fromEntries(Object.entries(latches).map(([k, v]) => [k, [...v]]));
  strokes.forEach((s, i) => {
    const key = learnKey(s.expected);
    st[key] = updateKeyStat(st[key], s.correct, s.ms, strokeHow(strokes, i));
    const c = criteriaOf(key);
    if (!c) return;
    const open = openedLatches(st[key], c, la[key]);
    if (open.length > 0) la[key] = open;
    else delete la[key];
  });
  return { stats: st, latches: la };
}

/**
 * Wie viele Treffer in Folge fehlen, bis die Trefferquote die Schwelle erreicht (gerechnet wie `updateKeyStat`).
 * null, solange die Taste noch gemessen wird; 0, wenn sie schon darüber liegt.
 */
export function hitsToOpen(stat: KeyStat | undefined, c: MasteryCriteria): number | null {
  if (!stat || stat.samples < MEASURE_MIN) return null;
  let { samples, accuracy } = stat;
  let hits = 0;
  while (accuracy < precisionLimit(c, false) && hits < 1000) {
    samples += 1;
    hits += 1;
    accuracy += Math.max(1 / samples, ALPHA) * (1 - accuracy);
  }
  return hits;
}

/**
 * 0..1: wie dringend die Taste Übung braucht. Berücksichtigt Fehler und Langsamkeit.
 * Tasten mit wenig Daten gelten nicht als schwach – sie kommen über den Lernfokus dran.
 */
export function weakness(stat: KeyStat | undefined, c: MasteryCriteria): number {
  if (!stat || stat.samples < MEASURE_MIN) return 0;
  const errorPart = Math.max(0, (c.minAccuracy - stat.accuracy) / c.minAccuracy) * 3;
  const slowPart = stat.avgMs === null ? 0 : Math.max(0, stat.avgMs / c.maxAvgMs - 1);
  return Math.min(1, errorPart + slowPart);
}

// ---------- Tastensiegel ----------

/** Die drei Riegel eines Siegels */
export type LatchName = 'training' | 'precision' | 'tempo';
export const LATCH_NAMES: readonly LatchName[] = ['training', 'precision', 'tempo'];

export interface Latch {
  /** 0..1, wie weit der Riegel ist */
  value: number;
  open: boolean;
}

/** Siegel einer Taste: drei Riegel (Training, Präzision, Tempo); alle offen = gesichert */
export interface Seal {
  key: string;
  training: Latch;
  precision: Latch;
  tempo: Latch;
  /** weniger als MEASURE_MIN Anschläge: Präzision und Tempo „messen noch“ */
  measuring: boolean;
  secured: boolean;
  /** Rohwerte für Anzeigen: Anschläge, Trefferquote 0..1, Zeit je Anschlag in ms */
  samples: number;
  accuracy: number;
  avgMs: number | null;
  /** Treffer in Folge bis „Genau“ offen ist; null, solange „Genau“ offen ist oder noch gemessen wird */
  hitsToOpen: number | null;
  /** die Ziele, an denen die Riegel gemessen werden (für Anzeigen wie „4/30“) */
  goal: MasteryCriteria;
}

export function sealOf(key: string, stat: KeyStat | undefined, c: MasteryCriteria, opened: readonly LatchName[] = []): Seal {
  const v = latchValues(stat, c);
  const o = openLatches(stat, c, opened);
  const samples = stat?.samples ?? 0;
  return {
    key,
    training: { value: v.training, open: o.training },
    precision: { value: v.precision, open: o.precision },
    tempo: { value: v.tempo, open: o.tempo },
    measuring: samples < MEASURE_MIN,
    secured: o.training && o.precision && o.tempo,
    samples,
    accuracy: stat?.accuracy ?? 0,
    avgMs: stat?.avgMs ?? null,
    hitsToOpen: o.precision ? null : hitsToOpen(stat, c),
    goal: c,
  };
}

/** Siegel zu einem Tastenprofil: eines je Lerneinheit (15 Großbuchstaben einer Hand → das Siegel ihrer Umschalttaste) */
export const sealsFor = (stats: KeyStats, keys: readonly string[], c: MasteryCriteria, latches: Latches = {}): Seal[] =>
  learnKeys(keys).map((k) => sealOf(k, stats[k], c, latches[k]));

/**
 * Die Taste, die zwischen zwei Ständen „abgerutscht“ ist: ihr Riegel „Genau“ war vorher offen und ist jetzt zu. Mehrere:
 * die mit dem größten Abfall der Genauigkeit (bei Gleichstand die erste in `before`). Tempo zählt nicht.
 */
export function slippedSeal(before: readonly Seal[], after: readonly Seal[]): { before: Seal; after: Seal } | null {
  let best: { before: Seal; after: Seal } | null = null;
  for (const b of before) {
    const a = after.find((s) => s.key === b.key);
    if (!a || !b.precision.open || a.precision.open) continue;
    if (!best || b.accuracy - a.accuracy > best.before.accuracy - best.after.accuracy) best = { before: b, after: a };
  }
  return best;
}

/** 0..1 wie `masteryScore`, aus einem fertigen Siegel (zum Sortieren: die schwächste Taste zuerst) */
export const sealScore = (s: Seal): number => s.training.value * s.precision.value * s.tempo.value;

/** Der Riegel, der eine Taste gerade bremst (Reihenfolge: Training, Präzision, Tempo); null = gesichert */
export function blockingLatch(seal: Seal): LatchName | null {
  if (!seal.training.open) return 'training';
  if (!seal.precision.open) return 'precision';
  if (!seal.tempo.open) return 'tempo';
  return null;
}

/**
 * Gemessene Tasten unter der Präzisionsschwelle, die wackligste zuerst (höchstens `n`).
 * Bei Gleichstand gilt die Reihenfolge von `keys`.
 */
export function shakyKeys(stats: KeyStats, keys: readonly string[], c: MasteryCriteria, n = 3): { key: string; accuracy: number }[] {
  return keys
    .map((key) => ({ key, accuracy: stats[key]?.accuracy ?? 0, samples: stats[key]?.samples ?? 0 }))
    .filter((k) => k.samples >= MEASURE_MIN && k.accuracy < c.minAccuracy)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, n)
    .map(({ key, accuracy }) => ({ key, accuracy }));
}

// ---------- Wärmekarte ----------

/** Position der Genauigkeitsschwelle auf der Farbskala */
export const HEAT_MID = 0.6;

/** Genauigkeiten (0..1), die auf Stufe 0, `midAt` und 1 der Wärmekarte liegen */
export interface HeatScale {
  low: number;
  mid: number;
  high: number;
  midAt: number;
}

/** Skala der Wärmekarte, verankert an der Präzisionsschwelle des Siegels */
export function heatScale(c: MasteryCriteria): HeatScale {
  return { low: c.minAccuracy - 0.12, mid: c.minAccuracy, high: Math.min(1, c.minAccuracy + 0.06), midAt: HEAT_MID };
}

/**
 * 0..1 nach Genauigkeit; null = misst noch (unter MEASURE_MIN Anschlägen oder keine Messung).
 * Stufe >= HEAT_MID genau dann, wenn der Präzisions-Riegel des Siegels offen ist.
 */
export function accuracyHeat(stat: KeyStat | undefined, c: MasteryCriteria): number | null {
  if (!stat || stat.samples < MEASURE_MIN) return null;
  const { low, mid, high, midAt } = heatScale(c);
  const a = stat.accuracy;
  if (a < mid) return a <= low ? 0 : (midAt * (a - low)) / (mid - low);
  if (a >= high) return 1;
  return midAt + ((1 - midAt) * (a - mid)) / (high - mid);
}
