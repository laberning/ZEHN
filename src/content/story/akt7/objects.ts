// Story-Objekte von Akt 7 „Sonderzeichen“: ein Gegenstand je Auftrag, der mit dem Fortschritt Stufe für Stufe sichtbar wird.
// Alle drei sind Texte (lines), ohne Bilder: Ottis Preisliste, der Schaltplan der vier Maschinen und der Abschaltbefehl.
// Jede Stufe holt eine Zeile zurück; die Zeilen bauen aufeinander auf.
// Quelle der Texte: Drehbuch Akt 7 (liegt nicht im Repository).

import type { StoryObject } from '../../../domain/storyObject.ts';

/** Überschrift und offene Zeile der Preisliste: stehen in jeder Stufe */
const TITEL = 'TIPPNIX – BALD AUCH IN IHRER STADT';
const OFFEN = 'Zehn Finger, frisch: ?';

/** Ottis Preisliste: Stadt für Stadt mit ihrem Preis */
const PREISE = ['Bad Qwertz: 10 € im Monat', 'Nebelhausen: 12 € im Monat', 'Tastow: 15 € im Monat'];

/** Der Schaltplan: Maschine für Maschine, die Klammern schließen die Stromkreise */
const KREISE = ['Maschine 1: {Zeichen → Röhre}', 'Maschine 2: [Zeichen → Röhre]', 'Maschine 3: {O → Motor}', 'Maschine 4: [Chat → lernt] → Tippi'];

/** Der Abschaltbefehl: eine Zeile je Maschine */
const BEFEHL = ['\\stopp ~maschine1 | aus', '\\stopp ~maschine2 | aus', '\\stopp ~maschine3 | aus', '\\stopp ~maschine4 | aus'];

export const OBJECTS: StoryObject[] = [
  {
    lessonId: 'm7-l1',
    title: 'Ottis Preisliste',
    kind: 'lines',
    // @ und € fehlen: erst Städte ohne Preise, dann kommt je Stufe ein Preis zurück, zuletzt die Adresse
    stages: [
      { at: 0, lines: [TITEL, 'Bad Qwertz: __ im Monat', 'Nebelhausen: __ im Monat', 'Tastow: __ im Monat', OFFEN] },
      { at: 0.25, lines: [TITEL, ...PREISE.slice(0, 1), OFFEN] },
      { at: 0.5, lines: [TITEL, ...PREISE.slice(0, 2), OFFEN] },
      { at: 0.75, lines: [TITEL, ...PREISE, OFFEN] },
      { at: 1, lines: [TITEL, ...PREISE, 'Bestellen: otti@tippnix', 'Zehn Finger, frisch: gesucht'] },
    ],
  },
  {
    lessonId: 'm7-l2',
    title: 'Der Schaltplan',
    kind: 'lines',
    // die Klammern schließen die Stromkreise; jede Stufe holt eine zurück, zuletzt läuft der Plan in Tippi zusammen
    stages: [
      { at: 0, lines: ['SCHALTPLAN TIPPNIX', 'Maschine 1: Zeichen → Röhre', 'Maschine 2: Zeichen → Röhre', 'Maschine 3: O → Motor', 'Maschine 4: ?'] },
      { at: 0.25, lines: KREISE.slice(0, 1) },
      { at: 0.5, lines: KREISE.slice(0, 2) },
      { at: 0.75, lines: KREISE.slice(0, 3) },
      { at: 1, lines: [...KREISE, 'Alle Kreise geschlossen'] },
    ],
  },
  {
    lessonId: 'm7-l3',
    title: 'Der Abschaltbefehl',
    kind: 'lines',
    // drei Zeichen fehlen in jeder Zeile; jede Stufe holt eine Maschine zurück
    stages: [
      { at: 0, lines: ['ABSCHALTFOLGE', '__stopp __maschine1 __ aus', '__stopp __maschine2 __ aus', '__stopp __maschine3 __ aus', '__stopp __maschine4 __ aus'] },
      { at: 0.25, lines: BEFEHL.slice(0, 1) },
      { at: 0.5, lines: BEFEHL.slice(0, 2) },
      { at: 0.75, lines: BEFEHL.slice(0, 3) },
      { at: 1, lines: [...BEFEHL, 'Folge: vollständig'] },
    ],
  },
];
