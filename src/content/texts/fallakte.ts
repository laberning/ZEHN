// Fallakte: Texte des zerkratzten Zustands (abgeleitet aus dem Story-Log, siehe `fallaktenScratched` in domain/book.ts).

/** Beschriftung des Knopfs im HQ, solange die Fallakten zerkratzt sind (statt „Neu“) */
export const SCRATCHED_LABEL = 'zerkratzt';

/** Kratzer statt der Zeilen der Akte (Textzeichen, kein Emoji) */
export const SCRATCHES: readonly string[] = ['/////////////////', '//////////////', '////////////////////', '///////////', '///////////////////'];

/** Krümels Zeile unter den Kratzern */
export const SCRATCHED_KRUEMEL = 'Zerkratzt. Nicht gelöscht. Was du kannst, hat er nicht erwischt. Piep.';
