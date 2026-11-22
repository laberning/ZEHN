// Gemeinsamer Ablauf der Spielhallen-Spiele: sichere Tasten, Start, Phase, Töne zu den Spielereignissen.

import { useEffect, useState } from 'react';
import type { Sfx } from '../../app/ports.ts';
import { safeKeys } from '../../domain/progress.ts';
import { useActions, useGame, useProfile } from '../../ui/app/game.ts';
import type { ArcadePhase } from './ArcadeFrame.tsx';

interface RunState<E extends string> {
  events: readonly E[];
  over: boolean;
}

/**
 * @param make baut einen neuen Spielzustand (Tasten, Startwert für den Zufall, Startzeit)
 * @param sounds welcher Ton zu welchem Spielereignis gehört
 */
export function useArcadeRun<E extends string, S extends RunState<E>>(make: (keys: string[], seed: number, now: number, startLevel: number) => S, sounds: Record<E, Sfx>) {
  const p = useProfile();
  const course = useGame((s) => s.rules.course);
  const { seed, now, sfx } = useActions();
  const [keys] = useState(() => safeKeys(p, course));
  // für die Bildschirmtastatur – einmal gebaut, nicht in jedem Bild
  const [learned] = useState<ReadonlySet<string>>(() => new Set(keys));
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<S>(() => make(keys, 1, 0, 1));
  const phase: ArcadePhase = !started ? 'ready' : state.over ? 'over' : 'play';

  const start = (startLevel: number) => {
    setState(make(keys, seed(), now(), startLevel));
    setStarted(true);
  };

  useEffect(() => {
    for (const e of state.events) sfx(sounds[e]);
  }, [state, sfx, sounds]);

  return { keys, learned, state, setState, phase, start };
}
