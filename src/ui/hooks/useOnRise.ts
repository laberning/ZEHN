import { useEffect } from 'react';
import { useLatest } from './useLatest.ts';

/**
 * Ruft `fn` einmal auf, sobald `flag` wahr wird (auch schon beim ersten Zeichnen, wenn es dann wahr ist).
 * Bleibt `flag` wahr, passiert nichts weiter; erst nach falsch → wahr wieder.
 * `fn` darf sich bei jedem Zeichnen ändern – aufgerufen wird immer die neueste.
 */
export function useOnRise(flag: boolean, fn: () => void) {
  const latest = useLatest(fn);
  useEffect(() => {
    if (flag) latest.current();
  }, [flag, latest]);
}
