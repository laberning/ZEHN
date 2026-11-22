import { useEffect, useRef } from 'react';
import { useGameStore } from '../app/game.ts';
import { KEY_GRACE_MS } from './useKey.ts';
import { useLatest } from './useLatest.ts';

/**
 * Antworten per Tastatur: Ziffern 1–9 wählen direkt, ↑/↓ bewegen die Markierung.
 * Gehaltene Tasten (`repeat`) zählen nicht, Pfeile scrollen die Seite nicht.
 * Wie bei `useKey` zählt ein Druck kurz nach dem Erscheinen der Antworten nicht –
 * sonst wählt ein schneller Doppeldruck eine Antwort, die man noch gar nicht gesehen hat.
 * `choices`: Kennung der angebotenen Antworten (z. B. Zeilen-ID); null/undefined = keine Antworten.
 * Wechselt sie, gilt die Sperrzeit erneut.
 */
export function useChoiceKeys(choices: string | number | null | undefined, count: number, onChoose: (index: number) => void, onMove?: (delta: number) => void) {
  const store = useGameStore();
  const choose = useLatest(onChoose);
  const move = useLatest(onMove);
  const activeSince = useRef(0);
  const active = choices !== null && choices !== undefined && count > 0;
  useEffect(() => {
    if (active) activeSince.current = store.getState().now();
  }, [active, choices, store]);
  useEffect(() => {
    if (!active) return;
    const on = (e: KeyboardEvent) => {
      const n = Number(e.key);
      const digit = Number.isInteger(n) && n >= 1 && n <= count;
      const delta = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
      if (!digit && !(delta && move.current)) return;
      if (delta) e.preventDefault();
      if (e.repeat) return;
      // Bewegen ist harmlos und geht sofort; Wählen erst nach der Sperrzeit
      if (delta) move.current?.(delta);
      else if (store.getState().now() - activeSince.current >= KEY_GRACE_MS) choose.current(n - 1);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [active, count, store, choose, move]);
}
