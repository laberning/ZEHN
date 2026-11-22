// Der Extra-Fall von Akt 3 und seine Szenen: Ankündigung (Krümel, ohne Spoiler), Intro und Outro.
// Quelle der Texte: Drehbuch Akt 3 (liegt nicht im Repository), „Extra-Fall in Akt 3“. Der Text der Karte im Outro kommt aus `reveal`.

import type { ExtraCase } from '../../../domain/cases.ts';
import type { StoryScene } from '../../../domain/scenes.ts';
import { ans, jun, kr } from '../builders.ts';

// Gadget `buchstabenkescher` aus der Spielhalle öffnet den Fall; `tunnel-megafon` ist die Belohnung (zahlt sich in `a3-exam-after` aus)
export const CASES: ExtraCase[] = [
  {
    id: 'verschluckte-durchsage',
    picture: 'durchsage',
    title: 'Die verschluckte Durchsage',
    fromLesson: 'm3-l2',
    afterScene: 'a3-l2-brief',
    needs: 'buchstabenkescher',
    frame: 'Buchstaben im Fahrtwind fangen',
    reveal: { title: 'Die ganze Durchsage:', text: 'Nächster Halt: Markt. Buchstaben bitte liegen lassen. Die gehören der Stadt. – O.' },
    gives: 'tunnel-megafon',
  },
];

const REVEAL = CASES[0]!.reveal;

export const CASE_SCENES: StoryScene[] = [
  {
    id: 'case-durchsage-open',
    chat: 'kruemel',
    trigger: { on: 'caseOpen', caseId: 'verschluckte-durchsage' },
    lines: [
      kr('Psst! Der Zuglautsprecher verschluckt Buchstaben. Sie wehen durch den Tunnel. Hast du den Kescher?', { picture: 'durchsage' }),
      kr('Neuer Extra-Fall – im Hauptquartier unter „Extra“.'),
    ],
  },
  {
    id: 'case-durchsage-intro',
    chat: 'intern',
    trigger: { on: 'case', caseId: 'verschluckte-durchsage', part: 'intro' },
    lines: [
      kr('Ortruds Lautsprecher spuckt nur halbe Wörter. Der Rest fliegt hinten raus. Ich seh ein N wehen.'),
      jun('Ich steh am Bahnsteig. Es REGNET Buchstaben. Ortrud sagt nur: „Zustand.“ 😂'),
      kr('Kescher raus! Fang sie im Fahrtwind, ich sortiere.', {
        choices: [
          ans('los', 'Los!', 'Los, bevor der Zug weg ist!', [kr('Er fährt einmal die Nacht. Wir haben Zeit. Aber nicht viel.')]),
          ans('fernglas', 'Fernglas', 'Mit dem Fernglas: Wo kommen sie raus?', [kr('Aus dem Lautsprecher am letzten Wagen. Er hat ein Loch. Da pfeift es raus.')], { needs: 'fernglas' }),
          ans('blasenwerfer', 'Blasenwerfer', 'Ich pack die Buchstaben in Seifenblasen. Dann wehen sie langsamer.', [jun('Es regnet jetzt BLASEN mit Buchstaben. Ortrud guckt. Ortrud guckt nie. 😮')], { needs: 'blasenwerfer' }),
        ],
      }),
    ],
  },
  {
    id: 'case-durchsage-outro',
    chat: 'intern',
    trigger: { on: 'case', caseId: 'verschluckte-durchsage', part: 'outro' },
    lines: [
      kr('Alle gefangen. Ortruds Durchsage, zum ersten Mal ganz:', { card: { title: REVEAL.title, text: REVEAL.text } }),
      jun('„Die gehören der Stadt.“ Ortrud hat Humor. Trocken wie Zwieback. Hab ich immer gewusst.'),
      kr('Und der Lautsprecher? Ortrud hat ihn abgeschraubt und mir in die Hand gedrückt. Ohne ein Wort.', {
        choices: [
          ans('neu', 'Neuer Lautsprecher?', 'Kriegt der Zug einen neuen?', [kr('Sie sagt die Halte jetzt selbst an. Mit den Lücken. Aus Gewohnheit.')]),
          ans('lupe', 'Lupe', 'Mit der Lupe: Steht was auf dem Lautsprecher?', [kr('Eingeritzt: „O. + Nachtzug“. Ortrud liebt ihren Zug. Mehr wissen wir nicht.')], { needs: 'lupe' }),
          ans('verkleidung', 'Verkleidung', 'Als Schaffner sag ich die Halte an. Ohne Lücken.', [jun('Ortrud hat dich rausgeworfen. Freundlich. „Mein Zug, meine Lücken.“')], { needs: 'verkleidungskoffer' }),
        ],
      }),
      kr('Aus dem Lautsprecher hab ich dir was gebaut: ein Tunnel-Megafon. Der ganze Untergrund hört dich. 📡', { item: 'tunnel-megafon' }),
    ],
  },
];
