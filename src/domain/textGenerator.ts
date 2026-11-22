// Erzeugt Übungstexte aus den bereits gelernten Zeichen.
//
// Gewichtung pro Zeichen:
//   - Grundmischung: alle erlaubten Zeichen, neue Zeichen der Lektion doppelt.
//   - Schwächen: Ein fester Anteil (höchstens maxWeakShare) geht an schwache Tasten.
//     So kommen sie öfter, aber nie so oft, dass es frustriert.
//   - Nachsteuerung: Die Gewichtung wirkt bei Wörtern kaum, wenn nur wenige Wörter eine Taste enthalten (z. B. „ö“, „ä“).
//     Deshalb zählt der Generator beim Bauen mit: Liegt eine Fokus-Taste unter FOCUS_MIN_SHARE ihres Gewichtsanteils
//     (Leerzeichen zählen nicht), kommt als Nächstes ein Wort mit ihr oder, wenn es keines gibt, eine Übungsgruppe, die sie
//     sicher enthält. Nur Fokus-Tasten werden nachgesteuert; ohne Fokus (Einsatz) läuft alles wie ohne Nachsteuerung.
//   - Satzzeichen (`, . - ? ! : ; "`, `PUNCTUATION`): Wörter und Übungsgruppen bestehen nur aus den übrigen Zeichen.
//     Nach jeder Einheit entscheidet ein eigener Schritt, ob ein Satzzeichen folgt: Komma, Punkt, Fragezeichen, Ausrufezeichen,
//     Doppelpunkt und Semikolon hängen am Ende der Einheit (danach Leerzeichen oder Textende), der Bindestrich verbindet sie ohne
//     Leerzeichen mit der nächsten, Anführungszeichen stehen paarweise um die Einheit (`"komm"`, beide Anschläge zählen). Am Textende
//     sind nur Punkt, Fragezeichen, Ausrufezeichen und das Anführungszeichen-Paar möglich. Jedes Satzzeichen kommt mit einer Wahrscheinlichkeit aus seinem Gewicht; liegt ein Fokus-Satzzeichen unter
//     seinem Soll, kommt es sicher (Nachsteuerung). Je Einheit höchstens eines: Drei Fokus-Satzzeichen in kurzen Texten oder
//     bei sehr wenigen Tasten erreichen ihr Soll deshalb nicht alle.
//     Ohne erlaubte Satzzeichen läuft der Schritt nicht (und fragt den Zufallsgenerator nicht), der Text bleibt wie vorher.
//   - Wort-Zeichen (Apostroph, `WORD_ONLY`): steht nur in Wörtern der Liste („geht's“), nie in Übungsgruppen und nie im Satzzeichen-Schritt.
//     Die Nachsteuerung holt es über ein Wort mit ihm; gibt es keins (oder keinen Wortmodus), läuft die Runde ohne.
//   - Großschreibung: Großbuchstaben A–Z gehören zur Lerneinheit ihrer Umschalttaste (`learnKey`), Ä Ö Ü bilden zusammen
//     die Lerneinheit „Große Umlaute“; Wörter und Übungsgruppen bestehen nur aus den übrigen Zeichen. Wie in echtem Text steht ein Großbuchstabe nur
//     am Anfang einer Einheit (nie mitten darin, nie nach einem Bindestrich); die Wortlisten bleiben kleingeschrieben. Vor jeder Einheit
//     entscheidet ein eigener Schritt, ob ihr erster Buchstabe groß ist, wenn dessen Großbuchstabe erlaubt ist: nach einem Punkt, Fragezeichen oder Ausrufezeichen immer,
//     sonst zuerst die Nachsteuerung (liegt die Lerneinheit des Kandidaten unter ihrem Soll, kommt er; liegt eine Fokus-Lerneinheit
//     zurück, wird bevorzugt eine Einheit gewählt, die mit einem ihrer Buchstaben beginnt), sonst der Zufall mit
//     `Gewicht × CAPITAL_UNIT_FACTOR` (im eigenen Auftrag beginnt etwa jede zweite Einheit groß, später etwa jede vierte).
//     Ohne erlaubte Großbuchstaben läuft der Schritt nicht und fragt den Zufallsgenerator nicht, der Text bleibt wie vorher.
//   - Ziffern (`DIGITS`): bilden Zahlengruppen aus zwei bis vier erlaubten Ziffern („4765“) als eigene Einheiten, nie mitten in Buchstaben.
//     Vor jeder Einheit entscheidet der Zahl-Schritt: Liegt eine Fokus-Ziffer unter ihrem Soll, kommt sicher eine Zahlengruppe mit ihr
//     (Nachsteuerung); sonst, wenn keine Fokus-Taste der Buchstaben und Großbuchstaben zurückliegt, eine Zahlengruppe mit der Wahrscheinlichkeit
//     des Gewichtsanteils der Ziffern an allen Buchstaben- und Ziffern-Lerneinheiten. Auf lange Sicht entspricht der Anteil der Ziffern an den
//     Zeichen ihrem Gewichtsanteil (im eigenen Auftrag etwa ein Drittel, später weniger); in kurzen Texten ist es mehr, weil jede neue Ziffer
//     gleich zu Beginn nachgesteuert wird (bei vier neuen Ziffern etwa jede zweite Einheit). Eine Zahl beginnt nie groß (der Großschreibungs-Schritt entfällt), bekommt aber den Satzzeichen-Schritt
//     wie ein Wort, nur ohne Anführungszeichen-Paar (`4765,`, `10.`, `12-13`). Nach „10.“ beginnt die nächste Einheit groß wie nach jedem Punkt.
//     Ohne erlaubte Ziffern (oder ohne Buchstaben) läuft der Schritt nicht und fragt den Zufallsgenerator nicht, der Text bleibt wie vorher.
//   - Sonderzeichen (Alt-Gr-Ebene, `SPECIAL`): kommen wie in echtem Text nur in einer Rolle vor, nie in Wörtern oder Übungsgruppen.
//     `@` verbindet zwei Wörter ohne Leerzeichen (`wort@wort`, nie mit Zahlen, nie zwei hintereinander), `|` steht als eigene Einheit mit
//     Leerzeichen beidseitig zwischen zwei Einheiten (nie am Textende), `{ }` und `[ ]` rahmen die Einheit paarweise (beide Anschläge zählen;
//     nie nach `-` oder `@`, nie um ein `"`-Paar, nie hinter `€`), `\` und `~` stehen als Präfix direkt vor einem Wort oder einer Übungsgruppe
//     (die Einheit beginnt dann nicht groß; nie vor Zahlen, nie nach `-` oder `@`), `€` hängt ohne Leerzeichen an einer Zahl (`15€`; liegt es
//     unter seinem Soll, entsteht dafür eine Zahl). `@`, `|` und die Paare gehören zum Satzzeichen-Schritt (je Einheit höchstens ein Zeichen daraus),
//     die Präfixe zu einem Schritt vor der Einheit, `€` zum Zahl-Schritt. Wie bei Satzzeichen gilt die Nachsteuerung (unter dem Soll: sicher),
//     sonst entscheidet der Zufall nach dem Gewicht. Ohne erlaubte Sonderzeichen laufen die Schritte nicht und fragen den Zufallsgenerator nicht,
//     der Text bleibt wie vorher. `€` ohne erlaubte Ziffern und ein Paar, dem eine Hälfte fehlt, kommen nicht vor.
//   - Wörter: Der Wortschatz darf Wörter mit später gelernten Buchstaben enthalten; verwendet werden nur Wörter aus
//     den erlaubten (bis dahin gelernten) Zeichen (usableWords).

import { charsOf, isCapitalUnit, isShiftKey, learnKey, learnKeys } from './keyboard.ts';
import type { KeyStats } from './keyStats.ts';
import type { PracticeRules } from './course.ts';
import { weakness, type MasteryCriteria } from './mastery.ts';
import { pickWeighted, type Rng } from './rng.ts';

export interface GeneratorInput {
  /** Alle Zeichen, die schon gelernt wurden (inkl. der neuen). Ohne Leerzeichen. */
  allowed: readonly string[];
  /** Neue Zeichen der aktuellen Lektion oder Lerneinheiten (`shift-right` für die Großbuchstaben einer Hand) */
  focus?: readonly string[];
  /** Wortschatz; nur Wörter aus erlaubten Zeichen werden verwendet */
  words?: readonly string[];
  /** Ziel-Länge in Zeichen (inkl. Leerzeichen) */
  length: number;
  rng: Rng;
  /** Schwache Tasten öfter einstreuen (ohne: nur Grundmischung, z. B. im Einsatz) */
  weak?: WeakFocus;
  /** Ganze Sätze (Bennos Tippstunde): jeder besteht nur aus erlaubten Zeichen und Leerzeichen; der Generator streut sie als Einheiten ein, `SENTENCE_SHARE` der Länge */
  sentences?: readonly string[];
}

/** Anteil der Länge, den eingestreute Sätze belegen (Bennos Tippstunde) */
export const SENTENCE_SHARE = 0.3;
/** Um so viele Zeichen darf der letzte Satz über den Anteil hinausgehen */
const SENTENCE_OVERSHOOT = 10;

export interface WeakFocus {
  stats: KeyStats;
  criteria: MasteryCriteria;
  /** Höchstanteil schwacher Tasten am Text (course.practice) */
  maxShare: number;
}

/** Zeichen, die der Generator wie in echtem Text an Wörter hängt statt sie in Übungsgruppen zu mischen */
export const PUNCTUATION: readonly string[] = [',', '.', '-', '?', '!', ':', ';', '"'];
export const isPunctuation = (c: string): boolean => PUNCTUATION.includes(c);
/** Zeichen, die nur innerhalb von Wörtern der Liste stehen (nie in Übungsgruppen, nie im Satzzeichen-Schritt): der Apostroph */
export const WORD_ONLY: readonly string[] = ["'"];
export const isWordOnly = (c: string): boolean => WORD_ONLY.includes(c);
/** Ziffern der Zahlenreihe: bilden Zahlengruppen als eigene Einheiten */
export const DIGITS: readonly string[] = [...'0123456789'];
export const isDigit = (c: string): boolean => DIGITS.includes(c);
/** Zeichen der Alt-Gr-Ebene (Akt 7): `@` und `|` verbinden, `{ [ ] }` rahmen, `\ ~` stehen vor einem Wort, `€` hinter einer Zahl */
export const SPECIAL: readonly string[] = ['@', '€', '{', '[', ']', '}', '\\', '~', '|'];
export const isSpecial = (c: string): boolean => SPECIAL.includes(c);
const CONNECTOR = '@';
const SEPARATOR = '|';
const NUMBER_SUFFIX = '€';
/** Öffnende Klammer → schließende */
const PAIRS: Readonly<Record<string, string>> = { '{': '}', '[': ']' };
const CLOSERS: Readonly<Record<string, string>> = { '}': '{', ']': '[' };
const PREFIXES: readonly string[] = ['\\', '~'];
/** Satzzeichen, nach dem ein Satz endet und die nächste Einheit groß beginnt */
const isSentenceEnd = (c: string): boolean => c === '.' || c === '?' || c === '!';
/** Satzzeichen, die am Textende stehen dürfen (danach folgt keine Einheit mehr); `"` umschließt die letzte Einheit */
const canEndText = (c: string): boolean => isSentenceEnd(c) || c === '"' || c in PAIRS;

const FOCUS_FACTOR = 2;
/** Ab so vielen tippbaren Wörtern mischt der Generator Wörter ein (Wortmodus). */
export const MIN_WORDS_FOR_WORD_MODE = 8;
/** Anteil Wörter, sobald genug Wörter verfügbar sind; der Rest sind Übungsgruppen. */
const WORD_SHARE = 0.7;
/** Jede Fokus-Taste soll mindestens diesen Teil des Anteils erreichen, den ihr Gewicht verspricht. */
const FOCUS_MIN_SHARE = 0.8;
/** Angenommene Länge der nächsten Einheit für das Soll (sie steht vor der Wahl noch nicht fest; Wörter und Gruppen meist 3–5 Zeichen) */
const NEXT_UNIT_CHARS = 4;
/**
 * Wahrscheinlichkeit, dass eine Einheit mit der Lerneinheit groß beginnt, je Gewicht der Lerneinheit (bei etwa 34 Lerneinheiten:
 * neu doppelt gewichtet etwa jede zweite Einheit, sonst etwa jede vierte). Ein Großbuchstabe steht nur am Einheitenanfang und
 * kann deshalb nicht mit dem Gewicht je Zeichen mithalten.
 */
export const CAPITAL_UNIT_FACTOR = 10;
/** Dasselbe für die großen Umlaute Ä Ö Ü: wie ein gewöhnliches Zeichen (Gewicht je Zeichen, eine Einheit hat etwa so viele Zeichen) */
const UMLAUT_UNIT_FACTOR = NEXT_UNIT_CHARS + 1;

/** Wahrscheinlichkeit, dass eine Einheit mit dieser Lerneinheit groß beginnt */
const capitalChance = (unit: string, weights: Map<string, number>): number =>
  Math.min(1, (weights.get(unit) ?? 0) * (isShiftKey(unit) ? CAPITAL_UNIT_FACTOR : UMLAUT_UNIT_FACTOR));

/** Gewicht je Lerneinheit (`learnKeys(allowed)`); die Gewichte ergeben zusammen 1 */
export function charWeights(input: Pick<GeneratorInput, 'allowed' | 'focus' | 'weak'>): Map<string, number> {
  const { weak: w } = input;
  const units = learnKeys(input.allowed);
  const focus = learnKeys(input.focus ?? []);
  const base = units.map((c) => (focus.includes(c) ? FOCUS_FACTOR : 1));
  const baseSum = base.reduce((s, x) => s + x, 0);
  const weak = units.map((c) => (w ? weakness(w.stats[c], w.criteria) : 0));
  const weakSum = weak.reduce((s, x) => s + x, 0);
  // Je mehr Schwächen, desto größer der Anteil – aber höchstens maxShare.
  const share = weakSum === 0 || !w ? 0 : Math.min(w.maxShare, weakSum / units.length + 0.1);

  const result = new Map<string, number>();
  units.forEach((c, i) => {
    const p = (1 - share) * ((base[i] ?? 0) / baseSum) + (weakSum ? share * ((weak[i] ?? 0) / weakSum) : 0);
    result.set(c, p);
  });
  return result;
}

export function usableWords(words: readonly string[], allowed: readonly string[]): string[] {
  const set = new Set(allowed);
  return words.filter((w) => w.length > 0 && [...w].every((c) => set.has(c)));
}

/**
 * Übungsgruppe; mit `must` steht diese Taste an einer zufälligen Stelle sicher darin, mit `first` beginnt die Gruppe damit.
 * Länge `minLen` bis `minLen + 2` (Buchstaben 3–5, Zahlengruppen 2–4).
 */
function drillGroup(chars: string[], weights: number[], rng: Rng, must?: string, first?: string, minLen = 3): string {
  const len = minLen + Math.floor(rng() * 3);
  const at = must === undefined ? -1 : Math.floor(rng() * len);
  let g = '';
  for (let i = 0; i < len; i++) g += i === at ? must : i === 0 && first !== undefined ? first : pickWeighted(chars, weights, rng);
  return g;
}

/** Wie weit die Lerneinheit unter ihrem Soll an Großbuchstaben liegt (positiv = Rückstand); `units` = bisher gebaute Einheiten */
function capitalGap(unit: string, weights: Map<string, number>, counts: Map<string, number>, units: number): number {
  return FOCUS_MIN_SHARE * capitalChance(unit, weights) * (units + 1) - (counts.get(unit) ?? 0);
}

/** Fokus-Taste mit dem größten Rückstand zu ihrem Soll, oder undefined. */
function mostBehind(focus: readonly string[], weights: Map<string, number>, counts: Map<string, number>, built: number, factor: (k: string) => number = () => 1): string | undefined {
  let best: string | undefined;
  let bestGap = 0;
  for (const k of focus) {
    const gap = FOCUS_MIN_SHARE * (weights.get(k) ?? 0) * (built + NEXT_UNIT_CHARS) * factor(k) - (counts.get(k) ?? 0);
    if (gap > bestGap) {
      best = k;
      bestGap = gap;
    }
  }
  return best;
}

/**
 * Faktor auf die Wahrscheinlichkeit eines Satzzeichens je Einheit: das Anführungszeichen-Paar bringt zwei Anschläge mit (halbiert).
 * Doppelpunkt und Semikolon dürfen nicht an die letzte Einheit des Textes; für sie hebt der Faktor auch das Soll der Nachsteuerung
 * (`nextPunctuation`), sonst bleibt das zweite der beiden Fokus-Zeichen eines Auftrags in kurzen Texten knapp unter 80 % seines Gewichts.
 */
function chanceFactor(k: string): number {
  if (k === '"') return 0.5;
  return k === ':' || k === ';' ? 1.25 : 1;
}

/**
 * Zeichen des Satzzeichen-Schritts, das nach der gerade gebauten Einheit folgt, oder undefined. `fits` sind die Kandidaten, die an dieser Stelle möglich sind
 * (Satzzeichen, `@`, `|`, öffnende Klammern); `focus` die Fokus-Kandidaten.
 */
function nextPunctuation(fits: readonly string[], focus: readonly string[], weights: Map<string, number>, counts: Map<string, number>, built: number, rng: Rng): string | undefined {
  const behind = mostBehind(focus.filter((k) => fits.includes(k)), weights, counts, built, (k) => (k === '"' ? 1 : chanceFactor(k)));
  if (behind !== undefined) return behind;
  if (fits.length === 0) return undefined;
  let r = rng();
  for (const k of fits) {
    r -= (weights.get(k) ?? 0) * NEXT_UNIT_CHARS * chanceFactor(k);
    if (r < 0) return k;
  }
  return undefined;
}

/**
 * Mit `sentences`: den Anteil `SENTENCE_SHARE` der Länge füllen ganze Sätze, die zwischen den Einheiten des übrigen Textes stehen
 * (Satz = eine Einheit, nichts daran hängt). Ein Satz, der mehr als `SENTENCE_OVERSHOOT` Zeichen über den Rest des Anteils hinausginge, kommt nicht in Frage;
 * ist die Runde so kurz, dass kein Satz passt, bleibt der Text wie ohne Sätze.
 */
export function generateText(input: GeneratorInput): string {
  const sentences = pickSentences(input);
  if (sentences.length === 0) return generateBase(input);
  const used = sentences.reduce((s, x) => s + x.length + 1, 0);
  const units = generateBase({ ...input, length: Math.max(1, input.length - used) }).split(' ');
  // Sätze an zufälligen, verschiedenen Fugen zwischen den Einheiten (die erste Fuge liegt vor der ersten Einheit)
  const slots = new Map<number, string>();
  for (const s of sentences) {
    if (slots.size > units.length) break;
    let at = Math.floor(input.rng() * (units.length + 1));
    while (slots.has(at)) at = (at + 1) % (units.length + 1);
    slots.set(at, s);
  }
  const out: string[] = [];
  units.forEach((u, i) => out.push(...(slots.has(i) ? [slots.get(i)!] : []), u));
  if (slots.has(units.length)) out.push(slots.get(units.length)!);
  return out.join(' ');
}

/** Die Sätze dieser Runde: zufällig gezogen, bis `SENTENCE_SHARE` der Länge voll ist */
function pickSentences(input: GeneratorInput): string[] {
  const pool = [...new Set(input.sentences ?? [])];
  const picked: string[] = [];
  const target = Math.round(input.length * SENTENCE_SHARE);
  let used = 0;
  for (;;) {
    const room = target - used;
    const fits = pool.filter((s) => !picked.includes(s) && s.length <= room + SENTENCE_OVERSHOOT);
    if (room <= 0 || fits.length === 0) return picked;
    const s = fits[Math.floor(input.rng() * fits.length)]!;
    picked.push(s);
    used += s.length + 1;
  }
}

function generateBase(input: GeneratorInput): string {
  const { allowed, rng, length } = input;
  if (allowed.length === 0) throw new Error('generateText: keine Zeichen');
  const weights = charWeights(input);
  const all = [...weights.keys()];
  const uniform = 1 / all.length;
  // Wörter und Gruppen nur aus Kleinbuchstaben und Co.; Satzzeichen und Großschreibung haben eigene Schritte.
  // Bestünde der Kurs nur aus Satzzeichen (oder Großbuchstaben), gäbe es diese Schritte nicht.
  const plain = all.filter((c) => !isCapitalUnit(c));
  const letters = plain.filter((c) => !isPunctuation(c) && !isWordOnly(c) && !isDigit(c) && !isSpecial(c));
  const digits = letters.length > 0 ? plain.filter(isDigit) : [];
  const digitW = digits.map((c) => weights.get(c) ?? 0);
  const lettersSum = [...letters, ...digits].reduce((s, c) => s + (weights.get(c) ?? 0), 0);
  const digitShare = lettersSum > 0 ? digitW.reduce((s, x) => s + x, 0) / lettersSum : 0;
  const punct = letters.length > 0 ? plain.filter(isPunctuation) : [];
  const specials = letters.length > 0 ? plain.filter(isSpecial) : [];
  const prefixes = specials.filter((k) => PREFIXES.includes(k));
  const euro = digits.length > 0 && specials.includes(NUMBER_SUFFIX);
  // Kandidaten des Satzzeichen-Schritts: Verbinder, Trenner und die öffnenden Klammern ganzer Paare
  const stepSpecials = specials.filter((k) => k === CONNECTOR || k === SEPARATOR || (k in PAIRS && specials.includes(PAIRS[k]!)));
  const capitals = letters.length > 0 ? all.filter(isCapitalUnit) : [];
  const chars = letters.length > 0 ? letters : plain.length > 0 ? plain : [...allowed];
  const charW = chars.map((c) => weights.get(learnKey(c)) ?? 0);
  const allowedSet = new Set(allowed);

  const words = usableWords(input.words ?? [], allowed);
  const wordMode = words.length >= MIN_WORDS_FOR_WORD_MODE;
  // Wörter mit gerade wichtigen Zeichen werden bevorzugt.
  const wordW = words.map((w) => {
    const avg = [...w].reduce((s, c) => s + (weights.get(c) ?? 0), 0) / w.length;
    return (avg / uniform) ** 2;
  });

  const wanted = learnKeys(input.focus ?? []).filter((k) => (weights.get(k) ?? 0) > 0);
  // Ein Wort-Zeichen wird nur nachgesteuert, wenn ein Wort es enthält (sonst läuft die Runde ohne und es verdeckt keine andere Taste)
  const focus = wanted.filter((k) => !punct.includes(k) && !specials.includes(k) && !capitals.includes(k) && !digits.includes(k) && (!isWordOnly(k) || (wordMode && words.some((w) => w.includes(k)))));
  const punctFocus = wanted.filter((k) => punct.includes(k));
  const capitalFocus = wanted.filter((k) => capitals.includes(k));
  const digitFocus = wanted.filter((k) => digits.includes(k));
  const prefixFocus = wanted.filter((k) => prefixes.includes(k));
  const euroFocus = euro ? wanted.filter((k) => k === NUMBER_SUFFIX) : [];
  // Eine Klammer des Paares steuert über die öffnende nach (beide Hälften zählen gleich oft)
  const stepFocus = [...new Set(wanted.map((k) => CLOSERS[k] ?? k).filter((k) => stepSpecials.includes(k)))];
  const counts = new Map<string, number>();
  let built = 0; // gebaute Zeichen ohne Leerzeichen
  let units = 0; // gebaute Einheiten

  let out = '';
  let sep = ''; // vor der nächsten Einheit: Leerzeichen, oder nichts nach einem Bindestrich
  let last = '';

  /** Wort mit `matches`, sonst (oder bei den übrigen Wahrscheinlichkeiten) die Übungsgruppe `drill` */
  const steer = (matches: (w: string) => boolean, drill: () => string): string => {
    const fits = wordMode && rng() < WORD_SHARE ? words.map((w, i) => ({ w, i })).filter(({ w }) => w !== last && matches(w)) : [];
    return fits.length > 0 ? pickWeighted(fits.map((f) => f.w), fits.map((f) => wordW[f.i] ?? 0), rng) : drill();
  };

  let afterSentence = false;
  let needWord = false; // nach `@`: die nächste Einheit ist ein Wort
  while (out.length < length) {
    let unit: string;
    let isNumber = false;
    // Großbuchstaben nur am Anfang des Textes oder nach einem Leerzeichen, nie nach einem Bindestrich
    const canCapital = capitals.length > 0 && (out === '' || sep !== '');
    const laggingUnit = canCapital ? capitalFocus.filter((k) => capitalGap(k, weights, counts, units) > 0).sort((a, b) => capitalGap(b, weights, counts, units) - capitalGap(a, weights, counts, units))[0] : undefined;
    const behind = mostBehind(focus, weights, counts, built);
    const behindDigit = digits.length > 0 && !needWord ? mostBehind(digitFocus, weights, counts, built) : undefined;
    // Liegt `€` unter seinem Soll, entsteht eine Zahl, die es sicher bekommt
    const behindEuro = euro && !needWord && mostBehind(euroFocus, weights, counts, built) !== undefined;
    if (behindDigit !== undefined || behindEuro || (digits.length > 0 && !needWord && behind === undefined && laggingUnit === undefined && rng() < digitShare)) {
      unit = drillGroup(digits, digitW, rng, behindDigit, undefined, 2);
      isNumber = true;
    } else if (behind !== undefined) {
      unit = steer((w) => w.includes(behind), () => drillGroup(chars, charW, rng, isWordOnly(behind) ? undefined : behind));
    } else if (laggingUnit !== undefined) {
      const starts = charsOf(laggingUnit, allowed).map((c) => c.toLowerCase()).filter((c) => chars.includes(c));
      const first = starts.length > 0 ? pickWeighted(starts, starts.map((c) => weights.get(learnKey(c)) ?? 1), rng) : undefined;
      unit = steer((w) => starts.includes(w[0]!), () => drillGroup(chars, charW, rng, undefined, first));
    } else if (wordMode && rng() < WORD_SHARE) {
      unit = pickWeighted(words, wordW, rng);
      if (unit === last && words.length > 1) continue;
    } else {
      unit = drillGroup(chars, charW, rng);
    }
    // Vor einer Einheit nach `-` oder `@` steht nichts (`glued`); davor Präfix `\` oder `~`, nie vor Zahlen
    const glued = out !== '' && sep === '';
    let prefix = '';
    if (prefixes.length > 0 && !isNumber && !glued) {
      const bp = mostBehind(prefixFocus, weights, counts, built);
      if (bp !== undefined) prefix = bp;
      else {
        let r = rng();
        for (const k of prefixes) {
          r -= (weights.get(k) ?? 0) * NEXT_UNIT_CHARS;
          if (r < 0) {
            prefix = k;
            break;
          }
        }
      }
    }
    let piece = unit;
    let suffix = false;
    if (isNumber && euro) {
      const w = weights.get(NUMBER_SUFFIX) ?? 0;
      suffix = mostBehind(euroFocus, weights, counts, built) !== undefined || rng() < Math.min(1, (w * NEXT_UNIT_CHARS) / digitShare);
    }
    if (canCapital && !isNumber && prefix === '') {
      const big = unit[0]!.toUpperCase();
      const bigUnit = big.length === 1 && allowedSet.has(big) ? learnKey(big) : undefined;
      if (bigUnit !== undefined && (afterSentence || (capitalFocus.includes(bigUnit) && capitalGap(bigUnit, weights, counts, units) > 0) || rng() < capitalChance(bigUnit, weights))) {
        piece = big + unit.slice(1);
      }
    }
    piece = prefix + piece + (suffix ? NUMBER_SUFFIX : '');
    out += (out === '' ? '' : sep) + piece;
    sep = ' ';
    afterSentence = false;
    const afterAt = needWord;
    needWord = false;
    last = unit;
    built += piece.length;
    units += 1;
    for (const c of piece) counts.set(learnKey(c), (counts.get(learnKey(c)) ?? 0) + 1);
    if (punct.length === 0 && stepSpecials.length === 0) continue;
    // Endet der Text mit dem Satzzeichen, ist nur der Punkt möglich (der Bindestrich hat sonst nie eine nächste Einheit)
    const final = out.length + 1 >= length;
    // Das Paar steht nicht hinter einem Bindestrich (sonst `abc-"def"`) und nicht hinter `@`; `@` verbindet nur zwei Wörter, `|` braucht eine nächste Einheit
    const quote = !isNumber && !glued;
    const bracket = !glued && !suffix;
    const fits = [...punct, ...stepSpecials].filter((k) => {
      if (final && !canEndText(k)) return false;
      if (k === '"') return quote;
      if (k === '-') return !afterAt && !suffix;
      if (k in PAIRS) return bracket;
      if (k === CONNECTOR) return !isNumber && prefix === '' && !glued;
      if (k === SEPARATOR) return out.length + 2 < length;
      return true;
    });
    const p = nextPunctuation(fits, [...punctFocus, ...stepFocus], weights, counts, built, rng);
    if (p === undefined) continue;
    if (p === '"' || p in PAIRS) {
      // Paar: die gerade angehängte Einheit wird eingerahmt, beide Anschläge zählen
      const close = p === '"' ? '"' : PAIRS[p]!;
      out = `${out.slice(0, out.length - piece.length)}${p}${piece}${close}`;
      built += 2;
      counts.set(p, (counts.get(p) ?? 0) + 1);
      counts.set(close, (counts.get(close) ?? 0) + 1);
      continue;
    }
    if (p === SEPARATOR) {
      out += ` ${p}`;
      built += 1;
      counts.set(p, (counts.get(p) ?? 0) + 1);
      continue;
    }
    out += p;
    built += 1;
    counts.set(p, (counts.get(p) ?? 0) + 1);
    if (p === '-' || p === CONNECTOR) sep = '';
    needWord = p === CONNECTOR;
    afterSentence = isSentenceEnd(p);
  }
  return out;
}

/** Angenommenes Tempo, solange noch keine Übung gemessen ist */
const ASSUMED_APM = 40;

/** Textlänge passend zum Tempo, damit eine Übung etwa gleich lang dauert (Grenzen aus course.practice). */
export function lengthForDuration(apm: number | null, seconds: number, limits: Pick<PracticeRules, 'minTextLength' | 'maxTextLength'>): number {
  const assumed = apm ?? ASSUMED_APM;
  return Math.round(Math.min(limits.maxTextLength, Math.max(limits.minTextLength, (assumed * seconds) / 60)));
}
