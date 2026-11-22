// Abzeichen: Regel-Typen und Vergabe. Die konkreten Abzeichen stehen in content/badges.ts.

import type { Medal } from './arcade/levels.ts';
import type { ArcadeGame, ExerciseKind, Profile } from './profile.ts';
import type { SessionResult } from './typing.ts';

/** Was ist gerade passiert? Abzeichen-Regeln prüfen den Spielstand NACH dem Ereignis. */
export interface BadgeEvent {
  kind: ExerciseKind | 'backdoor' | 'arcade';
  arcade?: { game: ArcadeGame; score: number; count: number; level: number; medal: Medal | null };
  lessonId?: string;
  moduleId?: string;
  result?: SessionResult;
  stars?: number;
  examPassed?: boolean;
}

export type BadgeCategory = 'fortschritt' | 'praezision' | 'ausdauer' | 'geheim';

export interface BadgeRule {
  id: string;
  title: string;
  description: string;
  /** Kurzes Symbol für die Plakette (nur Text-Zeichen, keine Emoji) */
  icon: string;
  category: BadgeCategory;
  /** Geheime Abzeichen zeigen ihre Beschreibung erst nach dem Freischalten */
  secret?: boolean;
  /** Nur zur Anzeige: Das Abzeichen kommt mit dem Abschluss dieses Auftrags („Am Ende dieses Auftrags wartet ein Geschenk“) */
  lessonId?: string;
  check: (p: Profile, e: BadgeEvent) => boolean;
}

/** Vergibt alle neu erfüllten Abzeichen. */
export function awardBadges(p: Profile, event: BadgeEvent, rules: readonly BadgeRule[], now: number): { profile: Profile; newBadges: string[] } {
  const badges = { ...p.badges };
  const newBadges: string[] = [];
  for (const b of rules) {
    if (!badges[b.id] && b.check(p, event)) {
      badges[b.id] = now;
      newBadges.push(b.id);
    }
  }
  return { profile: newBadges.length ? { ...p, badges } : p, newBadges };
}

export function findBadge(badges: readonly BadgeRule[], id: string): BadgeRule | undefined {
  return badges.find((b) => b.id === id);
}

/** Geheime Abzeichen verraten Symbol, Titel und Beschreibung erst, wenn das Kind sie hat */
export const isBadgeHidden = (badge: Pick<BadgeRule, 'secret'>, earned: boolean): boolean => !!badge.secret && !earned;
