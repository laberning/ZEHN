// Gesamtdurchlauf: ein Kind spielt das ganze Spiel über den Store (echter Kurs, echte Abzeichen, Speicher/Ton/Uhr als Attrappen):
// alle sieben Akte mit zusätzlichen Durchgängen (Wiederholungen im abgeschlossenen Akt, damit auch die Nebenszenen fällig werden),
// die Extra-Fälle mit ihren Gadgets, das Finale, 50 Runden Bennos Tippstunde und die fünf Fälle der Woche.
// Danach zeigt „Abdeckung“, was nie fällig wurde: jede Szene und jedes Abzeichen kommt im Durchlauf vor oder steht mit Grund in einer Ausnahmeliste.
// Die Tests bauen aufeinander auf und teilen sich den Store (Vitest läuft sie in dieser Reihenfolge); je Modul ein Test,
// weil ein einziger Test für das ganze Spiel unter Last das Zeitlimit reißt.

import { beforeAll, describe, expect, it } from 'vitest';
import { COURSE } from '../content/course.ts';
import { BADGES } from '../content/badges.ts';
import { caseAvailable, caseSolved } from '../domain/cases.ts';
import { lessonOrder } from '../domain/course.ts';
import { findScene } from '../domain/scenes.ts';
import { nextSideScene, pendingGifts } from '../domain/story.ts';
import { ownedItems } from '../domain/items.ts';
import { fallaktenScratched } from '../domain/book.ts';
import { fallakteView } from './views/fallakte.ts';
import { cleanTyping, failExamUntilBackdoor, playLessonToMastery, playRun } from '../test/scenario.ts';
import { DAY, fixedEnv, profile, soundRecorder } from '../test/factories.ts';
import { memoryRepository } from '../platform/memoryRepository.ts';
import { createGameStore } from './store.ts';

const ROUNDS = 50;
/** Langsame Durchgänge je Auftrag vor dem Abschluss: das Kind übt, ohne den Auftrag schon zu schaffen */
const SLOW_RUNS = 8;
const SLOW_MS = 2500;
const LAST_LESSON = COURSE.modules.at(-1)!.lessons.at(-1)!.id;

function newGame() {
  const env = fixedEnv();
  const store = createGameStore({ repo: memoryRepository([profile()]), sound: soundRecorder(), env });
  const s = () => store.getState();
  return { env, store, s, me: () => s().current! };
}

describe('Gesamtdurchlauf: alle Akte, Fälle, Finale, Tippstunde, Fälle der Woche', () => {
  let game: ReturnType<typeof newGame>;
  beforeAll(async () => {
    game = newGame();
    await game.s().init();
    game.s().selectProfile('p1');
  });

  /** Gespielte Wiederholungen am letzten Auftrag eines abgeschlossenen Akts, bis keine Nebenszene und kein Geschenk mehr wartet */
  async function replayUntilQuiet(moduleId: string, max = 60) {
    const { s, store, me } = game;
    const lessons = COURSE.modules.find((m) => m.id === moduleId)!.lessons;
    const last = lessons.at(-1)!.id;
    for (let i = 0; i < max; i++) {
      const side = nextSideScene(me(), s().story, s().rules, last, { wholeModule: true });
      if (!side && !pendingGifts(me(), s().story, s().rules).length) return i;
      await playRun(store, last);
    }
    throw new Error(`Durchlauf: ${moduleId} wird nach ${max} Wiederholungen nicht ruhig`);
  }

  /** Alle angebotenen, noch ungelösten Extra-Fälle lösen (Gadgets kommen als Geschenke, ein gelöster Fall kann den nächsten öffnen) */
  async function solveAvailableCases(onlyTraining = false) {
    const { s, me } = game;
    let solved = 0;
    for (let again = true; again; ) {
      again = false;
      for (const c of s().story.cases.filter((x) => onlyTraining === x.id.startsWith('tr-'))) {
        if (caseSolved(me(), c.id) || !caseAvailable(me(), s().story, s().rules, c)) continue;
        await s().beginCase(c.id);
        await s().finishCase(c.id, { open: [], side: null });
        solved++;
        again = true;
      }
    }
    return solved;
  }

  it('Spielhalle: beide Spiele mit Spitzenwerten (Abzeichen und Medaillen)', async () => {
    await game.s().recordArcade('regen', 1000, 100, 99);
    await game.s().recordArcade('tresor', 1000, 100, 99);
    expect(game.me().badges.spielhalle).toBeDefined();
  });

  it.each(COURSE.modules.map((m) => [m.id, m] as const))('%s: Aufträge, Einsatz (Hintertür, dann bestanden), Wiederholungen, Extra-Fälle', async (_, m) => {
    const { s, store, env, me } = game;
    env.advance(DAY); // ein neuer Agententag je Akt (Abzeichen „Dranbleiber“, „Wochenagent“)
    for (const { id } of m.lessons) {
      await s().beginLesson(id);
      // erst ein paar langsame Durchgänge am offenen Auftrag (Nebenszenen, die nur bis zum Abschluss des Auftrags kommen), dann bis zum Abschluss
      for (let i = 0; i < SLOW_RUNS; i++) await playRun(store, id, SLOW_MS);
      await playLessonToMastery(store, id);
    }
    await failExamUntilBackdoor(store, m.id);
    // später bestanden: Abzeichen „Ehrenkodex“ (Hintertür benutzt, dann bestanden) und „Null Fehler“ (fehlerfrei)
    const exam = await s().recordExam(m.id, cleanTyping('asdf jklö asdf', 200), 8_000);
    expect(exam.evaluation.passed, `${m.id}: Einsatz bestanden`).toBe(true);
    // Wiederholungen: Nebenszenen und Geschenke; dann die Extra-Fälle, die dadurch angeboten werden; dann wieder Wiederholungen
    for (let round = 0; round < 4; round++) {
      await replayUntilQuiet(m.id);
      if (!(await solveAvailableCases())) break;
    }
    expect(pendingGifts(me(), s().story, s().rules).map((x) => x.id), `${m.id}: Geschenke warten`).toEqual([]);
  });

  it('Finale: Akt 7 ist abgeschlossen, das Spielende ist erreicht', () => {
    const p = game.me();
    expect(COURSE.modules.every((m) => p.exams[m.id]?.outcome === 'passed')).toBe(true);
    expect(lessonOrder(COURSE).every((id) => p.lessons[id]?.mastered)).toBe(true);
  });

  /** Eine Runde Bennos Tippstunde (die Runde ist ein ganzer Durchgang: Geschenke dürfen am Ende mit) */
  async function tippstunde(rounds: number) {
    const { s } = game;
    for (let i = 0; i < rounds; i++) {
      s().beginTraining();
      expect(s().screen).toMatchObject({ name: 'mission', training: { kind: 'tippstunde' } });
      await s().recordRound(LAST_LESSON, 'tippstunde', cleanTyping('fff jjj ddd kkk', 300), { logStart: game.me().story.log.length, wasCurrent: false, replay: false, last: true });
    }
  }
  const tippstundenRunden = () => game.me().history.filter((e) => e.kind === 'tippstunde').length;

  it('Tippstunde, Runde 1 bis 25', async () => {
    await tippstunde(25);
    expect(tippstundenRunden()).toBe(25);
    expect(game.me().story.log.map((l) => l.id)).toContain('tr-round-20');
  });

  it('Fälle der Woche: alle fünf der Reihe nach gelöst, mit Ankündigung, Intro und Outro', async () => {
    const solved = await solveAvailableCases(true);
    const weekly = game.s().story.cases.filter((c) => c.id.startsWith('tr-'));
    expect(solved).toBe(weekly.length);
    expect(weekly).toHaveLength(5);
    const log = game.me().story.log.map((l) => l.id);
    for (const c of weekly) for (const part of ['open', 'intro', 'outro']) expect(log, `${c.id} ${part}`).toContain(`tr-case-${c.id.slice(3)}-${part}`);
    expect(tippstundenRunden(), 'Fälle zählen nicht als Tippstunden-Runden').toBe(25);
  });

  it(`Tippstunde, Runde 26 bis ${ROUNDS}: tr-round-50 wird fällig`, async () => {
    await tippstunde(ROUNDS - 25);
    expect(tippstundenRunden()).toBe(ROUNDS);
    const log = game.me().story.log.map((l) => l.id);
    expect(log).toContain('tr-round-50');
    expect(log).toContain('tr-badge-tippstunde');
  });

  describe('Abdeckung', () => {
    /** Szenen, die im Durchlauf nie fällig werden – mit Grund. Jede Ausnahme muss wirklich ungezeigt sein (sonst ist die Liste veraltet). */
    const SCENE_EXCEPTIONS: Record<string, string> = {
      // Alternative zu a2-side-juna-3: Junas Reaktion „ohne den Fall“; im Durchlauf ist der Fall schon gelöst, wenn der Strang dran ist
      'a2-side-juna-3b': 'Alternative zu a2-side-juna-3 (nur vor dem Fall „Junas geheime Liste“)',
    };
    /** Abzeichen, die der Durchlauf nicht vergibt – mit Grund (jede Ausnahme muss wirklich unvergeben sein) */
    const BADGE_EXCEPTIONS: Record<string, string> = {};

    it('jede Szene wird im Durchlauf fällig (Haupt-, Neben-, Geschenk-, Paket-, Fall- und Runden-Szenen)', () => {
      const log = new Set(game.me().story.log.map((l) => l.id));
      const missing = game.s().story.scenes.filter((x) => !x.retired && !log.has(x.id) && !(x.id in SCENE_EXCEPTIONS)).map((x) => `${x.id} (${x.trigger.on})`);
      expect(missing, 'nie fällig geworden – erreichbar machen oder in SCENE_EXCEPTIONS begründen').toEqual([]);
    });

    it('stillgelegte Szenen kommen nie neu in das Log; die Ausnahmen sind wirklich ungezeigt', () => {
      const log = new Set(game.me().story.log.map((l) => l.id));
      for (const x of game.s().story.scenes.filter((y) => y.retired)) expect(log.has(x.id), `${x.id} ist stillgelegt`).toBe(false);
      for (const id of Object.keys(SCENE_EXCEPTIONS)) {
        expect(findScene(game.s().story, id), `${id} existiert`).toBeDefined();
        expect(log.has(id), `${id} steht in der Ausnahmeliste, wurde aber gezeigt`).toBe(false);
      }
    });

    it('jedes Abzeichen ist im Durchlauf vergeben', () => {
      const missing = BADGES.filter((b) => game.me().badges[b.id] === undefined && !(b.id in BADGE_EXCEPTIONS)).map((b) => b.id);
      expect(missing, 'nie vergeben – erreichbar machen oder in BADGE_EXCEPTIONS begründen').toEqual([]);
      for (const id of Object.keys(BADGE_EXCEPTIONS)) expect(game.me().badges[id], `${id} steht in der Ausnahmeliste, wurde aber vergeben`).toBeUndefined();
    });

    it('kein Geschenk wartet', () => {
      expect(pendingGifts(game.me(), game.s().story, game.s().rules)).toEqual([]);
    });

    it('die Fallakten sind am Ende nicht zerkratzt', () => {
      expect(fallaktenScratched(game.me(), game.s().story)).toBe(false);
    });

    it('jeder Extra-Fall ist gelöst, jedes Ding im Besitz', () => {
      const { s, me } = game;
      expect(s().story.cases.filter((c) => !caseSolved(me(), c.id)).map((c) => c.id)).toEqual([]);
      expect([...s().story.items.map((i) => i.id)].filter((id) => !ownedItems(me(), s().story).has(id))).toEqual([]);
    });

    it('jede Fallakte zeigt nach ihrem Akt alle Zeilen und Treffer für den gespielten Weg: ohne Wahl die Auffang-Zeilen, mit jeder Wahl die dazu passenden', async () => {
      const { s, me } = game;
      const files = Object.entries(s().story.fallakten);
      expect(files).toHaveLength(COURSE.modules.length);
      /** Alle gebundenen Zeilen einer Fallakte: gelöst, offen und Treffer-Zeilen der Verdächtigen */
      const bound = (f: (typeof files)[number][1]) => [...f.solved, ...f.open, ...f.suspects.flatMap((x) => x.hits)].filter((e) => e.ifPicked);
      const texts = (v: ReturnType<typeof fallakteView>) => [...v.solved, ...v.open, ...v.suspects.flatMap((x) => x.hits)].map((e) => e.text);
      // der Durchlauf hat keine Antwort gewählt: sichtbar sind genau die Auffang-Zeilen (choice: null) und die ungebundenen
      for (const [moduleId, f] of files) {
        const view = texts(fallakteView(me(), s().story, moduleId));
        for (const e of bound(f)) expect(view.includes(e.text), `${moduleId}: „${e.text}“ ohne Wahl`).toBe(e.ifPicked!.choice === null);
        expect(fallakteView(me(), s().story, moduleId).scratched, moduleId).toBe(false);
      }
      // mit der verwiesenen Antwort (jede einzeln gewählt) erscheint die Zeile
      let shown = 0;
      for (const [moduleId, f] of files) {
        for (const e of bound(f)) {
          const { scene, choice } = e.ifPicked!;
          if (choice === null) continue;
          expect(me().story.log.map((l) => l.id), `${moduleId}: ${scene} wurde im Durchlauf gezeigt`).toContain(scene);
          await s().pickChoice(scene, choice, true);
          expect(texts(fallakteView(me(), s().story, moduleId)), `${moduleId}: „${e.text}“ nach ${scene}/${choice}`).toContain(e.text);
          shown++;
        }
      }
      expect(shown).toBeGreaterThan(10);
    });
  });
});
