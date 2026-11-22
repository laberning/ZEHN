import { describe, expect, it } from 'vitest';
import { STORY_END_TEXTS } from './ende.ts';

describe('Spielende: Texte', () => {
  const all = [STORY_END_TEXTS.headline, ...STORY_END_TEXTS.story.map((l) => l.text), STORY_END_TEXTS.outside, ...STORY_END_TEXTS.todo, STORY_END_TEXTS.backdoor];

  it('ohne Namen von Menschen und ohne Druck (Story-Regel 11)', () => {
    for (const t of all) {
      expect(t, t).not.toMatch(/Marlene|Lars/);
      expect(t, t).not.toMatch(/\bbald\b|komm wieder|nicht verpassen|Serie|Tage|vorerst|Fortsetzung/i);
    }
  });

  it('Krümel und Ada sprechen in der Geschichte', () => {
    expect(STORY_END_TEXTS.story.map((l) => l.speaker)).toEqual(['kruemel', 'ada']);
  });
});
