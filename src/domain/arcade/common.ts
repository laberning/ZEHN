// Gemeinsame Bausteine der Spielhallen-Spiele.

import { pickOne, type Rng } from '../rng.ts';

/** Zufälliger Code aus den erlaubten Tasten, ohne dreimal dasselbe Zeichen hintereinander (außer es gibt nur eine Taste). */
export function makeCode(keys: readonly string[], length: number, rng: Rng): string {
  if (keys.length === 0) throw new Error('makeCode: keine Tasten');
  let code = '';
  while (code.length < length) {
    const c = pickOne(keys, rng);
    const triple = code.length >= 2 && code.at(-1) === c && code.at(-2) === c;
    if (triple && keys.length > 1) continue;
    code += c;
  }
  return code;
}
