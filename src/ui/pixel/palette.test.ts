import { describe, expect, it } from 'vitest';
import lpc from '../../content/lpc.generated.json';
import { COLORS, FAMILIES, INK, OUTLINE, PALETTE, type RampStop } from './palette.ts';

const ramps = lpc.palettes as Record<string, { variants: Record<string, string[]> }>;
const rampHex = ([material, variant, stop]: RampStop): string | undefined => ramps[material]?.variants[variant]?.[stop]?.toLowerCase();

describe('Palette der eigenen Bilder', () => {
  it('jede Farbe außer der Kontur stammt aus der genannten LPC-Rampe', () => {
    const tones = [...Object.values(FAMILIES).flatMap((f) => [f.dark, f.base, f.light]), INK];
    for (const t of tones) expect(rampHex(t.from), `${t.hex} aus ${t.from.join('/')}`).toBe(t.hex);
  });

  it('jede Familie hat drei Töne aus derselben Rampe, dunkel nach hell', () => {
    for (const [name, f] of Object.entries(FAMILIES)) {
      const [d, b, l] = [f.dark.from, f.base.from, f.light.from];
      expect([b[0], b[1]], name).toEqual([d[0], d[1]]);
      expect([l[0], l[1]], name).toEqual([d[0], d[1]]);
      expect(d[2] < b[2] && b[2] < l[2], name).toBe(true);
    }
  });

  it('Namen: Grundton, -dark, -light je Familie, dazu ink und outline; Hexwerte eindeutig und klein geschrieben', () => {
    for (const name of Object.keys(FAMILIES)) for (const n of [name, `${name}-dark`, `${name}-light`]) expect(PALETTE, n).toHaveProperty(n);
    expect(PALETTE.ink).toBe(INK.hex);
    expect(PALETTE.outline).toBe(OUTLINE);
    const hexes = Object.values(PALETTE);
    expect(new Set(hexes).size).toBe(hexes.length);
    for (const h of hexes) expect(h).toMatch(/^#[0-9a-f]{6}$/);
    expect(COLORS).toEqual(new Set(hexes));
  });

  it('höchstens 24 Farben', () => {
    expect(COLORS.size).toBeLessThanOrEqual(24);
  });
});
