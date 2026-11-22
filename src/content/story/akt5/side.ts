// Nebenszenen in Akt 5: Humor und Stadtleben, diesmal im Schatten des Tiefpunkts. Jede ist eine Mini-Szene mit 1–4 Nachrichten.
// Innerhalb eines Strangs laufen sie in Reihenfolge, die Stränge wechseln sich ab (domain/story.ts); sie kommen nur bei
// Durchgängen in Akt 5 (ihr `fromLesson` liegt im Modul `m5`). Akt 5 hat keinen Extra-Fall, darum keine Varianten.
// Junas Chaos-Ticker (Strang `chaos`) endet mit Auftrag 1, bevor sie geht; Krümels Piep-Tagebuch (Strang `piep`) beginnt, wenn er nur noch piept
// (nach `a5-l2-done`), und endet mit Auftrag 3 (zwei lebende Szenen, die dritte ist stillgelegt); die Stränge in ZEHN intern erzählen Ada und Frau Hubbel, weil Krümel ab Auftrag 2 nicht erzählen kann.
// Quelle der Texte: Drehbuch Akt 5 (liegt nicht im Repository), „Nebenszenen in Akt 5“. Szenen-IDs nie umbenennen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, hub, jun, kr } from '../builders.ts';

type Side = Extract<StoryScene['trigger'], { on: 'side' }>;
const side = (strand: string, order: number, fromLesson: string, x: Partial<Side> = {}): StoryScene['trigger'] => ({ on: 'side', strand, order, fromLesson, ...x });

export const SIDE_SCENES: StoryScene[] = [
  // Satzzeichen-Chaos (Qwertz-Flüstern, bis Auftrag 1 geschafft ist; Juna berichtet aus der Stadt, ihre Zeichen sind noch alle durcheinander)
  {
    id: 'a5-side-chaos-1',
    chat: 'fluestern',
    trigger: side('chaos', 1, 'm5-l1', { untilLesson: 'm5-l1' }),
    lines: [
      jun('CHAOS-TICKER: Beim Bäcker: Brötchen frisch Montag geschlossen. Keiner weiß, ob Montag frisch ist. 🙄'),
    ],
  },
  {
    id: 'a5-side-chaos-2',
    chat: 'fluestern',
    trigger: side('chaos', 2, 'm5-l1', { untilLesson: 'm5-l1' }),
    lines: [
      jun('CHAOS-TICKER: Kringels Zettel: Ada ich komme Kringel. Ada liest: Ich komme, Kringel? Kringel: rot.'),
    ],
  },
  {
    id: 'a5-side-chaos-3',
    chat: 'fluestern',
    trigger: side('chaos', 3, 'm5-l1', { untilLesson: 'm5-l1' }),
    lines: [
      jun('CHAOS-TICKER: Hupf im Rathaus: Wir feiern Opa Also wir feiern Also OPA. Alle lachen. Hupf nicht. 😂'),
    ],
  },

  // Krümels Piep-Tagebuch (Chat Krümel, ab Auftrag 2 nach dem Abschluss, bis Auftrag 3; nur Piep, in Stufen, ohne Emoji)
  {
    id: 'a5-side-piep-1',
    chat: 'kruemel',
    trigger: side('piep', 1, 'm5-l2', { afterScene: 'a5-l2-done', untilLesson: 'm5-l3' }),
    lines: [
      kr('Piep.'),
    ],
  },
  {
    id: 'a5-side-piep-2',
    chat: 'kruemel',
    trigger: side('piep', 2, 'm5-l2', { afterScene: 'a5-l2-done', untilLesson: 'm5-l3' }),
    lines: [
      kr('Piep. Piep. (Übersetzung: Hallo. Oder: Hunger. Beides.)'),
    ],
  },
  // Stillgelegt (Revision nach der Gesamtprüfung): das Fenster bis Auftrag 3 ist zu eng für drei Piep-Szenen. Wer sie schon gelesen hat, behält sie.
  {
    id: 'a5-side-piep-3',
    chat: 'kruemel',
    retired: { since: 14 },
    trigger: side('piep', 3, 'm5-l2', { afterScene: 'a5-l2-done', untilLesson: 'm5-l3' }),
    lines: [
      kr('Piep. Piep. Piep. (Drei. Ein Satz. Übersetzung: noch da.)'),
    ],
  },

  // Agent Kringel (ZEHN intern, ab Auftrag 1; Ada berichtet, Kringel weiß jetzt alles und ist unbrauchbar)
  {
    id: 'a5-side-kringel-1',
    chat: 'intern',
    trigger: side('kringel', 1, 'm5-l1'),
    lines: [
      ada('Kringel-Bericht: Kringel trägt jetzt Mantel und Hut. Im Keller. Bei 24 Grad. Er sagt: Tarnung.'),
    ],
  },
  {
    id: 'a5-side-kringel-2',
    chat: 'intern',
    trigger: side('kringel', 2, 'm5-l1'),
    lines: [
      ada('Kringel-Bericht: Kringel hat ein Codewort: Brötchen. Er sagt es zu jedem, der reinkommt. Laut.'),
    ],
  },
  {
    id: 'a5-side-kringel-3',
    chat: 'intern',
    trigger: side('kringel', 3, 'm5-l1'),
    lines: [
      ada('Kringel-Bericht: Kringel will ein Abzeichen. Ich hab ihm einen Keks gegeben. Er trägt ihn am Mantel.'),
    ],
  },

  // Hupfs Führung (ZEHN intern, ab Auftrag 1; Ada berichtet, Hilde Hupf wird zitiert)
  {
    id: 'a5-side-fuehrung-1',
    chat: 'intern',
    trigger: side('fuehrung', 1, 'm5-l1'),
    lines: [
      ada('Führung, Tag 1: zwölf Leute. Hupf zeigt auf Krümel: „Der Computer.“ Auf mich: „Die Bäckerin.“'),
    ],
  },
  {
    id: 'a5-side-fuehrung-2',
    chat: 'intern',
    trigger: side('fuehrung', 2, 'm5-l1'),
    lines: [
      ada('Führung, Tag 2: Hupf verlangt Eintritt. Für die Stadtkasse. Ich verkaufe Brötchen an alle zwölf.'),
    ],
  },
  {
    id: 'a5-side-fuehrung-3',
    chat: 'intern',
    trigger: side('fuehrung', 3, 'm5-l1'),
    lines: [
      ada('Führung, Tag 3: Ein Kind fragt nach den Agenten. Hupf: „Im Einsatz.“ Kind: „Wo?“ Hupf: „Geheim.“'),
    ],
  },

  // Frau Hubbel über Ada (ZEHN intern, ab Auftrag 2 nach der Stufe 75 %; die Strenge hat eine Herkunft, keine Entschuldigung)
  {
    id: 'a5-side-hubbel-1',
    chat: 'intern',
    trigger: side('hubbel', 1, 'm5-l2', { afterScene: 'a5-l2-s75' }),
    lines: [
      hub('Ada, zwei Finger, drei Jahre lang. Ich habe nichts gesagt. Ich habe gewartet.'),
      ada('Lange.'),
      hub('Ja.'),
    ],
  },
  {
    id: 'a5-side-hubbel-2',
    chat: 'intern',
    trigger: side('hubbel', 2, 'm5-l2', { afterScene: 'a5-l2-s75' }),
    lines: [
      hub('Mit dreizehn schrie sie: Ich kann das nicht! Ich sagte: Noch nicht. Das Wort hat sie gehasst.'),
    ],
  },
  {
    id: 'a5-side-hubbel-3',
    chat: 'intern',
    trigger: side('hubbel', 3, 'm5-l2', { afterScene: 'a5-l2-s75' }),
    lines: [
      hub('Ich habe gewartet, sie hat geschrien. Beides hat sie behalten. Diese Woche hörte ich beides.'),
      ada('Ja, Frau Hubbel.'),
      hub('Gut. Jetzt hol sie zurück.'),
    ],
  },
];
