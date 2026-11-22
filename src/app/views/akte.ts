// Ansicht der Akte: Wärmekarte, Tempo, Hinweistext und Rohwerte für den Elternbericht.

import { findLesson, keysUpTo, lessonOrder } from '../../domain/course.ts';
import { SHIFT_LEFT, SHIFT_RIGHT, UMLAUTE_GROSS, learnKeys } from '../../domain/keyboard.ts';
import { dominantHow } from '../../domain/movement.ts';
import { accuracyHeat, heatScale, shakyKeys, type HeatScale } from '../../domain/mastery.ts';
import type { Profile } from '../../domain/profile.ts';
import { APM_WINDOW, averageApm, activeLessonId, begunLessonId, averageAccuracy, masteredKeys, scoredHistory } from '../../domain/progress.ts';
import type { GameRules } from '../../domain/rules.ts';
import { movementText, shakyKeysText } from '../../content/texts/akte.ts';

/** Wie viele Übungen die Tempokurve zeigt */
const TEMPO_POINTS = 30;

/** Rohwerte für den Elternbericht; die Sätze baut `parentTexts` (content/texts/akte.ts) */
export interface ParentView {
  /** Name des Moduls, in dem das Kind gerade steht (Grundreihe) */
  moduleTitle: string;
  lessonsDone: number;
  lessonsTotal: number;
  /** Neue Tasten des aktuellen Auftrags; null, wenn alle Aufträge geschafft sind */
  currentKeys: string[] | null;
  /** Tasten aus geschafften Aufträgen */
  safeKeys: string[];
  /** Agententage insgesamt */
  days: number;
  /** Übungen in den letzten 7 Tagen (aus dem Verlauf, der auf 500 Einträge begrenzt ist – deshalb kein „seit Beginn“) */
  exercisesLastWeek: number;
  /** Genauigkeit der letzten Übungen (0..1) */
  accuracy: number | null;
}

export interface AkteView {
  /** Alle Tasten bis zum aktuellen Auftrag */
  keys: string[];
  /** Wärmekarte: Taste → 0..1 nach Genauigkeit, null = misst noch; alle Tasten bis zum zuletzt begonnenen Auftrag */
  heat: Record<string, number | null>;
  /** Genauigkeiten an den Marken der Farbskala */
  heatScale: HeatScale;
  /** Bis zu drei gemessene Tasten unter der Präzisionsschwelle, die wackligste zuerst */
  shakyKeys: { key: string; accuracy: number }[];
  /** „Übe besonders: …“ oder ein Lob, sobald eine Taste gemessen ist; sonst null */
  shakyText: string | null;
  /** Je Wackeltaste (und Umschalt-Einheit) mit klarem Muster ein Satz zur häufigsten Bewegung, höchstens drei, Wackeltasten zuerst */
  movementTexts: string[];
  /** Tempo der letzten Übungen */
  tempo: number[];
  avgApm: number | null;
  /** Über so viele Übungen wird der Schnitt gebildet */
  avgWindow: number;
  exercises: number;
  parent: ParentView;
}

/** Höchstens so viele Sätze zur Bewegung */
const MOVEMENT_MAX = 3;
/** Umschalt-Einheiten: Wackeltasten sind es nie (die Wärmekarte färbt nur Tasten), die falsche Umschalt-Hand zeigt der Satz hier */
const SHIFT_UNITS = [SHIFT_LEFT, SHIFT_RIGHT, UMLAUTE_GROSS];

const WEEK_MS = 7 * 24 * 3600 * 1000;

export function akteView(p: Profile, rules: GameRules, now: number): AkteView {
  const { course } = rules;
  // wie im HQ: steht der Einsatz an, ist noch kein Auftrag des nächsten Akts dran (seine Tasten zählen noch nicht)
  const current = activeLessonId(p, course);
  const begun = begunLessonId(p, course);
  const last = current ?? begun ?? lessonOrder(course).at(-1)!;
  // Die Skala hängt am Modul des aktuellen Auftrags (in Akt 1 ist sie überall gleich)
  const { module } = findLesson(course, begun ?? last);
  const heatKeys = begun === null ? [] : keysUpTo(course, begun).filter((k) => k !== ' ' && k === k.toLowerCase()); // die Leertaste bleibt ohne Färbung; Großbuchstaben zählen für die Umschalttaste, nicht für die Taste
  const heat = Object.fromEntries(heatKeys.map((k) => [k, accuracyHeat(p.stats[k], module.mastery)]));
  const shaky = shakyKeys(p.stats, heatKeys, module.mastery);
  const movementTexts = [...shaky.map((k) => k.key), ...SHIFT_UNITS].flatMap((unit) => {
    const how = dominantHow(p.stats[unit]);
    const text = how ? movementText(unit, how) : null;
    return text ? [text] : [];
  });
  return {
    keys: keysUpTo(course, last),
    heat,
    heatScale: heatScale(module.mastery),
    shakyKeys: shaky,
    shakyText: shakyKeysText(shaky, Object.values(heat).some((v) => v !== null)),
    movementTexts: movementTexts.slice(0, MOVEMENT_MAX),
    tempo: scoredHistory(p).slice(-TEMPO_POINTS).map((e) => e.apm),
    avgApm: averageApm(p),
    avgWindow: APM_WINDOW,
    exercises: p.history.length,
    parent: {
      moduleTitle: module.title,
      lessonsDone: module.lessons.filter((l) => p.lessons[l.id]?.mastered).length,
      lessonsTotal: module.lessons.length,
      currentKeys: current === null ? null : learnKeys(findLesson(course, current).lesson.newKeys).filter((k) => k !== ' '),
      safeKeys: learnKeys(masteredKeys(p, course)).filter((k) => k !== ' '),
      days: p.days.count,
      exercisesLastWeek: p.history.filter((e) => e.t > now - WEEK_MS).length,
      accuracy: averageAccuracy(p),
    },
  };
}
