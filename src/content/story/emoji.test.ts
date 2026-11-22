// Die Positivliste selbst (ADR-0006): Einzel-Code-Punkte mit Emoji-Darstellung bis Emoji 5.0, keine Doppelten, stumme Sprecher leer.

import { describe, expect, it } from 'vitest';
import { EMOJI_ALLOWED, EMOJI_BY_SPEAKER, EMOJI_RESERVE } from './emoji.ts';

describe('Emoji-Positivliste', () => {
  it('jedes Emoji ist ein einzelner Code-Punkt mit Emoji-Darstellung (kein FE0F, kein ZWJ)', () => {
    expect(EMOJI_ALLOWED.length).toBeGreaterThan(0);
    for (const e of EMOJI_ALLOWED) {
      expect([...e].length, e).toBe(1);
      expect(e, e).toMatch(/^\p{Emoji_Presentation}$/u);
    }
  });

  it('jedes Emoji stammt aus Emoji 5.0 (Unicode 10, 2017) oder älter', () => {
    // Alle Code-Punkte mit Emoji_Presentation, die nach Unicode 10 dazukamen, liegen in diesen Bereichen
    // (aus DerivedAge.txt, Stand Unicode 16; spätere Versionen füllen nur Lücken darin oder ganz neue Bereiche ab U+1FA70).
    const newer: readonly (readonly [number, number])[] = [
      [0x1f6d5, 0x1f6df], [0x1f6f9, 0x1f6ff], [0x1f7e0, 0x1f7ff], [0x1f90c, 0x1f90f], [0x1f93f, 0x1f93f], [0x1f94d, 0x1f94f],
      [0x1f96c, 0x1f97f], [0x1f998, 0x1f9bf], [0x1f9c1, 0x1f9cf], [0x1f9e7, 0x1f9ff], [0x1fa70, 0x1faff],
    ];
    for (const e of EMOJI_ALLOWED) {
      const c = e.codePointAt(0) ?? 0;
      expect(newer.some(([a, b]) => c >= a && c <= b), e).toBe(false);
    }
  });

  it('keine Doppelten je Sprecher und in der Reserve; die Reserve gehört keiner Figur', () => {
    for (const [speaker, list] of Object.entries(EMOJI_BY_SPEAKER)) expect(new Set(list).size, speaker).toBe(list.length);
    expect(new Set(EMOJI_RESERVE).size).toBe(EMOJI_RESERVE.length);
    const used = new Set(Object.values(EMOJI_BY_SPEAKER).flat());
    for (const e of EMOJI_RESERVE) expect(used.has(e), e).toBe(false);
  });

  it('Unbekannt, Frau Hubbel, Tippi, Benno, Erzähler, Kind und System haben keine Emoji', () => {
    for (const s of ['unbekannt', 'hubbel', 'tippi', 'benno', 'erzaehler', 'player', 'system'] as const) expect(EMOJI_BY_SPEAKER[s], s).toEqual([]);
  });
});
