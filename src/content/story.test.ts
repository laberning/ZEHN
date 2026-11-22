// Story prüfen: Fallakten, Bilderbuch, Chat-Szenen, Extra-Fälle, Story-Objekte, Längen und Spoiler.
// Die Regeln gelten für alle Akte (auch STAGED_ACTS); was je Akt verschieden ist, liest der Test aus dem Prüfprofil `check` des Bündels.
// Weitere Inhaltstests: course.test.ts, rewards.test.ts, akt1.test.ts.

import { describe, expect, it } from 'vitest';
import { keysUpTo, lessonOrder } from '../domain/course.ts';
import { timeOf, timeVars, type TimeInfo } from '../domain/daytime.ts';
import { availableLines, fillLine, type ChatId, type Line } from '../domain/dialog.ts';
import { SHIFT_RIGHT, charsOf, isCapitalLetter, isShiftKey, isTypeable, keystrokeFor, learnKeys, type Finger } from '../domain/keyboard.ts';
import type { StoryRef } from '../domain/book.ts';
import { ALL_ACTS, BUILT_ACTS, ALL_CASES as EXTRA_CASES, ALL_COURSE, ALL_LESSONS, ALL_SCENES as SCENES, EXAM_STORY, LESSON_STORY, OBJECTS, actScenes, isMain, mainRank, masteredRank, sceneLines } from '../test/content.ts';
import { emojisIn, hasEmoji } from '../test/emoji.ts';
import { choiceIds } from './ids.ts';
import { ARCADE_GAMES } from './arcadeGames.ts';
import { BADGES } from './badges.ts';
import { COURSE } from './course.ts';
import { CREDITS_INTRO } from './credits.ts';
import { ITEMS } from './items.ts';
import { REWARDS } from './rewards.ts';
import { AKT1 } from './story/akt1/index.ts';
import { storyOf } from './story/acts.ts';
import { EMOJI_BY_SPEAKER } from './story/emoji.ts';
import { REWARD_SCENES } from './story/rewardScenes.ts';
import { STORY } from '../app/rules.ts';
import { fallakte, storyLines } from '../domain/book.ts';
import { caseCardHint } from './texts/hq.ts';
import { ALL_KRUEMEL_TIPS } from './texts/mission.ts';
import { SPEAKER_NAMES } from './texts/speakers.ts';

/** Fallakte: kein Datum, kein Countdown, nichts, was `check.spoilers` des Akts nennt (Wörter späterer Akte) */
const fallakteSpoiler = (spoilers: readonly string[]): RegExp =>
  new RegExp([...spoilers.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'countdown', '\\d{1,2}\\.\\s?\\d{1,2}\\.', '\\d{4}', 'noch \\d+ (tage|stunden)'].join('|'), 'i');

/** Eine Zeile mit `ifPicked` zeigt auf eine Szene und (falls genannt) eine Antwort, die es gibt */
function expectPickExists({ scene, choice }: { scene: string; choice: string | null }, where: string) {
  const target = SCENES.find((x) => x.id === scene);
  expect(target, `${where}: Szene ${scene}`).toBeDefined();
  if (choice !== null) expect(choiceIds(target!.lines), `${where}: Antwort ${choice}`).toContain(choice);
}

describe('Fallakte', () => {
  it('jedes Modul hat eine (Bild-Kennungen prüft der Typ); kein Datum, kein Countdown, nichts zu TIPPNIX oder Otti; keine Emoji', () => {
    for (const act of BUILT_ACTS) {
      const m = act.module;
      const f = act.fallakte;
      const spoiler = fallakteSpoiler(act.check.spoilers);
      expect(f, m.id).toBeDefined();
      const entries = [...f!.solved, ...f!.open];
      expect(f!.solved.length).toBeGreaterThan(0);
      expect(f!.open.length).toBeGreaterThan(0);
      // Zeilen mit ifPicked (Treffer-Zeilen unter „gelöst“, z. B. „du hast es zuerst gesagt“) zeigen auf eine Szene und Antwort, die es gibt
      for (const e of entries) if (e.ifPicked) expectPickExists(e.ifPicked, `${m.id}: ${e.text}`);
      const texts = [f!.title, f!.header, f!.closing, f!.firewall.passed, f!.firewall.backdoor, ...entries.flatMap((e) => [e.text, e.card ?? ''])];
      for (const t of texts) {
        expect(hasEmoji(t), t).toBe(false);
        expect(t, t).not.toMatch(spoiler);
      }
    }
    expect(fallakte(STORY, 'gibt-es-nicht')).toBeUndefined();
  });

  it('Verdächtige: mindestens einer je Fallakte, Texte bis 100 Zeichen ohne Spoiler, Treffer zeigen auf bekannte Szene und Antwort', () => {
    for (const act of BUILT_ACTS) {
      const m = act.module;
      const suspects = act.fallakte.suspects;
      const spoiler = fallakteSpoiler(act.check.spoilers);
      expect(suspects.length, m.id).toBeGreaterThan(0);
      for (const s of suspects) {
        for (const t of [s.name, s.text, ...s.hits.map((h) => h.text)]) {
          expect([...t].length, t).toBeLessThanOrEqual(100);
          expect(hasEmoji(t), t).toBe(false);
          expect(t, t).not.toMatch(spoiler);
        }
        for (const h of s.hits) {
          expect(h.ifPicked, h.text).toBeDefined();
          expectPickExists(h.ifPicked!, `${s.name}: ${h.text}`);
        }
      }
    }
  });

  it('Verdächtige: jeder hat ein Porträt, dieselbe Figur in jedem Akt dasselbe, kein Porträt für zwei Figuren', () => {
    const byName = new Map<string, Set<string>>();
    const byPicture = new Map<string, Set<string>>();
    for (const act of ALL_ACTS)
      for (const s of act.fallakte.suspects) {
        expect(s.picture, `${act.module.id} ${s.name}`).toMatch(/^portraet-/);
        byName.set(s.name, (byName.get(s.name) ?? new Set()).add(s.picture));
        byPicture.set(s.picture, (byPicture.get(s.picture) ?? new Set()).add(s.name));
      }
    expect([...byName].filter(([, pics]) => pics.size > 1).map(([name]) => name)).toEqual([]);
    expect([...byPicture].filter(([, names]) => names.size > 1).map(([pic]) => pic)).toEqual([]);
  });

});

/**
 * Tasten, die das Briefing zeigt: je neues Zeichen seine Taste; Großbuchstaben A–Z zeigen nur die Umschalttaste, die man dafür hält (je Hand einmal),
 * Ä Ö Ü und jedes andere Zeichen, das mit Umschalttaste getippt wird (Satzzeichen), die Umschalttaste und ihre Taste (je Umschalttaste einmal);
 * ein Zeichen der AltGr-Ebene (@ € { } [ ] \ ~ |) Alt Gr und seine Taste (Alt Gr einmal je Briefing)
 */
const briefingKeys = (chars: readonly string[]): string[] => [
  ...new Set(
    chars.flatMap((c) => {
      const k = keystrokeFor(c)!;
      const shift = k.shift === 'left' ? 'ShiftLeft' : 'ShiftRight';
      if (isCapitalLetter(c)) return [shift];
      if (k.altGr) return ['AltRight', k.key.code];
      return k.shift ? [shift, k.key.code] : [k.key.code];
    }),
  ),
];

/** Wort, an dem man einen Finger im Text erkennt (ein Wort je Finger; die Seite links/rechts prüft der Test nicht) */
const FINGER_WORD: Record<Finger, RegExp> = {
  lPinky: /kleine[rn]? Finger/i,
  rPinky: /kleine[rn]? Finger/i,
  lRing: /Ringfinger/i,
  rRing: /Ringfinger/i,
  lMiddle: /Mittelfinger/i,
  rMiddle: /Mittelfinger/i,
  lIndex: /Zeigefinger/i,
  rIndex: /Zeigefinger/i,
  thumb: /Daumen/i,
};

/** Nennt der Text den Finger der Lerneinheit? Bei mehreren Zeichen einer Einheit genügt ein Treffer; eine Umschalttaste tippt der kleine Finger */
function mentionsFingerOf(text: string, unit: string, newKeys: readonly string[]): boolean {
  const fingers: Finger[] = isShiftKey(unit) ? [unit === SHIFT_RIGHT ? 'rPinky' : 'lPinky'] : charsOf(unit, newKeys).map((c) => keystrokeFor(c)!.key.finger);
  return fingers.some((f) => FINGER_WORD[f].test(text));
}

/** Der Abschluss erinnert an die Hand, die hält, mit „hält“ oder „gehalten“ oder mit dem kleinen Finger */
const HOLD_WORD = /hält|gehalten|kleine[rn]? Finger/i;

describe('Mini-Tastatur in den Briefings', () => {
  it('Zeichen der AltGr-Ebene zeigen Alt Gr (einmal je Briefing) und ihre Taste', () => {
    expect(briefingKeys(['@', '€'])).toEqual(['AltRight', 'KeyQ', 'KeyE']);
    expect(briefingKeys(['{', '[', ']', '}'])).toEqual(['AltRight', 'Digit7', 'Digit8', 'Digit9', 'Digit0']);
    expect(briefingKeys(['\\', '~', '|'])).toEqual(['AltRight', 'Minus', 'BracketRight', 'IntlBackslash']);
  });

  it('zeigt genau die Tasten (KeyboardEvent.code) der neuen Zeichen des Auftrags, in QWERTZ: z ist KeyY, y ist KeyZ, - ist Slash', () => {
    for (const act of BUILT_ACTS) {
      for (const l of act.module.lessons) {
        const keys = act.chat.filter((s) => s.trigger.on === 'briefing' && s.trigger.lessonId === l.id).flatMap((s) => s.lines.flatMap((x) => x.keys ?? []));
        if (keys.length) expect(keys, l.id).toEqual(briefingKeys(l.newKeys));
      }
    }
  });

  it('Briefing nennt je neuer Lerneinheit den Finger (Umschalttasten: „hält“), der Abschluss wiederholt ihn (Story-Regel 13)', () => {
    const problems: string[] = [];
    for (const act of BUILT_ACTS) {
      for (const l of act.module.lessons) {
        const textOf = (on: 'briefing' | 'mastered', book: Line[] | undefined): string =>
          [...act.chat.filter((s) => s.trigger.on === on && s.trigger.lessonId === l.id).flatMap((s) => allTexts(s.lines)), ...allTexts(book ?? [])].join(' ');
        const briefing = textOf('briefing', LESSON_STORY[l.id]?.briefing);
        const done = textOf('mastered', LESSON_STORY[l.id]?.mastered);
        for (const unit of learnKeys(l.newKeys)) {
          const shift = isShiftKey(unit);
          if (shift ? !briefing.includes('hält') : !mentionsFingerOf(briefing, unit, l.newKeys)) problems.push(`${l.id} Briefing: ${unit}`);
        }
        // der Abschluss nennt den Finger jeder neuen Lerneinheit des Auftrags
        const units = learnKeys(l.newKeys);
        for (const u of units) if (!(isShiftKey(u) ? HOLD_WORD.test(done) : mentionsFingerOf(done, u, l.newKeys))) problems.push(`${l.id} Abschluss: ${u}`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('Story', () => {
  const refs: StoryRef[] = [
    { kind: 'prolog' },
    ...COURSE.modules.flatMap((m): StoryRef[] => [
      { kind: 'examIntro', moduleId: m.id },
      { kind: 'examSuccess', moduleId: m.id },
      { kind: 'examBackdoor', moduleId: m.id },
    ]),
    ...lessonOrder(COURSE).flatMap((lessonId): StoryRef[] => [
      { kind: 'briefing', lessonId },
      { kind: 'mastered', lessonId },
    ]),
  ];

  it('alle Szenen lösen auf; keine Emoji; Antworten haben Text', () => {
    for (const ref of refs) {
      const lines = storyLines(STORY, ref);
      // Aufträge, die der Chat erzählt, haben kein Bilderbuch
      if ((ref.kind === 'briefing' || ref.kind === 'mastered') && lines.length === 0) continue;
      expect(lines.length, JSON.stringify(ref)).toBeGreaterThan(0);
      for (const l of lines) {
        expect(hasEmoji(l.text), l.text).toBe(false);
        for (const c of l.choices ?? []) expect(c.text.length).toBeGreaterThan(0);
      }
    }
    expect(storyLines(STORY, { kind: 'briefing', lessonId: 'gibt-es-nicht' })).toEqual([]);
  });

  it('wer im Bilderbuch funkt („FUNK: …“), steht nicht auf der Bühne (offstage); Chat-Zeilen kennen das Feld nicht', () => {
    const withReplies = (lines: readonly Line[]): Line[] => lines.flatMap((l) => [l, ...withReplies((l.choices ?? []).flatMap((c) => c.reply ?? []))]);
    const exams = Object.values(EXAM_STORY).flatMap((e) => [e.intro, e.success, e.fail, e.backdoorOffer, e.backdoorTaken]);
    const lessons = Object.values(LESSON_STORY).flatMap((x) => [x.briefing ?? [], x.mastered ?? []]);
    for (const l of withReplies([...exams, ...lessons].flat())) expect(l.offstage === true, l.text).toBe(l.text.startsWith('FUNK:'));
    for (const s of SCENES) for (const l of withReplies(s.lines)) expect(l.offstage, `${s.id}: ${l.text}`).toBeUndefined();
  });
});

const SPEAKERS = Object.keys(SPEAKER_NAMES);
/** Befehle in geschweiften Klammern, die das Kind laut Prüfprofil tippt (Akt 7: `{stopp}`): wörtlicher Text, kein Platzhalter; `fill` lässt unbekannte Namen stehen */
const LITERAL_BRACES = ALL_ACTS.flatMap((a) => a.check.typed.flatMap((t) => [...t.word.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!)));
const PLACEHOLDERS = ['vorname', 'codename', 'agent', 'prozent', 'teile', 'wochentag', 'jetzt', 'gruss', ...REWARDS.ranks.map((r) => `rang_${r.key}`)];
// Tippi und Benno zählen dazu: Tippi schreibt so nur in ZEHN intern und im Qwertz-Flüstern, nie in den privaten Chats
const ADULTS = ['ada', 'baron', 'unbekannt', 'hubbel', 'tippi', 'benno'];
const PRIVATE_CHATS: ChatId[] = ['kruemel', 'juna'];

describe('Chat-Szenen', () => {
  const texts = (lines: readonly Line[]): string[] =>
    lines.flatMap((l) => [l.text, l.card?.title ?? '', l.card?.text ?? '', ...(l.choices ?? []).flatMap((c) => [c.label, c.text, ...texts(c.reply ?? [])])]);

  it('Rückfall-Gruß: jede Anfangsszene ab Akt 2 grüßt auch ohne gemerkte Antwort (`choice: null`), hinter allen Echo-Zeilen', () => {
    for (let n = 2; n <= 7; n++) {
      const lines = SCENES.find((s) => s.id === `a${n}-start`)!.lines;
      const echoes = lines.map((l, i) => [l, i] as const).filter(([l]) => l.ifPicked);
      const fallback = echoes.filter(([l]) => l.ifPicked!.choice === null);
      expect(fallback, `a${n}-start`).toHaveLength(1);
      expect(fallback[0]![0].text, `a${n}-start`).toContain('{gruss}');
      expect(fallback[0]![1], `a${n}-start`).toBe(Math.max(...echoes.map(([, i]) => i)));
    }
  });

  it('Deutungs-Wahlen der Gesamtprüfung: alle Kurzformen ohne Satzzeichen (Regel 2: Satzzeichen verraten die richtige Deutung)', () => {
    for (const id of ['l6-s25', 'a2-l3-s75', 'a2-l4-s75', 'a2-l5-s75', 'a5-l2-s50', 'a6-l2-s50', 'a7-l1-s50']) {
      const labels = SCENES.find((s) => s.id === id)!.lines.flatMap((l) => (l.choices ?? []).map((c) => c.label));
      expect(labels.length, id).toBeGreaterThan(0);
      for (const label of labels) expect(label, `${id}: ${label}`).not.toMatch(/[!?.,;:]/u);
    }
  });

  it('Szenen-IDs eindeutig; Antwort-IDs je Szene eindeutig; Kurzformen höchstens drei Wörter', () => {
    const ids = SCENES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const eachChoice = (lines: readonly Line[]): { id: string; label: string }[] => lines.flatMap((l) => (l.choices ?? []).flatMap((c) => [c, ...eachChoice(c.reply ?? [])]));
    for (const s of SCENES) {
      const cs = eachChoice(s.lines);
      expect(new Set(cs.map((c) => c.id)).size, s.id).toBe(cs.length);
      for (const c of cs) expect(c.label.trim().split(/\s+/).length, `${s.id}: ${c.label}`).toBeLessThanOrEqual(3);
    }
    for (const l of Object.values(LESSON_STORY).flatMap((x) => [...(x.briefing ?? []), ...(x.mastered ?? [])])) {
      for (const c of l.choices ?? []) expect(c.label.trim().split(/\s+/).length, c.label).toBeLessThanOrEqual(3);
    }
  });

  it('geschützte Leerzeichen nur als Escape', () => {
    for (const s of SCENES) for (const t of texts(s.lines)) expect(t.includes('\u00a0') || t.includes('undefined'), t).toBe(false);
  });

  it('Emoji nur im Text einer Figuren-Zeile, aus der Liste des Sprechers; höchstens eines je Nachricht, zwei je Szene (ADR-0006)', () => {
    const noEmoji = (t: string | undefined, where: string) => expect(hasEmoji(t ?? ''), where).toBe(false);
    const checkLines = (id: string, lines: readonly Line[]) => {
      let perScene = 0;
      for (const { line } of sceneLines(lines, 'intern')) {
        const found = emojisIn(line.text);
        perScene += found.length;
        expect(found.length, `${id}: ${line.text}`).toBeLessThanOrEqual(1);
        for (const e of found) expect(EMOJI_BY_SPEAKER[line.speaker], `${id}: ${e} bei ${line.speaker}: ${line.text}`).toContain(e);
        noEmoji(line.card?.title, id);
        noEmoji(line.card?.text, id);
        for (const c of line.choices ?? []) noEmoji(c.label, id);
      }
      expect(perScene, `${id}: Emoji je Szene`).toBeLessThanOrEqual(2);
    };
    for (const s of SCENES) checkLines(s.id, s.lines);
  });

  it('nur erlaubte Sprecher; in den privaten Chats (Krümel, Juna) schreibt kein Erwachsener', () => {
    for (const s of SCENES) {
      for (const { line, chat, where } of sceneLines(s.lines, s.chat)) {
        expect(SPEAKERS, `${s.id}: ${where}`).toContain(line.speaker);
        if (PRIVATE_CHATS.includes(chat)) expect(ADULTS, `${s.id} (${chat}): ${where}`).not.toContain(line.speaker);
      }
    }
    // Haupt-Szenen: das Kind antwortet nie öffentlich in Junas Kanal (dort lesen alle mit)
    for (const s of SCENES.filter(isMain)) for (const { chat, where, asks } of sceneLines(s.lines, s.chat)) expect(asks && chat === 'fluestern', `${s.id}: ${where}`).toBe(false);
    // Kringel und Otti sind keine Sprecher
    expect(SPEAKERS.filter((x) => /kringel|otti/.test(x))).toEqual([]);
  });

  it('korrigierte Nachrichten (`strike`): nur Tippi, nie leer, ohne Emoji; eine Szene, die das verletzt, fällt auf', () => {
    const strikeProblems = (scenes: readonly { id: string; chat: ChatId; lines: readonly Line[] }[]): string[] =>
      scenes.flatMap((s) =>
        sceneLines(s.lines, s.chat)
          .filter(({ line }) => line.strike !== undefined)
          .flatMap(({ line, where }) => [
            ...(line.speaker === 'tippi' ? [] : [`${s.id}: ${line.speaker} korrigiert (${where})`]),
            ...(line.strike!.trim() ? [] : [`${s.id}: leerer durchgestrichener Teil (${where})`]),
            ...(hasEmoji(line.strike!) ? [`${s.id}: Emoji im durchgestrichenen Teil (${where})`] : []),
          ]),
      );
    expect(strikeProblems(SCENES)).toEqual([]);
    const bad = { id: 'test', chat: 'intern' as ChatId, lines: [{ speaker: 'ada', text: 'Neu', strike: 'Alt' }, { speaker: 'tippi', text: 'Neu', strike: ' ' }, { speaker: 'tippi', text: 'Neu', strike: 'Alt 😀' }] as Line[] };
    expect(strikeProblems([bad])).toHaveLength(3);
  });

  it('Auslöser verweisen auf existierende Aufträge, Module und Abzeichen', () => {
    const lessons = new Set(ALL_LESSONS);
    const modules = new Set(ALL_COURSE.modules.map((m) => m.id));
    const badges = new Set(BADGES.map((b) => b.id));
    for (const { id, trigger: t } of SCENES) {
      if ('lessonId' in t) expect(lessons, id).toContain(t.lessonId);
      if ('moduleId' in t) expect(modules, id).toContain(t.moduleId);
      if (t.on === 'badge') expect(badges, id).toContain(t.badgeId);
      if (t.on === 'side') {
        expect(lessons, id).toContain(t.fromLesson);
        if (t.untilLesson) expect(lessons, id).toContain(t.untilLesson);
      }
    }
  });

  it('Platzhalter nur aus storyVars (dazu getippte Befehle wie `{stopp}`, nie gleichnamig mit einem Platzhalter); Story-Objekte, auf die Zeilen zeigen, existieren', () => {
    for (const name of LITERAL_BRACES) expect(PLACEHOLDERS, name).not.toContain(name);
    for (const s of SCENES) {
      for (const t of texts(s.lines)) for (const m of t.matchAll(/\{(\w+)\}/g)) expect([...PLACEHOLDERS, ...LITERAL_BRACES], `${s.id}: ${t}`).toContain(m[1]);
      for (const { line } of sceneLines(s.lines, s.chat)) {
        if (line.object) expect(OBJECTS.some((o) => o.lessonId === line.object!.lessonId), s.id).toBe(true);
      }
    }
  });

  it('an jeder Auswahl gibt es eine Antwort ohne Gadget; Haupt-Szenen verlangen sonst nichts', () => {
    const check = (lines: readonly Line[], id: string) =>
      lines.forEach((l) => {
        if (l.choices) expect(l.choices.some((c) => !c.needs), `${id}: ${l.text}`).toBe(true);
        l.choices?.forEach((c) => check(c.reply ?? [], id));
      });
    for (const s of SCENES) check(s.lines, s.id);
    for (const [id, st] of Object.entries(LESSON_STORY)) check([...(st.briefing ?? []), ...(st.mastered ?? [])], id);
    for (const m of ALL_COURSE.modules) {
      const e = EXAM_STORY[m.id]!;
      for (const lines of [e.intro, e.success, e.fail, e.backdoorOffer, e.backdoorTaken]) check(lines, m.id);
    }
  });

  it('selbst getippte Antworten stehen allein und nutzen nur gelernte Zeichen', () => {
    const order = ALL_LESSONS;
    const learned = (t: (typeof SCENES)[number]['trigger'], lastLesson: string): Set<string> => {
      const before = (id: string) => (order.indexOf(id) > 0 ? keysUpTo(ALL_COURSE, order[order.indexOf(id) - 1]!) : []);
      if (t.on === 'mastered') return new Set([' ', ...keysUpTo(ALL_COURSE, t.lessonId)]);
      if (t.on === 'briefing' || t.on === 'stage') return new Set([' ', ...before(t.lessonId)]);
      if (t.on === 'side') return new Set([' ', ...before(t.fromLesson)]);
      // Einsatz, Fälle, Abzeichen, Ränge: höchstens alle Tasten des eigenen Akts
      return new Set([' ', ...keysUpTo(ALL_COURSE, lastLesson)]);
    };
    type Typed = { lessonId: string; word: string };
    const walk = (lines: readonly Line[], ok: Set<string>, id: string, found: Typed[], lessonId: string) =>
      lines.forEach((l) => {
        if (l.choices?.some((c) => c.typed)) {
          expect(l.choices.length, `${id}: getippte Antwort steht allein`).toBe(1);
          for (const c of l.choices) {
            found.push({ lessonId, word: c.typed! });
            expect([...c.typed!].every((ch) => ok.has(ch) && isTypeable(ch)), `${id}: ${c.typed}`).toBe(true);
            expect(c.text, id).toBe(c.typed);
          }
        }
        l.choices?.forEach((c) => walk(c.reply ?? [], ok, id, found, lessonId));
      });
    /** Auftrag, zu dem die Szene gehört (Prüfprofil: `check.typed`) */
    const lessonOf = (t: (typeof SCENES)[number]['trigger']): string => ('lessonId' in t ? t.lessonId : t.on === 'side' ? t.fromLesson : '');
    const byLesson = (a: Typed, b: Typed) => a.lessonId.localeCompare(b.lessonId) || a.word.localeCompare(b.word);
    for (const act of ALL_ACTS) {
      const found: Typed[] = [];
      for (const s of actScenes(act)) walk(s.lines, learned(s.trigger, act.module.lessons.at(-1)!.id), s.id, found, lessonOf(s.trigger));
      expect(found.sort(byLesson), `${act.module.id}: getippte Antworten laut Prüfprofil`).toEqual([...act.check.typed].sort(byLesson));
    }
    // akt-neutrale Belohnungs-Szenen kommen jederzeit und gehören zu keinem Prüfprofil: keine getippten Antworten
    const neutral: Typed[] = [];
    for (const s of REWARD_SCENES) walk(s.lines, new Set(), s.id, neutral, '');
    expect(neutral, 'Belohnungs-Szenen ohne getippte Antworten').toEqual([]);
  });

  it('Echos (ifPicked): Antwort einer Haupt-Szene aus einem früheren Auftrag, keine eigenen Antworten; mindestens drei ohne Gadget', () => {
    /** Echo-Zeilen; `gadget`: liegt hinter einer Antwort, die ein Gadget braucht */
    const echoes = (lines: readonly Line[], gadget = false): { line: Line; gadget: boolean }[] =>
      lines.flatMap((l) => [...(l.ifPicked ? [{ line: l, gadget }] : []), ...(l.choices ?? []).flatMap((c) => echoes(c.reply ?? [], gadget || !!c.needs))]);
    /** Auftrag (Rang / 10) – Stufe und Abschluss desselben Auftrags werden oft zusammen abgespielt, gefiltert wird beim Start */
    const lessonRank = (rank: number) => Math.floor(rank / 10);
    // Bilderbuch: Abschluss eines Auftrags zählt wie dessen Abschluss-Szene
    const book = Object.entries(LESSON_STORY).flatMap(([lessonId, x]) => (x.mastered ? [{ id: `${lessonId} mastered`, rank: ALL_LESSONS.indexOf(lessonId) * 10 + 9, exam: false, lines: x.mastered }] : []));
    // Szenen nach dem Einsatz liegen im Rang beim Abschluss des letzten Auftrags, spielen aber erst danach: ein Echo auf dessen Stufen ist früher
    const all = [...SCENES.map((s) => ({ id: s.id, rank: isMain(s) ? mainRank(s) : Infinity, exam: s.trigger.on === 'exam', lines: s.lines })), ...book];
    const reachable = new Set<string>();
    for (const s of all) {
      for (const { line, gadget } of echoes(s.lines)) {
        const { scene, choice } = line.ifPicked!;
        const where = `${s.id} → ${scene}`;
        const target = SCENES.find((x) => x.id === scene);
        expect(target, where).toBeDefined();
        expect(isMain(target!), `${where}: Haupt-Szene`).toBe(true);
        expect(lessonRank(mainRank(target!)), `${where}: früherer Auftrag`).toBeLessThan(lessonRank(s.rank) + (s.exam ? 1 : 0));
        if (choice !== null) expect(choiceIds(target!.lines), where).toContain(choice);
        expect(line.choices ?? [], `${where}: keine Antworten an Echo-Zeilen`).toEqual([]);
        if (choice !== null && !gadget) reachable.add(scene);
      }
    }
    expect(reachable.size, 'Echos ohne Gadget auf verschiedene Szenen').toBeGreaterThanOrEqual(3);
  });

  it('nach dem Einsatz spielt die Szene in ZEHN intern zuerst (afterExamScreen nimmt die erste)', () => {
    for (const { module: m } of BUILT_ACTS) {
      const all = SCENES.filter((s) => s.trigger.on === 'exam' && s.trigger.moduleId === m.id);
      expect(all[0]?.chat, m.id).toBe('intern');
    }
  });

  it('Szenen-Reihenfolge: Briefing, Stufen, Abschluss je Auftrag in Listenreihenfolge', () => {
    // nur die Haupt-Szenen selbst; Übergaben (gift-*) mit demselben Auslöser stehen bei den Belohnungen
    const ranks = ALL_ACTS.flatMap((a) => a.chat).filter(isMain).map(mainRank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});

describe('Extra-Fälle', () => {
  const allNeeds = new Set<string>();
  const collect = (lines: readonly Line[]) => lines.forEach((l) => l.choices?.forEach((c) => (c.needs && allNeeds.add(c.needs), collect(c.reply ?? []))));
  for (const s of SCENES) collect(s.lines);
  for (const m of ALL_COURSE.modules) collect(EXAM_STORY[m.id]!.intro);

  it('Verweise stimmen: Auftrag, Szene, Gadget (Bedingung und Belohnung) und die drei Szenen je Fall', () => {
    const lessons = new Set(ALL_LESSONS);
    const ids = EXTRA_CASES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of EXTRA_CASES) {
      expect(lessons, c.id).toContain(c.fromLesson);
      if (c.afterScene) expect(SCENES.map((s) => s.id), c.id).toContain(c.afterScene);
      // Bedingung und Belohnung sind optional (Fälle ohne Gadget); wo sie da sind, stimmen sie
      const needs = c.needs ? ITEMS.find((i) => i.id === c.needs) : undefined;
      if (c.needs) expect(needs?.kind, c.id).toBe('gadget');
      // afterCase zeigt auf einen früheren Fall: die Kette hat keinen Kreis
      if (c.afterCase) expect(ids.indexOf(c.afterCase), c.id).toBeLessThan(ids.indexOf(c.id));
      if (c.afterCase) expect(ids, c.id).toContain(c.afterCase);
      if (needs) expect('badge' in needs.source, `${c.id}: Bedingung kommt aus der Spielhalle`).toBe(true);
      // Der Hinweis auf der gesperrten Karte nennt Gadget und Abzeichen; ein geheimes Abzeichen würde seine Beschreibung verraten
      const badge = needs && 'badge' in needs.source ? BADGES.find((b) => b.id === (needs.source as { badge: string }).badge) : undefined;
      if (needs) {
        expect(badge, `${c.id}: Abzeichen`).toBeDefined();
        expect(badge?.secret, `${c.id}: Abzeichen nicht geheim`).toBeFalsy();
        const hint = caseCardHint({ gadget: needs.name, solved: false, locked: true, badge, tip: false });
        expect(hint, c.id).toContain(needs.name);
        expect(hint, c.id).toContain(badge!.title);
        expect(hint, c.id).not.toContain('undefined');
        expect(hasEmoji(hint), c.id).toBe(false);
      }
      if (c.gives) expect(ITEMS.find((i) => i.id === c.gives)?.source, c.id).toEqual({ case: c.id });
      expect(hasEmoji(c.title + c.frame + c.reveal.title + c.reveal.text), c.id).toBe(false);
      for (const t of SCENES.filter((s) => (s.trigger.on === 'case' || s.trigger.on === 'caseOpen') && s.trigger.caseId === c.id).map((s) => s.trigger))
        expect(t.on === 'case' || t.on === 'caseOpen').toBe(true);
      expect(SCENES.some((s) => s.trigger.on === 'caseOpen' && s.trigger.caseId === c.id), `${c.id}: Ankündigung`).toBe(true);
      for (const part of ['intro', 'outro']) expect(SCENES.some((s) => s.trigger.on === 'case' && s.trigger.caseId === c.id && s.trigger.part === part), `${c.id}: ${part}`).toBe(true);
    }
    for (const s of SCENES) if ('caseId' in s.trigger) expect(ids, s.id).toContain(s.trigger.caseId);
  });

  it('jedes Spezial- und Fall-Gadget wird benutzt: als Bedingung eines Falls oder als zusätzliche Antwort', () => {
    const conditions = new Set(EXTRA_CASES.flatMap((c) => c.needs ?? []));
    for (const g of ITEMS.filter((i) => i.kind === 'gadget' && ('badge' in i.source || 'case' in i.source))) {
      expect(conditions.has(g.id) || allNeeds.has(g.id), g.id).toBe(true);
    }
  });

  it('Extra-Fälle sind erreichbar: Spielhalle ist offen, die Vorbedingungs-Szene ist eine Haupt-Szene bis zum Startauftrag', () => {
    const order = ALL_LESSONS;
    for (const c of EXTRA_CASES) {
      // Die Spielhalle öffnet sich nach dem ersten geschafften Auftrag (HQ); jeder Fall beginnt ab Auftrag 2 oder später
      expect(order.indexOf(c.fromLesson), c.id).toBeGreaterThanOrEqual(1);
      if (!c.afterScene) continue;
      // Haupt-Szenen sieht jedes Kind; eine Nebenszene oder Fall-Szene könnte ausbleiben. Ausnahme: die Tippstunden-Szenen
      // (`training`), die nach jeder Runde sicher kommen – dann gilt die Reihenfolge im Kurs nicht (das Training beginnt nach Akt 7).
      const after = SCENES.find((s) => s.id === c.afterScene)!;
      if (after.trigger.on === 'training') {
        // Tippstunden-Runden gibt es nur im letzten Auftrag; früher wäre der Fall nie zu sehen
        expect(c.fromLesson, `${c.id}: Training erst nach dem letzten Auftrag`).toBe(lessonOrder(COURSE).at(-1));
        continue;
      }
      expect(isMain(after), `${c.id}: ${c.afterScene} ist keine Haupt-Szene`).toBe(true);
      expect(mainRank(after), `${c.id}: ${c.afterScene} kommt nach dem Startauftrag`).toBeLessThan((order.indexOf(c.fromLesson) + 1) * 10);
    }
  });

  it('Nebenszenen: afterScene zeigt auf eine Haupt-Szene (kommt sicher), untilCase auf einen Fall', () => {
    for (const s of SCENES) {
      const t = s.trigger;
      if (t.on !== 'side') continue;
      if (t.afterScene) {
        const after = SCENES.find((x) => x.id === t.afterScene);
        expect(after && isMain(after), `${s.id}: ${t.afterScene}`).toBe(true);
      }
      if (t.untilCase) expect(EXTRA_CASES.map((c) => c.id), s.id).toContain(t.untilCase);
    }
  });

  it('Verweise auf Extra-Fälle haben eine Variante für „nicht gespielt“: nur Nebenszenen und Fälle hängen an Fällen', () => {
    for (const s of SCENES) {
      const t = s.trigger;
      if (t.on === 'side' && t.afterCase) {
        expect(EXTRA_CASES.map((c) => c.id), s.id).toContain(t.afterCase);
        // Ein Strang wartet an der kleinsten ungezeigten Szene: hängt sie an einem Fall, wären alle späteren für Nicht-Spieler gesperrt.
        // Ein Strang gehört zu einem Akt (gleicher Name in einem anderen Modul ist ein anderer Strang, siehe nextSideScene).
        const moduleOf = (lesson: string) => ALL_COURSE.modules.find((m) => m.lessons.some((l) => l.id === lesson))?.id;
        const strand = t.strand;
        const own = moduleOf(t.fromLesson);
        const last = Math.max(...SCENES.flatMap((x) => (x.trigger.on === 'side' && x.trigger.strand === strand && moduleOf(x.trigger.fromLesson) === own ? [x.trigger.order] : [])));
        expect(t.order, `${s.id}: Szene mit afterCase muss die letzte ihres Strangs sein`).toBe(last);
      }
      if (t.on !== 'side' && t.on !== 'case' && t.on !== 'caseOpen') expect(JSON.stringify(t), s.id).not.toContain('afterCase');
    }
    // Haupt-Szenen sprechen nicht über Fall-Ergebnisse als Voraussetzung (nur zusätzliche Antworten mit Gadget)
    const main = SCENES.filter((s) => ['briefing', 'stage', 'mastered', 'exam'].includes(s.trigger.on));
    for (const s of main) expect(JSON.stringify(s.trigger), s.id).not.toContain('Case');
  });
});

describe('Story-Objekte', () => {
  it('jeder Auftrag hat ein Objekt; Stufen beginnen bei 0 und steigen; keine Emoji', () => {
    for (const act of ALL_ACTS) expect(act.objects.map((o) => o.lessonId), act.module.id).toEqual(act.module.lessons.map((l) => l.id));
    for (const o of OBJECTS) {
      expect(o.stages[0]?.at, o.lessonId).toBe(0);
      expect(o.stages.at(-1)?.at, o.lessonId).toBe(1);
      o.stages.forEach((st, i) => {
        if (i > 0) expect(st.at, `${o.lessonId} Stufe ${i}`).toBeGreaterThan(o.stages[i - 1]!.at);
        for (const t of [st.text ?? '', ...(st.lines ?? [])]) expect(hasEmoji(t), t).toBe(false);
        const content = o.kind === 'text' ? st.text : o.kind === 'lines' ? st.lines : o.kind === 'nodes' ? st.lit : o.kind === 'idcard' ? st.card : st.picture;
        expect(content, `${o.lessonId} ${st.at}`).toBeDefined();
      });
      expect(hasEmoji(o.title)).toBe(false);
    }
  });
});

// ---------- Längen: docs/design/story-regeln.md ----------

const LIMITS = { chatScene: 7, sideScene: 4, chatText: 100, briefingKeysText: 120, bookLines: 10, bookText: 120 };

/**
 * Längster Weg durch Zeilen: je Wahl die ganze Antwort und die längste Reaktion.
 * Systemzeilen zählen nicht. Aufeinanderfolgende Zeilen mit `ifPicked` auf dieselbe Szene oder mit `ifTime` schließen sich aus – es zählt die längste.
 */
function longestPath(lines: readonly Line[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!;
    const group = [l];
    while ((l.ifPicked && lines[i + 1]?.ifPicked?.scene === l.ifPicked.scene) || (l.ifTime && lines[i + 1]?.ifTime)) group.push(lines[++i]!);
    const variants = group.map((g) => {
      const own = g.speaker === 'system' ? [] : [g.text];
      const branches = (g.choices ?? []).map((c) => [c.text, ...longestPath(c.reply ?? [])]);
      return [...own, ...branches.reduce<string[]>((a, b) => (b.length > a.length ? b : a), [])];
    });
    out.push(...variants.reduce<string[]>((a, b) => (b.length > a.length ? b : a), []));
  }
  return out;
}
/** Alle Texte, die das Kind lesen kann (alle Zweige), ohne Systemzeilen, Karten und Bilder; eine korrigierte Nachricht zählt den durchgestrichenen Teil mit */
const shownText = (l: Line): string => (l.strike ? `${l.strike} ${l.text}` : l.text);
function allTexts(lines: readonly Line[]): string[] {
  return lines.flatMap((l) => [...(l.speaker === 'system' ? [] : [shownText(l)]), ...(l.choices ?? []).flatMap((c) => [c.text, ...allTexts(c.reply ?? [])])]);
}
/** Texte (alle Zweige) über der Grenze; eine Zeile mit Mini-Tastatur (`keys`) darf `LIMITS.briefingKeysText` lang sein (Story-Regel 10) */
function tooLong(lines: readonly Line[], limit: number): string[] {
  return lines.flatMap((l) => [
    ...(l.speaker !== 'system' && [...shownText(l)].length > (l.keys?.length ? LIMITS.briefingKeysText : limit) ? [shownText(l)] : []),
    ...(l.choices ?? []).flatMap((c) => [...([...c.text].length > limit ? [c.text] : []), ...tooLong(c.reply ?? [], limit)]),
  ]);
}
const isLineList = (v: unknown): v is Line[] => Array.isArray(v) && v.every((l) => typeof l === 'object' && l !== null && 'speaker' in l);
const BOOK: [string, readonly Line[]][] = [
  ...ALL_ACTS.flatMap((a) => (a.book.prolog ? [['Prolog', a.book.prolog] as [string, Line[]]] : [])),
  ...Object.entries(LESSON_STORY).flatMap(([id, x]) => Object.entries(x).map(([k, v]) => [`${id} ${k}`, v] as [string, Line[]])),
  ...Object.entries(EXAM_STORY).flatMap(([id, x]) => Object.entries(x).filter(([, v]) => isLineList(v)).map(([k, v]) => [`${id} ${k}`, v as Line[]] as [string, Line[]])),
];

describe('Längen (Story-Regeln)', () => {
  it('eine korrigierte Nachricht zählt den durchgestrichenen Teil, ein Leerzeichen und den Text zusammen', () => {
    expect(allTexts([{ speaker: 'tippi', text: 'Für mich!', strike: 'Für wen' }])).toEqual(['Für wen Für mich!']);
  });

  it(`Chat-Szenen: höchstens ${LIMITS.chatScene} Nachrichten (Nebenszenen ${LIMITS.sideScene}), je höchstens ${LIMITS.chatText} Zeichen (Zeilen mit Mini-Tastatur ${LIMITS.briefingKeysText})`, () => {
    const problems: string[] = [];
    for (const s of SCENES) {
      const max = s.trigger.on === 'side' || s.trigger.on === 'training' ? LIMITS.sideScene : LIMITS.chatScene;
      const n = longestPath(s.lines).length;
      if (n > max) problems.push(`${s.id}: ${n} Nachrichten (höchstens ${max})`);
      for (const t of tooLong(s.lines, LIMITS.chatText)) problems.push(`${s.id}: ${[...t].length} Zeichen – ${t}`);
    }
    expect(problems).toEqual([]);
  });

  it('Tippstunden-Szenen (`training`): Runden eindeutig und streng steigend in Dateireihenfolge, nur ZEHN intern, Chat Juna und Chat Krümel', () => {
    const rounds = SCENES.flatMap((s) => (s.trigger.on === 'training' ? [{ id: s.id, round: s.trigger.round, chat: s.chat }] : []));
    expect(rounds.length).toBeGreaterThan(0);
    expect(rounds.map((r) => r.round)).toEqual([...new Set(rounds.map((r) => r.round))].sort((a, b) => a - b));
    for (const r of rounds) {
      expect(r.id, 'Kennung trägt die Runde').toBe(`tr-round-${r.round}`);
      expect(['intern', 'juna', 'kruemel'], r.id).toContain(r.chat);
    }
  });

  it(`Bilderbuch: höchstens ${LIMITS.bookLines} Zeilen je Stück, je höchstens ${LIMITS.bookText} Zeichen`, () => {
    const problems: string[] = [];
    for (const [name, lines] of BOOK) {
      const n = longestPath(lines).length;
      if (n > LIMITS.bookLines) problems.push(`${name}: ${n} Zeilen`);
      for (const t of allTexts(lines)) if ([...t].length > LIMITS.bookText) problems.push(`${name}: ${[...t].length} Zeichen – ${t}`);
    }
    expect(problems).toEqual([]);
  });
});

describe('Tageszeit (ifTime)', () => {
  /** Jede Stunde jedes Wochentags (2026-11-01 ist ein Sonntag) */
  const TIMES = Array.from({ length: 7 * 24 }, (_, k) => timeOf(new Date(2026, 10, 1 + Math.floor(k / 24), k % 24).getTime()));
  const timed = (lines: readonly Line[]): Line[] => lines.flatMap((l) => [...(l.ifTime ? [l] : []), ...(l.choices ?? []).flatMap((c) => timed(c.reply ?? []))]);
  /** Form einer Szene für eine Zeit: Zeilenzahl, bei jeder Wahl die Form der Reaktion */
  const shape = (lines: readonly Line[], time: TimeInfo): unknown =>
    availableLines(lines, { owned: new Set(), picks: {}, time }).map((l) => (l.choices ?? []).map((c) => shape(c.reply ?? [], time)));
  const ALL: [string, readonly Line[]][] = [...SCENES.map((s): [string, readonly Line[]] => [s.id, s.lines]), ...BOOK];

  it('Zeilen mit Zeitbedingung tragen keine eigenen Antworten', () => {
    for (const [name, lines] of ALL) for (const l of timed(lines)) expect(l.choices, `${name}: ${l.text}`).toBeUndefined();
  });

  it('jede Szene hat zu jeder Stunde jedes Wochentags gleich viele Zeilen', () => {
    for (const [name, lines] of ALL) {
      const first = JSON.stringify(shape(lines, TIMES[0]!));
      for (const t of TIMES) expect(JSON.stringify(shape(lines, t)), `${name}: ${t.weekday} ${t.daypart}`).toBe(first);
    }
  });

  it('Baron grüßt nach Tageszeit, Ada sagt sonntags, dass keine Post kommt', () => {
    const at = (day: number, hour: number) => timeOf(new Date(2026, 10, day, hour).getTime()); // 2026-11-01: Sonntag
    const text = (id: string, i: number, time: TimeInfo) =>
      fillLine(availableLines(SCENES.find((s) => s.id === id)!.lines, { owned: new Set(), picks: {}, time })[i]!, timeVars(time)).text;
    expect(text('l3-s75', 1, at(3, 8))).toMatch(/^Guten Morgen, meine Lieben\./);
    expect(text('l3-s75', 1, at(3, 15))).toMatch(/^Guten Tag, meine Lieben\./);
    expect(text('l3-s75', 1, at(3, 19))).toMatch(/^Guten Abend, meine Lieben\./);
    expect(text('l3-s75', 1, at(3, 23))).toMatch(/^Noch wach, meine Lieben\?/);
    expect(text('l2-s75', 0, at(1, 9))).toMatch(/keine Post, es ist Sonntag/);
    expect(text('l2-s75', 0, at(2, 9))).toMatch(/gleich kommt der Postbote/);
  });

  it('Akt 1 nutzt die Zeit im Prolog, in der Reaktion auf „Nur ein Brötchen“, beim Baron und bei Ada', () => {
    expect(timed(ALL.find(([n]) => n === 'Prolog')![1]).length).toBeGreaterThanOrEqual(5);
    for (const id of ['l2-s75', 'l3-s75']) expect(timed(SCENES.find((s) => s.id === id)!.lines).length, id).toBeGreaterThanOrEqual(2);
  });
});

describe('Spoiler (Story-Regeln)', () => {
  // Den Namen des Barons erfährt man erst, wenn die Story ihn verrät (Prüfprofil: `check.revealFrom`, ab dem Abschluss dieses Auftrags)
  const NAME = /Baron|Backspace/;
  const lineTexts = (lines: readonly Line[]): string[] =>
    lines.flatMap((l) => [
      l.text,
      l.card?.title ?? '',
      l.card?.text ?? '',
      ...(l.object ? objectTexts(l.object.lessonId, l.object.at) : []),
      ...(l.choices ?? []).flatMap((c) => [c.label, c.text, ...lineTexts(c.reply ?? [])]),
    ]);
  /** sichtbare Texte eines Story-Objekts bis zur Stufe `at` */
  function objectTexts(lessonId: string, at: number): string[] {
    const o = OBJECTS.find((x) => x.lessonId === lessonId);
    return (o?.stages ?? []).filter((st) => st.at <= at).flatMap((st) => [o!.title, st.text ?? '', ...(st.lines ?? [])]);
  }

  it('kein Name des Barons, bevor die Story ihn verrät', () => {
    const found: string[] = [];
    const check = (where: string, texts: readonly string[]) => {
      for (const t of texts) if (NAME.test(t)) found.push(`${where}: ${t}`);
    };
    // Akte ohne `revealFrom` dürfen den Namen überall nennen
    for (const act of ALL_ACTS.filter((a) => a.check.revealFrom)) {
      const reveal = act.check.revealFrom!;
      expect(ALL_LESSONS, `${act.module.id}: revealFrom`).toContain(reveal);
      const upToReveal = (lessonId: string) => ALL_LESSONS.indexOf(lessonId) <= ALL_LESSONS.indexOf(reveal);
      const revealRank = masteredRank(reveal);
      const caseFrom = (caseId: string) => act.cases.find((c) => c.id === caseId)?.fromLesson ?? '';
      /** kann die Szene vor dem Abschluss des Auftrags `revealFrom` auftauchen? (Belohnungen und Ränge: immer möglich) */
      const early = (s: (typeof SCENES)[number]): boolean => {
        const t = s.trigger;
        if (t.on === 'side') return upToReveal(t.fromLesson);
        if (t.on === 'case' || t.on === 'caseOpen') return upToReveal(caseFrom(t.caseId));
        if (t.on === 'badge' || t.on === 'rank') return true;
        return mainRank(s) < revealRank;
      };
      for (const s of actScenes(act).filter(early)) check(s.id, lineTexts(s.lines));
      check(`${act.module.id} Prolog`, lineTexts(act.book.prolog ?? []));
      for (const l of act.module.lessons.filter((x) => upToReveal(x.id))) {
        check(`${l.id} Briefing`, lineTexts(act.book.lessons[l.id]?.briefing ?? []));
        check(`${l.id} Objekt`, objectTexts(l.id, l.id === reveal ? 0.99 : 1));
      }
    }
    expect(found).toEqual([]);
  });

  it('Kataloge (Spielhalle, Abzeichen, Dinge, Tipps, Credits, Belohnungs-Szenen) bleiben frei vom Namen des Barons', () => {
    const found: string[] = [];
    const check = (where: string, texts: readonly string[]) => {
      for (const t of texts) if (NAME.test(t)) found.push(`${where}: ${t}`);
    };
    for (const g of ARCADE_GAMES) check(`Spielhalle ${g.id}`, [g.title, g.teaser, g.intro]);
    for (const b of BADGES) check(`Abzeichen ${b.id}`, [b.title, b.description, b.icon]);
    for (const i of ITEMS) check(`Ding ${i.id}`, [i.name, i.description, ...(i.pieces ?? []).flatMap((e) => [e.name, e.text])]);
    check('Krümels Tipps', ALL_KRUEMEL_TIPS);
    check('Credits', [CREDITS_INTRO]);
    for (const s of REWARD_SCENES) check(s.id, lineTexts(s.lines));
    expect(found).toEqual([]);
  });
});

describe('storyOf: Story-Bündel aus Akten', () => {
  it('nimmt nur die übergebenen Akte: Bilderbuch, Beschriftung und Fallakte je Modul, Dinge nur mit Quell-Szene im Bündel', () => {
    const one = storyOf([AKT1]);
    expect(Object.keys(one.book.exams)).toEqual(['m1']);
    expect(Object.keys(one.labels)).toEqual(['m1']);
    expect(Object.keys(one.fallakten)).toEqual(['m1']);
    expect(one.book.prolog).toBe(AKT1.book.prolog);
    // Dinge von Akt 2 kommen aus seinen Szenen: ohne den Akt nicht im Bündel
    const ids = one.items.map((i) => i.id);
    expect(ids).not.toContain('fernglas');
    expect(STORY.items.map((i) => i.id)).toContain('fernglas');
    // Dinge ohne Quell-Szene (Abzeichen, Ränge …) sind immer dabei
    for (const i of ITEMS.filter((x) => !('scene' in x.source))) expect(ids, i.id).toContain(i.id);
  });
});
