// Story-Objekte: ein Gegenstand je Auftrag, der mit dem Fortschritt Stufe für Stufe sichtbar wird.
// Die Stufen stehen im Bündel des Akts (content/story/akt1/objects.ts).

import type { LessonProgress } from './profile.ts';

/** Akt 2: je Bild fünf Stufen (0, 25, 50, 75, 100 %), z. B. `peilgeraet-25` (ui/pictures/akt2.tsx) */
export type ObenPictureId = `${'peilgeraet' | 'rotor' | 'o-schilder' | 'route' | 'schlossplatte'}-${0 | 25 | 50 | 75 | 100}`;

/** Akt 3: je Bild fünf Stufen (0, 25, 50, 75, 100 %), z. B. `netzplan-25` (ui/pictures/akt3.tsx) */
export type UntenPictureId = `${'netzplan' | 'ladestation'}-${0 | 25 | 50 | 75 | 100}`;

/** Akt 4: das Straßenschild in fünf Stufen (0, 25, 50, 75, 100 %), z. B. `strassenschild-25` (ui/pictures/akt4.tsx) */
export type GrossPictureId = `strassenschild-${0 | 25 | 50 | 75 | 100}`;

/** Porträts der Verdächtigen in den Fallakten (ui/pictures/portraits.tsx) */
export type PortraitPictureId = `portraet-${'kringel' | 'baron' | 'ortrud' | 'kruemel' | 'unbekannt' | 'elster' | 'hubbel' | 'hilde' | 'otti' | 'tippi' | 'benno'}`;

/** Kennungen der kleinen Pixelbilder (ui/pictures/StoryPicture.tsx) */
export type PictureId =
  | ObenPictureId
  | PortraitPictureId
  | UntenPictureId
  | GrossPictureId
  | 'rauschen'
  | 'haende'
  | 'markt'
  | 'ortsschild-unscharf'
  | 'ortsschild'
  | 'halbes-foto'
  | 'schilder-0'
  | 'schilder-25'
  | 'schilder-50'
  | 'schilder-100'
  | 'brunnen'
  | 'briefkasten'
  | 'rotlicht-zettel'
  | 'durchsage'
  | 'feder'
  | 'paket'
  | 'kasse'
  | 'maschine-4'
  | 'elsternest'
  | 'skizze-tuer'
  | 'fahrkarte'
  | 'fahrplan'
  | 'notizbuch'
  | 'keks-gruss'
  | 'zeitung'
  | 'plakat'
  | 'foto-benno'
  | 'kalenderblatt'
  | 'junas-post'
  | 'booster-chip'
  | 'durchsage-skript'
  | 'signal-karte'
  | 'goldstaub'
  | 'feind-karte'
  | 'spurenwand-nadel'
  | 'lieferbuch'
  | 'lieferblatt'
  | 'preisliste'
  | 'abdruck'
  | 'schaltplan'
  | 'zylinder'
  | 'foto-ganz'
  | 'lieferwagen';

/**
 * Teile eines Ausweises (Art 'idcard'), in der Reihenfolge, in der sie dazukommen: beim Agentenausweis druckt Krümels Drucker
 * kopf, foto, name, stempel; Ortruds Schlüsselkarte (look 'schluesselkarte') bekommt foto, logo („O.“), name, code (Code-Streifen) und stempel („Code bereit“)
 */
export type IdCardPart = 'kopf' | 'foto' | 'name' | 'stempel' | 'logo' | 'code';

/** Gezeichnete Zeichen auf einer Karte */
export type InkMark = 'schnoerkel' | 'krone';

/** In Zeilen: ein Buchstabe, der noch unter einem Tintenklecks liegt */
export const INK_BLOT = '▒';

/** Knoten im Netz eines Story-Objekts der Art 'nodes' */
export const NODE_COUNT = 12;

export interface ObjectStage {
  /** ab diesem Fortschritt (0..1) gilt diese Stufe */
  at: number;
  text?: string;
  lines?: readonly string[];
  picture?: PictureId;
  /** Anzahl leuchtender Knoten */
  lit?: number;
  /** schon gedruckte Teile des Ausweises */
  card?: readonly IdCardPart[];
  /** Art 'lines': so viele Zeilen am Ende stehen im Kleingedruckten (z. B. „Ausgenommen: ich.“ auf Bennos Plakat) */
  finePrint?: number;
  /** blasses Wasserzeichen (Brezel) hinter der Schrift */
  watermark?: boolean;
  /** gezeichnete Tinte über den Zeilen (Goldrand-Karte): Schnörkel, Krone */
  marks?: readonly InkMark[];
}

export interface StoryObject {
  lessonId: string;
  title: string;
  kind: 'text' | 'lines' | 'nodes' | 'picture' | 'idcard';
  /** Aussehen: 'goldcard' = Karte mit Goldrand (Post des Diebs), 'schluesselkarte' = Ortruds Schlüsselkarte (Art 'idcard') */
  look?: 'goldcard' | 'schluesselkarte';
  /** aufsteigend nach `at`, die erste Stufe beginnt bei 0 */
  stages: readonly ObjectStage[];
}

/** Die Stufe, die bei Fortschritt `p` gilt: die letzte mit at <= p */
export function stageAt(object: StoryObject, p: number): ObjectStage {
  let stage = object.stages[0]!;
  for (const s of object.stages) if (s.at <= p) stage = s;
  return stage;
}

export const objectOf = (objects: readonly StoryObject[], lessonId: string): StoryObject | undefined => objects.find((o) => o.lessonId === lessonId);

/** Höchstwert, den ein Story-Objekt vor „geschafft“ zeigt */
const OBJECT_CAP = 0.99;

/** 0..1 für das Story-Objekt: bester bisheriger Fortschritt; 1 erst bei „geschafft“ */
export function objectPercent(lp: Pick<LessonProgress, 'best' | 'mastered'> | undefined): number {
  if (!lp) return 0;
  return lp.mastered ? 1 : Math.min(lp.best, OBJECT_CAP);
}
