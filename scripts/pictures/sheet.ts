// Bogen der eigenen Bilder zum Anschauen: alle registrierten Bilder (Story-Bilder, Gadget-Symbole, Krümel) mit Kennung,
// Bildart, Rastergröße und Prüfergebnis, vierfach vergrößert auf dunklem und hellem Grund, dazu die Palette und zwei Kacheln
// zum Vergleich. Schreibt `index.html` und `bogen.png` (über Playwright) in einen Ordner außerhalb des Repositorys.
//
// Aufruf: npm run pictures:sheet -- <Zielordner>    (ohne Angabe: ../zehn-bilder neben dem Repository)
// Nicht Teil des Builds; die Bilder lädt Vite im SSR-Modus direkt aus src/.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCALE = 4;
/** Kacheln zum Vergleich: eine Requisite und ein Möbel aus den LPC-Paketen */
const COMPARE_TILES = ['paket', 'ofen'];

// Was der Bogen aus src/ liest (die Typen dort sind für den Browser übersetzt, hier genügen die Felder)
interface Picture {
  key: string;
  group: 'story' | 'gadget' | 'kruemel' | 'symbol';
  tile?: string;
  render: () => ReactElement;
}
interface Sources {
  registry: { registeredPictures: () => Picture[] };
  palette: { PALETTE: Record<string, string> };
  kinds: { kindOfSize: (w: number, h: number) => string | undefined };
  check: { pictureProblems: (svg: string, group: Picture['group']) => string[]; svgSize: (svg: string) => { w: number; h: number } | undefined };
}

const target = resolve(process.argv[2] ?? join(ROOT, '..', 'zehn-bilder'));
const inside = relative(ROOT, target);
// außerhalb heißt: der Weg vom Repository aus beginnt mit „..“ als ganzem Schritt (ein Ordner „..bilder“ im Repository zählt nicht)
if (!(inside === '..' || inside.startsWith(`..${sep}`) || isAbsolute(inside))) throw new Error(`Der Bogen gehört nicht ins Repository: ${target}`);

const dataUri = (file: string, type: string): string => `data:${type};base64,${readFileSync(file).toString('base64')}`;
const tileUri = (name: string): string => dataUri(join(ROOT, 'public/assets/props', `${name}.png`), 'image/png');
const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Äußeres SVG auf die vierfache Rastergröße setzen, Kacheln als data-URI einbetten */
function enlarge(markup: string, w: number, h: number): string {
  const withTiles = markup.replace(/href="[^"]*assets\/props\/([\w-]+)\.png"/g, (_, name: string) => `href="${tileUri(name)}"`);
  return withTiles.replace(/<svg\b[^>]*>/, (tag) =>
    tag
      .replace(/\s(?:width|height|style)="[^"]*"/g, '')
      .replace('<svg', `<svg width="${w * SCALE}" height="${h * SCALE}"`),
  );
}

async function loadSources(): Promise<Sources> {
  const vite = await createServer({ root: ROOT, configFile: join(ROOT, 'vite.config.ts'), server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
  try {
    const load = (path: string) => vite.ssrLoadModule(path);
    return {
      registry: (await load('/src/ui/pictures/registry.ts')) as Sources['registry'],
      palette: (await load('/src/ui/pixel/palette.ts')) as Sources['palette'],
      kinds: (await load('/src/ui/pixel/pictureKinds.ts')) as Sources['kinds'],
      check: (await load('/src/ui/pixel/pictureCheck.ts')) as Sources['check'],
    };
  } finally {
    await vite.close();
  }
}

function page({ registry, palette, kinds, check }: Sources): { html: string; count: number } {
  const cards = registry.registeredPictures().map((p) => {
    const markup = renderToStaticMarkup(p.render());
    const size = check.svgSize(markup) ?? { w: 0, h: 0 };
    const kind = p.tile ? `Kachel ${p.tile}` : (kinds.kindOfSize(size.w, size.h) ?? 'keine Bildart');
    const problems = p.tile ? [] : check.pictureProblems(markup, p.group);
    const svg = enlarge(markup, size.w, size.h);
    return `<figure class="card${problems.length ? ' legacy' : ''}">
  <div class="pair"><div class="dark">${svg}</div><div class="light">${svg}</div></div>
  <figcaption><b>${esc(p.key)}</b> · ${esc(kind)} · ${size.w}×${size.h}${problems.length ? `<br><small>${problems.map(esc).join('<br>')}</small>` : p.tile ? '' : '<br><small class="ok">besteht</small>'}</figcaption>
</figure>`;
  });
  const swatches = Object.entries(palette.PALETTE)
    .map(([name, hex]) => `<li><span class="sw" style="background:${hex}"></span>${esc(name)}<br><small>${hex}</small></li>`)
    .join('');
  const tiles = COMPARE_TILES.map((t) => `<figure class="card"><div class="pair"><div class="dark"><img src="${tileUri(t)}" class="tile"></div><div class="light"><img src="${tileUri(t)}" class="tile"></div></div><figcaption><b>Kachel ${t}</b></figcaption></figure>`).join('');
  const font = dataUri(join(ROOT, 'node_modules/@fontsource/silkscreen/files/silkscreen-latin-400-normal.woff2'), 'font/woff2');
  const appCss = ['mission.css', 'scene.css'].map((f) => readFileSync(join(ROOT, 'src/ui/styles', f), 'utf8')).join('\n');
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>ZEHN – Bogen der Bilder</title>
<style>
@font-face { font-family: 'Silkscreen'; src: url(${font}) format('woff2'); }
:root { --pixel: 'Silkscreen', monospace; --mono: monospace; }
${appCss}
body { margin: 24px; background: #0a0e19; color: #e8ecf8; font: 14px system-ui, sans-serif; }
h1, h2 { font-weight: 600; }
.palette { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 12px; }
.palette li { width: 92px; font-size: 12px; }
.sw { display: block; width: 92px; height: 32px; border: 1px solid #444; margin-bottom: 4px; }
.grid { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
.card { margin: 0; padding: 8px; border: 1px solid #2a3350; border-radius: 6px; }
.card.legacy { border-style: dashed; }
.pair { display: flex; gap: 8px; }
.pair > div { padding: 8px; }
.dark { background: #141c31; }
.light { background: #e9e6da; }
.pair svg, .tile { display: block; image-rendering: pixelated; }
.tile { zoom: ${SCALE}; }
figcaption { margin-top: 6px; font-size: 12px; max-width: 840px; }
small { color: #9aa4bd; }
small.ok { color: #53bf71; }
</style></head><body>
<h1>Bogen der Bilder</h1>
<p>Vierfache Größe, links auf dunklem, rechts auf hellem Grund. Gestrichelt: ein Bild, das die Prüfung nicht besteht.</p>
<h2>Palette</h2><ul class="palette">${swatches}</ul>
<h2>Kacheln zum Vergleich</h2><div class="grid">${tiles}</div>
<h2>Bilder</h2><div class="grid">${cards.join('\n')}</div>
</body></html>`;
  return { html, count: cards.length };
}

const { html, count } = page(await loadSources());
mkdirSync(target, { recursive: true });
const htmlFile = join(target, 'index.html');
writeFileSync(htmlFile, html);
const browser = await chromium.launch();
try {
  const tab = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await tab.goto(pathToFileURL(htmlFile).href);
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: join(target, 'bogen.png'), fullPage: true });
} finally {
  await browser.close();
}
console.log(`${count} Bilder → ${htmlFile} und bogen.png`);
