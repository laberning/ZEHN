// Story-Kern: Szenen, Auslöser, Log, Lesestand und Nebenszenen (Story-Objekte: storyObject.ts).
// Reine Funktionen. Die Texte stehen in content/story/; gespeichert wird in app/.

import type { ChatId, Line } from './dialog.ts';
import { lessonOrder } from './course.ts';
import { caseAvailable, findCase } from './cases.ts';
import type { Profile } from './profile.ts';
import { isModuleDone } from './progress.ts';
import type { GameRules } from './rules.ts';
import { findScene, isLogged, logScenes, type StoryScene, type Trigger } from './scenes.ts';
import { hasSeen, seenKey } from './seen.ts';
import type { StoryContent } from './storyContent.ts';

// ---------- Auslösen ----------

type DueWorld = Pick<StoryContent, 'scenes' | 'items' | 'cases'>;

function isDue(t: Trigger, p: Profile, rules: GameRules, story: DueWorld): boolean {
  switch (t.on) {
    case 'briefing':
      return !!p.lessons[t.lessonId] || hasSeen(p, seenKey.briefing(t.lessonId));
    case 'stage':
      return (p.lessons[t.lessonId]?.best ?? 0) >= t.at;
    case 'mastered':
      return p.lessons[t.lessonId]?.mastered === true;
    case 'exam':
      return isModuleDone(p, t.moduleId);
    case 'badge':
      return p.badges[t.badgeId] !== undefined;
    case 'rank': {
      const ranks = rules.rewards.ranks;
      const at = ranks.findIndex((r) => r.key === t.rank);
      // der erste Rang ist der Startrang und löst nie etwas aus
      return at > 0 && p.xp >= ranks[at]!.minXp;
    }
    case 'training':
      return p.history.filter((e) => e.kind === 'tippstunde').length >= t.round;
    case 'caseOpen': {
      const c = findCase(story, t.caseId);
      return !!c && caseAvailable(p, story, rules, c);
    }
    case 'case':
    case 'side':
      return false;
  }
}

/** Wie fällige Szenen ausgeliefert werden */
export interface DueOptions {
  /** ein Geschenk darf mit (nur am Ende eines Durchgangs) */
  gift?: boolean;
  /** Nachholen beim Laden eines älteren Spielstands: ohne Bremse, mit Szenen, die erst nach seiner Version stillgelegt wurden */
  catchUp?: boolean;
}

/** Fällig und noch nicht im Log; stillgelegte nur beim Nachholen eines Spielstands, der älter ist als die Stilllegung */
function openDue(p: Profile, story: DueWorld, rules: GameRules, catchingUp = false): StoryScene[] {
  const live = (s: StoryScene) => !s.retired || (catchingUp && p.story.v < s.retired.since);
  return story.scenes.filter((s) => live(s) && !isLogged(p, s.id) && isDue(s.trigger, p, rules, story));
}

/**
 * Alle erfüllten Zustands-Auslöser, die noch nicht im Log stehen, in Listenreihenfolge.
 * Geschenke (`gift`) kommen nur mit `{ gift: true }`, und dann höchstens eines – das erste in der Liste (Vorrang).
 */
export function dueScenes(p: Profile, story: DueWorld, rules: GameRules, opts: DueOptions = {}): string[] {
  const due = openDue(p, story, rules, opts.catchUp);
  if (opts.catchUp) return due.map((s) => s.id);
  const gift = opts.gift ? due.find((s) => s.gift) : undefined;
  return due.filter((s) => !s.gift || s === gift).map((s) => s.id);
}

/** Geschenke, die verdient, aber noch nicht überreicht sind (sie kommen am Ende des nächsten Durchgangs) */
export const pendingGifts = (p: Profile, story: DueWorld, rules: GameRules): StoryScene[] => openDue(p, story, rules).filter((s) => s.gift);

/**
 * Löst aus, bis nichts mehr fällig ist – ein überreichtes Gadget kann z. B. die Ankündigung seines Extra-Falls
 * fällig machen. Mit `gift` kommt über alle Durchläufe höchstens ein Geschenk.
 */
export function settleStory(p: Profile, story: DueWorld, rules: GameRules, now: number, gift = false): Profile {
  let cur = p;
  let giftLeft = gift;
  // Ketten sind kurz (Geschenk → Ankündigung); die Grenze schützt nur vor Endlosschleifen
  for (let i = 0; i < 4; i++) {
    const due = dueScenes(cur, story, rules, { gift: giftLeft });
    if (!due.length) break;
    if (due.some((id) => findScene(story, id)?.gift)) giftLeft = false;
    cur = logScenes(cur, due, now);
  }
  return cur;
}

export function markRead(p: Profile, ids: readonly string[]): Profile {
  const add = ids.filter((id) => !p.story.read.includes(id));
  return add.length ? { ...p, story: { ...p.story, read: [...p.story.read, ...new Set(add)] } } : p;
}

/**
 * Die gewählte Antwort einer Szene merken (der Reihe nach, eine je Auswahlstelle).
 * `restart`: die erste Wahl eines neuen Durchlaufs – frühere Antworten (abgebrochen, Szene neu gespielt) fallen weg.
 */
export function pick(p: Profile, sceneId: string, choiceId: string, restart = false): Profile {
  const old = restart ? [] : (p.story.picks[sceneId] ?? []);
  return { ...p, story: { ...p.story, picks: { ...p.story.picks, [sceneId]: [...old, choiceId] } } };
}

/** Chats, in denen eine Szene Zeilen hat (ihr Standard-Chat und die Chats einzelner Zeilen) */
export function chatsOf(s: StoryScene): ChatId[] {
  const set = new Set<ChatId>([s.chat]);
  const walk = (lines: readonly Line[]) =>
    lines.forEach((l) => {
      if (l.chat) set.add(l.chat);
      l.choices?.forEach((c) => c.reply && walk(c.reply));
    });
  walk(s.lines);
  return [...set];
}

/** Ausgelöste, aber noch nicht gelesene Szenen in Log-Reihenfolge, optional nur eines Chats */
export function unread(p: Profile, story: Pick<StoryContent, 'scenes'>, chat?: ChatId): string[] {
  return p.story.log
    .map((l) => l.id)
    .filter((id) => {
      if (p.story.read.includes(id)) return false;
      const scene = findScene(story, id);
      return !!scene && (!chat || chatsOf(scene).includes(chat));
    });
}

/**
 * Alles, was nach dem Spielstand schon fällig wäre, gilt als ausgelöst und gelesen (alte Spielstände, keine Flut).
 * Was schon im Log steht, behält seinen Lesestand – das Kind hat es noch vor sich.
 */
export function catchUp(p: Profile, story: DueWorld, rules: GameRules): Profile {
  // ohne Bremse: Wer etwas schon verdient hat, verliert es durch das Nachholen nicht
  const due = dueScenes(p, story, rules, { catchUp: true });
  return markRead(logScenes(p, due, 0), due);
}

// ---------- Nebenszenen ----------

type Side = Extract<Trigger, { on: 'side' }>;
interface SideScene {
  scene: StoryScene;
  trigger: Side;
}

/** Optionen für `nextSideScene` */
export interface SideOptions {
  /** Der Durchgang hat schon ein Geschenk gebracht: Szenen mit `gives` fallen weg */
  noGift?: boolean;
  /** Wiederholung in einem abgeschlossenen Akt: jeder Auftrag des Moduls gilt als erreicht */
  wholeModule?: boolean;
}

/**
 * Die nächste Nebenszene für einen Durchgang an `lessonId`.
 * Je Strang kommt die nächste ungezeigte `order`; dran ist der Strang, dessen letzte Szene am
 * längsten zurückliegt (nie gezeigte zuerst, bei Gleichstand die Listenreihenfolge).
 * Ein Strang gehört zu einem Akt: Szenen mit demselben Strangnamen in verschiedenen Modulen (`fromLesson`) sind
 * getrennte Stränge, sonst hielte die erste Szene eines späteren Akts den Strang des laufenden an.
 * Nebenszenen kommen nur im eigenen Akt: ihr `fromLesson` liegt im Modul des Auftrags. Übrige eines früheren Akts
 * kommen nur bei einer Wiederholung in diesem abgeschlossenen Akt (`wholeModule`, siehe `evaluateRun`); dann zählt jeder
 * Auftrag des Moduls als erreicht, sodass auch Stränge ab einem späteren Auftrag weiterlaufen. Mit `noGift` fallen Szenen mit `gives` weg (der Durchgang hat schon ein Geschenk gebracht).
 */
export function nextSideScene(p: Profile, story: Pick<StoryContent, 'scenes'>, rules: GameRules, lessonId: string, { noGift = false, wholeModule = false }: SideOptions = {}): string | null {
  const order = lessonOrder(rules.course);
  const ownModule = rules.course.modules.find((m) => m.lessons.some((l) => l.id === lessonId));
  const at = wholeModule && ownModule ? order.indexOf(ownModule.lessons.at(-1)!.id) : order.indexOf(lessonId);
  const reached = (id: string) => order.indexOf(id) <= at;
  const inOwnModule = (id: string) => !!ownModule?.lessons.some((l) => l.id === id);
  const sides = story.scenes.flatMap((scene): SideScene[] => (scene.trigger.on === 'side' ? [{ scene, trigger: scene.trigger }] : []));
  const moduleOf = (id: string) => rules.course.modules.find((m) => m.lessons.some((l) => l.id === id))?.id ?? '';
  const strandKey = (s: SideScene) => `${moduleOf(s.trigger.fromLesson)}/${s.trigger.strand}`;
  const strands = [...new Set(sides.map(strandKey))];

  const candidates = strands.flatMap((strand) => {
    const mine = sides.filter((s) => strandKey(s) === strand);
    const next = mine
      .filter((s) => !isLogged(p, s.scene.id) && !s.scene.retired)
      // Szenen mit „bis Auftrag X“ oder „bis Fall Y gelöst“ fallen danach weg
      .filter((s) => !s.trigger.untilLesson || !p.lessons[s.trigger.untilLesson]?.mastered)
      .filter((s) => !s.trigger.untilCase || p.cases[s.trigger.untilCase] === undefined)
      .sort((a, b) => a.trigger.order - b.trigger.order)[0];
    if (!next) return [];
    const t = next.trigger;
    // eine Szene mit Geschenk, die jetzt nicht darf, hält ihren Strang an (die Folge käme sonst vor ihr)
    if (!reached(t.fromLesson) || !inOwnModule(t.fromLesson) || (noGift && next.scene.gives?.length) || (t.afterCase && p.cases[t.afterCase] === undefined) || (t.afterScene && !isLogged(p, t.afterScene))) return [];
    const lastShown = Math.max(-1, ...mine.map((s) => p.story.log.findIndex((l) => l.id === s.scene.id)));
    return [{ id: next.scene.id, lastShown }];
  });
  // stabil nach Alter des letzten Eintrags; Gleichstand = Listenreihenfolge (Array.sort ist stabil)
  return candidates.sort((a, b) => a.lastShown - b.lastShown)[0]?.id ?? null;
}

// ---------- Auswertung eines Durchgangs ----------

/**
 * Wann die nächste Szene eines Auftrags kommt: die nächste Stufe über `best` (0..1),
 * `'done'`, wenn nur noch die Abschluss-Szene fehlt, `null`, wenn der Auftrag geschafft ist.
 */
export function nextStageAt(story: Pick<StoryContent, 'scenes'>, lessonId: string, best: number, mastered: boolean): number | 'done' | null {
  if (mastered) return null;
  const stages = story.scenes.flatMap((s) => (s.trigger.on === 'stage' && s.trigger.lessonId === lessonId ? [s.trigger.at] : []));
  const next = stages.filter((at) => at > best).sort((a, b) => a - b)[0];
  return next ?? 'done';
}

/** Ergebnis der Auswertung eines Durchgangs */
export interface StoryResult {
  /** neue Szenen, die sich nach der Nachbesprechung von selbst öffnen */
  open: string[];
  /** Nebenszene, die als Hinweis erscheint */
  side: string | null;
}

export const NO_STORY: StoryResult = { open: [], side: null };

/** Was beim Start eines Durchgangs festgehalten wird (siehe `runInfo` in mission.ts) */
export interface RunStart {
  /** Länge des Story-Logs beim Start */
  logStart: number;
  /** Der Auftrag war beim Start noch nicht geschafft (Spezialtraining beim Einsatz: immer false) */
  wasCurrent: boolean;
  /** Ein geschaffter Auftrag eines abgeschlossenen Akts (Einsatz gespielt) wird wiederholt: übrige Nebenszenen des Akts sind erreichbar */
  replay: boolean;
}

/** Haupt-Szenen öffnen sich nach der Nachbesprechung von selbst; Nebenszenen erscheinen nur als Hinweis */
const isSide = (s: StoryScene): boolean => s.trigger.on === 'side';

/** Szenen, die ein Durchgang in der Nachbesprechung von selbst öffnet */
const OPENS_BY_ITSELF: readonly Trigger['on'][] = ['briefing', 'stage', 'mastered'];

/**
 * Einen Durchgang für die Story auswerten (nach seiner letzten Runde; `p` hat die fälligen Szenen schon im Log).
 * Was seit `logStart` ins Log kam: Haupt-Szenen öffnen sich von selbst, eine Nebenszene wird zum Hinweis.
 * Kam keine Nebenszene und keine Stufe, gibt es eine neue Nebenszene – nur, wenn an einem offenen Auftrag geübt wurde oder ein geschaffter Auftrag eines abgeschlossenen Akts wiederholt wurde (`replay`).
 * Idempotent: eine zweite Auswertung findet die Nebenszene schon im Log.
 */
export function evaluateRun(p: Profile, story: Pick<StoryContent, 'scenes'>, rules: GameRules, run: RunStart & { lessonId: string }, now: number): { profile: Profile; result: StoryResult } {
  const { lessonId } = run;
  const fresh = p.story.log.slice(run.logStart).flatMap((l) => findScene(story, l.id) ?? []);
  const open = fresh.filter((s) => OPENS_BY_ITSELF.includes(s.trigger.on)).map((s) => s.id);
  const side = fresh.find(isSide)?.id ?? null;
  if (side) return { profile: p, result: { open, side } };
  const gotStage = fresh.some((s) => s.trigger.on === 'stage' && s.trigger.lessonId === lessonId);
  // höchstens ein Ding je Durchgang: hat er schon ein Geschenk gebracht, kommt keine Nebenszene mit `gives`
  const gotGift = fresh.some((s) => s.gift);
  const mastered = !!p.lessons[lessonId]?.mastered;
  const newSide = run.wasCurrent && !gotStage && !mastered ? nextSideScene(p, story, rules, lessonId, { noGift: gotGift }) : run.replay ? nextSideScene(p, story, rules, lessonId, { noGift: gotGift, wholeModule: true }) : null;
  return { profile: newSide ? logScenes(p, [newSide], now) : p, result: { open, side: newSide } };
}
