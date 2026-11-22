// Sätze aus der Geschichte für Bennos Tippstunde: genug Material, und alles ist mit allen Tasten tippbar.

import { describe, expect, it } from 'vitest';
import { COURSE } from './course.ts';
import { STORY } from '../app/rules.ts';
import { keysUpTo, lessonOrder } from '../domain/course.ts';
import { hasEmoji } from '../test/emoji.ts';
import { SENTENCE_MAX, SENTENCE_MIN, storySentences } from '../domain/storyText.ts';

const ALL = keysUpTo(COURSE, lessonOrder(COURSE).at(-1)!);
const sentences = storySentences(STORY, ALL);

describe('Sätze aus der Geschichte', () => {
  it('es gibt reichlich davon', () => {
    expect(sentences.length).toBeGreaterThanOrEqual(50);
  });

  it('jeder Satz ist tippbar: nur gelernte Zeichen, ohne Emoji, ohne Platzhalter, ohne Leerzeichen am Rand, 20 bis 100 Zeichen', () => {
    const allowed = new Set([...ALL, ' ']);
    for (const s of sentences) {
      expect([...s].filter((c) => !allowed.has(c)), s).toEqual([]);
      expect(hasEmoji(s), s).toBe(false);
      expect(s, s).not.toMatch(/\{\w+\}/);
      expect(s, s).toBe(s.trim());
      expect([...s].length, s).toBeGreaterThanOrEqual(SENTENCE_MIN);
      expect([...s].length, s).toBeLessThanOrEqual(SENTENCE_MAX);
    }
    expect(new Set(sentences).size).toBe(sentences.length);
  });

  it('mit weniger gelernten Tasten bleiben weniger Sätze, alle davon tippbar', () => {
    const early = keysUpTo(COURSE, lessonOrder(COURSE)[5]!);
    const few = storySentences(STORY, early);
    expect(few.length).toBeLessThan(sentences.length);
    for (const s of few) expect([...s].every((c) => c === ' ' || early.includes(c)), s).toBe(true);
  });
});
