// Setzt den gemeinsamen Pixelmaßstab `--px` am Wurzelelement (siehe pixelScale in stage.ts).
// Figuren, Krümel und Kulisse rechnen alle damit. Neu gerechnet wird bei `resize` (auch Zoom) und wenn sich
// devicePixelRatio ohne Größenänderung ändert (Fenster auf einen anderen Bildschirm gezogen).

import { useLayoutEffect } from 'react';
import { pixelScale } from '../pixel/stage.ts';

/** Maßstab für das aktuelle Fenster; mit `boxHeight` (Gesprächsbox) auch nach der Höhe begrenzt (Bilderbuch) */
export const currentPixelScale = (boxHeight?: number): number =>
  pixelScale(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1, boxHeight);

export function usePixelScale(): void {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const apply = () => root.style.setProperty('--px', `${currentPixelScale()}px`);
    // matchMedia meldet nur den Wechsel weg von der aktuellen Auflösung – danach neu anmelden
    let dpr: MediaQueryList | null = null;
    const onDpr = () => {
      apply();
      watchDpr();
    };
    const watchDpr = () => {
      dpr?.removeEventListener('change', onDpr);
      dpr = window.matchMedia?.(`(resolution: ${window.devicePixelRatio || 1}dppx)`) ?? null;
      dpr?.addEventListener('change', onDpr);
    };
    apply();
    watchDpr();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      dpr?.removeEventListener('change', onDpr);
    };
  }, []);
}
