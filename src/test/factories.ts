// Gemeinsame Test-Hilfen: Profile, Anschläge, Mini-Kurs, feste Umgebung, Ton-Rekorder.

import type { Env, Sfx, SoundPort } from '../app/ports.ts';
import { ARCADE_MEDALS } from '../content/arcadeGames.ts';
import { BADGES } from '../content/badges.ts';
import { COURSE, WELCOME_AFTER_DAYS } from '../content/course.ts';
import { REWARDS } from '../content/rewards.ts';
import { defaultAvatar } from '../content/wardrobe.ts';
import { findModule, type Course } from '../domain/course.ts';
import type { KeyStat, ScoredKeystroke } from '../domain/keyStats.ts';
import type { MasteryCriteria } from '../domain/mastery.ts';
import type { LessonProgress, Profile, StoryState } from '../domain/profile.ts';
import { STORY } from '../app/rules.ts';
import { createProfile } from '../domain/profile.ts';
import type { Fallakte } from '../domain/book.ts';
import type { GameRules } from '../domain/rules.ts';

export const T0 = new Date(2026, 9, 1, 15).getTime();
export const DAY = 86_400_000;

/** Kriterien für Regeltests, die keinen Kurs brauchen (Werte wie früher DEFAULT_MASTERY) */
export const TEST_MASTERY: MasteryCriteria = { minSamples: 40, minAccuracy: 0.93, maxAvgMs: 1200 };

/** Profil mit sinnvollen Standardwerten; einzelne Felder überschreibbar */
export function profile(overrides: Partial<Profile> = {}): Profile {
  return { ...createProfile({ id: 'p1', firstName: 'Lena', codename: 'Vektor-07', avatar: defaultAvatar('w') }, T0, STORY.version), ...overrides };
}

/** Tastenwerte: 20 Anschläge, alle richtig, 500 ms; `timedSamples` folgt `samples` */
export function keyStat(over: Partial<KeyStat> = {}): KeyStat {
  return { samples: 20, accuracy: 1, avgMs: 500, timedSamples: over.samples ?? 20, ...over };
}

/** Story-Stand mit diesen ausgelösten Szenen (Zeit 1); gelesen, Antworten und Version überschreibbar */
export function storyLog(ids: readonly string[], opts: Partial<Omit<StoryState, 'log'>> = {}): StoryState {
  return { v: 1, log: ids.map((id) => ({ id, t: 1 })), picks: {}, read: [], ...opts };
}

/**
 * Abzeichen verdient UND überreicht: die Meldung `badge-<id>` steht im Log (erst sie überreicht das Ding).
 * Inhaltsversion aktuell, damit beim Laden nichts nachgeholt wird.
 */
export function rewarded(...badgeIds: string[]): Pick<Profile, 'badges' | 'story'> {
  return { badges: Object.fromEntries(badgeIds.map((b) => [b, 1])), story: storyLog(badgeIds.map((b) => `badge-${b}`), { v: STORY.version }) };
}

/** n gleichartige Anschläge auf eine Taste */
export function strokes(ch: string, n: number, opts: { correct?: boolean | ((i: number) => boolean); ms?: number } = {}): ScoredKeystroke[] {
  const { correct = true, ms = 500 } = opts;
  return Array.from({ length: n }, (_, i) => {
    const ok = typeof correct === 'function' ? correct(i) : correct;
    return { expected: ch, correct: ok, ms: ok ? ms : null };
  });
}

/** Aufträge als geschafft markieren */
export function mastered(...ids: string[]): Record<string, LessonProgress> {
  return Object.fromEntries(ids.map((id) => [id, { exercises: 2, bestStars: 2 as const, mastered: true, best: 1 }]));
}

/** Alle Aufträge eines Moduls als geschafft markieren (Einsatz freigeschaltet) */
export function masteredModule(course: Course, moduleId: string): Record<string, LessonProgress> {
  return mastered(...findModule(course, moduleId).lessons.map((l) => l.id));
}

/** Kleiner Kurs für Regeltests: zwei Module mit je zwei Aufträgen, niedrige Schwellen */
export const TEST_COURSE: Course = {
  modules: [
    {
      id: 'a',
      title: 'Modul A',
      lessons: [
        { id: 'a1', title: 'Eins', newKeys: ['f', 'j'] },
        { id: 'a2', title: 'Zwei', newKeys: ['d', 'k'] },
      ],
      mastery: { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 },
      exam: { minAccuracy: 0.9, minApm: 60, durationSec: 10 },
      words: ['dd', 'kk'],
    },
    {
      id: 'b',
      title: 'Modul B',
      lessons: [{ id: 'b1', title: 'Drei', newKeys: ['s', 'l'] }],
      mastery: { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 },
      exam: { minAccuracy: 0.9, minApm: 60, durationSec: 10 },
      words: ['lass'],
    },
  ],
  practice: COURSE.practice,
};

/**
 * Kurs mit Satzzeichen: Buchstaben-Modul, ein Modul mit Komma, Punkt und Bindestrich (Einsatz mit allen gelernten Tasten), dann ein Modul mit
 * weiteren Buchstaben, Großbuchstaben und den Zeichen mit Umschalttaste `? !`, `: ;`, `" '` (Apostroph nur in den Wörtern `geht's` …)
 */
export const PUNCT_COURSE: Course = {
  modules: [
    {
      id: 'p1',
      title: 'Buchstaben',
      lessons: [
        { id: 'p1a', title: 'Eins', newKeys: ['a', 's', 'd', 'f'] },
        { id: 'p1b', title: 'Zwei', newKeys: ['j', 'k', 'l', 'e'] },
      ],
      mastery: { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 },
      exam: { minAccuracy: 0.9, minApm: 60, durationSec: 10 },
      words: ['das', 'lass', 'fall', 'jagd', 'kalk', 'seele', 'fass', 'dass', 'elfe', 'jadelf', 'kekse', 'sage', 'leder', 'alles'],
    },
    {
      id: 'p2',
      title: 'Satzzeichen',
      lessons: [
        { id: 'p2a', title: 'Komma', newKeys: [','] },
        { id: 'p2b', title: 'Punkt', newKeys: ['.'] },
        { id: 'p2c', title: 'Strich', newKeys: ['-'] },
      ],
      mastery: { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 },
      exam: { minAccuracy: 0.9, minApm: 150, durationSec: 20, keys: 'learned' },
      words: [],
    },
    {
      id: 'p3',
      title: 'Zeichen mit Umschalttaste',
      lessons: [
        { id: 'p3k', title: 'Buchstaben', newKeys: [...'ghtibwrumc'] },
        { id: 'p3g', title: 'Großbuchstaben', newKeys: [...'ASDFG'] },
        { id: 'p3a', title: 'Fragezeichen und Ausrufezeichen', newKeys: ['?', '!'] },
        { id: 'p3b', title: 'Doppelpunkt und Semikolon', newKeys: [':', ';'] },
        { id: 'p3c', title: 'Anführungszeichen und Apostroph', newKeys: ['"', "'"] },
      ],
      mastery: { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 },
      exam: { minAccuracy: 0.9, minApm: 150, durationSec: 20, keys: 'learned' },
      words: ["geht's", "gibt's", "hab's", "ist's", "war's", "tut's", "sag's", "mach's", 'mut', 'tag', 'ritt', 'bitte', 'wasser', 'bruch', 'wurm', 'warm', 'mich', 'mit', 'acht', 'buch', 'wach', 'mumm'],
    },
  ],
  practice: COURSE.practice,
};

/**
 * Kurs mit Zahlen (Vorbild für Akt 6): die Module von `PUNCT_COURSE` (Buchstaben, Satzzeichen, Zeichen mit Umschalttaste nach Großbuchstaben),
 * dann das Modul `n1` mit der Zahlenreihe in vier Aufträgen (`4 5 6 7`, `3 8`, `1 0`, `2 9`). `PUNCT_COURSE` bleibt, damit die Regressions-Tests gleich bleiben.
 */
export const NUMBER_COURSE: Course = {
  modules: [
    ...PUNCT_COURSE.modules,
    {
      id: 'n1',
      title: 'Zahlen',
      lessons: [
        { id: 'n1a', title: 'Vier bis Sieben', newKeys: [...'4567'] },
        { id: 'n1b', title: 'Drei und Acht', newKeys: [...'38'] },
        { id: 'n1c', title: 'Eins und Null', newKeys: [...'10'] },
        { id: 'n1d', title: 'Zwei und Neun', newKeys: [...'29'] },
      ],
      mastery: { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 },
      exam: { minAccuracy: 0.9, minApm: 150, durationSec: 20, keys: 'learned' },
      words: ['kasse', 'hafen', 'laden', 'sack', 'dach', 'gasse'],
    },
  ],
  practice: COURSE.practice,
};

/**
 * Kurs mit Großschreibung (Vorbild für Akt 4): ein Modul mit allen Kleinbuchstaben samt ä ö ü, dann ein Modul mit vier Aufträgen:
 * Großbuchstaben der linken Hand (rechte Umschalttaste), der rechten Hand (linke Umschalttaste), ß, Ä Ö Ü. Einsatz mit allen gelernten Tasten.
 */
export const SHIFT_COURSE: Course = {
  modules: [
    {
      id: 's1',
      title: 'Kleinbuchstaben',
      lessons: [
        { id: 's1a', title: 'Eins', newKeys: [...'asdfghjkl'] },
        { id: 's1b', title: 'Zwei', newKeys: [...'qwertzuiop'] },
        { id: 's1c', title: 'Drei', newKeys: [...'yxcvbnm'] },
        { id: 's1d', title: 'Vier', newKeys: [...'äöü'] },
      ],
      mastery: { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 },
      exam: { minAccuracy: 0.9, minApm: 60, durationSec: 10 },
      words: [
        ...['tisch', 'turm', 'rad', 'sand', 'dach', 'baum', 'garten', 'gans', 'wasser', 'esel', 'ente', 'eule', 'quelle', 'brot', 'fuchs', 'clown', 'vogel', 'xaver', 'yeti'],
        ...['hund', 'jacke', 'katze', 'lampe', 'mond', 'nase', 'insel', 'ofen', 'pilz', 'uhr', 'zug', 'maus', 'lilie', 'ziege', 'pinsel'],
        ...['äpfel', 'ärger', 'ähre', 'ärmel', 'äste', 'öl', 'öfen', 'öffnen', 'örtlich', 'über', 'übung', 'üben', 'überall', 'übermut', 'süd', 'fähre', 'möwe', 'hügel'],
      ],
    },
    {
      id: 's2',
      title: 'Großschreibung',
      lessons: [
        { id: 's2a', title: 'Linke Hand', newKeys: [...'QWERTASDFGYXCVB'] },
        { id: 's2b', title: 'Rechte Hand', newKeys: [...'ZUIOPHJKLNM'] },
        { id: 's2c', title: 'Scharfes S', newKeys: ['ß'] },
        { id: 's2d', title: 'Umlaute', newKeys: [...'ÄÖÜ'] },
      ],
      mastery: { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 },
      exam: { minAccuracy: 0.9, minApm: 150, durationSec: 20, keys: 'learned' },
      words: ['straße', 'fußball', 'süß', 'gruß', 'spaß', 'fleißig', 'grüße', 'weiß', 'heiß', 'maß'],
    },
  ],
  practice: COURSE.practice,
};

/**
 * Kurs mit Sonderzeichen (Vorbild für Akt 7): die Module von `NUMBER_COURSE` (Buchstaben, Satzzeichen, Zeichen mit Umschalttaste, Zahlen),
 * dann das Modul `x1` mit den drei Aufträgen von Akt 7 (`@ €`, `{ [ ] }`, `\ ~ |`); sein Einsatz dauert länger, weil neun Zeichen je Text nur in einem langen Text alle vorkommen (je Einheit höchstens eines). `NUMBER_COURSE` bleibt, damit die Regressions-Tests gleich bleiben.
 */
export const SPECIAL_COURSE: Course = {
  modules: [
    ...NUMBER_COURSE.modules,
    {
      id: 'x1',
      title: 'Sonderzeichen',
      lessons: [
        { id: 'x1a', title: 'Adresse und Preis', newKeys: ['@', '€'] },
        { id: 'x1b', title: 'Klammern', newKeys: [...'{[]}'] },
        { id: 'x1c', title: 'Befehlszeichen', newKeys: [...'\\~|'] },
      ],
      mastery: { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 },
      exam: { minAccuracy: 0.9, minApm: 150, durationSec: 60, keys: 'learned' },
      words: ['otti', 'tipp', 'nix', 'stopp', 'ort', 'maschine', 'aus', 'befehl', 'hacker', 'code'],
    },
  ],
  practice: COURSE.practice,
};

/** Leeres Bilderbuch für kleine Story-Bündel in Tests: `{ version: 1, scenes, objects: [], items: [], cases: [], ...NO_BOOK }` */
export const NO_BOOK = { book: { prolog: [], lessons: {}, exams: {} }, labels: {}, fallakten: {} } as const;

/** Das echte Bilderbuch samt Beschriftungen und Fallakten, für Bildschirme, die Module des Kurses zeigen (HQ), mit eigenen Szenen: `{ …, ...REAL_BOOK }` */
export const REAL_BOOK = { book: STORY.book, labels: STORY.labels, fallakten: STORY.fallakten } as const;

/** Kleinste gültige Fallakte, wo ein Test nur wissen will, dass es eine gibt */
export const TEST_FALLAKTE: Fallakte = { title: 'Akte', header: '', solved: [], firewall: { passed: '', backdoor: '' }, open: [], suspects: [], closing: '' };

export const TEST_RULES: GameRules = { course: TEST_COURSE, badges: BADGES, rewards: REWARDS, arcade: ARCADE_MEDALS, welcomeAfterDays: WELCOME_AFTER_DAYS };

/** Feste Umgebung: Zeit lässt sich vorspulen, Zufall und IDs sind vorhersehbar */
export function fixedEnv(start = T0): Env & { advance(ms: number): void } {
  let t = start;
  let seed = 1;
  let id = 0;
  return {
    now: () => t,
    seed: () => seed++,
    id: () => `id-${++id}`,
    advance: (ms) => {
      t += ms;
    },
  };
}

/** Umgebung, deren Uhr der (gefälschten) Systemzeit folgt – für Komponententests mit Fake-Timern */
export function clockEnv(): Env {
  let seed = 1;
  let id = 0;
  return { now: () => Date.now(), seed: () => seed++, id: () => `id-${++id}` };
}

export function soundRecorder(): SoundPort & { played: Sfx[]; enabled: boolean } {
  const rec = {
    played: [] as Sfx[],
    enabled: true,
    play(s: Sfx) {
      rec.played.push(s);
    },
    setEnabled(on: boolean) {
      rec.enabled = on;
    },
  };
  return rec;
}
