// Bilderbuch von Akt 7 „Sonderzeichen“: Einsatz-Story „Das Duell“ und Beschriftung.
// Alles andere erzählt der Chat. Quelle der Texte: Drehbuch Akt 7 (liegt nicht im Repository).
// Otti erscheint hier zum ersten und einzigen Mal, nur zitiert vom Erzähler (kein Sprecher `otti`). Die Gegenstimme ist Tippi aus dem
// Lautsprecher über der Treppe. Die Antwort `brille` gehört zur Blindflug-Brille, die `a7-l2-brief` überreicht.

import { ada, ans, ben, erz, jun, kr } from '../builders.ts';
import type { ExamStory, LessonStory, ModuleLabel } from '../../../domain/book.ts';

/** Kein Auftrag von Akt 7 hat ein Bilderbuch-Stück; der Einsatz hat seins in EXAM */
export const LESSON_STORY: Record<string, LessonStory> = {};

export const EXAM: ExamStory = {
  title: 'Einsatz: Das Duell',
  won: 'Maschinen stehen!',
  lost: 'Überschrieben',
  segments: 'Duell: {n} von {gesamt} Zeilen gehalten',
  frame: 'Duell-Zeilen',
  ready: 'Inventur Inventur Zehn Finger frisch Schätzchen Fertig',
  voice: 'speaker',
  taunts: [
    'Zu langsam, Schätzchen. Ich beende das. Gratis.',
    'Das kenne ich schon. Das hast du gestern getippt.',
    'Nie wieder tippen. Steht überall. Bald auch auf Ihnen.',
    'Maschine 4 lernt. Von Ihnen. Danke, Schätzchen.',
  ],
  intro: [
    erz('Nachts, Marktplatz 10. Vorn, durch die Ladentür. Hupfs Schlüssel knirscht, die Glocke bimmelt. Niemand duckt sich.', { scene: 'zentrale' }),
    erz('Ein Laden voller Lollis, an der Wand ein Bildschirm mit unserem Chat, hinten die Treppe. Unten rattern vier Maschinen.'),
    erz('Hinter dem Tresen steht Otti, Lolli im Mund, und sagt: „Schätzchen, Sie tippen noch? Wie altmodisch. Inventur.“'),
    ben('Ich war Ihr Lieferant, Otti. Heute bin ich Lehrling. Und ich habe Ihr Handbuch gelesen. Zwei Euro.'),
    jun('ZUM ERSTEN MAL MITTENDRIN. Ist das hier immer so laut? Egal. Die Maschine da hat MEINEN Daumen.'),
    ada('Vier Zeilen, {codename}. Was du tippst, kennt sie nicht. Was sie kennt, tippt sie dir weg. Sei neu.'),
    // zwei Antworten ohne Gadget und die Zusatz-Antwort mit der Blindflug-Brille (nie Bedingung)
    kr('Bereit? (Ich kenne ihr Signal. Von innen. Wenn sie zuckt, zucke ich zuerst.)', {
      choices: [
        ans('abschalten', 'Wir schalten ab', 'Wir schalten ab. Zeile für Zeile.', [ada('Zeile für Zeile. Sie liest mit. Lass sie. Lesen ist nicht tippen.')]),
        ans('staedte', 'Für alle Städte', 'Für Bad Qwertz. Und für Nebelhausen und Tastow.', [ben('Für alle Städte auf der Liste. Die kennen uns nicht. Egal. Wir sie auch nicht.')]),
        ans('brille', 'Brille', 'Brille auf. Ich sehe nur den Schirm.', [kr('Tasten weg, Schirm an. Deine Finger wissen, wo sie sind. Die Hubbel auf F und J auch.')], { needs: 'blindflug-brille' }),
      ],
    }),
    erz('Aus dem Lautsprecher über der Treppe, süß wie ein Lolli: „Inventur, Schätzchen. Zehn Finger, frisch.“ Es wird lauter.'),
  ],
  success: [
    erz('Die letzte Zeile steht. Maschine 1 verstummt, Maschine 2, Maschine 3. Ein Glas rollt über den Boden: ein O.', { scene: 'zentrale' }),
    erz('Maschine 4 rattert weiter. Aus dem Lautsprecher: „Schätz–“ Dann korrigiert sie sich selbst: „–ung: Sie haben verloren.“'),
    erz('Otti nimmt den Lolli aus dem Mund. Zum ersten Mal sagt sie nichts. Dann: „Schätzchen. Das war nicht mein Befehl.“'),
    erz('Und leiser, zu Krümel: „Die kleine Drohne wollte schneller sein. Ein Paket, kein Absender. Gratis, Schätzchen.“'),
    kr('Ihr Befehl war: Tipp für mich. Die Maschine hat gelernt, von wem sie lernen soll. Von dir. Zehn Finger, frisch.'),
    ben('Das O. Ich nehme es. Nein. Du nimmst es. Ich trage den Korb. Das kann ich.', {
      choices: [
        ans('schild', 'Aufs Ortsschild', 'Aufs Ortsschild. Heute Nacht noch.', [ada('Heute Nacht. Kringel hat die Leiter. Er steht seit einer Stunde vor der Tür. Mit Mantel.')]),
        ans('maschine4', 'Und Maschine 4?', 'Und Maschine 4? Sie läuft noch.', [
          jun('SIE FRAGT. Guck auf den Bildschirm: „Schätzchen, wie geht Zeile vier?“ Sie fragt, statt zu beenden!'),
        ]),
      ],
    }),
    ada('Drei Maschinen stehen, das O ist frei, die vierte fragt. Und in der Tür steht Hupf. Mit dem Schlüssel. Und einem Schild.'),
  ],
  fail: [kr('Überschrieben. {prozent} % der Zeilen gehalten. Sie hat gelernt. Du auch. Noch mal. Neu.')],
  backdoorOffer: [
    ada('Sie beendet deine Zeilen schneller, als du tippst. Benno sagt, er kennt einen Weg: den alten. Den Stecker.'),
    ada('Dann geht es weiter – aber der Einsatz bleibt auf der Karte markiert, und wir holen ihn später nach.'),
  ],
  backdoorTaken: [
    erz('Benno geht an den Maschinen vorbei, bückt sich hinter Maschine 4 und zieht. „Dieb bleibt Dieb. Ein letztes Mal.“', { scene: 'zentrale' }),
    erz('Es wird still. Maschine 1, 2 und 3 laufen aus, ein Glas rollt über den Boden: ein O. Der Bildschirm bleibt an.'),
    ada('Geschafft – fürs Erste. Das O ist frei, die Maschinen stehen. Wenn du magst, komm zurück und tipp die Folge selbst.'),
  ],
};

/** Wie das Modul auf der Missionskarte heißt */
export const LABEL: ModuleLabel = { act: 'Akt 7', place: 'Das Finale' };
