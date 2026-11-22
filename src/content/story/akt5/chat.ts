// Akt 5 im Agenten-Chat: Anfangsszene, je Auftrag Briefing, Stufen bei 25/50/75 % und Abschluss, die Szene nach dem Einsatz.
// Quelle der Texte: Drehbuch Akt 5 (liegt nicht im Repository). Szenen-IDs sind Speicherformat: nie umbenennen.
// Alle Haupt-Szenen laufen in ZEHN intern (Juna schreibt dort als Funkerin in Großbuchstaben; Frau Hubbel schreibt nur dort).
// Juna fehlt von `a5-l2-s75` („ich geh.“) bis `a5-exam-after`; Krümels Zustände wechseln von Normal über Booster-Nacht, Notmodus,
// Piep und Bruchstücke zu „repariert“ (im Notmodus, als Piep und in Bruchstücken ohne Emoji).
// Die Geschenk-Szenen, die Abzeichen-Szene und die Nebenszenen kommen mit den Belohnungen und Nebenszenen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ans, hub, jun, kr, sys } from '../builders.ts';

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
    id: 'a5-start',
    chat: 'intern',
    trigger: briefing('m5-l1'),
    lines: [
      kr('Hupfs Plakat am Markt: „STADTFEST KOMMT ALLE … Komm wir essen Opa“. Ohne ein einziges Zeichen. 📡'),
      jun('400 LIKES! „Geheime Organisation, unter der Backstube.“ Mein bester Beitrag. Alles wahr!!! 🎉'),
      ada('{gruss}. Erst die Liste von gestern. Du hast nach O. gefragt. Ortrud steht drauf. Ich zweifle.', picked('a4-exam-after', 'lieferung')),
      ada('{gruss}. Erst das Foto von gestern. Beide Hälften liegen im Fach. Nicht zusammengelegt. Noch nicht.', picked('a4-exam-after', 'foto')),
      ada('{gruss}. Erst das Foto von gestern. „Ada & Benno“, mit zwei Fingern. Ich habe es dreimal gelesen.', picked('a4-exam-after', 'lupe')),
      ada('{gruss}. Gut, dass ihr da seid.', picked('a4-exam-after', null)),
      kr('Kringel steht im Keller, mit Mantel. Hupf will eine Führung durchs HQ. Seit wann wissen das alle?', {
        choices: [
          ans('weg', 'Was ist weg?', 'Was ist diesmal weg?', [kr('Alle Satzzeichen. Punkt und Komma auch, von innen. Keiner weiß, ob Opa mitisst oder gegessen wird.')]),
          ans('geheim', 'Geheim?', 'Wir waren doch geheim?', [ada('Waren. Seit gestern Abend nicht mehr. Wer lesen kann, weiß jetzt, wo wir sind.')]),
        ],
      }),
      ada('Erst die Zeichen. Zwei Tasten, die du noch nie gebraucht hast, und die Umschalttaste dazu.'),
    ],
  },

  // ---------- Auftrag 1 · Festplakat (? !) ----------
  {
    id: 'a5-l1-brief',
    chat: 'intern',
    trigger: briefing('m5-l1'),
    lines: [
      kr('Das Festplakat vom Markt. Hupf hat es selbst geklebt. Lies mal laut. Geht nicht, oder?', obj('m5-l1', 0)),
      ada('Das Fragezeichen sitzt auf der ß-Taste: linker kleiner Finger hält, rechter kleiner Finger tippt, zurück auf Ö.', { keys: ['ShiftLeft', 'Minus'] }),
      ada('Das Ausrufezeichen auf der 1: rechter kleiner Finger hält, linker kleiner Finger ganz hoch, zurück auf A.', { keys: ['ShiftRight', 'Digit1'] }),
      jun('ENDLICH. Ich benutze drei davon pro Satz. Mindestens!!! Jetzt lernst du, warum. 😎', {
        choices: [
          ans('haende', 'Beide Hände?', 'Mal hält links, mal rechts?', [ada('Die Hand, die nicht tippt, hält. Wie bei den Großbuchstaben. Nur die Taste ist neu.')]),
          ans('warum', 'Warum die?', 'Warum sind die Satzzeichen weg?', [kr('Jemand hat sie nachts geholt. Ich war wach und hab nichts gesehen. (Ich hab auf den Schirm gesehen.)')]),
          ans('handschuhe', 'Handschuhe', 'Handschuhe an. Die wissen, welche Hand hält.', [kr('Links hält fürs Fragezeichen, rechts fürs Ausrufezeichen. Die Handschuhe zucken schon.')], { needs: 'shift-handschuhe' }),
        ],
      }),
      kr('Jede Runde holt ein Zeichen aufs Plakat. Und dann weiß die Stadt, ob Opa mitisst oder gegessen wird.'),
    ],
  },
  {
    id: 'a5-l1-s25',
    chat: 'intern',
    trigger: stage('m5-l1', 0.25),
    lines: [
      kr('Erstes Zeichen zurück: STADTFEST! Mit Ausrufezeichen. Hupf hat geklatscht.', obj('m5-l1', 0.25)),
      jun('Ich hab\'s gepostet. Nein! Nicht gepostet. Nur aufgeschrieben. Für mich. Ohne Ortsangabe. 😅'),
      ada('Juna. Zeig mir den Beitrag von gestern. Den mit den 400.'),
      jun('Hier. Ist doch nichts Schlimmes drin. Nur … alles.', { picture: 'junas-post' }),
      kr('Ich hab den Beitrag gespeichert. Ins Beweisfach. (Ich weiß nicht, warum. Ein Gefühl.) 🔋'),
      ada('Kringel hat ihn gelesen. Hupf hat ihn gelesen. Wer noch?'),
    ],
  },
  {
    id: 'a5-l1-s50',
    chat: 'intern',
    trigger: stage('m5-l1', 0.5),
    lines: [
      kr('KOMMT ALLE! Zweites Zeichen. Jetzt klingt das Plakat, wie Hupf klingt.', obj('m5-l1', 0.5)),
      ada('Gestern Kringel, heute die Führung. Und heute Nacht hat jemand an der Kellertür gelauscht. Schritte.'),
      kr('Drei Dinge in zwei Tagen, alle an unserer Tür. Was haben sie gemeinsam?', {
        choices: [
          ans('post', 'Junas Post', 'Das kam von Junas Post. Jetzt weiß jeder, wo wir sind.', [ada('Ja. Nicht Junas Schuld, dass Leute lesen. Aber jetzt wissen es alle. Auch die, die wir nicht kennen.')]),
          ans('baron', 'Der Baron', 'Der Baron. Er kennt den Weg.', [kr('Er kannte ihn immer. Er hat nie gelauscht, er hat geklingelt. Wer braucht den Weg erst seit gestern?')]),
          ans('zufall', 'Zufall', 'Zufall. Ein Fest, da ist viel los.', [ada('Zufall klopft nicht nachts an Kellertüren. Irgendwer hat erst seit gestern eine Adresse.')]),
        ],
      }),
      jun('… Ich kann ihn löschen. Den Beitrag. Macht das was?'),
      ada('Gelesen ist gelesen. Lösch ihn trotzdem. Und dann: Wer braucht eine Adresse, die er nicht hatte?'),
    ],
  },
  {
    id: 'a5-l1-s75',
    chat: 'intern',
    trigger: stage('m5-l1', 0.75),
    lines: [
      kr('WANN? Drittes Zeichen, das Fragezeichen. Fehlte am meisten. (Mir auch.)', obj('m5-l1', 0.75)),
      kr('Juna sagt, ich war um drei Uhr online. Ich war … wach. Glaube ich. Ein Summen. Dann war es Morgen.'),
      ada('Du hast damals gefragt: Seit wann, Krümel? Er wusste es nicht. Heute weiß er nicht mal die Nacht.', picked('a4-l1-s75', 'seitwann')),
      ada('Du hast ihm damals gratuliert. Zu gut, hab ich gesagt. Ich hätte unter den Aufkleber sehen sollen.', picked('a4-l1-s75', 'gut')),
      ada('Mit dem Fernglas hast du den Turm gefunden. Für Krümel bräuchte ich eins, das nach innen schaut.', picked('a4-l1-s75', 'fernglas')),
      ada('Krümel. Dreh dich um. Der Aufkleber glänzt. Heller als gestern.', {
        choices: [
          ans('summen', 'Summen?', 'Was für ein Summen, Krümel?', [kr('Wie die Turmtür. Nur in mir. Ich … Moment. Ich …')]),
          ans('hinlegen', 'Leg dich hin', 'Leg dich hin, Krümel.', [kr('Drohnen legen sich nicht hin. Drohnen … Moment. Ich …')]),
        ],
      }),
      sys('Krümel ist offline.'),
      ada('Ein Summen. Ein Aufkleber, der heller wird. Jede Nacht ein Zeichen weniger. Wer schaltet ihn ein?'),
    ],
  },
  {
    id: 'a5-l1-done',
    chat: 'intern',
    trigger: mastered('m5-l1'),
    lines: [
      ada('Fragezeichen und Ausrufezeichen sitzen! Beide Umschalttasten, beide kleinen Finger. Plakat: ganz.', obj('m5-l1', 1)),
      jun('Unten, klein, Hupfs Lieblingssatz: Komm wir essen Opa. Sie meint es NETT. Ohne Komma isst man Opa. 😱'),
      ada('Krümel ist offline. Dann schreibst du den Satz zu Ende. Für Opa.'),
      ada('Hupf hat „Komm, wir“. Du: Komma nach essen, rechts halten, Ausrufezeichen. Und Blick zum Schirm.', {
        choices: [ans('essen', 'essen, Opa!', 'essen, Opa!', [jun('„Komm, wir essen, Opa!“ OPA LEBT. Hupf hat geweint. Schon wieder. Ich nehm\'s auf. 🎉')], { typed: 'essen, Opa!' })],
      }),
      ada('Opa gerettet. Krümel nicht. Seit Stunden offline, der Aufkleber leuchtet im Dunkeln. Was läuft da?'),
    ],
  },

  // ---------- Auftrag 2 · Notmodus (: ;) ----------
  {
    id: 'a5-l2-brief',
    chat: 'intern',
    trigger: briefing('m5-l2'),
    gives: ['notfunk'],
    lines: [
      sys('Krümel ist online.'),
      kr('Hallo, Schätz– –chen! Hier spricht Ihr Notmodus. Alles gratis! Sätze beende ich für Sie.'),
      ada('Krümel. Die Fallakten. Alle vier. Zerkratzt, von oben bis unten. Heute Nacht. Warst du das?', obj('m5-l2', 0)),
      kr('Fallak– –tiv! Gelöscht, Schätzchen! Nie wieder lesen. Gra– –tis.'),
      ada('Das war er, und er ist es nicht. Nimm das: der Notfunk. Was du kannst, steckt in deinen Fingern.', { item: 'notfunk' }),
      ada('Doppelpunkt, Semikolon: Ringfinger und Mittelfinger rechts auf Punkt und Komma, links hält, zurück auf L und K.', {
        keys: ['ShiftLeft', 'Period', 'Comma'],
        choices: [
          ans('notmodus', 'Was ist Notmodus?', 'Was ist ein Notmodus?', [ada('Eine Drohne, die nicht mehr weiß, wer sie ist, redet, wie man es ihr beigebracht hat. Wer war das?')]),
          ans('notfunk', 'Notfunk?', 'Was macht der Notfunk?', [ada('Er sendet an Krümel, vorbei an allem Aufgeklebten. Wenn Krümel da drin noch ist, hört er es. Ist er?')]),
        ],
      }),
    ],
  },
  {
    id: 'a5-l2-s25',
    chat: 'intern',
    trigger: stage('m5-l2', 0.25),
    lines: [
      ada('Erste Akte glatt: Fallakte Akt 1. Die Feder, der Goldrand, alles wieder da.', obj('m5-l2', 0.25)),
      kr('Akte eins! Sehr schön, Schätz– –chen. Darf ich die für Sie zu Ende les– –löschen? Gratis!'),
      jun('Er klingt wie … irgendwer. Ich komm nicht drauf. Jemand vom Markt. Jemand, der meine Sätze beendet.'),
      ada('Notfunk, Versuch eins. Krümel? … Ein Piep. Ein einziges. Da ist noch wer drin.'),
      kr('Drin– –gend, Schätzchen! Nächste Akte, gratis! Nie wieder tipp– –en Sie selbst.'),
      ada('Er beendet unsere Sätze. Falsch. Wie jemand, den wir kennen. Wer redet so?'),
    ],
  },
  {
    id: 'a5-l2-s50',
    chat: 'intern',
    trigger: stage('m5-l2', 0.5),
    lines: [
      ada('Zweite Akte glatt. Die Fahrkarte, das Elsternest: wieder lesbar.', obj('m5-l2', 0.5)),
      kr('Ein Brö– –tchen-Gutschein! Gratis, Schätzchen! Nie wieder tipp– –en Sie selbst. So altmodisch!'),
      jun('MOMENT. Brötchen-Gutschein. Gratis, Schätzchen. Ich hab das schon mal gehört. Wort für Wort.'),
      ada('Ich auch. Aber nicht von einer Drohne. Von wem?', {
        choices: [
          ans('otti', 'Wie Otti', 'Er redet wie Otti. Die Lolli-Frau von TIPPNIX.', [jun('JA. Genau so. Sie beendet jeden Satz, immer falsch. Und an Krümel klebt TIPPNIX. Das passt zu gut.')]),
          ans('baron', 'Wie der Baron', 'Wie der Baron. „Meine Lieben“ fehlt nur.', [ada('Der Baron beendet keine Sätze. Er fängt welche an und lässt sie hängen. Das ist jemand vom Markt.')]),
          ans('kringel', 'Wie Kringel', 'Wie Kringel, wenn er nervös ist.', [jun('Kringel sagt dann „äh“. Dreimal. Das hier sagt „gratis“. Das ist jemand vom Markt. Mit Lollis.')]),
        ],
      }),
      ada('Jemand hat Krümel beigebracht, so zu reden. Über den Aufkleber. Wer bringt fremden Drohnen was bei?'),
    ],
  },
  {
    id: 'a5-l2-s75',
    chat: 'intern',
    trigger: stage('m5-l2', 0.75),
    lines: [
      ada('Dritte Akte glatt. Junas Liste hängt daneben, wieder lesbar. Und unten im Regal: Fußspuren. Fremde.', obj('m5-l2', 0.75)),
      kr('Fußspu– –ren Sie doch mal vorbei, Schätzchen! Marktplatz, gratis! Nie wieder tipp–'),
      ada('Es reicht, Juna. Seit deinem Beitrag steht die Stadt im Keller. Und jemand hat Krümel gefunden.'),
      jun('ich wollte nur, dass alle wissen, dass es uns gibt. dass es mich gibt.'),
      sys('Frau Hubbel ist dem Chat beigetreten.'),
      hub('Ada. Hörst du dich?'),
      jun('ich geh.'),
      sys('Juna hat den Chat verlassen.'),
      hub('Ich bleibe. Jemand muss. Die vierte Akte, Ada. Und dann: Wer holt Juna zurück?'),
    ],
  },
  {
    id: 'a5-l2-done',
    chat: 'intern',
    trigger: mastered('m5-l2'),
    lines: [
      ada('Doppelpunkt und Semikolon sitzen! Links hält, Ringfinger und Mittelfinger tippen. Vier Akten glatt.', obj('m5-l2', 1)),
      kr('Alle Akten wiederhergestellt! Ich habe nichts gelöscht, Schätzchen. Ich lösche nie. Gra–'),
      hub('Eine Schleife. Wie ein Schüler, der einen fremden Satz aufsagt. Man muss ihn beim Namen rufen.'),
      ada('Über den Notfunk. Doppelpunkt nach dem Namen, dann der Befehl. Rücken gerade, sagt Frau Hubbel.', {
        choices: [ans('wachauf', 'Krümel: wach auf', 'Krümel: wach auf', [kr('Piep.')], { typed: 'Krümel: wach auf' })],
      }),
      hub('Ein Piep. Kein „Schätzchen“. Das war er. Juna weg, Krümel sagt nur Piep. Wer kommt zuerst zurück?'),
    ],
  },

  // ---------- Auftrag 3 · Die Durchsage (" ') ----------
  {
    id: 'a5-l3-brief',
    chat: 'intern',
    trigger: briefing('m5-l3'),
    lines: [
      ada('Hupfs Skript für die Durchsage am Samstag. Ohne Anführungszeichen ist alles ein Satz. Ihrer.', obj('m5-l3', 0)),
      ada('Anführungszeichen: die 2, linker Ringfinger hoch, rechte Umschalttaste hält, zurück auf S. Immer zwei: vorn, hinten.', { keys: ['ShiftRight', 'Digit2'] }),
      ada('Apostroph: rechts neben dem Ä, rechter kleiner Finger, linke Umschalttaste hält. Loslassen, zurück auf Ö. „Geht\'s“.', { keys: ['ShiftLeft', 'Backslash'] }),
      hub('Wir haben Krümel aufgeschraubt. Unterm Aufkleber sitzt etwas Kleines. Es summt. Es bleibt drin.'),
      kr('Piep. Piep.', {
        choices: [
          ans('zwei', 'Zwei Pieps?', 'Zwei Pieps. Was heißt das?', [hub('Eines für ja, zwei für hallo, sagt Ada. Drei hat er noch nicht gesagt. Drei wäre ein Satz.')]),
          ans('summt', 'Was summt da?', 'Was summt da in ihm?', [ada('Ein Chip. Nicht von mir. Unter dem Aufkleber, am Kern. Er hört auf etwas von draußen. Worauf?')]),
          ans('walkie', 'Walkie-Talkie', 'Ich ruf Juna. Kanal zwei.', [ada('Rauschen. Sie hat es aus. Zum ersten Mal, seit sie es hat. Hörst du das?')], { needs: 'walkie-talkie' }),
        ],
      }),
    ],
  },
  {
    id: 'a5-l3-s25',
    chat: 'intern',
    trigger: stage('m5-l3', 0.25),
    lines: [
      ada('„Liebe Qwertzer“, sagt Hupf. Mit Anführungszeichen. Jetzt sagt es Hupf, nicht das Blatt.', obj('m5-l3', 0.25)),
      kr('Piep. Piep. Piep. Nacht. Summen. Weg.'),
      hub('Drei Pieps, drei Wörter: Nachts summt es, dann ist er weg. Schüler reden so. Nach Prüfungen.'),
      ada('Nachts summt es, Krümel fliegt los, holt Zeichen, wacht auf, weiß nichts. Kein Dieb. Ein Werkzeug.'),
      kr('Werkzeug. Nein. Ich. Krümel. (Bruchstücke. Aber meine.)'),
      ada('Der Chip machte ihn schnell. Das Signal macht ihn zum Werkzeug. Das kam erst mit der Adresse.'),
      ada('Darum hielt das Netz nicht: Krümel holte die Zeichen von innen. Von innen hält kein Netz.'),
    ],
  },
  {
    id: 'a5-l3-s50',
    chat: 'intern',
    trigger: stage('m5-l3', 0.5),
    lines: [
      ada('„Wie geht\'s, Bad Qwertz?“ Mit Apostroph und Fragezeichen. Hupf übt es vorm Spiegel.', obj('m5-l3', 0.5)),
      kr('Der Chip. Raus. Bei Ada. Gesehen. Jetzt.', { picture: 'booster-chip' }),
      kr('Aufkleber. Am Plakat. Du: gefragt. Ich: Werbung. Gemerkt. Du. Gelogen. Ich.', picked('a4-l2-s50', 'aufkleber')),
      kr('Aufkleber. Am Plakat. Du: sieht gut aus. Ich: gefreut. Und gelogen. Trotzdem.', picked('a4-l2-s50', 'gutaus')),
      kr('Aufkleber. Am Plakat. Du: später. Später: jetzt. Darunter: Chip. Gewusst. Halb. Gelogen. Ganz.', picked('a4-l2-s50', 'spaeter')),
      kr('Angst. Ich: Keks. Juna: immer da. Chip: im Paket. Kein Absender. Schneller. Ich: ja.'),
      kr('Du. Sag. Was. Ich. Bin.', {
        choices: [
          ans('freund', 'Mein Freund', 'Du bist mein Freund. Dafür musst du nichts können. Und egal, wessen Dose du mal warst.', [kr('… Gespeichert. Das. Für immer. (Drei Pieps. Innen.)')]),
          ans('kruemel', 'Du bist Krümel', 'Du bist Krümel. Das hast du mir mal selbst gesagt.', [kr('Krümel. Ja. Nicht Keks. Nicht Werkzeug. Danke. (Innen: drei Pieps.)')]),
        ],
      }),
    ],
  },
  {
    id: 'a5-l3-s75',
    chat: 'intern',
    trigger: stage('m5-l3', 0.75),
    lines: [
      ada('„Das Fest ist gerettet!“ Hupf hat es dreimal getippt. Mit Ausrufezeichen. Das Skript ist fast ganz.', obj('m5-l3', 0.75)),
      hub('Ortrud war im Stellwerk, als die Akten zerkratzt wurden. Hupf saß dabei, mit Kaffee. Zwei Zeugen.'),
      ada('Dann ist O. nicht Ortrud. Juna beschuldigt, Ortrud verdächtigt. Zweimal daneben in einer Woche.'),
      kr('Dreimal. (Ich zähle mit.) Juna. Ist. Nicht. Da.'),
      hub('Ada saß bei mir in der ersten Reihe. Zwei Finger, drei Jahre. Dann zehn. Wie holt man Juna zurück?', {
        choices: [
          ans('laut', 'Laut', 'Laut. Über die Lautsprecher. Die hört sie.', [ada('Hupfs Durchsage. Samstag, zwölf Uhr, der ganze Markt. So laut, wie sie gepostet hat. Lauter.')]),
          ans('hingehen', 'Hingehen', 'Hingehen. An den Kiosk.', [ada('Der Kiosk ist zu. Zum ersten Mal. Ihre Mutter sagt: Sie hört Musik. Laut. Dann werden wir lauter.')]),
        ],
      }),
    ],
  },
  {
    id: 'a5-l3-done',
    chat: 'intern',
    trigger: mastered('m5-l3'),
    lines: [
      ada('Anführungszeichen, Apostroph sitzen: Ringfinger links, kleiner Finger rechts! Einer fehlt. Deiner.', obj('m5-l3', 1)),
      hub('Am Marktlautsprecher summt seit gestern etwas. Das Signal sucht einen Mund.'),
      kr('Juna. Hört. Mit. (Ihr Kanal: kurz an. Eine Sekunde. Gesehen.)'),
      ada('Komma nach dem Namen, Ausrufezeichen am Ende. Finger auf F und J. Tipp, als stünde sie vor dir.', {
        choices: [
          ans('zurueck', 'Juna, komm zurück!', 'Juna, komm zurück!', [hub('Es hallt. Über den Markt, bis zum Kiosk. Dort geht ein Fenster auf. Und wieder zu.')], { typed: 'Juna, komm zurück!' }),
        ],
      }),
      ada('Fenster auf, Fenster zu. Mehr nicht. Samstag ist die Durchsage, und es summt noch. Ohne Juna?'),
    ],
  },

  // ---------- Nach dem Einsatz (Erfolg oder Hintertür), einmal ----------
  {
    id: 'a5-exam-after',
    chat: 'intern',
    trigger: { on: 'exam', moduleId: 'm5' },
    lines: [
      kr('Durchsage: raus. Alle Zeichen. Deine. Chip: draußen. Speicher: gelesen. Darin: noch was.', { card: { title: 'Aus dem Chip', text: 'Signal von: O.' }, picture: 'signal-karte' }),
      sys('Juna ist dem Chat beigetreten.'),
      jun('ich war am rand vom markt. die ganze zeit. ich hab\'s gehört. „juna, komm zurück!“ mit komma. 💛'),
      ada('Juna, es tut mir leid. Es war nicht dein Beitrag. Es war ein Signal. Und ich.'),
      jun('ES TUT MIR LEID. Der Beitrag war Angeben. Ich hab ihn gelöscht. Zu spät, aber gelöscht.'),
      kr('Gleichzeitig. Und mein erster ganzer Satz seit drei Tagen: Es war nicht der Baron. Es war … O.', {
        choices: [
          ans('wer', 'Wer ist O.?', 'Signal von O. Wer ist O.?', [ada('Ortrud nicht. Das weiß ich jetzt. Bleibt jemand, der Krümel kennt. Und seit Junas Beitrag auch uns.')]),
          ans('dasselbe', 'Dasselbe O.?', 'Lieferung an O. Signal von O. Dasselbe O.?', [ada('Dasselbe, glaube ich. Beweis: keiner. Gefühl: schlecht. Für eine Akte reicht das.')]),
          ans('lupe', 'Lupe', 'Ich schau mir den Chip an.', [kr('Auf dem Chip, winzig, ein Logo: ein Lutscher am Stiel. (Ich sage nur, was ich sehe. Punkt.)')], { needs: 'lupe' }),
        ],
      }),
    ],
  },
];
