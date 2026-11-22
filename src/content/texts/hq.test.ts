import { describe, expect, it } from 'vitest';
import { ITEMS } from '../items.ts';
import { BLIND_GADGET, blindLabel, daysLabel, welcomeText } from './hq.ts';

describe('Oberflächentexte: Hauptquartier', () => {
  it('Agententage: einer oder mehrere', () => {
    expect(daysLabel(1)).toBe('Agententag');
    expect(daysLabel(0)).toBe('Agententage');
    expect(daysLabel(3)).toBe('Agententage');
  });

  it('Blindflug-Knopf: ohne Brille „Tastatur“, mit Brille „Blindflug“', () => {
    expect(blindLabel(false, false)).toBe('Tastatur: an');
    expect(blindLabel(true, false)).toBe('Tastatur: aus');
    expect(blindLabel(false, true)).toBe('Blindflug: aus');
    expect(blindLabel(true, true)).toBe('Blindflug: an');
    expect(ITEMS.some((i) => i.id === BLIND_GADGET)).toBe(true); // die Brille gibt es als Gadget
  });

  it('Begrüßung nach einer Pause: Stand der Geschichte; nach dem Finale der Hinweis auf Bennos Tippstunde, ohne „Fortsetzung“', () => {
    expect(welcomeText({ title: 'Das Ortsschild', percent: 0.5 }).status).toBe('Das Ortsschild: 50\u00a0%');
    expect(welcomeText({ title: 'Einsatz: Die Firewall' }).status).toBe('Einsatz: Die Firewall');
    expect(welcomeText(null).status).toBe('Bennos Tippstunde wartet');
    expect(Object.values(welcomeText(null)).join(' ')).not.toMatch(/Fortsetzung|vorerst|bald/);
  });
});
