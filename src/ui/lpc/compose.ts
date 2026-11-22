// Setzt LPC-Figuren im Browser zusammen: Ebenen laden, per Palette umfärben, nach z-Reihenfolge stapeln.
// Das Umfärben selbst ist rein und steckt in palette.ts; hier passieren nur Laden und Zeichnen (Canvas).

import manifest from '../../content/lpc.generated.json';
import { paletteMapping, recolorPixels, type ColorMapping, type Palette } from './palette.ts';

export type BodyType = 'teen' | 'female' | 'male';
export type Material = 'body' | 'hair' | 'eye' | 'cloth';
export type Anim = keyof typeof manifest.anims;
/** Blickrichtung: up = Rücken, down = vorne */
export type Facing = 'up' | 'left' | 'down' | 'right';

export interface LayerSpec {
  part: string;
  /** Zielfarbe je Material, z. B. { cloth: 'teal' } */
  colors?: Partial<Record<Material, string>>;
}

export interface CharacterSpec {
  bodyType: BodyType;
  layers: LayerSpec[];
}

interface PartEntry {
  name: string;
  materials: string[];
  layers: Partial<Record<BodyType, { z: number; src: Record<Anim, string> }[]>>;
}

const PARTS = manifest.parts as Record<string, PartEntry>;
const PALETTES = manifest.palettes as Record<string, Palette>;
/** Hat dieses Teil Ebenen, die sich in diesem Material umfärben lassen? */
export const hasMaterial = (part: string, material: Material): boolean => !!PARTS[part]?.materials.includes(material);
export const FRAME = manifest.frame;
const DIRECTIONS = manifest.directions as Facing[];
/** Reihe einer Blickrichtung im Bildstreifen */
export const facingRow = (f: Facing): number => DIRECTIONS.indexOf(f);

/** Reihenfolge beim Drehen (Blick von oben im Uhrzeigersinn): vorne, rechts, hinten, links */
const TURN_ORDER: readonly Facing[] = ['down', 'right', 'up', 'left'];

/** Dreht eine Figur um eine Vierteldrehung: +1 = sie schaut (von vorne aus) nach rechts, -1 nach links */
export function turn(f: Facing, step: 1 | -1): Facing {
  return TURN_ORDER[(TURN_ORDER.indexOf(f) + step + TURN_ORDER.length) % TURN_ORDER.length]!;
}
export const ANIM_FRAMES: Record<Anim, number> = Object.fromEntries(
  Object.entries(manifest.anims).map(([k, v]) => [k, v.frames]),
) as Record<Anim, number>;

/** Mittlerer Farbton einer Palettenvariante – für Farbfelder in der Auswahl */
export function swatchColor(material: Material, variant: string): string {
  const colors = PALETTES[material]?.variants[variant] ?? [];
  return colors[Math.floor(colors.length * 0.6)] ?? '#888';
}

const images = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string): Promise<HTMLImageElement> {
  let p = images.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Grafik fehlt: ${src}`));
      img.src = `${import.meta.env.BASE_URL}${src}`;
    });
    images.set(src, p);
  }
  return p;
}

function recolor(img: HTMLImageElement, mapping: ColorMapping): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  if (mapping.length === 0) return c;
  const data = ctx.getImageData(0, 0, c.width, c.height);
  recolorPixels(data.data, mapping);
  ctx.putImageData(data, 0, 0);
  return c;
}

const strips = new Map<string, Promise<HTMLCanvasElement>>();
/** Obergrenze des Caches: Jede Kachel der Garderobe ist ein eigener Streifen, und jeder hat vier Reihen */
const MAX_STRIPS = 150;

/** Liefert einen Bildstreifen: alle Bilder der Animation nebeneinander, je Blickrichtung eine Reihe */
export function composeStrip(spec: CharacterSpec, anim: Anim): Promise<HTMLCanvasElement> {
  const key = `${anim}|${JSON.stringify(spec)}`;
  let p = strips.get(key);
  if (!p) {
    p = (async () => {
      const parts = await Promise.all(
        spec.layers.map(async (l) => {
          const part = PARTS[l.part];
          if (!part) throw new Error(`Unbekanntes LPC-Teil: ${l.part}`);
          const layers = part.layers[spec.bodyType] ?? part.layers.teen ?? [];
          const mapping = paletteMapping(PALETTES, part.materials, l.colors ?? {});
          return Promise.all(layers.map(async (ly) => ({ z: ly.z, canvas: recolor(await loadImage(ly.src[anim]), mapping) })));
        }),
      );
      const out = document.createElement('canvas');
      out.width = FRAME * ANIM_FRAMES[anim];
      out.height = FRAME * DIRECTIONS.length;
      const ctx = out.getContext('2d')!;
      for (const { canvas } of parts.flat().sort((a, b) => a.z - b.z)) ctx.drawImage(canvas, 0, 0);
      return out;
    })();
    strips.set(key, p);
    // Map behält die Einfügereihenfolge: der erste Eintrag ist der älteste
    if (strips.size > MAX_STRIPS) strips.delete(strips.keys().next().value!);
  }
  return p;
}
