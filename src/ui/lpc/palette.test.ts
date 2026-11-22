import { describe, expect, it } from 'vitest';
import manifest from '../../content/lpc.generated.json';
import { WARDROBE, defaultAvatar } from '../../content/wardrobe.ts';
import { ADA, BARON, HUBBEL, avatarSpec } from './characters.ts';
import { paletteMapping, recolorPixels, type Palette } from './palette.ts';

const palettes: Record<string, Palette> = {
  hair: { base: 'orange', variants: { orange: ['#ff0000', '#00ff00'], black: ['#000000', '#111111'] } },
};

describe('Umfärben', () => {
  it('bildet Basisfarben auf die Zielvariante ab', () => {
    expect(paletteMapping(palettes, ['hair'], { hair: 'black' })).toEqual([
      [255, 0, 0, 0, 0, 0],
      [0, 255, 0, 17, 17, 17],
    ]);
    expect(paletteMapping(palettes, ['hair'], { hair: 'orange' })).toEqual([]);
    expect(paletteMapping(palettes, ['hair'], { hair: 'gibt-es-nicht' })).toEqual([]);
    expect(paletteMapping(palettes, ['cloth'], { cloth: 'black' })).toEqual([]);
  });

  it('färbt Pixel mit ±1 Toleranz um, durchsichtige bleiben', () => {
    const d = new Uint8ClampedArray([254, 1, 0, 255, 255, 0, 0, 0, 10, 10, 10, 255]);
    recolorPixels(d, paletteMapping(palettes, ['hair'], { hair: 'black' }));
    expect([...d]).toEqual([0, 0, 0, 255, 255, 0, 0, 0, 10, 10, 10, 255]);
  });
});

describe('Figuren', () => {
  it('alle Ebenen von Avatar, Ada, Baron und Frau Hubbel gibt es im Manifest', () => {
    for (const spec of [avatarSpec(defaultAvatar('m'), WARDROBE), avatarSpec({ ...defaultAvatar('w'), glasses: 'shades', outfit: 'agent' }, WARDROBE), ADA, BARON, HUBBEL]) {
      for (const l of spec.layers) expect(manifest.parts, l.part).toHaveProperty(l.part);
    }
  });

  it('alle Farben von Ada, Baron und Frau Hubbel gibt es als Palettenvariante (sonst bliebe die Grundfarbe stehen)', () => {
    const pals = manifest.palettes as Record<string, Palette>;
    for (const spec of [ADA, BARON, HUBBEL]) {
      for (const l of spec.layers) {
        for (const [material, variant] of Object.entries(l.colors ?? {})) {
          expect(pals[material]?.variants, `${l.part}: ${material} ${variant}`).toHaveProperty(variant);
        }
      }
    }
  });

  it('das Zubehör bekommt seine eigene Farbe und liegt über dem Oberteil; ohne Zubehör keine Ebene', () => {
    const w = { ...WARDROBE, accessories: [...WARDROBE.accessories, { id: 'scarf', name: 'Schal', parts: ['scarf'] }] };
    const spec = avatarSpec({ ...defaultAvatar('w'), accessory: 'scarf', outfitColor: 'green', accessoryColor: 'rose' }, w);
    expect(spec.layers.find((l) => l.part === 'scarf')?.colors).toEqual({ cloth: 'rose' });
    expect(manifest.parts).toHaveProperty('scarf');
    const parts = manifest.parts as Record<string, { layers: { teen?: { z: number }[] } }>;
    const z = (part: string) => Math.min(...(parts[part]?.layers.teen ?? []).map((l) => l.z));
    expect(z('scarf')).toBeGreaterThan(Math.max(z('shirt-tshirt'), z('vest-buttoned')));
    expect(avatarSpec(defaultAvatar('w'), w).layers.some((l) => l.part === 'scarf')).toBe(false);
  });

  it('das Stirnband bekommt die gewählte Farbe, nicht die des Oberteils', () => {
    const spec = avatarSpec({ ...defaultAvatar('w'), head: 'headband', outfitColor: 'green', headColor: 'rose' }, WARDROBE);
    expect(spec.layers.find((l) => l.part === 'headband')?.colors).toEqual({ cloth: 'rose' });
  });
});
