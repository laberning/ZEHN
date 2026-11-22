// Sterne, Erfahrungspunkte und Ränge – gemessen am eigenen Fortschritt, nicht an anderen.
// Die Zahlenwerte stehen in content/rewards.ts und kommen über GameRules herein.

import type { Gender, Profile } from './profile.ts';
import type { SessionResult } from './typing.ts';

export interface StarRules {
  /** Ab dieser Genauigkeit gibt es den zweiten Stern */
  accuracyForTwo: number;
  /** Dritter Stern: sehr genau UND schneller als der eigene Schnitt */
  accuracyForThree: number;
  /** Faktor gegenüber dem persönlichen Durchschnittstempo */
  speedFactorForThree: number;
}

export interface Rank {
  /** männliche Form; zugleich die Kennung (Auslöser `rank`) */
  title: string;
  /** weibliche Form */
  titleW: string;
  /** für Platzhalter in Story-Texten: {rang_<key>} */
  key: string;
  minXp: number;
}

/** Rang passend zum Profil: „Agentin“ oder „Agent“ */
export function rankName(rank: Rank, who: Pick<Profile, 'avatar'> | Gender): string {
  const g = typeof who === 'string' ? who : who.avatar.gender;
  return g === 'w' ? rank.titleW : rank.title;
}

export interface RewardRules {
  stars: StarRules;
  /** Aufsteigend nach minXp, der erste beginnt bei 0 */
  ranks: readonly Rank[];
  /** EP je Runde: ein Punkt pro `charsPerXp` Zeichen (höchstens `maxChars`), plus `perStar` je Stern über dem ersten */
  xp: { charsPerXp: number; maxChars: number; perStar: number };
  /** Aufwärmen zählt mit diesem Anteil */
  warmupXpFactor: number;
  /** Bonus für einen bestandenen Einsatz, Trost für einen Fehlversuch */
  examPassXp: number;
  examFailXp: number;
  /** Spielhalle: ein EP je `pointsPerXp` Punkte, höchstens `maxXp` */
  arcade: { pointsPerXp: number; maxXp: number };
  /** Neuer Tempo-Rekord zählt erst ab dieser Genauigkeit */
  recordMinAccuracy: number;
}

/**
 * @param personalAvgApm bisheriger Durchschnitt; null bei der ersten Übung
 */
export function starsFor(result: SessionResult, personalAvgApm: number | null, r: StarRules): 1 | 2 | 3 {
  if (result.accuracy < r.accuracyForTwo) return 1;
  const fastEnough = personalAvgApm === null || result.apm >= personalAvgApm * r.speedFactorForThree;
  return result.accuracy >= r.accuracyForThree && fastEnough ? 3 : 2;
}

/** Erfahrungspunkte: Fleiß (Zeichen) zählt, Genauigkeit gibt Bonus. */
export function xpFor(result: SessionResult, stars: 1 | 2 | 3, r: RewardRules['xp']): number {
  return Math.round(Math.min(result.length, r.maxChars) / r.charsPerXp) + (stars - 1) * r.perStar;
}

/** Erfahrungspunkte für ein Spielhallen-Spiel – bewusst knapp, die Aufträge bleiben das Hauptspiel. */
export function arcadeXp(score: number, r: RewardRules['arcade']): number {
  return Math.min(r.maxXp, Math.round(score / r.pointsPerXp));
}

export function rankFor(xp: number, ranks: readonly Rank[]): Rank {
  const first = ranks[0];
  if (!first) throw new Error('rankFor: keine Ränge');
  return ranks.findLast((r) => xp >= r.minXp) ?? first;
}

/** Der nächste Rang oder null, wenn der höchste erreicht ist */
export function nextRank(xp: number, ranks: readonly Rank[]): Rank | null {
  return ranks.find((r) => r.minXp > xp) ?? null;
}

/** Rang, nächster Rang und Anteil des Wegs dorthin (0..1; beim höchsten Rang 1) – für die EP-Leiste */
export function rankProgress(xp: number, ranks: readonly Rank[]): { rank: Rank; next: Rank | null; fraction: number } {
  const rank = rankFor(xp, ranks);
  const next = nextRank(xp, ranks);
  return { rank, next, fraction: next ? (xp - rank.minXp) / (next.minXp - rank.minXp) : 1 };
}
