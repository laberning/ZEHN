// Besonderheiten des Trainings „Bennos Tippstunde“: Szenen nach Runden, Abzeichen-Szene, Fälle der Woche (content/story/training/).
// Allgemeine Regeln (Längen, Emoji, Sprecher, Fall-Verweise) prüfen story.test.ts und rewards.test.ts über alle Szenen.

import { describe, expect, it } from 'vitest';
import { caseVisible } from '../domain/cases.ts';
import { RULES } from '../app/rules.ts';
import { ALL_STORY, sceneLines } from '../test/content.ts';
import { mastered, masteredModule, profile, storyLog } from '../test/factories.ts';
import { BADGES } from './badges.ts';
import { COURSE } from './course.ts';
import { EXTRA_CASES, ACTS, SCENES } from './story/acts.ts';
import { TRAINING } from './story/training/index.ts';
import { KNOWN_IDS } from './knownIds.ts';

const sceneOf = (id: string) => TRAINING.scenes.concat(TRAINING.caseScenes).find((s) => s.id === id)!;
const speakers = (id: string) => sceneLines(sceneOf(id).lines, sceneOf(id).chat).map((l) => l.line.speaker);

describe('Training: Tippstunden-Szenen', () => {
  it('zehn Runden-Szenen und die Abzeichen-Szene, hinter den Akten und vor den Paket-Szenen im Spiel', () => {
    const rounds = TRAINING.scenes.filter((s) => s.trigger.on === 'training').map((s) => (s.trigger as { round: number }).round);
    expect(rounds).toEqual([1, 2, 3, 5, 8, 12, 16, 20, 30, 50]);
    expect(TRAINING.scenes).toHaveLength(11);
    const ids = SCENES.map((s) => s.id);
    const lastAkt = Math.max(...ACTS.flatMap((a) => [...a.chat, ...a.side, ...a.rewards, ...a.caseScenes]).map((s) => ids.indexOf(s.id)));
    for (const s of [...TRAINING.scenes, ...TRAINING.caseScenes]) expect(ids.indexOf(s.id), s.id).toBeGreaterThan(lastAkt);
    expect(ALL_STORY.scenes.some((s) => s.id === 'tr-round-50')).toBe(true);
  });

  it('Chats wie im Drehbuch: Juna zweimal, Krümel einmal (und beim Abzeichen), sonst ZEHN intern', () => {
    const chat = (id: string) => sceneOf(id).chat;
    expect(['tr-round-2', 'tr-round-16'].map(chat)).toEqual(['juna', 'juna']);
    expect(['tr-round-5', 'tr-badge-tippstunde'].map(chat)).toEqual(['kruemel', 'kruemel']);
    for (const id of ['tr-round-1', 'tr-round-3', 'tr-round-8', 'tr-round-12', 'tr-round-20', 'tr-round-30', 'tr-round-50']) expect(chat(id), id).toBe('intern');
  });

  it('das Abzeichen „Tippstunde“ ist geheim: sein Titel und seine Bedingung stehen nicht vorab da', () => {
    expect(BADGES.find((b) => b.id === 'tippstunde')?.secret).toBe(true);
  });

  it('Abzeichen-Szene ohne Geschenk; keine Szene verschenkt etwas, nennt Zahlen vom Kind oder verlangt etwas', () => {
    expect(sceneOf('tr-badge-tippstunde').trigger).toEqual({ on: 'badge', badgeId: 'tippstunde' });
    for (const s of [...TRAINING.scenes, ...TRAINING.caseScenes]) {
      expect(s.gives, s.id).toBeUndefined();
      expect(s.gift, s.id).toBeFalsy();
      for (const { line } of sceneLines(s.lines, s.chat)) {
        expect(line.item, s.id).toBeUndefined();
        expect(line.choices, s.id).toBeUndefined();
      }
    }
  });

  it('Sprecher und Wortlaut-Stichproben', () => {
    expect(speakers('tr-round-1')).toEqual(['benno', 'ada', 'kruemel']);
    expect(speakers('tr-round-50')).toEqual(['juna', 'benno', 'ada', 'kruemel']);
    expect(sceneOf('tr-round-30').lines[2]!.text).toBe('Zwei waren ein Anfang. Zehn sind ein Satz. Danke, {vorname}. Das hat er dir zu verdanken. Und sich.');
    expect(sceneOf('tr-round-8').lines[0]!.text).toContain('„Kipferl“');
  });
});

describe('Training: Fälle der Woche', () => {
  const ids = ['tr-pits-preisliste', 'tr-hupfs-dankesbrief', 'tr-elster-zieht-um', 'tr-nachbarstadt-fragt', 'tr-maschine-4-fragt'];

  it('fünf Fälle in fester Reihenfolge: der erste nach tr-round-2, jeder weitere nach dem vorigen; ohne Gadget, ohne Geschenk', () => {
    expect(TRAINING.cases.map((c) => c.id)).toEqual(ids);
    expect(TRAINING.cases.map((c) => c.picture)).toEqual(['kasse', 'briefkasten', 'feder', 'paket', 'maschine-4']);
    TRAINING.cases.forEach((c, i) => {
      expect(c.fromLesson, c.id).toBe('m7-l3');
      expect(c.needs, c.id).toBeUndefined();
      expect(c.gives, c.id).toBeUndefined();
      if (i === 0) expect([c.afterScene, c.afterCase]).toEqual(['tr-round-2', undefined]);
      else expect([c.afterScene, c.afterCase], c.id).toEqual([undefined, ids[i - 1]]);
    });
    for (const id of ids) expect(EXTRA_CASES.map((c) => c.id)).toContain(id);
  });

  it('je Fall drei Szenen mit den richtigen Auslösern und Chats; Ankündigung mit Bild und dem Weg ins HQ; Karte an der ersten Outro-Zeile', () => {
    for (const c of TRAINING.cases) {
      const name = c.id.slice(3);
      const open = sceneOf(`tr-case-${name}-open`);
      expect(open.trigger).toEqual({ on: 'caseOpen', caseId: c.id });
      expect(open.chat).toBe('kruemel');
      expect(open.lines[0]!.picture).toBe(c.picture);
      expect(open.lines[1]!.text).toBe('Neuer Fall der Woche – im Hauptquartier unter „Extra“.');
      expect(sceneOf(`tr-case-${name}-intro`)).toMatchObject({ chat: 'intern', trigger: { on: 'case', caseId: c.id, part: 'intro' } });
      const outro = sceneOf(`tr-case-${name}-outro`);
      expect(outro).toMatchObject({ chat: 'intern', trigger: { on: 'case', caseId: c.id, part: 'outro' } });
      expect(outro.lines[0]!.card).toEqual({ title: c.reveal.title, text: c.reveal.text });
      expect(c.frame.length, c.id).toBeGreaterThan(0);
    }
    expect(speakers('tr-case-maschine-4-fragt-intro')[0]).toBe('tippi');
    expect(sceneOf('tr-case-maschine-4-fragt-intro').lines[0]!.strike).toBeUndefined();
  });

  it('Sichtbarkeit: erst mit dem letzten Auftrag von Akt 7 und tr-round-2; Fall 2 erst nach Fall 1', () => {
    const rules = RULES;
    const before = Object.assign({}, ...COURSE.modules.filter((m) => m.id !== 'm7').map((m) => masteredModule(COURSE, m.id)));
    const base = { lessons: { ...before, ...mastered('m7-l1', 'm7-l2'), 'm7-l3': { exercises: 0, bestStars: 0, mastered: false, best: 0 } } };
    const [one, two] = TRAINING.cases as [(typeof TRAINING.cases)[number], (typeof TRAINING.cases)[number]];
    expect(caseVisible(profile({ ...base, story: storyLog([]) }), rules, one)).toBe(false);
    const after2 = profile({ ...base, story: storyLog(['tr-round-2']) });
    expect(caseVisible(after2, rules, one)).toBe(true);
    expect(caseVisible(after2, rules, two)).toBe(false);
    expect(caseVisible({ ...after2, cases: { [one.id]: 1 } }, rules, two)).toBe(true);
  });

  it('alle neuen Kennungen sind als bekannt eingetragen', () => {
    for (const s of [...TRAINING.scenes, ...TRAINING.caseScenes]) expect(KNOWN_IDS.scenes, s.id).toContain(s.id);
    for (const c of TRAINING.cases) expect(KNOWN_IDS.cases, c.id).toContain(c.id);
  });
});
