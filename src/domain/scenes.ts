// Szenen-Typen und Grundfunktionen, die nichts weiter brauchen: Szene finden, Szene nach Auslöser, steht im Log?, ins Log eintragen.
// Eigene Datei, damit items.ts und cases.ts sie nutzen können, ohne einen Importkreis über story.ts zu bilden;
// story.ts reicht nichts weiter, man importiert von hier.

import type { ChatId, Line } from './dialog.ts';
import type { Profile } from './profile.ts';

export type Trigger =
  | { on: 'briefing'; lessonId: string }
  /** lessons[id].best >= at */
  | { on: 'stage'; lessonId: string; at: 0.25 | 0.5 | 0.75 }
  | { on: 'mastered'; lessonId: string }
  /** Einsatz bestanden oder Hintertür genommen */
  | { on: 'exam'; moduleId: string }
  | { on: 'badge'; badgeId: string }
  /** Rang-Schlüssel (`Rank.key`); nie für den ersten Rang */
  | { on: 'rank'; rank: string }
  /** die `round`-te abgeschlossene Runde in Bennos Tippstunde (gezählt aus dem Verlauf) */
  | { on: 'training'; round: number }
  /** der Extra-Fall ist verfügbar geworden */
  | { on: 'caseOpen'; caseId: string }
  /** nur über Store-Aktionen (Fall beginnen / lösen) */
  | { on: 'case'; caseId: string; part: 'intro' | 'outro' }
  /**
   * Nebenszene eines Strangs. `fromLesson`: ab diesem Auftrag; `untilLesson`/`untilCase`: fällt weg, sobald der Auftrag
   * geschafft bzw. der Fall gelöst ist; `afterCase`/`afterScene`: erst danach (z. B. wenn die Figur vorgestellt ist)
   */
  | { on: 'side'; strand: string; order: number; fromLesson: string; untilLesson?: string; untilCase?: string; afterCase?: string; afterScene?: string };

export interface StoryScene {
  /** stabil, nie umbenennen (steht in Spielständen) */
  id: string;
  /** Standard-Chat der Zeilen */
  chat: ChatId;
  trigger: Trigger;
  lines: Line[];
  /** Item-IDs, die mit dem Auslösen überreicht sind (Besitz entsteht genau hier) */
  gives?: string[];
  /**
   * Geschenk: überreicht etwas als Belohnung (Paket, Rang, Geschenk aus der Geschichte). Höchstens eines je Durchgang,
   * nur am Ende des Durchgangs; in der Listenreihenfolge (= Vorrang). Haupt-Szenen mit `gives` sind keine Geschenke.
   */
  gift?: true;
  /**
   * Stillgelegt seit Inhaltsversion `since`: wird nie mehr fällig; wer sie im Log hat, behält, was sie überreicht hat.
   * Nur Spielstände von vor `since` holen sie beim Laden nach (sie hätten das Ding damals bekommen).
   */
  retired?: { since: number };
}

interface Scenes {
  scenes: readonly StoryScene[];
}

export const findScene = (story: Scenes, id: string): StoryScene | undefined => story.scenes.find((s) => s.id === id);

/** Die erste Szene mit diesem Auslöser, z. B. `sceneFor(story, 'case', (t) => t.caseId === id && t.part === 'intro')` */
export function sceneFor<On extends Trigger['on']>(story: Scenes, on: On, match: (t: Extract<Trigger, { on: On }>) => boolean): StoryScene | undefined {
  return story.scenes.find((s) => s.trigger.on === on && match(s.trigger as Extract<Trigger, { on: On }>));
}

/** Steht die Szene im Story-Log (wurde sie ausgelöst)? */
export const isLogged = (p: Pick<Profile, 'story'>, id: string): boolean => p.story.log.some((l) => l.id === id);

/** Szenen ins Log eintragen (schon vorhandene bleiben unberührt) */
export function logScenes(p: Profile, ids: readonly string[], now: number): Profile {
  const add = [...new Set(ids)].filter((id) => !isLogged(p, id));
  return add.length ? { ...p, story: { ...p.story, log: [...p.story.log, ...add.map((id) => ({ id, t: now }))] } } : p;
}
