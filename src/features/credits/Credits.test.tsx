import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { profile } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';

describe('Credits', () => {
  it('die Grafikteile stecken in einer Box zum Aufklappen; zugeklappt steht die Kurzfassung', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'credits' } });
    const box = app.container.querySelector('details.credit-group')!;
    expect(box).not.toHaveAttribute('open');
    expect(screen.getByText(/\d+ Teile von \d+ Künstlerinnen und Künstlern · Lizenzen: /)).toBeInTheDocument();
    await app.user.click(screen.getByText('Alle Grafikteile der Figuren'));
    expect(box).toHaveAttribute('open');
    // die Brot-Kacheln und Schriften bleiben außerhalb der Box sichtbar
    expect(box.contains(screen.getByText(/Brot-Kacheln/))).toBe(false);
  });

  it('jedes Kachel-Paket steht mit Link auf seine Seite und seine Lizenz in der Liste', async () => {
    await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'credits' } });
    const PACKS: [pack: string, license: string][] = [
      ['CC0 Storage Icons', 'CC0'],
      ['[LPC] Containers', 'CC-BY-SA 4.0'],
      ['[LPC] Wooden Furniture', 'CC-BY-SA 3.0'],
      ['[LPC] Woodshop', 'CC-BY 3.0'],
      ['[LPC Revised] The Office', 'OGA-BY 3.0'],
      ['LPC Lamp Posts Rework', 'CC-BY 3.0'],
      ['LPC Mine Carts and Tracks', 'CC-BY-SA 3.0'],
      ['LPC Sci Fi Megapack', 'CC-BY-SA 4.0'],
    ];
    for (const [pack, license] of PACKS) {
      const link = screen.getByRole('link', { name: new RegExp(pack.replace(/[[\]]/g, '\\$&')) });
      expect(link.getAttribute('href'), pack).toMatch(/^https:\/\/opengameart\.org\/content\//);
      const item = link.closest('li')!;
      expect(item.textContent, pack).toContain(license);
    }
  });
});
