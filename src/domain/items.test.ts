// Dinge: Besitz wird aus dem Log (überreichende Szenen) und gelösten Fällen abgeleitet.

import { describe, expect, it } from 'vitest';
import { ITEMS } from '../content/items.ts';
import { SCENES } from '../content/story/acts.ts';
import { profile } from '../test/factories.ts';
import { seenKey } from './seen.ts';
import { newItems, ownedItems, piecesFound, receivedItems, type Item } from './items.ts';
import { logScenes } from './scenes.ts';
import type { StoryScene } from './scenes.ts';

const item = (id: string, source: Item['source']): Item => ({ id, name: id, kind: 'gadget', description: '', source });
const scenes: StoryScene[] = [{ id: 'sz', chat: 'intern', trigger: { on: 'side', strand: 'x', order: 1, fromLesson: 'a1' }, lines: [], gives: ['aus-szene'] }];
const content = { scenes, items: [item('aus-szene', { scene: 'sz' }), item('aus-abzeichen', { badge: 'tastsinn' }), item('aus-fall', { case: 'fall' })] };

describe('ownedItems', () => {
  it('Besitz aus überreichender Szene oder gelöstem Fall – ein Abzeichen allein reicht nicht', () => {
    expect([...ownedItems(profile(), content)]).toEqual([]);
    expect([...ownedItems(logScenes(profile(), ['sz'], 1), content)]).toEqual(['aus-szene']);
    expect([...ownedItems(profile({ badges: { tastsinn: 3 } }), content)]).toEqual([]);
    expect([...ownedItems(profile({ cases: { fall: 4 } }), content)]).toEqual(['aus-fall']);
  });

  it('Besitz entsteht beim Auslösen, nicht beim Lesen; unbekannte Szenen im Log stören nicht', () => {
    const p = logScenes(profile(), ['sz', 'gibt-es-nicht'], 1);
    expect(p.story.read).toEqual([]);
    expect(ownedItems(p, content).has('aus-szene')).toBe(true);
  });

  it('„neu“ heißt: im Besitz und noch nicht angesehen', () => {
    const owned = new Set(['aus-abzeichen']);
    expect(newItems(profile(), content.items, owned).map((i) => i.id)).toEqual(['aus-abzeichen']);
    expect(newItems(profile({ seen: [seenKey.item('aus-abzeichen')] }), content.items, owned)).toEqual([]);
  });

  it('receivedItems trennt Garderobe und Koffer; unbekannte IDs fallen weg', () => {
    const items = [item('koffer', { badge: 'a' }), { ...item('hose', { badge: 'a' }), kind: 'cloth' as const }];
    expect(receivedItems(['hose', 'koffer', 'weg'], items)).toEqual({ cloth: [items[1]], gadgets: [items[0]] });
  });
});

describe('Regression: wer etwas bekommen hat, behält es', () => {
  const STILL: Record<string, string> = {
    cardigan: 'serie-3',
    cuffed: 'tastsinn',
    nerd: 'entschluesselt',
    shades: 'grundreihe',
  };
  /** Teile, die ein Abzeichen früher brachte und die jetzt für spätere Akte zurückgelegt sind */
  const LATER: Record<string, string> = { agent: 'uebungen-25', leggings: 'tempo-60', sun: 'sterne-12', shorts: 'erster-auftrag' };
  /** Mit dem Belohnungsplan (Version 7) zurückgelegt: Abzeichen bleiben, nur das Paket ist stillgelegt */
  const LATER_7: Record<string, string> = { striped: 'serie-7', boots: 'sauber-100', agentboots: 'drei-sterne', sandals: 'tempo-100', bob: 'null-fehler', messy: 'ehrenkodex' };

  it('diese Abzeichen bringen weiter dasselbe Teil – überreicht von der Szene zum Abzeichen', () => {
    for (const [id, badge] of Object.entries(STILL)) {
      expect(ITEMS.find((i) => i.id === id)!.source, id).toEqual({ badge });
      expect(ownedItems(logScenes(profile({ badges: { [badge]: 1 } }), [`badge-${badge}`], 1), { scenes: SCENES, items: ITEMS }).has(id), id).toBe(true);
    }
  });

  it('zurückgelegte Teile: wer die alte Meldung im Log hat, behält das Teil; neu kommen sie nicht mehr', () => {
    for (const [id, badge] of Object.entries(LATER)) {
      const scene = SCENES.find((x) => x.id === `badge-${badge}`)!;
      expect(scene.retired, id).toEqual({ since: 6 });
      expect(ownedItems(logScenes(profile(), [scene.id], 1), { scenes: SCENES, items: ITEMS }).has(id), id).toBe(true);
    }
    for (const [id, badge] of Object.entries(LATER_7)) {
      const scene = SCENES.find((x) => x.id === `badge-${badge}`)!;
      expect(scene.retired, id).toEqual({ since: 7 });
      expect(scene.gives, id).toEqual([id]);
      // das Abzeichen selbst bleibt; ohne die Meldung im Log gehört das Teil nicht dazu
      expect(ownedItems(logScenes(profile({ badges: { [badge]: 1 } }), [], 1), { scenes: SCENES, items: ITEMS }).has(id), id).toBe(false);
      expect(ownedItems(logScenes(profile(), [scene.id], 1), { scenes: SCENES, items: ITEMS }).has(id), id).toBe(true);
    }
  });
});

describe('piecesFound', () => {
  const piece = (id: string, scene: string) => ({ id, name: id, text: '', picture: 'feder' as const, scene });
  const fach: Item = { ...item('fach', { badge: 'x' }), pieces: [piece('erst', 's1'), piece('dann', 's2')] };

  it('nur Stücke, deren Szene im Log steht, in Daten-Reihenfolge – auch wenn sie in anderer Reihenfolge geloggt wurden', () => {
    expect(piecesFound(profile(), fach)).toEqual([]);
    expect(piecesFound(logScenes(profile(), ['s2'], 1), fach).map((e) => e.id)).toEqual(['dann']);
    expect(piecesFound(logScenes(profile(), ['s2', 's1'], 1), fach).map((e) => e.id)).toEqual(['erst', 'dann']);
  });

  it('ohne Stücke gibt es nichts', () => {
    expect(piecesFound(profile(), item('lupe', { badge: 'x' }))).toEqual([]);
  });
});
