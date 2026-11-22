// Kleine Helfer zum Aufschreiben von Szenen (Chat und Bilderbuch).

import type { Choice, Line } from '../../domain/dialog.ts';

type Extra = Partial<Omit<Line, 'speaker' | 'text'>>;
const say = (speaker: Line['speaker']) => (text: string, x: Extra = {}): Line => ({ speaker, text, ...x });

export const ada = say('ada');
export const kr = say('kruemel');
export const jun = say('juna');
export const bar = say('baron');
/** Frau Hubbel, Hüterin des Archivs (schreibt nur in ZEHN intern) */
export const hub = say('hubbel');
/** Erzähler (nur im Bilderbuch) */
export const erz = say('erzaehler');
/** Der Baron, solange man seinen Namen nicht kennt („???“) */
export const unb = say('unbekannt');
/** Tippi, Ottis Maschine im Chat (ZEHN intern und Qwertz-Flüstern); korrigiert fremde Sätze mit `strike`: tip('Neu!', { strike: 'Alt' }) */
export const tip = say('tippi');
/** Benno, der Baron mit seinem Namen im Chat (ab der Szene nach dem Einsatz von Akt 6; im Bilderbuch bleibt er `bar`) */
export const ben = say('benno');
/** Zeile vom Chat selbst („Ada ist offline.“) */
export const sys = say('system');

/** Eine Antwort (Chat und Bilderbuch): Kurzform (höchstens drei Wörter), ganzer Text, Reaktion */
export const ans = (id: string, label: string, text: string, reply: Line[] = [], x: Partial<Choice> = {}): Choice => ({ id, label, text, reply, ...x });

/** Zeile in einem anderen Chat als dem der Szene */
export const inChat = (chat: NonNullable<Line['chat']>, line: Line): Line => ({ ...line, chat });

/** Antworten unter jeder Kleidungs-Übergabe: gleich anprobieren oder später */
export const wardrobeChoices = {
  choices: [
    ans('garderobe', 'Zur Garderobe', 'Zeig her – ich will es anprobieren!', [kr('Ab zum Kleiderschrank! Hinter den Mehlsäcken links.')], { action: 'wardrobe' }),
    ans('spaeter', 'Später', 'Später. Erst wird trainiert.', [kr('Sehr professionell. Ich bin beeindruckt.')]),
  ],
};

/** Post des Diebs als Karte im Chat (Papier mit Goldrand, ohne Titelzeile) */
export const goldCard = (text: string, title = 'Goldrand-Karte') => ({ card: { title, text, look: 'goldcard' as const } });

