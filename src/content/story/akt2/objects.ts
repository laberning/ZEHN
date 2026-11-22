// Story-Objekte von Akt 2 „Obere Reihe“: ein Gegenstand je Auftrag, der mit dem Fortschritt Stufe für Stufe sichtbar wird.
// Die Bilder zeichnet ui/pictures/akt2.tsx (Kennung `art-Prozent`); die Wettertafel ist ein Text.

import type { ObenPictureId, ObjectStage, StoryObject } from '../../../domain/storyObject.ts';

/** Fünf Stufen (0, 25, 50, 75, 100 %) aus den Bildern `<art>-0` … `<art>-100` */
const levels = (art: 'peilgeraet' | 'rotor' | 'o-schilder' | 'route' | 'schlossplatte'): ObjectStage[] =>
  ([0, 25, 50, 75, 100] as const).map((p) => ({ at: p / 100, picture: `${art}-${p}` satisfies ObenPictureId }));

export const OBJECTS: StoryObject[] = [
  { lessonId: 'm2-l1', title: 'Krümels Peilgerät', kind: 'picture', stages: levels('peilgeraet') },
  { lessonId: 'm2-l2', title: 'Krümels Rotor', kind: 'picture', stages: levels('rotor') },
  {
    lessonId: 'm2-l3',
    title: 'Die Wettertafel',
    kind: 'text',
    // Leuchttafel mit drei Zeilen (Wetter, Grad, Laufschrift); die Zeilen trennt ein Mittelpunkt
    stages: [
      { at: 0, text: 'HEI ER BIS WOLKIG · WEI GRAD' },
      { at: 0.25, text: 'HEI ER BIS WOLKIG · WEI GRAD · … MEINE LIEBEN …' },
      { at: 0.5, text: 'HEITER BIS WOLKIG · WEI GRAD · … MEINE LIEBEN …' },
      { at: 0.75, text: 'HEITER BIS WOLKIG · ZWEI GRAD · ZU VIELE ZUSCHAUER. WER MACHT DAS AUS?' },
      { at: 1, text: 'HEITER BIS WOLKIG · ZWEI GRAD' },
    ],
  },
  { lessonId: 'm2-l4', title: 'Die O-Schilder', kind: 'picture', stages: levels('o-schilder') },
  { lessonId: 'm2-l5', title: 'Die Route des Roboters', kind: 'picture', stages: levels('route') },
  { lessonId: 'm2-l6', title: 'Die Schlossplatte', kind: 'picture', stages: levels('schlossplatte') },
];
