import { describe, expect, it } from 'vitest';
import { pixelScale, sceneLift } from './stage.ts';

describe('Pixelmaßstab', () => {
  it('ganzzahlig in Gerätepixeln und so groß, dass die Kulisse (320×180) das Fenster deckt', () => {
    expect(pixelScale(1280, 800, 1)).toBe(5); // 4,44 → 5
    expect(pixelScale(1920, 1080, 1)).toBe(6); // genau 6
    expect(pixelScale(1024, 700, 1)).toBe(4); // 3,89 → 4
    expect(pixelScale(1280, 720, 1)).toBe(4);
  });

  it('bei 125 % Skalierung bleibt jedes Grafikpixel eine ganze Zahl von Gerätepixeln', () => {
    const px = pixelScale(1280, 800, 1.25); // 4,44 CSS-px → 5,55 → 6 Gerätepixel
    expect(px * 1.25).toBeCloseTo(6);
    expect(px).toBeCloseTo(4.8);
    for (const [w, h, dpr] of [[1536, 864, 1.25], [1366, 768, 1.5], [1707, 960, 1.125]] as const) {
      const device = pixelScale(w, h, dpr) * dpr;
      expect(Math.abs(device - Math.round(device))).toBeLessThan(1e-9);
      expect(pixelScale(w, h, dpr) * 320).toBeGreaterThanOrEqual(w - 1e-9); // deckt das Fenster
    }
  });

  it('mit der Gesprächsbox: begrenzt durch die Höhe, so bleiben über der Box etwa 100 Kulissen-Zeilen', () => {
    const box = (w: number, h: number) => Math.min(w <= 700 ? 512 : w <= 800 ? 368 : 336, h * 0.6);
    const px = (w: number, h: number) => pixelScale(w, h, 1, box(w, h));
    expect(px(1280, 900)).toBe(5); // wie ohne Grenze
    expect(px(1920, 1080)).toBe(6);
    expect(px(1024, 650)).toBe(3); // ohne Grenze 4
    expect(px(1280, 700)).toBe(3);
    expect(px(768, 950)).toBe(5); // ohne Grenze 6
    expect(px(1024, 560)).toBe(2);
  });

  it('begrenzt durch die Breite: Ada, Krümel und die eigene Figur passen nebeneinander ins Fenster', () => {
    expect(pixelScale(390, 750, 1, 450)).toBe(2);
    expect(pixelScale(390, 750, 1)).toBe(2); // auch ohne Box (HQ, Chat)
    expect(pixelScale(768, 1024, 1)).toBe(6); // greift hier nicht
  });

  it('winzige Fenster: mindestens ein Gerätepixel', () => {
    expect(pixelScale(1, 1, 2)).toBe(0.5);
  });
});

describe('Bilderbuch-Bühne', () => {
  it('hebt den Hintergrund, bis die Fußlinie an der Oberkante der Textbox liegt', () => {
    // Maßstab 5: die Fußlinie liegt 22 Rasterfelder (110 px) über dem Rand
    expect(sceneLift(5, 170)).toBe(60);
    expect(sceneLift(5, 400)).toBe(290); // hohe Textbox mit Antworten
  });

  it('senkt ihn nie ab: steht die Textbox tiefer als der Boden, bleibt er, wo er ist', () => {
    expect(sceneLift(6, 100)).toBe(0);
  });
});
