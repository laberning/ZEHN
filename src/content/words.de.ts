// Kuratierter Wortschatz. Kleingeschrieben, solange die Großschreibung noch nicht gelernt ist.
// Jede Liste darf Wörter mit später gelernten Buchstaben enthalten (Vorrat für den ganzen Kurs); der Textgenerator
// nimmt für einen Text nur Wörter aus bereits gelernten Buchstaben. Je neuer Taste mindestens 3 Wörter.
// Bitte nur kindgerechte Wörter ergänzen.

/** Wörter nur aus a s d f g h j k l ö ä */
export const WORDS_GRUNDREIHE: readonly string[] = [
  'da', 'ja', 'ah', 'ha', 'als', 'all', 'das', 'dass', 'lass', 'fass', 'fall', 'hall',
  'hals', 'kahl', 'saal', 'aal', 'glas', 'gas', 'gag', 'half', 'lag', 'sag', 'sah', 'las',
  'kalk', 'skala', 'gala', 'salsa', 'alaska', 'kaff', 'falls', 'jagd', 'öl',
  'äh', 'hä', 'jäh', 'säg', 'kläff', 'lös', 'dös', 'ölfass',
];

/**
 * Wörter nur aus der Grundreihe und e i r u t z w o q p ü (Akt 2 „Obere Reihe“; die Grundreihe-Wörter kommen dazu).
 * Je neuer Taste mindestens 3 Wörter ohne spätere Tasten, auch für q (quer, qual, quiz …) und ü.
 */
export const WORDS_OBERE_REIHE: readonly string[] = [
  // e i
  'eis', 'sei', 'seil', 'teil', 'tief', 'lied', 'leid', 'leise', 'reise', 'eile', 'ziel', 'zeit', 'zelt', 'hier', 'tier', 'liegt', 'wie', 'sie', 'ihr',
  // r u
  'rauf', 'ruf', 'rufe', 'lauf', 'haus', 'laus', 'auf', 'aus', 'sauer', 'leider', 'gurt', 'luft', 'hut', 'gut', 'regal', 'gras', 'rakete', 'gerade',
  // t z
  'jetzt', 'salz', 'zahl', 'zitat', 'stall', 'tag', 'satt', 'glatt', 'zug', 'zeug', 'pizza', 'tal', 'stau',
  // w o
  'wolke', 'wolle', 'wiese', 'weg', 'wort', 'wal', 'tor', 'tore', 'oft', 'oder', 'ost', 'hotel', 'woher', 'ohr',
  // q p
  'quer', 'qual', 'quiz', 'quark', 'quitt', 'quelle', 'stopp', 'post', 'pass', 'pille', 'papa', 'pfeil', 'pause', 'tipp', 'pfote', 'puder',
  // ü
  'tür', 'türe', 'für', 'fürs', 'hüte', 'lüge', 'güte', 'tüte', 'süd', 'düse', 'kühl', 'führt', 'hütte', 'würde', 'wüste', 'pfütze', 'gürtel', 'lüfte',
];

/**
 * Wörter aus der Grundreihe, der oberen Reihe und n m c v b x y (Akt 3 „Untere Reihe“; die Wörter der früheren Listen kommen dazu).
 * Je neuer Buchstaben-Taste mindestens 3 Wörter ohne spätere Tasten, auch für y (baby, hobby, handy, party, pony, yoga, typ, system).
 * Komma, Punkt und Bindestrich stehen nicht in Wörtern: der Textgenerator hängt sie an (Satzzeichen in Übungstexten).
 */
export const WORDS_UNTERE_REIHE: readonly string[] = [
  // n m
  'nein', 'nase', 'nest', 'name', 'mama', 'mond', 'mann', 'mehr', 'meer', 'mut', 'nuss', 'nur', 'nie', 'nass', 'mal', 'mit', 'mein', 'nun', 'nett', 'neun',
  'komm', 'kommt', 'immer', 'sommer', 'hammer', 'honig', 'insel', 'lampe', 'minute', 'musik', 'mehl', 'melone', 'nagel', 'nadel', 'mantel', 'mund',
  // c ,
  'code', 'cola', 'clown', 'chef', 'rock', 'nacht', 'machen', 'lachen', 'kuchen', 'acht', 'licht', 'sache', 'schaf', 'schal', 'schuh', 'suche', 'computer', 'tochter',
  // v .
  'vanille', 'vase', 'vogel', 'vier', 'vor', 'viel', 'vater', 'vulkan', 'video', 'oval', 'klavier', 'november', 'verlauf', 'vorne', 'nervig',
  // b -
  'ball', 'bahn', 'baum', 'bett', 'bild', 'blau', 'brot', 'bus', 'buch', 'bein', 'besser', 'berg', 'bunt', 'bei', 'bonbon', 'bluse', 'boot', 'bank', 'bube',
  // x y
  'box', 'taxi', 'hexe', 'fix', 'axt', 'text', 'mixer', 'lexikon', 'baby', 'hobby', 'handy', 'party', 'pony', 'yoga', 'typ', 'system', 'yeti',
];

/**
 * Wörter für Akt 4 „Großschreibung“ (die Wörter der früheren Listen kommen dazu): ß-Wörter und Wörter mit Anfang ä, ö, ü, dazu Hauptwörter,
 * die beide Hände groß beginnen lassen. Die Liste bleibt kleingeschrieben und klein; der Textgenerator setzt den Großbuchstaben an den Wortanfang.
 * Je neuer Lerneinheit mindestens 3 Wörter: für eine Umschalttaste Wörter mit einem Buchstaben ihrer Hand am Anfang, für ß Wörter mit ß,
 * für die großen Umlaute Wörter, die mit ä, ö oder ü beginnen.
 */
export const WORDS_GROSSSCHREIBUNG: readonly string[] = [
  // ß
  'straße', 'groß', 'fuß', 'spaß', 'süß', 'weiß', 'heiß', 'soße', 'gruß', 'maß', 'fleißig', 'grüße', 'fußball', 'draußen', 'beißen',
  // Anfang ä ö ü
  'äpfel', 'ärger', 'ärmel', 'ähnlich', 'äste', 'öl', 'öfen', 'öfter', 'öffnen', 'übung', 'über', 'überall', 'üben', 'übermut',
  // Anfang mit der linken Hand (rechte Umschalttaste)
  'turm', 'treppe', 'tür', 'stadt', 'baron', 'benno', 'abend', 'wasser', 'zeitung', 'straßenbahn', 'ei', 'eis', 'dach', 'garten', 'fest', 'brief', 'vogel', 'clown', 'xaver', 'regen',
  // Anfang mit der rechten Hand (linke Umschalttaste)
  'juna', 'hupf', 'haus', 'kind', 'katze', 'lampe', 'mutter', 'nacht', 'insel', 'uhr', 'zug', 'plakat', 'obst', 'platz', 'markt', 'nebel', 'ofen', 'zimmer',
];

/**
 * Wörter für Akt 5 „Satzzeichen“ (die Wörter der früheren Listen kommen dazu): Fest- und Stadtwörter und Wörter mit Apostroph. Die Liste bleibt
 * kleingeschrieben. Die sechs Zeichen sind Satzzeichen (der Textgenerator hängt sie an Wörter, `domain/textGenerator.ts`), nur der Apostroph steht
 * im Wort; die Wort-Regel verlangt darum nur für ihn mindestens 3 Wörter (die Liste hat sieben).
 */
export const WORDS_SATZZEICHEN: readonly string[] = [
  // Apostroph-Wörter
  "geht's", "gibt's", "hab's", "ist's", "war's", "tut's", "mach's",
  // Fest und Stadt
  'fest', 'markt', 'bühne', 'musik', 'lampion', 'brezel', 'lautsprecher', 'durchsage', 'opa', 'oma', 'kuchen', 'tanz', 'kapelle', 'luftballon',
  'girlande', 'konfetti', 'trommel', 'stand', 'festzelt', 'rathaus', 'bürgermeisterin', 'publikum', 'mikrofon', 'plakat', 'lichterkette', 'eintritt',
];

/**
 * Akt 6 „Zahlen“ (Der Tresor): Hafen-, Lager- und Tresorwörter, kleingeschrieben und nur aus Buchstaben. Die Ziffern bilden im Übungstext
 * eigene Zahlengruppen (`domain/textGenerator.ts`) und brauchen kein Wort; die Wort-Regel nimmt sie aus.
 */
export const WORDS_ZAHLEN: readonly string[] = [
  // Hafen und Lager
  'hafen', 'pier', 'halle', 'tor', 'kiste', 'lager', 'regal', 'kran', 'anker', 'boot', 'welle', 'möwe', 'lieferwagen', 'karte', 'adresse', 'schild',
  // Tresor und Keller
  'tresor', 'schloss', 'rad', 'riegel', 'griff', 'tür', 'keller', 'maschine', 'röhre', 'staub', 'gold', 'glitzer',
  // Spurenwand und Lieferbuch
  'nadel', 'faden', 'zettel', 'buch', 'seite', 'konto', 'liste', 'stempel', 'markt', 'uhr', 'preis', 'nummer', 'code', 'zahl', 'finger',
];

/**
 * Akt 7 „Sonderzeichen“ (Das Finale): Laden-, Maschinen- und Festwörter, kleingeschrieben und nur aus Buchstaben. Die Sonderzeichen
 * (`@ € { } [ ] \ ~ |`) kommen über ihre Rollen im Übungstext (`domain/textGenerator.ts`) und brauchen kein Wort; die Wort-Regel nimmt sie aus.
 */
export const WORDS_SONDERZEICHEN: readonly string[] = [
  // Ottis Laden
  'laden', 'lolli', 'tresen', 'regal', 'kasse', 'glocke', 'schlüssel', 'preis', 'stempel', 'liste', 'adresse', 'stadt',
  // Maschinen und Keller
  'maschine', 'kabel', 'stecker', 'strom', 'keller', 'treppe', 'röhre', 'motor', 'schalter', 'befehl', 'folge', 'plan',
  // Fest und Finale
  'fest', 'rede', 'tanz', 'leiter', 'schild', 'kurort', 'finale', 'lehrer', 'schüler', 'anfang', 'finger', 'glas',
];
