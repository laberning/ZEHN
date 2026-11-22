// Texte und Zahlen für die Anzeige – an einer Stelle, damit alle Bildschirme gleich formulieren.

import { FINGER_LABELS, SHIFT_LEFT, SHIFT_RIGHT, UMLAUTE_GROSS, homeKeyOf, isCapitalUnit, isShiftKey, keystrokeFor } from './keyboard.ts';
import { blockingLatch, sealScore, type LatchName, type Seal } from './mastery.ts';
import type { LessonStatus } from './progress.ts';
import type { RoundReview } from './roundReview.ts';
import type { SessionResult } from './typing.ts';
import { isSpecial } from './textGenerator.ts';

export const percent = (x: number): string => `${Math.round(x * 100)} %`;

/** Abgerundet, damit 0,917 nicht wie „92 %“ aussieht, obwohl die 92 % noch fehlen */
export const percentDown = (x: number): string => `${Math.floor(x * 100 + 1e-9)} %`;

/** „93 % genau · 41 Anschläge pro Minute“ */
export function formatResult(r: Pick<SessionResult, 'accuracy' | 'apm'>): string {
  return `${percent(r.accuracy)} genau · ${Math.round(r.apm)} Anschläge pro Minute`;
}

/** Namen der Satzzeichen, des Apostrophs und der Zeichen der Alt-Gr-Ebene (für Sätze: „Fragezeichen sitzt!“) */
const PUNCT_NAMES: Readonly<Record<string, string>> = {
  ',': 'Komma',
  '.': 'Punkt',
  '-': 'Bindestrich',
  '?': 'Fragezeichen',
  '!': 'Ausrufezeichen',
  ':': 'Doppelpunkt',
  ';': 'Semikolon',
  '"': 'Anführungszeichen',
  "'": 'Apostroph',
  '@': 'At-Zeichen',
  '€': 'Euro-Zeichen',
  '{': 'Geschweifte Klammer auf',
  '}': 'Geschweifte Klammer zu',
  '[': 'Eckige Klammer auf',
  ']': 'Eckige Klammer zu',
  '\\': 'Backslash',
  '~': 'Tilde',
  '|': 'Senkrechter Strich',
};

/** Anzeigename einer Taste (Lerneinheit) für Sätze: Buchstaben groß, Satzzeichen, Leertaste und Umschalttasten ausgeschrieben */
export function keyName(k: string): string {
  if (k in PUNCT_NAMES) return PUNCT_NAMES[k]!;
  if (k === ' ') return 'Leertaste';
  if (k === SHIFT_RIGHT) return 'Umschalt rechts';
  if (k === SHIFT_LEFT) return 'Umschalt links';
  if (k === UMLAUTE_GROSS) return 'Große Umlaute';
  return /^[a-zäöü]$/.test(k) ? k.toUpperCase() : k;
}

/** Beschriftung einer Taste in Listen und Chips („? !“): das Satzzeichen selbst, sonst wie `keyName` */
export const keyLabel = (k: string): string => (k in PUNCT_NAMES ? k : keyName(k));

/** „1,2 s“; ohne Messung „–“ */
export const formatSeconds = (ms: number | null): string => (ms === null ? '–' : `${(ms / 1000).toFixed(1).replace('.', ',')} s`);

/**
 * Datum wie „5.3.2026“ (Format von de-DE, ohne führende Nullen) – bewusst in lokaler Zeit wie dayKey,
 * aber ohne Abhängigkeit von den Sprachdaten der Umgebung.
 */
export function formatDate(t: number): string {
  const d = new Date(t);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

export const keyList = (keys: readonly string[]): string => keys.map(keyLabel).join(' ');

/**
 * Mit welchem Finger geht diese Lerneinheit? „rechter Zeigefinger“, „linker kleiner Finger + rechte Shift-Taste“,
 * „rechter kleiner Finger + Alt Gr“; die Umschalttaste selbst: „rechter kleiner Finger hält, die andere Hand tippt“
 */
export function fingerOf(unit: string): string {
  if (unit === UMLAUTE_GROSS) return `${FINGER_LABELS.rPinky} + linke Shift-Taste`;
  if (isShiftKey(unit)) return `${FINGER_LABELS[unit === SHIFT_RIGHT ? 'rPinky' : 'lPinky']} hält, die andere Hand tippt`;
  const s = keystrokeFor(unit);
  if (!s) return '';
  let t: string = FINGER_LABELS[s.key.finger];
  if (s.shift) t += ` + ${s.shift === 'left' ? 'linke' : 'rechte'} Shift-Taste`;
  if (s.altGr) t += ' + Alt Gr';
  return t;
}

/** „J – rechter Zeigefinger + linke Shift-Taste“, „Fragezeichen – rechter kleiner Finger + linke Shift-Taste“; die Umschalttaste selbst: „Umschalt rechts – rechter kleiner Finger hält, die andere Hand tippt“; die großen Umlaute: „Große Umlaute – rechter kleiner Finger + linke Shift-Taste“; die Zeichen der Alt-Gr-Ebene bleiben beim Zeichen: „@ – linker kleiner Finger + Alt Gr“ */
export function describeKey(char: string): string {
  const finger = fingerOf(char);
  return finger ? `${isSpecial(char) ? char : keyName(char)} – ${finger}` : '';
}

/** Taste mit Finger in Klammern für Ratgeber-Sätze: „K (rechter Mittelfinger)“ */
export const keyWithFinger = (unit: string): string => {
  const finger = fingerOf(unit);
  return finger ? `${keyName(unit)} (${finger})` : keyName(unit);
};

const TIMES = ['', 'einmal', 'zweimal', 'dreimal', 'viermal', 'fünfmal'];
const times = (n: number): string => TIMES[n] || `${n}-mal`;

/** Was der Finger nach dem Griff tut: „hoch und zurück auf F“, „Griff nach oben und zurück auf F“ … */
function backTo(unit: string): string {
  const s = keystrokeFor(unit);
  if (!s) return '';
  const home = keyName(homeKeyOf(s.key.finger));
  if (s.altGr) return `dann zurück auf ${home}`;
  switch (s.key.row) {
    case 0:
      return `hoch und zurück auf ${home}`;
    case 1:
      return `Griff nach oben und zurück auf ${home}`;
    case 2:
      return 'bleib auf der Grundreihe';
    case 3:
      return `Griff nach unten und zurück auf ${home}`;
    case 4:
      return 'locker über der Leertaste bleiben';
  }
}

/** Wer in Krümels Sätzen gemeint ist: „Die Taste K“, „Die 4“, „Die Leertaste“, „Umschalt rechts“, „Die großen Umlaute“ */
function unitSubject(unit: string): string {
  if (isShiftKey(unit)) return keyName(unit);
  if (unit === UMLAUTE_GROSS) return 'Die großen Umlaute';
  if (unit === ' ') return 'Die Leertaste';
  return /^\d$/.test(unit) ? `Die ${unit}` : `Die Taste ${keyName(unit)}`;
}

/** Wie die Lerneinheit geht, für Krümels Sätze: „linker Zeigefinger, hoch und zurück auf F“; Umschalttaste und große Umlaute mit eigenem Halbsatz */
export function unitHow(unit: string): string {
  if (unit === SHIFT_LEFT || unit === SHIFT_RIGHT) {
    const [hold, typing] = unit === SHIFT_LEFT ? ['linker', 'rechte'] : ['rechter', 'linke'];
    return `${hold} kleiner Finger hält, die ${typing} Hand tippt`;
  }
  if (unit === UMLAUTE_GROSS) return `${FINGER_LABELS.rPinky} auf Ä Ö Ü, linke Hand hält`;
  const back = backTo(unit);
  return `${fingerOf(unit)}${back ? `, ${back}` : ''}`;
}

const upperFirst = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);

/** Ein Zeichen mit Artikel im Satz: „das E“, „das 4“, „die Leertaste“, Satzzeichen „die Taste Komma“ */
function theKey(k: string): string {
  if (k === ' ') return 'die Leertaste';
  return k in PUNCT_NAMES ? `die Taste ${keyName(k)}` : `das ${keyName(k)}`;
}

/** Krümels Rundenhinweis: „Die 4 ging dreimal daneben: linker Zeigefinger, hoch und zurück auf F.“ – null ohne Hinweis */
export function roundAdvice(review: RoundReview | null): string | null {
  if (!review) return null;
  if (review.kind === 'spread') return 'Viele kleine Ausrutscher: Finger zurück auf F und J, Hubbel fühlen, dann weiter.';
  if (review.kind === 'word-start') return 'Die Fehler kamen meist am Wortanfang: nach der Leertaste kurz atmen, Finger auf F und J, dann los.';
  if (review.kind === 'haste') return 'Die Fehler kamen meist zu schnell: einen Tick langsamer, dann sitzt jeder Anschlag.';
  if (review.kind === 'same-finger') return 'Zweimal derselbe Finger hintereinander, da rutscht er: kurz absetzen, dann weiter.';
  if (review.kind === 'shift-hand') {
    const unit = keystrokeFor(review.letter)?.shift === 'left' ? SHIFT_LEFT : SHIFT_RIGHT;
    return `Das große ${keyName(review.letter)}: die Umschalttaste hielt die falsche Hand. ${upperFirst(unitHow(unit))}.`;
  }
  const { unit, misses, how, next } = review;
  if (how && !isCapitalUnit(unit)) {
    const kind = {
      up: 'meist eine Reihe zu hoch',
      down: 'meist eine Reihe zu tief',
      hand: 'meist mit der anderen Hand',
      ahead: `meist vorgegriffen: erst ${theKey(unit)}, dann ${theKey(next ?? '')}`,
    }[how];
    const rest = `${unitSubject(unit)} ging ${times(misses)} daneben, ${kind}`;
    return how === 'ahead' ? `${rest}. ${upperFirst(unitHow(unit))}.` : `${rest}: ${unitHow(unit)}.`;
  }
  if (isShiftKey(unit)) return `${unitSubject(unit)} hielt nicht: ${unitHow(unit)}.`;
  const verb = unit === UMLAUTE_GROSS ? 'gingen' : 'ging';
  return `${unitSubject(unit)} ${verb} ${times(misses)} daneben: ${unitHow(unit)}.`;
}

/**
 * Krümels Satz in der Nachbesprechung zu einer alten Taste, die wieder wackelt: „Die Taste K ist abgerutscht: rechter
 * Mittelfinger, bleib auf der Grundreihe. Nächste Runde langsam und genau, dann sitzt sie wieder.“ Ohne Prozentzahlen.
 */
export function slippedAdvice({ before }: { before: Pick<Seal, 'key'> }): string {
  const unit = before.key;
  const verb = unit === UMLAUTE_GROSS ? 'sind' : 'ist';
  return `${unitSubject(unit)} ${verb} abgerutscht: ${unitHow(unit)}. Nächste Runde langsam und genau, dann sitzt sie wieder.`;
}

/** Die Finger-Regel der neuen Tasten: „D – linker Mittelfinger · K – rechter Mittelfinger“ */
export const keyRuleText = (units: readonly string[]): string => units.map(describeKey).filter(Boolean).join(' · ');

const HINTS: Record<LatchName, string> = {
  training: 'braucht einfach noch ein paar Anschläge',
  precision: 'wird noch zu oft vertippt – lieber etwas langsamer und genau',
  tempo: 'kommt noch etwas zögerlich – Finger auf der Grundstellung lassen, dann geht es von allein schneller',
};

/** Krümels Satz nach einer Runde: Was ist als Nächstes zu tun? */
export function lessonAdvice(status: LessonStatus): string {
  if (status.mastered) return 'Auftrag geschafft! Die Tasten sitzen.';
  const open = status.keys.filter((k) => !k.secured).sort((a, b) => sealScore(a) - sealScore(b));
  if (open.length === 0) {
    const n = Math.max(1, status.minExercises - status.exercises);
    return `Die Tasten sitzen schon! Noch ${n === 1 ? 'eine Runde' : `${n} Runden`} zur Bestätigung, dann ist der Auftrag geschafft.`;
  }
  const k = open[0]!;
  return `${keyWithFinger(k.key)} ${HINTS[blockingLatch(k) ?? 'training']}. Noch eine Runde!`;
}

/** Die Regel unter den Siegeln: „Geschafft, wenn alle Siegel offen sind und 3 Übungsrunden gespielt sind: 1 / 3.“ */
export function lessonRuleText(status: Pick<LessonStatus, 'exercises' | 'minExercises'>): string {
  const rounds = status.minExercises > 1 ? ` und ${status.minExercises} Übungsrunden gespielt sind` : '';
  return `Geschafft, wenn alle Siegel offen sind${rounds}: ${Math.min(status.exercises, status.minExercises)} / ${status.minExercises}.`;
}

/** Krümels Tipp der Reihe nach: nach jeder Übung der nächste, so kommt jeder Tipp dran (ohne Zufall) */
export function kruemelTip(tips: readonly string[], exercises: number): string {
  if (tips.length === 0) throw new Error('kruemelTip: keine Tipps');
  return tips[exercises % tips.length]!;
}

/** „noch 3 Treffer“ – so viele richtige Anschläge in Folge fehlen bis zum Haken bei „Genau“ */
export const hitsText = (n: number): string => `noch ${n} Treffer`;

const SEAL_HINTS: Record<LatchName, string> = {
  training: 'braucht noch ein paar Anschläge',
  precision: 'noch etwas genauer',
  tempo: 'noch etwas flüssiger',
};

/** Krümels Hinweis beim Tippen: „L sitzt! S noch etwas genauer.“ */
export function sealAdvice(seals: readonly Seal[]): string {
  const open = seals.filter((s) => !s.secured).sort((a, b) => sealScore(a) - sealScore(b));
  const done = seals.filter((s) => s.secured).map((s) => `${keyName(s.key)} sitzt!`);
  if (open.length === 0) return 'Alle Siegel sind offen! Das sitzt.';
  const weak = open[0]!;
  const blocking = blockingLatch(weak) ?? 'training';
  const hits = blocking === 'precision' ? weak.hitsToOpen : null;
  const hint = hits ? `${SEAL_HINTS.precision} (${hitsText(hits)})` : SEAL_HINTS[blocking];
  return [...done, `${keyWithFinger(weak.key)} ${hint}.`].join(' ');
}

const TODO: Record<LatchName, string> = {
  training: 'mehr üben',
  precision: 'genauer tippen',
  tempo: 'flüssiger tippen',
};

/** Ein Satz „Noch zu tun“ für das HQ: „S: genauer tippen · L: mehr üben“ */
export function lessonTodo(status: LessonStatus): string | null {
  if (status.mastered) return null;
  const open = status.keys.filter((k) => !k.secured);
  if (open.length === 0) {
    const n = Math.max(1, status.minExercises - status.exercises);
    return n === 1 ? 'Noch eine Übungsrunde' : `Noch ${n} Übungsrunden`;
  }
  return open.map((k) => `${keyWithFinger(k.key)}: ${TODO[blockingLatch(k) ?? 'training']}`).join(' · ');
}
