// Akt 4 „Großschreibung“ als ein Bündel: Modul, Beschriftung, Einsatz-Story, Story-Objekte, Haupt-Szenen, Nebenszenen, Belohnungen und Fallakte.
// Szenen-IDs dieses Akts tragen das Präfix `a4-`.
// Quelle der Texte: Drehbuch Akt 4 (liegt nicht im Repository).

import type { Module } from '../../../domain/course.ts';
import { WORDS_GROSSSCHREIBUNG } from '../../words.de.ts';
import type { ActContent } from '../types.ts';
import { CHAT_SCENES } from './chat.ts';
import { EXAM, LABEL, LESSON_STORY } from './book.ts';
import { FALLAKTE } from './fallakte.ts';
import { OBJECTS } from './objects.ts';
import { REWARDS } from './rewards.ts';
import { SIDE_SCENES } from './side.ts';

const MODULE: Module = {
  id: 'm4',
  title: 'Großschreibung',
  lessons: [
    // Die Zeichen sind die Großbuchstaben: Q W E R T A S D F G Y X C V B (linke Hand tippt, die rechte Umschalttaste hält), Z U I O P H J K L N M
    // (rechte Hand tippt, die linke hält), ß, dann Ä Ö Ü (die großen Umlaute, ein gemeinsames Siegel)
    { id: 'm4-l1', title: 'Kleinmachung', newKeys: [...'QWERTASDFGYXCVB'] },
    { id: 'm4-l2', title: 'Der Plan', newKeys: [...'ZUIOPHJKLNM'] },
    { id: 'm4-l3', title: 'Backspace-Straße', newKeys: ['ß'] },
    { id: 'm4-l4', title: 'Die Turmtür', newKeys: [...'ÄÖÜ'] },
  ],
  // Schwellen wie in Akt 1 bis 3; anheben erst nach Testrunden
  mastery: { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 },
  // Der Einsatz nutzt alle bis dahin gelernten Tasten und läuft strikt: Großschreibung unter Zeitdruck, Fehler müssen korrigiert werden
  exam: { minAccuracy: 0.92, minApm: 50, durationSec: 60, keys: 'learned' },
  words: WORDS_GROSSSCHREIBUNG,
};

export const AKT4: ActContent = {
  module: MODULE,
  label: LABEL,
  book: { lessons: LESSON_STORY, exam: EXAM },
  chat: CHAT_SCENES,
  side: SIDE_SCENES,
  // der Extra-Fall von Akt 4 kommt später als eigene Erweiterung
  cases: [],
  caseScenes: [],
  rewards: REWARDS,
  objects: OBJECTS,
  fallakte: FALLAKTE,
  // Prüfprofil: je Auftrag ein getipptes Wort (Turm, Juna, Straße, Benno, mit Großbuchstaben); der Name des Barons ist bekannt
  // (kein revealFrom); `tippnix` und `neffe` fallen als Spoiler weg: in Akt 4 gelöst
  check: {
    typed: [
      { lessonId: 'm4-l1', word: 'Turm' },
      { lessonId: 'm4-l2', word: 'Juna' },
      { lessonId: 'm4-l3', word: 'Straße' },
      { lessonId: 'm4-l4', word: 'Benno' },
    ],
    spoilers: ['otti'],
  },
};
