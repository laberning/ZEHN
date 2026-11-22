// Sätze aus der Geschichte: welche Chat-Zeilen taugen als Tippmaterial?

import { describe, expect, it } from 'vitest';
import type { Line } from './dialog.ts';
import type { StoryScene } from './scenes.ts';
import { SENTENCE_MAX, SENTENCE_MIN, storySentences } from './storyText.ts';

const scene = (lines: Line[]): StoryScene => ({ id: 's', chat: 'kruemel', trigger: { on: 'briefing', lessonId: 'x' }, lines });
const ALLOWED = [...'abcdefghijklmnopqrstuvwxyzäöüß.,!?'];
const line = (text: string, speaker: Line['speaker'] = 'kruemel'): Line => ({ speaker, text });

describe('storySentences', () => {
  it('nimmt Chat-Zeilen, die tippbar sind, lang genug und kurz genug', () => {
    const ok = 'zwei sind ein anfang, piep.';
    expect(storySentences({ scenes: [scene([line(ok)])] }, ALLOWED)).toEqual([ok]);
  });

  it('lässt aus: Systemzeilen, Kind, Erzähler, Platzhalter, Emoji, fremde Zeichen, zu kurze und zu lange, Doppelte, Antworten', () => {
    const sentence = 'das ist ein ganz normaler satz.';
    const long = 'a'.repeat(SENTENCE_MAX + 1);
    const lines: Line[] = [
      line(sentence),
      line(sentence), // doppelt
      line('systemzeile ohne ende hier', 'system'),
      line('eine antwort des kindes hier', 'player'),
      line('ein satz des erzählers hier', 'erzaehler'),
      line('hallo {vorname}, schön dich zu sehen'),
      line('ein satz mit emoji 😀 darin'),
      line('ein satz mit „anführungszeichen“'),
      line('zu kurz.'),
      line(long),
      { speaker: 'kruemel', text: 'eine antwort steckt in den choices', choices: [{ id: 'a', label: 'x', text: 'antworttext der nicht gezählt wird', reply: [line('reaktion auf die antwort hier')] }] },
    ];
    expect(storySentences({ scenes: [scene(lines)] }, ALLOWED)).toEqual([sentence, 'eine antwort steckt in den choices']);
    expect(SENTENCE_MIN).toBe(20);
  });

  it('nur gelernte Zeichen: ein Satz mit Zeichen, die fehlen, fällt heraus', () => {
    const s = 'das ist ein satz mit zahl 5.';
    expect(storySentences({ scenes: [scene([line(s)])] }, ALLOWED)).toEqual([]);
    expect(storySentences({ scenes: [scene([line(s)])] }, [...ALLOWED, '5'])).toEqual([s]);
  });
});
