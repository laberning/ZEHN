// Akt 1 „Grundreihe“ als ein Bündel: Modul, Beschriftung, Bilderbuch, Chat-Szenen, Nebenszenen, Extra-Fälle,
// Story-Objekte, Einsatz-Story, Fallakte und die Belohnungen der Geschichte. Eingetragen wird es in content/story/acts.ts.

import type { Module } from '../../../domain/course.ts';
import { WORDS_GRUNDREIHE } from '../../words.de.ts';
import type { ActContent } from '../types.ts';
import { EXAM, LABEL, LESSON_STORY, PROLOG } from './book.ts';
import { CASES, CASE_SCENES } from './cases.ts';
import { CHAT_SCENES } from './chat.ts';
import { FALLAKTE } from './fallakte.ts';
import { OBJECTS } from './objects.ts';
import { REWARDS } from './rewards.ts';
import { SIDE_SCENES } from './side.ts';

const MODULE: Module = {
  id: 'm1',
  title: 'Grundreihe',
  lessons: [
    { id: 'm1-l1', title: 'Kalibrierung', newKeys: ['f', 'j'] },
    { id: 'm1-l2', title: 'Grundausbildung', newKeys: ['d', 'k'] },
    { id: 'm1-l3', title: 'Entschlüsselung', newKeys: ['s', 'l'] },
    { id: 'm1-l4', title: 'Botschaft', newKeys: ['a', 'ö'] },
    { id: 'm1-l5', title: 'Spurensuche', newKeys: ['g', 'h'] },
    { id: 'm1-l6', title: 'Netzsicherung', newKeys: ['ä'] },
  ],
  // Nach Testrunde 1 gesenkt: Anfänger tippen anfangs oft nur 30–40 Anschläge pro Minute.
  mastery: { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 },
  exam: { minAccuracy: 0.92, minApm: 50, durationSec: 60 },
  words: WORDS_GRUNDREIHE,
};

export const AKT1: ActContent = {
  module: MODULE,
  label: LABEL,
  book: { prolog: PROLOG, lessons: LESSON_STORY, exam: EXAM },
  chat: CHAT_SCENES,
  side: SIDE_SCENES,
  cases: CASES,
  caseScenes: CASE_SCENES,
  rewards: REWARDS,
  objects: OBJECTS,
  fallakte: FALLAKTE,
  // Prüfprofil für die Inhaltstests: zwei getippte Antworten, der Name des Barons ab Abschluss von Auftrag 4
  check: {
    typed: [
      { lessonId: 'm1-l4', word: 'ja' },
      { lessonId: 'm1-l6', word: 'salsa' },
    ],
    revealFrom: 'm1-l4',
    spoilers: ['tippnix', 'otti'],
  },
};
