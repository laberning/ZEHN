// Spielregeln als Daten: Kurs, Abzeichen, Belohnungen und Medaillen-Schwellen der Spielhalle. Die Werte stehen in content/, verdrahtet in app/rules.ts.

import type { MedalThresholds } from './arcade/levels.ts';
import type { BadgeRule } from './badges.ts';
import type { Course } from './course.ts';
import type { ArcadeGame } from './profile.ts';
import type { RewardRules } from './rewards.ts';

export interface GameRules {
  course: Course;
  badges: readonly BadgeRule[];
  rewards: RewardRules;
  /** Spielhalle: ab welchem geschafften Level es Bronze, Silber und Gold gibt */
  arcade: Readonly<Record<ArcadeGame, MedalThresholds>>;
  /** Ab so vielen Kalendertagen Pause begrüßt das HQ mit „Willkommen zurück“ */
  welcomeAfterDays: number;
}
