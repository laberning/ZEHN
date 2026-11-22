// Alle registrierten eigenen Bilder an einer Stelle: Story-Bilder (`PICTURES`), Gadget-Symbole (`ICONS`), Krümel und die Symbole der
// Oberfläche (Lautsprecher der Gegenstimme, Schloss für Gesperrtes).
// Der Bild-Test (ui/pixel/pictures.test.ts) prüft sie, der Bogen (scripts/pictures/sheet.ts) zeigt sie.

import { createElement, type ReactElement } from 'react';
import type { PictureId } from '../../domain/storyObject.ts';
import { GadgetIcon } from '../components/GadgetIcon.tsx';
import { ICONS } from '../components/gadgetIcons.ts';
import { KruemelPic, LockIcon, LoudspeakerPic } from '../pixel/Pixel.tsx';
import type { PictureGroup } from '../pixel/pictureCheck.ts';
import type { PropName } from '../pixel/propSizes.ts';
import { PICTURES } from './pictures.tsx';
import { StoryPicture } from './StoryPicture.tsx';

export interface RegisteredPicture {
  /** Kennung im Test und auf dem Bogen: `story:notizbuch`, `gadget:lupe`, `kruemel`, `symbol:schloss` */
  key: string;
  group: PictureGroup;
  /** Bildart „Kachel“: eine Kachel aus einem LPC-Paket statt einer Zeichnung (der Bild-Test lässt sie aus) */
  tile?: PropName;
  render: () => ReactElement;
}

/** Alle registrierten Bilder in fester Reihenfolge */
export function registeredPictures(): RegisteredPicture[] {
  const story = (Object.keys(PICTURES) as PictureId[]).map((id): RegisteredPicture => {
    const pic = PICTURES[id];
    return { key: `story:${id}`, group: 'story', ...(typeof pic === 'function' ? {} : { tile: pic.tile }), render: () => createElement(StoryPicture, { id }) };
  });
  const gadgets = Object.keys(ICONS).map((id): RegisteredPicture => ({ key: `gadget:${id}`, group: 'gadget', render: () => createElement(GadgetIcon, { id, has: true }) }));
  const symbols: RegisteredPicture[] = [
    { key: 'symbol:lautsprecher', group: 'symbol', render: () => createElement(LoudspeakerPic) },
    { key: 'symbol:schloss', group: 'symbol', render: () => createElement(LockIcon) },
  ];
  return [...story, ...gadgets, { key: 'kruemel', group: 'kruemel', render: () => createElement(KruemelPic, { still: true }) }, ...symbols];
}
