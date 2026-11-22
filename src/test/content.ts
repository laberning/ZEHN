// Gemeinsame Hilfen der Inhaltstests (src/content/course.test.ts, story.test.ts, rewards.test.ts, akt1.test.ts).
// Die Regeln laufen über alle Akte, auch die vorbereiteten (STAGED_ACTS); was je Akt verschieden ist, steht im Prüfprofil `check` des Bündels.

import type { Course } from '../domain/course.ts';
import { lessonOrder } from '../domain/course.ts';
import type { ChatId, Line } from '../domain/dialog.ts';
import type { StoryScene } from '../domain/scenes.ts';
import { COURSE } from '../content/course.ts';
import { ACTS, STAGED_ACTS, storyOf } from '../content/story/acts.ts';
import { REWARD_SCENES } from '../content/story/rewardScenes.ts';
import { TRAINING } from '../content/story/training/index.ts';
import type { LessonStory } from '../domain/book.ts';

/** Alle Akte, auch die vorbereiteten */
export const ALL_ACTS = [...ACTS, ...STAGED_ACTS];

/**
 * Akte mit fertigen Szenen. Ein vorbereiteter Akt im Aufbau (Gerüst: Modul, Wörter, Objekte, Einsatz) hat noch keine Szenen
 * und keine Fallakte; die Prüfungen, die sie brauchen (Briefing, Stufen, Abschluss, Szene nach dem Einsatz, Fallakte), laufen
 * über diese Liste. Alles andere prüfen die Tests für `ALL_ACTS`.
 */
export const BUILT_ACTS = ALL_ACTS.filter((a) => a.chat.length > 0);

/** Kurs mit den Modulen aller Akte (COURSE kennt nur die Akte im Spiel) */
export const ALL_COURSE: Course = { ...COURSE, modules: ALL_ACTS.map((a) => a.module) };
export const ALL_LESSONS = lessonOrder(ALL_COURSE);

/** Story-Bündel aus allen Akten, auch den vorbereiteten: für Bildschirme und Ansichten vorbereiteter Akte (`renderApp({ rules: { ...RULES, course: ALL_COURSE }, story: ALL_STORY })`) */
export const ALL_STORY = storyOf(ALL_ACTS);

/** Szenen, die zur Geschichte eines Akts gehören */
export const actScenes = (act: (typeof ALL_ACTS)[number]): StoryScene[] => [...act.chat, ...act.side, ...act.rewards, ...act.caseScenes];

/** Szenen aller Akte, dazu das Training und die akt-neutralen Belohnungs-Szenen */
export const ALL_SCENES: readonly StoryScene[] = [...ALL_ACTS.flatMap(actScenes), ...TRAINING.scenes, ...TRAINING.caseScenes, ...REWARD_SCENES];
export const ALL_CASES = [...ALL_ACTS.flatMap((a) => a.cases), ...TRAINING.cases];
export const OBJECTS = ALL_ACTS.flatMap((a) => a.objects);
export const LESSON_STORY: Record<string, LessonStory> = Object.assign({}, ...ALL_ACTS.map((a) => a.book.lessons));
export const EXAM_STORY = Object.fromEntries(ALL_ACTS.map((a) => [a.module.id, a.book.exam]));

/** Alle Zeilen einer Szene samt wirksamem Chat (auch Antworten und Reaktionen – die stehen im Chat der fragenden Zeile) */
export function sceneLines(lines: readonly Line[], chat: ChatId): { line: Line; chat: ChatId; where: string; asks: boolean }[] {
  return lines.flatMap((line) => {
    const here = line.chat ?? chat;
    return [
      { line, chat: here, where: line.text, asks: !!line.choices?.length },
      ...(line.choices ?? []).flatMap((c) => [{ line: { speaker: 'player', text: c.text } as Line, chat: here, where: c.id, asks: false }, ...sceneLines(c.reply ?? [], here)]),
    ];
  });
}

export const isMain = (s: { trigger: { on: string } }) => ['briefing', 'stage', 'mastered', 'exam'].includes(s.trigger.on);

/** Rang eines Abschlusses im Kurs aller Akte (Briefing < Stufen < Abschluss je Auftrag) */
export const masteredRank = (lessonId: string): number => ALL_LESSONS.indexOf(lessonId) * 10 + 9;

/** Zeitliche Lage einer Haupt-Szene im Kurs (Briefing < Stufen < Abschluss je Auftrag; Einsatz nach dem Abschluss des letzten Auftrags seines Moduls) */
export function mainRank(s: StoryScene): number {
  const t = s.trigger;
  // der Einsatz kommt nach dem Abschluss des letzten Auftrags seines Moduls, noch vor dem Briefing des nächsten
  if (t.on === 'exam') return masteredRank(ALL_ACTS.find((a) => a.module.id === t.moduleId)?.module.lessons.at(-1)?.id ?? '');
  if (t.on !== 'briefing' && t.on !== 'stage' && t.on !== 'mastered') return -1;
  return ALL_LESSONS.indexOf(t.lessonId) * 10 + (t.on === 'briefing' ? 0 : t.on === 'stage' ? 1 + t.at * 4 : 9);
}
