// Die eine Stelle, an der Tastendrücke zum Tippen ausgewertet werden (Übungen, Einsatz, Spielhalle).

import { useEffect, useState } from 'react';
import { useGameStore } from '../app/game.ts';
import { useLatest } from './useLatest.ts';

/** Entwickler-Abkürzung (nur `npm run dev`): diese Taste tippt den Rest der Runde fehlerfrei */
export const SKIP_KEY = 'F9';
/** Abstand der fehlerfreien Anschläge der Abkürzung: zügig, aber im Rahmen jedes Tempo-Riegels */
export const SKIP_GAP_MS = 150;

/** Buchstabe, der mit Feststelltaste anders aussieht (a → A) */
const changesWithCaps = (ch: string) => ch.toLowerCase() !== ch.toUpperCase();

/** Zusatzangaben zu einem Anschlag: gehaltene Umschalt-Hand, wenn sie sich eindeutig aus `ShiftLeft`/`ShiftRight` ergibt */
export interface CharOptions {
  shift?: 'left' | 'right';
}

/**
 * Ruft `onChar(zeichen, jetzt, { shift })` für jedes getippte Zeichen auf.
 * Ignoriert: Wiederholungen beim Gedrückthalten, Sondertasten, Tottasten, Browser-Kürzel (Strg/Cmd) und den Ziffernblock
 * (`Numpad…`): gelernt wird der Griff zur Zahlenreihe über den Buchstaben, nicht die Ziffer irgendwoher. Eine verworfene Ziffer
 * meldet der Rückgabewert `numpad` (bis zum nächsten gültigen Anschlag), damit der Bildschirm es erklären kann.
 * `shift` ist die gehaltene Umschalt-Hand (aus keydown/keyup von `ShiftLeft`/`ShiftRight`, beim Verlassen des Fensters zurückgesetzt);
 * unbekannt (Bildschirmtastatur, beide gedrückt, keine Codes) heißt `undefined`. Nur die Übungsrunde wertet es aus.
 * AltGr (unter Windows Strg+Alt) wird durchgelassen.
 * Feststelltaste an: Buchstaben zählen nicht (sonst wäre jeder Anschlag ein Fehler);
 * der Rückgabewert `capsLock` ist dann true, damit der Bildschirm einen Hinweis zeigen kann.
 * `rest`: der noch zu tippende Text. Nur im Dev-Modus tippt `SKIP_KEY` ihn fehlerfrei zu Ende –
 * zum Überspringen von Übungen beim Entwickeln; im fertigen Spiel gibt es die Abkürzung nicht.
 */
export function useTypingInput(active: boolean, onChar: (ch: string, now: number, o?: CharOptions) => void, rest?: string): { capsLock: boolean; numpad: boolean } {
  const store = useGameStore();
  const handler = useLatest(onChar);
  const restRef = useLatest(rest);
  const [capsLock, setCapsLock] = useState(false);
  const [numpad, setNumpad] = useState(false);
  useEffect(() => {
    if (!active) return;
    // Fokus von Knöpfen nehmen, damit die Leertaste keinen Knopf auslöst
    (document.activeElement as HTMLElement | null)?.blur?.();
    const held = { left: false, right: false };
    const hand = (): CharOptions => ({ shift: held.left === held.right ? undefined : held.left ? 'left' : 'right' });
    const track = (down: boolean) => (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft') held.left = down;
      else if (e.code === 'ShiftRight') held.right = down;
    };
    const onDown = track(true);
    const onUp = track(false);
    const reset = () => {
      held.left = held.right = false;
    };
    const on = (e: KeyboardEvent) => {
      onDown(e);
      const caps = e.getModifierState?.('CapsLock') ?? false;
      setCapsLock(caps);
      if (import.meta.env.DEV && e.key === SKIP_KEY && restRef.current) {
        e.preventDefault();
        const now = store.getState().now();
        Array.from(restRef.current).forEach((ch, i) => handler.current(ch, now + i * SKIP_GAP_MS, hand()));
        return;
      }
      if ((e.ctrlKey && !e.altKey) || e.metaKey) return;
      if (e.key === ' ' || e.key === "'" || e.key === '/') e.preventDefault(); // kein Scrollen / keine Schnellsuche
      if (e.repeat || e.key.length !== 1) return;
      if (e.code?.startsWith('Numpad')) {
        if (/^\d$/.test(e.key)) setNumpad(true); // andere Ziffernblock-Tasten zählen auch nicht, lassen den Hinweis aber stehen
        return;
      }
      setNumpad(false);
      e.preventDefault();
      if (caps && changesWithCaps(e.key)) return;
      handler.current(e.key, store.getState().now(), hand());
    };
    window.addEventListener('keydown', on);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('keydown', on);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', reset);
    };
  }, [active, store, handler, restRef]);
  return { capsLock: active && capsLock, numpad: active && numpad };
}
