// Gemeinsame Palette der eigenen Pixelbilder (Story-Bilder, Gadget-Symbole, Krümel): Farbfamilien aus je drei Tönen einer
// LPC-Rampe (Schatten, Grundton, Licht) plus Tinte und Kontur. Höchstens 24 Farben; freie Hexwerte prüft ui/pixel/pictures.test.ts.
//
// Herkunft: die Paletten in content/lpc.generated.json. Je Material (`body`, `hair`, `cloth`, `eye`) gibt es Rampen aus sechs
// Tönen (Auge drei), dunkel nach hell; `from` nennt Material, Variante und Stufe (0 = dunkelste). Wo eine Kachel aus
// public/assets/props dieselbe Rampe nutzt, steht sie im Kommentar – so passen gezeichnete Bilder neben die Kacheln.

/** Herkunft eines Tons: Material, Variante, Stufe der Rampe (0 = dunkelste) */
export type RampStop = readonly [material: 'body' | 'cloth' | 'hair' | 'eye', variant: string, stop: number];

interface Tone {
  hex: string;
  from: RampStop;
}

const tone = (hex: string, ...from: RampStop): Tone => ({ hex, from });

/** Die Farbfamilien: je Schatten (`dark`), Grundton (`base`) und Licht (`light`) */
export const FAMILIES = {
  /** Papier, Zettel, Karten (cloth/white 3–5; die Ciabatta-Kachel nutzt dieselben Töne) */
  paper: { dark: tone('#c4b59f', 'cloth', 'white', 3), base: tone('#e5e6c7', 'cloth', 'white', 4), light: tone('#ffffff', 'cloth', 'white', 5) },
  /** Holz, Leder, Brotkruste (cloth/walnut 2–4; wie Kastenbrot und Rundbrot) */
  wood: { dark: tone('#62351c', 'cloth', 'walnut', 2), base: tone('#744b30', 'cloth', 'walnut', 3), light: tone('#996b4a', 'cloth', 'walnut', 4) },
  /** Metall, Stein, Gehäuse (cloth/slate 2–4; wie die Schienen der Gleis-Kachel) */
  metal: { dark: tone('#4a5057', 'cloth', 'slate', 2), base: tone('#818b8b', 'cloth', 'slate', 3), light: tone('#b3afa1', 'cloth', 'slate', 4) },
  /** Glas, Himmel, helles Blau (cloth/sky 2–4) */
  glass: { dark: tone('#586b90', 'cloth', 'sky', 2), base: tone('#9fbbcb', 'cloth', 'sky', 3), light: tone('#c6eefd', 'cloth', 'sky', 4) },
  /** Gold, Messing, Licht (cloth/yellow 3–5) */
  gold: { dark: tone('#d99431', 'cloth', 'yellow', 3), base: tone('#f3c03f', 'cloth', 'yellow', 4), light: tone('#ffe360', 'cloth', 'yellow', 5) },
  /** Rot: Stoff, Knopf, Warnlicht (cloth/red 3–5) */
  red: { dark: tone('#82171c', 'cloth', 'red', 3), base: tone('#ab1e1e', 'cloth', 'red', 4), light: tone('#cd2429', 'cloth', 'red', 5) },
  /** Grün: Stoff, Platine, Leuchte (body/green 3–5; die cloth-Rampe „green“ ist nicht gleichmäßig hell nach dunkel) */
  green: { dark: tone('#228236', 'body', 'green', 3), base: tone('#39aa4e', 'body', 'green', 4), light: tone('#53bf71', 'body', 'green', 5) },
} as const satisfies Record<string, Record<'dark' | 'base' | 'light', Tone>>;

export type Family = keyof typeof FAMILIES;

/** Tinte: Schrift auf Papier, dunkles Blau (cloth/blue 2) */
export const INK = tone('#322d6a', 'cloth', 'blue', 2);

/** Konturfarbe aller Pixelbilder (Krümel, Gadgets, Story-Bilder) – dunkelblau wie die Oberfläche; keine LPC-Farbe */
export const OUTLINE = '#1c2540';

/** Name einer Palettenfarbe: Grundton `wood`, Schatten `wood-dark`, Licht `wood-light`, dazu `ink` und `outline` */
export type PaletteName = Family | `${Family}-dark` | `${Family}-light` | 'ink' | 'outline';

/** Name → Hexwert */
export const PALETTE = Object.fromEntries([
  ...Object.entries(FAMILIES).flatMap(([name, t]) => [
    [`${name}-dark`, t.dark.hex],
    [name, t.base.hex],
    [`${name}-light`, t.light.hex],
  ]),
  ['ink', INK.hex],
  ['outline', OUTLINE],
]) as Record<PaletteName, string>;

/** Alle erlaubten Hexwerte (klein geschrieben) */
export const COLORS: ReadonlySet<string> = new Set(Object.values(PALETTE));
