import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseBackup } from '../../app/backup.ts';
import { profile } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';
import { ConfirmDelete } from './ConfirmDelete.tsx';

const p = profile({ codename: 'Wolke Sieben' });

async function open() {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const app = await renderApp(<ConfirmDelete profile={p} onConfirm={onConfirm} onCancel={onCancel} />);
  return { app, user: app.user, onConfirm, onCancel };
}

afterEach(() => vi.restoreAllMocks());

describe('ConfirmDelete', () => {
  it('Fokus im Eingabefeld; „Endgültig löschen“ erst bei passendem Codenamen (Groß-/Kleinschreibung und Ränder egal)', async () => {
    const { user, onConfirm } = await open();
    const input = screen.getByLabelText('Tippe den Codenamen zum Bestätigen');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(input).toHaveFocus();
    const del = screen.getByRole('button', { name: 'Endgültig löschen' });
    expect(del).toBeDisabled();
    await user.type(input, 'wolke');
    expect(del).toBeDisabled();
    await user.type(input, ' sieben  ');
    expect(del).toBeEnabled();
    await user.click(del);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('Enter bestätigt nur bei passendem Codenamen', async () => {
    const { user, onConfirm } = await open();
    await user.type(screen.getByLabelText(/Codenamen/), 'falsch{Enter}');
    expect(onConfirm).not.toHaveBeenCalled();
    await user.clear(screen.getByLabelText(/Codenamen/));
    await user.type(screen.getByLabelText(/Codenamen/), 'Wolke Sieben{Enter}');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('Esc und „Abbrechen“ schließen ohne Folgen', async () => {
    const { app, user, onConfirm, onCancel } = await open();
    await app.press('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /Abbrechen/ }));
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('der Fokus bleibt in der Rückfrage (Tab und Umschalt+Tab laufen im Kreis)', async () => {
    const { user } = await open();
    // Reihenfolge: Vorher sichern, Eingabefeld, (Endgültig löschen gesperrt), Abbrechen
    expect(screen.getByLabelText(/Codenamen/)).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: /Abbrechen/ })).toHaveFocus();
    await user.tab(); // am Ende zurück an den Anfang
    expect(screen.getByRole('button', { name: 'Vorher sichern' })).toHaveFocus();
    await user.tab({ shift: true }); // am Anfang zurück ans Ende
    expect(screen.getByRole('button', { name: /Abbrechen/ })).toHaveFocus();
  });

  it('„Vorher sichern“ lädt die Akte herunter, ohne die Rückfrage zu schließen', async () => {
    let blob: Blob | null = null;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((b) => ((blob = b as Blob), 'blob:akte'));
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const { user, onCancel, onConfirm } = await open();
    await user.click(screen.getByRole('button', { name: 'Vorher sichern' }));
    expect(click).toHaveBeenCalledTimes(1);
    expect(parseBackup(await (blob as unknown as Blob).text())).toMatchObject({ codename: 'Wolke Sieben' });
    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('Tippen im Feld löst keine Spiel-Tasten aus (Enter ohne Treffer tut nichts)', async () => {
    const { user, onConfirm, onCancel } = await open();
    await user.type(screen.getByLabelText(/Codenamen/), 'abc 123');
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
