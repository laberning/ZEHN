// Ansichten von Garderobe und Koffer: Zählungen, neue Dinge, Hinweise, woher Gesperrtes kommt.

import type { Profile } from '../../domain/profile.ts';
import { isModuleDone } from '../../domain/progress.ts';
import { isUnlocked, wardrobeItems, wearable, type WardrobeCatalog, type WardrobeItem } from '../../domain/wardrobe.ts';
import type { GameRules } from '../../domain/rules.ts';
import { newItems, ownedItems, piecesFound, type EvidencePiece, type Item } from '../../domain/items.ts';
import { findScene } from '../../domain/scenes.ts';
import type { StoryContent } from '../../domain/storyContent.ts';
import { fallakte } from '../../domain/book.ts';
import { sourceHintsFor } from './common.ts';

export interface WardrobeView {
  /** IDs der Dinge im Besitz (für den Avatar-Editor) */
  owned: ReadonlySet<string>;
  /** Spezialteile (Kleidung mit Quelle): frei / alle */
  special: { unlocked: number; total: number };
  /** Gadgets: im Koffer / alle */
  gadgetCount: { owned: number; total: number };
  /** Neue Dinge, noch nicht angesehen */
  fresh: Item[];
  /** Namen der neuen Kleidungsstücke */
  freshCloth: string[];
  /** Koffer: jedes Gadget; fehlt es, steht statt der Beschreibung der Weg dorthin */
  gadgets: {
    id: string;
    has: boolean;
    name: string;
    fresh: boolean;
    text: string;
    /** Gefundene Beweisstücke (nur wenn das Gadget da ist und Stücke hat; sonst leer) */
    pieces: EvidencePiece[];
    /** Modul, dessen Fallakte offen ist, wenn das Gadget Stücke hat – für „Zur Fallakte“; sonst null */
    fallakte: string | null;
  }[];
}

/** Garderobe und Koffer: Zählungen, neue Dinge und Hinweise, woher fehlende Gadgets kommen */
export function wardrobeView(p: Profile, rules: GameRules, story: Pick<StoryContent, 'scenes' | 'items' | 'cases' | 'fallakten'>, wardrobe: readonly WardrobeItem[]): WardrobeView {
  const owned = ownedItems(p, story);
  const fresh = newItems(p, story.items, owned);
  // zurückgelegt für spätere Akte (Quelle ist eine stillgelegte Szene) zählt nicht mit – es sei denn, man hat es schon
  const later = (i: WardrobeItem) => !!i.source && 'scene' in i.source && !!findScene(story, i.source.scene)?.retired;
  const special = wardrobe.filter((i) => i.source && (!later(i) || owned.has(i.id)));
  const all = story.items.filter((i) => i.kind === 'gadget');
  const hintFor = sourceHintsFor(p, rules, story);
  const hint = (g: Item): string => hintFor(g.source, g.id);
  // die neueste offene Fallakte (ab bestandenem Einsatz oder Hintertür)
  const caseFileModule = rules.course.modules.findLast((m) => isModuleDone(p, m.id) && fallakte(story, m.id))?.id ?? null;
  return {
    owned,
    special: { unlocked: special.filter((i) => isUnlocked(i, owned)).length, total: special.length },
    gadgetCount: { owned: all.filter((g) => owned.has(g.id)).length, total: all.length },
    fresh,
    freshCloth: fresh.filter((i) => i.kind === 'cloth').map((i) => i.name),
    gadgets: all.map((g) => {
      const has = owned.has(g.id);
      return { id: g.id, has, name: has ? g.name : '???', fresh: has && fresh.some((f) => f.id === g.id), text: has ? g.description : hint(g),
        pieces: has ? piecesFound(p, g) : [],
        fallakte: has && g.pieces ? caseFileModule : null,
      };
    }),
  };
}

/** Garderobe beim Öffnen: Zählungen und Koffer (`wardrobeView`), dazu was wählbar ist, was neu ist und woher Gesperrtes kommt */
export function dressingView(p: Profile, rules: GameRules, story: Pick<StoryContent, 'scenes' | 'items' | 'cases' | 'fallakten'>, catalog: WardrobeCatalog) {
  const view = wardrobeView(p, rules, story, wardrobeItems(catalog));
  return {
    ...view,
    // was gespeichert getragen wird, bleibt wählbar – auch wenn es inzwischen gesperrt wäre
    allowed: wearable(catalog, view.owned, p.avatar),
    freshIds: new Set(view.fresh.map((i) => i.id)) as ReadonlySet<string>,
    hintFor: sourceHintsFor(p, rules, story),
  };
}
