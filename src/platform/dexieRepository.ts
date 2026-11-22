// Spielstände in IndexedDB (über Dexie). Migration passiert in app/profileMigration.ts.

import Dexie, { type EntityTable } from 'dexie';
import type { ProfileRepository } from '../app/ports.ts';
import type { Profile } from '../domain/profile.ts';

export function dexieRepository(dbName = 'zehn'): ProfileRepository {
  const db = new Dexie(dbName) as Dexie & { profiles: EntityTable<Profile, 'id'> };
  // Neue Schema-Versionen hier anhängen, alte nie ändern (Dexie migriert dann automatisch).
  db.version(1).stores({ profiles: 'id, createdAt' });
  return {
    // Alle Datensätze, auch die ohne createdAt (orderBy würde sie überspringen); sortiert wird beim Laden
    list: () => db.profiles.toArray(),
    save: async (p) => {
      await db.profiles.put(p);
    },
    remove: (id) => db.profiles.delete(id),
  };
}
