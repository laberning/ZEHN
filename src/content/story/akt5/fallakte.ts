// Fallakte von Akt 5: was die Satzzeichen gelöst haben und welche Spuren offen bleiben. Kein Datum, kein Countdown, nichts zu dem,
// was erst in späteren Akten aufgelöst wird: der Text der Akte nennt keinen Namen für „O.“ (Prüfprofil: `otti`).
// Quelle der Texte: Drehbuch Akt 5 (liegt nicht im Repository), Abschnitt „Fallakte Akt 5“.

import type { Fallakte } from '../../../domain/book.ts';

export const FALLAKTE: Fallakte = {
  title: 'Fallakte Akt 5',
  header: 'Ich habe Juna die Schuld gegeben. Es war ein Signal. Und ich.',
  solved: [
    { text: 'Unter Krümels Aufkleber saß ein Chip. Nachts schickte er Krümel Zeichen holen. Krümel wusste nichts.', picture: 'booster-chip' },
    { text: 'Der Chip hört auf ein Signal von draußen. Es kam, seit die Stadt weiß, wo das HQ ist.' },
    { text: 'Krümel hat beim Aufkleber gelogen. Er hat es selbst gesagt. In Bruchstücken, aber ganz.' },
    { text: 'Junas Beitrag hat das HQ bekannt gemacht. Sie hat sich entschuldigt. Ada auch. Gleichzeitig.' },
    { text: 'Die Durchsage läuft wieder. Mit allen Zeichen. Deinen.', picture: 'durchsage-skript' },
    { text: '„Das kam von Junas Post“ – dein Schluss, ohne Vorwurf.', ifPicked: { scene: 'a5-l1-s50', choice: 'post' } },
    { text: 'Du hast am Plakat nach dem Aufkleber gefragt. Darunter saß der Chip.', ifPicked: { scene: 'a4-l2-s50', choice: 'aufkleber' } },
  ],
  firewall: { passed: 'Die Durchsage: alle Zeichen gesetzt, Fest gerettet', backdoor: 'Die Durchsage: Hupf hat selbst gelesen – Einsatz nachholen' },
  open: [
    { text: 'Signal von: O. Wer sendet an Krümel?', card: 'Signal von: O.', picture: 'signal-karte' },
    { text: 'Auf dem Chip ein Logo: ein Lutscher. Wer baut so etwas?', ifPicked: { scene: 'a5-exam-after', choice: 'lupe' } },
    { text: 'Lieferung an O. und Signal von O. Dasselbe O.?' },
    { text: 'Der Baron hat seit dem Turm kein Wort gesagt.' },
    { text: 'Das O vom Ortsschild fehlt noch immer.' },
    { text: 'Du hast erkannt, wie Krümel im Notmodus redet: wie jemand, der Sätze für andere beendet.', ifPicked: { scene: 'a5-l2-s50', choice: 'otti' } },
  ],
  suspects: [
    { name: 'Baron von Backspace', status: 'gesucht', text: 'Benno. Seit dem Turm kein Wort. Die Satzzeichen waren nicht er. Sagt Krümel. Krümel weiß es.', picture: 'portraet-baron', hits: [] },
    { name: 'Ortrud', status: 'entlastet', text: 'War im Stellwerk, als Krümel löschte. Zeugen: ein Zug und Hilde Hupf. Hilft beim Fest.', picture: 'portraet-ortrud', hits: [] },
    {
      name: 'Krümel',
      status: 'entlastet',
      text: 'Gesteuert, nicht schuld. Hat gelogen und es gesagt. Bleibt.',
      picture: 'portraet-kruemel',
      hits: [{ text: '„Mein Freund“ – dein Wort. Er hat es gespeichert.', ifPicked: { scene: 'a5-l3-s50', choice: 'freund' } }],
    },
    {
      name: 'O.',
      status: 'gesucht',
      text: 'Sendet an Krümel. Kennt den Weg ins HQ seit Junas Beitrag. Mehr steht nirgends.',
      picture: 'portraet-unbekannt',
      hits: [{ text: '„Dasselbe O.“ – dein Schluss. Ada glaubt es auch.', ifPicked: { scene: 'a5-exam-after', choice: 'dasselbe' } }],
    },
  ],
  closing: 'Juna zurück. Ada leise. Ich repariert. Piep. Absichtlich.',
};
