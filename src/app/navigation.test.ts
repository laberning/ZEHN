// Wege zwischen Bildschirmen: reine Funktionen, die der Store und der Funk benutzen.

import { describe, expect, it } from 'vitest';
import { TEST_COURSE, profile } from '../test/factories.ts';
import { hasSeen, seenKey } from '../domain/seen.ts';
import { markRead } from '../domain/story.ts';
import { logScenes, type StoryScene } from '../domain/scenes.ts';
import { afterExamScreen, briefingRoute, chatEnd, examRoute, PUBLIC_SCREENS, type Screen } from './navigation.ts';

const scene = (id: string, trigger: StoryScene['trigger']): StoryScene => ({ id, chat: 'intern', trigger, lines: [] });
const mission: Screen = { name: 'mission', lessonId: 'a1' };
const hq: Screen = { name: 'hq' };

describe('Briefing', () => {
  it('mit Chat-Szene: im Funk, bis die Szene im Log steht; gemerkt wird „gesehen“', () => {
    const story = { scenes: [scene('b1', { on: 'briefing', lessonId: 'a1' })] };
    const first = briefingRoute(profile(), story, 'a1');
    expect(first.screen).toEqual({ name: 'funk', play: ['b1'], then: mission, label: 'Auftrag starten ⏎' });
    expect(hasSeen(first.save!, seenKey.briefing('a1'))).toBe(true);
    expect(briefingRoute(logScenes(profile(), ['b1'], 1), story, 'a1')).toEqual({ screen: mission });
  });

  it('ohne Chat-Szene: Bilderbuch, bis es gesehen ist', () => {
    const first = briefingRoute(profile(), { scenes: [] }, 'a1');
    expect(first.screen).toEqual({ name: 'story', story: { kind: 'briefing', lessonId: 'a1' }, then: mission });
    expect(briefingRoute(first.save!, { scenes: [] }, 'a1')).toEqual({ screen: mission });
  });
});

describe('Einsatz', () => {
  it('Intro nur beim ersten Mal', () => {
    const first = examRoute(profile(), 'a');
    expect(first.screen).toEqual({ name: 'story', story: { kind: 'examIntro', moduleId: 'a' }, then: { name: 'exam', moduleId: 'a' } });
    expect(examRoute(first.save!, 'a')).toEqual({ screen: { name: 'exam', moduleId: 'a' } });
  });

  it('danach: die Szene zum Einsatz im Funk, solange sie ungelesen ist', () => {
    const story = { scenes: [scene('e', { on: 'exam', moduleId: 'a' })] };
    const p = logScenes(profile(), ['e'], 1);
    expect(afterExamScreen(p, story, TEST_COURSE, 'a')).toEqual({ name: 'funk', play: ['e'], then: hq });
    expect(afterExamScreen(markRead(p, ['e']), story, TEST_COURSE, 'a')).toEqual(hq);
    expect(afterExamScreen(profile(), story, TEST_COURSE, 'a')).toEqual(hq);
  });
});

describe('Spielende', () => {
  const ende: Screen = { name: 'ende' };
  const after = (extra: Partial<Parameters<typeof profile>[0]>) => profile({ exams: { b: { attempts: 1, outcome: 'passed' } }, ...extra });
  const story = { scenes: [scene('e', { on: 'exam', moduleId: 'b' })] };

  it('nach dem Einsatz des letzten Moduls ohne Szene: Ende-Bildschirm, bis er gesehen ist; beim vorletzten Modul nicht', () => {
    expect(afterExamScreen(after({}), { scenes: [] }, TEST_COURSE, 'b')).toEqual(ende);
    expect(afterExamScreen(after({ seen: [seenKey.storyEnd('b')] }), { scenes: [] }, TEST_COURSE, 'b')).toEqual(hq);
    expect(afterExamScreen(profile({ exams: { a: { attempts: 1, outcome: 'passed' } } }), { scenes: [] }, TEST_COURSE, 'a')).toEqual(hq);
  });

  it('mit Szene nach dem Einsatz: erst der Funk, dann das Ende', () => {
    const p = logScenes(after({}), ['e'], 1);
    expect(afterExamScreen(p, story, TEST_COURSE, 'b')).toEqual({ name: 'funk', play: ['e'], then: ende });
    expect(afterExamScreen(markRead(p, ['e']), story, TEST_COURSE, 'b')).toEqual(ende);
  });
});

describe('Fallakte', () => {
  it('ist ein eigener Bildschirm mit Profil; das Merken des Öffnens hat einen eigenen Schlüssel', () => {
    const s: Screen = { name: 'fallakte', moduleId: 'm1' };
    expect(PUBLIC_SCREENS).not.toContain(s.name);
    expect(seenKey.fallakte('m1')).not.toBe(seenKey.fallakte('m2'));
  });
});

describe('Ende des Funks (chatEnd)', () => {
  const next: Screen = { name: 'exam', moduleId: 'a' };

  it('abgespielte Szenen: weiter mit then (eigene Beschriftung möglich), sonst zurück ins HQ', () => {
    expect(chatEnd({ play: ['x'] })).toEqual({ leave: hq, primary: { to: hq, label: 'Zurück ins Hauptquartier ⏎' }, secondary: null });
    expect(chatEnd({ play: ['x'], then: next }).primary).toEqual({ to: next, label: 'Weiter ⏎' });
    expect(chatEnd({ play: ['x'], then: mission, label: 'Auftrag starten ⏎' }).primary).toEqual({ to: mission, label: 'Auftrag starten ⏎' });
  });

  it('„Noch eine Runde“ als Hauptknopf, zurück ins HQ daneben', () => {
    expect(chatEnd({ play: ['x'], then: hq, again: mission })).toEqual({ leave: hq, primary: { to: mission, label: 'Noch eine Runde ⏎' }, secondary: { to: hq, label: 'Zurück ins Hauptquartier' } });
  });

  it('ein Paket führt zur Garderobe, „Später“ daneben – auch in einem einfach geöffneten Chat', () => {
    const wardrobe: Screen = { name: 'wardrobe', tab: 'kleidung' };
    expect(chatEnd({}, 'wardrobe')).toEqual({ leave: hq, primary: { to: wardrobe, label: 'Zur Garderobe ⏎' }, secondary: { to: hq, label: 'Später' } });
    expect(chatEnd({ play: ['x'], again: mission }, 'wardrobe').secondary).toEqual({ to: hq, label: 'Zurück ins Hauptquartier' });
  });

  it('einfach geöffneter Chat: kein Knopf am Ende, Esc direkt ins HQ', () => {
    expect(chatEnd({})).toEqual({ leave: hq, primary: null, secondary: null });
  });
});
