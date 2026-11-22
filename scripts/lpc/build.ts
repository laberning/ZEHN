// Holt die benötigten LPC-Grafiken aus dem Universal-LPC-Generator, schneidet die Animationen idle und walk
// in allen vier Blickrichtungen aus und schreibt:
//   public/assets/lpc/*.png          – die Ebenen (Grundfarben, Umfärben passiert im Browser)
//   src/content/lpc.generated.json   – Teile, Ebenen, Paletten und Credits
//   public/assets/CREDITS.csv        – Urheber und Lizenzen aller verwendeten Grafiken
//
// Aufruf: npm run assets:lpc
// Das Repository wird nur gelesen (JSON und PNG), es wird kein Code daraus ausgeführt.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pngjs, { type PNG as Png } from 'pngjs';
import { ANIMS, BODY_TYPES, PARTS, type Anim, type BodyType } from './parts.ts';

const { PNG } = pngjs;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REPO = join(ROOT, '.cache/lpc');
const REPO_URL = 'https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator.git';
const OUT_IMG = join(ROOT, 'public/assets/lpc');
const OUT_JSON = join(ROOT, 'src/content/lpc.generated.json');
const OUT_CSV = join(ROOT, 'public/assets/CREDITS.csv');
const FRAME = 64;
/** Blickrichtungen in der Reihenfolge der Reihen eines LPC-Bogens */
const DIRECTIONS = ['up', 'left', 'down', 'right'] as const;

/** Ausschnitt einer Sheet-Definition des Generators (nur was wir lesen) */
interface SheetDef {
  name: string;
  variants?: string[];
  recolors?: { material?: string } & Record<string, { material?: string } | string | undefined>;
  credits?: { file: string; authors: string[]; licenses: string[]; urls: string[]; notes?: string }[];
  [layer: `layer_${string}`]: ({ zPos: number } & Partial<Record<BodyType, string>>) | undefined;
}

interface Layer {
  z: number;
  src: Partial<Record<Anim, string>>;
}
interface PartEntry {
  name: string;
  materials: string[];
  layers: Partial<Record<BodyType, Layer[]>>;
}
interface Credit {
  file: string;
  authors: string[];
  licenses: string[];
  urls: string[];
  notes: string;
}

function git(...args: string[]): Buffer {
  return execFileSync('git', ['-C', REPO, ...args], { maxBuffer: 64 * 1024 * 1024 });
}

if (!existsSync(join(REPO, '.git'))) {
  console.log('Lade LPC-Generator (nur Metadaten) …');
  mkdirSync(dirname(REPO), { recursive: true });
  execFileSync('git', ['clone', '--depth', '1', '--filter=blob:none', '--sparse', REPO_URL, REPO], { stdio: 'inherit' });
  git('sparse-checkout', 'set', '--no-cone', '/sheet_definitions/**', '/palette_definitions/**', '/README.md');
}
const commit = git('rev-parse', 'HEAD').toString().trim();
const allFiles = new Set(git('ls-tree', '-r', '--name-only', 'HEAD').toString().split('\n'));
const readJson = <T>(p: string): T => JSON.parse(readFileSync(join(REPO, p), 'utf8')) as T;

/** PNG aus dem Repo (wird bei Bedarf einzeln nachgeladen) */
function loadPng(path: string): Png {
  return PNG.sync.read(git('show', `HEAD:${path}`));
}

/** Schneidet `frames` Bilder je Blickrichtung aus; fehlt idle, wird das erste walk-Bild verwendet. */
function cropRows(png: Png, frames: number): Png {
  const rows = DIRECTIONS.length;
  if (png.height < rows * FRAME) throw new Error(`Bogen hat nur ${png.height / FRAME} Reihen`);
  const out = new PNG({ width: FRAME * frames, height: FRAME * rows });
  for (let r = 0; r < rows; r++)
    for (let f = 0; f < frames; f++) {
      const sx = Math.min(f, png.width / FRAME - 1) * FRAME;
      PNG.bitblt(png, out, sx, r * FRAME, FRAME, FRAME, f * FRAME, r * FRAME);
    }
  return out;
}

function sheetPath(layerDir: string, anim: string, variant?: string): string {
  const base = `spritesheets/${layerDir}`;
  return variant ? `${base}${anim}/${variant}.png` : `${base}${anim}.png`;
}

function materialsOf(def: SheetDef): string[] {
  const r = def.recolors;
  if (!r) return [];
  if (r.material) return [r.material];
  return Object.values(r).flatMap((x) => (typeof x === 'object' && x.material ? [x.material] : []));
}

rmSync(OUT_IMG, { recursive: true, force: true });
mkdirSync(OUT_IMG, { recursive: true });

const written = new Map<string, string>(); // Quellpfad → Ausgabedatei
const manifest = {
  source: { repo: REPO_URL, commit },
  frame: FRAME,
  directions: DIRECTIONS,
  anims: ANIMS,
  parts: {} as Record<string, PartEntry>,
  palettes: {} as Record<string, { base: unknown; variants: unknown }>,
  credits: [] as (Credit & { usedBy: string[] })[],
};
const creditMap = new Map<string, Credit & { usedBy: Set<string> }>();

for (const [id, part] of Object.entries(PARTS)) {
  const def = readJson<SheetDef>(`sheet_definitions/${part.def}`);
  const materials = part.materials ?? materialsOf(def);
  if (part.variant && !def.variants?.includes(part.variant)) throw new Error(`${id}: Variante ${part.variant} gibt es nicht`);
  const entry: PartEntry = { name: def.name, materials, layers: {} };
  const usedDirs = new Set<string>();

  for (const bt of part.bodyTypes ?? BODY_TYPES) {
    const layers: Layer[] = [];
    for (const [key, value] of Object.entries(def)) {
      if (!key.startsWith('layer_')) continue;
      const layer = value as NonNullable<SheetDef[`layer_${string}`]>;
      const dir = layer[bt];
      if (!dir) continue;
      usedDirs.add(dir);
      const srcs: Layer['src'] = {};
      for (const [anim, { frames }] of Object.entries(ANIMS) as [Anim, { frames: number }][]) {
        let path = sheetPath(dir, anim, part.variant);
        if (!allFiles.has(path)) path = sheetPath(dir, 'walk', part.variant); // Ersatz
        if (!allFiles.has(path)) throw new Error(`${id}/${bt}: ${path} fehlt`);
        const key = `${path}|${anim}`;
        let outName = written.get(key);
        if (!outName) {
          const png = PNG.sync.write(cropRows(loadPng(path), frames));
          // Inhalts-Hash im Namen: Ändert sich eine Grafik, ändert sich die Adresse – Browser zeigen nie eine alte Kopie aus dem Cache
          const hash = createHash('sha256').update(png).digest('hex').slice(0, 8);
          outName = `${path.replace(/^spritesheets\//, '').replace(/\.png$/, '').replace(/[^a-z0-9]+/gi, '_')}__${anim}.${hash}.png`;
          writeFileSync(join(OUT_IMG, outName), png);
          written.set(key, outName);
        }
        srcs[anim] = `assets/lpc/${outName}`;
      }
      layers.push({ z: layer.zPos, src: srcs });
    }
    if (layers.length) entry.layers[bt] = layers.sort((a, b) => a.z - b.z);
  }
  if (!Object.keys(entry.layers).length) throw new Error(`${id}: keine Ebenen für ${part.bodyTypes ?? BODY_TYPES}`);
  manifest.parts[id] = entry;

  // Credits: nur Einträge, die zu den verwendeten Ordnern gehören
  for (const c of def.credits ?? []) {
    const used = [...usedDirs].some((d) => d.startsWith(c.file) || c.file.startsWith(d.replace(/\/$/, '')));
    if (!used) continue;
    const key = `${c.file}|${c.authors.join(',')}`;
    const existing = creditMap.get(key);
    if (existing) existing.usedBy.add(def.name);
    else creditMap.set(key, { file: c.file, authors: c.authors, licenses: c.licenses, urls: c.urls, notes: c.notes ?? '', usedBy: new Set([def.name]) });
  }
  console.log(`✓ ${id} (${def.name})`);
}

// Paletten: Quellfarben (Basisvariante) und alle Zielvarianten
for (const mat of new Set(Object.values(manifest.parts).flatMap((p) => p.materials))) {
  const meta = readJson<{ base: unknown }>(`palette_definitions/${mat}/meta_${mat}.json`);
  const variants = readJson<unknown>(`palette_definitions/${mat}/${mat}_ulpc.json`);
  manifest.palettes[mat] = { base: meta.base, variants };
}

manifest.credits = [...creditMap.values()].map((c) => ({ ...c, usedBy: [...c.usedBy].sort() }));
writeFileSync(OUT_JSON, JSON.stringify(manifest, null, 1) + '\n');

const csv = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
const rows = [['Datei', 'Verwendet für', 'Autoren', 'Lizenzen', 'Quellen', 'Hinweise'].map(csv).join(',')];
for (const c of manifest.credits) rows.push([c.file, c.usedBy.join('; '), c.authors.join('; '), c.licenses.join('; '), c.urls.join(' '), c.notes].map(csv).join(','));
writeFileSync(OUT_CSV, rows.join('\n') + '\n');

console.log(`\n${written.size} Grafiken, ${manifest.credits.length} Credit-Einträge (LPC-Commit ${commit.slice(0, 7)})`);
