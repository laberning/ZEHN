// Prüfung eines gezeichneten Bildes am fertigen SVG (Text aus `renderToStaticMarkup`): Rastergröße passt zur Bildart, nur
// Palettenfarben, der Rand ist Kontur oder leer, nur Rechtecke auf dem Raster, nichts verschoben. Nutzt der Bild-Test (pictures.test.ts) und der Bogen.

import { COLORS, OUTLINE } from './palette.ts';
import { inlineImages } from './pixelImage.ts';
import { kindOfSize, type PictureKind } from './pictureKinds.ts';

/** Gruppe eines registrierten Bildes (ui/pictures/registry.ts) */
export type PictureGroup = 'story' | 'gadget' | 'kruemel' | 'symbol';

/** Was ein Bild sein darf: Story-Bilder sind Beweisstück, Story-Objekt, Fallbild oder ein Porträt in Gadget-Größe, Gadgets Gadget-Symbole, die Symbole der Oberfläche (Lautsprecher, Schloss) Beweisstück oder Gadget-Größe */
const KINDS_OF: Record<PictureGroup, readonly PictureKind[]> = {
  story: ['gadget', 'evidence', 'object', 'panorama'],
  gadget: ['gadget'],
  kruemel: ['gadget', 'evidence', 'object', 'panorama'],
  symbol: ['gadget', 'evidence'],
};

/** Elemente eines gezeichneten Bildes: das SVG, Rechtecke, Gruppen und der Titel */
const ALLOWED_TAGS = new Set(['svg', 'rect', 'g', 'title']);

const attrs = (tag: string): Record<string, string> => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1]!, m[2]!]));

/** Rastergröße aus der `viewBox` des äußeren SVG */
export function svgSize(svg: string): { w: number; h: number } | undefined {
  const m = /viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(svg);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : undefined;
}

/** Alle Farben im SVG (`fill`, `stroke`, auch in `style`), klein geschrieben */
function colorsIn(svg: string): Set<string> {
  const found = [...svg.matchAll(/(?:fill|stroke)(?:="|:\s*)([^";]+)/g)].map((m) => m[1]!.trim().toLowerCase());
  return new Set(found.filter((c) => c !== 'none'));
}

/** Farben am Rand: Felder der ersten und letzten Zeile und Spalte, die zuletzt gezeichnete Farbe zählt */
function borderColors(svg: string, w: number, h: number): Set<string> {
  const cells = new Map<number, string>();
  for (const m of svg.matchAll(/<rect\b[^>]*>/g)) {
    const a = attrs(m[0]);
    const [x, y, rw, rh] = [a.x, a.y, a.width, a.height].map(Number) as [number, number, number, number];
    for (let cy = Math.max(0, y); cy < Math.min(h, y + rh); cy++)
      for (let cx = Math.max(0, x); cx < Math.min(w, x + rw); cx++) cells.set(cy * w + cx, (a.fill ?? '').toLowerCase());
  }
  const edge = [...cells].filter(([i]) => {
    const [cx, cy] = [i % w, Math.floor(i / w)];
    return cx === 0 || cy === 0 || cx === w - 1 || cy === h - 1;
  });
  return new Set(edge.map(([, c]) => c));
}

/** Was an einem Bild nicht passt (leer: besteht) */
export function pictureProblems(markup: string, group: PictureGroup): string[] {
  // das Bild steht als `<image>` im Markup; geprüft werden die Flächen darin
  const svg = inlineImages(markup);
  const problems: string[] = [];
  const size = svgSize(svg);
  if (!size) return ['keine viewBox „0 0 Breite Höhe“'];
  const kind = kindOfSize(size.w, size.h);
  if (!kind || !KINDS_OF[group].includes(kind)) problems.push(`Größe ${size.w}×${size.h} ist keine Bildart für ${group} (${KINDS_OF[group].join(', ')})`);
  const free = [...colorsIn(svg)].filter((c) => !COLORS.has(c));
  if (free.length) problems.push(`Farben außerhalb der Palette: ${free.slice(0, 5).join(' ')}${free.length > 5 ? ' …' : ''}`);
  const border = [...borderColors(svg, size.w, size.h)].filter((c) => c !== OUTLINE);
  if (border.length) problems.push(`Rand nicht Kontur oder leer: ${border.slice(0, 5).join(' ')}`);
  // Nur Rechtecke: SVG-Text färbt das Stylesheet (die Prüfung sähe die Farbe nicht), Kreise und Pfade verlassen das Raster
  const shapes = [...new Set([...svg.matchAll(/<([a-zA-Z][\w-]*)/g)].map((m) => m[1]!))].filter((t) => !ALLOWED_TAGS.has(t));
  if (shapes.length) problems.push(`nur Rechtecke erlaubt: ${shapes.map((t) => `<${t}>`).join(' ')}`);
  if (/\stransform="/.test(svg)) problems.push('verschobene Teile (transform) statt Rasterfeldern');
  if ([...svg.matchAll(/<rect\b[^>]*>/g)].some((m) => [attrs(m[0]).x, attrs(m[0]).y, attrs(m[0]).width, attrs(m[0]).height].some((v) => !Number.isInteger(Number(v)))))
    problems.push('Rechtecke außerhalb des Rasters');
  return problems;
}
