// Sprecher: Namen und Kürzel der Figuren (Chat, Sprechblasen).

import { fill, type Speaker } from '../../domain/dialog.ts';

/** Name über der Sprechblase; leer = ohne Namen. Platzhalter wie {vorname} löst `speakerName` auf. */
export const SPEAKER_NAMES: Record<Speaker, string> = {
  ada: 'Ada',
  kruemel: 'Krümel',
  baron: 'Baron von Backspace',
  unbekannt: '???',
  juna: 'Juna',
  hubbel: 'Frau Hubbel',
  tippi: 'Tippi',
  benno: 'Benno',
  erzaehler: '',
  player: '{vorname}',
  system: '',
};

/** Kürzel im runden Bild neben der Sprechblase im Chat */
export const SPEAKER_INITIALS: Partial<Record<Speaker, string>> = { ada: 'A', kruemel: 'K', baron: 'B', unbekannt: '?', juna: 'J', hubbel: 'H', tippi: 'T', benno: 'B', player: 'Du' };

/** Angezeigter Name einer Figur, Platzhalter gefüllt */
export function speakerName(speaker: Speaker, vars: Record<string, string | number>): string {
  return fill(SPEAKER_NAMES[speaker], vars);
}
