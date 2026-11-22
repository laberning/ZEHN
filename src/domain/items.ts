// Dinge: Gadgets (Agentenkoffer) und Kleidung. Besitz wird nie gespeichert, sondern aus den `gives` geloggter Szenen
// (die Übergabe) und gelösten Fällen abgeleitet – so kann kein Spielstand ein Ding „verlieren“ oder doppelt bekommen.

import type { Profile } from './profile.ts';
import { findScene, isLogged, type StoryScene } from './scenes.ts';
import { hasSeen, seenKey } from './seen.ts';
import type { PictureId } from './storyObject.ts';

export type ItemSource = { badge: string } | { scene: string } | { case: string };

/** Ein Beweisstück im Beweisfach: erscheint, sobald die Szene `scene` im Story-Log steht */
export interface EvidencePiece {
  id: string;
  name: string;
  text: string;
  picture: PictureId;
  /** Zeigt die Szene statt des Bildes das Story-Objekt dieses Auftrags (Zeitung, Plakat), steht hier seine `lessonId` */
  object?: string;
  /** Die Szene, die das Stück hineinlegt */
  scene: string;
}

export interface Item {
  id: string;
  name: string;
  kind: 'gadget' | 'cloth';
  /** Gadget: wofür es gut ist. Kleidung: der Zettel im Paket. */
  description: string;
  /**
   * Woher es kommt – genau eine Quelle, für Hinweise („Kommt mit dem Abzeichen …“). Besitzen tut man es erst,
   * wenn die Szene es überreicht hat (`gives`) bzw. der Fall gelöst ist.
   */
  source: ItemSource;
  /** Gadget mit sichtbarem Inhalt (Beweisfach): alle Stücke, die die Geschichte hineinlegen kann, in Reihenfolge */
  pieces?: EvidencePiece[];
}

type OwnedFrom = Pick<Profile, 'story' | 'cases'>;

/** Was `ownedItems` an Inhalten braucht (das Story-Bündel genügt) */
export interface OwnedWorld {
  scenes: readonly StoryScene[];
  items: readonly Item[];
}

/**
 * IDs aller Dinge, die das Kind besitzt: `gives` der ausgelösten Szenen und gelöste Fälle.
 * Ein Abzeichen allein reicht nicht – man besitzt ein Ding, sobald es überreicht wurde (Paket, Ada, Krümel).
 */
export function ownedItems(p: OwnedFrom, content: OwnedWorld): Set<string> {
  const owned = new Set<string>();
  for (const l of p.story.log) for (const id of findScene(content, l.id)?.gives ?? []) owned.add(id);
  for (const item of content.items) if ('case' in item.source && p.cases[item.source.case] !== undefined) owned.add(item.id);
  return owned;
}

/** Besitzt das Kind das Ding und hat es noch nicht in der Garderobe bzw. im Koffer angesehen? */
export function newItems(p: Pick<Profile, 'seen'>, items: readonly Item[], owned: ReadonlySet<string>): Item[] {
  return items.filter((i) => owned.has(i.id) && !hasSeen(p, seenKey.item(i.id)));
}

/** Was zwischen zwei Besitzständen dazugekommen ist (Belohnungsanzeige nach dem Speichern) */
export const receivedItemIds = (before: ReadonlySet<string>, after: ReadonlySet<string>): string[] => [...after].filter((id) => !before.has(id));

/** Überreichte Dinge nach Garderobe und Koffer getrennt (für die Belohnungsanzeige); unbekannte IDs fallen weg */
export function receivedItems(ids: readonly string[], items: readonly Item[]): { cloth: Item[]; gadgets: Item[] } {
  const got = ids.map((id) => items.find((i) => i.id === id)).filter((i): i is Item => !!i);
  return { cloth: got.filter((i) => i.kind === 'cloth'), gadgets: got.filter((i) => i.kind === 'gadget') };
}

/** Die Beweisstücke eines Gadgets, die die Geschichte schon hineingelegt hat (Szene im Log), in Daten-Reihenfolge */
export const piecesFound = (p: Pick<Profile, 'story'>, item: Pick<Item, 'pieces'>): EvidencePiece[] => (item.pieces ?? []).filter((e) => isLogged(p, e.scene));
