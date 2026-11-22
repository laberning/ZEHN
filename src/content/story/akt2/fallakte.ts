// Fallakte von Akt 2: was die obere Reihe gelöst hat und welche Spuren offen bleiben. Kein Datum, kein Countdown,
// nichts zu dem, was erst in späteren Akten aufgelöst wird (Story-Regel 11: erst Triumph, dann Haken).
// Quelle der Texte: Drehbuch Akt 2 (liegt nicht im Repository), Abschnitt „Fallakte Akt 2“.

import type { Fallakte } from '../../../domain/book.ts';

export const FALLAKTE: Fallakte = {
  title: 'Fallakte Akt 2',
  header: 'Oben war er. Jetzt geht es nach unten.',
  solved: [
    { text: 'Der Baron heißt Benno. Er war Adas Lehrling.' },
    { text: 'Der Lavendel kam aus Kringels Postsack. Kringel ist nur verliebt.' },
    { text: 'Alle O sind zurück. Bis auf eins.', picture: 'o-schilder-100' },
    { text: 'Der Wetteransager und der Pizzaroboter: beides der Baron.' },
  ],
  firewall: { passed: 'Verfolgungsjagd: eingeholt', backdoor: 'Verfolgungsjagd: abgehängt – Einsatz nachholen' },
  open: [
    { text: 'Wer hat das O vom Ortsschild?', picture: 'ortsschild' },
    { text: 'Was heißt „Der Teig geht noch“?', card: 'Der Teig geht noch, Ada. B.' },
    { text: 'Was ist unten, wo die Stadt sich erinnert?', picture: 'fahrkarte' },
    { text: 'Warum musste Juna beim „Werbefoto“ nur tippen?' },
  ],
  suspects: [
    {
      name: 'Herr Kringel',
      status: 'entlastet',
      text: 'Lavendel? Parfüm für Ada. Der Brief auch.',
      picture: 'portraet-kringel',
      hits: [{ text: '„Verliebt“ – das hast du gesagt.', ifPicked: { scene: 'a2-l3-s50', choice: 'verliebt' } }],
    },
    {
      name: 'Die Elster',
      status: 'entlastet',
      text: 'Sammelt, was glitzert. Keine Buchstaben.',
      picture: 'portraet-elster',
      hits: [{ text: '„Sie sammelt nur“ – dein Schluss.', ifPicked: { scene: 'a2-l2-s75', choice: 'sammelt' } }],
    },
    {
      name: 'Baron von Backspace',
      status: 'gesucht',
      text: 'Benno, Adas Lehrling. Sendet vom Turm, fährt im Pizzaroboter.',
      picture: 'portraet-baron',
      hits: [
        { text: 'Den Sendeturm hast du zuerst gepeilt.', ifPicked: { scene: 'a2-l1-s75', choice: 'sendeturm' } },
        { text: 'Den Ansager hast du zuerst erkannt.', ifPicked: { scene: 'a2-l3-s75', choice: 'ansager' } },
        { text: '„Weitergegeben“ – dein Schluss.', ifPicked: { scene: 'a2-l4-s75', choice: 'weitergegeben' } },
        { text: 'Im Pizzaroboter steckt der Baron. Dein Treffer.', ifPicked: { scene: 'a2-l5-s75', choice: 'lieben' } },
      ],
    },
  ],
  closing: 'Nächster Halt: unten. Ich hab keine Tiefenangst. Glaub ich.',
};
