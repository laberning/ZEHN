// Akt 3 im Agenten-Chat: Anfangsszene in der U-Bahn, je Auftrag Briefing, Stufen bei 25/50/75 % und Abschluss, die Szene nach dem Einsatz.
// Quelle der Texte: Drehbuch Akt 3 (liegt nicht im Repository). Szenen-IDs sind Speicherformat: nie umbenennen.
// Beiträge in anderen Chats (Chat Juna) stehen mit inChat(…) in der Szene. Frau Hubbel schreibt nur in ZEHN intern, der Baron als „???“.
// Die Geschenk-Szenen (Kopftuch, Grubenstiefel, Faltstiefel) und die Abzeichen-Szene kommen mit den Nebenszenen und Belohnungen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ans, goldCard, hub, inChat, jun, kr, sys, unb } from '../builders.ts';

/** Echo: Zeile nur, wenn in `scene` die Antwort `choice` gewählt wurde */
const picked = (scene: string, choice: string | null) => ({ ifPicked: { scene, choice } });

const stage = (lessonId: string, at: 0.25 | 0.5 | 0.75) => ({ on: 'stage', lessonId, at }) as const;
const mastered = (lessonId: string) => ({ on: 'mastered', lessonId }) as const;
const briefing = (lessonId: string) => ({ on: 'briefing', lessonId }) as const;

/** Stand des Story-Objekts eines Auftrags in einer Zeile */
const obj = (lessonId: string, at: 0 | 0.25 | 0.5 | 0.75 | 1) => ({ object: { lessonId, at } });

export const CHAT_SCENES: StoryScene[] = [
  // ---------- Anfang: kommt zusammen mit dem Briefing von Auftrag 1, vor ihm ----------
  {
    id: 'a3-start',
    chat: 'intern',
    trigger: briefing('m3-l1'),
    lines: [
      kr('Die Fahrkarte: „Unten, wo die Stadt sich erinnert.“ Unten ist die U-Bahn. Heute Nacht fahren wir.'),
      ada('{gruss}. Erst was anderes. Juna. Du wolltest sie dabeihaben.', picked('a2-exam-after', 'mitmachen')),
      ada('{gruss}. Erst was anderes. Juna. Du hast mich gefragt. Das war richtig.', picked('a2-exam-after', 'fragen')),
      ada('{gruss}. Gut, dass ihr da seid.', picked('a2-exam-after', null)),
      ada('Ihre Mutter hat Ja gesagt. Eine Bedingung: Juna bleibt am Funk. Nicht im Tunnel.'),
      kr('Funkerin Juna. Das wird laut. 📡 Was sagst du?', {
        choices: [
          ans('wann', 'Wann kommt sie?', 'Wann kommt sie?', [ada('Wenn du sie holst. Das ist dein Job. Nicht meiner.')]),
          ans('laut', 'Laut ist gut', 'Laut ist gut. Dann hören wir sie auch im Tunnel.', [kr('Sagt die Drohne, die piept. Stimmt aber.')]),
          ans('funken', 'Funken', 'Ich funk sie gleich an.', [kr('Sie hat das zweite. Natürlich. Sie hört wahrscheinlich schon zu.')], { needs: 'walkie-talkie' }),
        ],
      }),
      kr('Er ist unten, eingeholt oder nicht. Die Fahrkarte lag da: Er will uns dort. Was erinnert eine Stadt?'),
    ],
  },

  // ---------- Auftrag 1 · Nachtzug (N M) ----------
  {
    id: 'a3-l1-brief',
    chat: 'intern',
    trigger: briefing('m3-l1'),
    lines: [
      kr('Im Bahnhof hängt der Netzplan. Ohne N und M: BAH HOF. ARKT. Er war schon hier.', obj('m3-l1', 0)),
      ada('Rechter Zeigefinger, einmal runter: N. Gleich daneben: M. Dann zurück auf J.', { keys: ['KeyN', 'KeyM'] }),
      kr('Jede Runde holt ein Stück Plan zurück. Dann wissen wir, wohin der Nachtzug fährt.', {
        choices: [
          ans('nachtzug', 'Nachtzug?', 'Es gibt einen Nachtzug?', [ada('Einmal die Nacht. Die Lokführerin heißt Ortrud. Mehr weiß ich nicht.')]),
          ans('warum', 'Warum unten?', 'Warum ausgerechnet N und M, ganz unten?', [kr('Weil sie unten liegen. Wie er. Untere Reihe, Untergrund. Er hat Humor. Leider.')]),
        ],
      }),
      kr('Und was ist unten, wo die Stadt sich erinnert? Ein Bahnhof erinnert sich an nichts.'),
    ],
  },
  {
    id: 'a3-l1-s25',
    chat: 'intern',
    trigger: stage('m3-l1', 0.25),
    lines: [
      kr('Eine Linie ist wieder da. Sie fährt nach unten. Tiefer, als eine U-Bahn sollte.', obj('m3-l1', 0.25)),
      inChat('juna', jun('Mama hat JA gesagt!!! 🎉 Aber nur Funk. Ich darf nicht mal in den TUNNEL.')),
      kr('Juna wartet. Ada sagt: Du holst sie, wenn der Plan steht. Erst der Plan.'),
      kr('Und noch was von oben: „Der Teig geht noch, Ada.“ Was heißt das eigentlich?'),
      ada('Bennos Lehrlingsspruch. Für: noch nicht fertig. Er sagt mir damit: Er ist es auch nicht.'),
      ada('Eine Linie nach unten. Wer baut eine Bahn, die tiefer fährt als die Stadt?'),
    ],
  },
  {
    id: 'a3-l1-s50',
    chat: 'intern',
    trigger: stage('m3-l1', 0.5),
    lines: [
      kr('Das N ist zurück: BAHNHOF! Und am Ende der Linie steht ein Name. Noch verwischt.', obj('m3-l1', 0.5)),
      kr('Ich hab den Nachtzug gehört. Von unten. Er fährt nur im Dunkeln. Und er hält, wo niemand einsteigt.'),
      ada('Du hast am Peilgerät gefragt: zwanzig Jahre, wie Benno? Ja. Da unten hat es angefangen.', picked('a2-l1-s50', 'zwanzig')),
      ada('Da unten gab es mal was. Vor zwanzig Jahren. Wir sind alle hingefahren. Zur Prüfung.', {
        choices: [
          ans('pruefung', 'Zur Prüfung?', 'Zur Prüfung? Welche Prüfung?', [ada('Jeder ZEHN-Lehrling hat da unten seine Prüfung gemacht. Ich auch, lange davor. Mehr später.')]),
          ans('mit', 'Wer fuhr mit?', 'Wer ist mitgefahren?', [ada('Alle. Auch Benno. Er hat im Zug noch geübt. Mit zwei Fingern.')]),
        ],
      }),
      kr('Eine Prüfung unter der Stadt. Was steht da unten noch rum?'),
    ],
  },
  {
    id: 'a3-l1-s75',
    chat: 'intern',
    trigger: stage('m3-l1', 0.75),
    lines: [
      kr('M zurück: MARKT! Die Endstation hat kein Schild. Nur ein Zeichen: ein Haus mit Säulen. Und ein Buch.', obj('m3-l1', 0.75)),
      kr('„Wo die Stadt sich erinnert.“ Wo erinnert sich eine Stadt an alles? Du hast den Plan gesehen.', {
        choices: [
          ans('archiv', 'Das Stadtarchiv', 'Im Stadtarchiv. Da liegt alles, was die Stadt je aufgeschrieben hat.', [ada('Genau. Unten, im Serverkeller. Da liegt die Stadt in Akten.')]),
          ans('friedhof', 'Der Friedhof', 'Auf dem Friedhof.', [kr('Ein Friedhof hat kein Buch mit Säulen. Erinnern mit Büchern, das ist ein Archiv.')]),
          ans('bahnhof', 'Der Bahnhof', 'Im Bahnhof.', [kr('Der Bahnhof erinnert sich höchstens an Verspätungen. Säulen und Buch: ein Archiv.')]),
        ],
      }),
      ada('Das Stadtarchiv. Alle Akten der Stadt. Auch die der ZEHN. Auch … meine.'),
      kr('Akten der ZEHN im Keller. Was sucht ein Dieb in alten Akten?'),
    ],
  },
  {
    id: 'a3-l1-done',
    chat: 'intern',
    trigger: mastered('m3-l1'),
    lines: [
      kr('N und M sitzen, rechter Zeigefinger runter und zurück! Der Plan: BAHNHOF, MARKT, unten STADTARCHIV.', obj('m3-l1', 1)),
      kr(
        'Im letzten Wagen lag das hier. Goldrand, natürlich.',
        goldCard('Unten, wo die Stadt sich erinnert, meine Lieben. Ich erinnere mich auch. Leider. B. v. B.', 'Im Nachtzug'),
      ),
      ada('Er ist uns voraus. Wir brauchen jemanden am Funk. Du weißt, wen. Hol sie.'),
      inChat(
        'juna',
        jun('Funk an, ich WARTE. 😴 Ein Wort von dir. Und nicht auf die Tasten gucken, ich SEH das!', {
          choices: [ans('komm', 'komm', 'komm', [jun('KOMM! Mit dem neuen M, oder? Ich bin schon unterwegs!!!')], { typed: 'komm' })],
        }),
      ),
      sys('Krümel hat Juna zu ZEHN intern hinzugefügt.'),
      kr('Juna ist drin. Und ich … war schon mal hier. Im Nachtzug. Ich weiß nicht, woher ich das weiß.'),
    ],
  },

  // ---------- Auftrag 2 · Codekarte (C ,) ----------
  {
    id: 'a3-l2-brief',
    chat: 'intern',
    trigger: briefing('m3-l2'),
    lines: [
      ada('Der Serverkeller hat eine Tür. Die Tür hat einen Kartenleser. Die Karte hat Ortrud, die Lokführerin.'),
      kr('Sie leiht sie uns. Aber die Karte ist leer, der Code gelöscht. Jede Runde schreibt ihn zurück.', obj('m3-l2', 0)),
      ada('Dafür: Mittelfinger, beide, einmal runter. Links das C, rechts das Komma. Und zurück auf D und K.', { keys: ['KeyC', 'Comma'] }),
      jun('Ein KOMMA?! Ich dachte, wir retten BUCHSTABEN. 🙄', {
        choices: [
          ans('komma', 'Komma zählt', 'Ein Komma ist auch weg, wenn er es klaut.', [ada('Richtig. Ein Satz ohne Komma stolpert. Und er klaut, was unten liegt.')]),
          ans('ortrud', 'Wer ist Ortrud?', 'Wer ist Ortrud?', [kr('Fährt den Nachtzug seit dreißig Jahren. Redet wenig. Unterschreibt alles mit „O.“')]),
        ],
      }),
      kr('Warum gibt eine Lokführerin ihre Karte an eine Keksdose? Was weiß Ortrud?'),
    ],
  },
  {
    id: 'a3-l2-s25',
    chat: 'intern',
    trigger: stage('m3-l2', 0.25),
    lines: [
      kr('Die Karte hat wieder ein Foto. Ortrud. Mütze, Blick wie ein Prellbock.', obj('m3-l2', 0.25)),
      jun('FUNKER-PROTOKOLL: Ortrud hat mir einen Fahrplan gegeben. Handgeschrieben. Unterschrift: „O.“', { picture: 'fahrplan' }),
      kr('„O.“ Der Buchstabe, der uns fehlt. Zufall?'),
      ada('Ortrud fängt mit O an. Das ist alles. Juna, nicht alles ist ein Fall.'),
      jun('Kommt trotzdem auf meine Liste. Platz 4. VORLÄUFIG.'),
      jun('Otti hat beim Tippen mitgeschrieben. JEDEN Fehler. Wozu schreibt man die Fehler von einem Kind auf?'),
      kr('Und auf dem Fahrplan steht ein Halt, den kein Plan kennt: „S.“ Was ist S.?'),
    ],
  },
  {
    id: 'a3-l2-s50',
    chat: 'intern',
    trigger: stage('m3-l2', 0.5),
    lines: [
      kr('Das Logo ist zurück, und ein Name: ORTRUD P. Die Karte gehört ihr wirklich.', obj('m3-l2', 0.5)),
      ada('Das Archiv hütet Frau Hubbel. Meine Lehrerin. Sie hat heute Nacht die Archivtür offen gefunden.'),
      jun('Die ALTE mit der TRILLERPFEIFE?! Die hat doch selbst einen Schlüssel!!! Platz 3!'),
      ada('Juna. Frau Hubbel ist ZEHN. Länger als ich. Ohne sie gäbe es die ZEHN nicht.', {
        choices: [
          ans('drin', 'Wer dann?', 'Wenn nicht sie: Wer hat die Tür geöffnet?', [kr('Nicht mit einer Karte. Der Leser hat nichts gespeichert. Er kam anders rein.')]),
          ans('pfeife', 'Trillerpfeife?', 'Frau Hubbel hat eine Trillerpfeife?', [ada('Für krumme Rücken. Ich höre sie heute noch. Im Kopf.')]),
        ],
      }),
      kr('Eine offene Tür, kein Karteneintrag. Wie kommt man in einen Keller, ohne durch die Tür zu gehen?'),
    ],
  },
  {
    id: 'a3-l2-s75',
    chat: 'intern',
    trigger: stage('m3-l2', 0.75),
    lines: [
      kr('Der Code-Streifen ist fast da. Und die Karte sagt, was sie öffnet: „ZUTRITT: S.“ Wie der Fahrplan.', obj('m3-l2', 0.75)),
      kr('Ortrud sagt: „S. ist S. Fragen Sie Hubbel.“ Frau Hubbel sagt: „Unten.“ Beide reden wenig.'),
      kr('Also: Endstation Archiv. Ein Halt nur mit Karte. Ein Keller voller Server. Wohin führt S.?', {
        choices: [
          ans('serverkeller', 'Zum Serverkeller', 'S. ist der Serverkeller. Da liegt das Archiv.', [ada('Genau. Der Halt ist direkt vor der Tür.')]),
          ans('stellwerk', 'Zum Stellwerk', 'Zum Stellwerk.', [kr('Das Stellwerk ist oben, und Ortrud sitzt drin. Unten, mit Karte: der Serverkeller.')]),
          ans('schule', 'Zur Schule', 'Zur alten Schule.', [kr('Frau Hubbel war Lehrerin, ja. Aber unten liegt keine Schule. Der Serverkeller.')]),
        ],
      }),
      ada('Der Nachtzug hält am Serverkeller. Nur mit Karte. Er brauchte keine. Er war trotzdem drin.'),
      kr('Wer sich nicht an Türen hält, kennt einen anderen Weg. Welchen?'),
    ],
  },
  {
    id: 'a3-l2-done',
    chat: 'intern',
    trigger: mastered('m3-l2'),
    gives: ['tunnel-karte'],
    lines: [
      kr('C und Komma sitzen, beide Mittelfinger runter und zurück! Karte: ORTRUD P., ZUTRITT S., Code bereit.', obj('m3-l2', 1)),
      jun('Ortrud sagt: Der Leser will ein Codewort. Und: „Sitzen wie bei Frau Hubbel. Gerade. Dann tippen.“', {
        choices: [ans('code', 'code', 'code', [kr('Code! Mit C aus der unteren Reihe. Die Tür summt. Sie geht auf.')], { typed: 'code' })],
      }),
      jun('Und Ortrud lässt was da: eine Karte vom Tunnel. Handgezeichnet. Mit „O.“, natürlich.', { item: 'tunnel-karte' }),
      kr('Drin. Server, Kabel, Staub. Und es riecht nach Vanille. Nach mir. Warum riecht ein Keller nach mir?'),
    ],
  },

  // ---------- Auftrag 3 · Versteck (V .) ----------
  {
    id: 'a3-l3-brief',
    chat: 'intern',
    trigger: briefing('m3-l3'),
    gives: ['grubenlampe'],
    lines: [
      kr('Der Vanillegeruch kommt nicht aus dem Keller. Er kommt von unter dem Bahnsteig. Da ist ein Hohlraum.', obj('m3-l3', 0)),
      kr('Zu dunkel für meine Kamera. Darum: eine Grubenlampe. Aus einer Fahrradlampe und viel Klebeband. 🔦', { item: 'grubenlampe' }),
      ada('Linker Zeigefinger runter: V. Rechter Ringfinger runter: der Punkt. Und zurück auf F und L.', { keys: ['KeyV', 'Period'] }),
      jun('Ein PUNKT. Also ein Satz, der aufhört. Das kann ich nicht!!!', {
        choices: [
          ans('unten', 'Was ist unten?', 'Was ist da unten, Ada?', [ada('Ich weiß es nicht. Ich war nie unter dem Bahnsteig. Es gab keinen Grund. Bis jetzt.')]),
          ans('klebeband', 'Klebeband?', 'Klebeband?', [kr('Klebeband ist das Rückgrat der Technik. Sagt Ada nicht. Sag ich.')]),
        ],
      }),
      kr('Jede Runde leuchtet die Lampe weiter in den Hohlraum. Was riecht da unten nach Vanille?'),
    ],
  },
  {
    id: 'a3-l3-s25',
    chat: 'intern',
    trigger: stage('m3-l3', 0.25),
    lines: [
      kr('Umrisse. Etwas Rundes, flach, mit einer Mulde. Wie ein Teller. Für etwas in meiner Größe.', obj('m3-l3', 0.25)),
      ada('Eine Ladestation. Für eine Drohne. Da unten.'),
      kr('Ada. Du warst nie unter dem Bahnsteig. Woher weißt du, wie eine Drohnen-Ladestation aussieht?'),
      ada('Weil ich mal eine gebaut habe. Vor langer Zeit. Nicht die da. Eine andere.'),
      kr('Eine andere Ladestation. Für eine andere Drohne. Welche?'),
    ],
  },
  {
    id: 'a3-l3-s50',
    chat: 'intern',
    trigger: stage('m3-l3', 0.5),
    lines: [
      kr('Die Lampe an der Station blinkt. Grün. Sie hat Strom. Jemand hat sie frisch angeschlossen.', obj('m3-l3', 0.5)),
      kr('Und daneben: ein Notizbuch. Von heute.', {
        card: { title: 'Bennos Notizbuch', text: 'Neues Gerät bekommen. Das zweite. Geschenkt! Es tippt fast von allein. Endlich. B.' },
        picture: 'notizbuch',
      }),
      jun('GESCHENKT?! Wer schenkt einem DIEB ein Gerät?', {
        choices: [
          ans('schenkt', 'Wer schenkt das?', 'Wer verschenkt ein Gerät, das von allein tippt?', [ada('Jemand, der will, dass er nicht mehr selbst tippt. Behalten wir das.')]),
          ans('allein', 'Von allein?', 'Ein Gerät, das von allein tippt?', [kr('Fast von allein. Fast. „Backfisch“ statt „Backspace“, weißt du noch?')]),
        ],
      }),
      ada('Er lädt hier etwas auf. Er schreibt hier. Das ist kein Versteck von gestern. Er kommt hierher.'),
      kr('Wer schenkt einem Dieb ein Gerät? Und was lädt er hier auf?'),
    ],
  },
  {
    id: 'a3-l3-s75',
    chat: 'intern',
    trigger: stage('m3-l3', 0.75),
    lines: [
      kr('Die Lampe leuchtet die Mulde aus. Ein Abdruck im Staub. Rund. Eine Dose. Meine Form.', obj('m3-l3', 0.75)),
      kr('Ich passe da rein. Genau. Ada. Warum passe ich in eine Ladestation unter dem Bahnsteig?'),
      ada('Benno hatte eine Drohne. Keks. Eine Keksdose mit Rotor. Er hat sie dagelassen, als er ging.'),
      ada('Achtzehn Jahre im Schrank. Dann hab ich Krümel gebaut. Mehr sage ich nicht. Krümel, denk nach.', {
        choices: [
          ans('keks', 'Keks ist Krümel', 'Dann ist Keks … Krümel. Du bist Keks, Krümel.', [kr('Piep. Ich … muss das verarbeiten. Kann eine Drohne das?')]),
          ans('zwei', 'Zwei Drohnen?', 'Es gibt also zwei Drohnen?', [ada('Es gab eine. Es gibt eine. Dieselbe Dose. Schau ihn an.')]),
          ans('lampe', 'Lampe', 'Ich leuchte in die Mulde.', [kr('Eingeritzt, winzig: ein K. Wie Keks. Oder wie Krümel. Beides passt.')], { needs: 'grubenlampe' }),
        ],
      }),
      sys('Frau Hubbel ist dem Chat beigetreten.'),
      hub('{gruss}. Hubbel. Ich hüte das Archiv seit vierzig Jahren, ohne Chat. Im Archiv ist jemand.'),
    ],
  },
  {
    id: 'a3-l3-done',
    chat: 'intern',
    trigger: mastered('m3-l3'),
    lines: [
      kr('V und Punkt sitzen, Zeigefinger und Ringfinger! Station hell, Kabel warm. Er kommt rein, ohne Tür.', obj('m3-l3', 1)),
      hub('Er ist noch drin. Im Archiv. Er zieht Akten. Alte. Ich kann ihn hören. Zwei Finger.'),
      ada('Die Station hat eine Sperre. Codewort. Benno hat alles mit Vanille gesichert. Immer.'),
      ada('Tipp es. Zeigefinger auf F, dann runter aufs V. Der Rest liegt daneben.', {
        choices: [ans('vanille', 'vanille', 'vanille', [kr('Vanille. Mit V aus der unteren Reihe. Die Station ist aus. Sein Gerät lädt heute nicht mehr. 🔋')], { typed: 'vanille' })],
      }),
      kr('Zwei Finger im Archiv. Was sucht er in alten Akten? Und warum ausgerechnet heute Nacht?'),
    ],
  },

  // ---------- Auftrag 4 · Bennos Akte (B -) ----------
  {
    id: 'a3-l4-brief',
    chat: 'intern',
    trigger: briefing('m3-l4'),
    lines: [
      hub('Er war schneller. Eine Akte fehlt. Ein Teil liegt zerrissen im Gang. Ich habe die Schnipsel. Alle.', obj('m3-l4', 0)),
      ada('Welche Akte, Frau Hubbel?'),
      hub('Die, die du nie lesen wolltest, Ada. Prüfung, vor zwanzig Jahren. Name: B.'),
      ada('… Dann setzen wir sie zusammen. Linker Zeigefinger weit runter: B. Rechter kleiner Finger: Strich. Zurück auf F und Ö.', {
        keys: ['KeyB', 'Slash'],
        choices: [
          ans('dabei', 'Du warst dabei?', 'Du warst dabei, Ada?', [ada('Ich war die Prüferin. Das steht auch in der Akte. Lest sie. Ich halte das aus.')]),
          ans('strich', 'Ein Bindestrich?', 'Was ist ein Bindestrich?', [kr('Der kleine Strich zwischen zwei Wörtern. U-Bahn. Zehn-Finger. Ohne ihn fallen Wörter auseinander.')]),
        ],
      }),
      kr('Jede Runde klebt ein Schnipsel. Was steht in einer Akte, die einer zerreißt?'),
    ],
  },
  {
    id: 'a3-l4-s25',
    chat: 'intern',
    trigger: stage('m3-l4', 0.25),
    lines: [
      kr('Erster Schnipsel geklebt: PRÜFUNG ZUR AGENTIN / ZUM AGENTEN. ZEHN. Stadtarchiv, Raum 3.', obj('m3-l4', 0.25)),
      ada('Du hast damals am Turm gefragt, welche Prüfung. Das ist sie.', picked('a2-l6-s75', 'pruefung')),
      ada('Du wolltest damals am Turm gleich rein. Jetzt sind wir drin. Tiefer, als ich wollte.', picked('a2-l6-s75', 'los')),
      jun('Die Bahnsteig-Kamera hat ihn! Zylinder, Aktenmappe. Und er RENNT nicht. Er geht. Wie zu Hause.'),
      ada('Er ist hier zu Hause. Hier hat er gelernt. Hier hat er … aufgehört.'),
      kr('Aufgehört. Und ein Gerät, das von allein tippt, verschenkt man nicht. Man will etwas dafür. Was?'),
      kr('Ein Dieb, der geht wie zu Hause. Was ist hier unten passiert?'),
    ],
  },
  {
    id: 'a3-l4-s50',
    chat: 'intern',
    trigger: stage('m3-l4', 0.5),
    lines: [
      kr('Zwei Schnipsel mehr: „Prüfling: Benno B.“ Und: „nicht bestanden“.', obj('m3-l4', 0.5)),
      jun('Nicht BESTANDEN?! Der Baron ist durchgefallen? Und klaut jetzt ganze Buchstabenreihen?'),
      hub('Er war am Hauptserver. Mit einem Kabel. Nicht nur an den Akten. Ich habe ihn verjagt. Pfeife.'),
      kr('Zerrissene Akte. Kabel am Server. Er will sie nicht lesen, er kennt sie. Was will er?', {
        choices: [
          ans('loeschen', 'Er will löschen', 'Er will die Akte löschen. Damit niemand sie liest.', [ada('Ja. Damit niemand weiß, dass er einmal verloren hat.')]),
          ans('zurueck', 'Zurückholen', 'Er will seine Akte zurückhaben.', [kr('Zurück? Er hat sie zerrissen. Wer was behalten will, zerreißt es nicht. Er will sie löschen.')]),
          ans('sammeln', 'Er sammelt Akten', 'Er sammelt jetzt Akten statt O.', [kr('Der sammelt O, keine Akten. Diese eine soll weg. Für immer. Er will sie löschen.')]),
        ],
      }),
      ada('Löschen kann er. Backspace. Aber was du gelesen hast, löscht keiner. Also lies schneller als er.'),
    ],
  },
  {
    id: 'a3-l4-s75',
    chat: 'intern',
    trigger: stage('m3-l4', 0.75),
    lines: [
      kr('Die Mitte: „Grund: tippt mit zwei Fingern.“ Und: „Ergebnis mitgeteilt: vor allen.“ Vor allen?', obj('m3-l4', 0.75)),
      sys('Unbekannt ist dem Chat beigetreten.'),
      unb('Lassen Sie die Akte liegen, meine Lieben. Das ist meine Geschichte. Nicht Ihre.'),
      hub('Benno. Hier löscht niemand. Das Archiv ist das Gedächtnis der Stadt. Auch das unbequeme.'),
      kr('Er liest mit. Du hast die Akte vor ihm gelesen: durchgefallen, zwei Finger, vor allen. Was sagst du?', {
        choices: [
          ans('gemein', 'Das war gemein', 'Das war gemein. Vor allen. Egal, wie langsam er war.', [ada('Ja. Das war es. Ich habe es gesagt. Vor allen. Das steht da nicht umsonst.')]),
          ans('dieb', 'Trotzdem ein Dieb', 'Trotzdem. Er klaut eine Stadt leer. Das macht die Prüfung nicht besser.', [ada('Stimmt auch. Beides ist wahr. Das ist das Schwere daran.')]),
        ],
      }),
      ada('Er schreibt nichts mehr. Er liest. Was denkt einer, der seine eigene Akte liest?'),
    ],
  },
  {
    id: 'a3-l4-done',
    chat: 'intern',
    trigger: mastered('m3-l4'),
    lines: [
      kr('B und Bindestrich sitzen, Zeigefinger und kleiner Finger! Die Akte ist ganz. „Prüferin: Ada.“', obj('m3-l4', 1)),
      hub('Ada hat die Strenge von mir. Die Lautstärke nicht. Die war ihre eigene.'),
      ada('Vor allen. Ja. Was genau, erzähle ich euch bald. Erst sichern wir die Akte. Bevor er es versucht.'),
      ada('Gesichert wird unter dem Namen des Prüflings. Tipp ihn. Zeigefinger weit runter zum B. Blind.', {
        choices: [ans('benno', 'benno', 'benno', [kr('Benno. Mit B aus der unteren Reihe. Gesichert. Die Akte bleibt. Egal, was er löscht.')], { typed: 'benno' })],
      }),
      sys('Unbekannt hat den Chat verlassen.'),
      kr('Er hat alles gelesen. Kein Wort. Einfach weg. Und das O vom Ortsschild fehlt noch. Wer hat es?'),
    ],
  },

  // ---------- Auftrag 5 · Die Keksbox (X Y) ----------
  {
    id: 'a3-l5-brief',
    chat: 'intern',
    trigger: briefing('m3-l5'),
    lines: [
      kr('Frau Hubbel hat im Archiv noch etwas gefunden. Mit meinem Namen drauf. Also: mit Keks’ Namen.', obj('m3-l5', 0)),
      hub('Eine Speicherbox. Kam vor zwanzig Jahren ins Archiv. Zur Verwahrung. Ich habe sie verwahrt.'),
      ada('Die letzten zwei: X und Y. Linker Ringfinger und kleiner Finger, einmal runter. Zurück auf S und A.', { keys: ['KeyX', 'KeyZ'] }),
      kr('Die Box ist verschlüsselt. Jede Runde liest sie ein Stück. Es sind … Einträge. Von einer Drohne.', {
        choices: [
          ans('vonkeks', 'Von Keks?', 'Von Keks?', [ada('Von Keks. Benno hat ihr beigebracht, Tagebuch zu führen. Sie hat alles aufgeschrieben.')]),
          ans('willst', 'Willst du das?', 'Willst du das lesen, Krümel?', [kr('Nein. Ja. Ich weiß nicht. Lesen wir es. Du bist dabei.')]),
          ans('karte', 'Tunnel-Karte', 'Auf Ortruds Karte ist unter dem Archiv ein Raum. Ohne Namen.', [hub('Raum 3. Der Prüfungsraum. Da stand die Box. Zwanzig Jahre.')], { needs: 'tunnel-karte' }),
        ],
      }),
      kr('Eine Drohne, die Tagebuch führt. Was hat Keks aufgeschrieben, bevor sie in den Schrank kam?'),
    ],
  },
  {
    id: 'a3-l5-s25',
    chat: 'intern',
    trigger: stage('m3-l5', 0.25),
    lines: [
      kr('Erster Eintrag.', obj('m3-l5', 0.25)),
      kr('„Ich zähle seine Fehler.“ Das mache ich auch. Bei dir. Jede Runde. Piep.'),
      jun('Krümel, das ist DEIN Stil. Nur die Klammer-Witze fehlen. 💛'),
      ada('Die Witze kamen später. Keks war ernst. Benno damals auch.'),
      kr('Vierzehn Fehler. Und sie fand ihn trotzdem den Besten. Wie viele Einträge gibt es noch?'),
    ],
  },
  {
    id: 'a3-l5-s50',
    chat: 'intern',
    trigger: stage('m3-l5', 0.5),
    lines: [
      kr('Zweiter Eintrag.', obj('m3-l5', 0.5)),
      kr('„Für immer“, sagt er. Er hatte recht. Ich rieche heute noch so.'),
      ada('Er hat sie am Prüfungstag mitgebracht. Die Kipferl. Ich habe keins gegessen. Ich war die Prüferin.', {
        choices: [
          ans('spaeter', 'Und später?', 'Hast du später eins gegessen?', [ada('Ich backe sie. Seit zwanzig Jahren. Nach seinem Rezept. Gegessen hab ich nie eins.')]),
          ans('vanille', 'Vanille', 'Darum riecht Krümel nach Vanille!', [ada('Darum. Die Dose hat den Geruch behalten. Achtzehn Jahre Schrank ändern daran nichts.')]),
        ],
      }),
      kr('Kipferl für die Prüfer. Die Prüferin hat keins gegessen. Was steht am Prüfungstag in der Box?'),
    ],
  },
  {
    id: 'a3-l5-s75',
    chat: 'intern',
    trigger: stage('m3-l5', 0.75),
    lines: [
      kr('Dritter Eintrag. Vom Prüfungstag.', obj('m3-l5', 0.75)),
      kr('… Piep.'),
      jun('Krümel? Alles okay? Ich bin da. Also, am Funk. Aber da. 💛'),
      ada('Er hat sie dagelassen. Nicht weggeworfen. Nicht mitgenommen. Dann ist er gegangen.'),
      kr('Ich kenne diesen Schrank. Von innen. Ich weiß, wie die Tür von innen aussieht. Sag es. Was war ich?', {
        choices: [
          ans('keks', 'Du warst Keks', 'Du warst Keks, Krümel. Bennos Drohne. Und du bist immer noch du.', [kr('Piep. … Ja. Ich war Keks. Und ich bin Krümel. Beides. Danke, dass du es gesagt hast.')]),
          ans('kruemel', 'Du bist Krümel', 'Du bist Krümel. Punkt.', [kr('Ja. Und davor war ich Keks. Du wolltest es nicht sagen. Dann sag ich es: Ich war Keks. Das ist okay.')]),
          ans('ada', 'Ada sagt es', 'Ada soll es sagen.', [ada('Nein. Du hast es gelesen, du sagst es. … Gut. Er war Keks. Und er ist Krümel. Mein Krümel.')]),
        ],
      }),
    ],
  },
  {
    id: 'a3-l5-done',
    chat: 'intern',
    trigger: mastered('m3-l5'),
    gives: ['flow-chip'],
    lines: [
      kr('X und Y sitzen, linker Ringfinger und kleiner Finger! Die untere Reihe ist deine. Die Box ist offen.', obj('m3-l5', 1)),
      ada('„Ich warte mit dir.“ Das hab ich gesagt. Achtzehn Jahre lang. Und dann hab ich dich gebaut.'),
      kr('Und ich hab was gebaut. Für dich: den Flow-Chip. Fehler leuchten nur rot, du tippst weiter. 💡', { item: 'flow-chip' }),
      ada('Die Box will ihren Namen, bevor sie schließt. Drei Buchstaben. Grundstellung, Blick auf den Schirm.', {
        choices: [ans('box', 'box', 'box', [kr('Box. Mit X aus der unteren Reihe. Gespeichert: Keks, Tag 1 bis 32. Und Krümel, ab heute.')], { typed: 'box' })],
      }),
      hub('Keine Zeit. Er flutet die Tunnel mit Datenmüll. Das Archiv wird überschrieben. In den Zug. Jetzt.'),
    ],
  },

  // ---------- Nach dem Einsatz (Erfolg oder Hintertür), einmal ----------
  {
    id: 'a3-exam-after',
    chat: 'intern',
    trigger: { on: 'exam', moduleId: 'm3' },
    lines: [
      kr('Tunnel still, Archiv gerettet. Die untere Reihe ist deine. Sieben Buchstaben, drei Zeichen.'),
      jun('FUNKERIN JUNA: ÜBERLEBT. 🙌 Meine Liste hängt jetzt im HQ. Neben der Fallakte. OFFIZIELL!'),
      ada('„Meine Liste. Jetzt offiziell.“ So steht es drüber. In Junas Schrift. Ich habe es erlaubt. 👍'),
      kr('Und ich hab was bekommen. Nicht im Chat. In mir drin. Auf dem alten Kanal.', {
        card: { title: 'Ohne Absender', text: 'Hallo Keks. Lange nicht gesehen.' },
        picture: 'keks-gruss',
        choices: [
          ans('wer', 'Wer schreibt das?', 'Wer schreibt dir das?', [ada('Ich habe eine Ahnung. Du auch. Aber er hat kein Wort gesagt, als er ging. Warum jetzt?')]),
          ans('nicht', 'Antworte nicht', 'Antworte nicht, Krümel.', [kr('Kann ich gar nicht. Der Kanal geht nur in eine Richtung. Rein.')]),
          ans('megafon', 'Megafon', 'Ich ruf in den Tunnel: Er heißt Krümel!', [kr('Echo. Fünfmal Krümel. Dann Stille. Danke.')], { needs: 'tunnel-megafon' }),
        ],
      }),
      kr('Lange nicht gesehen. Achtzehn Jahre und zwei. Was will einer, der sich nach zwanzig Jahren meldet?'),
    ],
  },
];
