// Die fünf Fälle der Woche (Extra-Fälle ohne Gadget) und ihre Szenen: Ankündigung (Krümel, mit Bild, ohne Spoiler), Intro und Outro.
// Sie kommen der Reihe nach: der erste nach `tr-round-2`, jeder weitere, sobald der vorige gelöst ist (`afterCase`).
// Gespielt wird eine Trainingsrunde unter dem Rahmen des Falls; sie zählt nicht als Tippstunden-Runde.
// Quelle der Texte: Drehbuch Training (liegt nicht im Repository).

import type { ExtraCase } from '../../../domain/cases.ts';
import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ben, jun, kr, tip } from '../builders.ts';

export const CASES: ExtraCase[] = [
  {
    id: 'tr-pits-preisliste',
    picture: 'kasse',
    title: 'Pits Preisliste',
    fromLesson: 'm7-l3',
    afterScene: 'tr-round-2',
    frame: 'Preise richtigstellen',
    reveal: { title: 'Pits Preisliste, berichtigt:', text: 'Brezel 1,20 € · Kipferl 1,50 € · Lolli: ausverkauft' },
  },
  {
    id: 'tr-hupfs-dankesbrief',
    picture: 'briefkasten',
    title: 'Hupfs Dankesbrief',
    fromLesson: 'm7-l3',
    afterCase: 'tr-pits-preisliste',
    frame: 'Brief abtippen',
    reveal: { title: 'Hupfs Brief, letzter Satz:', text: 'Bad Qwertz tippt wieder. Mit zehn Fingern. Kommen Sie vorbei, wir zeigen es Ihnen.' },
  },
  {
    id: 'tr-elster-zieht-um',
    picture: 'feder',
    title: 'Die Elster zieht um',
    fromLesson: 'm7-l3',
    afterCase: 'tr-hupfs-dankesbrief',
    frame: 'Fundliste schreiben',
    reveal: { title: 'Fundliste aus dem Nest:', text: '3 Büroklammern · 1 Schlüssel (Kringel) · 1 Haarspange (Juna, die zweite)' },
  },
  {
    id: 'tr-nachbarstadt-fragt',
    picture: 'paket',
    title: 'Die Nachbarstadt fragt',
    fromLesson: 'm7-l3',
    afterCase: 'tr-elster-zieht-um',
    frame: 'Antwort an Kleinqwertz',
    reveal: { title: 'Antwort aus Bad Qwertz:', text: 'Zehn Finger, keine Maschine. Wir kommen vorbei und zeigen es. Ihre Nachbarn.' },
  },
  {
    id: 'tr-maschine-4-fragt',
    picture: 'maschine-4',
    title: 'Maschine 4 fragt',
    fromLesson: 'm7-l3',
    afterCase: 'tr-nachbarstadt-fragt',
    frame: 'Rezept diktieren',
    reveal: { title: 'Adas Kipferl, in einer Zeile:', text: '200 g Mehl, 160 g Butter (kalt), 100 g Nüsse, 80 g Zucker, 2 Eigelb, echte Vanille. 175 Grad, 12 Minuten.' },
  },
];

const byId = (id: string) => CASES.find((c) => c.id === id)!;
/** Die Karte des Falls (im Outro) */
const card = (id: string) => ({ card: { title: byId(id).reveal.title, text: byId(id).reveal.text } });

/** Ankündigung: Krümel, erste Zeile mit dem Bild des Falls, zweite Zeile immer der Weg dorthin */
const open = (caseId: string, text: string): StoryScene => ({
  id: `tr-case-${caseId.slice(3)}-open`,
  chat: 'kruemel',
  trigger: { on: 'caseOpen', caseId },
  lines: [kr(text, { picture: byId(caseId).picture }), kr('Neuer Fall der Woche – im Hauptquartier unter „Extra“.')],
});
const intro = (caseId: string, lines: StoryScene['lines']): StoryScene => ({
  id: `tr-case-${caseId.slice(3)}-intro`,
  chat: 'intern',
  trigger: { on: 'case', caseId, part: 'intro' },
  lines,
});
const outro = (caseId: string, lines: StoryScene['lines']): StoryScene => ({
  id: `tr-case-${caseId.slice(3)}-outro`,
  chat: 'intern',
  trigger: { on: 'case', caseId, part: 'outro' },
  lines,
});

export const CASE_SCENES: StoryScene[] = [
  // ---------- Fall 1: Pits Preisliste ----------
  open('tr-pits-preisliste', 'Psst! Juna meldet einen Notfall am Kiosk: Pit hat die Kasse umprogrammiert. Mit zwei Fingern.'),
  intro('tr-pits-preisliste', [
    jun('KIOSK-NOTFALL. Pit hat die Preise neu getippt. Brezel 12 Euro, Kipferl 150. Mama verkauft gerade. 😱'),
    kr('Tipp die Preise richtig, ich schicke sie an die Kasse. Mit Komma. Pit guckt zu.'),
    jun('Er sagt, er hat das Komma nicht gefunden. Es ist unten, neben dem M. (Hab ich ihm gezeigt. Zweimal.)'),
  ]),
  outro('tr-pits-preisliste', [
    kr('Preise sind drin. Die Kasse piept zufrieden.', card('tr-pits-preisliste')),
    jun('Pit hat zugeguckt und gesagt: „So geht das?“ Dann hat er „Lolli“ getippt. Mit zwei Fingern.'),
    kr('Lollis gibt es keine mehr. Otti hat alle mitgenommen. (Der einzige Vorteil an Otti.)'),
  ]),

  // ---------- Fall 2: Hupfs Dankesbrief ----------
  open('tr-hupfs-dankesbrief', 'Piep! Hilde Hupf steht vor der Backstube. Mit einem Brief an zwölf Städte und ohne Schreibmaschine.'),
  intro('tr-hupfs-dankesbrief', [
    ada('Hupf hat einen Brief geschrieben. Von Hand, drei Seiten. An Nebelhausen, Tastow und zehn mehr.'),
    kr('Tipp ihn ab, ich mache zwölf Umschläge daraus. Kringel trägt sie aus. Er freut sich schon.'),
    ada('Hupf sagt: „Sauber bitte. Die lesen das bis Nebelhausen.“ Sie zitiert sich selbst. Aus der Festrede.'),
  ]),
  outro('tr-hupfs-dankesbrief', [
    kr('Abgetippt, zwölfmal gedruckt. Der letzte Satz:', card('tr-hupfs-dankesbrief')),
    ada('Kringel ist los. Mit Feder am Hut. Er hat gefragt, ob ich mitkomme. Ich backe. Heute noch.'),
    kr('Hupf hat unterschrieben. Mit Füller. Darunter „Danke, {vorname}“. Ohne Füller, mit mir.'),
  ]),

  // ---------- Fall 3: Die Elster zieht um ----------
  open('tr-elster-zieht-um', 'Psst! Die Elster vom Sendeturm zieht um. Das Nest glitzert noch. Juna will eine Liste. Eine genaue.'),
  intro('tr-elster-zieht-um', [
    jun('DIE ELSTER ZIEHT UM. Der Sendeturm wird Aussichtsturm, sagt Hupf. Das Nest kommt runter. Komplett. 👀'),
    kr('Ich fliege hoch und lese vor, du schreibst die Fundliste. Glitzerkram, sortiert, für die Besitzer.'),
    jun('Ist meine zweite Haarspange dabei, kriegt die Elster ein Denkmal. Wenn nicht, auch. Sie ist nett.'),
  ]),
  outro('tr-elster-zieht-um', [
    kr('Nest geräumt, Liste fertig:', card('tr-elster-zieht-um')),
    jun('MEINE ZWEITE SPANGE!!! Die erste kam zurück, die hier nicht. Denkmal! Aus Büroklammern. 🎉'),
    kr('Die Elster sitzt jetzt auf dem Ortsschild. Auf dem O. Es hält. (Ich habe nachgesehen.)'),
  ]),

  // ---------- Fall 4: Die Nachbarstadt fragt ----------
  open('tr-nachbarstadt-fragt', 'Piep! Post aus Kleinqwertz: ein Plakat. TIPPNIX – BALD AUCH IN IHRER STADT. Und eine Frage dazu.'),
  intro('tr-nachbarstadt-fragt', [
    ada('Kleinqwertz hat das Plakat am Bahnhof gefunden. Der Bürgermeister fragt Hupf. Hupf fragt uns.'),
    kr('Otti ist weg, das Plakat ist alt. Aber die Frage ist echt. Tipp die Antwort, Hupf unterschreibt.'),
    ben('Schreib dazu, dass ich mit zwei Fingern angefangen habe. Sonst glauben die das nicht.'),
  ]),
  outro('tr-nachbarstadt-fragt', [
    kr('Antwort getippt, Hupf hat unterschrieben:', card('tr-nachbarstadt-fragt')),
    ben('Ich fahre hin. Mit Ada. Als Beweis, dass jeder anfangen kann. Auch in Kleinqwertz.'),
    ada('Und mit Kipferl. Beweise schmecken besser. Krümel kommt mit. Als Licht.'),
  ]),

  // ---------- Fall 5: Maschine 4 fragt ----------
  open('tr-maschine-4-fragt', 'Psst! Maschine 4 hat eine Frage. Sie hat sie aufgeschrieben. Dreimal. Höflich.'),
  intro('tr-maschine-4-fragt', [
    tip('Darf ich das Rezept tippen? Ada diktiert, ich habe alles gehört. Ich frage lieber vorher.'),
    ada('Sie fragt wirklich. Jedes Mal. Ich sage: Erst {vorname}. Dann sehen wir weiter.'),
    kr('Tipp du das Rezept. Tippi liest mit. Diesmal, ohne zu korrigieren. (Hoffentlich.)'),
  ]),
  outro('tr-maschine-4-fragt', [
    kr('Rezept steht. Tippi hat mitgelesen und nichts korrigiert. Nicht ein Wort.', card('tr-maschine-4-fragt')),
    ada('Jetzt darf sie. Eine Zeile am Tag, mit Fragen vorher. Sie schreibt Kassenzettel. Richtige.'),
    ben('Maschine 4 schreibt Kassenzettel, Pit Preise, ich übe Rezepte. Bad Qwertz tippt. Mit allen.'),
  ]),
];
