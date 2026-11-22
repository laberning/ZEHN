// Story-Objekte von Akt 3 „Untere Reihe“: ein Gegenstand je Auftrag, der mit dem Fortschritt Stufe für Stufe sichtbar wird.
// Die Bilder zeichnet ui/pictures/akt3.tsx (Kennung `art-Prozent`); die Schlüsselkarte ist ein Ausweis (idcard, look schluesselkarte),
// die Prüfungsakte und die Speicherbox sind Texte (lines). Quelle der Texte: Drehbuch Akt 3 (liegt nicht im Repository).

import type { ObjectStage, StoryObject, UntenPictureId } from '../../../domain/storyObject.ts';

/** Fünf Stufen (0, 25, 50, 75, 100 %) aus den Bildern `<art>-0` … `<art>-100` */
const levels = (art: 'netzplan' | 'ladestation'): ObjectStage[] =>
  ([0, 25, 50, 75, 100] as const).map((p) => ({ at: p / 100, picture: `${art}-${p}` satisfies UntenPictureId }));

export const OBJECTS: StoryObject[] = [
  { lessonId: 'm3-l1', title: 'Der U-Bahn-Netzplan', kind: 'picture', stages: levels('netzplan') },
  {
    lessonId: 'm3-l2',
    title: 'Ortruds Schlüsselkarte',
    kind: 'idcard',
    look: 'schluesselkarte',
    // Foto, dann „O.“-Logo und Name, dann der Code-Streifen („ZUTRITT: S.“), zuletzt der Stempel „Code bereit“
    stages: [
      { at: 0, card: [] },
      { at: 0.25, card: ['foto'] },
      { at: 0.5, card: ['foto', 'logo', 'name'] },
      { at: 0.75, card: ['foto', 'logo', 'name', 'code'] },
      { at: 1, card: ['foto', 'logo', 'name', 'code', 'stempel'] },
    ],
  },
  { lessonId: 'm3-l3', title: 'Keks’ Ladestation', kind: 'picture', stages: levels('ladestation') },
  {
    lessonId: 'm3-l4',
    title: 'Bennos Prüfungsakte',
    kind: 'lines',
    // Schnipsel, die sich zusammensetzen; die letzte Stufe trägt Adas Brezel-Stempel als Wasserzeichen
    stages: [
      { at: 0, lines: ['… ZUM AGEN…', '…Stadt…', '… ung zur …', '… ZEHN …', '… Raum …'] },
      { at: 0.25, lines: ['PRÜFUNG ZUR AGENTIN / ZUM AGENTEN', 'ZEHN · Stadtarchiv, Raum 3'] },
      { at: 0.5, lines: ['PRÜFUNG ZUR AGENTIN / ZUM AGENTEN', 'ZEHN · Stadtarchiv, Raum 3', 'Prüfling: Benno B.', 'nicht bestanden'] },
      {
        at: 0.75,
        lines: ['PRÜFUNG ZUR AGENTIN / ZUM AGENTEN', 'ZEHN · Stadtarchiv, Raum 3', 'Prüfling: Benno B.', 'nicht bestanden', 'Grund: tippt mit zwei Fingern', 'Ergebnis mitgeteilt: vor allen'],
      },
      {
        at: 1,
        lines: ['PRÜFUNG ZUR AGENTIN / ZUM AGENTEN', 'ZEHN · Stadtarchiv, Raum 3', 'Prüfling: Benno B.', 'nicht bestanden', 'Grund: tippt mit zwei Fingern', 'Ergebnis mitgeteilt: vor allen', 'Prüferin: Ada'],
        watermark: true,
      },
    ],
  },
  {
    lessonId: 'm3-l5',
    title: 'Keks’ Speicherbox',
    kind: 'lines',
    stages: [
      { at: 0, lines: ['▒▒▒▒ ▒▒▒ ▒▒▒▒▒▒ ▒▒', '▒▒ ▒▒▒▒▒▒▒ ▒▒▒▒'] },
      { at: 0.25, lines: ['Tag 1. Benno sagt, ich bin die Beste. Er übt für die Prüfung. Ich zähle seine Fehler. 14.'] },
      {
        at: 0.5,
        lines: ['Tag 1. Benno sagt, ich bin die Beste. Er übt für die Prüfung. Ich zähle seine Fehler. 14.', 'Tag 30. Benno backt Vanillekipferl. Für die Prüfer. Ich rieche jetzt nach Vanille. Für immer, sagt er.'],
      },
      {
        at: 0.75,
        lines: [
          'Tag 1. Benno sagt, ich bin die Beste. Er übt für die Prüfung. Ich zähle seine Fehler. 14.',
          'Tag 30. Benno backt Vanillekipferl. Für die Prüfer. Ich rieche jetzt nach Vanille. Für immer, sagt er.',
          'Tag 31. Benno hat nicht bestanden. Vor allen. Er weint. Er sagt, er braucht mich nicht mehr. Ich bleibe hier.',
        ],
      },
      {
        at: 1,
        lines: [
          'Tag 1. Benno sagt, ich bin die Beste. Er übt für die Prüfung. Ich zähle seine Fehler. 14.',
          'Tag 30. Benno backt Vanillekipferl. Für die Prüfer. Ich rieche jetzt nach Vanille. Für immer, sagt er.',
          'Tag 31. Benno hat nicht bestanden. Vor allen. Er weint. Er sagt, er braucht mich nicht mehr. Ich bleibe hier.',
          'Tag 32. Er ist weg. Ada hat mich in den Schrank gestellt. Sie hat gesagt: Ich warte mit dir.',
        ],
      },
    ],
  },
];
