// updateKnownIdsSource: ergänzt nur, ist idempotent und bricht keine Zeilen um. Getestet mit dem echten Text von knownIds.ts
// (Tests unter src/ haben kein node:fs, darum der ?raw-Import).

import { describe, expect, it } from 'vitest';
import { presentIds, updateKnownIdsSource, type PresentIds } from './ids.ts';
import knownIdsSource from './knownIds.ts?raw';

const present = presentIds();
const extra = (more: Partial<PresentIds>): PresentIds => ({
  ...present,
  ...Object.fromEntries(Object.entries(more).map(([k, v]) => [k, Array.isArray(v) ? [...present[k as 'scenes'], ...v] : { ...present.answers, ...v }])),
});

describe('updateKnownIdsSource', () => {
  it('ändert nichts, wenn alles eingetragen ist', () => {
    expect(updateKnownIdsSource(knownIdsSource, present)).toBe(knownIdsSource);
  });

  it('ergänzt neue IDs in neuen Zeilen, bricht keine Zeile um und ist idempotent', () => {
    const wanted = extra({
      scenes: ['a2-neu-1', 'a2-neu-2'],
      items: ['neues-ding'],
      cases: ['neuer-fall'],
      badges: ['neues-abzeichen'],
      wardrobe: ['neue-mütze'],
      modules: ['m2'],
      lessons: ['m2-l1', 'm2-l2'],
      arcade: ['neues-spiel'],
      book: ['neue-wahl'],
      answers: { 'a2-neu-1': ['ja', 'nein'], 'l1-s25': ['haende', 'noch', 'dritte'] },
    });
    const once = updateKnownIdsSource(knownIdsSource, wanted);
    for (const id of ['a2-neu-1', 'a2-neu-2', 'neues-ding', 'neuer-fall', 'neues-abzeichen', 'neue-mütze', "'m2'", 'm2-l2', 'neues-spiel', 'neue-wahl', 'dritte'])
      expect(once, id).toContain(id);
    expect(once).toContain("'a2-neu-1': ['ja', 'nein'],");
    expect(once).toContain("'l1-s25': ['haende', 'noch', 'dritte'],");
    // alle alten Zeilen bleiben unverändert, bis auf die erweiterte Antwortzeile
    const before = knownIdsSource.split('\n');
    const after = new Set(once.split('\n'));
    expect(before.filter((l) => !after.has(l))).toEqual(["    'l1-s25': ['haende', 'noch'],"]);
    // neue Zeilen bleiben unter etwa 160 Zeichen
    const old = new Set(before);
    for (const l of once.split('\n')) if (!old.has(l)) expect(l.length, l).toBeLessThanOrEqual(165);
    expect(updateKnownIdsSource(once, wanted)).toBe(once);
  });

  it('entfernt nie etwas: fehlen IDs in `present`, bleibt der Text', () => {
    const none: PresentIds = { scenes: [], answers: {}, book: [], items: [], cases: [], badges: [], wardrobe: [], modules: [], lessons: [], arcade: [] };
    expect(updateKnownIdsSource(knownIdsSource, none)).toBe(knownIdsSource);
  });

  it('wickelt viele neue IDs in Zeilen bis etwa 160 Zeichen', () => {
    const many = Array.from({ length: 60 }, (_, i) => `szene-nummer-${i}`);
    const out = updateKnownIdsSource(knownIdsSource, extra({ scenes: many }));
    const added = out.split('\n').filter((l) => l.includes('szene-nummer-'));
    expect(added.length).toBeGreaterThan(3);
    for (const l of added) expect(l.length).toBeLessThanOrEqual(165);
    for (const id of many) expect(out).toContain(`'${id}'`);
  });
});
