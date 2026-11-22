// Besonderheiten von Akt 7 „Sonderzeichen“: Modul, Wortliste, Beschriftung, Einsatz-Story, Story-Objekte, Haupt-Szenen, Dinge, Abschlussakte, Prüfprofil.
// Alles, was für jeden Akt gilt, steht in course.test.ts, story.test.ts und rewards.test.ts und liest das Prüfprofil `check` des Bündels.

import { describe, expect, it } from 'vitest';
import { findModule } from '../domain/course.ts';
import type { Choice, Line } from '../domain/dialog.ts';
import { examStory, fallakte, moduleLabel } from '../domain/book.ts';
import { isTypeable, keystrokeFor, learnKey } from '../domain/keyboard.ts';
import { isSpecial } from '../domain/textGenerator.ts';
import { logScenes } from '../domain/scenes.ts';
import { nextSideScene } from '../domain/story.ts';
import { RULES } from '../app/rules.ts';
import { mastered, profile } from '../test/factories.ts';
import { objectOf, stageAt } from '../domain/storyObject.ts';
import { ALL_COURSE, ALL_STORY, sceneLines } from '../test/content.ts';
import { ITEMS } from './items.ts';
import { COURSE } from './course.ts';
import { ACTS, STAGED_ACTS } from './story/acts.ts';
import { BADGES } from './badges.ts';
import { AKT7 } from './story/akt7/index.ts';
import { WORDS_SONDERZEICHEN } from './words.de.ts';

const m1 = findModule(ALL_COURSE, 'm1');
const m7 = findModule(ALL_COURSE, 'm7');

describe('Akt 7: Gerüst', () => {
  it('ist im Spiel (ACTS, COURSE) als letzter Akt; 18 Haupt-Szenen, 15 Nebenszenen, 5 Belohnungen, kein Extra-Fall', () => {
    expect(STAGED_ACTS).toEqual([]);
    expect(ACTS.at(-1)).toBe(AKT7);
    expect(ACTS).toHaveLength(7);
    expect(COURSE.modules.map((m) => m.id).at(-1)).toBe('m7');
    expect(ALL_COURSE.modules.map((m) => m.id)).toEqual(COURSE.modules.map((m) => m.id));
    expect(AKT7.chat).toHaveLength(18);
    expect(AKT7.side).toHaveLength(15);
    expect(AKT7.rewards).toHaveLength(5);
    for (const list of [AKT7.cases, AKT7.caseScenes]) expect(list).toEqual([]);
  });

  it('drei Aufträge mit den neun Zeichen der AltGr-Ebene; Schwellen wie in Akt 1; Beschriftung „Akt 7 · Das Finale“', () => {
    expect(m7.title).toBe('Sonderzeichen');
    expect(m7.lessons.map((l) => [l.id, l.title, l.newKeys.join(' ')])).toEqual([
      ['m7-l1', 'Ottis Preisliste', '@ €'],
      ['m7-l2', 'Der Schaltplan', '{ [ ] }'],
      ['m7-l3', 'Abschaltfolge', '\\ ~ |'],
    ]);
    expect(m7.mastery).toEqual(m1.mastery);
    expect(moduleLabel(ALL_STORY, 'm7')).toEqual({ act: 'Akt 7', place: 'Das Finale' });
  });

  it('jedes der neun Zeichen ist seine eigene Lerneinheit (eigenes Siegel), tippbar und liegt auf der AltGr-Ebene', () => {
    const keys = m7.lessons.flatMap((l) => l.newKeys);
    expect(keys).toHaveLength(9);
    for (const k of keys) {
      expect(isSpecial(k), k).toBe(true);
      expect(learnKey(k), k).toBe(k);
      expect(isTypeable(k), k).toBe(true);
      expect(keystrokeFor(k)?.altGr, k).toBe(true);
    }
  });

  it('Wortliste: kleingeschrieben, nur Buchstaben (Sonderzeichen stehen in ihren Rollen), ohne Doppelte', () => {
    expect(m7.words).toBe(WORDS_SONDERZEICHEN);
    for (const w of WORDS_SONDERZEICHEN) expect(w, w).toMatch(/^[a-zäöüß]+$/);
    expect(new Set(WORDS_SONDERZEICHEN).size).toBe(WORDS_SONDERZEICHEN.length);
  });

  it('Einsatz strikt mit allen gelernten Tasten und Tempo-Ziel 60', () => {
    expect(m7.exam).toEqual({ minAccuracy: 0.92, minApm: 60, durationSec: 60, keys: 'learned' });
    expect(m7.exam.mode).toBeUndefined();
  });

  it('Prüfprofil: letzter Akt, also keine Spoiler und kein revealFrom; je Auftrag eine getippte Antwort', () => {
    expect(AKT7.check).toEqual({
      typed: [
        { lessonId: 'm7-l1', word: 'otti@tippnix' },
        { lessonId: 'm7-l2', word: '{stopp}' },
        { lessonId: 'm7-l3', word: 'Zwei sind ein Anfang.' },
      ],
      spoilers: [],
    });
    expect(AKT7.check.revealFrom).toBeUndefined();
    expect(AKT7.fallaktenDamage).toBeUndefined();
  });

  it('Abschlussakte: Titel, Kopfzeile und Einsatz-Zeilen', () => {
    const f = fallakte(ALL_STORY, 'm7')!;
    expect([f.title, f.header]).toEqual(['Abschlussakte', 'Zwanzig Jahre, zwei Finger, zehn. Ende, sagt Hubbel. Anfang, sage ich.']);
    expect(f.firewall).toEqual({ passed: 'Das Duell: alle Zeilen gehalten, die Maschinen stehen', backdoor: 'Das Duell: Benno zog den Stecker – Einsatz nachholen' });
  });
});

describe('Akt 7: Einsatz „Das Duell“', () => {
  const exam = examStory(ALL_STORY, 'm7');

  it('Titel, Ausgänge, Segmente, Rahmen, Ziel-Spruch und vier Sprüche; die Gegenstimme ist der Lautsprecher', () => {
    expect([exam.title, exam.won, exam.lost, exam.segments, exam.frame]).toEqual(['Einsatz: Das Duell', 'Maschinen stehen!', 'Überschrieben', 'Duell: {n} von {gesamt} Zeilen gehalten', 'Duell-Zeilen']);
    expect(exam.ready).toBe('Inventur Inventur Zehn Finger frisch Schätzchen Fertig');
    expect(exam.taunts).toHaveLength(4);
    expect(exam.voice).toBe('speaker');
  });

  it('Intro, Erfolg und Hintertür spielen in der Zentrale; Juna und Benno sind im Bilderbuch dabei, Otti ist nie Sprecherin', () => {
    for (const lines of [exam.intro, exam.success, exam.backdoorTaken]) expect(lines[0]?.scene).toBe('zentrale');
    const speakers = new Set([...exam.intro, ...exam.success, ...exam.backdoorTaken].map((l) => l.speaker));
    expect(speakers).toContain('juna');
    expect(speakers).toContain('benno');
    expect(speakers).not.toContain('baron');
    expect(exam.fail[0]?.text).toContain('{prozent}');
  });

  it('Antworten: im Intro `abschalten`, `staedte` und `brille` (nur mit der Blindflug-Brille), im Erfolg `schild` und `maschine4`', () => {
    const ids = (lines: typeof exam.intro) => lines.flatMap((l) => (l.choices ?? []).map((c) => c.id));
    expect(ids(exam.intro)).toEqual(['abschalten', 'staedte', 'brille']);
    expect(exam.intro.flatMap((l) => l.choices ?? []).map((c) => c.needs)).toEqual([undefined, undefined, 'blindflug-brille']);
    expect(ids(exam.success)).toEqual(['schild', 'maschine4']);
  });
});

describe('Akt 7: Story-Objekte', () => {
  const lines = (lessonId: string, at: number) => stageAt(objectOf(ALL_STORY.objects, lessonId)!, at).lines;

  it('drei Objekte als Text-Zeilen (ohne Bilder), je Auftrag eins, mit den Stufen 0/25/50/75/100', () => {
    expect(AKT7.objects.map((o) => [o.lessonId, o.title, o.kind])).toEqual([
      ['m7-l1', 'Ottis Preisliste', 'lines'],
      ['m7-l2', 'Der Schaltplan', 'lines'],
      ['m7-l3', 'Der Abschaltbefehl', 'lines'],
    ]);
    for (const o of AKT7.objects) expect(o.stages.map((s) => s.at)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('Preisliste: Städte ohne Preise, dann kommt je Stufe ein Preis zurück, zuletzt Adresse und „gesucht“', () => {
    expect(lines('m7-l1', 0)).toEqual(['TIPPNIX – BALD AUCH IN IHRER STADT', 'Bad Qwertz: __ im Monat', 'Nebelhausen: __ im Monat', 'Tastow: __ im Monat', 'Zehn Finger, frisch: ?']);
    // Überschrift und „Zehn Finger, frisch: ?“ stehen in jeder Stufe (`a7-l1-s75` und die Abschlussakte nennen beides)
    expect(lines('m7-l1', 0.25)).toEqual(['TIPPNIX – BALD AUCH IN IHRER STADT', 'Bad Qwertz: 10 € im Monat', 'Zehn Finger, frisch: ?']);
    expect(lines('m7-l1', 0.75)).toEqual(['TIPPNIX – BALD AUCH IN IHRER STADT', 'Bad Qwertz: 10 € im Monat', 'Nebelhausen: 12 € im Monat', 'Tastow: 15 € im Monat', 'Zehn Finger, frisch: ?']);
    expect(lines('m7-l1', 1)?.[0]).toBe('TIPPNIX – BALD AUCH IN IHRER STADT');
    expect(lines('m7-l1', 1)?.slice(-2)).toEqual(['Bestellen: otti@tippnix', 'Zehn Finger, frisch: gesucht']);
  });

  it('Schaltplan: vier Maschinen, die Klammern schließen die Kreise, zuletzt „Alle Kreise geschlossen“', () => {
    expect(lines('m7-l2', 0)?.[0]).toBe('SCHALTPLAN TIPPNIX');
    expect(lines('m7-l2', 0.5)).toEqual(['Maschine 1: {Zeichen → Röhre}', 'Maschine 2: [Zeichen → Röhre]']);
    expect(lines('m7-l2', 1)?.slice(-2)).toEqual(['Maschine 4: [Chat → lernt] → Tippi', 'Alle Kreise geschlossen']);
  });

  it('Abschaltbefehl: vier Zeilen mit Lücken, dann `\\stopp ~maschineN | aus` je Stufe, zuletzt „Folge: vollständig“', () => {
    expect(lines('m7-l3', 0)).toEqual(['ABSCHALTFOLGE', '__stopp __maschine1 __ aus', '__stopp __maschine2 __ aus', '__stopp __maschine3 __ aus', '__stopp __maschine4 __ aus']);
    expect(lines('m7-l3', 0.25)).toEqual(['\\stopp ~maschine1 | aus']);
    expect(lines('m7-l3', 1)).toEqual(['\\stopp ~maschine1 | aus', '\\stopp ~maschine2 | aus', '\\stopp ~maschine3 | aus', '\\stopp ~maschine4 | aus', 'Folge: vollständig']);
  });
});

describe('Akt 7: Haupt-Szenen', () => {
  const scene = (id: string) => AKT7.chat.find((s) => s.id === id)!;
  const linesOf = (id: string) => sceneLines(scene(id).lines, scene(id).chat);
  /** alle Antworten einer Szene, auch verschachtelte (in Reaktionen) */
  const choicesOf = (lines: readonly Line[]): Choice[] => lines.flatMap((l) => (l.choices ?? []).flatMap((c) => [c, ...choicesOf(c.reply ?? [])]));
  const ids = AKT7.chat.map((s) => s.id);

  it('18 Haupt-Szenen: Anfang, je Auftrag Briefing, drei Stufen und Abschluss, nach dem Einsatz, das Fest', () => {
    expect(ids).toEqual([
      'a7-start',
      ...['l1', 'l2', 'l3'].flatMap((l) => ['brief', 's25', 's50', 's75', 'done'].map((k) => `a7-${l}-${k}`)),
      'a7-exam-after',
      'a7-fest',
    ]);
    expect(scene('a7-start').trigger).toEqual({ on: 'briefing', lessonId: 'm7-l1' });
    expect(ids.indexOf('a7-start')).toBeLessThan(ids.indexOf('a7-l1-brief'));
    for (const id of ['a7-exam-after', 'a7-fest']) expect(scene(id).trigger, id).toEqual({ on: 'exam', moduleId: 'm7' });
    expect(ids.indexOf('a7-exam-after')).toBeLessThan(ids.indexOf('a7-fest'));
    expect(scene('a7-fest').gift).toBeUndefined();
  });

  it('alle Szenen in ZEHN intern, `a7-fest` im Chat Juna: dort schreibt nur Juna', () => {
    for (const s of AKT7.chat.filter((x) => x.id !== 'a7-fest')) expect(s.chat, s.id).toBe('intern');
    expect(scene('a7-fest').chat).toBe('juna');
    expect(new Set(linesOf('a7-fest').filter(({ line }) => line.speaker !== 'player').map(({ line }) => line.speaker))).toEqual(new Set(['juna']));
  });

  it('getippte Antworten: je Abschluss eine, allein an ihrer Zeile; `adresse`, `stopp`, `anfang`', () => {
    const typed = AKT7.module.lessons.map((l) => {
      const cs = choicesOf(scene(`a7-${l.id.slice(3)}-done`).lines).filter((c) => c.typed);
      expect(cs, l.id).toHaveLength(1);
      const c = cs[0]!;
      const line = scene(`a7-${l.id.slice(3)}-done`).lines.find((x) => x.choices?.includes(c))!;
      expect(line.choices, l.id).toHaveLength(1);
      expect(c.text, l.id).toBe(c.typed);
      return { lessonId: l.id, word: c.typed!, id: c.id, label: c.label };
    });
    expect(typed).toEqual([
      { lessonId: 'm7-l1', word: 'otti@tippnix', id: 'adresse', label: 'otti@tippnix' },
      { lessonId: 'm7-l2', word: '{stopp}', id: 'stopp', label: '{stopp}' },
      { lessonId: 'm7-l3', word: 'Zwei sind ein Anfang.', id: 'anfang', label: 'Adas Satz' },
    ]);
    expect(AKT7.check.typed).toEqual(typed.map(({ lessonId, word }) => ({ lessonId, word })));
  });

  it('Mini-Tastatur in den Briefings: Alt Gr plus die Tasten der Zeichen, genau eine Zeile je Briefing', () => {
    const keyLines = (id: string) => scene(id).lines.filter((l) => l.keys).map((l) => l.keys);
    expect(keyLines('a7-l1-brief')).toEqual([['AltRight', 'KeyQ', 'KeyE']]);
    expect(keyLines('a7-l2-brief')).toEqual([['AltRight', 'Digit7', 'Digit8', 'Digit9', 'Digit0']]);
    expect(keyLines('a7-l3-brief')).toEqual([['AltRight', 'Minus', 'BracketRight', 'IntlBackslash']]);
  });

  it('Tippi korrigiert genau zweimal (`a7-l2-s25` Krümel, `a7-l2-s75` Benno) und ist ab `a7-l2-done` still', () => {
    const tippi = AKT7.chat.flatMap((s) => sceneLines(s.lines, s.chat).filter(({ line }) => line.speaker === 'tippi').map(({ line }) => [s.id, line.strike] as const));
    expect(tippi).toEqual([
      ['a7-l2-s25', 'Wieder frei'],
      ['a7-l2-s75', 'Ich lerne noch'],
    ]);
    // `{stopp}` wirkt: Krümel nennt Tippi in `a7-l3-s50` still
    expect(linesOf('a7-l3-s50').some(({ line }) => line.text.includes('Tippi: still'))).toBe(true);
  });

  it('Systemzeilen „Benno tippt …“ in `a7-l2-done` und `a7-l3-s50`; Benno schreibt als `benno`, nie als Baron', () => {
    for (const id of ['a7-l2-done', 'a7-l3-s50']) expect(scene(id).lines.some((l) => l.speaker === 'system' && l.text === 'Benno tippt …'), id).toBe(true);
    const speakers = new Set(AKT7.chat.flatMap((s) => sceneLines(s.lines, s.chat).map(({ line }) => line.speaker)));
    expect(speakers).toContain('benno');
    for (const forbidden of ['baron', 'unbekannt']) expect(speakers).not.toContain(forbidden);
  });

  it('Echos: `a7-start` auf `a6-exam-after`, die Vertrauens-Wahl in `a7-l1-s25`, drei verschiedene Szenen ohne Gadget', () => {
    const echoes = AKT7.chat.flatMap((s) => s.lines.filter((l) => l.ifPicked).map((l) => `${s.id} ← ${l.ifPicked!.scene}/${l.ifPicked!.choice}`));
    expect(echoes).toEqual([
      'a7-start ← a6-exam-after/lehrer',
      'a7-start ← a6-exam-after/benno',
      'a7-start ← a6-exam-after/monokel',
      'a7-start ← a6-exam-after/null',
      'a7-l1-s25 ← a6-l3-done/ja',
      'a7-l1-s25 ← a6-l3-done/beweisen',
      'a7-l1-s75 ← a6-exam-after/monokel',
      'a7-l3-s25 ← a6-l2-s50/bestohlen',
    ]);
    // kein Echo trägt ein Story-Objekt; `{gruss}` nur in `a7-start`
    for (const s of AKT7.chat) for (const l of s.lines.filter((x) => x.ifPicked)) expect(l.object, s.id).toBeUndefined();
    const withGruss = AKT7.chat.filter((s) => linesOf(s.id).some(({ line }) => line.text.includes('{gruss}'))).map((s) => s.id);
    expect(withGruss).toEqual(['a7-start']);
  });

  it('Gadget-Antworten: Monokel, Dechiffrierscheibe, Brille in `a7-l3-brief`, Lupe; die Brille im Einsatz-Intro', () => {
    const needs = AKT7.chat.flatMap((s) => choicesOf(s.lines).filter((c) => c.needs).map((c) => [s.id, c.id, c.needs]));
    expect(needs).toEqual([
      ['a7-l1-brief', 'monokel', 'bennos-monokel'],
      ['a7-l2-brief', 'scheibe', 'dechiffrierscheibe'],
      ['a7-l3-brief', 'brille', 'blindflug-brille'],
      ['a7-exam-after', 'lupe', 'lupe'],
    ]);
  });

  it('Blindflug-Brille: Gadget mit Zettel, überreicht von Ada in `a7-l2-brief`', () => {
    const gadget = ITEMS.find((i) => i.id === 'blindflug-brille')!;
    expect(gadget).toMatchObject({ name: 'Blindflug-Brille', kind: 'gadget', source: { scene: 'a7-l2-brief' } });
    expect(gadget.description).toBe('Gläser schwarz, Blick nach vorn. Wer die Tasten nicht sieht, sucht sie nicht. Von Frau Hubbel.');
    expect(scene('a7-l2-brief').gives).toEqual(['blindflug-brille']);
    expect(scene('a7-l2-brief').lines.find((l) => l.item === 'blindflug-brille')?.speaker).toBe('ada');
  });

  it('Beweisstücke von Akt 7 im Beweisfach: Preisliste und Schaltplan (mit Objekt), Abdruck, Zylinder, ganzes Foto, Lieferwagen', () => {
    const pieces = ITEMS.find((i) => i.id === 'beweisfach')!.pieces!.filter((p) => p.scene.startsWith('a7-'));
    expect(pieces.map((p) => [p.id, p.scene, p.picture, p.object])).toEqual([
      ['preisliste', 'a7-l1-s25', 'preisliste', 'm7-l1'],
      ['abdruck', 'a7-l1-s75', 'abdruck', undefined],
      ['schaltplan', 'a7-l2-done', 'schaltplan', 'm7-l2'],
      ['zylinder', 'a7-l3-s25', 'zylinder', undefined],
      ['foto-ganz', 'a7-exam-after', 'foto-ganz', undefined],
      ['lieferwagen', 'a7-exam-after', 'lieferwagen', undefined],
    ]);
    // die Karte „TIPPNIX – Nie wieder“ steht ohne Goldrand mit dem Bild an derselben Zeile
    const wagen = scene('a7-exam-after').lines.find((l) => l.picture === 'lieferwagen')!;
    expect(wagen.card).toEqual({ title: 'Der Lieferwagen', text: 'TIPPNIX – Nie wieder' });
    expect(scene('a7-l1-s75').lines.find((l) => l.picture === 'abdruck')?.speaker).toBe('juna');
  });

  it('Adas Satz: Kurzform „Adas Satz“, Bennos Reaktion folgt', () => {
    const anfang = choicesOf(scene('a7-l3-done').lines).find((c) => c.id === 'anfang')!;
    expect(anfang.label).toBe('Adas Satz');
    expect(anfang.reply?.[0]?.speaker).toBe('benno');
  });
});

describe('Akt 7: Abschlussakte', () => {
  const f = AKT7.fallakte;
  const hits = (list: readonly { ifPicked?: { scene: string; choice: string | null } }[]) => list.filter((e) => e.ifPicked).map((e) => `${e.ifPicked!.scene}/${e.ifPicked!.choice}`);

  it('gelöst: sieben Zeilen mit vier Bildern, dazu dreizehn Taten des Kindes (die Otti-Antwort in fünf Wegen) aus allen sieben Akten', () => {
    const plain = f.solved.filter((e) => !e.ifPicked);
    expect(plain).toHaveLength(7);
    expect(plain.map((e) => e.picture)).toEqual(['preisliste', undefined, 'abdruck', undefined, undefined, 'lieferwagen', 'foto-ganz']);
    expect(hits(f.solved)).toEqual([
      'l5-s75/zylinder',
      'a2-l5-s75/lieben',
      'a3-l1-done/komm',
      'a3-l5-s75/keks',
      'a4-l2-s50/aufkleber',
      'a5-l3-s50/freund',
      'a6-l3-s50/otti',
      'a6-l3-s50/otti-2',
      'a6-l3-s50/otti-2b',
      'a6-l3-s50/otti-3',
      'a6-l3-s50/otti-3b',
      'a6-l3-done/ja',
      'a6-l3-done/beweisen',
      'a7-l1-s50/staedte',
      'a7-l2-s50/lernt',
      'a7-l3-s50/fuerada',
      'a7-fest/klar',
    ]);
    // Szenen aus Akt 1 (Kennung ohne Präfix) bis Akt 7
    const acts = new Set(hits(f.solved).map((h) => /^a(\d)-/.exec(h)?.[1] ?? '1'));
    expect([...acts].sort()).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });

  it('drei offene Zeilen, drei Verdächtige mit je einer Treffer-Zeile (Otti: je Weg an der Spurenwand), Krümels Schlusssatz', () => {
    expect(f.open).toHaveLength(3);
    expect(f.suspects.map((s) => [s.name, s.status, hits(s.hits)])).toEqual([
      ['Otti Korrekt', 'ueberfuehrt', ['a6-l3-s50/otti', 'a6-l3-s50/otti-2', 'a6-l3-s50/otti-2b', 'a6-l3-s50/otti-3', 'a6-l3-s50/otti-3b']],
      ['Tippi', 'entlastet', ['a7-l2-s50/lernt']],
      ['Benno', 'entlastet', ['a7-l3-done/anfang']],
    ]);
    expect(f.closing).toBe('Alle Tasten, alle Zeichen, alle deine. Ich bin ZEHN. Du auch. Piep.');
  });

  it('keine vierstellige Zahl, kein Datum, kein Emoji', () => {
    const texts = [f.header, f.closing, ...[...f.solved, ...f.open].map((e) => e.text), ...f.suspects.flatMap((s) => [s.text, ...s.hits.map((h) => h.text)])];
    for (const t of texts) {
      expect(t, t).not.toMatch(/\d{4}/);
      expect(t, t).not.toMatch(/\d{1,2}\.\s?\d{1,2}\./);
      expect(t, t).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });
});

describe('Akt 7: Nebenszenen', () => {
  const sides = AKT7.side;
  const trig = (s: (typeof sides)[number]) => s.trigger as { strand: string; order: number; fromLesson: string; untilLesson?: string; afterScene?: string };
  const strand = (name: string) => sides.filter((s) => trig(s).strand === name).sort((a, b) => trig(a).order - trig(b).order);
  const ids = new Set(ALL_STORY.scenes.map((s) => s.id));
  const STRANDS = ['team', 'lollis', 'festrede', 'benno-tippt', 'pit'];

  it('fünf Stränge zu je drei Szenen mit `a7-side-`-Kennung, alle ab einem Auftrag von Akt 7, ohne Varianten; keine verschenkt etwas', () => {
    expect(new Set(sides.map((s) => trig(s).strand))).toEqual(new Set(STRANDS));
    expect(sides).toHaveLength(15);
    for (const s of sides) {
      expect(s.id.startsWith('a7-side-'), s.id).toBe(true);
      expect(m7.lessons.map((l) => l.id), s.id).toContain(trig(s).fromLesson);
      expect(s.trigger, s.id).not.toHaveProperty('untilCase');
      expect(s.trigger, s.id).not.toHaveProperty('afterCase');
      expect(s.gives, s.id).toBeUndefined();
    }
    for (const name of STRANDS) expect(strand(name).map((s) => trig(s).order), name).toEqual([1, 2, 3]);
  });

  it('Chats und Sprecher: Krümel allein im Chat Krümel, Juna allein im Chat Juna, Tippi und Otti nie, Benno als `benno`', () => {
    const chats = (name: string) => new Set(strand(name).map((s) => s.chat));
    expect(chats('lollis')).toEqual(new Set(['kruemel']));
    expect(chats('pit')).toEqual(new Set(['juna']));
    for (const name of ['team', 'festrede', 'benno-tippt']) expect(chats(name), name).toEqual(new Set(['intern']));
    const speakers = (name: string) => new Set(strand(name).flatMap((s) => s.lines.map((l) => l.speaker)));
    expect(speakers('lollis')).toEqual(new Set(['kruemel']));
    expect(speakers('pit')).toEqual(new Set(['juna']));
    expect(speakers('team')).toEqual(new Set(['kruemel', 'juna', 'benno', 'ada']));
    expect(speakers('festrede')).toEqual(new Set(['ada', 'kruemel', 'juna']));
    expect(speakers('benno-tippt')).toEqual(new Set(['system', 'benno', 'juna', 'ada', 'kruemel']));
    for (const s of sides) {
      expect(s.lines.some((l) => l.speaker === 'tippi' || l.strike), s.id).toBe(false);
      expect(s.lines.length, s.id).toBeLessThanOrEqual(4);
    }
    // die Systemzeile steht in der ersten Szene von Bennos Tippfortschritt
    expect(strand('benno-tippt')[0]!.lines[0]).toMatchObject({ speaker: 'system', text: 'Benno tippt …' });
  });

  it('Auslöser wie in der Tabelle des Drehbuchs, jede Bedingung nennt eine vorhandene Haupt-Szene', () => {
    for (const s of strand('team')) {
      const expected = { on: 'side', strand: 'team', order: trig(s).order, fromLesson: 'm7-l1' };
      // die zweite Szene setzt den Zylinder im Fach voraus, der erst in Auftrag 3 (`a7-l3-s25`) dorthin kommt
      expect(trig(s), s.id).toEqual(s.id === 'a7-side-team-2' ? { ...expected, afterScene: 'a7-l3-s25' } : expected);
    }
    for (const s of strand('lollis')) expect(trig(s), s.id).toMatchObject({ fromLesson: 'm7-l1', afterScene: 'a7-l1-s50' });
    for (const s of strand('festrede')) expect(trig(s), s.id).toEqual({ on: 'side', strand: 'festrede', order: trig(s).order, fromLesson: 'm7-l2' });
    for (const s of strand('benno-tippt')) expect(trig(s), s.id).toMatchObject({ fromLesson: 'm7-l2', afterScene: 'a7-l2-s25' });
    for (const s of strand('pit')) expect(trig(s), s.id).toEqual({ on: 'side', strand: 'pit', order: trig(s).order, fromLesson: 'm7-l3' });
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
  const strandOf = (list: string[], name: string) => list.filter((id) => id.startsWith(`a7-side-${name}-`));

  it('`lollis` kommt erst nach `a7-l1-s50`, `benno-tippt` erst nach `a7-l2-s25`, `pit` erst in Auftrag 3', () => {
    expect(strandOf(run('m7-l1', [], []), 'lollis')).toEqual([]);
    expect(strandOf(run('m7-l1', [], ['a7-l1-s50']), 'lollis')).toHaveLength(3);
    expect(strandOf(run('m7-l2', ['m7-l1'], []), 'benno-tippt')).toEqual([]);
    expect(strandOf(run('m7-l2', ['m7-l1'], ['a7-l2-s25']), 'benno-tippt')).toHaveLength(3);
    expect(strandOf(run('m7-l2', ['m7-l1'], []), 'pit')).toEqual([]);
    expect(strandOf(run('m7-l3', ['m7-l1', 'm7-l2'], []), 'pit')).toHaveLength(3);
    // `team` beginnt im ersten Durchgang; die zweite Szene (Benno und der Zylinder im Fach) wartet auf `a7-l3-s25`
    expect(strandOf(run('m7-l1', [], []), 'team')).toEqual(['a7-side-team-1']);
    expect(strandOf(run('m7-l3', ['m7-l1', 'm7-l2'], []), 'team')).toEqual(['a7-side-team-1']);
    expect(strandOf(run('m7-l3', ['m7-l1', 'm7-l2'], ['a7-l3-s25']), 'team')).toHaveLength(3);
  });
});

describe('Akt 7: Belohnungen', () => {
  const rewards = AKT7.rewards;
  const scene = (id: string) => rewards.find((s) => s.id === id)!;

  it('fünf Szenen mit Kennung, Auslöser, Chat und Ding wie im Drehbuch; alle sind Geschenke', () => {
    expect(rewards.map((s) => [s.id, s.chat, s.trigger, s.gives])).toEqual([
      ['a7-gift-umhang', 'intern', { on: 'briefing', lessonId: 'm7-l1' }, ['cape']],
      ['a7-gift-dreispitz', 'intern', { on: 'stage', lessonId: 'm7-l2', at: 0.5 }, ['tricorne']],
      ['a7-gift-agentenstiefel', 'intern', { on: 'briefing', lessonId: 'm7-l3' }, ['agentboots']],
      ['a7-gift-gold', 'intern', { on: 'exam', moduleId: 'm7' }, ['colors-gold']],
      ['a7-badge-sonderzeichen', 'kruemel', { on: 'badge', badgeId: 'sonderzeichen' }, ['eyepatch']],
    ]);
    for (const s of rewards) expect(s.gift, s.id).toBe(true);
  });

  it('Sprecher und Sätze: Benno den Umhang, Juna den Dreispitz, Ada die Stiefel; Zettel ohne Emoji', () => {
    expect(scene('a7-gift-umhang').lines[0]).toMatchObject({ speaker: 'benno', text: 'Umhang. Fürs Finale darf es dramatisch sein. Meiner war weinrot. Deiner ist, was du willst.' });
    expect(scene('a7-gift-dreispitz').lines[0]).toMatchObject({ speaker: 'juna', text: 'Vom Kiosk: ein DREISPITZ. Der Abenteuerhut der Sonderzeichen. Stand seit Jahren rum. Jetzt nicht.' });
    expect(scene('a7-gift-agentenstiefel').lines[0]).toMatchObject({ speaker: 'ada', text: 'Von Frau Hubbel: Agentenstiefel. Fürs Finale, sagt sie. So weit getippt: Das verdient Stiefel.' });
    for (const id of ['cape', 'tricorne', 'agentboots', 'eyepatch', 'colors-gold']) expect(ITEMS.find((i) => i.id === id)!.description, id).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('Farbpaket „Gold“: Ada nach dem Einsatz, ihr Satz und der Zettel aus den Farben', () => {
    const texts = scene('a7-gift-gold').lines.map((l) => l.text);
    expect(texts).toEqual([
      'Gold. Für das O, das wieder hängt. Gold im Haar, Bernstein im Blick. Der Teig ist aufgegangen.',
      'Leder – für Kleidung. Haare in Gold, Sand. Augen in Bernstein.',
    ]);
    expect(scene('a7-gift-gold').lines.every((l) => l.speaker === 'ada')).toBe(true);
  });

  it('Reihenfolge: Umhang nach dem Briefing von Auftrag 1, Dreispitz nach `a7-l2-s50`, Gold nach `a7-exam-after` und `a7-fest`', () => {
    const order = ALL_STORY.scenes.map((s) => s.id);
    expect(order.indexOf('a7-gift-umhang')).toBeGreaterThan(order.indexOf('a7-l1-brief'));
    expect(order.indexOf('a7-gift-dreispitz')).toBeGreaterThan(order.indexOf('a7-l2-s50'));
    expect(order.indexOf('a7-gift-agentenstiefel')).toBeGreaterThan(order.indexOf('a7-l3-brief'));
    expect(order.indexOf('a7-gift-gold')).toBeGreaterThan(order.indexOf('a7-fest'));
  });

  it('Abzeichen „Sonderzeichen gesichert“ (Fortschritt) mit Paket von Kringel und dem Zettel für die Augenklappe', () => {
    const b = BADGES.find((x) => x.id === 'sonderzeichen')!;
    expect([b.title, b.category, b.icon, b.description]).toEqual(['Sonderzeichen gesichert', 'fortschritt', '@{}', 'Den siebten Einsatz bestanden.']);
    expect(scene('a7-badge-sonderzeichen').lines.map((l) => l.text)).toEqual([
      'Sonderzeichen gesichert! Alle Zeichen, alle Tasten, alle deine. ⚡',
      'Postbote Kringel: „Paket für {vorname}. Von der Backstube. Hab getanzt und es trotzdem getragen.“',
      'Im Paket: Augenklappe. Auf dem Zettel steht: „Blindflug-Training, Stufe zwei. Ein Auge reicht.“',
    ]);
  });
});
