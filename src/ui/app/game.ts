// Store-Context und Hooks (ohne JSX, damit Hot Reload für die Provider-Komponente funktioniert).

import { createContext, useContext, useState } from 'react';
import { useStore } from 'zustand';
import { storyVars } from '../../app/views/common.ts';
import type { GameActions, GameState, GameStore } from '../../app/store.ts';
import { timeOf, type TimeInfo } from '../../domain/daytime.ts';
import type { Profile } from '../../domain/profile.ts';

export const GameContext = createContext<GameStore | null>(null);

export function useGameStore(): GameStore {
  const store = useContext(GameContext);
  if (!store) throw new Error('GameProvider fehlt');
  return store;
}

/** Ausschnitt aus dem Zustand abonnieren (nur neu zeichnen, wenn er sich ändert) */
export function useGame<T>(selector: (s: GameState) => T): T {
  return useStore(useGameStore(), selector);
}

/** Aktionen des Stores (stabil, lösen kein Neuzeichnen aus). Daten nur über useGame lesen. */
export function useActions(): GameActions {
  return useGameStore().getState();
}

/** Das ausgewählte Profil – nur in Bildschirmen, die ohne Profil nicht erreichbar sind */
export function useProfile(): Profile {
  const p = useGame((s) => s.current);
  if (!p) throw new Error('Kein Profil ausgewählt');
  return p;
}

/** Wochentag und Tageszeit: die Uhr wird einmal beim Öffnen des Bildschirms gelesen und nicht gespeichert */
export function useStoryTime(): TimeInfo {
  const { now } = useActions();
  const [time] = useState(() => timeOf(now()));
  return time;
}

/** Platzhalter für Story-Texte zum ausgewählten Profil, mit den Rängen aus den Spielregeln und der Zeit (`time`, sonst `useStoryTime`) */
export function useStoryVars(extra?: Record<string, string | number>, time?: TimeInfo): Record<string, string | number> {
  const p = useProfile();
  const ranks = useGame((s) => s.rules.rewards.ranks);
  const own = useStoryTime();
  return storyVars(p, ranks, extra, time ?? own);
}
