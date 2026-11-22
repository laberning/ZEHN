// Datei aus dem Browser speichern (z. B. die Akte als Sicherung).

import { backupFileName, encodeBackup } from '../app/backup.ts';
import type { Profile } from '../domain/profile.ts';

/** Bietet `blob` unter dem Namen `name` zum Herunterladen an */
export function downloadFile(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  // Manche Browser (Safari, ältere Firefox) starten den Download nur mit einem Link im Dokument
  document.body.append(a);
  a.click();
  a.remove();
  // Erst freigeben, wenn der Browser den Download übernommen hat
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Lädt die Akte als Sicherungsdatei herunter (Agentenakte und Verwaltung auf der Startseite); `now` ist der Zeitstempel der Sicherung */
export function downloadBackup(profile: Profile, now: number) {
  downloadFile(backupFileName(profile), new Blob([encodeBackup(profile, now)], { type: 'application/json' }));
}
