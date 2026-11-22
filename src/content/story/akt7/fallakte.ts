// Abschlussakte von Akt 7: was das Finale gelöst hat, drei offene Spuren, die drei Verdächtigen und die Taten des Kindes aus allen
// Akten (Treffer-Zeilen: jede erscheint nur, wenn das Kind damals so geantwortet hat; für andere Antworten gibt es nichts).
// Kein Datum, kein Countdown, keine vierstellige Zahl; das Prüfprofil `spoilers` ist leer (letzter Akt).
// Die Fallakte kennt keine Story-Objekte: wo das Drehbuch auf die Preisliste zeigt, steht ihr Bild.
// Quelle der Texte: Drehbuch Akt 7 (liegt nicht im Repository), Abschnitt „Abschlussakte“.

import type { Fallakte } from '../../../domain/book.ts';

/** Treffer-Zeile: erscheint nur, wenn in `scene` die Antwort `choice` gewählt wurde */
const hit = (scene: string, choice: string) => ({ ifPicked: { scene, choice } });

export const FALLAKTE: Fallakte = {
  title: 'Abschlussakte',
  header: 'Zwanzig Jahre, zwei Finger, zehn. Ende, sagt Hubbel. Anfang, sage ich.',
  solved: [
    { text: 'Otti Korrekt wollte Städte, die nie wieder tippen. Ihre Maschinen liefen mit Beute. Sie stehen.', picture: 'preisliste' },
    { text: 'Das O von KURORT trieb Maschine 3 an. Ohne es fehlte der Stadt ihr Name am Schild. Jetzt hängt es.' },
    { text: 'Maschine 4 lernte von dem, was wir tippten. Zuerst von Juna, dann von uns. Zuletzt von dir.', picture: 'abdruck' },
    { text: 'Tippi hat zuletzt von dir gelernt. Sie steht jetzt in der Backstube und fragt, bevor sie tippt.' },
    { text: 'Benno hat sich entschuldigt. Zwei Finger, ein Tippfehler. Ada hat geantwortet. Durch dich.' },
    { text: 'Hilde Hupf hat TIPPNIX zugesperrt. Otti fuhr davon. Auf dem Wagen steht: TIPPNIX – Nie wieder.', picture: 'lieferwagen' },
    { text: 'Das Foto ist ganz: Ada und Benno. Beide Hälften, zwanzig Jahre, ein Fach.', picture: 'foto-ganz' },
    // die Taten des Kindes aus allen Akten, je Antwort eine Zeile
    { text: '„Zylinder“ – du hast es zuerst gesagt, in Akt 1. Vor allen.', ...hit('l5-s75', 'zylinder') },
    { text: '„Meine Lieben“ – du hast den Baron im Pizzaroboter erkannt. Mit Zylinder im Karton.', ...hit('a2-l5-s75', 'lieben') },
    { text: '„komm“ – du hast Juna ins Team getippt.', ...hit('a3-l1-done', 'komm') },
    { text: '„Du warst Keks“ – du hast es Krümel gesagt. Er blieb Krümel.', ...hit('a3-l5-s75', 'keks') },
    { text: '„Der Aufkleber?“ – du hast ihn bemerkt. Krümel hat gelogen und es gesagt.', ...hit('a4-l2-s50', 'aufkleber') },
    { text: '„Mein Freund“ – dein Wort an Krümel im Notmodus.', ...hit('a5-l3-s50', 'freund') },
    // „Otti“ an der Spurenwand: je Weg eine Zeile (gleich nach der ersten Frage, nach einem oder nach zwei Umwegen)
    { text: '„Otti“ – dein Wort an der Spurenwand, vor allen Figuren.', ...hit('a6-l3-s50', 'otti') },
    { text: '„Otti“ – dein Wort an der Spurenwand, vor allen Figuren.', ...hit('a6-l3-s50', 'otti-2') },
    { text: '„Otti“ – dein Wort an der Spurenwand, vor allen Figuren.', ...hit('a6-l3-s50', 'otti-2b') },
    { text: '„Otti“ – dein Wort an der Spurenwand, vor allen Figuren.', ...hit('a6-l3-s50', 'otti-3') },
    { text: '„Otti“ – dein Wort an der Spurenwand, vor allen Figuren.', ...hit('a6-l3-s50', 'otti-3b') },
    { text: '„Ja“ – du hast Benno vertraut. Er ging vorn rein.', ...hit('a6-l3-done', 'ja') },
    { text: '„Erst beweisen“ – er hat. Seite für Seite. Dann ging er vorn rein.', ...hit('a6-l3-done', 'beweisen') },
    { text: '„Alle Städte“ – dein Schluss aus drei Zeilen Preisliste.', ...hit('a7-l1-s50', 'staedte') },
    { text: '„Sie lernt mit“ – dein Schluss. Darum hat Tippi zuletzt von dir gelernt.', ...hit('a7-l2-s50', 'lernt') },
    { text: '„Für Ada“ – du hast geantwortet, als sie nicht konnte.', ...hit('a7-l3-s50', 'fuerada') },
    { text: '„Klar“ – Pit darf. Zwei sind ein Anfang.', ...hit('a7-fest', 'klar') },
  ],
  firewall: { passed: 'Das Duell: alle Zeilen gehalten, die Maschinen stehen', backdoor: 'Das Duell: Benno zog den Stecker – Einsatz nachholen' },
  open: [
    { text: '„BALD AUCH IN IHRER STADT“ – stand oben auf der Preisliste. Ein Augenzwinkern. Otti hat jetzt Zeit.' },
    { text: 'Bennos Tippstunde: zwei Schüler, und du. Bald.' },
    { text: 'Maschine 4 fragt. Niemand weiß, was sie als Nächstes fragt.' },
  ],
  suspects: [
    {
      name: 'Otti Korrekt',
      status: 'ueberfuehrt',
      text: 'TIPPNIX, Marktplatz 10, zugesperrt. Preisliste, Maschinen, Lieferwagen: alles von ihr. Keine Strafe.',
      // je Weg an der Spurenwand eine Zeile, wie unter „Gelöst“ (gleich nach der ersten Frage, nach einem oder nach zwei Umwegen)
      picture: 'portraet-otti',
      hits: ['otti', 'otti-2', 'otti-2b', 'otti-3', 'otti-3b'].map((choice) => ({ text: '„Otti“ – an der Spurenwand hast du sie benannt. Hier steht es.', ...hit('a6-l3-s50', choice) })),
    },
    {
      name: 'Tippi',
      status: 'entlastet',
      text: 'Maschine. Hat von uns gelernt, zuletzt das Richtige. Steht in der Backstube. Fragt.',
      picture: 'portraet-tippi',
      hits: [{ text: '„Sie lernt mit“ – dein Schluss hat sie entlastet.', ...hit('a7-l2-s50', 'lernt') }],
    },
    {
      name: 'Benno',
      status: 'entlastet',
      text: 'Lieferant, Lehrling, Schüler. Zwei Finger. Noch.',
      picture: 'portraet-benno',
      hits: [{ text: '„Zwei sind ein Anfang.“ – dein Satz für Ada. Er hat ihn gespeichert.', ...hit('a7-l3-done', 'anfang') }],
    },
  ],
  closing: 'Alle Tasten, alle Zeichen, alle deine. Ich bin ZEHN. Du auch. Piep.',
};
