// Figuren als LPC-Ebenen: Avatar aus der Garderobe, Ada, der Baron (und Benno), Juna und Frau Hubbel.

import type { WardrobeCatalog, WardrobeItem } from '../../domain/wardrobe.ts';
import type { Avatar } from '../../domain/profile.ts';
import type { CharacterSpec, LayerSpec } from './compose.ts';

/** Ebenen des Avatars. Gespeicherte Avatare sind beim Laden geprüft; unbekannte Teile werden ersetzt oder weggelassen. */
export function avatarSpec(a: Avatar, w: WardrobeCatalog): CharacterSpec {
  const skin = { body: a.skin };
  const outfit = w.outfits.find((o) => o.id === a.outfit) ?? w.outfits[0]!;
  const partsOf = (list: readonly WardrobeItem[], id: string) => (list.find((i) => i.id === id) ?? list[0]!).parts;
  const layers: LayerSpec[] = [
    { part: 'body', colors: skin },
    { part: a.gender === 'w' ? 'head-female' : 'head-male', colors: { ...skin, eye: a.eyeColor } },
    ...partsOf(w.shoes, a.shoes).map((part) => ({ part, colors: { cloth: a.shoesColor } })),
    ...partsOf(w.pants, a.pants).map((part) => ({ part, colors: { cloth: a.pantsColor } })),
    ...outfit.parts.map((part) => ({ part, colors: { cloth: outfit.fixedColors?.[part] ?? a.outfitColor } })),
    ...(w.hairStyles.find((h) => h.id === a.hairStyle)?.parts ?? []).map((part) => ({ part, colors: { hair: a.hairColor } })),
    ...(w.glasses.find((g) => g.id === a.glasses)?.parts ?? []).map((part) => ({ part })),
    ...(w.headwear.find((h) => h.id === a.head)?.parts ?? []).map((part) => ({ part, colors: { cloth: a.headColor } })),
    // das Zubehör liegt über dem Oberteil (Schal: z-Reihenfolge im Sheet)
    ...(w.accessories.find((x) => x.id === a.accessory)?.parts ?? []).map((part) => ({ part, colors: { cloth: a.accessoryColor } })),
  ];
  return { bodyType: 'teen', layers };
}

/** Ada: Bäckerin und Chefin der ZEHN, mittleres Alter (Bennos Tante), hellbrauner Dutt, runde Brille, Schürze; nicht als alte Frau (das ist Frau Hubbel) */
export const ADA: CharacterSpec = {
  bodyType: 'female',
  layers: [
    { part: 'body', colors: { body: 'light' } },
    { part: 'head-female', colors: { body: 'light', eye: 'blue' } },
    { part: 'shoes', colors: { cloth: 'brown' } },
    { part: 'pants', colors: { cloth: 'charcoal' } },
    { part: 'shirt-longsleeve', colors: { cloth: 'purple' } },
    { part: 'apron' },
    { part: 'hair-bun', colors: { hair: 'light_brown' } },
    { part: 'glasses-round' },
  ],
};

/** Juna vom Kiosk: so alt wie die Spielfigur, rote Haare, gelbes Shirt */
export const JUNA: CharacterSpec = {
  bodyType: 'teen',
  layers: [
    { part: 'body', colors: { body: 'amber' } },
    { part: 'head-female', colors: { body: 'amber', eye: 'green' } },
    { part: 'shoes-revised', colors: { cloth: 'white' } },
    { part: 'pants-shorts', colors: { cloth: 'navy' } },
    { part: 'shirt-tshirt', colors: { cloth: 'yellow' } },
    { part: 'hair-messy', colors: { hair: 'redhead' } },
  ],
};

/** Frau Hubbel, Adas alte Lehrerin und Hüterin des Archivs: grauer Dutt, runde Brille, dunkelblaue Bluse */
export const HUBBEL: CharacterSpec = {
  bodyType: 'female',
  layers: [
    { part: 'body', colors: { body: 'light' } },
    { part: 'head-elderly', colors: { body: 'light', eye: 'gray' } },
    { part: 'shoes', colors: { cloth: 'black' } },
    { part: 'pants', colors: { cloth: 'charcoal' } },
    { part: 'shirt-longsleeve', colors: { cloth: 'navy' } },
    { part: 'hair-bun', colors: { hair: 'gray' } },
    { part: 'glasses-round' },
  ],
};

export const BARON: CharacterSpec = {
  bodyType: 'male',
  layers: [
    { part: 'cape', colors: { cloth: 'maroon' } },
    { part: 'body', colors: { body: 'light' } },
    { part: 'head-male', colors: { body: 'light', eye: 'gray' } },
    { part: 'shoes', colors: { cloth: 'black' } },
    { part: 'pants-formal', colors: { cloth: 'black' } },
    { part: 'shirt-longsleeve', colors: { cloth: 'white' } },
    { part: 'vest' },
    { part: 'bowtie', colors: { cloth: 'black' } },
    { part: 'hair-plain', colors: { hair: 'black' } },
    { part: 'mustache', colors: { hair: 'black' } },
    { part: 'tophat' },
    { part: 'monocle' },
  ],
};

/** Benno im Chat: der Baron ohne Zylinder und ohne Monokel (dieselben Ebenen); „der Rest war Hut“ */
export const BENNO: CharacterSpec = { ...BARON, layers: BARON.layers.filter((l) => l.part !== 'tophat' && l.part !== 'monocle') };
