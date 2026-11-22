import { describe, expect, it } from 'vitest';
import { CONTENT_LIMIT, contentCacheSize, pixelImageUrl } from './pixelImage.ts';
import type { Px } from './pixelMap.ts';

const decode = (url: string) => decodeURIComponent(url.replace('data:image/svg+xml,', ''));

describe('pixelImageUrl', () => {
  const px: Px[] = [
    [0, 0, 2, 1, '#ff0000'],
    [1, 1, 1, 1, '#00ff00'],
  ];

  it('ein rect je Fläche, Farben, viewBox und scharfe Kanten', () => {
    const svg = decode(pixelImageUrl(px, 4, 3));
    expect(svg.match(/<rect /g)).toHaveLength(2);
    expect(svg).toContain('fill="#ff0000"');
    expect(svg).toContain('fill="#00ff00"');
    expect(svg).toContain('viewBox="0 0 4 3"');
    expect(svg).toContain('shape-rendering="crispEdges"');
  });

  it('dieselbe Karte gibt dieselbe Adresse, ein anderes Raster eine andere', () => {
    expect(pixelImageUrl(px, 4, 3)).toBe(pixelImageUrl(px, 4, 3));
    expect(pixelImageUrl(px, 5, 3)).not.toBe(pixelImageUrl(px, 4, 3));
  });

  it('neu gebaute Karten mit gleichem Inhalt geben dieselbe Adresse', () => {
    const copy = px.map((p) => [...p] as Px);
    expect(pixelImageUrl(copy, 4, 3)).toBe(pixelImageUrl(px, 4, 3));
  });

  it('die Tabelle nach Inhalt hat eine Obergrenze', () => {
    for (let i = 0; i < CONTENT_LIMIT + 50; i++) pixelImageUrl([[i, 0, 1, 1, '#123456']], 400, 1);
    expect(contentCacheSize()).toBeLessThanOrEqual(CONTENT_LIMIT);
  });
});
