// Kacheln: Jede eingetragene Datei gibt es, mit genau der eingetragenen Größe (sonst wären sie verzerrt).

import { describe, expect, it } from 'vitest';
import { PROP_SIZES } from './propSizes.ts';

// Die PNGs als Data-URL (base64) – so liest der Test sie ohne Dateisystem
const FILES = import.meta.glob<string>('../../../public/assets/props/*.png', { query: '?inline', import: 'default', eager: true });

/** Breite und Höhe aus dem PNG-Kopf (IHDR, Bytes 16–23) */
function pngSize(dataUrl: string): [number, number] {
  const bytes = Uint8Array.from(atob(dataUrl.split(',')[1]!), (c) => c.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  return [view.getUint32(16), view.getUint32(20)];
}

describe('Requisiten', () => {
  it('jede Kachel liegt in public/assets/props und hat die eingetragene Größe', () => {
    for (const [name, size] of Object.entries(PROP_SIZES)) {
      const file = FILES[`../../../public/assets/props/${name}.png`];
      expect(file, name).toBeDefined();
      expect(pngSize(file!), name).toEqual(size);
    }
  });

  it('jede Datei in public/assets/props ist eingetragen (keine vergessene Kachel)', () => {
    const names = Object.keys(FILES).map((f) => f.replace('../../../public/assets/props/', '').replace('.png', ''));
    expect(names.sort()).toEqual(Object.keys(PROP_SIZES).sort());
  });
});
