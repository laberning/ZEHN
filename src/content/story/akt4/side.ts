// Nebenszenen in Akt 4: Humor, Stimmung, Stadtleben im kleingemachten Bad Qwertz. Jede ist eine Mini-Szene mit 1–4 Nachrichten.
// Innerhalb eines Strangs laufen sie in Reihenfolge, die Stränge wechseln sich ab (domain/story.ts); sie kommen nur bei
// Durchgängen in Akt 4 (ihr `fromLesson` liegt im Modul `m4`). Akt 4 hat keinen Extra-Fall, darum keine Varianten.
// Das Qwertz-Flüstern ist bis zum Ende von Auftrag 2 klein (Strang `klein`, `untilLesson`); Hilde Hupfs HUPF-UPDATES (Strang `fest`)
// brauchen große Buchstaben und beginnen darum erst mit Auftrag 3.
// Quelle der Texte: Drehbuch Akt 4 (liegt nicht im Repository), „Nebenszenen in Akt 4“. Szenen-IDs nie umbenennen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, goldCard, jun, kr } from '../builders.ts';

type Side = Extract<StoryScene['trigger'], { on: 'side' }>;
const side = (strand: string, order: number, fromLesson: string, x: Partial<Side> = {}): StoryScene['trigger'] => ({ on: 'side', strand, order, fromLesson, ...x });

export const SIDE_SCENES: StoryScene[] = [
  // Krümels GROSSE Tage (Chat Krümel, ab Auftrag 1 nach der Stufe 25 %; verdächtig perfekt, nichts wird aufgelöst)
  {
    id: 'a4-side-grosse-tage-1',
    chat: 'kruemel',
    trigger: side('grosse-tage', 1, 'm4-l1', { afterScene: 'a4-l1-s25' }),
    lines: [kr('GROSSER TAG 1: Heute Alle Wörter Groß Geschrieben. Ging Von Allein. Ich Weiß Nicht, Warum. ⚡')],
  },
  {
    id: 'a4-side-grosse-tage-2',
    chat: 'kruemel',
    trigger: side('grosse-tage', 2, 'm4-l1'),
    lines: [kr('GROSSER TAG 2: Ada hat gefragt, ob ich neu bin. Ich hab gesagt: nein. Sie hat gesagt: hm.')],
  },
  {
    id: 'a4-side-grosse-tage-3',
    chat: 'kruemel',
    trigger: side('grosse-tage', 3, 'm4-l1'),
    lines: [kr('GROSSER TAG 3: Ich hab versucht, einen Fehler zu machen. Absichtlich. Ging nicht. Kein Witz.')],
  },

  // Junas Kanal in Kleinbuchstaben (Qwertz-Flüstern, bis Auftrag 2 geschafft ist; sie leidet)
  {
    id: 'a4-side-klein-1',
    chat: 'fluestern',
    trigger: side('klein', 1, 'm4-l1', { untilLesson: 'm4-l2' }),
    lines: [jun('mein kanal ist klein. ich bin klein. hilfe.')],
  },
  {
    id: 'a4-side-klein-2',
    chat: 'fluestern',
    trigger: side('klein', 2, 'm4-l1', { untilLesson: 'm4-l2' }),
    lines: [jun('ich hab versucht zu schreien. es kam flüstern raus. so fühlt sich ortrud an. jeden tag.')],
  },
  {
    id: 'a4-side-klein-3',
    chat: 'fluestern',
    trigger: side('klein', 3, 'm4-l1', { untilLesson: 'm4-l2' }),
    lines: [jun('qwertz-flüstern heißt jetzt wirklich flüstern. ortrud sagt: endlich. ich sag: nein. leise.')],
  },

  // Hilde Hupfs Festvorbereitung (Qwertz-Flüstern, ab Auftrag 3, wenn Junas Kanal wieder groß ist; Juna zitiert die Bürgermeisterin)
  {
    id: 'a4-side-fest-1',
    chat: 'fluestern',
    trigger: side('fest', 1, 'm4-l3'),
    lines: [jun('HUPF-UPDATE: Hupf probt ihre Rede. „liebe bürgerinnen“ klingt klein, sagt sie. Es IST klein.')],
  },
  {
    id: 'a4-side-fest-2',
    chat: 'fluestern',
    trigger: side('fest', 2, 'm4-l3'),
    lines: [jun('HUPF-UPDATE: Festplakat da. Alles klein. Hupf: „Dann feiern wir leise.“ Sie hat es GESCHRIEN. 😂')],
  },
  {
    id: 'a4-side-fest-3',
    chat: 'fluestern',
    trigger: side('fest', 3, 'm4-l3'),
    lines: [jun('HUPF-UPDATE: Hupf bittet um Hilfe. Per Brief. An „die backstube, bitte weiterleiten“. Erledigt.')],
  },

  // Goldrand-Post vom Turm (ZEHN intern, ab Auftrag 2 nach der Stufe 75 %; der Baron wird weicher, die dritte Karte nach Adas Geständnis)
  {
    id: 'a4-side-post-1',
    chat: 'intern',
    trigger: side('post', 1, 'm4-l2', { afterScene: 'a4-l2-s75' }),
    lines: [kr('Goldrand-Karte, heute im Briefkasten der Backstube:', goldCard('Grüßen Sie Ada. Nein. Vergessen Sie das. B. v. B.'))],
  },
  {
    id: 'a4-side-post-2',
    chat: 'intern',
    trigger: side('post', 2, 'm4-l2'),
    lines: [
      kr('Karte zwei, unter der Backstubentür:', goldCard('Der Turm hat 112 Stufen. Ich zähle sie jeden Abend. Allein. B. v. B.')),
      jun('Das ist TRAURIG. Darf ein Dieb traurig sein?'),
    ],
  },
  {
    id: 'a4-side-post-3',
    chat: 'intern',
    trigger: side('post', 3, 'm4-l2', { afterScene: 'a4-l3-s75' }),
    lines: [
      kr('Karte drei, unter dem Kipferlblech:', goldCard('Die Kipferl waren gut. Wie immer. Sagen Sie es ihr nicht. B.')),
      ada('Ich hab es gelesen. Sagt es ihm nicht.'),
    ],
  },

  // Adas Vanillekipferl-Rezept (ZEHN intern, ab Auftrag 3 nach der Stufe 75 %; das Geständnis ist gesagt)
  {
    id: 'a4-side-rezept-1',
    chat: 'intern',
    trigger: side('rezept', 1, 'm4-l3', { afterScene: 'a4-l3-s75' }),
    lines: [ada('Vanillekipferl, Schritt 1: 200 Gramm Mehl. Benno hat es immer verschüttet. Daher der Mehlsack.')],
  },
  {
    id: 'a4-side-rezept-2',
    chat: 'intern',
    trigger: side('rezept', 2, 'm4-l3'),
    lines: [ada('Schritt 2: Butter kalt. Er hat sie mit den Händen warm gemacht. Zwei Finger, zehn Grad zu warm.')],
  },
  {
    id: 'a4-side-rezept-3',
    chat: 'intern',
    trigger: side('rezept', 3, 'm4-l3'),
    lines: [ada('Schritt 3: Vanille, echte. Er hat einmal die ganze Schote reingetan. Keks roch drei Tage.'), kr('Ich rieche noch. 🍪')],
  },

  // Kringel-Bericht, Zeitungsphase (ZEHN intern, ab Auftrag 1)
  {
    id: 'a4-side-kringel-1',
    chat: 'intern',
    trigger: side('kringel', 1, 'm4-l1'),
    lines: [kr('Kringel-Bericht: Kringel bringt jeden Morgen die Zeitung. Kleingeschrieben. Er liest Ada vor. Leise.')],
  },
  {
    id: 'a4-side-kringel-2',
    chat: 'intern',
    trigger: side('kringel', 2, 'm4-l1'),
    lines: [kr('Kringel-Bericht: Kringel hat ein großes K geübt. Auf dem Brief an Ada. Es ist ein kleines k mit Hut.')],
  },
  {
    id: 'a4-side-kringel-3',
    chat: 'intern',
    trigger: side('kringel', 3, 'm4-l1'),
    lines: [kr('Kringel-Bericht: Kringel hat Ada Blumen gebracht. Große.'), ada('Sonnenblumen.'), kr('Kringel fragt: Groß genug?')],
  },
];
