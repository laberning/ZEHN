// Akt 2 im Agenten-Chat: Anfangsszene, je Auftrag Briefing, Stufen bei 25/50/75 % und Abschluss, die Szene nach dem Einsatz.
// Quelle der Texte: Drehbuch Akt 2 (liegt nicht im Repository). Szenen-IDs sind Speicherformat: nie umbenennen.
// Beiträge in anderen Chats (Qwertz-Flüstern, Chat Juna) stehen mit inChat(…) in der Szene.
// Die Schal-Zeile aus dem Drehbuch von `a2-l2-brief` fehlt hier: sie kommt als Geschenk-Szene `a2-gift-schal` (eigene Story).

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ans, goldCard, inChat, jun, kr, sys, unb } from '../builders.ts';

/** Echo: Zeile nur, wenn in `scene` die Antwort `choice` gewählt wurde (null: nichts gewählt) */
const picked = (scene: string, choice: string | null) => ({ ifPicked: { scene, choice } });

const stage = (lessonId: string, at: 0.25 | 0.5 | 0.75) => ({ on: 'stage', lessonId, at }) as const;
const mastered = (lessonId: string) => ({ on: 'mastered', lessonId }) as const;
const briefing = (lessonId: string) => ({ on: 'briefing', lessonId }) as const;

/** Stand des Story-Objekts eines Auftrags in einer Zeile */
const obj = (lessonId: string, at: 0 | 0.25 | 0.5 | 0.75 | 1) => ({ object: { lessonId, at } });

export const CHAT_SCENES: StoryScene[] = [
  // ---------- Anfang: kommt zusammen mit dem Briefing von Auftrag 1, vor ihm ----------
  {
    id: 'a2-start',
    chat: 'intern',
    trigger: briefing('m2-l1'),
    lines: [
      kr('Ada. Wir haben dir was mitgebracht. Der Baron hat es verloren, als er abgehauen ist.', { picture: 'halbes-foto' }),
      ada('{gruss}. Danke, dass ihr gleich gekommen seid.', picked('exam-after-foto', 'ada')),
      ada('{gruss}. Ihr habt erst nachgedacht. Gut. Jetzt rede ich.', picked('exam-after-foto', 'ueberlegen')),
      ada('{gruss}. Ein B neben MEHL, sagt ihr. Ja. Jetzt rede ich.', picked('exam-after-foto', 'lupe')),
      ada('{gruss}. Gut, dass ihr da seid.', picked('exam-after-foto', null)),
      ada('Das bin ich, mit dreißig. Und daneben: Benno. Mein Lehrling. Vor zwanzig Jahren.', {
        choices: [
          ans('baron', 'Der Baron?', 'Benno ist der Baron?', [ada('Ja. Mehr sage ich heute nicht. Nur so viel: Er war gut. Sehr gut.')]),
          ans('mehr', 'Erzähl mehr!', 'Erzähl uns mehr, Ada!', [ada('Nicht heute. Nur so viel: Er hatte die besten Hände in der Backstube. Vor mir.')]),
        ],
      }),
      ada('Die Firewall hält – fürs Erste. Und er hat verraten, wohin es geht: hoch oben, zu den Funkwellen.'),
      kr('Drei Türme hat die Stadt. Welcher funkt? Und: Ich hab Höhenangst. Als Drohne ein Problem.'),
    ],
  },

  // ---------- Auftrag 1 · Funkpeilung (E I) ----------
  {
    id: 'a2-l1-brief',
    chat: 'intern',
    trigger: briefing('m2-l1'),
    lines: [
      kr('Ich hab ein Peilgerät gebaut. Aus einem Radio und einem Schneebesen. Es hört, welcher Turm flüstert.', obj('m2-l1', 0)),
      kr('Drei Türme. Diesmal keine Brötchen. Versprochen.', picked('l1-s25', 'haende')),
      kr('Drei Türme. Diesmal keine Pixel, die aussehen wie Ada. Versprochen.', picked('l1-s25', 'noch')),
      ada('Dafür gehst du in die obere Reihe. Mittelfinger hoch: links E, rechts I. Und immer zurück auf D und K.', { keys: ['KeyE', 'KeyI'] }),
      kr('Jede Runde füllt einen Balken. Dann wissen wir, welcher Turm flüstert.', {
        choices: [
          ans('schneebesen', 'Schneebesen?', 'Ein Schneebesen?', [kr('Antenne. Ada hatte keine Antenne. Ada hatte Schneebesen.')]),
          ans('los', 'Los!', 'Los, Mittelfinger!', [ada('So gefällt mir das.')]),
        ],
      }),
    ],
  },
  {
    id: 'a2-l1-s25',
    chat: 'intern',
    trigger: stage('m2-l1', 0.25),
    lines: [
      kr('Der Wasserturm? Nein. Der Wasserturm gluckert nur. Gluckern ist kein Flüstern.', obj('m2-l1', 0.25)),
      ada('Peilen heißt warten. Und tippen.'),
      inChat('fluestern', jun('LEUTE!!! Ich war beim WERBEFOTO von TIPPNIX. Mit Mama. Es war … anders. Dazu später mehr!!!')),
      kr('Mit ihrer Mama. Immerhin. Und bei uns: zwei Türme übrig. Welcher flüstert?'),
    ],
  },
  {
    id: 'a2-l1-s50',
    chat: 'intern',
    trigger: stage('m2-l1', 0.5),
    lines: [
      kr('Der Kirchturm bimmelt. Der Wasserturm gluckert. Beides laut. Flüstern ist leise.', obj('m2-l1', 0.5)),
      ada('Der alte Sendeturm ist stillgelegt. Seit zwanzig Jahren. Da sendet niemand.', {
        choices: [
          ans('zwanzig', 'Zwanzig Jahre?', 'Zwanzig Jahre? Wie Benno?', [ada('… Ja. Zwanzig Jahre. Weiter peilen.')]),
          ans('stillgelegt', 'Stillgelegt?', 'Was heißt stillgelegt?', [kr('Abgeschaltet. Sagt das Schild am Zaun. Schilder lügen manchmal.')]),
        ],
      }),
      kr('Wer flüstert, will nicht gehört werden. Warum flüstert ein Turm?'),
    ],
  },
  {
    id: 'a2-l1-s75',
    chat: 'intern',
    trigger: stage('m2-l1', 0.75),
    lines: [
      kr('Da! Ein Flüstern. Ganz leise. Ich hab nur zwei Wörter verstanden: „… meine Lieben …“', obj('m2-l1', 0.75)),
      kr('Du hast alles gehört: gluckern, bimmeln, flüstern. Welcher Turm ist es?', {
        choices: [
          ans('sendeturm', 'Der alte Sendeturm', 'Der alte Sendeturm. Stillgelegt – und sendet trotzdem.', [ada('Genau.')]),
          ans('kirchturm', 'Der Kirchturm', 'Der Kirchturm!', [kr('Der bimmelt. Flüstern ist leise. Und wer stillgelegt ist, sollte stumm sein …')]),
          ans('wasserturm', 'Der Wasserturm', 'Der Wasserturm!', [kr('Der gluckert. Flüstern ist leise. Und wer stillgelegt ist, sollte stumm sein …')]),
        ],
      }),
      ada('Der alte Sendeturm. Wer dort sendet, will nicht gefunden werden.'),
      kr('Und was flüstert er? Ich hab nur „meine Lieben“ verstanden. Der Rest kommt mit vollem Balken.'),
    ],
  },
  {
    id: 'a2-l1-done',
    chat: 'intern',
    trigger: mastered('m2-l1'),
    lines: [
      kr('Gepeilt! 📡 Der alte Sendeturm. E und I sitzen, Mittelfinger hoch und zurück. Die Reihe hat begonnen.', obj('m2-l1', 1)),
      kr(
        'Und er hat uns was geschickt. Über Funk. Mit Goldrand. Er kann sogar das.',
        goldCard('Hoch oben wohnen die Funkwellen. Und ich. Nicht so laut, meine Lieben. B. v. B.', 'Über Funk'),
      ),
      ada('Er hört mit. Stell das Peilgerät auf Flüstern. Tipp das Codewort – ohne runterzugucken.'),
      kr('Wer beim Tippen auf die Tasten guckt, nickt mit dem Kopf. Das hört man. Im Ernst.', {
        choices: [ans('leise', 'leise', 'leise', [kr('Flüstermodus an. Mit E und I aus der oberen Reihe! Jetzt hört er uns nicht mehr. Hoffentlich.')], { typed: 'leise' })],
      }),
      kr('Noch was. Auf dem Sendeturm wohnt eine Elster. Ihr Nest glitzert. Warum glitzert ein Nest?'),
    ],
  },

  // ---------- Auftrag 2 · Dachlandung (R U) ----------
  {
    id: 'a2-l2-brief',
    chat: 'intern',
    trigger: briefing('m2-l2'),
    gives: ['fernglas'],
    lines: [
      ada('Zum Sendeturm geht es über die Dächer.'),
      kr('Und ich hab dir ein Fernglas gebaut. Aus zwei Marmeladengläsern. Du siehst den Turm, er dich nicht.', { item: 'fernglas' }),
      ada('Fürs Fliegen: Zeigefinger hoch. Links R, rechts U. Und immer zurück auf F und J.', { keys: ['KeyR', 'KeyU'] }),
      kr('Mein Rotor ist verbogen. Auf dem Dach hat mich gestern was angegriffen. Jede Runde biegt ihn gerade.', {
        ...obj('m2-l2', 0),
        choices: [
          ans('angegriffen', 'Angegriffen?', 'Von wem angegriffen?', [kr('Weiß ich nicht. Es war schwarz-weiß und schnell. Und frech.')]),
          ans('hoehenangst', 'Höhenangst?', 'Und deine Höhenangst?', [kr('Hab ich noch. Aber ich hab auch ein Ziel. Das hilft.')]),
        ],
      }),
    ],
  },
  {
    id: 'a2-l2-s25',
    chat: 'intern',
    trigger: stage('m2-l2', 0.25),
    lines: [
      kr('Rotor halb gerade. Ich fliege schief, aber ich fliege. Erster Stopp: das Dach vom Hotel.', obj('m2-l2', 0.25)),
      kr('Da! Das Schwarz-Weiße. Eine Elster. Sie sitzt auf dem Sendeturm und guckt mich an. Frech.'),
      inChat('fluestern', jun('LEUTE!!! Auf dem Sendeturm wohnt eine ELSTER. Sie klaut GLITZERKRAM. Meine Haarspange ist WEG!!! 😱')),
      kr('Elstern sammeln, was glitzert. Darum glitzert das Nest. Aber was genau sammelt sie da oben?'),
    ],
  },
  {
    id: 'a2-l2-s50',
    chat: 'intern',
    trigger: stage('m2-l2', 0.5),
    lines: [
      kr('Ich bin am Nest. Mit halbem Rotor. Es glitzert von Goldstaub. Wie am Ortsschild!', obj('m2-l2', 0.5)),
      kr('Goldstaub, Goldrand-Schnipsel und ein rundes Glas mit Goldrand. Ada?', { picture: 'elsternest' }),
      ada('Ein Monokel-Glas. Wer trägt heute noch ein Monokel?', {
        choices: [
          ans('baron', 'Ein Baron!', 'Ein Baron!', [ada('Ein eitler. Ja.')]),
          ans('fernglas', 'Fernglas', 'Ich schau mit dem Fernglas hin.', [kr('In das Glas ist ein B geritzt. Winzig. Er signiert alles.')], { needs: 'fernglas' }),
        ],
      }),
      kr('Alles, was glitzert, landet hier oben. Wer verliert so viel Goldstaub?'),
    ],
  },
  {
    id: 'a2-l2-s75',
    chat: 'intern',
    trigger: stage('m2-l2', 0.75),
    lines: [
      kr('Die Elster hat mich wieder erwischt! Rotor fast gerade – und sie zupft dran! Ihre Feder hängt drin.', { picture: 'rotor-75' }),
      inChat('fluestern', jun('DIE ELSTER war\'s!!! SIE klaut die Buchstaben!!! Ich hab\'s GEWUSST!!! 🔥')),
      kr('Juna sagt, die Elster war\'s. Goldstaub, Goldrand, Monokel, alles in ihrem Nest. Was meinst du?', {
        choices: [
          ans('sammelt', 'Sie sammelt nur', 'Sie sammelt nur, was er verliert.', [ada('Genau. Elstern nehmen, was glitzert. Keine Buchstaben.')]),
          ans('elster', 'Die Elster war\'s', 'Die Elster hat die Buchstaben!', [kr('Und das Monokel? Trägt sie das beim Klauen? Nee. Sie sammelt, was einer verliert.')]),
        ],
      }),
      ada('Er kommt hier oft vorbei. Und er verliert Dinge. Also ist er oft hier oben.'),
      kr('Oft hier oben. Wo genau? Ich komme ran, sobald der Rotor gerade ist.'),
    ],
  },
  {
    id: 'a2-l2-done',
    chat: 'intern',
    trigger: mastered('m2-l2'),
    lines: [
      kr('Rotor gerade! R und U sitzen, Zeigefinger hoch und zurück. Ich fliege wieder geradeaus. Fast. ⚡', obj('m2-l2', 1)),
      kr('Jetzt rauf auf den Sendeturm. Ich brauche nur das Kommando. Im Flüstermodus, du weißt schon.'),
      ada('Sag ihm, wohin. Und guck ihn an, nicht die Tasten. Er hat Höhen-Respekt.', {
        choices: [ans('rauf', 'rauf', 'rauf', [kr('Rauf! Mit R und U aus der oberen Reihe. Ich fliege! Höhenangst? Nur noch Höhen-Respekt.')], { typed: 'rauf' })],
      }),
      kr('Und unten am Turm steht Herr Kringel mit einem Brief. Er riecht nach Lavendel. Wie die Karte damals.'),
    ],
  },

  // ---------- Auftrag 3 · Wetterbericht (T Z) ----------
  {
    id: 'a2-l3-brief',
    chat: 'intern',
    trigger: briefing('m2-l3'),
    lines: [
      kr('Am Markt steht die Wettertafel. Sie zeigt: HEI ER BIS WOLKIG. Und WEI GRAD. Da fehlt was.', obj('m2-l3', 0)),
      ada('T und Z: Zeigefinger hoch und ein Stück zur Mitte, links T, rechts Z. Dann zurück auf F und J.', { keys: ['KeyT', 'KeyY'] }),
      kr('Kringel riecht nach Lavendel. Wie die Karte. Und was steht in seinem Brief? Ich bleib dran.', {
        choices: [
          ans('unauffaellig', 'Unauffällig?', 'Du? Unauffällig?', [kr('Ich bin eine Keksdose. Niemand verdächtigt eine Keksdose.')]),
          ans('passauf', 'Pass auf!', 'Pass auf dich auf.', [kr('Immer. Ich hab ja jetzt Höhen-Respekt.')]),
        ],
      }),
      kr('Du hattest Kringel ja schon mal im Verdacht. Jeden Tag Brötchen. Und jetzt Lavendel.', picked('l2-s75', 'verdaechtig')),
    ],
  },
  {
    id: 'a2-l3-s25',
    chat: 'intern',
    trigger: stage('m2-l3', 0.25),
    lines: [
      kr('Die Tafel hat jetzt eine Laufschrift. Ein Wetteransager: „{gruss}, meine Lieben. Heiter bis wolkig.“', obj('m2-l3', 0.25)),
      ada('„Meine Lieben.“ Wo hab ich das schon mal gehört.'),
      inChat('fluestern', jun('LEUTE, das WERBEFOTO: Es gab KEIN Foto. Otti hat mich eine Stunde TIPPEN lassen. Vor einer MASCHINE.')),
      kr('Nie wieder tippen, und dann lässt sie Juna tippen? Deine Frage von damals war gut.', picked('l5-s25', 'nietippen')),
      kr('Und Lollis gab es auch keine. Gut, dass du nicht hin bist.', picked('l5-s25', 'lollis')),
      ada('Ein Werbefoto ohne Foto. Behalten wir im Kopf. Warum lässt man ein Kind eine Stunde tippen?'),
    ],
  },
  {
    id: 'a2-l3-s50',
    chat: 'intern',
    trigger: stage('m2-l3', 0.5),
    lines: [
      kr('T ist zurück: HEITER! Und ich hab Kringel beschattet. Er war in der Drogerie. Lavendel-Parfüm.', obj('m2-l3', 0.5)),
      kr('Du hast ja schon mal gefragt, ob Kringel B. v. B. ist. Jetzt kommt\'s.', picked('l4-s25', 'kringel')),
      kr('Und auf dem Brief steht „Für Ada“. Er trägt ihn seit Tagen mit sich rum. Was heißt das?', {
        choices: [
          ans('verliebt', 'Verliebt!', 'Kringel ist verliebt. Das Parfüm ist für Ada!', [ada('Kringel. Ich hab\'s geahnt. Weiter im Text.')]),
          ans('verdaechtig', 'Trotzdem verdächtig', 'Lavendel wie auf der Karte. Verdächtig!', [kr('Die Karte lag in seinem Postsack. Neben dem Parfüm. Darum roch sie so. Er ist nur verliebt.')]),
          ans('schreibt', 'Er schreibt Ada', 'Mit der Lupe: Die Schrift kenne ich. Er schreibt Ada.', [ada('Kringel schreibt mir seit Wochen. Ich antworte nicht. Noch nicht.')], { needs: 'lupe' }),
        ],
      }),
      ada('Kringel ist entlastet. Der Lavendel kam aus dem Postsack. Bleibt der Ansager mit „meine Lieben“.'),
    ],
  },
  {
    id: 'a2-l3-s75',
    chat: 'intern',
    trigger: stage('m2-l3', 0.75),
    lines: [
      kr('Z ist zurück: ZWEI GRAD. Und die Laufschrift hat gemerkt, dass wir zuschauen.', obj('m2-l3', 0.75)),
      kr('Die Stimme kommt vom alten Sendeturm. Sie sagt „meine Lieben“. Goldrand im Ton. Wer ist der Ansager?', {
        choices: [
          ans('ansager', 'Der Ansager', 'Der Ansager ist der Baron!', [ada('Ja. Er sendet vom Turm. Und er genießt es.')]),
          ans('otti', 'Otti', 'Otti von TIPPNIX?', [kr('Otti beendet fremde Sätze. Der hier beginnt sie mit „meine Lieben“. Das ist der Baron.')]),
          ans('elster', 'Die Elster', 'Die Elster?', [kr('Elstern sagen nicht „meine Lieben“. Die sagen „Meins“. Das ist der Baron.')]),
        ],
      }),
      ada('Der Wetteransager ist der Baron. Vom alten Sendeturm, mitten in die Stadt.'),
      ada('Dann holen wir uns die Tafel zurück. Sobald T und Z sitzen.'),
    ],
  },
  {
    id: 'a2-l3-done',
    chat: 'intern',
    trigger: mastered('m2-l3'),
    lines: [
      kr('T und Z sitzen, Zeigefinger zur Mitte und zurück! Die Tafel zeigt echtes Wetter: heiter bis wolkig.', obj('m2-l3', 1)),
      ada('Das Eingabefeld fragt: Wann soll die Sendung des Barons enden? Augen auf die Tafel. Tipp es.', {
        choices: [ans('jetzt', 'jetzt', 'jetzt', [kr('Jetzt! Mit T und Z aus der oberen Reihe. Sendung Ende. Der Ansager ist stumm.')], { typed: 'jetzt' })],
      }),
      kr(
        'Er hat noch was reingeschoben, bevor er stumm war. Natürlich mit Goldrand.',
        goldCard('Sie nehmen mir mein Wetter? Dann nehme ich mir heute Nacht alle O. Hochachtungsvoll, B. v. B.', 'Von der Wettertafel'),
      ),
      kr('Alle O? Was wird aus Brot? Aus Post? Aus dem Hotel? Wie holt man alle O einer Stadt?'),
    ],
  },

  // ---------- Auftrag 4 · Alle O (W O) ----------
  {
    id: 'a2-l4-brief',
    chat: 'intern',
    trigger: briefing('m2-l4'),
    lines: [
      kr('Es ist passiert. Über Nacht. Alle O der Stadt sind weg. BR T. P ST. H TEL. Und KUR RT sowieso.', obj('m2-l4', 0)),
      ada('Ringfinger hoch: W und O. Und zurück auf S und L. Jedes O, das du sicher tippst, holt eins zurück.', { keys: ['KeyW', 'KeyO'] }),
      kr('Ada hat heute BR T gebacken. Schmeckt gleich. Klingt anders.', {
        choices: [
          ans('alle', 'Alle O?', 'Wirklich alle O?', [kr('Alle. Sogar aus den Namen. Krümel hat kein O. Glück gehabt.')]),
          ans('warum', 'Warum O?', 'Warum ausgerechnet das O?', [ada('Weil er damit angefangen hat. Am Ortsschild. Er sammelt.')]),
        ],
      }),
      ada('Und wohin mit so vielen O? Ein O ist rund. Das rollt nicht von allein.'),
    ],
  },
  {
    id: 'a2-l4-s25',
    chat: 'intern',
    trigger: stage('m2-l4', 0.25),
    lines: [
      kr('BROT ist zurück! Ada hat es sofort geprüft. Mit dem Messer. Und mit dem Mund.', obj('m2-l4', 0.25)),
      inChat('fluestern', jun('LEUTE!!! Der Kiosk heißt jetzt KI SK. Mama sagt, das klingt wie Husten. 😂 Wer hat unser O?!')),
      ada('Der Turm war heute Nacht still. Kein Flüstern. Er war unterwegs.'),
      kr('Alle fragen dasselbe wie Juna. Und ich frage: Wohin bringt einer eine ganze Stadt voller O?'),
    ],
  },
  {
    id: 'a2-l4-s50',
    chat: 'intern',
    trigger: stage('m2-l4', 0.5),
    lines: [
      kr('POST ist zurück. Kringel hat geweint. Vor Freude. Er sagt, P ST sah aus wie ein Tippfehler.', obj('m2-l4', 0.5)),
      kr('Und: Die O kommen von selbst zurück, sobald du sie sicher tippst. Genau wie Ada gesagt hat.'),
      ada('Was du sicher tippst, kann er nicht behalten. Er muss es zurückgeben. Ob er will oder nicht.', {
        choices: [
          ans('ortsschild', 'Und das Ortsschild?', 'Und das O vom Ortsschild?', [ada('Das kommt nicht. Und ich weiß noch nicht, warum.')]),
          ans('wo', 'Wo sind sie?', 'Wo sind die O, solange sie weg sind?', [kr('Gute Frage. Bei ihm? Er hat heute Nacht nicht gesendet. Er war unterwegs.')]),
        ],
      }),
      kr('Eins fehlt noch immer: KUR RT. Das O vom Ortsschild. Warum kommt das nicht?'),
    ],
  },
  {
    id: 'a2-l4-s75',
    chat: 'intern',
    trigger: stage('m2-l4', 0.75),
    lines: [
      kr('HOTEL leuchtet wieder! Und das Peilgerät flackert. Der Turm sendet. Direkt in unseren Chat. 📡', obj('m2-l4', 0.75)),
      sys('Unbekannt ist dem Chat beigetreten.'),
      unb('Meine Lieben. Ich h le mir alle O. Und Sie geben sie einfach zurück. Unerhört!'),
      kr('Er hat kein O mehr. Nicht mal für „hole“. Du tippst sie ihm weg!'),
      kr('Drei von vier sind zurück. Nur KUR RT bleibt. Warum kommt das O vom Ortsschild nicht?', {
        choices: [
          ans('weitergegeben', 'Weitergegeben', 'Er hat es nicht mehr. Er hat es weitergegeben!', [ada('Dann kann er es nicht zurückgeben. Genau.')]),
          ans('versteckt', 'Er versteckt es', 'Er versteckt es besser.', [ada('Verstecken hilft nicht. Was du sicher tippst, kommt zurück. Es sei denn, er hat es nicht mehr.')]),
          ans('kaputt', 'Es ist kaputt', 'Vielleicht ist es kaputt.', [kr('Ein O geht nicht kaputt. Das ist rund. Rund hält. Also: Er hat es nicht mehr.')]),
        ],
      }),
      ada('Wer hat es dann?'),
      sys('Unbekannt hat den Chat verlassen.'),
    ],
  },
  {
    id: 'a2-l4-done',
    chat: 'intern',
    trigger: mastered('m2-l4'),
    lines: [
      kr('W und O sitzen! Alle O sind zurück. Bis auf eins. Das Ortsschild bleibt KUR RT.', obj('m2-l4', 1)),
      ada('Weitergegeben. An jemanden, der Buchstaben braucht. Wofür braucht man Buchstaben, ohne zu tippen?'),
      ada('Das Hotel hat angerufen. Die Leuchtschrift hängt.'),
      ada('Sie braucht ein Startwort. Tipp den Namen. Das O kommt vom Ringfinger!', {
        choices: [ans('hotel', 'hotel', 'hotel', [kr('HOTEL leuchtet! Mit deinem O aus der oberen Reihe. Der Portier winkt. Glaub ich. Er winkt immer.')], { typed: 'hotel' })],
      }),
      kr('Vom Hoteldach: Um den Sendeturm kreist ein Pizzaroboter. Nachts. Wer bestellt Pizza auf einen Turm?'),
    ],
  },

  // ---------- Auftrag 5 · Pizza-Patrouille (Q P) ----------
  {
    id: 'a2-l5-brief',
    chat: 'intern',
    trigger: briefing('m2-l5'),
    gives: ['verkleidungskoffer'],
    lines: [
      kr('Der Pizzaroboter von „Pizza Pronto“ fährt nachts um den Sendeturm. Keiner bestellt. Ich zeichne mit.', obj('m2-l5', 0)),
      ada('Kleine Finger hoch: Q und P. Die äußersten Tasten der Reihe. Dann zurück auf A und Ö.', { keys: ['KeyQ', 'KeyP'] }),
      ada('Und zieh dir was an. Mein alter Verkleidungskoffer: Pizzabote, Gärtner, Zahnfee. Such dir was aus.', {
        item: 'verkleidungskoffer',
        choices: [
          ans('zahnfee', 'Zahnfee?', 'Zahnfee?', [ada('Hat einmal funktioniert. Frag nicht.')]),
          ans('pizzabote', 'Pizzabote!', 'Pizzabote, klar.', [kr('Dann riechst du wenigstens mal nach was anderem als Vanille.')]),
        ],
      }),
      kr('Wer bestellt nachts Pizza auf einen Turm? Und wer liefert sie?'),
    ],
  },
  {
    id: 'a2-l5-s25',
    chat: 'intern',
    trigger: stage('m2-l5', 0.25),
    lines: [
      kr('Erster Abschnitt: Pizza Pronto, Markt, dann Kurve. Jede Nacht dieselbe Runde. Mit einer Pizza.', obj('m2-l5', 0.25)),
      kr('Auf dem Karton: PIZZA PRONTO, eine Krone und ein Notfallwort. Ein Roboter mit Notfallwort. Aha.'),
      inChat('fluestern', jun('LEUTE!!! Der Pizzaroboter hat mir gestern ZUGEWINKT. Roboter winken NICHT!!!')),
      kr('Eine Krone wie auf der Karte damals. Und ein Roboter, der winkt. Was winkt da?'),
    ],
  },
  {
    id: 'a2-l5-s50',
    chat: 'intern',
    trigger: stage('m2-l5', 0.5),
    lines: [
      kr('Halbe Runde gezeichnet. Der Roboter hält jede Nacht an derselben Stelle: der Turmtür. Zwei Minuten.', obj('m2-l5', 0.5)),
      ada('Zwei Minuten für eine Pizza? Niemand nimmt sie ab. Der Turm ist stillgelegt.'),
      kr('Ich hab nachgeschaut. Jede Nacht derselbe Karton. Kalt. Seit Tagen. Was macht er da?', {
        choices: [
          ans('liefert', 'Er liefert nicht', 'Er liefert nicht. Er holt ab.', [ada('Oder er fährt jemanden.')]),
          ans('isst', 'Wer isst die?', 'Wer isst die Pizza?', [kr('Keiner. Die Pizza ist Tarnung. Für was auch immer da drin sitzt.')]),
        ],
      }),
      kr('Ein Roboter, der nichts liefert, aber jede Nacht zum Turm fährt. Was steckt da drin?'),
    ],
  },
  {
    id: 'a2-l5-s75',
    chat: 'intern',
    trigger: stage('m2-l5', 0.75),
    lines: [
      kr('Ich war ganz nah dran. Der Roboter hat gesprochen. Mit Schnörkel: „Platz da, meine Lieben.“', obj('m2-l5', 0.75)),
      kr('Dann ist er abgehauen. Schneller, als ein Pizzaroboter darf. Was steckt da drin?', {
        choices: [
          ans('lieben', '„Meine Lieben“', '„Meine Lieben“ – im Roboter steckt der Baron!', [ada('Natürlich. Ein Zylinder passt in einen Pizzakarton. Gerade so.')]),
          ans('lautsprecher', 'Ein Lautsprecher', 'Nur ein Lautsprecher vom Turm.', [kr('Lautsprecher hauen nicht ab. Der ist gefahren wie ein Baron mit Angst vor Drohnen.')]),
          ans('verkleidung', 'Verkleidung', 'Als Pizzabote halte ich ihn an!', [kr('Er hat dich gegrüßt! „Kollege!“ Und dann Gas gegeben. Da drin steckt der Baron.')], { needs: 'verkleidungskoffer' }),
        ],
      }),
      kr('Er hat was verloren. Schon wieder. Eine Skizze.', { picture: 'skizze-tuer' }),
      ada('Die Turmtür. Und ein Schloss mit zwei Punkten. Wie ein Ü.'),
      kr('Ein Ü-Schloss. Wir können noch kein Ü. Noch nicht.'),
    ],
  },
  {
    id: 'a2-l5-done',
    chat: 'intern',
    trigger: mastered('m2-l5'),
    lines: [
      kr('Q und P sitzen, kleine Finger hoch! Die Route ist komplett: Pizza Pronto, Markt, Turm, Tür, zurück.', obj('m2-l5', 1)),
      ada('Der Roboter kommt wieder. Sein Notfallwort steht drauf. Er braucht lange dafür. Du nicht mehr.', {
        choices: [ans('stopp', 'stopp', 'stopp', [kr('Stopp! Mit P aus der oberen Reihe. Der Roboter steht. Deckel auf: keine Pizza. Nur ein Zettel.')], { typed: 'stopp' })],
      }),
      kr('„Der Teig geht noch, Ada. B.“ Ada? Was heißt das?', goldCard('Der Teig geht noch, Ada. B.', 'Zettel aus dem Roboter')),
      ada('Das hat er früher gesagt. Wenn etwas noch nicht fertig war. … Später.'),
      sys('Ada ist offline.'),
      kr('Offline. Sie will nicht reden. Was ist noch nicht fertig? Und für wen?'),
    ],
  },

  // ---------- Auftrag 6 · Die Tür (Ü) ----------
  {
    id: 'a2-l6-brief',
    chat: 'intern',
    trigger: briefing('m2-l6'),
    lines: [
      ada('Letzte Taste der oberen Reihe: Ü. Rechter kleiner Finger hoch, über dem Ä, und zurück auf Ö. Dann steht die Reihe.', { keys: ['BracketLeft'] }),
      kr('Das Ü-Schloss an der Turmtür. Jede Runde leuchtet ein Stück. Leuchtet das ganze Ü, geht die Tür auf.', obj('m2-l6', 0)),
      ada('Und dann ist er da drin. Benno. Wir gehen zusammen.', {
        choices: [
          ans('bereit', 'Bereit', 'Ich bin bereit.', [ada('Ich weiß. Ich auch. Fast.')]),
          ans('sagen', 'Was sagst du?', 'Was sagst du ihm, Ada?', [ada('Das weiß ich seit zwanzig Jahren nicht. Weiter.')]),
        ],
      }),
      kr('Und noch was: Seit gestern folgt uns jemand. Leise. Zu leise für Kringel.'),
    ],
  },
  {
    id: 'a2-l6-s25',
    chat: 'intern',
    trigger: stage('m2-l6', 0.25),
    lines: [
      kr('Der erste Punkt leuchtet. Und hinter uns hat wieder was geknackt. Auf dem Dach vom Hotel.', obj('m2-l6', 0.25)),
      ada('Der Baron? Der schleicht nicht. Der macht Auftritte.'),
      kr('Jemand Kleines. Mit Turnschuhen. Und einem Handy, das blinkt.'),
      kr('Wer schleicht uns nach? Ich dreh mich um, sobald der Rotor es erlaubt.'),
    ],
  },
  {
    id: 'a2-l6-s50',
    chat: 'intern',
    trigger: stage('m2-l6', 0.5),
    lines: [
      kr('Der Bogen leuchtet. Halbes Ü. Und ich hab mich umgedreht: Turnschuhe, Handy, Pferdeschwanz. Weg.', obj('m2-l6', 0.5)),
      inChat('fluestern', jun('Heute kein Beitrag. Bin beschäftigt. Sehr GEHEIM beschäftigt!!!')),
      kr('Juna hat seit zwei Tagen nichts Richtiges gepostet. Juna postet immer. Was meinst du?', {
        choices: [
          ans('juna', 'Juna folgt uns', 'Juna folgt uns. Sie will wissen, was wir machen.', [ada('Natürlich. Dieses Mädchen findet alles raus. Ich hab\'s gesagt.')]),
          ans('baron', 'Der Baron', 'Der Baron verfolgt uns.', [kr('Der Baron trägt keine Turnschuhe. Und er postet nicht „GEHEIM“. Das ist Juna.')]),
          ans('elster', 'Die Elster', 'Die Elster.', [kr('Mit Turnschuhen? Nein. Pferdeschwanz, Handy, „GEHEIM“: Das ist Juna.')]),
        ],
      }),
      ada('Lasst sie. Mit uns ist sie sicherer als allein. Und wir haben jetzt keine Zeit.'),
      kr('Und wenn sie sieht, wohin die Tür führt?'),
    ],
  },
  {
    id: 'a2-l6-s75',
    chat: 'intern',
    trigger: stage('m2-l6', 0.75),
    lines: [
      kr('Zwei Punkte und ein Bogen. Fast ein Ü. Die Tür vibriert. Dahinter sendet er. Laut. Er weiß Bescheid.', obj('m2-l6', 0.75)),
      kr('Laufschrift auf der Schlossplatte: „Kommen Sie ruhig rein, meine Lieben. Ich bin schon weg. Fast.“'),
      ada('Er wartet auf uns. Das hat er früher auch gemacht. Vor der Prüfung.', {
        choices: [
          ans('pruefung', 'Welche Prüfung?', 'Welche Prüfung, Ada?', [ada('Seine. Ich war die Prüferin. Die Geschichte erzähle ich euch noch.')]),
          ans('los', 'Dann los', 'Dann gehen wir rein.', [ada('Sobald das Ü leuchtet. Nicht früher. Er soll sehen, dass du es kannst.')]),
        ],
      }),
      kr('Ein Punkt fehlt. Und dann: Was macht er, wenn wir drin sind?'),
    ],
  },
  {
    id: 'a2-l6-done',
    chat: 'intern',
    trigger: mastered('m2-l6'),
    lines: [
      kr('Ü sitzt, rechter kleiner Finger! Die ganze obere Reihe: E I R U T Z W O Q P Ü. Das Schloss leuchtet.', obj('m2-l6', 1)),
      ada('Das Schloss will wissen, was es öffnen soll. Tipp es, wie Frau Hubbel es wollte: ohne hinzuschauen.', {
        choices: [ans('tuer', 'tür', 'tür', [kr('Tür! Mit Ü, der letzten Taste der Reihe. Sie geht auf. Es riecht nach Pizza. Und nach Vanille.')], { typed: 'tür' })],
      }),
      kr('Er ist drin. Und er rennt. Hoch, über die Funkbrücken zum nächsten Turm. Hinterher!'),
      ada('Juna. Ja, du. Bleib hier an der Tür. Bitte. Wir sind gleich zurück.'),
    ],
  },

  // ---------- Nach dem Einsatz (Erfolg oder Hintertür), einmal ----------
  {
    id: 'a2-exam-after',
    chat: 'intern',
    trigger: { on: 'exam', moduleId: 'm2' },
    lines: [
      kr('Er ist weg. Und die obere Reihe ist sicher. Elf Tasten, alle deine.'),
      ada('Alle elf. Gut. Und er hat was dagelassen: „Unten, wo die Stadt sich erinnert.“ Was ist unten?', { picture: 'fahrkarte' }),
      inChat('juna', jun('Ich steh hinter dir. Im KELLER. Unter der BACKSTUBE. Also DAS ist euer Geheimnis!!!')),
      kr('Sie steht wirklich hinter uns. Mit Turnschuhen. Ada guckt. Was sagst du?', {
        choices: [
          ans('mitmachen', 'Sie soll mitmachen', 'Sie soll mitmachen. Sie hat uns sowieso gefunden.', [ada('Mit ihrer Mutter. Sonst nicht.')]),
          ans('fragen', 'Ada fragen', 'Ada, was meinst du?', [ada('Mit ihrer Mutter. Sonst nicht.')]),
        ],
      }),
      inChat('juna', jun('MIT MAMA?! … Okay. Okay!!! Ich frag sie. Heute noch. 🙌')),
    ],
  },
];
