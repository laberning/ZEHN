import { describe, expect, it, vi } from 'vitest';
import { profile } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';

/** Zeit setzen, nachdem die App steht, und erst dann den Prolog öffnen (die Uhr wird beim Öffnen gelesen) */
async function openPrologAt(date: Date) {
  const app = await renderApp(undefined, { profiles: [profile({ firstName: 'Lena' })], select: 'p1' });
  vi.setSystemTime(date);
  app.store.getState().go({ name: 'story', story: { kind: 'prolog' }, then: { name: 'hq' } });
  return app;
}

describe('Bilderbuch mit echter Tageszeit', () => {
  it('Sonntagabend: Prolog nennt Wochentag und Tageszeit, Ada reagiert auf „Nur ein Brötchen“ mit geschlossener Bäckerei', async () => {
    const app = await openPrologAt(new Date(2026, 10, 1, 19, 30)); // Sonntag
    expect(await app.dialogText()).toContain('Bad Qwertz, Sonntagabend. Heute ist etwas verschwunden.');
    await app.press('{Enter}');
    await app.dialogText();
    await app.press('3');
    await app.dialogText();
    await app.press('{Enter}');
    expect(await app.dialogText()).toContain('Die Bäckerei hat gerade zu');
  });

  it('Dienstagmorgen: der gewohnte Text', async () => {
    const app = await openPrologAt(new Date(2026, 10, 3, 8, 0));
    expect(await app.dialogText()).toContain('Bad Qwertz, Dienstagmorgen. Über Nacht ist etwas verschwunden.');
    await app.press('{Enter}');
    await app.dialogText();
    await app.press('3');
    await app.dialogText();
    await app.press('{Enter}');
    expect(await app.dialogText()).toContain('Das Brötchen kriegst du auch.');
  });
});
