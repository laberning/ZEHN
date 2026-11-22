// Gemeinsame Schritte der Browser-Tests (smoke.spec.ts, layout.spec.ts, funk.spec.ts).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, type Dialog, type Page } from '@playwright/test';

/** Profil „Lena“ anlegen; danach beginnt der Prolog */
export async function createProfile(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Agentin oder Agent werden/ }).click();
  await page.getByPlaceholder('Wie heißt du?').fill('Lena');
  await page.getByRole('button', { name: /Rekrutierung abschließen/ }).click();
}

/** Dialog bis zum Ende durchklicken; bei Antworten die erste wählen. `onStep` läuft vor jedem Klick (Messungen). */
export async function finishDialog(page: Page, onStep?: () => Promise<void>) {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  while (await dialog.isVisible()) {
    await onStep?.();
    const choice = page.locator('.choice').first();
    if (await choice.isVisible()) await choice.click();
    else await page.locator('.dialog-foot button').click();
  }
}

/**
 * Gesicherte Akte aus e2e/fixtures laden (Datei-Sicherung der Startseite) und wählen; danach steht man im Hauptquartier.
 * Die Sicherungen sind alt: Krümel begrüßt zurück (der Gruß verschwindet, sobald etwas gespeichert wird – darum erst nach
 * dem Neuladen, beim Wählen der Akte). Gibt es die Akte schon (zweites Laden im selben Test), wird sie überschrieben.
 */
export async function loadBackup(page: Page, file: string) {
  const overwrite = (dialog: Dialog) => void dialog.accept(); // „Die Akte gibt es schon. Überschreiben?“
  page.on('dialog', overwrite);
  await page.goto('/');
  const path = fileURLToPath(new URL(`./fixtures/${file}`, import.meta.url));
  const { id, story } = (JSON.parse(readFileSync(path, 'utf8')) as { profile: { id: string; story: { log: unknown[] } } }).profile;
  await page.getByTestId('backup-input').setInputFiles(path);
  await expect(page.locator('.screen.hq')).toBeVisible();
  page.off('dialog', overwrite);
  // Speichern läuft im Hintergrund. Erst neu laden, wenn die Akte in der Datenbank steht: Ein Neuladen bricht ein
  // laufendes Speichern ab (unter Last dauert es mit der großen Akte länger als eine Sekunde).
  await expect
    .poll(
      () =>
        page.evaluate(
          ({ id, entries }) =>
            new Promise<boolean>((resolve) => {
              const open = indexedDB.open('zehn');
              open.onerror = () => resolve(false);
              open.onsuccess = () => {
                const db = open.result;
                if (!db.objectStoreNames.contains('profiles')) return (db.close(), resolve(false));
                const get = db.transaction('profiles').objectStore('profiles').get(id);
                get.onsuccess = () => (db.close(), resolve((get.result as { story?: { log: unknown[] } } | undefined)?.story?.log.length === entries));
                get.onerror = () => (db.close(), resolve(false));
              };
            }),
          { id, entries: story.log.length },
        ),
      { message: 'Akte gespeichert', timeout: 20_000 },
    )
    .toBe(true);
  await page.reload();
  await expect(page.getByRole('button', { name: /Lena/ })).toBeVisible();
  await page.getByRole('button', { name: /Lena/ }).click();
  await expect(page.locator('.screen.hq')).toBeVisible();
  await expect(page.locator('.kruemel-tip.welcome')).toBeVisible();
}
