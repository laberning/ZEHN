// Die Akte des Spiels als Bündel (ActContent, story/types.ts). Aus den Listen werden Kurs, Szenen, Objekte und Extra-Fälle abgeleitet.
// Neuer Akt: Ordner content/story/aktN/ mit einem Bündel anlegen, zuerst in STAGED_ACTS eintragen (vorbereitet, im Spiel unsichtbar,
// aber von den Inhaltstests geprüft), zum Schluss nach ACTS verschieben. Szenen-IDs neuer Akte tragen das Präfix `aN-` (ab Akt 2 `a2-`).
// Bildschirme und die Anwendung importieren diese Datei nicht (Inhaltsregel, architecture.test.ts): app/rules.ts leitet mit
// storyOf das Story-Bündel ab, alle anderen lesen es über den Store (`s.story`).

import type { ExtraCase } from '../../domain/cases.ts';
import { ITEMS } from '../items.ts';
import type { StoryContent } from '../../domain/storyContent.ts';
import type { StoryScene } from '../../domain/scenes.ts';
import type { StoryObject } from '../../domain/storyObject.ts';
import { AKT1 } from './akt1/index.ts';
import { AKT2 } from './akt2/index.ts';
import { AKT3 } from './akt3/index.ts';
import { AKT4 } from './akt4/index.ts';
import { AKT5 } from './akt5/index.ts';
import { AKT6 } from './akt6/index.ts';
import { AKT7 } from './akt7/index.ts';
import { TRAINING } from './training/index.ts';
import { REWARD_SCENES } from './rewardScenes.ts';
import { STORY_VERSION } from './scenes.ts';
import type { ActContent } from './types.ts';

/** Akte, die im Spiel sind (Reihenfolge = Reihenfolge der Module im Kurs) */
export const ACTS: readonly ActContent[] = [AKT1, AKT2, AKT3, AKT4, AKT5, AKT6, AKT7];

/** Vorbereitete Akte: noch nicht im Spiel, die Inhaltstests prüfen sie schon */
export const STAGED_ACTS: readonly ActContent[] = [];

/**
 * Alle Szenen. Die Reihenfolge entscheidet bei `gift` über den Vorrang (höchstens ein Geschenk je Durchgang, das erste fällige):
 * erst die Szenen der Akte samt ihren Geschenken der Geschichte, dann das Training (Tippstunden-Szenen und Fälle der Woche,
 * ohne Geschenke), dann die Rang-, Paket- und Gadget-Übergaben.
 */
const scenesOf = (acts: readonly ActContent[]): StoryScene[] => [
  ...acts.flatMap((a) => [...a.chat, ...a.side, ...a.rewards, ...a.caseScenes]),
  ...TRAINING.scenes,
  ...TRAINING.caseScenes,
  ...REWARD_SCENES,
];
export const SCENES: readonly StoryScene[] = scenesOf(ACTS);

export const STORY_OBJECTS: readonly StoryObject[] = ACTS.flatMap((a) => a.objects);

export const EXTRA_CASES: readonly ExtraCase[] = [...ACTS.flatMap((a) => a.cases), ...TRAINING.cases];

/**
 * Das Story-Bündel aus Akten: Szenen, Objekte, Fälle, Dinge (nur die, deren Quell-Szene dabei ist – Dinge vorbereiteter Akte
 * bleiben unsichtbar, bis ihr Akt eingehängt wird), Bilderbuch, Beschriftungen und Fallakten je Modul. Das Spiel nimmt `ACTS`
 * (app/rules.ts), Tests von Bildschirmen vorbereiteter Akte `ALL_ACTS` (src/test/content.ts).
 */
export function storyOf(acts: readonly ActContent[]): StoryContent {
  const scenes = scenesOf(acts);
  const byModule = <T>(pick: (a: ActContent) => T): Record<string, T> => Object.fromEntries(acts.map((a) => [a.module.id, pick(a)]));
  return {
    version: STORY_VERSION,
    scenes,
    objects: acts.flatMap((a) => a.objects),
    items: ITEMS.filter(({ source }) => !('scene' in source) || scenes.some((s) => s.id === source.scene)),
    cases: [...acts.flatMap((a) => a.cases), ...TRAINING.cases],
    book: {
      prolog: acts[0]?.book.prolog ?? [],
      lessons: Object.assign({}, ...acts.map((a) => a.book.lessons)),
      exams: byModule((a) => a.book.exam),
    },
    labels: byModule((a) => a.label),
    fallakten: byModule((a) => a.fallakte),
    fallaktenDamage: acts.flatMap((a) => (a.fallaktenDamage ? [a.fallaktenDamage] : [])),
  };
}
