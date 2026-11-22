// Figuren aus LPC-Grafiken

import { SPEAKER_INITIALS } from '../../content/texts/speakers.ts';
import type { Speaker } from '../../domain/dialog.ts';
import type { Avatar } from '../../domain/profile.ts';
import { useGame } from '../app/game.ts';
import { ADA, BARON, BENNO, HUBBEL, JUNA, avatarSpec } from '../lpc/characters.ts';
import { CROP_ADA, CROP_BARON, CROP_FULL, CROP_LEGS, CROP_PORTRAIT, type Crop } from '../lpc/crops.ts';
import type { Facing } from '../lpc/compose.ts';
import { LpcSprite } from '../lpc/LpcSprite.tsx';
import { KruemelPic } from '../pixel/Pixel.tsx';

/** Ganzkörper für Erwachsene: etwas mehr Platz nach oben (Zylinder, Dutt) */
const CROP_FULL_ADULT: Crop = { x: 12, y: 4, w: 40, h: 60 };

interface Props {
  size?: number;
  /** Größe nach dem gemeinsamen Pixelmaßstab `--px` (Bilderbuch) statt `size` */
  scaled?: boolean;
  full?: boolean;
  /** stehendes Bild (viele kleine Gesichter im Chat) */
  still?: boolean;
}

/** Bildtitel je Blickrichtung – damit ein Screenreader das Drehen merkt */
const FACING_TITLE: Record<Facing, string> = { down: 'Avatar', right: 'Avatar von rechts', up: 'Avatar von hinten', left: 'Avatar von links' };

/** Die Spielfigur; `legs`: nur Beine und Füße (Garderobe); `facing`: Blickrichtung (Garderobe, Standard vorne) */
export function AvatarPic({
  avatar,
  size = 96,
  scaled,
  full,
  legs,
  walk,
  still,
  facing = 'down',
}: Props & { avatar: Avatar; walk?: boolean; legs?: boolean; facing?: Facing }) {
  const wardrobe = useGame((s) => s.wardrobe);
  return (
    <LpcSprite
      spec={avatarSpec(avatar, wardrobe)}
      size={size}
      scaled={scaled}
      crop={full ? CROP_FULL : legs ? CROP_LEGS : CROP_PORTRAIT}
      anim={walk ? 'walk' : 'idle'}
      animate={!still}
      facing={facing}
      title={FACING_TITLE[facing]}
      offsetY={full || legs ? 0 : 4}
    />
  );
}

export function AdaPic({ size = 96, scaled, full, still }: Props) {
  return <LpcSprite spec={ADA} size={size} scaled={scaled} crop={full ? CROP_FULL_ADULT : CROP_ADA} title="Ada" animate={!still} />;
}

export function BaronPic({ size = 96, scaled, full, still }: Props) {
  return <LpcSprite spec={BARON} size={size} scaled={scaled} crop={full ? CROP_FULL_ADULT : CROP_BARON} title="Baron von Backspace" animate={!still} />;
}

/** Benno: der Baron ohne Hut und Monokel (im Chat, und im Bilderbuch ab dem Duell von Akt 7) */
export function BennoPic({ size = 96, scaled, full, still }: Props) {
  return <LpcSprite spec={BENNO} size={size} scaled={scaled} crop={full ? CROP_FULL_ADULT : CROP_BARON} title="Benno" animate={!still} />;
}

export function JunaPic({ size = 96, scaled, full, still }: Props) {
  return <LpcSprite spec={JUNA} size={size} scaled={scaled} crop={full ? CROP_FULL : CROP_PORTRAIT} title="Juna" animate={!still} offsetY={full ? 0 : 4} />;
}

export function HubbelPic({ size = 96, scaled, full, still }: Props) {
  return <LpcSprite spec={HUBBEL} size={size} scaled={scaled} crop={full ? CROP_FULL_ADULT : CROP_ADA} title="Frau Hubbel" animate={!still} />;
}

/** Kleines rundes Gesicht für Chat und Benachrichtigung; wer kein Bild hat, bekommt sein Kürzel */
export function SpeakerPic({ speaker, size = 34 }: { speaker: Speaker; size?: number }) {
  const avatar = useGame((s) => s.current?.avatar);
  const pic =
    speaker === 'ada' ? (
      <AdaPic size={size} still />
    ) : speaker === 'baron' ? (
      <BaronPic size={size} still />
    ) : speaker === 'benno' ? (
      <BennoPic size={size} still />
    ) : speaker === 'kruemel' ? (
      <KruemelPic size={size * 0.8} still />
    ) : speaker === 'juna' ? (
      <JunaPic size={size} still />
    ) : speaker === 'hubbel' ? (
      <HubbelPic size={size} still />
    ) : speaker === 'player' && avatar ? (
      <AvatarPic avatar={avatar} size={size} still />
    ) : (
      (SPEAKER_INITIALS[speaker] ?? '')
    );
  return (
    <span className={`speaker-pic pic-${speaker}`} style={{ width: size, height: size }} aria-hidden="true">
      {pic}
    </span>
  );
}
