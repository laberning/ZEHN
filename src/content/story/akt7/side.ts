// Nebenszenen in Akt 7: Humor und Stadtleben rund um das Finale. Jede ist eine Mini-Szene mit 1–4 Nachrichten.
// Innerhalb eines Strangs laufen sie in Reihenfolge, die Stränge wechseln sich ab (domain/story.ts); sie kommen nur bei
// Durchgängen in Akt 7 (ihr `fromLesson` liegt im Modul `m7`). Akt 7 hat keinen Extra-Fall, darum keine Varianten.
// Krümel zählt Ottis Lolli-Vorrat nach Bennos Fotos aus dem Laden (`a7-l1-s50`, Chat Krümel); Bennos Tippfortschritt beginnt nach
// `a7-l2-s25` und kennt keine Stoppuhr; Pit, Junas kleiner Bruder, kommt nur im Chat Juna vor und wird zitiert. Tippi schreibt in
// Nebenszenen nie (seit `{stopp}` ist sie still), Otti nie.
// Quelle der Texte: Drehbuch Akt 7 (liegt nicht im Repository), „Nebenszenen in Akt 7“. Szenen-IDs nie umbenennen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ben, jun, kr, sys } from '../builders.ts';

type Side = Extract<StoryScene['trigger'], { on: 'side' }>;
const side = (strand: string, order: number, fromLesson: string, x: Partial<Side> = {}): StoryScene['trigger'] => ({ on: 'side', strand, order, fromLesson, ...x });

export const SIDE_SCENES: StoryScene[] = [
  // Teamgeplänkel (ZEHN intern, ab Auftrag 1)
  {
    id: 'a7-side-team-1',
    chat: 'intern',
    trigger: side('team', 1, 'm7-l1'),
    lines: [
      kr('Teamfrage: Wer hat die meisten Finger? Juna zehn, Ada zehn, Benno zwei, ich null. (Knapp.)'),
      jun('ZEHN. UND DU, BENNO?'),
      ben('Zwei. Und einen Anfang. Das reicht.'),
    ],
  },
  {
    id: 'a7-side-team-2',
    chat: 'intern',
    trigger: side('team', 2, 'm7-l1', { afterScene: 'a7-l3-s25' }),
    lines: [
      jun('FRAGE AN BENNO: Wie viele Hüte hattest du?'),
      ben('Zwei Zylinder, zehn Hüte. Elf hat Otti. Einer liegt bei Krümel im Fach.'),
      kr('Als Beweis. Und als Kissen. (Ich schlafe nicht. Aber falls.)'),
    ],
  },
  {
    id: 'a7-side-team-3',
    chat: 'intern',
    trigger: side('team', 3, 'm7-l1'),
    lines: [
      ada('Teambesprechung: Kipferl gibt es ab jetzt tagsüber. Wer nachts klingelt, bekommt keine.'),
      ben('Ich klingle. Versprochen.'),
      jun('ER KLINGELT. Das ist das Seltsamste in diesem Chat. Und Tippi ist hier. 😂'),
    ],
  },

  // Ottis Lolli-Vorrat (Chat Krümel, ab Auftrag 1 nach `a7-l1-s50`)
  {
    id: 'a7-side-lollis-1',
    chat: 'kruemel',
    trigger: side('lollis', 1, 'm7-l1', { afterScene: 'a7-l1-s50' }),
    lines: [kr('Lolli-Zählung nach Bennos Fotos: Regal eins, 412 Lollis. Alle Kirsch. Mag keiner. (Außer Otti.)')],
  },
  {
    id: 'a7-side-lollis-2',
    chat: 'kruemel',
    trigger: side('lollis', 2, 'm7-l1', { afterScene: 'a7-l1-s50' }),
    lines: [kr('Regal zwei: 380. Regal drei: leer. Nur ein Schild: HUT, 2 €. Lollis gegen Hüte. Schlechter Tausch.')],
  },
  {
    id: 'a7-side-lollis-3',
    chat: 'kruemel',
    trigger: side('lollis', 3, 'm7-l1', { afterScene: 'a7-l1-s50' }),
    lines: [kr('Gesamt: 792 Lollis. Reicht für zwei Jahre Inventur. Oder eine Stadt, die nie tippt. (Nicht wir.) ⚡')],
  },

  // Hupfs Festrede (ZEHN intern, ab Auftrag 2; Ada zitiert die Entwürfe)
  {
    id: 'a7-side-festrede-1',
    chat: 'intern',
    trigger: side('festrede', 1, 'm7-l2'),
    lines: [ada('Hupfs Festrede, Entwurf eins: „Liebe Qwertzer, wir haben gesiegt!“ Wir haben noch nichts gesiegt.'), kr('Sie sagt: Vorbereitung. (Sie hat auch schon Konfetti.)')],
  },
  {
    id: 'a7-side-festrede-2',
    chat: 'intern',
    trigger: side('festrede', 2, 'm7-l2'),
    lines: [ada('Entwurf zwei: zwölf Seiten. Sie dankt allen. Auch dem Brunnen. Juna hat drei Seiten gestrichen.'), jun('VIER. Und die Seite über mich habe ich länger gemacht.')],
  },
  {
    id: 'a7-side-festrede-3',
    chat: 'intern',
    trigger: side('festrede', 3, 'm7-l2'),
    lines: [ada('Entwurf drei, eine Seite: „Danke, ZEHN. Danke, {vorname}.“ Hupf weint schon beim Lesen. Ich fast.'), kr('Ich speichere Entwurf drei. Für den Fall. (Den guten.)')],
  },

  // Benno tippt (ZEHN intern, ab Auftrag 2 nach `a7-l2-s25`; kein Tempo-Vergleich, keine Stoppuhr)
  {
    id: 'a7-side-benno-tippt-1',
    chat: 'intern',
    trigger: side('benno-tippt', 1, 'm7-l2', { afterScene: 'a7-l2-s25' }),
    lines: [sys('Benno tippt …'), ben('Hallo. Das waren zwei Finger und eine lange Minute. Ich lerne noch.'), jun('KEINE STOPPUHR. Hat Ada gesagt. Ich halte mich dran. Fast.')],
  },
  {
    id: 'a7-side-benno-tippt-2',
    chat: 'intern',
    trigger: side('benno-tippt', 2, 'm7-l2', { afterScene: 'a7-l2-s25' }),
    lines: [
      ben('Heute ein ganzer Satz: „Die Kipferl sind gut.“ Drei Tippfehler, alle stehen gelassen.'),
      ada('Zehn Finger schaffen mehr als zwei. Auch ehrlich getippt. Das hat mir mal jemand nicht geglaubt.'),
      kr('(Jetzt glaubt er es.)'),
    ],
  },
  {
    id: 'a7-side-benno-tippt-3',
    chat: 'intern',
    trigger: side('benno-tippt', 3, 'm7-l2', { afterScene: 'a7-l2-s25' }),
    lines: [
      ben('Frage: Welcher Finger ist für das große T?'),
      ada('Linker Zeigefinger hoch, die rechte Hand hält. Wie bei {vorname}, damals am Turm.'),
      ben('Dann üben wir das. Zusammen. Nach dem Finale.'),
    ],
  },

  // Pit (Chat Juna, ab Auftrag 3; Junas kleiner Bruder, zitiert)
  {
    id: 'a7-side-pit-1',
    chat: 'juna',
    trigger: side('pit', 1, 'm7-l3'),
    lines: [jun('Mein kleiner Bruder Pit guckt mir beim Tippen zu. Seit einer Stunde. Er sagt nichts. DAS ist neu. 👀')],
  },
  {
    id: 'a7-side-pit-2',
    chat: 'juna',
    trigger: side('pit', 2, 'm7-l3'),
    lines: [jun('Pit hat die Kiosk-Kasse gekapert. Tippt Preise, zwei Finger. Mama sagt: Feierabend. Pit: Training.')],
  },
  {
    id: 'a7-side-pit-3',
    chat: 'juna',
    trigger: side('pit', 3, 'm7-l3'),
    lines: [jun('Pit fragt, ob die ZEHN Achtjährige nimmt. Ich sag: Frag {vorname}. Er übt die Frage. Zwei Finger.')],
  },
];
