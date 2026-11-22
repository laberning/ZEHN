// Bilderbuch von Akt 2 „Obere Reihe“: Einsatz-Story „Die Verfolgungsjagd über die Funktürme“ und Beschriftung.
// Alles andere erzählt der Chat (kommt mit den Haupt-Szenen). Quelle der Texte: Drehbuch Akt 2 (liegt nicht im Repository).

import { ada, ans, bar, erz, kr } from '../builders.ts';
import type { ExamStory, LessonStory, ModuleLabel } from '../../../domain/book.ts';

/** Kein Auftrag von Akt 2 hat ein Bilderbuch-Stück; der Einsatz hat seins in EXAM */
export const LESSON_STORY: Record<string, LessonStory> = {};

export const EXAM: ExamStory = {
  title: 'Einsatz: Die Verfolgungsjagd',
  won: 'Eingeholt!',
  lost: 'Abgehängt',
  segments: 'Abstand zum Baron: {n} von {gesamt} Brücken geschafft',
  frame: 'Brücken-Codes',
  ready: 'Fangen Sie mich doch, meine Lieben!',
  taunts: [
    'Zwei Finger, meine Lieben, und kein einziger Tippfehler!',
    'Vorsicht, Stufe! Haha, da ist gar keine.',
    "Ein Tippfehler? Da hinten geht's zum Ausgang.",
    'Oben ist die Luft dünn, meine Lieben. Und mein Vorsprung dick.',
  ],
  intro: [
    erz('Die Tür ist offen. Über den Dächern spannen sich Funkbrücken von Turm zu Turm. Ganz vorn: ein Zylinder.', { scene: 'funkturm' }),
    bar('Eine Verfolgungsjagd? Mit zehn Fingern? Wie sportlich!', {
      choices: [
        ans('einholen', 'Ich krieg dich', 'Ich hol dich ein, Baron!', [bar('Das sagen alle. Dann kommt die erste Brücke.')]),
        ans('ada', 'Für Ada', 'Das hier ist für Ada.', [bar('… Laufen Sie lieber. Hochachtungsvoll.')]),
        // Zusatz-Antwort mit einem Gadget aus Akt 1 (nie Bedingung): der Blasenwerfer aus dem Extra-Fall „Seifenblasen-Brunnen“
        ans('blasen', 'Blasenwerfer', 'Seifenblasen auf die Brücke!', [bar('Rutschig! Wie … entzückend. Und wie gemein!')], { needs: 'blasenwerfer' }),
      ],
    }),
    ada('Jedes richtige Wort ist ein Schritt auf der Brücke. Schnell und genau. Nicht zurückschauen.'),
    kr('Ich flieg neben dir. Höhen-Respekt, du weißt schon. Los!'),
  ],
  success: [
    bar('Eingeholt?! Von jemandem mit elf neuen Tasten? Das ist … unerhört!', {
      scene: 'funkturm',
      choices: [
        ans('aufgeben', 'Gib auf!', 'Gib auf, Baron!', [bar('Aufgeben? Ein Backspace gibt niemals auf. Er … nimmt die Treppe.')]),
        ans('wer', 'Wer bist du?', 'Wer bist du wirklich, Baron?', [bar('Fragen Sie Ada. Sie weiß es. Sie wusste es immer.')]),
      ],
    }),
    bar('Ich lasse Ihnen die obere Reihe. Ganz. Aber das O vom Ortsschild bleibt, wo es ist. Au revoir!'),
  ],
  fail: [kr('Abgehängt. Stand: {prozent} %. Er wird langsamer. Noch mal!')],
  backdoorOffer: [
    ada('Er ist heute zu schnell. Ich kenne einen kürzeren Weg: durch den Turm, über die Wendeltreppe.'),
    ada('Dann geht es weiter – aber der Einsatz bleibt auf der Karte markiert, und wir holen ihn später nach.'),
  ],
  backdoorTaken: [
    erz('Ada rennt die Wendeltreppe hoch. Oben liegt nur sein Hut. Und ein Zettel: „Nächstes Mal.“', { scene: 'funkturm' }),
    ada('Geschafft – fürs Erste. Aber eingeholt hast du ihn nicht. Wenn du magst, komm zurück und hol dir die Brücken.', { scene: 'keller' }),
  ],
};

/** Wie das Modul auf der Missionskarte heißt */
export const LABEL: ModuleLabel = { act: 'Akt 2', place: 'Dächer und Funktürme' };
