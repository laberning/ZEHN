// Ausschnitte aus dem 64×64-Raster einer LPC-Figur

export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Ganzer Körper bzw. Kopf und Schultern (in Pixeln des 64×64-Rasters) */
export const CROP_FULL: Crop = { x: 12, y: 8, w: 40, h: 56 };
export const CROP_PORTRAIT: Crop = { x: 16, y: 12, w: 32, h: 32 };
/** Beine und Füße (Kacheln für Hose und Schuhe in der Garderobe) */
export const CROP_LEGS: Crop = { x: 16, y: 36, w: 32, h: 28 };
/** Erwachsene sind größer; etwas mehr Raum oben für Dutt und Zylinder */
export const CROP_ADA: Crop = { x: 14, y: 10, w: 36, h: 36 };
export const CROP_BARON: Crop = { x: 14, y: 8, w: 36, h: 36 };
