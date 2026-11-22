// Fallakte von Akt 6: was die Zahlen gelöst haben und welche Spuren offen bleiben. Kein Datum, kein Countdown, keine vierstellige Zahl,
// nichts aus späteren Akten (Prüfprofil: `duell`, `preisliste`, `zentrale`). Otti und Tippi dürfen genannt werden: der Akt löst sie auf.
// Die Fallakte kennt keine Story-Objekte: wo das Drehbuch auf die Spurenwand oder das Lieferbuch zeigt, steht ihr Bild.
// Quelle der Texte: Drehbuch Akt 6 (liegt nicht im Repository), Abschnitt „Fallakte Akt 6“.

import type { Fallakte } from '../../../domain/book.ts';

/** Treffer-Zeile: erscheint nur, wenn in `scene` die Antwort `choice` gewählt wurde */
const hit = (scene: string, choice: string) => ({ ifPicked: { scene, choice } });

export const FALLAKTE: Fallakte = {
  title: 'Fallakte Akt 6',
  header: 'Ich habe den Namen nicht gesagt. Du hast ihn gesagt. Dann ich.',
  solved: [
    { text: 'Otti Korrekt von TIPPNIX steckt hinter allem: Werbefoto, Aufkleber, Signal, Maschinen.', picture: 'spurenwand-nadel' },
    { text: 'Otti wollte dich fürs Werbefoto. Juna ging, ohne es zu wissen. Eine Stunde Tippen für eine Maschine.' },
    { text: 'Das O vom Ortsschild bezahlte Bennos Gerät. Es steckt in Maschine 3. Eingebaut, nicht gefüttert.', picture: 'lieferbuch' },
    { text: 'Das Lager am Hafen war leer. Otti hat es ausgeräumt: Absätze, Lollis, Lieferwagen.', picture: 'goldstaub' },
    { text: 'Der Baron heißt Benno. Im Chat, seit heute Nacht. Der Rest war Hut.' },
    // die Tat an der Spurenwand: je Weg eine Zeile (gleich nach der ersten Frage, nach einem oder nach zwei Umwegen)
    { text: '„Otti“ – dein Wort an der Spurenwand. Beim ersten Mal, vor allen.', ...hit('a6-l3-s50', 'otti') },
    { text: '„Otti“ – dein Wort an der Spurenwand. Nach einem Umweg, aber deins.', ...hit('a6-l3-s50', 'otti-2') },
    { text: '„Otti“ – dein Wort an der Spurenwand. Nach einem Umweg, aber deins.', ...hit('a6-l3-s50', 'otti-2b') },
    { text: '„Otti“ – dein Wort an der Spurenwand. Nach zwei Umwegen. Trotzdem deins.', ...hit('a6-l3-s50', 'otti-3') },
    { text: '„Otti“ – dein Wort an der Spurenwand. Nach zwei Umwegen. Trotzdem deins.', ...hit('a6-l3-s50', 'otti-3b') },
    { text: '„Bestohlen“ – dein Schluss, als der Baron jammerte. Vor allen anderen.', ...hit('a6-l2-s50', 'bestohlen') },
    { text: '„Eingebaut, nicht gefüttert“ – dein Schluss. Krümel hat die Regel danach aufgesagt.', ...hit('a6-l4-s50', 'keino') },
  ],
  firewall: { passed: 'Der Tresor: alle Rädchen gedreht, das O gesehen', backdoor: 'Der Tresor: Benno hat gedreht – Einsatz nachholen' },
  open: [
    { text: 'Das O steckt in Maschine 3. Holen geht erst, wenn die Maschine steht. Wie hält man eine Maschine an?' },
    { text: '„Maschine 4: lernt selbst. Lehrer: gesucht.“ Wen meint sie?', card: 'Maschine 4: lernt selbst. Lehrer: gesucht.', picture: 'lieferblatt' },
    { text: 'Tippi liest in unserem Chat mit. Und lernt. Von wem?' },
    { text: 'Benno will Ada etwas sagen. Nicht vor der Maschine. Was?' },
    { text: 'Hupf will TIPPNIX besichtigen. Otti sagt: Inventur.' },
    { text: 'Unter „Lehrer“ ein Fingerabdruck. Klein. Nicht Ottis.', ...hit('a6-exam-after', 'monokel') },
  ],
  suspects: [
    {
      name: 'Otti Korrekt',
      status: 'ueberfuehrt',
      text: 'TIPPNIX, Marktplatz 10. Werbefoto, Aufkleber, Signal, Lager, Zahlen. Ihr Lieferbuch sagt alles.',
      picture: 'portraet-otti',
      hits: [{ text: '„Wie Otti“ – das hast du schon im Notmodus gehört.', ...hit('a5-l2-s50', 'otti') }],
    },
    {
      name: 'Benno',
      status: 'entlastet',
      text: 'Für Zahlen und Zeichen. Bestohlen, auch Dieb. Lieferant, bezahlt mit einem Gerät. Jetzt im Chat.',
      picture: 'portraet-benno',
      hits: [
        { text: '„Ja“ – dein Wort. Er hat geliefert: alles.', ...hit('a6-l3-done', 'ja') },
        { text: '„Erst beweisen“ – dein Wort. Er beweist. Seite für Seite.', ...hit('a6-l3-done', 'beweisen') },
      ],
    },
    { name: 'Ortrud', status: 'entlastet', text: 'Stellwerk, Fest, Kaffee für Hupf. O. war nie Ortrud.', picture: 'portraet-ortrud', hits: [] },
    { name: 'Tippi', status: 'verdaechtig', text: 'Maschine. Liest mit, verbessert, lernt. Von wem, steht nirgends. Noch.', picture: 'portraet-tippi', hits: [] },
  ],
  closing: 'Otti benannt. Benno benannt. O gesehen. Maschine 4 lernt. Ich auch. Piep.',
};
