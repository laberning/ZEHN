import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { keyStat } from '../../test/factories.ts';
import { sealOf, type MasteryCriteria } from '../../domain/mastery.ts';
import { KeySeals } from './KeySeals.tsx';

const C: MasteryCriteria = { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 };

describe('KeySeals', () => {
  it('zeigt bei zugem „Genau“ und fertiger Messung, wie viele Treffer fehlen', () => {
    const seal = sealOf('f', keyStat({ samples: 40, accuracy: 0.85, avgMs: 500 }), C);
    const { container } = render(<KeySeals seals={[seal]} />);
    expect(container.textContent).toContain(`noch ${seal.hitsToOpen} Treffer`);
    expect(seal.hitsToOpen).toBeGreaterThan(0);
  });

  it('zeigt nichts davon, solange noch gemessen wird oder „Genau“ offen ist', () => {
    const measuring = render(<KeySeals seals={[sealOf('f', keyStat({ samples: 5, accuracy: 0.5 }), C)]} />);
    expect(measuring.container.textContent).not.toContain('Treffer');
    const open = render(<KeySeals seals={[sealOf('j', keyStat({ samples: 40, accuracy: 0.85, avgMs: 2000 }), C, ['precision'])]} />);
    expect(open.container.textContent).not.toContain('Treffer');
  });

  it('ein offener Riegel bleibt nach einem Fehler offen (Haken statt Punkte)', () => {
    const seal = sealOf('f', keyStat({ samples: 40, accuracy: 0.85, avgMs: 500 }), C, ['training', 'precision', 'tempo']);
    const { container } = render(<KeySeals seals={[seal]} />);
    expect(container.textContent).toContain('gesichert');
    expect(container.textContent).not.toContain('Treffer');
  });
});

describe('KeySeals: Umschalttaste', () => {
  it('das Siegel heißt „Umschalt rechts“ / „Umschalt links“', () => {
    const { container } = render(<KeySeals seals={[sealOf('shift-right', undefined, C), sealOf('shift-left', undefined, C)]} />);
    expect(container.textContent).toContain('Umschalt rechts');
    expect(container.textContent).toContain('Umschalt links');
    expect(container.querySelector('[data-key="shift-right"]')).not.toBeNull();
  });
});

describe('KeySeals: Satzzeichen', () => {
  it('der Chip zeigt das Zeichen, der Hinweis den Namen', () => {
    const { container } = render(<KeySeals seals={[sealOf('?', keyStat({ samples: 3, accuracy: 1, avgMs: 500 }), C)]} />);
    expect(container.querySelector('[data-key="?"] b')?.textContent).toBe('?');
    expect(container.querySelector('.latch')?.getAttribute('title')).toContain('Fragezeichen');
    expect(container.querySelector('.latch')?.getAttribute('title')).not.toContain('hast du ?');
  });
});
