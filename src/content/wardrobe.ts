// Garderobe: Auswahl für den Avatar. Teile und Farbpakete mit Quelle werden freigespielt (Abzeichen, Geschichte, Rang);
// ohne Quelle ist etwas von Anfang an frei. Quelle = stillgelegte Szene heißt: für einen späteren Akt zurückgelegt
// (Shorts und Sonnenbrille waren es bis Akt 2, Leggings und Faltstiefel bis Akt 3, Melone, Agentenlook und Nadelstreifen bis Akt 4, Bob und Strubbelig bis Akt 5, Agentenstiefel bis Akt 7);
// inzwischen hat jedes dieser Teile seine neue Quelle, nur die alten Meldungen sind noch stillgelegt.
// Farbnamen sind Varianten der LPC-Paletten (siehe lpc.generated.json).

import type { Avatar, Gender } from '../domain/profile.ts';
import { wardrobeItems, type ColorPack, type WardrobeCatalog, type WardrobeItem } from '../domain/wardrobe.ts';

export const SKIN_TONES = ['light', 'amber', 'olive', 'taupe', 'bronze', 'brown', 'black'];
// natürliche Haarfarben zuerst (frei), dann die bunten
export const HAIR_COLORS = ['black', 'dark_brown', 'chestnut', 'light_brown', 'blonde', 'platinum', 'redhead', 'gray', 'red', 'purple', 'blue', 'green', 'pink', 'gold', 'sandy'];
export const EYE_COLORS = ['brown', 'blue', 'green', 'gray', 'purple', 'yellow'];
// Stoff-Farben in Abschnitten, so wie die Garderobe sie zeigt: Grundfarben (frei), dann je Farbpaket vier Farben mit einem Thema
// („Gold“ bringt nur eine: Leder; seine übrigen Farben sind Haare und Augen).
// Aus der LPC-Palette noch frei: walnut (Braunton) und bluegray (eigentlich ein dunkles Graugrün).
export const CLOTH_COLORS = [
  ...['white', 'gray', 'black', 'navy', 'blue', 'red', 'green', 'yellow', 'brown'],
  ...['sky', 'teal', 'pink', 'lavender'], // Frühling: hell und frisch
  ...['orange', 'tan', 'rose', 'maroon'], // Herbst: Laub
  ...['slate', 'charcoal', 'purple', 'forest'], // Nacht: dunkel
  'leather', // Gold: das Leder zum Gold in Haar und Blick
];

export const HAIR_STYLES: WardrobeItem[] = [
  { id: 'long', name: 'Lang', parts: ['hair-long'] },
  { id: 'bob', name: 'Bob', parts: ['hair-bob'], source: { badge: 'satzzeichen' } },
  { id: 'plain', name: 'Kurz', parts: ['hair-plain'] },
  { id: 'messy', name: 'Strubbelig', parts: ['hair-messy'], source: { scene: 'a5-gift-strubbelig' } },
  // Alltagsfrisuren für jeden Haartyp – von Anfang an frei
  { id: 'curly', name: 'Locken', parts: ['hair-curly'] },
  { id: 'afro', name: 'Afro', parts: ['hair-afro'] },
  { id: 'natural', name: 'Kraus', parts: ['hair-natural'] },
  { id: 'cornrows', name: 'Cornrows', parts: ['hair-cornrows'] },
  { id: 'twists', name: 'Twists', parts: ['hair-twists'] },
  { id: 'dreads', name: 'Dreadlocks', parts: ['hair-dreads'] },
  { id: 'braid', name: 'Zopf', parts: ['hair-braid'] },
  { id: 'ponytail', name: 'Pferdeschwanz', parts: ['hair-ponytail'] },
  // Stil-Frisuren zum Freispielen
  { id: 'spiked', name: 'Stachelfrisur', parts: ['hair-spiked'], source: { scene: 'rank-geheimagent' } },
  { id: 'curlylong', name: 'Locken lang', parts: ['hair-curly-long'], source: { scene: 'rank-meisterhacker' } },
];

export const OUTFITS: WardrobeItem[] = [
  { id: 'tshirt', name: 'T-Shirt', parts: ['shirt-tshirt'] },
  { id: 'polo', name: 'Polo', parts: ['shirt-polo'], source: { scene: 'gift-polo' } },
  { id: 'longsleeve', name: 'Langarmshirt', parts: ['shirt-longsleeve'] },
  { id: 'cardigan', name: 'Strickjacke', parts: ['shirt-cardigan'], source: { badge: 'serie-3' } },
  { id: 'agent', name: 'Agentenlook', parts: ['shirt-longsleeve', 'necktie'], fixedColors: { necktie: 'red' }, source: { badge: 'grossschreibung' } },
  { id: 'vest', name: 'Weste', parts: ['shirt-longsleeve', 'vest-buttoned'], fixedColors: { 'shirt-longsleeve': 'white' }, source: { scene: 'gift-weste' } },
];

export const PANTS: WardrobeItem[] = [
  { id: 'jeans', name: 'Jeans', parts: ['pants'] },
  { id: 'shorts', name: 'Shorts', parts: ['pants-shorts'], source: { scene: 'a2-gift-shorts' } },
  { id: 'skirt', name: 'Rock', parts: ['skirt'] },
  { id: 'cuffed', name: 'Krempelhose', parts: ['pants-cuffed'], source: { badge: 'tastsinn' } },
  { id: 'leggings', name: 'Leggings', parts: ['leggings'], source: { badge: 'untere-reihe' } },
  { id: 'striped', name: 'Nadelstreifen', parts: ['pants-striped'], source: { scene: 'a4-gift-nadelstreifen' } },
];

export const SHOES: WardrobeItem[] = [
  { id: 'shoes', name: 'Schuhe', parts: ['shoes'] },
  { id: 'sneaker', name: 'Turnschuhe', parts: ['shoes-revised'] },
  // Sandalen: mit Akt 6 eine neue Quelle (Juna nach dem Einsatz); wer sie über die stillgelegte Szene `badge-tempo-100` schon hat, behält sie
  { id: 'sandals', name: 'Sandalen', parts: ['sandals'], source: { scene: 'a6-gift-sandalen' } },
  { id: 'boots', name: 'Faltstiefel', parts: ['boots-fold'], source: { scene: 'a3-gift-faltstiefel' } },
  { id: 'minerboots', name: 'Grubenstiefel', parts: ['boots-basic'], source: { scene: 'a3-gift-grubenstiefel' } },
  { id: 'agentboots', name: 'Agentenstiefel', parts: ['boots-rim'], source: { scene: 'a7-gift-agentenstiefel' } }, // Akt 7; die alte Meldung `badge-drei-sterne` ist stillgelegt
];

export const GLASSES: WardrobeItem[] = [
  { id: 'none', name: 'Ohne', parts: [] },
  // Für Kinder, die eine Brille tragen – von Anfang an frei
  { id: 'round', name: 'Runde Brille', parts: ['glasses-round'] },
  { id: 'nerd', name: 'Hornbrille', parts: ['glasses-nerd'], source: { badge: 'entschluesselt' } },
  { id: 'sun', name: 'Sonnenbrille', parts: ['glasses-sun'], source: { badge: 'obere-reihe' } },
  { id: 'shades', name: 'Agentenbrille', parts: ['glasses-shades'], source: { badge: 'grundreihe' } },
  // Akt 7: Augenklappe zum Abzeichen „Sonderzeichen gesichert“ (Brille oder Klappe, eins zur Zeit)
  { id: 'eyepatch', name: 'Augenklappe', parts: ['eyepatch'], source: { badge: 'sonderzeichen' } },
];

export const HEADWEAR: WardrobeItem[] = [
  { id: 'none', name: 'Ohne', parts: [] },
  { id: 'headband', name: 'Stirnband', parts: ['headband'], source: { scene: 'gift-stirnband' } },
  { id: 'headscarf', name: 'Kopftuch', parts: ['bandana'], source: { scene: 'a3-gift-kopftuch' } },
  { id: 'cap', name: 'Lederkappe', parts: ['cap-leather'], source: { scene: 'a2-side-juna-2' } },
  { id: 'bowler', name: 'Melone', parts: ['bowler'], source: { scene: 'a4-gift-melone' } },
  // Akt 7: Dreispitz (Juna)
  { id: 'tricorne', name: 'Dreispitz', parts: ['tricorne'], source: { scene: 'a7-gift-dreispitz' } },
];

/** Zubehör zusätzlich zur Kleidung, eins zur Zeit; die Garderobe zeigt die Zeile erst, wenn es ein Teil außer „Ohne“ gibt */
export const ACCESSORIES: WardrobeItem[] = [
  { id: 'none', name: 'Ohne', parts: [] },
  { id: 'scarf', name: 'Schal', parts: ['scarf'], source: { scene: 'a2-gift-schal' } },
  { id: 'necktie', name: 'Krawatte', parts: ['necktie'], source: { scene: 'a4-gift-krawatte' } },
  { id: 'bowtie', name: 'Fliege', parts: ['bowtie'], source: { scene: 'a4-gift-fliege' } },
  { id: 'belt', name: 'Gürtel', parts: ['belt'], source: { scene: 'a5-gift-guertel' } },
  { id: 'suspenders', name: 'Hosenträger', parts: ['suspenders'], source: { scene: 'a5-gift-hosentraeger' } },
  // Akt 6: Epauletten (Ada), Manschetten („???“) und Hohe Socken (Abzeichen „Zahlen gesichert“); die Socken liegen unter Hose und Schuhen
  { id: 'epaulets', name: 'Epauletten', parts: ['epaulets'], source: { scene: 'a6-gift-epauletten' } },
  { id: 'cuffs', name: 'Manschetten', parts: ['cuffs'], source: { scene: 'a6-gift-manschetten' } },
  { id: 'socks', name: 'Hohe Socken', parts: ['socks-high'], source: { badge: 'zahlen' } },
  // Akt 7: Umhang (Benno), färbbar in der Kleiderfarbe
  { id: 'cape', name: 'Umhang', parts: ['cape'], source: { scene: 'a7-gift-umhang' } },
];

/** Farbpakete: ihre Farben sind gesperrt, bis man das Paket hat. Jede Stoff-Farbe steckt in höchstens einem Paket. */
export const COLOR_PACKS: ColorPack[] = [
  { id: 'colors-fresh', name: 'Farbpaket „Frühling“', source: { scene: 'rank-anwaerter' }, colors: { cloth: ['sky', 'teal', 'pink', 'lavender'] } },
  { id: 'colors-neon', name: 'Farbpaket „Neon“', source: { scene: 'rank-agent' }, colors: { hair: ['red', 'purple', 'blue', 'green', 'pink'], eye: ['purple'] } },
  { id: 'colors-autumn', name: 'Farbpaket „Herbst“', source: { scene: 'rank-spezialagent' }, colors: { cloth: ['orange', 'tan', 'rose', 'maroon'] } },
  { id: 'colors-night', name: 'Farbpaket „Nacht“', source: { scene: 'a5-gift-nacht' }, colors: { cloth: ['slate', 'charcoal', 'purple', 'forest'] } },
  { id: 'colors-gold', name: 'Farbpaket „Gold“', source: { scene: 'a7-gift-gold' }, colors: { hair: ['gold', 'sandy'], eye: ['yellow'], cloth: ['leather'] } },
];

export function defaultAvatar(gender: Gender = 'w'): Avatar {
  const outfitColor = 'blue';
  return {
    gender,
    skin: 'light',
    hairStyle: gender === 'w' ? 'long' : 'plain',
    hairColor: 'dark_brown',
    eyeColor: 'blue',
    outfit: 'tshirt',
    outfitColor,
    pants: 'jeans',
    pantsColor: 'navy',
    shoes: 'shoes',
    shoesColor: 'black',
    glasses: 'none',
    head: 'none',
    // die Kopfbedeckung startet in der Farbe des Oberteils
    headColor: outfitColor,
    accessory: 'none',
    // das Zubehör startet ebenfalls in der Farbe des Oberteils
    accessoryColor: outfitColor,
  };
}

export const WARDROBE: WardrobeCatalog = {
  skinTones: SKIN_TONES,
  hairColors: HAIR_COLORS,
  eyeColors: EYE_COLORS,
  clothColors: CLOTH_COLORS,
  hairStyles: HAIR_STYLES,
  outfits: OUTFITS,
  pants: PANTS,
  shoes: SHOES,
  glasses: GLASSES,
  headwear: HEADWEAR,
  accessories: ACCESSORIES,
  colorPacks: COLOR_PACKS,
  defaultAvatar,
};

export const ALL_ITEMS: WardrobeItem[] = wardrobeItems(WARDROBE);
export const SPECIAL_ITEMS: WardrobeItem[] = ALL_ITEMS.filter((i) => i.source);
