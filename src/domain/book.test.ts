// Nachschlagen im Bilderbuch-Bündel: Verweise, Einsatz-Story, Beschriftung, Fallakte – mit einem Bündel aus zwei kleinen Akten.

import { describe, expect, it } from 'vitest';
import { examStory, fallakte, fallaktenScratched, moduleLabel, storyLines, type BookContent, type ExamStory, type Fallakte } from './book.ts';
import type { Line } from './dialog.ts';
import { storyLog } from '../test/factories.ts';

const L = (text: string): Line => ({ speaker: 'ada', text });
const exam = (name: string): ExamStory => ({
  title: `Einsatz ${name}`, won: '', lost: '', segments: '', frame: '', ready: '', taunts: [],
  intro: [L(`${name}-intro`)], success: [L(`${name}-success`)], fail: [], backdoorOffer: [], backdoorTaken: [L(`${name}-tuer`)],
});
const akte = (title: string): Fallakte => ({ title, header: '', solved: [], firewall: { passed: '', backdoor: '' }, open: [], suspects: [], closing: '' });

const story: BookContent = {
  book: {
    prolog: [L('prolog')],
    lessons: { 'a-l1': { briefing: [L('a-l1-briefing')] }, 'b-l1': { mastered: [L('b-l1-mastered')] } },
    exams: { a: exam('a'), b: exam('b') },
  },
  labels: { a: { act: 'Akt 1', place: 'Ort A' }, b: { act: 'Akt 2', place: 'Ort B' } },
  fallakten: { b: akte('Akte B') },
};

describe('Bilderbuch-Bündel', () => {
  it('storyLines: Prolog, Szenen je Auftrag über alle Akte, Einsatz-Story', () => {
    expect(storyLines(story, { kind: 'prolog' })).toEqual([L('prolog')]);
    expect(storyLines(story, { kind: 'briefing', lessonId: 'a-l1' })).toEqual([L('a-l1-briefing')]);
    expect(storyLines(story, { kind: 'mastered', lessonId: 'b-l1' })).toEqual([L('b-l1-mastered')]);
    expect(storyLines(story, { kind: 'examIntro', moduleId: 'b' })).toEqual([L('b-intro')]);
    expect(storyLines(story, { kind: 'examSuccess', moduleId: 'a' })).toEqual([L('a-success')]);
    expect(storyLines(story, { kind: 'examBackdoor', moduleId: 'a' })).toEqual([L('a-tuer')]);
  });

  it('storyLines: Aufträge ohne Bilderbuch liefern nichts, ein Modul ohne Einsatz-Story wirft', () => {
    expect(storyLines(story, { kind: 'mastered', lessonId: 'a-l1' })).toEqual([]);
    expect(storyLines(story, { kind: 'briefing', lessonId: 'gibt-es-nicht' })).toEqual([]);
    expect(() => storyLines(story, { kind: 'examIntro', moduleId: 'gibt-es-nicht' })).toThrow();
  });

  it('examStory, moduleLabel, fallakte: je Modul; fehlt es, gibt es undefined (examStory wirft)', () => {
    expect(examStory(story, 'b').title).toBe('Einsatz b');
    expect(moduleLabel(story, 'b')).toEqual({ act: 'Akt 2', place: 'Ort B' });
    expect(moduleLabel(story, 'x')).toBeUndefined();
    expect(fallakte(story, 'b')?.title).toBe('Akte B');
    expect(fallakte(story, 'a')).toBeUndefined();
  });
});

describe('fallaktenScratched: zerkratzte Fallakten aus dem Story-Log', () => {
  const damage = { from: 'schaden', until: 'heil' };
  const withLog = (...ids: string[]) => ({ story: storyLog(ids) });
  const damaged = { ...story, fallaktenDamage: [damage] };

  it('vor `from` nicht, ab `from` bis `until` zerkratzt, ab `until` wieder lesbar', () => {
    expect(fallaktenScratched(withLog(), damaged)).toBe(false);
    expect(fallaktenScratched(withLog('schaden'), damaged)).toBe(true);
    expect(fallaktenScratched(withLog('schaden', 'andere'), damaged)).toBe(true);
    expect(fallaktenScratched(withLog('schaden', 'heil'), damaged)).toBe(false);
  });

  it('nur `until` im Log (ohne `from`) zerkratzt nichts', () => {
    expect(fallaktenScratched(withLog('heil'), damaged)).toBe(false);
  });

  it('ohne Eintrag (leer oder fehlend) ist nie etwas zerkratzt', () => {
    expect(fallaktenScratched(withLog('schaden'), story)).toBe(false);
    expect(fallaktenScratched(withLog('schaden'), { ...story, fallaktenDamage: [] })).toBe(false);
  });

  it('bei mehreren Einträgen genügt einer', () => {
    const two = { fallaktenDamage: [damage, { from: 'x', until: 'y' }] };
    expect(fallaktenScratched(withLog('x'), two)).toBe(true);
    expect(fallaktenScratched(withLog('schaden', 'heil', 'x', 'y'), two)).toBe(false);
  });
});
