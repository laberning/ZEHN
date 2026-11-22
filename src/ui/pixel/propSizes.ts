// Größen der Kacheln (Tile.tsx, Prop in sceneProps.tsx), geprüft gegen die PNG-Dateien (propSizes.test.ts).

/** Zugeschnittene Kacheln (public/assets/props, Quelle und Prüfsummen dort in QUELLEN.md): Breite × Höhe */
export const PROP_SIZES = {
  'brot-kreuz': [23, 17],
  'brot-rund': [23, 17],
  'brot-roggen': [26, 19],
  'brot-wiener': [21, 20],
  'brot-kasten': [22, 17],
  'brot-ciabatta': [22, 20],
  'brot-zopf': [17, 18],
  'brot-kreuz-paar': [32, 23],
  'brot-roggen-paar': [31, 27],
  'brot-wiener-paar': [30, 25],
  paket: [32, 31],
  mehlsack: [32, 25],
  ofen: [32, 40],
  werkzeugwand: [124, 30],
  laptop: [19, 22],
  laterne: [18, 80],
  gleis: [32, 18],
  konsole: [32, 64],
  'konsole-2': [32, 64],
} as const;

export type PropName = keyof typeof PROP_SIZES;
