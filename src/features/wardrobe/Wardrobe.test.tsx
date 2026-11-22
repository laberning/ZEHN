import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WARDROBE, defaultAvatar } from '../../content/wardrobe.ts';
import { profile, storyLog } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';

describe('Garderobe', () => {
  it('Enter zieht an und führt ins HQ; ein schnelles zweites Enter speichert nicht noch einmal', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'wardrobe' } });
    // langsame Datenbank: das Speichern dauert, während das Kind noch einmal Enter drückt
    let saves = 0;
    app.repo.save = () => (saves++, new Promise<void>(() => {}));
    await app.press('{Enter}');
    await app.user.keyboard('{Enter}');
    expect(app.store.getState().screen.name).toBe('hq');
    expect(saves).toBe(1);
  });

  it('im Koffer zieht Enter nichts an', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'wardrobe', tab: 'koffer' } });
    await app.press('{Enter}');
    expect(screen.getByRole('tab', { name: 'Koffer' })).toHaveAttribute('aria-selected', 'true');
    expect(app.store.getState().screen.name).toBe('wardrobe');
  });

  it('Extras: Farbreihe für die Kopfbedeckung nur mit Stirnband; Wahl landet nach Anziehen im Profil, Paketfarbe ist gesperrt', async () => {
    const worn = profile({ avatar: { ...defaultAvatar('w'), outfitColor: 'green', head: 'headband', headColor: 'green' } });
    const app = await renderApp(undefined, { profiles: [worn], select: 'p1', screen: { name: 'wardrobe' } });
    await app.user.click(screen.getByRole('tab', { name: /Extras/ }));
    const row = () => within(screen.getByText('Farbe der Kopfbedeckung').closest('.field') as HTMLElement);
    expect(row().getByRole('button', { name: 'Grün' })).toHaveAttribute('aria-pressed', 'true');
    expect(row().getByRole('button', { name: /^Himmelblau, gesperrt/ })).toBeDisabled(); // Farbpaket „Frühling“
    await app.user.click(row().getByRole('button', { name: 'Rot' }));

    await app.user.click(within(screen.getByText('Kopfbedeckung').closest('.field') as HTMLElement).getByRole('button', { name: /^Ohne/ }));
    expect(screen.queryByText('Farbe der Kopfbedeckung')).toBeNull();
    await app.user.click(screen.getByRole('button', { name: /^Stirnband/ }));
    expect(row().getByRole('button', { name: 'Rot' })).toHaveAttribute('aria-pressed', 'true');

    await app.press('{Enter}');
    expect(app.store.getState().current?.avatar).toMatchObject({ head: 'headband', headColor: 'red', outfitColor: 'green' });
  });

  it('Extras: die Zeile „Zubehör“ gibt es nur, wenn der Katalog ein Teil außer „Ohne“ hat; Farbreihe nur mit Schal', async () => {
    // ein Katalog ohne Zubehör (der Katalog des Spiels hat seit Akt 2 den Schal)
    const none = { ...WARDROBE, accessories: WARDROBE.accessories.filter((a) => a.id === 'none') };
    const without = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'wardrobe' }, wardrobe: none });
    await without.user.click(screen.getByRole('tab', { name: /Extras/ }));
    expect(screen.queryByText('Zubehör')).toBeNull();
    without.unmount();

    // ein frei wählbarer Schal (ohne Quelle)
    const wardrobe = { ...none, accessories: [...none.accessories, { id: 'scarf', name: 'Schal', parts: ['scarf'] }] };
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'wardrobe' }, wardrobe });
    await app.user.click(screen.getByRole('tab', { name: /Extras/ }));
    expect(screen.getByText('Zubehör')).toBeInTheDocument();
    expect(screen.queryByText('Farbe des Zubehörs')).toBeNull();
    await app.user.click(screen.getByRole('button', { name: /^Schal/ }));
    const row = within(screen.getByText('Farbe des Zubehörs').closest('.field') as HTMLElement);
    await app.user.click(row.getByRole('button', { name: 'Rot' }));
    await app.press('{Enter}');
    expect(app.store.getState().current?.avatar).toMatchObject({ accessory: 'scarf', accessoryColor: 'red' });
  });

  it('neues Farbpaket: Punkt am Reiter Extras nur, wenn dort die Farbreihe der Kopfbedeckung zu sehen ist', async () => {
    // Stirnband schon gesehen, Farbpaket „Frühling“ neu
    const wardrobeWith = (head: string) => {
      const base = profile({ avatar: { ...defaultAvatar('w'), head }, seen: ['item:headband'] });
      return { ...base, story: { ...base.story, log: [{ id: 'gift-stirnband', t: 1 }, { id: 'rank-anwaerter', t: 2 }] } };
    };
    const without = await renderApp(undefined, { profiles: [wardrobeWith('none')], select: 'p1', screen: { name: 'wardrobe' } });
    expect(screen.getByRole('tab', { name: /^Oberteil\s*, neu$/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Extras$/ })).toBeInTheDocument();
    without.unmount();

    await renderApp(undefined, { profiles: [wardrobeWith('headband')], select: 'p1', screen: { name: 'wardrobe' } });
    expect(screen.getByRole('tab', { name: /^Extras\s*, neu$/ })).toBeInTheDocument();
  });

  it('Figur drehen: Spiegel und alle Kacheln drehen mit', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'wardrobe' } });
    const tileFacing = (name: RegExp) => within(screen.getByRole('button', { name })).getByTestId('lpc-sprite').dataset.facing;
    const mirror = () => within(screen.getByText('Spiegel').parentElement!).getByTestId('lpc-sprite');
    expect(mirror()).toHaveAttribute('data-facing', 'down');

    await app.user.click(screen.getByRole('button', { name: 'Figur nach rechts drehen' }));
    await app.user.click(screen.getByRole('button', { name: 'Figur nach rechts drehen' }));
    expect(mirror()).toHaveAttribute('data-facing', 'up');
    expect(mirror()).toHaveTextContent('Avatar von hinten');

    await app.user.click(screen.getByRole('tab', { name: /Haare/ }));
    expect(tileFacing(/^Pferdeschwanz/)).toBe('up');
    await app.user.click(screen.getByRole('tab', { name: /Extras/ }));
    expect(tileFacing(/^Stirnband/)).toBe('up');
    expect(tileFacing(/^Runde Brille/)).toBe('up');
    await app.user.click(screen.getByRole('tab', { name: /Hose/ }));
    expect(tileFacing(/^Jeans/)).toBe('up');

    await app.user.click(screen.getByRole('button', { name: 'Figur nach links drehen' }));
    expect(mirror()).toHaveAttribute('data-facing', 'right');
  });

  describe('Beweisfach im Koffer', () => {
    const koffer = (ids: string[], extra: Parameters<typeof profile>[0] = {}) =>
      renderApp(undefined, { profiles: [profile({ story: storyLog(ids, { v: 99 }), ...extra })], select: 'p1', screen: { name: 'wardrobe', tab: 'koffer' } });

    it('ohne Beweisfach gibt es nichts zu öffnen', async () => {
      await koffer([]);
      expect(screen.queryByRole('list', { name: /Beweisstück/ })).toBeNull();
    });

    it('zeigt gefundene Stücke als Kacheln; der Betrachter öffnet per Klick, Esc schließt ihn und bleibt im Koffer', async () => {
      const app = await koffer(['l5-s75']);
      const strip = screen.getByRole('list', { name: 'Inhalt: ein Beweisstück' });
      expect(within(strip).getAllByRole('button')).toHaveLength(1);
      expect(screen.queryByRole('button', { name: 'Das halbe Foto ansehen' })).toBeNull();

      const thumb = screen.getByRole('button', { name: 'Die Feder ansehen' });
      await app.user.click(thumb);
      const viewer = screen.getByRole('dialog', { name: 'Die Feder' });
      expect(viewer).toHaveAttribute('aria-modal', 'true');
      expect(within(viewer).getByRole('button', { name: /Schließen/ })).toHaveFocus();
      // nur ein Stück: kein Blättern, Fallakte noch zu
      expect(within(viewer).queryByRole('button', { name: 'Nächstes Beweisstück' })).toBeNull();
      expect(within(viewer).queryByRole('button', { name: 'Zur Fallakte' })).toBeNull();

      await app.press('{Escape}');
      expect(screen.queryByRole('dialog', { name: 'Die Feder' })).toBeNull();
      expect(thumb).toHaveFocus();
      expect(app.store.getState().screen.name).toBe('wardrobe');
      await app.user.keyboard('{Enter}'); // Fokus auf der Kachel: Enter öffnet, zieht aber nichts an
      expect(screen.getByRole('dialog', { name: 'Die Feder' })).toBeInTheDocument();
      expect(app.store.getState().screen.name).toBe('wardrobe');
      await app.user.click(document.querySelector('.evidence-backdrop')!); // Klick neben das Fenster schließt
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('blättert mit Pfeilen und Knöpfen, hält den Fokus im Fenster, führt mit offener Fallakte dorthin', async () => {
      const app = await koffer(['l5-s75', 'exam-after-foto'], { exams: { m1: { attempts: 1, outcome: 'passed' } } });
      expect(screen.getByRole('list', { name: 'Inhalt: 2 Beweisstücke' })).toBeInTheDocument();
      await app.user.click(screen.getByRole('button', { name: 'Das halbe Foto ansehen' }));
      expect(screen.getByRole('dialog', { name: 'Das halbe Foto' })).toHaveTextContent('2 / 2');
      await app.user.keyboard('{ArrowRight}');
      expect(screen.getByRole('dialog', { name: 'Die Feder' })).toHaveTextContent('1 / 2');
      await app.user.click(screen.getByRole('button', { name: 'Voriges Beweisstück' }));
      expect(screen.getByRole('dialog', { name: 'Das halbe Foto' })).toBeInTheDocument();

      // Tab vom letzten Knopf springt zum ersten zurück
      screen.getByRole('button', { name: /Schließen/ }).focus();
      await app.user.tab();
      expect(screen.getByRole('button', { name: 'Voriges Beweisstück' })).toHaveFocus();
      await app.user.tab({ shift: true });
      expect(screen.getByRole('button', { name: /Schließen/ })).toHaveFocus();

      // Klick auf den Text: Fokus bleibt im Fenster, Pfeiltasten und Tab wirken weiter
      await app.user.click(screen.getByText('Ada, vor langer Zeit. Neben ihr war jemand.'));
      expect(screen.getByRole('dialog')).toHaveFocus();
      await app.user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('dialog', { name: 'Die Feder' })).toBeInTheDocument();
      await app.user.tab({ shift: true });
      expect(screen.getByRole('button', { name: /Schließen/ })).toHaveFocus();
      screen.getByRole('dialog').focus();
      await app.user.tab();
      expect(screen.getByRole('button', { name: 'Voriges Beweisstück' })).toHaveFocus();

      await app.user.click(screen.getByRole('button', { name: 'Zur Fallakte' }));
      expect(app.store.getState().screen).toEqual({ name: 'fallakte', moduleId: 'm1' });
    });
  });
});
