// Verweise auf Antworten: Jede Zeile, jeder Treffer und jeder Fallakten-Eintrag mit `ifPicked` zeigt auf eine Antwort, die es gibt
// und die ein Kind wirklich wählen kann. `knownIds.test.ts` schützt nur davor, dass eine ID verschwindet; hier geht es um Tippfehler
// im Verweis und um Antworten, die nie angeboten werden (ein Gadget, das es nicht gibt, oder eine Szene, die nie gefragt hat).
// Antworten, auf die nichts zeigt, sind erlaubt.

import { describe, expect, it } from 'vitest';
import type { Choice, Line } from '../domain/dialog.ts';
import { ALL_ACTS, ALL_SCENES } from '../test/content.ts';
import { REWARD_SCENES } from './story/rewardScenes.ts';
import { TRAINING } from './story/training/index.ts';
import { ITEMS } from './items.ts';

interface Ref {
  where: string;
  scene: string;
  choice: string | null;
}

/** Alle `ifPicked`-Verweise irgendwo im Inhalt (Zeilen, Antworten und Reaktionen, Bilderbuch, Fallakten, Treffer-Zeilen) */
function collectRefs(root: unknown, label: string): Ref[] {
  const seen = new Set<unknown>();
  const out: Ref[] = [];
  const walk = (v: unknown, path: string) => {
    if (typeof v !== 'object' || v === null || seen.has(v)) return;
    seen.add(v);
    if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`));
    const o = v as Record<string, unknown>;
    const pick = o.ifPicked as { scene?: unknown; choice?: unknown } | undefined;
    if (pick && typeof pick.scene === 'string') out.push({ where: `${path} ${typeof o.text === 'string' ? `„${o.text.slice(0, 40)}“` : ''}`.trim(), scene: pick.scene, choice: (pick.choice as string | null) ?? null });
    for (const [k, x] of Object.entries(o)) walk(x, `${path}.${k}`);
  };
  walk(root, label);
  return out;
}

/** Die Antwort `id` einer Szene samt der Antworten, die man davor wählen muss (Antworten auf Antworten) */
function choicePath(lines: readonly Line[], id: string, via: Choice[] = []): Choice[] | undefined {
  for (const l of lines) {
    for (const c of l.choices ?? []) {
      if (c.id === id) return [...via, c];
      const deeper = choicePath(c.reply ?? [], id, [...via, c]);
      if (deeper) return deeper;
    }
  }
  return undefined;
}

const ITEM_IDS = new Set(ITEMS.map((i) => i.id));

const REFS: Ref[] = [
  ...ALL_ACTS.flatMap((a) => collectRefs(a, a.module.id)),
  ...collectRefs(TRAINING, 'training'),
  ...collectRefs(REWARD_SCENES, 'rewards'),
];

describe('Verweise auf Antworten (ifPicked)', () => {
  it('es gibt Verweise (der Sammler sieht Szenen, Bilderbuch und Fallakten)', () => {
    expect(REFS.length).toBeGreaterThan(50);
    expect(REFS.some((r) => r.where.includes('fallakte'))).toBe(true);
    expect(REFS.some((r) => r.where.includes('chat') || r.where.includes('side'))).toBe(true);
  });

  it('jeder Verweis zeigt auf eine Szene mit dieser Antwort; ohne Antwort-ID (null) zeigt er auf eine Szene, die etwas fragt', () => {
    for (const r of REFS) {
      const target = ALL_SCENES.find((x) => x.id === r.scene);
      expect(target, `${r.where}: Szene ${r.scene}`).toBeDefined();
      if (r.choice === null) {
        expect(target!.lines.some((l) => l.choices?.length), `${r.where}: ${r.scene} fragt nichts`).toBe(true);
      } else {
        expect(choicePath(target!.lines, r.choice), `${r.where}: Antwort ${r.choice} in ${r.scene}`).toBeDefined();
      }
    }
  });

  it('jede verwiesene Antwort ist wählbar: kein Gadget auf dem Weg dorthin, das es nicht gibt; keine getippte Antwort ohne Text', () => {
    for (const r of REFS) {
      if (r.choice === null) continue;
      const path = choicePath(ALL_SCENES.find((x) => x.id === r.scene)!.lines, r.choice)!;
      for (const c of path) {
        if (c.needs) expect(ITEM_IDS.has(c.needs), `${r.where}: ${r.scene}/${c.id} braucht ${c.needs}`).toBe(true);
        expect(c.label.length, `${r.scene}/${c.id}`).toBeGreaterThan(0);
        expect(c.text.length, `${r.scene}/${c.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('Antwort-IDs sind je Szene eindeutig (sonst meint ein Verweis zwei Antworten)', () => {
    for (const s of ALL_SCENES) {
      const ids: string[] = [];
      const walk = (lines: readonly Line[]) => lines.forEach((l) => l.choices?.forEach((c) => (ids.push(c.id), walk(c.reply ?? []))));
      walk(s.lines);
      expect(new Set(ids).size, `${s.id}: ${ids.join(', ')}`).toBe(ids.length);
    }
  });
});
