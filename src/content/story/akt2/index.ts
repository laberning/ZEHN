// Akt 2 „Obere Reihe“ als ein Bündel: Modul, Beschriftung, Einsatz-Story, Story-Objekte, Haupt-Szenen, Nebenszenen,
// Belohnungen und Fallakte. Im Spiel (ACTS in content/story/acts.ts). Szenen-IDs dieses Akts tragen das Präfix `a2-`. Quelle der Texte: Drehbuch Akt 2 (liegt nicht im Repository).

import type { Module } from '../../../domain/course.ts';
import { WORDS_OBERE_REIHE } from '../../words.de.ts';
import type { ActContent } from '../types.ts';
import { EXAM, LABEL, LESSON_STORY } from './book.ts';
import { CHAT_SCENES } from './chat.ts';
import { FALLAKTE } from './fallakte.ts';
import { OBJECTS } from './objects.ts';
import { REWARDS } from './rewards.ts';
import { SIDE_SCENES } from './side.ts';

const MODULE: Module = {
  id: 'm2',
  title: 'Obere Reihe',
  lessons: [
    { id: 'm2-l1', title: 'Funkpeilung', newKeys: ['e', 'i'] },
    { id: 'm2-l2', title: 'Dachlandung', newKeys: ['r', 'u'] },
    { id: 'm2-l3', title: 'Wetterbericht', newKeys: ['t', 'z'] },
    { id: 'm2-l4', title: 'Alle O', newKeys: ['w', 'o'] },
    { id: 'm2-l5', title: 'Pizza-Patrouille', newKeys: ['q', 'p'] },
    { id: 'm2-l6', title: 'Die Tür', newKeys: ['ü'] },
  ],
  // Schwellen wie in Akt 1; anheben erst nach Testrunden
  mastery: { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 },
  exam: { minAccuracy: 0.92, minApm: 50, durationSec: 60 },
  words: WORDS_OBERE_REIHE,
};

export const AKT2: ActContent = {
  module: MODULE,
  label: LABEL,
  book: { lessons: LESSON_STORY, exam: EXAM },
  chat: CHAT_SCENES,
  side: SIDE_SCENES,
  // der Extra-Fall „Die Taube auf dem Kirchturm“ kommt mit einer eigenen Story
  cases: [],
  caseScenes: [],
  rewards: REWARDS,
  objects: OBJECTS,
  fallakte: FALLAKTE,
  // Prüfprofil: je Auftrag ein getipptes Wort; der Name des Barons ist bekannt (kein revealFrom)
  check: {
    typed: [
      { lessonId: 'm2-l1', word: 'leise' },
      { lessonId: 'm2-l2', word: 'rauf' },
      { lessonId: 'm2-l3', word: 'jetzt' },
      { lessonId: 'm2-l4', word: 'hotel' },
      { lessonId: 'm2-l5', word: 'stopp' },
      { lessonId: 'm2-l6', word: 'tür' },
    ],
    spoilers: ['tippnix', 'otti', 'neffe', 'keks'],
  },
};
