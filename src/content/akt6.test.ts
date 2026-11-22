// Besonderheiten von Akt 6 „Zahlen“: Modul, Wortliste, Beschriftung, Einsatz-Story, Story-Objekte, Fallakte, Prüfprofil.
// Alles, was für jeden Akt gilt, steht in course.test.ts, story.test.ts und rewards.test.ts und liest das Prüfprofil `check` des Bündels.

import { describe, expect, it } from 'vitest';
import { findModule } from '../domain/course.ts';
import { examStory, fallakte, moduleLabel } from '../domain/book.ts';
import { isTypeable, learnKey } from '../domain/keyboard.ts';
import { isDigit } from '../domain/textGenerator.ts';
import { objectOf, stageAt } from '../domain/storyObject.ts';
import type { Choice, Line } from '../domain/dialog.ts';
import { ALL_COURSE, ALL_STORY, sceneLines } from '../test/content.ts';
import { ITEMS } from './items.ts';
import { BADGES } from './badges.ts';
import { RULES } from '../app/rules.ts';
import { logScenes } from '../domain/scenes.ts';
import { nextSideScene } from '../domain/story.ts';
import { mastered, profile } from '../test/factories.ts';
import { COURSE } from './course.ts';
import { ACTS, STAGED_ACTS } from './story/acts.ts';
import { AKT6 } from './story/akt6/index.ts';
import { WORDS_ZAHLEN } from './words.de.ts';

const m1 = findModule(ALL_COURSE, 'm1');
const m6 = findModule(ALL_COURSE, 'm6');

describe('Akt 6: Gerüst', () => {
  it('ist im Spiel (ACTS, COURSE) nach Akt 5; Haupt-Szenen, Nebenszenen und Belohnungen stehen, ohne Extra-Fall', () => {
    expect(STAGED_ACTS).not.toContain(AKT6);
    expect(ACTS.at(-2)).toBe(AKT6);
    expect(COURSE.modules.map((m) => m.id)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7']);
    expect(ALL_COURSE.modules.map((m) => m.id)).toEqual(COURSE.modules.map((m) => m.id)); // nichts mehr vorbereitet
    expect(AKT6.chat).toHaveLength(22);
    expect(AKT6.side).toHaveLength(15);
    expect(AKT6.rewards).toHaveLength(4);
    expect([AKT6.cases, AKT6.caseScenes].every((l) => l.length === 0)).toBe(true);
  });

  it('vier Aufträge mit den Ziffern nach Fingern; Schwellen wie in Akt 1; Beschriftung „Akt 6 · Der Tresor“', () => {
    expect(m6.title).toBe('Zahlen');
    expect(m6.lessons.map((l) => [l.id, l.title, l.newKeys.join(' ')])).toEqual([
      ['m6-l1', 'Koordinaten', '4 5 6 7'],
      ['m6-l2', 'Das leere Lager', '3 8'],
      ['m6-l3', 'Die Spurenwand', '1 0'],
      ['m6-l4', 'Das Buchstabenkonto', '2 9'],
    ]);
    expect(m6.mastery).toEqual(m1.mastery);
    expect(moduleLabel(ALL_STORY, 'm6')).toEqual({ act: 'Akt 6', place: 'Der Tresor' });
  });

  it('jede der zehn Ziffern ist ihre eigene Lerneinheit (eigenes Siegel) und tippbar', () => {
    const keys = m6.lessons.flatMap((l) => l.newKeys);
    expect([...keys].sort().join('')).toBe('0123456789');
    for (const k of keys) {
      expect(isDigit(k), k).toBe(true);
      expect(learnKey(k), k).toBe(k);
      expect(isTypeable(k), k).toBe(true);
    }
  });

  it('Wortliste: kleingeschrieben, nur Buchstaben (Ziffern kommen als Zahlengruppen), ohne Doppelte', () => {
    expect(m6.words).toBe(WORDS_ZAHLEN);
    for (const w of WORDS_ZAHLEN) expect(w, w).toMatch(/^[a-zäöüß]+$/);
    expect(new Set(WORDS_ZAHLEN).size).toBe(WORDS_ZAHLEN.length);
  });

  it('Einsatz strikt mit allen gelernten Tasten', () => {
    expect(m6.exam).toEqual({ minAccuracy: 0.92, minApm: 50, durationSec: 60, keys: 'learned' });
    expect(m6.exam.mode).toBeUndefined();
  });

  it('Prüfprofil: Spoiler aus Akt 7, kein revealFrom', () => {
    expect(AKT6.check.spoilers).toEqual(['duell', 'preisliste', 'zentrale']);
    expect(AKT6.check.revealFrom).toBeUndefined();
    expect(AKT6.fallaktenDamage).toBeUndefined();
  });

  it('Fallakte: Titel, Kopfzeile und Einsatz-Zeilen', () => {
    const f = fallakte(ALL_STORY, 'm6')!;
    expect([f.title, f.header]).toEqual(['Fallakte Akt 6', 'Ich habe den Namen nicht gesagt. Du hast ihn gesagt. Dann ich.']);
    expect(f.firewall).toEqual({ passed: 'Der Tresor: alle Rädchen gedreht, das O gesehen', backdoor: 'Der Tresor: Benno hat gedreht – Einsatz nachholen' });
  });
});

describe('Akt 6: Einsatz „Der Tresor“', () => {
  const exam = examStory(ALL_STORY, 'm6');

  it('Titel, Ausgänge, Segmente, Rahmen, Ziel-Spruch und vier Sprüche des Lautsprechers', () => {
    expect([exam.title, exam.won, exam.lost, exam.segments, exam.frame]).toEqual(['Einsatz: Der Tresor', 'Tresor geknackt!', 'Verriegelt', 'Tresor: {n} von {gesamt} Codes gedreht', 'Tresor-Codes']);
    expect(exam.ready).toBe('Inventur Inventur Bitte nicht tippen Schätzchen Fertig');
    expect(exam.taunts).toHaveLength(4);
    expect(exam.voice).toBe('speaker');
  });

  it('Intro, Erfolg und Hintertür spielen im Tresor; der Baron ist im Bilderbuch dabei', () => {
    for (const lines of [exam.intro, exam.success, exam.backdoorTaken]) expect(lines[0]?.scene).toBe('tresor');
    expect(exam.intro.some((l) => l.speaker === 'baron')).toBe(true);
    expect(exam.fail[0]?.text).toContain('{prozent}');
  });

  it('Antworten: im Intro `drehen`, `mitdir` und `monokel` (nur mit Bennos Monokel), im Erfolg `wieder` und `zahlen`', () => {
    const ids = (lines: typeof exam.intro) => lines.flatMap((l) => (l.choices ?? []).map((c) => c.id));
    expect(ids(exam.intro)).toEqual(['drehen', 'mitdir', 'monokel']);
    expect(exam.intro.flatMap((l) => l.choices ?? []).map((c) => c.needs)).toEqual([undefined, undefined, 'bennos-monokel']);
    expect(ids(exam.success)).toEqual(['wieder', 'zahlen']);
  });
});

describe('Akt 6: Story-Objekte', () => {
  const lines = (lessonId: string, at: number) => stageAt(objectOf(ALL_STORY.objects, lessonId)!, at).lines;

  it('vier Objekte als Text-Zeilen (ohne Bilder), je Auftrag eins', () => {
    expect(AKT6.objects.map((o) => [o.lessonId, o.title, o.kind])).toEqual([
      ['m6-l1', 'Die Stadtkarte', 'lines'],
      ['m6-l2', 'Das Tresorschloss', 'lines'],
      ['m6-l3', 'Die Spurenwand', 'lines'],
      ['m6-l4', 'Ottis Lieferbuch', 'lines'],
    ]);
    for (const o of AKT6.objects) expect(o.stages.map((s) => s.at)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('Stadtkarte: fünf Orte ohne Zahlen, dann rastet je Stufe eine Zahl ein, zuletzt der Weg „4 7 6 5 – offen“', () => {
    expect(lines('m6-l1', 0)).toEqual(['HAFEN', 'PIER', 'HALLE', 'TOR', 'KISTE']);
    expect(lines('m6-l1', 0.25)).toEqual(['PIER 4']);
    expect(lines('m6-l1', 0.75)).toEqual(['PIER 4', 'HALLE 7', 'TOR 6']);
    expect(lines('m6-l1', 1)).toEqual(['PIER 4', 'HALLE 7', 'TOR 6', 'KISTE 5', '4 7 6 5 – offen']);
  });

  it('Tresorschloss: vier Rädchen, zuletzt offen und leer', () => {
    expect(lines('m6-l2', 0)).toEqual(['SCHLOSS: _ _ _ _']);
    expect(lines('m6-l2', 0.5)).toEqual(['3 8 _ _']);
    expect(lines('m6-l2', 1)).toEqual(['3 8 6 7 – offen', 'Leer.']);
  });

  it('Spurenwand: fünf Zettel ohne Faden, dann drei Fäden, zuletzt die Nadel „Marktplatz 10“', () => {
    expect(lines('m6-l3', 0)).toHaveLength(5);
    expect(lines('m6-l3', 0.75)?.every((l) => l.startsWith('Faden: '))).toBe(true);
    expect(lines('m6-l3', 1)?.at(-1)).toBe('Nadel: Marktplatz 10');
  });

  it('Lieferbuch: „MEIN KONTO BEI O.“ mit Lücken, dann Seite für Seite, zuletzt „selbst geholt“', () => {
    expect(lines('m6-l4', 0)?.[0]).toBe('MEIN KONTO BEI O.');
    expect(lines('m6-l4', 0.75)?.at(-1)).toBe('Tresor: 1234');
    expect(lines('m6-l4', 1)?.at(-1)).toBe('Seite 29, unter „Code“: Zahlen, selbst geholt.');
  });
});

describe('Akt 6: Haupt-Szenen', () => {
  const scene = (id: string) => AKT6.chat.find((s) => s.id === id)!;
  const linesOf = (id: string) => sceneLines(scene(id).lines, scene(id).chat);
  /** alle Antworten einer Szene, auch verschachtelte (in Reaktionen) */
  const choicesOf = (lines: readonly Line[]): Choice[] => lines.flatMap((l) => (l.choices ?? []).flatMap((c) => [c, ...choicesOf(c.reply ?? [])]));
  const ids = AKT6.chat.map((s) => s.id);

  it('22 Haupt-Szenen: Anfang, je Auftrag Briefing, drei Stufen und Abschluss, nach dem Einsatz; alle in ZEHN intern', () => {
    expect(ids).toEqual([
      'a6-start',
      ...['l1', 'l2', 'l3', 'l4'].flatMap((l) => ['brief', 's25', 's50', 's75', 'done'].map((k) => `a6-${l}-${k}`)),
      'a6-exam-after',
    ]);
    for (const s of AKT6.chat) expect(s.chat, s.id).toBe('intern');
    expect(scene('a6-start').trigger).toEqual({ on: 'briefing', lessonId: 'm6-l1' });
    expect(scene('a6-exam-after').trigger).toEqual({ on: 'exam', moduleId: 'm6' });
  });

  it('getippte Codes: je Abschluss einer, allein an seiner Zeile; Kurzform und Text sind der Code', () => {
    const typed = AKT6.module.lessons.map((l) => {
      const cs = choicesOf(scene(`a6-${l.id.slice(3)}-done`).lines).filter((c) => c.typed);
      expect(cs, l.id).toHaveLength(1);
      const c = cs[0]!;
      expect([c.label, c.text], l.id).toEqual([c.typed, c.typed]);
      return { lessonId: l.id, word: c.typed!, id: c.id };
    });
    expect(typed).toEqual([
      { lessonId: 'm6-l1', word: '4765', id: 'code4765' },
      { lessonId: 'm6-l2', word: '3867', id: 'code3867' },
      { lessonId: 'm6-l3', word: '10', id: 'code10' },
      { lessonId: 'm6-l4', word: '1234', id: 'code1234' },
    ]);
    expect(AKT6.check.typed).toEqual(typed.map(({ lessonId, word }) => ({ lessonId, word })));
    // jeder Code enthält eine Ziffer seines Auftrags
    for (const { lessonId, word } of typed) expect(findModule(ALL_COURSE, 'm6').lessons.find((l) => l.id === lessonId)!.newKeys.some((k) => word.includes(k)), lessonId).toBe(true);
  });

  it('Mini-Tastatur in den Briefings: nur die Ziffern-Codes ohne Umschalttaste', () => {
    const keys = (id: string) => scene(id).lines.flatMap((l) => l.keys ?? []);
    expect(keys('a6-l1-brief')).toEqual(['Digit4', 'Digit5', 'Digit6', 'Digit7']);
    expect(keys('a6-l2-brief')).toEqual(['Digit3', 'Digit8']);
    expect(keys('a6-l3-brief')).toEqual(['Digit1', 'Digit0']);
    expect(keys('a6-l4-brief')).toEqual(['Digit2', 'Digit9']);
  });

  it('Tippi tritt in `a6-l3-brief` bei (Systemzeile) und korrigiert danach je Szene höchstens einmal: Ada, Juna, Krümel', () => {
    const idx = (id: string) => ids.indexOf(id);
    for (const s of AKT6.chat) if (sceneLines(s.lines, s.chat).some(({ line }) => line.speaker === 'tippi')) expect(idx(s.id), s.id).toBeGreaterThanOrEqual(idx('a6-l3-brief'));
    expect(scene('a6-l3-brief').lines.find((l) => l.speaker === 'system')?.text).toBe('Tippi ist dem Chat beigetreten.');
    const strikes = AKT6.chat.map((s) => [s.id, sceneLines(s.lines, s.chat).filter(({ line }) => line.strike).map(({ line }) => line.strike)] as const).filter(([, l]) => l.length);
    expect(strikes).toEqual([
      ['a6-l3-brief', ['Jede Runde ein Faden']],
      ['a6-l3-s25', ['Für wen eigentlich']],
      ['a6-l4-s25', ['Unterschrift: ein Lolli']],
    ]);
    // Tippis Reaktionen auf `werbist` und `raus` sind ohne Korrektur
    expect(linesOf('a6-l3-brief').filter(({ line }) => line.speaker === 'tippi')).toHaveLength(3);
  });

  it('„???“ schreibt bis zum Einsatz, Benno erst nach der Systemzeile in `a6-exam-after`', () => {
    const speakers = (id: string) => new Set(linesOf(id).map(({ line }) => line.speaker));
    for (const s of AKT6.chat.filter((x) => x.id !== 'a6-exam-after')) expect(speakers(s.id).has('benno'), s.id).toBe(false);
    for (const id of ['a6-l2-s50', 'a6-l2-s75', 'a6-l3-s75', 'a6-l3-done', 'a6-l4-brief', 'a6-l4-s25', 'a6-l4-s50', 'a6-l4-s75']) expect(speakers(id).has('unbekannt'), id).toBe(true);
    const after = scene('a6-exam-after').lines;
    expect(speakers('a6-exam-after').has('unbekannt')).toBe(false);
    const sysAt = after.findIndex((l) => l.speaker === 'system' && l.text === 'Unbekannt heißt jetzt Benno.');
    expect(sysAt).toBeGreaterThan(0);
    expect(after.findIndex((l) => l.speaker === 'benno')).toBe(sysAt + 1);
    expect(linesOf('a6-exam-after').filter(({ line }) => line.speaker === 'benno')).toHaveLength(2);
  });

  it('Spurenwand-Wahl in `a6-l3-s50`: verschachtelt mit neun eindeutigen Kennungen; jeder Weg endet bei [Otti]', () => {
    const all = choicesOf(scene('a6-l3-s50').lines);
    expect(all.map((c) => c.id).sort()).toEqual(['baron', 'baron-2', 'ortrud', 'ortrud-2', 'otti', 'otti-2', 'otti-2b', 'otti-3', 'otti-3b']);
    /** die Wege zu Ende: jeder Ast endet mit einer Otti-Antwort ohne weitere Wahl */
    const leaves = (cs: readonly Choice[]): string[] => cs.flatMap((c) => {
      const next = (c.reply ?? []).flatMap((l) => l.choices ?? []);
      return next.length ? leaves(next) : [c.id];
    });
    expect(leaves(scene('a6-l3-s50').lines[0]!.choices!).sort()).toEqual(['otti', 'otti-2', 'otti-2b', 'otti-3', 'otti-3b']);
    for (const c of all) expect(c.needs, c.id).toBeUndefined();
  });

  it('Vertrauens-Wahl `ja` / `beweisen` in `a6-l3-done` nach dem Code, Echo in `a6-l4-s25`; Echos auf Akt 5', () => {
    const done = scene('a6-l3-done').lines;
    const typedAt = done.findIndex((l) => l.choices?.some((c) => c.typed));
    const trustAt = done.findIndex((l) => l.choices?.some((c) => c.id === 'ja'));
    expect(trustAt).toBeGreaterThan(typedAt);
    expect(done[trustAt]!.speaker).toBe('unbekannt');
    expect(done[trustAt]!.choices!.map((c) => c.id)).toEqual(['ja', 'beweisen']);
    const echoes = AKT6.chat.flatMap((s) => s.lines.filter((l) => l.ifPicked).map((l) => `${s.id} ← ${l.ifPicked!.scene}/${l.ifPicked!.choice}`));
    expect(echoes).toEqual([
      'a6-start ← a5-exam-after/wer',
      'a6-start ← a5-exam-after/dasselbe',
      'a6-start ← a5-exam-after/lupe',
      'a6-start ← a5-exam-after/null',
      'a6-l3-s25 ← a5-l2-s50/otti',
      'a6-l3-s75 ← a5-l3-s50/freund',
      'a6-l3-s75 ← a5-l3-s50/kruemel',
      'a6-l4-s25 ← a6-l3-done/ja',
      'a6-l4-s25 ← a6-l3-done/beweisen',
    ]);
    // {gruss} nur in `a6-start`, {codename} in zwei Reaktionen der Vertrauens-Wahl und in Adas Frage bei `a6-l4-s50`
    const texts = AKT6.chat.flatMap((s) => sceneLines(s.lines, s.chat).map(({ line }) => [s.id, line.text] as const));
    expect(new Set(texts.filter(([, t]) => t.includes('{gruss}')).map(([id]) => id))).toEqual(new Set(['a6-start']));
  });

  it('Gadget-Antworten: Fernglas, Lupe, Notfunkgerät in den Briefings 1–3, Bennos Monokel in `a6-exam-after`', () => {
    const needs = AKT6.chat.flatMap((s) => choicesOf(s.lines).filter((c) => c.needs).map((c) => [s.id, c.id, c.needs]));
    expect(needs).toEqual([
      ['a6-l1-brief', 'fernglas', 'fernglas'],
      ['a6-l2-brief', 'lupe', 'lupe'],
      ['a6-l3-brief', 'notfunk', 'notfunk'],
      ['a6-exam-after', 'monokel', 'bennos-monokel'],
    ]);
  });

  it('Bennos Monokel: neues Gadget (die Kennung `monokel` bleibt das Beweisstück aus Akt 2), überreicht von „???“ in `a6-l4-s50`', () => {
    const gadget = ITEMS.find((i) => i.id === 'bennos-monokel')!;
    expect(gadget).toMatchObject({ name: 'Bennos Monokel', kind: 'gadget', source: { scene: 'a6-l4-s50' } });
    expect(gadget.description).toBe('Zeigt Goldstaub, Lieferbücher und alles, was glitzert. Wenn man hinsieht.');
    expect(scene('a6-l4-s50').gives).toEqual(['bennos-monokel']);
    expect(scene('a6-l4-s50').lines.find((l) => l.item === 'bennos-monokel')?.speaker).toBe('unbekannt');
    expect(ITEMS.find((i) => i.id === 'beweisfach')!.pieces!.find((p) => p.id === 'monokel')?.name).toBe('Das Monokel-Glas');
  });

  it('Beweisstücke von Akt 6 im Beweisfach: Goldstaub, Goldrand-Karte, Nadel und Lieferbuch (mit Objekt), Lieferblatt', () => {
    const pieces = ITEMS.find((i) => i.id === 'beweisfach')!.pieces!.filter((p) => p.scene.startsWith('a6-'));
    expect(pieces.map((p) => [p.id, p.scene, p.picture, p.object])).toEqual([
      ['goldstaub', 'a6-l2-s25', 'goldstaub', undefined],
      ['feind-karte', 'a6-l2-done', 'feind-karte', undefined],
      ['spurenwand-nadel', 'a6-l3-done', 'spurenwand-nadel', 'm6-l3'],
      ['lieferbuch', 'a6-l4-done', 'lieferbuch', 'm6-l4'],
      ['lieferblatt', 'a6-exam-after', 'lieferblatt', undefined],
    ]);
    // die Goldrand-Karte und das Lieferblatt stehen als Karte und Bild an derselben Zeile
    expect(scene('a6-l2-done').lines.find((l) => l.picture === 'feind-karte')?.card?.look).toBe('goldcard');
    const blatt = scene('a6-exam-after').lines.find((l) => l.picture === 'lieferblatt')!;
    expect(blatt.card).toEqual({ title: 'Lieferblatt', text: 'Maschine 4: lernt selbst. Lehrer: gesucht.' });
  });
});

describe('Akt 6: Fallakte', () => {
  const f = AKT6.fallakte;

  it('gelöst: fünf Zeilen, Treffer-Zeilen für jede Otti-Antwort der Spurenwand, für `bestohlen` und `keino`; Bilder statt Objekte', () => {
    const plain = f.solved.filter((e) => !e.ifPicked);
    expect(plain).toHaveLength(5);
    expect(plain.map((e) => e.picture)).toEqual(['spurenwand-nadel', undefined, 'lieferbuch', 'goldstaub', undefined]);
    expect(f.solved.filter((e) => e.ifPicked).map((e) => `${e.ifPicked!.scene}/${e.ifPicked!.choice}`)).toEqual([
      'a6-l3-s50/otti',
      'a6-l3-s50/otti-2',
      'a6-l3-s50/otti-2b',
      'a6-l3-s50/otti-3',
      'a6-l3-s50/otti-3b',
      'a6-l2-s50/bestohlen',
      'a6-l4-s50/keino',
    ]);
  });

  it('offen: Karte „Lieferblatt“ mit Bild, Treffer-Zeile auf das Monokel; Schlusssatz von Krümel', () => {
    expect(f.open.find((e) => e.card)).toMatchObject({ card: 'Maschine 4: lernt selbst. Lehrer: gesucht.', picture: 'lieferblatt' });
    expect(f.open.filter((e) => e.ifPicked).map((e) => e.ifPicked)).toEqual([{ scene: 'a6-exam-after', choice: 'monokel' }]);
    expect(f.closing).toBe('Otti benannt. Benno benannt. O gesehen. Maschine 4 lernt. Ich auch. Piep.');
  });

  it('vier Verdächtige: Otti überführt, Benno und Ortrud entlastet, Tippi verdächtig; Treffer auf Akt 5 und die Vertrauens-Wahl', () => {
    expect(f.suspects.map((s) => [s.name, s.status, s.hits.map((h) => `${h.ifPicked!.scene}/${h.ifPicked!.choice}`)])).toEqual([
      ['Otti Korrekt', 'ueberfuehrt', ['a5-l2-s50/otti']],
      ['Benno', 'entlastet', ['a6-l3-done/ja', 'a6-l3-done/beweisen']],
      ['Ortrud', 'entlastet', []],
      ['Tippi', 'verdaechtig', []],
    ]);
  });

  it('keine vierstellige Zahl, kein Spoiler aus Akt 7 (der Code 1234 steht nur im Lieferbuch-Objekt)', () => {
    const texts = [f.header, f.closing, ...[...f.solved, ...f.open].flatMap((e) => [e.text, e.card ?? '']), ...f.suspects.flatMap((s) => [s.text, ...s.hits.map((h) => h.text)])];
    for (const t of texts) {
      expect(t, t).not.toMatch(/\d{4}/);
      expect(t, t).not.toMatch(/duell|preisliste|zentrale/i);
    }
  });
});

describe('Akt 6: Nebenszenen', () => {
  const sides = AKT6.side;
  const trig = (s: (typeof sides)[number]) => s.trigger as { strand: string; order: number; fromLesson: string; untilLesson?: string; afterScene?: string };
  const strand = (name: string) => sides.filter((s) => trig(s).strand === name).sort((a, b) => trig(a).order - trig(b).order);
  const ids = new Set(ALL_STORY.scenes.map((s) => s.id));
  const STRANDS = ['zaehlen', 'coups', 'tippi', 'kabbelei', 'kringel'];

  it('fünf Stränge zu je drei Szenen mit `a6-side-`-Kennung, alle ab einem Auftrag von Akt 6, ohne Varianten; keine verschenkt etwas', () => {
    expect(new Set(sides.map((s) => trig(s).strand))).toEqual(new Set(STRANDS));
    expect(sides).toHaveLength(15);
    for (const s of sides) {
      expect(s.id.startsWith('a6-side-'), s.id).toBe(true);
      expect(m6.lessons.map((l) => l.id), s.id).toContain(trig(s).fromLesson);
      expect(s.trigger, s.id).not.toHaveProperty('untilCase');
      expect(s.trigger, s.id).not.toHaveProperty('afterCase');
      expect(s.gives, s.id).toBeUndefined();
    }
    for (const name of STRANDS) expect(strand(name).map((s) => trig(s).order), name).toEqual([1, 2, 3]);
  });

  it('Chats und Sprecher: Krümel zählt bei Krümel; Tippi korrigiert Juna nur im Flüstern; „???“ nur in ZEHN intern, nie Benno', () => {
    const chats = (name: string) => new Set(strand(name).map((s) => s.chat));
    expect(chats('zaehlen')).toEqual(new Set(['kruemel']));
    expect(chats('tippi')).toEqual(new Set(['fluestern']));
    for (const name of ['coups', 'kabbelei', 'kringel']) expect(chats(name), name).toEqual(new Set(['intern']));
    const speakers = (name: string) => new Set(strand(name).flatMap((s) => s.lines.map((l) => l.speaker)));
    expect(speakers('zaehlen')).toEqual(new Set(['kruemel']));
    expect(speakers('coups')).toEqual(new Set(['unbekannt', 'kruemel', 'ada']));
    expect(speakers('tippi')).toEqual(new Set(['juna', 'tippi']));
    expect(speakers('kabbelei')).toEqual(new Set(['juna', 'unbekannt', 'kruemel']));
    expect(speakers('kringel')).toEqual(new Set(['ada']));
    for (const s of sides) expect(s.lines.some((l) => l.speaker === 'benno'), s.id).toBe(false);
    // in jeder Tippi-Szene genau eine Korrektur einer Juna-Zeile
    for (const s of strand('tippi')) expect(s.lines.map((l) => [l.speaker, !!l.strike]), s.id).toEqual([['juna', false], ['tippi', true]]);
    // die längste Nebenszene hat vier Nachrichten
    expect(Math.max(...sides.map((s) => s.lines.length))).toBe(4);
  });

  it('Auslöser wie in der Tabelle des Drehbuchs, jede Bedingung nennt eine vorhandene Haupt-Szene', () => {
    for (const s of strand('zaehlen')) expect(trig(s), s.id).toEqual({ on: 'side', strand: 'zaehlen', order: trig(s).order, fromLesson: 'm6-l1' });
    for (const s of strand('coups')) expect(trig(s), s.id).toMatchObject({ fromLesson: 'm6-l2', afterScene: 'a6-l2-s50', untilLesson: 'm6-l4' });
    for (const s of strand('tippi')) expect(trig(s), s.id).toMatchObject({ fromLesson: 'm6-l3', afterScene: 'a6-l3-brief' });
    for (const s of strand('kabbelei')) expect(trig(s), s.id).toMatchObject({ fromLesson: 'm6-l3', afterScene: 'a6-l3-done' });
    for (const s of strand('kringel')) expect(trig(s), s.id).toMatchObject({ fromLesson: 'm6-l4', afterScene: 'a6-l4-s50' });
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
  const strandOf = (list: string[], name: string) => list.filter((id) => id.startsWith(`a6-side-${name}-`));

  it('`coups` beginnt erst nach `a6-l2-s50` und endet mit Auftrag 4: „???“ erzählt vor dem Einsatz', () => {
    expect(strandOf(run('m6-l2', ['m6-l1'], []), 'coups')).toEqual([]);
    expect(strandOf(run('m6-l2', ['m6-l1'], ['a6-l2-s50']), 'coups')).toHaveLength(3);
    expect(strandOf(run('m6-l4', ['m6-l1', 'm6-l2', 'm6-l3'], ['a6-l2-s50']), 'coups')).toHaveLength(3);
    expect(strandOf(run('m6-l4', ['m6-l1', 'm6-l2', 'm6-l3', 'm6-l4'], ['a6-l2-s50']), 'coups')).toEqual([]);
  });

  it('`tippi` kommt erst nach `a6-l3-brief`, `kabbelei` erst nach `a6-l3-done`, `kringel` erst nach `a6-l4-s50`', () => {
    expect(strandOf(run('m6-l3', ['m6-l1', 'm6-l2'], []), 'tippi')).toEqual([]);
    expect(strandOf(run('m6-l3', ['m6-l1', 'm6-l2'], ['a6-l3-brief']), 'tippi')).toHaveLength(3);
    expect(strandOf(run('m6-l3', ['m6-l1', 'm6-l2'], ['a6-l3-brief']), 'kabbelei')).toEqual([]);
    expect(strandOf(run('m6-l4', ['m6-l1', 'm6-l2', 'm6-l3'], ['a6-l3-brief', 'a6-l3-done']), 'kabbelei')).toHaveLength(3);
    expect(strandOf(run('m6-l4', ['m6-l1', 'm6-l2', 'm6-l3'], []), 'kringel')).toEqual([]);
    expect(strandOf(run('m6-l4', ['m6-l1', 'm6-l2', 'm6-l3'], ['a6-l4-s50']), 'kringel')).toHaveLength(3);
  });
});

describe('Akt 6: Belohnungen', () => {
  const rewards = AKT6.rewards;
  const scene = (id: string) => rewards.find((s) => s.id === id)!;

  it('vier Szenen mit Kennung, Auslöser, Chat und Ding wie im Drehbuch', () => {
    expect(rewards.map((s) => [s.id, s.chat, s.trigger, s.gives])).toEqual([
      ['a6-gift-epauletten', 'intern', { on: 'briefing', lessonId: 'm6-l1' }, ['epaulets']],
      ['a6-gift-manschetten', 'intern', { on: 'stage', lessonId: 'm6-l4', at: 0.5 }, ['cuffs']],
      ['a6-gift-sandalen', 'juna', { on: 'exam', moduleId: 'm6' }, ['sandals']],
      ['a6-badge-zahlen', 'kruemel', { on: 'badge', badgeId: 'zahlen' }, ['socks']],
    ]);
    for (const s of rewards) expect(s.gift, s.id).toBe(true);
  });

  it('Sprecher und Sätze: Ada die Epauletten, „???“ die Manschetten, Juna (mit Zwinkern) die Sandalen; Zettel ohne Emoji', () => {
    expect(scene('a6-gift-epauletten').lines[0]).toMatchObject({ speaker: 'ada', text: 'Epauletten. Für alle, die zählen können. Die Sterne hab ich abgemacht. Du zählst nur mit dir.' });
    expect(scene('a6-gift-manschetten').lines[0]).toMatchObject({ speaker: 'unbekannt', text: 'Manschetten, meine Lieben. Nicht gestohlen: gekauft. Quittung anbei. Rechnen mit sauberen Ärmeln.' });
    expect(scene('a6-gift-sandalen').lines[0]).toMatchObject({ speaker: 'juna', text: "Vom Kiosk: SANDALEN. Für flinke Füße und kühle Zehen. Mama sagt, im Tresor zieht's nicht. Egal. 😉" });
    expect(ITEMS.find((i) => i.id === 'sandals')!.description).not.toContain('😉');
  });

  it('Reihenfolge: Epauletten nach dem Briefing von Auftrag 1, Manschetten nach `a6-l4-s50`, Sandalen nach `a6-exam-after`', () => {
    const order = ALL_STORY.scenes.map((s) => s.id);
    expect(order.indexOf('a6-gift-epauletten')).toBeGreaterThan(order.indexOf('a6-l1-brief'));
    expect(order.indexOf('a6-gift-manschetten')).toBeGreaterThan(order.indexOf('a6-l4-s50'));
    expect(order.indexOf('a6-gift-sandalen')).toBeGreaterThan(order.indexOf('a6-exam-after'));
  });

  it('Abzeichen „Zahlen gesichert“ (Fortschritt) mit Paket von Kringel und dem Zettel für die Hohen Socken', () => {
    const b = BADGES.find((x) => x.id === 'zahlen')!;
    expect([b.title, b.category, b.icon, b.description]).toEqual(['Zahlen gesichert', 'fortschritt', '1-0', 'Den sechsten Einsatz bestanden.']);
    const texts = scene('a6-badge-zahlen').lines.map((l) => l.text);
    expect(texts).toEqual([
      'Zahlen gesichert! Alle zehn, von 1 bis 0. Beide Hände, einmal hoch. ⚡',
      'Postbote Kringel: „Paket für {vorname}. Von der Backstube. Agent Kringel hat es gezählt. Dreimal.“',
      'Im Paket: Hohe Socken. Auf dem Zettel steht: „Für den Tresorraum, es zieht.“',
    ]);
  });
});
