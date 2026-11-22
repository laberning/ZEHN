import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SceneName } from '../../domain/dialog.ts';
import { PROP_SIZES } from '../pixel/propSizes.ts';
import { Scene } from './Scene.tsx';

describe('Hintergründe', () => {
  it.each<SceneName>(['backstube', 'keller', 'schreibtisch', 'firewall', 'funkturm', 'tunnel', 'turm', 'marktplatz', 'tresor', 'zentrale'])('%s zeichnet eine Kulisse mit Klasse', (name) => {
    const { container } = render(<Scene name={name} />);
    expect(container.querySelector(`.scene-${name} svg rect`)).not.toBeNull();
  });

  it('Funkturm: drei Türme mit Funkbrücken und Dächern, keine Kreise oder Linien (nur Rechtecke)', () => {
    const { container } = render(<Scene name="funkturm" />);
    expect(container.querySelectorAll('svg g').length).toBe(3);
    expect(container.querySelectorAll('svg circle, svg line, svg path').length).toBe(0);
  });

  it('Tunnel: sechs Konsolen und ein Gleis aus Kacheln, drei Deckenlampen, sonst nur Rechtecke', () => {
    const { container } = render(<Scene name="tunnel" />);
    const tiles = [...container.querySelectorAll('svg image')].map((i) => i.getAttribute('href')!.split('/').pop());
    expect(tiles.filter((t) => t!.startsWith('konsole'))).toHaveLength(6);
    expect(tiles.filter((t) => t === 'gleis.png')).toHaveLength(10);
    expect(container.querySelectorAll('svg > g').length).toBe(3);
    expect(container.querySelectorAll('svg circle, svg line, svg path').length).toBe(0);
  });

  it.each<[SceneName, string[]]>([
    ['backstube', ['ofen']],
    ['keller', ['werkzeugwand', 'mehlsack', 'mehlsack', 'mehlsack']],
    ['schreibtisch', ['laptop']],
    ['marktplatz', ['laterne', 'laterne']],
  ])('%s: Kacheln aus LPC-Paketen in Originalgröße, Pixel scharf', (name, expected) => {
    const { container } = render(<Scene name={name} />);
    const images = [...container.querySelectorAll('svg image')].filter((i) => !i.getAttribute('href')!.includes('/brot-'));
    expect(images.map((i) => i.getAttribute('href')!.split('/').pop()!.replace('.png', ''))).toEqual(expected);
    for (const i of images) {
      const name = i.getAttribute('href')!.split('/').pop()!.replace('.png', '') as keyof typeof PROP_SIZES;
      expect([Number(i.getAttribute('width')), Number(i.getAttribute('height'))]).toEqual(PROP_SIZES[name]);
      expect(i.getAttribute('class')).toBe('prop');
    }
  });

  it('Turm: acht Leuchtstufen und die Tür mit Licht oben, nur Rechtecke', () => {
    const { container } = render(<Scene name="turm" />);
    expect(container.querySelectorAll('svg > g').length).toBe(8 + 1);
    expect(container.querySelectorAll('svg circle, svg line, svg path').length).toBe(0);
  });

  it('Marktplatz: zehn Lampen der Lichterkette, zwei Marktstände und die Bühne mit zwei Lautsprechern, nur Rechtecke', () => {
    const { container } = render(<Scene name="marktplatz" />);
    expect(container.querySelectorAll('svg > g').length).toBe(10 + 2 + 2);
    expect(container.querySelectorAll('svg circle, svg line, svg path').length).toBe(0);
  });

  it('Tresor: drei Maschinen und vier Rädchen an der Stahltür, Goldstaub am Boden, nur Rechtecke', () => {
    const { container } = render(<Scene name="tresor" />);
    expect(container.querySelectorAll('svg > g').length).toBe(3 + 4);
    expect(container.querySelectorAll('svg > rect[fill="#ffd34d"]').length).toBeGreaterThanOrEqual(10);
    expect(container.querySelectorAll('svg circle, svg line, svg path').length).toBe(0);
  });

  it('Zentrale: Regal, Bildschirm, Tresen und Treppe mit vier Maschinen, 21 Lollis im Regal, nur Rechtecke', () => {
    const { container } = render(<Scene name="zentrale" />);
    expect(container.querySelectorAll('svg > g').length).toBe(4);
    // Regal: drei Bretter mit je sieben Lollis; Treppe: vier Maschinen mit je einem Lämpchen
    expect(container.querySelectorAll('svg > g:nth-of-type(1) > g').length).toBe(3);
    expect(container.querySelectorAll('svg > g:nth-of-type(1) > g > g').length).toBe(21);
    expect(container.querySelectorAll('svg > g:nth-of-type(4) > g').length).toBe(4);
    expect(container.querySelectorAll('svg circle, svg line, svg path').length).toBe(0);
  });
});
