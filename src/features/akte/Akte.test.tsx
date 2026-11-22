import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { START_TEXTS } from '../../content/texts/shell.ts';
import { parseBackup } from '../../app/backup.ts';
import { DAY, T0, mastered, profile, strokes } from '../../test/factories.ts';
import { applyKeystrokes } from '../../domain/keyStats.ts';
import { renderApp } from '../../test/renderApp.tsx';

const history = [60, 70, 80].map((apm, i) => ({ t: i, lessonId: 'm1-l1', kind: 'exercise' as const, apm, accuracy: 0.95, chars: 40 }));

describe('Agentenakte', () => {
  const wärme = (stats: ReturnType<typeof applyKeystrokes>) =>
    renderApp(undefined, { profiles: [profile({ stats, seen: ['briefing:m1-l1'] })], select: 'p1', screen: { name: 'akte' } });
  const miss = (ch: string, n: number, wrong: number) => [...strokes(ch, n - wrong, { ms: 400 }), ...strokes(ch, wrong, { correct: false, ms: 400 })];

  it('Wärmekarte: Legende, „misst noch“ und Liste „Übe besonders“', async () => {
    const app = await wärme(applyKeystrokes(applyKeystrokes({}, miss('f', 10, 1)), strokes('j', 5, { ms: 400 })));
    for (const t of ['80 %', '92 %', '98 %']) expect(screen.getByText(t)).toBeInTheDocument();
    expect(screen.getAllByText('misst noch').length).toBeGreaterThan(0);
    expect(app.container.querySelectorAll('.keyboard .kb-key.measuring')).toHaveLength(1); // J: nur 5 Anschläge
    expect(screen.getByText('Übe besonders: F (linker Zeigefinger, 90 %)')).toBeInTheDocument();
  });

  it('Wärmekarte: eine gedrückte Taste sinkt ein und leuchtet, bis sie losgelassen wird', async () => {
    const app = await wärme(applyKeystrokes({}, strokes('f', 12, { ms: 400 })));
    await app.user.keyboard('{f>}');
    expect(app.container.querySelector('.keyboard.heatmap .kb-key.down')).toHaveTextContent('F');
    await app.user.keyboard('{/f}');
    expect(app.container.querySelector('.keyboard.heatmap .kb-key.down')).toBeNull();
  });

  it('Wärmekarte: ohne wacklige Tasten steht der Lob-Satz, ohne Messung kein Satz', async () => {
    await wärme(applyKeystrokes({}, strokes('f', 12, { ms: 400 })));
    expect(screen.getByText('Alle gemessenen Tasten sitzen. Stark!')).toBeInTheDocument();
  });

  it('Wärmekarte: unter dem Wackeltasten-Satz steht je Taste mit klarem Muster ein Satz zur Bewegung, sonst nichts Neues', async () => {
    const slip = (typed: string) => ({ expected: 'f', correct: false, ms: null, typed });
    const stats = applyKeystrokes({}, [...strokes('f', 20, { ms: 400 }), ...Array.from({ length: 5 }, () => slip('r'))]);
    await wärme(stats);
    expect(screen.getByText(/Übe besonders: F/)).toBeInTheDocument();
    expect(screen.getByText('Beim F greifst du meist eine Reihe zu hoch: linker Zeigefinger, bleib auf der Grundreihe.')).toHaveClass('shaky');
  });

  it('Wärmekarte: ohne klares Muster kein Satz zur Bewegung', async () => {
    await wärme(applyKeystrokes(applyKeystrokes({}, miss('f', 10, 1)), strokes('j', 5, { ms: 400 })));
    expect(screen.queryByText(/Reihe zu|andere Hand|zu früh vor|falsche Hand/)).toBeNull();
  });

  it('Wärmekarte: ohne Messung kein Satz', async () => {
    await wärme({});
    expect(screen.queryByText(/Übe besonders|Stark!/)).toBeNull();
  });

  it('zeigt Werte, Wärmekarte nur für geübte Tasten und Tempokurve', async () => {
    const p = profile({ history, bestApm: 80, seen: ['briefing:m1-l1'], stats: applyKeystrokes({}, strokes('f', 40, { ms: 400 })) });
    const app = await renderApp(undefined, { profiles: [p], select: 'p1', screen: { name: 'akte' } });
    expect(screen.getByText('Tempo-Rekord').previousSibling).toHaveTextContent('80');
    expect(screen.getByText(/Ø Anschläge\/min/).previousSibling).toHaveTextContent('70');
    const heat = app.container.querySelectorAll('.keyboard .kb-key.heat');
    expect(heat).toHaveLength(1); // nur F ist gemessen
    expect(app.container.querySelectorAll('.keyboard .kb-key.measuring')).toHaveLength(1); // J misst noch
    expect(app.container.querySelectorAll('.chart .dot')).toHaveLength(3);
  });

  it('ohne Übungen gibt es noch keine Tempokurve', async () => {
    await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'akte' } });
    expect(screen.getByText(/Die Tempokurve erscheint nach ein paar Übungen/)).toBeInTheDocument();
  });

  it('Akte löschen fragt mit der Rückfrage des Spiels nach: Codename tippen, Abbrechen und Esc ändern nichts', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'akte' } });
    const confirm = vi.fn();
    vi.stubGlobal('confirm', confirm);
    await app.user.click(screen.getByRole('button', { name: 'Akte löschen' }));
    const dialog = screen.getByRole('dialog');
    const codename = app.store.getState().current!.codename;
    expect(dialog).toHaveTextContent(codename);
    await app.user.click(within(dialog).getByRole('button', { name: /Abbrechen/ }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(app.store.getState().current).not.toBeNull();
    await app.user.click(screen.getByRole('button', { name: 'Akte löschen' }));
    await app.press('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('heading', { name: /Agent/ })).toBeInTheDocument(); // Esc hat nur die Rückfrage geschlossen, nicht die Akte
    await app.user.click(screen.getByRole('button', { name: 'Akte löschen' }));
    await app.user.type(screen.getByLabelText(/Codenamen/), codename);
    await app.user.click(screen.getByRole('button', { name: 'Endgültig löschen' }));
    expect(confirm).not.toHaveBeenCalled(); // kein Browser-Fenster
    expect(await app.repo.list()).toHaveLength(0);
    expect(screen.getByRole('heading', { name: START_TEXTS.headline })).toBeInTheDocument(); // keine Akte mehr: Startseite für neue Spieler
  });

  it('Akte als Datei sichern lädt eine lesbare Sicherung herunter', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ xp: 77 })], select: 'p1', screen: { name: 'akte' } });
    let blob: Blob | null = null;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((b) => ((blob = b as Blob), 'blob:akte'));
    const revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await app.user.click(screen.getByRole('button', { name: 'Akte als Datei sichern' }));
    expect(click).toHaveBeenCalledTimes(1);
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.href).toBe('blob:akte');
    expect(link.download).toMatch(/\.json$/);
    await app.wait(0);
    expect(revokeUrl).toHaveBeenCalledWith('blob:akte');
    expect(parseBackup(await blob!.text())).toMatchObject({ id: 'p1', xp: 77 });
    vi.restoreAllMocks();
  });

  describe('Reiter „Für Eltern“', () => {
    it('wechselt den Reiter und erzählt den Stand in einfachen Sätzen', async () => {
      const lessons = mastered('m1-l1');
      const entry = (t: number) => ({ t, lessonId: 'm1-l1', kind: 'exercise' as const, apm: 38, accuracy: 0.94, chars: 40 });
      const app = await renderApp(undefined, {
        profiles: [profile({ lessons, history: [entry(T0 - DAY), entry(T0)], days: { count: 2, lastDay: '2026-10-26' } })],
        select: 'p1',
        screen: { name: 'akte' },
      });
      expect(screen.getByRole('tab', { name: 'Akte' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Tastatur-Wärmekarte')).toBeInTheDocument();
      await app.user.click(screen.getByRole('tab', { name: 'Für Eltern' }));
      expect(screen.queryByText('Tastatur-Wärmekarte')).toBeNull();
      expect(screen.getByText(/1 von \d+ Lektionen im Teil „Grundreihe“ geschafft\. Aktuell: D und K\./)).toBeInTheDocument();
      expect(screen.getByText('Sicher: F J. Noch im Training: D K.')).toBeInTheDocument();
      expect(screen.getByText('An 2 Tagen geübt. In den letzten 7 Tagen: 2 Runden.')).toBeInTheDocument();
      expect(screen.getByText('Genauigkeit zuletzt 94 %, Tempo 38 Anschläge pro Minute.')).toBeInTheDocument();
      expect(screen.getByText('Im Moment fällt keine Taste besonders auf.')).toBeInTheDocument();
      // Pfeiltasten wechseln die Reiter (WAI-ARIA); der Inhalt hängt am gewählten Reiter
      screen.getByRole('tab', { name: 'Für Eltern' }).focus();
      await app.user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', { name: 'Akte' })).toHaveFocus();
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Tastatur-Wärmekarte');
    });

    it('eine einzige Runde in der Woche steht in der Einzahl', async () => {
      const app = await renderApp(undefined, {
        profiles: [profile({ history: [{ t: T0, lessonId: 'm1-l1', kind: 'exercise', apm: 30, accuracy: 0.9, chars: 40 }], days: { count: 1, lastDay: '2026-10-26' } })],
        select: 'p1',
        screen: { name: 'akte' },
      });
      await app.user.click(screen.getByRole('tab', { name: 'Für Eltern' }));
      expect(screen.getByText('An 1 Tag geübt. In den letzten 7 Tagen: 1 Runde.')).toBeInTheDocument();
    });

    it('wacklige Tasten: Hinweis in Elternsprache', async () => {
      const app = await wärme(applyKeystrokes({}, miss('f', 10, 3)));
      await app.user.click(screen.getByRole('tab', { name: 'Für Eltern' }));
      expect(screen.getByText('F (linker Zeigefinger) wird noch oft vertippt. Langsam und genau ist besser als schnell.')).toBeInTheDocument();
    });

    it('ohne Übungen: ehrliche Leersätze', async () => {
      const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'akte' } });
      await app.user.click(screen.getByRole('tab', { name: 'Für Eltern' }));
      expect(screen.getByText('Noch nicht geübt.')).toBeInTheDocument();
      expect(screen.getByText('Noch keine gewertete Übung.')).toBeInTheDocument();
      expect(screen.getByText('Noch keine Taste sitzt ganz sicher. Noch im Training: F J.')).toBeInTheDocument();
    });
  });
});
