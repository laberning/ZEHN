// Sicherungsdatei der Agentenakte (JSON).

import type { Profile } from '../domain/profile.ts';
import { InvalidProfileError, NOT_A_PROFILE } from './profileMigration.ts';

interface BackupFile {
  app: 'zehn';
  format: 1;
  exportedAt: string;
  profile: unknown;
}

export function encodeBackup(p: Profile, now: number): string {
  const data: BackupFile = { app: 'zehn', format: 1, exportedAt: new Date(now).toISOString(), profile: p };
  return JSON.stringify(data, null, 1);
}

export function backupFileName(p: Profile): string {
  return `zehn-akte-${p.codename.toLowerCase().replace(/[^a-z0-9äöüß-]+/g, '-')}.json`;
}

/**
 * Liest den Rahmen einer Sicherungsdatei und liefert das gespeicherte Profil ungeprüft –
 * migriert wird es erst beim Import (`importProfile`), mit den Regeln des Stores.
 * Wirft einen Fehler mit kindgerechter Meldung, wenn die Datei nicht passt.
 */
export function parseBackup(text: string): unknown {
  let data: Partial<BackupFile>;
  try {
    data = JSON.parse(text) as Partial<BackupFile>;
  } catch {
    throw new InvalidProfileError(NOT_A_PROFILE);
  }
  if (data?.app !== 'zehn') throw new InvalidProfileError(NOT_A_PROFILE);
  return data.profile;
}
