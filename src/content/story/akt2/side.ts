// Nebenszenen in Akt 2: Humor, Stimmung, Stadtleben auf den Dächern. Jede ist eine Mini-Szene mit 1–4 Nachrichten.
// Innerhalb eines Strangs laufen sie in Reihenfolge, die Stränge wechseln sich ab (domain/story.ts); sie kommen nur bei
// Durchgängen in Akt 2 (ihr `fromLesson` liegt im Modul `m2`).
// Quelle der Texte: Drehbuch Akt 2 (liegt nicht im Repository), „Nebenszenen in Akt 2“. Szenen-IDs nie umbenennen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { itemDescription } from '../../items.ts';
import { ada, ans, goldCard, inChat, jun, kr, wardrobeChoices } from '../builders.ts';

type Side = Extract<StoryScene['trigger'], { on: 'side' }>;
const side = (strand: string, order: number, fromLesson: string, x: Partial<Side> = {}): StoryScene['trigger'] => ({ on: 'side', strand, order, fromLesson, ...x });

/** Junas Liste: Szene 3b (ohne den Fall) und 3 (nach dem Fall) haben dieselben zwei Antworten */
const LISTE_ANSWERS = {
  choices: [
    ans('platz1', 'Platz 1?', 'Warum Platz 1?', [jun('Weil du dauernd auf Dächern bist. Das ist VERDÄCHTIG. Und cool. 😎')]),
    ans('elster', 'Und die Elster?', 'Und die Elster?', [jun('Platz 2. Sie hat meine Haarspange gehabt. Das vergess ich nie.')]),
  ],
};
const LISTE = { fromLesson: 'm2-l3', afterScene: 'a2-l3-s50' } as const;

export const SIDE_SCENES: StoryScene[] = [
  // Krümels Flugtagebuch (Chat Krümel, ab Auftrag 1; eine Drohne mit Höhenangst)
  {
    id: 'a2-side-flug-1',
    chat: 'kruemel',
    trigger: side('flug', 1, 'm2-l1', { afterScene: 'a2-l1-s25' }),
    lines: [kr('Flugtagebuch, Tag 1: Höhe erreicht: Fensterbank. Aussicht: Blumentopf. Gefühl: mulmig.')],
  },
  {
    id: 'a2-side-flug-2',
    chat: 'kruemel',
    trigger: side('flug', 2, 'm2-l1'),
    lines: [kr('Flugtagebuch, Tag 2: Höhe: Dachrinne. Eine Taube hat mich angeguckt. Ich hab zuerst weggeguckt.')],
  },
  {
    id: 'a2-side-flug-3',
    chat: 'kruemel',
    trigger: side('flug', 3, 'm2-l1'),
    lines: [kr('Flugtagebuch, Tag 3: Höhe: Schornstein. Nicht runterschauen, sagt Ada. Ich schau hoch. Hilft auch.')],
  },

  // Elster-Meldungen (Qwertz-Flüstern, ab Auftrag 2)
  {
    id: 'a2-side-elster-1',
    chat: 'fluestern',
    trigger: side('elster', 1, 'm2-l2', { afterScene: 'a2-l2-s25' }),
    lines: [jun('ELSTER-UPDATE: Sie hat Herrn Kringels Schlüssel. Er hat sich BEDANKT. Er weiß selbst nicht, warum. 😂')],
  },
  {
    id: 'a2-side-elster-2',
    chat: 'fluestern',
    trigger: side('elster', 2, 'm2-l2'),
    lines: [
      jun('ELSTER-UPDATE: Jetzt hat sie einen Löffel von Pizza Pronto. Was will eine Elster mit einem LÖFFEL???'),
      inChat('kruemel', kr('Was will Pizza Pronto mit einem Löffel? Pizza isst man mit der Hand.')),
    ],
  },
  {
    id: 'a2-side-elster-3',
    chat: 'fluestern',
    trigger: side('elster', 3, 'm2-l2'),
    lines: [jun('ELSTER-UPDATE: Meine Haarspange ist ZURÜCK. Vor dem Kiosk. Mit einer Feder drauf. Entschuldigung???')],
  },

  // Kringel-Bericht, Lavendel-Phase (ZEHN intern, ab Auftrag 3 nach der Lupen-Szene, damit der Lavendel nicht vorher verraten wird)
  {
    id: 'a2-side-kringel-1',
    chat: 'intern',
    trigger: side('kringel', 1, 'm2-l3', { afterScene: 'a2-l3-s50' }),
    lines: [kr('Kringel hat dreimal am Parfüm gerochen, bevor er reinkam. Dann hat er doch nur ein Brötchen gekauft.')],
  },
  {
    id: 'a2-side-kringel-2',
    chat: 'intern',
    trigger: side('kringel', 2, 'm2-l3'),
    lines: [kr('Kringel trägt den Brief in der Innentasche. Links. Wo das Herz ist. Sagt er. Zu einer Keksdose.')],
  },
  {
    id: 'a2-side-kringel-3',
    chat: 'intern',
    trigger: side('kringel', 3, 'm2-l3'),
    lines: [ada('Kringel hat mir den Brief gegeben. Endlich. Drin war ein Gutschein. Für die Drogerie. Lavendel.'), kr('Und ein Gedicht?'), ada('… Ja.')],
  },

  // Goldrand-Post von den Dächern (ZEHN intern, ab Auftrag 2 nach der Monokel-Szene, damit das Monokel nicht vorher verraten wird)
  {
    id: 'a2-side-post-1',
    chat: 'intern',
    trigger: side('post', 1, 'm2-l2', { afterScene: 'a2-l2-s50' }),
    lines: [kr('Goldrand-Karte, unterm Stein auf dem Hoteldach:', goldCard('Die Aussicht ist famos. Kommen Sie ruhig. B. v. B.'))],
  },
  {
    id: 'a2-side-post-2',
    chat: 'intern',
    trigger: side('post', 2, 'm2-l2'),
    lines: [kr('Karte zwei, aus dem Elsternest:', goldCard('Die Elster hat mein zweites Monokel. Ich verhandle noch. B. v. B.'))],
  },
  {
    id: 'a2-side-post-3',
    chat: 'intern',
    trigger: side('post', 3, 'm2-l2'),
    lines: [kr('Karte drei, an der Wettertafel:', goldCard('Ich habe mir das Ü angesehen. Hübsch. Behalten Sie es. B. v. B.')), ada('Großzügig. Er kann es nämlich nicht tippen.')],
  },

  // Adas Lehrlings-Erinnerungen (ZEHN intern, ab Auftrag 1)
  {
    id: 'a2-side-lehrling-1',
    chat: 'intern',
    trigger: side('lehrling', 1, 'm2-l1', { afterScene: 'a2-start' }),
    lines: [
      ada('Benno hat Brezeln in Kronenform gebacken. Alle wollten sie. Ich hab gesagt: Brezeln sind Brezeln.'),
      kr('Und?'),
      ada('Sie waren gut. Das hab ich ihm nie gesagt.'),
    ],
  },
  {
    id: 'a2-side-lehrling-2',
    chat: 'intern',
    trigger: side('lehrling', 2, 'm2-l1'),
    lines: [
      ada('Er hat mit zwei Fingern getippt. Schnell, aber falsch. Jede zweite Bestellung ein Fehler. „Brtchen“.'),
      kr('Wie der Baron mit seinem Gerät!'),
      ada('…'),
    ],
  },
  {
    id: 'a2-side-lehrling-3',
    chat: 'intern',
    trigger: side('lehrling', 3, 'm2-l1'),
    lines: [ada('Vanillekipferl waren seine. Sein Rezept. Ich backe sie, wenn ich an ihn denke.'), kr('Du hast letzte Woche jede Nacht ein Blech gebacken.'), ada('Ja.')],
  },

  // Juna privat (Chat Juna, ab Auftrag 2; jetzt freundlich)
  {
    id: 'a2-side-juna-1',
    chat: 'juna',
    trigger: side('juna', 1, 'm2-l2', { afterScene: 'a2-l2-s25' }),
    lines: [
      jun('Hey. Du warst gestern auf dem Hoteldach, oder? Ich hab dich gesehen. Ich sag nichts. Noch.', {
        choices: [
          ans('danke', 'Danke', 'Danke.', [jun('Dafür schuldest du mir eine Geschichte.')]),
          ans('spion', 'Du spionierst?', 'Spionierst du mir nach?', [jun('Ich BEOBACHTE. Das ist was anderes. Sagt Mama. 👀')]),
        ],
      }),
    ],
  },
  {
    // Geschenk: die Lederkappe (Nebenszenen tragen kein `gift`; ein Durchgang mit Geschenk lässt sie aus, domain/story.ts)
    id: 'a2-side-juna-2',
    chat: 'juna',
    trigger: side('juna', 2, 'm2-l2'),
    gives: ['cap'],
    lines: [jun(itemDescription('cap')), jun('Sag nicht, dass sie von mir ist. Sag, du hast sie gefunden. Auf dem Dach. 😉', wardrobeChoices)],
  },
  // Junas Reaktion auf den Extra-Fall „Junas geheime Liste“: ohne den Fall (3b) und danach (3, letzte des Strangs)
  {
    id: 'a2-side-juna-3b',
    chat: 'juna',
    trigger: side('juna', 3, LISTE.fromLesson, { afterScene: LISTE.afterScene, untilCase: 'junas-liste' }),
    lines: [jun('Ich hab eine Liste. Verdächtige. Kringel ist gestrichen. Die Elster ist drauf. Und du: Platz 1.', LISTE_ANSWERS)],
  },
  {
    id: 'a2-side-juna-3',
    chat: 'juna',
    trigger: side('juna', 4, LISTE.fromLesson, { afterScene: LISTE.afterScene, afterCase: 'junas-liste' }),
    lines: [jun('Meine Liste, du weißt schon. Neu: Kringel ist gestrichen. Die Elster ist drauf. Du bist auf Platz 1.', LISTE_ANSWERS)],
  },
];
