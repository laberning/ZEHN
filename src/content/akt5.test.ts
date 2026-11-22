// Besonderheiten von Akt 5 „Satzzeichen“: Modul, Wortliste, Beschriftung, Einsatz-Story, Haupt-Szenen, Story-Objekte, Fallakte, Prüfprofil.
// Alles, was für jeden Akt gilt, steht in course.test.ts, story.test.ts und rewards.test.ts und liest das Prüfprofil `check` des Bündels.

import { describe, expect, it } from 'vitest';
import { findModule, keysUpTo } from '../domain/course.ts';
import { examStory, fallakte, moduleLabel } from '../domain/book.ts';
import { learnKey, isTypeable } from '../domain/keyboard.ts';
import { createRng } from '../domain/rng.ts';
import { generateText, isPunctuation } from '../domain/textGenerator.ts';
import { objectOf, stageAt } from '../domain/storyObject.ts';
import { ALL_COURSE, ALL_STORY, sceneLines as walkLines } from '../test/content.ts';
import type { StoryScene } from '../domain/scenes.ts';
import { RULES } from '../app/rules.ts';
import { logScenes } from '../domain/scenes.ts';
import { nextSideScene } from '../domain/story.ts';
import { mastered, profile } from '../test/factories.ts';
import { BADGES } from './badges.ts';
import { ITEMS } from './items.ts';
import { COURSE } from './course.ts';
import { ACTS, STAGED_ACTS } from './story/acts.ts';
import { AKT5 } from './story/akt5/index.ts';
import { WORDS_SATZZEICHEN } from './words.de.ts';

const m1 = findModule(ALL_COURSE, 'm1');
const m5 = findModule(ALL_COURSE, 'm5');

describe('Akt 5: Gerüst', () => {
  it('ist im Spiel (ACTS, COURSE) nach Akt 4; Haupt-Szenen, Nebenszenen und Belohnungen stehen, der Extra-Fall folgt später', () => {
    expect(STAGED_ACTS).not.toContain(AKT5);
    expect(ACTS[4]).toBe(AKT5);
    expect(COURSE.modules.map((m) => m.id).slice(0, 5)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
    expect(ALL_COURSE.modules.map((m) => m.id).slice(0, 5)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
    expect(AKT5.chat).toHaveLength(17);
    expect(AKT5.side).toHaveLength(15);
    expect(AKT5.rewards).toHaveLength(5);
    expect([AKT5.cases, AKT5.caseScenes].every((l) => l.length === 0)).toBe(true);
  });

  it('drei Aufträge mit den Zeichen im Drehbuch; Schwellen wie in Akt 1; Beschriftung „Akt 5 · Das Stadtfest“', () => {
    expect(m5.title).toBe('Satzzeichen');
    expect(m5.lessons.map((l) => [l.id, l.title, l.newKeys.join('')])).toEqual([
      ['m5-l1', 'Festplakat', '?!'],
      ['m5-l2', 'Notmodus', ':;'],
      ['m5-l3', 'Die Durchsage', `"'`],
    ]);
    expect(m5.mastery).toEqual(m1.mastery);
    expect(moduleLabel(ALL_STORY, 'm5')).toEqual({ act: 'Akt 5', place: 'Das Stadtfest' });
  });

  it('jedes der sechs Zeichen ist seine eigene Lerneinheit (eigenes Siegel) und tippbar', () => {
    for (const k of m5.lessons.flatMap((l) => l.newKeys)) {
      expect(learnKey(k), k).toBe(k);
      expect(isTypeable(k), k).toBe(true);
    }
  });

  it('Prüfprofil: Spoiler nur `otti`, kein revealFrom; je Auftrag ein getippter Satz', () => {
    expect(AKT5.check.spoilers).toEqual(['otti']);
    expect(AKT5.check.revealFrom).toBeUndefined();
    expect(AKT5.check.typed).toEqual([
      { lessonId: 'm5-l1', word: 'essen, Opa!' },
      { lessonId: 'm5-l2', word: 'Krümel: wach auf' },
      { lessonId: 'm5-l3', word: 'Juna, komm zurück!' },
    ]);
  });

  it('die zerkratzten Fallakten laufen von `a5-l2-brief` bis `a5-l2-done` und stehen im Story-Bündel', () => {
    expect(AKT5.fallaktenDamage).toEqual({ from: 'a5-l2-brief', until: 'a5-l2-done' });
    expect(ALL_STORY.fallaktenDamage).toEqual([AKT5.fallaktenDamage]);
    // im Spiel (ACTS) trägt nur Akt 5 den Eintrag
    expect(ACTS.filter((a) => a.fallaktenDamage).map((a) => a.module.id)).toEqual(['m5']);
  });

  it('Fallakte: Titel, Kopfzeile und Einsatz-Zeilen', () => {
    const f = fallakte(ALL_STORY, 'm5')!;
    expect([f.title, f.header]).toEqual(['Fallakte Akt 5', 'Ich habe Juna die Schuld gegeben. Es war ein Signal. Und ich.']);
    expect(f.firewall).toEqual({ passed: 'Die Durchsage: alle Zeichen gesetzt, Fest gerettet', backdoor: 'Die Durchsage: Hupf hat selbst gelesen – Einsatz nachholen' });
  });
});

describe('Akt 5: Sätze', () => {
  // die getippten Sätze der Haupt-Szenen: je im Abschluss ihres Auftrags tippbar, vorher nicht (sie brauchen das Zeichen des Auftrags)
  it.each([
    ['m5-l1', 'essen, Opa!'],
    ['m5-l2', 'Krümel: wach auf'],
    ['m5-l3', 'Juna, komm zurück!'],
  ])('%s: „%s“ ist im Abschluss tippbar, höchstens 18 Zeichen', (id, sentence) => {
    const learned = (lesson: string) => [...keysUpTo(ALL_COURSE, lesson), ' '];
    expect([...sentence].every((c) => learned(id).includes(c)), sentence).toBe(true);
    expect(sentence.length).toBeLessThanOrEqual(18);
  });

  it('die ersten beiden Sätze brauchen ihr Zeichen aus dem Auftrag (`!` aus m5-l1, `:` aus m5-l2)', () => {
    expect([...'essen, Opa!'].every((c) => [...keysUpTo(ALL_COURSE, 'm4-l4'), ' '].includes(c))).toBe(false);
    expect([...'Krümel: wach auf'].every((c) => [...keysUpTo(ALL_COURSE, 'm5-l1'), ' '].includes(c))).toBe(false);
  });
});

describe('Akt 5: Wortliste', () => {
  it('kleingeschrieben, ohne doppelte Wörter, ohne Satzzeichen im Wort (der Apostroph ist ein Wort-Zeichen)', () => {
    expect(new Set(WORDS_SATZZEICHEN).size).toBe(WORDS_SATZZEICHEN.length);
    for (const w of WORDS_SATZZEICHEN) {
      expect(w, w).toBe(w.toLowerCase());
      expect([...w].some(isPunctuation), w).toBe(false);
    }
  });

  it('mindestens drei Wörter mit Apostroph, darunter geht’s, gibt’s, hab’s', () => {
    const apostroph = WORDS_SATZZEICHEN.filter((w) => w.includes("'"));
    expect(apostroph.length).toBeGreaterThanOrEqual(3);
    for (const w of ["geht's", "gibt's", "hab's"]) expect(apostroph).toContain(w);
  });

  it('Text je Auftrag zwischen Mindest- und Höchstlänge, nur gelernte Zeichen, und die neuen Zeichen des Auftrags kommen in jeder Runde vor', () => {
    const { minTextLength, maxTextLength } = COURSE.practice;
    for (const l of m5.lessons) {
      const allowed = keysUpTo(ALL_COURSE, l.id);
      for (let seed = 1; seed <= 20; seed++) {
        const text = generateText({ allowed, focus: l.newKeys, words: m5.words, length: 40, rng: createRng(seed) });
        expect(text.length, `${l.id} Länge`).toBeGreaterThanOrEqual(minTextLength);
        expect(text.length, `${l.id} Länge`).toBeLessThanOrEqual(maxTextLength);
        expect([...text.replaceAll(' ', '')].every((c) => allowed.includes(c)), `${l.id} nur gelernte Tasten`).toBe(true);
        for (const k of l.newKeys) expect(text.includes(k), `${l.id} ${k} (Seed ${seed})`).toBe(true);
      }
    }
  });
});

describe('Akt 5: Einsatz-Story', () => {
  const e = examStory(ALL_STORY, 'm5');

  it('Die Durchsage mit Überschriften, Segment-Name, vier Sprüchen und Bilderbuch-Hintergrund Marktplatz', () => {
    expect([e.title, e.won, e.lost, e.frame]).toEqual(['Einsatz: Die Durchsage', 'Durchsage gerettet!', 'Übertönt', 'Durchsage-Sätze']);
    expect(e.segments).toBe('Durchsage: {n} von {gesamt} Sätzen gesendet');
    expect(e.ready).toBe('Achtung Achtung Hier spricht niemand Schätzchen Fertig');
    expect(e.taunts).toHaveLength(4);
    expect(e.voice).toBe('speaker');
    expect(e.intro[0]?.scene).toBe('marktplatz');
    expect(e.success[0]?.scene).toBe('marktplatz');
    expect(e.backdoorTaken[0]?.scene).toBe('marktplatz');
  });

  it('Misserfolg nennt den Fortschritt; Hintertür-Angebot von Ada, Weg mit Erzähler und Ada', () => {
    expect(e.fail[0]?.text).toContain('{prozent}');
    expect(e.backdoorOffer.map((l) => l.speaker)).toEqual(['ada', 'ada']);
    expect(e.backdoorTaken.map((l) => l.speaker)).toEqual(['erzaehler', 'erzaehler', 'ada']);
  });

  it('das Intro hat zwei Antworten ohne Gadget (senden, fuerjuna) und die mit dem Notfunkgerät, das a5-l2-brief überreicht', () => {
    const choices = e.intro.flatMap((l) => l.choices ?? []);
    expect(choices.map((c) => [c.id, c.needs])).toEqual([['senden', undefined], ['fuerjuna', undefined], ['notfunk', 'notfunk']]);
    expect(e.success.flatMap((l) => l.choices ?? []).map((c) => c.id)).toEqual(['alle', 'zeichen']);
  });
});

describe('Akt 5: Story-Objekte', () => {
  const objects = AKT5.objects;

  it('drei Objekte der Art lines, eins je Auftrag in der Reihenfolge der Aufträge', () => {
    expect(objects.map((o) => [o.lessonId, o.kind, o.title])).toEqual([
      ['m5-l1', 'lines', 'Das Festplakat'],
      ['m5-l2', 'lines', 'Die Fallakten des HQ'],
      ['m5-l3', 'lines', 'Das Durchsage-Skript'],
    ]);
  });

  it.each(objects.map((o) => [o.lessonId, o] as const))('%s: Stufen 0, 25, 50, 75, 100 % aufsteigend, jede Stufe hat Zeilen', (_id, o) => {
    expect(o.stages.map((s) => s.at)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    for (const s of o.stages) expect(s.lines?.length, `${o.title} ${s.at}`).toBeGreaterThan(0);
  });

  it('Festplakat: erst ohne ein Zeichen, dann holt jede Stufe eine Zeile zurück; bei 100 % klein darunter „Komm wir essen Opa“', () => {
    const o = objectOf(objects, 'm5-l1')!;
    expect(stageAt(o, 0).lines).toEqual(['STADTFEST', 'KOMMT ALLE', 'WANN', 'SAMSTAG AUF DEM MARKT']);
    expect([0.25, 0.5, 0.75].map((p) => stageAt(o, p).lines!.length)).toEqual([1, 2, 3]);
    expect(stageAt(o, 0.75).lines).toEqual(['STADTFEST!', 'KOMMT ALLE!', 'WANN?']);
    expect(stageAt(o, 1).lines).toEqual(['STADTFEST!', 'KOMMT ALLE!', 'WANN?', 'SAMSTAG! AUF DEM MARKT!', 'Komm wir essen Opa']);
    expect([0, 0.25, 0.5, 0.75, 1].map((p) => stageAt(o, p).finePrint)).toEqual([undefined, undefined, undefined, undefined, 1]);
  });

  it('Fallakten: bei 0 % vier Zeilen Kratzer (Textzeichen), dann eine Akte nach der anderen lesbar, zuletzt der Stempel', () => {
    const o = objectOf(objects, 'm5-l2')!;
    expect(stageAt(o, 0).lines).toHaveLength(4);
    expect(stageAt(o, 0).lines!.every((l) => /^\/+$/.test(l))).toBe(true);
    expect(stageAt(o, 0.25).lines).toEqual(['Fallakte Akt 1: lesbar']);
    expect(stageAt(o, 0.75).lines).toEqual(['Fallakte Akt 1: lesbar', 'Fallakte Akt 2: lesbar', 'Fallakte Akt 3: lesbar']);
    expect(stageAt(o, 1).lines!.slice(-2)).toEqual(['Fallakte Akt 4: lesbar', 'WIEDERHERGESTELLT']);
  });

  it('Durchsage-Skript: erst ohne Anführungszeichen, Apostroph und Satzzeichen, dann kommen sie Zeile für Zeile', () => {
    const o = objectOf(objects, 'm5-l3')!;
    expect(stageAt(o, 0).lines!.join(' ')).not.toMatch(/[„“"',.!?]/);
    expect(stageAt(o, 0.25).lines).toEqual(['„Liebe Qwertzer“, sagt Hupf.']);
    expect(stageAt(o, 0.5).lines!.at(-1)).toBe("„Wie geht's, Bad Qwertz?“");
    expect(stageAt(o, 1).lines).toHaveLength(4);
    expect(stageAt(o, 1).lines!.at(-1)).toBe('„Danke“, sagt sie. „Allen.“');
  });
});

describe('Akt 5: Haupt-Szenen', () => {
  const scene = (id: string) => AKT5.chat.find((c) => c.id === id)!;
  const lessons = ['l1', 'l2', 'l3'];
  /** alle Zeilen einer Szene samt Reaktionen auf Antworten */
  const sceneLines = (c: StoryScene) => walkLines(c.lines, c.chat).map((x) => x.line);

  it('17 Szenen: a5-start, je Auftrag Briefing, drei Stufen und Abschluss, a5-exam-after; alle in ZEHN intern', () => {
    expect(AKT5.chat.map((c) => c.id)).toEqual([
      'a5-start',
      ...lessons.flatMap((l) => [`a5-${l}-brief`, `a5-${l}-s25`, `a5-${l}-s50`, `a5-${l}-s75`, `a5-${l}-done`]),
      'a5-exam-after',
    ]);
    expect(AKT5.chat.every((c) => c.chat === 'intern')).toBe(true);
    // a5-start kommt vor dem Briefing von Auftrag 1, mit demselben Auslöser
    expect(scene('a5-start').trigger).toEqual(scene('a5-l1-brief').trigger);
    expect(scene('a5-exam-after').trigger).toEqual({ on: 'exam', moduleId: 'm5' });
  });

  it('die drei Sätze stehen allein an ihrer Zeile in den Abschluss-Szenen, Text gleich getipptem Satz, Kurzform höchstens drei Wörter', () => {
    const typed = lessons.map((l) => scene(`a5-${l}-done`).lines.flatMap((x) => x.choices ?? []).filter((c) => c.typed));
    expect(typed.map((cs) => cs.map((c) => c.typed))).toEqual([['essen, Opa!'], ['Krümel: wach auf'], ['Juna, komm zurück!']]);
    for (const c of typed.flat()) {
      expect(c.text).toBe(c.typed);
      expect(c.label.split(' ').length).toBeLessThanOrEqual(3);
    }
  });

  it('Frau Hubbel schreibt nur in Haupt-Szenen von ZEHN intern und erst ab a5-l2-s75', () => {
    const idx = (id: string) => AKT5.chat.findIndex((c) => c.id === id);
    for (const c of AKT5.chat) {
      const hubbel = sceneLines(c).some((l) => l.speaker === 'hubbel');
      if (hubbel) expect(idx(c.id), c.id).toBeGreaterThanOrEqual(idx('a5-l2-s75'));
    }
    expect(sceneLines(scene('a5-l2-s75')).some((l) => l.speaker === 'hubbel')).toBe(true);
    expect(AKT5.chat.some((c) => walkLines(c.lines, c.chat).some((x) => x.line.speaker === 'hubbel' && x.chat !== 'intern'))).toBe(false);
  });

  it('Juna geht in a5-l2-s75 („ich geh.“, Systemzeile) und fehlt danach in jeder Haupt-Szene, bis sie in a5-exam-after beitritt', () => {
    const lines = sceneLines(scene('a5-l2-s75'));
    const goes = lines.findIndex((l) => l.text === 'ich geh.');
    expect(lines[goes]?.speaker).toBe('juna');
    expect(lines[goes + 1]).toMatchObject({ speaker: 'system', text: 'Juna hat den Chat verlassen.' });
    expect(lines.slice(goes + 2).some((l) => l.speaker === 'juna')).toBe(false);
    const from = AKT5.chat.findIndex((c) => c.id === 'a5-l2-done');
    const to = AKT5.chat.findIndex((c) => c.id === 'a5-exam-after');
    for (const c of AKT5.chat.slice(from, to)) expect(sceneLines(c).some((l) => l.speaker === 'juna'), c.id).toBe(false);
    const after = sceneLines(scene('a5-exam-after'));
    expect(after.findIndex((l) => l.text === 'Juna ist dem Chat beigetreten.')).toBeLessThan(after.findIndex((l) => l.speaker === 'juna'));
    // Juna schreibt zuerst klein
    expect(after.find((l) => l.speaker === 'juna')!.text).toMatch(/^ich war am rand/);
  });

  it('Krümel ist offline (Ende a5-l1-s75) und online (Anfang a5-l2-brief); Systemzeilen tragen den Sprecher system', () => {
    const last = (id: string) => sceneLines(scene(id)).filter((l) => l.speaker === 'system');
    expect(last('a5-l1-s75').map((l) => l.text)).toEqual(['Krümel ist offline.']);
    expect(sceneLines(scene('a5-l2-brief'))[0]).toMatchObject({ speaker: 'system', text: 'Krümel ist online.' });
  });

  it('die Fallakten sind von a5-l2-brief bis a5-l2-done zerkratzt: beide Szenen existieren', () => {
    expect(scene(AKT5.fallaktenDamage!.from)).toBeDefined();
    expect(scene(AKT5.fallaktenDamage!.until)).toBeDefined();
  });

  it('Echos auf Akt 4 stehen in a5-start (dazu der Rückfall ohne gemerkte Antwort), a5-l1-s75 und a5-l3-s50, je drei Varianten', () => {
    const echoes = (id: string) => scene(id).lines.filter((l) => l.ifPicked).map((l) => [l.ifPicked!.scene, l.ifPicked!.choice]);
    expect(echoes('a5-start')).toEqual([['a4-exam-after', 'lieferung'], ['a4-exam-after', 'foto'], ['a4-exam-after', 'lupe'], ['a4-exam-after', null]]);
    expect(echoes('a5-l1-s75')).toEqual([['a4-l1-s75', 'seitwann'], ['a4-l1-s75', 'gut'], ['a4-l1-s75', 'fernglas']]);
    expect(echoes('a5-l3-s50')).toEqual([['a4-l2-s50', 'aufkleber'], ['a4-l2-s50', 'gutaus'], ['a4-l2-s50', 'spaeter']]);
  });

  it('Antwort-IDs der Fallakte: post, otti, freund (Tat), dasselbe, lupe gibt es an ihrer Szene', () => {
    const ids = (id: string) => scene(id).lines.flatMap((l) => l.choices ?? []).map((c) => c.id);
    expect(ids('a5-l1-s50')).toContain('post');
    expect(ids('a5-l2-s50')).toContain('otti');
    expect(ids('a5-l3-s50')).toContain('freund');
    expect(ids('a5-l3-s75')).toContain('laut');
    expect(ids('a5-exam-after')).toEqual(expect.arrayContaining(['dasselbe', 'lupe']));
  });

  it('Gadget-Antworten: Shift-Handschuhe in a5-l1-brief, Walkie-Talkie in a5-l3-brief, Lupe in a5-exam-after; jede neben einer ohne Gadget', () => {
    const needs = AKT5.chat.flatMap((c) => c.lines.flatMap((l) => (l.choices ?? []).filter((x) => x.needs).map((x) => [c.id, x.id, x.needs])));
    expect(needs).toEqual([
      ['a5-l1-brief', 'handschuhe', 'shift-handschuhe'],
      ['a5-l3-brief', 'walkie', 'walkie-talkie'],
      ['a5-exam-after', 'lupe', 'lupe'],
    ]);
    for (const c of AKT5.chat) for (const l of c.lines) if (l.choices?.some((x) => x.needs)) expect(l.choices.some((x) => !x.needs), c.id).toBe(true);
  });

  it('das Notfunkgerät überreicht a5-l2-brief (Zeile mit dem Ding); die Antwort darauf steht im Einsatz-Intro', () => {
    const brief = scene('a5-l2-brief');
    expect(brief.gives).toEqual(['notfunk']);
    expect(brief.lines.some((l) => l.item === 'notfunk')).toBe(true);
    const gadget = ITEMS.find((i) => i.id === 'notfunk')!;
    expect([gadget.kind, gadget.name, gadget.source]).toEqual(['gadget', 'Notfunkgerät', { scene: 'a5-l2-brief' }]);
    expect(gadget.description.length).toBeGreaterThan(0);
  });

  it('Mini-Tastatur: Taste plus Umschalttaste aus dem Drehbuch', () => {
    const keys = (id: string) => scene(id).lines.flatMap((l) => l.keys ?? []);
    expect(keys('a5-l1-brief')).toEqual(['ShiftLeft', 'Minus', 'ShiftRight', 'Digit1']);
    expect(keys('a5-l2-brief')).toEqual(['ShiftLeft', 'Period', 'Comma']);
    expect(keys('a5-l3-brief')).toEqual(['ShiftRight', 'Digit2', 'ShiftLeft', 'Backslash']);
  });

  it('Bilder und Karte: Junas Beitrag, Booster-Chip; die Karte „Signal von: O.“ ohne Goldrand mit Bild', () => {
    expect(scene('a5-l1-s25').lines.some((l) => l.picture === 'junas-post')).toBe(true);
    expect(scene('a5-l3-s50').lines.some((l) => l.picture === 'booster-chip')).toBe(true);
    const card = scene('a5-exam-after').lines.find((l) => l.card)!;
    expect(card.card).toEqual({ title: 'Aus dem Chip', text: 'Signal von: O.' });
    expect(card.picture).toBe('signal-karte');
    expect(AKT5.chat.flatMap((c) => c.lines).filter((l) => l.card?.look === 'goldcard')).toEqual([]);
  });

  it('Beweisstücke: Junas Beitrag, Chip, Skript (mit Objekt) und Karte kommen in ihrer Szene ins Beweisfach', () => {
    const fach = ITEMS.find((i) => i.id === 'beweisfach')!;
    expect(fach.pieces!.filter((p) => p.scene.startsWith('a5-')).map((p) => [p.id, p.scene, p.object])).toEqual([
      ['junas-post', 'a5-l1-s25', undefined],
      ['booster-chip', 'a5-l3-s50', undefined],
      ['durchsage-skript', 'a5-l3-done', 'm5-l3'],
      ['signal-karte', 'a5-exam-after', undefined],
    ]);
  });
});

describe('Akt 5: Fallakte', () => {
  const f = fallakte(ALL_STORY, 'm5')!;

  it('gelöst: sieben Zeilen, zwei davon Treffer (post, aufkleber); offen: sechs, zwei Treffer (lupe, otti)', () => {
    expect(f.solved).toHaveLength(7);
    expect(f.solved.filter((e) => e.ifPicked).map((e) => [e.ifPicked!.scene, e.ifPicked!.choice])).toEqual([['a5-l1-s50', 'post'], ['a4-l2-s50', 'aufkleber']]);
    expect(f.open).toHaveLength(6);
    expect(f.open.filter((e) => e.ifPicked).map((e) => [e.ifPicked!.scene, e.ifPicked!.choice])).toEqual([['a5-exam-after', 'lupe'], ['a5-l2-s50', 'otti']]);
    expect(f.open[0]).toMatchObject({ card: 'Signal von: O.', picture: 'signal-karte' });
    // Bilder wie im Drehbuch: der Chip und das Skript unter „gelöst“, die Karte unter „offen“
    expect(f.solved.flatMap((e) => (e.picture ? [e.picture] : []))).toEqual(['booster-chip', 'durchsage-skript']);
  });

  it('vier Verdächtige: Baron GESUCHT, Ortrud ENTLASTET, Krümel ENTLASTET (Treffer freund), „O.“ GESUCHT (Treffer dasselbe)', () => {
    expect(f.suspects.map((s) => [s.name, s.status])).toEqual([
      ['Baron von Backspace', 'gesucht'],
      ['Ortrud', 'entlastet'],
      ['Krümel', 'entlastet'],
      ['O.', 'gesucht'],
    ]);
    expect(f.suspects[2]!.hits.map((h) => h.ifPicked)).toEqual([{ scene: 'a5-l3-s50', choice: 'freund' }]);
    expect(f.suspects[3]!.hits.map((h) => h.ifPicked)).toEqual([{ scene: 'a5-exam-after', choice: 'dasselbe' }]);
    expect(f.closing).toBe('Juna zurück. Ada leise. Ich repariert. Piep. Absichtlich.');
  });
});

describe('Akt 5: Nebenszenen', () => {
  const sides = AKT5.side;
  const trig = (s: (typeof sides)[number]) => s.trigger as { strand: string; order: number; fromLesson: string; untilLesson?: string; afterScene?: string };
  const strand = (name: string) => sides.filter((s) => trig(s).strand === name).sort((a, b) => trig(a).order - trig(b).order);
  const ids = new Set(ALL_STORY.scenes.map((s) => s.id));
  const STRANDS = ['chaos', 'kringel', 'fuehrung', 'piep', 'hubbel'];

  it('fünf Stränge zu je drei Szenen mit `a5-side-`-Kennung, alle ab einem Auftrag von Akt 5, ohne Varianten', () => {
    expect(new Set(sides.map((s) => trig(s).strand))).toEqual(new Set(STRANDS));
    expect(sides).toHaveLength(15);
    for (const s of sides) {
      expect(s.id.startsWith('a5-side-'), s.id).toBe(true);
      expect(m5.lessons.map((l) => l.id), s.id).toContain(trig(s).fromLesson);
      expect(s.trigger, s.id).not.toHaveProperty('untilCase');
      expect(s.trigger, s.id).not.toHaveProperty('afterCase');
    }
    for (const name of STRANDS) expect(strand(name).map((s) => trig(s).order), name).toEqual([1, 2, 3]);
  });

  it('Chats und Sprecher: Juna im Flüstern, Krümel (nur Piep) bei Krümel, Ada und Frau Hubbel in ZEHN intern', () => {
    const chats = (name: string) => new Set(strand(name).map((s) => s.chat));
    expect(chats('chaos')).toEqual(new Set(['fluestern']));
    expect(chats('piep')).toEqual(new Set(['kruemel']));
    for (const name of ['kringel', 'fuehrung', 'hubbel']) expect(chats(name), name).toEqual(new Set(['intern']));
    const speakers = (name: string) => new Set(strand(name).flatMap((s) => s.lines.map((l) => l.speaker)));
    expect(speakers('chaos')).toEqual(new Set(['juna']));
    expect(speakers('kringel')).toEqual(new Set(['ada']));
    expect(speakers('fuehrung')).toEqual(new Set(['ada']));
    expect(speakers('piep')).toEqual(new Set(['kruemel']));
    expect(speakers('hubbel')).toEqual(new Set(['hubbel', 'ada']));
    // zwei Nachrichten von Frau Hubbel und eine von Ada in hubbel-1 und -3, die anderen eine
    expect(sides.map((s) => s.lines.length)).toEqual(sides.map((s) => (s.id === 'a5-side-hubbel-1' || s.id === 'a5-side-hubbel-3' ? 3 : 1)));
  });

  it('Auslöser wie in der Tabelle des Drehbuchs, jede Bedingung nennt eine vorhandene Szene', () => {
    expect(trig(strand('chaos')[0]!)).toMatchObject({ fromLesson: 'm5-l1', untilLesson: 'm5-l1' });
    expect(trig(strand('kringel')[0]!).fromLesson).toBe('m5-l1');
    expect(trig(strand('fuehrung')[0]!).fromLesson).toBe('m5-l1');
    for (const s of strand('piep')) expect(trig(s), s.id).toMatchObject({ fromLesson: 'm5-l2', afterScene: 'a5-l2-done', untilLesson: 'm5-l3' });
    for (const s of strand('hubbel')) expect(trig(s), s.id).toMatchObject({ fromLesson: 'm5-l2', afterScene: 'a5-l2-s75' });
    for (const s of sides) if (trig(s).afterScene) expect(ids.has(trig(s).afterScene!), s.id).toBe(true);
  });

  /** Alle Nebenszenen, die in Durchgängen eines Auftrags nacheinander kommen (Log wächst mit; `done`: Haupt-Szenen schon gelesen) */
  const run = (lessonId: string, lessons: string[], done: string[] = []): string[] => {
    const out: string[] = [];
    for (let i = 0; i < 15; i++) {
      const next = nextSideScene(logScenes(profile({ lessons: mastered(...lessons) }), [...done, ...out], 1), { scenes: sides }, RULES, lessonId);
      if (!next) break;
      out.push(next);
    }
    return out;
  };
  const strandOf = (ids: string[], name: string) => ids.filter((id) => id.startsWith(`a5-side-${name}-`));

  it('`chaos` kommt nur in Auftrag 1 und endet mit seinem Abschluss: Juna postet danach nicht mehr', () => {
    expect(strandOf(run('m5-l1', []), 'chaos')).toHaveLength(3);
    for (const lessonId of ['m5-l2', 'm5-l3']) expect(strandOf(run(lessonId, ['m5-l1'], ['a5-l2-s75', 'a5-l2-done']), 'chaos'), lessonId).toEqual([]);
  });

  it('`piep` steht in der Liste vor `kringel`; `a5-side-piep-3` ist stillgelegt (das Fenster bis Auftrag 3 ist zu eng)', () => {
    const order = [...new Set(sides.map((s) => trig(s).strand))];
    expect(order.indexOf('piep')).toBeLessThan(order.indexOf('kringel'));
    expect(sides.filter((s) => s.retired).map((s) => s.id)).toEqual(['a5-side-piep-3']);
  });

  it('`piep` kommt erst nach `a5-l2-done` und endet mit Auftrag 3 (zwei lebende Szenen)', () => {
    expect(strandOf(run('m5-l2', ['m5-l1'], ['a5-l2-s75']), 'piep')).toEqual([]);
    expect(strandOf(run('m5-l2', ['m5-l1'], ['a5-l2-s75', 'a5-l2-done']), 'piep')).toHaveLength(2);
    expect(strandOf(run('m5-l3', ['m5-l1', 'm5-l2'], ['a5-l2-s75', 'a5-l2-done']), 'piep')).toHaveLength(2);
    expect(strandOf(run('m5-l3', ['m5-l1', 'm5-l2', 'm5-l3'], ['a5-l2-s75', 'a5-l2-done']), 'piep')).toEqual([]);
  });

  it('`hubbel` kommt erst nach `a5-l2-s75`', () => {
    expect(strandOf(run('m5-l2', ['m5-l1'], []), 'hubbel')).toEqual([]);
    expect(strandOf(run('m5-l2', ['m5-l1'], ['a5-l2-s75']), 'hubbel')).toHaveLength(3);
  });

  it('keine Nebenszene verschenkt etwas', () => {
    expect(sides.filter((s) => s.gives)).toEqual([]);
  });
});

describe('Akt 5: Belohnungen', () => {
  const rewards = AKT5.rewards;
  const scene = (id: string) => rewards.find((s) => s.id === id)!;

  it('fünf Szenen mit Kennung, Auslöser, Chat und Ding wie im Drehbuch', () => {
    expect(rewards.map((s) => [s.id, s.chat, s.trigger, s.gives])).toEqual([
      ['a5-gift-guertel', 'intern', { on: 'briefing', lessonId: 'm5-l1' }, ['belt']],
      ['a5-gift-hosentraeger', 'intern', { on: 'stage', lessonId: 'm5-l2', at: 0.75 }, ['suspenders']],
      ['a5-gift-nacht', 'kruemel', { on: 'stage', lessonId: 'm5-l3', at: 0.5 }, ['colors-night']],
      ['a5-gift-strubbelig', 'juna', { on: 'exam', moduleId: 'm5' }, ['messy']],
      ['a5-badge-satzzeichen', 'kruemel', { on: 'badge', badgeId: 'satzzeichen' }, ['bob']],
    ]);
    for (const s of rewards) expect(s.gift, s.id).toBe(true);
  });

  it('Sprecher und Sätze: Ada den Gürtel, Frau Hubbel die Hosenträger, Krümel in Bruchstücken das Farbpaket, Juna (mit Zwinkern) Strubbelig', () => {
    expect(scene('a5-gift-guertel').lines[0]).toMatchObject({ speaker: 'ada', text: 'Ein Gürtel. Damit hält alles zusammen, auch Sätze. Der war von meiner ersten Uniform. Zieh ihn an.' });
    expect(scene('a5-gift-hosentraeger').lines[0]).toMatchObject({ speaker: 'hubbel', text: 'Hosenträger. Ada trägt auch welche. Sagt sie. Ich habe sie nie gesehen. Du trägst sie sichtbar.' });
    expect(scene('a5-gift-nacht').lines.map((l) => [l.speaker, l.text])).toEqual([
      ['kruemel', 'Farben. Nacht. Für die Nachtschicht am Notfunk. (Von mir. Ganz.)'],
      ['kruemel', 'Schiefer, Anthrazit, Pflaume, Tannengrün – für Kleidung.'],
    ]);
    expect(scene('a5-gift-strubbelig').lines[0]).toMatchObject({ speaker: 'juna', text: 'Vom Kiosk: die Strubbel-Frisur. Wer Zeichen setzt, darf zerzaust sein. Mama sagt, das ist Mode. 😉' });
  });

  it('Reihenfolge: Gürtel nach dem Briefing von Auftrag 1, Hosenträger nach `a5-l2-s75`, Farbpaket nach `a5-l3-s50`, Strubbelig nach `a5-exam-after`', () => {
    const order = ALL_STORY.scenes.map((s) => s.id);
    expect(order.indexOf('a5-gift-guertel')).toBeGreaterThan(order.indexOf('a5-l1-brief'));
    expect(order.indexOf('a5-gift-hosentraeger')).toBeGreaterThan(order.indexOf('a5-l2-s75'));
    expect(order.indexOf('a5-gift-nacht')).toBeGreaterThan(order.indexOf('a5-l3-s50'));
    expect(order.indexOf('a5-gift-strubbelig')).toBeGreaterThan(order.indexOf('a5-exam-after'));
  });

  it('Abzeichen „Satzzeichen gesichert“ (Fortschritt) mit Paket von Kringel und dem Zettel für Bob', () => {
    const b = BADGES.find((x) => x.id === 'satzzeichen')!;
    expect([b.title, b.category, b.icon]).toEqual(['Satzzeichen gesichert', 'fortschritt', '?!']);
    const texts = scene('a5-badge-satzzeichen').lines.map((l) => l.text);
    expect(texts.slice(0, 2)).toEqual(['Satzzeichen gesichert!', 'Fragezeichen, Ausrufezeichen, Doppelpunkt, Semikolon, Anführungszeichen, Apostroph. ⚡']);
    expect(texts[2]).toBe('Postbote Kringel: „Paket für {vorname}. Von der Backstube. Agent Kringel trug es. Mit Mantel.“');
    expect(texts[3]).toBe('Im Paket: Bob. Auf dem Zettel steht: „Kurz, praktisch, ohne Komma.“');
  });
});
