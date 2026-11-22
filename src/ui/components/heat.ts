// Farben der Wärmekarte: Die Helligkeit steigt mit der Stufe, damit auch ohne Farbsehen etwas zu erkennen ist.

import { HEAT_MID } from '../../domain/mastery.ts';

/** Farbton (OKLCH) an den Stufen 0, HEAT_MID und 1: rot, gelbgrün, grün */
const HUES = { low: 25, mid: 110, high: 150 };

/** Stufe 0..1 → Farbton, stückweise linear */
export function heatHue(level: number): number {
  const v = Math.min(1, Math.max(0, level));
  return v < HEAT_MID
    ? HUES.low + ((HUES.mid - HUES.low) * v) / HEAT_MID
    : HUES.mid + ((HUES.high - HUES.mid) * (v - HEAT_MID)) / (1 - HEAT_MID);
}

/** Stufe 0..1 → Helligkeit (OKLCH-L) */
export const heatLightness = (level: number): number => 0.64 + 0.2 * Math.min(1, Math.max(0, level));

/** Stufe 0..1 → CSS-Farbe; dazu passt dunkle Schrift */
export function heatColor(level: number): string {
  return `oklch(${heatLightness(level).toFixed(3)} 0.15 ${heatHue(level).toFixed(1)})`;
}
