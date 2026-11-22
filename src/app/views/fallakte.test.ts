// Ansicht der Fallakte: Firewall und Verdächtige.

import { describe, expect, it } from 'vitest';
import { COURSE } from '../../content/course.ts';
import { logScenes } from '../../domain/scenes.ts';
import { seenKey } from '../../domain/seen.ts';
import type { Fallakte } from '../../domain/book.ts';
import type { StoryContent } from '../../domain/storyContent.ts';
import { masteredModule, NO_BOOK, profile, TEST_FALLAKTE } from '../../test/factories.ts';
import { RULES, STORY } from '../rules.ts';
import { hqView } from './hq.ts';
import { fallakteView } from './fallakte.ts';

// kleines Bündel mit einer eigenen Fallakte: die Ansicht hängt nicht an den echten Texten
const hit = (text: string, scene: string, choice: string) => ({ text, ifPicked: { scene, choice } });
const AKTE: Fallakte = {
  ...TEST_FALLAKTE,
  suspects: [
    { name: 'Herr Kringel', status: 'verdaechtig', text: '', picture: 'portraet-kringel', hits: [hit('Kringel hattest du zuerst im Verdacht.', 'l2-s75', 'verdaechtig')] },
    {
      name: 'Baron von Backspace',
      status: 'gesucht',
      picture: 'portraet-baron',
      text: '',
      hits: [hit('„Zylinder“ hast du zuerst gesagt.', 'l5-s75', 'zylinder'), hit('Du hast ihn einen Dieb mit Stil genannt.', 'l1-done', 'dieb'), hit('Du hast ihn einen Buchstaben-Fan genannt.', 'l1-done', 'fan')],
    },
  ],
};
const SMALL: StoryContent = { version: 1, scenes: [], objects: [], items: [], cases: [], ...NO_BOOK, fallakten: { m1: AKTE } };

describe('Fallakte', () => {
  const lessons = masteredModule(COURSE, 'm1');

  it('hqView: erst nach dem Einsatz da, „Neu“ bis zum ersten Öffnen', () => {
    expect(hqView(profile({ lessons }), RULES, STORY).modules[0]).toMatchObject({ done: false, fallakteNew: false });
    const passed = profile({ lessons, exams: { m1: { attempts: 1, outcome: 'passed' } } });
    expect(hqView(passed, RULES, STORY).modules[0]).toMatchObject({ done: true, fallakteNew: true });
    const seen = { ...passed, seen: [seenKey.fallakte('m1')] };
    expect(hqView(seen, RULES, STORY).modules[0]).toMatchObject({ done: true, fallakteNew: false });
  });

  it('fallakteView: Firewall gehalten oder wackelig, je nach Ergebnis des Einsatzes', () => {
    expect(fallakteView(profile({ exams: { m1: { attempts: 1, outcome: 'passed' } } }), SMALL, 'm1')).toMatchObject({ firewall: 'passed' });
    expect(fallakteView(profile({ exams: { m1: { attempts: 3, outcome: 'backdoor' } } }), SMALL, 'm1')).toMatchObject({ firewall: 'backdoor' });
  });
});

describe('fallakteView: Verdächtige', () => {
  const hits = (picks: Record<string, string[]>) => {
    const p = profile();
    p.story.picks = picks;
    return Object.fromEntries(fallakteView(p, SMALL, 'm1').suspects.map((s) => [s.name, s.hits.map((h) => h.text)]));
  };

  it('ohne Antworten: beide Verdächtigen, keine Treffer-Zeilen', () => {
    const view = fallakteView(profile(), SMALL, 'm1');
    expect(view.suspects.map((s) => [s.name, s.status])).toEqual([
      ['Herr Kringel', 'verdaechtig'],
      ['Baron von Backspace', 'gesucht'],
    ]);
    expect(view.suspects.every((s) => s.hits.length === 0)).toBe(true);
  });

  it('mit passender Antwort erscheint die Treffer-Zeile', () => {
    expect(hits({ 'l5-s75': ['zylinder'] })['Baron von Backspace']).toEqual(['„Zylinder“ hast du zuerst gesagt.']);
    expect(hits({ 'l2-s75': ['verdaechtig'] })['Herr Kringel']).toEqual(['Kringel hattest du zuerst im Verdacht.']);
    expect(hits({ 'l5-s75': ['andere'] })['Baron von Backspace']).toEqual([]);
  });

  it('Dieb und Fan schließen sich aus', () => {
    expect(hits({ 'l1-done': ['dieb'] })['Baron von Backspace']).toEqual(['Du hast ihn einen Dieb mit Stil genannt.']);
    expect(hits({ 'l1-done': ['fan'] })['Baron von Backspace']).toEqual(['Du hast ihn einen Buchstaben-Fan genannt.']);
  });

  it('Modul ohne Fallakte: keine Verdächtigen, nichts gelöst oder offen', () => {
    expect(fallakteView(profile(), SMALL, 'gibt-es-nicht')).toMatchObject({ suspects: [], solved: [], open: [] });
  });
});

describe('fallakteView: gelöst und offen mit Antwort-Bedingung', () => {
  const story = (file: Fallakte): StoryContent => ({ ...SMALL, fallakten: { m1: file } });
  const FILE: Fallakte = {
    ...AKTE,
    solved: [{ text: 'immer da' }, { text: 'nur mit Antwort', ifPicked: { scene: 'l3-s75', choice: 'keks' } }],
    open: [{ text: 'offen immer' }, { text: 'offen mit Antwort', ifPicked: { scene: 'l3-s75', choice: 'keks' } }],
  };
  const texts = (picks: Record<string, string[]>) => {
    const p = profile();
    p.story.picks = picks;
    const v = fallakteView(p, story(FILE), 'm1');
    return [v.solved.map((e) => e.text), v.open.map((e) => e.text)];
  };

  it('Zeilen ohne Bedingung stehen immer da, Zeilen mit Bedingung nur bei passender Antwort', () => {
    expect(texts({})).toEqual([['immer da'], ['offen immer']]);
    expect(texts({ 'l3-s75': ['zwei'] })).toEqual([['immer da'], ['offen immer']]);
    expect(texts({ 'l3-s75': ['keks'] })).toEqual([['immer da', 'nur mit Antwort'], ['offen immer', 'offen mit Antwort']]);
  });
});

describe('zerkratzte Fallakten (abgeleitet aus dem Story-Log)', () => {
  const DAMAGE = { from: 'schaden', until: 'heil' };
  const full: Fallakte = { ...AKTE, solved: [{ text: 'gelöst' }], open: [{ text: 'offen' }] };
  const story: StoryContent = { ...SMALL, fallakten: { m1: full }, fallaktenDamage: [DAMAGE] };
  const lessons = masteredModule(COURSE, 'm1');
  const passed = (...log: string[]) => logScenes(profile({ lessons, exams: { m1: { attempts: 1, outcome: 'passed' } } }), log, 1);

  it('fallakteView: vor dem Schaden lesbar, währenddessen verdeckt (keine Zeilen, Verdächtigen, Treffer), danach wieder lesbar', () => {
    const readable = (p: ReturnType<typeof passed>) => fallakteView(p, story, 'm1');
    expect(readable(passed())).toMatchObject({ scratched: false, solved: [{ text: 'gelöst' }], open: [{ text: 'offen' }] });
    expect(readable(passed()).suspects).toHaveLength(2);
    const during = readable(passed('schaden'));
    expect(during).toMatchObject({ scratched: true, solved: [], open: [], suspects: [] });
    expect(readable(passed('schaden', 'heil'))).toMatchObject({ scratched: false, solved: [{ text: 'gelöst' }] });
  });

  it('hqView: der Knopf zeigt „zerkratzt“ nur für fertige Akte und nur zwischen den beiden Szenen', () => {
    const view = (p: ReturnType<typeof passed>) => hqView(p, RULES, { ...STORY, fallaktenDamage: [DAMAGE] }).modules[0]!.fallakteScratched;
    expect(view(passed())).toBe(false);
    expect(view(passed('schaden'))).toBe(true);
    expect(view(passed('schaden', 'heil'))).toBe(false);
    // ein Akt ohne Fallakte (Einsatz noch offen) zeigt nichts
    expect(view(logScenes(profile({ lessons }), ['schaden'], 1))).toBe(false);
  });

  it('ohne Eintrag (Akt 1 bis 4 allein) ändert sich nichts, auch wenn Szenen mit diesen Namen im Log stehen', () => {
    const p = passed('schaden');
    expect(fallakteView(p, { ...story, fallaktenDamage: [] }, 'm1').scratched).toBe(false);
    expect(fallakteView(p, SMALL, 'm1').scratched).toBe(false);
    expect(hqView(p, RULES, STORY).modules[0]!.fallakteScratched).toBe(false);
  });
});
