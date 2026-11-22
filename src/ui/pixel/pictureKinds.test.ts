import { describe, expect, it } from 'vitest';
import { kindOfSize, PICTURE_KINDS, type PictureKind } from './pictureKinds.ts';

// Die Stylesheets als Text – so liest der Test sie ohne Dateisystem
const STYLES = import.meta.glob<string>('../styles/*.css', { query: '?raw', import: 'default', eager: true });
const KINDS = Object.keys(PICTURE_KINDS) as PictureKind[];

/** CSS-Regeln mit `.pic-<art>` im Selektor: Selektor, Bildart, Breite */
function kindRules(): { selector: string; kind: PictureKind; width: string | undefined }[] {
  const css = Object.values(STYLES)
    .map((text) => text.replace(/\/\*[\s\S]*?\*\//g, ''))
    .join('\n');
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap((m) =>
    m[1]!
      .split(',')
      .map((s) => s.trim())
      .flatMap((selector) => {
        const kind = KINDS.find((k) => selector.includes(`.pic-${k}`));
        return kind ? [{ selector, kind, width: /(?:^|;|\s)width:\s*([^;]+);/.exec(m[2]!)?.[1]?.trim() }] : [];
      }),
  );
}

describe('Bildarten', () => {
  it('feste Rastergrößen auf einem 4er-Raster, ganzzahliger Grundmaßstab', () => {
    expect(PICTURE_KINDS.gadget).toMatchObject({ w: 16, h: 16 });
    expect(PICTURE_KINDS.evidence).toMatchObject({ w: 32, h: 20 });
    expect(PICTURE_KINDS.object).toMatchObject({ w: 64, h: 40 });
    expect(PICTURE_KINDS.panorama).toMatchObject({ w: 96, h: 56 });
    for (const k of KINDS) {
      expect(PICTURE_KINDS[k].w % 4, k).toBe(0);
      expect(PICTURE_KINDS[k].h % 4, k).toBe(0);
      expect(Number.isInteger(PICTURE_KINDS[k].scale), k).toBe(true);
    }
  });

  it('kindOfSize findet die Bildart zur Rastergröße', () => {
    expect(kindOfSize(32, 20)).toBe('evidence');
    expect(kindOfSize(96, 56)).toBe('panorama');
    expect(kindOfSize(30, 16)).toBeUndefined();
  });
});

describe('Größen der Bild-Orte (ui/styles/)', () => {
  const rules = kindRules();

  it('jede Breite einer Bildart ist ein ganzzahliges Vielfaches ihrer Rasterbreite (in px)', () => {
    const bad = rules.filter((r) => r.width !== undefined && !(/^\d+px$/.test(r.width) && parseInt(r.width) % PICTURE_KINDS[r.kind].w === 0));
    expect(bad).toEqual([]);
  });

  it('Story-Objekt, großes Story-Objekt, Extra-Fall, Siegelleiste, Fallakte und Beweisfach-Bühne haben eine Größe je Bildart', () => {
    const places = ['.story-object.kind-picture .story-pic', '.story-object.big.kind-picture .story-pic', '.case-gadget .story-pic', '.seal-bar .story-object.kind-picture .story-pic', '.seal-bar .case-gadget .story-pic', '.fa-pic .story-pic', '.evidence-stage .story-pic'];
    const missing = places.flatMap((place) => (['gadget', 'evidence', 'object', 'panorama'] as const).filter((k) => !rules.some((r) => r.selector === `${place}.pic-${k}` && r.width)).map((k) => `${place}.pic-${k}`));
    expect(missing).toEqual([]);
    expect(rules.some((r) => r.selector === '.evidence-thumb .story-pic.pic-evidence' && r.width === '32px')).toBe(true);
    expect(rules.some((r) => r.selector === '.evidence-thumb .story-pic.pic-gadget' && r.width === '32px')).toBe(true);
  });
});
