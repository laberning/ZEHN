// Bild-Test: jedes registrierte eigene Bild (Story-Bilder, Gadget-Symbole, Krümel, die Symbole der Oberfläche) folgt der Pipeline –
// Bildart-Größe, nur Palettenfarben, Rand Kontur oder leer, nur Rechtecke (pictureCheck.ts). Ausnahmen gibt es nicht.

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { registeredPictures } from '../pictures/registry.ts';
import { COLORS, OUTLINE, PALETTE } from './palette.ts';
import { pictureProblems } from './pictureCheck.ts';

// Die Quellen der Bild-Ordner als Text – so liest der Test sie ohne Dateisystem (Schlüssel relativ zu src/)
const SOURCES = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>(['../pictures/*.{ts,tsx}', '../components/*.{ts,tsx}', './*.{ts,tsx}', '!../**/*.test.*'], { query: '?raw', import: 'default', eager: true }),
  ).map(([path, text]) => [path.replace(/^\.\.\//, 'ui/').replace(/^\.\//, 'ui/pixel/'), text]),
);

/**
 * Dateien in diesen Ordnern, die keine eigenen Bilder zeichnen, sondern Kulissen und ihre Kacheln (Scene.tsx, die Aufschrift
 * „MEHL“ in der Farbe der LPC-Kachel in sceneProps.tsx) und die gezeichneten Teile der Story-Objekte (StoryObject.tsx: Mehlstaub,
 * Code-Streifen, Knotennetz). Sie gehören nicht zu den eigenen Bildern (docs/design/grafik.md, „Kulissen“).
 */
const NOT_PICTURES = new Set(['ui/components/Scene.tsx', 'ui/pixel/sceneProps.tsx', 'ui/components/StoryObject.tsx']);

const pictures = registeredPictures();

const drawn = pictures.filter((p) => !p.tile);

describe('Bild-Pipeline: registrierte Bilder', () => {
  // ein Test je Bild: so meldet der Test das Bild beim Namen, und kein einzelner Test rendert alle Bilder auf einmal (Zeitgrenze unter Last)
  it.each(drawn.map((p) => [p.key, p] as const))('%s besteht die Prüfung', (_key, p) => {
    expect(pictureProblems(renderToStaticMarkup(p.render()), p.group)).toEqual([]);
  });

  it('alle gezeichneten Bilder sind dabei, nur Kacheln sind ausgenommen', () => {
    expect(drawn.length).toBeGreaterThan(100);
    expect(pictures.filter((p) => p.tile).map((p) => p.key)).toEqual(['story:paket']);
  });

  it('jede Kennung ist eindeutig, Story-Bilder, Gadgets, Krümel und die Symbole sind dabei', () => {
    expect(new Set(pictures.map((p) => p.key)).size).toBe(pictures.length);
    for (const key of ['story:notizbuch', 'story:portraet-tippi', 'gadget:stethoskop', 'kruemel', 'symbol:lautsprecher', 'symbol:schloss']) expect(pictures.some((p) => p.key === key), key).toBe(true);
  });
});

describe('Bild-Pipeline: freie Hexwerte', () => {
  const files = Object.keys(SOURCES);
  const freeHex = (file: string): string[] => [...(SOURCES[file] ?? '').matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0].toLowerCase()).filter((c) => !COLORS.has(c));

  it('die Dateien in ui/pictures/, ui/components/ und ui/pixel/ nutzen nur Palettenfarben', () => {
    expect(files).toEqual(expect.arrayContaining(['ui/pictures/akt1.tsx', 'ui/pictures/cases.tsx', 'ui/pictures/StoryPicture.tsx', 'ui/components/GadgetIcon.tsx', 'ui/components/gadgetIcons.ts', 'ui/pixel/Pixel.tsx']));
    const offenders = files.filter((f) => !NOT_PICTURES.has(f)).flatMap((f) => freeHex(f).map((c) => `${f}: ${c}`));
    expect(offenders).toEqual([]);
  });

  it('die Liste der Kulissen-Dateien nennt nur vorhandene Dateien mit freien Farben', () => {
    expect([...NOT_PICTURES].filter((f) => !(f in SOURCES) || freeHex(f).length === 0)).toEqual([]);
  });
});

describe('Bild-Prüfung (pictureProblems)', () => {
  const svg = (w: number, h: number, rects: string) => `<svg viewBox="0 0 ${w} ${h}">${rects}</svg>`;
  const r = (x: number, y: number, w: number, h: number, c: string) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"></rect>`;
  const framed = (w: number, h: number, inner: string) => svg(w, h, r(0, 0, w, h, OUTLINE) + inner);

  it('ein Gadget mit Kontur am Rand und Palettenfarben innen besteht', () => {
    expect(pictureProblems(framed(16, 16, r(1, 1, 14, 14, PALETTE.wood)), 'gadget')).toEqual([]);
  });

  it('leerer Rand besteht, Farbe am Rand nicht', () => {
    expect(pictureProblems(svg(32, 20, r(1, 1, 30, 18, PALETTE.paper)), 'story')).toEqual([]);
    expect(pictureProblems(svg(32, 20, r(0, 5, 30, 1, PALETTE.paper)), 'story')).toEqual([`Rand nicht Kontur oder leer: ${PALETTE.paper}`]);
  });

  it('meldet falsche Größe, freie Farben, verschobene Teile und Rechtecke neben dem Raster', () => {
    expect(pictureProblems(framed(30, 16, ''), 'story')[0]).toMatch(/^Größe 30×16/);
    expect(pictureProblems(framed(32, 20, ''), 'gadget')[0]).toMatch(/keine Bildart für gadget/);
    expect(pictureProblems(framed(16, 16, r(2, 2, 2, 2, '#FF00FF')), 'gadget')).toEqual(['Farben außerhalb der Palette: #ff00ff']);
    expect(pictureProblems(framed(16, 16, `<g transform="translate(1 0)">${r(2, 2, 2, 2, PALETTE.gold)}</g>`), 'gadget')).toEqual(['verschobene Teile (transform) statt Rasterfeldern']);
    expect(pictureProblems(framed(16, 16, r(2.5, 2, 2, 2, PALETTE.gold)), 'gadget')).toEqual(['Rechtecke außerhalb des Rasters']);
    expect(pictureProblems('<svg width="10"></svg>', 'gadget')).toEqual(['keine viewBox „0 0 Breite Höhe“']);
  });

  it('nur Rechtecke: SVG-Text, Kreise und Pfade fallen auf', () => {
    expect(pictureProblems(framed(16, 16, `<text x="2" y="8" fill="${PALETTE.ink}">A</text>`), 'gadget')).toEqual(['nur Rechtecke erlaubt: <text>']);
    expect(pictureProblems(framed(16, 16, `<g><circle cx="8" cy="8" r="3" fill="${PALETTE.gold}"></circle><path d="M1 1" fill="${PALETTE.red}"></path></g>`), 'gadget')).toEqual(['nur Rechtecke erlaubt: <circle> <path>']);
  });

  it('Farben in style und stroke zählen mit, die letzte Farbe eines Randfelds gilt', () => {
    expect(pictureProblems(framed(16, 16, '<rect x="1" y="1" width="1" height="1" style="fill:#123456"></rect>'), 'gadget')).toEqual(['Farben außerhalb der Palette: #123456']);
    expect(pictureProblems(svg(16, 16, r(0, 0, 16, 16, PALETTE.red) + r(0, 0, 16, 16, OUTLINE) + r(1, 1, 14, 14, PALETTE.red)), 'gadget')).toEqual([]);
  });
});
