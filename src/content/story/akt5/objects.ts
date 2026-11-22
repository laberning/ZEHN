// Story-Objekte von Akt 5 „Satzzeichen“: ein Gegenstand je Auftrag, der mit dem Fortschritt Stufe für Stufe sichtbar wird.
// Alle drei sind Texte (lines), ohne Bilder: das Festplakat, die Fallakten des HQ und das Durchsage-Skript.
// Quelle der Texte: Drehbuch Akt 5 (liegt nicht im Repository).

import type { StoryObject } from '../../../domain/storyObject.ts';

/** Das Plakat, Zeile für Zeile mit seinem Zeichen */
const PLAKAT = ['STADTFEST!', 'KOMMT ALLE!', 'WANN?', 'SAMSTAG! AUF DEM MARKT!'];

/** Das Skript für die Stadtlautsprecher, Zeile für Zeile mit allen Zeichen */
const SKRIPT = ['„Liebe Qwertzer“, sagt Hupf.', "„Wie geht's, Bad Qwertz?“", '„Das Fest ist gerettet!“', '„Danke“, sagt sie. „Allen.“'];

/** Die vier Akten im Regal, erst zerkratzt (ein Kratzer je Zeile), dann eine nach der anderen lesbar */
const AKTEN = ['Fallakte Akt 1: lesbar', 'Fallakte Akt 2: lesbar', 'Fallakte Akt 3: lesbar', 'Fallakte Akt 4: lesbar'];

export const OBJECTS: StoryObject[] = [
  {
    lessonId: 'm5-l1',
    title: 'Das Festplakat',
    kind: 'lines',
    // Hupfs Plakat am Markt: erst ohne ein Zeichen, dann holt jede Stufe eine Zeile zurück; ganz unten das Kleingedruckte (`finePrint`)
    stages: [
      { at: 0, lines: ['STADTFEST', 'KOMMT ALLE', 'WANN', 'SAMSTAG AUF DEM MARKT'] },
      { at: 0.25, lines: PLAKAT.slice(0, 1) },
      { at: 0.5, lines: PLAKAT.slice(0, 2) },
      { at: 0.75, lines: PLAKAT.slice(0, 3) },
      { at: 1, lines: [...PLAKAT, 'Komm wir essen Opa'], finePrint: 1 },
    ],
  },
  {
    lessonId: 'm5-l2',
    title: 'Die Fallakten des HQ',
    kind: 'lines',
    // Kratzer als Textzeichen (kein Emoji), dann eine Akte nach der anderen; ganz zuletzt der Stempel
    stages: [
      { at: 0, lines: ['/////////////', '//////////////', '////////////', '///////////////'] },
      { at: 0.25, lines: AKTEN.slice(0, 1) },
      { at: 0.5, lines: AKTEN.slice(0, 2) },
      { at: 0.75, lines: AKTEN.slice(0, 3) },
      { at: 1, lines: [...AKTEN, 'WIEDERHERGESTELLT'] },
    ],
  },
  {
    lessonId: 'm5-l3',
    title: 'Das Durchsage-Skript',
    kind: 'lines',
    // Hupfs Skript für die Stadtlautsprecher: erst ohne Anführungszeichen, Apostroph und Satzzeichen, dann kommen sie Zeile für Zeile
    stages: [
      { at: 0, lines: ['Liebe Qwertzer sagt Hupf', 'Wie geht s Bad Qwertz', 'Das Fest ist gerettet', 'Danke sagt sie Allen'] },
      { at: 0.25, lines: SKRIPT.slice(0, 1) },
      { at: 0.5, lines: SKRIPT.slice(0, 2) },
      { at: 0.75, lines: SKRIPT.slice(0, 3) },
      { at: 1, lines: SKRIPT },
    ],
  },
];
