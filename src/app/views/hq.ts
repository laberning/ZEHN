// Ansicht des HQ: Missionskarte, Extra-Fälle, Hinweise, nächstes Geschenk. Rein, aus Profil und Regeln berechnet.

import { findLesson } from '../../domain/course.ts';
import { learnKeys } from '../../domain/keyboard.ts';
import { keyList, keyRuleText, lessonTodo } from '../../domain/format.ts';
import type { Profile } from '../../domain/profile.ts';
import type { ExamState } from '../../domain/exam.ts';
import { activeLessonId, examBegun, examDue, isExamUnlocked, isLessonUnlocked, isModuleDone, lessonStatus, safeKeys, storyEnd, type StoryEnd } from '../../domain/progress.ts';
import { hasSeen, seenKey } from '../../domain/seen.ts';
import { objectPercent } from '../../domain/storyObject.ts';
import type { GameRules } from '../../domain/rules.ts';
import { caseSolved, caseVisible, type ExtraCase } from '../../domain/cases.ts';
import { fallaktenScratched } from '../../domain/book.ts';
import { findBadge, isBadgeHidden } from '../../domain/badges.ts';
import { briefingSeen } from '../navigation.ts';
import { examStatusLabel } from '../../content/texts/exam.ts';
import { caseCardHint } from '../../content/texts/hq.ts';
import { nextGiftText } from '../../content/texts/items.ts';
import { newItems, ownedItems } from '../../domain/items.ts';
import { nextRank, rankName } from '../../domain/rewards.ts';
import { nextSideScene, pendingGifts, unread } from '../../domain/story.ts';
import { isLogged, type StoryScene } from '../../domain/scenes.ts';
import type { StoryContent } from '../../domain/storyContent.ts';
import type { TimeInfo } from '../../domain/daytime.ts';
import { incomingMessage, type ChatMessage } from '../../domain/chat.ts';

export interface HqView {
  /** Aktueller Auftrag (erster nicht geschaffter) */
  current: string | null;
  /** Modul, dessen Einsatz ansteht */
  examDueId: string | null;
  /** Neue Dinge (Kleidung und Gadgets), noch nicht in Garderobe oder Koffer angesehen */
  freshItems: number;
  arcadeOpen: boolean;
  /** „Noch zu tun“ für den aktuellen Auftrag (null, wenn nichts offen ist) */
  todo: string | null;
  /** Finger-Regel der neuen Tasten des aktuellen Auftrags („D – linker Mittelfinger · K – rechter Mittelfinger“); null, solange das Briefing noch nicht gesehen ist */
  keyRule: string | null;
  /** „Nächstes Geschenk“: wartet eines, bringt der aktuelle Auftrag eines, oder der nächste Rang (null: nichts in Sicht) */
  nextGift: string | null;
  /** Ende der Geschichte: nach dem Einsatz des letzten Moduls, sonst null (Karte „Bennos Tippstunde“ unter dem letzten Akt) */
  storyEnd: StoryEnd | null;
  /** Ungelesene Szenen im Agentenfunk */
  funkNew: number;
  /** Älteste ungelesene Nachricht – die Benachrichtigung im HQ */
  incoming: ChatMessage | null;
  /** Missionskarte: je Modul die Aufträge und der Einsatz */
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      /** Neue Tasten als Text („F J“) */
      keys: string;
      unlocked: boolean;
      /** Der aktuelle Auftrag (Enter startet ihn) */
      current: boolean;
      mastered: boolean;
      stars: number;
      /** Wie sicher die neuen Tasten sitzen (0..1); null, wenn gesperrt oder geschafft */
      progress: number | null;
    }[];
    exam: { open: boolean; outcome: ExamState['outcome'] | undefined; status: string };
    /** Einsatz bestanden oder durch die Hintertür – die Fallakte des Akts ist offen */
    done: boolean;
    /** Die Fallakte ist da, wurde aber noch nie geöffnet („Neu“) */
    fallakteNew: boolean;
    /** Die Fallakte ist da, aber zerkratzt (Tiefpunkt der Geschichte, abgeleitet aus dem Story-Log): der Knopf zeigt „zerkratzt“ statt „Neu“ */
    fallakteScratched: boolean;
    /** Der Akt ist abgeschlossen und hat noch ungesehene Nebenszenen, die ein Wiederholen bringt */
    moreSides: boolean;
  }[];
  /** Extra-Fälle, die dran sind: spielbare zuerst (gelöste bleiben wiederholbar), dann gesperrte (Gadget fehlt) */
  extra: {
    id: string;
    title: string;
    solved: boolean;
    /** Gadget fehlt: Karte gesperrt, der Hinweis zeigt den Weg */
    locked: boolean;
    hint: string;
  }[];
}

function extraCards(p: Profile, rules: GameRules, story: Pick<StoryContent, 'items' | 'cases'>, owned: ReadonlySet<string>, pending: ReadonlySet<string>): HqView['extra'] {
  const card = (c: ExtraCase) => {
    const locked = !!c.needs && !owned.has(c.needs);
    const item = c.needs ? story.items.find((i) => i.id === c.needs) : undefined;
    const rule = item && 'badge' in item.source ? findBadge(rules.badges, item.source.badge) : undefined;
    // Ein geheimes Abzeichen verrät sich auch auf der Fall-Karte nicht
    const badge = rule && !isBadgeHidden(rule, p.badges[rule.id] !== undefined) ? rule : undefined;
    const solved = caseSolved(p, c.id);
    // Das Gadget aus dem Fall hilft nur im Einsatz-Intro – also nur, solange der Einsatz noch nie begonnen wurde
    const { module } = findLesson(rules.course, c.fromLesson);
    const tip = !isModuleDone(p, module.id) && !examBegun(p, module.id);
    return { id: c.id, title: c.title, solved, locked, hint: caseCardHint({ gadget: item?.name ?? '', solved, locked, badge, tip, pending: !!c.needs && pending.has(c.needs) }) };
  };
  const cards = story.cases.filter((c) => caseVisible(p, rules, c)).map(card);
  return [...cards.filter((c) => !c.locked), ...cards.filter((c) => c.locked)];
}

function missionMap(p: Profile, rules: GameRules, story: Pick<StoryContent, 'scenes' | 'fallaktenDamage'>, current: string | null): HqView['modules'] {
  return rules.course.modules.map((m) => {
    const open = isExamUnlocked(p, m);
    const outcome = p.exams[m.id]?.outcome;
    const done = isModuleDone(p, m.id);
    return {
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l) => {
        const lp = p.lessons[l.id];
        const unlocked = isLessonUnlocked(p, rules.course, l.id);
        const mastered = lp?.mastered ?? false;
        return {
          id: l.id,
          title: l.title,
          keys: keyList(learnKeys(l.newKeys)),
          unlocked,
          current: l.id === current,
          mastered,
          stars: lp?.bestStars ?? 0,
          progress: unlocked && !mastered ? objectPercent(lp) : null,
        };
      }),
      exam: { open, outcome, status: examStatusLabel(outcome, open) },
      done,
      fallakteNew: done && !hasSeen(p, seenKey.fallakte(m.id)),
      fallakteScratched: done && fallaktenScratched(p, story),
      moreSides: done && nextSideScene(p, story, rules, m.lessons[0]!.id, { wholeModule: true }) !== null,
    };
  });
}

export function hqView(p: Profile, rules: GameRules, story: Pick<StoryContent, 'scenes' | 'items' | 'cases' | 'fallaktenDamage'>, time?: TimeInfo): HqView {
  // ein Auftrag im nächsten Modul ist erst nach dem Einsatz davor dran (bis dahin steht der Einsatz an)
  const current = activeLessonId(p, rules.course);
  const owned = ownedItems(p, story);
  const waiting = pendingGifts(p, story, rules);
  return {
    current,
    examDueId: examDue(p, rules.course)?.id ?? null,
    freshItems: newItems(p, story.items, owned).length,
    arcadeOpen: safeKeys(p, rules.course).length > 0,
    storyEnd: storyEnd(p, rules.course),
    funkNew: unread(p, story).length,
    incoming: incomingMessage(p, story, undefined, time),
    modules: missionMap(p, rules, story, current),
    extra: extraCards(p, rules, story, owned, new Set(waiting.flatMap((g) => g.gives ?? []))),
    keyRule: current && briefingSeen(p, story, current) ? keyRuleText(learnKeys(findLesson(rules.course, current).lesson.newKeys)) : null,
    todo: current ? lessonTodo(lessonStatus(p, rules.course, current)) : null,
    nextGift: waiting.length ? nextGiftText({ kind: 'waiting' }) : nextGift(p, rules, story, current),
  };
}

/**
 * Vorfreude statt Überraschungsflut (wenn gerade nichts wartet): ein Geschenk am Ende des aktuellen Auftrags
 * (Geschichte oder Abzeichen des Auftrags), sonst der nächste Rang mit Geschenk.
 * Nichts zu Agententagen (Story-Regel 11: nichts, was zurücklockt).
 */
function nextGift(p: Profile, rules: GameRules, story: Pick<StoryContent, 'scenes'>, current: string | null): string | null {
  const open = (s: StoryScene) => s.gift && !s.retired && !isLogged(p, s.id);
  if (current) {
    const lessonBadges = rules.badges.filter((b) => b.lessonId === current).map((b) => b.id);
    const atEnd = (t: StoryScene['trigger']) => (t.on === 'mastered' && t.lessonId === current) || (t.on === 'badge' && lessonBadges.includes(t.badgeId));
    if (story.scenes.some((s) => open(s) && atEnd(s.trigger))) return nextGiftText({ kind: 'lesson' });
  }
  const next = nextRank(p.xp, rules.rewards.ranks);
  const rankGift = next && story.scenes.some((s) => open(s) && s.trigger.on === 'rank' && s.trigger.rank === next.key);
  return next && rankGift ? nextGiftText({ kind: 'rank', xp: next.minXp - p.xp, rankTitle: rankName(next, p) }) : null;
}
