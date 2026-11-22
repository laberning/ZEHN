// Akt 7 „Sonderzeichen“ (Das Finale) als ein Bündel: Modul, Beschriftung, Einsatz-Story, Haupt-Szenen, Story-Objekte und Abschlussakte.
// Letzter Akt der Geschichte: nach seinem Einsatz folgt das Spielende (domain/progress.ts, storyEnd).
// Szenen-IDs dieses Akts tragen das Präfix `a7-`.
// Quelle der Texte: Drehbuch Akt 7 (liegt nicht im Repository).

import type { Module } from '../../../domain/course.ts';
import { WORDS_SONDERZEICHEN } from '../../words.de.ts';
import type { ActContent } from '../types.ts';
import { EXAM, LABEL, LESSON_STORY } from './book.ts';
import { CHAT_SCENES } from './chat.ts';
import { FALLAKTE } from './fallakte.ts';
import { OBJECTS } from './objects.ts';
import { REWARDS } from './rewards.ts';
import { SIDE_SCENES } from './side.ts';

const MODULE: Module = {
  id: 'm7',
  title: 'Sonderzeichen',
  lessons: [
    // Alle neun Zeichen liegen auf der AltGr-Ebene; jedes ist seine eigene Lerneinheit mit eigenem Siegel.
    // Im Übungstext tragen sie feste Rollen (Adresse, Preis, Klammern, Befehlszeichen; `domain/textGenerator.ts`).
    { id: 'm7-l1', title: 'Ottis Preisliste', newKeys: ['@', '€'] },
    { id: 'm7-l2', title: 'Der Schaltplan', newKeys: ['{', '[', ']', '}'] },
    { id: 'm7-l3', title: 'Abschaltfolge', newKeys: ['\\', '~', '|'] },
  ],
  // Schwellen wie in Akt 1 bis 6; anheben erst nach Testrunden
  mastery: { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 },
  // Das Duell: alle bis dahin gelernten Tasten, strikt, höheres Tempo-Ziel (60 Anschläge je Minute)
  exam: { minAccuracy: 0.92, minApm: 60, durationSec: 60, keys: 'learned' },
  words: WORDS_SONDERZEICHEN,
};

export const AKT7: ActContent = {
  module: MODULE,
  label: LABEL,
  book: { lessons: LESSON_STORY, exam: EXAM },
  // einen Extra-Fall hat Akt 7 nicht
  chat: CHAT_SCENES,
  side: SIDE_SCENES,
  cases: [],
  caseScenes: [],
  rewards: REWARDS,
  objects: OBJECTS,
  fallakte: FALLAKTE,
  // Prüfprofil: je Auftrag eine getippte Antwort in der Abschluss-Szene; letzter Akt, also keine Spoiler und kein revealFrom
  check: {
    typed: [
      { lessonId: 'm7-l1', word: 'otti@tippnix' },
      { lessonId: 'm7-l2', word: '{stopp}' },
      { lessonId: 'm7-l3', word: 'Zwei sind ein Anfang.' },
    ],
    spoilers: [],
  },
};
