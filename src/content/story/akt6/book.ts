// Bilderbuch von Akt 6 „Zahlen“: Einsatz-Story „Der Tresor“ und Beschriftung.
// Alles andere erzählt der Chat (chat.ts). Quelle der Texte: Drehbuch Akt 6 (liegt nicht im Repository).

import { ada, ans, bar, erz, kr } from '../builders.ts';
import type { ExamStory, LessonStory, ModuleLabel } from '../../../domain/book.ts';

/** Kein Auftrag von Akt 6 hat ein Bilderbuch-Stück; der Einsatz hat seins in EXAM */
export const LESSON_STORY: Record<string, LessonStory> = {};

export const EXAM: ExamStory = {
  title: 'Einsatz: Der Tresor',
  won: 'Tresor geknackt!',
  lost: 'Verriegelt',
  segments: 'Tresor: {n} von {gesamt} Codes gedreht',
  frame: 'Tresor-Codes',
  ready: 'Inventur Inventur Bitte nicht tippen Schätzchen Fertig',
  voice: 'speaker',
  // die Gegenstimme ist der Lautsprecher über der Tresortür: dieselbe süße Stimme wie Tippi im Chat, beendet alles falsch
  taunts: [
    'Code falsch? Ich korrigiere: alles falsch. Gratis.',
    'Zahlen? Hab ich. Alle. Sogar deine.',
    'Nie wieder selbst tippen. Steht hier überall. Lesen Sie es.',
    'Maschine 3 läuft rund. Mit einem O. Nicht Ihrem.',
  ],
  intro: [
    erz('Nachts, Marktplatz 10. Hinter TIPPNIX eine Tür ohne Nummer. Der Baron hält sie auf, ohne Zylinder, mit Ersatzhut.', { scene: 'tresor' }),
    erz('Ein Keller, warm wie eine Backstube. Drei Maschinen rattern, Röhren voller Zeichen. Davor eine Stahltür, vier Rädchen.'),
    erz('Oben am Markt warten Juna, Hupf und Ortruds Kaffee. Unten: wir vier und vier Rädchen.'),
    bar('Meine Lieben, der Code ist Ihrer. Ich habe hier nur abgeliefert. Heute hole ich ab. Mit Ihnen.'),
    ada('Jede Zahl, die du tippst, dreht ein Rädchen. Die Maschinen hören zu. Sie werden versuchen, dich zu verbessern.'),
    // zwei Antworten ohne Gadget; die dritte braucht das Monokel
    kr('Bereit? (Ich zähle mit. Bis zehn. Dann wieder von vorn.)', {
      choices: [
        ans('drehen', 'Wir drehen', 'Wir drehen. Zahl für Zahl.', [ada('Zahl für Zahl. Finger hoch, Finger runter. Dann klickt es.')]),
        ans('mitdir', 'Mit dir, Baron', 'Mit dir, Baron. Diesmal auf einer Seite.', [bar('Auf einer Seite. Beim letzten Mal war ich drei. Ich übe.')]),
        // braucht das Monokel, das `a6-l4-s50` überreicht (das Gadget heißt `bennos-monokel`, die Antwort `monokel`)
        ans('monokel', 'Monokel', 'Monokel auf. Was ist in Maschine 3?', [kr('Durchs Glas: Maschine 3, hinten, ein Glas mit einem O. Es glitzert. Golden. (Das vom Schild.)')], { needs: 'bennos-monokel' }),
      ],
    }),
    erz('Aus dem Lautsprecher über der Tür, süß wie ein Lolli: „Inventur, Schätzchen. Bitte nicht tippen.“ Die Rädchen zittern.'),
  ],
  success: [
    erz('Das letzte Rädchen rastet ein. Die Stahltür schwingt auf. Dahinter Röhren, Kabel, in Maschine 3 ein Glas mit einem O.', { scene: 'tresor' }),
    erz('Die Lautsprecherstimme stottert: „Inven– –tur abgeschlossen. Schätz–“ Dann nur noch das Rattern der Maschinen.'),
    bar('Da ist es. Mein erstes O. Das vom Schild. Ich kann es nicht holen, meine Lieben. Die Maschine läuft. Noch.'),
    kr('Was eingebaut ist, kommt erst zurück, wenn die Maschine steht. Nicht heute. Aber gesehen. Punkt.', {
      choices: [
        ans('wieder', 'Wir kommen wieder', 'Wir kommen wieder. Wenn die Maschinen stehen.', [ada('Dann stehen sie. Nicht heute. Aber jetzt wissen wir, wo.')]),
        ans('zahlen', 'Die Zahlen', 'Die Zahlen haben die Tür geöffnet. Alle zehn.', [kr('Alle zehn. Beide Hände, alle Finger, einmal hoch und zurück. (Zehn Finger. Ich bin ZEHN.)')]),
      ],
    }),
    ada('Die Tür ist offen, das O ist gesehen, die Maschinen laufen. Und Tippi hat jedes Wort gelesen.'),
  ],
  fail: [kr('Verriegelt. {prozent} % der Rädchen gedreht. Die Stimme: „Gratis!“ Noch mal. Alle Zahlen.')],
  backdoorOffer: [
    ada('Die Rädchen zittern schneller, als du tippst. Der Baron sagt, er kennt den Trick: die alte Art, Gehör und zwei Finger.'),
    ada('Dann geht es weiter – aber der Einsatz bleibt auf der Karte markiert, und wir holen ihn später nach.'),
  ],
  backdoorTaken: [
    erz('Der Baron legt das Ohr an die Stahltür und dreht. Klick. „Dieb bleibt Dieb, meine Lieben. Einmal noch.“ Klick. Klick.', { scene: 'tresor' }),
    erz('Die Tür schwingt auf. Dahinter Röhren, Kabel, und in Maschine 3 ein Glas mit einem O. Die Maschine läuft. Holen: nein.'),
    ada('Geschafft – fürs Erste. Die Tür ist offen, das O ist gesehen. Wenn du magst, komm zurück und dreh die Rädchen selbst.'),
  ],
};

/** Wie das Modul auf der Missionskarte heißt */
export const LABEL: ModuleLabel = { act: 'Akt 6', place: 'Der Tresor' };
