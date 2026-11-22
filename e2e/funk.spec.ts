// Agentenfunk nach dem Finale: der lange Chat „ZEHN intern“ (772 Nachrichten) bleibt klein im DOM und lädt auf Wunsch nach.
// Obergrenzen für die Zahl der Elemente statt Zeiten (Zeiten schwanken je Rechner; gemessen wird von Hand, siehe docs/technik/tests.md).

import { expect, test } from '@playwright/test';
import { loadBackup } from './helpers.ts';

test('Chat „ZEHN intern“ nach dem Finale: wenige Elemente, „Frühere Nachrichten“ hält die Stelle, Enter drückt den Knopf nicht', async ({ page }) => {
  await loadBackup(page, 'nach-finale.json');
  await page.getByRole('button', { name: 'Später' }).click();
  await page.getByRole('button', { name: /Funk/ }).first().click();
  await page.locator('.funk-side button', { hasText: /intern/i }).first().click();
  const bubbles = page.locator('.chat-log .chat-msg, .chat-log .chat-system');
  await expect(bubbles.first()).toBeVisible();
  const elements = () => page.locator('.chat-log').evaluate((log) => log.querySelectorAll('*').length);

  expect(await bubbles.count(), 'Nachrichten beim Öffnen').toBeLessThanOrEqual(60);
  expect(await elements(), 'Elemente im Chat beim Öffnen').toBeLessThanOrEqual(3000);

  // Ganz nach oben (dort steht der Knopf), eine Blase merken: nach dem Nachladen steht sie an derselben Stelle
  await page.locator('.chat-log').evaluate((el) => {
    el.scrollTop = 0;
  });
  const anchor = await page.locator('.chat-log .chat-msg').nth(5).elementHandle();
  const before = (await anchor!.boundingBox())!;
  const countBefore = await bubbles.count();
  await page.getByRole('button', { name: 'Frühere Nachrichten' }).click();
  await expect(async () => expect(await bubbles.count()).toBeGreaterThan(countBefore)).toPass();
  const after = (await anchor!.boundingBox())!;
  expect(Math.abs(after.y - before.y), 'Stelle im Chat nach dem Nachladen').toBeLessThanOrEqual(2);
  expect(await elements(), 'Elemente nach einmal „Frühere Nachrichten“').toBeLessThanOrEqual(5000);

  // Enter spielt nur Nachrichten ab und drückt den Knopf nicht (sonst kämen weitere 60 dazu)
  const countAfter = await bubbles.count();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  expect(await bubbles.count(), 'Enter lädt nicht nach').toBe(countAfter);
});
