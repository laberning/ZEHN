// Kleine Pixelbilder für Story-Objekte und Chat-Nachrichten (im Stil von ui/pixel/Pixel.tsx): `StoryPicture` wählt
// nach `PictureId` aus der Tabelle in pictures.tsx (Bilder von Akt 1 bis 7 in akt1.tsx … akt7.tsx, Extra-Fälle in cases.tsx).
// Dazu Adas Brezel und die gezeichnete Tinte der Goldrand-Karte. Ein Bild ist entweder eine Zeichnung (Funktion) oder eine Kachel
// aus einem LPC-Paket (Bildart „Kachel“, `TilePicture` in ui/pixel/Tile.tsx).

import type { PictureId } from '../../domain/storyObject.ts';
import { Grid } from '../pixel/Pixel.tsx';
import { fromPalette, type Legend } from '../pixel/pixelMap.ts';
import { TilePic } from '../pixel/Tile.tsx';
import { PICTURES } from './pictures.tsx';

/** Adas Brezel (13×8): Stempel auf dem Ausweis und Wasserzeichen auf der Goldrand-Karte – dieselbe Form, damit man sie wiedererkennt */
const BREZEL_MAP = [
  '.kkkk...kkkk.',
  'kbbbbk.kbbbbk',
  'kbk.kbkbk.kbk',
  'kbk..kbk..kbk',
  'kbbk.kbk.kbbk',
  '.kbbkbkbkbbk.',
  '..kbbk.kbbk..',
  '...kkk.kkk...',
];
const BREZEL_INK: Record<'stamp' | 'watermark', Legend> = {
  /** Stempelfarbe auf dem Ausweis */
  stamp: { k: 'red', b: 'red-light' },
  /** kaum sichtbar hinter der Schrift */
  watermark: { k: 'gold-dark', b: 'gold-light' },
};

const BREZEL_PX = { stamp: fromPalette(BREZEL_MAP, BREZEL_INK.stamp), watermark: fromPalette(BREZEL_MAP, BREZEL_INK.watermark) };

/** Adas Brezel als Pixelbild; `ink` bestimmt, ob Stempel oder Wasserzeichen */
export function Brezel({ ink, size, className }: { ink: keyof typeof BREZEL_INK; size: number; className?: string }) {
  return <Grid px={BREZEL_PX[ink]} w={13} h={8} size={size} title="Brezel" className={className} />;
}


/** Krone in Gold (11×7), wie mit Goldtinte auf die Karte gemalt */
const CROWN = fromPalette(
  ['.k...k...k.', 'kyk.kyk.kyk', 'kyykyyykyyk', 'kyyyyryyyyk', 'kyyyyyyyyyk', 'kdddddddddk', 'kkkkkkkkkkk'],
  { k: 'outline', y: 'gold', d: 'gold-dark', r: 'red' },
);
/** Verschnörkelte Tintenlinie (24×4) */
const FLOURISH = fromPalette(['..kk......kk......kk....', '.k..k....k..k....k..k...', 'k....k..k....k..k....k..', '......kk......kk......kk'], { k: 'wood-dark' });

/** Gezeichnete Tinte auf der Goldrand-Karte */
export function InkMarkPic({ mark }: { mark: 'schnoerkel' | 'krone' }) {
  return mark === 'krone' ? <Grid px={CROWN} w={11} h={7} size={33} title="Krone" className="ink-mark" /> : <Grid px={FLOURISH} w={24} h={4} size={96} title="Schnörkel" className="ink-mark" />;
}

/** Ein Story-Bild nach Kennung */
export function StoryPicture({ id }: { id: PictureId }) {
  const pic = PICTURES[id];
  return typeof pic === 'function' ? pic() : <TilePic {...pic} />;
}
