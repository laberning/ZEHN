// Pixelgrafiken: gemeinsame Bausteine (Zeichen-Karten, Rechtecke, Scheiben) für alle Pixelbilder; Farben in palette.ts.

import { PALETTE, type PaletteName } from './palette.ts';

export type Px = [x: number, y: number, w: number, h: number, color: string];

/** Wandelt eine Zeichen-Karte in Rechtecke um (gleiche Farben einer Zeile werden zusammengefasst). */
export function fromMap(rows: string[], palette: Record<string, string>): Px[] {
  const px: Px[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x]!;
      let run = 1;
      while (row[x + run] === ch) run++;
      const color = palette[ch];
      if (color) px.push([x, y, run, 1, color]);
      x += run;
    }
  });
  return px;
}

/** Legende einer Zeichen-Karte: Zeichen → Palettenname; `.` ist immer leer und steht nicht in der Legende */
export type Legend = Readonly<Record<string, PaletteName>>;

/**
 * Zeichen-Karte mit Palettenfarben in Rechtecke umwandeln (Weg der eigenen Bilder, docs/design/grafik.md). Alle Zeilen sind
 * gleich lang, `.` ist leer, jedes andere Zeichen muss in der Legende stehen – sonst ein Fehler beim Laden des Moduls.
 */
export function fromPalette(rows: readonly string[], legend: Legend): Px[] {
  if ('.' in legend) throw new Error('Zeichen-Karte: „.“ ist immer leer und gehört nicht in die Legende');
  const width = rows[0]?.length ?? 0;
  rows.forEach((row, y) => {
    if (row.length !== width) throw new Error(`Zeichen-Karte: Zeile ${y} hat ${row.length} statt ${width} Zeichen`);
    for (const ch of row) if (ch !== '.' && !(ch in legend)) throw new Error(`Zeichen-Karte: „${ch}“ in Zeile ${y} steht nicht in der Legende`);
  });
  const colors = Object.fromEntries(Object.entries(legend).map(([ch, name]) => [ch, PALETTE[name]]));
  return fromMap([...rows], colors);
}

export const rect = (x: number, y: number, w: number, h: number, color: string): Px => [x, y, w, h, color];

/** Runde Scheibe aus Rechteckzeilen (Stilregel: keine Kreise) */
export function disc(cx: number, cy: number, r: number, color: string): Px[] {
  return Array.from({ length: 2 * r + 1 }, (_, i) => {
    const dy = i - r;
    const half = Math.round(Math.sqrt(r * r + 0.5 - dy * dy));
    return rect(cx - half, cy + dy, 2 * half + 1, 1, color);
  });
}

/** Eine Pixelkarte an eine andere Stelle des Rasters schieben (statt `translate` im SVG) */
export const shift = (px: readonly Px[], dx: number, dy: number): Px[] => px.map(([x, y, w, h, c]) => [x + dx, y + dy, w, h, c]);

/**
 * Stufe eines Stufenbilds: Grundkarte plus ein Rechteck aus einer Zeichen-Karte ohne leere Felder an (x, y); es wird über die
 * Grundkarte gezeichnet und ersetzt sie dort (Stufenbilder in ui/pictures/akt2.tsx, akt3.tsx)
 */
export const patch = (base: readonly Px[], x: number, y: number, rows: readonly string[], legend: Legend): Px[] => [...base, ...shift(fromPalette(rows, legend), x, y)];

/** Gerade Linie als Treppe aus Feldern (Stilregel: keine glatten Linien) */
export function stairs([x0, y0]: [number, number], [x1, y1]: [number, number], color: string, thick = 1): Px[] {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  return Array.from({ length: n + 1 }, (_, i) => rect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), thick, thick, color));
}
