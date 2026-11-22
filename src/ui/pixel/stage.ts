// Bilderbuch-Bühne: Maße der Szenen-Hintergründe (ui/components/Scene.tsx) und wo die Figuren stehen.

export const SCENE_W = 320;
export const SCENE_H = 180;
/** Hier stehen die Füße der Figuren: etwas unterhalb der Bodenkante (y = 150) */
export const FEET_Y = 158;

/** Zeilen der Kulisse, die über der Gesprächsbox mindestens zu sehen sein sollen (wie am Monitor, 1280×900) */
const VISIBLE_ROWS = 100;
/** Rand der Bühne (Innenabstand des Bilderbuchs oben und unten) in CSS-Pixeln */
const STAGE_MARGIN = 32;
/** Breite von Ada, Krümel und der eigenen Figur in Grafikpixeln, plus Abstände in CSS-Pixeln */
const CAST_W = 112;
const CAST_GAPS = 90;

/**
 * Ein Grafikpixel in CSS-Pixeln – für Figuren, Krümel und Kulisse gleich (CSS-Variable `--px`).
 * Ganzzahlig in Gerätepixeln (`dpr`), damit auch bei Zoom oder 125 % Windows-Skalierung alle Pixel gleich groß sind.
 * Grundwert: so groß, dass die Kulisse das Fenster deckt (lieber etwas abgeschnitten als mit Rändern).
 * Nach oben begrenzt, damit die Bühne passt: durch die Breite (die drei Figuren müssen nebeneinander ins Fenster)
 * und – wenn `boxHeight` (Höhe der Gesprächsbox) gegeben ist – durch die Höhe (über der Box bleiben etwa
 * 100 Kulissen-Zeilen). Was die Kulisse dann nicht deckt, füllt die Hintergrundfarbe der Szene. Mindestens ein Gerätepixel.
 */
export function pixelScale(width: number, height: number, dpr: number, boxHeight?: number): number {
  const device = (cssPx: number) => cssPx * dpr;
  let px = Math.ceil(device(Math.max(width / SCENE_W, height / SCENE_H)) - 1e-9);
  // Breite: abrunden, damit die Figuren sicher ins Fenster passen
  px = Math.min(px, Math.floor(device((width - CAST_GAPS) / CAST_W) + 1e-9));
  // Höhe: auf den nächsten Wert runden (genau halbe Werte nach unten); die Figuren sind niedriger als die Bühne
  if (boxHeight !== undefined) px = Math.min(px, Math.ceil(device((height - boxHeight - STAGE_MARGIN) / VISIBLE_ROWS) - 0.5 - 1e-9));
  return Math.max(1, px) / dpr;
}

/**
 * Um so viele Pixel muss der Hintergrund nach oben, damit die Fußlinie auf Höhe `standY` liegt
 * (Abstand vom unteren Fensterrand); `px` ist der Maßstab der Kulisse (`pixelScale`).
 * Nie nach unten – sonst entstünde oben eine Lücke.
 */
export function sceneLift(px: number, standY: number): number {
  return Math.max(0, Math.round(standY - (SCENE_H - FEET_Y) * px));
}
