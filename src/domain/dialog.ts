// Story-Dialoge: Datentypen und Ablauf (Warteschlange, Schreibmaschinen-Effekt, Antwortauswahl).
// Die Texte selbst stehen in content/story/.

import { matchesTime, NEUTRAL_TIME, type TimeCondition, type TimeInfo } from './daytime.ts';
import type { PictureId } from './storyObject.ts';

export type Speaker = 'ada' | 'kruemel' | 'baron' | 'unbekannt' | 'juna' | 'hubbel' | 'tippi' | 'benno' | 'erzaehler' | 'player' | 'system';
/** Chats im Agentenfunk (siehe story.md A5) */
export type ChatId = 'intern' | 'kruemel' | 'fluestern' | 'juna';
export type SceneName = 'backstube' | 'keller' | 'schreibtisch' | 'firewall' | 'funkturm' | 'tunnel' | 'turm' | 'marktplatz' | 'tresor' | 'zentrale';

export interface Choice {
  /** eindeutig innerhalb der Szene (steht im Spielstand) */
  id: string;
  /** Kurzform für den Knopf, höchstens drei Wörter */
  label: string;
  /** ganze Antwort der Spielfigur */
  text: string;
  /** Die Antwort wird selbst getippt (nur gelernte Zeichen) */
  typed?: string;
  /** Item-ID: die Antwort erscheint nur mit diesem Gadget */
  needs?: string;
  reply?: Line[];
  /** Was nach dem Dialog passieren soll, z. B. Garderobe öffnen */
  action?: 'wardrobe';
}

export interface Line {
  speaker: Speaker;
  text: string;
  /** Korrigierte Nachricht (nur Tippi): der durchgestrichene Teil, er steht in derselben Blase vor `text` */
  strike?: string;
  /** wechselt den Hintergrund ab dieser Zeile */
  scene?: SceneName;
  /** Bilderbuch: die Figur spricht aus der Ferne (über Funk) und steht nicht auf der Bühne (`castAt`) */
  offstage?: true;
  /** Antworten zum Auswählen; nach der Wahl spricht die Spielfigur, dann folgt `reply` */
  choices?: Choice[];
  /** zeigt eine kleine Tastatur, auf der diese Tasten leuchten (KeyboardEvent.code) */
  keys?: string[];
  /** Die Zeile gehört in einen anderen Chat als die Szene (z. B. Qwertz-Flüstern) */
  chat?: ChatId;
  /** Story-Objekt mit festem Stand: `at` ist der Fortschritt 0..1 */
  object?: { lessonId: string; at: number };
  /** Karte, Zettel, Werbung oder Lösung eines Falls; `look: 'goldcard'` = Post des Diebs (Papier mit Goldrand, ohne Titel) */
  card?: { title: string; text: string; look?: 'goldcard' };
  /** Ein Gadget, das in diesem Moment übergeben wird: sein Bild erscheint in der Nachricht */
  item?: string;
  /** Festes kleines Bild */
  picture?: PictureId;
  /**
   * Echo: Die Zeile erscheint nur, wenn in `scene` die Antwort `choice` gewählt wurde (`null`: dort nichts gewählt).
   * Solche Zeilen tragen selbst keine Antworten – sonst verschöbe sich die Reihenfolge gespeicherter Antworten.
   */
  ifPicked?: { scene: string; choice: string | null };
  /**
   * Die Zeile erscheint nur zu dieser Tageszeit, Öffnungszeit oder am Sonntag (echte Uhr des Geräts).
   * Solche Zeilen tragen selbst keine Antworten; die Varianten einer Stelle decken zusammen jede Zeit ab,
   * damit jede Szene zu jeder Zeit gleich viele Zeilen hat.
   */
  ifTime?: TimeCondition;
}

/** Gewählte Antworten je Szene (wie im Spielstand) */
export type Picks = Readonly<Record<string, readonly string[]>>;

/** Was beim Abspielen über das Profil bekannt ist: Gadgets im Koffer, frühere Antworten */
export interface LineContext {
  owned: ReadonlySet<string>;
  picks: Picks;
  /** Zeit beim Öffnen der Szene; ohne Angabe gilt `NEUTRAL_TIME` (Dienstagmorgen, Bäckerei offen) */
  time?: TimeInfo;
}
export const NO_CONTEXT: LineContext = { owned: new Set(), picks: {} };

/** Passt die Zeile zu den früheren Antworten? */
export function matchesPicks(l: Pick<Line, 'ifPicked'>, picks: Picks): boolean {
  if (!l.ifPicked) return true;
  const chosen = picks[l.ifPicked.scene] ?? [];
  return l.ifPicked.choice === null ? chosen.length === 0 : chosen.includes(l.ifPicked.choice);
}

export interface DialogState {
  queue: Line[];
  index: number;
  /** wie viele Zeichen der aktuellen Zeile schon sichtbar sind */
  shown: number;
  pick: number;
  done: boolean;
}

/** Platzhalter {name} ersetzen */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Platzhalter einer Zeile füllen: Text, durchgestrichener Teil, Karte und Antworten (Knopf, ganzer und getippter Text, Reaktion) */
export function fillLine(l: Line, vars: Record<string, string | number>): Line {
  return {
    ...l,
    text: fill(l.text, vars),
    ...(l.strike !== undefined ? { strike: fill(l.strike, vars) } : {}),
    // das Aussehen der Karte (`look`, z. B. Goldrand) bleibt erhalten
    card: l.card && { ...l.card, title: fill(l.card.title, vars), text: fill(l.card.text, vars) },
    choices: l.choices?.map((c) => ({
      ...c,
      label: fill(c.label, vars),
      text: fill(c.text, vars),
      typed: c.typed && fill(c.typed, vars),
      reply: c.reply?.map((r) => fillLine(r, vars)),
    })),
  };
}

/** Zeilen nach früheren Antworten (ifPicked), Zeit (ifTime) und Antworten nach Gadgets (needs) filtern; mindestens eine Antwort geht immer – das prüft ein Test */
export function availableLines(lines: readonly Line[], ctx: LineContext, undecided: ReadonlySet<string> = new Set()): Line[] {
  const keep = (c: Choice) => !c.needs || ctx.owned.has(c.needs);
  const time = ctx.time ?? NEUTRAL_TIME;
  // Echos auf Szenen in `undecided` bleiben stehen – über sie entscheidet der Aufrufer später
  return lines
    .filter((l) => matchesTime(l.ifTime, time))
    .filter((l) => (l.ifPicked && undecided.has(l.ifPicked.scene)) || matchesPicks(l, ctx.picks))
    .map((l) => ({
      ...l,
      choices: l.choices?.filter(keep).map((c) => ({ ...c, reply: c.reply && availableLines(c.reply, ctx, undecided) })),
    }));
}

export function dialogStart(lines: readonly Line[], vars: Record<string, string | number> = {}, ctx: LineContext = NO_CONTEXT): DialogState {
  const queue = availableLines(lines, ctx).map((l) => fillLine(l, vars));
  return { queue, index: 0, shown: 0, pick: 0, done: queue.length === 0 };
}

export const currentLine = (s: DialogState): Line | undefined => s.queue[s.index];
export const isLineComplete = (s: DialogState): boolean => s.shown >= (currentLine(s)?.text.length ?? 0);
export const visibleChoices = (s: DialogState): Choice[] | undefined => (isLineComplete(s) ? currentLine(s)?.choices : undefined);
export const isLastLine = (s: DialogState): boolean => s.index + 1 >= s.queue.length;
export const visibleText = (s: DialogState): string => currentLine(s)?.text.slice(0, s.shown) ?? '';

/** Rückt `n` auf eine Code-Punkt-Grenze vor: steht `n` hinter einem High-Surrogate, wird das Emoji ganz gezeigt */
const toCodePointEnd = (text: string, n: number): number => {
  const c = text.charCodeAt(n - 1);
  return c >= 0xd800 && c <= 0xdbff && n < text.length ? n + 1 : n;
};

export type DialogAction = { type: 'reveal'; chars: number } | { type: 'advance' } | { type: 'choose'; index: number } | { type: 'pick'; delta: number };

export function dialogReducer(s: DialogState, a: DialogAction): DialogState {
  if (s.done) return s;
  const line = currentLine(s);
  if (!line) return { ...s, done: true };
  switch (a.type) {
    case 'reveal':
      return { ...s, shown: toCodePointEnd(line.text, Math.min(line.text.length, s.shown + a.chars)) };
    case 'advance': {
      if (!isLineComplete(s)) return { ...s, shown: line.text.length };
      if (line.choices?.length) return dialogReducer(s, { type: 'choose', index: s.pick });
      return isLastLine(s) ? { ...s, done: true } : { ...s, index: s.index + 1, shown: 0, pick: 0 };
    }
    case 'choose': {
      const c = line.choices?.[a.index];
      if (!c || !isLineComplete(s)) return s;
      const answer: Line = { speaker: 'player', text: c.text };
      const queue = [...s.queue.slice(0, s.index + 1), answer, ...(c.reply ?? []), ...s.queue.slice(s.index + 1)];
      return { ...s, queue, index: s.index + 1, shown: 0, pick: 0 };
    }
    case 'pick': {
      const n = line.choices?.length ?? 0;
      return n ? { ...s, pick: (s.pick + a.delta + n) % n } : s;
    }
  }
}

/** Hintergrund: die zuletzt gesetzte Szene bis zur aktuellen Zeile */
export function sceneAt(s: DialogState, fallback: SceneName): SceneName {
  return s.queue.slice(0, s.index + 1).reduce<SceneName>((acc, l) => l.scene ?? acc, fallback);
}

/** Figuren auf der Bühne: wer bisher gesprochen hat (ohne Erzähler, Spielfigur und Stimmen aus der Ferne), höchstens zwei */
export function castAt(s: DialogState): Speaker[] {
  const seen: Speaker[] = [];
  for (const l of s.queue.slice(0, s.index + 1)) {
    if (l.speaker !== 'erzaehler' && l.speaker !== 'player' && !l.offstage && !seen.includes(l.speaker)) seen.push(l.speaker);
  }
  return seen.slice(-2);
}
