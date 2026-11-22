// Story-Objekte von Akt 4 „Großschreibung“: ein Gegenstand je Auftrag, der mit dem Fortschritt Stufe für Stufe sichtbar wird.
// Das Straßenschild ist ein Bild (ui/pictures/akt4.tsx, Kennung `strassenschild-Prozent`), die Zeitung, das Plakat und das Namensschild
// der Turmtür sind Texte (lines). Quelle der Texte: Drehbuch Akt 4 (liegt nicht im Repository).

import type { GrossPictureId, ObjectStage, StoryObject } from '../../../domain/storyObject.ts';

/** Fünf Stufen (0, 25, 50, 75, 100 %) aus den Bildern `strassenschild-<Stufe>` */
const schild = (): ObjectStage[] => ([0, 25, 50, 75, 100] as const).map((p) => ({ at: p / 100, picture: `strassenschild-${p}` satisfies GrossPictureId }));

/** Titelseite des „Qwertzer Boten“: erst alles klein, dann Stück für Stück groß */
const BOTE = ['Der Qwertzer Bote', 'Bad Qwertz ohne große Buchstaben', 'Bürgermeisterin: Stadtfest findet statt'];

export const OBJECTS: StoryObject[] = [
  {
    lessonId: 'm4-l1',
    title: 'Die Zeitungs-Schlagzeile',
    kind: 'lines',
    stages: [
      { at: 0, lines: ['der qwertzer bote', 'bad qwertz ohne große buchstaben', 'bürgermeisterin: stadtfest findet statt'] },
      { at: 0.25, lines: BOTE.slice(0, 1) },
      { at: 0.5, lines: BOTE.slice(0, 2) },
      { at: 0.75, lines: BOTE },
      { at: 1, lines: ['BAD QWERTZ', ...BOTE] },
    ],
  },
  {
    lessonId: 'm4-l2',
    title: 'Bennos Plakat',
    kind: 'lines',
    // Fetzen, dann Wort für Wort das Plakat; ganz unten das Kleingedruckte (`finePrint`: die letzte Zeile ist winzig gesetzt)
    stages: [
      { at: 0, lines: ['g o e k ei m c u g'] },
      { at: 0.25, lines: ['GROSSE'] },
      { at: 0.5, lines: ['GROSSE KLEINMACHUNG'] },
      { at: 0.75, lines: ['GROSSE KLEINMACHUNG', 'Jeder Große wird klein.', 'Unterzeichnet: B. v. B.'] },
      { at: 1, lines: ['GROSSE KLEINMACHUNG', 'Jeder Große wird klein.', 'Unterzeichnet: B. v. B.', 'Ausgenommen: ich.'], finePrint: 1 },
    ],
  },
  { lessonId: 'm4-l3', title: 'Das Straßenschild', kind: 'picture', stages: schild() },
  {
    lessonId: 'm4-l4',
    title: 'Das Namensschild der Turmtür',
    kind: 'lines',
    // Das Leuchtschild flackert: bei 50 % fehlen die O (an seiner eigenen Tür); zuletzt ein leeres Feld für den Namen
    stages: [
      { at: 0, lines: ['Das Schild ist dunkel.', 'Nur ein Summen: mmmmmm'] },
      { at: 0.25, lines: ['BARON VON BACKSPACE'] },
      { at: 0.5, lines: ['BAR N V N BACKSPACE'] },
      { at: 0.75, lines: ['BAR N V N BACKSPACE', 'ZUTRITT NUR MIT NAMEN'] },
      { at: 1, lines: ['BAR N V N BACKSPACE', 'ZUTRITT NUR MIT NAMEN', 'NAME: ________'] },
    ],
  },
];
