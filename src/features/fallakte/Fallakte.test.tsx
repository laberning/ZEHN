import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { COURSE } from '../../content/course.ts';
import { SCRATCHED_KRUEMEL, SCRATCHES } from '../../content/texts/fallakte.ts';
import { STORY } from '../../app/rules.ts';
import { masteredModule, profile, storyLog } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';

const open = (outcome: 'passed' | 'backdoor') =>
  renderApp(undefined, {
    profiles: [profile({ lessons: masteredModule(COURSE, 'm1'), exams: { m1: { attempts: outcome === 'passed' ? 1 : 3, outcome } } })],
    select: 'p1',
    screen: { name: 'fallakte', moduleId: 'm1' },
  });

describe('Fallakte', () => {
  it('nach bestandenem Einsatz: Gelöst mit gehaltener Firewall, vier offene Spuren, Krümels Schlusssatz', async () => {
    await open('passed');
    expect(screen.getByRole('heading', { name: 'Fallakte Akt 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Gelöst/ })).toBeInTheDocument();
    expect(screen.getByText('Das F ist gerettet.')).toBeInTheDocument();
    expect(screen.getByText('Firewall: gehalten')).toBeInTheDocument();
    expect(screen.queryByText(/wackelig/)).toBeNull();
    expect(screen.getByRole('heading', { name: /Offene Spuren/ })).toBeInTheDocument();
    for (const q of ['Wer ist neben Ada auf dem Foto?', 'Warum riecht Krümel nach Vanille?', 'Wo ist das O?', 'Was bedeutet der Funkturm?']) expect(screen.getByText(q)).toBeInTheDocument();
    expect(screen.getByText('Den Rest knacken wir als Nächstes. Bis dahin: Spielhalle und Training.')).toBeInTheDocument();
    // vorhandene Bilder stehen neben den Zeilen, beim Funkturm die Goldrand-Karte aus dem Funk
    expect(screen.getAllByRole('img').length).toBeGreaterThan(2);
    expect(screen.getByText('Was bedeutet der Funkturm?').querySelector('.goldcard')).toHaveTextContent('Hoch oben, wo die Funkwellen wohnen');
  });

  it('Verdächtige mit Stempeln; Treffer-Zeile nur mit passender Antwort', async () => {
    await open('passed');
    expect(screen.getByRole('heading', { name: 'Verdächtige' })).toBeInTheDocument();
    expect(screen.getByText('Herr Kringel').parentElement).toHaveTextContent('VERDÄCHTIG');
    expect(screen.getByText('Baron von Backspace').parentElement).toHaveTextContent('GESUCHT');
    expect(screen.queryByText(/Dein Treffer/)).toBeNull();
  });

  it('Verdächtige mit Porträt: die Karte in Gadget-Größe mit ihrem Titel', async () => {
    await open('passed');
    const row = (name: string) => screen.getByText(name).closest('li')!;
    const kringel = row('Herr Kringel').querySelector('.fa-pic svg')!;
    expect(kringel).toHaveAttribute('aria-label', 'Herr Kringel: Dienstmütze und Schnurrbart');
    expect(kringel).toHaveAttribute('viewBox', '0 0 16 16');
    expect(kringel).toHaveClass('pic-gadget');
    expect(row('Baron von Backspace').querySelector('.fa-pic svg')).toHaveAttribute('aria-label', 'Baron von Backspace: nur ein Zylinder und ein Monokel');
  });

  it('jeder Verdächtige jedes Akts hat ein Porträt in Gadget-Größe, keine Bildspalte bleibt leer', async () => {
    const modules = Object.keys(STORY.fallakten);
    expect(modules.length).toBe(COURSE.modules.length);
    const lessons = Object.assign({}, ...COURSE.modules.map((m) => masteredModule(COURSE, m.id))) as ReturnType<typeof masteredModule>;
    const exams = Object.fromEntries(COURSE.modules.map((m) => [m.id, { attempts: 1, outcome: 'passed' as const }]));
    for (const moduleId of modules) {
      const { unmount } = await renderApp(undefined, { profiles: [profile({ lessons, exams })], select: 'p1', screen: { name: 'fallakte', moduleId } });
      const suspects = STORY.fallakten[moduleId]!.suspects;
      for (const s of suspects) {
        const pic = (await screen.findByText(s.name)).closest('li')!.querySelector('.fa-pic svg');
        expect(pic, `${moduleId} ${s.name}`).toHaveClass('pic-gadget');
        expect(pic, `${moduleId} ${s.name}`).toHaveAttribute('viewBox', '0 0 16 16');
        expect(pic!.getAttribute('aria-label'), `${moduleId} ${s.name}`).toBeTruthy();
      }
      unmount();
    }
  });

  it('Treffer-Zeile als Zeile des Kindes', async () => {
    renderApp(undefined, {
      profiles: [profile({ lessons: masteredModule(COURSE, 'm1'), exams: { m1: { attempts: 1, outcome: 'passed' } }, story: { v: 0, log: [], picks: { 'l5-s75': ['zylinder'] }, read: [] } })],
      select: 'p1',
      screen: { name: 'fallakte', moduleId: 'm1' },
    });
    const hit = await screen.findByText(/hast du zuerst gesagt/);
    expect(hit.parentElement).toHaveTextContent('Dein Treffer: „Zylinder“ hast du zuerst gesagt.');
    expect(screen.queryByText(/Kringel hattest du/)).toBeNull();
  });

  it('nach der Hintertür: Firewall wackelig', async () => {
    await open('backdoor');
    expect(screen.getByText('Firewall: wackelig – Einsatz nachholen')).toBeInTheDocument();
    expect(screen.queryByText('Firewall: gehalten')).toBeNull();
  });

  it('das Öffnen setzt den Merker; Esc führt zurück ins HQ', async () => {
    const app = await open('passed');
    expect(app.store.getState().current!.seen).toContain('fallakte:m1');
    await app.press('{Escape}');
    expect(app.store.getState().screen).toEqual({ name: 'hq' });
  });
});

describe('Fallakte: zerkratzt', () => {
  const story = { ...STORY, fallaktenDamage: [{ from: 'schaden', until: 'heil' }] };
  const open = (log: string[]) =>
    renderApp(undefined, {
      profiles: [profile({ lessons: masteredModule(COURSE, 'm1'), exams: { m1: { attempts: 1, outcome: 'passed' } }, story: storyLog(log, { v: STORY.version, picks: { 'l5-s75': ['zylinder'] } }) })],
      select: 'p1',
      screen: { name: 'fallakte', moduleId: 'm1' },
      story,
    });

  it('statt der Zeilen stehen Kratzer unter Titel und Kopfzeile, darunter Krümels Zeile; Verdächtige und Treffer sind verdeckt', async () => {
    const app = await open(['schaden']);
    expect(screen.getByRole('heading', { name: 'Fallakte Akt 1' })).toBeInTheDocument();
    for (const line of SCRATCHES) expect(screen.getByText(line)).toBeInTheDocument();
    expect(screen.getByText(SCRATCHED_KRUEMEL)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Gelöst/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Verdächtige' })).toBeNull();
    expect(screen.queryByText(/Dein Treffer/)).toBeNull();
    // zerkratzt gilt als nicht gelesen: das „Neu“ im HQ bleibt, bis die Akte wieder lesbar geöffnet wurde
    expect(app.store.getState().current!.seen).not.toContain('fallakte:m1');
  });

  it('nach der Wiederherstellung ist die Akte wieder lesbar und das Öffnen setzt den Merker', async () => {
    const app = await open(['schaden', 'heil']);
    expect(screen.getByRole('heading', { name: /Gelöst/ })).toBeInTheDocument();
    expect(screen.queryByText(SCRATCHED_KRUEMEL)).toBeNull();
    expect(app.store.getState().current!.seen).toContain('fallakte:m1');
  });
});
