// Bildarten der eigenen Pixelbilder: jede hat eine feste Rastergröße (alles auf einem 4er-Raster) und einen Maßstab, in dem sie
// ohne eigene CSS-Größe erscheint (z. B. im Chat). Orte mit eigener Größe (Fallakte, Koffer, Story-Objekt, Extra-Fall) setzen
// je Bildart ein ganzzahliges Vielfaches der Breite (Klassen `pic-<art>` in ui/styles/, geprüft in pictureKinds.test.ts).

export const PICTURE_KINDS = {
  /** Gadget-Symbol im Koffer, im Chat und am Extra-Fall */
  gadget: { w: 16, h: 16, scale: 3 },
  /** Beweisstück und Chat-Bild (Zettel, Karte, Notizbuch) */
  evidence: { w: 32, h: 20, scale: 4 },
  /** großes Story-Objekt */
  object: { w: 64, h: 40, scale: 3 },
  /** Fallbild, Stufenbild */
  panorama: { w: 96, h: 56, scale: 2 },
} as const satisfies Record<string, { w: number; h: number; scale: number }>;

export type PictureKind = keyof typeof PICTURE_KINDS;

/** Die Bildart mit dieser Rastergröße, sonst `undefined` */
export function kindOfSize(w: number, h: number): PictureKind | undefined {
  return (Object.keys(PICTURE_KINDS) as PictureKind[]).find((k) => PICTURE_KINDS[k].w === w && PICTURE_KINDS[k].h === h);
}
