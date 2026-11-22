// Extra-Fälle: wann werden sie angeboten, wie sieht ihre Trainingsrunde aus?

import { describe, expect, it } from 'vitest';
import { COURSE } from '../content/course.ts';
import { ITEMS } from '../content/items.ts';
import { EXTRA_CASES, SCENES } from '../content/story/acts.ts';
import { RULES } from '../app/rules.ts';
import { mastered, profile, rewarded } from '../test/factories.ts';
import type { ExtraCase } from './cases.ts';
import { caseAvailable, caseSolved, caseVisible, findCase, lessonReached, solveCase } from './cases.ts';
import { planRounds } from './mission.ts';
import { safeKeys } from './progress.ts';
import { dueScenes } from './story.ts';
import { logScenes } from './scenes.ts';

const world = { scenes: SCENES, items: ITEMS, cases: EXTRA_CASES };
/** Kescher im Koffer: Abzeichen verdient und Krümels Meldung (sie überreicht ihn) im Log */
const kescher = rewarded('spielhalle');
const seifen = EXTRA_CASES[0]!;
const liste = EXTRA_CASES[2]!;

describe('Verfügbarkeit', () => {
  it('Gadget im Besitz UND Auftrag erreicht', () => {
    expect(caseAvailable(profile(), world, RULES, seifen)).toBe(false);
    expect(caseAvailable(profile({ ...kescher, lessons: mastered('m1-l1') }), world, RULES, seifen)).toBe(false); // Auftrag 3 nicht erreicht
    expect(caseAvailable(profile({ ...kescher, lessons: mastered('m1-l1', 'm1-l2') }), world, RULES, seifen)).toBe(false); // Auftrag 3 aktuell, aber nicht begonnen
    expect(caseAvailable(profile({ ...kescher, lessons: mastered('m1-l1', 'm1-l2'), seen: ['briefing:m1-l3'] }), world, RULES, seifen)).toBe(true); // Briefing gesehen
    expect(caseAvailable(profile({ lessons: mastered('m1-l1', 'm1-l2') }), world, RULES, seifen)).toBe(false); // Gadget fehlt
  });

  it('afterScene: Junas Liste erst nach Junas erster Nachricht', () => {
    const base = { ...rewarded('regenmacher'), lessons: mastered('m1-l1', 'm1-l2', 'm1-l3', 'm1-l4', 'm1-l5'), seen: ['briefing:m1-l6'] };
    expect(caseAvailable(profile(base), world, RULES, liste)).toBe(false);
    expect(caseAvailable(logScenes(profile(base), ['l6-s50'], 1), world, RULES, liste)).toBe(true);
  });

  it('ohne Gadget-Bedingung und mit afterCase: der Fall ist in fester Reihenfolge dran, ohne Gadget nötig', () => {
    const first: ExtraCase = { id: 'w1', title: 'Fall 1', fromLesson: 'm1-l1', frame: 'Eins', reveal: { title: 'a', text: 'b' }, picture: seifen.picture };
    const second: ExtraCase = { ...first, id: 'w2', title: 'Fall 2', afterCase: 'w1' };
    const p = profile({ seen: ['briefing:m1-l1'] });
    expect(caseAvailable(p, world, RULES, first)).toBe(true);
    expect(caseAvailable(p, world, RULES, second)).toBe(false);
    expect(caseVisible(p, RULES, second)).toBe(false);
    const solved = profile({ seen: ['briefing:m1-l1'], cases: { w1: 1 } });
    expect(caseAvailable(solved, world, RULES, second)).toBe(true);
  });

  it('erreicht heißt begonnen oder geschafft; nach Akt 1 ist alles erreicht', () => {
    expect(lessonReached(profile(), RULES, 'm1-l1')).toBe(false);
    expect(lessonReached(profile({ seen: ['briefing:m1-l1'] }), RULES, 'm1-l1')).toBe(true);
    expect(lessonReached(profile({ seen: ['briefing:m1-l1'] }), RULES, 'm1-l2')).toBe(false);
    expect(lessonReached(profile({ lessons: mastered(...COURSE.modules[0]!.lessons.map((l) => l.id)) }), RULES, 'm1-l6')).toBe(true);
  });

  it('caseAvailable, caseSolved, findCase; die Ankündigung kommt, sobald der Fall verfügbar ist', () => {
    const p = profile({ ...kescher, lessons: mastered('m1-l1', 'm1-l2'), seen: ['briefing:m1-l3'], cases: { 'seifenblasen-brunnen': 5 } });
    expect(world.cases.filter((c) => caseAvailable(p, world, RULES, c)).map((c) => c.id)).toEqual(['seifenblasen-brunnen']);
    expect(caseSolved(p, 'seifenblasen-brunnen')).toBe(true);
    expect(caseSolved(p, 'junas-liste')).toBe(false);
    expect(findCase(world, 'junas-liste')).toBe(liste);
    expect(dueScenes(p, world, RULES)).toContain('case-seifenblasen-open');
    expect(dueScenes(profile({ lessons: mastered('m1-l1', 'm1-l2') }), world, RULES)).not.toContain('case-seifenblasen-open');
  });
});

describe('Sichtbar und spielbar', () => {
  it('ohne Gadget ab begonnenem Startauftrag sichtbar, aber nicht spielbar; davor unsichtbar', () => {
    const begun = profile({ lessons: mastered('m1-l1', 'm1-l2'), seen: ['briefing:m1-l3'] });
    expect(caseVisible(begun, RULES, seifen)).toBe(true);
    expect(caseAvailable(begun, world, RULES, seifen)).toBe(false);
    expect(caseVisible(profile({ lessons: mastered('m1-l1', 'm1-l2') }), RULES, seifen)).toBe(false);
    expect(caseVisible(profile(), RULES, seifen)).toBe(false);
  });

  it('Junas Liste ist vor ihrer Szene l6-s50 unsichtbar', () => {
    const base = { lessons: mastered('m1-l1', 'm1-l2', 'm1-l3', 'm1-l4', 'm1-l5'), seen: ['briefing:m1-l6'] };
    expect(caseVisible(profile(base), RULES, liste)).toBe(false);
    const story = { v: 1, log: [{ id: 'l6-s50', t: 1 }], picks: {}, read: [] };
    expect(caseVisible(profile({ ...base, story }), RULES, liste)).toBe(true);
  });
});

describe('Erreichbarkeit', () => {
  it('die Spielhalle ist ab dem Startauftrag jedes Falls offen (vorher wurde mindestens ein Auftrag geschafft)', () => {
    const order = COURSE.modules.flatMap((m) => m.lessons.map((l) => l.id));
    for (const c of EXTRA_CASES) {
      const before = order.slice(0, order.indexOf(c.fromLesson));
      expect(before.length, c.id).toBeGreaterThan(0);
      expect(safeKeys(profile({ lessons: mastered(...before) }), COURSE).length, c.id).toBeGreaterThan(0);
    }
  });
});

describe('Fall lösen (solveCase)', () => {
  it('beim ersten Mal: gelöst mit Zeit, Outro im Log und zum Abspielen', () => {
    const { profile: p, outro } = solveCase(profile(), world, seifen.id, 7);
    expect(outro).toBe('case-seifenblasen-outro');
    expect(caseSolved(p, seifen.id)).toBe(true);
    expect(p.cases[seifen.id]).toBe(7);
    expect(p.story.log).toEqual([{ id: outro, t: 7 }]);
  });

  it('eine Wiederholung und unbekannte Fälle ändern nichts', () => {
    const once = solveCase(profile(), world, seifen.id, 7).profile;
    expect(solveCase(once, world, seifen.id, 9)).toEqual({ profile: once });
    const p = profile();
    expect(solveCase(p, world, 'gibt-es-nicht', 9)).toEqual({ profile: p });
  });

  it('ohne Outro-Szene wird der Fall trotzdem gelöst', () => {
    const r = solveCase(profile(), { scenes: [], cases: EXTRA_CASES }, seifen.id, 7);
    expect(r.outro).toBeUndefined();
    expect(caseSolved(r.profile, seifen.id)).toBe(true);
  });
});

describe('Trainingsrunde eines Falls', () => {
  it('planRounds liefert genau eine Trainingsrunde mit Überschrift und Fokus', () => {
    const rounds = planRounds(COURSE, 'm1-l3', { kind: 'case', keys: ['s', 'l', 'j'], frame: seifen.frame });
    expect(rounds).toEqual([{ kind: 'training', seconds: COURSE.practice.trainingSec, focus: ['s', 'l', 'j'], frame: 'Seifenblasen fangen' }]);
  });
});
