// Gemeinsamer Ablauf der Spielhallen-Spiele: Level, Medaillen und Startlevel.
// Ein Spiel liefert nur "welches Level wurde zuletzt geschafft" und seine Schwellen (content/arcadeGames.ts).

export type Medal = 'bronze' | 'silber' | 'gold';

/** Medaillen vom schlechtesten zum besten Rang */
export const MEDALS: readonly Medal[] = ['bronze', 'silber', 'gold'];

/** Ab welchem geschafften Level es Bronze, Silber und Gold gibt */
export type MedalThresholds = readonly [bronze: number, silber: number, gold: number];

/** Beste Medaille für ein geschafftes Level (null: noch keine) */
export function medalFor(level: number, thresholds: MedalThresholds): Medal | null {
  let medal: Medal | null = null;
  MEDALS.forEach((m, i) => {
    if (level >= thresholds[i]!) medal = m;
  });
  return medal;
}

/** Nächste Medaille, die man noch holen kann, und das Level dafür (null: schon Gold) */
export function nextGoal(level: number, thresholds: MedalThresholds): { medal: Medal; level: number } | null {
  const i = MEDALS.findIndex((_, k) => level < thresholds[k]!);
  return i < 0 ? null : { medal: MEDALS[i]!, level: thresholds[i]! };
}

/** Die besseren von zwei Medaillen (null zählt als keine) */
export function betterMedal(a: Medal | null, b: Medal | null): Medal | null {
  const rank = (m: Medal | null) => (m ? MEDALS.indexOf(m) : -1);
  return rank(a) >= rank(b) ? a : b;
}

/** Startlevel, die man wählen darf: 1 bis zum höchsten schon geschafften (mindestens 1) */
export const startLevels = (bestLevel: number): number[] => Array.from({ length: Math.max(1, bestLevel) }, (_, i) => i + 1);

/**
 * Zuletzt geschafftes Level einer Runde: `current` ist das Level, an dem man gerade spielt, `start` das gewählte Startlevel.
 * Die durch den Start übersprungenen Level zählen als geschafft (man hat sie schon früher erreicht, sonst dürfte man dort
 * nicht starten): Wer bei Level 4 startet und gleich verliert, hat Level 3; wer Level 4 besteht, hat Level 4.
 */
export const levelsDone = (start: number, current: number): number => Math.max(start, current) - 1;
