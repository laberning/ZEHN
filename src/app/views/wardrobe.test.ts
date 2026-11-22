// Ansicht von Garderobe und Koffer.

import { describe, expect, it } from 'vitest';
import type { Item } from '../../domain/items.ts';
import { seenKey } from '../../domain/seen.ts';
import { logScenes } from '../../domain/scenes.ts';
import type { WardrobeItem } from '../../domain/wardrobe.ts';
import { ALL_COURSE } from '../../test/content.ts';
import { profile, rewarded, TEST_FALLAKTE } from '../../test/factories.ts';
import { RULES } from '../rules.ts';
import { wardrobeView } from './wardrobe.ts';

// kleines Bündel: Fallakten für m1 und m2 genügen
const FALLAKTEN = { m1: TEST_FALLAKTE, m2: TEST_FALLAKTE };

describe('wardrobeView', () => {
  const gadget = (id: string, source: Item['source']): Item => ({ id, name: `G-${id}`, kind: 'gadget', description: `Beschreibung ${id}`, source });
  const items: Item[] = [
    gadget('geheim', { badge: 'null-fehler' }),
    gadget('offen', { badge: 'tastsinn' }),
    gadget('erzaehlt', { scene: 'gibt-es-nicht' }),
    { id: 'cuffed', name: 'Krempelhose', kind: 'cloth', description: '', source: { badge: 'tastsinn' } },
  ];
  // die Meldung zum Abzeichen überreicht Gadget und Hose
  const story = { scenes: [{ id: 'badge-tastsinn', chat: 'kruemel' as const, trigger: { on: 'badge' as const, badgeId: 'tastsinn' }, lines: [], gives: ['offen', 'cuffed'] }], items, cases: [], fallakten: {} };
  const wardrobe: WardrobeItem[] = [
    { id: 'cuffed', name: 'Krempelhose', parts: [], source: { badge: 'tastsinn' } },
    { id: 'leggings', name: 'Leggings', parts: [], source: { badge: 'tempo-60' } },
    { id: 'basic', name: 'Jeans', parts: [] },
  ];

  it('zählt Spezialteile und Gadgets, markiert Neues, Hinweise für fehlende Gadgets – geheime Abzeichen bleiben geheim', () => {
    const v = wardrobeView(profile(rewarded('tastsinn')), RULES, story, wardrobe);
    expect(v.special).toEqual({ unlocked: 1, total: 2 });
    expect(v.gadgetCount).toEqual({ owned: 1, total: 3 });
    expect(v.fresh.map((i) => i.id)).toEqual(['offen', 'cuffed']);
    expect(v.freshCloth).toEqual(['Krempelhose']);
    expect(v.gadgets).toEqual([
      { id: 'geheim', has: false, name: '???', fresh: false, text: 'Kommt mit dem Abzeichen „Geheimes Abzeichen“', pieces: [], fallakte: null },
      { id: 'offen', has: true, name: 'G-offen', fresh: true, text: 'Beschreibung offen', pieces: [], fallakte: null },
      { id: 'erzaehlt', has: false, name: '???', fresh: false, text: 'Kommt in der Geschichte', pieces: [], fallakte: null },
    ]);
  });

  it('Beweisfach: nur gefundene Stücke und nur mit Besitz; Fallakte erst, wenn der Einsatz geschafft ist', () => {
    const piece = (id: string, scene: string) => ({ id, name: id, text: '', picture: 'feder' as const, scene });
    const fach: Item = { ...gadget('fach', { scene: 'gib' }), pieces: [piece('a', 'gib'), piece('b', 'spaeter')] };
    const world = { scenes: [{ id: 'gib', chat: 'intern' as const, trigger: { on: 'side' as const, strand: 'x', order: 1, fromLesson: 'a1' }, lines: [], gives: ['fach'] }, { id: 'spaeter', chat: 'intern' as const, trigger: { on: 'side' as const, strand: 'x', order: 2, fromLesson: 'a1' }, lines: [] }], items: [fach], cases: [], fallakten: FALLAKTEN };
    const view = (p: ReturnType<typeof profile>) => wardrobeView(p, RULES, world, wardrobe).gadgets[0]!;
    expect(view(profile())).toMatchObject({ has: false, pieces: [], fallakte: null });
    expect(view(logScenes(profile(), ['gib'], 1))).toMatchObject({ has: true, pieces: [piece('a', 'gib')], fallakte: null });
    expect(view(logScenes(profile(), ['gib', 'spaeter'], 1)).pieces.map((e) => e.id)).toEqual(['a', 'b']);
    const done = logScenes(profile({ exams: { m1: { attempts: 1, outcome: 'passed' } } }), ['gib'], 1);
    expect(view(done).fallakte).toBe('m1');
  });

  it('Beweisfach: der Link führt zur neuesten offenen Fallakte', () => {
    const fach: Item = { ...gadget('fach', { scene: 'gib' }), pieces: [{ id: 'a', name: 'a', text: '', picture: 'feder', scene: 'gib' }] };
    const world = { scenes: [{ id: 'gib', chat: 'intern' as const, trigger: { on: 'side' as const, strand: 'x', order: 1, fromLesson: 'a1' }, lines: [], gives: ['fach'] }], items: [fach], cases: [], fallakten: FALLAKTEN };
    const rules = { ...RULES, course: ALL_COURSE };
    const link = (exams: Record<string, { attempts: number; outcome: 'passed' | 'backdoor' }>) =>
      wardrobeView(logScenes(profile({ exams }), ['gib'], 1), rules, world, wardrobe).gadgets[0]!.fallakte;
    expect(link({})).toBeNull();
    expect(link({ m1: { attempts: 1, outcome: 'passed' } })).toBe('m1');
    expect(link({ m1: { attempts: 1, outcome: 'passed' }, m2: { attempts: 1, outcome: 'backdoor' } })).toBe('m2');
  });

  it('angesehene Dinge sind nicht mehr neu', () => {
    const v = wardrobeView(profile({ badges: { tastsinn: 1 }, seen: [seenKey.item('offen'), seenKey.item('cuffed')] }), RULES, story, wardrobe);
    expect(v.fresh).toEqual([]);
    expect(v.gadgets.find((g) => g.id === 'offen')?.fresh).toBe(false);
  });
});

