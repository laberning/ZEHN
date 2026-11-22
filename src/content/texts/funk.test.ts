import { describe, expect, it } from 'vitest';
import { sideHint } from './funk.ts';

describe('Oberflächentexte: Funk', () => {
  it('Hinweis auf eine Nebenszene: wer hat wo geschrieben', () => {
    expect(sideHint('kruemel', 'kruemel')).toBe('Krümel hat dir geschrieben');
    expect(sideHint('juna', 'juna')).toBe('Juna hat dir geschrieben');
    expect(sideHint('fluestern', 'juna')).toBe('Neues im Qwertz-Flüstern');
    expect(sideHint('intern', 'ada')).toBe('Ada hat in ZEHN intern geschrieben');
    expect(sideHint('intern', 'kruemel')).toBe('Krümel hat in ZEHN intern geschrieben');
  });
});
