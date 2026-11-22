// Browser-Test 1 von 2 (Smoke): Läuft die App im echten Browser? Echte Tastatur, echtes Canvas, echte IndexedDB.
// Das Layout auf den Zielgrößen prüft layout.spec.ts; alles Weitere die Unit- und Komponententests (npm test).

import { expect, test } from '@playwright/test';
import { createProfile, finishDialog } from './helpers.ts';

test('App startet, Profil anlegen, Prolog, erste Übung tippen, Spielstand bleibt nach Neuladen', async ({ page }) => {
  await createProfile(page);

  // Prolog durchklicken (Antworten mit 1)
  await finishDialog(page);
  await expect(page.getByText(/Akt 1 · Grundreihe/)).toBeVisible();
  await expect(page.locator('canvas.lpc').first()).toBeVisible(); // LPC-Figur wird gezeichnet

  // Auftrag 1: Briefing überspringen und eine Runde mit der echten Tastatur tippen
  await page.getByRole('button', { name: /Kalibrierung/ }).click();
  await finishDialog(page);
  const text = (await page.locator('.text').getAttribute('data-text')) ?? '';
  expect(text).toMatch(/^[fj ]+$/);
  await page.keyboard.type(text);
  await expect(page.getByText(/geschafft/)).toBeVisible();

  // Spielstand liegt in IndexedDB
  await page.reload();
  await expect(page.getByRole('button', { name: /Lena/ })).toBeVisible();
});
