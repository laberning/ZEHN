// Anwendungszustand und Anwendungsfälle. Jede Aktion: Profil nehmen → reine Kernfunktion → speichern.
// Wechselt eine Aktion den Bildschirm, navigiert sie vor dem Speichern (gegen doppeltes Absenden).
// Adapter (Speicher, Ton, Uhr/Zufall) werden von außen hineingereicht (createGameStore(deps)).

import { createStore, type StoreApi } from 'zustand/vanilla';
import { caseAvailable, findCase, solveCase } from '../domain/cases.ts';
import { findModule } from '../domain/course.ts';
import { dayKey, daysAway } from '../domain/days.ts';
import { evaluateExam } from '../domain/exam.ts';
import type { ExamOutcome } from '../domain/examRun.ts';
import type { RoundKind } from '../domain/mission.ts';
import { createProfile as newProfile, type ArcadeGame, type Avatar, type Profile } from '../domain/profile.ts';
import * as progress from '../domain/progress.ts';
import * as record from '../domain/record.ts';
import type { Reward } from '../domain/record.ts';
import type { GameRules } from '../domain/rules.ts';
import { hasSeen, markSeen, seenKey } from '../domain/seen.ts';
import { typingResult, type TypingState } from '../domain/typing.ts';
import { NO_STORY, evaluateRun, markRead, pick, settleStory, type RunStart, type StoryResult } from '../domain/story.ts';
import { isLogged, logScenes, sceneFor } from '../domain/scenes.ts';
import type { StoryContent } from '../domain/storyContent.ts';
import { ownedItems, receivedItemIds, type Item } from '../domain/items.ts';
import type { WardrobeCatalog } from '../domain/wardrobe.ts';
import { afterExamScreen, briefingRoute, examRoute, funkScreen, storyScreen, type Route, type Screen } from './navigation.ts';
import { storyLines } from '../domain/book.ts';
import { loadProfiles, migrateProfile } from './profileMigration.ts';
import type { Deps, Sfx } from './ports.ts';
import { RULES, STORY, WARDROBE } from './rules.ts';
import { TRAINING_CARD } from '../content/texts/ende.ts';

export interface GameState {
  screen: Screen;
  /** Zählt Bildschirmwechsel – als React-Key, damit Bildschirme frisch starten */
  screenId: number;
  profiles: Profile[];
  current: Profile | null;
  /** Gespeicherte Akten, die beim Laden nicht lesbar waren (werden nicht angezeigt) */
  brokenProfiles: number;
  /** Letztes Speichern ist fehlgeschlagen – Fortschritt nur noch im Speicher */
  saveFailed: boolean;
  /** Szenen, für die das HQ schon „Neue Nachricht“ gemeldet hat – nur in dieser Sitzung, damit es nicht bei jedem Besuch pingt */
  announced: readonly string[];
  /** Das HQ begrüßt nach längerer Pause – einmal beim Öffnen des Profils bestimmt, nur in dieser Sitzung */
  welcome: boolean;

  init(): Promise<void>;
  go(screen: Screen): void;
  selectProfile(id: string): void;
  logout(): void;
  /** Das HQ hat eine neue Nachricht gemeldet (Pling einmal je Szene) */
  announce(sceneId: string): void;
  /** „Später“ bei der Begrüßung im HQ */
  dismissWelcome(): void;
  createProfile(input: { firstName: string; codename: string; avatar: Avatar }): Promise<void>;
  /**
   * Profil aus einer Sicherungsdatei übernehmen (vorher mit parseBackup gelesen; hier wird es einmal migriert).
   * Gibt es die ID schon, entscheidet `confirmOverwrite`. Wirft InvalidProfileError, wenn es keine Akte ist.
   * Ergebnis: übernommen ja/nein.
   */
  importProfile(raw: unknown, confirmOverwrite?: (p: Profile) => boolean): Promise<boolean>;
  /** Löschen wartet auf die Datenbank; scheitert es, bleibt alles, wie es ist, und `saveFailed` wird gesetzt. Führt zur Startseite (die Startseite selbst bleibt stehen). */
  removeProfile(id: string): Promise<void>;

  /** Auftrag starten – zuerst das Briefing, falls noch nicht gesehen */
  beginLesson(lessonId: string): Promise<void>;
  beginExam(moduleId: string): Promise<void>;
  startTraining(moduleId: string): void;
  /** Bennos Tippstunde (nach dem Finale): eine Trainingsrunde mit allen Tasten; vorher zurück ins HQ */
  beginTraining(): void;
  /** Extra-Fall starten: Intro im Funk (nur beim ersten Mal), dann eine Trainingsrunde im Gewand des Falls */
  beginCase(caseId: string): Promise<void>;
  /** Extra-Fall abschließen (mit dem Story-Ergebnis des Durchgangs): beim ersten Mal wird er gelöst und das Outro läuft */
  finishCase(caseId: string, result: StoryResult): Promise<void>;
  /** Eine Runde auswerten. Mit `run.last` wird zugleich der Durchgang für die Story ausgewertet. */
  recordRound(lessonId: string, kind: RoundKind, typing: TypingState, run?: RunInfo): Promise<Reward & { story: StoryResult }>;
  /** Szenen als gelesen merken */
  readScenes(ids: readonly string[]): Promise<void>;
  /** Eine Antwort in einer Szene merken; `restart` = erste Wahl, seit die Szene (neu) abgespielt wird */
  pickChoice(sceneId: string, choiceId: string, restart?: boolean): Promise<void>;
  /** Nach einem geschafften Auftrag: neue Chat-Szenen (`open`), Bilderbuch-Abschluss, danach Einsatz (falls fällig) oder HQ */
  continueAfterMastery(lessonId: string, open?: readonly string[]): Promise<void>;
  /** Nach bestandenem Einsatz: Bilderbuch-Erfolg (nur beim ersten Mal), Szene danach, HQ */
  continueAfterExam(moduleId: string): Promise<void>;
  recordExam(moduleId: string, typing: TypingState, now: number): Promise<ExamOutcome>;
  takeBackdoor(moduleId: string): Promise<void>;
  recordArcade(game: ArcadeGame, score: number, count: number, level: number): Promise<Reward>;

  /** Garderobe: Aussehen übernehmen – erst zurück ins HQ, dann speichern */
  wearAvatar(avatar: Avatar): Promise<void>;
  markItemsSeen(items: readonly Item[]): Promise<void>;
  /** Fallakte geöffnet: das „Neu“ im HQ verschwindet */
  markFallakteSeen(moduleId: string): Promise<void>;
  /** Spielende gezeigt: der Ende-Bildschirm erscheint nicht von selbst wieder */
  markStoryEndSeen(moduleId: string): Promise<void>;
  toggleSound(): Promise<void>;
  /** Flow-Chip: Fehler in Übungsrunden nur rot markieren statt Pflicht-Korrektur */
  toggleFlow(): Promise<void>;
  /** Blindflug: Bildschirmtastatur am Schreibtisch aus- oder einblenden (gilt ab der nächsten Runde) */
  toggleBlind(): Promise<void>;
  sfx(s: Sfx): void;

  /** Regeln und Inhalte, mit denen der Store rechnet – Bildschirme lesen sie hier (Tests übergeben eigene Sätze) */
  rules: GameRules;
  wardrobe: WardrobeCatalog;
  story: StoryContent;
  now(): number;
  seed(): number;
}

/** Was die Mission beim Start eines Durchgangs festhält (`runInfo`), dazu: ist das die letzte Runde? (Die Auswertung hängt an ihr.) */
export interface RunInfo extends RunStart {
  last: boolean;
}

export type GameStore = StoreApi<GameState>;

/** Nur die Aktionen (für Bildschirme; Daten liest man über Selektoren) */
export type GameActions = { [K in keyof GameState as GameState[K] extends (...args: never[]) => unknown ? K : never]: GameState[K] };

export function createGameStore(deps: Deps, rules: GameRules = RULES, wardrobe: WardrobeCatalog = WARDROBE, story: StoryContent = STORY): GameStore {
  const { repo, sound, env } = deps;

  return createStore<GameState>((set, get) => {
    const me = (): Profile => {
      const p = get().current;
      if (!p) throw new Error('Kein Profil ausgewählt');
      return p;
    };

    // Zustand sofort setzen, dann speichern. Schlägt das Speichern fehl, geht das Spiel weiter
    // (der Fortschritt bleibt bis zum Neuladen erhalten) und die Schale zeigt einen Hinweis.
    // Szenen, die am Spielstand hängen, werden bei JEDEM Speichern ausgelöst – keine Aktion kann es vergessen.
    // Bis nichts Neues mehr fällig ist: Eine überreichte Sache kann eine weitere Szene auslösen
    // (Gadget aus der Spielhalle → Ankündigung des Extra-Falls). Höchstens ein paar Durchläufe.
    // `gift`: am Ende eines Durchgangs darf ein Geschenk mit (höchstens eines)
    const withStory = (p: Profile, gift = false): Profile => settleStory(p, story, rules, env.now(), gift);

    // Aktualisiert das gewählte Profil nur, wenn es dasselbe ist – auswählen ist Sache von `select`.
    const persist = async (input: Profile, opts: { gift?: boolean } = {}) => {
      const p = withStory(input, opts.gift);
      set((s) => ({
        // Wer etwas tut, das gespeichert wird (Runde, Fall, Spielhalle, Garderobe …), ist zurück: keine Begrüßung mehr
        welcome: false,
        current: s.current?.id === p.id ? p : s.current,
        profiles: s.profiles.some((x) => x.id === p.id) ? s.profiles.map((x) => (x.id === p.id ? p : x)) : [...s.profiles, p],
      }));
      try {
        await repo.save(p);
        if (get().saveFailed) set({ saveFailed: false });
      } catch {
        set({ saveFailed: true });
      }
      return p;
    };

    const go = (screen: Screen) => set((s) => ({ screen, screenId: s.screenId + 1 }));

    /** Einem Weg folgen: erst navigieren, dann speichern (gegen doppeltes Absenden) */
    const follow = async ({ screen, save }: Route) => {
      go(screen);
      if (save) await persist(save);
    };

    const rewardSfx = (r: Pick<Reward, 'newBadges'>) => sound.play(r.newBadges.length ? 'badge' : 'done');

    // init einmal: React ruft Effekte im StrictMode doppelt auf
    let loading: Promise<void> | null = null;
    const load = async () => {
      let raw: unknown[];
      try {
        raw = await repo.list();
      } catch {
        return go({ name: 'error' });
      }
      // Eine kaputte Akte darf die anderen nicht sperren
      const { profiles, broken } = loadProfiles(raw, rules, story, wardrobe);
      set((s) => ({ profiles, brokenProfiles: broken, screen: { name: 'profiles' }, screenId: s.screenId + 1 }));
    };

    const select = (p: Profile) => {
      sound.setEnabled(p.settings.sound);
      // Der letzte Agententag zählt vor dem ersten Training dieser Sitzung – später wäre er immer heute
      const away = daysAway(p.days, dayKey(env.now()));
      const welcome = away !== null && away >= rules.welcomeAfterDays;
      set((s) => ({ current: p, screen: { name: 'hq' }, screenId: s.screenId + 1, announced: [], welcome }));
    };

    return {
      screen: { name: 'loading' },
      screenId: 0,
      profiles: [],
      current: null,
      brokenProfiles: 0,
      saveFailed: false,
      announced: [],
      welcome: false,
      rules,
      wardrobe,
      story,
      now: () => env.now(),
      seed: () => env.seed(),

      init() {
        return (loading ??= load());
      },

      go,

      selectProfile(id) {
        const p = get().profiles.find((x) => x.id === id);
        if (p) select(p);
      },

      logout() {
        set((s) => ({ current: null, screen: { name: 'profiles' }, screenId: s.screenId + 1 }));
      },

      announce(sceneId) {
        if (!get().announced.includes(sceneId)) set((s) => ({ announced: [...s.announced, sceneId] }));
      },

      dismissWelcome() {
        if (get().welcome) set({ welcome: false });
      },

      async createProfile({ firstName, codename, avatar }) {
        const p = newProfile({ id: env.id(), firstName: firstName.trim(), codename: codename.trim(), avatar }, env.now(), story.version);
        // Erst auswählen und weiter, dann speichern – ein zweites Enter trifft so nicht mehr den Rekrutierungsbogen
        select(p);
        go(storyScreen({ kind: 'prolog' }, { name: 'hq' }));
        await persist(p);
      },

      async importProfile(raw, confirmOverwrite = () => true) {
        const p = migrateProfile(raw, rules, story, wardrobe);
        if (get().profiles.some((x) => x.id === p.id) && !confirmOverwrite(p)) return false;
        select(p);
        await persist(p);
        return true;
      },

      async removeProfile(id) {
        // Anders als beim Speichern wird gewartet: Erst wenn die Akte wirklich weg ist, verschwindet sie aus der Liste
        try {
          await repo.remove(id);
        } catch {
          return set({ saveFailed: true });
        }
        set((s) => {
          const profiles = s.profiles.filter((x) => x.id !== id);
          // Von der Startseite aus (Verwaltungsmodus) bleibt der Bildschirm stehen, sonst ginge der Modus verloren
          const stay = s.screen.name === 'profiles';
          return { profiles, current: null, screen: { name: 'profiles' }, screenId: stay ? s.screenId : s.screenId + 1 };
        });
      },

      async beginLesson(lessonId) {
        set({ welcome: false });
        await follow(briefingRoute(me(), story, lessonId));
      },

      async beginExam(moduleId) {
        set({ welcome: false });
        await follow(examRoute(me(), moduleId));
      },

      startTraining(moduleId) {
        const { lessonId, keys } = progress.examTraining(me(), rules.course, moduleId);
        go({ name: 'mission', lessonId, training: { kind: 'exam', keys } });
      },

      beginTraining() {
        if (!progress.storyEnd(me(), rules.course)) return go({ name: 'hq' });
        const { lessonId, keys } = progress.tippstundeTraining(me(), rules.course);
        go({ name: 'mission', lessonId, training: { kind: 'tippstunde', keys, frame: TRAINING_CARD.frame } });
      },

      async beginCase(caseId) {
        const p = me();
        const c = findCase(story, caseId);
        if (!c) throw new Error(`Unbekannter Fall: ${caseId}`);
        // Nur angebotene Fälle (das HQ zeigt nur diese; Schutz gegen veraltete Bildschirme)
        const lessonId = progress.begunLessonId(p, rules.course);
        if (!lessonId || !caseAvailable(p, story, rules, c)) return go({ name: 'hq' });
        // Der begonnene Auftrag (sonst der letzte geschaffte): keine fremden Tasten, kein Briefing nebenbei
        const keys = progress.caseTrainingKeys(p, rules.course, lessonId);
        const mission: Screen = { name: 'mission', lessonId, training: { kind: 'case', keys, frame: c.frame, caseId } };
        const intro = sceneFor(story, 'case', (t) => t.caseId === caseId && t.part === 'intro');
        if (!intro || isLogged(p, intro.id)) return go(mission);
        go(funkScreen([intro.id], mission, { label: 'Fall starten ⏎' }));
        await persist(logScenes(p, [intro.id], env.now()));
      },

      async finishCase(caseId, result) {
        const { profile, outro } = solveCase(me(), story, caseId, env.now());
        const play = [...result.open, ...(outro ? [outro] : [])];
        await follow({ screen: play.length ? funkScreen(play, { name: 'hq' }) : { name: 'hq' }, save: profile });
      },

      async recordRound(lessonId, kind, typing, run) {
        const before = ownedItems(me(), story);
        const { profile, reward } = record.recordExercise(me(), { lessonId, kind, result: typingResult(typing), scored: typing.scored, now: env.now() }, rules);
        // Die letzte Runde wertet den Durchgang aus – nach den Szenen, die diese Runde ausgelöst hat
        const { profile: next, result } = run?.last ? evaluateRun(withStory(profile, true), story, rules, { ...run, lessonId }, env.now()) : { profile, result: NO_STORY };
        const saved = await persist(next);
        rewardSfx(reward);
        return { ...reward, received: receivedItemIds(before, ownedItems(saved, story)), story: result };
      },

      async readScenes(ids) {
        await persist(markRead(me(), ids));
      },

      async pickChoice(sceneId, choiceId, restart) {
        await persist(pick(me(), sceneId, choiceId, restart));
      },

      async continueAfterMastery(lessonId, open = []) {
        const p = me();
        // Direkt zum Einsatz (mit Intro), wenn er jetzt ansteht und noch nie gespielt wurde
        const moduleId = progress.examNext(p, rules.course, lessonId);
        const exam = moduleId ? examRoute(p, moduleId) : null;
        const end: Screen = exam?.screen ?? { name: 'hq' };
        // erst die neuen Chat-Szenen, dann der Bilderbuch-Abschluss (falls es einen gibt).
        const book: Screen = storyLines(story, { kind: 'mastered', lessonId }).length ? storyScreen({ kind: 'mastered', lessonId }, end) : end;
        go(open.length ? funkScreen([...open], book) : book);
        if (exam?.save) await persist(exam.save);
      },

      async continueAfterExam(moduleId) {
        const p = me();
        const key = seenKey.examSuccess(moduleId);
        const end = afterExamScreen(p, story, rules.course, moduleId);
        const first = !hasSeen(p, key);
        go(first ? storyScreen({ kind: 'examSuccess', moduleId }, end) : end);
        if (first) await persist(markSeen(p, key));
      },

      async recordExam(moduleId, typing, now) {
        const module = findModule(rules.course, moduleId);
        // Zwei Uhren: `now` kommt vom Bildschirm und beendet die Messung (Zeitlimit des Einsatzes),
        // env.now() ist der Zeitstempel für Verlauf, Agententage und Abzeichen
        const result = typingResult(typing, now);
        const evaluation = evaluateExam(result, typing.position, module.exam);
        const before = ownedItems(me(), story);
        const { profile, reward } = record.recordExam(me(), { moduleId, result, evaluation, scored: typing.scored, now: env.now() }, rules);
        // Ein Einsatz ist ein Durchgang: am Ende darf ein Geschenk mit
        const saved = await persist(profile, { gift: true });
        // Einsatz: bestanden ist immer die Fanfare (anders als rewardSfx), sonst der Misserfolgston
        sound.play(evaluation.passed ? 'badge' : 'fail');
        return { result, evaluation, reward: { ...reward, received: receivedItemIds(before, ownedItems(saved, story)) } };
      },

      async takeBackdoor(moduleId) {
        const taken = record.takeBackdoor(me(), moduleId, env.now(), rules);
        const saved = persist(taken);
        go(storyScreen({ kind: 'examBackdoor', moduleId }, afterExamScreen(get().current ?? taken, story, rules.course, moduleId)));
        await saved;
      },

      async recordArcade(game, score, count, level) {
        const before = ownedItems(me(), story);
        const { profile, reward } = record.recordArcade(me(), game, score, count, level, rules.arcade[game], env.now(), rules);
        const saved = await persist(profile);
        rewardSfx(reward);
        return { ...reward, received: receivedItemIds(before, ownedItems(saved, story)) };
      },

      async wearAvatar(avatar) {
        const p = me();
        go({ name: 'hq' });
        await persist({ ...p, avatar });
      },

      async markItemsSeen(items) {
        if (items.length) await persist(markSeen(me(), ...items.map((i) => seenKey.item(i.id))));
      },

      async markFallakteSeen(moduleId) {
        const p = me();
        if (!hasSeen(p, seenKey.fallakte(moduleId))) await persist(markSeen(p, seenKey.fallakte(moduleId)));
      },

      async markStoryEndSeen(moduleId) {
        const p = me();
        if (!hasSeen(p, seenKey.storyEnd(moduleId))) await persist(markSeen(p, seenKey.storyEnd(moduleId)));
      },

      async toggleSound() {
        const p = me();
        const on = !p.settings.sound;
        sound.setEnabled(on);
        await persist({ ...p, settings: { ...p.settings, sound: on } });
      },

      async toggleFlow() {
        const p = me();
        await persist({ ...p, settings: { ...p.settings, flow: !p.settings.flow } });
      },

      async toggleBlind() {
        const p = me();
        await persist({ ...p, settings: { ...p.settings, blind: !p.settings.blind } });
      },

      sfx: (s) => sound.play(s),
    };
  });
}
