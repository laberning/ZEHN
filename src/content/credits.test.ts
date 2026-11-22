// Fremde Grafiken: Jede Creative-Commons-Quelle braucht einen Link auf ihre Lizenz; bei „BY-SA“ steht, was wir verändert haben.

import { describe, expect, it } from 'vitest';
import { creditSummary, LICENSE_URLS, OTHER_CREDITS } from './credits.ts';

describe('Credits', () => {
  it('Creative-Commons-Quellen sind verlinkt; Änderungen an BY-SA-Grafiken sind genannt', () => {
    for (const o of OTHER_CREDITS.filter((x) => x.license.startsWith('CC'))) {
      expect(LICENSE_URLS[o.license], o.what).toBeDefined();
      if (o.license.includes('SA')) expect(o.changes, o.what).toBeTruthy();
    }
  });

  it('Kurzfassung für die zugeklappte Box: Teile, verschiedene Urheber, Lizenzen ohne Doppelte', () => {
    const list = [
      { authors: ['A', 'B'], licenses: ['CC0', 'GPL 3.0'] },
      { authors: ['B'], licenses: ['GPL 3.0'] },
      { authors: ['C'], licenses: ['CC-BY-SA 3.0'] },
    ];
    expect(creditSummary(list)).toEqual({ parts: 3, authors: 3, licenses: ['CC0', 'GPL 3.0', 'CC-BY-SA 3.0'] });
  });
});
