// Nebenszenen in Akt 3: Humor, Stimmung, Stadtleben im Untergrund. Jede ist eine Mini-Szene mit 1–4 Nachrichten.
// Innerhalb eines Strangs laufen sie in Reihenfolge, die Stränge wechseln sich ab (domain/story.ts); sie kommen nur bei
// Durchgängen in Akt 3 (ihr `fromLesson` liegt im Modul `m3`). Nur der Strang `durchsage` hat Varianten: er reagiert auf den Extra-Fall (vor dem Fall 4b, danach 4).
// Quelle der Texte: Drehbuch Akt 3 (liegt nicht im Repository), „Nebenszenen in Akt 3“. Szenen-IDs nie umbenennen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, goldCard, hub, jun, kr } from '../builders.ts';

type Side = Extract<StoryScene['trigger'], { on: 'side' }>;
const side = (strand: string, order: number, fromLesson: string, x: Partial<Side> = {}): StoryScene['trigger'] => ({ on: 'side', strand, order, fromLesson, ...x });

export const SIDE_SCENES: StoryScene[] = [
  // Ortruds Durchsagen (Qwertz-Flüstern, ab Auftrag 1 nach dem Abschluss; Juna zitiert)
  {
    id: 'a3-side-durchsage-1',
    chat: 'fluestern',
    trigger: side('durchsage', 1, 'm3-l1', { afterScene: 'a3-l1-done' }),
    lines: [jun('DURCHSAGE von Ortrud: „ ächster Halt: Bah hof.“ Sie sagt die Lücken MIT. Als Pause. 😂')],
  },
  {
    id: 'a3-side-durchsage-2',
    chat: 'fluestern',
    trigger: side('durchsage', 2, 'm3-l1'),
    lines: [jun('DURCHSAGE: „Zug endet hier. Wegen Buchstabe angel.“ Ortrud sagt, das sei kein Fehler. Nur Zustand.')],
  },
  {
    id: 'a3-side-durchsage-3',
    chat: 'fluestern',
    trigger: side('durchsage', 3, 'm3-l1'),
    lines: [jun('DURCHSAGE: „Vorsicht, Bahnsteigkante. Die Kante ist da. Die Buchstaben nicht.“ Ortrud. Trocken.')],
  },
  // Reaktion auf den Extra-Fall „Die verschluckte Durchsage“: ohne den Fall (4b) und danach (4, letzte des Strangs)
  {
    id: 'a3-side-durchsage-4b',
    chat: 'fluestern',
    trigger: side('durchsage', 4, 'm3-l1', { untilCase: 'verschluckte-durchsage' }),
    lines: [jun('DURCHSAGE: „Bitte alle au teigen.“ Ortrud: „Wer das versteht, darf raus.“ Alle sind raus.')],
  },
  {
    id: 'a3-side-durchsage-4',
    chat: 'fluestern',
    trigger: side('durchsage', 5, 'm3-l1', { afterCase: 'verschluckte-durchsage' }),
    lines: [jun('DURCHSAGE: „Nächster Halt: Markt.“ KOMPLETT. Alle Buchstaben. Ortrud klang fast enttäuscht.')],
  },

  // Junas Funker-Protokoll (ZEHN intern, ab Auftrag 1 nach dem Abschluss; sie übertreibt)
  {
    id: 'a3-side-funker-1',
    chat: 'intern',
    trigger: side('funker', 1, 'm3-l1', { afterScene: 'a3-l1-done' }),
    lines: [jun('FUNKER-PROTOKOLL 1: Funkgerät um drei Uhr nachts getestet. Mama war nicht begeistert.'), kr('Ich war begeistert. Ich schlafe nie. (Ich lade.)')],
  },
  {
    id: 'a3-side-funker-2',
    chat: 'intern',
    trigger: side('funker', 2, 'm3-l1'),
    lines: [jun('FUNKER-PROTOKOLL 2: Verdächtige Geräusche im Tunnel gemeldet. War Krümel. Beim Laden. Er schnarcht.'), kr('Drohnen schnarchen nicht. Das war mein Lüfter. (Okay. Ich schnarche.)')],
  },
  {
    id: 'a3-side-funker-3',
    chat: 'intern',
    trigger: side('funker', 3, 'm3-l1'),
    lines: [jun('FUNKER-PROTOKOLL 3: Heute dreimal „over“ gesagt. Niemand sagt „over“. Ich sag es trotzdem. Over. 😎')],
  },

  // Krümels Déjà-vus (Chat Krümel, ab Auftrag 1 nach dem Abschluss; die dritte erst nach Keks’ Box, damit Keks nicht vorher verraten wird)
  {
    id: 'a3-side-dejavu-1',
    chat: 'kruemel',
    trigger: side('dejavu', 1, 'm3-l1', { afterScene: 'a3-l1-done' }),
    lines: [kr('Déjà-vu 1: Ich wusste, wo der Lichtschalter im Tunnel ist. Links, hinterm Kabel. Ich war nie hier.')],
  },
  {
    id: 'a3-side-dejavu-2',
    chat: 'kruemel',
    trigger: side('dejavu', 2, 'm3-l1'),
    lines: [kr('Déjà-vu 2: Die Rolltreppe am Bahnhof quietscht bei Stufe 14. Ich hab bei Stufe 13 gezuckt. Vorher.')],
  },
  {
    id: 'a3-side-dejavu-3',
    chat: 'kruemel',
    trigger: side('dejavu', 3, 'm3-l1', { afterScene: 'a3-l5-s75' }),
    lines: [kr('Déjà-vu 3, aufgeklärt: Der Schrank im HQ. Ich kenne das Scharnier von innen. Jetzt weiß ich, warum.')],
  },

  // Kringel-Bericht (ZEHN intern, ab Auftrag 2)
  {
    id: 'a3-side-kringel-1',
    chat: 'intern',
    trigger: side('kringel', 1, 'm3-l2'),
    lines: [kr('Kringel-Bericht: Kringel bringt die Post jetzt mit der U-Bahn. „Wegen der Beine.“ Er wohnt nebenan.')],
  },
  {
    id: 'a3-side-kringel-2',
    chat: 'intern',
    trigger: side('kringel', 2, 'm3-l2'),
    lines: [kr('Kringel-Bericht: Kringel hat Ortrud einen Brief gegeben. Für Ada. Ortrud hat ihn vorgelesen. Im Zug.'), kr('Kringel ist ausgestiegen. Zwischen zwei Stationen.')],
  },
  {
    id: 'a3-side-kringel-3',
    chat: 'intern',
    trigger: side('kringel', 3, 'm3-l2'),
    lines: [ada('Kringel hat gefragt, ob ich mit in die U-Bahn fahre. Einfach so. Hin und zurück.'), kr('Und?'), ada('Ich hab gesagt, ich fahre nicht gern Bahn. Das stimmt nicht.')],
  },

  // Goldrand-Post aus dem Untergrund (ZEHN intern, ab Auftrag 1; die zweite nach der Stufe 50 %, die dritte nach Frau Hubbels Auftritt)
  {
    id: 'a3-side-post-1',
    chat: 'intern',
    trigger: side('post', 1, 'm3-l1', { afterScene: 'a3-l1-done' }),
    lines: [kr('Goldrand-Karte, am Fahrkartenautomaten:', goldCard('Der Automat nimmt kein Kleingeld. Ich auch nicht. B. v. B.'))],
  },
  {
    id: 'a3-side-post-2',
    chat: 'intern',
    trigger: side('post', 2, 'm3-l1', { afterScene: 'a3-l1-s50' }),
    lines: [kr('Karte zwei, im Nachtzug, Sitz 7:', goldCard('Hier habe ich geübt. Jeden Morgen. Zwei Finger. Fragen Sie Ada nicht. B. v. B.'))],
  },
  {
    id: 'a3-side-post-3',
    chat: 'intern',
    trigger: side('post', 3, 'm3-l1', { afterScene: 'a3-l3-s75' }),
    lines: [
      kr('Karte drei, unter Frau Hubbels Trillerpfeife:', goldCard('Hochverehrte Frau Hubbel. Sie pfeifen noch genau wie damals. Leider. B. v. B.')),
      hub('Er hat Manieren. Hatte er immer. Nur keine Geduld.'),
    ],
  },

  // Frau Hubbels Archivregeln (ZEHN intern, ab Auftrag 3 nach ihrem Auftritt)
  {
    id: 'a3-side-hubbel-1',
    chat: 'intern',
    trigger: side('hubbel', 1, 'm3-l3', { afterScene: 'a3-l3-s75' }),
    lines: [
      hub('Archivregel 1: Akten werden gelesen, nicht gefaltet. Krümel, das Blatt in deinem Fach ist gefaltet.'),
      kr('Das ist ein Croissant. 🥐'),
      hub('Dann gilt Regel 1 trotzdem.'),
    ],
  },
  {
    id: 'a3-side-hubbel-2',
    chat: 'intern',
    trigger: side('hubbel', 2, 'm3-l3'),
    lines: [hub('Archivregel 2: Wer hier unten tippt, sitzt gerade. Ich sehe euch nicht. Ich höre es trotzdem.'), jun('Sie hat RECHT. Ich saß krumm. Woher WEISS sie das?!')],
  },
  {
    id: 'a3-side-hubbel-3',
    chat: 'intern',
    trigger: side('hubbel', 3, 'm3-l3'),
    lines: [hub('Archivregel 3: Jede Akte bekommt ein Ende. Auch deine, Ada. Du weißt, welche ich meine.'), ada('Ja, Frau Hubbel.'), hub('Gut. Ich warte. Das kann ich.')],
  },
];
