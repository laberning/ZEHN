// Pixelsymbole für die Gadgets im Agentenkoffer, im Chat und am Extra-Fall (Bilder in gadgetIcons.ts, Bildart `gadget`).
// Fehlt ein Gadget noch, erscheint nur sein Umriss.

import { Grid } from '../pixel/Pixel.tsx';
import type { Px } from '../pixel/pixelMap.ts';
import { PALETTE } from '../pixel/palette.ts';
import { ICONS } from './gadgetIcons.ts';

/** Gleiche Form ohne Farben: nur Umriss und Fläche in einem dunklen Ton (für noch fehlende Gadgets) */
const SILHOUETTES = new WeakMap<Px[], Px[]>();
/** je Gadget-Karte nur einmal gebaut, damit `Grid` sein Bild wiederfindet */
const silhouette = (px: Px[]): Px[] => {
  let s = SILHOUETTES.get(px);
  if (!s) SILHOUETTES.set(px, (s = px.map(([x, y, w, h]) => [x, y, w, h, PALETTE['metal-dark']])));
  return s;
};

/**
 * `title`: Name des Gadgets, wenn das Bild für sich steht (Chat, Extra-Fall); ohne Titel ist es Schmuck. Koffer, Chat und
 * Extra-Fall zeigen es im Grundmaßstab der Bildart `gadget` (dreifach, 48 px).
 */
export function GadgetIcon({ id, has, title }: { id: string; has: boolean; title?: string }) {
  const px = ICONS[id];
  if (!px) return <span aria-hidden="true">{has ? '■' : '□'}</span>;
  return <Grid px={has ? px : silhouette(px)} kind="gadget" title={title} className="gadget-pic" />;
}
