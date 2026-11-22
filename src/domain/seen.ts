// Merker im Profil („schon gesehen“). Nur Schlüssel, die auch gelesen werden.

import type { Profile } from './profile.ts';

export const seenKey = {
  /** Briefing eines Auftrags wurde gezeigt */
  briefing: (lessonId: string) => `briefing:${lessonId}`,
  /** Einsatz-Intro eines Moduls wurde gezeigt */
  examIntro: (moduleId: string) => `exam-intro:${moduleId}`,
  /** Der Bilderbuch-Erfolg eines Einsatzes wurde gezeigt (nur beim ersten Mal) */
  examSuccess: (moduleId: string) => `exam-success:${moduleId}`,
  /** Das Kind hat ein neues Ding (Kleidung oder Gadget) in der Garderobe bzw. im Koffer gesehen */
  item: (itemId: string) => `item:${itemId}`,
  /** Die Fallakte eines Moduls wurde geöffnet (das HQ zeigt bis dahin „Neu“) */
  fallakte: (moduleId: string) => `fallakte:${moduleId}`,
  /** Das Spielende (nach dem Einsatz des letzten Moduls im Kurs) wurde gezeigt */
  storyEnd: (moduleId: string) => `story-end:${moduleId}`,
};

export function hasSeen(p: Pick<Profile, 'seen'>, key: string): boolean {
  return p.seen.includes(key);
}

export function markSeen<P extends Pick<Profile, 'seen'>>(p: P, ...keys: string[]): P {
  const add = [...new Set(keys)].filter((k) => !p.seen.includes(k));
  return add.length ? { ...p, seen: [...p.seen, ...add] } : p;
}
