import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ITEMS } from '../../content/items.ts';
import { PALETTE } from '../pixel/palette.ts';
import { inlineImages } from '../pixel/pixelImage.ts';
import { GadgetIcon } from './GadgetIcon.tsx';

describe('Gadget-Symbole', () => {
  it('jedes Gadget hat ein gezeichnetes Bild (kein Ersatzzeichen)', () => {
    for (const g of ITEMS.filter((i) => i.kind === 'gadget')) {
      const { container, unmount } = render(<GadgetIcon id={g.id} has />);
      const svg = container.querySelector('svg.gadget-pic');
      expect(svg, g.id).not.toBeNull();
      // Bildart „gadget“ im Grundmaßstab: 16×16 Raster, dreifach (ganzzahlig) überall gleich groß
      expect(svg!.getAttribute('viewBox'), g.id).toBe('0 0 16 16');
      expect(svg!.getAttribute('width'), g.id).toBe('48');
      unmount();
    }
  });

  it('die Shift-Handschuhe haben ein eigenes Symbol, das fehlende Gadget nur den Umriss', () => {
    const has = render(<GadgetIcon id="shift-handschuhe" has />);
    const hasSvg = inlineImages(has.container.innerHTML);
    has.unmount();
    const missing = render(<GadgetIcon id="shift-handschuhe" has={false} />);
    expect(hasSvg).toContain('rect');
    expect(inlineImages(missing.container.innerHTML)).not.toBe(hasSvg);
  });

  it('das Notfunkgerät hat ein eigenes Symbol, das fehlende Gadget nur den Umriss', () => {
    const has = render(<GadgetIcon id="notfunk" has />);
    const hasSvg = inlineImages(has.container.innerHTML);
    has.unmount();
    const missing = render(<GadgetIcon id="notfunk" has={false} />);
    expect(hasSvg).toContain('rect');
    expect(inlineImages(missing.container.innerHTML)).not.toBe(hasSvg);
  });

  it('Bennos Monokel hat ein eigenes Symbol (Glas mit Goldrand), anders als jedes andere; das fehlende Gadget nur den Umriss', () => {
    const has = render(<GadgetIcon id="bennos-monokel" has />);
    const hasSvg = inlineImages(has.container.innerHTML);
    has.unmount();
    const missing = render(<GadgetIcon id="bennos-monokel" has={false} />);
    expect(hasSvg).toContain(PALETTE.gold);
    expect(inlineImages(missing.container.innerHTML)).not.toBe(hasSvg);
    missing.unmount();
    for (const g of ITEMS.filter((i) => i.kind === 'gadget' && i.id !== 'bennos-monokel')) {
      const other = render(<GadgetIcon id={g.id} has />);
      expect(inlineImages(other.container.innerHTML), g.id).not.toBe(hasSvg);
      other.unmount();
    }
  });

  it('die Blindflug-Brille hat ein eigenes Symbol (dunkle Gläser in Tinte), anders als jedes andere; das fehlende Gadget nur den Umriss', () => {
    const has = render(<GadgetIcon id="blindflug-brille" has />);
    const hasSvg = inlineImages(has.container.innerHTML);
    has.unmount();
    const missing = render(<GadgetIcon id="blindflug-brille" has={false} />);
    expect(hasSvg).toContain(PALETTE.ink);
    expect(inlineImages(missing.container.innerHTML)).not.toBe(hasSvg);
    missing.unmount();
    for (const g of ITEMS.filter((i) => i.kind === 'gadget' && i.id !== 'blindflug-brille')) {
      const other = render(<GadgetIcon id={g.id} has />);
      expect(inlineImages(other.container.innerHTML), g.id).not.toBe(hasSvg);
      other.unmount();
    }
  });
});
