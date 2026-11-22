// Abzeichen: Titel und Kategorien.

import { isBadgeHidden, type BadgeCategory, type BadgeRule } from '../../domain/badges.ts';

/** Titel eines Abzeichens, wie das Kind ihn sehen darf: geheime erst, wenn es sie hat */
export function badgeTitleFor(badge: Pick<BadgeRule, 'title' | 'secret'>, earned: boolean): string {
  return isBadgeHidden(badge, earned) ? 'Geheimes Abzeichen' : badge.title;
}

/** Reihenfolge und Überschriften auf der Abzeichen-Seite */
export const BADGE_CATEGORIES: readonly { id: BadgeCategory; title: string }[] = [
  { id: 'fortschritt', title: 'Fortschritt' },
  { id: 'praezision', title: 'Präzision' },
  { id: 'ausdauer', title: 'Ausdauer' },
  { id: 'geheim', title: 'Geheim' },
];
