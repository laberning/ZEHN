// IDs, die in Spielständen stehen können, und das Nachtragen in `knownIds.ts` (Aufruf: `npm run ids`, scripts/ids/update.ts).
// `presentIds()` sammelt, was es im Spiel gibt: die Akte in `ACTS` (nicht `STAGED_ACTS`: vorbereitete Akte stehen in keinem
// Spielstand) und die globalen Kataloge. `updateKnownIdsSource` ergänzt fehlende IDs im Text der Datei und entfernt nie etwas.

import type { Line } from '../domain/dialog.ts';
import { ARCADE_GAMES } from './arcadeGames.ts';
import { BADGES } from './badges.ts';
import { ITEMS } from './items.ts';
import { ACTS, EXTRA_CASES, SCENES } from './story/acts.ts';
import { ALL_ITEMS } from './wardrobe.ts';

/** Was es heute gibt, in der Form von `KNOWN_IDS` */
export interface PresentIds {
  scenes: string[];
  /** Antwort-IDs je Szene (nur Szenen mit Antworten) */
  answers: Record<string, string[]>;
  book: string[];
  items: string[];
  cases: string[];
  badges: string[];
  wardrobe: string[];
  modules: string[];
  lessons: string[];
  arcade: string[];
}

/** Alle Antwort-IDs in Zeilen, auch in Antworten auf Antworten */
export const choiceIds = (lines: readonly Line[]): string[] => lines.flatMap((l) => (l.choices ?? []).flatMap((c) => [c.id, ...choiceIds(c.reply ?? [])]));

const isLines = (v: unknown): v is Line[] => Array.isArray(v) && v.every((l) => typeof l === 'object' && l !== null && 'speaker' in l);

const unique = (ids: readonly string[]): string[] => [...new Set(ids)];

/** Alle IDs, die in einem Spielstand stehen können (Akte im Spiel und globale Kataloge) */
export function presentIds(): PresentIds {
  const bookLines: Line[][] = ACTS.flatMap((a) => [a.book.prolog ?? [], ...[...Object.values(a.book.lessons), a.book.exam].flatMap((x) => Object.values(x).filter(isLines))]);
  const answers: Record<string, string[]> = {};
  for (const s of SCENES) {
    const ids = unique(choiceIds(s.lines));
    if (ids.length) answers[s.id] = ids;
  }
  return {
    scenes: SCENES.map((s) => s.id),
    answers,
    book: unique(bookLines.flatMap(choiceIds)),
    items: ITEMS.map((i) => i.id),
    cases: EXTRA_CASES.map((c) => c.id),
    badges: BADGES.map((b) => b.id),
    wardrobe: ALL_ITEMS.map((w) => w.id),
    modules: ACTS.map((a) => a.module.id),
    lessons: ACTS.flatMap((a) => a.module.lessons.map((l) => l.id)),
    arcade: ARCADE_GAMES.map((g) => g.id),
  };
}

/** Wie lang eine neu angehängte Zeile höchstens wird (bestehende Zeilen bleiben, wie sie sind) */
const MAX_LINE = 160;
const INDENT = '    ';
const quote = (ids: readonly string[]): string[] => ids.map((id) => `'${id}'`);

/** `'a', 'b', 'c',` in Zeilen bis etwa MAX_LINE Zeichen */
function wrapIds(ids: readonly string[]): string[] {
  const lines: string[] = [];
  let line = '';
  for (const q of quote(ids)) {
    const next = line ? `${line} ${q},` : `${INDENT}${q},`;
    if (line && next.length > MAX_LINE) {
      lines.push(line);
      line = `${INDENT}${q},`;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

const idsIn = (text: string): string[] => [...text.matchAll(/'([^']+)'/g)].map((m) => m[1]!);

/** Ort eines Abschnitts: Zeilen zwischen `  key: [` bzw. `  key: {` und der schließenden Zeile (`  ] as …` bzw. `  } as …`) */
function section(lines: string[], key: string, open: '[' | '{'): { from: number; to: number } {
  const from = lines.findIndex((l) => l.startsWith(`  ${key}: ${open}`));
  const close = open === '[' ? '  ]' : '  }';
  const to = from < 0 ? -1 : lines.findIndex((l, i) => i > from && l.startsWith(close));
  if (from < 0 || to < 0) throw new Error(`knownIds.ts: Abschnitt „${key}“ nicht gefunden`);
  return { from, to };
}

/**
 * Trägt in den Text von `knownIds.ts` alle IDs aus `present` ein, die fehlen. Entfernt nie etwas, bricht keine bestehende Zeile um
 * (neue IDs kommen in neue Zeilen vor dem Ende des Abschnitts; fehlende Antworten einer bekannten Szene werden an deren Zeile gehängt)
 * und ändert nichts, wenn nichts fehlt.
 */
export function updateKnownIdsSource(text: string, present: PresentIds): string {
  const lines = text.split('\n');

  // Antworten je Szene zuerst; jeder Abschnitt wird danach neu gesucht, weil eingefügte Zeilen die Lage verschieben
  const answers = section(lines, 'answers', '{');
  const known = new Map<string, number>();
  for (let i = answers.from + 1; i < answers.to; i++) {
    const m = /^(\s+)'([^']+)': \[(.*)\],$/.exec(lines[i]!);
    if (m) known.set(m[2]!, i);
  }
  const added: string[] = [];
  for (const [sceneId, ids] of Object.entries(present.answers)) {
    const at = known.get(sceneId);
    if (at === undefined) {
      added.push(`    '${sceneId}': [${quote(ids).join(', ')}],`);
      continue;
    }
    const have = idsIn(lines[at]!.slice(lines[at]!.indexOf('[')));
    const missing = ids.filter((id) => !have.includes(id));
    if (missing.length) lines[at] = lines[at]!.replace(/\],$/, `, ${quote(missing).join(', ')}],`);
  }
  if (added.length) lines.splice(answers.to, 0, ...added);

  for (const key of ['scenes', 'book', 'items', 'cases', 'badges', 'wardrobe', 'modules', 'lessons', 'arcade'] as const) {
    const { from, to } = section(lines, key, '[');
    const have = new Set(idsIn(lines.slice(from + 1, to).join('\n')));
    const missing = unique(present[key]).filter((id) => !have.has(id));
    if (missing.length) lines.splice(to, 0, ...wrapIds(missing));
  }
  return lines.join('\n');
}
