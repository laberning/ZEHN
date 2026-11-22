// Helfer für Belohnungs-Szenen (Pakete, Ränge, Geschenke der Geschichte). Szenen-IDs sind Speicherformat: nie umbenennen.

import type { Line } from '../../domain/dialog.ts';
import type { StoryScene } from '../../domain/scenes.ts';
import { CLOTH } from '../items.ts';
import { kr, wardrobeChoices, type ada } from './builders.ts';

/** Stillgelegt mit Inhaltsversion 6 (Belohnungstakt): ältere Spielstände holen diese Übergaben beim Laden noch nach */
export const RETIRED = { since: 6 };
/** Stillgelegt mit Inhaltsversion 7 (Belohnungsplan fürs ganze Spiel): Akt 1 bringt höchstens neun Dinge, der Rest kommt in späteren Akten */
export const RETIRED_7 = { since: 7 };

export const cloth = (id: string) => CLOTH.find((c) => c.id === id)!;

/**
 * Paket von Herrn Kringel zu einem Abzeichen: `says` ist sein Satz an der Tür, Name und Zettel kommen vom Garderobe-Teil.
 * Die Szenen-ID ist `badge-<Abzeichen>`, außer `opts.id` nennt eine andere (Drehbuch eines späteren Akts); `opts.intro`
 * ist eine Zeile Krümels davor,
 * `opts.note` ersetzt den Zettel des Teils (stillgelegte Pakete behalten ihren alten Zettel, wenn das Teil später eine neue Quelle bekam).
 */
export function packageScene(badgeId: string, says: string, clothId: string, retired?: { since: number }, opts: { id?: string; intro?: string; note?: string } = {}): StoryScene {
  const { name, description } = cloth(clothId);
  const note = opts.note ?? description;
  return {
    ...(retired ? { retired } : {}),
    id: opts.id ?? `badge-${badgeId}`,
    chat: 'kruemel',
    trigger: { on: 'badge', badgeId },
    gives: [clothId],
    gift: true,
    lines: [...(opts.intro ? [kr(opts.intro)] : []), kr(`Postbote Kringel: „${says}“`, { picture: 'paket' }), kr(`Im Paket: ${name}. Auf dem Zettel steht: „${note}“`, wardrobeChoices)],
  };
}


/** `rank` ist der Rang-Schlüssel (content/rewards.ts); die Szenen-ID hängt daran und bleibt so, wie sie ist */
export const rankScene = (rank: string, lines: Line[], gives?: string): StoryScene => ({
  id: `rank-${rank}`,
  chat: 'intern',
  trigger: { on: 'rank', rank },
  gift: true,
  lines: gives ? [...lines, kr(`Zur Beförderung: ${cloth(gives).name}. ${cloth(gives).description}`, wardrobeChoices)] : lines,
  ...(gives ? { gives: [gives] } : {}),
});

/** Übergabe in der Geschichte: eigene kleine Szene mit demselben Auslöser wie die Haupt-Szene; der Satz ist der Zettel des Teils */
export const gift = (id: string, clothId: string, trigger: StoryScene['trigger'], speaker: typeof ada, chat: StoryScene['chat'] = 'intern'): StoryScene => ({
  id,
  chat,
  trigger,
  gives: [clothId],
  gift: true,
  lines: [speaker(cloth(clothId).description, wardrobeChoices)],
});
