// Architektur-Regeln automatisch prüfen: Wer darf wen importieren? (siehe docs/technik/architektur.md)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { emojisIn } from './test/emoji.ts';

const SRC = resolve(import.meta.dirname);

type Layer = 'domain' | 'content' | 'app' | 'platform' | 'features' | 'ui' | 'shell' | 'test' | 'main';

/** Wer darf welche Schichten importieren? */
const ALLOWED: Record<Layer, Layer[]> = {
  domain: ['domain'],
  content: ['content', 'domain'],
  app: ['app', 'content', 'domain'],
  platform: ['platform', 'app', 'domain'],
  ui: ['ui', 'app', 'content', 'domain'],
  features: ['features', 'ui', 'app', 'content', 'domain'],
  shell: ['shell', 'features', 'ui', 'app', 'content', 'domain'],
  test: ['test', 'app', 'content', 'domain', 'platform', 'ui', 'features', 'shell'],
  main: ['shell', 'app', 'platform', 'ui'],
};

const LAYERS = Object.keys(ALLOWED) as Layer[];

/** Welche Pakete (npm) eine Schicht benutzen darf */
const PACKAGES: Record<Layer, RegExp> = {
  domain: /^$/,
  content: /^$/,
  app: /^zustand\/vanilla$/,
  platform: /^dexie$/,
  ui: /^(react|zustand)$/,
  features: /^react$/,
  shell: /^react$/,
  test: /./,
  main: /^(react|react-dom\/client|@fontsource\/.+)$/,
};

/** Verbotene Seiteneffekte außerhalb der Plattform-Schicht (Uhr, Zufall, IDs, Datenbank) – auch als Referenz ohne Klammern */
const IMPURE = [/\bMath\.random\b/, /\bDate\.now\b/, /\bnew Date\(\)/, /\bperformance\.now\b/, /\bcrypto\./, /['"]dexie['"]/];
const PURE_LAYERS: Layer[] = ['domain', 'content', 'app', 'ui', 'features', 'shell'];

/** Der Kern und die Anwendungsschicht kennen keinen Browser */
const BROWSER = [
  /\bwindow\./,
  /\bdocument\./,
  /\bnavigator\b/,
  /\bglobalThis\b/,
  /\blocation\./,
  /\bfetch\(/,
  /\b(local|session)Storage\b/,
  /\b(set|clear)(Timeout|Interval)\(/,
  /\brequestAnimationFrame\b/,
  /\bindexedDB\b/,
  /\bAudioContext\b/,
];
const HEADLESS_LAYERS: Layer[] = ['domain', 'content', 'app'];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
}

function layerOf(file: string): Layer | null {
  const rel = relative(SRC, file);
  if (rel === 'main.tsx') return 'main';
  const first = rel.split('/')[0] as Layer;
  return LAYERS.includes(first) ? first : null;
}

const isTest = (f: string) => /\.test\.tsx?$/.test(f) || layerOf(f) === 'test';
const sources = files(SRC).filter((f) => !isTest(f) && !f.endsWith('architecture.test.ts'));

/** Alle Importpfade: `import … from`, `export … from`, `import 'x'` und `import('x')`, mit ' oder " */
function specifiers(file: string): string[] {
  const text = readFileSync(file, 'utf8');
  const re = /(?:\bfrom\s*|\bimport\s*\(?\s*)(['"])([^'"]+)\1/g;
  return [...text.matchAll(re)].map((m) => m[2]!);
}

/** Wie `specifiers`, aber ohne reine Typ-Importe (`import type …`) */
function valueSpecifiers(file: string): string[] {
  const text = readFileSync(file, 'utf8').replace(/\bimport\s+type\b[^;]*;/g, '');
  const re = /(?:\bfrom\s*|\bimport\s*\(?\s*)(['"])([^'"]+)\1/g;
  return [...text.matchAll(re)].map((m) => m[2]!);
}

/**
 * Was Bildschirme (ui/, features/, shell/) direkt aus content/ holen dürfen: Oberflächentexte,
 * Listen fürs Menü und Grafik-Daten. Regeldaten (Kurs, Abzeichen, Belohnungen, Medaillen-Schwellen, Szenen, Dinge, Fälle, Objekte,
 * Bilderbuch, Beschriftungen, Fallakten, Garderobe) kommen nur über den Store (`useGame((s) => s.rules…)`, `s.story`, `s.wardrobe`), damit Tests eigene Sätze übergeben können.
 */
const CONTENT_FOR_SCREENS = [
  'content/texts/', // Oberflächentexte je Thema (Präfix: der ganze Ordner), Sprecher, Krümels Tipps, Überschriften
  'content/arcadeGames.ts', // Namen und Beschreibungen der Spielhallen-Spiele
  'content/codenames.ts', // Vorschläge zum Würfeln bei der Rekrutierung
  'content/credits.ts', // Lizenzhinweise
  'content/lpc.generated.json', // Grafik-Manifest
];

/** Alle Dateien unter einem Ordner, beliebiger Art (für docs/) */
function allFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? allFiles(p) : [p];
  });
}
const DOCS = resolve(SRC, '..', 'docs');

const relativeImports = (file: string) => specifiers(file).filter((s) => s.startsWith('.')).map((s) => resolve(dirname(file), s));
const packageImports = (file: string) => specifiers(file).filter((s) => !s.startsWith('.'));

describe('Architektur', () => {
  it('jede Datei liegt in einer bekannten Schicht', () => {
    expect(files(SRC).filter((f) => layerOf(f) === null && !f.endsWith('architecture.test.ts') && !f.endsWith('pipeline.test.ts')).map((f) => relative(SRC, f))).toEqual([]);
  });

  it('Schichten importieren nur erlaubte Schichten', () => {
    const violations: string[] = [];
    for (const f of sources) {
      const from = layerOf(f)!;
      for (const target of relativeImports(f)) {
        const to = layerOf(target);
        if (!to || !ALLOWED[from].includes(to)) violations.push(`${relative(SRC, f)} → ${relative(SRC, target)}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('keine Import-Kreise (auch nicht über reine Typ-Importe)', () => {
    const known = new Set(sources);
    const graph = new Map(sources.map((f) => [f, relativeImports(f).flatMap((t) => [t, `${t}.ts`, `${t}.tsx`].filter((c) => known.has(c)))]));
    const state = new Map<string, 'open' | 'done'>();
    const stack: string[] = [];
    const cycles: string[] = [];
    const visit = (f: string): void => {
      state.set(f, 'open');
      stack.push(f);
      for (const t of graph.get(f) ?? []) {
        if (state.get(t) === 'open') cycles.push([...stack.slice(stack.indexOf(t)), t].map((x) => relative(SRC, x)).join(' → '));
        else if (!state.has(t)) visit(t);
      }
      stack.pop();
      state.set(f, 'done');
    };
    for (const f of sources) if (!state.has(f)) visit(f);
    expect(cycles).toEqual([]);
  });

  it('Schichten benutzen nur erlaubte Pakete', () => {
    const violations: string[] = [];
    for (const f of sources) {
      const layer = layerOf(f)!;
      for (const pkg of packageImports(f)) if (!PACKAGES[layer].test(pkg)) violations.push(`${relative(SRC, f)} → ${pkg}`);
    }
    expect(violations).toEqual([]);
  });

  it('Kern, Inhalte und Anwendung kennen keinen Browser', () => {
    const violations: string[] = [];
    for (const f of sources.filter((x) => HEADLESS_LAYERS.includes(layerOf(x)!))) {
      const text = readFileSync(f, 'utf8');
      for (const re of BROWSER) if (re.test(text)) violations.push(`${relative(SRC, f)}: ${re}`);
    }
    expect(violations).toEqual([]);
  });

  it('ein Feature importiert kein anderes Feature', () => {
    const violations: string[] = [];
    for (const f of sources.filter((x) => layerOf(x) === 'features')) {
      const own = relative(SRC, f).split('/')[1];
      for (const target of relativeImports(f)) {
        const rel = relative(SRC, target).split('/');
        if (rel[0] === 'features' && rel[1] !== own) violations.push(`${relative(SRC, f)} → ${rel.join('/')}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('Uhr, Zufall und Datenbank nur in platform/', () => {
    const violations: string[] = [];
    for (const f of sources.filter((x) => PURE_LAYERS.includes(layerOf(x)!))) {
      const text = readFileSync(f, 'utf8');
      for (const re of IMPURE) if (re.test(text)) violations.push(`${relative(SRC, f)}: ${re}`);
    }
    expect(violations).toEqual([]);
  });

  it('Komponenten greifen nicht am Store vorbei (kein getState() in features/ und shell/)', () => {
    // useActions() liefert nur Aktionen (Typ GameActions); Daten gibt es nur über useGame(selector)
    const violations = sources
      .filter((f) => ['features', 'shell'].includes(layerOf(f)!) && /\.getState\(\)/.test(readFileSync(f, 'utf8')))
      .map((f) => relative(SRC, f));
    expect(violations).toEqual([]);
  });

  it('gespeichert wird nur im Store (repo.save nur in app/store.ts)', () => {
    const violations = sources.filter((f) => relative(SRC, f) !== 'app/store.ts' && /\brepo\.save\b/.test(readFileSync(f, 'utf8'))).map((f) => relative(SRC, f));
    expect(violations).toEqual([]);
  });

  it('Bildschirme lesen Regeldaten nur über den Store (Inhaltsregel)', () => {
    const violations: string[] = [];
    for (const f of sources.filter((x) => ['ui', 'features', 'shell'].includes(layerOf(x)!))) {
      for (const s of valueSpecifiers(f).filter((x) => x.startsWith('.'))) {
        const target = relative(SRC, resolve(dirname(f), s));
        if (target.startsWith('content/') && !CONTENT_FOR_SCREENS.some((allowed) => (allowed.endsWith('/') ? target.startsWith(allowed) : target === allowed))) violations.push(`${relative(SRC, f)} → ${target}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('app/ holt echte Inhalte nur in rules.ts (und Oberflächentexte aus content/texts)', () => {
    const violations: string[] = [];
    for (const f of sources.filter((x) => layerOf(x) === 'app' && !x.endsWith('.test.ts'))) {
      for (const s of valueSpecifiers(f).filter((x) => x.startsWith('.'))) {
        const target = relative(SRC, resolve(dirname(f), s));
        if (target.startsWith('content/') && relative(SRC, f) !== 'app/rules.ts' && !target.startsWith('content/texts/')) violations.push(`${relative(SRC, f)} → ${target}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('keine unterstrichenen Textlinks mehr: Nebenaktionen sind Knöpfe der Klasse quiet', () => {
    const old = sources.filter((f) => /className="link\b/.test(readFileSync(f, 'utf8'))).map((f) => relative(SRC, f));
    expect(old).toEqual([]);
  });

  it('keine Emoji in den Quellen außer unter content/story/ (Funk, ADR-0006)', () => {
    const violations = sources
      .filter((f) => !relative(SRC, f).startsWith('content/story/'))
      .flatMap((f) => emojisIn(readFileSync(f, 'utf8')).map((e) => `${relative(SRC, f)}: ${e}`));
    expect(violations).toEqual([]);
  });

  it('Öffentliches Repository: keine Drehbücher unter docs/, kein Pfad auf ein Drehbuch', () => {
    const scripts = allFiles(DOCS)
      .filter((f) => /^story-(akt|auswertung)/.test(basename(f)))
      .map((f) => relative(DOCS, f));
    expect(scripts).toEqual([]);
    const path = ['docs', 'design', 'story-akt'].join('/'); // zusammengesetzt, damit diese Datei sich nicht selbst findet
    const mentions = [...files(SRC), ...allFiles(DOCS)].filter((f) => readFileSync(f, 'utf8').includes(path)).map((f) => relative(SRC, f));
    expect(mentions).toEqual([]);
  });
});
