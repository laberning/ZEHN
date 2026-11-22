// Fallakte von Akt 3: was die untere Reihe gelöst hat und welche Spuren offen bleiben. Kein Datum, kein Countdown, nichts zu dem,
// was erst in späteren Akten aufgelöst wird (Story-Regel 11: erst Triumph, dann Haken). `keks` ist in Akt 3 gelöst.
// Quelle der Texte: Drehbuch Akt 3 (liegt nicht im Repository), Abschnitt „Fallakte Akt 3“.

import type { Fallakte } from '../../../domain/book.ts';

export const FALLAKTE: Fallakte = {
  title: 'Fallakte Akt 3',
  header: 'Unten liegt die Stadt in Akten. Eine davon ist meine.',
  solved: [
    { text: 'Krümel war Keks, Bennos Drohne. Achtzehn Jahre im Schrank, dann Krümel.', picture: 'ladestation-100' },
    { text: '„Keks ist Krümel“ – du hast es zuerst gesagt.', ifPicked: { scene: 'a3-l3-s75', choice: 'keks' } },
    { text: '„Du warst Keks“ – du hast es Krümel gesagt.', ifPicked: { scene: 'a3-l5-s75', choice: 'keks' } },
    { text: 'Bennos Prüfung: nicht bestanden, zwei Finger, vor allen. Prüferin: Ada.' },
    { text: '„Der Teig geht noch“: Bennos Spruch für „noch nicht fertig“.' },
    { text: 'Juna ist Funkerin der ZEHN. Mit Erlaubnis ihrer Mutter.' },
  ],
  firewall: { passed: 'Datenflut: alle Tunnel dicht', backdoor: 'Datenflut: Stecker gezogen – Einsatz nachholen' },
  open: [
    { text: 'Wer hat ihm ein Gerät geschenkt, das fast von allein tippt?', card: 'Neues Gerät bekommen. Das zweite. Geschenkt! Es tippt fast von allein. Endlich. B.' },
    { text: 'Wer hat das O vom Ortsschild?' },
    { text: 'Wer schreibt Krümel „Hallo Keks“?', card: 'Hallo Keks. Lange nicht gesehen.' },
    { text: 'Was hat Ada damals vor allen gesagt?' },
  ],
  suspects: [
    {
      name: 'Baron von Backspace',
      status: 'gesucht',
      text: 'Benno. Wollte seine Akte löschen. Hat sie gelesen und ist gegangen.',
      picture: 'portraet-baron',
      hits: [
        { text: 'Das Stadtarchiv hast du zuerst erkannt.', ifPicked: { scene: 'a3-l1-s75', choice: 'archiv' } },
        { text: 'Sein Halt: der Serverkeller. Dein Schluss.', ifPicked: { scene: 'a3-l2-s75', choice: 'serverkeller' } },
        { text: '„Er will löschen“ – dein Schluss.', ifPicked: { scene: 'a3-l4-s50', choice: 'loeschen' } },
        { text: 'Du hast gesagt: Das war gemein.', ifPicked: { scene: 'a3-l4-s75', choice: 'gemein' } },
        { text: 'Du hast gesagt: Trotzdem ein Dieb.', ifPicked: { scene: 'a3-l4-s75', choice: 'dieb' } },
      ],
    },
    {
      name: 'Ortrud',
      status: 'verdaechtig',
      text: 'Unterschreibt mit „O.“. Steht auf Junas Liste, Platz 4. Ada findet das albern.',
      picture: 'portraet-ortrud',
      hits: [],
    },
    {
      name: 'Frau Hubbel',
      status: 'entlastet',
      text: 'Hütet das Archiv seit vierzig Jahren. Hat ihn nicht reingelassen: Er kam unter dem Bahnsteig rein.',
      picture: 'portraet-hubbel',
      hits: [],
    },
  ],
  closing: 'Ich war Keks. Ich bin Krümel. Und einer da draußen weiß beides. Piep.',
};
