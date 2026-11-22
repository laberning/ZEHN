// Verdrahtung: welcher Kurs, welche Abzeichen, Belohnungen und Medaillen-Schwellen gelten.

import { ARCADE_MEDALS } from '../content/arcadeGames.ts';
import { BADGES } from '../content/badges.ts';
import { COURSE, WELCOME_AFTER_DAYS } from '../content/course.ts';
import { REWARDS } from '../content/rewards.ts';
import { ACTS, storyOf } from '../content/story/acts.ts';
import type { GameRules } from '../domain/rules.ts';
import type { StoryContent } from '../domain/storyContent.ts';

export const RULES: GameRules = { course: COURSE, badges: BADGES, rewards: REWARDS, arcade: ARCADE_MEDALS, welcomeAfterDays: WELCOME_AFTER_DAYS };
/** Garderobe: Farben, Teile und Start-Avatar */
export { WARDROBE } from '../content/wardrobe.ts';

/** Story-Inhalte gebündelt (Szenen, Objekte, Dinge, Fälle, Bilderbuch, Beschriftungen, Fallakten) – liegt im Store, damit Tests eigene Sätze übergeben können */
export const STORY: StoryContent = storyOf(ACTS);
