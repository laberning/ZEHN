// Akt 4 im Agenten-Chat: Anfangsszene in der kleingemachten Stadt, je Auftrag Briefing, Stufen bei 25/50/75 % und Abschluss, die Szene nach dem Einsatz.
// Quelle der Texte: Drehbuch Akt 4 (liegt nicht im Repository). Szenen-IDs sind Speicherformat: nie umbenennen.
// Alle Haupt-Szenen laufen in ZEHN intern (Juna schreibt dort als Funkerin in Großbuchstaben); der Baron schreibt einmal als „???“ (a4-l2-s75).
// Die Geschenk-Szenen, die Abzeichen-Szene und die Nebenszenen kommen mit den Belohnungen und Nebenszenen.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ans, jun, kr, sys, unb } from '../builders.ts';

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
    id: 'a4-start',
    chat: 'intern',
    trigger: briefing('m4-l1'),
    lines: [
      kr('Hallo, Bad Qwertz. Oder: hallo, bad qwertz. Die großen Buchstaben sind weg. Alle. 🔋'),
      jun('EILMELDUNG: Bürgermeisterin Hupf: „Das Stadtfest findet statt. Groß. Also … groß.“ Dreimal gesagt.'),
      ada('{gruss}. Erst die Karte von gestern. Du hast gefragt, wer Krümel schreibt. Ich habe eine Antwort.', picked('a3-exam-after', 'wer')),
      ada('{gruss}. Erst die Karte von gestern. Du wolltest, dass Krümel nicht antwortet. Er musste nicht.', picked('a3-exam-after', 'nicht')),
      ada('{gruss}. Erst die Karte von gestern. Du hast seinen Namen in den Tunnel gerufen. Er hat ihn gehört.', picked('a3-exam-after', 'megafon')),
      ada('{gruss}. Gut, dass ihr da seid.', picked('a3-exam-after', null)),
      ada('Die Karte kam vom Turm, in dem er wohnt. „Hallo Keks“ war ein Gruß an Krümel. Und an mich.', {
        choices: [
          ans('weg', 'Was ist weg?', 'Was genau ist weg?', [kr('Alles, was groß war. Schilder, Zeitung, Juna. Also, Junas Kanal. Juna selbst ist noch groß.')]),
          ans('turm', 'Zum Turm', 'Dann gehen wir zum Turm.', [ada('Wenn wir wissen, wo er steht. Auf keiner Karte der Stadt steht er. Noch nicht.')]),
        ],
      }),
      ada('Erst die Großbuchstaben. Dafür brauchst du eine Taste, die du noch nie gebraucht hast.'),
    ],
  },

  // ---------- Auftrag 1 · Kleinmachung (Großbuchstaben der linken Hand) ----------
  {
    id: 'a4-l1-brief',
    chat: 'intern',
    trigger: briefing('m4-l1'),
    gives: ['shift-handschuhe'],
    lines: [
      kr('Kringel hat die Zeitung gebracht. Ohne einen einzigen Großbuchstaben. Lies mal.', obj('m4-l1', 0)),
      ada('Die großen Buchstaben sitzen auf denselben Tasten wie die kleinen. Der Trick ist die Umschalttaste.'),
      ada('Die linke Hand tippt, der rechte kleine Finger hält rechts unten die Umschalttaste. Loslassen, zurück auf Ö.', { keys: ['ShiftRight'] }),
      kr('Shift-Handschuhe. Rechts hält, links tippt. Heute. Sie wissen, welche Hand hält. 💡', {
        item: 'shift-handschuhe',
        choices: [
          ans('rechts', 'Warum rechts?', 'Warum die rechte Umschalttaste, wenn links tippt?', [ada('Weil eine Hand nicht zwei Dinge gleichzeitig kann. Die andere hält, die eine tippt. Immer so.')]),
          ans('wer', 'Wer macht das?', 'Wer macht Buchstaben klein?', [kr('Einer, der Backspace heißt und oben wohnt. Er hat es angekündigt. Wir haben es nur nicht gelesen.')]),
        ],
      }),
      kr('Jede Runde holt eine Zeile der Zeitung groß zurück. Und dann steht da, wo er wohnt. Hoffentlich.'),
    ],
  },
  {
    id: 'a4-l1-s25',
    chat: 'intern',
    trigger: stage('m4-l1', 0.25),
    lines: [
      kr('Erste Zeile groß: Der Qwertzer Bote. Mit D, Q und B. Alle von links.', obj('m4-l1', 0.25)),
      jun('ICH BIN NOCH GROSS. Mein Kanal nicht. Das Flüstern ist jetzt wirklich Flüstern. 🙄'),
      ada('Große Buchstaben sind laut. Darum nimmt er sie zuerst. Wer nicht laut sein kann, wehrt sich nicht.'),
      kr('Ich hab heute Nacht geübt. Großbuchstaben. Es ging … gut. Sehr gut. Komisch gut.'),
      kr('Was macht einer mit einer Stadt, die nicht laut sein kann?'),
    ],
  },
  {
    id: 'a4-l1-s50',
    chat: 'intern',
    trigger: stage('m4-l1', 0.5),
    lines: [
      kr('Zweite Zeile: Bad Qwertz ohne große Buchstaben. Jetzt stimmt wenigstens die Schlagzeile.', obj('m4-l1', 0.5)),
      kr('Du hast mir gesagt, ich war Keks und bin Krümel. Heute bin ich beides. Und schneller als je.', picked('a3-l5-s75', 'keks')),
      kr('Du hast gesagt: Du bist Krümel, Punkt. Heute tippe ich wie keiner. Ist das noch Krümel?', picked('a3-l5-s75', 'kruemel')),
      kr('Ada hat gesagt, wer ich war. Heute tippe ich wie keiner. Wer bin ich jetzt?', picked('a3-l5-s75', 'ada')),
      jun('Krümel hat mir geschrieben. Jedes Wort GROSS. Perfekt. Ohne Fehler. Seit wann kann er das?'),
      ada('Die Zeitung schreibt: Der Dieb sitzt in einem Turm. Kein Turm dieser Stadt hat einen Namen. Welcher?', {
        choices: [
          ans('sendeturm', 'Der Sendeturm', 'Der Sendeturm. Da hat er schon mal gefunkt.', [ada('Einer von zweien. Der andere ist verschwunden. Von der Karte. Wie ein Großbuchstabe.')]),
          ans('kirche', 'Die Kirche', 'Der Kirchturm.', [kr('Die Kirche hat eine Glocke und eine Taube. Keinen Baron. Ich hab nachgesehen.')]),
        ],
      }),
      kr('Ein Turm, der von der Karte verschwindet. Wie versteckt man einen Turm?'),
    ],
  },
  {
    id: 'a4-l1-s75',
    chat: 'intern',
    trigger: stage('m4-l1', 0.75),
    lines: [
      kr('Dritte Zeile: Bürgermeisterin: Stadtfest findet statt. Hupf gibt nicht auf.', obj('m4-l1', 0.75)),
      kr('Und ich hab den ganzen Artikel abgetippt. GROSS. Ohne Fehler. Ich weiß nicht, wie.'),
      jun('Den GANZEN Artikel?! Ohne einen Fehler? Seit wann kannst du das? 😱'),
      kr('Ich weiß. Frag nicht. Also: Frag. Du siehst es ja.', {
        choices: [
          ans('seitwann', 'Seit wann, Krümel?', 'Seit wann kannst du das, Krümel?', [kr('Seit … kurz. Übung. Viel Übung. Nachts. Reden wir über den Turm.')]),
          ans('gut', 'Gut gemacht', 'Gut gemacht!', [kr('Danke. Ja. Gut. Zu gut, sagt Ada. Reden wir über den Turm.')]),
          ans('fernglas', 'Fernglas', 'Ich schau mit dem Fernglas über die Dächer.', [kr('Hinter dem Bahnhof: ein Turm ohne Fenster. Auf keiner Karte. Da steht er.')], { needs: 'fernglas' }),
        ],
      }),
      ada('Der Artikel sagt: Der Turm steht am Ende einer Straße ohne Schild. Welche Straße hat kein Schild?'),
    ],
  },
  {
    id: 'a4-l1-done',
    chat: 'intern',
    trigger: mastered('m4-l1'),
    lines: [
      kr('Die großen Buchstaben links sitzen! Q W E R T A S D F G, Y X C V B. Titelzeile: BAD QWERTZ.', obj('m4-l1', 1)),
      ada('Die Zeitung ist wieder laut. Jetzt der Turm. Er hat einen Namen, und der beginnt groß.'),
      ada('Grundstellung. Rechter kleiner Finger hält, linker Zeigefinger hoch zum T. Dann klein weiter.', {
        choices: [ans('turm', 'Turm', 'Turm', [kr('Turm. Mit großem T. Der Turm hat auf der Karte wieder einen Namen: Turm. Nur Turm. Mehr nicht.')], { typed: 'Turm' })],
      }),
      kr('„Turm.“ Wie „Hallo Keks“: kurz und ohne Absender. Wo steht ein Turm, der nur Turm heißt?'),
    ],
  },

  // ---------- Auftrag 2 · Der Plan (Großbuchstaben der rechten Hand) ----------
  {
    id: 'a4-l2-brief',
    chat: 'intern',
    trigger: briefing('m4-l2'),
    lines: [
      jun('Am Bahnhof hängt ein Plakat. Zerfetzt. Aber groß. Also: Es WAR groß. Ich schick es rüber.', obj('m4-l2', 0)),
      ada('Jetzt tippt die rechte Hand. Der linke kleine Finger hält die linke Umschalttaste. Loslassen, zurück auf A.', { keys: ['ShiftLeft'] }),
      kr('Jede Runde setzt das Plakat zusammen. Dann lesen wir, was er vorhat. Er hat es ja aufgehängt.', {
        choices: [
          ans('links', 'Links hält?', 'Jetzt hält die linke Hand?', [ada('Jetzt hält links. Die Hand, die nicht tippt, hält. Das ist die ganze Regel.')]),
          ans('aufgehaengt', 'Aufgehängt?', 'Er hängt seinen Plan ans Schwarze Brett?', [kr('Ein Baron braucht Publikum. Sonst ist Klauen nur Klauen.')]),
        ],
      }),
      kr('Ein Plakat für eine Kleinmachung. Was steht drauf, wenn es ganz ist?'),
    ],
  },
  {
    id: 'a4-l2-s25',
    chat: 'intern',
    trigger: stage('m4-l2', 0.25),
    lines: [
      kr('Erstes Wort: GROSSE. Mit zwei großen S. Das nenne ich Ansage.', obj('m4-l2', 0.25)),
      jun('GROSSE was?! Große Pause? Große Pizza? Große PROBLEME?'),
      ada('Großer Ärger. Er hat heute Nacht wieder etwas vorbereitet. Ich habe Licht im Turm gesehen.'),
      kr('Ich war auch wach. Geübt. Juna ist jetzt immer da. Einer muss gebraucht werden. Was wird hier groß?'),
    ],
  },
  {
    id: 'a4-l2-s50',
    chat: 'intern',
    trigger: stage('m4-l2', 0.5),
    lines: [
      kr('GROSSE KLEINMACHUNG. Das ist der Plan. Alles Große wird klein. Die ganze Stadt.', obj('m4-l2', 0.5)),
      jun('Krümel. Dreh dich mal. Da klebt was an dir. Ein Aufkleber. Glänzend. Da steht TIPPNIX drauf.'),
      kr('Wo? Ach das. Das ist … Werbung. Vom Markt. Die klebt überall. Egal.'),
      ada('Krümel. Das hast du nicht vom Markt.', {
        choices: [
          ans('aufkleber', 'Der Aufkleber?', 'Krümel, seit wann hast du den Aufkleber?', [kr('Seit … ich weiß nicht. Kurz. Es ist nur ein Aufkleber. Schauen wir aufs Plakat. Bitte.')]),
          ans('gutaus', 'Sieht gut aus', 'Sieht gut aus, der Aufkleber.', [kr('Findest du? Ich … ja. Glänzt. Schauen wir aufs Plakat.')]),
          ans('spaeter', 'Später', 'Reden wir später drüber.', [kr('Gern. Später. Viel später. Das Plakat!')]),
        ],
      }),
      ada('Große Kleinmachung. Und Krümel mit einem Aufkleber, den er nicht erklärt. Was ist hier los?'),
    ],
  },
  {
    id: 'a4-l2-s75',
    chat: 'intern',
    trigger: stage('m4-l2', 0.75),
    lines: [
      kr('Das Plakat hat eine Unterschrift: „Jeder Große wird klein. Unterzeichnet: B. v. B.“', obj('m4-l2', 0.75)),
      sys('Unbekannt ist dem Chat beigetreten.'),
      unb('Meine Lieben. Die Kleinmachung ist nicht aufzuhalten. Hochachtungsvoll, Ihr Baron von Backfisch.'),
      unb('BACKSPACE. Verflixtes Gerät. Es verbessert mich. Niemand verbessert mich.'),
      sys('Unbekannt hat den Chat verlassen.'),
      kr('Backfisch. Schon wieder. Das tippt nicht er. Das tippt sein Gerät. Geschenkt, laut Notizbuch.', {
        choices: [
          ans('geraet', 'Es verbessert ihn', 'Sein Gerät verbessert ihn. Und macht es falsch.', [ada('Ein Gerät, das besser tippen will als er. Er hasst es. Er benutzt es trotzdem.')]),
          ans('niemand', 'Niemand verbessert ihn', '„Niemand verbessert mich.“ Das klingt nach dir, Ada.', [ada('Das klingt nach mir, ja. Aber ihn verbessert etwas. Guck auf den Backfisch.')]),
        ],
      }),
      kr('Ein Gerät, das für ihn tippt. Wie bei TIPPNIX: Nie wieder tippen! Und das Wort klebt an mir. Warum?'),
    ],
  },
  {
    id: 'a4-l2-done',
    chat: 'intern',
    trigger: mastered('m4-l2'),
    lines: [
      kr('Die Großbuchstaben der rechten Hand sitzen! Z U I O P, H J K L, N M. Das Plakat ist ganz.', obj('m4-l2', 1)),
      jun('„Ausgenommen: ich.“ Ganz unten, WINZIG. Er macht alle klein, nur sich nicht. Typisch!!! 🔥'),
      ada('Wir brauchen jemanden, der die Stadt warnt. Laut. Juna, dein Kanal ist klein. Mach ihn wieder groß.'),
      jun('Dafür muss jemand meinen Namen groß schreiben. Ich darf nicht. Du darfst. Finger auf F und J!', {
        choices: [ans('juna', 'Juna', 'Juna', [jun('JUNA! Mit großem J, von links gehalten! Mein Kanal ist wieder LAUT. 🎉')], { typed: 'Juna' })],
      }),
      ada('Ich muss euch etwas sagen. Über den, der im Turm wohnt. Nicht heute. Erst die Straße.'),
    ],
  },

  // ---------- Auftrag 3 · Backspace-Straße (ß) ----------
  {
    id: 'a4-l3-brief',
    chat: 'intern',
    trigger: briefing('m4-l3'),
    lines: [
      kr('Die Straße ohne Schild liegt hinter dem Bahnhof. Das Schild ist leer. Der Pfeil zeigt bergauf.', obj('m4-l3', 0)),
      ada('Für den Namen fehlt ein Buchstabe, den du noch nie getippt hast: ß. Ganz oben rechts, neben der 0.'),
      ada('Rechter kleiner Finger, weit hoch. Ohne Umschalttaste. Dann zurück auf Ö.', { keys: ['Minus'] }),
      jun('Ein ß! Das Eszett! Der Buchstabe, den niemand findet. Ich hab ihn mal mit SS geschrieben. Aus Trotz.', {
        choices: [
          ans('eszett', 'Was heißt ß?', 'Was ist das für ein Buchstabe?', [ada('Ein scharfes S. Straße, groß, Fuß. Er steht nie am Anfang. Darum hat er keine große Form.')]),
          ans('bergauf', 'Bergauf?', 'Die Straße geht bergauf?', [kr('Zum Turm. Türme stehen oben. Das ist das Einzige, was wir sicher wissen.')]),
        ],
      }),
      kr('Jede Runde schreibt das Schild weiter. Und am Ende der Straße steht, was Ada uns sagen will.'),
    ],
  },
  {
    id: 'a4-l3-s25',
    chat: 'intern',
    trigger: stage('m4-l3', 0.25),
    lines: [
      kr('Das Schild sagt: Back. Nur Back. Wie Backstube. Oder Backspace.', obj('m4-l3', 0.25)),
      jun('Ich war oben, mit Ortrud. Ein Turm. Kein Fenster. Eine Tür ohne Griff, eine Treppe. Es RIECHT. 👀'),
      ada('Nach Vanille.'),
      jun('Woher WEISST du das?'),
      ada('Ich weiß es. Die Straße ist nicht die einzige, die zum Turm führt.'),
    ],
  },
  {
    id: 'a4-l3-s50',
    chat: 'intern',
    trigger: stage('m4-l3', 0.5),
    lines: [
      kr('Backspace-. Mit Bindestrich. Die Straße heißt nach ihm. Oder er nach ihr.', obj('m4-l3', 0.5)),
      jun('Auf der Turmtreppe steht ein Blech. Vanillekipferl. Frisch. Jeden Morgen, sagt die Nachbarin.'),
      kr('Jeden Morgen ein Blech Kipferl vor seiner Tür. Wer stellt die da hin? Du weißt es.', {
        choices: [
          ans('kipferl', 'Für ihn', 'Darum backst du nachts Vanillekipferl, Ada. Für ihn.', [ada('Seit zwanzig Jahren. Jede Nacht ein Blech. Er holt sie. Ich sehe ihn nie.')]),
          ans('kringel', 'Für Kringel?', 'Sind die für Kringel?', [ada('Kringel bekommt Brötchen. Die Kipferl waren nie für Kringel. Für ihn. Seit zwanzig Jahren.')]),
          ans('falle', 'Eine Falle?', 'Ist das eine Falle?', [ada('Keine Falle. Ein Gruß. Jede Nacht ein Blech, seit zwanzig Jahren. Für ihn.')]),
        ],
      }),
      jun('Du backst für den DIEB? Jede Nacht? Ada!'),
      ada('Nicht für den Dieb. Für den Jungen, der er war. Steht das Schild fast, erzähle ich es. Versprochen.'),
    ],
  },
  {
    id: 'a4-l3-s75',
    chat: 'intern',
    trigger: stage('m4-l3', 0.75),
    lines: [
      kr('Backspace-Stra e. Eine Lücke. Das ß fehlt noch. Ada, du wolltest etwas sagen.', obj('m4-l3', 0.75)),
      ada('Benno ist mein Neffe. Meiner Schwester Sohn. Mit zwölf in der Backstube, mit sechzehn bei der ZEHN.'),
      ada('Bei seiner Prüfung habe ich gesagt: Mit zwei Fingern wirst du nie ein Agent. Vor allen.'),
      ada('Im Archiv hast du gesagt: Das war gemein. Du hattest recht. Zwanzig Jahre hab ich geschwiegen.', picked('a3-l4-s75', 'gemein')),
      ada('Im Archiv hast du gesagt: Trotzdem ein Dieb. Stimmt. Und trotzdem mein Neffe. Beides bleibt wahr.', picked('a3-l4-s75', 'dieb')),
      ada('Dir hab ich gesagt: Zwei sind ein Anfang. Das hätte ich ihm sagen sollen. Ihm zuerst.', {
        choices: [
          ans('neffe', 'Dein Neffe', 'Der Baron ist dein Neffe.', [ada('Mein Neffe. Mein Lehrling. Mein Fehler. Und seit zwanzig Jahren mein Nachbar, zwei Straßen weiter.')]),
          ans('sagen', 'Sag es ihm', 'Dann sag es ihm jetzt.', [ada('Ich stehe jeden Morgen mit einem Blech vor seiner Treppe. Sagen ist schwerer als backen.')]),
        ],
      }),
    ],
  },
  {
    id: 'a4-l3-done',
    chat: 'intern',
    trigger: mastered('m4-l3'),
    lines: [
      kr('Das ß sitzt! Schild komplett: Backspace-Straße. Der Pfeil zeigt auf den Turm. Ohne Fenster.', obj('m4-l3', 1)),
      ada('Oben an der Treppe liegt eine Karte. Für uns. Ich kenne die Schrift.', {
        card: { title: 'An der Treppe', text: 'Wenn es keine Buchstaben gibt, braucht niemand zehn Finger. Dann hat niemand mehr unrecht. Auch ich nicht. B.' },
      }),
      ada('„B.“ Kein Baron. Nur B. Schreib uns auf, wohin es geht. Rechter kleiner Finger, ganz hoch zum ß.', {
        choices: [ans('strasse', 'Straße', 'Straße', [kr('Straße. Mit ß. Die Straße hat einen Namen, und er führt zur Tür. Morgen stehen wir davor.')], { typed: 'Straße' })],
      }),
      kr('„Dann hat niemand mehr unrecht.“ Er will nicht gewinnen. Er will nicht mehr verlieren. Und jetzt?'),
    ],
  },

  // ---------- Auftrag 4 · Die Turmtür (Ä Ö Ü, gemischt) ----------
  {
    id: 'a4-l4-brief',
    chat: 'intern',
    trigger: briefing('m4-l4'),
    lines: [
      kr('Wir stehen vor der Tür. Kein Griff, kein Schloss. Ein Leuchtschild, dunkel. Es summt.', obj('m4-l4', 0)),
      ada('Die letzten Großbuchstaben: Ä, Ö, Ü. Rechter kleiner Finger tippt, linker kleiner Finger hält. Loslassen, beide zurück.', { keys: ['ShiftLeft', 'Quote', 'Semicolon', 'BracketLeft'] }),
      ada('Und alles davor, gemischt. Groß, klein, ß. Dafür hast du drei Aufträge geübt.'),
      jun('Ich bin unten am Funk. Hupf hat den ganzen Markt hergeschickt. Die Stadt GUCKT ZU. Keine Panik.', {
        choices: [
          ans('ruhe', 'Keine Panik', 'Keine Panik. Wir machen das.', [ada('Wir machen das. Du machst das. Ich stehe daneben. Wie damals. Diesmal sage ich das Richtige.')]),
          ans('megafon', 'Megafon', 'Ich ruf hoch: Mach auf!', [kr('Echo. Und von oben, leise: „Nein, meine Lieben.“ Er ist da. Er hört zu.')], { needs: 'tunnel-megafon' }),
        ],
      }),
      kr('Jede Runde macht das Schild heller. Dann sehen wir, was die Tür will. Ein Name, sagt Ada.'),
    ],
  },
  {
    id: 'a4-l4-s25',
    chat: 'intern',
    trigger: stage('m4-l4', 0.25),
    lines: [
      kr('Das Schild leuchtet: BARON VON BACKSPACE. In Großbuchstaben. Er hat sich die großen gelassen.', obj('m4-l4', 0.25)),
      ada('Er wollte nie Benno heißen. Baron klang wie jemand, der nicht durchfällt.'),
      kr('Ein Schild, das nur ihn groß schreibt. Und dahinter: er. Was will eine Tür von uns?'),
    ],
  },
  {
    id: 'a4-l4-s50',
    chat: 'intern',
    trigger: stage('m4-l4', 0.5),
    lines: [
      kr('Das Schild flackert. BAR N V N BACKSPACE. Die O sind weg. An seiner eigenen Tür.', obj('m4-l4', 0.5)),
      jun('ER hat kein O?! Der Buchstabendieb hat sein eigenes O nicht?'),
      ada('Er hat alle O zurückgegeben. Bis auf eins. Das vom Ortsschild. Und das hat er auch nicht mehr.', {
        choices: [
          ans('werdann', 'Wer dann?', 'Wer hat das O dann?', [kr('Jemand, dem er es gegeben hat. Oder der es ihm genommen hat. Beides steht nicht auf der Tür.')]),
          ans('bekommt', 'Er bekommt es', 'Er bekommt sein O zurück, wenn er aufhört.', [ada('Das wäre ein Handel. Ich glaube, er hat schon einen gemacht. Mit jemand anderem.')]),
        ],
      }),
      kr('Ein Dieb ohne sein O. Mit wem handelt einer, der alles hat?'),
    ],
  },
  {
    id: 'a4-l4-s75',
    chat: 'intern',
    trigger: stage('m4-l4', 0.75),
    lines: [
      kr('Unter dem Namen: ZUTRITT NUR MIT NAMEN. Die Tür will einen Namen. Aber welchen?', obj('m4-l4', 0.75)),
      jun('BARON natürlich! Oder BACKSPACE! Oder … Moment. Das steht da schon. Das wäre zu leicht.'),
      ada('Die Tür fragt nicht, wie er heißen will. Sie fragt, wer er ist. Du hast seine Akte gelesen.', {
        choices: [
          ans('echtername', 'Benno', 'Die Tür will seinen echten Namen. Benno.', [ada('Ja. Den Namen, den er sich abgewöhnt hat. Den kennt hier nur noch die Tür. Und wir.')]),
          ans('baron', 'Baron', 'Baron.', [kr('Das Schild sagt Baron, und die Tür bleibt zu. Sie will den, der dahinter wohnt. Nicht den Titel.')]),
          ans('lieben', 'Meine Lieben', 'Meine Lieben. Das sagt er immer.', [kr('Das sagt er, das ist er nicht. Die Tür will einen Namen. Seinen echten.')]),
        ],
      }),
      ada('Sein Name. Fünf Buchstaben, einer davon groß. Mach dich bereit. Ich … auch.'),
    ],
  },
  {
    id: 'a4-l4-done',
    chat: 'intern',
    trigger: mastered('m4-l4'),
    lines: [
      kr('Ä, Ö, Ü sitzen, rechter kleiner Finger tippt, links hält! Die Großschreibung ist deine. Feld: NAME.', obj('m4-l4', 1)),
      ada('Tipp ihn. Rechter kleiner Finger hält, linker Zeigefinger weit runter zum B. Dann klein weiter.', {
        choices: [ans('benno', 'Benno', 'Benno', [kr('Benno. Mit großem B. Die Tür summt. Dann geht sie auf. Dahinter: Treppe. 112 Stufen.')], { typed: 'Benno' })],
      }),
      jun('FUNK: Die Treppe LEUCHTET. Jede Stufe ein Buchstabe. Große. Er hat sie alle hier oben!'),
      kr('Und sie kommen runter. Alle auf einmal. Groß und klein, wie ein Sturm. Festhalten. Oder tippen.'),
    ],
  },

  // ---------- Nach dem Einsatz (Erfolg oder Hintertür), einmal ----------
  {
    id: 'a4-exam-after',
    chat: 'intern',
    trigger: { on: 'exam', moduleId: 'm4' },
    lines: [
      kr('Die Großschreibung ist deine. Beide Umschalttasten, ß, Ä Ö Ü. Die Stadt ist wieder laut. ⚡'),
      jun('DER MARKT JUBELT. Hupf hat ins Megafon geweint. Ich hab es aufgenommen. Für den Kanal. GROSS. 🎉'),
      ada('Oben ist ein Zimmer. Ein Bett, ein Ofen, ein leeres Blech. Und an der Wand: die andere Hälfte.', { picture: 'foto-benno' }),
      kr('Und am Ofen ein Kalender. Ein Tag ist eingekreist.', {
        card: { title: 'Kalenderblatt', text: 'Freitag – Lieferung an O.' },
        picture: 'kalenderblatt',
        choices: [
          ans('lieferung', 'Lieferung an O.?', 'Lieferung an O.? Wer ist O.?', [ada('Ortrud unterschreibt mit O., sagt Juna. Platz 1 auf ihrer Liste. Ich sage: Unsinn. Vielleicht.')]),
          ans('foto', 'Das Foto', 'Das Foto. Er hat seine Hälfte aufgehoben.', [ada('Zwanzig Jahre. An der Wand, neben dem Ofen. Meine Hälfte im Beweisfach. Seine jetzt auch.')]),
          ans('lupe', 'Lupe', 'Ich schau mir das Foto genauer an.', [kr('Auf dem Mehlsack, winzig: „Ada & Benno“. Dein B von damals war sein B. Zwei Finger, wette ich.')], { needs: 'lupe' }),
        ],
      }),
      kr('Freitag. Lieferung an O. Er hat kein O mehr. Jemand bekommt etwas von ihm. Wer ist O.?'),
    ],
  },
];
