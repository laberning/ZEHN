import { useEffect, useRef, useState } from 'react';
import { useInterval } from '../hooks/useTimer.ts';
import { ANIM_FRAMES, FRAME, composeStrip, facingRow, type Anim, type CharacterSpec, type Facing } from './compose.ts';
import { CROP_PORTRAIT, type Crop } from './crops.ts';

interface Props {
  spec: CharacterSpec;
  anim?: Anim;
  /** Blickrichtung; Standard: vorne */
  facing?: Facing;
  /** Anzeigegröße: Breite in CSS-Pixeln */
  size: number;
  /** Stattdessen jedes Bildpixel `--px` groß (gemeinsamer Maßstab, siehe stage.ts) */
  scaled?: boolean;
  crop?: Crop;
  animate?: boolean;
  title?: string;
  /** Für den Porträt-Ausschnitt etwas höher ansetzen (z. B. für Zylinder) */
  offsetY?: number;
}

const SPEED: Record<Anim, number> = { idle: 650, walk: 110 };

export function LpcSprite({ spec, anim = 'idle', facing = 'down', size, scaled, crop = CROP_PORTRAIT, animate = true, title, offsetY = 0 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [strip, setStrip] = useState<HTMLCanvasElement | null>(null);
  const [frame, setFrame] = useState(0);
  const specKey = JSON.stringify(spec);

  useEffect(() => {
    let alive = true;
    composeStrip(JSON.parse(specKey) as CharacterSpec, anim).then(
      (s) => alive && setStrip(s),
      (e: unknown) => console.error(e),
    );
    return () => {
      alive = false;
    };
  }, [specKey, anim]);

  const n = ANIM_FRAMES[anim];
  // walk: Bild 0 ist das Stehen, die Schritte sind 1–8
  useInterval(animate, SPEED[anim], () => setFrame((f) => (anim === 'walk' ? (f % (n - 1)) + 1 : (f + 1) % n)));
  // Nach einem Wechsel der Animation kann das alte Bild hinter dem Ende des neuen Streifens liegen
  const shown = frame % n;

  useEffect(() => {
    const c = ref.current;
    if (!c || !strip) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    const y = facingRow(facing) * FRAME + crop.y + offsetY;
    ctx.drawImage(strip, shown * FRAME + crop.x, y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  }, [strip, shown, crop, offsetY, facing]);

  return (
    <canvas
      ref={ref}
      width={crop.w}
      height={crop.h}
      className="lpc"
      style={scaled ? { width: `calc(var(--px) * ${crop.w})`, height: `calc(var(--px) * ${crop.h})` } : { width: size, height: (size * crop.h) / crop.w }}
      role="img"
      aria-label={title}
    />
  );
}
