// Agentenakte: Elternbericht, Wärmekarte, wacklige Tasten.

import { fingerOf, keyName, keyWithFinger, percentDown, unitHow } from '../../domain/format.ts';
import { UMLAUTE_GROSS, isCapitalUnit } from '../../domain/keyboard.ts';
import type { HowKind } from '../../domain/movement.ts';

/** Taste mit zu wenig Anschlägen für eine Messung (Wärmekarte, Tastensiegel) */
export const MEASURING_TEXT = 'misst noch';

/** Wärmekarte der Agentenakte */
export const HEAT_TEXTS = {
  intro: 'Wie genau sitzt jede Taste? Gezählt wird der erste Anschlag.',
  measuring: MEASURING_TEXT,
  unlearned: 'noch nicht gelernt',
} as const;

/** Elternbericht in der Akte: einfache Sätze ohne Spielbegriffe, nur Zahlen, die stimmen */
export function parentTexts(v: {
  moduleTitle: string;
  lessonsDone: number;
  lessonsTotal: number;
  currentKeys: readonly string[] | null;
  safeKeys: readonly string[];
  days: number;
  exercisesLastWeek: number;
  accuracy: number | null;
  apm: number | null;
  shaky: readonly { key: string }[];
}): { progress: string; keys: string; practice: string; quality: string; attention: string } {
  const names = (keys: readonly string[]) => keys.map(keyName).join(' ');
  const current = v.currentKeys && v.currentKeys.length > 0 ? v.currentKeys : null;
  // Der Modultitel steht in Anführungszeichen – so passt der Satz zu jedem Titel, nicht nur zu „Grundreihe“
  const done = `${v.lessonsDone} von ${v.lessonsTotal} Lektionen im Teil „${v.moduleTitle}“ geschafft.`;
  const week = v.exercisesLastWeek === 0 ? 'In den letzten 7 Tagen wurde nicht geübt.' : `In den letzten 7 Tagen: ${v.exercisesLastWeek} ${v.exercisesLastWeek === 1 ? 'Runde' : 'Runden'}.`;
  return {
    progress: current ? `${done} Aktuell: ${current.map(keyName).join(' und ')}.` : done,
    keys: [
      v.safeKeys.length > 0 ? `Sicher: ${names(v.safeKeys)}.` : 'Noch keine Taste sitzt ganz sicher.',
      current ? `Noch im Training: ${names(current)}.` : null,
    ]
      .filter(Boolean)
      .join(' '),
    practice: v.days === 0 ? 'Noch nicht geübt.' : `An ${v.days} ${v.days === 1 ? 'Tag' : 'Tagen'} geübt. ${week}`,
    quality: v.accuracy === null || v.apm === null ? 'Noch keine gewertete Übung.' : `Genauigkeit zuletzt ${percentDown(v.accuracy)}, Tempo ${Math.round(v.apm)} Anschläge pro Minute.`,
    attention:
      v.shaky.length > 0
        ? `${v.shaky.map((k) => keyWithFinger(k.key)).join(', ')} ${v.shaky.length === 1 ? 'wird' : 'werden'} noch oft vertippt. Langsam und genau ist besser als schnell.`
        : 'Im Moment fällt keine Taste besonders auf.',
  };
}

/** „Übe besonders: K (84 %), Ö (88 %)“; ohne wacklige Tasten ein Lob, solange mindestens eine Taste gemessen ist */
export function shakyKeysText(shaky: readonly { key: string; accuracy: number }[], anyMeasured: boolean): string | null {
  if (shaky.length > 0) return `Übe besonders: ${shaky.map((k) => `${keyName(k.key)} (${[fingerOf(k.key), percentDown(k.accuracy)].filter(Boolean).join(', ')})`).join(', ')}`;
  return anyMeasured ? 'Alle gemessenen Tasten sitzen. Stark!' : null;
}

/** Längster Satz zur häufigsten Bewegung einer Taste (Zeichen) */
export const MOVEMENT_TEXT_MAX = 100;

/**
 * Ein Satz zur häufigsten Bewegung einer Taste: „Beim K greifst du meist eine Reihe zu hoch: rechter Mittelfinger, bleib auf der Grundreihe.“
 * Nur der Finger und der Rückweg (Regel 13), keine Zahlen, kein Vergleich. Passt der Satz nicht in `MOVEMENT_TEXT_MAX`, steht nur der Finger, sonst nur die Bewegung.
 * Die falsche Umschalt-Hand zeigt der Satz an der Umschalttaste; null, wenn Art und Einheit nicht zusammenpassen.
 */
export function movementText(unit: string, how: HowKind): string | null {
  if (isCapitalUnit(unit) !== (how === 'shift')) return null;
  const head = {
    up: `Beim ${keyName(unit)} greifst du meist eine Reihe zu hoch`,
    down: `Beim ${keyName(unit)} greifst du meist eine Reihe zu tief`,
    hand: `Beim ${keyName(unit)} nimmst du meist die andere Hand`,
    ahead: `Beim ${keyName(unit)} greifst du meist zu früh vor`,
    shift: unit === UMLAUTE_GROSS ? 'Bei den großen Umlauten hält meist die falsche Hand' : 'Beim Großschreiben hält meist die falsche Hand',
  }[how];
  const full = `${head}: ${unitHow(unit)}.`;
  if (full.length <= MOVEMENT_TEXT_MAX) return full;
  const short = `${head}: ${fingerOf(unit)}.`;
  return short.length <= MOVEMENT_TEXT_MAX ? short : `${head}.`;
}
