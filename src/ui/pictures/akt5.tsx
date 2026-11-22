// Story-Bilder von Akt 5 „Satzzeichen“: die Beweisstücke Junas Beitrag, Booster-Chip, Durchsage-Skript und die Karte
// „Signal von: O.“ (je 32×20). Die Story-Objekte von Akt 5 sind Texte (lines). Zeichen-Karten auf der Palette (Stilregeln in
// docs/design/grafik.md, „Eigene Bilder“).

import { Grid } from '../pixel/Pixel.tsx';
import { fromPalette } from '../pixel/pixelMap.ts';

/** Junas Beitrag (32×20): ein Ausdruck, Titelzeile und Zeilen, rechts drei rote Ausrufezeichen */
const JUNAS_POST = fromPalette(
  [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KppppppppppppppppppppppppppppppK',
    'KpppppppppppppppppppppppppppppSK',
    'KppIIIIIIIIIIIIIIpppppppppppppSK',
    'KppIIIIIIIIIIIIIIpppppppppppppSK',
    'KpppppppppppppppppppppppppppppSK',
    'KpppppppppppppppppppppppppppppSK',
    'KppIIIIIIIIIIIIIIIIIpppRppRppRSK',
    'KppppppppppppppppppppppRppRppRSK',
    'KppIIIIIIIIIIIIIpppppppRppRppRSK',
    'KpppppppppppppppppppppppppppppSK',
    'KppIIIIIIIIIIIIIIIIppppRppRppRSK',
    'KpppppppppppppppppppppppppppppSK',
    'KppIIIIIIIIIIpppppppppppppppppSK',
    'KpppppppppppppppppppppppppppppSK',
    'KppIIIIIIIIIIIIIIIppppppppppppSK',
    'KpppppppppppppppppppppppppppppSK',
    'KpppppppppppppppppppppppppppppSK',
    'KSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
  { I: 'ink', K: 'outline', R: 'red', S: 'paper-dark', p: 'paper-light' },
);

/** Der Booster-Chip (32×20): ein grünes Plättchen mit Antenne, Kern, Leiterbahnen und Anschlüssen, in der Ecke ein kleiner Lutscher */
const BOOSTER_CHIP = fromPalette(
  [
    '................................',
    '...............mK...............',
    '...............mK...............',
    '...............mK...............',
    '...............mK...............',
    '...KKKKKKKKKKKKKKKKKKKKKKKKKK...',
    '...KnnnnnnnnnnnnnnnnnnnnnnnnK...',
    '...KnNNNNNNNNNNNNNNNNNNNrrNVK...',
    '...KnNNNNNNNKKKKKKKKNNNrrrrVK...',
    '...KnNYYYYYYKMMMMMMKYYYYRRNVK...',
    '...KnNNNNNNNKDDDDDDKNNNNNpNVK...',
    '...KnNNNNNNNKDDDDDDKNNNNNpNVK...',
    '...KnNYYYYYYKDDDDDDKYYYYYYNVK...',
    '...KnNNNNNNNKKKKKKKKNNNNNNNVK...',
    '...KnNNNNNNNNNNNNNNNNNNNNNNVK...',
    '...KVVVVVVVVVVVVVVVVVVVVVVVVK...',
    '...KKKKKKKKKKKKKKKKKKKKKKKKKK...',
    '......mm..mm..mm..mm..mm........',
    '......mM..mM..mM..mM..mM........',
    '................................',
  ],
  { D: 'metal-dark', K: 'outline', M: 'metal', N: 'green', R: 'red', V: 'green-dark', Y: 'gold', m: 'metal-light', n: 'green-light', p: 'paper-light', r: 'red-light' },
);

/** Durchsage-Skript (32×20): ein Blatt mit Zeilen, vorn und hinten ein Anführungszeichen-Paar */
const DURCHSAGE_SKRIPT = fromPalette(
  [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KppppppppppppppppppppppppppppppK',
    'KpPPPPPPPPPPPPPPPPPPPPPPPPPPPPSK',
    'KpPRPRPPIIIIIIIIIIIIIIIIIPPPPPSK',
    'KpPRPRPPPPPPPPPPPPPPPPPPPPPPPPSK',
    'KpPRPRPPIIIIIIIIIIIIIPPPPPPPPPSK',
    'KpPPPPPPPPPPPPPPPPPPPPPPPPPPPPSK',
    'KpPPPPPPIIIIIIIIIIIIIIIIPPPPPPSK',
    'KpPPPPPPPPPPPPPPPPPPPPPPPPPPPPSK',
    'KpPPPPPPIIIIIIIIIIPPPPPPPPPPPPSK',
    'KpPPPPPPPPPPPPPPPPPPPPPPPPPPPPSK',
    'KpPPPPPPIIIIIIIIIIIIPPPPPPPPPPSK',
    'KpPPPPPPPPPPPPPPPPPPPPPPPPPPPPSK',
    'KpPPPPPPIIIIIIIIIIIIIIIPPPRPRPSK',
    'KpPPPPPPPPPPPPPPPPPPPPPPPPRPRPSK',
    'KpPPPPPPPPPPPPPPPPPPPPPPPPRPRPSK',
    'KpPPPPPPPPPPPPPPPPPPPPPPPPPPPPSK',
    'KpPPPPPPPPPPPPPPPPPPPPPPPPPPPPSK',
    'KSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
  { I: 'ink', K: 'outline', P: 'paper', R: 'red', S: 'paper-dark', p: 'paper-light' },
);

/** Karte „Signal von: O.“ (32×20): ein Zettel, links ein großes O, rechts Zeilen und Funkwellen */
const SIGNAL_KARTE = fromPalette(
  [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KppppppppppppppppppppppppppppppK',
    'KpggggggggggggggggggggggggggggGK',
    'KpggIgggggggIgggggggggggggggggGK',
    'KpggIIIIIIIIIgggggggggggggggggGK',
    'KpggIIgggggIIgggIIIIIIIIIIIIggGK',
    'KpggIIgggggIIgggggggggggggggggGK',
    'KpggIIgggggIIgggIIIIIIIIIgggggGK',
    'KpggIIgggggIIgggggggggggggggggGK',
    'KpggIIgggggIIgggIIIIIIIIIIIgggGK',
    'KpggIIgggggIIgggggggggggggggggGK',
    'KpggIIgggggIIgggggggggggggggggGK',
    'KpggIIgggggIIgggggggggggggggggGK',
    'KpggIIgggggIIgggRRgRRgRRgRRgggGK',
    'KpggIIIIIIIIIgggggggggggggggggGK',
    'KpggIgggggggIgggggggggggggggggGK',
    'KpggggggggggggggggggggggggggggGK',
    'KpggggggggggggggggggggggggggggGK',
    'KGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
  { G: 'glass', I: 'ink', K: 'outline', R: 'red', g: 'glass-light', p: 'paper-light' },
);

export function JunasPost() {
  return <Grid px={JUNAS_POST} kind="evidence" title="Junas Beitrag: ein Ausdruck mit drei Ausrufezeichen" className="story-pic small-pic" />;
}

export function BoosterChip() {
  return <Grid px={BOOSTER_CHIP} kind="evidence" title="Booster-Chip: ein Plättchen mit Antenne" className="story-pic small-pic" />;
}

export function DurchsageSkript() {
  return <Grid px={DURCHSAGE_SKRIPT} kind="evidence" title="Durchsage-Skript: ein Blatt mit Anführungszeichen" className="story-pic small-pic" />;
}

export function SignalKarte() {
  return <Grid px={SIGNAL_KARTE} kind="evidence" title="Karte: Signal von O." className="story-pic small-pic" />;
}
