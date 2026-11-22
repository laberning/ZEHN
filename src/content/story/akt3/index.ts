// Akt 3 „Untere Reihe“ als ein Bündel: Modul, Beschriftung, Einsatz-Story, Story-Objekte, Haupt-Szenen, Nebenszenen, Extra-Fall, Belohnungen und Fallakte.
// Szenen-IDs dieses Akts tragen das Präfix `a3-`. Quelle der Texte: Drehbuch Akt 3 (liegt nicht im Repository).

import type { Module } from '../../../domain/course.ts';
import { WORDS_UNTERE_REIHE } from '../../words.de.ts';
import type { ActContent } from '../types.ts';
import { EXAM, LABEL, LESSON_STORY } from './book.ts';
import { CASE_SCENES, CASES } from './cases.ts';
import { CHAT_SCENES } from './chat.ts';
import { FALLAKTE } from './fallakte.ts';
import { OBJECTS } from './objects.ts';
import { REWARDS } from './rewards.ts';
import { SIDE_SCENES } from './side.ts';

const MODULE: Module = {
  id: 'm3',
  title: 'Untere Reihe',
  lessons: [
    { id: 'm3-l1', title: 'Nachtzug', newKeys: ['n', 'm'] },
    { id: 'm3-l2', title: 'Codekarte', newKeys: ['c', ','] },
    { id: 'm3-l3', title: 'Versteck', newKeys: ['v', '.'] },
    { id: 'm3-l4', title: 'Bennos Akte', newKeys: ['b', '-'] },
    { id: 'm3-l5', title: 'Die Keksbox', newKeys: ['x', 'y'] },
  ],
  // Schwellen wie in Akt 1 und 2; anheben erst nach Testrunden
  mastery: { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 },
  // Der Einsatz nutzt alle bis dahin gelernten Tasten (aus den Tasten des Moduls allein ergäbe er kaum Wörter) und läuft im Fluss-Modus:
  // Fehler leuchten, man tippt weiter (Flow-Chip)
  exam: { minAccuracy: 0.92, minApm: 50, durationSec: 60, keys: 'learned', mode: 'flow' },
  words: WORDS_UNTERE_REIHE,
};

export const AKT3: ActContent = {
  module: MODULE,
  label: LABEL,
  book: { lessons: LESSON_STORY, exam: EXAM },
  chat: CHAT_SCENES,
  side: SIDE_SCENES,
  cases: CASES,
  caseScenes: CASE_SCENES,
  rewards: REWARDS,
  objects: OBJECTS,
  fallakte: FALLAKTE,
  // Prüfprofil: je Auftrag ein getipptes Wort (komm im Chat `juna`); der Name des Barons ist bekannt (kein revealFrom);
  // `keks` fällt als Spoiler weg: in Akt 3 gelöst
  check: {
    typed: [
      { lessonId: 'm3-l1', word: 'komm' },
      { lessonId: 'm3-l2', word: 'code' },
      { lessonId: 'm3-l3', word: 'vanille' },
      { lessonId: 'm3-l4', word: 'benno' },
      { lessonId: 'm3-l5', word: 'box' },
    ],
    spoilers: ['tippnix', 'otti', 'neffe'],
  },
};
