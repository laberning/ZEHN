import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { typingMs } from '../../domain/chat.ts';
import * as dialog from '../../domain/dialog.ts';
import type { StoryScene } from '../../domain/scenes.ts';
import type { StoryContent } from '../../domain/storyContent.ts';
import { kr } from '../../content/story/builders.ts';
import { REAL_BOOK, profile, storyLog } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';

const t1: StoryScene = {
  id: 't1',
  chat: 'intern',
  trigger: { on: 'briefing', lessonId: 'm1-l1' },
  lines: [
    kr('Hallo {vorname}!'),
    { speaker: 'ada', text: 'Frage an dich?', choices: [
      { id: 'a', label: 'Gern', text: 'Ja, sehr gern!', reply: [kr('Prima.')] },
      { id: 'b', label: 'Lieber nicht', text: 'Lieber nicht, danke.' },
    ] },
  ],
};
const t2: StoryScene = {
  id: 't2',
  chat: 'intern',
  trigger: { on: 'briefing', lessonId: 'm1-l2' },
  lines: [{ speaker: 'juna', text: 'Gerücht!', chat: 'fluestern' }, kr('Psst, privat', { chat: 'kruemel' })],
};
// `fill` zählt, wie oft Blasen ihren Text aufbauen (jede Zeichnung einer Blase ruft es)
vi.mock('../../domain/dialog.ts', async (orig) => {
  const actual = await orig<typeof import('../../domain/dialog.ts')>();
  return { ...actual, fill: vi.fn(actual.fill) };
});

const story: StoryContent = { version: 1, objects: [], items: [], cases: [], ...REAL_BOOK, scenes: [t1, t2] };
/** nur im Chatverlauf suchen – die Chatliste zeigt dieselben Texte als Vorschau */
const chatLog = () => within(screen.getByRole('log'));
const logged = (...ids: string[]) => profile({ story: storyLog(ids) });
const play = (...ids: string[]) => ({ name: 'funk' as const, play: ids });

describe('Agentenfunk', () => {
  it('Nachrichten erscheinen nacheinander mit „tippt …“; Enter zeigt sie sofort', async () => {
    const app = await renderApp(undefined, { profiles: [logged('t1')], select: 'p1', screen: play('t1'), story });
    expect(screen.getByText(/Krümel tippt/)).toBeInTheDocument();
    expect(chatLog().queryByText('Hallo Lena!')).toBeNull();
    expect(app.sound.played).not.toContain('message');
    await app.wait(typingMs('Hallo Lena!'));
    expect(chatLog().getByText('Hallo Lena!')).toBeInTheDocument();
    expect(app.sound.played).toContain('message'); // Pling bei neuer Nachricht
    await app.press('{Enter}'); // nächste sofort
    expect(chatLog().getByText('Frage an dich?')).toBeInTheDocument();
  });

  it('Taste 2 wählt; der ganze Text erscheint als eigene Blase, die Wahl wird gespeichert, die Szene gilt als gelesen', async () => {
    const app = await renderApp(undefined, { profiles: [logged('t1')], select: 'p1', screen: play('t1'), story });
    await app.press('{Enter}');
    await app.press('{Enter}');
    expect(screen.getByRole('button', { name: /Lieber nicht/ })).toBeInTheDocument();
    expect(chatLog().queryByText('Lieber nicht, danke.')).toBeNull(); // nur die Kurzform
    await app.press('2');
    expect(chatLog().getByText('Lieber nicht, danke.')).toBeInTheDocument();
    expect(app.store.getState().current?.story).toMatchObject({ picks: { t1: ['b'] }, read: ['t1'] });
    expect(app.container.querySelector('.funk')).toHaveAttribute('data-end', 'true');
    expect(screen.getByRole('button', { name: /Zurück ins Hauptquartier/ })).toBeInTheDocument();
  });

  it('Enter wählt die markierte Antwort und speichert sie wie eine Zahl', async () => {
    const app = await renderApp(undefined, { profiles: [logged('t1')], select: 'p1', screen: play('t1'), story });
    await app.press('{Enter}');
    await app.press('{Enter}');
    await app.user.keyboard('{ArrowDown}');
    await app.press('{Enter}');
    expect(chatLog().getByText('Lieber nicht, danke.')).toBeInTheDocument();
    expect(app.store.getState().current?.story.picks).toEqual({ t1: ['b'] });
  });

  it('erscheinen Antworten, zählt ein schnelles Enter nicht als Wahl', async () => {
    const app = await renderApp(undefined, { profiles: [logged('t1')], select: 'p1', screen: play('t1'), story });
    await app.press('{Enter}');
    await app.press('{Enter}'); // Frage steht da, die Antworten erscheinen
    await app.user.keyboard('{Enter}'); // sofort hinterher: zu schnell
    expect(app.store.getState().current?.story.picks).toEqual({});
    expect(screen.getByRole('button', { name: /Lieber nicht/ })).toBeInTheDocument();
  });

  it('Zifferntasten: nicht gleich nach dem Erscheinen, nicht gehalten; Pfeile scrollen die Seite nicht', async () => {
    const app = await renderApp(undefined, { profiles: [logged('t1')], select: 'p1', screen: play('t1'), story });
    await app.press('{Enter}');
    await app.press('{Enter}'); // die Antworten erscheinen
    await app.user.keyboard('2'); // sofort hinterher: zu schnell
    expect(app.store.getState().current?.story.picks).toEqual({});
    await app.wait(500);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '2', repeat: true }));
    await app.wait(0);
    expect(app.store.getState().current?.story.picks).toEqual({});
    expect(fireEvent.keyDown(window, { key: 'ArrowDown' })).toBe(false); // preventDefault
    expect(screen.getByRole('button', { name: /Lieber nicht/ })).toHaveClass('picked');
    await app.user.keyboard('2');
    expect(app.store.getState().current?.story.picks).toEqual({ t1: ['b'] });
  });

  it('am Ende verlässt ein schnelles zweites Enter den Funk nicht', async () => {
    const app = await renderApp(undefined, { profiles: [logged('t2')], select: 'p1', screen: { name: 'funk', play: ['t2'], then: { name: 'akte' } }, story });
    await app.press('{Enter}'); // erste Nachricht sofort
    await app.wait(400);
    await app.press('{Enter}'); // letzte Nachricht sofort – jetzt ist das Ende erreicht
    expect(app.container.querySelector('.funk')).toHaveAttribute('data-end', 'true');
    await app.user.keyboard('{Enter}'); // zu schnell
    expect(app.store.getState().screen.name).toBe('funk');
    await app.press('{Enter}');
    expect(app.store.getState().screen.name).toBe('akte');
  });

  it('wer eine Szene abbricht und neu wählt, sieht im Verlauf die neue Wahl', async () => {
    const app = await renderApp(undefined, { profiles: [logged('t1')], select: 'p1', screen: play('t1'), story });
    await app.press('{Enter}');
    await app.press('{Enter}');
    await app.user.keyboard('1');
    await app.press('{Escape}'); // vor dem Ende weg: „Prima.“ ist noch nicht gelesen
    expect(app.store.getState().current?.story.read).toEqual([]);
    app.store.getState().go({ name: 'funk', chat: 'intern' });
    await app.finishChat(2);
    expect(app.store.getState().current?.story.picks).toEqual({ t1: ['b'] });
  });

  it('Esc lässt Ungelesenes ungelesen und geht zurück ins HQ', async () => {
    const app = await renderApp(undefined, { profiles: [logged('t1')], select: 'p1', screen: play('t1'), story });
    await app.press('{Escape}');
    expect(app.store.getState().screen.name).toBe('hq');
    expect(app.store.getState().current?.story.read).toEqual([]);
    expect(screen.getByText(/1 neu/)).toBeInTheDocument(); // HQ: Funk-Knopf
  });

  it('beim Wiederöffnen steht der Verlauf da – mit der gewählten, nicht mit der verworfenen Antwort', async () => {
    const p = profile({ story: storyLog(['t1'], { picks: { t1: ['a'] }, read: ['t1'] }) });
    const app = await renderApp(undefined, { profiles: [p], select: 'p1', screen: { name: 'funk', chat: 'intern' }, story });
    expect(chatLog().getByText('Hallo Lena!')).toBeInTheDocument();
    expect(chatLog().getByText('Ja, sehr gern!')).toBeInTheDocument();
    expect(chatLog().getByText('Prima.')).toBeInTheDocument();
    expect(chatLog().queryByText('Lieber nicht, danke.')).toBeNull();
    expect(app.container.querySelector('.chat-divider')).toBeNull(); // nichts Neues
  });

  it('eine Szene über zwei Chats zeigt die Trennzeile', async () => {
    const app = await renderApp(undefined, { profiles: [logged('t2')], select: 'p1', screen: play('t2'), story });
    await app.finishChat();
    const dividers = [...app.container.querySelectorAll('.chat-divider')].map((d) => d.textContent);
    expect(dividers).toEqual(['Neu', 'Qwertz-Flüstern', 'Krümel (privat)']);
  });

  it('Chatliste mit Ungelesen-Zahl; ein Chat öffnen spielt die ungelesenen Szenen ab', async () => {
    const app = await renderApp(undefined, { profiles: [logged('t1', 't2')], select: 'p1', screen: { name: 'funk' }, story });
    expect(screen.getByRole('button', { name: /ZEHN intern.*2 neu/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Qwertz-Flüstern.*Gerücht!.*1 neu/ })).toBeInTheDocument(); // mit Vorschau
    await app.user.click(screen.getByRole('button', { name: /Qwertz-Flüstern/ }));
    await app.finishChat();
    expect(chatLog().getByText('Gerücht!')).toBeInTheDocument();
    expect(app.store.getState().current?.story.read).toEqual(['t2']);
  });

  it('geöffneter Chat: Esc und der Knopf im Kopf führen direkt ins HQ, nicht zur Chatliste', async () => {
    const p = profile({ story: storyLog(['t1'], { picks: { t1: ['a'] }, read: ['t1'] }) });
    const app = await renderApp(undefined, { profiles: [p], select: 'p1', screen: { name: 'funk', chat: 'intern' }, story });
    await app.press('{Escape}');
    expect(app.store.getState().screen.name).toBe('hq');
    app.store.getState().go({ name: 'funk', chat: 'intern' });
    await app.user.click(await screen.findByRole('button', { name: /Hauptquartier/ }));
    expect(app.store.getState().screen.name).toBe('hq');
  });

  it('leere Chatliste und Esc', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'funk' }, story });
    expect(screen.getByText(/Noch keine Nachrichten/)).toBeInTheDocument();
    await app.press('{Escape}');
    expect(app.store.getState().screen.name).toBe('hq');
  });

  it('selbst getippte Antwort: Fehler leuchten rot, Zahlen und Enter wählen nichts aus, danach Enter', async () => {
    const typedScene: StoryScene = {
      id: 'tt',
      chat: 'intern',
      trigger: { on: 'mastered', lessonId: 'm1-l4' },
      lines: [{ speaker: 'ada', text: 'Bereit?', choices: [{ id: 'ja', label: 'ja', text: 'ja', typed: 'ja', reply: [kr('Du hast selbst geschrieben!')] }] }],
    };
    const app = await renderApp(undefined, { profiles: [logged('tt')], select: 'p1', screen: play('tt'), story: { version: 1, objects: [], items: [], cases: [], ...REAL_BOOK, scenes: [typedScene] } });
    await app.press('{Enter}');
    expect(app.container.querySelector('.typed-answer')).not.toBeNull();
    expect(app.container.querySelector('.chat-choices')).toBeNull();
    expect(app.container.querySelector('.typed-answer .typed-hint')).toHaveTextContent('Finger auf F und J – tippe selbst');
    await app.type('1'); // Zahl: keine Auswahl, aber ein Fehler
    await app.user.keyboard('{Enter}'); // Enter zählt vor dem fertigen Wort nicht
    expect(app.container.querySelector('.typed-answer .miss')).not.toBeNull();
    expect(app.store.getState().current?.story.picks).toEqual({});
    await app.user.keyboard('{CapsLock}');
    await app.type('J'); // zählt nicht: kein Fehler, aber der Hinweis
    expect(screen.getByRole('alert')).toHaveTextContent(/Feststelltaste ist an/);
    await app.user.keyboard('{CapsLock}');
    await app.type('x'); // falsche Taste leuchtet rot, das Wort bleibt stehen
    expect(app.container.querySelectorAll('.typed-answer .ch.correct')).toHaveLength(0);
    await app.type('ja');
    expect(app.container.querySelector('.typed-answer .typed-hint.ok')).not.toBeNull();
    expect(app.store.getState().current?.story.picks).toEqual({});
    await app.press('{Enter}');
    expect(app.store.getState().current?.story.picks).toEqual({ tt: ['ja'] });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(chatLog().getByText('ja')).toBeInTheDocument();
    await app.finishChat();
    expect(chatLog().getByText('Du hast selbst geschrieben!')).toBeInTheDocument();
  });

  it('eine neue Nachricht und „tippt …“ zeichnen den Verlauf nicht neu (Verlauf und Platzhalter bleiben stabil)', async () => {
    const p = profile({ story: storyLog(['t1', 't2'], { picks: { t1: ['a'] }, read: ['t1'] }) });
    const app = await renderApp(undefined, { profiles: [p], select: 'p1', screen: play('t2'), story });
    expect(chatLog().getByText('Prima.')).toBeInTheDocument(); // Verlauf aus t1
    const fill = vi.mocked(dialog.fill);
    fill.mockClear();
    await app.wait(typingMs('Gerücht!'));
    expect(chatLog().getByText('Gerücht!')).toBeInTheDocument();
    // die alten Blasen (Hallo, Frage, Antwort) zeichnen sich nicht neu; neu gezeichnet werden nur die neue Blase und die Vorschauen der Chatliste
    const drawn = fill.mock.calls.map(([text]) => text);
    expect(drawn).toContain('Gerücht!');
    for (const old of ['Hallo {vorname}!', 'Frage an dich?', 'Ja, sehr gern!']) expect(drawn).not.toContain(old);
  });
});
