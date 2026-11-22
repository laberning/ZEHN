// Geteiltes der Ansichten: Platzhalter für Story-Texte, Rang, wartende Geschenke und Hinweise, woher Dinge kommen.

import { findLesson } from '../../domain/course.ts';
import { agentTitle, type Profile } from '../../domain/profile.ts';
import type { GameRules } from '../../domain/rules.ts';
import { caseVisible, findCase } from '../../domain/cases.ts';
import { findBadge } from '../../domain/badges.ts';
import { badgeTitleFor } from '../../content/texts/badges.ts';
import { sceneMomentText, sourceHint } from '../../content/texts/items.ts';
import type { ItemSource } from '../../domain/items.ts';
import { findScene, type StoryScene } from '../../domain/scenes.ts';
import { rankFor, rankName, type Rank } from '../../domain/rewards.ts';
import { pendingGifts } from '../../domain/story.ts';
import type { StoryContent } from '../../domain/storyContent.ts';
import { NEUTRAL_TIME, timeVars, type TimeInfo } from '../../domain/daytime.ts';

export type HintWorld = Pick<StoryContent, 'scenes' | 'cases' | 'items'>;

/** Dinge, die verdient, aber noch nicht überreicht sind */
export const pendingGiftItems = (p: Profile, rules: GameRules, story: HintWorld): Set<string> => new Set(pendingGifts(p, story, rules).flatMap((s) => s.gives ?? []));

/** Wartet ein Geschenk (es kommt am Ende des nächsten Durchgangs)? */
export const giftWaiting = (p: Profile, rules: GameRules, story: HintWorld): boolean => pendingGifts(p, story, rules).length > 0;

/** Rang der Figur in passender Form („Anwärterin“) */
export const rankTitle = (p: Pick<Profile, 'xp' | 'avatar'>, rules: GameRules): string => rankName(rankFor(p.xp, rules.rewards.ranks), p);

/** Der Moment der Geschichte, in dem eine Szene etwas überreicht („am Ende von Auftrag 3“); stillgelegt heißt „später“ */
function sceneMoment(giver: StoryScene, p: Profile, rules: GameRules): string | undefined {
  if (giver.retired) return sceneMomentText({ kind: 'later' });
  const t = giver.trigger;
  switch (t.on) {
    case 'briefing':
    case 'stage':
    case 'mastered': {
      // Aufträge zählen je Akt (Akt = Modul)
      const { module } = findLesson(rules.course, t.lessonId);
      return sceneMomentText({ kind: t.on, lessonNo: module.lessons.findIndex((l) => l.id === t.lessonId) + 1, act: rules.course.modules.indexOf(module) + 1 });
    }
    case 'rank': {
      const rank = rules.rewards.ranks.find((r) => r.key === t.rank);
      return rank && sceneMomentText({ kind: 'rank', rankTitle: rankName(rank, p) });
    }
    case 'exam':
      return sceneMomentText({ kind: 'exam', act: rules.course.modules.findIndex((m) => m.id === t.moduleId) + 1 });
    default:
      return undefined;
  }
}

/**
 * Hinweise, woher Dinge kommen, solange man sie nicht hat: unterwegs (verdient, nicht überreicht), Abzeichen
 * (geheime bleiben verborgen), Extra-Fall (erst, wenn er dran ist) oder ein Moment der Geschichte.
 * Einmal je Ansicht bauen – die wartenden Geschenke werden dabei nur einmal berechnet.
 */
export function sourceHintsFor(p: Profile, rules: GameRules, story: HintWorld): (source: ItemSource, itemId?: string) => string {
  const pending = pendingGiftItems(p, rules, story);
  return (source, itemId) => {
    const rule = 'badge' in source ? findBadge(rules.badges, source.badge) : undefined;
    const fall = 'case' in source ? findCase(story, source.case) : undefined;
    const giver = 'scene' in source ? findScene(story, source.scene) : undefined;
    return sourceHint(source, {
      badgeTitle: rule && badgeTitleFor(rule, p.badges[rule.id] !== undefined),
      caseTitle: fall && caseVisible(p, rules, fall) ? fall.title : undefined,
      when: giver && sceneMoment(giver, p, rules),
      pending: !!itemId && pending.has(itemId),
    });
  };
}

/**
 * Platzhalter für Story-Texte; jeder Rang als {rang_<key>} in der Form passend zum Profil („Rekrutin“/„Rekrut“),
 * dazu {wochentag}, {jetzt}, {gruss} aus der Zeit (ohne Angabe: Dienstagmorgen)
 */
export function storyVars(p: Pick<Profile, 'firstName' | 'codename' | 'avatar'>, ranks: readonly Rank[], extra: Record<string, string | number> = {}, time: TimeInfo = NEUTRAL_TIME) {
  const rankVars = Object.fromEntries(ranks.map((r) => [`rang_${r.key}`, rankName(r, p)]));
  return { vorname: p.firstName, codename: p.codename, agent: agentTitle(p), ...rankVars, ...timeVars(time), ...extra };
}
