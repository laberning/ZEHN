// Requisiten für die Kulissen (ui/components/Scene.tsx): Kacheln aus LPC-Paketen (Brote, Mehlsack, Ofen, Werkzeug …).
// Alles liegt auf dem Raster der Kulisse (1 Einheit = 1 Grafikpixel) und hat dunkle Kontur und drei Töne, damit es neben den
// LPC-Figuren nicht fremd wirkt (Stilregeln: docs/design/grafik.md).

import { Rects } from './Pixel.tsx';
import { fromMap, shift } from './pixelMap.ts';
import { PROP_SIZES, type PropName } from './propSizes.ts';
import { Tile } from './Tile.tsx';


/** Eine Kachel; `x` ist die Mitte, `y` die Unterkante (sie steht auf Regal, Theke oder Boden) */
export function Prop({ name, x, y }: { name: PropName; x: number; y: number }) {
  const [w, h] = PROP_SIZES[name];
  return <Tile name={name} x={Math.round(x - w / 2)} y={y - h} />;
}

// Beschriftung „MEHL“ in 3×5-Pixel-Buchstaben
const LETTERS: Record<string, string[]> = {
  M: ['k.k', 'kkk', 'kkk', 'k.k', 'k.k'],
  E: ['kkk', 'k..', 'kk.', 'k..', 'kkk'],
  H: ['k.k', 'k.k', 'kkk', 'k.k', 'k.k'],
  L: ['k..', 'k..', 'k..', 'k..', 'kkk'],
};
const LABEL_ROWS = [0, 1, 2, 3, 4].map((row) => [...'MEHL'].map((c) => LETTERS[c]![row]).join('.'));
/** Aufschrift „MEHL“ (15×5) in der Konturfarbe des Sacks aus „[LPC] Containers“, auf dessen helle Oberseite gedruckt */
const MEHL_INK = fromMap(LABEL_ROWS, { k: '#6f533e' });

/** Mehlsack aus „[LPC] Containers“ (32×25) mit gezeichneter Aufschrift, linke obere Ecke bei (x, y) */
export function Mehlsack({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Tile name="mehlsack" x={x} y={y} />
      <Rects px={shift(MEHL_INK, x + 9, y + 7)} />
    </g>
  );
}
