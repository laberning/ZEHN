import { describe, expect, it } from 'vitest';
import { sourceHint } from './items.ts';

describe('Oberflächentexte: Dinge', () => {
  it('Herkunft eines Dings', () => {
    expect(sourceHint({ badge: 'x' }, { badgeTitle: 'Tastsinn' })).toBe('Kommt mit dem Abzeichen „Tastsinn“');
    expect(sourceHint({ scene: 's' })).toBe('Kommt in der Geschichte');
    expect(sourceHint({ case: 'c' })).toBe('Gibt es in einem Extra-Fall');
  });
});
