import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { codeLength } from '../../domain/arcade/tresor.ts';
import { REGEN_LIVES } from '../../domain/arcade/regen.ts';
import { mastered, profile } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';

const player = () => profile({ lessons: mastered('m1-l1') });

describe('Spielhalle', () => {
  it('ist ab dem ersten Auftrag im HQ erreichbar', async () => {
    const app = await renderApp(undefined, { profiles: [player()], select: 'p1' });
    await app.user.click(screen.getByRole('button', { name: /Buchstabenregen/ }));
    expect(app.container).toHaveTextContent(/Gespielt wird mit deinen sicheren Tasten: F J/);
  });

  it('unter dem Spiel die Bildschirmtastatur: die nächste Taste leuchtet, ein Treffer blitzt', async () => {
    const app = await renderApp(undefined, { profiles: [player()], select: 'p1', screen: { name: 'arcade', game: 'tresor' } });
    expect(app.container.querySelector('.arcade-keys .keyboard')).toBeInTheDocument();
    await app.press('{Enter}');
    const code = app.container.querySelector('.code')?.getAttribute('data-code') ?? '';
    const keyOf = (ch: string) => [...app.container.querySelectorAll('.arcade-keys .kb-key')].find((k) => k.textContent?.trim().toLowerCase() === ch);
    expect(keyOf(code[0]!)).toHaveClass('target');
    await app.type(code[0]!);
    expect(keyOf(code[0]!)).toHaveClass('hit');
  });

  it('Tresorknacker: Codes knacken, nach 60 Sekunden Ergebnis und Bestwert', async () => {
    const app = await renderApp(undefined, { profiles: [player()], select: 'p1', screen: { name: 'arcade', game: 'tresor' } });
    await app.press('{Enter}');
    for (let i = 0; i < 6; i++) {
      const code = app.container.querySelector('.code')?.getAttribute('data-code') ?? '';
      await app.type(code);
    }
    expect(app.container.querySelectorAll('.vault .lamp.on').length).toBe(1); // 5 Codes = Tresor 1 offen, dann 1 Lampe
    await app.wait(61_000);
    expect(screen.getByRole('heading', { name: 'Runde geschafft: Tresor 1!' })).toBeInTheDocument();
    expect(screen.getAllByText('★ Bronze')).toHaveLength(2); // Ergebnis und Bestwert-Leiste oben
    expect(screen.getByText('Silber ab Tresor 2')).toBeInTheDocument();
    expect(screen.getByText(/6 Codes geknackt, 1 Tresore offen/)).toBeInTheDocument();
    expect(app.store.getState().current?.arcade.tresor).toMatchObject({ bestLevel: 1, medal: 'bronze' });
    expect(await screen.findByText('Spielkind')).toBeInTheDocument();
  });

  it('Buchstabenregen: abtippen gibt Punkte, drei Aufpraller beenden das Spiel', async () => {
    const app = await renderApp(undefined, { profiles: [player()], select: 'p1', screen: { name: 'arcade', game: 'regen' } });
    await app.press('{Enter}');
    await app.wait(800);
    const drop = app.container.querySelector('.drop')?.textContent ?? '';
    expect(drop).toMatch(/^[fj]+$/);
    await app.type(drop);
    expect(app.sound.played).toContain('segment');
    expect(screen.getByLabelText(`${REGEN_LIVES} Leben`)).toBeInTheDocument();
    // Nichts mehr tippen: Tropfen prallen auf, jedes Mal geht ein Leben verloren
    const lives: number[] = [];
    for (let i = 0; i < 180 && !screen.queryByRole('heading', { name: 'Runde vorbei!' }); i++) {
      const n = Number(app.container.querySelector('.lives')?.getAttribute('aria-label')?.split(' ')[0]);
      if (lives.at(-1) !== n) lives.push(n);
      await app.wait(500);
    }
    expect(lives[0]).toBe(REGEN_LIVES);
    expect(lives).toEqual([...lives].sort((a, b) => b - a)); // nur weniger, nie mehr
    expect(lives.length).toBeGreaterThan(1);
    expect(app.sound.played).toContain('fail'); // Aufprall
    expect(screen.getByRole('heading', { name: 'Runde vorbei!' })).toBeInTheDocument();
    expect(screen.getByText('Bronze ab Welle 3')).toBeInTheDocument();
    expect(app.store.getState().current?.arcade.regen?.plays).toBe(1);
    await app.press('{Enter}'); // Nochmal
    expect(screen.queryByRole('heading', { name: 'Runde vorbei!' })).toBeNull();
  });

  /** Tresorknacker: einen Code knacken, dann die Zeit ablaufen lassen */
  const crackOne = async (app: Awaited<ReturnType<typeof renderApp>>) => {
    await app.type(app.container.querySelector('.code')?.getAttribute('data-code') ?? '');
    await app.wait(61_000);
    expect(screen.getByRole('heading', { name: /Runde/ })).toBeInTheDocument();
  };

  it('Neuer Bestwert kommt aus dem Kern: auch nach einem Spiel mit 0 Punkten', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ lessons: mastered('m1-l1'), arcade: { tresor: { best: 0, plays: 1, bestLevel: 0, medal: null } } })], select: 'p1', screen: { name: 'arcade', game: 'tresor' } });
    await app.press('{Enter}');
    await crackOne(app);
    expect(await screen.findByText(/\+\d+ EP/)).toBeInTheDocument();
    expect(screen.getByText('Neuer Bestwert!')).toBeInTheDocument();
  });

  it('ein schneller Neustart zeigt nicht die Belohnung der alten Runde', async () => {
    const app = await renderApp(undefined, { profiles: [player()], select: 'p1', screen: { name: 'arcade', game: 'tresor' } });
    // Speichern hängt: die alte Runde wird erst fertig, wenn die neue schon läuft
    let release = () => {};
    const save = app.repo.save.bind(app.repo);
    app.repo.save = (p) => new Promise<void>((resolve) => (release = () => void save(p).then(resolve)));
    await app.press('{Enter}');
    await crackOne(app);
    await app.press('{Enter}'); // Nochmal – bevor die alte Runde gespeichert ist
    release();
    await crackOne(app);
    expect(screen.queryByText(/\+\d+ EP/)).toBeNull(); // die neue Runde speichert noch
    release();
    expect(await screen.findByText(/\+\d+ EP/)).toBeInTheDocument();
  });

  it('Tresor: Jubel beim offenen Tresor', async () => {
    const app = await renderApp(undefined, { profiles: [player()], select: 'p1', screen: { name: 'arcade', game: 'tresor' } });
    await app.press('{Enter}');
    expect(screen.queryByText('Tresor 1 offen!')).toBeNull();
    for (let i = 0; i < 5; i++) await app.type(app.container.querySelector('.code')?.getAttribute('data-code') ?? '');
    expect(screen.getByText('Tresor 1 offen!')).toBeInTheDocument();
    await app.wait(1500);
    expect(screen.queryByText('Tresor 1 offen!')).toBeNull();
  });

  it('Startlevel wählen: Pfeiltasten, Grenzen 1 und höchstes Level; der Tresor beginnt dort mit längeren Codes', async () => {
    const reached = profile({ lessons: mastered('m1-l1'), arcade: { tresor: { best: 90, plays: 2, bestLevel: 3, medal: 'gold' } } });
    const fresh = await renderApp(undefined, { profiles: [player()], select: 'p1', screen: { name: 'arcade', game: 'regen' } });
    expect(screen.queryByRole('group', { name: 'Startlevel' })).toBeNull(); // noch nichts geschafft: Level 1
    fresh.container.remove();
    const app = await renderApp(undefined, { profiles: [reached], select: 'p1', screen: { name: 'arcade', game: 'tresor' } });
    expect(screen.getByText(/Start bei Tresor/)).toHaveTextContent('Start bei Tresor 1');
    await app.press('{ArrowLeft}');
    expect(screen.getByText(/Start bei Tresor/)).toHaveTextContent('Tresor 1');
    for (let i = 0; i < 5; i++) await app.press('{ArrowRight}');
    expect(screen.getByText(/Start bei Tresor/)).toHaveTextContent('Tresor 3');
    await app.press('{ArrowLeft}');
    await app.press('{Enter}');
    expect(app.container.querySelector('.code')?.getAttribute('data-code')).toHaveLength(codeLength(1));
    expect(screen.getByText('Tresor', { selector: 'span' })).toHaveTextContent('Tresor 2');
    expect(app.container).toHaveTextContent('★ Gold'); // beste Medaille oben im Spiel
    // nichts geöffnet: Tresor 1 bleibt geschafft, die Runde endet trotzdem mit Bronze
    await app.wait(61_000);
    expect(screen.getByRole('heading', { name: 'Runde geschafft: Tresor 1!' })).toBeInTheDocument();
    expect(screen.getByText('Silber ab Tresor 2')).toBeInTheDocument();
  });

  it('Buchstabenregen: Welle geschafft meldet sich mit Jubel und Bonus', async () => {
    const reached = profile({ lessons: mastered('m1-l1'), arcade: { regen: { best: 10, plays: 1, bestLevel: 2, medal: null } } });
    const app = await renderApp(undefined, { profiles: [reached], select: 'p1', screen: { name: 'arcade', game: 'regen' } });
    await app.press('{ArrowRight}');
    await app.press('{Enter}');
    expect(screen.getByText('Welle', { selector: 'span' })).toHaveTextContent('Welle 2');
    let cheered = false;
    for (let i = 0; i < 400 && !cheered; i++) {
      await app.wait(100);
      for (const d of app.container.querySelectorAll('.drop')) await app.type(d.textContent ?? '');
      cheered = !!screen.queryByText(/Welle 2 geschafft! \+20/);
    }
    expect(cheered).toBe(true);
  });
});
