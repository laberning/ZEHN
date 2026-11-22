// Spielstände im Arbeitsspeicher – für Tests.

import type { ProfileRepository } from '../app/ports.ts';
import type { Profile } from '../domain/profile.ts';

export type MemoryRepository = Omit<ProfileRepository, 'list'> & { list(): Promise<Profile[]>; snapshot(): Profile[] };

/** `list` liefert hier getypte Profile (in Einfügereihenfolge), damit Tests bequem nachsehen können */
export function memoryRepository(initial: readonly Profile[] = []): MemoryRepository {
  const store = new Map(initial.map((p) => [p.id, structuredClone(p)]));
  return {
    list: async () => [...store.values()].map((p) => structuredClone(p)),
    save: async (p) => {
      store.set(p.id, structuredClone(p));
    },
    remove: async (id) => {
      store.delete(id);
    },
    snapshot: () => [...store.values()],
  };
}
