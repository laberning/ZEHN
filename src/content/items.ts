// Dinge der Akte: Gadgets im Agentenkoffer, Kleidung und Farbpakete der Garderobe.
// Jedes Ding hat genau eine Quelle (Abzeichen, Szene oder Fall) für Hinweise; besitzen tut man es, sobald die Szene
// mit `gives` es überreicht hat (Paket, Geschenk der Geschichte, Rang) bzw. der Fall gelöst ist.

import type { Item } from '../domain/items.ts';
import type { ColorPack } from '../domain/wardrobe.ts';
import { COLOR_NAMES } from './texts/wardrobe.ts';
import { COLOR_PACKS, SPECIAL_ITEMS } from './wardrobe.ts';

const gadget = (id: string, name: string, description: string, source: Item['source'], pieces?: Item['pieces']): Item => ({ id, name, kind: 'gadget', description, source, ...(pieces && { pieces }) });

const GADGETS: readonly Item[] = [
  // Story-Gadgets: die Hauptgeschichte verschenkt sie selbst, bevor sie sie erwähnt
  gadget('dechiffrierscheibe', 'Dechiffrierscheibe', 'Hat schon Frau Hubbel gehört, Adas Lehrerin. Hilft beim Entschlüsseln von Karten.', { scene: 'l3-brief' }),
  gadget('beweisfach', 'Beweisfach', 'Krümels Fach für Beweisstücke. Erstes Stück: eine entzückende Feder.', { scene: 'l5-s75' }, [
    { id: 'feder', name: 'Die Feder', text: 'Von einem sehr eleganten Hut. Krümel hat sie gefunden.', picture: 'feder', scene: 'l5-s75' },
    { id: 'halbes-foto', name: 'Das halbe Foto', text: 'Ada, vor langer Zeit. Neben ihr war jemand.', picture: 'halbes-foto', scene: 'exam-after-foto' },
    // Akt 2: Beweisstücke von den Dächern und aus dem Einsatz
    { id: 'monokel', name: 'Das Monokel-Glas', text: 'Rund, mit Goldrand, aus dem Elsternest. Wer trägt heute noch ein Monokel?', picture: 'elsternest', scene: 'a2-l2-s50' },
    { id: 'elsterfeder', name: 'Die Elsterfeder', text: 'Schwarz-weiß und frech. Hing in Krümels Rotor.', picture: 'rotor-75', scene: 'a2-l2-s75' },
    { id: 'fahrkarte', name: 'Die Fahrkarte', text: 'Eine U-Bahn-Fahrkarte. Darauf: „Unten, wo die Stadt sich erinnert.“', picture: 'fahrkarte', scene: 'a2-exam-after' },
    // Akt 3: Beweisstücke aus dem Untergrund und von der Karte nach dem Einsatz
    { id: 'fahrplan', name: 'Ortruds Fahrplan', text: 'Handgeschrieben. Ein Halt, den kein Plan kennt: „S. (nur mit Karte)“. Unterschrift: „O.“', picture: 'fahrplan', scene: 'a3-l2-s25' },
    { id: 'notizbuch', name: 'Bennos Notizbuch', text: 'Von heute, aus der Ladestation. „Neues Gerät bekommen. Das zweite. Geschenkt!“', picture: 'notizbuch', scene: 'a3-l3-s50' },
    { id: 'keks-gruss', name: 'Hallo Keks', text: 'Karte ohne Absender. Krümel hat sie auf dem alten Kanal bekommen. „Lange nicht gesehen.“', picture: 'keks-gruss', scene: 'a3-exam-after' },
    // Akt 4: Beweisstücke aus der kleingemachten Stadt und aus dem Turm
    { id: 'zeitung', name: 'Der Qwertzer Bote', text: 'Die Titelseite: „Bad Qwertz ohne große Buchstaben“. Kringel hat sie gebracht.', picture: 'zeitung', object: 'm4-l1', scene: 'a4-l1-s25' },
    { id: 'plakat', name: 'Bennos Plakat', text: 'GROSSE KLEINMACHUNG. Unterzeichnet: B. v. B. Ganz unten, winzig: „Ausgenommen: ich.“', picture: 'plakat', object: 'm4-l2', scene: 'a4-l2-done' },
    { id: 'foto-benno', name: 'Die andere Hälfte des Fotos', text: 'Aus dem Turmzimmer. Ein junger Benno mit einem Mehlsack. Passt an Adas Hälfte.', picture: 'foto-benno', scene: 'a4-exam-after' },
    { id: 'kalenderblatt', name: 'Das Kalenderblatt', text: 'Am Ofen im Turm. Ein Tag eingekreist: „Freitag – Lieferung an O.“ Am Rand, klein: 4 7 6 5.', picture: 'kalenderblatt', scene: 'a4-exam-after' },
    // Akt 5: Beweisstücke aus dem Tiefpunkt (Junas Beitrag, der Chip, das Skript) und die Karte aus dem Chip
    { id: 'junas-post', name: 'Junas Beitrag', text: 'Ein Ausdruck: „GEHEIME ORGANISATION, UNTER DER BACKSTUBE. ECHT!!!“ 400 Likes.', picture: 'junas-post', scene: 'a5-l1-s25' },
    { id: 'booster-chip', name: 'Der Booster-Chip', text: 'Ein Plättchen mit Antenne, saß unter Krümels Aufkleber. Es summt nicht mehr.', picture: 'booster-chip', scene: 'a5-l3-s50' },
    { id: 'durchsage-skript', name: 'Das Durchsage-Skript', text: 'Hupfs Skript für die Stadtlautsprecher, mit allen Zeichen. Deinen.', picture: 'durchsage-skript', object: 'm5-l3', scene: 'a5-l3-done' },
    { id: 'signal-karte', name: 'Signal von: O.', text: 'Aus dem Speicher des Chips. Mehr steht nicht drauf.', picture: 'signal-karte', scene: 'a5-exam-after' },
    // Akt 6: Beweisstücke aus dem leeren Lager, von der Spurenwand, aus dem Lieferbuch und das lose Blatt nach dem Einsatz
    { id: 'goldstaub', name: 'Die Tüte Goldstaub', text: 'Vom Boden in Halle 7, für die Akte eingetütet. Darin ein Fußabdruck. Klein. Mit Absatz.', picture: 'goldstaub', scene: 'a6-l2-s25' },
    { id: 'feind-karte', name: 'Der Feind meines Feindes', text: 'Goldrand, aus dem Briefkasten der Backstube: „… ist noch kein Freund. Aber ein Anfang.“', picture: 'feind-karte', scene: 'a6-l2-done' },
    { id: 'spurenwand-nadel', name: 'Die Nadel „Marktplatz 10“', text: 'Die letzte Nadel an der Spurenwand. Alle Fäden enden bei TIPPNIX.', picture: 'spurenwand-nadel', object: 'm6-l3', scene: 'a6-l3-done' },
    { id: 'lieferbuch', name: 'Ottis Lieferbuch', text: 'Der blaue Durchschlag: „Mein Konto bei O.“ Seite 9: SCHILD-O, Menge: eins.', picture: 'lieferbuch', object: 'm6-l4', scene: 'a6-l4-done' },
    { id: 'lieferblatt', name: 'Das Lieferblatt', text: 'Lag lose ganz hinten im Lieferbuch: „Maschine 4: lernt selbst. Lehrer: gesucht.“', picture: 'lieferblatt', scene: 'a6-exam-after' },
    // Akt 7: Beweisstücke aus Ottis Laden, vom Schaltplan und aus der Zeit nach dem Duell
    { id: 'preisliste', name: 'Ottis Preisliste', text: 'Für Bürgermeister: drei Städte, drei Preise. Unten, ohne Preis: Zehn Finger, frisch.', picture: 'preisliste', object: 'm7-l1', scene: 'a7-l1-s25' },
    { id: 'abdruck', name: 'Junas Daumen', text: 'Vom Lieferblatt, unter „Lehrer“. Klein, nicht Ottis. Junas, vom Werbefoto.', picture: 'abdruck', scene: 'a7-l1-s75' },
    { id: 'schaltplan', name: 'Der Schaltplan', text: 'Vier Maschinen, vier Stromkreise. Der vierte führt zu unserem Chat.', picture: 'schaltplan', object: 'm7-l2', scene: 'a7-l2-done' },
    { id: 'zylinder', name: 'Der Ersatz-Zylinder', text: 'Aus Ottis Laden, mit Preisschild. Benno wollte ihn nicht zurück. Krümel schon. Als Beweis.', picture: 'zylinder', scene: 'a7-l3-s25' },
    { id: 'foto-ganz', name: 'Das ganze Foto', text: 'Ada und Benno, beide Hälften. Zwanzig Jahre lagen dazwischen. Jetzt ein Fach.', picture: 'foto-ganz', scene: 'a7-exam-after' },
    { id: 'lieferwagen', name: 'TIPPNIX – Nie wieder', text: 'Ottis Lieferwagen beim Abfahren. Der Rest des Schriftzugs ist ihr abgefallen.', picture: 'lieferwagen', scene: 'a7-exam-after' },
  ]),
  // Akt 2: Krümel und Ada übergeben sie in den Haupt-Szenen der Aufträge 2 und 5
  gadget('fernglas', 'Fernglas', 'Aus zwei Marmeladengläsern. Du siehst den Turm, er dich nicht.', { scene: 'a2-l2-brief' }),
  gadget('verkleidungskoffer', 'Verkleidungskoffer', 'Adas alter Koffer: Pizzabote, Gärtner, Zahnfee. Such dir was aus.', { scene: 'a2-l5-brief' }),
  // Akt 3: Ortrud (über Juna) und Krümel übergeben sie in den Haupt-Szenen der Aufträge 2, 3 und 5
  gadget('tunnel-karte', 'Tunnel-Karte', 'Von Ortrud, handgezeichnet, mit „O.“. Zeigt Räume, die auf keinem Plan stehen.', { scene: 'a3-l2-done' }),
  gadget('grubenlampe', 'Grubenlampe', 'Aus einer Fahrradlampe und viel Klebeband. Leuchtet in dunkle Ecken.', { scene: 'a3-l3-brief' }),
  gadget('flow-chip', 'Flow-Chip', 'Krümels Bau: Fehler leuchten nur rot, du tippst einfach weiter.', { scene: 'a3-l5-done' }),
  // Akt 4: Krümel übergibt sie im Briefing von Auftrag 1
  gadget('shift-handschuhe', 'Shift-Handschuhe', 'Krümels Bau: Sie merken sich, welche Hand die Umschalttaste hält.', { scene: 'a4-l1-brief' }),
  // Akt 5: Ada übergibt es im Briefing von Auftrag 2
  gadget('notfunk', 'Notfunkgerät', 'Sendet an Krümel vorbei an allem, was ihm jemand aufgeklebt hat.', { scene: 'a5-l2-brief' }),
  // Akt 6: „???“ übergibt es in Auftrag 4 bei 50 % (die Kennung `monokel` trägt seit Akt 2 das Beweisstück „Das Monokel-Glas“)
  gadget('bennos-monokel', 'Bennos Monokel', 'Zeigt Goldstaub, Lieferbücher und alles, was glitzert. Wenn man hinsieht.', { scene: 'a6-l4-s50' }),
  // Akt 7: Ada übergibt es im Briefing von Auftrag 2 (von Frau Hubbel)
  gadget('blindflug-brille', 'Blindflug-Brille', 'Gläser schwarz, Blick nach vorn. Wer die Tasten nicht sieht, sucht sie nicht. Von Frau Hubbel.', { scene: 'a7-l2-brief' }),
  // Spezial-Gadgets: Krümel baut sie aus deinen Spielhallen-Erfolgen und öffnen Extra-Fälle
  gadget('buchstabenkescher', 'Buchstabenkescher', 'Fängt Buchstaben, die herumfliegen. Kommt öfter vor, als man denkt.', { badge: 'spielhalle' }),
  gadget('stethoskop', 'Stethoskop', 'Damit hörst du Schlösser flüstern.', { badge: 'tresorknacker' }),
  gadget('rotlicht-lampe', 'Rotlicht-Lampe', 'Macht unsichtbare Tinte sichtbar. Gegen Monster unterm Bett hilft sie nicht.', { badge: 'regenmacher' }),
  // Fall-Gadgets: Belohnung für einen Extra-Fall, zahlen sich im Einsatz und danach aus
  gadget('blasenwerfer', 'Blasenwerfer', 'Aus dem Rest der Blasenmaschine im Brunnen. Für Ablenkungsmanöver. Und Geburtstage.', { case: 'seifenblasen-brunnen' }),
  gadget('lupe', 'Kringels Lupe', 'Für Briefmarken. Und für Detektive.', { case: 'kringels-briefkasten' }),
  gadget('walkie-talkie', 'Walkie-Talkie', 'Junas Dankeschön für die Liste. Damit kann Juna dich nerven.', { case: 'junas-liste' }),
  gadget('tunnel-megafon', 'Tunnel-Megafon', 'Aus Ortruds altem Zuglautsprecher. Damit hört dich der ganze Untergrund.', { case: 'verschluckte-durchsage' }),
];

/**
 * Was zur Übergabe gesagt wird: Zettel im Paket bzw. bei Geschenken der Satz von Ada oder Krümel.
 * Die Teile, die für spätere Akte zurückgelegt waren (Shorts, Sonnenbrille, Leggings, Faltstiefel, Agentenlook, Melone,
 * Nadelstreifen, Bob, Strubbelig, Agentenstiefel), haben alle eine neue Quelle; ihr Zettel wurde mit ihr angepasst.
 */
const NOTES: Record<string, string> = {
  cuffed: 'Backstubenlook. Damit fällst du bei Ada nicht auf.',
  nerd: 'Für Leute, die Karten entziffern.',
  cardigan: 'Drei Agententage schon. Dafür hab ich dir was gestrickt. Sag nichts zur Farbe.',
  striped: 'Für Agenten mit Ausdauer. Und Stil.',
  agent: 'Für Agenten, die groß schreiben.',
  necktie: 'Große Buchstaben tragen Krawatte. Die hier ist von meiner Prüfung. Meiner eigenen. Zieh sie an.',
  bowtie: 'Vom Kiosk, fürs Stadtfest: eine FLIEGE. Unverkäuflich, sagt Mama. Also deine. Steht dir.',
  leggings: 'Beweglich genug für enge Schächte.',
  boots: 'Faltstiefel, aus Frau Hubbels Schrank. Sie sagt: Wer sauber tippt, hat saubere Stiefel.',
  headscarf: 'Im Tunnel staubt es. Zieh das über. Mein Kopftuch von damals. Es hat alles gesehen. Ich nicht.',
  minerboots: 'Festes Schuhwerk für nasse Gänge. Die hat Ada damals getragen. Zu groß für sie. Dir passen sie.',
  agentboots: 'Von Frau Hubbel: Agentenstiefel. Fürs Finale, sagt sie. So weit getippt: Das verdient Stiefel.',
  sun: 'Oben ist es hell. Sehr hell.',
  shades: 'Die bekommt nur, wer die Firewall wirklich gehalten hat.',
  shorts: 'Aus Adas Fundus: Shorts. Für Leute, die schnell über Dächer laufen. Ada sagt, sie trug sie nie. Hm.',
  scarf: 'Auf dem Dach weht es. Wickel dich ein.',
  cap: 'Vom Kiosk. Unverkäuflich, sagt Mama. Also geschenkt. Hält den Wind aus den Ohren. Auf dem Dach.',
  sandals: "Vom Kiosk: SANDALEN. Für flinke Füße und kühle Zehen. Mama sagt, im Tresor zieht's nicht. Egal.",
  bob: 'Kurz, praktisch, ohne Komma.',
  messy: 'Vom Kiosk: die Strubbel-Frisur. Wer Zeichen setzt, darf zerzaust sein. Mama sagt, das ist Mode.',
  belt: 'Ein Gürtel. Damit hält alles zusammen, auch Sätze. Der war von meiner ersten Uniform. Zieh ihn an.',
  suspenders: 'Hosenträger. Ada trägt auch welche. Sagt sie. Ich habe sie nie gesehen. Du trägst sie sichtbar.',
  epaulets: 'Epauletten. Für alle, die zählen können. Die Sterne hab ich abgemacht. Du zählst nur mit dir.',
  cuffs: 'Manschetten, meine Lieben. Nicht gestohlen: gekauft. Quittung anbei. Rechnen mit sauberen Ärmeln.',
  socks: 'Für den Tresorraum, es zieht.',
  polo: 'Und fürs Ausweisfoto: ein Polo. Mit Kragen siehst du seriöser aus.',
  headband: 'Juna hat was für dich am Kiosk abgegeben: ein Stirnband. „Gegen Tippschweiß.“',
  vest: 'Wer Schilder rettet, darf Weste tragen. Hemd weiß, Farbe der Weste suchst du aus.',
  bowler: 'Gegen einen Zylinder hilft nur eine Melone. Die war mal von meiner Lehrerin.',
  spiked: 'Geheimagenten erkennt man nicht. Außer an der Frisur.',
  curlylong: 'Für Meisterhacker: so viele Locken wie Ideen.',
  cape: 'Umhang. Fürs Finale darf es dramatisch sein. Meiner war weinrot. Deiner ist, was du willst.',
  tricorne: 'Vom Kiosk: ein DREISPITZ. Der Abenteuerhut der Sonderzeichen. Stand seit Jahren rum. Jetzt nicht.',
  eyepatch: 'Blindflug-Training, Stufe zwei. Ein Auge reicht.',
};

/** Zettel eines Farbpakets aus seinen Farben (eine Quelle für Namen und Zettel) */
function packNote(pack: ColorPack): string {
  const names = (m: 'hair' | 'eye' | 'cloth') => (pack.colors[m] ?? []).map((c) => COLOR_NAMES[m][c] ?? c).join(', ');
  const parts = [pack.colors.cloth && `${names('cloth')} – für Kleidung.`, pack.colors.hair && `Haare in ${names('hair')}.`, pack.colors.eye && `Augen in ${names('eye')}.`];
  return parts.filter(Boolean).join(' ');
}

/** Kleidung zum Freispielen: Teile mit Quelle und Farbpakete */
export const CLOTH: readonly Item[] = [
  ...SPECIAL_ITEMS.map((w): Item => ({ id: w.id, name: w.name, kind: 'cloth', description: NOTES[w.id] ?? '', source: w.source! })),
  ...COLOR_PACKS.map((p): Item => ({ id: p.id, name: p.name, kind: 'cloth', description: packNote(p), source: p.source })),
];

export const ITEMS: readonly Item[] = [...GADGETS, ...CLOTH];

/** Beschreibung eines Dings – für Szenen, die sie wörtlich zitieren (eine Quelle für beide Stellen) */
export function itemDescription(id: string): string {
  const item = ITEMS.find((i) => i.id === id);
  if (!item) throw new Error(`Unbekanntes Ding: ${id}`);
  return item.description;
}
