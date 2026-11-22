// Schreibseite des Fortschritts: Übungen, Einsätze und Spielhallen-Runden auswerten (EP, Sterne, Verlauf, Abzeichen,
// Beförderung) und die Hintertür nehmen. Reine Funktionen; die Abfragen dazu stehen in progress.ts (nie umgekehrt),
// gespeichert wird in app/store.ts.

import { betterMedal, medalFor, type MedalThresholds } from './arcade/levels.ts';
import { awardBadges, type BadgeEvent } from './badges.ts';
import { countDay, dayKey } from './days.ts';
import { findLesson, findModule, lastLessonOf } from './course.ts';
import { applyBackdoor, recordAttempt, type ExamEvaluation } from './exam.ts';
import type { ScoredKeystroke } from './keyStats.ts';
import { allMastered } from './mastery.ts';
import type { ArcadeGame, ExerciseKind, HistoryEntry, Profile } from './profile.ts';
import { averageApm, examState, lessonMastery, recordStrokes } from './progress.ts';
import { arcadeXp, rankFor, starsFor, xpFor, type Rank } from './rewards.ts';
import type { GameRules } from './rules.ts';
import type { SessionResult } from './typing.ts';

const HISTORY_LIMIT = 500;

export interface Reward {
  stars: 1 | 2 | 3;
  xp: number;
  newBadges: string[];
  lessonJustMastered: boolean;
  rankUp: Rank | null;
  newRecord: boolean;
  /** Dinge, die beim Speichern überreicht wurden – setzt der Store (Besitz nachher − vorher) */
  received?: readonly string[];
}

export interface Outcome {
  profile: Profile;
  reward: Reward;
}

function appendHistory(p: Profile, entry: HistoryEntry): HistoryEntry[] {
  return [...p.history, entry].slice(-HISTORY_LIMIT);
}

/** Gemeinsamer Abschluss jeder Auswertung: Serie, Abzeichen, Beförderung */
function conclude(prev: Profile, next: Profile, event: BadgeEvent, base: Omit<Reward, 'newBadges' | 'rankUp'>, rules: GameRules, now: number): Outcome {
  const withDay = { ...next, days: countDay(next.days, dayKey(now)) };
  const { profile, newBadges } = awardBadges(withDay, event, rules.badges, now);
  const before = rankFor(prev.xp, rules.rewards.ranks);
  const after = rankFor(profile.xp, rules.rewards.ranks);
  return { profile, reward: { ...base, newBadges, rankUp: after.title !== before.title ? after : null } };
}

export interface ExerciseInput {
  lessonId: string;
  kind: Exclude<ExerciseKind, 'exam'>;
  result: SessionResult;
  scored: readonly ScoredKeystroke[];
  now: number;
}

export function recordExercise(p: Profile, input: ExerciseInput, rules: GameRules): Outcome {
  const { lessonId, kind, result, scored, now } = input;
  const { module, lesson } = findLesson(rules.course, lessonId);
  const { rewards } = rules;
  const stars = starsFor(result, averageApm(p), rewards.stars);
  const full = xpFor(result, stars, rewards.xp);
  const xp = kind === 'warmup' ? Math.round(full * rewards.warmupXpFactor) : full;
  const { stats, latches } = recordStrokes(p, scored, rules.course);

  const old = p.lessons[lessonId] ?? { exercises: 0, bestStars: 0, mastered: false, best: 0 };
  const counts = kind === 'exercise';
  const exercises = old.exercises + (counts ? 1 : 0);
  const mastered = old.mastered || (counts && exercises >= rules.course.practice.exercisesPerLesson && allMastered(stats, lesson.newKeys, module.mastery, latches));
  const newRecord = kind !== 'warmup' && result.accuracy >= rewards.recordMinAccuracy && result.apm > p.bestApm;
  const best = mastered ? 1 : Math.max(old.best, lessonMastery({ stats }, rules.course, lessonId));

  const next: Profile = {
    ...p,
    xp: p.xp + xp,
    stats,
    latches,
    lessons: {
      ...p.lessons,
      [lessonId]: { exercises, bestStars: counts ? (Math.max(old.bestStars, stars) as 0 | 1 | 2 | 3) : old.bestStars, mastered, best },
    },
    history: appendHistory(p, { t: now, lessonId, kind, apm: result.apm, accuracy: result.accuracy, chars: result.length }),
    bestApm: newRecord ? result.apm : p.bestApm,
  };
  return conclude(p, next, { kind, lessonId, result, stars }, { stars, xp, lessonJustMastered: mastered && !old.mastered, newRecord }, rules, now);
}

export interface ExamInput {
  moduleId: string;
  result: SessionResult;
  evaluation: ExamEvaluation;
  scored: readonly ScoredKeystroke[];
  now: number;
}

export function recordExam(p: Profile, input: ExamInput, rules: GameRules): Outcome {
  const { moduleId, result, evaluation, scored, now } = input;
  const passed = evaluation.passed;
  const { rewards } = rules;
  const stars = passed ? starsFor(result, averageApm(p), rewards.stars) : 1;
  const xp = passed ? rewards.examPassXp + xpFor(result, stars, rewards.xp) : rewards.examFailXp;
  const lessonId = lastLessonOf(findModule(rules.course, moduleId)).id;
  const { stats, latches } = recordStrokes(p, scored, rules.course);
  const next: Profile = {
    ...p,
    xp: p.xp + xp,
    stats,
    latches,
    exams: { ...p.exams, [moduleId]: recordAttempt(examState(p, moduleId), passed) },
    history: appendHistory(p, { t: now, lessonId, kind: 'exam', apm: result.apm, accuracy: result.accuracy, chars: result.length }),
  };
  return conclude(p, next, { kind: 'exam', moduleId, result, stars, examPassed: passed }, { stars, xp, lessonJustMastered: false, newRecord: false }, rules, now);
}

/**
 * @param level zuletzt geschafftes Level der Runde (0: keins)
 * @param thresholds Medaillen-Schwellen des Spiels
 */
export function recordArcade(p: Profile, game: ArcadeGame, score: number, count: number, level: number, thresholds: MedalThresholds, now: number, rules: GameRules): Outcome {
  const old = p.arcade[game] ?? { best: 0, plays: 0, bestLevel: 0, medal: null };
  const medal = medalFor(level, thresholds);
  const newRecord = score > old.best && old.plays > 0;
  const xp = arcadeXp(score, rules.rewards.arcade);
  const next: Profile = {
    ...p,
    xp: p.xp + xp,
    arcade: { ...p.arcade, [game]: { best: Math.max(old.best, score), plays: old.plays + 1, bestLevel: Math.max(old.bestLevel, level), medal: betterMedal(old.medal, medal) } },
  };
  return conclude(p, next, { kind: 'arcade', arcade: { game, score, count, level, medal } }, { stars: 1, xp, lessonJustMastered: false, newRecord }, rules, now);
}

export function takeBackdoor(p: Profile, moduleId: string, now: number, rules: GameRules): Profile {
  const next = { ...p, exams: { ...p.exams, [moduleId]: applyBackdoor(examState(p, moduleId)) } };
  return awardBadges(next, { kind: 'backdoor', moduleId }, rules.badges, now).profile;
}
