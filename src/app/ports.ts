// Ports: Schnittstellen zur Außenwelt. Die Adapter liegen in platform/, in Tests gibt es Attrappen.

import type { Profile } from '../domain/profile.ts';

export interface ProfileRepository {
  /** Alle gespeicherten Datensätze, ungeprüft und unsortiert (prüfen und sortieren: loadProfiles in app/profileMigration.ts) */
  list(): Promise<unknown[]>;
  save(p: Profile): Promise<void>;
  remove(id: string): Promise<void>;
}

export type Sfx = 'key' | 'error' | 'done' | 'badge' | 'segment' | 'fail' | 'message';

export interface SoundPort {
  play(s: Sfx): void;
  setEnabled(on: boolean): void;
}

/** Zeit, Zufall und IDs – das Einzige, was nicht deterministisch ist. In Tests fest vorgegeben. */
export interface Env {
  now(): number;
  seed(): number;
  id(): string;
}

export interface Deps {
  repo: ProfileRepository;
  sound: SoundPort;
  env: Env;
}
