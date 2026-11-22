// Story-Objekte: pro Auftrag ein Ding, das sich mit dem Lernfortschritt sichtbar repariert oder entschlüsselt.
// Feste Stufenbilder – das letzte mit at <= Fortschritt gilt. Keine Zufallsreihenfolge.
// Platzhalter ({agent}, {codename}) füllt storyVars.

import { NODE_COUNT, type StoryObject } from '../../../domain/storyObject.ts';

export const OBJECTS: StoryObject[] = [
  {
    lessonId: 'm1-l1',
    title: 'Krümels Kamera-Auge',
    kind: 'picture',
    stages: [
      { at: 0, picture: 'rauschen' },
      { at: 0.25, picture: 'haende' },
      { at: 0.5, picture: 'markt' },
      { at: 0.75, picture: 'ortsschild-unscharf' },
      { at: 1, picture: 'ortsschild' },
    ],
  },
  {
    lessonId: 'm1-l2',
    title: 'Dein Agentenausweis',
    kind: 'idcard',
    stages: [
      { at: 0, card: [] },
      { at: 0.25, card: ['kopf'] },
      { at: 0.5, card: ['kopf', 'foto'] },
      { at: 0.75, card: ['kopf', 'foto', 'name'] },
      { at: 1, card: ['kopf', 'foto', 'name', 'stempel'] },
    ],
  },
  {
    lessonId: 'm1-l3',
    title: 'Die Goldrand-Karte',
    kind: 'text',
    look: 'goldcard',
    stages: [
      { at: 0, text: '#§% &x@ ~?!^ %§# x&@ ^~?! §%#' },
      { at: 0.25, text: 'H??TE U? 1? H?LE …' },
      { at: 0.5, text: 'HEUTE UM 12 HOLE ICH MIR …' },
      { at: 1, text: 'HEUTE UM 12 HOLE ICH MIR DAS F. HOCHACHTUNGSVOLL, B. v. B.' },
    ],
  },
  {
    lessonId: 'm1-l4',
    title: 'Rückseite der Karte',
    kind: 'lines',
    look: 'goldcard',
    stages: [
      // ▒ = Buchstabe unter einem Tintenklecks (INK_BLOT)
      { at: 0, lines: [] },
      { at: 0.25, lines: [], marks: ['schnoerkel'] },
      { at: 0.5, lines: ['B▒▒▒▒ v▒▒ B▒▒▒▒▒▒▒▒'], marks: ['krone'] },
      { at: 0.75, lines: ['B▒▒▒▒ v▒▒ B▒▒▒▒▒▒▒▒'], marks: ['krone'], watermark: true },
      { at: 1, lines: ['Hochachtungsvoll,', 'Baron von Backspace'], marks: ['krone'], watermark: true },
    ],
  },
  {
    lessonId: 'm1-l5',
    title: 'Die Schilder am Markt',
    kind: 'picture',
    // Apotheke ohne H, Gasthaus ohne beide G – Stück für Stück zurück
    stages: [
      { at: 0, picture: 'schilder-0' },
      { at: 0.25, picture: 'schilder-25' },
      { at: 0.5, picture: 'schilder-50' },
      { at: 1, picture: 'schilder-100' },
    ],
  },
  {
    lessonId: 'm1-l6',
    title: 'Das Grundnetz',
    kind: 'nodes',
    stages: Array.from({ length: NODE_COUNT + 1 }, (_, i) => ({ at: i / NODE_COUNT, lit: i })),
  },
];
