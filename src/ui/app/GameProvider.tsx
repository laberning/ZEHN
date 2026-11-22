// Stellt den Store per Context bereit – so können Tests einen eigenen Store mit Attrappen einsetzen.

import type { ReactNode } from 'react';
import type { GameStore } from '../../app/store.ts';
import { GameContext } from './game.ts';

export function GameProvider({ store, children }: { store: GameStore; children: ReactNode }) {
  return <GameContext.Provider value={store}>{children}</GameContext.Provider>;
}
