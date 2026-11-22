// Geteiltes der Ansichten: Hinweise, woher Dinge kommen; Dinge der Akte.

import { describe, expect, it } from 'vitest';
import { mastered, profile } from '../../test/factories.ts';
import { RULES, STORY } from '../rules.ts';
import { hqView } from './hq.ts';
import { sourceHintsFor } from './common.ts';

describe('sourceHintsFor: woher ein gesperrtes Ding kommt', () => {
  const p = profile();
  it('nennt den Moment der Geschichte: Ende eines Auftrags, Rang (passend zur Figur), Einsatz', () => {
    expect(sourceHintsFor(p, RULES, STORY)({ scene: 'gift-polo' })).toBe('Kommt am Ende von Auftrag 2');
    expect(sourceHintsFor(p, RULES, STORY)({ scene: 'rank-agent' })).toBe('Kommt mit dem Rang Agentin');
    expect(sourceHintsFor(p, RULES, STORY)({ scene: 'gift-weste' })).toBe('Kommt am Ende von Auftrag 5');
    expect(sourceHintsFor(p, RULES, STORY)({ scene: 'gift-melone' })).toBe('Kommt in einem späteren Akt'); // zurückgelegt
    expect(sourceHintsFor(p, RULES, STORY)({ scene: 'badge-tempo-60' })).toBe('Kommt in einem späteren Akt'); // stillgelegtes Paket
    expect(sourceHintsFor(p, RULES, STORY)({ scene: 'badge-serie-7' })).toBe('Kommt in einem späteren Akt'); // Belohnungsplan (Version 7)
    expect(sourceHintsFor(p, RULES, STORY)({ scene: 'gibt-es-nicht' })).toBe('Kommt in der Geschichte');
  });
  it('Aufträge zählen je Akt: ab Akt 2 steht der Akt dabei (nicht „Auftrag 8“)', () => {
    const hint = sourceHintsFor(p, RULES, STORY);
    expect(hint({ scene: 'a2-gift-schal' })).toBe('Kommt zu Beginn von Auftrag 2 in Akt 2');
    expect(hint({ scene: 'a2-gift-shorts' })).toBe('Kommt nach dem Einsatz in Akt 2');
    expect(hint({ scene: 'a2-side-juna-2' })).toBe('Kommt in der Geschichte'); // Nebenszene: ohne festen Moment
  });
  it('verdient, aber noch nicht überreicht: „ist unterwegs“ – auch auf der gesperrten Fall-Karte', () => {
    const waiting = profile({ badges: { tastsinn: 1, tresorknacker: 1 }, lessons: mastered('m1-l1', 'm1-l2'), seen: ['briefing:m1-l3'] });
    expect(sourceHintsFor(waiting, RULES, STORY)({ badge: 'tastsinn' }, 'cuffed')).toBe('Ist unterwegs – kommt am Ende deines nächsten Durchgangs');
    const kringel = hqView(waiting, RULES, STORY).extra.find((c) => c.id === 'kringels-briefkasten')!;
    expect(kringel).toMatchObject({ locked: true, hint: 'Braucht: Stethoskop. Ist unterwegs – kommt am Ende deines nächsten Durchgangs.' });
  });

  it('geheime Abzeichen bleiben verborgen', () => {
    expect(sourceHintsFor(p, RULES, STORY)({ badge: 'null-fehler' })).not.toContain('Null Fehler');
  });
});

describe('Dinge der Akte', () => {
  it('Dinge von Akt 2 (Gadgets, Kleidung) sind im Spiel, sobald der Akt eingehängt ist', () => {
    const ids = STORY.items.map((i) => i.id);
    for (const id of ['fernglas', 'verkleidungskoffer', 'scarf', 'cap', 'shorts', 'sun', 'dechiffrierscheibe']) expect(ids, id).toContain(id);
  });
});

