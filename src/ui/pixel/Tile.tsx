// Kacheln aus LPC-Paketen (public/assets/props, Quelle und Prüfsummen dort in QUELLEN.md) als SVG-Bild auf dem Pixelraster:
// ein Kachelpixel ist ein Rasterfeld, wie bei den gezeichneten Bildern. `TilePic` ist die Bildart „Kachel“ der Story-Bilder.

import { Grid, Rects } from './Pixel.tsx';
import type { Px } from './pixelMap.ts';
import { PROP_SIZES, type PropName } from './propSizes.ts';

/** Adresse der Kachel-Datei */
const tileHref = (name: PropName): string => `${import.meta.env.BASE_URL}assets/props/${name}.png`;

/** Eine Kachel mit der linken oberen Ecke bei (x, y), in Originalgröße; `prop` hält die Pixel scharf (scene.css) */
export function Tile({ name, x = 0, y = 0 }: { name: PropName; x?: number; y?: number }) {
  const [w, h] = PROP_SIZES[name];
  return <image href={tileHref(name)} x={x} y={y} width={w} height={h} className="prop" />;
}

/** Bildart „Kachel“: eine Kachel statt einer Zeichnung, darüber optional Gezeichnetes (Schnur, Aufschrift) im selben Raster */
export interface TilePicture {
  tile: PropName;
  title: string;
  /** gezeichnete Teile über der Kachel, in Kachelpixeln */
  over?: Px[];
}

/** Bildschirmpixel je Kachelpixel (wie die kleinen gezeichneten Dinge im Chat) */
const TILE_SCALE = 3;

/** Ein Story-Bild aus einer Kachel, im selben `Grid`-Rahmen wie die gezeichneten Bilder */
export function TilePic({ tile, title, over = [] }: TilePicture) {
  const [w, h] = PROP_SIZES[tile];
  return (
    <Grid px={[]} w={w} h={h} size={w * TILE_SCALE} title={title} className="story-pic small-pic">
      <Tile name={tile} />
      <Rects px={over} />
    </Grid>
  );
}
