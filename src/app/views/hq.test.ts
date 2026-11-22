// Ansicht des HQ: Missionskarte, Ende der Geschichte, nächstes Geschenk.

import { describe, expect, it } from 'vitest';
import { COURSE } from '../../content/course.ts';
import { findLesson } from '../../domain/course.ts';
import { catchUp } from '../../domain/story.ts';
import { logScenes } from '../../domain/scenes.ts';
import { SHIFT_COURSE, mastered, masteredModule, profile, rewarded } from '../../test/factories.ts';
import { RULES, STORY } from '../rules.ts';
import { hqView } from './hq.ts';

describe('hqView: Missionskarte', () => {
  it('Status je Auftrag: frei, aktuell, geschafft, Sterne und Fortschritt nur, solange offen', () => {
    const p = profile({ lessons: { ...mastered('m1-l1'), 'm1-l2': { best: 0.3, bestStars: 2, mastered: false, exercises: 1 } } });
    const [m1] = hqView(p, RULES, STORY).modules;
    const [l1, l2, l3] = m1!.lessons;
    expect(l1).toMatchObject({ id: 'm1-l1', unlocked: true, mastered: true, current: false, progress: null });
    expect(l2).toMatchObject({ id: 'm1-l2', unlocked: true, mastered: false, current: true, stars: 2, progress: 0.3 });
    expect(l3).toMatchObject({ unlocked: false, current: false, stars: 0, progress: null });
    expect(l1!.keys).toBe('F J');
    expect(m1).toMatchObject({ id: 'm1', title: COURSE.modules[0]!.title, done: false, exam: { open: false, outcome: undefined, status: 'Erst alle Aufträge schaffen' } });
  });

  it('Einsatz: bereit, bestanden, durch die Hintertür', () => {
    const lessons = masteredModule(COURSE, 'm1');
    expect(hqView(profile({ lessons }), RULES, STORY).modules[0]).toMatchObject({ done: false, exam: { open: true, status: 'Bereit!' } });
    const passed = profile({ lessons, exams: { m1: { attempts: 1, outcome: 'passed' } } });
    expect(hqView(passed, RULES, STORY).modules[0]).toMatchObject({ done: true, exam: { outcome: 'passed', status: 'Bestanden' } });
    const backdoor = profile({ lessons, exams: { m1: { attempts: 1, outcome: 'backdoor' } } });
    expect(hqView(backdoor, RULES, STORY).modules[0]).toMatchObject({ done: true, exam: { outcome: 'backdoor', status: 'Unsicher – geht jederzeit nochmal' } });
  });

  it('vor dem Einsatz von Akt 1 ist kein Auftrag dran: Auftrag 1 von Akt 2 ist gesperrt, der Einsatz steht an', () => {
    const lessons = masteredModule(COURSE, 'm1');
    const open = hqView(profile({ lessons }), RULES, STORY);
    expect(open).toMatchObject({ current: null, examDueId: 'm1', todo: null });
    expect(open.modules[1]!.lessons[0]).toMatchObject({ id: 'm2-l1', unlocked: false, current: false });
    const backdoor = hqView(profile({ lessons, exams: { m1: { attempts: 3, outcome: 'backdoor' } } }), RULES, STORY);
    expect(backdoor.current).toBe('m2-l1');
    expect(backdoor.modules[1]!.lessons[0]).toMatchObject({ unlocked: true, current: true });
  });
});

describe('hqView.modules[].moreSides: übrige Nebenszenen im abgeschlossenen Akt', () => {
  const lessons = masteredModule(COURSE, 'm1');
  const sides = STORY.scenes.filter((s) => s.trigger.on === 'side' && findLesson(COURSE, s.trigger.fromLesson).module.id === 'm1');
  const hint = (p: ReturnType<typeof profile>) => hqView(p, RULES, STORY).modules[0]!.moreSides;

  it('nur nach dem Einsatz und solange Nebenszenen übrig sind', () => {
    expect(hint(profile({ lessons }))).toBe(false); // Einsatz nicht gespielt
    const passed = profile({ lessons, exams: { m1: { attempts: 1, outcome: 'passed' } } });
    expect(hint(passed)).toBe(true);
    expect(hint({ ...passed, exams: { m1: { attempts: 3, outcome: 'backdoor' } } })).toBe(true);
    expect(hint(logScenes(passed, sides.map((s) => s.id), 0))).toBe(false);
  });
});

describe('hqView.storyEnd: Karte nach dem letzten Einsatz', () => {
  it('erst nach dem Einsatz des letzten Moduls im Kurs (bestanden oder Hintertür)', () => {
    const last = COURSE.modules.at(-1)!.id;
    expect(hqView(profile(), RULES, STORY).storyEnd).toBeNull();
    expect(hqView(profile({ exams: { m1: { attempts: 1, outcome: 'passed' } } }), RULES, STORY).storyEnd).toBeNull();
    const passed = hqView(profile({ exams: { [last]: { attempts: 1, outcome: 'passed' } } }), RULES, STORY).storyEnd;
    expect(passed).toEqual({ moduleId: last, backdoor: false });
    expect(hqView(profile({ exams: { [last]: { attempts: 3, outcome: 'backdoor' } } }), RULES, STORY).storyEnd?.backdoor).toBe(true);
  });
});

describe('hqView.nextGift: Vorfreude auf der Missionskarte', () => {
  it('wartendes Geschenk, sonst eines am Ende des Auftrags, sonst der nächste Rang – nie Agententage', () => {
    // Tastsinn verdient, Paket noch nicht überreicht
    expect(hqView(profile({ badges: { tastsinn: 1 }, lessons: mastered('m1-l1') }), RULES, STORY).nextGift).toBe('Ein Geschenk ist unterwegs – es kommt am Ende deines nächsten Durchgangs.');
    // Auftrag 1: das Abzeichen Tastsinn bringt ein Paket; Auftrag 2: Adas Polo
    expect(hqView(profile(), RULES, STORY).nextGift).toBe('Am Ende dieses Auftrags wartet ein Geschenk.');
    const l2 = profile({ ...rewarded('tastsinn'), lessons: mastered('m1-l1') });
    expect(hqView(l2, RULES, STORY).nextGift).toBe('Am Ende dieses Auftrags wartet ein Geschenk.');
    // Auftrag 6 bringt nichts: der nächste Rang mit Geschenk
    // alles bisher Verdiente ist überreicht (catchUp loggt ohne Bremse)
    const l6 = catchUp(profile({ xp: 300, lessons: mastered('m1-l1', 'm1-l2', 'm1-l3', 'm1-l4', 'm1-l5') }), STORY, RULES);
    expect(hqView(l6, RULES, STORY).nextGift).toBe("Noch 120 EP bis zum Rang Agentin – dann gibt's ein Geschenk.");
    // nach allen Akten (kein aktueller Auftrag): nur noch der Rang
    const done = catchUp(profile({ xp: 300, lessons: mastered(...COURSE.modules.flatMap((m) => m.lessons.map((l) => l.id))) }), STORY, RULES);
    expect(hqView(done, RULES, STORY).current).toBeNull();
    expect(hqView(done, RULES, STORY).nextGift).toMatch(/^Noch \d+ EP bis zum Rang Agentin/);
  });
});


describe('hqView: Großschreibung', () => {
  it('die Karte nennt die Umschalttaste statt 15 Großbuchstaben', () => {
    const rules = { ...RULES, course: SHIFT_COURSE };
    const p = profile({ lessons: masteredModule(SHIFT_COURSE, 's1'), exams: { s1: { attempts: 1, outcome: 'passed' } } });
    const [, m2] = hqView(p, rules, { ...STORY, cases: [] }).modules;
    expect(m2!.lessons.map((l) => l.keys)).toEqual(['Umschalt rechts', 'Umschalt links', 'ß', 'Große Umlaute']);
  });
});

describe('hqView: Fälle ohne Gadget (Fälle der Woche)', () => {
  it('der Fall ist spielbar ohne Gadget, mit schlichtem Hinweis; der zweite erst nach dem ersten', () => {
    const base = { id: 'w1', title: 'Fall 1', fromLesson: 'm1-l1', frame: 'Eins', reveal: { title: 'a', text: 'b' }, picture: STORY.cases[0]!.picture };
    const story = { ...STORY, cases: [base, { ...base, id: 'w2', title: 'Fall 2', afterCase: 'w1' }] };
    const p = profile({ seen: ['briefing:m1-l1'] });
    expect(hqView(p, RULES, story).extra).toEqual([{ id: 'w1', title: 'Fall 1', solved: false, locked: false, hint: 'Ein kleiner Fall zum Üben.' }]);
    const solved = hqView({ ...p, cases: { w1: 1 } }, RULES, story).extra;
    expect(solved.map((c) => [c.id, c.solved, c.locked])).toEqual([['w1', true, false], ['w2', false, false]]);
  });
});
