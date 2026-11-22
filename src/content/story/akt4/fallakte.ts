// Fallakte von Akt 4: was die Großschreibung gelöst hat und welche Spuren offen bleiben. Kein Datum, kein Countdown, nichts zu dem,
// was erst in späteren Akten aufgelöst wird (Story-Regel 11: erst Triumph, dann Haken). Neffe und Tippnix-Gerät sind in Akt 4 gelöst,
// Krümels Aufkleber steht ohne Deutung unter „offen“. Quelle der Texte: Drehbuch Akt 4 (liegt nicht im Repository), Abschnitt „Fallakte Akt 4“.

import type { Fallakte } from '../../../domain/book.ts';

export const FALLAKTE: Fallakte = {
  title: 'Fallakte Akt 4',
  header: 'Oben wohnt mein Neffe. Ich habe es zwanzig Jahre nicht gesagt.',
  solved: [
    { text: 'Der Baron ist Benno, Adas Neffe. Mit zwölf in der Backstube, mit sechzehn bei der ZEHN.', picture: 'foto-benno' },
    { text: 'Bei seiner Prüfung sagte Ada vor allen: Mit zwei Fingern wirst du nie ein Agent.' },
    { text: 'Er tippt mit einem TIPPNIX-Gerät, das ihn verbessert. „Backfisch“ war das Gerät, nicht er.' },
    { text: 'Der Plan: die Große Kleinmachung. Alle Großbuchstaben der Stadt klein. Ausgenommen: er.', picture: 'plakat' },
    { text: 'Das Turm-Passwort war sein echter Name.' },
    { text: '„Benno“ – dein Schluss.', ifPicked: { scene: 'a4-l4-s75', choice: 'echtername' } },
    { text: '„Für ihn“ – du hast es zuerst gesagt.', ifPicked: { scene: 'a4-l3-s50', choice: 'kipferl' } },
  ],
  firewall: { passed: 'Sturm auf den Turm: alle Treppen genommen', backdoor: 'Sturm auf den Turm: Krümel war oben – Einsatz nachholen' },
  open: [
    { text: 'Freitag – Lieferung an O. Wer ist O.?', card: 'Freitag – Lieferung an O.' },
    { text: 'Er hat sein eigenes O nicht mehr. Wer hat es?' },
    { text: 'Wer hat dem Baron das Gerät geschenkt?' },
    { text: 'Krümel tippt plötzlich perfekt groß und trägt einen Aufkleber: TIPPNIX.' },
    { text: 'Du hast gefragt: Seit wann, Krümel? Er weiß es nicht.', ifPicked: { scene: 'a4-l1-s75', choice: 'seitwann' } },
    { text: 'Du hast nach dem Aufkleber gefragt. Er ist ausgewichen.', ifPicked: { scene: 'a4-l2-s50', choice: 'aufkleber' } },
  ],
  suspects: [
    {
      name: 'Baron von Backspace',
      status: 'gesucht',
      text: 'Benno. Adas Neffe. Will die Stadt klein machen, damit niemand unrecht hat. Tippt mit Gerät.',
      picture: 'portraet-baron',
      hits: [{ text: '„Sein Gerät verbessert ihn“ – dein Schluss.', ifPicked: { scene: 'a4-l2-s75', choice: 'geraet' } }],
    },
    {
      name: 'Ortrud',
      status: 'verdaechtig',
      text: '„Lieferung an O.“ Ortrud unterschreibt mit O. Junas Liste: Platz 1. Ada: Unsinn. Vielleicht.',
      picture: 'portraet-ortrud',
      hits: [],
    },
    {
      name: 'Hilde Hupf',
      status: 'entlastet',
      text: 'Junas Eintrag: Kündigt ein Fest an, während die Buchstaben verschwinden. Hat ins Megafon geweint.',
      picture: 'portraet-hilde',
      hits: [],
    },
  ],
  closing: 'Oben wohnt Benno. Unten backt Ada. Dazwischen 112 Stufen und ich. Mit Aufkleber. Piep.',
};
