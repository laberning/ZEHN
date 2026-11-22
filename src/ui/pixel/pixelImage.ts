// Ein Pixelbild als eine einzige SVG-Bilddatei im Speicher (`data:`-Adresse) statt eines Rechtecks je Fläche im DOM.
// Der Browser dekodiert jede Adresse nur einmal; `Grid` zeigt sie mit einem `<image>` (Pixel.tsx, docs/design/grafik.md).

import type { Px } from './pixelMap.ts';

/** je Karte und Rastergröße (dieselbe Karte kann auf verschiedenen Rastern stehen) */
const byMap = new WeakMap<readonly Px[], Map<string, string>>();
/** Karten, die erst beim Zeichnen entstehen: nach Inhalt gemerkt, mit Obergrenze (die älteste fliegt raus) */
const byContent = new Map<string, string>();
export const CONTENT_LIMIT = 200;

/** Adresse des Bildes zu den Rechtecken `px` auf einem Raster `w`×`h` */
export function pixelImageUrl(px: readonly Px[], w: number, h: number): string {
  const key = `${w}x${h}`;
  let cache = byMap.get(px);
  const known = cache?.get(key);
  if (known) return known;
  const rects = px.map(([x, y, pw, ph, c]) => `<rect x="${x}" y="${y}" width="${pw}" height="${ph}" fill="${c}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`;
  let url = byContent.get(svg);
  if (url) {
    byContent.delete(svg); // nach hinten: zuletzt benutzt
  } else {
    url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    if (byContent.size >= CONTENT_LIMIT) byContent.delete(byContent.keys().next().value!);
  }
  byContent.set(svg, url);
  if (!cache) byMap.set(px, (cache = new Map()));
  cache.set(key, url);
  return url;
}

/** Nur für Tests: wie viele Bilder nach Inhalt gemerkt sind */
export const contentCacheSize = () => byContent.size;

/** Das SVG hinter einer Bildadresse (für Prüfungen und Tests) */
export const svgOfUrl = (url: string): string => decodeURIComponent(url.slice(url.indexOf(',') + 1));

/** Setzt in einem Markup jedes Pixelbild (`<image href="data:…">`) wieder als Gruppe von Rechtecken ein; so prüft die Bild-Pipeline die gezeichneten Flächen */
export function inlineImages(markup: string): string {
  return markup.replace(/<image\b[^>]*?\bhref="(data:image\/svg\+xml,[^"]*)"[^>]*\/?>(?:<\/image>)?/g, (_m, url: string) => {
    const svg = svgOfUrl(url.replaceAll('&amp;', '&'));
    return `<g>${svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>'))}</g>`;
  });
}
