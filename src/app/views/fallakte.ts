// Ansicht der Fallakte: Firewall-Zeile, gelöste und offene Zeilen und Verdächtige mit den Treffern, die zu den Antworten des Kindes passen.

import type { Profile } from '../../domain/profile.ts';
import { matchesPicks } from '../../domain/dialog.ts';
import { fallakte, fallaktenScratched, type BookContent, type FallakteEntry, type Suspect } from '../../domain/book.ts';

/** Eine Zeile unter „gelöst“ oder „offen“ kann an eine Antwort des Kindes gebunden sein (`ifPicked`, z. B. „du hast es zuerst gesagt“) */
const visible = (entries: readonly FallakteEntry[], picks: Profile['story']['picks']): FallakteEntry[] => entries.filter((e) => matchesPicks(e, picks));

export interface SuspectView extends Omit<Suspect, 'hits'> {
  /** nur die Treffer-Zeilen, zu denen das Kind so geantwortet hat */
  hits: FallakteEntry[];
}

/**
 * Ansicht der Fallakte: Wie ist der Einsatz ausgegangen? (Daraus folgt die Firewall-Zeile.)
 * Dazu die gelösten und offenen Zeilen und die Verdächtigen mit den Treffer-Zeilen, die zu den früheren Antworten des Kindes passen.
 * Solange die Fallakten zerkratzt sind (`scratched`, aus dem Story-Log), sind Zeilen, Verdächtige und Treffer verdeckt.
 */
export function fallakteView(
  p: Profile,
  story: Pick<BookContent, 'fallakten' | 'fallaktenDamage'>,
  moduleId: string,
): { scratched: boolean; firewall: 'passed' | 'backdoor'; solved: FallakteEntry[]; open: FallakteEntry[]; suspects: SuspectView[] } {
  const file = fallakte(story, moduleId);
  const scratched = fallaktenScratched(p, story);
  const suspects = scratched ? [] : (file?.suspects ?? []);
  return {
    scratched,
    solved: scratched ? [] : visible(file?.solved ?? [], p.story.picks),
    open: scratched ? [] : visible(file?.open ?? [], p.story.picks),
    firewall: p.exams[moduleId]?.outcome === 'backdoor' ? 'backdoor' : 'passed',
    suspects: suspects.map((s) => ({ ...s, hits: s.hits.filter((h) => matchesPicks(h, p.story.picks)) })),
  };
}
