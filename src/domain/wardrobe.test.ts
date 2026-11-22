import { describe, expect, it } from 'vitest';
import type { Avatar } from './profile.ts';
import { colorPackOf, onlyWhileWorn, wearable, type WardrobeCatalog } from './wardrobe.ts';

const avatar = (a: Partial<Avatar> = {}): Avatar => ({
  gender: 'w',
  skin: 'light',
  hairStyle: 'lang',
  hairColor: 'black',
  eyeColor: 'blue',
  outfit: 'shirt',
  outfitColor: 'blue',
  pants: 'jeans',
  pantsColor: 'blue',
  shoes: 'schuhe',
  shoesColor: 'black',
  glasses: 'none',
  head: 'none',
  headColor: 'blue',
  accessory: 'none',
  accessoryColor: 'blue',
  ...a,
});

const catalog: WardrobeCatalog = {
  skinTones: ['light'],
  hairColors: ['black', 'pink'],
  eyeColors: ['blue', 'purple'],
  clothColors: ['blue', 'black', 'rose'],
  hairStyles: [
    { id: 'lang', name: 'Lang', parts: [] },
    { id: 'bob', name: 'Bob', parts: [], source: { badge: 'b' } },
  ],
  outfits: [{ id: 'shirt', name: 'Shirt', parts: [] }],
  pants: [{ id: 'jeans', name: 'Jeans', parts: [] }],
  shoes: [{ id: 'schuhe', name: 'Schuhe', parts: [] }],
  glasses: [{ id: 'none', name: 'Keine', parts: [] }],
  headwear: [
    { id: 'none', name: 'Keine', parts: [] },
    { id: 'hut', name: 'Hut', parts: [], source: { scene: 'geschenk' } },
  ],
  accessories: [
    { id: 'none', name: 'Ohne', parts: [] },
    { id: 'schal', name: 'Schal', parts: [], source: { scene: 'geschenk-schal' } },
  ],
  colorPacks: [
    { id: 'neon', name: 'Neon', source: { scene: 'rank-agent' }, colors: { hair: ['pink'], eye: ['purple'] } },
    { id: 'kleid', name: 'Kleid', source: { scene: 'rank-anwaerter' }, colors: { cloth: ['rose'] } },
  ],
  defaultAvatar: () => avatar(),
};

describe('Garderobe: was man wählen darf', () => {
  it('frei ist alles ohne Quelle und jede Farbe, die in keinem Paket steckt', () => {
    const w = wearable(catalog, new Set());
    expect([...w.items]).toEqual(['lang', 'shirt', 'jeans', 'schuhe', 'none']); // „none“ steht für Brille, Kopf und Zubehör
    expect([...w.colors.hair]).toEqual(['black']);
    expect([...w.colors.eye]).toEqual(['blue']);
    expect([...w.colors.cloth]).toEqual(['blue', 'black']);
    expect(colorPackOf(catalog, 'hair', 'pink')?.id).toBe('neon');
  });

  it('Besitz schaltet Teile und ganze Farbpakete frei', () => {
    const w = wearable(catalog, new Set(['bob', 'neon']));
    expect(w.items.has('bob')).toBe(true);
    expect(w.colors.hair.has('pink')).toBe(true);
    expect(w.colors.eye.has('purple')).toBe(true);
    expect(w.colors.cloth.has('rose')).toBe(false);
  });

  it('was gespeichert getragen wird, bleibt wählbar; eine getragene Kleidungsfarbe gilt für alle Kleidungsplätze', () => {
    const w = wearable(catalog, new Set(), avatar({ hairStyle: 'bob', hairColor: 'pink', shoesColor: 'rose' }));
    expect(w.items.has('bob')).toBe(true);
    expect(w.colors.hair.has('pink')).toBe(true);
    expect(w.colors.cloth.has('rose')).toBe(true);
    expect(w.colors.eye.has('purple')).toBe(false);
    // … aber nur, solange es getragen wird – das zeigt die Garderobe als Warnung
    expect(onlyWhileWorn(catalog, new Set(), 'item', 'bob')).toBe(true);
    expect(onlyWhileWorn(catalog, new Set(['bob']), 'item', 'bob')).toBe(false);
    expect(onlyWhileWorn(catalog, new Set(), 'hair', 'pink')).toBe(true);
    expect(onlyWhileWorn(catalog, new Set(), 'hair', 'black')).toBe(false);
  });

  it('auch Kopfbedeckung und Kleidungsfarben: getragen bleibt wählbar; unbekannte IDs sind nie „nur getragen“', () => {
    const w = wearable(catalog, new Set(), avatar({ head: 'hut', outfitColor: 'rose' }));
    expect(w.items.has('hut')).toBe(true);
    expect(wearable(catalog, new Set()).items.has('hut')).toBe(false);
    expect(onlyWhileWorn(catalog, new Set(), 'cloth', 'rose')).toBe(true);
    expect(onlyWhileWorn(catalog, new Set(['kleid']), 'cloth', 'rose')).toBe(false);
    expect(onlyWhileWorn(catalog, new Set(), 'item', 'gibt-es-nicht')).toBe(false);
  });

  it('Zubehör: gesperrt bis zur Quelle, getragen bleibt wählbar; seine Farbe zählt zu den getragenen Kleiderfarben', () => {
    expect(wearable(catalog, new Set()).items.has('schal')).toBe(false);
    expect(wearable(catalog, new Set(['schal'])).items.has('schal')).toBe(true);
    expect(wearable(catalog, new Set(), avatar({ accessory: 'schal' })).items.has('schal')).toBe(true);
    expect(onlyWhileWorn(catalog, new Set(), 'item', 'schal')).toBe(true);
    const cat = { ...catalog, colorPacks: [{ id: 'kleid', name: 'Kleid', source: { scene: 'x' }, colors: { cloth: ['rose'] } }] };
    expect(wearable(cat, new Set(), avatar({ accessoryColor: 'rose' })).colors.cloth.has('rose')).toBe(true);
  });

  it('die Farbe der Kopfbedeckung zählt zu den getragenen Kleiderfarben', () => {
    const cat = { ...catalog, colorPacks: [{ id: 'kleid', name: 'Kleid', source: { scene: 'x' }, colors: { cloth: ['rose'] } }] };
    expect(wearable(cat, new Set()).colors.cloth.has('rose')).toBe(false);
    expect(wearable(cat, new Set(), avatar({ headColor: 'rose' })).colors.cloth.has('rose')).toBe(true);
  });
});
