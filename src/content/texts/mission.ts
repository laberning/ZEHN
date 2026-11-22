// Mission: Krümels Tipps, Rundenüberschrift, Hinweise zu Szenen und Nebenszenen.

import { keyList } from '../../domain/format.ts';
import { UMLAUTE_GROSS, isShiftKey, keystrokeFor } from '../../domain/keyboard.ts';
import type { Round } from '../../domain/mission.ts';

/** Krümels Satz nach einer Runde im Blindflug (ohne Zahl und ohne Vergleich); mit Blindflug-Brille in Story-Worten */
export function blindNote(hasBrille: boolean): string {
  return hasBrille ? 'Blindflug mit Brille: deine Finger haben den Weg allein gefunden.' : 'Ohne Blick auf die Tasten getippt: deine Finger kennen den Weg.';
}

/** Zeile am Schreibtisch, wenn die Umstellung der Tastatur erst für die nächste Runde gilt (`on`: der neue Wert, Blindflug an) */
export function blindPending(on: boolean): string {
  return on ? 'Die Tastatur verschwindet ab der nächsten Runde.' : 'Die Tastatur kommt ab der nächsten Runde zurück.';
}

/** Krümels Tipps im HQ und in der Mission, nach Thema; gewählt wird die Liste nach den Lerneinheiten des Moduls (`tipsFor`) */
export const KRUEMEL_TIPS = {
  allgemein: [
    'Tipp: Nach jeder Taste wandern die Finger zurück auf die Grundstellung.',
    'Tipp: Schau auf den Schirm, nicht auf die Tasten. Die Hubbel auf F und J zeigen dir den Weg zurück.',
    'Tipp: Lieber langsam und richtig als schnell und falsch. Tempo kommt von allein!',
    'Tipp: Schultern locker, Handgelenke nicht auf die Tischkante legen.',
    'Tipp: Die Leertaste drückst du mit dem Daumen. Mit welchem? Egal – Hauptsache Daumen.',
    'Tipp: Enter ⏎ bringt dich überall weiter, Esc zurück ins Hauptquartier.',
  ],
  shift: [
    'Tipp: Bei einem großen Buchstaben hält der kleine Finger der anderen Hand die Umschalttaste, während der Buchstabe getippt wird.',
    'Tipp: Umschalt halten, Buchstabe tippen, beides loslassen – dann zurück auf die Grundstellung.',
    'Tipp: Die Umschalttaste liegt immer auf der Seite, auf der gerade nicht getippt wird.',
  ],
  digits: [
    'Tipp: Für die Zahlen greift der Finger nach oben und kehrt danach gleich auf die Grundstellung zurück.',
    'Tipp: Jede Zahl hat ihren Finger: Er sitzt in der Grundreihe direkt darunter. Hoch, tippen, zurück!',
    'Tipp: Der Ziffernblock rechts zählt hier nicht. Die Zahlen liegen oben über den Buchstaben.',
  ],
  altgr: [
    'Tipp: Alt Gr liegt rechts neben der Leertaste. Ein Daumen hält es, der Finger der Taste greift zu.',
    'Tipp: Erst Alt Gr halten, dann das Zeichen tippen, dann beide loslassen und zurück auf die Grundstellung.',
  ],
} as const satisfies Record<string, readonly string[]>;

export type TipTopic = keyof typeof KRUEMEL_TIPS;

/** Alle Tipps (für Prüfungen) */
export const ALL_KRUEMEL_TIPS: readonly string[] = Object.values(KRUEMEL_TIPS).flat();

/** Welche Tipp-Liste passt zu diesen Lerneinheiten? Umschalt vor Zahlen vor Alt Gr, sonst allgemein */
export function tipsFor(units: readonly string[]): readonly string[] {
  if (units.some((u) => isShiftKey(u) || u === UMLAUTE_GROSS)) return KRUEMEL_TIPS.shift;
  if (units.some((u) => /^\d$/.test(u))) return KRUEMEL_TIPS.digits;
  if (units.some((u) => keystrokeFor(u)?.altGr)) return KRUEMEL_TIPS.altgr;
  return KRUEMEL_TIPS.allgemein;
}

/** Hinweis unter dem Text, wenn eine Ziffer auf dem Ziffernblock getippt wurde (zählt nicht) */
export const NUMPAD_HINT = 'Der Ziffernblock zählt nicht. Die Zahlen liegen oben über den Buchstaben: Finger hoch und zurück.';

/** Überschrift einer Runde, z. B. „Kalibrierung 1/2“ */
export function roundLabel(round: Round, lessonTitle: string): string {
  switch (round.kind) {
    case 'warmup':
      return 'Aufwärmen';
    case 'tippstunde':
    case 'training':
      return round.frame ?? (round.focus.length ? `Spezialtraining: ${keyList(round.focus)}` : 'Spezialtraining');
    case 'exercise':
      return round.n && round.of ? `${lessonTitle} ${round.n}/${round.of}` : lessonTitle;
  }
}

/** In der Nachbesprechung unter dem Story-Objekt: wann die nächste Szene kommt (nextStageAt) */
export function nextSceneHint(at: number | 'done' | null): string | null {
  if (at === null) return null;
  return at === 'done' ? 'Die Geschichte geht weiter, wenn der Auftrag geschafft ist' : `Nächste Nachricht bei ${Math.round(at * 100)} %`;
}

/** Auf der Missionskarte eines abgeschlossenen Akts mit übrigen Nebenszenen: ein Angebot, kein Zähler (Story-Regel 11) */
export const moreSidesText = (act: string): string => `Krümel hat noch Funksprüche aus ${act}. Wiederhol einen Auftrag!`;

/** Schild in der Kopfzeile der Übung, wenn Fehler nicht anhalten (Flow-Chip an) */
export const FLOW_BADGE = 'Flow-Chip an';
