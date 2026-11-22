// Ein Auftrag als reine Zustandsmaschine: Aufwärmen + Übungsrunden (oder 1 Spezialtraining),
// danach Nachbesprechung. Rundenzahl und -längen stehen im Kurs (course.practice). Speichern übernimmt die Anwendung (Phase 'saving').

import { findLesson, keysUpTo, allWords, type Course } from './course.ts';
import { learnKeys } from './keyboard.ts';
import { applyKeystrokes, type KeyStats } from './keyStats.ts';
import { applyLatched, sealsFor, type Latches, type MasteryCriteria, type Seal } from './mastery.ts';
import { NO_STORY, type RunStart, type StoryResult } from './story.ts';
import { findScene } from './scenes.ts';
import type { StoryContent } from './storyContent.ts';
import { isTrainingKind, type ExerciseKind, type Profile } from './profile.ts';
import { storySentences } from './storyText.ts';
import { averageApm, isModuleDone } from './progress.ts';
import type { Reward } from './record.ts';
import type { Rank } from './rewards.ts';
import { roundReview, type RoundReview } from './roundReview.ts';
import { createRng } from './rng.ts';
import { generateText, lengthForDuration } from './textGenerator.ts';
import { applyKey, expectedChar, isDone, layoutMismatch, startTyping, typingResult, type ErrorMode, type KeyPress, type SessionResult, type TypingState } from './typing.ts';

export type RoundKind = Exclude<ExerciseKind, 'exam'>;

export interface Round {
  kind: RoundKind;
  /** Nummer der Übungsrunde (1 …) und Anzahl – nur bei kind 'exercise' */
  n?: number;
  of?: number;
  seconds: number;
  focus: string[];
  /** Überschrift statt „Spezialtraining“ (Extra-Fälle) */
  frame?: string;
}

/** Was der Textgenerator über das Kind wissen muss */
export interface Learner {
  stats: KeyStats;
  avgApm: number | null;
  mode: ErrorMode;
}

export function learnerOf(p: Pick<Profile, 'stats' | 'history' | 'settings'>): Learner {
  return { stats: p.stats, avgApm: averageApm(p), mode: p.settings.flow ? 'flow' : 'strict' };
}

/** Eine einzelne Trainingsrunde statt der Übungsrunden: Spezialtraining beim Einsatz, (mit `caseId`/`frame`) ein Extra-Fall oder Bennos Tippstunde */
export interface Training {
  /** Spezialtraining beim Einsatz, Extra-Fall oder Bennos Tippstunde (zählt im Verlauf als eigene Art `tippstunde`) */
  kind: 'exam' | 'case' | 'tippstunde';
  keys: string[];
  frame?: string;
  caseId?: string;
}

/** Siegel zählen in Aufträgen und Extra-Fällen – nicht im Spezialtraining des Einsatzes */
export const showsSeals = (training?: Pick<Training, 'caseId'>): boolean => !training || !!training.caseId;

/**
 * Beim Start eines Durchgangs festhalten: Länge des Story-Logs, ob an einem offenen Auftrag geübt wird (`wasCurrent`)
 * und ob ein geschaffter Auftrag eines abgeschlossenen Akts wiederholt wird (`replay`: Einsatz des Moduls gespielt).
 */
export function runInfo(p: Pick<Profile, 'story' | 'lessons' | 'exams'>, course: Course, lessonId: string, training?: Pick<Training, 'caseId'>): RunStart {
  const seals = showsSeals(training);
  const mastered = !!p.lessons[lessonId]?.mastered;
  return { logStart: p.story.log.length, wasCurrent: seals && !mastered, replay: seals && mastered && isModuleDone(p, findLesson(course, lessonId).module.id) };
}

export function planRounds(course: Course, lessonId: string, training?: Pick<Training, 'kind' | 'keys' | 'frame'>): Round[] {
  const rules = course.practice;
  // Spezialtraining, Extra-Fälle und Tippstunde: genau eine Trainingsrunde
  if (training) return [{ kind: training.kind === 'tippstunde' ? 'tippstunde' : 'training', seconds: rules.trainingSec, focus: training.keys, frame: training.frame }];
  const { lesson } = findLesson(course, lessonId);
  const rounds: Round[] = [];
  if (keysUpTo(course, lessonId).length > rules.warmupAfterKeys) rounds.push({ kind: 'warmup', seconds: rules.warmupSec, focus: [] });
  for (let n = 1; n <= rules.exercisesPerLesson; n++) {
    rounds.push({ kind: 'exercise', n, of: rules.exercisesPerLesson, seconds: rules.exerciseSec, focus: lesson.newKeys });
  }
  return rounds;
}

/** Übungstext für eine Runde – zugeschnitten auf Tastenprofil und Tempo */
export function roundTyping(course: Course, lessonId: string, round: Round, learner: Learner, seed: number, story?: Pick<StoryContent, 'scenes'>): TypingState {
  const { module } = findLesson(course, lessonId);
  const allowed = keysUpTo(course, lessonId);
  const text = generateText({
    allowed,
    // Bennos Tippstunde streut Sätze aus der Geschichte als ganze Einheiten ein
    sentences: round.kind === 'tippstunde' && story ? storySentences(story, allowed) : undefined,
    focus: round.focus,
    words: allWords(course),
    length: lengthForDuration(learner.avgApm, round.seconds, course.practice),
    rng: createRng(seed),
    weak: {
      stats: learner.stats,
      criteria: module.mastery,
      // Im Training dürfen Schwächen mehr Raum bekommen
      maxShare: isTrainingKind(round.kind) ? course.practice.trainingWeakShare : course.practice.weakShare,
    },
  });
  return startTyping(text, learner.mode);
}

export type MissionPhase = 'typing' | 'saving' | 'between' | 'debrief';

export interface RoundDone {
  round: Round;
  result: SessionResult;
  reward: Reward;
  /** Krümels Rundenhinweis (welche Taste ging daneben); aus den Anschlägen abgeleitet, nicht gespeichert */
  review: RoundReview | null;
}

export interface MissionState {
  rounds: Round[];
  index: number;
  phase: MissionPhase;
  typing: TypingState;
  done: RoundDone[];
  press: KeyPress | null;
  layoutHint: boolean;
  /** Tastenprofil ohne die Anschläge der laufenden Runde (wächst mit jeder gespeicherten Runde) */
  baseStats: KeyStats;
  /** Tastenprofil beim Start des Durchgangs – für „vorher → jetzt“ in der Nachbesprechung */
  runStartStats: KeyStats;
  /** gemerkte Riegel beim Start des Durchgangs (zu `runStartStats`) */
  runStartLatches: Latches;
  /** Story-Ergebnis des Durchgangs (steht nach der letzten Runde fest) */
  story: StoryResult;
}

export type MissionAction =
  | { type: 'key'; ch: string; now: number; shift?: 'left' | 'right' }
  | { type: 'recorded'; reward: Reward; story?: StoryResult }
  | { type: 'next'; typing: TypingState };

export function missionStart(rounds: Round[], first: TypingState, stats: KeyStats = {}, latches: Latches = {}): MissionState {
  if (rounds.length === 0) throw new Error('missionStart: keine Runden');
  return { rounds, index: 0, phase: 'typing', typing: first, done: [], press: null, layoutHint: false, baseStats: stats, runStartStats: stats, runStartLatches: latches, story: NO_STORY };
}

export const currentRound = (s: MissionState): Round => s.rounds[s.index]!;
const isLastRound = (s: MissionState): boolean => s.index + 1 >= s.rounds.length;

export function missionReducer(s: MissionState, a: MissionAction): MissionState {
  switch (a.type) {
    case 'key': {
      if (s.phase !== 'typing') return s;
      const k = applyKey(s.typing, s.press, a.ch, a.now, a.shift);
      if (!k) return s;
      return {
        ...s,
        typing: k.typing,
        press: k.press,
        layoutHint: s.layoutHint || layoutMismatch(expectedChar(s.typing), a.ch),
        phase: isDone(k.typing) ? 'saving' : 'typing',
      };
    }
    case 'recorded': {
      if (s.phase !== 'saving') return s;
      const done = [...s.done, { round: currentRound(s), result: typingResult(s.typing), reward: a.reward, review: roundReview(s.typing.scored) }];
      return { ...s, done, baseStats: applyKeystrokes(s.baseStats, s.typing.scored), story: a.story ?? s.story, phase: isLastRound(s) ? 'debrief' : 'between' };
    }
    case 'next':
      if (s.phase !== 'between') return s;
      return { ...s, index: s.index + 1, typing: a.typing, phase: 'typing', press: null };
  }
}

/**
 * Wie es nach der Nachbesprechung weitergeht (Enter, Esc und Knöpfe benutzen dasselbe Ergebnis):
 * gerade geschafft → Story; neue Haupt-Szenen → im Funk lesen; eine Nebenszene → Hinweis und lesen; sonst noch eine Runde.
 */
export type DebriefNext =
  | { kind: 'story'; open: string[] }
  | { kind: 'readOpen'; open: string[] }
  | { kind: 'readSide'; side: string }
  | { kind: 'again' };

/**
 * Kommt nach dem Durchgang eine Stufe oder der Abschluss dieses Auftrags? Dann zeigt der Chat das Story-Objekt
 * mit seiner Entdeckung – die Nachbesprechung soll sie nicht vorwegnehmen.
 */
export function objectShownLater(open: readonly string[], story: Pick<StoryContent, 'scenes'>, lessonId: string): boolean {
  return open.some((id) => {
    const t = findScene(story, id)?.trigger;
    return !!t && (t.on === 'stage' || t.on === 'mastered') && t.lessonId === lessonId;
  });
}

export function debriefNext(summary: Pick<RoundsSummary, 'lessonJustMastered'>, result: StoryResult, story: Pick<StoryContent, 'scenes'>): DebriefNext {
  if (summary.lessonJustMastered) return { kind: 'story', open: result.open };
  if (result.open.length) return { kind: 'readOpen', open: result.open };
  // unbekannte Nebenszenen (veraltete Inhalte) werden übergangen
  if (result.side && findScene(story, result.side)) return { kind: 'readSide', side: result.side };
  return { kind: 'again' };
}

export interface RoundsSummary {
  xp: number;
  stars: number;
  newBadges: string[];
  rankUp: Rank | null;
  newRecord: boolean;
  lessonJustMastered: boolean;
  /** überreichte Dinge aller Runden */
  received: string[];
}

/** Fasst mehrere Belohnungen zusammen (Nachbesprechung) */
export function summarizeRewards(done: readonly Pick<RoundDone, 'round' | 'reward'>[]): RoundsSummary {
  const scored = done.filter((d) => d.round.kind !== 'warmup');
  return {
    xp: done.reduce((s, d) => s + d.reward.xp, 0),
    stars: Math.max(0, ...scored.map((d) => d.reward.stars)),
    newBadges: done.flatMap((d) => d.reward.newBadges),
    rankUp: done.findLast((d) => d.reward.rankUp)?.reward.rankUp ?? null,
    newRecord: done.some((d) => d.reward.newRecord),
    lessonJustMastered: done.some((d) => d.reward.lessonJustMastered),
    received: done.flatMap((d) => d.reward.received ?? []),
  };
}

/**
 * Siegel der Tasten (Lerneinheiten, `learnKeys`), wie sie jetzt stehen: gespeicherter Stand plus die Anschläge der laufenden Runde
 * bis zum letzten Wortende (die Werte ändern sich nur dort). Ist die Runde schon eingerechnet
 * (`recorded`), zählt sie nicht noch einmal. `latches` = die gemerkten offenen Riegel des Profils: Ein offener Riegel geht
 * auch mitten in der Runde nicht wegen eines einzelnen Fehlers zu.
 */
export function liveSeals(s: MissionState, keys: readonly string[], criteria: MasteryCriteria, latches: Latches = {}): Seal[] {
  if (s.phase !== 'typing' && s.phase !== 'saving') return sealsFor(s.baseStats, keys, criteria, latches);
  // Riegel wie beim Speichern Anschlag für Anschlag fortschreiben: Was in dieser Runde aufging, bleibt offen
  const units = learnKeys(keys);
  const live = applyLatched(s.baseStats, latches, scoredToWordEnd(s.typing), (k) => (units.includes(k) ? criteria : undefined));
  return sealsFor(live.stats, keys, criteria, live.latches);
}

/** Anschläge bis zum letzten abgeschlossenen Wort (Leerzeichen oder Textende) */
function scoredToWordEnd(t: TypingState): TypingState['scored'] {
  if (isDone(t)) return t.scored;
  if (t.position === 0) return [];
  const end = t.text.lastIndexOf(' ', t.position - 1);
  return end < 0 ? [] : t.scored.slice(0, end + 1);
}
