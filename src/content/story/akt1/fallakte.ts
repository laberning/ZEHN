// Fallakte von Akt 1: was der Akt gelöst hat und welche Spuren offen bleiben. Kein Datum, kein Countdown,
// nichts zu dem, was erst in späteren Akten aufgelöst wird (Story-Regel 11: erst Triumph, dann Haken).

import { FUNKTURM_CARD } from './chat.ts';
import type { Fallakte } from '../../../domain/book.ts';

export const FALLAKTE: Fallakte = {
  title: 'Fallakte Akt 1',
  header: 'Der Baron plant schon seinen nächsten Coup …',
  solved: [
    { text: 'Das F ist gerettet.' },
    { text: 'G und H sind zurück am Markt.', picture: 'schilder-100' },
    { text: 'Der Baron hat einen Namen: Baron von Backspace.' },
  ],
  firewall: { passed: 'Firewall: gehalten', backdoor: 'Firewall: wackelig – Einsatz nachholen' },
  open: [
    { text: 'Wer ist neben Ada auf dem Foto?', picture: 'halbes-foto' },
    { text: 'Warum riecht Krümel nach Vanille?' },
    { text: 'Wo ist das O?', picture: 'ortsschild' },
    { text: 'Was bedeutet der Funkturm?', card: FUNKTURM_CARD },
  ],
  suspects: [
    {
      name: 'Herr Kringel',
      status: 'verdaechtig',
      text: 'Eine Feder am Hut. Ada sagt: Wattebausch.',
      picture: 'portraet-kringel',
      hits: [{ text: 'Kringel hattest du zuerst im Verdacht.', ifPicked: { scene: 'l2-s75', choice: 'verdaechtig' } }],
    },
    {
      name: 'Baron von Backspace',
      status: 'gesucht',
      text: 'Sein Name ist bekannt. Sein Gesicht: nur ein Zylinder.',
      picture: 'portraet-baron',
      hits: [
        { text: '„Zylinder“ hast du zuerst gesagt.', ifPicked: { scene: 'l5-s75', choice: 'zylinder' } },
        { text: 'Du hast ihn einen Dieb mit Stil genannt.', ifPicked: { scene: 'l1-done', choice: 'dieb' } },
        { text: 'Du hast ihn einen Buchstaben-Fan genannt.', ifPicked: { scene: 'l1-done', choice: 'fan' } },
      ],
    },
  ],
  closing: 'Den Rest knacken wir als Nächstes. Bis dahin: Spielhalle und Training.',
};
