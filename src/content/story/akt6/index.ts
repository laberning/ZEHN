// Akt 6 „Zahlen“ als ein Bündel: Modul, Beschriftung, Einsatz-Story, Haupt-Szenen, Story-Objekte, Nebenszenen, Belohnungen und Fallakte.
// Szenen-IDs dieses Akts tragen das Präfix `a6-`.
// Quelle der Texte: Drehbuch Akt 6 (liegt nicht im Repository).

import type { Module } from '../../../domain/course.ts';
import { WORDS_ZAHLEN } from '../../words.de.ts';
import type { ActContent } from '../types.ts';
import { EXAM, LABEL, LESSON_STORY } from './book.ts';
import { CHAT_SCENES } from './chat.ts';
import { FALLAKTE } from './fallakte.ts';
import { OBJECTS } from './objects.ts';
import { REWARDS } from './rewards.ts';
import { SIDE_SCENES } from './side.ts';

const MODULE: Module = {
  id: 'm6',
  title: 'Zahlen',
  lessons: [
    // Die Zahlenreihe über den Buchstaben, ohne Umschalttaste, nach Fingern: der Finger der Spalte greift hoch und kehrt auf die Grundreihe zurück.
    // Jede Ziffer ist ihre eigene Lerneinheit mit eigenem Siegel; im Übungstext bilden Ziffern eigene Zahlengruppen.
    { id: 'm6-l1', title: 'Koordinaten', newKeys: ['4', '5', '6', '7'] },
    { id: 'm6-l2', title: 'Das leere Lager', newKeys: ['3', '8'] },
    { id: 'm6-l3', title: 'Die Spurenwand', newKeys: ['1', '0'] },
    { id: 'm6-l4', title: 'Das Buchstabenkonto', newKeys: ['2', '9'] },
  ],
  // Schwellen wie in Akt 1 bis 5; anheben erst nach Testrunden
  mastery: { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 },
  // Der Einsatz nutzt alle bis dahin gelernten Tasten und läuft strikt: Zahlen unter Zeitdruck, Fehler müssen korrigiert werden
  exam: { minAccuracy: 0.92, minApm: 50, durationSec: 60, keys: 'learned' },
  words: WORDS_ZAHLEN,
};

export const AKT6: ActContent = {
  module: MODULE,
  label: LABEL,
  book: { lessons: LESSON_STORY, exam: EXAM },
  // einen Extra-Fall hat Akt 6 beim Bau nicht
  chat: CHAT_SCENES,
  side: SIDE_SCENES,
  cases: [],
  caseScenes: [],
  rewards: REWARDS,
  objects: OBJECTS,
  fallakte: FALLAKTE,
  // Prüfprofil: je Auftrag ein getippter Code in der Abschluss-Szene; der Name des Barons ist bekannt (kein revealFrom);
  // die Fallakte verrät nichts aus Akt 7
  check: {
    typed: [
      { lessonId: 'm6-l1', word: '4765' },
      { lessonId: 'm6-l2', word: '3867' },
      { lessonId: 'm6-l3', word: '10' },
      { lessonId: 'm6-l4', word: '1234' },
    ],
    spoilers: ['duell', 'preisliste', 'zentrale'],
  },
};
