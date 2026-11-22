// Bilderbuch von Akt 3 „Untere Reihe“: Einsatz-Story „Die Flucht vor der Datenflut“ und Beschriftung.
// Alles andere erzählt der Chat (chat.ts). Quelle der Texte: Drehbuch Akt 3 (liegt nicht im Repository).

import { ada, ans, bar, erz, jun, kr } from '../builders.ts';
import type { ExamStory, LessonStory, ModuleLabel } from '../../../domain/book.ts';

/** Kein Auftrag von Akt 3 hat ein Bilderbuch-Stück; der Einsatz hat seins in EXAM */
export const LESSON_STORY: Record<string, LessonStory> = {};

export const EXAM: ExamStory = {
  title: 'Einsatz: Die Datenflut',
  won: 'Archiv gerettet!',
  lost: 'Überflutet',
  segments: 'Datenflut: {n} von {gesamt} Tunneln dicht',
  frame: 'Tunnel-Codes',
  ready: 'Alles fließt, meine Lieben. Auch Ihre Fehler!',
  taunts: [
    'Ein Fehler? Weitertippen, weitertippen! Oder lieber doch nicht?',
    'Datenmüll ist auch Daten. Nur ehrlicher.',
    'Das Archiv vergisst gleich alles. Wie praktisch.',
    'Tipp, tipp, tipp. Die Flut ist schneller, meine Lieben!',
  ],
  intro: [
    erz('Der Nachtzug steht am Serverkeller. Aus den Tunneln rauscht es: Zeichen, Zahlen, Müll. Die Datenflut kommt.', { scene: 'tunnel' }),
    kr('Flow-Chip an! Fehler leuchten rot, du tippst einfach weiter. Jeder Tunnel-Code macht einen Tunnel dicht.'),
    bar('Eine Datenflut gegen ein Archiv. Wer nichts liest, hat nichts zu vergessen. Weichen Sie aus, meine Lieben!', {
      choices: [
        ans('bleiben', 'Wir bleiben', 'Wir bleiben. Das Archiv bleibt.', [bar('Dann werden Sie nass. Datennass.')]),
        ans('gelesen', 'Du hast gelesen', 'Du hast die Akte gelesen, Baron. Ich auch.', [bar('… Tippen Sie. Einfach tippen.')]),
        // Zusatz-Antwort mit dem Flow-Chip (Krümel schenkt ihn in `a3-l5-done`)
        ans('chip', 'Flow-Chip', 'Fehler leuchten nur. Ich tippe weiter.', [kr('Genau dafür hab ich ihn gebaut!')], { needs: 'flow-chip' }),
      ],
    }),
    ada('Schnell, nicht perfekt. Was rot leuchtet, lässt du hinter dir. Wie den Zug.'),
    jun('FUNK: Ortrud hält den Zug. Frau Hubbel pfeift. Ich drück die Daumen. Alle zehn!!!', { offstage: true }),
  ],
  success: [
    bar('Alle Tunnel dicht?! Mit leuchtenden Fehlern und ohne eine einzige Korrektur? Das ist … unerhört.', {
      scene: 'tunnel',
      choices: [
        ans('bleibt', 'Das Archiv bleibt', 'Das Archiv bleibt. Und deine Akte auch.', [bar('Sie bleibt. Und Sie haben sie gelesen. Das ist schlimmer als jede Flut.')]),
        ans('hoch', 'Komm mit hoch', 'Komm mit nach oben, Baron. Zu Ada.', [bar('… Nicht heute. Hochachtungsvoll.')]),
      ],
    }),
    bar('Die untere Reihe gehört Ihnen. Das Archiv auch. Ich nehme die letzte Bahn. Au revoir.'),
  ],
  fail: [kr('Überflutet. Stand: {prozent} %. Der Flow-Chip hält. Noch mal!')],
  backdoorOffer: [
    ada('Die Flut ist heute zu schnell. Frau Hubbel kann den Hauptserver vom Netz nehmen. Hart, aber es hält.'),
    ada('Dann geht es weiter – aber der Einsatz bleibt auf der Karte markiert, und wir holen ihn später nach.'),
  ],
  backdoorTaken: [
    erz('Frau Hubbel zieht einen Stecker, so dick wie ein Arm. Die Tunnel werden still. Der Baron ist schon weg.', { scene: 'tunnel' }),
    ada('Geschafft – fürs Erste. Das Archiv steht, aber die Tunnel sind voll Müll. Wenn du magst, komm zurück und mach sie dicht.', { scene: 'keller' }),
  ],
};

/** Wie das Modul auf der Missionskarte heißt */
export const LABEL: ModuleLabel = { act: 'Akt 3', place: 'U-Bahn und Stadtarchiv' };
