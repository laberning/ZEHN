import { useEffect } from 'react';
import type { KeyPress } from '../../domain/typing.ts';
import { useActions } from '../app/game.ts';

/** Spielt zu jedem neuen Anschlag den Tastenton (richtig) oder den Fehlerton (falsch) */
export function usePressSound(press: KeyPress | null) {
  const { sfx } = useActions();
  const n = press?.n;
  const ok = press?.ok;
  useEffect(() => {
    if (n) sfx(ok ? 'key' : 'error');
  }, [n, ok, sfx]);
}
