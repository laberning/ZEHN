// Story-Objekte wählen ihre Stufe nach Fortschritt.

import { describe, expect, it } from 'vitest';
import { objectOf, stageAt, type StoryObject } from './storyObject.ts';

const obj: StoryObject = {
  lessonId: 'x',
  title: 'Testding',
  kind: 'text',
  stages: [
    { at: 0, text: 'null' },
    { at: 0.25, text: 'viertel' },
    { at: 0.5, text: 'halb' },
    { at: 1, text: 'voll' },
  ],
};

describe('stageAt', () => {
  it('nimmt die letzte Stufe mit at <= Fortschritt (Grenzen, 0, 0,99, 1)', () => {
    const at = (p: number) => stageAt(obj, p).text;
    expect(at(0)).toBe('null');
    expect(at(0.2499)).toBe('null');
    expect(at(0.25)).toBe('viertel');
    expect(at(0.61)).toBe('halb');
    expect(at(0.99)).toBe('halb');
    expect(at(1)).toBe('voll');
  });

  it('findet das Objekt zu einem Auftrag', () => {
    expect(objectOf([obj], 'x')).toBe(obj);
    expect(objectOf([obj], 'y')).toBeUndefined();
  });
});
