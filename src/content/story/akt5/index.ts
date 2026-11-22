// Akt 5 „Satzzeichen“ als ein Bündel: Modul, Beschriftung, Einsatz-Story, Haupt-Szenen, Story-Objekte, Nebenszenen, Belohnungen und Fallakte.
// Szenen-IDs dieses Akts tragen das Präfix `a5-`.
// Quelle der Texte: Drehbuch Akt 5 (liegt nicht im Repository).

import type { Module } from '../../../domain/course.ts';
import { WORDS_SATZZEICHEN } from '../../words.de.ts';
import type { ActContent } from '../types.ts';
import { EXAM, LABEL, LESSON_STORY } from './book.ts';
import { CHAT_SCENES } from './chat.ts';
import { FALLAKTE } from './fallakte.ts';
import { OBJECTS } from './objects.ts';
import { REWARDS } from './rewards.ts';
import { SIDE_SCENES } from './side.ts';

const MODULE: Module = {
  id: 'm5',
  title: 'Satzzeichen',
  lessons: [
    // Alle sechs Zeichen liegen auf der Umschalt-Ebene (die Hand, die nicht tippt, hält): ? auf der ß-Taste, ! auf der 1, : auf dem Punkt,
    // ; auf dem Komma, " auf der 2, ' auf der Raute-Taste. Jedes Zeichen ist seine eigene Lerneinheit mit eigenem Siegel.
    { id: 'm5-l1', title: 'Festplakat', newKeys: ['?', '!'] },
    { id: 'm5-l2', title: 'Notmodus', newKeys: [':', ';'] },
    { id: 'm5-l3', title: 'Die Durchsage', newKeys: ['"', "'"] },
  ],
  // Schwellen wie in Akt 1 bis 4; anheben erst nach Testrunden
  mastery: { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 },
  // Der Einsatz nutzt alle bis dahin gelernten Tasten und läuft strikt: Satzzeichen unter Zeitdruck, Fehler müssen korrigiert werden
  exam: { minAccuracy: 0.92, minApm: 50, durationSec: 60, keys: 'learned' },
  words: WORDS_SATZZEICHEN,
};

export const AKT5: ActContent = {
  module: MODULE,
  label: LABEL,
  book: { lessons: LESSON_STORY, exam: EXAM },
  // der Extra-Fall von Akt 5 kommt später als eigene Erweiterung
  chat: CHAT_SCENES,
  side: SIDE_SCENES,
  cases: [],
  caseScenes: [],
  rewards: REWARDS,
  objects: OBJECTS,
  fallakte: FALLAKTE,
  // Die Fallakten der Akte 1 bis 4 erscheinen im HQ zerkratzt, sobald die Szene `from` gesehen ist, bis die Szene `until` gesehen ist
  fallaktenDamage: { from: 'a5-l2-brief', until: 'a5-l2-done' },
  // Prüfprofil: je Auftrag ein getippter Satz in der Abschluss-Szene; der Name des Barons ist bekannt (kein revealFrom);
  // `otti` darf die Fallakte nicht nennen (der Chat darf es: die Deutungs-Wahl „Wie Otti“)
  check: {
    typed: [
      { lessonId: 'm5-l1', word: 'essen, Opa!' },
      { lessonId: 'm5-l2', word: 'Krümel: wach auf' },
      { lessonId: 'm5-l3', word: 'Juna, komm zurück!' },
    ],
    spoilers: ['otti'],
  },
};
