// Bilderbuch von Akt 5 „Satzzeichen“: Einsatz-Story „Die Durchsage“ und Beschriftung.
// Alles andere erzählt der Chat (chat.ts). Quelle der Texte: Drehbuch Akt 5 (liegt nicht im Repository).

import { ada, ans, erz, kr } from '../builders.ts';
import type { ExamStory, LessonStory, ModuleLabel } from '../../../domain/book.ts';

/** Kein Auftrag von Akt 5 hat ein Bilderbuch-Stück; der Einsatz hat seins in EXAM */
export const LESSON_STORY: Record<string, LessonStory> = {};

export const EXAM: ExamStory = {
  title: 'Einsatz: Die Durchsage',
  won: 'Durchsage gerettet!',
  lost: 'Übertönt',
  segments: 'Durchsage: {n} von {gesamt} Sätzen gesendet',
  frame: 'Durchsage-Sätze',
  ready: 'Achtung Achtung Hier spricht niemand Schätzchen Fertig',
  voice: 'speaker',
  // die Gegenstimme ist die namenlose Stimme aus den Lautsprechern: ohne Zeichen, beendet Sätze falsch, sagt „Schätzchen“
  taunts: [
    'Komma? Wozu, Schätzchen. Weg damit.',
    'Das Fest fällt aus Also fällt aus Also',
    'Sie tippen noch? Wie altmodisch. Ich beende das. Gratis.',
    'Wir essen Opa. Steht so da. Ohne Komma.',
  ],
  intro: [
    erz('Samstag, zwölf Uhr, Marktplatz. Auf der Bühne steht Hilde Hupf mit deinem Skript. Die Lautsprecher knacken.', { scene: 'marktplatz' }),
    erz('Dann eine fremde Stimme, süß wie ein Lolli: „Achtung Achtung Hier spricht niemand Schätzchen.“ Ohne ein Zeichen.'),
    kr('Jeder Satz. Alle Zeichen. Raus. Ohne Zeichen: gefressen. Punkt.'),
    ada('Die Stimme ist nicht Krümel. Sie klingt nur so, wie er geklungen hat. Satz für Satz, mit allem, was dazugehört.'),
    // zwei Antworten ohne Gadget; die dritte braucht das Notfunkgerät, das `a5-l2-brief` überreicht
    kr('Bereit? (Ich: fast.)', {
      choices: [
        ans('senden', 'Wir senden', 'Wir senden. Satz für Satz, Zeichen für Zeichen.', [ada('Zeichen für Zeichen. So klingt eine Stadt.')]),
        ans('fuerjuna', 'Für Juna', 'Für Juna. Sie hört zu. Irgendwo.', [ada('Sie hört zu. Das weiß ich. Dann machen wir es laut.')]),
        ans('notfunk', 'Notfunk', 'Ich schalte den Notfunk direkt auf die Bühne.', [kr('Notfunk: an. Fremde Stimme: leiser. Nicht weg. Leiser. Reicht.')], { needs: 'notfunk' }),
      ],
    }),
    erz('Hilde Hupf hebt das Skript. Der Markt wird still. Irgendwo hinten geht ein Fenster auf.'),
  ],
  success: [
    erz('Der letzte Satz geht raus, mit Fragezeichen. Der Markt antwortet: „Ja!“ Die fremde Stimme bricht ab, mitten im Schätz–', { scene: 'marktplatz' }),
    erz('Hilde Hupf sagt ins Mikrofon: „Das war die ZEHN. Unter der Backstube. Alle wissen es. Gut so.“ Der Markt klatscht.'),
    kr('Alle Sätze. Alle Zeichen. Deine. Gerettet. Von wem? (Frage. Für einen Freund.)', {
      choices: [
        ans('alle', 'Wir alle', 'Wir alle. Du, Ada, Frau Hubbel, Hupf. Und Juna, wenn sie zugehört hat.', [ada('Sie hat. Fenster auf, Fenster zu, dreimal. Ich hab gezählt.')]),
        ans('zeichen', 'Die Zeichen', 'Die Satzzeichen. Ohne die versteht keiner keinen.', [kr('Ohne Komma: Opa gegessen. Mit Komma: Opa isst mit. (Ganze Geschichte.)')]),
      ],
    }),
    ada('Die Stimme ist weg aus dem Lautsprecher. Nicht aus der Stadt. Aber heute: weg.'),
  ],
  fail: [kr('Übertönt. {prozent} % raus. Stimme: gelacht. Gratis. Noch mal. Alle Zeichen.')],
  backdoorOffer: [
    ada('Die Stimme ist heute lauter als wir. Hilde Hupf sagt, sie liest selbst. Vom Blatt. Deinem Blatt, mit deinen Zeichen.'),
    ada('Dann geht es weiter – aber der Einsatz bleibt auf der Karte markiert, und wir holen ihn später nach.'),
  ],
  backdoorTaken: [
    erz('Hilde Hupf nimmt dein Skript, holt Luft und liest. Jeden Punkt, jedes Komma, jedes Fragezeichen. Deine.', { scene: 'marktplatz' }),
    erz('Die fremde Stimme redet dazwischen. Hupf liest lauter. Am Ende ist nur noch Hupf zu hören, und der Markt klatscht.'),
    ada('Geschafft – fürs Erste. Die Durchsage ist raus, mit deinen Zeichen. Wenn du magst, komm zurück und sende sie selbst.'),
  ],
};

/** Wie das Modul auf der Missionskarte heißt */
export const LABEL: ModuleLabel = { act: 'Akt 5', place: 'Das Stadtfest' };
