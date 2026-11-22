// Spielhallen-Mechanik ohne Browser: Zeit wird einfach vorgespult (statt Zeitraffer im Produktcode).

import { describe, expect, it } from 'vitest';
import { createRng } from '../rng.ts';
import { makeCode } from './common.ts';
import { REGEN_LIVES, WAVE_PAUSE_MS, regenItem, regenPace, regenMultiplier, regenNextChar, regenReached, regenStart, regenTick, regenType, waveBonus, waveSize, type RegenState } from './regen.ts';
import { CODES_PER_VAULT, TRESOR_SECONDS, codeLength, tresorStart, tresorTick, tresorNextChar, tresorReached, tresorTimeLeft, tresorType, type TresorState } from './tresor.ts';

const ALL = ['f', 'j', 'd', 'k', 's', 'l', 'a', 'ö', 'g', 'h', 'ä'];
const WORDS = ['das', 'lass', 'fall', 'hals', 'kahl', 'saal', 'glas', 'gas', 'half', 'jagd'];

/** Spult in Bildschritten (16 ms) vor */
function advance(s: RegenState, ms: number): RegenState {
  for (let t = 16; t <= ms; t += 16) s = regenTick(s, s.lastTick + 16);
  return s;
}

describe('Bausteine', () => {
  it('Codes: nur erlaubte Tasten, nie drei gleiche hintereinander', () => {
    const rng = createRng(3);
    for (let i = 0; i < 200; i++) {
      const c = makeCode(['f', 'j'], 6, rng);
      expect(c).toMatch(/^[fj]{6}$/);
      expect(c).not.toMatch(/(.)\1\1/);
    }
  });

  it('Regen: erst Buchstaben, mit genug Tasten auch Wörter', () => {
    const rng = createRng(5);
    expect(Array.from({ length: 50 }, () => regenItem(['f', 'j'], WORDS, rng)).every((x) => /^[fj]{1,2}$/.test(x))).toBe(true);
    expect(makeCode(['f'], 4, rng)).toBe('ffff'); // eine einzige Taste: Wiederholung erlaubt statt Endlosschleife
    expect(() => makeCode([], 3, rng)).toThrow();
    expect(Array.from({ length: 80 }, () => regenItem(ALL, WORDS, rng)).some((x) => WORDS.includes(x))).toBe(true);
  });

  it('wird mit jeder Welle eine Stufe schneller, aber nicht unendlich', () => {
    expect(regenPace(2).spawnMs).toBeLessThan(regenPace(1).spawnMs);
    expect(regenPace(2).speed).toBeGreaterThan(regenPace(1).speed);
    expect(regenPace(1)).toEqual({ spawnMs: 2100, speed: 0.055 });
    expect(regenPace(9999)).toEqual({ spawnMs: 650, speed: 0.16 });
  });
});

describe('Buchstabenregen', () => {
  it('Tropfen erscheinen, fallen und kosten beim Aufprall ein Leben', () => {
    let s = regenStart(['f'], [], 1, 0);
    s = regenTick(s, 16);
    expect(s.drops).toHaveLength(0); // der erste Tropfen kommt nach gut einer halben Sekunde
    s = regenTick(s, 700);
    expect(s.drops).toHaveLength(1);
    s = advance(s, 25_000);
    expect(s.lives).toBeLessThan(REGEN_LIVES);
    expect(s.combo).toBe(0);
  });

  it('Welle: feste Zahl Tropfen, danach Pause mit Bonus, dann die schnellere nächste Welle', () => {
    expect(waveSize(1)).toBe(10);
    expect(waveSize(3)).toBe(14);
    expect(waveBonus(3)).toBe(30);
    let s = regenStart(['f'], [], 1, 0);
    expect(s).toMatchObject({ level: 1, leftInWave: 10 });
    let spawned = 0;
    let seenWave = false;
    for (let i = 0; i < 4000 && !seenWave; i++) {
      s = regenTick(s, s.lastTick + 16);
      for (const d of s.drops) {
        // wie ein Spieler: jeden Tropfen sofort abtippen
        s = regenType(s, d.text[0]!, s.lastTick);
        spawned = 10 - s.leftInWave;
      }
      seenWave = s.events.includes('wave');
      if (s.over) break;
    }
    expect(seenWave).toBe(true);
    expect(spawned).toBeLessThanOrEqual(10);
    expect(s).toMatchObject({ level: 2, leftInWave: waveSize(2), lives: REGEN_LIVES });
    expect(s.score).toBeGreaterThanOrEqual(waveBonus(1));
    expect(s.pauseUntil).toBe(s.lastTick + WAVE_PAUSE_MS);
    expect(regenReached(s)).toBe(1);
    // in der Pause erscheint nichts und Tippen zählt nicht
    const pause = regenTick(s, s.lastTick + 1000);
    expect(pause.drops).toHaveLength(0);
    expect(regenType(pause, 'f', pause.lastTick)).toBe(pause);
    // danach geht es mit Welle 2 weiter
    const after = advance({ ...pause, lastTick: s.pauseUntil }, 3000);
    expect(after.drops.length + (waveSize(2) - after.leftInWave)).toBeGreaterThan(0);
  });

  it('Welle zählt auch, wenn ein Tropfen aufprallt (Leben weg), und das Spiel kann dort enden', () => {
    let s = { ...regenStart(['f'], [], 1, 0), leftInWave: 0, lives: 1, drops: [{ id: 1, text: 'f', x: 0.5, y: 0.999, speed: 1, typed: 0 }] };
    s = regenTick(s, 16);
    expect(s.over).toBe(true);
    expect(s.events).not.toContain('wave'); // wer verliert, bekommt die Welle nicht geschenkt
    expect(regenReached(s)).toBe(0);
  });

  it('Startlevel: Welle, Tempo und Größe beginnen dort; die übersprungenen Wellen zählen als geschafft', () => {
    let s = regenStart(['f'], [], 1, 0, 4);
    expect(s).toMatchObject({ level: 4, startLevel: 4, leftInWave: waveSize(4) });
    expect(regenReached(s)).toBe(3); // gleich verloren: Welle 3 bleibt geschafft
    expect(regenReached(advance(s, 120_000))).toBe(3);
    s = { ...s, leftInWave: 0 };
    s = regenTick(s, 16);
    expect(s).toMatchObject({ level: 5, events: ['wave'] });
    expect(regenReached(s)).toBe(4);
  });

  it('endet nach drei Treffern aufs Netz', () => {
    const s = advance(regenStart(['f'], [], 1, 0), 120_000);
    expect(s.over).toBe(true);
    expect(regenTick(s, s.lastTick + 16)).toBe(s);
    expect(regenType(s, 'f', 0)).toBe(s);
  });

  it('Abtippen trifft das tiefste passende Objekt, Serie erhöht den Multiplikator', () => {
    let s = regenTick(regenStart(['f'], [], 1, 0), 700);
    const id = s.drops[0]!.id;
    s = regenType(s, 'f', 100);
    expect(s.drops.find((d) => d.id === id)).toBeUndefined();
    expect(s).toMatchObject({ hits: 1, combo: 1, score: 1, events: ['hit'] });
    expect(s.laser?.until).toBe(240);
    expect(s.drops).toHaveLength(0);
    expect(regenMultiplier({ combo: 10 })).toBe(2);
  });

  it('Wörter werden Buchstabe für Buchstabe getippt; Fehler kostet die Serie', () => {
    let s: RegenState = { ...regenStart(['d', 'a', 's'], [], 1, 0), drops: [{ id: 9, text: 'das', x: 0.5, y: 0.5, speed: 0, typed: 0 }], combo: 4 };
    s = regenType(s, 'd', 1);
    expect(s).toMatchObject({ target: 9, events: ['key'] });
    s = regenType(s, 'x', 2);
    expect(s).toMatchObject({ combo: 0, events: ['miss'], missUntil: 202 });
    s = regenType(regenType(s, 'a', 3), 's', 4);
    expect(s.score).toBe(3);
  });

  it('für die Bildschirmtastatur: nächstes Zeichen und letzter Anschlag (Treffer oder Fehler)', () => {
    let s: RegenState = { ...regenStart(['d', 'a', 's', 'f'], [], 1, 0), drops: [{ id: 1, text: 'f', x: 0.2, y: 0.2, speed: 0, typed: 0 }, { id: 9, text: 'das', x: 0.5, y: 0.6, speed: 0, typed: 0 }] };
    expect(regenNextChar(s)).toBe('d'); // nichts angefangen: der unterste Tropfen
    s = regenType(s, 'd', 1);
    expect(regenNextChar(s)).toBe('a');
    expect(s.press).toEqual({ ch: 'd', ok: true, n: 1 });
    s = regenType(s, 'x', 2);
    expect(s.press).toEqual({ ch: 'x', ok: false, n: 2 });
    expect(regenNextChar(regenStart(['f'], [], 1, 0))).toBeUndefined();
  });
});

describe('Tresorknacker', () => {
  const crack = (s: TresorState, now = 0) => [...s.code].reduce((x, ch) => tresorType(x, ch, now), s);

  it('Code richtig → Lampe an; fünf Codes → Tresor offen, Codes werden länger', () => {
    let s = tresorStart(['f', 'j'], 1, 0);
    expect(s.code).toHaveLength(3);
    s = crack(s);
    expect(s).toMatchObject({ cracked: 1, lamps: 1, events: ['cracked'] });
    for (let i = 1; i < CODES_PER_VAULT; i++) s = crack(s);
    expect(s).toMatchObject({ vault: 1, lamps: 0 });
    expect(s.events).toContain('vault');
    expect(s.code).toHaveLength(codeLength(1));
    expect(codeLength(99)).toBe(7);
  });

  it('Startlevel: man beginnt bei Tresor n mit längeren Codes; die übersprungenen zählen als offen', () => {
    let s = tresorStart(['f', 'j'], 1, 0, 3);
    expect(s).toMatchObject({ vault: 2, startLevel: 3 });
    expect(s.code).toHaveLength(codeLength(2));
    expect(tresorTimeLeft(s)).toBe(TRESOR_SECONDS);
    expect(tresorReached(s)).toBe(2);
    expect(tresorReached(tresorTick(s, TRESOR_SECONDS * 1000))).toBe(2); // Zeit um, nichts geöffnet: Silber bleibt
    for (let i = 0; i < CODES_PER_VAULT; i++) s = crack(s);
    expect(tresorReached(s)).toBe(3);
    expect(tresorReached(tresorStart(['f'], 1, 0))).toBe(0);
  });

  it('ein Fehler setzt nur den aktuellen Code und die Serie zurück', () => {
    let s = tresorStart(['f', 'j'], 1, 0);
    s = tresorType(s, s.code[0]!, 0);
    s = tresorType(s, s.code[1] === 'f' ? 'j' : 'f', 0);
    expect(s).toMatchObject({ typed: 0, streak: 0, events: ['miss'], shakeUntil: 300 });
  });

  it('für die Bildschirmtastatur: nächstes Zeichen und letzter Anschlag', () => {
    let s = tresorStart(['f', 'j'], 1, 0);
    expect(tresorNextChar(s)).toBe(s.code[0]);
    const first = s.code[0]!;
    s = tresorType(s, first, 0);
    expect(s.press).toEqual({ ch: first, ok: true, n: 1 });
    expect(tresorNextChar(s)).toBe(s.code[1]);
  });

  it('Zeit läuft ab → Spielende', () => {
    let s = tresorStart(['f'], 1, 0);
    s = tresorTick(s, 30_000);
    expect(tresorTimeLeft(s)).toBe(TRESOR_SECONDS - 30);
    s = tresorTick(s, TRESOR_SECONDS * 1000);
    expect(s.over).toBe(true);
    expect(tresorTick(s, 0)).toBe(s);
    expect(tresorType(s, 'f', 0)).toBe(s);
  });
});
