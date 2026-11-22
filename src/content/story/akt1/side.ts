// Nebenszenen in Akt 1: Humor, Stimmung, Stadtleben. Jede ist eine Mini-Szene mit 2–4 Nachrichten.
// Innerhalb eines Strangs laufen sie in Reihenfolge, die Stränge wechseln sich ab (domain/story.ts).
// Quelle der Texte: Drehbuch Akt 1 (liegt nicht im Repository), „Nebenszenen in Akt 1“. Szenen-IDs nie umbenennen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ans, goldCard, inChat, jun, kr, sys } from '../builders.ts';

type Side = Extract<StoryScene['trigger'], { on: 'side' }>;
const side = (strand: string, order: number, fromLesson: string, x: Partial<Side> = {}): StoryScene['trigger'] => ({ on: 'side', strand, order, fromLesson, ...x });

export const SIDE_SCENES: StoryScene[] = [
  // Krümels Croissant-Tagebuch (Chat Krümel, zeitlos)
  { id: 'side-tagebuch-1', chat: 'kruemel', trigger: side('tagebuch', 1, 'm1-l1', { afterScene: 'l1-s25' }), lines: [kr('Tag 1: Ada hat 40 Croissants gebacken. Ich habe eins getestet. Für die Wissenschaft. 🥐')] },
  { id: 'side-tagebuch-2', chat: 'kruemel', trigger: side('tagebuch', 2, 'm1-l1'), lines: [kr('Tag 2: Drei getestet. Ergebnis: Croissants sind lecker. Weitere Tests sind dringend nötig.')] },
  { id: 'side-tagebuch-3', chat: 'kruemel', trigger: side('tagebuch', 3, 'm1-l1'), lines: [kr('Tag 3: Ada zählt jetzt die Croissants. Ich muss unauffälliger forschen.')] },
  { id: 'side-tagebuch-4', chat: 'kruemel', trigger: side('tagebuch', 4, 'm1-l1'), lines: [kr('Tag 4: Wie isst eine Drohne ohne Mund ein Croissant? Antwort: Forschungsgeheimnis. 💡')] },
  {
    id: 'side-tagebuch-5',
    chat: 'kruemel',
    trigger: side('tagebuch', 5, 'm1-l1'),
    lines: [kr('Tag 5: Ich glaube, ich hab früher schon mal Croissants getestet. Komisch. Ich bin doch erst zwei.')],
  },

  // Qwertz-Flüstern (Junas Klatschkanal, ab Auftrag 2)
  {
    id: 'side-fluestern-1',
    chat: 'fluestern',
    trigger: side('fluestern', 1, 'm1-l2', { untilLesson: 'm1-l4', untilCase: 'seifenblasen-brunnen', afterScene: 'l2-s25' }),
    lines: [jun('Der Brunnen am Markt spuckt seit gestern Seifenblasen. Ich war\'s nicht. Wirklich nicht. 😅')],
  },
  {
    id: 'side-fluestern-2',
    chat: 'fluestern',
    trigger: side('fluestern', 2, 'm1-l2', { afterScene: 'l2-s25' }),
    lines: [
      jun('Brezel oder Croissant?', {
        choices: [
          ans('brezel', 'Brezel', 'Brezel, ganz klar.', [inChat('kruemel', kr('Verrat!'))]),
          ans('croissant', 'Croissant', 'Croissant natürlich.', [inChat('kruemel', kr('Ich wusste, wir sind Freunde.'))]),
        ],
      }),
    ],
  },
  {
    id: 'side-fluestern-3',
    chat: 'fluestern',
    trigger: side('fluestern', 3, 'm1-l2'),
    lines: [jun('Die Katze vom Gasthaus hat Herrn Kringels Pausenbrot geklaut. Er hat sich bei IHR entschuldigt.')],
  },
  {
    id: 'side-fluestern-4',
    chat: 'fluestern',
    trigger: side('fluestern', 4, 'm1-l2', { untilLesson: 'm1-l6' }),
    lines: [jun('Gerücht: Die Bäckerin ist eine Geheimagentin. Quelle: ich. Beweise: null.'), inChat('kruemel', kr('Piep. Piep piep. (Das war ein nervöses Piep.)'))],
  },

  // Kringel-Bericht (Krümel in ZEHN intern, ab Auftrag 2, zeitlos)
  // Die Reihenfolge gibt `order` vor, nicht die Kennung: `side-kringel-blume` ist Folge 4, `side-kringel-4` Folge 5 (Kennungen sind Speicherformat, nie umbenennen).
  { id: 'side-kringel-1', chat: 'intern', trigger: side('kringel', 1, 'm1-l2', { afterScene: 'l2-s75' }), lines: [kr('Kringel hat heute zwei Brötchen gekauft. Er wohnt allein. Für wen ist das zweite?')] },
  { id: 'side-kringel-2', chat: 'intern', trigger: side('kringel', 2, 'm1-l2'), lines: [kr('Kringel hat gefragt, ob Ada Gedichte mag. Ada sagte „Nein“. Dann hat sie gelächelt. Beim Kneten.')] },
  { id: 'side-kringel-3', chat: 'intern', trigger: side('kringel', 3, 'm1-l2'), lines: [kr('Kringel hat sich an der Tür gestoßen. Weil er Ada angeguckt hat. Dritte Beule diese Woche.')] },
  {
    id: 'side-kringel-blume',
    chat: 'intern',
    trigger: side('kringel', 4, 'm1-l2'),
    lines: [kr('Kringel war wieder da. Er hat Ada eine Blume gebracht. Eine gelbe.'), ada('Das war eine Quittung.'), kr('Eine gelbe Quittung. Mit Stiel.')],
  },
  {
    id: 'side-kringel-4',
    chat: 'intern',
    trigger: side('kringel', 5, 'm1-l2', { afterCase: 'kringels-briefkasten' }),
    lines: [ada('Kringel hat mir ein Gedicht gebracht. Es reimt sich nicht. Ich hab\'s trotzdem aufgehoben.')],
  },

  // Adas Backstuben-Weisheiten (ZEHN intern, zeitlos, nebenbei Haltungstipps)
  {
    id: 'side-ada-1',
    chat: 'intern',
    trigger: side('weisheiten', 1, 'm1-l1', { afterScene: 'l1-s25' }),
    lines: [ada('Weißt du, warum wir ZEHN heißen? Zehn Finger schaffen mehr als zwei.'), ada('Das hat mir mal jemand nicht geglaubt.')],
  },
  {
    id: 'side-ada-2',
    chat: 'intern',
    trigger: side('weisheiten', 2, 'm1-l1'),
    lines: [
      ada('Gerade sitzen, Schultern locker. Hat Frau Hubbel auch immer gesagt. Mit Trillerpfeife.'),
      kr('Hubbel? Wie die auf F und J?'),
      ada('Daher hab ich das Wort.'),
    ],
  },
  { id: 'side-ada-3', chat: 'intern', trigger: side('weisheiten', 3, 'm1-l1'), lines: [ada('Fehler passieren. Weitermachen ist die eigentliche Agentenkunst.')] },

  // Goldrand-Post (Krümel in ZEHN intern, ab Auftrag 4; der Baron schreibt Karten, kommt aber nicht in den Chat)
  {
    id: 'side-post-1',
    chat: 'intern',
    trigger: side('post', 1, 'm1-l4'),
    lines: [kr('Schon wieder Goldrand. Kringel sagt, die lag einfach im Postsack.', goldCard('Ein kleiner Gruß. Kein Grund zur Sorge. Noch nicht. B. v. B.'))],
  },
  {
    id: 'side-post-2',
    chat: 'intern',
    trigger: side('post', 2, 'm1-l4'),
    lines: [kr('Neue Karte!', goldCard('Wussten Sie, dass das Ä der eitelste Buchstabe ist? Zwei Punkte, wie ein Monokel. Ich mag es.'))],
  },
  {
    id: 'side-post-3',
    chat: 'intern',
    trigger: side('post', 3, 'm1-l4'),
    lines: [
      kr('Karte Nummer drei:', goldCard('Üben Sie nur, üben Sie! Ich habe genug geübt. Und sehen Sie, was aus mir geworden ist: ein Meisterdieb!')),
      ada('Ich muss kurz … nach dem Ofen sehen.'),
      sys('Ada ist offline.'),
    ],
  },
];
