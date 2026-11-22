// Agenten-Chat: Verlauf aus Log und Antworten, Abspielen mit Warteschlange über mehrere Chats.

import { describe, expect, it } from 'vitest';
import { kr } from '../content/story/builders.ts';
import { profile, storyLog } from '../test/factories.ts';
import { GAP_MS, chatHistory, chatList, chatPreview, incomingMessage, currentItem, dividerBefore, isEnd, isTyping, offeredChoices, playReducer, playStart, sceneMessages, sceneSender, typingMs, lineTypingMs, visibleItems, type ChatPlay } from './chat.ts';
import { NO_CONTEXT, dialogStart, type Line } from './dialog.ts';
import { timeOf } from './daytime.ts';
import { logScenes, type StoryScene } from './scenes.ts';

const ask: Line = kr('Frage?', {
  choices: [
    { id: 'a', label: 'Ja', text: 'Ja, gern!', reply: [kr('Prima.')] },
    { id: 'b', label: 'Nein', text: 'Lieber nicht.' },
    { id: 'g', label: 'Mit Gadget', text: 'Mit Lupe!', needs: 'lupe', reply: [kr('Gut gesehen.')] },
  ],
});
const s1: StoryScene = { id: 's1', chat: 'intern', trigger: { on: 'briefing', lessonId: 'a1' }, lines: [kr('Hallo {vorname}'), ask, kr('Ende')] };
const s2: StoryScene = {
  id: 's2',
  chat: 'intern',
  trigger: { on: 'briefing', lessonId: 'a2' },
  lines: [{ speaker: 'juna', text: 'Gerücht!', chat: 'fluestern' }, kr('Psst', { chat: 'kruemel' }), { speaker: 'system', text: 'Ada ist offline.' }],
};
const story = { scenes: [s1, s2] };
const logged = (picks: Record<string, string[]> = {}) => profile({ story: storyLog(['s1', 's2'], { picks }) });

describe('Verlauf', () => {
  it('gewählte Antworten erscheinen mit ganzem Text und Reaktion, nicht gewählte gar nicht', () => {
    const texts = (chat: 'intern', picks: string[]) => sceneMessages(s1, picks).filter((m) => m.chat === chat).map((m) => m.line.text);
    expect(texts('intern', ['a'])).toEqual(['Hallo {vorname}', 'Frage?', 'Ja, gern!', 'Prima.', 'Ende']);
    expect(texts('intern', ['b'])).toEqual(['Hallo {vorname}', 'Frage?', 'Lieber nicht.', 'Ende']);
    expect(texts('intern', [])).toEqual(['Hallo {vorname}', 'Frage?', 'Ende']);
    expect(sceneMessages(s1, ['a']).every((m) => !m.line.choices)).toBe(true);
  });

  it('Zeilen mit eigenem Chat stehen im Verlauf ihres Chats; nur Chats mit Zeilen erscheinen', () => {
    const p = logged();
    expect(chatHistory(p, story, 'fluestern').map((m) => m.line.text)).toEqual(['Gerücht!']);
    expect(chatHistory(p, story, 'kruemel').map((m) => m.line.text)).toEqual(['Psst']);
    expect(chatHistory(p, story, 'intern').map((m) => m.line.text)).toContain('Ada ist offline.');
    expect(chatList(p, story)).toEqual(['intern', 'kruemel', 'fluestern']);
    expect(chatList(logScenes(profile(), ['s1'], 1), story)).toEqual(['intern']);
    expect(chatHistory(p, story, 'intern', new Set(['s1', 's2']))).toEqual([]);
  });

  it('Antwort und Reaktion ohne eigenen Chat stehen im Chat der fragenden Zeile – im Verlauf und beim Abspielen', () => {
    const privat: StoryScene = {
      id: 'p',
      chat: 'intern',
      trigger: { on: 'briefing', lessonId: 'a1' },
      lines: [kr('Psst.', { chat: 'kruemel', choices: [{ id: 'a', label: 'Ja', text: 'Ja!', reply: [kr('Abgemacht.'), kr('Ada hört mit.', { chat: 'intern' })] }] })],
    };
    const chats = (msgs: { chat: string; line: Line }[]) => msgs.map((m) => `${m.chat}:${m.line.text}`);
    expect(chats(sceneMessages(privat, ['a']))).toEqual(['kruemel:Psst.', 'kruemel:Ja!', 'kruemel:Abgemacht.', 'intern:Ada hört mit.']);
    const played = playReducer(playStart([privat], NO_CONTEXT), { type: 'shown' });
    expect(chats(playReducer(played, { type: 'choose', index: 0 }).queue)).toEqual(['kruemel:Psst.', 'kruemel:Ja!', 'kruemel:Abgemacht.', 'intern:Ada hört mit.']);
  });

  it('Benachrichtigung und Vorschau: erste Nachricht der ältesten ungelesenen Szene, sonst die letzte; Systemzeilen nie', () => {
    const fresh = logged();
    expect(incomingMessage(fresh, story)?.line.text).toBe('Hallo {vorname}');
    expect(incomingMessage(fresh, story, 'fluestern')?.line.text).toBe('Gerücht!');
    expect(chatPreview(fresh, story, 'kruemel')?.line.text).toBe('Psst');
    const read = profile({ story: storyLog(['s1', 's2'], { picks: { s1: ['a'] }, read: ['s1', 's2'] }) });
    expect(incomingMessage(read, story)).toBeNull();
    expect(chatPreview(read, story, 'intern')?.line.text).toBe('Ende'); // nicht „Ada ist offline.“
    expect(chatPreview(profile(), story, 'intern')).toBeNull();
  });

  it('Echo (ifPicked): Zeilen je nach früherer Antwort – beim Abspielen und im Verlauf gleich', () => {
    const echo: StoryScene = {
      id: 'echo',
      chat: 'intern',
      trigger: { on: 'briefing', lessonId: 'a3' },
      lines: [kr('Na?'), kr('Du sagtest Ja.', { ifPicked: { scene: 's1', choice: 'a' } }), kr('Du sagtest Nein.', { ifPicked: { scene: 's1', choice: 'b' } }), kr('Du sagtest nichts.', { ifPicked: { scene: 's1', choice: null } })],
    };
    const texts = (picks: Record<string, string[]>) => {
      const played = playStart([echo], { owned: new Set(), picks }).queue.map((i) => i.line.text);
      const p = profile({ story: storyLog(['echo'], { picks, read: ['echo'] }) });
      expect(chatHistory(p, { scenes: [echo] }, 'intern').map((m) => m.line.text)).toEqual(played);
      return played;
    };
    expect(texts({ s1: ['a'] })).toEqual(['Na?', 'Du sagtest Ja.']);
    expect(texts({ s1: ['b'] })).toEqual(['Na?', 'Du sagtest Nein.']);
    expect(texts({})).toEqual(['Na?', 'Du sagtest nichts.']);
  });

  it('Echo auf eine Szene derselben Wiedergabe: entschieden erst, wenn die Szene zu Ende ist – wie danach im Verlauf', () => {
    const a: StoryScene = { id: 'a', chat: 'intern', trigger: { on: 'briefing', lessonId: 'a1' }, lines: [kr('Frage', { choices: [{ id: 'x', label: 'X', text: 'X!' }] })] };
    const b: StoryScene = {
      id: 'b',
      chat: 'intern',
      trigger: { on: 'briefing', lessonId: 'a2' },
      lines: [kr('Echo X', { ifPicked: { scene: 'a', choice: 'x' } }), kr('Echo nichts', { ifPicked: { scene: 'a', choice: null } })],
    };
    let s = playReducer(playStart([a, b], NO_CONTEXT), { type: 'shown' });
    s = playReducer(s, { type: 'choose', index: 0 });
    while (!isEnd(s)) s = playReducer(playReducer(s, { type: 'next' }), { type: 'shown' });
    expect(visibleItems(s).map((i) => i.line.text)).toEqual(['Frage', 'X!', 'Echo X']);
    expect(s.finished).toEqual(['a', 'b']);
    const p = profile({ story: storyLog(['a', 'b'], { picks: { a: ['x'] }, read: ['a', 'b'] }) });
    expect(chatHistory(p, { scenes: [a, b] }, 'intern').map((m) => m.line.text)).toEqual(['Frage', 'X!', 'Echo X']);
  });

  it('Bilderbuch ohne passende Zeilen ist sofort zu Ende', () => {
    expect(dialogStart([kr('nur mit X', { ifPicked: { scene: 'a', choice: 'x' } })]).done).toBe(true);
  });

  it('Absender einer Szene', () => {
    expect(sceneSender(s1)).toBe('kruemel');
    expect(sceneSender(s2)).toBe('juna');
    expect(sceneSender({ ...s2, lines: [{ speaker: 'system', text: 'x' }] })).toBe('system');
  });
});

describe('Abspielen', () => {
  const start = (owned: string[] = []) => playStart([s1, s2], { owned: new Set(owned), picks: {} }, { vorname: 'Lena' });
  const shownTexts = (s: ChatPlay) => visibleItems(s).map((i) => i.line.text);

  it('Dauer von „tippt …“ wächst mit der Länge, 0,5 bis 1,5 s', () => {
    expect(typingMs('')).toBe(500);
    expect(typingMs('x'.repeat(30))).toBeGreaterThan(500);
    expect(typingMs('x'.repeat(500))).toBe(1500);
    // eine korrigierte Nachricht (Tippi) tippt den durchgestrichenen Teil mit
    expect(lineTypingMs({ text: 'x'.repeat(10) })).toBe(typingMs('x'.repeat(10)));
    expect(lineTypingMs({ text: 'x'.repeat(10), strike: 'y'.repeat(20) })).toBe(typingMs('y'.repeat(20) + ' ' + 'x'.repeat(10)));
    expect(GAP_MS).toBeGreaterThan(0);
  });

  it('erst „tippt“, dann sichtbar, dann die nächste; Platzhalter sind gefüllt', () => {
    let s = start();
    expect(isTyping(s)).toBe(true);
    expect(shownTexts(s)).toEqual([]);
    s = playReducer(s, { type: 'shown' });
    expect(shownTexts(s)).toEqual(['Hallo Lena']);
    s = playReducer(s, { type: 'next' });
    expect(isTyping(s)).toBe(true);
    expect(currentItem(s)?.line.text).toBe('Frage?');
  });

  it('Enter überspringt „tippt“ und zeigt die nächste Nachricht sofort', () => {
    let s = start();
    s = playReducer(s, { type: 'advance' });
    expect(shownTexts(s)).toEqual(['Hallo Lena']);
    s = playReducer(s, { type: 'advance' });
    expect(isTyping(s)).toBe(true);
  });

  it('Antworten: needs-Filter nach Besitz, Wahl fügt Antwort und Reaktion ein', () => {
    const toChoices = (owned: string[]) => {
      let s = start(owned);
      for (let i = 0; i < 3; i++) s = playReducer(s, { type: 'advance' });
      return s;
    };
    expect(offeredChoices(toChoices([]))?.map((c) => c.id)).toEqual(['a', 'b']);
    expect(offeredChoices(toChoices(['lupe']))?.map((c) => c.id)).toEqual(['a', 'b', 'g']);
    let s = toChoices([]);
    expect(isEnd(s)).toBe(false);
    expect(playReducer(s, { type: 'next' })).toBe(s); // ohne Wahl geht es nicht weiter
    s = playReducer(s, { type: 'pick', delta: 1 });
    expect(s.pick).toBe(1);
    s = playReducer(s, { type: 'choose', index: 0 });
    expect(shownTexts(s).slice(-2)).toEqual(['Frage?', 'Ja, gern!']);
    expect(visibleItems(s).at(-1)?.line.speaker).toBe('player');
    s = playReducer(s, { type: 'advance' });
    expect(isTyping(s)).toBe(true);
    expect(currentItem(s)?.line.text).toBe('Prima.');
    expect(playReducer(s, { type: 'choose', index: 0 })).toBe(s);
  });

  it('Szenen gelten als gelesen, wenn ihre letzte Nachricht dasteht; Esc davor lässt sie ungelesen', () => {
    let s = start();
    for (let i = 0; i < 3; i++) s = playReducer(s, { type: 'advance' });
    s = playReducer(s, { type: 'advance' }); // Wahl a
    expect(s.finished).toEqual([]);
    for (let i = 0; i < 10 && !isEnd(s); i++) s = playReducer(s, { type: 'advance' });
    expect(s.finished).toEqual(['s1', 's2']);
    expect(isEnd(s)).toBe(true);
  });

  it('über mehrere Chats: Trennzeile beim Wechsel; System und Spielfigur erscheinen sofort', () => {
    let s = start();
    for (let i = 0; i < 12 && !isEnd(s); i++) {
      s = playReducer(s, { type: 'advance' });
      if (offeredChoices(s)) s = playReducer(s, { type: 'choose', index: 1 });
    }
    const q = s.queue;
    const i = q.findIndex((m) => m.line.text === 'Gerücht!');
    expect(dividerBefore(q, i, 'intern')).toBe('fluestern');
    expect(dividerBefore(q, i + 1, 'intern')).toBe('kruemel');
    expect(dividerBefore(q, 0, 'intern')).toBeNull();
    expect(dividerBefore(q, i + 2, 'intern')).toBe('intern');
    const sys = playStart([{ ...s2, lines: [{ speaker: 'system', text: 'x' }, kr('y')] }], NO_CONTEXT);
    expect(isTyping(sys)).toBe(false); // System sofort
  });

  it('leere Wiedergabe ist sofort am Ende', () => {
    const s = playStart([], NO_CONTEXT);
    expect(isEnd(s)).toBe(true);
    expect(playReducer(s, { type: 'advance' })).toBe(s);
  });
});

describe('Tageszeit (ifTime)', () => {
  const abend = timeOf(new Date(2026, 10, 1, 19).getTime()); // Sonntagabend
  const scene: StoryScene = {
    id: 'z',
    chat: 'intern',
    trigger: { on: 'briefing', lessonId: 'a1' },
    lines: [kr('Tag', { ifTime: { sunday: false } }), kr('Sonntag', { ifTime: { sunday: true } }), kr('Immer')],
  };
  const texts = (msgs: { line: Line }[]) => msgs.map((m) => m.line.text);

  it('ohne Zeitangabe gilt die neutrale Zeit (Dienstagmorgen), sonst die gegebene – beim Abspielen und im Verlauf', () => {
    expect(texts(playStart([scene], NO_CONTEXT).queue)).toEqual(['Tag', 'Immer']);
    expect(texts(playStart([scene], { ...NO_CONTEXT, time: abend }).queue)).toEqual(['Sonntag', 'Immer']);
    expect(texts(sceneMessages(scene, []))).toEqual(['Tag', 'Immer']);
    expect(texts(sceneMessages(scene, [], {}, abend))).toEqual(['Sonntag', 'Immer']);
    const p = profile({ story: storyLog(['z']) });
    expect(texts(chatHistory(p, { scenes: [scene] }, 'intern', undefined, abend))).toEqual(['Sonntag', 'Immer']);
    expect(chatPreview(p, { scenes: [scene] }, 'intern', abend)?.line.text).toBe('Sonntag');
  });

  it('wirkt auch in Reaktionen auf Antworten (Dialog)', () => {
    const lines: Line[] = [kr('Frage?', { choices: [{ id: 'a', label: 'A', text: 'A!', reply: [kr('offen', { ifTime: { shopOpen: true } }), kr('zu', { ifTime: { shopOpen: false } })] }] })];
    const reply = (time?: typeof abend) => dialogStart(lines, {}, { ...NO_CONTEXT, time }).queue[0]!.choices![0]!.reply!.map((l) => l.text);
    expect(reply()).toEqual(['offen']);
    expect(reply(abend)).toEqual(['zu']);
  });
});
