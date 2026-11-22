import { screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ben, hub, kr, tip } from '../../content/story/builders.ts';
import type { PlayItem } from '../../domain/chat.ts';
import * as dialog from '../../domain/dialog.ts';
import type { Line } from '../../domain/dialog.ts';
import { profile } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';
import { Chat, HISTORY_PAGE } from './Chat.tsx';

// `fill` zählt, wie oft Blasen ihren Text aufbauen (jede Zeichnung einer Blase ruft es einmal)
vi.mock('../../domain/dialog.ts', async (orig) => {
  const actual = await orig<typeof import('../../domain/dialog.ts')>();
  return { ...actual, fill: vi.fn(actual.fill) };
});

const show = (lines: Line[]) =>
  renderApp(<Chat chat="intern" history={lines.map((line, i) => ({ key: String(i), sceneId: 's', chat: 'intern', line }))} items={[]} typing={null} vars={{}} />, {
    profiles: [profile()],
    select: 'p1',
  });

describe('Chat', () => {
  it('Post des Diebs als Goldrand-Papier ohne Titel, andere Karten mit Titel', async () => {
    const app = await show([
      kr('Neue Karte!', { card: { title: 'Goldrand-Karte', text: 'Ein kleiner Gruß.', look: 'goldcard' } }),
      kr('Gefunden:', { card: { title: 'Zettel', text: 'Kauf Mehl.' } }),
    ]);
    expect(app.container.querySelector('.chat-card.goldcard')).toHaveTextContent('Ein kleiner Gruß.');
    expect(screen.queryByText('Goldrand-Karte')).not.toBeInTheDocument();
    expect(screen.getByText('Zettel')).toBeInTheDocument();
  });

  it('ein übergebenes Gadget zeigt sein Bild', async () => {
    await show([kr('Für dich!', { item: 'lupe' })]);
    expect(screen.getByRole('img', { name: 'Kringels Lupe' })).toBeInTheDocument();
  });

  it('Frau Hubbel schreibt mit Namen und Bild (Kürzel H als Reserve), ohne Emoji', async () => {
    const app = await show([hub('Hubbel. Im Archiv ist jemand.')]);
    expect(screen.getAllByText('Frau Hubbel').length).toBeGreaterThan(0);
    expect(app.container.querySelector('.speaker-hubbel .chat-bubble')).toHaveTextContent('Im Archiv ist jemand.');
    expect(app.container.querySelector('.speaker-pic.pic-hubbel')).not.toBeNull();
  });

  it('Tippi korrigiert: der durchgestrichene Teil steht vor dem Text in derselben Blase; Kürzel „T“ statt Bild', async () => {
    const app = await show([tip('Jede Runde ein Lolli!', { strike: 'Jede Runde ein Faden' })]);
    const bubble = app.container.querySelector('.speaker-tippi .chat-bubble')!;
    expect(bubble.querySelector('s.chat-strike')).toHaveTextContent('Jede Runde ein Faden');
    expect(bubble.querySelector('p')).toHaveTextContent('Jede Runde ein Faden Jede Runde ein Lolli!');
    expect(bubble.querySelector('p')!.firstElementChild?.tagName).toBe('S');
    expect(screen.getAllByText('Tippi').length).toBeGreaterThan(0);
    expect(app.container.querySelector('.speaker-pic.pic-tippi')).toHaveTextContent('T');
  });

  it('ohne `strike` gibt es nichts Durchgestrichenes', async () => {
    const app = await show([tip('Gratis, Schätzchen.')]);
    expect(app.container.querySelector('s')).toBeNull();
  });

  it('Benno schreibt mit Namen und Bild (der Baron ohne Hut)', async () => {
    const app = await show([ben('Benno. Nur Benno.')]);
    expect(screen.getAllByText('Benno').length).toBeGreaterThan(0);
    expect(app.container.querySelector('.speaker-benno .chat-bubble')).toHaveTextContent('Nur Benno.');
    expect(app.container.querySelector('.speaker-pic.pic-benno [data-testid="lpc-sprite"]')).not.toBeNull();
  });

  describe('lädt nach', () => {
    const many = (n: number) => Array.from({ length: n }, (_, i) => kr(`Nachricht ${i}`));
    const texts = (container: HTMLElement) => [...container.querySelectorAll('.chat-bubble p')].map((p) => p.textContent);

    it('zeigt zuerst die letzten 60 von 200; der Knopf holt je 60 weitere, bis alles da ist, dann verschwindet er', async () => {
      const app = await show(many(200));
      expect(texts(app.container)).toHaveLength(HISTORY_PAGE);
      expect(texts(app.container).at(0)).toBe('Nachricht 140');
      expect(texts(app.container).at(-1)).toBe('Nachricht 199');
      await app.user.click(screen.getByRole('button', { name: 'Frühere Nachrichten' }));
      expect(texts(app.container)).toHaveLength(120);
      await app.user.click(screen.getByRole('button', { name: 'Frühere Nachrichten' }));
      expect(texts(app.container)).toHaveLength(180);
      await app.user.click(screen.getByRole('button', { name: 'Frühere Nachrichten' }));
      expect(texts(app.container)).toHaveLength(200);
      expect(screen.queryByRole('button', { name: 'Frühere Nachrichten' })).toBeNull();
    });

    it('die erste gezeigte Blase hat Gesicht und Namen, auch wenn davor eine Blase derselben Figur steht', async () => {
      const app = await show(many(100));
      expect(app.container.querySelector('.chat-msg')).toHaveClass('first');
      expect(app.container.querySelector('.chat-msg .chat-name')).not.toBeNull();
      expect(app.container.querySelector('.chat-msg .speaker-pic')).not.toBeNull();
    });

    it('bis 60 Nachrichten gibt es keinen Knopf', async () => {
      await show(many(HISTORY_PAGE));
      expect(screen.queryByRole('button', { name: 'Frühere Nachrichten' })).toBeNull();
    });

    it('der Knopf nimmt den Fokus nicht mit (Enter spielt weiter die nächste Nachricht ab)', async () => {
      const app = await show(many(200));
      await app.user.click(screen.getByRole('button', { name: 'Frühere Nachrichten' }));
      expect(document.activeElement).not.toBe(screen.getByRole('button', { name: 'Frühere Nachrichten' }));
    });
  });

  it('eine neue Nachricht zeichnet die alten Blasen nicht neu', async () => {
    const vars = {};
    const Harness = () => {
      const [items, setItems] = useState<PlayItem[]>([]);
      // der Verlauf wird bei jeder Zeichnung neu aufgebaut (neue Objekte), wie chatHistory es tut
      const history = Array.from({ length: 30 }, (_, i) => ({ key: String(i), sceneId: 's', chat: 'intern' as const, line: kr(`Alt ${i}`) }));
      return (
        <>
          <button onClick={() => setItems((l) => [...l, { id: l.length, sceneId: 's', chat: 'intern', line: kr(`Neu ${l.length}`) }])}>mehr</button>
          <Chat chat="intern" history={history} items={items} typing={null} vars={vars} />
        </>
      );
    };
    const app = await renderApp(<Harness />, { profiles: [profile()], select: 'p1' });
    const fill = vi.mocked(dialog.fill);
    fill.mockClear();
    await app.user.click(screen.getByRole('button', { name: 'mehr' }));
    expect(screen.getByText('Neu 0')).toBeInTheDocument();
    expect(fill.mock.calls.length).toBeLessThanOrEqual(2); // nur die neue Blase (sonst käme jede der 30 alten dazu)
  });
});
