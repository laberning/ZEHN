import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Grid, KruemelPic, LoudspeakerPic } from './Pixel.tsx';
import { PALETTE } from './palette.ts';
import type { Px } from './pixelMap.ts';
import { PICTURE_KINDS } from './pictureKinds.ts';
import { svgOfUrl } from './pixelImage.ts';

describe('Grid mit Bildart', () => {
  it('nimmt Rastergröße und Grundmaßstab der Bildart und setzt die Klasse pic-<art>', () => {
    for (const [kind, k] of Object.entries(PICTURE_KINDS)) {
      const { container, unmount } = render(<Grid px={[]} kind={kind as keyof typeof PICTURE_KINDS} className="story-pic" title="Bild" />);
      const svg = container.querySelector('svg')!;
      expect(svg.getAttribute('viewBox'), kind).toBe(`0 0 ${k.w} ${k.h}`);
      expect(svg.getAttribute('width'), kind).toBe(String(k.w * k.scale));
      expect(svg.getAttribute('height'), kind).toBe(String(k.h * k.scale));
      expect(svg.getAttribute('class'), kind).toBe(`story-pic pic-${kind}`);
      unmount();
    }
  });

  it('ohne Bildart bleiben Raster und Größe wie angegeben', () => {
    const { container } = render(<Grid px={[]} w={30} h={16} size={120} className="story-pic" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 30 16');
    expect(svg.getAttribute('width')).toBe('120');
    expect(svg.getAttribute('class')).toBe('story-pic');
  });
});

describe('Grid zeichnet das Pixelbild als ein Bild', () => {
  const px: Px[] = [
    [0, 0, 2, 1, PALETTE.ink],
    [1, 1, 1, 1, PALETTE.gold],
  ];

  it('ein <image> mit der Bildadresse statt eines rect je Fläche; Titel, Klassen und Unschärfe bleiben am svg', () => {
    const { container } = render(<Grid px={px} w={4} h={4} size={40} title="Bild" className="story-pic" style={{ filter: 'blur(2px)' }}>{null}</Grid>);
    const svg = container.querySelector('svg')!;
    expect(svg.querySelectorAll('rect')).toHaveLength(0);
    const images = svg.querySelectorAll('image');
    expect(images).toHaveLength(1);
    expect(images[0]!.getAttribute('preserveAspectRatio')).toBe('none');
    expect((images[0] as unknown as HTMLElement).style.imageRendering).toBe('pixelated');
    expect(svgOfUrl(images[0]!.getAttribute('href')!).match(/<rect /g)).toHaveLength(2);
    expect(svg.getAttribute('aria-label')).toBe('Bild');
    expect(svg.style.filter).toBe('blur(2px)');
  });

  it('zwei Vorkommen derselben Karte teilen sich dieselbe Adresse; eine leere Karte zeichnet kein Bild', () => {
    const { container } = render(
      <>
        <Grid px={px} />
        <Grid px={px} />
        <Grid px={[]} />
      </>,
    );
    const hrefs = [...container.querySelectorAll('image')].map((i) => i.getAttribute('href'));
    expect(hrefs).toHaveLength(2);
    expect(hrefs[0]).toBe(hrefs[1]);
  });
});

describe('Krümel', () => {
  it('Bildart Beweisstück (32×20); `size` bleibt die Breite in CSS-Pixeln, `scaled` nimmt den Bühnenmaßstab', () => {
    const { container, rerender } = render(<KruemelPic size={70} />);
    let svg = container.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 32 20');
    expect(svg.getAttribute('width')).toBe('70');
    expect(svg.getAttribute('aria-label')).toBe('Krümel');
    rerender(<KruemelPic scaled />);
    svg = container.querySelector('svg')!;
    expect(svg.style.width).toBe('calc(var(--px) * 32)');
  });

  it('drei Lämpchen blinken (Klasse led), die Rotoren sind zwei Bilder in Zeile 1, opak in hellem Glas', () => {
    const { container } = render(<KruemelPic />);
    const leds = [...container.querySelectorAll('rect.led')].map((r) => `${r.getAttribute('x')},${r.getAttribute('y')} ${r.getAttribute('fill')}`);
    expect(leds.sort()).toEqual([`16,2 ${PALETTE['red-light']}`, `27,4 ${PALETTE['red-light']}`, `5,4 ${PALETTE['green-light']}`].sort());
    for (const rotor of ['.rotor-a', '.rotor-b']) {
      const rects = [...container.querySelectorAll(`${rotor} rect`)];
      expect(rects.length, rotor).toBe(2);
      for (const r of rects) {
        expect(r.getAttribute('y'), rotor).toBe('1');
        expect(r.getAttribute('fill'), rotor).toBe(PALETTE['glass-light']);
      }
    }
  });

  it('`still` hält die Rotoren an (ohne Klasse hover)', () => {
    const { container } = render(<KruemelPic still />);
    expect(container.querySelector('svg')!.getAttribute('class')).toContain('drone');
    expect(container.querySelector('svg')!.getAttribute('class')).not.toContain('hover');
  });
});

describe('Lautsprecher', () => {
  it('das rote Lämpchen blinkt (Klasse led), sonst nichts', () => {
    const { container } = render(<LoudspeakerPic />);
    expect(container.querySelectorAll('rect.led').length).toBe(1);
    expect(container.querySelectorAll('image').length).toBe(1);
  });
});
