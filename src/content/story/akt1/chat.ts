// Akt 1 im Agenten-Chat: Briefings 2–6, Stufen bei 25/50/75 %, Abschlüsse 1–5 und die Szene nach dem Einsatz.
// Quelle der Texte: Drehbuch Akt 1 (liegt nicht im Repository). Szenen-IDs sind Speicherformat: nie umbenennen.
// Beiträge in anderen Chats (Qwertz-Flüstern, Krümels private Zeilen) stehen mit inChat(…) in der Szene.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ans, goldCard, inChat, jun, kr, sys, unb } from '../builders.ts';

/** Echo: Zeile nur, wenn in `scene` die Antwort `choice` gewählt wurde (null: nichts gewählt) */
const picked = (scene: string, choice: string | null) => ({ ifPicked: { scene, choice } });

const stage = (lessonId: string, at: 0.25 | 0.5 | 0.75) => ({ on: 'stage', lessonId, at }) as const;

/** Die Goldrand-Karte nach dem Einsatz (auch in der Fallakte bei der Spur zum Funkturm) */
export const FUNKTURM_CARD = 'Hoch oben, wo die Funkwellen wohnen …';

export const CHAT_SCENES: StoryScene[] = [
  // ---------- Auftrag 1 · Kamera-Auge (Briefing ist Bilderbuch) ----------
  {
    id: 'l1-s25',
    chat: 'intern',
    trigger: stage('m1-l1', 0.25),
    lines: [
      sys('Krümel hat dich zu ZEHN intern hinzugefügt.'),
      kr('Willkommen im geheimsten Chat der Stadt! Hier sind nur Ada, ich und jetzt du.'),
      kr('Mein Auge stellt sich langsam auf dich ein.', { object: { lessonId: 'm1-l1', at: 0.25 } }),
      kr('Ich sehe schon: zwei Hände. Oder zwei Brötchen.', {
        choices: [
          ans('haende', 'Hände!', 'Das sind Hände, Krümel!', [kr('Sicher? Die eine riecht nach Brötchen.')]),
          ans('noch', 'Was noch?', 'Was siehst du sonst noch?', [kr('Pixel. Sehr viele Pixel. Ein Pixel sieht aus wie Ada.')]),
        ],
      }),
      ada('Weiter so. Und Krümel: keine Fotos von Kunden.'),
    ],
  },
  {
    id: 'l1-s50',
    chat: 'intern',
    trigger: stage('m1-l1', 0.5),
    lines: [
      kr('Schon besser! Das ist … der Marktplatz!', { object: { lessonId: 'm1-l1', at: 0.5 } }),
      kr('Und da vorne das Ortsschild. Fällt dir was auf?', {
        choices: [
          ans('o', 'Das O fehlt!', 'Da fehlt das O!', [kr('Stimmt! Und in der Lücke glitzert was.')]),
          ans('normal', 'Alles normal', 'Sieht doch normal aus.', [kr('Schau mal: KUR RT. Das O ist weg. Und da glitzert was.')]),
        ],
      }),
      ada('Schau genauer hin, wenn du scharf siehst.'),
    ],
  },
  {
    id: 'l1-s75',
    chat: 'intern',
    trigger: stage('m1-l1', 0.75),
    lines: [
      kr('Ich rieche heute wieder so nach Vanille. Ist das normal für eine Keksdose?'),
      ada('Ganz normal. Die Dose war … sehr alt.', {
        choices: [
          ans('alt', 'Wie alt?', 'Wie alt war die Dose denn?', [ada('Älter als Krümel. Jünger als ich. Weiter im Text.')]),
          ans('gut', 'Riecht gut', 'Also ich finde, das riecht gut.', [kr('Danke! Ich bin die einzige Drohne mit Dessert-Duft.')]),
        ],
      }),
      kr('Warum guckst du so komisch, Ada?'),
    ],
  },
  {
    id: 'l1-done',
    chat: 'intern',
    trigger: { on: 'mastered', lessonId: 'm1-l1' },
    lines: [
      kr("Scharf wie ein Brotmesser! F und J sitzen, beide Zeigefinger. Ich hab's gemessen.", { object: { lessonId: 'm1-l1', at: 1 } }),
      kr('Wo das O war, liegt Goldstaub. Und eine Karte mit Goldrand!', goldCard('Ein O für meine Sammlung. Hochachtungsvoll, B.', 'Am Ortsschild')),
      kr('Wer schreibt denn so was?', {
        choices: [
          ans('dieb', 'Ein Dieb!', 'Ein Dieb mit Stil!', [ada('Mit Stil. Leider.')]),
          ans('fan', 'Ein Fan?', 'Ein Buchstaben-Fan?', [kr('Ein Fan, der klaut, ist kein Fan.')]),
        ],
      }),
      ada('Erst das O. Was holt er sich als Nächstes?'),
    ],
  },

  // ---------- Auftrag 2 · Dein Agentenausweis ----------
  {
    id: 'l2-brief',
    chat: 'intern',
    trigger: { on: 'briefing', lessonId: 'm1-l2' },
    lines: [
      ada('Heute: Mittelfinger. D und K. Sie liegen gleich neben F und J: Die Finger sind schon da, sie müssen nur drücken.', { keys: ['KeyD', 'KeyK'] }),
      kr('Und ich drucke deinen Agentenausweis! Der Drucker ist alt. Er druckt nur, wenn du übst.', {
        choices: [
          ans('echt', 'Echt jetzt?', 'Der Drucker merkt, wenn ich übe?', [kr('Er hängt an der Tastatur. Frag nicht. Er ist von 1987.')]),
          ans('cool', 'Cool!', 'Ein echter Ausweis? Cool!', [ada('Mit Foto. Lächeln nicht vergessen. 👍')]),
        ],
      }),
    ],
  },
  {
    id: 'l2-s25',
    chat: 'intern',
    trigger: stage('m1-l2', 0.25),
    lines: [
      kr('Ratter, ratter. Die Kopfzeile ist schon da!', { object: { lessonId: 'm1-l2', at: 0.25 } }),
      inChat('fluestern', jun('LEUTE!!! Das O vom Ortsschild ist weg!!! Wer war das? Ich finde es raus. Versprochen. 👀')),
      kr('Das ist Juna vom Kiosk. Ihr Klatschkanal. Ich lese heimlich mit. (Alle lesen heimlich mit.)'),
      ada('Dieses Mädchen findet alles raus. Das ist ja das Problem.'),
    ],
  },
  {
    id: 'l2-s50',
    chat: 'intern',
    trigger: stage('m1-l2', 0.5),
    lines: [
      kr('Dein Foto ist fertig! Ich hab dich von deiner besten Seite gedruckt.', {
        object: { lessonId: 'm1-l2', at: 0.5 },
        choices: [
          ans('mehl', 'Mehl?!', 'Warum hab ich Mehl im Gesicht?!', [kr('Tarnung. Bäckerlehrling. Sehr glaubwürdig.')]),
          ans('gut', 'Sieht gut aus', 'Sieht eigentlich ganz gut aus.', [kr('Ich weiß. Ich bin ein Künstler.')]),
        ],
      }),
    ],
  },
  {
    id: 'l2-s75',
    chat: 'intern',
    trigger: stage('m1-l2', 0.75),
    lines: [
      ada('Achtung, gleich kommt der Postbote. Herr Kringel. Benehmt euch.', { ifTime: { sunday: false } }),
      ada('Heute kommt keine Post, es ist Sonntag. Herr Kringel kommt trotzdem. Benehmt euch.', { ifTime: { sunday: true } }),
      kr('Er kommt jeden Tag. Auch ohne Post. Dann kauft er ein Brötchen. Und guckt Ada an. Lange.'),
      ada('Krümel!', {
        choices: [
          ans('verliebt', 'Verliebt?', 'Ist Herr Kringel etwa verliebt?', [kr('Ich sage nichts. Ich bin eine Drohne. (Ja.)')]),
          ans('verdaechtig', 'Verdächtig!', 'Jeden Tag? Das ist verdächtig.', [ada('Herr Kringel ist so verdächtig wie ein Wattebausch.')]),
        ],
      }),
    ],
  },
  {
    id: 'l2-done',
    chat: 'intern',
    trigger: { on: 'mastered', lessonId: 'm1-l2' },
    lines: [
      ada('Hier ist er: dein Ausweis. Mit meinem Brezel-Stempel. Ab jetzt bist du offiziell {agent} {codename}.', { object: { lessonId: 'm1-l2', at: 1 } }),
      kr('Und D und K sitzen auch, Mittelfinger links und rechts! Das muss gefeiert werden. Testcroissant! 🥐'),
      ada('Moment. Kringel hat etwas dagelassen. Eine Karte. Mit Goldrand.'),
      kr('Goldrand? Woher kennen wir den?', {
        choices: [
          ans('ortsschild', 'Vom Ortsschild!', 'Von der Karte am Ortsschild!', [kr('Genau! Die Karte mit dem O.')]),
          ans('keine', 'Keine Ahnung', 'Keine Ahnung.', [kr('Vom Ortsschild! Die Karte mit dem O.')]),
        ],
      }),
    ],
  },

  // ---------- Auftrag 3 · Die Goldrand-Karte ----------
  {
    id: 'l3-brief',
    chat: 'intern',
    trigger: { on: 'briefing', lessonId: 'm1-l3' },
    gives: ['dechiffrierscheibe'],
    lines: [
      kr('Die Karte riecht nach Lavendel.', { object: { lessonId: 'm1-l3', at: 0 } }),
      kr('Dein „Dieb mit Stil“ benutzt Parfüm.', picked('l1-done', 'dieb')),
      kr('Dein „Buchstaben-Fan“ benutzt Parfüm.', picked('l1-done', 'fan')),
      ada('Diesen Goldrand kenne ich … schon länger.', {
        choices: [
          ans('woher', 'Woher?', 'Woher kennst du den Goldrand, Ada?', [ada('Ich hab so einen mal selbst gekauft. Für jemanden. Mehr später.')]),
          ans('aerger', 'Ärger!', 'Das riecht nach Ärger.', [kr('Und nach Lavendel.')]),
        ],
      }),
      ada('Nimm die Dechiffrierscheibe. Die hat schon Frau Hubbel gehört. Meiner Lehrerin.', { item: 'dechiffrierscheibe' }),
      kr('Für den Code brauchen wir S und L. Ringfinger, ihr seid dran! Alle anderen Finger bleiben auf der Grundreihe liegen.', { keys: ['KeyS', 'KeyL'] }),
    ],
  },
  {
    id: 'l3-s25',
    chat: 'intern',
    trigger: stage('m1-l3', 0.25),
    lines: [
      kr('Ein paar Buchstaben sind schon da. Ich rate: „Holunder und Marzipan“?', { object: { lessonId: 'm1-l3', at: 0.25 } }),
      ada('Krümel, das ist kein Rezept.'),
    ],
  },
  {
    id: 'l3-s50',
    chat: 'intern',
    trigger: stage('m1-l3', 0.5),
    lines: [
      kr('„Heute um 12 hole ich mir …“ Da kommt noch was!', {
        object: { lessonId: 'm1-l3', at: 0.5 },
        choices: [
          ans('broetchen', 'Brötchen?', 'Vielleicht holt er sich nur ein Brötchen?', [ada('Wer Karten mit Goldrand schreibt, will kein Brötchen.')]),
          ans('weiter', 'Weiter!', 'Wie lesen wir den Rest?', [kr('Mehr üben, mehr lesen. So geht Entschlüsseln!')]),
        ],
      }),
    ],
  },
  {
    id: 'l3-s75',
    chat: 'intern',
    trigger: stage('m1-l3', 0.75),
    lines: [
      sys('Unbekannt ist dem Chat beigetreten.'),
      unb('{gruss}, meine Lieben. Wie ich sehe, lesen Sie meine Post.', { ifTime: { daypart: ['morgen', 'mittag', 'nachmittag', 'abend'] } }),
      unb('Noch wach, meine Lieben? Wie ich sehe, lesen Sie meine Post.', { ifTime: { daypart: ['nacht'] } }),
      kr('Wer ist das?! Ada?! Das ist unser Geheimchat! Alarm-Piep!'),
      unb('Geheim? Das Passwort war „Brötchen“.', {
        choices: [
          ans('wer', 'Wer bist du?', 'Wer bist du?', [unb('Lesen Sie zu Ende, dann wissen Sie es. Hochachtungsvoll.')]),
          ans('raus', 'Raus hier!', 'Raus aus unserem Chat!', [unb('Wie unhöflich. Ich gehe ja schon.')]),
        ],
      }),
      sys('Unbekannt hat den Chat verlassen.'),
      ada('Krümel. Passwort ändern. Sofort.'),
      kr('Neues Passwort: „Croissant“.'),
    ],
  },
  {
    id: 'l3-done',
    chat: 'intern',
    trigger: { on: 'mastered', lessonId: 'm1-l3' },
    lines: [
      kr('Entschlüsselt!', { object: { lessonId: 'm1-l3', at: 1 } }),
      kr('Was will er sich holen?', {
        choices: [
          ans('f', 'Das F!', 'Er will unser F!', [kr('Genau! Ohne F kein Frühstück! Keine Ferien!')]),
          ans('broetchen', 'Ein Brötchen', 'Ein Brötchen?', [kr('Lies nochmal: das F! Ohne F kein Frühstück!')]),
        ],
      }),
      kr('Aber S und L sitzen bei dir, Ringfinger links und rechts. Kann er sie dann überhaupt klauen?'),
      ada('Was du sicher tippst, kann man nicht klauen. Solange das Grundnetz hält. Darum will er ans Netz.'),
      kr('Und welches „heute“? Da steht kein Datum.'),
    ],
  },

  // ---------- Auftrag 4 · Rückseite der Karte ----------
  {
    id: 'l4-brief',
    chat: 'intern',
    trigger: { on: 'briefing', lessonId: 'm1-l4' },
    lines: [
      kr('Auf der Rückseite ist noch was. Aber man sieht es noch nicht.', { object: { lessonId: 'm1-l4', at: 0 } }),
      ada('Jetzt kommen die kleinen Finger: A und Ö, ganz außen auf der Grundreihe. Danach kannst du echte Wörter tippen.', { keys: ['KeyA', 'Semicolon'] }),
      kr('„das“, „lass“, „Salsa“! Ich liebe Salsa. Ich kann nur nicht tanzen. Keine Beine.'),
    ],
  },
  {
    id: 'l4-s25',
    chat: 'intern',
    trigger: stage('m1-l4', 0.25),
    lines: [
      kr('Auf der Rückseite sind Schnörkel.', { object: { lessonId: 'm1-l4', at: 0.25 } }),
      inChat('fluestern', jun('LEUTE!!! Postbote Kringel trägt jetzt eine Feder am Hut!!! Was hat DAS zu bedeuten??? 😮')),
      kr('Du fandest Kringel ja schon verdächtig. Wattebausch hin oder her.', picked('l2-s75', 'verdaechtig')),
      kr('Hast du das im Flüstern gelesen?', {
        choices: [
          ans('kringel', 'Kringel?', 'Ist Kringel etwa B. v. B.?', [inChat('intern', ada('Kringel? Der kann nicht mal ein Brötchen klauen, ohne sich zu entschuldigen.'))]),
          ans('woher', 'Woher weiß sie\'s?', 'Woher weiß Juna das alles?', [inChat('intern', kr('Sie steht den ganzen Tag am Kiosk. Der Kiosk sieht alles.'))]),
        ],
      }),
    ],
  },
  {
    id: 'l4-s50',
    chat: 'intern',
    trigger: stage('m1-l4', 0.5),
    lines: [
      kr('Eine Krone! Ein König? Eine Königin? Ein Brezelkönig?', { object: { lessonId: 'm1-l4', at: 0.5 } }),
      ada('Ich kenne diese Krone. Ich erzähle euch alles, wenn ich so weit bin.', {
        choices: [
          ans('versprochen', 'Versprochen?', 'Versprichst du uns das?', [ada('Versprochen. Bäckerinnen-Ehrenwort.')]),
          ans('jetzt', 'Warum nicht jetzt?', 'Warum nicht jetzt gleich?', [ada('Weil manche Geschichten noch nicht fertig gebacken sind.')]),
        ],
      }),
      ada('Nur so viel: Diese Krone hat mal jemand auf meine Brötchentüten gemalt.'),
    ],
  },
  {
    id: 'l4-s75',
    chat: 'intern',
    trigger: stage('m1-l4', 0.75),
    lines: [
      kr("Da ist ein Wasserzeichen. Eine Brezel. Wo hab ich die schon mal gesehen?", {
        object: { lessonId: 'm1-l4', at: 0.75 },
        choices: [
          ans('ausweis', 'Kenn ich!', 'Das ist Adas Brezel – wie auf meinem Ausweis!', [kr('Stimmt! Ada, das ist dein Briefpapier!')]),
          ans('baecker', 'Beim Bäcker?', 'Bei jedem Bäcker?', [kr('Nein, schau: der Stempel von deinem Ausweis. Adas Brezel!')]),
        ],
      }),
      ada('Das Papier ist zwanzig Jahre alt. Ich habe es verschenkt. Nicht benutzt. Verschenkt.'),
      sys('Ada ist offline.'),
      kr('Sie ist offline. Das macht sie nur, wenn der Ofen brennt. Oder wenn sie nicht reden will.'),
    ],
  },
  {
    id: 'l4-done',
    chat: 'intern',
    trigger: { on: 'mastered', lessonId: 'm1-l4' },
    lines: [
      sys('Ada ist wieder online.'),
      kr('Baron von Backspace? Was ist das denn für ein Name?', {
        object: { lessonId: 'm1-l4', at: 1 },
        choices: [
          ans('film', 'Wie im Film', 'Klingt wie ein Bösewicht aus einem Film.', [ada('Er wäre gern einer.')]),
          ans('loeschtaste', 'Die Löschtaste!', 'Backspace – das ist doch die Löschtaste!', [ada('Genau. Und löschen, das kann er.')]),
        ],
      }),
      ada('Bereit für den Baron? Dann tipp es selbst. Finger auf die Hubbel, Augen auf den Schirm.', {
        choices: [ans('ja', 'ja', 'ja', [kr('Du hast selbst im Chat geschrieben! A und Ö sitzen, beide kleinen Finger, und jetzt auch Wörter!')], { typed: 'ja' })],
      }),
      kr('Ada? … Sie backt mitten in der Nacht Vanillekipferl. Und hat die Tür zugemacht. Das macht sie nie.'),
    ],
  },

  // ---------- Auftrag 5 · Die Schilder am Markt ----------
  {
    id: 'l5-brief',
    chat: 'intern',
    trigger: { on: 'briefing', lessonId: 'm1-l5' },
    lines: [
      kr('Spur gefunden! Am Markt fehlen Buchstaben!', { object: { lessonId: 'm1-l5', at: 0 } }),
      ada('Er übt schon fürs F: Am Markt hat er sich G und H geholt. Linker Zeigefinger G, rechter H, zurück auf F und J.', { keys: ['KeyG', 'KeyH'] }),
      ada('Kurz zur Mitte rutschen, dann zurück auf F und J!'),
      ada('Du weißt ja: Was du sicher tippst, kann er nicht behalten.'),
      kr('Jede Runde holt ein Stück Buchstabe zurück. Ich klebe mit!'),
    ],
  },
  {
    id: 'l5-s25',
    chat: 'intern',
    trigger: stage('m1-l5', 0.25),
    lines: [
      inChat('fluestern', jun('LEUTE!!! Neuer Laden am Markt: TIPPNIX – Nie wieder tippen! Gratis Lollis!!!')),
      inChat('fluestern', jun('Die Besitzerin heißt Otti Korrekt. Sooo nett. Nur … sie beendet dauernd meine Sätze.')),
      inChat('fluestern', jun('Ich so: „Ich mag Lollis mit Kirsch–“, Otti: „–kernkissen? Hab ich im Angebot, Schätzchen!“ Hä???')),
      kr('Juna schon wieder. Was sagst du?', {
        choices: [
          ans('lollis', 'Lollis!', 'Gratis Lollis? Da will ich hin!', [inChat('intern', ada('Erst die Schilder. Dann Lollis.'))]),
          ans('nietippen', 'Nie tippen?', 'Wie soll das gehen, nie wieder tippen?', [
            inChat('intern', kr('Vielleicht tippt ein Roboter für dich. Ich bin ein Roboter. Ich tippe nie für dich. Ehrenkodex.')),
          ]),
        ],
      }),
    ],
  },
  {
    id: 'l5-s50',
    chat: 'intern',
    trigger: stage('m1-l5', 0.5),
    lines: [
      kr('Das H ist zurück! APOTHEKE!', { object: { lessonId: 'm1-l5', at: 0.5 } }),
      inChat('fluestern', jun('Otti sucht den schnellsten Tipper der Stadt. Für ein Werbefoto!')),
      inChat('fluestern', jun('Ich hab {vorname} vorgeschlagen!!! Du tippst doch dauernd heimlich, oder?')),
      kr('Juna! Man schlägt doch niemanden vor, ohne zu fragen!', {
        choices: [
          ans('werbefoto', 'Werbefoto!', 'Ein Werbefoto? Klingt cool.', [ada('Du musst nirgendwo hin. Wenn überhaupt, fragen wir erst deine Eltern.')]),
          ans('komisch', 'Komisch', 'Warum will sie gerade mich?', [ada('Gute Frage. Was will ein Laden, der nie tippen will, mit dem schnellsten Tipper?')]),
        ],
      }),
    ],
  },
  {
    id: 'l5-s75',
    chat: 'intern',
    trigger: stage('m1-l5', 0.75),
    gives: ['beweisfach'],
    lines: [
      kr('Ich habe eine Feder gefunden. Von einem sehr eleganten Hut. Was für ein Hut ist so elegant?', {
        picture: 'feder',
        choices: [
          ans('zylinder', 'Zylinder?', 'Von einem Zylinder vielleicht?', [ada('… Ja. Ganz bestimmt ein Zylinder. 👍')]),
          ans('beweis', 'Beweisstück!', 'Die müssen wir aufheben.', [kr('Genau dafür hab ich was gebaut.')]),
        ],
      }),
      kr('Neu in deinem Koffer: ein Beweisfach. Erstes Beweisstück: diese Feder.', { item: 'beweisfach' }),
      kr('Eine wirklich entzückende Feder, meine Lieben.'),
      kr('Moment. Warum hab ich „meine Lieben“ gesagt? So rede ich doch gar nicht.'),
    ],
  },
  {
    id: 'l5-done',
    chat: 'intern',
    trigger: { on: 'mastered', lessonId: 'm1-l5' },
    lines: [
      kr('H und G sind zurück, Zeigefinger zur Mitte und wieder heim! Die Apotheke freut sich. Die Gans auch.', { object: { lessonId: 'm1-l5', at: 1 } }),
      inChat('fluestern', jun('Die Buchstaben sind ZURÜCK! Über Nacht! Wer war das?! Ich krieg\'s raus!!! 🎉')),
      kr('Oh-oh. Sie ist uns auf der Spur.'),
      ada('Beeilen wir uns. Sein „heute“ kann jeder Tag sein. Das Netz muss halten.'),
    ],
  },

  // ---------- Auftrag 6 · Das Grundnetz (Abschluss ist Bilderbuch) ----------
  {
    id: 'l6-brief',
    chat: 'intern',
    trigger: { on: 'briefing', lessonId: 'm1-l6' },
    lines: [
      ada('Letzte Taste der Grundreihe: Ä. Rechter kleiner Finger, eins weiter nach rechts als Ö, und dann zurück auf Ö.', { keys: ['Quote'] }),
      kr('Jede Runde schaltet Knoten frei. Leuchten alle, steht die Firewall: eine Schutzmauer ums Netz!', { object: { lessonId: 'm1-l6', at: 0 } }),
      ada('Und er kommt. Heute um 12. Oder morgen. Er hat ja das Datum vergessen.'),
    ],
  },
  {
    id: 'l6-s25',
    chat: 'intern',
    trigger: stage('m1-l6', 0.25),
    lines: [
      kr('10:30 Uhr. Drei Knoten leuchten schon!', { object: { lessonId: 'm1-l6', at: 0.25 } }),
      kr('Moment. Ein Knoten ist eben ausgegangen. Und wieder an. Was war das?', {
        choices: [
          ans('baron', 'Der Baron', 'Das war der Baron, oder?', [ada('Genau. Er testet das Netz. Er ist näher, als ich dachte.')]),
          ans('kaputt', 'Wackelkontakt', 'Vielleicht ein Wackelkontakt?', [ada('Nein. Er testet das Netz. Er ist näher, als ich dachte.')]),
        ],
      }),
    ],
  },
  {
    id: 'l6-s50',
    chat: 'juna',
    trigger: stage('m1-l6', 0.5),
    lines: [
      sys('Juna möchte dir schreiben.'),
      jun('Hey. Ich weiß, dass du jeden Tag in den Keller der Backstube gehst. Was macht ihr da unten???', {
        choices: [
          ans('backkurs', 'Backkurs', 'Ich mache einen Backkurs.', [jun('Einen Backkurs. Jeden Tag. Klar.')]),
          ans('geheim', 'Geheim', 'Das ist geheim.', [jun('GEHEIM?! Ich LIEBE Geheimnisse!!!')]),
          ans('nichts', 'Gar nichts', 'Gar nichts. Ehrlich.', [jun('Du lügst schlechter als ein Mehlsack. 🙄')]),
        ],
      }),
      jun('Otti hat übrigens nach dir gefragt. Zweimal.'),
      jun('Warum DU und nicht ich? Egal. Ich krieg\'s raus.'),
    ],
  },
  {
    id: 'l6-s75',
    chat: 'intern',
    trigger: stage('m1-l6', 0.75),
    lines: [
      sys('Unbekannt ist dem Chat beigetreten.'),
      unb('Fleißig, fleißig! Aber ich komme trotzdem, meine Lieben. Ihr Baron von Backfisch.'),
      unb('*Backspace. BACKSPACE! Dieses Gerät! Geschenkt, und es korrigiert ständig!'),
      kr('Wie kommt der wieder rein?! Das Passwort war „Croissant“!'),
      unb('Eben. Und rauswerfen lasse ich mich nicht so leicht. Bis um zwölf!', picked('l3-s75', 'raus')),
      unb('Eben. Wer ich bin, wissen Sie jetzt. Mein Gesicht sehen Sie um zwölf!', picked('l3-s75', 'wer')),
      unb('Eben. Bis um zwölf, meine Lieben!', picked('l3-s75', null)),
      sys('Unbekannt hat den Chat verlassen.'),
      kr("Er ist weg. Neues Passwort, schnell! Wie wär's mit „salsa“? Tipp blind – Spione gucken nie runter.", {
        choices: [ans('salsa', 'salsa', 'salsa', [kr('Passwort steht. Diesmal liest keiner mit.')], { typed: 'salsa' })],
      }),
    ],
  },

  // ---------- Nach dem Einsatz (Erfolg oder Hintertür), einmal ----------
  {
    id: 'exam-after',
    chat: 'intern',
    trigger: { on: 'exam', moduleId: 'm1' },
    lines: [
      inChat('fluestern', jun('DAS F IST NOCH DA!!! Danke, wer auch immer das war. Und wer war der ZYLINDER??? 🎉')),
      ada('Das F ist noch da. Das zählt, {agent} {codename}.'),
      kr('Und er hat eine Karte dagelassen. Natürlich mit Goldrand.', goldCard(FUNKTURM_CARD)),
      ada('Der Funkturm. Da geht es weiter.'),
      kr('Juna ahnt was. Antworten wir ihr lieber nicht.', {
        choices: [
          ans('schweigen', 'Nicht antworten', 'Okay, wir sagen nichts.', [kr('Agentenregel Nummer eins: schweigen und Croissant essen.')]),
          ans(
            'funken',
            'Funken',
            'Ich funk mal Juna an.',
            [
              inChat('juna', jun('Backkurs, ja? Seit wann tragen Bäcker Zylinder?! 😂', picked('l6-s50', 'backkurs'))),
              inChat('juna', jun('GEHEIM, schon klar. Aber das um 12 warst DU, oder?', picked('l6-s50', 'geheim'))),
              inChat('juna', jun('„Gar nichts“, klar. Du lügst immer noch wie ein Mehlsack.', picked('l6-s50', 'nichts'))),
              inChat('juna', jun("WAS war das um 12?! Erzählst du's mir? … Nein? Na gut. Noch nicht.", picked('l6-s50', null))),
            ],
            { needs: 'walkie-talkie' },
          ),
        ],
      }),
    ],
  },
  // Das halbe Foto: eigene Szene im Krümel-Chat, damit „Neue Nachricht“ im HQ den Haken setzt
  {
    id: 'exam-after-foto',
    chat: 'kruemel',
    trigger: { on: 'exam', moduleId: 'm1' },
    lines: [
      kr("Psst, {vorname}. Der Baron hat beim Abhauen was verloren. Ich hab's aufgefangen.", { picture: 'halbes-foto' }),
      kr('Das ist Ada. Vor langer Zeit. Und neben ihr war jemand.', {
        choices: [
          ans('ada', 'Ada zeigen', 'Das sollten wir Ada zeigen.', [kr('Machen wir. Gleich, wenn Ada Zeit hat.')]),
          ans('ueberlegen', 'Erst überlegen', 'Lass uns erst überlegen, was das ist.', [kr('Gut. Aber morgen zeigen wir es Ada. Abgemacht.')]),
          ans('lupe', 'Lupe', 'Ich schau mir das genauer an.', [kr('Neben MEHL ist was gekritzelt. Ganz klein: ein B.'), kr('Gleich zeigen wir es Ada.')], { needs: 'lupe' }),
        ],
      }),
      kr('Ich lege es zu der Feder ins Beweisfach. Das ist jetzt unser Fall.'),
      kr('Und das Foto riecht nach Vanille. Genau wie ich.'),
    ],
  },
];
