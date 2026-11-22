// Agenten-Chat: Verlauf aus Log und Antworten, Abspielen von Szenen (Warteschlange über mehrere Chats).
// Reine Funktionen; den Takt („tippt …“) gibt die Oberfläche vor.

import { matchesTime, NEUTRAL_TIME, type TimeInfo } from './daytime.ts';
import { availableLines, fillLine, matchesPicks, type ChatId, type Choice, type Line, type LineContext, type Picks } from './dialog.ts';
import type { Profile } from './profile.ts';
import { unread } from './story.ts';
import { findScene, type StoryScene } from './scenes.ts';
import type { StoryContent } from './storyContent.ts';

const CHAT_ORDER: readonly ChatId[] = ['intern', 'kruemel', 'fluestern', 'juna'];

export interface ChatMessage {
  key: string;
  sceneId: string;
  chat: ChatId;
  line: Line;
}

type Scenes = Pick<StoryContent, 'scenes'>;

/**
 * Alle Nachrichten einer Szene in allen Chats; gewählte Antworten erscheinen mit ganzem Text und Reaktion.
 * `allPicks`: Antworten aller Szenen, für Echo-Zeilen (ifPicked) – wie beim Abspielen. `time`: für Zeilen mit ifTime.
 */
export function sceneMessages(scene: StoryScene, picks: readonly string[], allPicks: Picks = {}, time: TimeInfo = NEUTRAL_TIME): ChatMessage[] {
  const out: ChatMessage[] = [];
  let cursor = 0;
  // Zeilen ohne eigenen Chat stehen im Chat der Szene; Antwort und Reaktion im Chat der fragenden Zeile
  const walk = (lines: readonly Line[], fallback: ChatId) => {
    for (const line of lines) {
      if (!matchesPicks(line, allPicks) || !matchesTime(line.ifTime, time)) continue;
      const chat = line.chat ?? fallback;
      out.push({ key: `${scene.id}:${out.length}`, sceneId: scene.id, chat, line: { ...line, choices: undefined } });
      if (!line.choices?.length) continue;
      const wanted = picks[cursor++];
      const chosen = line.choices.find((c) => c.id === wanted);
      if (!chosen) continue; // nicht gewählte Antworten erscheinen gar nicht
      out.push({ key: `${scene.id}:${out.length}`, sceneId: scene.id, chat, line: { speaker: 'player', text: chosen.text } });
      walk(chosen.reply ?? [], chat);
    }
  };
  walk(scene.lines, scene.chat);
  return out;
}

/** Verlauf eines Chats: ausgelöste Szenen in Log-Reihenfolge; `exclude` sind Szenen, die gerade abgespielt werden */
export function chatHistory(p: Profile, story: Scenes, chat: ChatId, exclude: ReadonlySet<string> = new Set(), time: TimeInfo = NEUTRAL_TIME): ChatMessage[] {
  return p.story.log.flatMap((l) => {
    const scene = findScene(story, l.id);
    if (!scene || exclude.has(l.id)) return [];
    return sceneMessages(scene, p.story.picks[l.id] ?? [], p.story.picks, time).filter((m) => m.chat === chat);
  });
}

/** Chats mit mindestens einer ausgelösten Zeile, in fester Reihenfolge */
export function chatList(p: Profile, story: Scenes, time: TimeInfo = NEUTRAL_TIME): ChatId[] {
  return CHAT_ORDER.filter((chat) => chatHistory(p, story, chat, undefined, time).length > 0);
}

/** Eine Nachricht mit Text von einer Figur (keine Systemzeile, kein reines Bild) – taugt als Vorschau */
const isPreview = (m: ChatMessage) => m.line.speaker !== 'system' && !!m.line.text;

/** Erste Nachricht der ältesten ungelesenen Szene (in einem Chat) – für die Benachrichtigung im HQ und die Chatliste */
export function incomingMessage(p: Profile, story: Scenes, chat?: ChatId, time: TimeInfo = NEUTRAL_TIME): ChatMessage | null {
  for (const id of unread(p, story, chat)) {
    const scene = findScene(story, id);
    const m = scene && sceneMessages(scene, [], p.story.picks, time).find((m) => (!chat || m.chat === chat) && isPreview(m));
    if (m) return m;
  }
  return null;
}

/** Vorschau in der Chatliste: Neues zuerst, sonst die letzte Nachricht */
export function chatPreview(p: Profile, story: Scenes, chat: ChatId, time: TimeInfo = NEUTRAL_TIME): ChatMessage | null {
  return incomingMessage(p, story, chat, time) ?? chatHistory(p, story, chat, undefined, time).filter(isPreview).at(-1) ?? null;
}

/** Wer eine Szene „schreibt“ – für den Hinweis in der Nachbesprechung */
export function sceneSender(scene: StoryScene): Line['speaker'] {
  return (scene.lines.find((l) => l.speaker !== 'system' && l.speaker !== 'erzaehler' && l.speaker !== 'player') ?? scene.lines[0]!).speaker;
}

// ---------- Abspielen ----------

/** Wie lange „tippt …“ dauert: 0,5 bis 1,5 Sekunden, je nach Länge */
export const typingMs = (text: string): number => Math.min(1500, 500 + text.length * 12);
/** Tippdauer einer Zeile: eine korrigierte Nachricht tippt den durchgestrichenen Teil mit */
export const lineTypingMs = (line: Pick<Line, 'text' | 'strike'>): number => typingMs(line.strike ? `${line.strike} ${line.text}` : line.text);
/** Pause, bevor die nächste Nachricht zu tippen beginnt */
export const GAP_MS = 350;

export interface PlayItem {
  id: number;
  sceneId: string;
  chat: ChatId;
  line: Line;
}

export interface ChatPlay {
  queue: PlayItem[];
  index: number;
  /** typing: „… tippt“ bei der aktuellen Nachricht; shown: sie steht da */
  phase: 'typing' | 'shown';
  pick: number;
  /** Szenen, deren letzte Nachricht gezeigt wurde (= gelesen) */
  finished: string[];
  nextId: number;
  /** Szenen dieser Wiedergabe – Echos auf sie werden erst entschieden, wenn sie zu Ende sind */
  playing: readonly string[];
  /** In dieser Wiedergabe gewählte Antworten je Szene (ersetzen die gespeicherten, wie in pickChoice) */
  chosen: Readonly<Record<string, readonly string[]>>;
}

/** Nachrichten von System und Spielfigur erscheinen sofort */
const instant = (i: PlayItem): boolean => i.line.speaker === 'system' || i.line.speaker === 'player';

/** `fallback`: Chat für Zeilen ohne eigenen (der der Szene, bei Antworten der der fragenden Zeile) */
function items(sceneId: string, fallback: ChatId, lines: readonly Line[], from: number): PlayItem[] {
  return lines.map((line, k) => ({ id: from + k, sceneId, chat: line.chat ?? fallback, line }));
}

export function playStart(scenes: readonly StoryScene[], ctx: LineContext, vars: Record<string, string | number> = {}): ChatPlay {
  const playing = scenes.map((s) => s.id);
  let nextId = 0;
  const queue = scenes.flatMap((scene) => {
    const list = items(scene.id, scene.chat, availableLines(scene.lines, ctx, new Set(playing)).map((l) => fillLine(l, vars)), nextId);
    nextId += list.length;
    return list;
  });
  return settle({ queue, index: 0, phase: queue[0] && instant(queue[0]) ? 'shown' : 'typing', pick: 0, finished: [], nextId, playing, chosen: {} });
}

/**
 * Echo auf eine Szene dieser Wiedergabe: entschieden, sobald die Szene zu Ende ist (dann stehen ihre Antworten fest).
 * Echos auf andere Szenen hat schon playStart mit den gespeicherten Antworten entschieden.
 */
function undecidedOrMatching(s: Pick<ChatPlay, 'playing' | 'finished' | 'chosen'>, item: PlayItem): boolean {
  const ref = item.line.ifPicked;
  if (!ref || !s.playing.includes(ref.scene) || !s.finished.includes(ref.scene)) return true;
  return matchesPicks(item.line, { [ref.scene]: s.chosen[ref.scene] ?? [] });
}

export const currentItem = (s: ChatPlay): PlayItem | undefined => s.queue[s.index];
/** Antworten, die gerade zur Wahl stehen */
export const offeredChoices = (s: ChatPlay): Choice[] | undefined => (s.phase === 'shown' ? currentItem(s)?.line.choices : undefined);
/** Alles gezeigt, nichts mehr zu wählen */
export const isEnd = (s: ChatPlay): boolean => s.queue.length === 0 || (s.phase === 'shown' && s.index >= s.queue.length - 1 && !offeredChoices(s)?.length);
/** Nachrichten, die schon dastehen (ohne die gerade „tippende“) */
export const visibleItems = (s: ChatPlay): PlayItem[] => s.queue.slice(0, s.phase === 'shown' ? s.index + 1 : s.index);
export const isTyping = (s: ChatPlay): boolean => s.phase === 'typing' && !!currentItem(s);

/** Eine Szene ist gelesen, sobald ihre letzte Nachricht dasteht und keine Antwort mehr offen ist */
function settle(s: ChatPlay): ChatPlay {
  const item = currentItem(s);
  if (!item || s.phase !== 'shown' || item.line.choices?.length) return s;
  const last = s.queue[s.index + 1]?.sceneId !== item.sceneId;
  if (!last || s.finished.includes(item.sceneId)) return s;
  const done = { ...s, finished: [...s.finished, item.sceneId] };
  // Jetzt stehen die Antworten dieser Szene fest: Echos auf sie weiter hinten entscheiden
  return { ...done, queue: [...s.queue.slice(0, s.index + 1), ...s.queue.slice(s.index + 1).filter((i) => undecidedOrMatching(done, i))] };
}

export type ChatAction = { type: 'shown' } | { type: 'next' } | { type: 'advance' } | { type: 'choose'; index: number } | { type: 'pick'; delta: number };

export function playReducer(s: ChatPlay, a: ChatAction): ChatPlay {
  const item = currentItem(s);
  if (!item) return s;
  switch (a.type) {
    case 'shown':
      return s.phase === 'typing' ? settle({ ...s, phase: 'shown' }) : s;
    case 'next': {
      if (s.phase !== 'shown' || item.line.choices?.length || isEnd(s)) return s;
      const nextItem = s.queue[s.index + 1]!;
      return settle({ ...s, index: s.index + 1, phase: instant(nextItem) ? 'shown' : 'typing', pick: 0 });
    }
    case 'advance': {
      if (s.phase === 'typing') return settle({ ...s, phase: 'shown' });
      if (item.line.choices?.length) return playReducer(s, { type: 'choose', index: s.pick });
      return playReducer(s, { type: 'next' });
    }
    case 'choose': {
      const c = s.phase === 'shown' ? item.line.choices?.[a.index] : undefined;
      if (!c) return s;
      const answer: Line = { speaker: 'player', text: c.text };
      // Antwort und Reaktion stehen in dem Chat, in dem gefragt wurde (außer die Reaktion nennt einen eigenen)
      const chosen = { ...s.chosen, [item.sceneId]: [...(s.chosen[item.sceneId] ?? []), c.id] };
      // Echos in der Reaktion auf schon beendete Szenen dieser Wiedergabe gleich entscheiden
      const fresh = items(item.sceneId, item.chat, [answer, ...(c.reply ?? [])], s.nextId).filter((i) => undecidedOrMatching({ ...s, chosen }, i));
      const queue = [...s.queue.slice(0, s.index + 1), ...fresh, ...s.queue.slice(s.index + 1)];
      // Die Zeile mit den Antworten gilt als beantwortet: ohne Auswahl weitermachen
      queue[s.index] = { ...item, line: { ...item.line, choices: undefined } };
      return settle({ ...s, queue, chosen, index: s.index + 1, phase: 'shown', pick: 0, nextId: s.nextId + fresh.length });
    }
    case 'pick': {
      const n = s.phase === 'shown' ? (item.line.choices?.length ?? 0) : 0;
      return n ? { ...s, pick: (s.pick + a.delta + n) % n } : s;
    }
  }
}

/** Trennzeile vor einer Nachricht, wenn der Chat wechselt (`start` ist der geöffnete Chat) */
export function dividerBefore(queue: readonly PlayItem[], i: number, start: ChatId): ChatId | null {
  const prev = i === 0 ? start : queue[i - 1]!.chat;
  return queue[i]!.chat !== prev ? queue[i]!.chat : null;
}
