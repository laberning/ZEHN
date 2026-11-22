// Dinge und Geschenke: Herkunft gesperrter Dinge, Geschenktakt.

import type { ItemSource } from '../../domain/items.ts';

/** Wann ein verdientes, noch nicht überreichtes Geschenk kommt (höchstens eines je Durchgang) */
const NEXT_RUN = 'am Ende deines nächsten Durchgangs';
/** An einem Ding, das verdient, aber noch nicht überreicht ist (Garderobe, Koffer, Fall-Karte) */
export const GIFT_PENDING_TEXT = `Ist unterwegs – kommt ${NEXT_RUN}`;
/** In der Nachbesprechung und auf der Missionskarte, wenn ein Geschenk wartet */
export const GIFT_WAITING_TEXT = `Ein Geschenk ist unterwegs – es kommt ${NEXT_RUN}.`;

/** „Nächstes Geschenk“ auf der Missionskarte – ohne das Ding zu verraten */
export function nextGiftText(m: { kind: 'waiting' } | { kind: 'lesson' } | { kind: 'rank'; xp: number; rankTitle: string }): string {
  if (m.kind === 'waiting') return GIFT_WAITING_TEXT;
  if (m.kind === 'lesson') return 'Am Ende dieses Auftrags wartet ein Geschenk.';
  return `Noch ${m.xp} EP bis zum Rang ${m.rankTitle} – dann gibt's ein Geschenk.`;
}

/** Wo ein Ding herkommt, solange man es noch nicht hat (ohne Schlusspunkt – wird in Sätze eingebaut) */
export function sourceHint(source: ItemSource, opts: { badgeTitle?: string; caseTitle?: string; when?: string; pending?: boolean } = {}): string {
  if (opts.pending) return GIFT_PENDING_TEXT;
  if ('badge' in source) return `Kommt mit dem Abzeichen „${opts.badgeTitle ?? '?'}“`;
  if ('scene' in source) return opts.when ? `Kommt ${opts.when}` : 'Kommt in der Geschichte';
  return opts.caseTitle ? `Belohnung im Extra-Fall „${opts.caseTitle}“` : 'Gibt es in einem Extra-Fall';
}

/**
 * Wann eine Szene kommt – für „Kommt …“ an gesperrten Dingen. Aufträge zählen je Akt; ab Akt 2 steht der Akt dabei
 * („zu Beginn von Auftrag 2 in Akt 2“, „nach dem Einsatz in Akt 2“).
 */
export function sceneMomentText(
  m: { kind: 'briefing' | 'stage' | 'mastered'; lessonNo: number; act?: number } | { kind: 'rank'; rankTitle: string } | { kind: 'exam'; act?: number } | { kind: 'later' },
): string {
  const inAct = 'act' in m && m.act !== undefined && m.act > 1 ? ` in Akt ${m.act}` : '';
  switch (m.kind) {
    case 'later':
      return 'in einem späteren Akt';
    case 'briefing':
      return `zu Beginn von Auftrag ${m.lessonNo}${inAct}`;
    case 'stage':
      return `in Auftrag ${m.lessonNo}${inAct}`;
    case 'mastered':
      return `am Ende von Auftrag ${m.lessonNo}${inAct}`;
    case 'rank':
      return `mit dem Rang ${m.rankTitle}`;
    case 'exam':
      return `nach dem Einsatz${inAct}`;
  }
}
