// Besonderheiten von Akt 2 „Obere Reihe“: Modul, Wortliste, Beschriftung, Einsatz-Story, Haupt-Szenen, Nebenszenen, Belohnungen, Fallakte.
// Alles, was für jeden Akt gilt, steht in course.test.ts, story.test.ts und rewards.test.ts und liest das Prüfprofil `check` des Bündels.

import { describe, expect, it } from 'vitest';
import { findModule, keysUpTo, lastLessonOf, moduleKeys } from '../domain/course.ts';
import { examTyping } from '../domain/examRun.ts';
import { createRng } from '../domain/rng.ts';
import { generateText, usableWords } from '../domain/textGenerator.ts';
import { ALL_COURSE, ALL_STORY, actScenes, sceneLines } from '../test/content.ts';
import { emojisIn } from '../test/emoji.ts';
import { COURSE } from './course.ts';
import { BADGES } from './badges.ts';
import { CLOTH, ITEMS } from './items.ts';
import { WARDROBE } from './wardrobe.ts';
import { AKT1 } from './story/akt1/index.ts';
import { AKT2 } from './story/akt2/index.ts';
import { ACTS, STAGED_ACTS } from './story/acts.ts';
import { examStory, fallakte, moduleLabel } from '../domain/book.ts';
import { WORDS_OBERE_REIHE } from './words.de.ts';

const m2 = findModule(ALL_COURSE, 'm2');
const m1 = findModule(ALL_COURSE, 'm1');

describe('Akt 2: Modul', () => {
  it('ist im Spiel (ACTS, COURSE) nach Akt 1; Akt 3 bis 5 folgen', () => {
    expect(STAGED_ACTS).not.toContain(AKT2);
    expect(ACTS.map((a) => a.module.id).slice(0, 5)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
    expect(COURSE.modules.map((m) => m.id).slice(0, 5)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
    expect(ALL_COURSE.modules.map((m) => m.id).slice(0, 5)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']);
  });

  it('sechs Aufträge mit den Tasten der oberen Reihe; Schwellen wie in Akt 1', () => {
    expect(m2.lessons.map((l) => [l.id, l.newKeys.join('')])).toEqual([
      ['m2-l1', 'ei'],
      ['m2-l2', 'ru'],
      ['m2-l3', 'tz'],
      ['m2-l4', 'wo'],
      ['m2-l5', 'qp'],
      ['m2-l6', 'ü'],
    ]);
    expect(m2.mastery).toEqual(m1.mastery);
    expect(m2.exam).toEqual(m1.exam);
    expect(moduleLabel(ALL_STORY, 'm2')).toEqual({ act: 'Akt 2', place: 'Dächer und Funktürme' });
  });
});

describe('Akt 2: Wortliste', () => {
  it('mindestens 80 verschiedene Wörter', () => {
    expect(WORDS_OBERE_REIHE.length).toBeGreaterThanOrEqual(80);
    expect(new Set(WORDS_OBERE_REIHE).size).toBe(WORDS_OBERE_REIHE.length);
  });

  it('je Auftrag genug Wörter: mindestens 3 mit jeder neuen Taste (auch q und ü), Text zwischen Mindest- und Höchstlänge', () => {
    const { minTextLength, maxTextLength } = COURSE.practice;
    for (const l of m2.lessons) {
      const allowed = keysUpTo(ALL_COURSE, l.id);
      const usable = usableWords(m2.words, allowed);
      for (const k of l.newKeys) expect(usable.filter((w) => w.includes(k)).length, `${l.id} ${k}`).toBeGreaterThanOrEqual(3);
      for (let seed = 1; seed <= 20; seed++) {
        const text = generateText({ allowed, focus: l.newKeys, words: m2.words, length: 40, rng: createRng(seed) });
        expect(text.length, `${l.id} Länge`).toBeGreaterThanOrEqual(minTextLength);
        expect(text.length, `${l.id} Länge`).toBeLessThanOrEqual(maxTextLength);
        expect([...text.replaceAll(' ', '')].every((c) => allowed.includes(c)), `${l.id} nur gelernte Tasten`).toBe(true);
      }
    }
  });

  it('der Einsatz-Text liegt zwischen Mindest- und Höchstlänge und enthält nur Tasten des Moduls', () => {
    const { minTextLength, maxTextLength } = COURSE.practice;
    const keys = moduleKeys(m2);
    for (let seed = 1; seed <= 20; seed++) {
      const { text } = examTyping(ALL_COURSE, 'm2', seed);
      expect(text.length).toBeGreaterThanOrEqual(minTextLength);
      expect(text.length).toBeLessThanOrEqual(maxTextLength);
      expect([...text.replaceAll(' ', '')].every((c) => keys.includes(c))).toBe(true);
    }
    expect(lastLessonOf(m2).id).toBe('m2-l6');
  });

  it('die Wörter der Abschluss-Szenen sind mit den Tasten bis zu ihrem Auftrag tippbar', () => {
    for (const [id, word] of [['m2-l1', 'leise'], ['m2-l2', 'rauf'], ['m2-l3', 'jetzt'], ['m2-l4', 'hotel'], ['m2-l5', 'stopp'], ['m2-l6', 'tür']] as const) {
      expect([...word].every((c) => keysUpTo(ALL_COURSE, id).includes(c)), `${id} ${word}`).toBe(true);
    }
  });
});

describe('Akt 2: Einsatz-Story', () => {
  it('Verfolgungsjagd mit Überschriften, Segment-Name und Bilderbuch-Hintergrund Funkturm', () => {
    const e = examStory(ALL_STORY, 'm2');
    expect([e.title, e.won, e.lost, e.frame]).toEqual(['Einsatz: Die Verfolgungsjagd', 'Eingeholt!', 'Abgehängt', 'Brücken-Codes']);
    expect(e.segments).toBe('Abstand zum Baron: {n} von {gesamt} Brücken geschafft');
    expect(e.taunts).toHaveLength(4);
    expect(e.intro[0]?.scene).toBe('funkturm');
    expect(e.backdoorTaken[0]?.scene).toBe('funkturm');
  });

  it('die Zusatz-Antwort im Intro braucht ein Gadget aus Akt 1; daneben stehen Antworten ohne Gadget', () => {
    const choices = examStory(ALL_STORY, 'm2').intro.flatMap((l) => l.choices ?? []);
    expect(choices.filter((c) => c.needs).map((c) => c.needs)).toEqual(['blasenwerfer']);
    expect(choices.filter((c) => !c.needs).length).toBeGreaterThanOrEqual(2);
  });
});

describe('Akt 2: Haupt-Szenen', () => {
  const chat = AKT2.chat;
  const ids = (lessonId: string) => chat.filter((s) => s.id !== 'a2-start' && 'lessonId' in s.trigger && s.trigger.lessonId === lessonId).map((s) => s.id);

  it('je Auftrag Briefing, drei Stufen und Abschluss in dieser Reihenfolge; vorher die Anfangsszene mit dem Auslöser von Auftrag 1', () => {
    for (const l of m2.lessons) {
      const n = l.id.slice(3);
      expect(ids(l.id), l.id).toEqual([`a2-${n}-brief`, `a2-${n}-s25`, `a2-${n}-s50`, `a2-${n}-s75`, `a2-${n}-done`]);
    }
    expect(chat.map((s) => s.id).slice(0, 2)).toEqual(['a2-start', 'a2-l1-brief']);
    expect(chat.find((s) => s.id === 'a2-start')!.trigger).toEqual(chat.find((s) => s.id === 'a2-l1-brief')!.trigger);
    expect(chat.filter((s) => 'lessonId' in s.trigger || s.id === 'a2-start')).toHaveLength(31);
    expect(chat.at(-1)).toMatchObject({ id: 'a2-exam-after', chat: 'intern', trigger: { on: 'exam', moduleId: 'm2' } });
  });

  it('Prüfprofil: sechs getippte Wörter, kein Name-Vorbehalt, Spoiler-Wörter für die Fallakte', () => {
    expect(AKT2.check.typed.map((t) => t.word)).toEqual(['leise', 'rauf', 'jetzt', 'hotel', 'stopp', 'tür']);
    expect(AKT2.check.revealFrom).toBeUndefined();
    expect(AKT2.check.spoilers).toEqual(['tippnix', 'otti', 'neffe', 'keks']);
  });

  it('Briefings zeigen die Mini-Tastatur mit den neuen Tasten ihres Auftrags', () => {
    const codes: Record<string, string[]> = {
      'm2-l1': ['KeyE', 'KeyI'],
      'm2-l2': ['KeyR', 'KeyU'],
      'm2-l3': ['KeyT', 'KeyY'],
      'm2-l4': ['KeyW', 'KeyO'],
      'm2-l5': ['KeyQ', 'KeyP'],
      'm2-l6': ['BracketLeft'],
    };
    for (const [lessonId, keys] of Object.entries(codes)) {
      const brief = chat.find((s) => s.trigger.on === 'briefing' && s.trigger.lessonId === lessonId && s.id.endsWith('-brief'))!;
      expect(brief.lines.flatMap((l) => l.keys ?? []), lessonId).toEqual(keys);
    }
  });

  it('Gadgets: Fernglas und Verkleidungskoffer werden in den Briefings übergeben, Zusatz-Antworten brauchen sie nie allein', () => {
    expect(chat.find((s) => s.id === 'a2-l2-brief')!.gives).toEqual(['fernglas']);
    expect(chat.find((s) => s.id === 'a2-l5-brief')!.gives).toEqual(['verkleidungskoffer']);
    const needs = (id: string) => chat.find((s) => s.id === id)!.lines.flatMap((l) => (l.choices ?? []).filter((c) => c.needs).map((c) => c.needs));
    expect(needs('a2-l2-s50')).toEqual(['fernglas']);
    expect(needs('a2-l3-s50')).toEqual(['lupe']);
    expect(needs('a2-l5-s75')).toEqual(['verkleidungskoffer']);
  });

  it('Echos: Anfangsszene und Briefings greifen Antworten aus Akt 1 und früheren Aufträgen auf', () => {
    const echoes = (id: string) => chat.find((s) => s.id === id)!.lines.flatMap((l) => (l.ifPicked ? [`${l.ifPicked.scene}/${l.ifPicked.choice}`] : []));
    // der Rückfall (`choice: null`, hinter den Echo-Zeilen) grüßt alte Spielstände ohne gemerkte Antwort
    expect(echoes('a2-start')).toEqual(['exam-after-foto/ada', 'exam-after-foto/ueberlegen', 'exam-after-foto/lupe', 'exam-after-foto/null']);
    expect(echoes('a2-l1-brief')).toEqual(['l1-s25/haende', 'l1-s25/noch']);
    expect(echoes('a2-l3-brief')).toEqual(['l2-s75/verdaechtig']);
    expect(echoes('a2-l3-s25')).toEqual(['l5-s25/nietippen', 'l5-s25/lollis']);
    expect(echoes('a2-l3-s50')).toEqual(['l4-s25/kringel']);
  });

  it('Beweisstücke und Bilder: Szenen zeigen ihr Bild, die Fahrkarte kommt nach dem Einsatz', () => {
    const koffer = ITEMS.find((i) => i.id === 'beweisfach')!;
    const mine = koffer.pieces!.filter((p) => p.scene.startsWith('a2-'));
    expect(mine.map((p) => [p.id, p.scene, p.picture])).toEqual([
      ['monokel', 'a2-l2-s50', 'elsternest'],
      ['elsterfeder', 'a2-l2-s75', 'rotor-75'],
      ['fahrkarte', 'a2-exam-after', 'fahrkarte'],
    ]);
    expect(chat.find((s) => s.id === 'a2-l5-s75')!.lines.some((l) => l.picture === 'skizze-tuer')).toBe(true);
  });

  it('Goldrand-Karten in den Abschluss-Szenen der Aufträge 1, 3 und 5', () => {
    const cards = chat.flatMap((s) => s.lines.flatMap((l) => (l.card?.look === 'goldcard' ? [[s.id, l.card.title]] : [])));
    expect(cards).toEqual([
      ['a2-l1-done', 'Über Funk'],
      ['a2-l3-done', 'Von der Wettertafel'],
      ['a2-l5-done', 'Zettel aus dem Roboter'],
    ]);
  });
});

describe('Akt 2: Fallakte', () => {
  const f = fallakte(ALL_STORY, 'm2')!;
  it('Kopfzeile, vier gelöste und vier offene Spuren, Einsatz-Zeilen, Krümels Schlusssatz', () => {
    expect([f.title, f.header]).toEqual(['Fallakte Akt 2', 'Oben war er. Jetzt geht es nach unten.']);
    expect(f.solved).toHaveLength(4);
    expect(f.open.map((e) => e.text)).toEqual([
      'Wer hat das O vom Ortsschild?',
      'Was heißt „Der Teig geht noch“?',
      'Was ist unten, wo die Stadt sich erinnert?',
      'Warum musste Juna beim „Werbefoto“ nur tippen?',
    ]);
    expect(f.firewall).toEqual({ passed: 'Verfolgungsjagd: eingeholt', backdoor: 'Verfolgungsjagd: abgehängt – Einsatz nachholen' });
    expect(f.closing).toBe('Nächster Halt: unten. Ich hab keine Tiefenangst. Glaub ich.');
  });

  it('Verdächtige: Kringel und die Elster entlastet, der Baron gesucht, jeder Treffer an eine Antwort gebunden', () => {
    expect(f.suspects.map((s) => [s.name, s.status])).toEqual([
      ['Herr Kringel', 'entlastet'],
      ['Die Elster', 'entlastet'],
      ['Baron von Backspace', 'gesucht'],
    ]);
    expect(f.suspects.map((s) => s.hits.length)).toEqual([1, 1, 4]);
  });

  it('Kringel zeigt in den Fallakten von Akt 1 und 2 sein Porträt, nie die Feder (sie gehört zu Bennos Zylinder, das steht im Text)', () => {
    const kringel = (m: string) => fallakte(ALL_STORY, m)!.suspects.find((s) => s.name === 'Herr Kringel')!.picture;
    expect(kringel('m1')).toBe('portraet-kringel');
    expect(kringel('m2')).toBe('portraet-kringel');
  });
});

describe('Akt 2: Nebenszenen', () => {
  const sides = AKT2.side;
  const strand = (name: string) => sides.filter((s) => s.trigger.on === 'side' && s.trigger.strand === name).sort((a, b) => (a.trigger.on === 'side' && b.trigger.on === 'side' ? a.trigger.order - b.trigger.order : 0));

  it('sechs Stränge, 18 Szenen plus die Variante 3b; alle ab einem Auftrag von Akt 2, mit `a2-side-`-Kennung', () => {
    expect(new Set(sides.map((s) => s.trigger.on === 'side' && s.trigger.strand))).toEqual(new Set(['flug', 'elster', 'kringel', 'post', 'lehrling', 'juna']));
    expect(sides).toHaveLength(19);
    for (const s of sides) {
      expect(s.id.startsWith('a2-side-'), s.id).toBe(true);
      expect(s.trigger.on === 'side' && m2.lessons.map((l) => l.id).includes(s.trigger.fromLesson), s.id).toBe(true);
    }
  });

  it('Auslöser: erste Szene je Strang nach der Szene der Tabelle, Lavendel- und Monokel-Szenen erst nach ihren Haupt-Szenen', () => {
    const first = (name: string) => (strand(name)[0]!.trigger as { afterScene?: string; fromLesson: string });
    expect(first('flug')).toMatchObject({ fromLesson: 'm2-l1', afterScene: 'a2-l1-s25' });
    expect(first('elster')).toMatchObject({ fromLesson: 'm2-l2', afterScene: 'a2-l2-s25' });
    expect(first('kringel')).toMatchObject({ fromLesson: 'm2-l3', afterScene: 'a2-l3-s50' });
    expect(first('post')).toMatchObject({ fromLesson: 'm2-l2', afterScene: 'a2-l2-s50' });
    expect(first('lehrling')).toMatchObject({ fromLesson: 'm2-l1', afterScene: 'a2-start' });
    expect(first('juna')).toMatchObject({ fromLesson: 'm2-l2', afterScene: 'a2-l2-s25' });
  });

  it('Junas Liste: 3b (ohne den Fall) ist Folge 3, 3 (nach dem Fall) die letzte des Strangs; beide mit denselben zwei Antworten', () => {
    const juna = strand('juna');
    expect(juna.map((s) => s.id)).toEqual(['a2-side-juna-1', 'a2-side-juna-2', 'a2-side-juna-3b', 'a2-side-juna-3']);
    expect(juna[2]!.trigger).toMatchObject({ order: 3, untilCase: 'junas-liste', afterScene: 'a2-l3-s50', fromLesson: 'm2-l3' });
    expect(juna[3]!.trigger).toMatchObject({ order: 4, afterCase: 'junas-liste', afterScene: 'a2-l3-s50', fromLesson: 'm2-l3' });
    const answers = (id: string) => juna.find((s) => s.id === id)!.lines.flatMap((l) => (l.choices ?? []).map((c) => c.id));
    expect(answers('a2-side-juna-3b')).toEqual(['platz1', 'elster']);
    expect(answers('a2-side-juna-3')).toEqual(['platz1', 'elster']);
  });

  it('die Lederkappe kommt von Juna in `a2-side-juna-2`', () => {
    expect(sides.find((s) => s.id === 'a2-side-juna-2')).toMatchObject({ chat: 'juna', gives: ['cap'] });
    expect(sides.filter((s) => s.gives).map((s) => s.id)).toEqual(['a2-side-juna-2']);
  });
});

describe('Akt 2: Belohnungen und Abzeichen', () => {
  const byId = (id: string) => AKT2.rewards.find((s) => s.id === id)!;

  it('Schal, Shorts und Sonnenbrille: Übergabe-Szenen mit Figur, Auslöser und Geschenk-Kennzeichen', () => {
    expect(byId('a2-gift-schal')).toMatchObject({ chat: 'intern', trigger: { on: 'briefing', lessonId: 'm2-l2' }, gives: ['scarf'], gift: true });
    expect(byId('a2-gift-schal').lines[0]).toMatchObject({ speaker: 'ada', text: 'Auf dem Dach weht es. Wickel dich ein.' });
    expect(byId('a2-gift-shorts')).toMatchObject({ chat: 'kruemel', trigger: { on: 'exam', moduleId: 'm2' }, gives: ['shorts'], gift: true });
    expect(byId('a2-badge-obere-reihe')).toMatchObject({ chat: 'kruemel', trigger: { on: 'badge', badgeId: 'obere-reihe' }, gives: ['sun'], gift: true });
    expect(byId('a2-badge-obere-reihe').lines.some((l) => l.text.includes('Oben ist es hell. Sehr hell.'))).toBe(true);
  });

  it('Shorts kommen nach der ersten Einsatz-Szene (`a2-exam-after`)', () => {
    const ids = [...AKT2.chat, ...AKT2.rewards].filter((s) => s.trigger.on === 'exam').map((s) => s.id);
    expect(ids).toEqual(['a2-exam-after', 'a2-gift-shorts']);
  });

  it('Abzeichen „Obere Reihe gesichert“: Fortschritt, hängt am Einsatz m2', () => {
    expect(BADGES.find((b) => b.id === 'obere-reihe')).toMatchObject({ title: 'Obere Reihe gesichert', category: 'fortschritt' });
  });

  it('Garderobe: Schal als Zubehör, Lederkappe als Kopfbedeckung, mit Quelle in Akt 2; jedes mit Zettel', () => {
    expect(WARDROBE.accessories.find((i) => i.id === 'scarf')).toMatchObject({ parts: ['scarf'], source: { scene: 'a2-gift-schal' } });
    expect(WARDROBE.headwear.find((i) => i.id === 'cap')).toMatchObject({ parts: ['cap-leather'], source: { scene: 'a2-side-juna-2' } });
    expect(WARDROBE.pants.find((i) => i.id === 'shorts')!.source).toEqual({ scene: 'a2-gift-shorts' });
    expect(WARDROBE.glasses.find((i) => i.id === 'sun')!.source).toEqual({ badge: 'obere-reihe' });
    for (const id of ['scarf', 'cap', 'shorts', 'sun']) expect(CLOTH.find((c) => c.id === id)!.description, id).not.toBe('');
  });
});

describe('Akt 1 und 2: Emoji im Chat', () => {
  it('Emoji je Figur wie im Drehbuch: Juna 17, Krümel 7, Ada 2; sonst keiner; ein Verlust oder Zuwachs fällt auf', () => {
    const count: Record<string, number> = {};
    for (const act of [AKT1, AKT2]) {
      for (const s of actScenes(act)) {
        for (const { line } of sceneLines(s.lines, s.chat)) count[line.speaker] = (count[line.speaker] ?? 0) + emojisIn(line.text).length;
      }
    }
    expect(Object.fromEntries(Object.entries(count).filter(([, n]) => n > 0))).toEqual({ juna: 17, kruemel: 7, ada: 2 });
  });
});
