// Garderobe: Teile für den Avatar. Welche Kleidung frei ist, bestimmt der Besitz (domain/items.ts);
// die Teile selbst stehen in content/wardrobe.ts.

import type { ItemSource } from './items.ts';
import type { Avatar, Gender } from './profile.ts';

export interface WardrobeItem {
  id: string;
  name: string;
  /** LPC-Teile */
  parts: string[];
  /** Feste Stofffarbe einzelner LPC-Teile (z. B. rote Krawatte); sonst gilt die gewählte Farbe */
  fixedColors?: Readonly<Record<string, string>>;
  /** Woher das Teil kommt; ohne Quelle ist es von Anfang an frei */
  source?: ItemSource;
}

/** Farben, die freigespielt werden können: Haare, Augen, Kleidung (Hautfarben sind immer frei) */
export type ColorMaterial = 'hair' | 'eye' | 'cloth';

/** Ein Farbpaket: schaltet mehrere Farben auf einmal frei. Eine Farbe in einem Paket ist bis dahin gesperrt. */
export interface ColorPack {
  id: string;
  name: string;
  source: ItemSource;
  colors: Partial<Record<ColorMaterial, readonly string[]>>;
}

/** Frei, wenn es keine Quelle gibt oder das Kind es besitzt */
export function isUnlocked(item: WardrobeItem, owned: ReadonlySet<string>): boolean {
  return !item.source || owned.has(item.id);
}

/** Der ganze Katalog: Farben (Namen von LPC-Palettenvarianten), Teile je Kategorie und der Start-Avatar */
export interface WardrobeCatalog {
  skinTones: readonly string[];
  hairColors: readonly string[];
  eyeColors: readonly string[];
  clothColors: readonly string[];
  hairStyles: readonly WardrobeItem[];
  outfits: readonly WardrobeItem[];
  pants: readonly WardrobeItem[];
  shoes: readonly WardrobeItem[];
  glasses: readonly WardrobeItem[];
  /** Kopfbedeckungen (erstes Teil: keine) */
  headwear: readonly WardrobeItem[];
  /** Zubehör zusätzlich zur Kleidung, eins zur Zeit (erstes Teil: keins) */
  accessories: readonly WardrobeItem[];
  colorPacks: readonly ColorPack[];
  defaultAvatar: (gender: Gender) => Avatar;
}

/** Alle Teile des Katalogs in einer Liste */
export function wardrobeItems(c: WardrobeCatalog): WardrobeItem[] {
  return [...c.hairStyles, ...c.outfits, ...c.pants, ...c.shoes, ...c.glasses, ...c.headwear, ...c.accessories];
}

/** Das Farbpaket, in dem diese Farbe steckt (dann ist sie bis zum Paket gesperrt) */
export const colorPackOf = (c: Pick<WardrobeCatalog, 'colorPacks'>, material: ColorMaterial, color: string): ColorPack | undefined =>
  c.colorPacks.find((p) => p.colors[material]?.includes(color));

/** Was man gerade wählen darf: Teil-IDs und Farben je Material */
export interface Wearable {
  items: ReadonlySet<string>;
  colors: Readonly<Record<ColorMaterial, ReadonlySet<string>>>;
}

/** Teile und Farben, die getragen werden (gespeicherter Avatar) – sie bleiben wählbar, auch wenn sie inzwischen gesperrt sind */
function wornBy(a: Avatar | undefined): { items: Set<string>; colors: Record<ColorMaterial, Set<string>> } {
  if (!a) return { items: new Set(), colors: { hair: new Set(), eye: new Set(), cloth: new Set() } };
  return {
    items: new Set([a.hairStyle, a.outfit, a.pants, a.shoes, a.glasses, a.head, a.accessory]),
    // eine getragene Kleidungsfarbe gilt für alle Kleidungsplätze (auch Kopfbedeckung und Zubehör)
    colors: { hair: new Set([a.hairColor]), eye: new Set([a.eyeColor]), cloth: new Set([a.outfitColor, a.pantsColor, a.shoesColor, a.headColor, a.accessoryColor]) },
  };
}

/**
 * Was das Kind wählen darf: frei (ohne Quelle), besessen – oder gerade getragen.
 * `worn` ist der gespeicherte Avatar (bei der Rekrutierung keiner): Zieht man ein gesperrtes Teil aus, ist es weg, bis man es freispielt.
 */
export function wearable(c: WardrobeCatalog, owned: ReadonlySet<string>, worn?: Avatar): Wearable {
  const w = wornBy(worn);
  const items = new Set(wardrobeItems(c).filter((i) => isUnlocked(i, owned) || w.items.has(i.id)).map((i) => i.id));
  const colors = (material: ColorMaterial, list: readonly string[]) =>
    new Set(
      list.filter((color) => {
        const pack = colorPackOf(c, material, color);
        return !pack || owned.has(pack.id) || w.colors[material].has(color);
      }),
    );
  return { items, colors: { hair: colors('hair', c.hairColors), eye: colors('eye', c.eyeColors), cloth: colors('cloth', c.clothColors) } };
}

/** Getragen, aber eigentlich gesperrt? Dann warnt die Garderobe: ausziehen heißt erst wieder freispielen. */
export function onlyWhileWorn(c: WardrobeCatalog, owned: ReadonlySet<string>, kind: 'item' | ColorMaterial, id: string): boolean {
  if (kind === 'item') {
    const item = wardrobeItems(c).find((i) => i.id === id);
    return !!item && !isUnlocked(item, owned);
  }
  const pack = colorPackOf(c, kind, id);
  return !!pack && !owned.has(pack.id);
}
