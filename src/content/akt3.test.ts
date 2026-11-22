// Besonderheiten von Akt 3 „Untere Reihe“: Modul, Wortliste, Einsatz im Fluss-Modus, Einsatz-Story, Story-Objekte, Haupt-Szenen, Dinge und Fallakte.
// Alles, was für jeden Akt gilt, steht in course.test.ts, story.test.ts und rewards.test.ts und liest das Prüfprofil `check` des Bündels.

import { describe, expect, it } from 'vitest';
import { findModule, keysUpTo, lastLessonOf, moduleKeys } from '../domain/course.ts';
import { examStory, fallakte, moduleLabel } from '../domain/book.ts';
import { examTyping } from '../domain/examRun.ts';
import { RULES } from '../app/rules.ts';
import { caseTrainingKeys } from '../domain/progress.ts';
import { caseVisible } from '../domain/cases.ts';
import { logScenes } from '../domain/scenes.ts';
import { mastered, profile } from '../test/factories.ts';
import { createRng } from '../domain/rng.ts';
import { generateText, isPunctuation, usableWords } from '../domain/textGenerator.ts';
import { objectOf, stageAt } from '../domain/storyObject.ts';
import { ALL_COURSE, ALL_STORY } from '../test/content.ts';
import { COURSE } from './course.ts';
import { BADGES } from './badges.ts';
import { CLOTH, ITEMS } from './items.ts';
import { WARDROBE } from './wardrobe.ts';
import { AKT3 } from './story/akt3/index.ts';
import { nextSideScene } from '../domain/story.ts';
import { ACTS, STAGED_ACTS } from './story/acts.ts';
import { WORDS_UNTERE_REIHE } from './words.de.ts';

const m1 = findModule(ALL_COURSE, 'm1');
const m2 = findModule(ALL_COURSE, 'm2');
const m3 = findModule(ALL_COURSE, 'm3');

describe('Akt 3: Modul', () => {
  it('ist im Spiel (ACTS) nach Akt 2; Akt 4 und 5 folgen', () => {
    expect(STAGED_ACTS).not.toContain(AKT3);
    expect(ACTS[2]).toBe(AKT3);
    expect(COURSE.modules.map((m) => m.id).slice(0, 5)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
    expect(ALL_COURSE.modules.map((m) => m.id).slice(0, 5)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
  });

  it('fünf Aufträge mit den Tasten der unteren Reihe in dieser Reihenfolge; Schwellen wie in Akt 1 und 2', () => {
    expect(m3.lessons.map((l) => [l.id, l.title, l.newKeys.join('')])).toEqual([
      ['m3-l1', 'Nachtzug', 'nm'],
      ['m3-l2', 'Codekarte', 'c,'],
      ['m3-l3', 'Versteck', 'v.'],
      ['m3-l4', 'Bennos Akte', 'b-'],
      ['m3-l5', 'Die Keksbox', 'xy'],
    ]);
    expect(m3.mastery).toEqual(m1.mastery);
    expect(m3.mastery).toEqual(m2.mastery);
    expect(moduleLabel(ALL_STORY, 'm3')).toEqual({ act: 'Akt 3', place: 'U-Bahn und Stadtarchiv' });
  });

  it('Prüfprofil: je Auftrag ein getipptes Wort; Spoiler ohne `keks` (in Akt 3 gelöst)', () => {
    expect(AKT3.check.typed).toEqual([
      { lessonId: 'm3-l1', word: 'komm' },
      { lessonId: 'm3-l2', word: 'code' },
      { lessonId: 'm3-l3', word: 'vanille' },
      { lessonId: 'm3-l4', word: 'benno' },
      { lessonId: 'm3-l5', word: 'box' },
    ]);
    expect(AKT3.check.revealFrom).toBeUndefined();
    expect(AKT3.check.spoilers).toEqual(['tippnix', 'otti', 'neffe']);
  });

});

describe('Akt 3: Wortliste', () => {
  it('mindestens 80 verschiedene Wörter, ohne Satzzeichen im Wort', () => {
    expect(WORDS_UNTERE_REIHE.length).toBeGreaterThanOrEqual(80);
    expect(new Set(WORDS_UNTERE_REIHE).size).toBe(WORDS_UNTERE_REIHE.length);
    for (const w of WORDS_UNTERE_REIHE) expect([...w].some(isPunctuation), w).toBe(false);
  });

  it('je Auftrag mindestens 3 Wörter mit jeder neuen Buchstaben-Taste (auch y); Text zwischen Mindest- und Höchstlänge, nur gelernte Tasten', () => {
    const { minTextLength, maxTextLength } = COURSE.practice;
    for (const l of m3.lessons) {
      const allowed = keysUpTo(ALL_COURSE, l.id);
      const usable = usableWords(m3.words, allowed.filter((k) => !isPunctuation(k)));
      for (const k of l.newKeys.filter((x) => !isPunctuation(x))) expect(usable.filter((w) => w.includes(k)).length, `${l.id} ${k}`).toBeGreaterThanOrEqual(3);
      for (let seed = 1; seed <= 20; seed++) {
        const text = generateText({ allowed, focus: l.newKeys, words: m3.words, length: 40, rng: createRng(seed) });
        expect(text.length, `${l.id} Länge`).toBeGreaterThanOrEqual(minTextLength);
        expect(text.length, `${l.id} Länge`).toBeLessThanOrEqual(maxTextLength);
        expect([...text.replaceAll(' ', '')].every((c) => allowed.includes(c)), `${l.id} nur gelernte Tasten`).toBe(true);
      }
    }
  });

  it('die getippten Wörter komm, code, vanille, benno, box sind je im Abschluss ihres Auftrags tippbar', () => {
    for (const [id, word] of [['m3-l1', 'komm'], ['m3-l2', 'code'], ['m3-l3', 'vanille'], ['m3-l4', 'benno'], ['m3-l5', 'box']] as const) {
      expect([...word].every((c) => keysUpTo(ALL_COURSE, id).includes(c)), `${id} ${word}`).toBe(true);
    }
  });
});

describe('Akt 3: Einsatz im Fluss-Modus', () => {
  it('der Einsatz von m3 läuft im Fluss-Modus mit allen gelernten Tasten; m1 und m2 bleiben strikt', () => {
    expect(m3.exam).toEqual({ minAccuracy: 0.92, minApm: 50, durationSec: 60, keys: 'learned', mode: 'flow' });
    expect(examTyping(ALL_COURSE, 'm3', 1).mode).toBe('flow');
    expect(examTyping(ALL_COURSE, 'm1', 1).mode).toBe('strict');
    expect(examTyping(ALL_COURSE, 'm2', 1).mode).toBe('strict');
    expect(lastLessonOf(m3).id).toBe('m3-l5');
  });

  it('der Einsatz-Text liegt im Längenrahmen, enthält nur gelernte Tasten und im Lauf aller Seeds Komma, Punkt, Bindestrich, x und y', () => {
    const { minTextLength, maxTextLength } = COURSE.practice;
    const learned = keysUpTo(ALL_COURSE, 'm3-l5');
    const seen = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      const { text } = examTyping(ALL_COURSE, 'm3', seed);
      expect(text.length).toBeGreaterThanOrEqual(minTextLength);
      expect(text.length).toBeLessThanOrEqual(maxTextLength);
      expect([...text.replaceAll(' ', '')].every((c) => learned.includes(c))).toBe(true);
      for (const k of [',', '.', '-', 'x', 'y']) if (text.includes(k)) seen.add(k);
    }
    expect([...seen].sort()).toEqual([',', '-', '.', 'x', 'y']);
    expect(moduleKeys(m3)).toEqual(['n', 'm', 'c', ',', 'v', '.', 'b', '-', 'x', 'y']);
  });
});

describe('Akt 3: Einsatz-Story', () => {
  const e = examStory(ALL_STORY, 'm3');

  it('Datenflut mit Überschriften, Segment-Name und Bilderbuch-Hintergrund Tunnel', () => {
    expect([e.title, e.won, e.lost, e.frame]).toEqual(['Einsatz: Die Datenflut', 'Archiv gerettet!', 'Überflutet', 'Tunnel-Codes']);
    expect(e.segments).toBe('Datenflut: {n} von {gesamt} Tunneln dicht');
    expect(e.ready).toBe('Alles fließt, meine Lieben. Auch Ihre Fehler!');
    expect(e.taunts).toHaveLength(4);
    expect(e.intro[0]?.scene).toBe('tunnel');
    expect(e.success[0]?.scene).toBe('tunnel');
    expect(e.backdoorTaken[0]?.scene).toBe('tunnel');
  });

  it('das Intro hat zwei Antworten ohne Gadget und die Zusatz-Antwort mit dem Flow-Chip', () => {
    const choices = e.intro.flatMap((l) => l.choices ?? []);
    expect(choices.map((c) => [c.id, c.needs])).toEqual([['bleiben', undefined], ['gelesen', undefined], ['chip', 'flow-chip']]);
    expect(choices.find((c) => c.id === 'chip')!.reply![0]!.text).toBe('Genau dafür hab ich ihn gebaut!');
  });
});

describe('Akt 3: Story-Objekte', () => {
  const objects = AKT3.objects;

  it('fünf Objekte, eins je Auftrag in der Reihenfolge der Aufträge', () => {
    expect(objects.map((o) => [o.lessonId, o.kind])).toEqual([
      ['m3-l1', 'picture'],
      ['m3-l2', 'idcard'],
      ['m3-l3', 'picture'],
      ['m3-l4', 'lines'],
      ['m3-l5', 'lines'],
    ]);
    expect(objects.map((o) => o.title)).toEqual(['Der U-Bahn-Netzplan', 'Ortruds Schlüsselkarte', 'Keks’ Ladestation', 'Bennos Prüfungsakte', 'Keks’ Speicherbox']);
  });

  it.each(objects.map((o) => [o.lessonId, o] as const))('%s: Stufen 0, 25, 50, 75, 100 % aufsteigend, jede Stufe hat ihren Inhalt', (_id, o) => {
    expect(o.stages.map((s) => s.at)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    for (const s of o.stages) {
      if (o.kind === 'picture') expect(s.picture, `${o.title} ${s.at}`).toMatch(/^(netzplan|ladestation)-(0|25|50|75|100)$/);
      if (o.kind === 'lines') expect(s.lines?.length, `${o.title} ${s.at}`).toBeGreaterThan(0);
      if (o.kind === 'idcard') expect(s.card, `${o.title} ${s.at}`).toBeDefined();
    }
    if (o.kind === 'picture') expect(o.stages.map((s) => s.picture!.split('-')[1])).toEqual(['0', '25', '50', '75', '100']);
  });

  it('Schlüsselkarte: Foto, dann Logo und Name, dann Code-Streifen, zuletzt der Stempel', () => {
    const card = objectOf(objects, 'm3-l2')!;
    expect(card.look).toBe('schluesselkarte');
    expect([0, 0.25, 0.5, 0.75, 1].map((p) => stageAt(card, p).card)).toEqual([[], ['foto'], ['foto', 'logo', 'name'], ['foto', 'logo', 'name', 'code'], ['foto', 'logo', 'name', 'code', 'stempel']]);
  });

  it('Prüfungsakte und Speicherbox setzen sich Stufe für Stufe zusammen; die Akte trägt am Ende Adas Stempel', () => {
    const counts = (id: string) => [0, 0.25, 0.5, 0.75, 1].map((p) => stageAt(objectOf(objects, id)!, p).lines!.length);
    expect(counts('m3-l4')).toEqual([5, 2, 4, 6, 7]);
    expect(counts('m3-l5')).toEqual([2, 1, 2, 3, 4]);
    expect(stageAt(objectOf(objects, 'm3-l4')!, 1).watermark).toBe(true);
    expect(stageAt(objectOf(objects, 'm3-l4')!, 1).lines!.at(-1)).toBe('Prüferin: Ada');
  });
});

describe('Akt 3: Haupt-Szenen', () => {
  const chat = AKT3.chat;
  const scene = (id: string) => chat.find((s) => s.id === id)!;
  const ids = (lessonId: string) => chat.filter((s) => s.id !== 'a3-start' && 'lessonId' in s.trigger && s.trigger.lessonId === lessonId).map((s) => s.id);

  it('je Auftrag Briefing, drei Stufen und Abschluss in dieser Reihenfolge; vorher die Anfangsszene mit dem Auslöser von Auftrag 1', () => {
    for (const l of m3.lessons) {
      const n = l.id.slice(3);
      expect(ids(l.id), l.id).toEqual([`a3-${n}-brief`, `a3-${n}-s25`, `a3-${n}-s50`, `a3-${n}-s75`, `a3-${n}-done`]);
    }
    expect(chat.map((s) => s.id).slice(0, 2)).toEqual(['a3-start', 'a3-l1-brief']);
    expect(scene('a3-start').trigger).toEqual(scene('a3-l1-brief').trigger);
    expect(chat.filter((s) => 'lessonId' in s.trigger || s.id === 'a3-start')).toHaveLength(26);
    expect(chat.at(-1)).toMatchObject({ id: 'a3-exam-after', chat: 'intern', trigger: { on: 'exam', moduleId: 'm3' } });
    expect(chat).toHaveLength(27);
  });

  it('Briefings zeigen die Mini-Tastatur mit den neuen Tasten ihres Auftrags', () => {
    const codes: Record<string, string[]> = {
      'm3-l1': ['KeyN', 'KeyM'],
      'm3-l2': ['KeyC', 'Comma'],
      'm3-l3': ['KeyV', 'Period'],
      'm3-l4': ['KeyB', 'Slash'],
      'm3-l5': ['KeyX', 'KeyZ'],
    };
    for (const [lessonId, keys] of Object.entries(codes)) {
      const brief = chat.find((s) => s.trigger.on === 'briefing' && s.trigger.lessonId === lessonId && s.id.endsWith('-brief'))!;
      expect(brief.lines.flatMap((l) => l.keys ?? []), lessonId).toEqual(keys);
    }
  });

  it('die fünf Wörter stehen allein an ihrer Zeile in den Abschluss-Szenen; komm im Chat `juna`', () => {
    for (const { lessonId, word } of AKT3.check.typed) {
      const done = scene(`a3-${lessonId.slice(3)}-done`);
      const asking = done.lines.filter((l) => l.choices?.some((c) => c.typed));
      expect(asking, lessonId).toHaveLength(1);
      expect(asking[0]!.choices!.map((c) => c.typed), lessonId).toEqual([word]);
      expect(asking[0]!.chat, lessonId).toBe(word === 'komm' ? 'juna' : undefined);
    }
  });

  it('Juna schreibt in Auftrag 1 im Chat `juna` und ab `a3-l1-done` in ZEHN intern', () => {
    const junaLines = (id: string) => scene(id).lines.filter((l) => l.speaker === 'juna');
    expect(junaLines('a3-l1-s25').map((l) => l.chat)).toEqual(['juna']);
    expect(junaLines('a3-l1-done').map((l) => l.chat)).toEqual(['juna']);
    const later = chat.slice(chat.findIndex((s) => s.id === 'a3-l1-done') + 1);
    for (const s of later) for (const l of s.lines.filter((x) => x.speaker === 'juna')) expect(l.chat, s.id).toBeUndefined();
    const join = scene('a3-l1-done').lines.find((l) => l.speaker === 'system');
    expect(join).toMatchObject({ text: 'Krümel hat Juna zu ZEHN intern hinzugefügt.' });
    expect(join!.chat).toBeUndefined();
  });

  it('Frau Hubbel schreibt nur in ZEHN intern; der Baron schreibt genau einmal als „???“, in `a3-l4-s75`', () => {
    for (const s of chat) for (const l of s.lines.filter((x) => x.speaker === 'hubbel')) expect([s.chat, l.chat], s.id).toEqual(['intern', undefined]);
    expect(chat.flatMap((s) => s.lines.filter((l) => l.speaker === 'baron'))).toEqual([]);
    const unknown = chat.flatMap((s) => s.lines.filter((l) => l.speaker === 'unbekannt').map(() => s.id));
    expect(unknown).toEqual(['a3-l4-s75']);
  });

  it('Gadgets: Tunnel-Karte, Grubenlampe und Flow-Chip werden in den Szenen übergeben, Zusatz-Antworten stehen an ihren Szenen', () => {
    expect(scene('a3-l2-done').gives).toEqual(['tunnel-karte']);
    expect(scene('a3-l3-brief').gives).toEqual(['grubenlampe']);
    expect(scene('a3-l5-done').gives).toEqual(['flow-chip']);
    expect(chat.filter((s) => s.gives).map((s) => s.id)).toEqual(['a3-l2-done', 'a3-l3-brief', 'a3-l5-done']);
    const needs = (id: string) => scene(id).lines.flatMap((l) => (l.choices ?? []).filter((c) => c.needs).map((c) => [c.id, c.needs]));
    expect(needs('a3-start')).toEqual([['funken', 'walkie-talkie']]);
    expect(needs('a3-l3-s75')).toEqual([['lampe', 'grubenlampe']]);
    expect(needs('a3-l5-brief')).toEqual([['karte', 'tunnel-karte']]);
    expect(chat.filter((s) => s.lines.some((l) => l.choices?.some((c) => c.needs))).map((s) => s.id)).toEqual(['a3-start', 'a3-l3-s75', 'a3-l5-brief', 'a3-exam-after']);
    // jede Zusatz-Antwort steht neben Antworten ohne Gadget
    for (const s of chat) for (const l of s.lines) if (l.choices?.some((c) => c.needs)) expect(l.choices.filter((c) => !c.needs).length, s.id).toBeGreaterThanOrEqual(2);
  });

  it('Echos auf Akt 2: Anfangsszene, `a3-l1-s50` und `a3-l4-s25`', () => {
    const echoes = (id: string) => scene(id).lines.flatMap((l) => (l.ifPicked ? [`${l.ifPicked.scene}/${l.ifPicked.choice}`] : []));
    expect(echoes('a3-start')).toEqual(['a2-exam-after/mitmachen', 'a2-exam-after/fragen', 'a2-exam-after/null']);
    expect(echoes('a3-l1-s50')).toEqual(['a2-l1-s50/zwanzig']);
    expect(echoes('a3-l4-s25')).toEqual(['a2-l6-s75/pruefung', 'a2-l6-s75/los']);
  });

  it('die Antwort-Kennungen der Schlüsse und der Mitgefühl-Wahl (beide Zweige antworten Ada)', () => {
    const choices = (id: string) => scene(id).lines.flatMap((l) => (l.choices ?? []).map((c) => c.id));
    expect(choices('a3-l1-s75')).toEqual(['archiv', 'friedhof', 'bahnhof']);
    expect(choices('a3-l2-s75')).toEqual(['serverkeller', 'stellwerk', 'schule']);
    expect(choices('a3-l3-s75')).toEqual(['keks', 'zwei', 'lampe']);
    expect(choices('a3-l4-s50')).toEqual(['loeschen', 'zurueck', 'sammeln']);
    expect(choices('a3-l4-s75')).toEqual(['gemein', 'dieb']);
    expect(choices('a3-l5-s75')).toEqual(['keks', 'kruemel', 'ada']);
    const mitgefuehl = scene('a3-l4-s75').lines.flatMap((l) => l.choices ?? []);
    expect(mitgefuehl.map((c) => c.reply![0]!.speaker)).toEqual(['ada', 'ada']);
  });

  it('Goldrand-Karte im Nachtzug; Notizbuch und „Hallo Keks“ ohne Goldrand', () => {
    const cards = chat.flatMap((s) => s.lines.flatMap((l) => (l.card ? [[s.id, l.card.title, l.card.look]] : [])));
    expect(cards).toEqual([
      ['a3-l1-done', 'Im Nachtzug', 'goldcard'],
      ['a3-l3-s50', 'Bennos Notizbuch', undefined],
      ['a3-exam-after', 'Ohne Absender', undefined],
    ]);
  });

  it('Emoji nur wie im Drehbuch: Juna, Krümel und Ada einmal (Daumen)', () => {
    const adaEmoji = chat.flatMap((s) => s.lines.filter((l) => l.speaker === 'ada' && /\p{Extended_Pictographic}/u.test(l.text)).map(() => s.id));
    expect(adaEmoji).toEqual(['a3-exam-after']);
  });
});

describe('Akt 3: Beweisstücke und Gadgets', () => {
  it('Gadgets mit Name, Beschreibung und Quell-Szene; Beweisfach: Fahrplan, Notizbuch und „Hallo Keks“ in ihren Szenen mit Bild', () => {
    for (const [id, scene] of [['tunnel-karte', 'a3-l2-done'], ['grubenlampe', 'a3-l3-brief'], ['flow-chip', 'a3-l5-done']] as const) {
      const g = ITEMS.find((i) => i.id === id)!;
      expect([g.kind, g.source, g.name.length > 0, g.description.length > 0], id).toEqual(['gadget', { scene }, true, true]);
    }
    const mine = ITEMS.find((i) => i.id === 'beweisfach')!.pieces!.filter((p) => p.scene.startsWith('a3-'));
    expect(mine.map((p) => [p.id, p.scene, p.picture])).toEqual([
      ['fahrplan', 'a3-l2-s25', 'fahrplan'],
      ['notizbuch', 'a3-l3-s50', 'notizbuch'],
      ['keks-gruss', 'a3-exam-after', 'keks-gruss'],
    ]);
  });
});

describe('Akt 3: Fallakte', () => {
  const f = fallakte(ALL_STORY, 'm3')!;

  it('Kopfzeile, sechs gelöste Zeilen (zwei nur mit Antwort), vier offene Spuren, Einsatz-Zeilen, Krümels Schlusssatz', () => {
    expect([f.title, f.header]).toEqual(['Fallakte Akt 3', 'Unten liegt die Stadt in Akten. Eine davon ist meine.']);
    expect(f.solved).toHaveLength(6);
    expect(f.solved.filter((e) => e.ifPicked).map((e) => [e.ifPicked!.scene, e.ifPicked!.choice])).toEqual([['a3-l3-s75', 'keks'], ['a3-l5-s75', 'keks']]);
    expect(f.open.map((e) => e.text)).toEqual([
      'Wer hat ihm ein Gerät geschenkt, das fast von allein tippt?',
      'Wer hat das O vom Ortsschild?',
      'Wer schreibt Krümel „Hallo Keks“?',
      'Was hat Ada damals vor allen gesagt?',
    ]);
    expect(f.firewall).toEqual({ passed: 'Datenflut: alle Tunnel dicht', backdoor: 'Datenflut: Stecker gezogen – Einsatz nachholen' });
    expect(f.closing).toBe('Ich war Keks. Ich bin Krümel. Und einer da draußen weiß beides. Piep.');
  });

  it('Verdächtige: der Baron gesucht mit fünf Treffer-Zeilen, Ortrud verdächtig mit ihrem Porträt, Frau Hubbel entlastet', () => {
    expect(f.suspects.map((s) => [s.name, s.status, s.hits.length])).toEqual([
      ['Baron von Backspace', 'gesucht', 5],
      ['Ortrud', 'verdaechtig', 0],
      ['Frau Hubbel', 'entlastet', 0],
    ]);
    expect(f.suspects[1]!.picture).toBe('portraet-ortrud');
  });
});

describe('Akt 3: Nebenszenen', () => {
  const sides = AKT3.side;
  const trig = (s: (typeof sides)[number]) => s.trigger as { strand: string; order: number; fromLesson: string; afterScene?: string };
  const strand = (name: string) => sides.filter((s) => trig(s).strand === name).sort((a, b) => trig(a).order - trig(b).order);

  it('sechs Stränge, alle ab einem Auftrag von Akt 3, mit `a3-side-`-Kennung; nur `durchsage` hat vier Szenen und eine Variante', () => {
    expect(new Set(sides.map((s) => trig(s).strand))).toEqual(new Set(['durchsage', 'funker', 'dejavu', 'kringel', 'post', 'hubbel']));
    expect(sides).toHaveLength(20);
    for (const s of sides) {
      expect(s.id.startsWith('a3-side-'), s.id).toBe(true);
      expect(m3.lessons.map((l) => l.id), s.id).toContain(trig(s).fromLesson);
    }
    for (const name of ['funker', 'dejavu', 'kringel', 'post', 'hubbel']) expect(strand(name).map((s) => trig(s).order)).toEqual([1, 2, 3]);
    expect(strand('durchsage').map((s) => trig(s).order)).toEqual([1, 2, 3, 4, 5]);
  });

  it('Durchsage-Strang reagiert auf den Extra-Fall: vor dem Fall 4b, danach 4, nie beide, nie blockiert', () => {
    const [b, after] = ['a3-side-durchsage-4b', 'a3-side-durchsage-4'].map((id) => sides.find((s) => s.id === id)!);
    expect(b!.trigger).toMatchObject({ order: 4, untilCase: 'verschluckte-durchsage' });
    expect(after!.trigger).toMatchObject({ order: 5, afterCase: 'verschluckte-durchsage' });
    const story = { scenes: strand('durchsage') };
    const first3 = ['a3-side-durchsage-1', 'a3-side-durchsage-2', 'a3-side-durchsage-3'];
    const at = (ids: string[], solved: boolean) => logScenes(profile({ cases: solved ? { 'verschluckte-durchsage': 1 } : {} }), ids, 1);
    const next = (ids: string[], solved: boolean) => nextSideScene(at(ids, solved), story, RULES, 'm3-l5');
    expect(next(first3, false)).toBe('a3-side-durchsage-4b');
    expect(next(first3, true)).toBe('a3-side-durchsage-4');
    // Fall nach 4b gelöst: danach kommt 4
    expect(next([...first3, 'a3-side-durchsage-4b'], true)).toBe('a3-side-durchsage-4');
    // ohne Fall endet der Strang nach 4b; 4 ist die letzte des Strangs
    expect(next([...first3, 'a3-side-durchsage-4b'], false)).toBeNull();
    expect(next([...first3, 'a3-side-durchsage-4b', 'a3-side-durchsage-4'], true)).toBeNull();
  });

  it('Chats: Durchsagen im Flüstern, Déjà-vus bei Krümel, der Rest in ZEHN intern; Frau Hubbel nur dort', () => {
    const chats = (name: string) => new Set(strand(name).map((s) => s.chat));
    expect(chats('durchsage')).toEqual(new Set(['fluestern']));
    expect(chats('dejavu')).toEqual(new Set(['kruemel']));
    for (const name of ['funker', 'kringel', 'post', 'hubbel']) expect(chats(name)).toEqual(new Set(['intern']));
    for (const s of sides.filter((x) => x.lines.some((l) => l.speaker === 'hubbel'))) expect(s.chat, s.id).toBe('intern');
  });

  it('Reihenfolge: dejavu-3 erst nach `a3-l5-s75`, hubbel-1 und post-3 nach `a3-l3-s75`, post-2 nach `a3-l1-s50`', () => {
    const after = (id: string) => trig(sides.find((s) => s.id === id)!).afterScene;
    expect(after('a3-side-dejavu-3')).toBe('a3-l5-s75');
    expect(after('a3-side-hubbel-1')).toBe('a3-l3-s75');
    expect(after('a3-side-post-3')).toBe('a3-l3-s75');
    expect(after('a3-side-post-2')).toBe('a3-l1-s50');
    for (const name of ['durchsage', 'funker', 'dejavu', 'post']) expect(trig(strand(name)[0]!).afterScene, name).toBe('a3-l1-done');
    expect(trig(strand('kringel')[0]!).fromLesson).toBe('m3-l2');
    expect(trig(strand('hubbel')[0]!).fromLesson).toBe('m3-l3');
    // jede Bedingung nennt eine vorhandene Szene
    const ids = new Set(ALL_STORY.scenes.map((s) => s.id));
    for (const s of sides) if (trig(s).afterScene) expect(ids.has(trig(s).afterScene!), s.id).toBe(true);
  });

  it('keine Nebenszene verschenkt etwas', () => {
    expect(sides.filter((s) => s.gives)).toEqual([]);
  });
});

describe('Akt 3: Extra-Fall „Die verschluckte Durchsage“', () => {
  const c = AKT3.cases[0]!;
  const scene = (id: string) => AKT3.caseScenes.find((s) => s.id === id)!;
  const rules = RULES;

  it('ein Fall: ab Auftrag 2 nach dem Briefing, Kescher öffnet ihn, Tunnel-Megafon ist die Belohnung', () => {
    expect(AKT3.cases).toHaveLength(1);
    expect(c).toMatchObject({ id: 'verschluckte-durchsage', fromLesson: 'm3-l2', afterScene: 'a3-l2-brief', needs: 'buchstabenkescher', gives: 'tunnel-megafon', picture: 'durchsage' });
    expect(c.reveal.text).toContain('Die gehören der Stadt.');
    expect(ITEMS.find((i) => i.id === 'tunnel-megafon')).toMatchObject({ kind: 'gadget', source: { case: c.id } });
    expect(AKT3.caseScenes.map((s) => s.id)).toEqual(['case-durchsage-open', 'case-durchsage-intro', 'case-durchsage-outro']);
  });

  it('unsichtbar vor Auftrag 2 und vor dem Briefing, danach sichtbar', () => {
    const base = { lessons: mastered(...[...m1.lessons, ...m2.lessons, m3.lessons[0]!].map((l) => l.id)) };
    expect(caseVisible(profile(base), rules, c)).toBe(false);
    expect(caseVisible(logScenes(profile({ ...base, seen: ['briefing:m3-l2'] }), ['a3-l2-brief'], 1), rules, c)).toBe(true);
    expect(caseVisible(profile({ lessons: mastered('m1-l1') }), rules, c)).toBe(false);
  });

  it('die Trainingsrunde nimmt nur Tasten bis Auftrag 2 (`m3-l2`)', () => {
    const keys = caseTrainingKeys(profile(), ALL_COURSE, 'm3-l2');
    const allowed = new Set(keysUpTo(ALL_COURSE, 'm3-l2'));
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys) expect(allowed.has(k), k).toBe(true);
    expect(keys.some((k) => ['v', '.', 'b', '-', 'x', 'y'].includes(k))).toBe(false);
  });

  it('die vier alten Gadgets haben je eine Zusatz-Antwort mit Reaktion, je Wahl höchstens drei, eine ohne Gadget', () => {
    const choices = (id: string) => scene(id).lines.flatMap((l) => l.choices ?? []);
    const intro = choices('case-durchsage-intro');
    const outro = choices('case-durchsage-outro');
    expect(intro.map((a) => a.needs)).toEqual([undefined, 'fernglas', 'blasenwerfer']);
    expect(outro.map((a) => a.needs)).toEqual([undefined, 'lupe', 'verkleidungskoffer']);
    for (const a of [...intro, ...outro]) expect(a.reply?.length, a.id).toBeGreaterThan(0);
    expect(scene('case-durchsage-outro').lines.at(-1)).toMatchObject({ item: 'tunnel-megafon' });
  });

  it('Tunnel-Megafon zahlt sich in `a3-exam-after` als dritte Antwort aus', () => {
    const after = AKT3.chat.find((s) => s.id === 'a3-exam-after')!;
    const answers = after.lines.flatMap((l) => l.choices ?? []);
    expect(answers.map((a) => [a.id, a.needs])).toEqual([['wer', undefined], ['nicht', undefined], ['megafon', 'tunnel-megafon']]);
  });
});

describe('Akt 3: Belohnungen und Abzeichen', () => {
  const byId = (id: string) => AKT3.rewards.find((s) => s.id === id)!;

  it('Kopftuch, Grubenstiefel, Faltstiefel und Leggings: Übergabe-Szenen mit Figur, Auslöser und Geschenk-Kennzeichen', () => {
    expect(byId('a3-gift-kopftuch')).toMatchObject({ chat: 'intern', trigger: { on: 'briefing', lessonId: 'm3-l1' }, gives: ['headscarf'], gift: true });
    expect(byId('a3-gift-kopftuch').lines[0]).toMatchObject({ speaker: 'ada' });
    expect(byId('a3-gift-grubenstiefel')).toMatchObject({ chat: 'intern', trigger: { on: 'briefing', lessonId: 'm3-l4' }, gives: ['minerboots'], gift: true });
    expect(byId('a3-gift-grubenstiefel').lines[0]).toMatchObject({ speaker: 'hubbel' });
    expect(byId('a3-gift-faltstiefel')).toMatchObject({ chat: 'kruemel', trigger: { on: 'exam', moduleId: 'm3' }, gives: ['boots'], gift: true });
    expect(byId('a3-badge-untere-reihe')).toMatchObject({ chat: 'kruemel', trigger: { on: 'badge', badgeId: 'untere-reihe' }, gives: ['leggings'], gift: true });
    expect(byId('a3-badge-untere-reihe').lines.some((l) => l.text.includes('Beweglich genug für enge Schächte.'))).toBe(true);
  });

  it('Faltstiefel kommen nach der ersten Einsatz-Szene (`a3-exam-after`)', () => {
    const ids = [...AKT3.chat, ...AKT3.rewards].filter((s) => s.trigger.on === 'exam').map((s) => s.id);
    expect(ids).toEqual(['a3-exam-after', 'a3-gift-faltstiefel']);
  });

  it('Abzeichen „Untere Reihe gesichert“: Fortschritt', () => {
    expect(BADGES.find((b) => b.id === 'untere-reihe')).toMatchObject({ title: 'Untere Reihe gesichert', category: 'fortschritt' });
  });

  it('Garderobe: Kopftuch als Kopfbedeckung, Grubenstiefel, Faltstiefel und Leggings mit Quelle in Akt 3; jedes mit Zettel', () => {
    expect(WARDROBE.headwear.find((i) => i.id === 'headscarf')).toMatchObject({ parts: ['bandana'], source: { scene: 'a3-gift-kopftuch' } });
    expect(WARDROBE.shoes.find((i) => i.id === 'minerboots')).toMatchObject({ parts: ['boots-basic'], source: { scene: 'a3-gift-grubenstiefel' } });
    expect(WARDROBE.shoes.find((i) => i.id === 'boots')!.source).toEqual({ scene: 'a3-gift-faltstiefel' });
    expect(WARDROBE.pants.find((i) => i.id === 'leggings')!.source).toEqual({ badge: 'untere-reihe' });
    for (const id of ['headscarf', 'minerboots', 'boots', 'leggings']) expect(CLOTH.find((c) => c.id === id)!.description, id).not.toBe('');
  });
});
