// Katalog der Spielhallen-Spiele (Titel und Texte an einer Stelle).

import type { Medal, MedalThresholds } from '../domain/arcade/levels.ts';
import type { ArcadeGame } from '../domain/profile.ts';

interface ArcadeGameInfo {
  id: ArcadeGame;
  title: string;
  /** Kurztext auf der Karte im HQ */
  teaser: string;
  /** Erklärung auf dem Startbildschirm des Spiels */
  intro: string;
  rules: string;
  /** Wort für ein Level in diesem Spiel („Welle“, „Tresor“) */
  levelWord: string;
  /** Jubel, wenn Level n geschafft ist */
  cheer: (level: number) => string;
}

export const ARCADE_GAMES: readonly ArcadeGameInfo[] = [
  {
    id: 'regen',
    title: 'Buchstabenregen',
    teaser: 'Fang die fallenden Buchstaben und Wörter ab, bevor sie das Grundnetz treffen.',
    intro: 'Jemand lässt Buchstaben auf das Grundnetz von Bad Qwertz regnen! Tippe sie ab, bevor sie unten ankommen.',
    rules: 'Der Regen kommt in Wellen, jede Welle ist etwas schneller. Drei Treffer aufs Netz – dann ist die Runde zu Ende.',
    levelWord: 'Welle',
    cheer: (n) => `Welle ${n} geschafft!`,
  },
  {
    id: 'tresor',
    title: 'Tresorknacker',
    teaser: 'Tippe Codes fehlerfrei ab und knacke die Tresore des Buchstabendiebs.',
    intro: 'Im Tresor des Diebs liegen gestohlene Buchstaben! Tippe die Codes ab – fünf richtige Codes öffnen einen Tresor.',
    rules: 'Ein Tippfehler setzt den Code zurück, also lieber genau als hastig. Du hast 60 Sekunden.',
    levelWord: 'Tresor',
    cheer: (n) => `Tresor ${n} offen!`,
  },
];

/** Ab welchem geschafften Level es Bronze, Silber und Gold gibt (Regel: GameRules.arcade, verdrahtet in app/rules.ts) */
export const ARCADE_MEDALS: Record<ArcadeGame, MedalThresholds> = { regen: [3, 6, 9], tresor: [1, 2, 3] };

export function arcadeGame(id: ArcadeGame): ArcadeGameInfo {
  const g = ARCADE_GAMES.find((x) => x.id === id);
  if (!g) throw new Error(`Unbekanntes Spiel: ${id}`);
  return g;
}

const MEDAL_NAMES: Record<Medal, string> = { bronze: 'Bronze', silber: 'Silber', gold: 'Gold' };

/** Medaille als Stern und Wort: „★ Silber“ */
export const medalLabel = (m: Medal): string => `★ ${MEDAL_NAMES[m]}`;

/** Titel des Ergebnisses: Das Ende einer Runde ist ein Erfolg, sobald ein Level geschafft ist */
export const roundDoneText = (game: ArcadeGame, reached: number): string =>
  reached > 0 ? `Runde geschafft: ${arcadeGame(game).levelWord} ${reached}!` : 'Runde vorbei!';

/** Nächstes Ziel: „Silber ab Welle 6“ */
export const goalText = (game: ArcadeGame, goal: { medal: Medal; level: number } | null): string =>
  goal ? `${MEDAL_NAMES[goal.medal]} ab ${arcadeGame(game).levelWord} ${goal.level}` : 'Du hast Gold – mehr geht nicht!';
