// Extra-Fälle: kleine Fälle neben der Hauptgeschichte. Sie brauchen (meist) ein Gadget und einen weit genug gespielten Kurs,
// bringen beim ersten Lösen (meist) ein neues Gadget und zählen wie ein Training fürs Tastenprofil.

import { lessonOrder } from './course.ts';
import { ownedItems, type OwnedWorld } from './items.ts';
import type { Profile } from './profile.ts';
import { begunLessonId } from './progress.ts';
import type { GameRules } from './rules.ts';
import { isLogged, logScenes, sceneFor, type StoryScene } from './scenes.ts';
import type { PictureId } from './storyObject.ts';

export interface ExtraCase {
  id: string;
  title: string;
  /** ab diesem Auftrag (begonnen oder geschafft) */
  fromLesson: string;
  /** erst nach dieser Szene (z. B. Junas erster Nachricht) */
  afterScene?: string;
  /** erst nachdem dieser Fall gelöst ist (feste Reihenfolge, z. B. die Fälle der Woche) */
  afterCase?: string;
  /** Gadget-ID, ohne das der Fall nicht angeboten wird; ohne: der Fall braucht keins */
  needs?: string;
  /** Überschrift über dem Tipptext, z. B. „Seifenblasen fangen“ */
  frame: string;
  /** Die Lösung – wird im Outro als Karte angezeigt, nie getippt */
  reveal: { title: string; text: string };
  /** Gadget-ID, das es beim ersten Lösen gibt; ohne: der Fall bringt keins */
  gives?: string;
  /** Bild des Falls: in der Ankündigung und beim Tippen neben dem Gadget */
  picture: PictureId;
}

/** Was `caseAvailable` an Inhalten braucht: dasselbe wie `ownedItems` (das Story-Bündel genügt) */
type CaseWorld = OwnedWorld;

/** Was `solveCase` an Inhalten braucht */
interface SolveWorld {
  scenes: readonly StoryScene[];
  cases: readonly ExtraCase[];
}

/** Ist der Auftrag für Extra-Fälle erreicht, also begonnen oder geschafft? */
export function lessonReached(p: Pick<Profile, 'lessons' | 'seen'>, rules: GameRules, lessonId: string): boolean {
  const at = begunLessonId(p, rules.course);
  const order = lessonOrder(rules.course);
  return at !== null && order.indexOf(lessonId) <= order.indexOf(at);
}

export const findCase = (story: { cases: readonly ExtraCase[] }, id: string): ExtraCase | undefined => story.cases.find((c) => c.id === id);

/** Der Fall ist dran: Auftrag erreicht (begonnen oder geschafft), Vorbedingungs-Szene ausgelöst, vorheriger Fall gelöst – das Gadget kann noch fehlen */
export function caseVisible(p: Profile, rules: GameRules, c: ExtraCase): boolean {
  if (!lessonReached(p, rules, c.fromLesson)) return false;
  if (c.afterScene && !isLogged(p, c.afterScene)) return false;
  return !c.afterCase || caseSolved(p, c.afterCase);
}

/** Wird der Fall angeboten? Er ist dran und das Gadget (falls er eins braucht) ist im Besitz */
export function caseAvailable(p: Profile, story: CaseWorld, rules: GameRules, c: ExtraCase): boolean {
  return (!c.needs || ownedItems(p, story).has(c.needs)) && caseVisible(p, rules, c);
}

export const caseSolved = (p: Pick<Profile, 'cases'>, caseId: string): boolean => p.cases[caseId] !== undefined;

/**
 * Fall lösen: nur beim ersten Mal (eine Wiederholung zählt nur als Training) – mit Zeitstempel und Outro im Log.
 * `outro`: die Szene, die jetzt abgespielt wird. Unbekannte Fälle ändern nichts.
 */
export function solveCase(p: Profile, story: SolveWorld, caseId: string, now: number): { profile: Profile; outro?: string } {
  if (!findCase(story, caseId) || caseSolved(p, caseId)) return { profile: p };
  const solved: Profile = { ...p, cases: { ...p.cases, [caseId]: now } };
  const outro = sceneFor(story, 'case', (t) => t.caseId === caseId && t.part === 'outro');
  return outro ? { profile: logScenes(solved, [outro.id], now), outro: outro.id } : { profile: solved };
}
