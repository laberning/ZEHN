// Emoji-Prüfung für Inhalts- und Architektur-Tests.

/** Emoji sind nur im Funk erlaubt (ADR-0006); sonst brauchen sie eine Emoji-Schrift, die nicht überall installiert ist */
const EMOJI = /\p{Extended_Pictographic}/u;
/**
 * Erlaubte Textzeichen (AGENTS.md, Fallstricke), die trotzdem als Extended_Pictographic gelten.
 * Die übrigen erlaubten Zeichen (★ ♛ ↓ ● ○ ⏎) sind keine und brauchen keinen Eintrag.
 */
const ALLOWED_SYMBOLS = new Set(['▶', '◀']);

/** Die gefundenen Emoji (je Code-Punkt), damit Tests sagen, welches stört */
export const emojisIn = (s: string): string[] => [...s].filter((c) => EMOJI.test(c) && !ALLOWED_SYMBOLS.has(c));

export const hasEmoji = (s: string): boolean => emojisIn(s).length > 0;
