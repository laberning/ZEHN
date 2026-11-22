// Akt 6 im Agenten-Chat: Anfangsszene, je Auftrag Briefing, Stufen bei 25/50/75 % und Abschluss, die Szene nach dem Einsatz.
// Quelle der Texte: Drehbuch Akt 6 (liegt nicht im Repository). Szenen-IDs und Antwort-IDs sind Speicherformat: nie umbenennen.
// Alle Haupt-Szenen laufen in ZEHN intern (Juna schreibt dort als Funkerin in Großbuchstaben). Der Baron schreibt bis zur Szene nach dem
// Einsatz als „???“ (`unb`), dort nach der Systemzeile als Benno (`ben`). Tippi tritt in `a6-l3-brief` bei und korrigiert je Szene
// höchstens eine fremde Nachricht (`strike`: der durchgestrichene Teil). Die getippten Antworten sind Codes aus Ziffern.
// Die Geschenk-Szenen, die Abzeichen-Szene und die Nebenszenen kommen mit den Belohnungen und Nebenszenen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ans, ben, goldCard, jun, kr, sys, tip, unb } from '../builders.ts';

/** Echo: Zeile nur, wenn in `scene` die Antwort `choice` gewählt wurde */
const picked = (scene: string, choice: string | null) => ({ ifPicked: { scene, choice } });

const stage = (lessonId: string, at: 0.25 | 0.5 | 0.75) => ({ on: 'stage', lessonId, at }) as const;
const mastered = (lessonId: string) => ({ on: 'mastered', lessonId }) as const;
const briefing = (lessonId: string) => ({ on: 'briefing', lessonId }) as const;

/** Stand des Story-Objekts eines Auftrags in einer Zeile */
const obj = (lessonId: string, at: 0 | 0.25 | 0.5 | 0.75 | 1) => ({ object: { lessonId, at } });

/** Getippter Code: Kurzform, ganze Antwort und getippter Text sind der Code selbst */
const code = (id: string, digits: string, reply: Parameters<typeof ans>[3]) => ans(id, digits, digits, reply, { typed: digits });

export const CHAT_SCENES: StoryScene[] = [
  // ---------- Anfang: kommt zusammen mit dem Briefing von Auftrag 1, vor ihm ----------
  {
    id: 'a6-start',
    chat: 'intern',
    trigger: briefing('m6-l1'),
    lines: [
      kr('Die Uhr am Markt zeigt nichts mehr. Keine Zahl, kein Zeiger. Hupf fragt jeden: „Wie spät?“ 📡'),
      jun('KIOSK OHNE HAUSNUMMER. Preisschilder leer. Mama verkauft nach Gefühl. Ich auch!!! 😎'),
      ada('{gruss}. Erst die Karte von gestern. Signal von O. Du hast gefragt, wer. Heute fragen wir: wo.', picked('a5-exam-after', 'wer')),
      ada('{gruss}. Erst die Karte von gestern. Dasselbe O., hast du gesagt. Ich auch. Beweise: ab heute.', picked('a5-exam-after', 'dasselbe')),
      ada('{gruss}. Erst der Chip von gestern. Ein Lutscher, winzig. Ich habe einen Laden im Kopf. Noch nicht.', picked('a5-exam-after', 'lupe')),
      ada('{gruss}. Gut, dass ihr da seid.', picked('a5-exam-after', null)),
      kr('Und der Baron? Seit dem Turm kein Wort. Keine Karte. Nicht mal ein Backfisch.', {
        choices: [
          ans('weg', 'Was ist weg?', 'Was ist diesmal weg?', [kr('Die Zahlen. Alle. Hausnummern, Preise, die Uhr. Kringel trägt Post nach Gefühl aus. (Geht so.)')]),
          ans('baron', 'Der Baron?', 'Wo ist der Baron?', [ada('Still. Zu still. Die Stadt wird bestohlen, und der Dieb schweigt. Das passt nicht zu ihm.')]),
        ],
      }),
      ada('Das Kalenderblatt aus dem Turm. Am Rand stehen Zahlen. Vier Tasten, die du noch nie gebraucht hast.'),
    ],
  },

  // ---------- Auftrag 1 · Koordinaten (4 5 6 7) · Die Stadtkarte ----------
  {
    id: 'a6-l1-brief',
    chat: 'intern',
    trigger: briefing('m6-l1'),
    lines: [
      ada('Das Kalenderblatt, im Fach unterm Netz noch ganz. Am Rand, klein: 4 7 6 5. Vier Zahlen. Vier Orte?', obj('m6-l1', 0)),
      ada('Die Zahlen liegen über den Buchstaben. 4 und 5: linker Zeigefinger, hoch. 6 und 7: der rechte.', { keys: ['Digit4', 'Digit5', 'Digit6', 'Digit7'] }),
      ada('Keine Umschalttaste. Nur der Griff nach oben, und dann zurück auf F und J.'),
      kr('Ich habe eine Karte vom Hafen. Ohne Zahlen. Pier, Halle, Tor, Kisten. Alles namenlos. 🔋', {
        choices: [
          ans('orte', 'Vier Orte?', 'Vier Zahlen, vier Orte am Hafen?', [ada('Oder ein Ort mit vier Zahlen. Jede Runde holt eine zurück. Dann sehen wir es.')]),
          ans('warum', 'Warum Zahlen?', 'Warum nimmt jemand Zahlen?', [kr('Weil sie noch da waren. Buchstaben: deine. Zeichen: deine. Zahlen: noch nicht. (Bis jetzt.)')]),
          ans('fernglas', 'Fernglas', 'Fernglas an den Hafen.', [kr('Pier, Halle, Tor. An der Halle ein Schild: leer. Darunter Goldstaub. Frisch.')], { needs: 'fernglas' }),
        ],
      }),
      ada('Vier Zahlen vom Rand eines Kalenders. Wer schreibt sich Koordinaten auf einen Kalender?'),
    ],
  },
  {
    id: 'a6-l1-s25',
    chat: 'intern',
    trigger: stage('m6-l1', 0.25),
    lines: [
      kr('Erste Zahl zurück: Pier 4. Steht wieder am Schild. Die Möwen haben geklatscht. (Vermutlich.)', obj('m6-l1', 0.25)),
      jun('HAUSNUMMERN-TICKER: Kringel klingelt überall. Er weiß nicht mehr, wer wo wohnt. Bei Ada: zweimal. 😂'),
      ada('Kringel hat gestern bei TIPPNIX geklingelt. Aus Versehen. Drinnen: Kisten. Ohne Zahlen. Mit Lollis.'),
      kr('Kisten ohne Zahlen. Wie das Lager eines Diebs, der nichts beschriften darf. Oder eines Ladens.'),
      ada('Und der Baron schweigt. Wer stiehlt und sagt nichts? Vielleicht einer, der nicht gestohlen hat.'),
    ],
  },
  {
    id: 'a6-l1-s50',
    chat: 'intern',
    trigger: stage('m6-l1', 0.5),
    lines: [
      kr('Halle 7! Zweite Zahl. Pier 4, Halle 7. Die Karte füllt sich.', obj('m6-l1', 0.5)),
      ada('Pier 4, Halle 7. Das ist kein Datum. Das ist ein Weg. Wohin führt er?', {
        choices: [
          ans('hafen', 'Am Hafen', 'Zum Hafen. Pier, Halle: Da liegt sein Lager.', [ada('Sein Lager. Er hat es nie erwähnt. Und es steht auf einem Kalender. Weiter, bis der Weg zu Ende ist.')]),
          ans('turm', 'Zum Turm', 'Zurück zum Turm. Da war alles.', [kr('Der Turm hat keinen Pier. (Ich war oben. Hundertzwölf Stufen, kein Wasser.) Wo gibt es Piers?')]),
          ans('bahnhof', 'Zum Bahnhof', 'Zum Bahnhof. Ortrud, Halle 7.', [ada('Ortrud ist entlastet, und der Bahnhof hat Gleise, keine Piers. Wo gibt es Piers?')]),
        ],
      }),
      kr('Zwei Zahlen fehlen. Dann wissen wir, welche Tür. Und ob sie zu ist.'),
    ],
  },
  {
    id: 'a6-l1-s75',
    chat: 'intern',
    trigger: stage('m6-l1', 0.75),
    lines: [
      kr('Tor 6. Dritte Zahl. Pier 4, Halle 7, Tor 6. Eine fehlt noch.', obj('m6-l1', 0.75)),
      jun('ICH WAR AM HAFEN, mit Mama. Halle 7, Tor 6. Auf dem Boden: Goldstaub. Eine SPUR. Bis zum Wasser. 👀'),
      ada('Goldstaub bis zum Wasser. Jemand hat getragen. Viel. Der Baron trägt nicht, der verbeugt sich.'),
      kr('Und vor TIPPNIX stand heute ein Lieferwagen. Ohne Nummernschild. (Zahlen weg. Praktisch.) 📡', {
        choices: [
          ans('wer', 'Wer trägt?', 'Wer trägt Kisten aus einem Lager, das nicht seins ist?', [ada('Jemand, der sie braucht. Und der weiß, dass der Besitzer schweigt.')]),
          ans('fragen', 'Fragen wir ihn', 'Fragen wir den Baron. Er liest doch mit.', [ada('Er liest mit. Seit Tagen. Und schreibt nichts. Das macht mir mehr Sorgen als jede Karte.')]),
        ],
      }),
      ada('Eine Zahl noch. Dann steht der Weg. Und am Ende des Wegs ist eine Tür.'),
    ],
  },
  {
    id: 'a6-l1-done',
    chat: 'intern',
    trigger: mastered('m6-l1'),
    lines: [
      ada('4, 5, 6 und 7 sitzen. Beide Zeigefinger, einmal hoch und zurück. Die Karte ist ganz.', obj('m6-l1', 1)),
      kr('Kiste 5. Pier 4, Halle 7, Tor 6, Kiste 5. Vier Zahlen, ein Weg. Wer ihn tippt, hat die Adresse.'),
      ada('Tipp die vier in der Reihe des Wegs. Zeigefinger hoch, der Rest bleibt unten. Blick zum Schirm.', {
        choices: [code('code4765', '4765', [kr('Adresse gespeichert. Hafen, Pier 4, Halle 7, Tor 6, Kiste 5. Das Tor … steht offen. (Seit wann?)')])],
      }),
      ada('Ein Lager mit offenem Tor. Entweder ist jemand drin. Oder jemand war es und hatte es eilig.'),
    ],
  },

  // ---------- Auftrag 2 · Das leere Lager (3 8) · Das Tresorschloss ----------
  {
    id: 'a6-l2-brief',
    chat: 'intern',
    trigger: briefing('m6-l2'),
    lines: [
      kr('Halle 7, Tor 6, Kiste 5. Die Kiste: leer. Dahinter ein Tresor, groß wie ein Ofen. Mit Zahlenschloss.', obj('m6-l2', 0)),
      ada('Vier Rädchen, vier Zahlen. 3 und 8 sind neu: Mittelfinger, links und rechts, einmal hoch und zurück auf D und K.', { keys: ['Digit3', 'Digit8'] }),
      jun('EIN TRESOR IM DIEBESLAGER. Und drumherum: nichts. Keine Kiste voll. Nur Staub. Goldstaub!!!'),
      kr('Goldstaub auf jedem Regal. Hier stand seine ganze Sammlung. Hüte, Karten, Roboter. Jetzt: Glitzer. 📡', {
        choices: [
          ans('wer', 'Wer war das?', 'Wer räumt ein Diebeslager leer?', [ada('Jemand, der weiß, wo es ist. Und der die Beute brauchte. Dringender als der Dieb.')]),
          ans('tresor', 'Und der Tresor?', 'Und der Tresor? Ist der auch leer?', [kr('Zu. Vier Rädchen. Jede Runde rastet eins ein. Dann sehen wir, was ein Dieb vor Dieben versteckt.')]),
          ans('lupe', 'Lupe', 'Lupe auf den Goldstaub.', [kr('Im Staub: ein Stiel. Weiß, klein, klebrig. Von einem Lolli. (Hier isst niemand Lollis. Außer …)')], { needs: 'lupe' }),
        ],
      }),
      ada('Ein leeres Lager, ein voller Tresor, vielleicht. Und ein Dieb, der nicht mal schreibt. Was weiß er?'),
    ],
  },
  {
    id: 'a6-l2-s25',
    chat: 'intern',
    trigger: stage('m6-l2', 0.25),
    lines: [
      kr('Erstes Rädchen: 3. Es hat geklickt. Das Lager hat Echo. So leer ist es.', obj('m6-l2', 0.25)),
      ada('Ich habe den Staub eingetütet. Für die Akte. Und darin ein Fußabdruck. Klein. Mit Absatz.', { picture: 'goldstaub' }),
      jun("Mit ABSATZ? Der Baron trägt Lackschuhe. Flach. Stand auf der Bahnsteig-Kamera. Das war wer anders."),
      kr('Jemand mit Absatz trägt Kisten. Jemand mit Lolli. Jemand, der die Adresse kennt. Ein Jemand. 💡'),
      ada('Und Sie? Lesen Sie mit, Baron? Dann sagen Sie etwas. Ihr Lager ist leer.'),
    ],
  },
  {
    id: 'a6-l2-s50',
    chat: 'intern',
    trigger: stage('m6-l2', 0.5),
    lines: [
      kr('3 8. Zwei Rädchen. Der Tresor brummt. Als ob er jemanden erwartet.', obj('m6-l2', 0.5)),
      unb('Meine Lieben. Meine Sammlung. Jede Kiste. Jedes Kostüm. Sogar beide Zylinder. Weg.'),
      unb('Ich schrieb nichts, weil ich mich schämte. Und weil ich nichts wusste. Man hat mich bestohlen.'),
      jun('ER REDET WIEDER. Und er jammert. Das ist neu. Soll ich das glauben?', {
        choices: [
          ans('bestohlen', 'Bestohlen', 'Er ist bestohlen worden. Genau wie die Stadt.', [ada('Ja. Zum ersten Mal auf unserer Seite des Zauns. Und er weiß nicht, von wem. Oder sagt es nicht.')]),
          ans('trick', 'Nur ein Trick', 'Er tut nur so. Das ist ein Trick.', [kr('Trick wäre: laut. Hochachtungsvoll. Der hier ist leise. (Ich kenne ihn. Von innen.) Bestohlen.')]),
          ans('umzug', 'Umgezogen', 'Er ist einfach umgezogen. Neues Lager.', [ada('Mit Lolli-Stiel und Absätzen? Nein. Umzüge beschriftet er. Das hier war ein Raub.')]),
        ],
      }),
      ada('Der Dieb wurde bestohlen. Von jemandem mit Absätzen, Lollis und Lieferwagen. Wer kennt sein Lager?'),
    ],
  },
  {
    id: 'a6-l2-s75',
    chat: 'intern',
    trigger: stage('m6-l2', 0.75),
    lines: [
      kr('3 8 6. Drittes Rädchen. Eins fehlt. Der Baron zählt im Chat mit. Leise.', obj('m6-l2', 0.75)),
      unb('Die Buchstaben waren längst zurück. Ihr Werk. Aber Hüte, Karten, mein Roboter: alles fort.'),
      ada('Und das O, Baron? Vom Ortsschild. Das war in keiner Kiste. Das wissen wir seit dem Turm.'),
      unb('… Das O ist eine andere Geschichte, Ada. Eine, die ich nicht hier erzähle. Nicht heute.', {
        choices: [
          ans('spaeter', 'Später', 'Dann später. Erst der Tresor.', [ada('Erst der Tresor. Aber die Frage bleibt stehen. Mit Fragezeichen.')]),
          ans('ortrud', 'Ortrud?', 'Ist O. Ortrud? Sag es.', [unb('Ortrud? Die Lokführerin? Meine Lieben, nein. O. ist … nicht hier. Ein Rädchen noch.')]),
        ],
      }),
      kr('Er weiß, wer O. ist. Und sagt es nicht. Das letzte Rädchen zuerst. (Dann fragen wir lauter.)'),
    ],
  },
  {
    id: 'a6-l2-done',
    chat: 'intern',
    trigger: mastered('m6-l2'),
    lines: [
      ada('3 und 8 sitzen. Mittelfinger hoch und zurück, links und rechts. Vier Zahlen für vier Rädchen.', obj('m6-l2', 1)),
      kr('3 8 6, und das vierte hat der Baron geflüstert: 7. Sein Tresor, sein Code. Wir dürfen.'),
      ada('Mittelfinger auf 3 und 8, die anderen beiden kennst du. Rücken gerade, Blick auf den Schirm.', {
        choices: [code('code3867', '3867', [kr('Klick. Klick. Klick. Klick. Offen. Drinnen: nichts. Sogar der Tresor. Nur Staub und ein Lolli-Stiel.')])],
      }),
      ada('Und im Briefkasten der Backstube, gerade eben: Goldrand. Er will reden. Worüber?', {
        ...goldCard('Der Feind meines Feindes, meine Lieben … ist noch kein Freund. Aber ein Anfang. B. v. B.', 'Aus dem Briefkasten'),
        picture: 'feind-karte',
      }),
    ],
  },

  // ---------- Auftrag 3 · Die Spurenwand (1 0) ----------
  {
    id: 'a6-l3-brief',
    chat: 'intern',
    trigger: briefing('m6-l3'),
    lines: [
      ada('Die Spurenwand. Junas Liste, alle Zettel seit dem Werbefoto. Fünf Spuren, kein Faden. Noch.', obj('m6-l3', 0)),
      ada('1 und 0: die kleinen Finger, ganz außen, ganz hoch, zurück auf A und Ö. Links die 1, rechts die 0. Jede Runde ein Faden.', { keys: ['Digit1', 'Digit0'] }),
      sys('Tippi ist dem Chat beigetreten.'),
      tip('Jede Runde ein Lolli! Gratis! Ich bin Tippi. Ich verbessere.', { strike: 'Jede Runde ein Faden' }),
      jun('WAS. Die korrigiert ADA? Wer hat die reingelassen? Krümel, wirf sie raus!!! 😱', {
        choices: [
          ans('werbist', 'Wer bist du?', 'Wer bist du, Tippi? Wer schickt dich?', [tip('Tippi, Schätzchen. Geschickt mit Liebe und Lollis. Gratis. Ich beende Sätze. Auch deine.')]),
          ans('raus', 'Raus hier', 'Raus aus unserem Chat.', [tip('Raus? Nein, rein! In unseren Laden, Schätzchen. Marktplatz. Ich bleibe. Gratis.')]),
          ans('notfunk', 'Notfunk', 'Notfunk an. Mal sehen, ob sie das hört.', [kr('Tippi: still. Zehn Sekunden. Dann wieder da. Sie hört auf dasselbe Signal wie mein Chip. (Aha.)')], { needs: 'notfunk' }),
        ],
      }),
      ada('Eine Maschine, die uns verbessert. Seit heute im Chat, wie das Signal in Krümel. Von wem?'),
    ],
  },
  {
    id: 'a6-l3-s25',
    chat: 'intern',
    trigger: stage('m6-l3', 0.25),
    lines: [
      kr('Erster Faden: Werbefoto zu Aufkleber. Beides TIPPNIX. Juna hat getippt, ich hab geklebt bekommen.', obj('m6-l3', 0.25)),
      jun('Ich hab bei dem Werbefoto eine STUNDE getippt. Für nichts. Für wen eigentlich?!'),
      tip('Für mich eigentlich!!! Danke, Schätzchen. Deine Sätze waren lehrreich. Gratis.', { strike: 'Für wen eigentlich' }),
      jun('DIE MASCHINE KLAUT MEINEN STIL!!! Sie schreibt wie ICH. Mit meinen Ausrufezeichen! 😱'),
      ada('Lehrreich. Eine Maschine, die von Juna gelernt hat. Beim Werbefoto. Wer saß daneben?'),
      ada('Du hast damals erkannt, wem Krümel im Notmodus glich. Der Zettel hängt mit an der Wand.', picked('a5-l2-s50', 'otti')),
      ada('Alle Fäden laufen zu einem Namen. Ich sage ihn nicht. Ich lag schon zweimal daneben. Du zuerst.'),
    ],
  },
  {
    // Die Spurenwand-Wahl: das Kind benennt Otti, bevor eine Figur es tut. Falsche Antworten bekommen eine Entlastung und die Frage noch einmal
    // mit den übrigen; die letzte Stufe bietet nur noch [Otti]. Alle Antwort-IDs der Szene sind eindeutig (Treffer-Zeilen der Fallakte).
    id: 'a6-l3-s50',
    chat: 'intern',
    trigger: stage('m6-l3', 0.5),
    lines: [
      kr('Zweiter Faden: Aufkleber zu Signal von O. Derselbe Sender wie Lolli und Tippi. Ein Name. Du zuerst.', {
        ...obj('m6-l3', 0.5),
        choices: [
          ans('otti', 'Otti', 'Otti. Otti Korrekt von TIPPNIX. Sie steckt hinter allem.', [
            kr('… O. Otti. Ich hab es gewusst, seit ich wie sie geredet habe. Ich konnte es nicht sagen. Du schon.'),
          ]),
          ans('ortrud', 'Ortrud', 'Ortrud. O. wie Ortrud.', [
            ada('Ortrud war im Stellwerk, als Krümel löschte, und hat beim Fest geholfen. Entlastet. Noch mal: Wer?', {
              choices: [
                ans('otti-2', 'Otti', 'Otti. Von TIPPNIX.', [kr('… O. Otti. Ich konnte es nicht sagen. Du schon.')]),
                ans('baron-2', 'Der Baron doch', 'Dann der Baron. Trotz allem.', [
                  ada('Er steht vor seinem leeren Lager, bestohlen wie wir. Bleibt eine. Sag sie.', {
                    choices: [ans('otti-3', 'Otti', 'Otti.', [kr('… O. Otti. Du hast es gesagt. Ich konnte es nicht.')])],
                  }),
                ]),
              ],
            }),
          ]),
          ans('baron', 'Der Baron doch', 'Der Baron. Er hat uns immer belogen.', [
            ada('Bestohlen hat er uns, belogen nie. Und jetzt ist er selbst bestohlen. Bleibt eine. Wer?', {
              choices: [
                ans('otti-2b', 'Otti', 'Otti. Von TIPPNIX.', [kr('… O. Otti. Ich konnte es nicht sagen. Du schon.')]),
                ans('ortrud-2', 'Ortrud', 'Ortrud. O. wie Ortrud.', [
                  ada('Stellwerk, Fest, zwei Zeugen. Ortrud bleibt entlastet. Bleibt eine. Sag sie.', {
                    choices: [ans('otti-3b', 'Otti', 'Otti.', [kr('… O. Otti. Du hast es gesagt. Ich konnte es nicht.')])],
                  }),
                ]),
              ],
            }),
          ]),
        ],
      }),
    ],
  },
  {
    id: 'a6-l3-s75',
    chat: 'intern',
    trigger: stage('m6-l3', 0.75),
    lines: [
      kr('Dritter Faden: Signal, Lolli-Logo, Goldstaub. Alle enden am selben Zettel: TIPPNIX.', obj('m6-l3', 0.75)),
      ada('Jetzt sage ich es auch: Otti. Und: Otti wollte dich. Juna ging für dich hin, ohne es zu wissen.'),
      ada('Du hast Krümel „mein Freund“ genannt. Otti wollte keinen Freund. Sie wollte die schnellsten Finger.', picked('a5-l3-s50', 'freund')),
      ada('Du hast Krümel gesagt, wer er ist. Otti wollte keinen Namen. Sie wollte die schnellsten Finger.', picked('a5-l3-s50', 'kruemel')),
      jun('ich wusste es nicht. ehrlich. sie hat nach dir gefragt. zweimal. ich dachte, das ist nett.'),
      unb('Sie hat mich auch benutzt, meine Lieben. Mich. Den Baron. Und ich habe es ihr leicht gemacht.', {
        choices: [
          ans('leicht', 'Wie leicht?', 'Wie leicht, Baron? Was hast du ihr gegeben?', [unb('Das erzähle ich, wenn die Wand ganz ist. Nicht vor der Maschine. Sie liest mit.')]),
          ans('danke', 'Juna, danke', 'Juna. Du bist für mich hingegangen. Danke.', [jun('ich wollte das FOTO. aber okay. gern. 💛')]),
        ],
      }),
    ],
  },
  {
    id: 'a6-l3-done',
    chat: 'intern',
    trigger: mastered('m6-l3'),
    lines: [
      ada('1 und 0 sitzen. Beide kleinen Finger, ganz außen oben. Die Wand ist ganz, nur die Nadel fehlt.', obj('m6-l3', 1)),
      ada('Die Hausnummer am Markt: weg wie alle. Krümel weiß sie: zehn, wie Finger. Grundstellung, außen hoch.', {
        choices: [code('code10', '10', [kr('Marktplatz 10. TIPPNIX. Nadel drin. Spurenwand: fertig. (Juna, deine Liste war gut.) ⚡', { picture: 'spurenwand-nadel' })])],
      }),
      // die Vertrauens-Wahl: ihr Echo kommt in `a6-l4-s25` und in Akt 7 (Antwort-IDs `ja` und `beweisen` nie umbenennen)
      unb('Und ich, meine Lieben? Ich stehe vor einem leeren Lager, mit einer Karte in der Hand. Darf ich mit?', {
        choices: [
          ans('ja', 'Ja', 'Ja. Der Feind meines Feindes. Du bist dabei.', [ada('Ja, sagt {codename}. Dann ja. Ich brauchte zwanzig Jahre. Beides stimmt. Was hat er ihr gegeben?')]),
          ans('beweisen', 'Erst beweisen', 'Erst beweisen. Dann sehen wir weiter.', [ada('Erst beweisen, sagt {codename}. Auch richtig. Ich brauchte zwanzig Jahre. Was hat er ihr gegeben?')]),
        ],
      }),
    ],
  },

  // ---------- Auftrag 4 · Das Buchstabenkonto (2 9) · Ottis Lieferbuch ----------
  {
    id: 'a6-l4-brief',
    chat: 'intern',
    trigger: briefing('m6-l4'),
    lines: [
      ada('Post vom Baron. Kein Goldrand, ein Buch. Vorn steht: „Mein Konto bei O.“ Ottis Lieferbuch.', obj('m6-l4', 0)),
      unb('Jede Lieferung hat sie aufgeschrieben, meine Lieben. Mit Durchschlag. Ich bekam das Blaue. Lesen.'),
      ada('Alle Zahlen fehlen, auch hier. Seiten, Mengen, Daten. 2 und 9: Ringfinger links und rechts, hoch und zurück auf S und L.', {
        keys: ['Digit2', 'Digit9'],
        choices: [
          ans('beweis', 'Ein Beweis', 'Das ist sein Beweis. Er zeigt uns alles.', [ada('Fast alles. Eine Seite hat er umgeknickt. Die lesen wir, wenn ihre Zahl zurück ist.')]),
          ans('vorsicht', 'Vorsicht', 'Vorsicht. Er könnte Seiten rausgerissen haben.', [kr('Ich hab gezählt. Keine fehlt. (Zählen kann ich. Zahlen holst du.)')]),
          ans('dankebaron', 'Danke, Baron', 'Danke, Baron.', [unb('Danken Sie nicht zu früh. Was drinsteht, gefällt Ihnen nicht. Mir auch nicht.')]),
        ],
      }),
      ada('Ein Konto bei Otti. Jede Zeile eine Lieferung. Was hat ein Dieb bei einer Händlerin abzuliefern?'),
    ],
  },
  {
    id: 'a6-l4-s25',
    chat: 'intern',
    trigger: stage('m6-l4', 0.25),
    lines: [
      kr('Seite 2 lesbar: obere Reihe, Lieferung B., zwei Kisten. Unterschrift: ein Lolli.', obj('m6-l4', 0.25)),
      tip('Unterschrift: eine Freundin! Gratis, Schätzchen.', { strike: 'Unterschrift: ein Lolli' }),
      ada('Du hast ja gesagt. Er liefert. Alles. Erst mal recht gehabt.', picked('a6-l3-done', 'ja')),
      ada('Du hast erst beweisen gesagt. Er beweist. Seite für Seite. Erst mal recht gehabt.', picked('a6-l3-done', 'beweisen')),
      jun('ER HAT BUCHSTABEN GELIEFERT. An Otti. Kistenweise. Der Baron war ihr LIEFERANT. Und ihr Kunde?'),
      unb('Lieferant, meine Lieben. Nie Kunde. Ich zahlte nicht. Ich wurde bezahlt. Mit einem Gerät.'),
      ada('Bezahlt mit einem Gerät. Und womit hat er dafür bezahlt? Seite 9 ist die umgeknickte.'),
    ],
  },
  {
    id: 'a6-l4-s50',
    chat: 'intern',
    trigger: stage('m6-l4', 0.5),
    gives: ['bennos-monokel'],
    lines: [
      kr('Seite 9: SCHILD-O. Lieferung B. an Maschine 3. Menge: eins. Ein einziges O. Das vom Ortsschild.', obj('m6-l4', 0.5)),
      unb('Sie wollte ein O, meine Lieben. Ich hatte nur eins. Das vom Schild. Mein Eintritt. Lohn kam später.'),
      ada('Darum kam es nicht zurück. Alle O kamen, als du die Taste konntest. Dieses nicht. Warum, {codename}?', {
        choices: [
          ans('keino', 'Sein einziges O', 'Weil es in der Maschine steckt. Eingebaut, nicht gefüttert.', [
            kr('Eingebaut. Gefüttertes kommt zurück, wenn du es kannst. Eingebautes erst, wenn die Maschine steht.'),
          ]),
          ans('luegt', 'Er lügt', 'Er lügt. Er hat es noch.', [unb('Hätte ich es, meine Lieben, hinge es am Schild. Ich kann sonst nichts zurückgeben. Nur gestehen.')]),
          ans('maschine', 'Maschine 3?', 'Was ist Maschine 3?', [kr('Eine von Ottis Tippmaschinen. Die laufen mit Beute. Und eine hat ein O fest drin. Wie einen Motor.')]),
        ],
      }),
      unb('Nehmen Sie das. Mein letztes Monokel, das andere liegt bei Ihnen im Fach. Es zeigt Goldstaub.', { item: 'bennos-monokel' }),
      ada('Ein Monokel vom Baron. Und ein O in einer Maschine. Wo steht die Maschine?'),
    ],
  },
  {
    id: 'a6-l4-s75',
    chat: 'intern',
    trigger: stage('m6-l4', 0.75),
    lines: [
      kr('Tresor: 1 2 3 4. Steht auf Seite 29, unter „Code“. Natürlich. Sie tippt ja nie. (Merkt sich nichts.)', obj('m6-l4', 0.75)),
      ada('Der Tresor steht unter TIPPNIX, sagt der Baron. Marktplatz 10, Keller. Darin Maschinen. Und das O.'),
      unb('Ich war einmal drin, meine Lieben. Zum Abliefern. Drei Maschinen, laut wie Öfen. Ein Glas, ein O.', {
        choices: [
          ans('nacht', 'Heute Nacht', 'Dann gehen wir heute Nacht. Vor der Inventur.', [ada('Heute Nacht. Mit dem Code, dem Monokel und dem Baron. Ich fasse es nicht, dass ich das sage.')]),
          ans('hupf', 'Hupf fragen', 'Fragen wir Hupf. Die hat Schlüssel für alles.', [ada('Hupf hat den Schlüssel für die Tür. Der Tresor hat keinen. Nur den Code. Deinen.')]),
        ],
      }),
      kr('Code, Monokel, Keller. Eine Zahl fehlt noch im Buch. Dann ist es ganz. Dann gehen wir.'),
    ],
  },
  {
    id: 'a6-l4-done',
    chat: 'intern',
    trigger: mastered('m6-l4'),
    lines: [
      ada('2 und 9 sitzen. Beide Ringfinger, hoch und zurück. Damit kannst du jede Zahl. Das Buch ist ganz.', obj('m6-l4', 1)),
      kr('Letzte Seite, letzte Zeile: „Zahlen: selbst geholt.“ Otti braucht keinen Baron mehr. Nur Maschinen.'),
      ada('Buch ins Beweisfach. Jetzt der Code. Ringfinger auf die 2, der Rest kennt sich. Blick zum Schirm.', {
        choices: [code('code1234', '1234', [kr('Gespeichert. 1234. Der Code zu Ottis Tresor. (Sie tippt nie. Wir schon.)')])],
      }),
      ada('Heute Nacht, Marktplatz 10. Der Baron kennt den Hintereingang. Hupf will mit, Hubbel hütet das HQ.'),
      kr('Drei Maschinen, ein Glas, ein O. Und Tippi liest mit. Weiß sie, dass wir kommen?'),
    ],
  },

  // ---------- Nach dem Einsatz (Erfolg oder Hintertür), einmal: erst der Triumph, dann Bennos Name, dann das lose Blatt ----------
  {
    id: 'a6-exam-after',
    chat: 'intern',
    trigger: { on: 'exam', moduleId: 'm6' },
    lines: [
      kr('Tresor: offen. O: gesehen. Otti: überführt. Die Stadt hat ihre Zahlen wieder. Deine. ⚡'),
      jun("DIE UHR AM MARKT GEHT WIEDER. Hupf hat sie zwölfmal fotografiert. Gepostet. Ohne Adresse!!! 🎉"),
      sys('Unbekannt heißt jetzt Benno.'),
      ben('Benno. Nur Benno. Der Rest war Hut. Ada … ich sage es später. Nicht vor der Maschine.'),
      kr('Im Lieferbuch, ganz hinten, ein loses Blatt. Das war vorher nicht da.', {
        card: { title: 'Lieferblatt', text: 'Maschine 4: lernt selbst. Lehrer: gesucht.' },
        picture: 'lieferblatt',
        choices: [
          ans('lehrer', 'Lehrer?', 'Lehrer? Eine Maschine, die lernt? Von wem?', [ada('Von dem, der hier selbst tippt. Tippi hat heute jedes Wort gelesen. Jede Zahl. Deine.')]),
          ans('benno', 'Benno', 'Benno. Danke. Für den Hintereingang.', [ben('Hintereingänge kenne ich. Vordereingänge lerne ich noch. Danke zurück. Für den Code.')]),
          ans('monokel', 'Monokel', 'Monokel aufs Blatt.', [kr('Unter „Lehrer“ ein Fingerabdruck. Klein. Kein Lolli. (Nicht ihrer. Ihre sind nie an Tasten.)')], { needs: 'bennos-monokel' }),
        ],
      }),
      kr('Lehrer: gesucht. Zehn Finger. Wer tippt hier frisch? (Frage für Tippi.)'),
    ],
  },
];
