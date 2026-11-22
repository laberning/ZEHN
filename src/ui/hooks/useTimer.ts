// Zeitgeber für Abläufe. Liefern die aktuelle Zeit aus dem Store (in Tests über Fake-Timer steuerbar).

import { useEffect } from 'react';
import { useGameStore } from '../app/game.ts';
import { useLatest } from './useLatest.ts';

/** Ruft `fn(jetzt)` in festem Abstand auf, solange `active` */
export function useInterval(active: boolean, ms: number, fn: (now: number) => void) {
  const store = useGameStore();
  const ref = useLatest(fn);
  useEffect(() => {
    if (!active) return;
    const iv = window.setInterval(() => ref.current(store.getState().now()), ms);
    return () => window.clearInterval(iv);
  }, [active, ms, store, ref]);
}

/** Ruft `fn(jetzt)` einmal pro Bild auf, solange `active` */
export function useAnimationFrame(active: boolean, fn: (now: number) => void) {
  const store = useGameStore();
  const ref = useLatest(fn);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const step = () => {
      ref.current(store.getState().now());
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, store, ref]);
}

/**
 * Ruft `fn` einmal nach `ms` auf; `ms === null` = kein Zeitgeber.
 * Ändert sich `ms` oder `restart`, beginnt die Wartezeit neu.
 */
export function useTimeout(ms: number | null, fn: () => void, restart?: unknown) {
  const ref = useLatest(fn);
  useEffect(() => {
    if (ms === null) return;
    const t = window.setTimeout(() => ref.current(), ms);
    return () => window.clearTimeout(t);
  }, [ms, restart, ref]);
}
