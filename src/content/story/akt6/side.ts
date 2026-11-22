// Nebenszenen in Akt 6: Humor und Stadtleben rund um die Zahlen. Jede ist eine Mini-Szene mit 1–4 Nachrichten.
// Innerhalb eines Strangs laufen sie in Reihenfolge, die Stränge wechseln sich ab (domain/story.ts); sie kommen nur bei
// Durchgängen in Akt 6 (ihr `fromLesson` liegt im Modul `m6`). Akt 6 hat keinen Extra-Fall, darum keine Varianten.
// „???“ erzählt seine Coups nach `a6-l2-s50` und nur bis Auftrag 4 (Benno heißt erst nach dem Einsatz Benno); Tippi korrigiert Juna
// im Qwertz-Flüstern erst, nachdem sie dem Chat beigetreten ist (`a6-l3-brief`); Juna und „???“ kabbeln sich nach der Vertrauens-Wahl
// (`a6-l3-done`); Adas Kringel-Bericht vom Familienessen kommt nach dem Monokel (`a6-l4-s50`).
// Quelle der Texte: Drehbuch Akt 6 (liegt nicht im Repository), „Nebenszenen in Akt 6“. Szenen-IDs nie umbenennen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, jun, kr, tip, unb } from '../builders.ts';

type Side = Extract<StoryScene['trigger'], { on: 'side' }>;
const side = (strand: string, order: number, fromLesson: string, x: Partial<Side> = {}): StoryScene['trigger'] => ({ on: 'side', strand, order, fromLesson, ...x });

export const SIDE_SCENES: StoryScene[] = [
  // Krümel zählt (Chat Krümel, ab Auftrag 1; was fehlt, zählt er trotzdem)
  {
    id: 'a6-side-zaehlen-1',
    chat: 'kruemel',
    trigger: side('zaehlen', 1, 'm6-l1'),
    lines: [kr('Zählung, Tag 1: Hausnummern: null. Türen: viele. Kringel klingelt an allen. (Nach Gefühl.)')],
  },
  {
    id: 'a6-side-zaehlen-2',
    chat: 'kruemel',
    trigger: side('zaehlen', 2, 'm6-l1'),
    lines: [kr('Zählung, Tag 2: Preise am Kiosk: null. Junas Mama sagt: „Was du willst.“ Kunden: alle. 🍪')],
  },
  {
    id: 'a6-side-zaehlen-3',
    chat: 'kruemel',
    trigger: side('zaehlen', 3, 'm6-l1'),
    lines: [kr('Zählung, Tag 3: Die Marktuhr: leer. Hupf fragt mich alle fünf Minuten. Ich sage: Jetzt. Stimmt. ⚡')],
  },

  // Bennos Coups (ZEHN intern, ab Auftrag 2 nach `a6-l2-s50`, bis Auftrag 4; „???“ erzählt, wie er es gemacht hat)
  {
    id: 'a6-side-coups-1',
    chat: 'intern',
    trigger: side('coups', 1, 'm6-l2', { afterScene: 'a6-l2-s50', untilLesson: 'm6-l4' }),
    lines: [unb('Der Pizzaroboter, meine Lieben: ein Karton, vier Rollen, ich darin. Zwei Stunden. Der Käse war echt.'), kr('(Wir haben ihn gegessen. Den Käse.)')],
  },
  {
    id: 'a6-side-coups-2',
    chat: 'intern',
    trigger: side('coups', 2, 'm6-l2', { afterScene: 'a6-l2-s50', untilLesson: 'm6-l4' }),
    lines: [unb('Der Wetteransager: eine Laufschrift, ein Mikrofon im Brotkorb. „Heiter bis wolkig.“ Ich war stolz.'), ada('Es hat geregnet.')],
  },
  {
    id: 'a6-side-coups-3',
    chat: 'intern',
    trigger: side('coups', 3, 'm6-l2', { afterScene: 'a6-l2-s50', untilLesson: 'm6-l4' }),
    lines: [unb('Der Turm: hundertzwölf Stufen, jede Nacht. Ich wollte, dass Sie kommen. Ich wollte, dass Ada kommt.'), ada('Ich bin gekommen.')],
  },

  // Tippis Korrekturen (Qwertz-Flüstern, ab Auftrag 3 nach `a6-l3-brief`; Juna postet, Tippi korrigiert, das Kind antwortet nicht)
  {
    id: 'a6-side-tippi-1',
    chat: 'fluestern',
    trigger: side('tippi', 1, 'm6-l3', { afterScene: 'a6-l3-brief' }),
    lines: [
      jun('Kanal-News: Die ZEHN hat eine neue Mitleserin. Ungefragt. Sie heißt Tippi. Sie ist ein TOASTER.'),
      tip('Sie ist ein Traum! Gratis, Schätzchen.', { strike: 'Sie ist ein TOASTER' }),
    ],
  },
  {
    id: 'a6-side-tippi-2',
    chat: 'fluestern',
    trigger: side('tippi', 2, 'm6-l3', { afterScene: 'a6-l3-brief' }),
    lines: [jun('Umfrage: Wer will, dass eine Maschine seine Sätze beendet? Stimmt ab!!!'), tip('Stimmt zu! Alle. Gratis. Lollis am Marktplatz.', { strike: 'Stimmt ab' })],
  },
  {
    id: 'a6-side-tippi-3',
    chat: 'fluestern',
    trigger: side('tippi', 3, 'm6-l3', { afterScene: 'a6-l3-brief' }),
    lines: [
      jun('Ich schreibe jetzt ohne Ende, damit sie nichts beenden kann, ich schreibe und schreibe und'),
      tip('und bin fertig! Bitte, Schätzchen. Gratis.', { strike: 'und schreibe und' }),
    ],
  },

  // Kabbelei (ZEHN intern, ab Auftrag 3 nach `a6-l3-done`; Juna und „???“)
  {
    id: 'a6-side-kabbelei-1',
    chat: 'intern',
    trigger: side('kabbelei', 1, 'm6-l3', { afterScene: 'a6-l3-done' }),
    lines: [jun('FRAGE AN DEN NEUEN: Wie viele Finger?'), unb('Zwei, meine Liebe. Und ein Gerät.'), jun('ICH HAB ZEHN. OHNE GERÄT.'), unb('Zehn sind ein Ziel, Fräulein Pösel.')],
  },
  {
    id: 'a6-side-kabbelei-2',
    chat: 'intern',
    trigger: side('kabbelei', 2, 'm6-l3', { afterScene: 'a6-l3-done' }),
    lines: [unb('Fräulein Pösel, Ihre Großbuchstaben sind unerträglich.'), jun('DEINE SCHNÖRKEL AUCH.'), kr('(Beide richtig. Ich speichere das.)')],
  },
  {
    id: 'a6-side-kabbelei-3',
    chat: 'intern',
    trigger: side('kabbelei', 3, 'm6-l3', { afterScene: 'a6-l3-done' }),
    lines: [
      jun('Okay, Baron. Der Pizzaroboter war gut. Da. Gesagt.'),
      unb('… Danke, Fräulein Pösel. Der Beitrag mit den 400 war auch gut. Leider.'),
      jun('Weiß ich. 😎'),
    ],
  },

  // Kringel-Bericht: Familienessen (ZEHN intern, ab Auftrag 4 nach `a6-l4-s50`; Ada berichtet, Kringel wird zitiert)
  {
    id: 'a6-side-kringel-1',
    chat: 'intern',
    trigger: side('kringel', 1, 'm6-l4', { afterScene: 'a6-l4-s50' }),
    lines: [ada('Kringel-Bericht: Kringel hat meinen Neffen zum Essen eingeladen. Ungefragt.'), ada('Tisch für drei. Ich bin hingegangen. Gesagt habe ich wenig.')],
  },
  {
    id: 'a6-side-kringel-2',
    chat: 'intern',
    trigger: side('kringel', 2, 'm6-l4', { afterScene: 'a6-l4-s50' }),
    lines: [ada('Kringel-Bericht: Benno kam mit Hut. Kringel kam mit Hut. Beide blieben mit Hut.'), ada('Kipferl für alle. Keiner sprach.')],
  },
  {
    id: 'a6-side-kringel-3',
    chat: 'intern',
    trigger: side('kringel', 3, 'm6-l4', { afterScene: 'a6-l4-s50' }),
    lines: [ada('Kringel-Bericht: Beim Nachtisch sagte Kringel: „Schöner Hut.“ Benno: „Schöner Mantel.“'), ada('Dann redeten sie. Über Hüte. Zwei Stunden.')],
  },
];
