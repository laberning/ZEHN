// Besonderheiten von Akt 4 „Großschreibung“: Modul, Wortliste, Beschriftung, Einsatz mit Großbuchstaben, Einsatz-Story, Story-Objekte, Haupt-Szenen, Fallakte.
// Alles, was für jeden Akt gilt, steht in course.test.ts, story.test.ts und rewards.test.ts und liest das Prüfprofil `check` des Bündels.

import { describe, expect, it } from 'vitest';
import { findModule, keysUpTo, lastLessonOf } from '../domain/course.ts';
import { examStory, fallakte, moduleLabel } from '../domain/book.ts';
import { examTyping } from '../domain/examRun.ts';
import { SHIFT_LEFT, SHIFT_RIGHT, UMLAUTE_GROSS, learnKey } from '../domain/keyboard.ts';
import { createRng } from '../domain/rng.ts';
import { generateText, isPunctuation } from '../domain/textGenerator.ts';
import { objectOf, stageAt } from '../domain/storyObject.ts';
import { sceneLines, ALL_COURSE, ALL_STORY } from '../test/content.ts';
import { RULES } from '../app/rules.ts';
import { logScenes } from '../domain/scenes.ts';
import { nextSideScene } from '../domain/story.ts';
import { mastered, profile } from '../test/factories.ts';
import { BADGES } from './badges.ts';
import { piecesFound } from '../domain/items.ts';
import { ITEMS } from './items.ts';
import { COURSE } from './course.ts';
import { AKT4 } from './story/akt4/index.ts';
import { ACTS, STAGED_ACTS } from './story/acts.ts';
import { WORDS_GROSSSCHREIBUNG } from './words.de.ts';

const m1 = findModule(ALL_COURSE, 'm1');
const m4 = findModule(ALL_COURSE, 'm4');

describe('Akt 4: Modul', () => {
  it('ist im Spiel (ACTS, COURSE) nach Akt 3; Akt 5 folgt', () => {
    expect(STAGED_ACTS).not.toContain(AKT4);
    expect(ACTS[3]).toBe(AKT4);
    expect(COURSE.modules.map((m) => m.id).slice(0, 5)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
    expect(ALL_COURSE.modules.map((m) => m.id).slice(0, 5)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
  });

  it('vier Aufträge mit den Zeichen im Drehbuch (Großbuchstaben, ß, große Umlaute); Schwellen wie in Akt 1 bis 3', () => {
    expect(m4.lessons.map((l) => [l.id, l.title, l.newKeys.join('')])).toEqual([
      ['m4-l1', 'Kleinmachung', 'QWERTASDFGYXCVB'],
      ['m4-l2', 'Der Plan', 'ZUIOPHJKLNM'],
      ['m4-l3', 'Backspace-Straße', 'ß'],
      ['m4-l4', 'Die Turmtür', 'ÄÖÜ'],
    ]);
    expect(m4.mastery).toEqual(m1.mastery);
    expect(moduleLabel(ALL_STORY, 'm4')).toEqual({ act: 'Akt 4', place: 'Der Turm des Barons' });
  });

  it('jeder Auftrag hat eine eigene Lerneinheit: eine Umschalttaste, die andere, ß, die großen Umlaute', () => {
    expect(m4.lessons.map((l) => [...new Set(l.newKeys.map(learnKey))])).toEqual([[SHIFT_RIGHT], [SHIFT_LEFT], ['ß'], [UMLAUTE_GROSS]]);
  });

  it('Prüfprofil: je Auftrag ein getipptes Wort mit Großbuchstaben; Spoiler nur `otti`', () => {
    expect(AKT4.check.typed).toEqual([
      { lessonId: 'm4-l1', word: 'Turm' },
      { lessonId: 'm4-l2', word: 'Juna' },
      { lessonId: 'm4-l3', word: 'Straße' },
      { lessonId: 'm4-l4', word: 'Benno' },
    ]);
    expect(AKT4.check.revealFrom).toBeUndefined();
    expect(AKT4.check.spoilers).toEqual(['otti']);
    expect(AKT4.chat.length).toBeGreaterThan(0);
    // der Extra-Fall von Akt 4 kommt später
    expect([AKT4.cases, AKT4.caseScenes].every((l) => l.length === 0)).toBe(true);
  });

  it('Fallakte mit Titel, Kopfzeile und Einsatz-Zeilen', () => {
    const f = fallakte(ALL_STORY, 'm4')!;
    expect([f.title, f.header]).toEqual(['Fallakte Akt 4', 'Oben wohnt mein Neffe. Ich habe es zwanzig Jahre nicht gesagt.']);
    expect(f.firewall).toEqual({ passed: 'Sturm auf den Turm: alle Treppen genommen', backdoor: 'Sturm auf den Turm: Krümel war oben – Einsatz nachholen' });
  });
});

describe('Akt 4: Wortliste', () => {
  it('mindestens 60 verschiedene, kleingeschriebene Wörter, ohne Satzzeichen im Wort', () => {
    expect(WORDS_GROSSSCHREIBUNG.length).toBeGreaterThanOrEqual(60);
    expect(new Set(WORDS_GROSSSCHREIBUNG).size).toBe(WORDS_GROSSSCHREIBUNG.length);
    for (const w of WORDS_GROSSSCHREIBUNG) {
      expect(w, w).toBe(w.toLowerCase());
      expect([...w].some(isPunctuation), w).toBe(false);
    }
  });

  it('mindestens drei Wörter mit ß und je drei mit Wortanfang ä, ö, ü', () => {
    expect(WORDS_GROSSSCHREIBUNG.filter((w) => w.includes('ß')).length).toBeGreaterThanOrEqual(3);
    for (const a of 'äöü') expect(WORDS_GROSSSCHREIBUNG.filter((w) => w.startsWith(a)).length, a).toBeGreaterThanOrEqual(3);
  });

  it('Text je Auftrag zwischen Mindest- und Höchstlänge, nur gelernte Zeichen; Großbuchstaben nur gelernter Lerneinheiten', () => {
    const { minTextLength, maxTextLength } = COURSE.practice;
    for (const l of m4.lessons) {
      const allowed = keysUpTo(ALL_COURSE, l.id);
      for (let seed = 1; seed <= 20; seed++) {
        const text = generateText({ allowed, focus: l.newKeys, words: m4.words, length: 40, rng: createRng(seed) });
        expect(text.length, `${l.id} Länge`).toBeGreaterThanOrEqual(minTextLength);
        expect(text.length, `${l.id} Länge`).toBeLessThanOrEqual(maxTextLength);
        expect([...text.replaceAll(' ', '')].every((c) => allowed.includes(c)), `${l.id} nur gelernte Tasten`).toBe(true);
      }
    }
  });

  it('die getippten Wörter Turm, Juna, Straße, Benno sind je im Abschluss ihres Auftrags tippbar', () => {
    for (const [id, word] of [['m4-l1', 'Turm'], ['m4-l2', 'Juna'], ['m4-l3', 'Straße'], ['m4-l4', 'Benno']] as const) {
      expect([...word].every((c) => keysUpTo(ALL_COURSE, id).includes(c)), `${id} ${word}`).toBe(true);
    }
  });

  // Die großen Umlaute haben ein gemeinsames Siegel (eine Lerneinheit): Sie beginnen etwa jede dritte Einheit, nicht mehr jede zweite bis dritte
  // je Umlaut. Dazu kommen die Großbuchstaben der beiden Umschalttasten, die im Mischauftrag wie später überall etwa jede vierte Einheit beginnen.
  it('im Auftrag mit den großen Umlauten beginnt höchstens etwa jede dritte Übungseinheit mit einem großen Umlaut, insgesamt höchstens drei von fünf groß (300 Startwerte)', () => {
    const l4 = m4.lessons[3]!;
    const allowed = keysUpTo(ALL_COURSE, l4.id);
    let umlauts = 0;
    let caps = 0;
    let units = 0;
    for (let seed = 1; seed <= 300; seed++) {
      for (const u of generateText({ allowed, focus: l4.newKeys, words: m4.words, length: 40, rng: createRng(seed) }).split(' ')) {
        units++;
        if (/^[A-ZÄÖÜ]/.test(u)) caps++;
        if (/^[ÄÖÜ]/.test(u)) umlauts++;
      }
    }
    expect(umlauts / units).toBeLessThanOrEqual(0.36);
    expect(umlauts / units).toBeGreaterThan(0.15);
    expect(caps / units).toBeLessThanOrEqual(0.6);
  });
});

describe('Akt 4: Einsatz', () => {
  it('der Einsatz von m4 läuft strikt mit allen gelernten Tasten; m1 bis m3 bleiben klein', () => {
    expect(m4.exam).toEqual({ minAccuracy: 0.92, minApm: 50, durationSec: 60, keys: 'learned' });
    expect(examTyping(ALL_COURSE, 'm4', 1).mode).toBe('strict');
    expect(lastLessonOf(m4).id).toBe('m4-l4');
  });

  it('der Einsatz-Text liegt im Längenrahmen, enthält nur gelernte Tasten und im Lauf aller Seeds Großbuchstaben beider Hände', () => {
    const { minTextLength, maxTextLength } = COURSE.practice;
    const learned = keysUpTo(ALL_COURSE, 'm4-l4');
    const seen = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      const { text } = examTyping(ALL_COURSE, 'm4', seed);
      expect(text.length).toBeGreaterThanOrEqual(minTextLength);
      expect(text.length).toBeLessThanOrEqual(maxTextLength);
      expect([...text.replaceAll(' ', '')].every((c) => learned.includes(c))).toBe(true);
      for (const u of text.split(' ')) if (/^[A-ZÄÖÜ]/.test(u)) seen.add(learnKey(u[0]!));
    }
    expect(seen.has(SHIFT_RIGHT) && seen.has(SHIFT_LEFT)).toBe(true);
  });
});

describe('Akt 4: Einsatz-Story', () => {
  const e = examStory(ALL_STORY, 'm4');

  it('Sturm auf den Turm mit Überschriften, Segment-Name und Bilderbuch-Hintergrund Turm', () => {
    expect([e.title, e.won, e.lost, e.frame]).toEqual(['Einsatz: Sturm auf den Turm', 'Turm gestürmt!', 'Abgeblitzt', 'Turm-Codes']);
    expect(e.segments).toBe('Sturm: {n} von {gesamt} Treppen genommen');
    expect(e.ready).toBe('Groß angefangen, klein aufgehört, meine Lieben?');
    expect(e.taunts).toHaveLength(4);
    expect(e.intro[0]?.scene).toBe('turm');
    expect(e.success[0]?.scene).toBe('turm');
    expect(e.backdoorTaken[0]?.scene).toBe('turm');
  });

  it('Misserfolg nennt den Fortschritt; Hintertür-Angebot von Ada, Weg mit Krümel', () => {
    expect(e.fail[0]?.text).toContain('{prozent}');
    expect(e.backdoorOffer.map((l) => l.speaker)).toEqual(['ada', 'ada']);
    expect(e.backdoorTaken.map((l) => l.speaker)).toEqual(['erzaehler', 'kruemel', 'erzaehler', 'ada']);
  });

  it('das Intro hat zwei Antworten ohne Gadget (rauf, benno) und die mit den Shift-Handschuhen, die a4-l1-brief überreicht', () => {
    const choices = e.intro.flatMap((l) => l.choices ?? []);
    expect(choices.map((c) => [c.id, c.needs])).toEqual([['rauf', undefined], ['benno', undefined], ['handschuhe', 'shift-handschuhe']]);
    expect(e.success.flatMap((l) => l.choices ?? []).map((c) => c.id)).toEqual(['ada', 'du']);
  });
});

describe('Akt 4: Story-Objekte', () => {
  const objects = AKT4.objects;

  it('vier Objekte, eins je Auftrag in der Reihenfolge der Aufträge', () => {
    expect(objects.map((o) => [o.lessonId, o.kind])).toEqual([
      ['m4-l1', 'lines'],
      ['m4-l2', 'lines'],
      ['m4-l3', 'picture'],
      ['m4-l4', 'lines'],
    ]);
    expect(objects.map((o) => o.title)).toEqual(['Die Zeitungs-Schlagzeile', 'Bennos Plakat', 'Das Straßenschild', 'Das Namensschild der Turmtür']);
  });

  it.each(objects.map((o) => [o.lessonId, o] as const))('%s: Stufen 0, 25, 50, 75, 100 % aufsteigend, jede Stufe hat ihren Inhalt', (_id, o) => {
    expect(o.stages.map((s) => s.at)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    for (const s of o.stages) {
      if (o.kind === 'picture') expect(s.picture, `${o.title} ${s.at}`).toMatch(/^strassenschild-(0|25|50|75|100)$/);
      if (o.kind === 'lines') expect(s.lines?.length, `${o.title} ${s.at}`).toBeGreaterThan(0);
    }
    if (o.kind === 'picture') expect(o.stages.map((s) => s.picture!.split('-')[1])).toEqual(['0', '25', '50', '75', '100']);
  });

  it('Schlagzeile: erst alles klein, dann Zeile für Zeile groß, zuletzt die Titelzeile in Großbuchstaben', () => {
    const o = objectOf(objects, 'm4-l1')!;
    const lines = (p: number) => stageAt(o, p).lines!;
    expect(lines(0).every((l) => l === l.toLowerCase())).toBe(true);
    expect([0.25, 0.5, 0.75].map((p) => lines(p).length)).toEqual([1, 2, 3]);
    expect(lines(0.75)).toEqual(['Der Qwertzer Bote', 'Bad Qwertz ohne große Buchstaben', 'Bürgermeisterin: Stadtfest findet statt']);
    expect(lines(1)).toEqual(['BAD QWERTZ', ...lines(0.75)]);
  });

  it('Plakat: aus Fetzen wird GROSSE KLEINMACHUNG, ganz unten steht zuletzt „Ausgenommen: ich.“', () => {
    const o = objectOf(objects, 'm4-l2')!;
    expect(stageAt(o, 0).lines).toEqual(['g o e k ei m c u g']);
    expect(stageAt(o, 0.5).lines).toEqual(['GROSSE KLEINMACHUNG']);
    expect(stageAt(o, 0.75).lines!.at(-1)).toBe('Unterzeichnet: B. v. B.');
    expect(stageAt(o, 1).lines!.at(-1)).toBe('Ausgenommen: ich.');
    // „winzig“ laut Drehbuch: nur die letzte Zeile im Kleindruck, und erst bei 100 %
    expect([0, 0.25, 0.5, 0.75, 1].map((p) => stageAt(o, p).finePrint)).toEqual([undefined, undefined, undefined, undefined, 1]);
  });

  it('Namensschild: dunkel, dann BARON VON BACKSPACE, bei 50 % fehlen die O, zuletzt das leere Feld NAME', () => {
    const o = objectOf(objects, 'm4-l4')!;
    expect(stageAt(o, 0.25).lines).toEqual(['BARON VON BACKSPACE']);
    expect(stageAt(o, 0.5).lines).toEqual(['BAR N V N BACKSPACE']);
    expect(stageAt(o, 0.75).lines).toContain('ZUTRITT NUR MIT NAMEN');
    expect(stageAt(o, 1).lines!.at(-1)).toMatch(/^NAME:/);
  });
});

describe('Akt 4: Haupt-Szenen', () => {
  const scene = (id: string) => AKT4.chat.find((c) => c.id === id)!;
  const lessons = ['m4-l1', 'm4-l2', 'm4-l3', 'm4-l4'];

  it('22 Szenen in der Reihenfolge des Drehbuchs, a4-start vor dem ersten Briefing, alle in ZEHN intern', () => {
    expect(AKT4.chat.map((c) => c.id)).toEqual([
      'a4-start',
      ...[1, 2, 3, 4].flatMap((n) => ['brief', 's25', 's50', 's75', 'done'].map((p) => `a4-l${n}-${p}`)),
      'a4-exam-after',
    ]);
    expect(AKT4.chat.every((c) => c.chat === 'intern')).toBe(true);
    expect(AKT4.chat[0]!.trigger).toEqual(AKT4.chat[1]!.trigger);
    expect(scene('a4-exam-after').trigger).toEqual({ on: 'exam', moduleId: 'm4' });
  });

  it('Mini-Tastatur der Briefings zeigt die Umschalttasten, das ß und die großen Umlaute', () => {
    const keys = (id: string) => scene(id).lines.flatMap((l) => l.keys ?? []);
    expect(keys('a4-l1-brief')).toEqual(['ShiftRight']);
    expect(keys('a4-l2-brief')).toEqual(['ShiftLeft']);
    expect(keys('a4-l3-brief')).toEqual(['Minus']);
    expect(keys('a4-l4-brief')).toEqual(['ShiftLeft', 'Quote', 'Semicolon', 'BracketLeft']);
  });

  it('die vier getippten Wörter stehen allein an ihrer Zeile im Abschluss, mit Großbuchstaben, die Wörter sind auch die Antwort-Kurzform', () => {
    for (const [lesson, word] of [['m4-l1', 'Turm'], ['m4-l2', 'Juna'], ['m4-l3', 'Straße'], ['m4-l4', 'Benno']] as const) {
      const done = scene(`a4-${lesson.slice(3)}-done`);
      const typed = done.lines.flatMap((l) => l.choices ?? []).filter((c) => c.typed);
      expect(typed.map((c) => [c.typed, c.text, c.label]), lesson).toEqual([[word, word, word]]);
      expect(done.lines.filter((l) => l.choices?.some((c) => c.typed)), lesson).toHaveLength(1);
      expect(/^[A-ZÄÖÜ]/.test(word)).toBe(true);
    }
  });

  it('der Baron schreibt genau einmal als „???“ (a4-l2-s75) mit zwei Zeilen, sonst nie', () => {
    const baron = AKT4.chat.flatMap((c) => sceneLines(c.lines, c.chat).map((x) => [c.id, x.line.speaker] as const)).filter(([, sp]) => sp === 'unbekannt' || sp === 'baron');
    expect(baron).toEqual([['a4-l2-s75', 'unbekannt'], ['a4-l2-s75', 'unbekannt']]);
    expect(scene('a4-l2-s75').lines.filter((l) => l.speaker === 'system').map((l) => l.text)).toEqual(['Unbekannt ist dem Chat beigetreten.', 'Unbekannt hat den Chat verlassen.']);
  });

  it('die Tat des Kindes: die Deutungs-Wahl von Auftrag 2 hat drei Antworten, keine wird bestraft, jede führt zurück zum Plakat', () => {
    const choices = scene('a4-l2-s50').lines.flatMap((l) => l.choices ?? []);
    expect(choices.map((c) => c.id)).toEqual(['aufkleber', 'gutaus', 'spaeter']);
    for (const c of choices) expect(c.reply!.map((r) => r.speaker), c.id).toEqual(['kruemel']);
    expect(choices.every((c) => !c.needs && !c.typed)).toBe(true);
  });

  it('Echos: a3-exam-after in a4-start, a3-l5-s75 in a4-l1-s50, a3-l4-s75 in a4-l3-s75', () => {
    const echoes = (id: string) => scene(id).lines.filter((l) => l.ifPicked).map((l) => `${l.ifPicked!.scene}/${l.ifPicked!.choice}`);
    expect(echoes('a4-start')).toEqual(['a3-exam-after/wer', 'a3-exam-after/nicht', 'a3-exam-after/megafon', 'a3-exam-after/null']);
    expect(echoes('a4-l1-s50')).toEqual(['a3-l5-s75/keks', 'a3-l5-s75/kruemel', 'a3-l5-s75/ada']);
    expect(echoes('a4-l3-s75')).toEqual(['a3-l4-s75/gemein', 'a3-l4-s75/dieb']);
  });

  it('Gadget-Antworten stehen an ihren Szenen und neben Antworten ohne Gadget', () => {
    const needs = AKT4.chat.flatMap((c) => c.lines.flatMap((l) => l.choices ?? []).filter((x) => x.needs).map((x) => [c.id, x.id, x.needs]));
    expect(needs).toEqual([
      ['a4-l1-s75', 'fernglas', 'fernglas'],
      ['a4-l4-brief', 'megafon', 'tunnel-megafon'],
      ['a4-exam-after', 'lupe', 'lupe'],
    ]);
    for (const c of AKT4.chat) for (const l of c.lines) if (l.choices?.some((x) => x.needs)) expect(l.choices.some((x) => !x.needs), c.id).toBe(true);
  });

  it('die Shift-Handschuhe überreicht das Briefing von Auftrag 1 (Zeile mit dem Ding), die Antwort darauf steht im Einsatz', () => {
    const brief = scene('a4-l1-brief');
    expect(brief.gives).toEqual(['shift-handschuhe']);
    expect(brief.lines.some((l) => l.item === 'shift-handschuhe')).toBe(true);
    const gadget = ITEMS.find((i) => i.id === 'shift-handschuhe')!;
    expect([gadget.kind, gadget.source]).toEqual(['gadget', { scene: 'a4-l1-brief' }]);
  });

  it('Karten: „An der Treppe“ nach Auftrag 3 und das Kalenderblatt, beide ohne Goldrand; die andere Hälfte des Fotos als Bild', () => {
    const cards = AKT4.chat.flatMap((c) => c.lines.filter((l) => l.card).map((l) => [c.id, l.card!.title, l.card!.look]));
    expect(cards).toEqual([['a4-l3-done', 'An der Treppe', undefined], ['a4-exam-after', 'Kalenderblatt', undefined]]);
    expect(scene('a4-exam-after').lines.some((l) => l.picture === 'foto-benno')).toBe(true);
  });

  it('Beweisstücke: Zeitung, Plakat, Foto und Kalenderblatt kommen in ihrer Szene ins Beweisfach', () => {
    const fach = ITEMS.find((i) => i.id === 'beweisfach')!;
    const mine = fach.pieces!.filter((p) => p.scene.startsWith('a4-')).map((p) => [p.id, p.scene]);
    expect(mine).toEqual([
      ['zeitung', 'a4-l1-s25'],
      ['plakat', 'a4-l2-done'],
      ['foto-benno', 'a4-exam-after'],
      ['kalenderblatt', 'a4-exam-after'],
    ]);
    const log = { story: { log: [{ id: 'a4-l1-s25' }, { id: 'a4-exam-after' }] } } as Parameters<typeof piecesFound>[0];
    expect(piecesFound(log, fach).filter((p) => p.scene.startsWith('a4-')).map((p) => p.id)).toEqual(['zeitung', 'foto-benno', 'kalenderblatt']);
  });

  it('jede Szene gehört zu einem Auftrag des Moduls oder zum Einsatz', () => {
    for (const c of AKT4.chat) {
      const t = c.trigger;
      if ('lessonId' in t) expect(lessons, c.id).toContain(t.lessonId);
    }
  });
});

describe('Akt 4: Fallakte', () => {
  const f = AKT4.fallakte;

  it('gelöst: Neffe, Prüfung, Gerät, Plan, Passwort; Treffer-Zeilen nur mit Antwort; Foto und Plakat als Bild', () => {
    expect(f.solved.filter((e) => !e.ifPicked)).toHaveLength(5);
    expect(f.solved.map((e) => e.picture).filter(Boolean)).toEqual(['foto-benno', 'plakat']);
    expect(f.solved.filter((e) => e.ifPicked).map((e) => `${e.ifPicked!.scene}/${e.ifPicked!.choice}`)).toEqual(['a4-l4-s75/echtername', 'a4-l3-s50/kipferl']);
  });

  it('offen: Lieferung an O. mit Karte, das O, das Gerät, Krümels Aufkleber (ohne Deutung) und zwei Zeilen nur bei der Frage des Kindes', () => {
    expect(f.open).toHaveLength(6);
    expect(f.open[0]!.card).toBe('Freitag – Lieferung an O.');
    expect(f.open[3]!.text).toContain('TIPPNIX');
    expect(f.open.filter((e) => e.ifPicked).map((e) => `${e.ifPicked!.scene}/${e.ifPicked!.choice}`)).toEqual(['a4-l1-s75/seitwann', 'a4-l2-s50/aufkleber']);
  });

  it('Verdächtige: Baron gesucht (Treffer: Gerät), Ortrud verdächtig, Hilde Hupf entlastet; Krümels Schlusssatz', () => {
    expect(f.suspects.map((s) => [s.name, s.status])).toEqual([['Baron von Backspace', 'gesucht'], ['Ortrud', 'verdaechtig'], ['Hilde Hupf', 'entlastet']]);
    expect(f.suspects[0]!.hits.map((h) => h.ifPicked)).toEqual([{ scene: 'a4-l2-s75', choice: 'geraet' }]);
    expect(f.closing).toBe('Oben wohnt Benno. Unten backt Ada. Dazwischen 112 Stufen und ich. Mit Aufkleber. Piep.');
  });
});

describe('Akt 4: Nebenszenen', () => {
  const sides = AKT4.side;
  const trig = (s: (typeof sides)[number]) => s.trigger as { strand: string; order: number; fromLesson: string; untilLesson?: string; afterScene?: string };
  const strand = (name: string) => sides.filter((s) => trig(s).strand === name).sort((a, b) => trig(a).order - trig(b).order);
  const ids = new Set(ALL_STORY.scenes.map((s) => s.id));

  it('sechs Stränge zu je drei Szenen mit `a4-side-`-Kennung, alle ab einem Auftrag von Akt 4, ohne Varianten', () => {
    expect(new Set(sides.map((s) => trig(s).strand))).toEqual(new Set(['grosse-tage', 'klein', 'fest', 'post', 'rezept', 'kringel']));
    expect(sides).toHaveLength(18);
    for (const s of sides) {
      expect(s.id.startsWith('a4-side-'), s.id).toBe(true);
      expect(m4.lessons.map((l) => l.id), s.id).toContain(trig(s).fromLesson);
      expect(s.trigger, s.id).not.toHaveProperty('untilCase');
      expect(s.trigger, s.id).not.toHaveProperty('afterCase');
    }
    for (const name of ['grosse-tage', 'klein', 'fest', 'post', 'rezept', 'kringel']) expect(strand(name).map((s) => trig(s).order), name).toEqual([1, 2, 3]);
  });

  it('Chats: Krümels Tage bei Krümel, Junas Kanal und die HUPF-UPDATES im Flüstern, der Rest in ZEHN intern', () => {
    const chats = (name: string) => new Set(strand(name).map((s) => s.chat));
    expect(chats('grosse-tage')).toEqual(new Set(['kruemel']));
    expect(chats('klein')).toEqual(new Set(['fluestern']));
    expect(chats('fest')).toEqual(new Set(['fluestern']));
    for (const name of ['post', 'rezept', 'kringel']) expect(chats(name)).toEqual(new Set(['intern']));
  });

  it('Reihenfolge: Start-Aufträge und `afterScene` wie in der Tabelle, jede Bedingung nennt eine vorhandene Szene', () => {
    const t = (id: string) => trig(sides.find((s) => s.id === id)!);
    expect(t('a4-side-grosse-tage-1')).toMatchObject({ fromLesson: 'm4-l1', afterScene: 'a4-l1-s25' });
    expect(t('a4-side-post-1')).toMatchObject({ fromLesson: 'm4-l2', afterScene: 'a4-l2-s75' });
    expect(t('a4-side-post-3')).toMatchObject({ fromLesson: 'm4-l2', afterScene: 'a4-l3-s75' });
    expect(t('a4-side-rezept-1')).toMatchObject({ fromLesson: 'm4-l3', afterScene: 'a4-l3-s75' });
    expect(trig(strand('fest')[0]!).fromLesson).toBe('m4-l3');
    expect(trig(strand('kringel')[0]!).fromLesson).toBe('m4-l1');
    expect(trig(strand('klein')[0]!)).toMatchObject({ fromLesson: 'm4-l1', untilLesson: 'm4-l2' });
    for (const s of sides) if (trig(s).afterScene) expect(ids.has(trig(s).afterScene!), s.id).toBe(true);
  });

  /** Alle Nebenszenen, die in Durchgängen eines Auftrags nacheinander kommen (Log wächst mit; `done`: Haupt-Szenen schon gelesen) */
  const run = (lessonId: string, lessons: string[], done: string[] = []): string[] => {
    const out: string[] = [];
    for (let i = 0; i < 18; i++) {
      const next = nextSideScene(logScenes(profile({ lessons: mastered(...lessons) }), [...done, ...out], 1), { scenes: sides }, RULES, lessonId);
      if (!next) break;
      out.push(next);
    }
    return out;
  };
  const MAIN = ['a4-l1-s25', 'a4-l2-s75', 'a4-l3-s75'];

  it('das Flüstern bleibt bis Auftrag 2 klein: `klein` kommt in Auftrag 1 und 2, `fest` nicht', () => {
    for (const lessonId of ['m4-l1', 'm4-l2']) {
      const seen = run(lessonId, lessonId === 'm4-l2' ? ['m4-l1'] : [], MAIN);
      expect(seen.filter((id) => id.startsWith('a4-side-klein')), lessonId).toHaveLength(3);
      expect(seen.filter((id) => id.startsWith('a4-side-fest')), lessonId).toEqual([]);
    }
  });

  it('`klein` endet mit Auftrag 2, `fest` beginnt mit Auftrag 3', () => {
    const seen = run('m4-l3', ['m4-l1', 'm4-l2'], MAIN);
    expect(seen.filter((id) => id.startsWith('a4-side-klein'))).toEqual([]);
    expect(seen.filter((id) => id.startsWith('a4-side-fest'))).toHaveLength(3);
  });

  it('`post-3` und `rezept-1` kommen erst nach `a4-l3-s75`', () => {
    const before = run('m4-l3', ['m4-l1', 'm4-l2'], ['a4-l1-s25', 'a4-l2-s75']);
    expect(before).not.toContain('a4-side-post-3');
    expect(before).not.toContain('a4-side-rezept-1');
    const after = run('m4-l3', ['m4-l1', 'm4-l2'], MAIN);
    expect(after).toEqual(expect.arrayContaining(['a4-side-post-3', 'a4-side-rezept-1']));
  });

  it('keine Nebenszene verschenkt etwas; Goldrand-Karten der Strang `post` haben den Goldrand', () => {
    expect(sides.filter((s) => s.gives)).toEqual([]);
    const cards = strand('post').flatMap((s) => s.lines.filter((l) => l.card).map((l) => l.card!.look));
    expect(cards).toEqual(['goldcard', 'goldcard', 'goldcard']);
  });
});

describe('Akt 4: Belohnungen', () => {
  const rewards = AKT4.rewards;
  const scene = (id: string) => rewards.find((s) => s.id === id)!;

  it('fünf Szenen mit Kennung, Auslöser, Chat und Ding wie im Drehbuch', () => {
    expect(rewards.map((s) => [s.id, s.chat, s.trigger, s.gives])).toEqual([
      ['a4-gift-krawatte', 'intern', { on: 'briefing', lessonId: 'm4-l1' }, ['necktie']],
      ['a4-gift-fliege', 'intern', { on: 'mastered', lessonId: 'm4-l2' }, ['bowtie']],
      ['a4-gift-melone', 'intern', { on: 'mastered', lessonId: 'm4-l3' }, ['bowler']],
      ['a4-gift-nadelstreifen', 'kruemel', { on: 'exam', moduleId: 'm4' }, ['striped']],
      ['a4-badge-grossschreibung', 'kruemel', { on: 'badge', badgeId: 'grossschreibung' }, ['agent']],
    ]);
    for (const s of rewards) expect(s.gift, s.id).toBe(true);
  });

  it('Sprecher: Ada schenkt Krawatte und Melone, Juna die Fliege (mit Zwinkern), Krümel die Nadelstreifen', () => {
    expect(scene('a4-gift-krawatte').lines[0]).toMatchObject({ speaker: 'ada', text: 'Große Buchstaben tragen Krawatte. Die hier ist von meiner Prüfung. Meiner eigenen. Zieh sie an.' });
    expect(scene('a4-gift-fliege').lines[0]).toMatchObject({ speaker: 'juna', text: 'Vom Kiosk, fürs Stadtfest: eine FLIEGE. Unverkäuflich, sagt Mama. Also deine. Steht dir. 😉' });
    expect(scene('a4-gift-melone').lines[0]).toMatchObject({ speaker: 'ada', text: 'Gegen einen Zylinder hilft nur eine Melone. Die war mal von meiner Lehrerin.' });
    expect(scene('a4-gift-nadelstreifen').lines[0]).toMatchObject({ speaker: 'kruemel', text: 'Aus dem Turm, Garderobe unten: Nadelstreifen. Für Agenten mit Ausdauer. Und Stil.' });
  });

  it('Junas Geschenk kommt nach dem Abschluss von Auftrag 2, Adas Melone nach `a4-l3-done`, Krümels Nadelstreifen nach `a4-exam-after`', () => {
    const order = ALL_STORY.scenes.map((s) => s.id);
    expect(order.indexOf('a4-gift-fliege')).toBeGreaterThan(order.indexOf('a4-l2-done'));
    expect(order.indexOf('a4-gift-melone')).toBeGreaterThan(order.indexOf('a4-l3-done'));
    expect(order.indexOf('a4-gift-nadelstreifen')).toBeGreaterThan(order.indexOf('a4-exam-after'));
  });

  it('Abzeichen „Großschreibung gesichert“ (Fortschritt) mit Paket von Kringel und Zettel für den Agentenlook', () => {
    const b = BADGES.find((x) => x.id === 'grossschreibung')!;
    expect([b.title, b.category]).toEqual(['Großschreibung gesichert', 'fortschritt']);
    const texts = scene('a4-badge-grossschreibung').lines.map((l) => l.text);
    expect(texts[0]).toBe('Großschreibung gesichert! Zwei Umschalttasten, ein ß, drei große Umlaute. Nichts bleibt klein. ⚡');
    expect(texts[1]).toBe('Postbote Kringel: „Paket für {vorname}. Von der Backstube. Großes Paket. Großer Tag, sagt sie.“');
    expect(texts[2]).toBe('Im Paket: Agentenlook. Auf dem Zettel steht: „Für Agenten, die groß schreiben.“');
  });
});
