// Browser-Test 2 von 2 (Layout): Passt alles ohne Scrollen ins Fenster? Nur ein echter Browser kann Maße messen.
// Zielgrößen sind Fenster nach Abzug der Browserleiste: Tablets, kleine Laptops, große Monitore.
// Handys sind kein Ziel, hier muss nur "sinnvoll" gelten: nichts Wichtiges ragt seitlich hinaus, Scrollen ist erlaubt.

import { expect, test, type Locator, type Page } from '@playwright/test';
import { createProfile, finishDialog, loadBackup } from './helpers.ts';

const TARGETS = [
  { name: 'iPad quer', width: 1024, height: 650 },
  { name: 'iPad hochkant', width: 768, height: 950 },
  { name: 'Android-Tablet quer', width: 1280, height: 700 },
  { name: 'Android-Tablet hochkant', width: 800, height: 1180 },
  { name: 'kleiner Laptop, altes Tablet', width: 1024, height: 560 },
  { name: 'Monitor 1280×900', width: 1280, height: 900 },
  { name: 'Monitor 1920×1080', width: 1920, height: 1080 },
];
const PHONES = [
  { name: 'Handy hochkant', width: 390, height: 750 },
  { name: 'Handy quer', width: 844, height: 350 },
];

const TOL = 1; // Rundung
/** Entwickler-Abkürzung (nur im Dev-Server, gegen den die Tests laufen): tippt den Rest der Runde fehlerfrei, mit 150 ms je Anschlag */
const SKIP_KEY = 'F9';

/** Warten, bis Ein- und Ausblendungen (endliche CSS-Animationen) fertig sind; das Blinken der Schreibmarke läuft weiter */
async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}

/**
 * Die Runde in so hohem Tempo zu Ende tippen (F9: 400 Anschläge pro Minute), dass der nächste Text mit der Höchstlänge
 * von 400 Zeichen kommt. Danach wartet man auf die nächste Runde (Weiter-Knopf des Zwischenergebnisses).
 */
async function skipRound(page: Page) {
  await page.keyboard.press(SKIP_KEY);
}

/** Quer und niedrig: Seitenleiste links, Text und Tastatur rechts (Regel wie `@media` in typing.css) */
const isSideLayout = (size: { width: number; height: number }) => size.height < 760 && size.width / size.height >= 5 / 4 && size.width >= 700;

/** Liegt das Element ganz im Fenster? */
async function expectInWindow(page: Page, el: Locator, what: string) {
  const box = await el.boundingBox();
  const win = page.viewportSize()!;
  expect(box, `${what}: nicht sichtbar`).not.toBeNull();
  expect(box!.x, `${what}: links hinaus`).toBeGreaterThanOrEqual(-TOL);
  expect(box!.y, `${what}: oben hinaus`).toBeGreaterThanOrEqual(-TOL);
  expect(box!.x + box!.width, `${what}: rechts hinaus`).toBeLessThanOrEqual(win.width + TOL);
  expect(box!.y + box!.height, `${what}: unten hinaus`).toBeLessThanOrEqual(win.height + TOL);
}

async function expectNoScroll(page: Page, what: string, vertical = true) {
  const { sh, sw, ih, iw } = await page.evaluate(() => ({
    sh: document.documentElement.scrollHeight,
    sw: document.documentElement.scrollWidth,
    ih: window.innerHeight,
    iw: window.innerWidth,
  }));
  expect(sw, `${what}: waagerechte Überbreite`).toBeLessThanOrEqual(iw);
  if (vertical) expect(sh, `${what}: Seite scrollt`).toBeLessThanOrEqual(ih);
}

/** Schreibmarke samt ihrem 1-px-Rahmen und die nächste Zeile ganz im Textfeld (es rollt weich; darum abwarten, bis es steht) */
async function expectCursorVisible(page: Page, what: string) {
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const box = document.querySelector<HTMLElement>('.text-scroll')!;
          const cursor = document.querySelector<HTMLElement>('.cursor');
          if (!cursor) return 'keine Schreibmarke';
          const lineHeight = parseFloat(getComputedStyle(box).lineHeight);
          const b = box.getBoundingClientRect();
          const c = cursor.getBoundingClientRect();
          const mid = (c.top + c.bottom) / 2;
          if (mid < b.top || mid > b.bottom) return 'Schreibmarke außerhalb';
          if (c.left - 1 < b.left - 0.5 || c.right + 1 > b.right + 0.5) return 'Rahmen der Schreibmarke seitlich abgeschnitten';
          const atEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 1;
          return atEnd || mid + lineHeight / 2 + lineHeight <= b.bottom + 1 ? 'ok' : 'nächste Zeile abgeschnitten';
        }),
      { message: `${what}: Schreibmarke und nächste Zeile sichtbar`, timeout: 5000 },
    )
    .toBe('ok');
}

/** Wie viele ganze Zeilen zeigt das Textfeld? */
async function visibleLines(page: Page) {
  return page.locator('.text-scroll').evaluate((el) => Math.floor((el.clientHeight + 1) / parseFloat(getComputedStyle(el).lineHeight)));
}

/**
 * Die Tippphase passt ins Fenster: Kopf (Übung `.mission-top`, Einsatz `.exam-top`), Text, Hinweiszeile, Schreibmarke und die ganze
 * Tastatur liegen im Fenster, die Seite scrollt nicht; in der Seitenleiste (quer und niedrig) rollt auch sie nicht innen.
 */
async function expectTypingFits(page: Page, what: string, head: string) {
  const size = page.viewportSize()!;
  await settle(page);
  await expectInWindow(page, page.locator(head), `${what}: Kopf`);
  if (await page.locator('.seal-bar').count()) await expectInWindow(page, page.locator('.seal-bar'), `${what}: Siegel-Leiste`);
  await expectInWindow(page, page.locator('.text'), `${what}: Übungstext`);
  await expectInWindow(page, page.locator('.monitor .hint'), `${what}: Hinweiszeile`);
  await expectInWindow(page, page.locator('.desk-keyboard .keyboard'), `${what}: Tastatur`);
  await expectInWindow(page, page.locator('.kb-key').last(), `${what}: letzte Taste`);
  await expectCursorVisible(page, what);
  await expectNoScroll(page, what);
  if (isSideLayout(size)) {
    const side = await page.locator('.screen-side').evaluate((el) => ({ scroll: el.scrollHeight, client: el.clientHeight }));
    expect(side.scroll, `${what}: die Seitenleiste rollt innen`).toBeLessThanOrEqual(side.client + TOL);
  }
}

async function measureStory(page: Page, strict: boolean) {
  const box = page.locator('.dialog-box');
  if (strict) {
    await expectInWindow(page, box, 'Gesprächsbox');
    for (const actor of await page.locator('.actor canvas, .actor svg').all()) await expectInWindow(page, actor, 'Figur');
    const foot = page.locator('.dialog-foot button');
    if (await foot.isVisible()) await expectInWindow(page, foot, '„Weiter“');
    for (const choice of await page.locator('.choice').all()) await expectInWindow(page, choice, 'Antwort');
  }
  await expectNoScroll(page, 'Bilderbuch', strict);
}

for (const size of [...TARGETS, ...PHONES]) {
  const strict = TARGETS.includes(size);
  test(`Layout ${size.name} ${size.width}×${size.height}: Bilderbuch und Übung`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });

    // Startseite ohne Akten: Überschrift, Krümels Zeile, Absatz und Chips bleiben in der Breite (scrollen nach unten darf sie)
    await page.goto('/');
    await expect(page.locator('.start-kruemel')).toBeVisible();
    await expectNoScroll(page, 'Startseite', false);
    for (const sel of ['.start-headline', '.start-kruemel', '.pitch', '.start-chips']) {
      const box = await page.locator(sel).boundingBox();
      expect(box!.x, `Startseite ${sel}: links hinaus`).toBeGreaterThanOrEqual(-TOL);
      expect(box!.x + box!.width, `Startseite ${sel}: rechts hinaus`).toBeLessThanOrEqual(size.width + TOL);
    }

    await createProfile(page);

    // Prolog: bei jedem Schritt (Text, Antworten, andere Figuren) messen, nachdem die Box hereingeglitten ist
    await expect(page.locator('.dialog-box')).toBeVisible();
    await finishDialog(page, async () => {
      await settle(page);
      await measureStory(page, strict);
    });

    await expect(page.getByText(/Akt 1 · Grundreihe/)).toBeVisible();
    // Handy (Akt 1): HQ und Agentenakte ohne Überbreite (Akt 7 misst der Test mit der gesicherten Akte)
    if (!strict) {
      await expectNoScroll(page, 'HQ (Akt 1)', false);
      await page.getByRole('button', { name: 'Agentenakte' }).click();
      await expect(page.locator('.screen.akte')).toBeVisible();
      await expectNoScroll(page, 'Agentenakte (Akt 1)', false);
      await page.locator('.back-btn').click();
      await expect(page.locator('.screen.hq')).toBeVisible();
    }

    // Übungsbildschirm: Aufwärmen in hohem Tempo, dann die erste Übungsrunde mit dem längsten Text (400 Zeichen)
    await page.getByRole('button', { name: /Kalibrierung/ }).click();
    await finishDialog(page);
    await expect(page.locator('.text')).toBeVisible();
    await skipRound(page);
    await page.getByRole('button', { name: /Weiter/ }).click();
    await expect(page.locator('.text')).toBeVisible();
    const text = (await page.locator('.text').getAttribute('data-text')) ?? '';
    expect(text.length, 'Text der Runde').toBeGreaterThanOrEqual(380);
    await settle(page);

    const keyboard = page.locator('.desk-keyboard .keyboard');
    if (strict) {
      // Kopfzeile, Siegel-Leiste, Text, Hinweiszeile und die ganze Tastatur, am Anfang des langen Texts
      await expectTypingFits(page, 'Übungsbildschirm', '.mission-top');
      // lesbar: Tastenbeschriftung mindestens 11 px
      const fontPx = await page.locator('.kb-key').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(fontPx).toBeGreaterThanOrEqual(11);

      // Anordnung: quer und niedrig steht die Leiste links neben dem Text, sonst darüber
      const bar = (await page.locator('.seal-bar').boundingBox())!;
      const box = (await page.locator('.text').boundingBox())!;
      if (isSideLayout(size)) {
        expect(bar.x + bar.width, 'Siegel-Leiste links vom Text').toBeLessThanOrEqual(box.x + TOL);
        if (size.height === 560) {
          // 1024×560: höhere Tasten als die 31 px von früher, mindestens fünf Zeilen Text
          const keyHeight = await page.locator('.kb-key').first().evaluate((el) => parseFloat(getComputedStyle(el).height));
          expect(keyHeight, 'Tastenhöhe').toBeGreaterThanOrEqual(36);
          expect(await visibleLines(page), 'sichtbare Zeilen').toBeGreaterThanOrEqual(5);
        }
      } else {
        expect(bar.y + bar.height, 'Siegel-Leiste über dem Text').toBeLessThanOrEqual(box.y + TOL);
      }

      // Mitrollen: nach der Hälfte des Texts rollt das Feld mit (zeilenweise), Marke und nächste Zeile bleiben sichtbar
      await page.keyboard.type(text.slice(0, Math.floor(text.length / 2)));
      await expectCursorVisible(page, 'nach der Hälfte');
      await expectInWindow(page, keyboard, 'Tastatur nach der Hälfte');
      await expectNoScroll(page, 'nach der Hälfte');
      // liegt die Marke tiefer, als zwei Zeilen unter dem Anfang noch Platz haben, muss das Feld gerollt sein
      const needsScroll = await page.locator('.text-scroll').evaluate((el) => {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
        const cursor = el.querySelector<HTMLElement>('.cursor')!;
        return cursor.offsetTop + 2 * lineHeight > el.clientHeight + 1 && el.scrollHeight > el.clientHeight + 1;
      });
      if (needsScroll) expect(await page.locator('.text-scroll').evaluate((el) => el.scrollTop), 'Text ist mitgerollt').toBeGreaterThan(0);

      // Mit Warnzeile (Ziffer vom Ziffernblock) bleibt die Tastatur im Fenster
      await page.keyboard.press('Shift+Numpad1'); // Playwright meldet Numpad1 ohne Umschalt als „End“; mit Umschalt kommt die Ziffer 1 vom Ziffernblock
      await expect(page.getByRole('alert')).toBeVisible();
      await expectTypingFits(page, 'mit Warnzeile', '.mission-top');

      // Mit der Zeile „ab der nächsten Runde“ (Umschalter nach dem ersten Tastendruck) bleibt die Tastatur im Fenster
      await page.getByRole('button', { name: 'Tastatur: an' }).click();
      await expect(page.locator('.desk-notice')).toBeVisible();
      await expectInWindow(page, page.locator('.desk-notice'), 'Zeile „ab der nächsten Runde“');
      await expectTypingFits(page, 'mit Hinweiszeile zum Umschalter', '.mission-top');

      // Drehung: das Fenster wird hochkant und wieder quer; die Schreibmarke bleibt sichtbar
      if (size.width === 1024 && size.height === 560) {
        await page.setViewportSize({ width: 768, height: 950 });
        await expectTypingFits(page, 'nach der Drehung hochkant', '.mission-top');
        await page.setViewportSize({ width: size.width, height: size.height });
        await expectTypingFits(page, 'nach der Drehung zurück', '.mission-top');
      }
    } else {
      await expect(keyboard).toBeVisible();
    }
    await expectNoScroll(page, 'Übungsbildschirm', strict);
  });
}

// Blindflug: ohne Bildschirmtastatur bleibt der Rest im Fenster
for (const size of [...TARGETS, ...PHONES]) {
  const strict = TARGETS.includes(size);
  test(`Layout ${size.name} ${size.width}×${size.height}: Übung im Blindflug`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await createProfile(page);
    await expect(page.locator('.dialog-box')).toBeVisible();
    await finishDialog(page);
    // im Hauptquartier einschalten, die Übung beginnt dann ohne Tastatur
    await page.getByRole('button', { name: 'Tastatur: an' }).click();
    await page.getByRole('button', { name: /Kalibrierung/ }).click();
    await finishDialog(page);
    await expect(page.locator('.text')).toBeVisible();
    await skipRound(page);
    await page.getByRole('button', { name: /Weiter/ }).click();
    await expect(page.locator('.text')).toBeVisible();
    await settle(page);
    await expect(page.locator('.desk-keyboard')).toHaveCount(0);
    if (strict) {
      await expectInWindow(page, page.locator('.mission-top'), 'Kopfzeile (Blindflug)');
      await expectInWindow(page, page.locator('.seal-bar'), 'Siegel-Leiste (Blindflug)');
      await expectInWindow(page, page.locator('.text'), 'Übungstext (Blindflug)');
    }
    await expectNoScroll(page, 'Übungsbildschirm (Blindflug)', strict);
  });
}

// Startseite im Verwaltungsmodus und offene Rückfrage (gesicherte Akte, damit es eine Akte zu verwalten gibt)
for (const size of [...TARGETS, ...PHONES]) {
  const strict = TARGETS.includes(size);
  test(`Layout ${size.name} ${size.width}×${size.height}: Agenten verwalten und Rückfrage`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await loadBackup(page, 'vor-schaltplan.json');
    await closeWelcome(page);
    await page.getByRole('button', { name: 'Profil wechseln' }).click();
    await page.getByRole('button', { name: 'Agenten verwalten' }).click();
    await expect(page.getByRole('button', { name: 'Fertig' })).toBeVisible();
    await expect(page.locator('.profile-card.managing')).toHaveCount(1);
    await expectNoScroll(page, 'Startseite im Verwaltungsmodus', false);
    await expectInWindow(page, page.locator('.profile-card.managing'), 'Karte im Verwaltungsmodus');
    await page.locator('.profile-card.managing').getByRole('button', { name: /^Löschen/ }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel(/Codenamen/)).toBeFocused();
    await expectNoScroll(page, 'Rückfrage', false);
    // das Fenster passt ohne Überlauf; die Knöpfe sind auf den Zielgrößen ganz zu sehen (auf dem Handy quer rollt der Grund hinter der Rückfrage)
    if (strict) {
      await expectInWindow(page, dialog, 'Rückfrage');
      await expectInWindow(page, page.getByRole('button', { name: 'Abbrechen' }), 'Abbrechen');
      await expectInWindow(page, page.getByRole('button', { name: 'Endgültig löschen' }), 'Endgültig löschen');
    }
    // Esc zählt erst nach der Sperrzeit von useKey: so lange erneut drücken, bis die Rückfrage zu ist
    await expect(async () => {
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0, { timeout: 500 });
    }).toPass();
  });
}

test('Große Fenster behalten die Werte des Monitors (1280×900, Grenze 1100×760)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await createProfile(page);
  await expect(page.locator('.dialog-box')).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.vn')!).getPropertyValue('--px'))).toBe('5px');
  await finishDialog(page);
  await page.getByRole('button', { name: /Kalibrierung/ }).click();
  await finishDialog(page);
  const text = page.locator('.text');
  await expect(text).toBeVisible();
  expect(await text.evaluate((el) => getComputedStyle(el).fontSize)).toBe('30px');
  expect(await page.locator('.kb-key').first().evaluate((el) => getComputedStyle(el).height)).toBe('46px');
  // Grenze der Regeln für wenig Höhe und schmale Fenster: ab 760 px Höhe und 1100 px Breite wie am Monitor
  await page.setViewportSize({ width: 1100, height: 760 });
  expect(await text.evaluate((el) => getComputedStyle(el).fontSize)).toBe('30px');
  expect(await page.locator('.kb-key').first().evaluate((el) => getComputedStyle(el).height)).toBe('46px');
  expect(await page.locator('.mission-screen').evaluate((el) => getComputedStyle(el).paddingBottom)).toBe('48px');
});

// ---- Gesicherte Akten (e2e/fixtures): Akt 4 bis 7, lange Texte in Tippstunde und Einsatz, vier Siegel, schmale Fenster ----

/** HQ nach dem Laden einer alten Sicherung: Krümel begrüßt zurück (der Gruß gehört zur Breite des HQ); danach schließen */
async function closeWelcome(page: Page) {
  await page.getByRole('button', { name: 'Später' }).click();
  await expect(page.locator('.kruemel-tip.welcome')).toHaveCount(0);
}

/** Zurück ins HQ (Knopf; Esc fängt beim Tippen der Text ab) */
async function backToHq(page: Page) {
  await page.locator('.back-btn').click();
  await expect(page.locator('.screen.hq')).toBeVisible();
}

/** Runden eines Auftrags tippen (F9), bis die Nachbesprechung steht */
async function playToDebrief(page: Page) {
  const debrief = page.locator('.debrief');
  for (let i = 0; i < 6 && !(await debrief.isVisible()); i++) {
    await expect(page.locator('.text')).toBeVisible();
    await skipRound(page);
    await expect(debrief.or(page.getByRole('button', { name: /Weiter/ }))).toBeVisible();
    if (!(await debrief.isVisible())) await page.getByRole('button', { name: /Weiter/ }).click();
  }
  await expect(debrief).toBeVisible();
}

/** Der Einsatz des letzten Akts: Knopf im HQ, bis „Einsatz starten“ dasteht */
async function startLastExam(page: Page) {
  await page.locator('.mission.exam button').last().click();
  // vor dem Einsatz läuft die Bilderbuch-Szene, die die Sicherung (nur per Szenario gespielt) noch nicht gesehen hat
  await expect(page.getByRole('dialog').or(page.getByRole('button', { name: /Einsatz starten/ }))).toBeVisible();
  if (await page.getByRole('dialog').isVisible()) await finishDialog(page);
  await expect(page.getByRole('button', { name: /Einsatz starten/ })).toBeVisible();
}

for (const size of TARGETS.filter(isSideLayout)) {
  test(`Layout ${size.name} ${size.width}×${size.height}: lange Texte in Tippstunde und Einsatz (Akt 7), vier Siegel`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });

    // Auftrag mit vier Siegeln („Der Schaltplan“): die Seitenleiste passt ohne inneres Scrollen
    await loadBackup(page, 'vor-schaltplan.json');
    await closeWelcome(page);
    await page.getByRole('button', { name: /Der Schaltplan/ }).click();
    await expect(page.locator('.seal-bar .seal')).toHaveCount(4);
    await expectTypingFits(page, 'vier Siegel (Aufwärmen)', '.mission-top');
    await skipRound(page);
    await page.getByRole('button', { name: /Weiter/ }).click();
    await expect(page.locator('.text')).toBeVisible();
    expect(((await page.locator('.text').getAttribute('data-text')) ?? '').length, 'Text der Runde').toBeGreaterThanOrEqual(380);
    await expect(page.locator('.seal-bar .seal')).toHaveCount(4);
    await expectTypingFits(page, 'vier Siegel, langer Text', '.mission-top');

    // nach dem Finale: Bennos Tippstunde (keine Siegel-Leiste, keine Seitenleiste) mit 400 Zeichen
    await loadBackup(page, 'nach-finale.json');
    await closeWelcome(page);
    await page.getByRole('button', { name: /Bennos Tippstunde/ }).click();
    await expect(page.locator('.text')).toBeVisible();
    expect(((await page.locator('.text').getAttribute('data-text')) ?? '').length, 'Text der Tippstunde').toBeGreaterThanOrEqual(380);
    await expect(page.locator('.with-side')).toHaveCount(0);
    await expectTypingFits(page, 'Tippstunde', '.mission-top');
    await backToHq(page);

    // Einsatz von Akt 7: bereit, Countdown und Tippen stehen in derselben Anordnung (nichts springt)
    await startLastExam(page);
    await expectInWindow(page, page.locator('.exam-top'), 'Einsatz bereit: Kopf');
    await expect(page.locator('.with-side')).toHaveCount(1);
    await page.getByRole('button', { name: /Einsatz starten/ }).click();
    await expect(page.locator('.text')).toBeVisible({ timeout: 10_000 });
    await expectTypingFits(page, 'Einsatz', '.exam-top');
    await expectInWindow(page, page.locator('.firewall'), 'Einsatz: Firewall');
  });
}

test('Schmale Fenster (390×750), Akt 7: HQ, Agentenakte, Auftrag mit Nachbesprechung, Einsatz und Tippstunde ohne Überbreite', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 750 });
  await loadBackup(page, 'nach-finale.json');
  await expectNoScroll(page, 'HQ mit Willkommensgruß', false);
  await closeWelcome(page);
  await expectNoScroll(page, 'HQ', false);

  await page.getByRole('button', { name: 'Agentenakte' }).click();
  await expect(page.locator('.screen.akte')).toBeVisible();
  await expectNoScroll(page, 'Agentenakte', false);
  await page.locator('.back-btn').click();
  await expect(page.locator('.screen.hq')).toBeVisible();

  // Auftrag aus Akt 7: Übungsrunde mit Siegel-Leiste und Krümels Hinweis, dann die Nachbesprechung mit den Siegelkarten
  await page.getByRole('button', { name: /Der Schaltplan/ }).click();
  await expect(page.locator('.seal-bar')).toBeVisible();
  await expectNoScroll(page, 'Übungsrunde', false);
  const hint = await page.locator('.kruemel-hint p').boundingBox();
  expect(hint!.width, 'Krümels Hinweis').toBeGreaterThanOrEqual(160);
  await playToDebrief(page);
  await expectNoScroll(page, 'Nachbesprechung', false);
  await loadBackup(page, 'nach-finale.json');
  await closeWelcome(page);

  // Einsatz von Akt 7: Kopf mit Baron, Titel, Ziel und Zeitbalken
  await startLastExam(page);
  await expectNoScroll(page, 'Einsatz bereit', false);
  await page.getByRole('button', { name: /Einsatz starten/ }).click();
  await expect(page.locator('.text')).toBeVisible({ timeout: 10_000 });
  await expectNoScroll(page, 'Einsatz', false);
  for (const sel of ['.exam-top', '.firewall']) {
    const box = (await page.locator(sel).boundingBox())!;
    expect(box.x + box.width, `Einsatz ${sel}: rechts hinaus`).toBeLessThanOrEqual(390 + TOL);
  }
  // nach dem Einsatz geht es nur über das HQ weiter; ein Neuladen bringt die Sicherung zurück
  await loadBackup(page, 'nach-finale.json');
  await closeWelcome(page);
  await page.getByRole('button', { name: /Bennos Tippstunde/ }).click();
  await expect(page.locator('.text')).toBeVisible();
  await expectNoScroll(page, 'Tippstunde', false);
});
