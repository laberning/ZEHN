// Krümel sagt etwas: die Drohne neben einem kurzen Text (Rat, Tipp, Trost).

import type { ReactNode } from 'react';
import { KruemelPic } from '../pixel/Pixel.tsx';

interface Props {
  /** Breite der Drohne in Pixeln */
  size: number;
  children: ReactNode;
  /** CSS-Klassen des Rahmens (Standard: Kasten in der Mitte) */
  className?: string;
}

export function KruemelSays({ size, children, className = 'kruemel-say' }: Props) {
  return (
    <div className={className}>
      <KruemelPic size={size} />
      <p>{children}</p>
    </div>
  );
}
