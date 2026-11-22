import { useEffect, useRef } from 'react';
import { useGameStore } from '../app/game.ts';
import { useLatest } from './useLatest.ts';

/** So lange nach dem Aktivwerden wird die Taste ignoriert – gegen versehentliches Doppel-Enter. */
export const KEY_GRACE_MS = 400;

/**
 * Tastenkürzel für den ganzen Bildschirm. Enter = weiter, Escape = zurück.
 * preventDefault verhindert, dass zusätzlich ein gerade fokussierter Knopf auslöst –
 * so macht Enter überall genau eine Sache.
 * Wird der Handler gerade erst aktiv (Bildschirm neu, Dialog geschlossen), zählt ein
 * Tastendruck in den ersten Millisekunden nicht: Ein schnelles Doppel-Enter am Ende
 * eines Dialogs startet sonst sofort die nächste Aktion.
 * `rearm`: Wechselt dieser Wert auf einen neuen (nicht undefined), gilt die Sperrzeit erneut – wenn Enter
 * auf derselben Seite plötzlich etwas Folgenreiches tut, z. B. am Ende eines Chats oder wenn Antworten erscheinen.
 */
export function useKey(key: 'Enter' | 'Escape', handler: (() => void) | null | undefined, rearm?: string | number | boolean) {
  const store = useGameStore();
  const ref = useLatest(handler);
  const activeSince = useRef(0);
  const active = !!handler;
  useEffect(() => {
    if (active) activeSince.current = store.getState().now();
  }, [active, store]);
  useEffect(() => {
    if (active && rearm !== undefined) activeSince.current = store.getState().now();
  }, [active, rearm, store]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key !== key || e.repeat || !ref.current) return;
      e.preventDefault();
      if (store.getState().now() - activeSince.current < KEY_GRACE_MS) return;
      ref.current();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [key, store, ref]);
}
