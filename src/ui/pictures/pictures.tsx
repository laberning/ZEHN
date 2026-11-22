// Alle Story-Bilder nach Kennung (`PictureId`): Zeichnungen aus akt1.tsx … akt7.tsx, cases.tsx und portraits.tsx (Verdächtige), Kacheln (Bildart „Kachel“).
// `StoryPicture` zeichnet sie; der Bild-Test (ui/pixel/pictures.test.ts) und der Bogen (scripts/pictures/sheet.ts) gehen sie durch.

import type { ReactElement } from 'react';
import type { GrossPictureId, ObenPictureId, PictureId, UntenPictureId } from '../../domain/storyObject.ts';
import type { TilePicture } from '../pixel/Tile.tsx';
import { Haende, HalfPhoto, MarketSigns, Ortsschild, Rauschen } from './akt1.tsx';
import { Elsternest, Fahrkarte, OSchilder, Peilgeraet, Rotor, Route, Schlossplatte, SkizzeTuer, type Level } from './akt2.tsx';
import { Fahrplan, KeksGruss, Ladestation, Netzplan, Notizbuch } from './akt3.tsx';
import { FotoBenno, Kalenderblatt, Plakat, Strassenschild, Zeitung } from './akt4.tsx';
import { BoosterChip, DurchsageSkript, JunasPost, SignalKarte } from './akt5.tsx';
import { FeindKarte, Goldstaub, Lieferblatt, Lieferbuch, SpurenwandNadel } from './akt6.tsx';
import { Abdruck, FotoGanz, Lieferwagen, Preisliste, Schaltplan, Zylinder } from './akt7.tsx';
import { CASE_PICTURES } from './cases.tsx';
import { PORTRAIT_PICTURES } from './portraits.tsx';

/** Akt 2: je Art fünf Stufen, Kennung `<art>-<Stufe>` */
const OBEN_ARTS = { peilgeraet: Peilgeraet, rotor: Rotor, 'o-schilder': OSchilder, route: Route, schlossplatte: Schlossplatte };
const OBEN_LEVELS: readonly Level[] = [0, 25, 50, 75, 100];
const OBEN_PICTURES = Object.fromEntries(
  Object.entries(OBEN_ARTS).flatMap(([art, Pic]) => OBEN_LEVELS.map((level) => [`${art}-${level}`, () => <Pic level={level} />] as const)),
) as Record<ObenPictureId, () => ReactElement>;

/** Akt 3: je Art fünf Stufen, Kennung `<art>-<Stufe>` */
const UNTEN_ARTS = { netzplan: Netzplan, ladestation: Ladestation };
const UNTEN_PICTURES = Object.fromEntries(
  Object.entries(UNTEN_ARTS).flatMap(([art, Pic]) => OBEN_LEVELS.map((level) => [`${art}-${level}`, () => <Pic level={level} />] as const)),
) as Record<UntenPictureId, () => ReactElement>;

/** Akt 4: fünf Stufen des Straßenschilds, Kennung `strassenschild-<Stufe>` */
const GROSS_PICTURES = Object.fromEntries(OBEN_LEVELS.map((level) => [`strassenschild-${level}`, () => <Strassenschild level={level} />] as const)) as Record<GrossPictureId, () => ReactElement>;

/** Jede Bild-Kennung braucht ein Bild – ein Tippfehler fällt beim Typcheck auf */
export const PICTURES: Record<PictureId, (() => ReactElement) | TilePicture> = {
  rauschen: () => <Rauschen />,
  haende: () => <Haende />,
  markt: () => <Ortsschild market blur={0.7} />,
  'ortsschild-unscharf': () => <Ortsschild blur={0.8} />,
  ortsschild: () => <Ortsschild blur={0} />,
  'halbes-foto': () => <HalfPhoto />,
  'schilder-0': () => <MarketSigns apothekeH={false} gasthausG={false} gansG={false} />,
  'schilder-25': () => <MarketSigns apothekeH={false} gasthausG gansG={false} />,
  'schilder-50': () => <MarketSigns apothekeH gasthausG gansG={false} />,
  'schilder-100': () => <MarketSigns apothekeH gasthausG gansG />,
  elsternest: () => <Elsternest />,
  'skizze-tuer': () => <SkizzeTuer />,
  fahrkarte: () => <Fahrkarte />,
  fahrplan: () => <Fahrplan />,
  notizbuch: () => <Notizbuch />,
  'keks-gruss': () => <KeksGruss />,
  zeitung: () => <Zeitung />,
  plakat: () => <Plakat />,
  'foto-benno': () => <FotoBenno />,
  kalenderblatt: () => <Kalenderblatt />,
  'junas-post': () => <JunasPost />,
  'booster-chip': () => <BoosterChip />,
  'durchsage-skript': () => <DurchsageSkript />,
  'signal-karte': () => <SignalKarte />,
  goldstaub: () => <Goldstaub />,
  'feind-karte': () => <FeindKarte />,
  'spurenwand-nadel': () => <SpurenwandNadel />,
  lieferbuch: () => <Lieferbuch />,
  lieferblatt: () => <Lieferblatt />,
  preisliste: () => <Preisliste />,
  abdruck: () => <Abdruck />,
  schaltplan: () => <Schaltplan />,
  zylinder: () => <Zylinder />,
  'foto-ganz': () => <FotoGanz />,
  lieferwagen: () => <Lieferwagen />,
  ...OBEN_PICTURES,
  ...UNTEN_PICTURES,
  ...GROSS_PICTURES,
  ...CASE_PICTURES,
  ...PORTRAIT_PICTURES,
};
