// Story-Objekte von Akt 6 „Zahlen“: ein Gegenstand je Auftrag, der mit dem Fortschritt Stufe für Stufe sichtbar wird.
// Alle vier sind Texte (lines), ohne Bilder: Krümels Karte vom Hafen mit der Peilung, das Zahlenschloss am Tresor des Barons,
// die Spurenwand im HQ und Ottis Lieferbuch. Jede Stufe holt eine Zahl zurück; die Zeilen bauen aufeinander auf.
// Quelle der Texte: Drehbuch Akt 6 (liegt nicht im Repository).

import type { StoryObject } from '../../../domain/storyObject.ts';

/** Die Karte vom Hafen: Ort für Ort mit seiner Zahl */
const KARTE = ['PIER 4', 'HALLE 7', 'TOR 6', 'KISTE 5'];

/** Die Fäden an der Spurenwand, zuletzt die Nadel */
const FAEDEN = ['Faden: Werbefoto – Aufkleber', 'Faden: Aufkleber – Signal von O.', 'Faden: Signal – Lolli-Logo – Goldstaub', 'Nadel: Marktplatz 10'];

/** Ottis Lieferbuch (Durchschlag des Barons): Seite für Seite mit ihrer Zahl */
const BUCH = ['Seite 2: obere Reihe, Lieferung B., Freitag, zwei Kisten', 'Seite 9: SCHILD-O, Lieferung B. → Maschine 3, Menge: eins', 'Tresor: 1234', 'Seite 29, unter „Code“: Zahlen, selbst geholt.'];

export const OBJECTS: StoryObject[] = [
  {
    lessonId: 'm6-l1',
    title: 'Die Stadtkarte',
    kind: 'lines',
    // erst fünf Orte ohne Zahlen, dann rastet je Stufe eine Zahl ein; ganz zuletzt der Weg und das offene Tor
    stages: [
      { at: 0, lines: ['HAFEN', 'PIER', 'HALLE', 'TOR', 'KISTE'] },
      { at: 0.25, lines: KARTE.slice(0, 1) },
      { at: 0.5, lines: KARTE.slice(0, 2) },
      { at: 0.75, lines: KARTE.slice(0, 3) },
      { at: 1, lines: [...KARTE, '4 7 6 5 – offen'] },
    ],
  },
  {
    lessonId: 'm6-l2',
    title: 'Das Tresorschloss',
    kind: 'lines',
    // vier Rädchen; jede Stufe rastet eins ein, zuletzt ist der Tresor offen und leer
    stages: [
      { at: 0, lines: ['SCHLOSS: _ _ _ _'] },
      { at: 0.25, lines: ['3 _ _ _'] },
      { at: 0.5, lines: ['3 8 _ _'] },
      { at: 0.75, lines: ['3 8 6 _'] },
      { at: 1, lines: ['3 8 6 7 – offen', 'Leer.'] },
    ],
  },
  {
    lessonId: 'm6-l3',
    title: 'Die Spurenwand',
    kind: 'lines',
    // Junas Liste mit allen Zetteln seit dem Werbefoto: erst fünf Zettel ohne Faden, dann je Stufe ein Faden, zuletzt die Nadel
    stages: [
      { at: 0, lines: ['WERBEFOTO', 'AUFKLEBER', 'SIGNAL VON O.', 'LOLLI-LOGO', 'GOLDSTAUB, ABSATZ, STIEL'] },
      { at: 0.25, lines: FAEDEN.slice(0, 1) },
      { at: 0.5, lines: FAEDEN.slice(0, 2) },
      { at: 0.75, lines: FAEDEN.slice(0, 3) },
      { at: 1, lines: FAEDEN },
    ],
  },
  {
    lessonId: 'm6-l4',
    title: 'Ottis Lieferbuch',
    kind: 'lines',
    // „Mein Konto bei O.“: alle Zahlen fehlen, jede Stufe holt eine Seite zurück
    stages: [
      { at: 0, lines: ['MEIN KONTO BEI O.', 'Seite _: obere Reihe', 'Seite _: SCHILD-O', 'Tresor: _ _ _ _', 'Seite _: Zahlen'] },
      { at: 0.25, lines: BUCH.slice(0, 1) },
      { at: 0.5, lines: BUCH.slice(0, 2) },
      { at: 0.75, lines: BUCH.slice(0, 3) },
      { at: 1, lines: BUCH },
    ],
  },
];
