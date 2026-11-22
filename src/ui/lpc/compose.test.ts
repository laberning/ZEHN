import { describe, expect, it } from 'vitest';
import { turn } from './compose.ts';

describe('turn', () => {
  it('▶ von vorne: Die Figur schaut nach rechts, dann zeigt sie den Rücken, dann links, dann wieder vorne', () => {
    expect(turn('down', 1)).toBe('right');
    expect(turn('right', 1)).toBe('up');
    expect(turn('up', 1)).toBe('left');
    expect(turn('left', 1)).toBe('down');
  });

  it('◀ dreht genau zurück', () => {
    for (const f of ['down', 'right', 'up', 'left'] as const) expect(turn(turn(f, 1), -1)).toBe(f);
    expect(turn('down', -1)).toBe('left');
  });
});
