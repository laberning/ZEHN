// Story-Bilder von Akt 6 „Zahlen“: die Beweisstücke Tüte Goldstaub, Goldrand-Karte „Der Feind meines Feindes“, Nadel „Marktplatz 10“,
// Ottis Lieferbuch und das Lieferblatt (je 32×20). Die Story-Objekte von Akt 6 sind Texte (lines). Zeichen-Karten auf der Palette,
// Ziffern und Wörter in Pixelschrift (Stilregeln in docs/design/grafik.md, „Eigene Bilder“).

import { Grid } from '../pixel/Pixel.tsx';
import { fromPalette } from '../pixel/pixelMap.ts';

/** Tüte Goldstaub (32×20): eine durchsichtige Beweistüte voller Glitzer, darin ein kleiner Fußabdruck mit Absatz */
const GOLDSTAUB = fromPalette(
  [
    '................................',
    '....KKKKKKKKKKKKKKKKKKKKKKKK....',
    '....KGGGGGGGGGGGGGGGGGGGGGGK....',
    '....KHHHHHHHHHHHHHHHHHHHHHHK....',
    '....KHHHHHHHHHHHHHHHHHHHHHHK....',
    '....KppppppppppppppppppppppK....',
    '....KgggggggggggggggggggggGK....',
    '....KggggggggwWWWggggggggyGK....',
    '....KggYYggggWWWWgggggggggGK....',
    '....KgggggyggWWWWggggYYgggGK....',
    '....KggggggggWWWWYggggggggGK....',
    '....KggggggYYgWWggggygggggGK....',
    '....KgggggggggWWggggggggYYGK....',
    '....KggggygggggyggggggggggGK....',
    '....KgggggggggWWWgggggggggGK....',
    '....KgggYYggggWWWgYYggggggGK....',
    '....KggggggggYYggggggggYYgGK....',
    '....KGGGGGGGGGGGGGGGGGGGGGGK....',
    '....KKKKKKKKKKKKKKKKKKKKKKKK....',
    '................................',
  ],
  { G: 'glass', H: 'glass-dark', K: 'outline', W: 'wood', Y: 'gold', g: 'glass-light', p: 'paper-light', w: 'wood-light', y: 'gold-light' },
);

/** Goldrand-Karte „Der Feind meines Feindes“ (32×20): Papier mit Goldrand, Zeilen und der Schnörkel „B.“ */
const FEIND_KARTE = fromPalette(
  [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyK',
    'KYYYYYYYYYYYYYYYYYYYYYYYYYYYYYOK',
    'KYYppppppppppppppppppppppppppYOK',
    'KYYPPPPPPPPPPPPPPPPPPPPPPPPPPYOK',
    'KYYPPPIIIIIIIIIIIIIIIIIPPPPPPYOK',
    'KYYPPPPPPPPPPPPPPPPPPPPPPPPPPYOK',
    'KYYPPPIIIIIIIIIIIIIIPPPPPPPPPYOK',
    'KYYPPPPPPPPPPPPPPPPPPPPPPPPPPYOK',
    'KYYPPPIIIIIIIIIIIIIIIIPPPPPPPYOK',
    'KYYPPPPPPPPPPPPPPPPPPPPPPPPPPYOK',
    'KYYPPPIIIIIIIIIIIIPPPPHHPPPPPYOK',
    'KYYPPPPPPPPPPPPPPPPPPPHPHPPPPYOK',
    'KYYPPPPPPPPPPPPPPPPPPPHHPPPPPYOK',
    'KYYPPPPPPPPPPPPPPPPPPPHPHPPPPYOK',
    'KYYPPPPPPPPPPPPPPPPPPPHHPPPHPYOK',
    'KYYSSSSSSSSSSSSSSSSSSSSSSSSSSYOK',
    'KYYYYYYYYYYYYYYYYYYYYYYYYYYYYYOK',
    'KOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
  { H: 'glass-dark', I: 'ink', K: 'outline', O: 'gold-dark', P: 'paper', S: 'paper-dark', Y: 'gold', p: 'paper-light', y: 'gold-light' },
);

/** Die Nadel „Marktplatz 10“ (32×20): rote Pinnnadel, daran ein Fähnchen mit „10“ */
const SPURENWAND_NADEL = fromPalette(
  [
    '................................',
    '................................',
    '...KKKKKK.......................',
    '...KrrrRKKKKKKKKKKKKKKKKKKKKK...',
    '...KrRRRKKppppppppppppppppppK...',
    '...KRRRRKKpPPPPPPPPPPPPPPPPSK...',
    '...KRRREKKpPPPPPPPPPPPPPPPPSK...',
    '...KKKKKKKpPPPPPPIPPIIIPPPPSK...',
    '.....mK..KpPPPPPIIPPIPIPPPPSK...',
    '.....mK..KpPPPPPPIPPIPIPPPPSK...',
    '.....mK..KpPPPPPPIPPIPIPPPPSK...',
    '.....mK..KpPPPPPIIIPIIIPPPPSK...',
    '.....mK..KpPPPPPPPPPPPPPPPPSK...',
    '.....mK..KSSSSSSSSSSSSSSSSSSK...',
    '.....mK..KKKKKKKKKKKKKKKKKKKK...',
    '.....mK.........................',
    '.....KD.........................',
    '................................',
    '................................',
    '................................',
  ],
  { D: 'metal-dark', E: 'red-dark', I: 'ink', K: 'outline', P: 'paper', R: 'red', S: 'paper-dark', m: 'metal-light', p: 'paper-light', r: 'red-light' },
);

/** Ottis Lieferbuch (32×20): ein blaues Durchschlagbuch, aufgeschlagen, Zeilen und eine umgeknickte Ecke */
const LIEFERBUCH = fromPalette(
  [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGK',
    'KGHHHHHHHHHHHHHHHHHHHHHHHHHHHHHK',
    'KGHppppppppppppKKppppppppppppHHK',
    'KGHggggggggggggKKggggggggggggHHK',
    'KGHggIIIIIIIIggKKggIIIIIIIgggHHK',
    'KGHggggggggggggKKggggggggggggHHK',
    'KGHggIIIIIIIgggKKggIIIIIIIIggHHK',
    'KGHggggggggggggKKggggggggggggHHK',
    'KGHggIIIIIIIIggKKggIIIIIgggggHHK',
    'KGHggggggggggggKKggggggggggggHHK',
    'KGHggIIIIIIggggKKggIIIIIIIgggHHK',
    'KGHggggggggggggKKggggggggggggHHK',
    'KGHggIIIIIIIgggKKggggggggKGGGHHK',
    'KGHggggggggggggKKggggggggGHHHHHK',
    'KGHggggggggggggKKggggggggGHHHHHK',
    'KGHGGGGGGGGGGGGKKGGGGGGGGGHHKHHK',
    'KGHHHHHHHHHHHHHHHHHHHHHHHHHHHHHK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
  { G: 'glass', H: 'glass-dark', I: 'ink', K: 'outline', g: 'glass-light', p: 'paper-light' },
);

/** Das Lieferblatt (32×20): ein loses Blatt mit Zeilen, ohne Goldrand */
const LIEFERBLATT = fromPalette(
  [
    '................................',
    '................................',
    '...KKKKKKKKKKKKKKKKKKKKKKKKKK...',
    '...KppppppppppppppppppppppppK...',
    '...KpppppppppppppppppppppppSK...',
    '..KppppppppppppppppppppppppSK...',
    '..KppppIIIIIIIIIIIIIIIpppppSK...',
    '...KpppppppppppppppppppppppSK...',
    '...KpppppppppppppppppppppppSK...',
    '...KpppIIIIIIIIIIIppppRRRppSK...',
    '..KpppppppppppppppppppppRppSK...',
    '..KppppppppppppppppppppRRppSK...',
    '...KpppIIIIIIIpppppppppppppSK...',
    '...KpppppppppppppppppppRpppSK...',
    '..KppppppppppppppppppppppppSK...',
    '...KpppppppppppppppppppppppSK...',
    '...KSSSSSSSSSSSSSSSSSSSSSSSSK...',
    '...KKKKKKKKKKKKKKKKKKKKKKKKKK...',
    '................................',
    '................................',
  ],
  { I: 'ink', K: 'outline', R: 'red', S: 'paper-dark', p: 'paper-light' },
);

export function Goldstaub() {
  return <Grid px={GOLDSTAUB} kind="evidence" title="Tüte Goldstaub mit einem Fußabdruck mit Absatz" className="story-pic small-pic" />;
}

export function FeindKarte() {
  return <Grid px={FEIND_KARTE} kind="evidence" title="Goldrand-Karte: Der Feind meines Feindes" className="story-pic small-pic" />;
}

export function SpurenwandNadel() {
  return <Grid px={SPURENWAND_NADEL} kind="evidence" title="Rote Nadel mit einem Fähnchen: 10" className="story-pic small-pic" />;
}

export function Lieferbuch() {
  return <Grid px={LIEFERBUCH} kind="evidence" title="Ottis Lieferbuch: ein blaues Durchschlagbuch" className="story-pic small-pic" />;
}

export function Lieferblatt() {
  return <Grid px={LIEFERBLATT} kind="evidence" title="Ein loses Blatt aus dem Lieferbuch" className="story-pic small-pic" />;
}
