// Story-Kern: Auslöser, Log, Lesestand und Nebenszenen.

import { describe, expect, it } from 'vitest';
import { REWARDS } from '../content/rewards.ts';
import { STORY } from '../app/rules.ts';
import { TEST_RULES, profile } from '../test/factories.ts';
import type { Line } from './dialog.ts';
import type { Profile } from './profile.ts';
import { catchUp, chatsOf, dueScenes, evaluateRun, pendingGifts, settleStory, markRead, nextSideScene, nextStageAt, pick, unread } from './story.ts';
import { isLogged, logScenes, sceneFor, type StoryScene, type Trigger } from './scenes.ts';

// ---------- Szenen ----------

const L: Line[] = [{ speaker: 'kruemel', text: 'Hallo.' }];
const scene = (id: string, trigger: Trigger, x: Partial<StoryScene> = {}): StoryScene => ({ id, chat: 'intern', trigger, lines: L, ...x });
const lesson = (best: number, mastered = false) => ({ exercises: 0, bestStars: 0 as const, mastered, best });
const rules = TEST_RULES;
const world = (scenes: StoryScene[]) => ({ scenes, items: [], cases: [] });
const T = (p: Profile, content: StoryScene[]) => dueScenes(p, world(content), rules);

describe('dueScenes', () => {
  it('briefing: sobald der Auftrag begonnen wurde oder das Briefing gesehen ist', () => {
    const c = [scene('b', { on: 'briefing', lessonId: 'a2' })];
    expect(T(profile(), c)).toEqual([]);
    expect(T(profile({ lessons: { a2: lesson(0) } }), c)).toEqual(['b']);
    expect(T(profile({ seen: ['briefing:a2'] }), c)).toEqual(['b']);
  });

  it('stage: knapp unter und über jeder Schwelle; übersprungene Stufen kommen der Reihe nach', () => {
    const c = [0.25, 0.5, 0.75].map((at) => scene(`s${at * 100}`, { on: 'stage', lessonId: 'a1', at: at as 0.25 }));
    expect(T(profile({ lessons: { a1: lesson(0.249) } }), c)).toEqual([]);
    expect(T(profile({ lessons: { a1: lesson(0.25) } }), c)).toEqual(['s25']);
    expect(T(profile({ lessons: { a1: lesson(0.5) } }), c)).toEqual(['s25', 's50']);
    expect(T(profile({ lessons: { a1: lesson(0.9) } }), c)).toEqual(['s25', 's50', 's75']);
  });

  it('mastered, exam (bestanden und Hintertür), badge', () => {
    const c = [scene('m', { on: 'mastered', lessonId: 'a1' }), scene('e', { on: 'exam', moduleId: 'a' }), scene('b', { on: 'badge', badgeId: 'tastsinn' })];
    expect(T(profile({ lessons: { a1: lesson(0.99) } }), c)).toEqual([]);
    expect(T(profile({ lessons: { a1: lesson(1, true) } }), c)).toEqual(['m']);
    const exam = (outcome: string) => ({ a: { failures: 0, outcome } }) as unknown as Profile['exams'];
    expect(T(profile({ exams: exam('open') }), c)).toEqual([]);
    expect(T(profile({ exams: exam('passed') }), c)).toEqual(['e']);
    expect(T(profile({ exams: exam('backdoor') }), c)).toEqual(['e']);
    expect(T(profile({ badges: { tastsinn: 5 } }), c)).toEqual(['b']);
  });

  it('rank: ab dem zweiten Rang, nie für den ersten; unbekannte Ränge lösen nichts aus', () => {
    const c = [scene('r0', { on: 'rank', rank: 'rekrut' }), scene('r1', { on: 'rank', rank: 'anwaerter' }), scene('rx', { on: 'rank', rank: 'Gibtsnicht' })];
    expect(T(profile({ xp: REWARDS.ranks[1]!.minXp - 1 }), c)).toEqual([]);
    expect(T(profile({ xp: REWARDS.ranks[1]!.minXp }), c)).toEqual(['r1']);
  });

  it('bereits ausgelöste Szenen kommen nicht noch einmal; case und side löst nur die Anwendung aus', () => {
    const c = [scene('m', { on: 'mastered', lessonId: 'a1' }), scene('c', { on: 'case', caseId: 'x', part: 'intro' }), scene('o', { on: 'caseOpen', caseId: 'x' })];
    const p = profile({ lessons: { a1: lesson(1, true) } });
    expect(T(p, c)).toEqual(['m']);
    expect(T(logScenes(p, ['m'], 5), c)).toEqual([]);
  });
});

describe('nächste Szene eines Auftrags (nextStageAt)', () => {
  const stages = [scene('s25', { on: 'stage', lessonId: 'a1', at: 0.25 }), scene('s75', { on: 'stage', lessonId: 'a1', at: 0.75 }), scene('x', { on: 'stage', lessonId: 'a2', at: 0.5 })];
  it('die nächste Stufe über dem besten Stand; eine erreichte Stufe zählt nicht mehr', () => {
    expect(nextStageAt(world(stages), 'a1', 0, false)).toBe(0.25);
    expect(nextStageAt(world(stages), 'a1', 0.25, false)).toBe(0.75);
    expect(nextStageAt(world(stages), 'a1', 0.6, false)).toBe(0.75);
  });
  it('danach nur noch die Abschluss-Szene; geschafft: nichts mehr', () => {
    expect(nextStageAt(world(stages), 'a1', 0.8, false)).toBe('done');
    expect(nextStageAt(world(stages), 'a1', 0.8, true)).toBeNull();
  });
});

describe('Szenen finden', () => {
  it('sceneFor sucht nach Art und Daten des Auslösers; isLogged schaut ins Log', () => {
    const c = world([scene('i', { on: 'case', caseId: 'x', part: 'intro' }), scene('o', { on: 'case', caseId: 'x', part: 'outro' }), scene('e', { on: 'exam', moduleId: 'a' })]);
    expect(sceneFor(c, 'case', (t) => t.caseId === 'x' && t.part === 'outro')?.id).toBe('o');
    expect(sceneFor(c, 'exam', (t) => t.moduleId === 'a')?.id).toBe('e');
    expect(sceneFor(c, 'exam', (t) => t.moduleId === 'b')).toBeUndefined();
    const p = logScenes(profile(), ['o'], 1);
    expect([isLogged(p, 'o'), isLogged(p, 'i')]).toEqual([true, false]);
  });
});

describe('Log, Lesestand, Antworten', () => {
  const content = { scenes: [scene('a', { on: 'briefing', lessonId: 'a1' }), scene('b', { on: 'briefing', lessonId: 'a2' }, { chat: 'kruemel' })] };

  it('logScenes ist idempotent und merkt die Zeit; markRead und pick', () => {
    const p1 = logScenes(profile(), ['a', 'b', 'a'], 7);
    expect(p1.story.log).toEqual([{ id: 'a', t: 7 }, { id: 'b', t: 7 }]);
    expect(logScenes(p1, ['a'], 9)).toBe(p1);
    expect(unread(p1, content)).toEqual(['a', 'b']);
    expect(unread(p1, content, 'kruemel')).toEqual(['b']);
    const p2 = markRead(p1, ['a']);
    expect(unread(p2, content)).toEqual(['b']);
    expect(markRead(p2, ['a'])).toBe(p2);
    expect(pick(pick(p2, 'a', 'x'), 'a', 'y').story.picks).toEqual({ a: ['x', 'y'] });
    // neuer Durchlauf einer abgebrochenen Szene: die erste Wahl ersetzt die alten
    expect(pick(pick(p2, 'a', 'x'), 'a', 'z', true).story.picks).toEqual({ a: ['z'] });
  });

  it('unread ignoriert unbekannte IDs im Log', () => {
    expect(unread(logScenes(profile(), ['weg'], 0), content)).toEqual([]);
  });

  it('chatsOf findet auch Zeilen in anderen Chats (auch in Antworten)', () => {
    const s = scene('x', { on: 'briefing', lessonId: 'a1' }, {
      lines: [{ speaker: 'juna', text: 'Hi', chat: 'fluestern' }, { speaker: 'ada', text: '?', choices: [{ id: 'c', label: 'c', text: 'c', reply: [{ speaker: 'juna', text: 'o', chat: 'juna' }] }] }],
    });
    expect(chatsOf(s).sort()).toEqual(['fluestern', 'intern', 'juna']);
  });
});

describe('Nebenszenen', () => {
  const side = (id: string, strand: string, order: number, fromLesson: string, x: Partial<Extract<Trigger, { on: 'side' }>> = {}) =>
    scene(id, { on: 'side', strand, order, fromLesson, ...x });
  const content = [side('t1', 'tag', 1, 'a1'), side('t2', 'tag', 2, 'a1'), side('k1', 'kringel', 1, 'a2'), side('f1', 'fluester', 1, 'a1', { untilLesson: 'a2' }), side('f2', 'fluester', 2, 'a1')];
  const next = (p: Profile) => nextSideScene(p, { scenes: content }, rules, 'a1');

  it('nie gezeigte Stränge zuerst, bei Gleichstand die Listenreihenfolge; Strang noch nicht erreicht = übergangen', () => {
    expect(next(profile())).toBe('t1');
    expect(next(logScenes(profile(), ['t1'], 0))).toBe('f1');
    expect(next(logScenes(profile(), ['t1', 'f1'], 0))).toBe('t2'); // t am längsten her… Kringel (ab a2) ist noch nicht erreicht
  });

  it('gleicher Strangname in zwei Akten: getrennte Stränge, die erste Szene des späteren Akts hält den laufenden nicht an', () => {
    const scenes = [side('k1', 'kringel', 1, 'a1'), side('k2', 'kringel', 2, 'a1'), side('bk1', 'kringel', 1, 'b1'), side('bk2', 'kringel', 2, 'b1')];
    expect(nextSideScene(logScenes(profile(), ['k1'], 0), { scenes }, rules, 'a1')).toBe('k2');
    expect(nextSideScene(logScenes(profile(), ['k1', 'k2'], 0), { scenes }, rules, 'a1')).toBeNull(); // Akt B ist noch nicht dran
    const inB = profile({ lessons: { a1: lesson(1, true), a2: lesson(1, true), b1: lesson(0) } });
    expect(nextSideScene(logScenes(inB, ['k1'], 0), { scenes }, rules, 'b1')).toBe('bk1'); // k2 bleibt in Akt A (nur bei Wiederholung dort)
    expect(nextSideScene(logScenes(inB, ['k1', 'bk1'], 0), { scenes }, rules, 'b1')).toBe('bk2');
  });

  it('wechselt ab: der Strang mit der ältesten letzten Szene ist dran', () => {
    const p = logScenes(profile({ lessons: { a1: lesson(1, true), a2: lesson(0) } }), ['t1', 'k1', 'f1'], 0);
    expect(nextSideScene(p, { scenes: content }, rules, 'a2')).toBe('t2');
  });

  it('untilLesson: nach dem Auftrag fällt die Szene weg, der Strang geht weiter', () => {
    const p = profile({ lessons: { a1: lesson(1, true), a2: lesson(1, true) } });
    expect(nextSideScene(p, { scenes: [side('f1', 'f', 1, 'a1', { untilLesson: 'a2' }), side('f2', 'f', 2, 'a1')] }, rules, 'a2')).toBe('f2');
  });

  it('afterCase: erst wenn der Fall gelöst ist', () => {
    const c = [side('g', 'gedicht', 1, 'a1', { afterCase: 'brief' })];
    expect(nextSideScene(profile(), { scenes: c }, rules, 'a1')).toBeNull();
    expect(nextSideScene(profile({ cases: { brief: 3 } }), { scenes: c }, rules, 'a1')).toBe('g');
  });

  it('afterScene: erst wenn die Szene im Log steht (Figur oder Begriff ist dann bekannt)', () => {
    const c = [side('j', 'juna', 1, 'a1', { afterScene: 'vorstellung' })];
    expect(nextSideScene(profile(), { scenes: c }, rules, 'a1')).toBeNull();
    expect(nextSideScene(logScenes(profile(), ['vorstellung'], 0), { scenes: c }, rules, 'a1')).toBe('j');
  });

  it('untilCase: ist der Fall gelöst, fällt die Szene weg, der Strang geht weiter', () => {
    const c = [side('g1', 'geruecht', 1, 'a1', { untilCase: 'brunnen' }), side('g2', 'geruecht', 2, 'a1')];
    expect(nextSideScene(profile(), { scenes: c }, rules, 'a1')).toBe('g1');
    expect(nextSideScene(profile({ cases: { brunnen: 3 } }), { scenes: c }, rules, 'a1')).toBe('g2');
  });

  it('nur im eigenen Akt: eine Nebenszene aus einem anderen Modul kommt nicht, auch wenn ihr Auftrag längst erreicht ist', () => {
    const c = [side('alt', 'tag', 1, 'a1'), side('neu', 'wetter', 1, 'b1')];
    expect(nextSideScene(profile(), { scenes: c }, rules, 'b1')).toBe('neu');
    expect(nextSideScene(logScenes(profile(), ['neu'], 0), { scenes: c }, rules, 'b1')).toBeNull();
    expect(nextSideScene(profile(), { scenes: c }, rules, 'a2')).toBe('alt');
  });

  it('noGift: Szenen mit Geschenk fallen weg und halten ihren Strang an', () => {
    const c = [{ ...side('mit', 'juna', 1, 'a1'), gives: ['kappe'] }, side('danach', 'juna', 2, 'a1'), side('anderer', 'tag', 1, 'a1')];
    expect(nextSideScene(profile(), { scenes: c }, rules, 'a1')).toBe('mit');
    expect(nextSideScene(profile(), { scenes: c }, rules, 'a1', { noGift: true })).toBe('anderer');
  });

  it('wholeModule: jeder Auftrag des Moduls gilt als erreicht, auch Stränge ab einem späteren Auftrag; andere Module nicht', () => {
    const c = [side('t1', 'tag', 1, 'a1'), side('k1', 'kringel', 1, 'a2'), side('b', 'wetter', 1, 'b1')];
    const p = logScenes(profile(), ['t1'], 0);
    expect(nextSideScene(p, { scenes: c }, rules, 'a1')).toBeNull();
    expect(nextSideScene(p, { scenes: c }, rules, 'a1', { wholeModule: true })).toBe('k1');
    expect(nextSideScene(logScenes(p, ['k1'], 1), { scenes: c }, rules, 'a1', { wholeModule: true })).toBeNull();
  });

  it('Vorrat leer: null', () => {
    expect(nextSideScene(logScenes(profile(), content.map((s) => s.id), 0), { scenes: content }, rules, 'a1')).toBeNull();
  });
});

describe('Durchgang auswerten (evaluateRun)', () => {
  const content = {
    scenes: [
      scene('b', { on: 'briefing', lessonId: 'a1' }),
      scene('s', { on: 'stage', lessonId: 'a1', at: 0.25 }),
      scene('x', { on: 'badge', badgeId: 'tastsinn' }),
      scene('t1', { on: 'side', strand: 'tag', order: 1, fromLesson: 'a1' }),
    ],
  };
  const run = (logStart: number, wasCurrent = true, replay = false) => ({ lessonId: 'a1', logStart, wasCurrent, replay });

  it('neue Haupt-Szenen seit dem Start öffnen sich; eine Stufe verdrängt die Nebenszene; anderes (Abzeichen, unbekannt) bleibt still', () => {
    const p = logScenes(logScenes(profile(), ['b'], 1), ['s', 'x', 'weg'], 2);
    const { profile: next, result } = evaluateRun(p, content, rules, run(1), 9);
    expect(result).toEqual({ open: ['s'], side: null });
    expect(next).toBe(p);
  });

  it('ohne Stufe: eine neue Nebenszene als Hinweis, ins Log eingetragen – nur an einem offenen Auftrag', () => {
    const p = profile({ lessons: { a1: lesson(0.1) } });
    const { profile: next, result } = evaluateRun(p, content, rules, run(0), 9);
    expect(result).toEqual({ open: [], side: 't1' });
    expect(next.story.log).toEqual([{ id: 't1', t: 9 }]);
    expect(evaluateRun(p, content, rules, run(0, false), 9)).toEqual({ profile: p, result: { open: [], side: null } });
    const done = profile({ lessons: { a1: lesson(1, true) } });
    expect(evaluateRun(done, content, rules, run(0), 9).result.side).toBeNull();
  });

  it('Wiederholung (replay): im abgeschlossenen Akt kommt die nächste übrige Nebenszene, auch aus einem späteren Strang; im laufenden Akt nicht; Geschenk-Regel gilt', () => {
    const c = {
      scenes: [scene('t1', { on: 'side', strand: 'tag', order: 1, fromLesson: 'a1' }), { ...scene('g', { on: 'side', strand: 'geschenk', order: 1, fromLesson: 'a2' }), gives: ['kappe'] }, scene('k1', { on: 'side', strand: 'kringel', order: 1, fromLesson: 'a2' })],
    };
    const done = profile({ lessons: { a1: lesson(1, true), a2: lesson(1, true) }, story: { log: [{ id: 't1', t: 1 }], read: [], picks: {} } as never });
    const { result } = evaluateRun(done, c, rules, run(1, false, true), 9);
    expect(result).toEqual({ open: [], side: 'g' });
    expect(evaluateRun(done, c, rules, run(1, false, false), 9).result.side).toBeNull(); // laufender Akt: keine Wiederholung
    const withGift = evaluateRun(logScenes(done, ['gabe'], 5), { scenes: [...c.scenes, { ...scene('gabe', { on: 'badge', badgeId: 'x' }), gift: true } as never] }, rules, run(1, false, true), 9);
    expect(withGift.result.side).toBe('k1'); // Geschenk-Szene 'g' fällt weg, der Strang kringel kommt
  });

  it('kein Geschenk, keine Nebenszene mit Geschenk im selben Durchgang', () => {
    const gifts = {
      scenes: [
        { ...scene('g', { on: 'briefing', lessonId: 'a1' }), gift: true as const },
        { ...scene('k', { on: 'side', strand: 'juna', order: 1, fromLesson: 'a1' }), gives: ['kappe'] },
      ],
    };
    const withGift = logScenes(profile({ lessons: { a1: lesson(0.1) } }), ['g'], 1);
    expect(evaluateRun(withGift, gifts, rules, run(0), 9).result.side).toBeNull();
    // ohne Geschenk im Durchgang kommt sie
    expect(evaluateRun(profile({ lessons: { a1: lesson(0.1) } }), gifts, rules, run(0), 9).result.side).toBe('k');
  });

  it('idempotent: eine zweite Auswertung findet die Nebenszene schon im Log', () => {
    const first = evaluateRun(profile(), content, rules, run(0), 9);
    const second = evaluateRun(first.profile, content, rules, run(0), 10);
    expect(second.result).toEqual(first.result);
    expect(second.profile).toBe(first.profile);
  });
});

describe('Migration (catchUp)', () => {
  it('alles, was jetzt fällig wäre, gilt als ausgelöst und gelesen – ohne Flut später', () => {
    const c = world([scene('m', { on: 'mastered', lessonId: 'a1' }), scene('n', { on: 'mastered', lessonId: 'a2' })]);
    const p = catchUp(profile({ lessons: { a1: lesson(1, true) } }), c, rules);
    expect(p.story.log).toEqual([{ id: 'm', t: 0 }]);
    expect(unread(p, c)).toEqual([]);
    expect(dueScenes(p, c, rules)).toEqual([]);
  });

  it('schon ausgelöste, ungelesene Szenen bleiben ungelesen (z. B. eine Paket-Meldung vor einem Inhalts-Update)', () => {
    const c = world([scene('m', { on: 'mastered', lessonId: 'a1' }), scene('alt', { on: 'mastered', lessonId: 'a2' })]);
    const before = logScenes(profile({ lessons: { a1: lesson(1, true) } }), ['alt'], 5);
    const p = catchUp(before, c, rules);
    expect(unread(p, c)).toEqual(['alt']);
    expect(p.story.read).toEqual(['m']);
  });

  it('unbekannte IDs im Log bleiben liegen und stören nicht', () => {
    const p = catchUp(logScenes(profile(), ['alt'], 1), world([]), rules);
    expect(p.story.log.map((l) => l.id)).toEqual(['alt']);
    expect(unread(p, { scenes: [] })).toEqual([]);
  });

  it('die echten Szenen lösen auf', () => {
    expect(STORY.scenes.length).toBeGreaterThan(0);
  });
});

describe('Geschenke: höchstens eines je Durchgang', () => {
  const badge = (id: string): Trigger => ({ on: 'badge', badgeId: id });
  const content = {
    scenes: [
      scene('story', badge('a')), // kein Geschenk: kommt immer
      scene('erstes', badge('a'), { gift: true }),
      scene('zweites', badge('b'), { gift: true }),
      scene('alt', badge('a'), { gift: true, retired: { since: 6 }, gives: ['shorts'] }),
    ],
    items: [],
    cases: [],
  };
  const p = profile({ badges: { a: 1, b: 1 } });

  it('ohne Freigabe kein Geschenk; mit Freigabe genau eines, das erste in der Liste (Vorrang)', () => {
    expect(dueScenes(p, content, TEST_RULES)).toEqual(['story']);
    expect(dueScenes(p, content, TEST_RULES, { gift: true })).toEqual(['story', 'erstes']);
    const next = logScenes(p, ['story', 'erstes'], 1);
    expect(dueScenes(next, content, TEST_RULES, { gift: true })).toEqual(['zweites']);
    expect(pendingGifts(p, content, TEST_RULES).map((x) => x.id)).toEqual(['erstes', 'zweites']);
  });

  it('stillgelegte Szenen werden nie fällig – nur Spielstände von vor der Stilllegung holen sie nach, ohne Bremse', () => {
    expect(dueScenes(p, content, TEST_RULES, { gift: true })).not.toContain('alt');
    const old = { ...p, story: { ...p.story, v: 5 } };
    expect(dueScenes(old, content, TEST_RULES, { catchUp: true })).toEqual(['story', 'erstes', 'zweites', 'alt']);
    expect(catchUp(old, content, TEST_RULES).story.log.map((l) => l.id)).toEqual(['story', 'erstes', 'zweites', 'alt']);
    // wer schon nach der Stilllegung gespielt hat, bekommt sie auch bei einer späteren Inhaltsversion nicht
    const newer = { ...p, story: { ...p.story, v: 6 } };
    expect(catchUp(newer, content, TEST_RULES).story.log.map((l) => l.id)).toEqual(['story', 'erstes', 'zweites']);
  });

  it('settleStory: löst aus, bis nichts mehr fällig ist – mit Freigabe über alle Durchläufe höchstens ein Geschenk', () => {
    // ein zweites fälliges Geschenk bleibt für den nächsten Durchgang liegen; andere Szenen kommen mit
    const chain = { ...content, scenes: [scene('geschenk', badge('a'), { gift: true }), scene('folge', { on: 'badge', badgeId: 'b' }), scene('noch-eins', badge('b'), { gift: true })] };
    const after = settleStory(p, chain, TEST_RULES, 1, true);
    expect(after.story.log.map((l) => l.id)).toEqual(['geschenk', 'folge']);
    expect(settleStory(p, chain, TEST_RULES, 1).story.log.map((l) => l.id)).toEqual(['folge']);
  });
});

