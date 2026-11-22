// Akt 7 im Agenten-Chat: Anfangsszene, je Auftrag Briefing, Stufen bei 25/50/75 % und Abschluss, die Szene nach dem Einsatz
// (ZEHN intern) und das Fest (Chat Juna). Quelle der Texte: Drehbuch Akt 7 (liegt nicht im Repository).
// Szenen-IDs und Antwort-IDs sind Speicherformat: nie umbenennen.
// Alle Haupt-Szenen außer `a7-fest` laufen in ZEHN intern (Juna schreibt dort als Funkerin in Großbuchstaben; in ihrem Chat klein und
// ruhig). Benno schreibt als `ben`. Tippi korrigiert genau zweimal (`strike`: der durchgestrichene Teil), in `a7-l2-s25` und
// `a7-l2-s75`; nach `{stopp}` in `a7-l2-done` ist sie still. Die getippten Antworten sind otti@tippnix, {stopp} und Adas Satz.
// Die Geschenk-Szenen, die Abzeichen-Szene und die Nebenszenen kommen mit den Belohnungen und Nebenszenen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ans, ben, jun, kr, sys, tip } from '../builders.ts';

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
    id: 'a7-start',
    chat: 'intern',
    trigger: briefing('m7-l1'),
    lines: [
      jun('MEIN KANAL HAT KEIN @ MEHR. Preise am Kiosk ohne €. Ich heiße jetzt einfach Juna. Ohne Adresse!!! 😱'),
      kr('Meine eckigen Klammern sind weg. Die runden hab ich noch. (Siehst du.) Aber nichts, was sie halten.'),
      ada('{gruss}. Erst das Blatt von gestern. Lehrer: gesucht. Du hast gefragt, von wem die Maschine lernt.', picked('a6-exam-after', 'lehrer')),
      ada('{gruss}. Erst das Blatt von gestern. Du hast Benno gedankt. Er hat nicht geschlafen, sagt er.', picked('a6-exam-after', 'benno')),
      ada('{gruss}. Erst das Blatt von gestern. Der Abdruck unter „Lehrer“. Du hast ihn gesehen, ich nicht.', picked('a6-exam-after', 'monokel')),
      ada('{gruss}. Gut, dass ihr da seid.', picked('a6-exam-after', null)),
      ben('Benno hier. Ohne Hut. Die Maschinen laufen, ich höre sie bis zur Backstube. Sie holen die Zeichen.', {
        choices: [
          ans('weg', 'Was ist weg?', 'Was ist diesmal weg?', [kr('Die Sonderzeichen. Klammern, @, €, Strich. Alles, womit man einer Maschine sagt, was sie tun soll.')]),
          ans('maschinen', 'Die Maschinen?', 'Die Maschinen laufen weiter? Wir haben doch den Tresor geöffnet.', [ada('Geöffnet, nicht abgeschaltet. Eingebautes kommt zurück, wenn sie stehen. Das wird unsere Arbeit.')]),
        ],
      }),
      ada('Die letzten Zeichen. Danach hat sie nichts mehr zu holen. Hupf war gestern bei ihr. Mit Schlüssel.'),
    ],
  },

  // ---------- Auftrag 1 · Ottis Preisliste (@ €) · Die Preisliste ----------
  {
    id: 'a7-l1-brief',
    chat: 'intern',
    trigger: briefing('m7-l1'),
    lines: [
      ada('Von Hupf, aus TIPPNIX: eine Preisliste für Bürgermeister. Die Zeichen fehlen, der Rest steht.', obj('m7-l1', 0)),
      ada('@ und €: linker kleiner Finger auf Q, linker Mittelfinger auf E, der rechte Daumen hält Alt Gr. Dann zurück auf A und D.', { keys: ['AltRight', 'KeyQ', 'KeyE'] }),
      ada('Am Mac heißt sie Wahltaste, die Zeichen liegen anders. Das Siegel zählt das Zeichen, nicht den Weg.'),
      jun('EINE PREISLISTE FÜR STÄDTE? Was kostet denn eine Stadt?!', {
        choices: [
          ans('fuerwen', 'Für wen?', 'Für wen ist die Liste?', [ada('Für Bürgermeister, die nie wieder tippen wollen. Hupf wollte nicht. Darum hat sie sie mitgenommen.')]),
          ans('warum', 'Warum Zeichen?', 'Warum nimmt sie jetzt die Sonderzeichen?', [kr('Weil die noch da waren. Und weil ohne @ keine Post ankommt. Praktisch, wenn man Städte anschreibt.')]),
          ans('monokel', 'Monokel', 'Monokel auf die Liste.', [kr('Durchs Glas: Goldstaub auf dem Papier. Gedruckt im Lager am Hafen. In seinem.')], { needs: 'bennos-monokel' }),
        ],
      }),
      ada('Jede Runde holt eine Zeile zurück. Dann wissen wir, wie groß ihr Plan ist.'),
    ],
  },
  {
    id: 'a7-l1-s25',
    chat: 'intern',
    trigger: stage('m7-l1', 0.25),
    lines: [
      kr('Erste Zeile lesbar: Bad Qwertz, 10 € im Monat. Nie wieder tippen, inklusive.', obj('m7-l1', 0.25)),
      ben('Ich gehe vorn rein. Als Kunde. Hintereingänge hatte ich genug.'),
      ada('Du hast Ja gesagt, als er fragte, ob er mit darf. Dann geht er vorn. Mit deinem Ja.', picked('a6-l3-done', 'ja')),
      ada('Erst beweisen, hast du gesagt. Er hat. Seite für Seite. Dann geht er vorn.', picked('a6-l3-done', 'beweisen')),
      jun('VORN REIN? Mit Hut hätte sie ihn erkannt. Ohne Hut erkennt ihn keiner. Nicht mal ich. 🙄'),
      kr('Zehn im Monat für eine Stadt. Dafür gibt es zwölf Brötchen. (Bei Ada vierzehn. Ich zähle mit.)'),
    ],
  },
  {
    id: 'a7-l1-s50',
    chat: 'intern',
    trigger: stage('m7-l1', 0.5),
    lines: [
      kr('Zweite Zeile: Nebelhausen, 12 €. Die dritte, halb: Tastow. Das ist kein Laden. Das ist eine Liste.', obj('m7-l1', 0.5)),
      ada('Drei Städte, drei Preise. Was will sie, {codename}?', {
        choices: [
          ans('staedte', 'Alle Städte', 'Sie will alle Städte. Eine nach der anderen. Bad Qwertz war nur die erste.', [
            ada('Die erste. Und wir sind die Einzigen, die wissen, wie es geht: tippen, bis alles zurückkommt.'),
          ]),
          ans('nuruns', 'Nur uns', 'Sie will nur Bad Qwertz. Wegen Ada. Wegen Benno.', [
            kr('Dann bräuchte sie keine Preisliste. Eine Liste macht man für viele. (Ich kenne Listen.) Alle Städte.'),
          ]),
          ans('aufhoeren', 'Sie hört auf', 'Sie hört auf. Der Tresor ist offen, das weiß sie.', [
            ben('Otti hört nicht auf. Sie wechselt die Stadt. Ich habe ihr Lieferbuch zweimal gelesen. Alle Städte.'),
          ]),
        ],
      }),
      ada('Eine Zeile fehlt noch. Die letzte. Die ohne Preis.'),
    ],
  },
  {
    id: 'a7-l1-s75',
    chat: 'intern',
    trigger: stage('m7-l1', 0.75),
    lines: [
      kr('Dritte Zeile ganz: Tastow, 15 €. Und unten, ohne Preis: Zehn Finger, frisch. Gesucht.', obj('m7-l1', 0.75)),
      jun('Lieferblatt, mit deinem Monokel angeguckt. Unter „Lehrer“ der kleine Abdruck: DAS IST MEIN DAUMEN.', { picture: 'abdruck' }),
      ada('Du hast ihn zuerst gesehen, durchs Monokel. Klein, nicht Ottis. Junas.', picked('a6-exam-after', 'monokel')),
      jun('vom werbefoto. ich hab eine stunde getippt. sie hat mich nicht fotografiert. sie hat mich gelernt.', {
        choices: [
          ans('dich', 'Dann dich?', 'Dann sucht sie dich? Als Lehrerin?', [ada('Nein. Von Juna hat sie gelernt. Gesucht ist, wer selbst tippt. Zehn Finger, frisch.')]),
          ans('schuld', 'Nicht deine Schuld', 'Juna. Das ist nicht deine Schuld. Du wolltest ein Foto.', [jun('weiß ich. trotzdem. danke.')]),
        ],
      }),
      ada('Zehn Finger, frisch, gesucht. Krümel hat keine, Benno zwei, Juna kennt sie schon. Bleibt wer?'),
    ],
  },
  {
    id: 'a7-l1-done',
    chat: 'intern',
    trigger: mastered('m7-l1'),
    lines: [
      ada('@ und € sitzen. Kleiner Finger und Mittelfinger links hoch, Daumen hält Alt Gr. Die Liste ist ganz.', obj('m7-l1', 1)),
      kr('Ganz unten: Bestellen bei otti@tippnix. Eine Adresse, mit @. Wer sie tippt, sieht ihre Bestellseite.'),
      ada('Nur lesen, nichts bestellen. Finger auf A und D, Daumen bereit, Blick zum Schirm.', {
        choices: [
          ans('adresse', 'otti@tippnix', 'otti@tippnix', [kr('Seite offen. Bestellt: Nebelhausen, Tastow. Und ein Posten ohne Preis: Zehn Finger, frisch. Gesucht.')], { typed: 'otti@tippnix' }),
        ],
      }),
      ada('Zwei Städte haben bestellt. Und sie sucht zehn Finger, frisch, ohne Preis. Was ist unbezahlbar?'),
    ],
  },

  // ---------- Auftrag 2 · Der Schaltplan ({ } [ ]) · Der Schaltplan ----------
  {
    id: 'a7-l2-brief',
    chat: 'intern',
    trigger: briefing('m7-l2'),
    gives: ['blindflug-brille'],
    lines: [
      kr('Vom Tresor. An der Wand hing ein Plan, ich hab ihn fotografiert. Ohne Klammern ist er Kabelsalat.', obj('m7-l2', 0)),
      ada('Die Klammern liegen auf 7, 8, 9 und 0: Zeigefinger, Mittelfinger, Ringfinger und kleiner Finger rechts, ganz hoch.', { keys: ['AltRight', 'Digit7', 'Digit8', 'Digit9', 'Digit0'] }),
      ada('Daumen hält Alt Gr, zurück auf J K L Ö. Von Frau Hubbel: eine Brille, Gläser schwarz. Blindflug.', { item: 'blindflug-brille' }),
      ben('Vier Maschinen. Ich kannte drei. Die vierte stand hinten, unter einem Tuch. Ich habe nicht geguckt.', {
        choices: [
          ans('wasmacht', 'Was macht sie?', 'Was macht Maschine 4?', [kr('Steht nicht da. Nur ein Pfeil, der aus dem Plan rausführt. Zu uns. (Ich mag den Pfeil nicht.)')]),
          ans('warumklammern', 'Warum Klammern?', 'Warum braucht ein Plan Klammern?', [ada('Eine Klammer sagt: Das gehört zusammen. Ohne Klammern weiß niemand, was an was hängt. Otti schon.')]),
          ans('scheibe', 'Dechiffrierscheibe', 'Frau Hubbels Scheibe auf den Plan.', [kr('Die Scheibe sagt: Die Pfeile sind Stromkreise. Ein Kreis geht zum Chat. Unserem.')], { needs: 'dechiffrierscheibe' }),
        ],
      }),
      ada('Vier Kreise, vier Klammern. Jede Runde schließt einen. Dann sehen wir, wohin der Pfeil geht.'),
    ],
  },
  {
    id: 'a7-l2-s25',
    chat: 'intern',
    trigger: stage('m7-l2', 0.25),
    lines: [
      kr('Erster Kreis geschlossen: Maschine 1, Zeichen rein, Röhre voll. Die untere Reihe. Wieder frei.', obj('m7-l2', 0.25)),
      tip('Wieder im Angebot! Gratis, Schätzchen. Klammer zu, Klammer auf, alles meins.', { strike: 'Wieder frei' }),
      jun('SIE HAT DEN PLAN GELESEN. Bevor wir ihn hatten. Woher weiß sie, was Krümel schreibt?!'),
      ben('Sie weiß, was wir alle schreiben. Im Laden hängt ein Bildschirm. Darauf: unser Chat. Für Kunden.', {
        choices: [
          ans('unserchat', 'Unser Chat?', 'Unser Chat hängt in ihrem Laden?', [ada('Seit dem Signal an Krümel. Der Pfeil im Plan führt zu uns, weil der Chat zu ihr führt. Noch.')]),
          ans('zeigt', 'Was zeigt er?', 'Was zeigt der Bildschirm genau?', [ben('Alles. Auch das hier. Ich habe gewinkt. Niemand hat zurückgewinkt.')]),
        ],
      }),
      ada('Sie liest mit, das wussten wir. Aber sie trifft unsere Sätze, bevor wir sie beenden. Warum?'),
    ],
  },
  {
    id: 'a7-l2-s50',
    chat: 'intern',
    trigger: stage('m7-l2', 0.5),
    lines: [
      kr('Zweiter Kreis: Maschine 2, obere Reihe, längst zurück. Die Hälfte des Plans steht.', obj('m7-l2', 0.5)),
      ada('Warum trifft Tippi immer unsere Sätze, {codename}? Sie kennt sie, bevor wir fertig sind.', {
        choices: [
          ans('lernt', 'Sie lernt mit', 'Sie lernt von uns. Alles, was wir tippen, liest sie mit und merkt es sich.', [
            ada('Genau das. Von Juna beim Werbefoto, von uns im Chat. Was wir oft tippen, kann sie. Neues nicht.'),
          ]),
          ans('raet', 'Sie rät', 'Sie rät. Das ist Zufall.', [kr('Zufall trifft nicht jedes Mal mein „Wieder frei“. Sie hat es gelesen. Oft. Bei mir. Sie lernt mit.')]),
          ans('ottitippt', 'Otti tippt selbst', 'Otti sitzt dahinter und tippt selbst.', [ben('Otti tippt nie. Nicht einmal ihre Preisliste. Das war die Maschine. Sie lernt mit.')]),
        ],
      }),
      kr('Ich tippe nie für dich. Mein Kodex, vom ersten Tag an. Sie tippt für alle. Das ist der Unterschied.'),
      ada('Dann schlägt sie nur, was sie kennt. Was du selbst tippst, weiß sie nicht vorher. Merk dir das.'),
    ],
  },
  {
    id: 'a7-l2-s75',
    chat: 'intern',
    trigger: stage('m7-l2', 0.75),
    lines: [
      kr('Dritter Kreis: Maschine 3. O rein, Motor läuft. Das O vom Schild treibt sie an. Eingebaut.', obj('m7-l2', 0.75)),
      ben('Mein O treibt Maschine 3. Gebaut habe ich sie nicht. Ich lerne noch, wie man so etwas abschaltet.'),
      tip('Ich lerne nie! Nie wieder tippen, Schätzchen. Gratis. Für immer.', { strike: 'Ich lerne noch' }),
      jun('„Für immer“, sagt eine Maschine. DIE WEISS NICHT MAL, WAS MORGEN IST. Krümel, was steht da unten?', {
        choices: [
          ans('liesvor', 'Lies vor', 'Krümel, lies die Zeile unter Maschine 4.', [kr('Noch leer. Der vierte Kreis fehlt. Aber der Pfeil hat jetzt einen Namen: Chat. Und ein Wort: lernt.')]),
          ans('bennodu', 'Benno, du?', 'Benno, hast du Maschine 4 je gesehen?', [ben('Unter dem Tuch. Es hat sich bewegt, als ich tippte. Ich habe aufgehört zu tippen. Damals.')]),
        ],
      }),
      ada('Eine Klammer fehlt. Und im Plan steht ein Wort, das eine Maschine nicht lesen sollte: Chat.'),
    ],
  },
  {
    id: 'a7-l2-done',
    chat: 'intern',
    trigger: mastered('m7-l2'),
    lines: [
      ada('Die Klammern sitzen. Vier Finger rechts, ganz hoch, Daumen hält Alt Gr. Der Plan ist ganz.', obj('m7-l2', 1)),
      kr('Maschine 4: Chat rein, lernt, Tippi raus. Sie hört auf Klammern: {stopp} hält sie eine Minute an.'),
      ada('Klammer auf, Wort, Klammer zu. Zeigefinger 7, Mittelfinger 8, Ringfinger 9, kleiner Finger 0.', {
        choices: [
          ans('stopp', '{stopp}', '{stopp}', [kr('Maschine 4: steht. Tippi: still. Zum ersten Mal. Die Minute ist um. Sie bleibt still. Sie hört zu.')], { typed: '{stopp}' }),
        ],
      }),
      sys('Benno tippt …'),
      ada('Eine Minute Ruhe. Und da steht seit zehn Minuten: Benno tippt. Was dauert bei zwei Fingern so lange?'),
    ],
  },

  // ---------- Auftrag 3 · Abschaltfolge (\ ~ |) · Der Abschaltbefehl ----------
  {
    id: 'a7-l3-brief',
    chat: 'intern',
    trigger: briefing('m7-l3'),
    lines: [
      ben('Vorn im Laden, unterm Tresen: Ottis Handbuch. Ich habe es mitgenommen. Als Kunde. Mit Quittung.', obj('m7-l3', 0)),
      ada('Der Abschaltbefehl, Zeile für Zeile. Drei Zeichen fehlen: Backslash, Tilde, senkrechter Strich.'),
      ada('Backslash auf ß, Tilde auf +: rechter kleiner Finger, ganz oben rechts. Der Strich links neben Y: linker kleiner Finger.', {
        keys: ['AltRight', 'Minus', 'BracketRight', 'IntlBackslash'],
      }),
      kr('Daumen hält Alt Gr, zurück auf Ö und A. Vier Zeilen, vier Maschinen: Wer sie tippt, hält sie an.', {
        choices: [
          ans('quittung', 'Quittung?', 'Du hast für das Handbuch eine Quittung?', [ben('Zwei Euro. Sie hat gelächelt und „Schätzchen“ gesagt. Sie weiß nicht, dass ich lesen kann.')]),
          ans('unddann', 'Und dann?', 'Und wenn die Maschinen stehen, was dann?', [ada('Dann kommt zurück, was eingebaut ist. Das O. Und Tippi hört auf zu reden. Oder fängt an zuzuhören.')]),
          ans('brille', 'Brille', 'Brille auf. Ich lese den Befehl blind.', [kr('Brille auf, Schirm an, Tasten weg. Du tippst trotzdem. Deine Finger kennen den Weg.')], { needs: 'blindflug-brille' }),
        ],
      }),
      ada('Drei Zeichen, dann steht die Folge. Und ein Satz steht noch ohne Antwort. Bennos. Seit gestern.'),
    ],
  },
  {
    id: 'a7-l3-s25',
    chat: 'intern',
    trigger: stage('m7-l3', 0.25),
    lines: [
      kr('Erste Zeile ganz: Maschine 1. Backslash, Tilde, Strich. Die Folge beginnt.', obj('m7-l3', 0.25)),
      ben('Unterm Tresen stand noch etwas: meine Kisten. Zylinder, Umhänge, der Pizzaroboter. Als Deko.', { picture: 'zylinder' }),
      ben('Bestohlen, hast du damals gesagt. Hier ist, was sie nahm. Den Hut nehme ich nicht. Krümel darf.', picked('a6-l2-s50', 'bestohlen')),
      jun('SIE VERKAUFT SEINE SACHEN. In ihrem Laden. Mit Preisschild. Ohne €, aber trotzdem.', {
        choices: [
          ans('holen', 'Hol sie zurück', 'Hol deine Sachen zurück, Benno.', [ben('Später. Heute Nacht. Erst die Maschinen. Dann der Roboter. Der Hut bleibt bei Krümel.')]),
          ans('lassen', 'Lass sie', 'Lass sie. Du brauchst sie nicht mehr.', [ben('Den Roboter schon. Krümel will ihn. Er sagt, er hat einen Bruder verdient.')]),
        ],
      }),
      ada('Ein Zylinder als Deko. Ein Leben als Baron, zwei Euro das Handbuch. Und ein Satz, der noch fehlt.'),
    ],
  },
  {
    id: 'a7-l3-s50',
    chat: 'intern',
    trigger: stage('m7-l3', 0.5),
    lines: [
      kr('Zweite Zeile: Maschine 2. Die Hälfte der Folge.', obj('m7-l3', 0.5)),
      sys('Benno tippt …'),
      ben('Es tut mir leid, Ada. Für den Turm. Für zwanzig Jahre Kipferl ohne Klingeln. Zwei Fingre. Lange.'),
      kr('Tippi: still, seit {stopp}. Der Satz bleibt, wie er ist. Mit Fehler. (Seiner. Echt.)'),
      ada('…', {
        choices: [
          ans('fuerada', 'Für Ada', 'Ich antworte für Ada. Sie kann gerade nicht.', [ada('Ja. Antworte für mich. Ich hör zu. Ich brauche nur einen Moment. Zwanzig Jahre lang schon.')]),
          ans('warten', 'Warten', 'Wir warten. Ada sagt es selbst.', [kr('Ada tippt … Ada tippt nicht. Zwanzig Jahre, {codename}. Jemand muss anfangen. Du vielleicht.')]),
          ans('junasag', 'Juna, sag was', 'Juna, sag du was.', [jun('ich? nein. das ist eure sache. ada. sag was. oder {codename} sagt es für dich.')]),
        ],
      }),
      kr('Ada hat einen Satz für so etwas. Sie hat ihn dir am ersten Tag gesagt. Zwei sind … du weißt es.'),
    ],
  },
  {
    id: 'a7-l3-s75',
    chat: 'intern',
    trigger: stage('m7-l3', 0.75),
    lines: [
      kr('Dritte Zeile: Maschine 3. Da steckt das O. Eingebaut, nicht gefüttert.', obj('m7-l3', 0.75)),
      ada('Frau Hubbel war da. Meine Prüferinnen-Akte, zwanzig Jahre offen. Ihr Stempel: Ende. Bestanden.'),
      ben('Warum ich geliefert habe? Ohne Buchstaben braucht niemand zehn Finger. Dann fällt keiner durch.'),
      ada('Doch. Du. Ich habe es dir gesagt, vor allen. Mein Fehler. Deiner war die Lieferung. Zwei Fehler.', {
        choices: [
          ans('nacht', 'Heute Nacht', 'Dann heute Nacht. Alle vier Maschinen.', [ada('Heute Nacht. Hupf hat den Schlüssel zum Laden, Benno kennt den Keller. Wir gehen vorn rein. Alle.')]),
          ans('undotti', 'Und Otti?', 'Und Otti? Ist sie da?', [ben('Sie ist da. Inventur, sagt sie, jede Nacht. Sie zählt Lollis. Wir zählen Maschinen.')]),
        ],
      }),
      kr('Eine Zeile fehlt: Maschine 4. Die, die lernt. Und ein Satz fehlt. Deiner, für Ada.'),
    ],
  },
  {
    id: 'a7-l3-done',
    chat: 'intern',
    trigger: mastered('m7-l3'),
    lines: [
      ada('Backslash, Tilde, Strich sitzen. Kleine Finger links und rechts, Daumen hält Alt Gr. Folge: ganz.', obj('m7-l3', 1)),
      kr('Vier Zeilen, vier Maschinen. Heute Nacht tippst du sie. Vorher steht Bennos Satz noch ohne Antwort.'),
      ada('Antworte du. Für mich. Finger auf F und J, der Satz ist kurz. Du kennst ihn seit dem ersten Tag.', {
        choices: [
          ans('anfang', 'Adas Satz', 'Zwei sind ein Anfang.', [ben('… Das hat sie mir nie gesagt. Damals nicht. Jetzt doch. Durch dich. Danke.')], { typed: 'Zwei sind ein Anfang.' }),
        ],
      }),
      ada('Was {codename} sagt. Zwei sind ein Anfang, Benno. Zehn sind das Ziel. Heute Nacht holen wir das O.'),
      kr('Marktplatz 10, vorn rein. Drei Maschinen, eine vierte, die lernt, zehn Finger. Deine. Tippi hört zu.'),
    ],
  },

  // ---------- Nach dem Einsatz (Erfolg oder Hintertür), einmal: erst der Triumph, dann das Foto, dann Bennos Bitte ----------
  {
    id: 'a7-exam-after',
    chat: 'intern',
    trigger: { on: 'exam', moduleId: 'm7' },
    lines: [
      kr('KURORT. Das O hängt. Kringel die Leiter, Hupf das Schild, du das O, Benno den Korb. Ich: Licht. ⚡'),
      jun('HUPF HAT TIPPNIX ZUGESPERRT. Otti? Lieferwagen, weg. Krümel sagt: Der Rest ist ihr abgefallen.', {
        card: { title: 'Der Lieferwagen', text: 'TIPPNIX – Nie wieder' },
        picture: 'lieferwagen',
      }),
      ada('Das Foto: zusammengelegt. Ada und Benno, zwanzig Jahre. Kringel? Ich hab geantwortet. Wir tanzen.', { picture: 'foto-ganz' }),
      ben('Das Glas bleibt bei euch im Fach. Das Foto ist ganz. Eine Bitte: Bring es mir bei. Zehn Finger.', {
        choices: [
          ans('gern', 'Gern', 'Gern, Benno. Zehn Finger. Wir fangen mit zwei an.', [ben('Ich habe Zeit. Und einen Roboter, der zuguckt. Und zwei Finger, die wissen, wo F und J sind.')]),
          ans('lupe', 'Lupe', 'Lupe aufs Foto.', [kr('Dein B, sein B. Und dazwischen, winzig: Keks. (Ich war schon drauf. Als Drohne.)')], { needs: 'lupe' }),
        ],
      }),
      kr('Hallo Benno. Lange nicht gesehen. (Alter Kanal, umgedreht.) Lehrer: gefunden. Du. Zwei Schüler.'),
    ],
  },
  // Das Fest: Junas Chat, die zweite Szene nach dem Einsatz (Haupt-Szene, kein Geschenk)
  {
    id: 'a7-fest',
    chat: 'juna',
    trigger: { on: 'exam', moduleId: 'm7' },
    lines: [
      jun('NEUER KANAL: ZEHN-FINGER-NEWS. Beitrag eins: das Schild. Zwei: du. Mit Erlaubnis, ohne Adresse. 🎉'),
      jun('Hupf hat auf dem Fest geredet. Zwanzig Minuten. Ada hat mit Kringel getanzt. Mit Feder am Hut.'),
      jun('Und: Mein kleiner Bruder Pit will auch. Tippt wie Benno, mit zwei. Er ist acht. Darf er mitmachen?', {
        choices: [
          ans('klar', 'Klar', 'Klar darf er. Zwei sind ein Anfang.', [jun('SAG ICH IHM. Er übt schon auf der Kiosk-Kasse. Mama ist begeistert. Nicht.')]),
          ans('erstbenno', 'Erst Benno', 'Erst Benno. Dann Pit. Einer nach dem anderen.', [jun('Benno zuerst, dann Pit. Zwei Schüler, und du lehrst. Du hast eine Tippstunde. Ohne es zu wollen.')]),
        ],
      }),
      jun('PS: Maschine 4 steht in Adas Backstube. Sie fragt jetzt, bevor sie tippt. Ich hab nein gesagt. 😎'),
    ],
  },
];
