// Eigene Pixelgrafiken für Dinge, die es im LPC-Fundus nicht gibt: Krümel und Symbole.

import type { CSSProperties, ReactNode } from 'react';
import { fromPalette, shift, type Legend, type Px } from './pixelMap.ts';
import { PALETTE } from './palette.ts';
import { pixelImageUrl } from './pixelImage.ts';
import { PICTURE_KINDS, type PictureKind } from './pictureKinds.ts';

interface GridProps {
  px: Px[];
  /** Breite in CSS-Pixeln; bei einer Bildart ohne Angabe ihr Maßstab (`PICTURE_KINDS`) */
  size?: number;
  /** Bildart: legt Rastergröße und Grundmaßstab fest und setzt die Klasse `pic-<art>` (Größen der Orte in ui/styles/) */
  kind?: PictureKind;
  /** Stattdessen jedes Rasterfeld `--px` groß (gemeinsamer Maßstab, siehe stage.ts) */
  scaled?: boolean;
  title?: string;
  w?: number;
  h?: number;
  className?: string;
  /** Zusätzliche Stile ohne Farbe, z. B. eine Unschärfe (`filter`) */
  style?: CSSProperties;
  /** Weitere Teile über den Pixeln (z. B. Gruppen aus `Rects`) */
  children?: ReactNode;
}

/** Ein Pixelbild: die Karte `px` als ein einziges `<image>` (eine gemerkte Bildadresse je Karte, pixelImage.ts), `children` liegen darüber */
export function Grid({ px, size, kind, scaled, title, w: gridW = 16, h: gridH = 16, className, style, children }: GridProps) {
  const k = kind && PICTURE_KINDS[kind];
  const [w, h] = k ? [k.w, k.h] : [gridW, gridH];
  const width = size ?? (k ? k.w * k.scale : w);
  const classes = [className, kind && `pic-${kind}`].filter(Boolean).join(' ') || undefined;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      {...(scaled ? { style: { ...style, width: `calc(var(--px) * ${w})`, height: `calc(var(--px) * ${h})` } } : { width, height: (width * h) / w, style })}
      shapeRendering="crispEdges"
      // ohne Titel ist das Bild Schmuck und für Screenreader unsichtbar
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
      className={classes}>
      {px.length > 0 && <image href={pixelImageUrl(px, w, h)} width={w} height={h} preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }} />}
      {children}
    </svg>
  );
}

export function Rects({ px, className }: { px: Px[]; className?: string }) {
  return px.map(([x, y, pw, ph, c], i) => <rect key={i} x={x} y={y} width={pw} height={ph} fill={c} className={className} />);
}

/** Lämpchen aus einer Pixelkarte lösen: Felder in `colors` blinken (Klasse `led`, base.css), der Rest steht still */
function splitLeds(px: Px[], colors: readonly string[]): { still: Px[]; leds: Px[] } {
  return { still: px.filter((p) => !colors.includes(p[4])), leds: px.filter((p) => colors.includes(p[4])) };
}

// Krümel von vorn (Zeichen-Karte, Bildart `evidence` 32×20): zwei Ausleger mit Rotoren, Mast mit Lämpchen, großes
// Kamera-Auge, Keks-Aufkleber, Landekufen. Zeile 1 bleibt frei: dort drehen sich die Rotoren (zwei Bilder im Wechsel).
const KRUEMEL_LEGEND = {
  D: 'metal-dark',
  G: 'glass',
  H: 'glass-dark',
  I: 'ink',
  K: 'outline',
  M: 'metal',
  Y: 'gold',
  g: 'glass-light',
  m: 'metal-light',
  n: 'green-light',
  p: 'paper-light',
  r: 'red-light',
} as const satisfies Legend;

const KRUEMEL = fromPalette(
  [
    '................................',
    '................................',
    '....KKK.........r.........KKK...',
    '....KMmK........K........KmMK...',
    '....KnMMKKKKKKKKKKKKKKKKKMMrK...',
    '.....KDMMMmmmmmmmmmmmmmmMMDK....',
    '......KKKMmmmmmmmmmmmmmmMKKK....',
    '........KMmmmmmmmmmmmmmmMK......',
    '.......KMmmKKKKKKKKKKKKmMDK.....',
    '.......KMmKIIIIIIIIIIIIKMDK.....',
    '.......KMmKIIIIGGGGIIIIKMDK.....',
    '.......KMmKIIIGggGGGIIIKMDK.....',
    '.......KMmKIIIGgpgGGIIIKMDK.....',
    '.......KMmKIIIGGGGHHIIIKMDK.....',
    '.......KMmKIIIIHHHHIIIIKMDK.....',
    '.......KMmKKKKKKKKKKKKKKMDK.....',
    '........KMMYYMMMMMMMMMDDK.......',
    '.........KKKKKKKKKKKKKKK........',
    '...........K.........K..........',
    '..........KKK.......KKK.........',
  ],
  KRUEMEL_LEGEND,
);
/** Die Lämpchen: grün und rot an den Auslegern, rot auf dem Mast */
const KRUEMEL_PARTS = splitLeds(KRUEMEL, [PALETTE['green-light'], PALETTE['red-light']]);
// Rotorblätter in Zeile 1 (opak, hellstes Glas): Bild A ausgebreitet, Bild B von der Seite
const ROTOR_A = shift(fromPalette(['.ggggggg................ggggggg.'], { g: 'glass-light' }), 0, 1);
const ROTOR_B = shift(fromPalette(['...ggg....................ggg...'], { g: 'glass-light' }), 0, 1);

/**
 * Krümel; `size` ist die Breite in CSS-Pixeln (wie bisher), `scaled` setzt jedes Rasterfeld `--px` groß. Die Rotoren
 * wechseln per CSS zwischen zwei Bildern (scene.css), `still` hält sie an; die Lämpchen blinken (Klasse `led`).
 */
export function KruemelPic({ size = 96, scaled, still }: { size?: number; scaled?: boolean; still?: boolean }) {
  return (
    <Grid px={KRUEMEL_PARTS.still} size={size} scaled={scaled} kind="evidence" title="Krümel" className={still ? 'drone' : 'drone hover'}>
      <Rects px={KRUEMEL_PARTS.leds} className="led" />
      <g className="rotor rotor-a">
        <Rects px={ROTOR_A} />
      </g>
      <g className="rotor rotor-b">
        <Rects px={ROTOR_B} />
      </g>
    </Grid>
  );
}

// Lautsprecher von vorn (Zeichen-Karte, Bildart `evidence` 32×20): Gehäuse, kleiner Hochtöner oben, große Membran unten, ein
// rotes Lämpchen, das blinkt, solange die Stimme spricht.
const LOUDSPEAKER = splitLeds(
  fromPalette(
    [
      '................................',
      '.....KKKKKKKKKKKKKKKKKKKKKK.....',
      '.....KMMMMMMMMMMMMMMMMMMMMK.....',
      '.....KMDDDDDDDDDDDDDDDDDDKK.....',
      '.....KMDDDDDKKKKKKKKDDDDDKK.....',
      '.....KMDDDDDKmMIIMMKDDDDrKK.....',
      '.....KMDDDDDKMMIIMMKDDDDDKK.....',
      '.....KMDDDDDKKKKKKKKDDDDDKK.....',
      '.....KMDDDDDDDDDDDDDDDDDDKK.....',
      '.....KMDDDKKKKKKKKKKKKDDDKK.....',
      '.....KMDDDKmmmmmmmmmmKDDDKK.....',
      '.....KMDDDKMMDDDDDDMMKDDDKK.....',
      '.....KMDDDKMMIIIIIIMMKDDDKK.....',
      '.....KMDDDKMMIIIIIIMMKDDDKK.....',
      '.....KMDDDKMMIIIIIIMMKDDDKK.....',
      '.....KMDDDKMMMMMMMMMMKDDDKK.....',
      '.....KMDDDKKKKKKKKKKKKDDDKK.....',
      '.....KKKKKKKKKKKKKKKKKKKKKK.....',
      '.....KKKKKKKKKKKKKKKKKKKKKK.....',
      '................................',
    ],
    { D: 'metal-dark', I: 'ink', K: 'outline', M: 'metal', m: 'metal-light', r: 'red-light' },
  ),
  [PALETTE['red-light']],
);

/** Die Stimme aus dem Lautsprecher (Gegenstimme im Einsatz von Akt 5 bis 7), statt des Barons */
export function LoudspeakerPic({ size = 96 }: { size?: number }) {
  return (
    <Grid px={LOUDSPEAKER.still} size={size} kind="evidence" title="Lautsprecher" className="loudspeaker">
      <Rects px={LOUDSPEAKER.leds} className="led" />
    </Grid>
  );
}

/** Kleines Pixel-Schloss für Gesperrtes (Zeichen-Karte in Gadget-Größe 16×16) */
const LOCK = fromPalette(
  [
    '................',
    '.....KKKKKK.....',
    '....KmMMMMDK....',
    '...KmMKKKKMDK...',
    '...KMK....KDK...',
    '...KMK....KDK...',
    '..KKKKKKKKKKKK..',
    '..KmmMMMMMMMDK..',
    '..KmMMMMMMMMDK..',
    '..KmMMMKKMMMDK..',
    '..KmMMKKKKMMDK..',
    '..KmMMMKKMMMDK..',
    '..KmMMMKKMMMDK..',
    '..KmMMMMMMMMDK..',
    '..KDDDDDDDDDDK..',
    '..KKKKKKKKKKKK..',
  ],
  { D: 'metal-dark', K: 'outline', M: 'metal', m: 'metal-light' },
);

/** Das Schloss für gesperrte Aufträge, die geschlossene Spielhalle und gesperrte Garderobe-Teile: immer 16 px, ein Bildschirmpixel je Feld */
export function LockIcon() {
  return <Grid px={LOCK} kind="gadget" size={16} title="gesperrt" />;
}
