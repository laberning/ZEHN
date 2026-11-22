import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { COURSE } from '../../content/course.ts';
import { examStory } from '../../domain/book.ts';
import { fill } from '../../domain/dialog.ts';
import { findModule, moduleKeys } from '../../domain/course.ts';
import { COUNTDOWN_FROM, COUNTDOWN_STEP_MS } from '../../domain/examRun.ts';
import { applyKeystrokes } from '../../domain/keyStats.ts';
import type { StoryContent } from '../../domain/storyContent.ts';
import { RULES, STORY } from '../../app/rules.ts';
import { ALL_COURSE, ALL_STORY } from '../../test/content.ts';
import { masteredModule, profile, REAL_BOOK, strokes } from '../../test/factories.ts';
import { currentText, renderApp } from '../../test/renderApp.tsx';

const all = masteredModule(COURSE, 'm1');
const COUNTDOWN_MS = COUNTDOWN_FROM * COUNTDOWN_STEP_MS;
const examTexts = examStory(STORY, 'm1');
const exam = { name: 'exam' as const, moduleId: 'm1' };

describe('Einsatz', () => {
  it('Enter startet, Countdown, Firewall wächst, bestanden → Erfolgs-Story', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ lessons: all })], select: 'p1', screen: exam, delay: 100 });
    await app.press('{Enter}');
    expect(screen.getByText('3')).toBeInTheDocument();
    await app.wait(COUNTDOWN_MS);
    const text = currentText(app.container);
    expect(text.length).toBeGreaterThan(20);
    await app.type(text);
    expect(await screen.findByRole('heading', { name: examTexts.won })).toBeInTheDocument();
    expect(app.container.querySelectorAll('.firewall .up').length).toBe(text.split(' ').length);
    const total = app.container.querySelectorAll('.firewall span').length;
    expect(app.container.querySelector('.firewall')?.getAttribute('aria-label')).toBe(fill(examTexts.segments, { n: total, gesamt: total }));
    expect(screen.getByText('Grundreihe gesichert')).toBeInTheDocument();
    await app.press('{Enter}');
    await screen.findByRole('dialog');
    expect(await app.dialogText()).toContain('unerhört');
  });

  it('bereit, Countdown und Tippen stehen in derselben Anordnung (Fensterhöhe, Seitenleiste); das Ergebnis ist eine normale Seite', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ lessons: all })], select: 'p1', screen: exam });
    const root = () => app.container.querySelector('.exam-screen');
    expect(root()).toHaveClass('typing-phase', 'with-side');
    expect(app.container.querySelector('.screen-side .exam-top')).not.toBeNull();
    expect(app.container.querySelector('.screen-side .firewall')).not.toBeNull();
    await app.press('{Enter}');
    expect(root()).toHaveClass('typing-phase', 'with-side'); // Countdown
    await app.wait(COUNTDOWN_MS);
    expect(root()).toHaveClass('typing-phase', 'with-side'); // Tippen
    expect(app.container.querySelector('.text-scroll')).not.toBeNull();
    await app.wait(61_000);
    await screen.findByRole('heading', { name: examTexts.lost });
    expect(root()).not.toHaveClass('typing-phase');
    expect(root()).not.toHaveClass('with-side');
  });

  it('Zeit abgelaufen → Misserfolgs-Überschrift; nach 3 Versuchen bietet Ada die Hintertür an', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ lessons: all })], select: 'p1', screen: exam });
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    for (let attempt = 1; attempt <= 3; attempt++) {
      await app.wait(61_000);
      expect(await screen.findByRole('heading', { name: examTexts.lost })).toBeInTheDocument();
      expect(screen.getByText(/Die Zeit war zu knapp/)).toBeInTheDocument();
      if (attempt < 3) {
        expect(screen.queryByText('Hintertür nehmen')).toBeNull();
        await app.press('{Enter}'); // Nochmal
        await app.wait(COUNTDOWN_MS);
      }
    }
    await app.user.click(screen.getByRole('button', { name: 'Hintertür nehmen' }));
    expect(app.store.getState().current?.exams.m1?.outcome).toBe('backdoor');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('Spezialtraining übt die schwächsten Tasten', async () => {
    // Alle Tasten sitzen sicher – außer G, H und Ä
    const weak = ['g', 'h', 'ä'];
    const strong = moduleKeys(findModule(COURSE, 'm1')).filter((k) => !weak.includes(k));
    const stats = applyKeystrokes({}, strong.flatMap((k) => strokes(k, 40, { ms: 300 })));
    const app = await renderApp(undefined, { profiles: [profile({ lessons: all, stats })], select: 'p1', screen: exam });
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS + 61_000);
    await app.user.click(await screen.findByRole('button', { name: 'Spezialtraining (G H Ä)' }));
    expect(screen.getByText('› Spezialtraining: G H Ä')).toBeInTheDocument();
    const target = app.store.getState().screen;
    expect(target.name === 'mission' && [...(target.training?.keys ?? [])].sort()).toEqual([...weak].sort());
  });

  it('Szene nach dem Einsatz: erst Bilderbuch-Erfolg (nur beim ersten Mal), dann Funk, dann HQ', async () => {
    const story: StoryContent = {
      version: 1,
      objects: [], items: [], cases: [], ...REAL_BOOK,
      scenes: [{ id: 'nach', chat: 'intern', trigger: { on: 'exam', moduleId: 'm1' }, lines: [{ speaker: 'kruemel', text: 'Er ist weg!' }] }],
    };
    const app = await renderApp(undefined, { profiles: [profile({ lessons: all })], select: 'p1', screen: exam, delay: 100, story });
    // Esc nach dem Erfolg überspringt die Story nicht (wie „geschafft“ in der Mission)
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    await app.type(currentText(app.container));
    await screen.findByRole('heading', { name: examTexts.won });
    expect(screen.queryByRole('button', { name: /Zurück/ })).toBeNull();
    await app.press('{Escape}');
    expect(app.store.getState().screen).toMatchObject({ name: 'story', story: { kind: 'examSuccess' }, then: { name: 'funk', play: ['nach'], then: { name: 'hq' } } });
    await app.finishDialog();
    await app.finishChat();
    expect(within(screen.getByRole('log')).getByText('Er ist weg!')).toBeInTheDocument();
    await app.press('{Enter}');
    expect(app.store.getState().screen.name).toBe('hq');
    // zweites Mal: kein Bilderbuch, die Szene ist gelesen → direkt ins HQ
    await app.store.getState().continueAfterExam('m1');
    expect(app.store.getState().screen).toEqual({ name: 'hq' });
  });

  it('Hintertür führt nach dem Bilderbuch ebenfalls zur Szene im Funk', async () => {
    const story: StoryContent = {
      version: 1,
      objects: [], items: [], cases: [], ...REAL_BOOK,
      scenes: [{ id: 'nach', chat: 'intern', trigger: { on: 'exam', moduleId: 'm1' }, lines: [{ speaker: 'kruemel', text: 'Er ist weg!' }] }],
    };
    const app = await renderApp(undefined, { profiles: [profile({ lessons: all })], select: 'p1', screen: exam, story });
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    for (let attempt = 1; attempt <= 3; attempt++) {
      await app.wait(61_000);
      await screen.findByRole('heading', { name: examTexts.lost });
      if (attempt < 3) {
        await app.press('{Enter}');
        await app.wait(COUNTDOWN_MS);
      }
    }
    await app.user.click(screen.getByRole('button', { name: 'Hintertür nehmen' }));
    expect(app.store.getState().screen).toMatchObject({ name: 'story', story: { kind: 'examBackdoor' }, then: { name: 'funk', play: ['nach'] } });
  });
});

describe('Einsatz in Akt 2', () => {
  // Kurs und Story kommen über den Store (ALL_COURSE, ALL_STORY: so bleibt der Test gültig, auch für vorbereitete Akte)
  const rules = { ...RULES, course: ALL_COURSE };
  const m2 = examStory(ALL_STORY, 'm2');
  const open = () => renderApp(undefined, { profiles: [profile({ lessons: masteredModule(ALL_COURSE, 'm2') })], select: 'p1', screen: { name: 'exam', moduleId: 'm2' }, delay: 100, rules, story: ALL_STORY });

  it('Titel, Ziel-Spruch und Segment-Name kommen aus der Einsatz-Story; Erfolg zeigt „Eingeholt!“', async () => {
    const app = await open();
    expect(screen.getByRole('heading', { name: m2.title })).toBeInTheDocument();
    expect(screen.getByText(m2.ready)).toBeInTheDocument();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    const text = currentText(app.container);
    await app.type(text);
    expect(await screen.findByRole('heading', { name: m2.won })).toBeInTheDocument();
    const total = app.container.querySelectorAll('.firewall span').length;
    expect(app.container.querySelector('.firewall')?.getAttribute('aria-label')).toBe(fill(m2.segments, { n: total, gesamt: total }));
    expect(app.container.querySelector('.firewall')?.getAttribute('aria-label')).toContain('Abstand zum Baron');
  });

  it('Zeit abgelaufen zeigt „Abgehängt“', async () => {
    const app = await open();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS + 61_000);
    expect(await screen.findByRole('heading', { name: m2.lost })).toBeInTheDocument();
  });
});

describe('Einsatz in Akt 3 (Fluss-Modus)', () => {
  const rules = { ...RULES, course: ALL_COURSE };
  const m3 = examStory(ALL_STORY, 'm3');
  const open = () => renderApp(undefined, { profiles: [profile({ lessons: masteredModule(ALL_COURSE, 'm3') })], select: 'p1', screen: { name: 'exam', moduleId: 'm3' }, delay: 100, rules, story: ALL_STORY });

  it('Titel, Ziel-Spruch und Segment-Name kommen aus der Einsatz-Story', async () => {
    const app = await open();
    expect(screen.getByRole('heading', { name: m3.title })).toBeInTheDocument();
    expect(screen.getByText(m3.ready)).toBeInTheDocument();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    expect(app.container.querySelector('.firewall')?.getAttribute('aria-label')).toContain('Tunneln dicht');
  });

  it('ein Fehler leuchtet, das Tippen geht weiter (kein Pflicht-Korrigieren) und der Einsatz ist trotzdem zu schaffen', async () => {
    const app = await open();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    const text = currentText(app.container);
    // eine Taste, die nicht die erwartete ist und nicht Leerzeichen: im Fluss-Modus belegt sie die Stelle
    const wrong = text[0] === 'q' ? 'w' : 'q';
    await app.type(wrong);
    expect(app.container.querySelector('.ch.wrong')).not.toBeNull();
    await app.type(text.slice(1));
    expect(await screen.findByRole('heading', { name: m3.won })).toBeInTheDocument();
  });
});

describe('Einsatz in Akt 4 (vorbereitet, Großschreibung)', () => {
  const rules = { ...RULES, course: ALL_COURSE };
  const m4 = examStory(ALL_STORY, 'm4');
  const open = () => renderApp(undefined, { profiles: [profile({ lessons: masteredModule(ALL_COURSE, 'm4') })], select: 'p1', screen: { name: 'exam', moduleId: 'm4' }, delay: 100, rules, story: ALL_STORY });

  it('Titel, Ziel-Spruch und Segment-Name kommen aus der Einsatz-Story', async () => {
    const app = await open();
    expect(screen.getByRole('heading', { name: m4.title })).toBeInTheDocument();
    expect(screen.getByText(m4.ready)).toBeInTheDocument();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    expect(app.container.querySelector('.firewall')?.getAttribute('aria-label')).toContain('Treppen genommen');
  });

  it('der Text hat Großbuchstaben am Wortanfang und ist mit ihnen zu schaffen', async () => {
    const app = await open();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    const text = currentText(app.container);
    expect(text).toMatch(/(^| )[A-ZÄÖÜ]/);
    await app.type(text);
    expect(await screen.findByRole('heading', { name: m4.won })).toBeInTheDocument();
  });

  it('strikt: ein Tippfehler belegt die Stelle nicht, man muss ihn korrigieren (kein Fluss-Modus)', async () => {
    const app = await open();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    const text = currentText(app.container);
    const wrong = text[0] === 'q' ? 'w' : 'q';
    await app.type(wrong);
    expect(app.container.querySelector('.ch.wrong')).toBeNull();
  });
});

describe('Einsatz in Akt 5 (vorbereitet, Satzzeichen)', () => {
  const rules = { ...RULES, course: ALL_COURSE };
  const m5 = examStory(ALL_STORY, 'm5');
  const open = () => renderApp(undefined, { profiles: [profile({ lessons: masteredModule(ALL_COURSE, 'm5') })], select: 'p1', screen: { name: 'exam', moduleId: 'm5' }, delay: 100, rules, story: ALL_STORY });

  it('Titel, Ziel-Spruch und Segment-Name kommen aus der Einsatz-Story', async () => {
    const app = await open();
    expect(screen.getByRole('heading', { name: m5.title })).toBeInTheDocument();
    expect(screen.getByText(m5.ready)).toBeInTheDocument();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    expect(app.container.querySelector('.firewall')?.getAttribute('aria-label')).toContain('Sätzen gesendet');
  });

  it('der Text enthält Satzzeichen und ist mit ihnen zu schaffen', async () => {
    const app = await open();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    const text = currentText(app.container);
    expect(text).toMatch(/[?!:;"']/);
    await app.type(text);
    expect(await screen.findByRole('heading', { name: m5.won })).toBeInTheDocument();
  });

  it('strikt: ein Tippfehler belegt die Stelle nicht, man muss ihn korrigieren (kein Fluss-Modus)', async () => {
    const app = await open();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    const text = currentText(app.container);
    const wrong = text[0] === 'q' ? 'w' : 'q';
    await app.type(wrong);
    expect(app.container.querySelector('.ch.wrong')).toBeNull();
  });
});

describe('Einsatz in Akt 6 (Zahlen)', () => {
  const rules = { ...RULES, course: ALL_COURSE };
  const m6 = examStory(ALL_STORY, 'm6');
  const open = () => renderApp(undefined, { profiles: [profile({ lessons: masteredModule(ALL_COURSE, 'm6') })], select: 'p1', screen: { name: 'exam', moduleId: 'm6' }, delay: 100, rules, story: ALL_STORY });

  it('Titel, Ziel-Spruch und Segment-Name kommen aus der Einsatz-Story', async () => {
    const app = await open();
    expect(screen.getByRole('heading', { name: m6.title })).toBeInTheDocument();
    expect(screen.getByText(m6.ready)).toBeInTheDocument();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    expect(app.container.querySelector('.firewall')?.getAttribute('aria-label')).toContain('Codes gedreht');
  });

  it('der Text enthält Zahlen und ist mit ihnen zu schaffen', async () => {
    const app = await open();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    const text = currentText(app.container);
    expect(text).toMatch(/[0-9]/);
    await app.type(text);
    expect(await screen.findByRole('heading', { name: m6.won })).toBeInTheDocument();
  });

  it('strikt: ein Tippfehler belegt die Stelle nicht, man muss ihn korrigieren (kein Fluss-Modus)', async () => {
    const app = await open();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    const text = currentText(app.container);
    const wrong = text[0] === 'q' ? 'w' : 'q';
    await app.type(wrong);
    expect(app.container.querySelector('.ch.wrong')).toBeNull();
  });
});

describe('Einsatz in Akt 7 (Sonderzeichen, vorbereitet)', () => {
  const rules = { ...RULES, course: ALL_COURSE };
  const m7 = examStory(ALL_STORY, 'm7');
  const open = (moduleId = 'm7') => renderApp(undefined, { profiles: [profile({ lessons: masteredModule(ALL_COURSE, moduleId) })], select: 'p1', screen: { name: 'exam', moduleId }, delay: 100, rules, story: ALL_STORY });

  it('Titel, Ziel-Spruch und Segment-Name kommen aus der Einsatz-Story; die Gegenstimme ist der Lautsprecher, nicht der Baron', async () => {
    const app = await open();
    expect(screen.getByRole('heading', { name: m7.title })).toBeInTheDocument();
    expect(screen.getByText(m7.ready)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Lautsprecher' })).toBeInTheDocument();
    expect(screen.queryByText('Baron von Backspace')).toBeNull();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    expect(app.container.querySelector('.firewall')?.getAttribute('aria-label')).toContain('Zeilen gehalten');
  });

  it('in Akt 1 bleibt der Baron die Gegenstimme', async () => {
    await open('m1');
    expect(screen.queryByRole('img', { name: 'Lautsprecher' })).toBeNull();
    expect(screen.getByText('Baron von Backspace')).toBeInTheDocument();
  });

  it('der Text enthält Sonderzeichen und ist mit ihnen zu schaffen', async () => {
    const app = await open();
    await app.press('{Enter}');
    await app.wait(COUNTDOWN_MS);
    const text = currentText(app.container);
    expect(text).toMatch(/[@€{}[\]\\~|]/);
    await app.type(text);
    expect(await screen.findByRole('heading', { name: m7.won })).toBeInTheDocument();
  });
});
