// Story-Texte für Akt 1 „Grundreihe“.
// Platzhalter: {vorname}, {codename}, {agent} (Agent/Agentin); in einzelnen Szenen {prozent}, {teile}
//
// Eine Zeile kann haben:
//   scene   – wechselt den Hintergrund ab dieser Zeile
//   choices – Antworten zum Auswählen; nach der Wahl spricht die Spielfigur, dann folgt `reply`
//   ifTime  – Zeile nur zu bestimmter Tageszeit, Öffnungszeit oder am Sonntag (Varianten ergeben zusammen jede Zeit)
//   keys    – zeigt eine kleine Tastatur, auf der diese Tasten leuchten (KeyboardEvent.code)

import type { Line } from '../../../domain/dialog.ts';
import { ada, ans, bar, erz, kr } from '../builders.ts';
import type { ExamStory, LessonStory, ModuleLabel } from '../../../domain/book.ts';

export const PROLOG: Line[] = [
  // Wochentag und Tageszeit sind echt ({jetzt}); der Satz danach hat drei Fassungen, zu jeder Zeit gilt genau eine
  erz('Bad Qwertz, {jetzt}. Über Nacht ist etwas verschwunden. Nur was? (Weiter mit Enter ⏎, der großen Taste rechts.)', {
    scene: 'backstube',
    keys: ['Enter'],
    ifTime: { daypart: ['morgen'] },
  }),
  erz('Bad Qwertz, {jetzt}. Heute ist etwas verschwunden. Nur was? (Weiter mit Enter ⏎, der großen Taste rechts.)', {
    scene: 'backstube',
    keys: ['Enter'],
    ifTime: { daypart: ['mittag', 'nachmittag', 'abend'] },
  }),
  erz('Bad Qwertz, {jetzt}. Mitten in der Nacht ist etwas verschwunden. Nur was? (Weiter mit Enter ⏎, der großen Taste rechts.)', {
    scene: 'backstube',
    keys: ['Enter'],
    ifTime: { daypart: ['nacht'] },
  }),
  ada('Ah, {vorname}! Gut, dass du kommst. Du hast doch flinke Finger, oder?', {
    choices: [
      ans('flink', 'Klar!', 'Klar! Die flinksten in ganz Bad Qwertz.', [ada('Das hoffe ich. Wir werden sie brauchen.')]),
      ans('glaube', 'Ich glaube schon', 'Äh … ich glaube schon?', [ada('Das reicht mir. Den Rest bringen wir dir bei.')]),
      ans('broetchen', 'Nur ein Brötchen', 'Ich wollte eigentlich nur ein Brötchen.', [
        ada('Das Brötchen kriegst du auch. Später. Vielleicht.', { ifTime: { shopOpen: true } }),
        ada('Die Bäckerei hat gerade zu, aber in der Backstube ist noch Licht. Ein Brötchen findet sich. Vielleicht.', { ifTime: { shopOpen: false } }),
      ]),
    ],
  }),
  kr('Piep! Willkommen im Keller. Ich bin Krümel. Eine Drohne, keine Mücke. Bitte nicht klatschen.', {
    scene: 'keller',
    choices: [
      ans('suess', 'Du bist süß', 'Hallo Krümel! Du bist ja süß.', [kr('Süß?! Ich bin eine hochmoderne Spionagedrohne! … Aber danke.')]),
      ans('name', 'Warum Krümel?', 'Warum heißt du Krümel?', [kr('Ada hat mich aus einer alten Keksdose gebaut. Manchmal rieche ich noch nach Vanille.')]),
      ans('klatsch', 'Klatsch!', '*klatsch*', [kr('HEY! Daneben. Ich bin schneller, als du denkst!')]),
    ],
  }),
  ada('Das ist das Hauptquartier der ZEHN. Jemand stiehlt die Buchstaben der Stadt. Wir holen sie zurück – mit zehn Fingern.', {
    choices: [
      ans('dabei', 'Ich bin dabei!', 'Ich bin dabei!', [ada('Wusste ich es doch, {agent} {codename}. Merk dir: Zwei sind ein Anfang. Zehn sind eine Geheimwaffe.')]),
      ans('zwei', 'Nur zwei Finger', 'Mit ZEHN Fingern? Ich tippe sonst mit zwei.', [ada('Ehrlich. Das mag ich, {agent} {codename}. Zwei sind ein Anfang. Zehn sind eine Geheimwaffe.')]),
    ],
  }),
];

// Bilderbuch-Szenen eines Auftrags. Alles andere erzählt der Chat (chat.ts):
// nur das Briefing von Auftrag 1 (der Einstieg mit Tastatur) und der Auftritt des Barons am Ende von Auftrag 6.
export const LESSON_STORY: Record<string, LessonStory> = {
  'm1-l1': {
    briefing: [
      ada('Erste Lektion: die Grundstellung. Leg deine Zeigefinger auf F und J.', { keys: ['KeyF', 'KeyJ'] }),
      ada('Spürst du die kleinen Hubbel? Damit findest du die Tasten, ohne hinzuschauen.', {
        choices: [
          ans('spuer', 'Ich spür sie!', 'Ich spür sie!', [kr('Piep! Hubbel gefunden. Und ab jetzt: nicht auf die Tastatur gucken!')]),
          ans('huckel', 'Welche Hubbel?', 'Welche Hubbel?', [ada('Fühl mal unten auf F und J. Kleine Striche.'), kr('Brille putzen hilft nicht. Finger benutzen!')]),
        ],
      }),
      ada('Die Daumen liegen auf der Leertaste, dem langen Balken unten. Sie macht die Lücke zwischen zwei Wörtern.', { keys: ['Space'] }),
      ada('Enter ⏎ ist die große Taste rechts, für den rechten kleinen Finger. Damit geht es überall weiter.', { keys: ['Enter'] }),
      ada("Krümel muss sich erst auf deine Finger einstellen. Jede Runde macht sein Auge schärfer. Ist es scharf, geht's weiter.", {
        choices: [
          ans('fehlt', 'Was fehlt noch?', 'Und woher weiß ich, was noch fehlt?', [kr('Das zeige ich dir beim Tippen: Jede neue Taste bekommt ein Siegel mit drei Riegeln. Ich liebe Siegel.')]),
          ans('meister', 'Übung, Übung', 'Okay, Übung macht den Meister.', [ada('Und die Meisterin. Genau so.')]),
        ],
      }),
    ],
  },
  'm1-l6': {
    mastered: [
      kr('Ä sitzt, rechter kleiner Finger! Alle zwölf Knoten leuchten. Die ganze Grundreihe gehört dir!'),
      // ab hier im Netz: der Baron erscheint auf den Bildschirmen, nicht leibhaftig im Keller
      erz('11:58 Uhr. Auf allen Bildschirmen der Stadt erscheint ein Zylinder. Mit Monokel.', { scene: 'firewall' }),
      kr('Ein Zylinder! Wie du gesagt hast!', { ifPicked: { scene: 'l5-s75', choice: 'zylinder' } }),
      bar('Guten Tag, meine Lieben! Wie angekündigt hole ich mir jetzt das F. Ich bitte um Ihr Verständnis.', {
        choices: [
          ans('finger', 'Finger weg!', 'Finger weg von unserem F!', [bar('Oho! So neu und schon so viel Temperament. Wie entzückend.')]),
          ans('wer', 'Wer bist du?', 'Wer bist du überhaupt?', [bar('Baron von Backspace, zu Diensten! Meister der Löschung, Künstler der Lücke!')]),
        ],
      }),
      ada('{vorname}, er rüttelt an der Firewall! Zum Einsatz, halte sie!'),
    ],
  },
};

export const EXAM: ExamStory = {
  title: 'Einsatz: Die Firewall',
  won: 'Firewall gehalten!',
  lost: 'Verbindung verloren',
  segments: '{n} von {gesamt} Segmenten gesichert',
  frame: 'Firewall-Codes',
  ready: 'Bereit, wenn Sie es sind!',
  taunts: [
    'Tick, tack, meine Lieben!',
    'Ist das alles? Meine Oma tippt genauer. Mit Handschuhen.',
    'Huch, ein Tippfehler? Wie bedauerlich!',
    'Das F gehört bald mir!',
  ],
  intro: [
    bar('Eine Firewall? Wie niedlich. Mal sehen, wie schnell Ihre kleinen Finger sind!', {
      scene: 'firewall',
      choices: [
        ans('schneller', 'Schneller als du', 'Schneller, als du denkst!', [bar('Das werden wir ja sehen!')]),
        ans('knoechel', 'Knöchel knacken', '(Fingerknöchel knacken lassen)', [kr('Uiii. Jetzt wird es ernst.')]),
        // Extra-Fall „Seifenblasen-Brunnen“: nur mit dem Blasenwerfer
        ans('blasen', 'Blasenwerfer', 'Ich lenk ihn mit Seifenblasen ab!', [bar('Seifenblasen? Wie … entzückend. Und wie lästig!')], { needs: 'blasenwerfer' }),
      ],
    }),
    ada('Tippe die Codes schnell und genau. Jedes richtige Wort macht die Firewall stärker.'),
    kr('Du schaffst das! Ich drück dir die Propeller!'),
  ],
  success: [
    bar('Was?! Ein Neuling mit zehn Fingern? Das ist … unerhört!', {
      scene: 'firewall',
      choices: [
        ans('aufgeben', 'Gib auf!', 'Gib auf, Baron!', [bar('Aufgeben? Ein Backspace gibt niemals auf! Er … pausiert nur.')]),
        ans('anfang', 'Erst der Anfang', 'Das war erst der Anfang.', [bar('Das, mein Kind, sage ich normalerweise.')]),
      ],
    }),
    bar('Na schön. Diesmal behalten Sie Ihr F. Aber ich komme wieder! Au revoir!'),
  ],
  fail: [kr('Verbindung verloren. Stand: {prozent} %. Die Firewall wartet, noch mal!')],
  backdoorOffer: [
    ada('Der Baron ist heute in Höchstform. Ich kann dir eine Hintertür ins Netz öffnen.'),
    ada('Dann geht es weiter – aber der Einsatz bleibt auf der Karte markiert, und wir holen ihn später nach.'),
  ],
  backdoorTaken: [
    erz('Ada tippt etwas sehr schnell. Sehr, sehr schnell. Der Baron schimpft und verschwindet.', { scene: 'firewall' }),
    ada('Geschafft – fürs Erste. Aber die Firewall ist noch wackelig. Wenn du magst, komm zurück und sichere sie richtig.', { scene: 'keller' }),
  ],
};

/** Wie das Modul auf der Missionskarte heißt */
export const LABEL: ModuleLabel = { act: 'Akt 1', place: 'Adas Backstube, Keller' };
