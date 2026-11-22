// Abläufe als Zustandsmaschinen: Auftrag, Einsatz, Dialog – ohne Browser.

import { describe, expect, it } from 'vitest';
import { NUMBER_COURSE, PUNCT_COURSE, SHIFT_COURSE, SPECIAL_COURSE, TEST_COURSE, profile } from '../test/factories.ts';
import { ALL_COURSE } from '../test/content.ts';
import { allWords, findModule, keysUpTo, moduleKeys } from './course.ts';
import { SHIFT_LEFT, SHIFT_RIGHT, learnKey } from './keyboard.ts';
import { examTextLength } from './exam.ts';
import { createRng } from './rng.ts';
import { charWeights, generateText } from './textGenerator.ts';
import { castAt, currentLine, dialogReducer, dialogStart, fillLine, isLineComplete, sceneAt, visibleChoices, visibleText, type DialogState, type Line } from './dialog.ts';
import { examReducer, examRunStart, examTyping, firewallSegments, tauntFor, timeLeftMs, type ExamRunState } from './examRun.ts';
import { debriefNext, missionReducer, objectShownLater, missionStart, planRounds, roundTyping, runInfo, showsSeals, summarizeRewards, type MissionState } from './mission.ts';
import { logScenes } from './scenes.ts';
import type { Reward } from './record.ts';
import { REWARDS } from '../content/rewards.ts';
import { startTyping } from './typing.ts';

const reward = (r: Partial<Reward> = {}): Reward => ({ stars: 2, xp: 10, newBadges: [], lessonJustMastered: false, rankUp: null, newRecord: false, ...r });
const learner = { stats: {}, avgApm: null, mode: 'strict' as const };

function typeAll(s: MissionState): MissionState {
  let t = 1000;
  for (const ch of s.typing.text) s = missionReducer(s, { type: 'key', ch, now: (t += 200) });
  return s;
}

describe('Auftrag', () => {
  it('plant Aufwärmen nur, wenn es schon mehr als die neuen Tasten gibt', () => {
    expect(planRounds(TEST_COURSE, 'a1').map((r) => r.kind)).toEqual(['exercise', 'exercise']);
    expect(planRounds(TEST_COURSE, 'a2').map((r) => r.kind)).toEqual(['warmup', 'exercise', 'exercise']);
    expect(planRounds(TEST_COURSE, 'a2', { kind: 'exam', keys: ['k'] })).toEqual([{ kind: 'training', seconds: 60, focus: ['k'] }]);
    expect(planRounds(TEST_COURSE, 'a2', { kind: 'tippstunde', keys: ['k'], frame: 'T' })).toEqual([{ kind: 'tippstunde', seconds: 60, focus: ['k'], frame: 'T' }]);
    expect(planRounds(TEST_COURSE, 'a1')[1]).toMatchObject({ n: 2, of: 2 });
  });

  it('Rundenzahl und -längen kommen aus dem Kurs', () => {
    const course = { ...TEST_COURSE, practice: { ...TEST_COURSE.practice, exercisesPerLesson: 3, exerciseSec: 30 } };
    const rounds = planRounds(course, 'a1');
    expect(rounds.map((r) => [r.n, r.of, r.seconds])).toEqual([[1, 3, 30], [2, 3, 30], [3, 3, 30]]);
  });

  it('erzeugt Texte nur aus gelernten Tasten, reproduzierbar per Seed', () => {
    const round = planRounds(TEST_COURSE, 'a2')[1]!;
    const a = roundTyping(TEST_COURSE, 'a2', round, learner, 7);
    expect(a.text).toMatch(/^[fjdk ]+$/);
    expect(roundTyping(TEST_COURSE, 'a2', round, learner, 7).text).toBe(a.text);
    expect(roundTyping(TEST_COURSE, 'a2', round, { ...learner, mode: 'flow' }, 7).mode).toBe('flow');
  });

  it('Sätze aus der Geschichte nur in der Tippstunde', () => {
    const sentence = 'fjfj dkdk fdfd jkjk dfjk';
    const story = { scenes: [{ id: 's', chat: 'kruemel' as const, trigger: { on: 'briefing' as const, lessonId: 'a1' }, lines: [{ speaker: 'kruemel' as const, text: sentence }] }] };
    const seen = (kind: 'tippstunde' | 'training') => Array.from({ length: 30 }, (_, i) => roundTyping(TEST_COURSE, 'a2', { kind, seconds: 60, focus: [] }, { ...learner, avgApm: 300 }, i + 1, story).text);
    expect(seen('tippstunde').every((t) => t.includes(sentence))).toBe(true);
    expect(seen('training').some((t) => t.includes(sentence))).toBe(false);
  });

  it('durchläuft typing → saving → between → typing → saving → debrief', () => {
    const rounds = planRounds(TEST_COURSE, 'a1');
    let s = missionStart(rounds, startTyping('fj'));
    s = missionReducer(s, { type: 'key', ch: 'k', now: 0 });
    expect(s.press).toEqual({ ch: 'k', ok: false, n: 1 });
    s = typeAll(s);
    expect(s.phase).toBe('saving');
    expect(missionReducer(s, { type: 'key', ch: 'f', now: 9 })).toBe(s); // keine Eingaben beim Speichern
    s = missionReducer(s, { type: 'recorded', reward: reward() });
    expect(s.phase).toBe('between');
    expect(s.done[0]?.result.errors).toBe(1);
    s = missionReducer(s, { type: 'next', typing: startTyping('jf') });
    expect(s).toMatchObject({ phase: 'typing', index: 1, press: null });
    s = missionReducer(typeAll(s), { type: 'recorded', reward: reward({ lessonJustMastered: true }) });
    expect(s.phase).toBe('debrief');
    expect(missionReducer(s, { type: 'next', typing: startTyping('f') })).toBe(s);
    expect(() => missionStart([], startTyping('f'))).toThrow();
  });

  it('merkt ein englisches Tastaturlayout', () => {
    const s = missionReducer(missionStart(planRounds(TEST_COURSE, 'a1'), startTyping('z')), { type: 'key', ch: 'y', now: 0 });
    expect(s.layoutHint).toBe(true);
  });

  it('fasst Belohnungen der Runden zusammen (Aufwärmen zählt nicht für Sterne)', () => {
    const rounds = planRounds(TEST_COURSE, 'a2');
    const sum = summarizeRewards([
      { round: rounds[0]!, reward: reward({ stars: 3, xp: 5 }) },
      { round: rounds[1]!, reward: reward({ stars: 1, xp: 10, newBadges: ['a'] }) },
      { round: rounds[2]!, reward: reward({ stars: 2, xp: 10, newBadges: ['b'], rankUp: REWARDS.ranks[1]!, newRecord: true }) },
    ]);
    expect(sum).toEqual({ xp: 25, stars: 2, newBadges: ['a', 'b'], rankUp: REWARDS.ranks[1], newRecord: true, lessonJustMastered: false, received: [] });
  });

  it('Nachbesprechung: geschafft → Story; neue Szenen → lesen; Nebenszene → Hinweis; sonst noch eine Runde', () => {
    const story = { scenes: [{ id: 'side', chat: 'intern' as const, trigger: { on: 'side' as const, strand: 's', order: 1, fromLesson: 'a1' }, lines: [] }] };
    const done = { lessonJustMastered: true };
    const open = { lessonJustMastered: false };
    expect(debriefNext(done, { open: ['m'], side: null }, story)).toEqual({ kind: 'story', open: ['m'] });
    expect(debriefNext(open, { open: ['s'], side: 'side' }, story)).toEqual({ kind: 'readOpen', open: ['s'] });
    expect(debriefNext(open, { open: [], side: 'side' }, story)).toEqual({ kind: 'readSide', side: 'side' });
    expect(debriefNext(open, { open: [], side: 'weg' }, story)).toEqual({ kind: 'again' }); // unbekannte Szene
    expect(debriefNext(open, { open: [], side: null }, story)).toEqual({ kind: 'again' });
  });

  it('Nachbesprechung: das Story-Objekt bleibt verborgen, wenn gleich eine Stufe oder der Abschluss dieses Auftrags kommt', () => {
    const sc = (id: string, trigger: object) => ({ id, chat: 'intern' as const, trigger, lines: [] }) as never;
    const story = { scenes: [sc('s50', { on: 'stage', lessonId: 'a1', at: 0.5 }), sc('done', { on: 'mastered', lessonId: 'a1' }), sc('rang', { on: 'rank', rank: 'x' }), sc('fremd', { on: 'stage', lessonId: 'a2', at: 0.5 })] };
    expect(objectShownLater(['rang', 's50'], story, 'a1')).toBe(true); // der Chat zeigt die Entdeckung
    expect(objectShownLater(['done'], story, 'a1')).toBe(true);
    expect(objectShownLater(['rang', 'fremd'], story, 'a1')).toBe(false);
    expect(objectShownLater([], story, 'a1')).toBe(false);
  });

  it('Siegel und „Auftrag noch offen“ gelten in Aufträgen und Fällen, nicht im Spezialtraining des Einsatzes', () => {
    expect([showsSeals(), showsSeals({ caseId: 'x' }), showsSeals({})]).toEqual([true, true, false]);
    const p = logScenes(profile(), ['a', 'b'], 1);
    expect(runInfo(p, TEST_COURSE, 'a1')).toEqual({ logStart: 2, wasCurrent: true, replay: false });
    expect(runInfo(p, TEST_COURSE, 'a1', { caseId: 'x' })).toEqual({ logStart: 2, wasCurrent: true, replay: false });
    expect(runInfo(p, TEST_COURSE, 'a1', {})).toEqual({ logStart: 2, wasCurrent: false, replay: false });
    const mastered = profile({ ...p, lessons: { a1: { exercises: 2, bestStars: 2 as const, mastered: true, best: 1 } } });
    expect(runInfo(mastered, TEST_COURSE, 'a1').wasCurrent).toBe(false);
  });

  it('Wiederholung: geschaffter Auftrag, Einsatz des Moduls gespielt, mit Siegeln', () => {
    const base = logScenes(profile(), ['a'], 1);
    const mastered = { ...base, lessons: { a1: { exercises: 2, bestStars: 2 as const, mastered: true, best: 1 } } };
    expect(runInfo(mastered, TEST_COURSE, 'a1').replay).toBe(false); // Einsatz nicht gespielt
    const played = { ...mastered, exams: { a: { attempts: 1, outcome: 'passed' as const } } };
    expect(runInfo(played, TEST_COURSE, 'a1').replay).toBe(true);
    expect(runInfo({ ...played, exams: { a: { attempts: 3, outcome: 'backdoor' as const } } }, TEST_COURSE, 'a1').replay).toBe(true);
    expect(runInfo(played, TEST_COURSE, 'a1', {}).replay).toBe(false); // Spezialtraining
    expect(runInfo({ ...played, lessons: {} }, TEST_COURSE, 'a1').replay).toBe(false); // Auftrag nicht geschafft
  });
});

describe('Einsatz-Ablauf', () => {
  const module = findModule(TEST_COURSE, 'a');
  const start = (text = 'fj dk'): ExamRunState => examRunStart(module, startTyping(text));

  it('Countdown, dann läuft die Zeit; fertig getippt → speichern', () => {
    let s = examReducer(start(), { type: 'begin' });
    expect(s).toMatchObject({ phase: 'countdown', count: 3 });
    s = examReducer(examReducer(s, { type: 'countdown', now: 0 }), { type: 'countdown', now: 0 });
    expect(s.count).toBe(1);
    s = examReducer(s, { type: 'countdown', now: 1000 });
    expect(s).toMatchObject({ phase: 'run', startedAt: 1000 });
    expect(examReducer(s, { type: 'countdown', now: 0 })).toBe(s);
    for (const ch of 'fj dk') s = examReducer(s, { type: 'key', ch, now: 1500 });
    expect(s.phase).toBe('saving');
  });

  it('Zeit abgelaufen → speichern; Fehler werden gezählt', () => {
    let s = examReducer(examReducer(start(), { type: 'begin' }), { type: 'countdown', now: 0 });
    s = examReducer(examReducer(examReducer(s, { type: 'countdown', now: 0 }), { type: 'countdown', now: 0 }), { type: 'key', ch: 'x', now: 10 });
    expect(s.errors).toBe(1);
    s = examReducer(s, { type: 'tick', now: 5000 });
    expect(timeLeftMs(s)).toBe(5000);
    s = examReducer(s, { type: 'tick', now: 10_000 });
    expect(s.phase).toBe('saving');
    const outcome = { result: { length: 5, errors: 1, accuracy: 0.5, durationMs: 10000, apm: 1 }, evaluation: { passed: false, inTime: false, accuracyOk: false, progress: 0 }, reward: reward() };
    s = examReducer(s, { type: 'recorded', outcome });
    expect(s.phase).toBe('result');
    s = examReducer(s, { type: 'retry', typing: startTyping('ff') });
    expect(s).toMatchObject({ phase: 'countdown', errors: 0, outcome: null });
    expect(examReducer(s, { type: 'retry', typing: startTyping('ff') })).toBe(s);
    expect(timeLeftMs(start())).toBe(10_000);
  });

  it('nach Ablauf der Zeit zählt keine Taste mehr, auch wenn der Takt noch fehlt', () => {
    let s = examReducer(examReducer(start('fj'), { type: 'begin' }), { type: 'countdown', now: 0 });
    s = examReducer(examReducer(examReducer(s, { type: 'countdown', now: 0 }), { type: 'countdown', now: 0 }), { type: 'key', ch: 'f', now: 10 });
    s = examReducer(s, { type: 'key', ch: 'j', now: 10_090 }); // Grenze: 10 000 ms nach dem Start bei 0
    expect(s.phase).toBe('saving');
    expect(s.typing.position).toBe(1);
  });

  it('Sprüche des Gegners wechseln alle zwei Fehler', () => {
    const taunts = ['a', 'b', 'c'];
    expect([0, 1, 2, 3, 4, 6].map((e) => tauntFor(e, taunts))).toEqual(['a', 'a', 'b', 'b', 'c', 'a']);
  });

  it('Firewall: ein Segment pro fertig getipptem Wort', () => {
    expect(firewallSegments('fj dk ff', 0)).toEqual({ total: 3, done: 0 });
    expect(firewallSegments('fj dk ff', 2)).toEqual({ total: 3, done: 1 });
    expect(firewallSegments('fj dk ff', 8)).toEqual({ total: 3, done: 3 });
  });

  it('erzeugt Einsatz-Texte aus allen Tasten des Moduls mit passender Länge', () => {
    const t = examTyping(TEST_COURSE, 'a', 3);
    expect(t.text).toMatch(/^[fjdk ]+$/);
    expect(t.text.length).toBeGreaterThanOrEqual(10); // 60 Anschläge/min × 10 s
  });

  it('Einsatz mit keys: learned nutzt alle gelernten Tasten, Wörter und die Modul-Tasten als Fokus', () => {
    const SEEDS = 200;
    const words = new Set(PUNCT_COURSE.modules[0]!.words);
    const has = new Map<string, number>();
    let withWord = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const { text } = examTyping(PUNCT_COURSE, 'p2', seed);
      expect(text).toMatch(/^[a-z ,.-]+$/);
      if (text.split(/[ ,.-]+/).some((w) => words.has(w))) withWord++;
      for (const k of [',', '.', '-']) if (text.includes(k)) has.set(k, (has.get(k) ?? 0) + 1);
    }
    expect(withWord).toBe(SEEDS);
    // Die Modul-Tasten sind Fokus: jede kommt in (fast) jedem Einsatz-Text vor
    for (const k of [',', '.', '-']) expect(has.get(k) ?? 0, k).toBeGreaterThanOrEqual(SEEDS * 0.95);
  });

  it('Einsatz mit keys: learned bekommt Großschreibung: die Umschalttasten des Moduls sind Fokus, Wörter beginnen groß', () => {
    const SEEDS = 200;
    const handsIn: Record<string, number> = { [SHIFT_RIGHT]: 0, [SHIFT_LEFT]: 0 };
    for (let seed = 1; seed <= SEEDS; seed++) {
      const { text } = examTyping(SHIFT_COURSE, 's2', seed);
      for (const unit of text.split(' ')) expect(unit).toMatch(/^[A-ZÄÖÜ]?[a-zäöüß]+$/);
      for (const hand of [SHIFT_RIGHT, SHIFT_LEFT]) if (text.split(' ').some((u) => learnKey(u[0]!) === hand)) handsIn[hand]!++;
    }
    expect(handsIn[SHIFT_RIGHT]).toBeGreaterThan(SEEDS * 0.95);
    expect(handsIn[SHIFT_LEFT]).toBeGreaterThan(SEEDS * 0.95);
  });

  it('Einsatz mit keys: learned bekommt Zahlengruppen: die Ziffern des Moduls sind Fokus, Zahlen nur aus Ziffern, Wörter ohne Ziffer', () => {
    const SEEDS = 200;
    const digits = moduleKeys(findModule(NUMBER_COURSE, 'n1'));
    const has = new Map<string, number>();
    for (let seed = 1; seed <= SEEDS; seed++) {
      const { text } = examTyping(NUMBER_COURSE, 'n1', seed);
      for (const unit of text.split(/[ -]/).map((u) => u.replace(/[,.?!:;"]/g, ''))) expect(unit, text).toMatch(/^(?:[0-9]{2,4}|[A-ZÄÖÜ]?[a-zäöüß']+)$/);
      for (const k of digits) if (text.includes(k)) has.set(k, (has.get(k) ?? 0) + 1);
    }
    for (const k of digits) expect(has.get(k) ?? 0, k).toBeGreaterThanOrEqual(SEEDS * 0.95);
  });

  it('Einsatz mit keys: learned bekommt die Sonderzeichen in ihrer Rolle: die Zeichen des Moduls sind Fokus, jedes steht in mindestens 95 % der Texte', () => {
    const SEEDS = 200;
    const specials = moduleKeys(findModule(SPECIAL_COURSE, 'x1'));
    const has = new Map<string, number>();
    for (let seed = 1; seed <= SEEDS; seed++) {
      const { text } = examTyping(SPECIAL_COURSE, 'x1', seed);
      // jede Einheit: Wort oder Zahl, wahlweise mit Präfix, Euro-Zeichen, Klammern und einem Satzzeichen; `|` allein
      for (const unit of text.split(/[ @-]/).map((u) => u.replace(/^["{[]|["}\]]$|[,.?!:;]$/g, ''))) expect(unit, text).toMatch(/^(?:\||[0-9]{2,4}€?|[\\~]?[A-ZÄÖÜ]?[a-zäöüß']+)$/);
      for (const k of specials) if (text.includes(k)) has.set(k, (has.get(k) ?? 0) + 1);
    }
    for (const k of specials) expect(has.get(k) ?? 0, k).toBeGreaterThanOrEqual(SEEDS * 0.95);
  });

  it('Einsätze der Kurse ohne Großbuchstaben (Akt 1–3; ab Akt 4 mit Großschreibung) und Einsätze vor der Großschreibung bleiben klein', () => {
    for (const m of ALL_COURSE.modules.filter((x) => !['m4', 'm5', 'm6', 'm7'].includes(x.id))) for (let seed = 1; seed <= 20; seed++) expect(examTyping(ALL_COURSE, m.id, seed).text, m.id).not.toMatch(/[A-ZÄÖÜ]/);
    for (let seed = 1; seed <= 20; seed++) expect(examTyping(SHIFT_COURSE, 's1', seed).text).not.toMatch(/[A-ZÄÖÜ]/);
  });

  it('Auftrag mit Großschreibung: Übungstexte nur aus gelernten Zeichen, Runde 1 beginnt mit einem Großbuchstaben der Hand', () => {
    const rounds = planRounds(SHIFT_COURSE, 's2a');
    const t = roundTyping(SHIFT_COURSE, 's2a', rounds[1]!, learner, 1).text;
    expect(t).toMatch(/^[A-Z]/);
    expect(t).not.toMatch(/[ZUIOPHJKLNMÄÖÜß]/);
  });

  it('Einsatz von Akt 5 läuft strikt mit allen gelernten Tasten; die sechs Satzzeichen kommen im Text vor, die Modul-Tasten als Fokus fast immer', () => {
    const SEEDS = 200;
    const m5 = findModule(ALL_COURSE, 'm5');
    expect(m5.exam).toEqual({ minAccuracy: 0.92, minApm: 50, durationSec: 60, keys: 'learned' });
    const learned = keysUpTo(ALL_COURSE, 'm5-l3');
    const has = new Map<string, number>();
    for (let seed = 1; seed <= SEEDS; seed++) {
      const typing = examTyping(ALL_COURSE, 'm5', seed);
      expect(typing.mode).toBe('strict');
      expect([...typing.text.replaceAll(' ', '')].every((c) => learned.includes(c))).toBe(true);
      for (const k of moduleKeys(m5)) if (typing.text.includes(k)) has.set(k, (has.get(k) ?? 0) + 1);
    }
    for (const k of moduleKeys(m5)) expect(has.get(k) ?? 0, k).toBeGreaterThanOrEqual(SEEDS * 0.95);
  });

  it('Einsatz von Akt 6 läuft strikt mit allen gelernten Tasten; jede der zehn Ziffern kommt im Text vor, als Fokus fast immer', () => {
    const SEEDS = 200;
    const m6 = findModule(ALL_COURSE, 'm6');
    expect(m6.exam).toEqual({ minAccuracy: 0.92, minApm: 50, durationSec: 60, keys: 'learned' });
    const learned = keysUpTo(ALL_COURSE, 'm6-l4');
    const digits = moduleKeys(m6);
    expect([...digits].sort().join('')).toBe('0123456789');
    const has = new Map<string, number>();
    for (let seed = 1; seed <= SEEDS; seed++) {
      const typing = examTyping(ALL_COURSE, 'm6', seed);
      expect(typing.mode).toBe('strict');
      expect([...typing.text.replaceAll(' ', '')].every((c) => learned.includes(c))).toBe(true);
      for (const k of digits) if (typing.text.includes(k)) has.set(k, (has.get(k) ?? 0) + 1);
    }
    for (const k of digits) expect(has.get(k) ?? 0, k).toBeGreaterThanOrEqual(SEEDS * 0.95);
  });

  it('Einsatz von Akt 7 läuft strikt mit allen gelernten Tasten und Tempo-Ziel 60; jedes der neun Sonderzeichen erreicht über 300 Startwerte mindestens 80 % seines Gewichtsanteils', () => {
    const SEEDS = 300;
    const m7 = findModule(ALL_COURSE, 'm7');
    expect(m7.exam).toEqual({ minAccuracy: 0.92, minApm: 60, durationSec: 60, keys: 'learned' });
    const learned = keysUpTo(ALL_COURSE, 'm7-l3');
    const specials = moduleKeys(m7);
    expect([...specials].sort().join('')).toBe(['@', '€', '{', '}', '[', ']', '\\', '~', '|'].sort().join(''));
    const share = charWeights({ allowed: learned, focus: specials });
    const counts = new Map<string, number>();
    let chars = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const typing = examTyping(ALL_COURSE, 'm7', seed);
      expect(typing.mode).toBe('strict');
      const text = typing.text.replaceAll(' ', '');
      expect([...text].every((c) => learned.includes(c)), typing.text).toBe(true);
      chars += text.length;
      for (const c of text) counts.set(learnKey(c), (counts.get(learnKey(c)) ?? 0) + 1);
    }
    for (const k of specials) expect((counts.get(learnKey(k)) ?? 0) / chars, k).toBeGreaterThanOrEqual(0.8 * (share.get(k) ?? 0));
  });

  it('Einsatz mit mode: flow startet im Fluss-Modus, ohne das Feld strikt; der Text bleibt derselbe', () => {
    const flowCourse = { ...PUNCT_COURSE, modules: PUNCT_COURSE.modules.map((m) => (m.id === 'p2' ? { ...m, exam: { ...m.exam, mode: 'flow' as const } } : m)) };
    expect(examTyping(flowCourse, 'p2', 5).mode).toBe('flow');
    expect(examTyping(PUNCT_COURSE, 'p2', 5).mode).toBe('strict');
    expect(examTyping(flowCourse, 'p1', 5).mode).toBe('strict');
    expect(examTyping(flowCourse, 'p2', 5).text).toBe(examTyping(PUNCT_COURSE, 'p2', 5).text);
  });

  it('Einsatz ohne Feld keys bleibt beim Text nur aus Modul-Tasten', () => {
    for (let seed = 1; seed <= 20; seed++) expect(examTyping(PUNCT_COURSE, 'p1', seed).text).toMatch(/^[asdfjkle ]+$/);
    // derselbe Text wie der Generator ihn nur aus den Modul-Tasten baut
    const a = TEST_COURSE.modules[0]!;
    expect(examTyping(TEST_COURSE, 'a', 3).text).toBe(generateText({ allowed: moduleKeys(a), words: allWords(TEST_COURSE), length: examTextLength(a.exam), rng: createRng(3) }));
  });
});

describe('Dialog', () => {
  it('fillLine füllt Text, Karte und Antworten samt getipptem Text und Reaktion', () => {
    const line: Line = {
      speaker: 'ada',
      text: 'Hallo {vorname}',
      card: { title: '{codename}', text: 'Akte {codename}' },
      choices: [{ id: 'x', label: '{vorname}?', text: 'Ich, {vorname}', typed: '{codename}', reply: [{ speaker: 'kruemel', text: 'Hi {vorname}' }] }],
    };
    const l = fillLine(line, { vorname: 'Lena', codename: 'fuchs' });
    expect([l.text, l.card?.title, l.card?.text]).toEqual(['Hallo Lena', 'fuchs', 'Akte fuchs']);
    expect(l.choices?.[0]).toMatchObject({ label: 'Lena?', text: 'Ich, Lena', typed: 'fuchs', reply: [{ text: 'Hi Lena' }] });
  });

  it('fillLine behält das Aussehen einer Karte (Goldrand), füllt nur Titel und Text', () => {
    expect(fillLine({ speaker: 'ada', text: 'Post.', card: { title: 'Aus dem Briefkasten', text: 'Für {codename}.', look: 'goldcard' } }, { codename: 'fuchs' }).card).toEqual({ title: 'Aus dem Briefkasten', text: 'Für fuchs.', look: 'goldcard' });
    expect(fillLine({ speaker: 'kruemel', text: 'Blatt.', card: { title: 'Lieferblatt', text: 'Lehrer: gesucht.' } }, {}).card).toEqual({ title: 'Lieferblatt', text: 'Lehrer: gesucht.' });
  });

  it('fillLine füllt auch den durchgestrichenen Teil einer korrigierten Nachricht; ohne `strike` kommt keiner dazu', () => {
    expect(fillLine({ speaker: 'tippi', text: 'Für mich, {vorname}!', strike: 'Für {codename}' }, { vorname: 'Lena', codename: 'fuchs' })).toMatchObject({ text: 'Für mich, Lena!', strike: 'Für fuchs' });
    expect('strike' in fillLine({ speaker: 'tippi', text: 'Gratis.' }, {})).toBe(false);
  });

  it('fillLine lässt unbekannte Namen in Klammern stehen: der getippte Befehl `{stopp}` bleibt wörtlich, auch im getippten Text', () => {
    const l = fillLine(
      { speaker: 'kruemel', text: '{stopp} hält sie an, {codename}.', choices: [{ id: 'stopp', label: '{stopp}', text: '{stopp}', typed: '{stopp}' }] },
      { vorname: 'Lena', codename: 'fuchs' },
    );
    expect(l.text).toBe('{stopp} hält sie an, fuchs.');
    expect(l.choices?.[0]).toMatchObject({ label: '{stopp}', text: '{stopp}', typed: '{stopp}' });
  });

  const lines: Line[] = [
    { speaker: 'erzaehler', text: 'Hallo {vorname}.', scene: 'backstube' },
    { speaker: 'ada', text: 'Frage?', choices: [{ id: 'ja', label: 'Ja', text: 'Ja!', reply: [{ speaker: 'ada', text: 'Gut.' }] }, { id: 'nein', label: 'Nein', text: 'Nein', action: 'wardrobe' }] },
    { speaker: 'kruemel', text: 'Ende.', scene: 'keller' },
  ];
  const reveal = (s: DialogState) => dialogReducer(s, { type: 'reveal', chars: 99 });

  it('ersetzt Platzhalter und zeigt Text schrittweise', () => {
    let s = dialogStart(lines, { vorname: 'Lena' });
    expect(currentLine(s)?.text).toBe('Hallo Lena.');
    s = dialogReducer(s, { type: 'reveal', chars: 2 });
    expect(visibleText(s)).toBe('Ha');
    s = dialogReducer(s, { type: 'advance' }); // erstes Enter: ganzen Text zeigen
    expect(visibleText(s)).toBe('Hallo Lena.');
    expect(sceneAt(s, 'keller')).toBe('backstube');
  });

  it('Schreibmaschine zerschneidet kein Emoji', () => {
    let s = dialogStart([{ speaker: 'juna', text: 'Hi 😀!' }]);
    const seen: string[] = [];
    while (!isLineComplete(s)) {
      s = dialogReducer(s, { type: 'reveal', chars: 1 });
      seen.push(visibleText(s));
    }
    expect(seen).toEqual(['H', 'Hi', 'Hi ', 'Hi 😀', 'Hi 😀!']);
    for (const t of seen) expect(t).not.toMatch(/[\ud800-\udbff](?![\udc00-\udfff])|\ufffd/);
  });

  it('Antworten: erst sichtbar, wenn der Text fertig ist; Wahl fügt Antwort und Reaktion ein', () => {
    let s = dialogReducer(reveal(dialogStart(lines)), { type: 'advance' });
    expect(visibleChoices(s)).toBeUndefined();
    expect(dialogReducer(s, { type: 'choose', index: 0 })).toBe(s);
    s = reveal(s);
    expect(visibleChoices(s)).toHaveLength(2);
    s = dialogReducer(s, { type: 'pick', delta: -1 });
    expect(s.pick).toBe(1);
    s = dialogReducer(s, { type: 'choose', index: 0 });
    expect(currentLine(s)).toEqual({ speaker: 'player', text: 'Ja!' });
    s = dialogReducer(reveal(s), { type: 'advance' });
    expect(currentLine(s)?.text).toBe('Gut.');
    expect(castAt(s)).toEqual(['ada']);
  });

  it('Enter wählt die markierte Antwort; nach der letzten Zeile ist Schluss', () => {
    let s = reveal(dialogReducer(reveal(dialogStart(lines)), { type: 'advance' }));
    s = dialogReducer(s, { type: 'pick', delta: 1 });
    s = dialogReducer(s, { type: 'advance' });
    expect(currentLine(s)).toEqual({ speaker: 'player', text: 'Nein' });
    s = dialogReducer(reveal(s), { type: 'advance' }); // „Nein“ (Spieler)
    s = reveal(s);
    expect(sceneAt(s, 'backstube')).toBe('keller');
    expect(castAt(s)).toEqual(['ada', 'kruemel']);
    s = dialogReducer(s, { type: 'advance' });
    expect(s.done).toBe(true);
    expect(dialogReducer(s, { type: 'advance' })).toBe(s);
    expect(dialogStart([]).done).toBe(true);
    expect(dialogReducer(s, { type: 'pick', delta: 1 })).toBe(s);
  });

  it('wer aus der Ferne spricht (offstage), steht nicht auf der Bühne', () => {
    const radio: Line[] = [
      { speaker: 'ada', text: 'Los.' },
      { speaker: 'juna', text: 'FUNK: Ich drück die Daumen.', offstage: true },
    ];
    expect(castAt({ ...dialogStart(radio), index: 1 })).toEqual(['ada']);
    expect(castAt({ ...dialogStart([radio[0]!, { speaker: 'juna', text: 'Ich bin da.' }]), index: 1 })).toEqual(['ada', 'juna']);
  });

  it('Pfeiltasten ohne Antworten ändern nichts', () => {
    const s = dialogStart(lines);
    expect(dialogReducer(s, { type: 'pick', delta: 1 })).toBe(s);
  });

  it('passt zu einem echten Profil (Platzhalter aus storyVars)', () => {
    expect(dialogStart([{ speaker: 'ada', text: '{vorname}' }], { vorname: profile().firstName }).queue[0]?.text).toBe('Lena');
  });
});
