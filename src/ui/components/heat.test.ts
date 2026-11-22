import { describe, expect, it } from 'vitest';
import { heatColor, heatHue, heatLightness } from './heat.ts';

/** OKLCH → lineares sRGB (Björn Ottosson), auf 0..1 gekappt */
function linearRgb(L: number, C: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return rgb.map((x) => Math.min(1, Math.max(0, x))) as [number, number, number];
}

const luminance = ([r, g, b]: [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Schriftfarbe der Wärmekarte (#0a0e19) in linearem sRGB */
const INK = [0x0a, 0x0e, 0x19].map((v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}) as [number, number, number];

const lum = (level: number) => luminance(linearRgb(heatLightness(level), 0.15, heatHue(level)));
const contrast = (level: number) => (lum(level) + 0.05) / (luminance(INK) + 0.05);

const LEVELS = [0, 0.25, 0.5, 0.6, 0.75, 1];

describe('Farben der Wärmekarte', () => {
  it('dunkle Schrift hat an allen Stufen Kontrast >= 4,5 : 1', () => {
    for (const v of LEVELS) expect(contrast(v), `Stufe ${v}`).toBeGreaterThanOrEqual(4.5);
  });

  it('die Helligkeit steigt streng mit der Stufe', () => {
    const l = LEVELS.map(lum);
    for (let i = 1; i < l.length; i++) expect(l[i]!, `Stufe ${LEVELS[i]}`).toBeGreaterThan(l[i - 1]!);
  });

  it('Farbton: rot, gelbgrün an der Schwelle, grün; Werte außerhalb werden gekappt', () => {
    expect([heatHue(0), heatHue(0.6), heatHue(1)]).toEqual([25, 110, 150]);
    expect(heatColor(0)).toBe('oklch(0.640 0.15 25.0)');
    expect(heatColor(1)).toBe('oklch(0.840 0.15 150.0)');
    expect(heatColor(-1)).toBe(heatColor(0));
    expect(heatColor(2)).toBe(heatColor(1));
  });
});
