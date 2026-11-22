// Deutsches QWERTZ-Layout (DIN 2137 T1, wie unter Windows/macOS üblich)
// mit der Fingerzuordnung des Zehn-Finger-Systems.

export type Finger =
  | 'lPinky'
  | 'lRing'
  | 'lMiddle'
  | 'lIndex'
  | 'thumb'
  | 'rIndex'
  | 'rMiddle'
  | 'rRing'
  | 'rPinky';

export type Hand = 'left' | 'right';

export interface PhysicalKey {
  /** KeyboardEvent.code */
  code: string;
  /** 0 = Zahlenreihe, 1 = obere Reihe, 2 = Grundreihe, 3 = untere Reihe, 4 = Leertaste */
  row: 0 | 1 | 2 | 3 | 4;
  base: string;
  shift?: string;
  altGr?: string;
  finger: Finger;
  /** Tasten mit fühlbarer Markierung (f, j) */
  bump?: boolean;
  /** Tottaste: erzeugt erst mit dem nächsten Zeichen eine Eingabe */
  dead?: boolean;
}

export const FINGER_LABELS: Record<Finger, string> = {
  lPinky: 'linker kleiner Finger',
  lRing: 'linker Ringfinger',
  lMiddle: 'linker Mittelfinger',
  lIndex: 'linker Zeigefinger',
  thumb: 'Daumen',
  rIndex: 'rechter Zeigefinger',
  rMiddle: 'rechter Mittelfinger',
  rRing: 'rechter Ringfinger',
  rPinky: 'rechter kleiner Finger',
};

export function handOf(finger: Finger): Hand | 'both' {
  if (finger === 'thumb') return 'both';
  return finger.startsWith('l') ? 'left' : 'right';
}

/** Derselbe Finger der anderen Hand (linker kleiner Finger und rechter kleiner Finger …); der Daumen hat keinen Spiegel */
export function mirrorFinger(finger: Finger): Finger | null {
  if (finger === 'thumb') return null;
  return (finger.startsWith('l') ? `r${finger.slice(1)}` : `l${finger.slice(1)}`) as Finger;
}

/** Grundstellungstaste des Fingers (A S D F / J K L Ö, Daumen: Leertaste) – wohin er nach jedem Griff zurückkehrt */
export const HOME_KEYS: Readonly<Record<Finger, string>> = {
  lPinky: 'a',
  lRing: 's',
  lMiddle: 'd',
  lIndex: 'f',
  thumb: ' ',
  rIndex: 'j',
  rMiddle: 'k',
  rRing: 'l',
  rPinky: 'ö',
};

export const homeKeyOf = (finger: Finger): string => HOME_KEYS[finger];

type Row = PhysicalKey['row'];
const k = (
  code: string,
  row: Row,
  finger: Finger,
  base: string,
  shift?: string,
  altGr?: string,
  extra: Partial<PhysicalKey> = {},
): PhysicalKey => ({ code, row, finger, base, shift, altGr, ...extra });

export const KEYS: readonly PhysicalKey[] = [
  // Zahlenreihe
  k('Backquote', 0, 'lPinky', '^', '°', undefined, { dead: true }),
  k('Digit1', 0, 'lPinky', '1', '!'),
  k('Digit2', 0, 'lRing', '2', '"', '²'),
  k('Digit3', 0, 'lMiddle', '3', '§', '³'),
  k('Digit4', 0, 'lIndex', '4', '$'),
  k('Digit5', 0, 'lIndex', '5', '%'),
  k('Digit6', 0, 'rIndex', '6', '&'),
  k('Digit7', 0, 'rIndex', '7', '/', '{'),
  k('Digit8', 0, 'rMiddle', '8', '(', '['),
  k('Digit9', 0, 'rRing', '9', ')', ']'),
  k('Digit0', 0, 'rPinky', '0', '=', '}'),
  k('Minus', 0, 'rPinky', 'ß', '?', '\\'),
  k('Equal', 0, 'rPinky', '´', '`', undefined, { dead: true }),
  // Obere Reihe
  k('KeyQ', 1, 'lPinky', 'q', 'Q', '@'),
  k('KeyW', 1, 'lRing', 'w', 'W'),
  k('KeyE', 1, 'lMiddle', 'e', 'E', '€'),
  k('KeyR', 1, 'lIndex', 'r', 'R'),
  k('KeyT', 1, 'lIndex', 't', 'T'),
  k('KeyY', 1, 'rIndex', 'z', 'Z'),
  k('KeyU', 1, 'rIndex', 'u', 'U'),
  k('KeyI', 1, 'rMiddle', 'i', 'I'),
  k('KeyO', 1, 'rRing', 'o', 'O'),
  k('KeyP', 1, 'rPinky', 'p', 'P'),
  k('BracketLeft', 1, 'rPinky', 'ü', 'Ü'),
  k('BracketRight', 1, 'rPinky', '+', '*', '~'),
  // Grundreihe
  k('KeyA', 2, 'lPinky', 'a', 'A'),
  k('KeyS', 2, 'lRing', 's', 'S'),
  k('KeyD', 2, 'lMiddle', 'd', 'D'),
  k('KeyF', 2, 'lIndex', 'f', 'F', undefined, { bump: true }),
  k('KeyG', 2, 'lIndex', 'g', 'G'),
  k('KeyH', 2, 'rIndex', 'h', 'H'),
  k('KeyJ', 2, 'rIndex', 'j', 'J', undefined, { bump: true }),
  k('KeyK', 2, 'rMiddle', 'k', 'K'),
  k('KeyL', 2, 'rRing', 'l', 'L'),
  k('Semicolon', 2, 'rPinky', 'ö', 'Ö'),
  k('Quote', 2, 'rPinky', 'ä', 'Ä'),
  k('Backslash', 2, 'rPinky', '#', "'"),
  // Untere Reihe
  k('IntlBackslash', 3, 'lPinky', '<', '>', '|'),
  k('KeyZ', 3, 'lPinky', 'y', 'Y'),
  k('KeyX', 3, 'lRing', 'x', 'X'),
  k('KeyC', 3, 'lMiddle', 'c', 'C'),
  k('KeyV', 3, 'lIndex', 'v', 'V'),
  k('KeyB', 3, 'lIndex', 'b', 'B'),
  k('KeyN', 3, 'rIndex', 'n', 'N'),
  k('KeyM', 3, 'rIndex', 'm', 'M', 'µ'),
  k('Comma', 3, 'rMiddle', ',', ';'),
  k('Period', 3, 'rRing', '.', ':'),
  k('Slash', 3, 'rPinky', '-', '_'),
  // Leertaste
  k('Space', 4, 'thumb', ' '),
];

export interface Keystroke {
  key: PhysicalKey;
  /** Welche Shift-Taste gedrückt werden muss (immer die der Gegenhand). */
  shift?: Hand;
  altGr?: boolean;
}

const byChar = new Map<string, Keystroke>();
for (const key of KEYS) {
  if (!key.dead) byChar.set(key.base, { key });
  if (key.shift && !key.dead) {
    const hand = handOf(key.finger);
    byChar.set(key.shift, { key, shift: hand === 'left' ? 'right' : 'left' });
  }
  if (key.altGr) byChar.set(key.altGr, { key, altGr: true });
}

/** Wie wird dieses Zeichen getippt? `undefined`, wenn es nicht direkt tippbar ist. */
export function keystrokeFor(char: string): Keystroke | undefined {
  return byChar.get(char);
}

export function isTypeable(char: string): boolean {
  return byChar.has(char);
}

// ---------- Lerneinheiten ----------
// Gezählt, gesiegelt und gewichtet wird eine Lerneinheit: Ein Großbuchstabe A–Z gehört zur Umschalttaste seiner Hand
// (die Hand, die ihn nicht tippt), die großen Umlaute Ä Ö Ü bilden zusammen eine Lerneinheit (alle drei mit der linken Umschalttaste),
// jedes andere Zeichen (Kleinbuchstaben, Satzzeichen, ß) ist seine eigene Lerneinheit.
// Der Kurs nennt weiter Zeichen; die Übersetzung steht nur hier. Kennungen im Tastenprofil: 'shift-left' = linke Umschalttaste
// (für Buchstaben der rechten Hand), 'shift-right' = rechte Umschalttaste (für Buchstaben der linken Hand),
// 'umlaute-gross' = die großen Umlaute Ä Ö Ü.

export const SHIFT_LEFT = 'shift-left';
export const SHIFT_RIGHT = 'shift-right';
/** Die großen Umlaute Ä Ö Ü als eine Lerneinheit (ein gemeinsames Siegel, Ring auf den drei Tasten) */
export const UMLAUTE_GROSS = 'umlaute-gross';

/** Ist das eine Umschalttaste als Lerneinheit? */
export const isShiftKey = (unit: string): boolean => unit === SHIFT_LEFT || unit === SHIFT_RIGHT;

/** Lerneinheit der Großschreibung: eine Umschalttaste (Großbuchstaben A–Z) oder die großen Umlaute */
export const isCapitalUnit = (unit: string): boolean => isShiftKey(unit) || unit === UMLAUTE_GROSS;

/** Großbuchstabe A–Z (Ä Ö Ü bilden die eigene Lerneinheit „Große Umlaute“) */
export const isCapitalLetter = (char: string): boolean => /^[A-Z]$/.test(char);

/** Großer Umlaut Ä Ö Ü */
export const isCapitalUmlaut = (char: string): boolean => /^[ÄÖÜ]$/.test(char);

/** Lerneinheit eines Zeichens; eine Lerneinheit selbst bleibt unverändert */
export function learnKey(char: string): string {
  if (isCapitalUmlaut(char)) return UMLAUTE_GROSS;
  if (!isCapitalLetter(char)) return char;
  return keystrokeFor(char)?.shift === 'left' ? SHIFT_LEFT : SHIFT_RIGHT;
}

/** Lerneinheiten dieser Zeichen: eindeutig, Reihenfolge des ersten Auftretens bleibt erhalten */
export const learnKeys = (chars: readonly string[]): string[] => [...new Set(chars.map(learnKey))];

/** Die Zeichen einer Lerneinheit unter den gegebenen Zeichen */
export const charsOf = (unit: string, chars: readonly string[]): string[] => chars.filter((c) => learnKey(c) === unit);
