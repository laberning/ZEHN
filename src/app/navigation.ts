// Welche Bildschirme es gibt und welche Wege zwischen ihnen führen (reine Funktionen; der Store navigiert und speichert).
// Story-Bildschirme speichern nur einen Verweis auf die Szene.

import type { Course } from '../domain/course.ts';
import type { ChatId, Choice } from '../domain/dialog.ts';
import type { Training } from '../domain/mission.ts';
import type { ArcadeGame, Profile } from '../domain/profile.ts';
import { storyEnd } from '../domain/progress.ts';
import { hasSeen, markSeen, seenKey } from '../domain/seen.ts';
import type { StoryRef } from '../domain/book.ts';
import { unread } from '../domain/story.ts';
import { isLogged, sceneFor } from '../domain/scenes.ts';
import type { StoryContent } from '../domain/storyContent.ts';

export type Screen =
  | { name: 'loading' }
  /** Spielstände konnten nicht geladen werden */
  | { name: 'error' }
  | { name: 'profiles' }
  | { name: 'create' }
  | { name: 'story'; story: StoryRef; then: Screen }
  /**
   * Agentenfunk. Ohne `play`/`chat`: die Chatliste. Mit `chat`: dieser Chat (ungelesene Szenen werden abgespielt).
   * Mit `play`: diese Szenen werden abgespielt. Am Ende geht es mit `then` weiter (Esc auch), Standard HQ;
   * mit `again` gibt es dazu den Hauptknopf „Noch eine Runde“.
   */
  | { name: 'funk'; play?: string[]; chat?: ChatId; then?: Screen; label?: string; again?: Screen }
  | { name: 'hq' }
  /** `training`: Spezialtraining beim Einsatz oder (mit `caseId`/`frame`) ein Extra-Fall */
  | { name: 'mission'; lessonId: string; training?: Training }
  | { name: 'exam'; moduleId: string }
  | { name: 'akte' }
  /** Fallakte eines Moduls (Akt); Esc und Zurück führen ins HQ */
  | { name: 'fallakte'; moduleId: string }
  | { name: 'badges' }
  | { name: 'wardrobe'; tab?: 'kleidung' | 'koffer' }
  | { name: 'credits' }
  /** Spielende (nach dem letzten Einsatz im Kurs); zeigt sich selbst als gesehen */
  | { name: 'ende' }
  | { name: 'arcade'; game: ArcadeGame };

export type ScreenName = Screen['name'];

/** Bildschirme, die ohne ausgewähltes Profil erreichbar sind */
export const PUBLIC_SCREENS: readonly ScreenName[] = ['loading', 'error', 'profiles', 'create', 'credits'];

/** Szenen im Agentenfunk abspielen, danach weiter zu `then` */
export const funkScreen = (play: string[], then?: Screen, extra: { label?: string; again?: Screen } = {}): Screen => ({ name: 'funk', play, then, ...extra });

/** Story-Szene zeigen, danach weiter zu `then` */
export const storyScreen = (story: StoryRef, then: Screen): Screen => ({ name: 'story', story, then });

/** Ein Weg: wohin es geht und was dabei (nach dem Navigieren) zu speichern ist */
export interface Route {
  screen: Screen;
  save?: Profile;
}

/**
 * Auftrag starten – beim ersten Mal mit Briefing: im Funk, wenn es eine Chat-Szene dafür gibt (erstes Mal = noch nicht im Log),
 * sonst als Bilderbuch (erstes Mal = noch nicht gesehen). Gemerkt wird „gesehen“; die Chat-Szene loggt dann das Speichern.
 */
export function briefingRoute(p: Profile, story: Pick<StoryContent, 'scenes'>, lessonId: string): Route {
  const key = seenKey.briefing(lessonId);
  const mission: Screen = { name: 'mission', lessonId };
  const scene = sceneFor(story, 'briefing', (t) => t.lessonId === lessonId);
  if (briefingSeen(p, story, lessonId)) return { screen: mission };
  if (scene) return { screen: funkScreen([scene.id], mission, { label: 'Auftrag starten ⏎' }), save: markSeen(p, key) };
  return { screen: storyScreen({ kind: 'briefing', lessonId }, mission), save: markSeen(p, key) };
}

/** Hat das Kind das Briefing dieses Auftrags schon gesehen (Chat-Szene im Log, sonst Bilderbuch gesehen)? */
export function briefingSeen(p: Profile, story: Pick<StoryContent, 'scenes'>, lessonId: string): boolean {
  const scene = sceneFor(story, 'briefing', (t) => t.lessonId === lessonId);
  return scene ? isLogged(p, scene.id) : hasSeen(p, seenKey.briefing(lessonId));
}

/** Einsatz – mit Intro, falls noch nicht gesehen */
export function examRoute(p: Profile, moduleId: string): Route {
  const key = seenKey.examIntro(moduleId);
  const exam: Screen = { name: 'exam', moduleId };
  if (hasSeen(p, key)) return { screen: exam };
  return { screen: storyScreen({ kind: 'examIntro', moduleId }, exam), save: markSeen(p, key) };
}

/**
 * Nach dem Einsatz: die Szene danach im Funk, falls sie noch ungelesen ist, sonst HQ.
 * War es der Einsatz des letzten Moduls im Kurs und ist das Ende noch nicht gesehen, kommt davor der Ende-Bildschirm statt des HQ.
 * Gibt es mehrere Einsatz-Szenen, spielt die erste der Liste; die übrigen meldet das HQ als neue Nachricht (Test in story.test.ts).
 */
export function afterExamScreen(p: Profile, story: Pick<StoryContent, 'scenes'>, course: Course, moduleId: string): Screen {
  const end = storyEnd(p, course);
  const home: Screen = end?.moduleId === moduleId && !hasSeen(p, seenKey.storyEnd(moduleId)) ? { name: 'ende' } : { name: 'hq' };
  const scene = sceneFor(story, 'exam', (t) => t.moduleId === moduleId);
  return scene && unread(p, story).includes(scene.id) ? funkScreen([scene.id], home) : home;
}

export interface ChatEnd {
  /** Esc und der Knopf im Kopf des Funks („Später lesen“/„Zurück ins HQ“) */
  leave: Screen;
  /** Hauptknopf (Enter) am Ende eines abgespielten Stücks; null in einem einfach geöffneten Chat */
  primary: { to: Screen; label: string } | null;
  /** zweiter Knopf neben dem Hauptknopf (zurück, später) */
  secondary: { to: Screen; label: string } | null;
}

/**
 * Wie es am Ende des Funks weitergeht. Ohne Weiteres: mit `then`, sonst ins HQ – die Chatliste steht im Funk ohnehin daneben.
 * `again` macht „Noch eine Runde“ zum Hauptknopf; eine Antwort mit Aktion (Paket: Garderobe) geht allem vor.
 */
export function chatEnd(screen: { play?: string[]; then?: Screen; label?: string; again?: Screen }, action?: Choice['action']): ChatEnd {
  const { play, then, label, again } = screen;
  const leave: Screen = then ?? { name: 'hq' };
  const back = again ? 'Zurück ins Hauptquartier' : 'Später';
  if (action === 'wardrobe') return { leave, primary: { to: { name: 'wardrobe', tab: 'kleidung' }, label: 'Zur Garderobe ⏎' }, secondary: { to: leave, label: back } };
  if (again) return { leave, primary: { to: again, label: 'Noch eine Runde ⏎' }, secondary: { to: leave, label: back } };
  if (play) return { leave, primary: { to: leave, label: label ?? (then ? 'Weiter ⏎' : 'Zurück ins Hauptquartier ⏎') }, secondary: null };
  return { leave, primary: null, secondary: null };
}
