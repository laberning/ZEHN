// Lehrplan und Wörter prüfen: passt alles zusammen? (Weitere Inhaltstests: story.test.ts, rewards.test.ts, akt1.test.ts)

import { describe, expect, it } from 'vitest';
import { allWords, findLesson, keysUpTo, lessonOrder, type Course } from '../domain/course.ts';
import { createRng } from '../domain/rng.ts';
import { MIN_WORDS_FOR_WORD_MODE, charWeights, generateText, isDigit, isPunctuation, isSpecial, usableWords } from '../domain/textGenerator.ts';
import { UMLAUTE_GROSS, charsOf, isShiftKey, isTypeable, learnKey, learnKeys } from '../domain/keyboard.ts';
import { hasEmoji } from '../test/emoji.ts';
import { NUMBER_COURSE, PUNCT_COURSE, SHIFT_COURSE, SPECIAL_COURSE } from '../test/factories.ts';
import { ALL_ACTS, ALL_COURSE, ALL_LESSONS, ALL_SCENES, BUILT_ACTS } from '../test/content.ts';
import { COURSE } from './course.ts';
import { STORY } from '../app/rules.ts';
import { examStory, moduleLabel } from '../domain/book.ts';

/** Die Aufträge des Testkurses mit Großschreibung, die diese Regeln prüfen (die Kleinbuchstaben davor sind nur der Unterbau) */
const CAPITAL_LESSONS = SHIFT_COURSE.modules[1]!.lessons.map((l) => l.id);

/** Die Aufträge des Testkurses mit Buchstaben, Großbuchstaben, `? !`, `: ;`, `" '` (Modul p3; p1 und p2 haben eigene Regeln oben) */
const PUNCT_SHIFT_LESSONS = PUNCT_COURSE.modules[2]!.lessons.map((l) => l.id);

/** Die Aufträge der Zahlenreihe im Testkurs mit Zahlen (Modul n1) */
const NUMBER_LESSONS = NUMBER_COURSE.modules[3]!.lessons.map((l) => l.id);

/** Die Aufträge der Sonderzeichen im Testkurs mit Sonderzeichen (Modul x1) */
const SPECIAL_LESSONS = SPECIAL_COURSE.modules[4]!.lessons.map((l) => l.id);

describe('Lehrplan', () => {
  it('eindeutige IDs, jede Taste nur einmal eingeführt', () => {
    const ids = lessonOrder(ALL_COURSE);
    expect(new Set(ids).size).toBe(ids.length);
    const keys = keysUpTo(ALL_COURSE, ids.at(-1)!);
    expect(new Set(keys).size).toBe(keys.length);
    // der Fortschritt eines Auftrags ist das Minimum seiner neuen Tasten – ohne Tasten gäbe es keinen
    for (const m of ALL_COURSE.modules) for (const l of m.lessons) expect(l.newKeys.length, l.id).toBeGreaterThan(0);
  });

  it('Wörter: kleingeschrieben, tippbar, spätestens im letzten Auftrag aller Akte tippbar (spätere Buchstaben sind erlaubt)', () => {
    const keys = new Set(keysUpTo(ALL_COURSE, ALL_LESSONS.at(-1)!));
    for (const m of ALL_COURSE.modules) {
      for (const w of m.words) {
        expect(w).toBe(w.toLowerCase());
        expect([...w].every((c) => isTypeable(c) && keys.has(c)), w).toBe(true);
      }
    }
  });

  // Je neuer Lerneinheit (ohne Satzzeichen, die hängt der Generator an, siehe unten) mindestens 3 tippbare Wörter. Ziffern bilden Zahlengruppen und brauchen kein Wort, Sonderzeichen stehen in ihrer Rolle (`@`, Klammern, Präfix, `€`) und brauchen auch keins. Ein Wort-Zeichen
  // (Apostroph) zählt wie ein Buchstabe: drei Wörter, die es enthalten. Großbuchstaben
  // stehen am Wortanfang: Für eine Umschalttaste zählen Wörter, die mit einem Buchstaben ihrer Hand beginnen, für die großen Umlaute
  // Wörter, die mit ä, ö oder ü beginnen, für ß und jede andere Taste Wörter, die sie enthalten. Der Testkurs prüft die Regel, bevor Akt 4 sie braucht.
  it.each([['Kurs', ALL_COURSE, ALL_LESSONS, false], ['Testkurs mit Großschreibung', SHIFT_COURSE, CAPITAL_LESSONS, true], ['Testkurs mit Zeichen mit Umschalttaste', PUNCT_COURSE, PUNCT_SHIFT_LESSONS, true], ['Testkurs mit Zahlen', NUMBER_COURSE, NUMBER_LESSONS, true], ['Testkurs mit Sonderzeichen', SPECIAL_COURSE, SPECIAL_LESSONS, true]])('jeder Auftrag mit Wörtern (%s) hat je neuer Lerneinheit mindestens 3 tippbare Wörter', (_name, course, ids, wordMode) => {
    const words = allWords(course);
    for (const id of ids) {
      const keys = keysUpTo(course, id);
      const usable = usableWords(words, keys.filter((k) => !isPunctuation(k) && !isDigit(k)));
      if (wordMode) expect(usable.length, id).toBeGreaterThanOrEqual(MIN_WORDS_FOR_WORD_MODE);
      if (usable.length < MIN_WORDS_FOR_WORD_MODE) continue;
      for (const unit of learnKeys(findLesson(course, id).lesson.newKeys.filter((x) => !isPunctuation(x) && !isDigit(x) && !isSpecial(x)))) {
        const matching = isShiftKey(unit)
          ? usable.filter((w) => charsOf(unit, keys).some((c) => w.startsWith(c.toLowerCase())))
          : unit === UMLAUTE_GROSS
            ? usable.filter((w) => /^[äöü]/.test(w))
            : usable.filter((w) => w.includes(unit));
        expect(matching.length, `${id} ${unit}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  // Gilt für alle Lerneinheiten, auch Satzzeichen, Umschalttasten und Ziffern; die Testkurse prüfen die Regel, bevor ein echter Akt sie braucht.
  // Der echte Kurs läuft je Modul als eigener Fall: mit sechs Akten (28 Aufträge × 300 Runden) riss ein Fall im parallelen Gesamtlauf das Zeitlimit.
  it.each([
    ...ALL_COURSE.modules.map((m): [string, Course, string[]] => [`Kurs ${m.id}`, ALL_COURSE, m.lessons.map((l) => l.id)]),
    ['Testkurs mit Satzzeichen', PUNCT_COURSE, lessonOrder(PUNCT_COURSE)],
    ['Testkurs mit Großschreibung', SHIFT_COURSE, CAPITAL_LESSONS],
    ['Testkurs mit Zahlen', NUMBER_COURSE, lessonOrder(NUMBER_COURSE)],
    ['Testkurs mit Sonderzeichen', SPECIAL_COURSE, lessonOrder(SPECIAL_COURSE)],
  ] as [string, Course, string[]][])('jede neue Lerneinheit jedes Auftrags (%s) kommt in einer Übungsrunde (40 Zeichen) auf mindestens 80 %% ihres Gewichts vor', (_name, course, ids) => {
    const words = allWords(course);
    const SEEDS = 300;
    for (const id of ids) {
      const allowed = keysUpTo(course, id);
      const focus = findLesson(course, id).lesson.newKeys;
      const share = charWeights({ allowed, focus });
      const counts = new Map<string, number>();
      let letters = 0;
      for (let seed = 1; seed <= SEEDS; seed++) {
        const t = generateText({ allowed, focus, words, length: 40, rng: createRng(seed) }).replaceAll(' ', '');
        letters += t.length;
        for (const c of t) counts.set(learnKey(c), (counts.get(learnKey(c)) ?? 0) + 1);
      }
      for (const k of learnKeys(focus)) expect((counts.get(k) ?? 0) / letters, `${id} ${k}`).toBeGreaterThanOrEqual(0.8 * (share.get(k) ?? 0));
    }
  });

  it('Satzzeichen-Tasten kommen in jeder Runde des Testkurses vor und stehen nie mitten im Wort', () => {
    const words = allWords(PUNCT_COURSE);
    for (const [id, key] of [['p2a', ','], ['p2b', '.'], ['p2c', '-']] as const) {
      const allowed = keysUpTo(PUNCT_COURSE, id);
      let withKey = 0;
      for (let seed = 1; seed <= 100; seed++) {
        const t = generateText({ allowed, focus: [key], words, length: 40, rng: createRng(seed) });
        if (t.includes(key)) withKey++;
        expect(t, id).not.toMatch(/[,.-]{2}|^[,.-]|[,.][^ ]| [,.-]/);
      }
      expect(withKey, id).toBeGreaterThan(90);
    }
  });

  it('Zeichen mit Umschalttaste (Testkurs): kommen in jeder Runde ihres Auftrags vor, stehen nie mitten im Wort, der Apostroph nur in Wörtern', () => {
    const words = allWords(PUNCT_COURSE);
    for (const [id, keys] of [['p3a', '?!'], ['p3b', ':;'], ['p3c', '"\'']] as const) {
      const allowed = keysUpTo(PUNCT_COURSE, id);
      const focus = findLesson(PUNCT_COURSE, id).lesson.newKeys;
      const withKey = new Map([...keys].map((k) => [k, 0]));
      for (let seed = 1; seed <= 100; seed++) {
        const t = generateText({ allowed, focus, words, length: 40, rng: createRng(seed) });
        for (const k of keys) if (t.includes(k)) withKey.set(k, (withKey.get(k) ?? 0) + 1);
        expect(t, id).not.toMatch(/[?!:;]["?!:;,.-]|[?!:;][^ ]| [?!:;]|^[?!:;]|[:;]$|^"[^"]*$/);
        for (const u of t.split(/[ -]/)) expect(u.replace(/^"|"$/g, ''), id).toMatch(/^[A-Za-z]+(?:'s)?[,.?!:;]?$/);
      }
      for (const k of keys) expect(withKey.get(k), `${id} ${k}`).toBeGreaterThan(85);
    }
  });

  it('seltene Tasten: „ö“ (Auftrag 4) mindestens 5-mal, „ä“ (Auftrag 6) mindestens 4-mal je Runde', () => {
    const words = allWords(ALL_COURSE);
    for (const [id, key, min] of [['m1-l4', 'ö', 5], ['m1-l6', 'ä', 4]] as const) {
      const allowed = keysUpTo(ALL_COURSE, id);
      const focus = findLesson(ALL_COURSE, id).lesson.newKeys;
      let n = 0;
      for (let seed = 1; seed <= 300; seed++) n += [...generateText({ allowed, focus, words, length: 40, rng: createRng(seed) })].filter((c) => c === key).length;
      expect(n / 300, `${id} ${key}`).toBeGreaterThanOrEqual(min);
    }
  });

  it('jeder Auftrag hat Titel, Briefing und Story; jedes Modul Beschriftung und Einsatz-Story', () => {
    expect(ALL_ACTS.length).toBeGreaterThan(0);
    // Briefing und Abschluss je Auftrag: Bilderbuch oder Chat; dazu drei Stufen im Chat
    const triggers = ALL_SCENES.map((s) => s.trigger);
    for (const act of ALL_ACTS) for (const l of act.module.lessons) expect(l.title.length, l.id).toBeGreaterThan(0);
    for (const act of BUILT_ACTS) {
      for (const l of act.module.lessons) {
        const id = l.id;
        const hasBriefing = !!act.book.lessons[id]?.briefing?.length || triggers.some((t) => t.on === 'briefing' && t.lessonId === id);
        const hasDone = !!act.book.lessons[id]?.mastered?.length || triggers.some((t) => t.on === 'mastered' && t.lessonId === id);
        expect(hasBriefing, `Briefing ${id}`).toBe(true);
        expect(hasDone, `Abschluss ${id}`).toBe(true);
        for (const at of [0.25, 0.5, 0.75]) expect(triggers.some((t) => t.on === 'stage' && t.lessonId === id && t.at === at), `Stufe ${at} ${id}`).toBe(true);
      }
    }
    for (const act of ALL_ACTS) {
      expect(act.label.act.length, act.module.id).toBeGreaterThan(0);
      expect(act.label.place.length, act.module.id).toBeGreaterThan(0);
    }
    // die Nachschlage-Funktion kennt die Akte im Spiel
    for (const m of COURSE.modules) expect(moduleLabel(STORY, m.id), m.id).toBeDefined();
    for (const act of ALL_ACTS) {
      const e = act.book.exam;
      const m = act.module;
      for (const t of [e.title, e.won, e.lost, e.segments, e.frame, e.ready, ...e.taunts]) expect(t.length > 0 && !hasEmoji(t), t).toBe(true);
      for (const lines of [e.intro, e.success, e.fail, e.backdoorOffer, e.backdoorTaken]) expect(lines.length, m.id).toBeGreaterThan(0);
    }
    expect(() => examStory(STORY, 'gibt-es-nicht')).toThrow();
  });
});

describe('Akte und Module', () => {
  it('jeder Akt bringt genau ein Modul: die Nummer des Akts ist die Stelle im Kurs', () => {
    COURSE.modules.forEach((m, i) => expect(moduleLabel(STORY, m.id)?.act, m.id).toBe(`Akt ${i + 1}`));
  });
});
