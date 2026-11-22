// Bilderbuch von Akt 4 „Großschreibung“: Einsatz-Story „Sturm auf den Turm“ und Beschriftung.
// Alles andere erzählt der Chat (chat.ts). Quelle der Texte: Drehbuch Akt 4 (liegt nicht im Repository).

import { ada, ans, bar, erz, jun, kr } from '../builders.ts';
import type { ExamStory, LessonStory, ModuleLabel } from '../../../domain/book.ts';

/** Kein Auftrag von Akt 4 hat ein Bilderbuch-Stück; der Einsatz hat seins in EXAM */
export const LESSON_STORY: Record<string, LessonStory> = {};

export const EXAM: ExamStory = {
  title: 'Einsatz: Sturm auf den Turm',
  won: 'Turm gestürmt!',
  lost: 'Abgeblitzt',
  segments: 'Sturm: {n} von {gesamt} Treppen genommen',
  frame: 'Turm-Codes',
  ready: 'Groß angefangen, klein aufgehört, meine Lieben?',
  taunts: [
    'Umschalt! Umschalt! Welche Hand hält denn nun, meine Lieben?',
    'Jeder kleine Buchstabe gehört mir. Danke fürs Tippen.',
    'Der Turm hat 112 Stufen. Zählen Sie ruhig mit.',
    'Groß schreiben? In meinem Turm? Wie unhöflich.',
  ],
  intro: [
    erz('Die Tür steht offen. Die Treppe leuchtet, und von oben rollen die Großbuchstaben der Stadt herunter.', { scene: 'turm' }),
    kr('Jeder Turm-Code mit den richtigen großen Buchstaben hält eine Treppe. Umschalttaste halten, tippen, loslassen.'),
    bar('Meine Lieben. Sie haben meinen Namen gesagt. Jetzt sagen Sie ihn noch einmal. Gegen hundertzwölf Stufen.', {
      choices: [
        ans('rauf', 'Wir kommen rauf', 'Wir kommen rauf, Baron. Treppe für Treppe.', [bar('Dann nehmen Sie die Buchstaben gleich mit. Sie gehören ohnehin … der Stadt.')]),
        ans('benno', 'Benno, mach Platz', 'Benno. Mach Platz.', [bar('… Nicht dieser Name. Nicht hier. Tippen Sie.')]),
        // Zusatz-Antwort mit dem Gadget aus a4-l1-brief; daneben stehen zwei Antworten ohne Gadget
        ans('handschuhe', 'Handschuhe', 'Handschuhe an. Die merken sich, welche Hand hält.', [kr('Links hält, rechts tippt. Rechts hält, links tippt. Die Handschuhe wissen es, bevor du es weißt.')], { needs: 'shift-handschuhe' }),
      ],
    }),
    ada('Groß, wo es groß gehört. Klein, wo es klein gehört. Mehr ist Schreiben nicht. Los.'),
    jun('FUNK: Der ganze Markt steht unten. Hupf hat ein Megafon. Sie sagt nichts. Sie hält nur die Daumen.', { offstage: true }),
  ],
  success: [
    bar('Alle Treppen. Mit beiden Umschalttasten, ohne eine einzige falsche Hand. Wer hat Ihnen das beigebracht?', {
      scene: 'turm',
      choices: [
        ans('ada', 'Ada', 'Ada. Sie hat gesagt: Zwei sind ein Anfang.', [bar('… Das hat sie mir nie gesagt. Oder ich habe nicht zugehört. Beides möglich.')]),
        ans('du', 'Du, Baron', 'Du. Mit jedem Auftrag, den du uns gegeben hast.', [bar('Dann bin ich ein besserer Lehrer als Agent. Das ist … kein Trost.')]),
      ],
    }),
    bar('Die Großbuchstaben gehören Ihnen. Der Turm auch. Ich war lange genug oben. Bis bald, meine Lieben.'),
  ],
  fail: [kr('Abgeblitzt. Stand: {prozent} %. Die Treppe wartet. Umschalttaste und noch mal!')],
  backdoorOffer: [
    ada('Die Treppe ist heute zu schnell. Krümel sagt, er kommt alleine hoch. Ich weiß nicht, woher er das kann.'),
    ada('Dann geht es weiter – aber der Einsatz bleibt auf der Karte markiert, und wir holen ihn später nach.'),
  ],
  backdoorTaken: [
    erz('Krümel schwebt die Treppe hoch. Jede Stufe erlischt, bevor er sie erreicht. Oben summt die Tür, dann ist es still.', { scene: 'turm' }),
    kr('Das ging … leicht. Zu leicht. Ich hab nichts gemacht. Glaube ich.'),
    erz('Ada sieht Krümel lange an. Sie sagt nichts dazu.'),
    ada('Geschafft – fürs Erste. Die Großbuchstaben sind oben. Wenn du magst, komm zurück und nimm die Treppe selbst.'),
  ],
};

/** Wie das Modul auf der Missionskarte heißt */
export const LABEL: ModuleLabel = { act: 'Akt 4', place: 'Der Turm des Barons' };
