import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { encodeBackup } from '../../app/backup.ts';
import { REPO_URL, START_TEXTS } from '../../content/texts/shell.ts';
import { defaultAvatar } from '../../content/wardrobe.ts';
import { profile } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';

function upload(input: HTMLInputElement, text: string) {
  const file = new File([text], 'akte.json', { type: 'application/json' });
  fireEvent.change(input, { target: { files: [file] } });
}

describe('Profile', () => {
  it('Startseite ohne Akten: sagt, worum es geht, Enter öffnet den Rekrutierungsbogen', async () => {
    const app = await renderApp();
    expect(screen.getByRole('heading', { name: START_TEXTS.headline })).toBeInTheDocument();
    expect(screen.getByText(START_TEXTS.pitch)).toBeInTheDocument();
    // Absender für Screenreader mit Doppelpunkt („Krümel: Piep. …“), sichtbar nur das kleine Abzeichen
    expect(screen.getByText(START_TEXTS.kruemel, { exact: false }).textContent).toBe(`Krümel: ${START_TEXTS.kruemel}`);
    for (const chip of START_TEXTS.chips) expect(screen.getByText(chip)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agentin oder Agent werden/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gesicherte Akte laden' })).toBeInTheDocument();
    expect(screen.getByText(/echte Tastatur/)).toBeInTheDocument();
    expect(screen.queryByText('Wer meldet sich zum Dienst?')).not.toBeInTheDocument();
    await app.press('{Enter}');
    expect(screen.getByRole('heading', { name: 'Rekrutierungsbogen' })).toBeInTheDocument();
  });

  it('Startseite ohne Akten: das F verschwindet, am Platz hängt der Zettel; Text verrät keine Auflösung', async () => {
    const { container } = await renderApp();
    const gone = container.querySelector('.start-key.gone');
    expect(gone?.textContent).toContain('F');
    expect(gone?.querySelector('.start-note')?.textContent).toBe(START_TEXTS.note);
    expect(container.querySelectorAll('.start-key')).toHaveLength(8);
    const text = [START_TEXTS.headline, START_TEXTS.kruemel, START_TEXTS.pitch, ...START_TEXTS.chips].join(' ');
    expect(text).not.toMatch(/Vanille|Baron|Zylinder/);
  });

  it('Startseite mit Akten: kurzer Satz zum Spiel, darunter die Akten', async () => {
    await renderApp(undefined, { profiles: [profile()] });
    expect(screen.getByText(/Zehn-Finger-Schreiben/)).toBeInTheDocument();
    expect(screen.getByText('Wer meldet sich zum Dienst?')).toBeInTheDocument();
  });

  it('Profil wählen führt ins HQ', async () => {
    const app = await renderApp(undefined, { profiles: [profile()] });
    await app.user.click(screen.getByRole('button', { name: /Lena/ }));
    expect(screen.getByText(/Akt 1 · Grundreihe/)).toBeInTheDocument();
  });

  it('gesicherte Akte laden; fremde Datei zeigt eine verständliche Meldung', async () => {
    await renderApp(undefined, { profiles: [profile({ id: 'x', firstName: 'Max' })] });
    const input = screen.getByTestId('backup-input') as HTMLInputElement;
    upload(input, 'kein json');
    expect(await screen.findByRole('alert')).toHaveTextContent('keine ZEHN-Akte');
    upload(input, encodeBackup(profile({ firstName: 'Lena', xp: 77 }), 0));
    expect(await screen.findByText(/Akt 1 · Grundreihe/)).toBeInTheDocument();
  });

  it('Akte mit vorhandener ID: ohne Zustimmung bleibt alles, mit Zustimmung wird überschrieben', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ firstName: 'Lena', xp: 5 })] });
    const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
    vi.stubGlobal('confirm', confirm);
    const input = screen.getByTestId('backup-input') as HTMLInputElement;
    const backup = encodeBackup(profile({ firstName: 'Lena', xp: 77 }), 0);

    upload(input, backup);
    await app.wait(0);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm.mock.calls[0]?.[0]).toMatch(/gibt es schon/);
    expect((await app.repo.list())[0]?.xp).toBe(5);
    expect(app.store.getState().current).toBeNull();

    upload(input, backup);
    expect(await screen.findByText(/Akt 1 · Grundreihe/)).toBeInTheDocument();
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(await app.repo.list()).toHaveLength(1);
    expect((await app.repo.list())[0]?.xp).toBe(77);
  });

  it('„Neu rekrutieren“ öffnet den Rekrutierungsbogen, „Credits“ die Credits', async () => {
    const app = await renderApp(undefined, { profiles: [profile()] });
    await app.user.click(screen.getByRole('button', { name: /Neu rekrutieren/ }));
    expect(screen.getByRole('heading', { name: 'Rekrutierungsbogen' })).toBeInTheDocument();
    app.store.getState().go({ name: 'profiles' });
    await app.user.click(await screen.findByRole('button', { name: 'Credits' }));
    expect(screen.getByRole('heading', { name: 'Credits' })).toBeInTheDocument();
  });

  it('Rekrutierung: Reiter statt Formular; Frisur, Farben und Hose landen im Profil, Gesperrtes ist ausgeblendet', async () => {
    const app = await renderApp(undefined, { screen: { name: 'create' } });
    const field = (label: string) => within(screen.getByText(label).closest('.field') as HTMLElement);
    await app.user.click(screen.getByRole('tab', { name: 'Haare' }));
    await app.user.click(screen.getByRole('button', { name: 'Afro' })); // Kachel mit eigener Figur
    expect(screen.getByRole('button', { name: 'Afro' })).toHaveAttribute('aria-pressed', 'true');
    expect(field('Haarfarbe').queryByRole('button', { name: /Pink/ })).toBeNull(); // Farbpaket „Neon“ kommt später
    expect(screen.queryByRole('button', { name: /Bob/ })).toBeNull(); // gesperrt: bei der Rekrutierung gar nicht gezeigt
    await app.user.click(field('Haarfarbe').getByRole('button', { name: 'Grau' }));
    await app.user.click(screen.getByRole('tab', { name: 'Hose' }));
    await app.user.click(field('Farbe der Hose').getByRole('button', { name: 'Grün' }));
    await app.user.click(screen.getByRole('button', { name: 'Rock' }));
    await app.user.type(screen.getByPlaceholderText('Wie heißt du?'), 'Lena');
    await app.press('{Enter}');
    expect(app.store.getState().current?.avatar).toMatchObject({ hairStyle: 'afro', hairColor: 'gray', pantsColor: 'green', pants: 'skirt' });
  });

  it('Garderobe: Gesperrtes mit Weg dorthin; Getragenes, das inzwischen gesperrt wäre, bleibt wählbar und warnt', async () => {
    const worn = profile({ avatar: { ...defaultAvatar('w'), hairStyle: 'bob', hairColor: 'pink' } });
    const app = await renderApp(undefined, { profiles: [worn], select: 'p1', screen: { name: 'wardrobe' } });
    await app.user.click(screen.getByRole('tab', { name: 'Haare' }));
    expect(screen.getByRole('button', { name: /^Bob – Trägst du gerade/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Stachelfrisur, gesperrt: Kommt mit dem Rang Geheimagentin/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^Pink – Trägst du gerade/ })).toBeEnabled(); // getragen, warnt wie die Kacheln
    expect(screen.getByRole('button', { name: /^Lila, gesperrt: Farbpaket „Neon“: Kommt mit dem Rang Agentin/ })).toBeDisabled();
  });

  it('Rekrutierung: Würfeln ändert den Codenamen, ohne Vorname kein Abschluss', async () => {
    const app = await renderApp(undefined, { screen: { name: 'create' } });
    const codename = screen.getByDisplayValue(/-\d\d$/) as HTMLInputElement;
    const before = codename.value;
    await app.user.click(screen.getByRole('button', { name: 'Würfeln' }));
    expect(codename.value).not.toBe(before);
    expect(screen.getByRole('button', { name: /Rekrutierung abschließen/ })).toBeDisabled();
    await app.press('{Enter}');
    expect(app.store.getState().current).toBeNull();
    await app.user.click(screen.getByRole('tab', { name: 'Oberteil' }));
    expect(screen.queryByRole('button', { name: /Strickjacke/ })).toBeNull(); // gesperrt: bei der Rekrutierung ausgeblendet
  });

  it('Rekrutierung: Esc führt zurück zur Startseite', async () => {
    const app = await renderApp(undefined, { screen: { name: 'create' } });
    await app.press('{Escape}');
    expect(app.store.getState().screen).toEqual({ name: 'profiles' });
    app.unmount();

    const withProfile = await renderApp(undefined, { profiles: [profile()] });
    await withProfile.user.click(screen.getByRole('button', { name: /Neu rekrutieren/ }));
    await withProfile.press('{Escape}');
    expect(withProfile.store.getState().screen).toEqual({ name: 'profiles' });
  });
});

describe('Profile – Nebenaktionen und Verwaltung', () => {
  const lena = () => profile({ id: 'a', firstName: 'Lena', codename: 'Wolke Sieben' });
  const max = () => profile({ id: 'b', firstName: 'Max', codename: 'Falke Acht' });

  it('„Hilfe & Feedback“ führt in einem neuen Tab zum Repository, in beiden Formen der Startseite', async () => {
    for (const profiles of [[], [lena()]]) {
      const app = await renderApp(undefined, { profiles });
      const link = screen.getByRole('link', { name: /Hilfe & Feedback/ });
      expect(link).toHaveAttribute('href', REPO_URL);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
      expect(link).toHaveAccessibleName('Hilfe & Feedback (öffnet neuen Tab)');
      expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      app.unmount();
    }
  });

  it('ohne Akten gibt es keinen Knopf „Agenten verwalten“', async () => {
    await renderApp();
    expect(screen.queryByRole('button', { name: 'Agenten verwalten' })).toBeNull();
  });

  it('Verwaltungsmodus: Karten wählen nicht mehr, „Fertig“ und Esc beenden ihn', async () => {
    const app = await renderApp(undefined, { profiles: [lena(), max()] });
    await app.user.click(screen.getByRole('button', { name: 'Agenten verwalten' }));
    expect(screen.queryByRole('button', { name: /Neu rekrutieren/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Lena/ })).toBeNull(); // die Karte ist kein Knopf mehr
    await app.user.click(screen.getByText('Lena'));
    expect(app.store.getState().current).toBeNull(); // Klick auf die Karte wählt nicht
    expect(screen.getByRole('button', { name: 'Sichern: Wolke Sieben' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Löschen: Falke Acht' })).toBeInTheDocument();
    await app.user.click(screen.getByRole('button', { name: 'Fertig' }));
    expect(screen.getByRole('button', { name: /Neu rekrutieren/ })).toBeInTheDocument();
    await app.user.click(screen.getByRole('button', { name: 'Agenten verwalten' }));
    await app.press('{Escape}');
    expect(screen.getByRole('button', { name: 'Agenten verwalten' })).toBeInTheDocument();
  });

  it('Sichern lädt die Akte herunter', async () => {
    const app = await renderApp(undefined, { profiles: [lena()] });
    const create = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:akte');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await app.user.click(screen.getByRole('button', { name: 'Agenten verwalten' }));
    await app.user.click(screen.getByRole('button', { name: 'Sichern: Wolke Sieben' }));
    expect(create).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });

  it('Löschen: Rückfrage mit Codename; Esc in der Rückfrage lässt den Modus an; danach bleibt man im Modus', async () => {
    const app = await renderApp(undefined, { profiles: [lena(), max()] });
    await app.user.click(screen.getByRole('button', { name: 'Agenten verwalten' }));
    await app.user.click(screen.getByRole('button', { name: 'Löschen: Wolke Sieben' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Wolke Sieben')).toBeInTheDocument();
    await app.press('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Fertig' })).toBeInTheDocument(); // Esc schloss nur die Rückfrage
    expect(await app.repo.list()).toHaveLength(2);

    await app.user.click(screen.getByRole('button', { name: 'Löschen: Wolke Sieben' }));
    await app.user.type(screen.getByLabelText(/Codenamen/), 'wolke sieben{Enter}');
    expect(await app.repo.list()).toHaveLength(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Lena')).toBeNull();
    expect(screen.getByRole('button', { name: 'Fertig' })).toBeInTheDocument(); // weiter im Verwaltungsmodus
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('die letzte Akte gelöscht: Startseite für neue Spieler', async () => {
    const app = await renderApp(undefined, { profiles: [lena()] });
    await app.user.click(screen.getByRole('button', { name: 'Agenten verwalten' }));
    await app.user.click(screen.getByRole('button', { name: 'Löschen: Wolke Sieben' }));
    await app.user.type(screen.getByLabelText(/Codenamen/), 'Wolke Sieben');
    await app.user.click(screen.getByRole('button', { name: 'Endgültig löschen' }));
    expect(await screen.findByRole('heading', { name: START_TEXTS.headline })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fertig' })).toBeNull();
  });
});
