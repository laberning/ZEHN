// Emoji im Agentenfunk (ADR-0006): erlaubt nur im Text einer Chat-Zeile einer Figur, aus dieser Positivliste je Sprecher.
// Regel für jedes Emoji: ein einzelner Code-Punkt mit \p{Emoji_Presentation}, aus Emoji 5.0 (2017) oder älter;
// kein Variantenselektor (U+FE0F), kein ZWJ, keine Hauttöne, keine Flaggen. So zählt es als ein Zeichen und
// fehlt auch auf älteren Systemen nicht. Die Regel je Figur (Ton) steht in docs/design/story.md, A5.
// Jeder neue Sprecher bekommt hier einen Eintrag (der Typ erzwingt es).

import type { Speaker } from '../../domain/dialog.ts';

export const EMOJI_BY_SPEAKER: Record<Speaker, readonly string[]> = {
  juna: ['😀', '😂', '😅', '😉', '😎', '😮', '😱', '🙄', '😴', '👀', '👋', '🙌', '✨', '🔥', '🎉', '💛', '⭐', '❗', '❓', '🍕', '🍪'],
  kruemel: ['⚡', '🔋', '💡', '🔦', '📡', '🍪', '🥐'],
  ada: ['👍'],
  baron: ['🎩', '🧐'],
  hubbel: [],
  // eine Maschine (Tippi) und der Baron ohne Hut (Benno): keine Emoji; ein späterer Akt kann Benno welche geben
  tippi: [],
  benno: [],
  unbekannt: [],
  erzaehler: [],
  player: [],
  system: [],
};

/** Reserve: erlaubt nach der Regel, heute keiner Figur zugeordnet (für spätere Akte und Figuren) */
export const EMOJI_RESERVE: readonly string[] = ['🤔', '😏', '🤫', '💥', '✅', '❌', '🎵', '🔎', '🔒', '🔑', '📁', '🚇', '🚆', '🥨', '🐦', '🎧'];

/** Die Positivliste: alle Emoji, die irgendeine Figur oder die Reserve nennt */
export const EMOJI_ALLOWED: readonly string[] = [...new Set([...Object.values(EMOJI_BY_SPEAKER).flat(), ...EMOJI_RESERVE])];
