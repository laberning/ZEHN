// Buchstabenregen als reine Zustandsmaschine: Buchstaben und Wörter fallen auf das Grundnetz.
// Die UI ruft `regenTick` pro Bild und `regenType` pro Taste auf und zeichnet den Zustand.

import { pickOne, rngStream, type Rng } from '../rng.ts';
import { usableWords } from '../textGenerator.ts';
import type { KeyPress } from '../typing.ts';
import { makeCode } from './common.ts';
import { levelsDone } from './levels.ts';

export const REGEN_LIVES = 3;
const MAX_DROPS = 7;
/** Pause nach einer Welle (ms) */
export const WAVE_PAUSE_MS = 2000;
/** Eine Welle sieht so aus wie das Spiel früher nach so vielen Sekunden (Stufe der Tempokurve) */
const SECONDS_PER_WAVE = 12;

/** Tropfen in Welle n */
export const waveSize = (level: number): number => 8 + 2 * level;
/** Bonuspunkte für die geschaffte Welle n */
export const waveBonus = (level: number): number => 10 * level;

/** Nächstes fallendes Objekt im Buchstabenregen: einzelner Buchstabe, Paar oder (später) ein Wort. */
export function regenItem(keys: readonly string[], words: readonly string[], rng: Rng): string {
  const usable = usableWords(words, keys).filter((w) => w.length <= 6);
  if (usable.length >= 8 && rng() < 0.55) return pickOne(usable, rng);
  if (keys.length >= 4 && rng() < 0.3) return makeCode(keys, 2, rng);
  return pickOne(keys, rng);
}

/** Schwierigkeit in Welle `level`: wie oft etwas erscheint und wie schnell es fällt. Das Tempo steigt in Stufen je Welle. */
export function regenPace(level: number): { spawnMs: number; speed: number } {
  const t = (level - 1) * SECONDS_PER_WAVE;
  return { spawnMs: Math.max(650, 2100 - t * 22), speed: Math.min(0.16, 0.055 + t * 0.0012) };
}

export interface Drop {
  id: number;
  text: string;
  /** 0..1 waagerecht */
  x: number;
  /** 0..1 senkrecht (1 = unten angekommen) */
  y: number;
  /** Anteil der Höhe pro Sekunde */
  speed: number;
  typed: number;
}

/** Was ist im letzten Schritt passiert? Für Töne und Effekte in der UI. */
export type RegenEvent = 'hit' | 'key' | 'miss' | 'landed' | 'wave';

export interface RegenState {
  keys: readonly string[];
  words: readonly string[];
  drops: Drop[];
  target: number | null;
  lives: number;
  /** aktuelle Welle (Start: das gewählte Startlevel) */
  level: number;
  startLevel: number;
  /** Tropfen der Welle, die noch erscheinen müssen */
  leftInWave: number;
  /** Bis dahin ist Pause zwischen zwei Wellen */
  pauseUntil: number;
  score: number;
  hits: number;
  combo: number;
  started: number;
  lastTick: number;
  lastSpawn: number;
  nextId: number;
  rng: number;
  laser: { x: number; y: number; until: number } | null;
  missUntil: number;
  over: boolean;
  events: RegenEvent[];
  /** letzter Anschlag (Treffer/Fehler leuchten auf der Bildschirmtastatur) */
  press: KeyPress | null;
}

export function regenStart(keys: readonly string[], words: readonly string[], seed: number, now: number, startLevel = 1): RegenState {
  return {
    keys,
    words,
    drops: [],
    target: null,
    lives: REGEN_LIVES,
    level: startLevel,
    startLevel,
    leftInWave: waveSize(startLevel),
    pauseUntil: 0,
    score: 0,
    hits: 0,
    combo: 0,
    started: now,
    lastTick: now,
    lastSpawn: now - 1500,
    nextId: 1,
    rng: seed >>> 0,
    laser: null,
    missUntil: 0,
    over: false,
    events: [],
    press: null,
  };
}

/** Zuletzt geschaffte Welle (0: keine) */
export const regenReached = (s: Pick<RegenState, 'startLevel' | 'level'>): number => levelsDone(s.startLevel, s.level);

export const regenMultiplier = (s: Pick<RegenState, 'combo'>): number => 1 + Math.floor(s.combo / 10);

/** Zeit vergeht: neue Tropfen, Fallen, Landungen. */
export function regenTick(s: RegenState, now: number): RegenState {
  if (s.over) return s;
  const dt = Math.min(0.05, Math.max(0, now - s.lastTick) / 1000);
  const pace = regenPace(s.level);
  let { rng, nextId, lastSpawn, leftInWave } = s;
  let drops = s.drops.map((d) => ({ ...d, y: d.y + d.speed * dt }));
  const events: RegenEvent[] = [];

  if (now >= s.pauseUntil && leftInWave > 0 && now - lastSpawn > pace.spawnMs && drops.length < MAX_DROPS) {
    const stream = rngStream(rng);
    const r = stream.next;
    const text = regenItem(s.keys, s.words, r);
    // nicht direkt neben dem letzten Tropfen
    let x = 0.1 + r() * 0.8;
    const prev = drops.at(-1);
    if (prev && Math.abs(prev.x - x) < 0.15) x = x > 0.5 ? x - 0.3 : x + 0.3;
    drops.push({ id: nextId++, text, x, y: 0, typed: 0, speed: pace.speed * (text.length > 2 ? 0.75 : 1) });
    rng = stream.state();
    lastSpawn = now;
    leftInWave--;
  }

  const landed = drops.filter((d) => d.y >= 1);
  let { lives, combo, target } = s;
  if (landed.length) {
    drops = drops.filter((d) => d.y < 1);
    if (landed.some((d) => d.id === target)) target = null;
    lives -= landed.length;
    combo = 0;
    events.push('landed');
  }
  const over = lives <= 0;
  let { level, score, pauseUntil } = s;
  if (!over && leftInWave === 0 && drops.length === 0 && now >= pauseUntil) {
    // Welle geschafft: Bonus, kurze Pause, dann die nächste, schnellere Welle
    score += waveBonus(level);
    level++;
    leftInWave = waveSize(level);
    pauseUntil = now + WAVE_PAUSE_MS;
    lastSpawn = pauseUntil - 1500;
    events.push('wave');
  }
  return { ...s, drops, rng, nextId, lastSpawn, leftInWave, level, score, pauseUntil, lastTick: now, lives, combo, target, over, events };
}

/** Eine Taste: zielt auf das tiefste passende Objekt oder tippt das aktuelle Ziel weiter. */
export function regenType(s: RegenState, ch: string, now: number): RegenState {
  if (s.over || now < s.pauseUntil) return s;
  const next = typeInto(s, ch, now);
  return { ...next, press: { ch, ok: !next.events.includes('miss'), n: (s.press?.n ?? 0) + 1 } };
}

/** Das nächste Zeichen, das Sinn ergibt: im angefangenen Wort, sonst der Anfang des untersten Tropfens */
export function regenNextChar(s: RegenState): string | undefined {
  const drop = s.drops.find((d) => d.id === s.target) ?? [...s.drops].sort((a, b) => b.y - a.y)[0];
  return drop?.text[drop.typed];
}

function typeInto(s: RegenState, ch: string, now: number): RegenState {
  const drop = s.drops.find((d) => d.id === s.target) ?? [...s.drops].filter((d) => d.text[0] === ch).sort((a, b) => b.y - a.y)[0];
  const target = drop ? drop.id : s.target;
  if (!drop || drop.text[drop.typed] !== ch) {
    return { ...s, combo: 0, missUntil: now + 200, events: ['miss'] };
  }
  const typed = drop.typed + 1;
  if (typed < drop.text.length) {
    return { ...s, target, drops: s.drops.map((d) => (d.id === drop.id ? { ...d, typed } : d)), events: ['key'] };
  }
  const combo = s.combo + 1;
  return {
    ...s,
    target: null,
    drops: s.drops.filter((d) => d.id !== drop.id),
    combo,
    hits: s.hits + 1,
    score: s.score + drop.text.length * regenMultiplier({ combo }),
    laser: { x: drop.x, y: drop.y, until: now + 140 },
    events: ['hit'],
  };
}
