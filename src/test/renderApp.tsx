// Rendert Bildschirme oder die ganze App mit einem echten Store, aber Attrappen statt Datenbank, Ton und Uhr.
// Zeit läuft über Vitest-Fake-Timer; user-event ist daran gekoppelt.

import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { vi } from 'vitest';
import type { Screen } from '../app/navigation.ts';
import type { GameRules } from '../domain/rules.ts';
import { createGameStore } from '../app/store.ts';
import type { Profile } from '../domain/profile.ts';
import type { WardrobeCatalog } from '../domain/wardrobe.ts';
import type { StoryContent } from '../domain/storyContent.ts';
import { memoryRepository } from '../platform/memoryRepository.ts';
import { App } from '../shell/App.tsx';
import { GameProvider } from '../ui/app/GameProvider.tsx';
import { CHARS_PER_TICK, TICK_MS } from '../ui/components/Dialog.tsx';
import { KEY_GRACE_MS } from '../ui/hooks/useKey.ts';
import { T0, clockEnv, soundRecorder } from './factories.ts';

export interface RenderOptions {
  profiles?: Profile[];
  /** Dieses Profil gleich auswählen */
  select?: string;
  /** Startbildschirm (nach dem Auswählen) */
  screen?: Screen;
  /** Pause zwischen Tastendrücken in ms (0 = sofort; >0 = flüssiges Tippen mit messbarem Tempo) */
  delay?: number;
  /** eigene Regeldaten statt der echten (z. B. ein Kurs mit dem vorbereiteten Akt 2) */
  rules?: GameRules;
  /** eigene Story-Inhalte statt der echten */
  story?: StoryContent;
  /** eigener Garderobenkatalog statt des echten */
  wardrobe?: WardrobeCatalog;
}

export async function renderApp(ui: ReactElement = <App />, opts: RenderOptions = {}) {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'] });
  vi.setSystemTime(T0);
  const repo = memoryRepository(opts.profiles ?? []);
  const sound = soundRecorder();
  const store = createGameStore({ repo, sound, env: clockEnv() }, opts.rules, opts.wardrobe, opts.story);
  await store.getState().init();
  if (opts.select) store.getState().selectProfile(opts.select);
  if (opts.screen) store.getState().go(opts.screen);
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime, delay: opts.delay ?? 0 });
  const view = render(<GameProvider store={store}>{ui}</GameProvider>);

  /** Zeit vergehen lassen (Timer, Animationen) */
  const wait = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  };
  /** Wie ein Mensch: kurz warten (Doppel-Enter-Schutz), dann Taste drücken */
  const press = async (key: string) => {
    await wait(KEY_GRACE_MS + 10);
    await user.keyboard(key);
  };
  /** Text tippen (Leerzeichen und Umlaute inklusive; { und [ werden für user-event maskiert) */
  const type = async (text: string) => {
    await user.keyboard(text.replace(/[{[]/g, (c) => c + c));
  };
  /** Wartet, bis der Schreibmaschinen-Effekt der aktuellen Dialogzeile fertig ist */
  const settleTypewriter = async () => {
    const read = () => document.querySelector('[role="dialog"]')?.textContent ?? '';
    let text = read();
    for (let i = 0; i < 2000 / CHARS_PER_TICK; i++) {
      await wait(TICK_MS);
      const next = read();
      if (next === text) return;
      text = next;
    }
  };
  /** Dialog bis zum Ende durchklicken; bei Antworten wird `choice` gewählt */
  const finishDialog = async (choice = 1) => {
    await wait(KEY_GRACE_MS + 10);
    const maxSteps = 80;
    for (let i = 0; i < maxSteps && document.querySelector('.vn'); i++) {
      await settleTypewriter(); // erst abwarten, bis die Zeile ganz da ist (dann erscheinen auch die Antworten)
      // Antworten zählen erst nach der Sperrzeit (Doppeldruck-Schutz)
      if (document.querySelector('.choice')) await press(String(choice));
      else await user.keyboard('{Enter}');
    }
    if (document.querySelector('.vn')) throw new Error(`finishDialog: Dialog nach ${maxSteps} Schritten noch offen`);
  };
  /** Chat im Agentenfunk bis zum Ende durchspielen (Enter überspringt „tippt …“); bei Antworten wird `choice` gewählt */
  const finishChat = async (choice = 1) => {
    await wait(KEY_GRACE_MS + 10);
    const maxSteps = 300;
    for (let i = 0; i < maxSteps && document.querySelector('.funk') && document.querySelector('.funk')?.getAttribute('data-end') !== 'true'; i++) {
      await wait(0);
      const typed = document.querySelector('.typed-answer');
      // Antworten zählen erst nach der Sperrzeit (Doppeldruck-Schutz)
      if (document.querySelector('.chat-choices .choice')) await press(String(choice)); else if (typed && !typed.querySelector('.typed-hint.ok')) await type(typed.getAttribute('data-word') ?? '');
      else await user.keyboard('{Enter}');
    }
    if (document.querySelector('.funk')?.getAttribute('data-end') === 'false') throw new Error(`finishChat: Chat nach ${maxSteps} Schritten noch offen`);
  };
  /** Text des Dialogs, nachdem der Schreibmaschinen-Effekt fertig ist */
  const dialogText = async () => {
    const read = () => document.querySelector('[role="dialog"]')?.textContent ?? '';
    // Die Schreibmaschine zeigt je Takt (TICK_MS) CHARS_PER_TICK Zeichen; fertig ist sie, wenn ein Takt nichts mehr ändert.
    let text = read();
    for (let i = 0; i < 2000 / CHARS_PER_TICK; i++) {
      await wait(TICK_MS);
      const next = read();
      if (next === text) return next;
      text = next;
    }
    throw new Error('dialogText: Schreibmaschine wird nicht fertig');
  };
  return { ...view, store, repo, sound, user, wait, press, type, finishDialog, finishChat, dialogText };
}

/** Den aktuell angezeigten Übungstext lesen */
export function currentText(container: HTMLElement): string {
  return container.querySelector('.text')?.getAttribute('data-text') ?? '';
}
