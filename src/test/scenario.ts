// Szenario-Helfer: spielen Abläufe mit dem ECHTEN Kurs über Store-Aktionen durch.
// Gedacht für Tests, die „ein Kind spielt Akt 1“ nachstellen (siehe docs/technik/tests.md).

import type { GameStore } from '../app/store.ts';
import { COURSE } from '../content/course.ts';
import { ownedItems } from '../domain/items.ts';
import { learnerOf, planRounds, roundTyping, runInfo } from '../domain/mission.ts';
import type { Profile } from '../domain/profile.ts';
import { findScene } from '../domain/scenes.ts';
import type { StoryContent } from '../domain/storyContent.ts';
import { examCanUseBackdoor } from '../domain/progress.ts';
import { startTyping, typeChar, type TypingState } from '../domain/typing.ts';

/** Ein fehlerfrei getippter Text (`msPerKey` Millisekunden je Anschlag, Start bei `start`) */
export function cleanTyping(text: string, msPerKey = 400, start = 0): TypingState {
  let t = startTyping(text);
  [...text].forEach((ch, i) => (t = typeChar(t, ch, start + i * msPerKey).state));
  return t;
}

const profileOf = (store: GameStore) => {
  const p = store.getState().current;
  if (!p) throw new Error('scenario: kein Profil ausgewählt');
  return p;
};

/**
 * Ein Durchgang (Aufwärmen + Übungen) eines Auftrags, jede Runde fehlerfrei – wie die Mission:
 * Länge des Logs und „Auftrag noch offen“ werden am Anfang festgehalten, die letzte Runde wertet die Story aus.
 * Liefert die Belohnungen je Runde (`story` steht an der letzten).
 */
export async function playRun(store: GameStore, lessonId: string, msPerKey = 400) {
  const s = store.getState();
  const rounds = planRounds(COURSE, lessonId);
  const run = runInfo(profileOf(store), COURSE, lessonId);
  const rewards = [];
  for (const [i, round] of rounds.entries()) {
    const typing = roundTyping(COURSE, lessonId, round, learnerOf(profileOf(store)), s.seed());
    rewards.push(await s.recordRound(lessonId, round.kind, cleanTyping(typing.text, msPerKey), { ...run, last: i === rounds.length - 1 }));
  }
  return rewards;
}

/** Wiederholt Durchgänge, bis der Auftrag geschafft ist (höchstens 10). */
export async function playLessonToMastery(store: GameStore, lessonId: string, msPerKey = 400): Promise<number> {
  for (let runs = 1; runs <= 10; runs++) {
    await playRun(store, lessonId, msPerKey);
    if (profileOf(store).lessons[lessonId]?.mastered) return runs;
  }
  throw new Error(`scenario: ${lessonId} nach 10 Durchgängen nicht geschafft`);
}

/** Einsatz so lange nicht bestehen, bis die Hintertür offen ist, dann nehmen. */
export async function failExamUntilBackdoor(store: GameStore, moduleId: string): Promise<void> {
  const s = store.getState();
  for (let i = 0; i < 10 && !examCanUseBackdoor(profileOf(store), moduleId); i++) {
    await s.recordExam(moduleId, startTyping('asdf jklö asdf'), 60_000);
  }
  if (!examCanUseBackdoor(profileOf(store), moduleId)) throw new Error('scenario: Hintertür bleibt zu');
  await s.takeBackdoor(moduleId);
}

/** Überreichte Geschenke im Log (Szenen mit `gift`), in Reihenfolge */
export const giftsInLog = (p: Profile, story: Pick<StoryContent, 'scenes'>): string[] => p.story.log.filter((l) => findScene(story, l.id)?.gift).map((l) => l.id);

/** Haupt-Szenen der Geschichte (Briefing, Stufen, Abschluss, Einsatz) ohne die Geschenke mit demselben Auslöser */
export const mainSceneIds = (story: Pick<StoryContent, 'scenes'>): string[] =>
  story.scenes.filter((x) => !x.gift && ['briefing', 'stage', 'mastered', 'exam'].includes(x.trigger.on)).map((x) => x.id);

/**
 * Spielt Durchgänge, bis `itemId` überreicht ist (höchstens `max`). Liefert die Zahl der Durchgänge und die meisten
 * Geschenke, die in einem einzigen Durchgang kamen (Belohnungstakt: höchstens eines).
 */
export async function playUntilOwned(store: GameStore, itemId: string, lessonId: string, max = 20): Promise<{ runs: number; maxGiftsPerRun: number }> {
  const s = () => store.getState();
  let maxGiftsPerRun = 0;
  for (let runs = 0; runs < max; runs++) {
    if (ownedItems(profileOf(store), s().story).has(itemId)) return { runs, maxGiftsPerRun };
    const before = giftsInLog(profileOf(store), s().story).length;
    await playRun(store, lessonId);
    maxGiftsPerRun = Math.max(maxGiftsPerRun, giftsInLog(profileOf(store), s().story).length - before);
  }
  throw new Error(`scenario: ${itemId} kam nach ${max} Durchgängen nicht`);
}

