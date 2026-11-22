// Hauptquartier: Begrüßung, Agententage, gesperrte Fall-Karten.

import { GIFT_PENDING_TEXT } from './items.ts';

/** Begrüßung im HQ nach längerer Pause: ohne Vorwurf, mit dem Stand der Geschichte (Titel des Story-Objekts und Prozent, beim Einsatz nur dessen Titel; sonst der Hinweis auf Bennos Tippstunde) */
export function welcomeText(story: { title: string; percent?: number } | null): { greeting: string; status: string; offer: string } {
  return {
    greeting: 'Piep! Da bist du ja wieder.',
    status: story ? (story.percent === undefined ? story.title : `${story.title}: ${Math.round(story.percent * 100)}\u00a0%`) : 'Bennos Tippstunde wartet',
    offer: 'Zum Warmwerden eine Runde?',
  };
}

/** Agententage im HQ: „1 Agententag“, „12 Agententage“ (die Zahl steht davor) */
export function daysLabel(days: number): string {
  return days === 1 ? 'Agententag' : 'Agententage';
}

/** Zusatz auf gesperrten Fall-Karten (Text statt Schloss-Symbol) */
export const CASE_LOCKED_LABEL = 'gesperrt';

/** Hinweis auf der Fall-Karte im HQ: gesperrt (Weg zum Gadget), spielbar (mit Tipp vor dem Einsatz) oder gelöst */
export function caseCardHint(c: { gadget?: string; solved: boolean; locked: boolean; badge?: { title: string; description: string }; tip: boolean; pending?: boolean }): string {
  if (c.locked && c.pending) return `Braucht: ${c.gadget}. ${GIFT_PENDING_TEXT}.`;
  if (c.locked) return c.badge ? `Braucht: ${c.gadget}. Hol dafür das Abzeichen „${c.badge.title}“: ${c.badge.description}` : `Braucht: ${c.gadget}.`;
  if (c.solved) return 'Gelöst – noch einmal üben?';
  if (!c.gadget) return 'Ein kleiner Fall zum Üben.';
  const base = `Mit dem Gadget: ${c.gadget}`;
  return c.tip ? `${base}. Tipp: Löse ihn vor dem Einsatz – sein Gadget hilft beim Einsatz oder gleich danach.` : base;
}

/** Knopf im HQ: „Flow-Chip: an“ / „Flow-Chip: aus“ */
export function flowLabel(on: boolean): string {
  return `Flow-Chip: ${on ? 'an' : 'aus'}`;
}

/** Das Gadget, das dem Blindflug-Knopf und Krümels Satz ihre Story-Worte gibt (schaltet nichts frei) */
export const BLIND_GADGET = 'blindflug-brille';

/** Knopf für den Blindflug (HQ und Schreibtisch): mit Brille in Story-Worten, sonst schlicht „Tastatur“ */
export function blindLabel(on: boolean, hasBrille: boolean): string {
  return hasBrille ? `Blindflug: ${on ? 'an' : 'aus'}` : `Tastatur: ${on ? 'aus' : 'an'}`;
}

/** Erklärung (title) am Blindflug-Knopf */
export const BLIND_HINT = 'Die Tastatur auf dem Bildschirm bleibt weg, du tippst blind. Gilt sofort, wenn du in der Runde noch nicht getippt hast, sonst ab der nächsten.';

/** Erklärung (title) am Flow-Chip-Knopf */
export const FLOW_HINT = 'Fehler leuchten nur rot, du tippst weiter';
