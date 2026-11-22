import { describe, expect, it } from 'vitest';
import { applyKey, expectedChar, isDone, layoutMismatch, liveAccuracy, startTyping, typeChar, typingResult, type TypingState } from './typing.ts';

/** Tippt eine Folge von [Zeichen, Zeitpunkt] */
function run(s: TypingState, keys: [string, number][]): TypingState {
  return keys.reduce((st, [ch, t]) => typeChar(st, ch, t).state, s);
}

describe('Tippen', () => {
  it('Pflichtmodus: geht erst mit der richtigen Taste weiter', () => {
    let s = startTyping('fj', 'strict');
    s = typeChar(s, 'f', 0).state;
    const wrong = typeChar(s, 'k', 500);
    expect(wrong.status).toBe('wrong');
    expect(wrong.state.position).toBe(1);
    const right = typeChar(wrong.state, 'j', 1000);
    expect(right.status).toBe('correct');
    expect(isDone(right.state)).toBe(true);
    expect(right.state.chars).toEqual(['correct', 'corrected']);
    expect(typingResult(right.state)).toMatchObject({ errors: 1, accuracy: 0.5, durationMs: 1000 });
  });

  it('Flow-Modus: markiert Fehler und tippt weiter', () => {
    const s = run(startTyping('fjf', 'flow'), [['f', 0], ['x', 300], ['f', 600]]);
    expect(isDone(s)).toBe(true);
    expect(s.chars).toEqual(['correct', 'wrong', 'correct']);
  });

  it('zählt pro Textstelle nur den ersten Versuch fürs Tastenprofil', () => {
    const s = run(startTyping('f'), [['d', 0], ['d', 100], ['f', 200]]);
    expect(s.scored).toEqual([{ expected: 'f', correct: false, ms: null, typed: 'd' }]);
  });

  it('misst die Zeit bis zum richtigen Anschlag', () => {
    const s = run(startTyping('fj'), [['f', 0], ['k', 100], ['j', 400]]);
    expect(s.scored.at(-1)).toMatchObject({ expected: 'j', correct: false, ms: 100 });
    const t = run(startTyping('fj'), [['f', 0], ['j', 400]]);
    expect(t.scored.at(-1)).toMatchObject({ expected: 'j', correct: true, ms: 400 });
  });

  it('Rundenprotokoll: getipptes Zeichen, vorheriges erwartetes Zeichen, Umschalt-Hand', () => {
    const a = typeChar(startTyping('fJ'), 'f', 0, 'left');
    const b = typeChar(a.state, 'k', 300, 'right').state;
    expect(a.state.scored[0]).toEqual({ expected: 'f', correct: true, ms: null, typed: 'f', shift: 'left' });
    expect(b.scored[1]).toEqual({ expected: 'J', correct: false, ms: 300, typed: 'k', shift: 'right', prev: 'f' });
    // ohne Angabe keine Aussage zur Hand
    expect(typeChar(startTyping('f'), 'f', 0).state.scored[0]!.shift).toBeUndefined();
  });

  it('berechnet Anschläge pro Minute, auch bei Abbruch', () => {
    const s = run(startTyping('ffffff'), [0, 1, 2, 3, 4, 5].map((i) => ['f', i * 1000] as [string, number]));
    expect(typingResult(s).apm).toBeCloseTo(60);
    const half = run(startTyping('ffffff'), [['f', 0], ['f', 1000]]);
    expect(typingResult(half, 2000)).toMatchObject({ durationMs: 2000, length: 6 });
    expect(typingResult(startTyping('f'))).toMatchObject({ apm: 0, accuracy: 0, durationMs: 0 });
  });

  it('Tempo stimmt auch, wenn der erste Anschlag falsch war', () => {
    const strict = run(startTyping('ff'), [['x', 0], ['f', 1000], ['f', 2000]]);
    expect(typingResult(strict).apm).toBeCloseTo(60);
    const flow = run(startTyping('xff', 'flow'), [['y', 0], ['f', 1000], ['f', 2000]]);
    expect(typingResult(flow).apm).toBeCloseTo(60);
  });

  it('Live-Genauigkeit und Tastendruck für Abläufe', () => {
    let s = startTyping('fj');
    expect(liveAccuracy(s)).toBe(1);
    const a = applyKey(s, null, 'x', 0)!;
    expect(a).toMatchObject({ ok: false, press: { ch: 'x', ok: false, n: 1 } });
    s = applyKey(a.typing, a.press, 'f', 10)!.typing;
    expect(liveAccuracy(s)).toBe(0);
    expect(applyKey(s, null, 'Shift', 20)).toBeNull();
  });

  it('ignoriert Sondertasten und Eingaben nach dem Ende; leere Texte gibt es nicht', () => {
    const s = startTyping('f');
    expect(typeChar(s, 'Shift', 0).status).toBe('ignored');
    expect(typeChar(typeChar(s, 'f', 0).state, 'f', 1).status).toBe('ignored');
    expect(expectedChar(s)).toBe('f');
    expect(() => startTyping('')).toThrow();
  });

  it('erkennt ein englisches Tastaturlayout', () => {
    expect(layoutMismatch('z', 'y')).toBe(true);
    expect(layoutMismatch('ö', ';')).toBe(true);
    expect(layoutMismatch('f', 'g')).toBe(false);
  });
});
