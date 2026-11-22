// Die drei Extra-Fälle von Akt 1 und ihre Szenen: Ankündigung (Krümel, ohne Spoiler), Intro und Outro.
// Quelle: docs/design/belohnungen.md, „Extra-Fälle in Akt 1“. Die Fälle selbst stehen oben in dieser Datei; der Text der Karte im Outro kommt aus `reveal`.

import type { ExtraCase } from '../../../domain/cases.ts';
import type { StoryScene } from '../../../domain/scenes.ts';
import { itemDescription } from '../../items.ts';
import { ada, ans, inChat, jun, kr } from '../builders.ts';

// Extra-Fälle von Akt 1: je ein Gadget (aus der Spielhalle) öffnet einen Fall, der ein neues Gadget bringt.
// Quelle: docs/design/belohnungen.md.
export const CASES: ExtraCase[] = [
  {
    id: 'seifenblasen-brunnen',
    picture: 'brunnen',
    title: 'Der Seifenblasen-Brunnen',
    fromLesson: 'm1-l3',
    needs: 'buchstabenkescher',
    frame: 'Seifenblasen fangen',
    reveal: { title: 'In den Blasen steht:', text: 'TIPPNIX – BALD AUCH IN IHRER STADT' },
    gives: 'blasenwerfer',
  },
  {
    id: 'kringels-briefkasten',
    picture: 'briefkasten',
    title: 'Kringels Briefkasten',
    fromLesson: 'm1-l3',
    needs: 'stethoskop',
    frame: 'Klickfolge horchen',
    reveal: { title: 'Im Briefkasten liegt ein Umschlag:', text: 'Für Ada' },
    gives: 'lupe',
  },
  {
    id: 'junas-liste',
    picture: 'rotlicht-zettel',
    title: 'Junas geheime Liste',
    fromLesson: 'm1-l6',
    afterScene: 'l6-s50',
    needs: 'rotlicht-lampe',
    frame: 'Unsichtbare Tinte lesen',
    reveal: { title: 'Unter Rotlicht steht auf dem Zettel:', text: 'VERDÄCHTIGE: 1. Kringel (Feder!) 2. WER klebt nachts Buchstaben zurück??? 3. {vorname} (geht dauernd in den Keller)' },
    gives: 'walkie-talkie',
  },
];

const reveal = (id: string) => CASES.find((c) => c.id === id)!.reveal;
/** Das Bild des Falls (in der Ankündigung) */
const picture = (id: string) => ({ picture: CASES.find((c) => c.id === id)!.picture });
/** Ankündigung: ein Satz zum Fall, dann der Weg dorthin */
const open = (id: string, caseId: string, text: string): StoryScene => ({
  id,
  chat: 'kruemel',
  trigger: { on: 'caseOpen', caseId },
  lines: [kr(text, picture(caseId)), kr('Neuer Extra-Fall – im Hauptquartier unter „Extra“.')],
});

export const CASE_SCENES: StoryScene[] = [
  // ---------- Der Seifenblasen-Brunnen ----------
  open('case-seifenblasen-open', 'seifenblasen-brunnen', 'Psst! Am Markt benimmt sich der Brunnen komisch. Mit deinem Buchstabenkescher könntest du helfen.'),
  {
    id: 'case-seifenblasen-intro',
    chat: 'intern',
    trigger: { on: 'case', caseId: 'seifenblasen-brunnen', part: 'intro' },
    lines: [
      kr('Der Brunnen am Markt spuckt Seifenblasen. Und in jeder schwebt ein Buchstabe!'),
      kr('Kescher raus! Fang die Blasen ab – ich lese mit.'),
    ],
  },
  {
    id: 'case-seifenblasen-outro',
    chat: 'intern',
    trigger: { on: 'case', caseId: 'seifenblasen-brunnen', part: 'outro' },
    lines: [
      kr('Alle Blasen gefangen! Zusammen ergeben sie:', { card: { title: reveal('seifenblasen-brunnen').title, text: reveal('seifenblasen-brunnen').text } }),
      kr('Werbung? In unserem Brunnen? Für TIPPNIX? Wer macht denn so was?'),
      ada('Brunnen sind für Wasser da. Nicht für Werbung.'),
      kr('Im Brunnen steckte eine Blasenmaschine. Daraus hab ich dir einen Blasenwerfer gebaut.', { item: 'blasenwerfer' }),
    ],
  },

  // ---------- Kringels Briefkasten ----------
  open('case-briefkasten-open', 'kringels-briefkasten', 'Piep! Kringel steht am Markt und sieht sehr unglücklich aus. Dein Stethoskop könnte helfen.'),
  {
    id: 'case-briefkasten-intro',
    chat: 'intern',
    trigger: { on: 'case', caseId: 'kringels-briefkasten', part: 'intro' },
    lines: [
      kr('Live vom Markt: Kringel hat sich aus seinem eigenen Briefkasten ausgesperrt!'),
      kr('Horch das Buchstabenschloss ab und tippe die Klickfolge!'),
    ],
  },
  {
    id: 'case-briefkasten-outro',
    chat: 'intern',
    trigger: { on: 'case', caseId: 'kringels-briefkasten', part: 'outro' },
    lines: [
      kr('Klick! Das Schloss ist offen. Drinnen liegt ein Briefumschlag.', { card: { title: reveal('kringels-briefkasten').title, text: reveal('kringels-briefkasten').text } }),
      kr('Kringel ist knallrot. Röter als Adas Ofenhandschuh.', {
        choices: [
          ans('mut', 'Mut machen', 'Sag ihm, er soll ihn ihr einfach geben!', [kr('Kringel sagt: „Morgen. Ganz bestimmt. Vielleicht.“')]),
          ans('nicht-lesen', 'Nicht lesen', 'Sag ihm, wir lesen den nicht.', [kr('Kringel sagt, du bist ein Ehrenmensch.')]),
        ],
      }),
      kr(`Er schenkt dir zum Dank seine Lupe. „${itemDescription('lupe')}“`, { item: 'lupe' }),
    ],
  },

  // ---------- Junas geheime Liste ----------
  open('case-liste-open', 'junas-liste', 'Juna hat am Kiosk einen Zettel verloren. Er sieht leer aus. Hast du deine Rotlicht-Lampe dabei?'),
  {
    id: 'case-liste-intro',
    chat: 'intern',
    trigger: { on: 'case', caseId: 'junas-liste', part: 'intro' },
    lines: [
      kr('Ich hab Junas leeren Zettel eingesammelt. Leer? Bei Juna? Nie im Leben.'),
      kr('Rotlicht an! 🔦'),
      ada('Und danach bringst du ihn zurück. Fremde Sachen behält man nicht.'),
    ],
  },
  {
    id: 'case-liste-outro',
    chat: 'juna',
    trigger: { on: 'case', caseId: 'junas-liste', part: 'outro' },
    lines: [
      inChat('kruemel', kr('Unter Rotlicht wird die Schrift sichtbar!', { card: { title: reveal('junas-liste').title, text: reveal('junas-liste').text } })),
      inChat('kruemel', kr('Du stehst zweimal drauf. Auf Platz 2 und auf Platz 3. Ich bin so stolz.')),
      jun('Hey! Ich glaub, mir ist ein Zettel verloren gegangen. Hast du den zufällig???', {
        choices: [
          ans('zurueck', 'Einfach zurück', 'Hier, den hast du verloren.', [jun('… Hast du den GELESEN?! Egal. Danke.')]),
          ans('witz', 'Mit Witz', 'Hier. Und schreib mich auf Platz 1.', [jun('HA. Okay, das war gut. 😂')]),
        ],
      }),
      jun('Behalt das Walkie-Talkie. Ich hab zwei. Dann kann ich dich nerven.', { item: 'walkie-talkie' }),
    ],
  },
];
