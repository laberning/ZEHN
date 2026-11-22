// Umfärben per Palette (rein, ohne Canvas – daher ohne Browser testbar).

export interface Palette {
  /** Variante, in der die Grafiken gezeichnet sind */
  base: string;
  variants: Record<string, string[]>;
}

/** Quellfarbe → Zielfarbe als [r, g, b, r', g', b'] */
export type ColorMapping = [number, number, number, number, number, number][];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];

/** Welche Farbe wird zu welcher? Je Material von der Basisvariante zur gewünschten Variante. */
export function paletteMapping(palettes: Record<string, Palette>, materials: readonly string[], colors: Partial<Record<string, string>>): ColorMapping {
  const m: ColorMapping = [];
  for (const mat of materials) {
    const target = colors[mat];
    const pal = palettes[mat];
    if (!target || !pal || target === pal.base) continue;
    const from = pal.variants[pal.base] ?? [];
    const to = pal.variants[target];
    if (!to) continue;
    from.forEach((f, i) => {
      const t = to[i];
      if (t) m.push([...hex(f), ...hex(t)]);
    });
  }
  return m;
}

/** Färbt RGBA-Pixel um (Toleranz ±1 wie im LPC-Generator); durchsichtige Pixel bleiben unverändert. */
export function recolorPixels(d: Uint8ClampedArray, mapping: ColorMapping): void {
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const r = d[i]!, g = d[i + 1]!, b = d[i + 2]!;
    for (const [sr, sg, sb, tr, tg, tb] of mapping) {
      if (Math.abs(r - sr) <= 1 && Math.abs(g - sg) <= 1 && Math.abs(b - sb) <= 1) {
        d[i] = tr;
        d[i + 1] = tg;
        d[i + 2] = tb;
        break;
      }
    }
  }
}
