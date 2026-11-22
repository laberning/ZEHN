// Durchlauf durch die ganze App ohne Browser: Startseite → Rekrutierung → Prolog → HQ → Briefing → Auftrag → Nachbesprechung.

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp.tsx';
import { profile } from '../test/factories.ts';

describe('App', () => {
  it('Startseite, Rekrutierung, Prolog mit Antworten, HQ, erster Auftrag mit Enter', async () => {
    const app = await renderApp();
    await app.press('{Enter}'); // Startseite: los geht's
    expect(screen.getByRole('heading', { name: 'Rekrutierungsbogen' })).toBeInTheDocument();
    await app.user.type(screen.getByPlaceholderText('Wie heißt du?'), 'Lena');
    await app.user.click(screen.getByRole('tab', { name: 'Oberteil' }));
    await app.user.click(screen.getByRole('button', { name: 'Langarmshirt' }));
    await app.press('{Enter}');

    // Prolog: Enter wird gleich in der ersten Zeile erklärt
    await screen.findByRole('dialog');
    expect(await app.dialogText()).toContain('Weiter mit Enter');
    await app.finishDialog(2);
    expect(await screen.findByText(/Akt 1 · Grundreihe/)).toBeInTheDocument();
    expect(app.store.getState().current?.avatar.outfit).toBe('longsleeve');

    // Enter im HQ startet den aktuellen Auftrag: erst Briefing, dann Übung
    await app.press('{Enter}');
    await screen.findByRole('dialog');
    expect(await app.dialogText()).toContain('Grundstellung');
    await app.finishDialog();
    expect(screen.getByText(/Kalibrierung 1\/2/)).toBeInTheDocument();
    expect(screen.getByText('F – linker Zeigefinger')).toBeInTheDocument();
  }, 15_000); // langer Ablauf durch viele Bildschirme: unter Last mit Coverage über 5 s

  it('ohne Profil führt jeder geschützte Bildschirm zur Profilauswahl', async () => {
    await renderApp(undefined, { profiles: [profile()], screen: { name: 'akte' } });
    expect(screen.getByText('Wer meldet sich zum Dienst?')).toBeInTheDocument();
  });

  it('Esc führt aus Akte, Abzeichen, Garderobe und Credits zurück ins HQ', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1' });
    const targets = [
      ['Agentenakte', 'akte'],
      [/Abzeichen/, 'badges'],
      [/Garderobe/, 'wardrobe'],
      ['Credits', 'credits'],
    ] as const;
    for (const [button, target] of targets) {
      await app.user.click(screen.getByRole('button', { name: button }));
      expect(app.store.getState().screen.name).toBe(target);
      expect(screen.getByRole('button', { name: /Zurück/ })).toBeInTheDocument();
      await app.press('{Escape}');
      expect(app.store.getState().screen.name).toBe('hq');
      expect(screen.getByText(/Akt 1 · Grundreihe/)).toBeInTheDocument();
    }
  });

  it('Rekrutierung: zweimal Enter legt nur ein Profil an', async () => {
    const app = await renderApp(undefined, { screen: { name: 'create' } });
    await app.user.type(screen.getByPlaceholderText('Wie heißt du?'), 'Lena');
    await app.press('{Enter}');
    await app.user.keyboard('{Enter}');
    await app.wait(100);
    expect(await app.repo.list()).toHaveLength(1);
  });

  it('Speichern schlägt fehl → Hinweis oben, Spiel läuft weiter', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1' });
    app.repo.save = () => Promise.reject(new Error('voll'));
    await app.user.click(screen.getByRole('button', { name: /Sound: an/ }));
    expect(await screen.findByText(/Speichern hat gerade nicht geklappt/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sound: aus/ })).toBeInTheDocument();
  });
});
