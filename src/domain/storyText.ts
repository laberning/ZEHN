// Sätze aus der Geschichte als Tippmaterial (Bennos Tippstunde): echte Chat-Zeilen aller Akte, die das Kind tippen kann.

import type { StoryContent } from './storyContent.ts';

/** Länge eines Satzes in Zeichen (Code-Punkten): kurz genug für eine Runde, lang genug, um mehr als ein Wort zu sein */
export const SENTENCE_MIN = 20;
export const SENTENCE_MAX = 100;

/** Sprecher, deren Zeilen nicht getippt werden: Systemzeilen, das Kind selbst und der Erzähler */
const SILENT = new Set(['system', 'player', 'erzaehler']);
const PLACEHOLDER = /\{\w+\}/;
const EMOJI = /\p{Extended_Pictographic}/u;

/**
 * Alle Chat- und Nebenszenen-Zeilen aller Akte, die man mit den Zeichen `allowed` (und dem Leerzeichen) tippen kann:
 * keine Systemzeilen, keine Antworten, keine Platzhalter, keine Emoji, `SENTENCE_MIN` bis `SENTENCE_MAX` Zeichen, ohne Doppelte.
 * Anführungszeichen „“ und Gedankenstriche fallen von selbst heraus, weil sie nicht gelernt werden.
 */
export function storySentences(story: Pick<StoryContent, 'scenes'>, allowed: readonly string[]): string[] {
  const ok = new Set([...allowed, ' ']);
  const found = new Set<string>();
  for (const scene of story.scenes) {
    for (const line of scene.lines) {
      if (SILENT.has(line.speaker) || line.strike !== undefined || line.ifPicked) continue;
      const text = line.text;
      const length = [...text].length;
      if (length < SENTENCE_MIN || length > SENTENCE_MAX || PLACEHOLDER.test(text) || EMOJI.test(text)) continue;
      if (text !== text.trim() || text.includes('  ') || [...text].some((c) => !ok.has(c))) continue;
      found.add(text);
    }
  }
  return [...found];
}
