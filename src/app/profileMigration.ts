// Die einzige Stelle, an der gespeicherte Profile auf den aktuellen Stand gebracht werden.
// Genutzt beim Laden aus der Datenbank und beim Import einer Sicherungsdatei.

import { MEDALS } from '../domain/arcade/levels.ts';
import { lessonOrder } from '../domain/course.ts';
import type { ExamState } from '../domain/exam.ts';
import type { KeyStat } from '../domain/keyStats.ts';
import { HOW_KINDS, type HowShares } from '../domain/movement.ts';
import { LATCH_NAMES, type LatchName } from '../domain/mastery.ts';
import type { AgentDays, ArcadeRecord, Avatar, ExerciseKind, Gender, HistoryEntry, LessonProgress, Profile, Settings } from '../domain/profile.ts';
import { dayKey } from '../domain/days.ts';
import { createProfile } from '../domain/profile.ts';
import { lessonMastery, updateLatches } from '../domain/progress.ts';
import type { GameRules } from '../domain/rules.ts';
import type { WardrobeCatalog, WardrobeItem } from '../domain/wardrobe.ts';
import { catchUp } from '../domain/story.ts';
import { RULES, STORY, WARDROBE } from './rules.ts';
import type { StoryContent } from '../domain/storyContent.ts';

const pick = (v: unknown, allowed: readonly string[], fallback: string) => (typeof v === 'string' && allowed.includes(v) ? v : fallback);
const ids = (list: readonly WardrobeItem[]) => list.map((x) => x.id);

/** Macht aus älteren oder kaputten Avatardaten einen gültigen Avatar (gültig: kommt im Garderobe-Katalog vor) */
export function normalizeAvatar(a: Partial<Record<keyof Avatar, unknown>> | undefined, catalog: WardrobeCatalog = WARDROBE): Avatar {
  const gender: Gender = a?.gender === 'm' ? 'm' : 'w';
  const d = catalog.defaultAvatar(gender);
  const outfitColor = pick(a?.outfitColor, catalog.clothColors, d.outfitColor);
  return {
    gender,
    skin: pick(a?.skin, catalog.skinTones, d.skin),
    hairStyle: pick(a?.hairStyle, ids(catalog.hairStyles), d.hairStyle),
    hairColor: pick(a?.hairColor, catalog.hairColors, d.hairColor),
    eyeColor: pick(a?.eyeColor, catalog.eyeColors, d.eyeColor),
    outfit: pick(a?.outfit, ids(catalog.outfits), d.outfit),
    outfitColor,
    pants: pick(a?.pants, ids(catalog.pants), d.pants),
    pantsColor: pick(a?.pantsColor, catalog.clothColors, d.pantsColor),
    shoes: pick(a?.shoes, ids(catalog.shoes), d.shoes),
    shoesColor: pick(a?.shoesColor, catalog.clothColors, d.shoesColor),
    glasses: pick(a?.glasses, ids(catalog.glasses), d.glasses),
    head: pick(a?.head, ids(catalog.headwear), d.head),
    // früher hatte die Kopfbedeckung die Farbe des Oberteils
    headColor: pick(a?.headColor, catalog.clothColors, outfitColor),
    // Zubehör gab es früher nicht: keins, in der Farbe des Oberteils
    accessory: pick(a?.accessory, ids(catalog.accessories), d.accessory),
    accessoryColor: pick(a?.accessoryColor, catalog.clothColors, outfitColor),
  };
}

export class InvalidProfileError extends Error {}

/** Meldung, wenn eine Datei oder ein Datensatz keine Akte ist */
export const NOT_A_PROFILE = 'Diese Datei ist keine ZEHN-Akte.';

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const num = (v: unknown, fallback: number) => (isNum(v) ? v : fallback);
const obj = <T,>(v: unknown, fallback: T): T => (isObject(v) ? (v as T) : fallback);

/**
 * Agententage mit Typprüfung. Alte Spielstände hatten statt `days` eine Serie (`streak`): Dann wird geschätzt –
 * verschiedene Kalendertage im Verlauf, aber nie weniger als die Serie, die das Kind kannte.
 */
function daysOf(v: unknown, oldStreak: unknown, history: readonly HistoryEntry[], d: AgentDays): AgentDays {
  if (isObject(v)) return { count: num(v.count, d.count), lastDay: typeof v.lastDay === 'string' ? v.lastDay : null };
  const streak = obj<Record<string, unknown>>(oldStreak, {});
  const played = [...new Set(history.map((h) => dayKey(h.t)))].sort();
  const count = Math.max(played.length, num(streak.best, 0), num(streak.current, 0));
  const lastDay = typeof streak.lastDay === 'string' ? streak.lastDay : (played.at(-1) ?? null);
  return count === 0 ? d : { count, lastDay };
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** Objekt mit geprüften Werten: `check` liefert den Wert oder null (dann fällt der Eintrag weg) */
function recordOf<T>(v: unknown, check: (x: unknown) => T | null): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [k, x] of Object.entries(obj<Record<string, unknown>>(v, {}))) {
    const ok = check(x);
    if (ok !== null) out[k] = ok;
  }
  return out;
}

const numbersOf = (v: unknown): Record<string, number> => recordOf(v, (x) => (isNum(x) ? x : null));

function keyStatOf(v: unknown): KeyStat | null {
  if (!isObject(v) || !isNum(v.samples) || !isNum(v.accuracy)) return null;
  const avgMs = isNum(v.avgMs) ? v.avgMs : null;
  const stat: KeyStat = { samples: v.samples, accuracy: v.accuracy, avgMs, timedSamples: num(v.timedSamples, avgMs === null ? 0 : v.samples) };
  const how = howOf(v.how);
  return how ? { ...stat, how, howSamples: Math.max(0, Math.floor(num(v.howSamples, 0))) } : stat;
}

/** Anteile der Fehlerarten einer Taste: alle fünf Zahlen zwischen 0 und 1, sonst ohne */
function howOf(v: unknown): HowShares | null {
  if (!isObject(v)) return null;
  const shares = HOW_KINDS.map((k) => v[k]);
  return shares.every((x) => isNum(x) && x >= 0 && x <= 1) ? (Object.fromEntries(HOW_KINDS.map((k) => [k, v[k]])) as HowShares) : null;
}

/** Gemerkte Riegel einer Taste; unbekannte Namen fallen weg */
const latchesOf = (v: unknown): LatchName[] | null => (Array.isArray(v) ? LATCH_NAMES.filter((n) => v.includes(n)) : null);

const OUTCOMES: readonly ExamState['outcome'][] = ['open', 'passed', 'backdoor'];
function examOf(v: unknown): ExamState | null {
  if (!isObject(v) || !OUTCOMES.includes(v.outcome as ExamState['outcome'])) return null;
  const e: ExamState = { attempts: num(v.attempts, 0), outcome: v.outcome as ExamState['outcome'] };
  return v.usedBackdoor === true ? { ...e, usedBackdoor: true } : e;
}

const arcadeOf = (v: unknown): ArcadeRecord | null =>
  isObject(v) && isNum(v.best) && isNum(v.plays)
    ? { best: v.best, plays: v.plays, bestLevel: isNum(v.bestLevel) ? Math.max(0, Math.floor(v.bestLevel)) : 0, medal: MEDALS.find((m) => m === v.medal) ?? null }
    : null;

const KINDS: readonly ExerciseKind[] = ['warmup', 'exercise', 'training', 'tippstunde', 'exam'];
function historyOf(v: unknown): HistoryEntry[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (h): h is HistoryEntry =>
      isObject(h) && isNum(h.t) && typeof h.lessonId === 'string' && KINDS.includes(h.kind as ExerciseKind) && isNum(h.apm) && isNum(h.accuracy) && isNum(h.chars),
  );
}

function settingsOf(v: unknown, d: Settings): Settings {
  const raw = obj<Record<string, unknown>>(v, {});
  const bool = (x: unknown, fallback: boolean) => (typeof x === 'boolean' ? x : fallback);
  return { flow: bool(raw.flow, d.flow), sound: bool(raw.sound, d.sound), blind: bool(raw.blind, d.blind) };
}

/** Story-Stand mit Typprüfung; was fehlt, bekommt den Startwert (Version 0 = noch nie abgeglichen) */
function storyOf(v: unknown, d: Profile['story']): Profile['story'] {
  if (!isObject(v)) return { ...d, v: 0 };
  const log = Array.isArray(v.log)
    ? v.log.filter((l): l is { id: string; t: number } => isObject(l) && typeof l.id === 'string' && typeof l.t === 'number')
    : [];
  const picks = Object.fromEntries(Object.entries(obj<Record<string, unknown>>(v.picks, {})).map(([k, ids]) => [k, strings(ids)]));
  return { v: num(v.v, 0), log, picks, read: strings(v.read) };
}

/**
 * Inhaltsversion 5: Das halbe Foto steht nicht mehr in `exam-after`, sondern in der eigenen Szene `exam-after-foto`.
 * Die dort gewählte Antwort (die zweite Wahl in `exam-after`) zieht mit. War `exam-after` noch ungelesen,
 * kommt die Foto-Szene ebenfalls ungelesen ins Log – sonst markierte der Abgleich sie als gelesen, und das Kind sähe sie nie.
 */
function movePhotoPick(s: Profile['story']): Profile['story'] {
  if (s.v >= 5) return s;
  const after = s.log.find((l) => l.id === 'exam-after');
  const log = after && !s.read.includes('exam-after') && !s.log.some((l) => l.id === 'exam-after-foto') ? [...s.log, { id: 'exam-after-foto', t: after.t }] : s.log;
  const [first, photo] = s.picks['exam-after'] ?? [];
  if (photo === undefined) return { ...s, log };
  return { ...s, log, picks: { ...s.picks, 'exam-after': first === undefined ? [] : [first], 'exam-after-foto': [photo] } };
}

/**
 * Aufträge mit allen Feldern. `best` fehlt in alten Spielständen: geschaffte Aufträge gelten als 1,
 * sonst gilt der aktuelle Stand der Tasten.
 */
function lessonsOf(v: unknown, stats: Profile['stats'], rules: GameRules): Record<string, LessonProgress> {
  const known = new Set(lessonOrder(rules.course));
  const out: Record<string, LessonProgress> = {};
  for (const [id, raw] of Object.entries(obj<Record<string, unknown>>(v, {}))) {
    if (!isObject(raw)) continue;
    const mastered = raw.mastered === true;
    const stars = num(raw.bestStars, 0);
    const current = known.has(id) ? lessonMastery({ stats }, rules.course, id) : 0;
    out[id] = {
      exercises: num(raw.exercises, 0),
      bestStars: Math.min(3, Math.max(0, Math.floor(stars))) as LessonProgress['bestStars'],
      mastered,
      best: mastered ? 1 : Math.min(1, Math.max(0, num(raw.best, current))),
    };
  }
  return out;
}

/**
 * Prüft und ergänzt ein gespeichertes Profil. Pflicht sind nur id, codename und schema;
 * alles andere wird – wenn es fehlt oder den falschen Typ hat – mit Startwerten aufgefüllt.
 * Wirft InvalidProfileError, wenn es keine Akte ist.
 */
export function migrateProfile(raw: unknown, rules: GameRules = RULES, story: StoryContent = STORY, wardrobe: WardrobeCatalog = WARDROBE): Profile {
  if (!isObject(raw) || typeof raw.id !== 'string' || !raw.id || typeof raw.codename !== 'string' || raw.schema !== 1) {
    throw new InvalidProfileError(NOT_A_PROFILE);
  }
  const avatar = normalizeAvatar(isObject(raw.avatar) ? raw.avatar : undefined, wardrobe);
  const firstName = typeof raw.firstName === 'string' ? raw.firstName : '';
  const d = createProfile({ id: raw.id, firstName, codename: raw.codename, avatar }, num(raw.createdAt, 0), story.version);
  const stats = recordOf(raw.stats, keyStatOf);
  const history = historyOf(raw.history);
  const migrated: Profile = {
    ...d,
    xp: num(raw.xp, d.xp),
    stats,
    // Alte Spielstände: Riegel, die heute offen sind, gelten als schon einmal offen
    latches: updateLatches(recordOf(raw.latches, latchesOf), stats, rules.course),
    lessons: lessonsOf(raw.lessons, stats, rules),
    exams: recordOf(raw.exams, examOf),
    badges: numbersOf(raw.badges),
    days: daysOf(raw.days, raw.streak, history, d.days),
    history,
    bestApm: num(raw.bestApm, d.bestApm),
    settings: settingsOf(raw.settings, d.settings),
    arcade: recordOf(raw.arcade, arcadeOf),
    seen: strings(raw.seen),
    story: movePhotoPick(storyOf(raw.story, d.story)),
    cases: numbersOf(raw.cases),
  };
  // Neue Inhalte erscheinen bei bestehenden Spielständen nicht nachträglich: Was jetzt fällig wäre, gilt als gelesen
  if (migrated.story.v >= story.version) return migrated;
  const caught = catchUp(migrated, story, rules);
  return { ...caught, story: { ...caught.story, v: story.version } };
}

/** Alle gespeicherten Profile laden; unlesbare werden übersprungen und gezählt. Sortiert nach Anlegedatum. */
export function loadProfiles(raw: readonly unknown[], rules: GameRules = RULES, story: StoryContent = STORY, wardrobe: WardrobeCatalog = WARDROBE): { profiles: Profile[]; broken: number } {
  const profiles: Profile[] = [];
  let broken = 0;
  for (const r of raw) {
    try {
      profiles.push(migrateProfile(r, rules, story, wardrobe));
    } catch {
      broken++;
    }
  }
  profiles.sort((a, b) => a.createdAt - b.createdAt);
  return { profiles, broken };
}
