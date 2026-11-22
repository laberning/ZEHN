// Besonderheiten von Akt 1: Fallakte (vier offene Spuren, Hintertür-Text, Krümels Schlusssatz).
// Alles, was für jeden Akt gilt, steht in course.test.ts, story.test.ts und rewards.test.ts und liest das Prüfprofil `check` des Bündels.

import { describe, expect, it } from 'vitest';
import { AKT1 } from './story/akt1/index.ts';

describe('Akt 1', () => {
  it('Akt 1: vier offene Spuren, Hintertür-Text nennt das Nachholen, Krümel schließt ab', () => {
    const f = AKT1.fallakte;
    expect(f.open.map((e) => e.text)).toEqual([
      'Wer ist neben Ada auf dem Foto?',
      'Warum riecht Krümel nach Vanille?',
      'Wo ist das O?',
      'Was bedeutet der Funkturm?',
    ]);
    expect(f.firewall.backdoor).toBe('Firewall: wackelig – Einsatz nachholen');
    expect(f.closing).toBe('Den Rest knacken wir als Nächstes. Bis dahin: Spielhalle und Training.');
  });
});
