// Anwendungsfälle über den Store – ersetzt die früheren Browser-Durchläufe.
// Echter Kurs, echte Abzeichen; Speicher, Ton und Uhr sind Attrappen.

import { beforeAll, describe, expect, it } from 'vitest';
import { COURSE } from '../content/course.ts';
import { keysUpTo, lessonOrder } from '../domain/course.ts';
import { dayKey } from '../domain/days.ts';
import { defaultAvatar } from '../content/wardrobe.ts';
import { learnerOf } from '../domain/mission.ts';
import { startTyping } from '../domain/typing.ts';
import { examStory } from '../domain/book.ts';
import { dialogStart } from '../domain/dialog.ts';
import { ownedItems } from '../domain/items.ts';
import { RULES, STORY, WARDROBE } from './rules.ts';
import { memoryRepository, type MemoryRepository } from '../platform/memoryRepository.ts';
import { cleanTyping, failExamUntilBackdoor, giftsInLog, mainSceneIds, playLessonToMastery, playRun, playUntilOwned } from '../test/scenario.ts';
import { isModuleDone } from '../domain/progress.ts';
import { dueScenes, nextSideScene, pendingGifts, unread } from '../domain/story.ts';
import type { StoryScene } from '../domain/scenes.ts';
import type { StoryContent } from '../domain/storyContent.ts';
import { DAY, fixedEnv, keyStat, mastered, masteredModule, NO_BOOK, profile, rewarded, soundRecorder, storyLog, T0 } from '../test/factories.ts';
import { backupFileName, encodeBackup, parseBackup } from './backup.ts';
import { InvalidProfileError, loadProfiles, migrateProfile, normalizeAvatar } from './profileMigration.ts';
import type { ProfileRepository } from './ports.ts';
import { akteView } from './views/akte.ts';
import { hqView } from './views/hq.ts';
import { storyVars } from './views/common.ts';
import { createGameStore } from './store.ts';
import type { Profile } from '../domain/profile.ts';
import type { WardrobeCatalog } from '../domain/wardrobe.ts';

function setup(profiles: Profile[] = [], wrap: (r: ProfileRepository) => ProfileRepository = (r) => r) {
  const memory = memoryRepository(profiles);
  // list() liefert hier Profile (der Port verspricht nur unknown[])
  const repo = Object.assign(wrap(memory), { snapshot: memory.snapshot }) as MemoryRepository;
  const sound = soundRecorder();
  const env = fixedEnv();
  const store = createGameStore({ repo, sound, env });
  const s = () => store.getState();
  return { repo, sound, env, store, s };
}

describe('Profile', () => {
  it('Start ohne Profile → Startseite; Profil anlegen → Prolog, dann HQ', async () => {
    const { s, repo } = setup();
    await s().init();
    expect(s().screen.name).toBe('profiles');
    await s().createProfile({ firstName: ' Lena ', codename: 'Vektor-07', avatar: defaultAvatar('w') });
    expect(s().current).toMatchObject({ id: 'id-1', firstName: 'Lena' });
    expect(s().screen).toEqual({ name: 'story', story: { kind: 'prolog' }, then: { name: 'hq' } });
    expect((await repo.list())[0]?.firstName).toBe('Lena');
  });

  it('auswählen, abmelden, löschen; Ton folgt der Einstellung', async () => {
    const quiet = profile({ id: 'q', settings: { flow: false, sound: false, blind: false } });
    const { s, sound } = setup([profile(), quiet]);
    await s().init();
    expect(s().screen.name).toBe('profiles');
    s().selectProfile('q');
    expect(sound.enabled).toBe(false);
    expect(s().screen.name).toBe('hq');
    s().selectProfile('gibt-es-nicht');
    expect(s().current?.id).toBe('q');
    s().logout();
    expect(s().current).toBeNull();
    await s().removeProfile('q');
    await s().removeProfile('p1');
    expect(s().screen.name).toBe('profiles');
  });

  it('Ton an/aus wird gespeichert', async () => {
    const { s, sound, repo } = setup([profile()]);
    await s().init();
    s().selectProfile('p1');
    await s().toggleSound();
    expect(sound.enabled).toBe(false);
    expect((await repo.list())[0]?.settings.sound).toBe(false);
  });

  it('Flow-Chip umschalten speichert und steuert den Modus der Übungsrunden', async () => {
    const { s, repo } = setup([profile()]);
    await s().init();
    s().selectProfile('p1');
    expect(s().current?.settings.flow).toBe(false);
    await s().toggleFlow();
    expect((await repo.list())[0]?.settings.flow).toBe(true);
    expect(learnerOf(s().current!).mode).toBe('flow'); // die nächste Übungsrunde läuft im Fluss-Modus
    await s().toggleFlow();
    expect((await repo.list())[0]?.settings.flow).toBe(false);
    expect(learnerOf(s().current!).mode).toBe('strict');
  });

  it('Blindflug umschalten speichert; alte Akten ohne Feld laden mit aus', async () => {
    const { s, repo } = setup([profile()]);
    await s().init();
    s().selectProfile('p1');
    expect(s().current?.settings.blind).toBe(false);
    await s().toggleBlind();
    expect((await repo.list())[0]?.settings.blind).toBe(true);
    await s().toggleBlind();
    expect((await repo.list())[0]?.settings.blind).toBe(false);
    expect(migrateProfile({ ...profile(), settings: { flow: true, sound: false } }).settings).toEqual({ flow: true, sound: false, blind: false });
  });

  it('doppeltes Absenden legt nur ein Profil an (der Bogen ist sofort weg)', async () => {
    const { s, repo } = setup();
    await s().init();
    const done = s().createProfile({ firstName: 'Lena', codename: 'Vektor-07', avatar: defaultAvatar('w') });
    expect(s().screen.name).toBe('story'); // schon vor dem Speichern weiter
    await done;
    expect(await repo.list()).toHaveLength(1);
  });

  it('eine kaputte Akte sperrt die anderen nicht', async () => {
    const { s } = setup([profile(), { id: 'kaputt' } as unknown as Profile]);
    await s().init();
    expect(s().profiles.map((p) => p.id)).toEqual(['p1']);
    expect(s().brokenProfiles).toBe(1);
    expect(s().screen.name).toBe('profiles');
  });

  it('Datenbank nicht erreichbar → Fehlerbildschirm statt ewigem Laden', async () => {
    const { s } = setup([], (r) => ({ ...r, list: () => Promise.reject(new Error('gesperrt')) }));
    await s().init();
    expect(s().screen.name).toBe('error');
  });

  it('init lädt nur einmal, auch wenn React es doppelt aufruft (StrictMode)', async () => {
    let calls = 0;
    const { s } = setup([profile()], (r) => ({ ...r, list: () => (calls++, r.list()) }));
    await Promise.all([s().init(), s().init()]);
    await s().init();
    expect(calls).toBe(1);
    expect(s().screenId).toBe(1);
    expect(s().screen.name).toBe('profiles');
  });

  it('Speichern schlägt fehl → Spiel geht weiter, Hinweis wird gesetzt und verschwindet nach erfolgreichem Speichern', async () => {
    let fail = true;
    const { s } = setup([profile()], (r) => ({ ...r, save: (p) => (fail ? Promise.reject(new Error('voll')) : r.save(p)) }));
    await s().init();
    s().selectProfile('p1');
    const reward = await s().recordRound('m1-l1', 'exercise', cleanTyping('fjfj', 500));
    expect(reward.xp).toBeGreaterThan(0);
    expect(s().current?.history).toHaveLength(1);
    expect(s().saveFailed).toBe(true);
    fail = false;
    await s().toggleSound();
    expect(s().saveFailed).toBe(false);
  });

  it('Löschen scheitert → Hinweis, die Akte bleibt und der Bildschirm auch (keine unbehandelte Ablehnung)', async () => {
    const { s, repo } = setup([profile()], (r) => ({ ...r, remove: () => Promise.reject(new Error('gesperrt')) }));
    await s().init();
    s().selectProfile('p1');
    s().go({ name: 'akte' });
    await s().removeProfile('p1');
    expect(s().saveFailed).toBe(true);
    expect(s().screen.name).toBe('akte');
    expect(s().current?.id).toBe('p1');
    expect(s().profiles).toHaveLength(1);
    expect(await repo.list()).toHaveLength(1);
  });

  it('ohne Profil gibt es keine Profil-Aktionen', async () => {
    const { s } = setup();
    await expect(s().beginLesson('m1-l1')).rejects.toThrow('Kein Profil');
  });
});

describe('Willkommen zurück', () => {
  const after = (days: number) => profile({ days: { count: 3, lastDay: dayKey(T0 - days * DAY) } });

  it('erst ab 7 Tagen Pause', async () => {
    for (const [days, expected] of [[0, false], [6, false], [7, true], [40, true]] as const) {
      const { s } = setup([after(days)]);
      await s().init();
      s().selectProfile('p1');
      expect({ days, welcome: s().welcome }).toEqual({ days, welcome: expected });
    }
  });

  it('„Später“ und der Start eines Auftrags oder Einsatzes blenden sie aus; neu auswählen berechnet sie neu', async () => {
    const { s } = setup([after(9)]);
    await s().init();
    s().selectProfile('p1');
    expect(s().welcome).toBe(true);
    s().dismissWelcome();
    expect(s().welcome).toBe(false);
    s().logout();
    s().selectProfile('p1');
    expect(s().welcome).toBe(true);
    await s().beginLesson('m1-l1');
    expect(s().welcome).toBe(false);
    s().selectProfile('p1');
    await s().beginExam('m1');
    expect(s().welcome).toBe(false);
  });

  it('auch ein Extra-Fall, die Spielhalle oder Lesen im Funk zählen als zurück – danach keine Begrüßung mehr', async () => {
    const { s } = setup([after(9)]);
    await s().init();
    s().selectProfile('p1');
    expect(s().welcome).toBe(true);
    await s().recordArcade('regen', 10, 1, 0);
    expect(s().welcome).toBe(false);
  });

  it('eine neue Akte wird nicht begrüßt', async () => {
    const { s } = setup();
    await s().init();
    await s().createProfile({ firstName: 'Lena', codename: 'Vektor-07', avatar: defaultAvatar('w') });
    expect(s().welcome).toBe(false);
  });
});

describe('Akt 1 als Ablauf', () => {
  it('Briefing nur beim ersten Mal, dann direkt in den Auftrag', async () => {
    const { s } = setup([profile()]);
    await s().init();
    s().selectProfile('p1');
    await s().beginLesson('m1-l1');
    expect(s().screen).toMatchObject({ name: 'story', story: { kind: 'briefing', lessonId: 'm1-l1' }, then: { name: 'mission', lessonId: 'm1-l1' } });
    await s().beginLesson('m1-l1');
    expect(s().screen).toEqual({ name: 'mission', lessonId: 'm1-l1' });
  });

  it('zwei saubere Runden schaffen den Auftrag; danach Story und HQ', async () => {
    const { s, sound, repo } = setup([profile()]);
    await s().init();
    s().selectProfile('p1');
    const text = 'fjfj jfjf ffjj jjff fjjf jffj fjfj jfjf ffjj jjff';
    const r1 = await s().recordRound('m1-l1', 'exercise', cleanTyping(text, 500));
    expect(r1.lessonJustMastered).toBe(false);
    expect(sound.played).toContain('badge'); // erstes Abzeichen
    const r2 = await s().recordRound('m1-l1', 'exercise', cleanTyping(text, 500, 100_000));
    expect(r2.lessonJustMastered).toBe(true);
    await s().continueAfterMastery('m1-l1', ['l1-done']);
    // Auftrag 1 erzählt den Abschluss im Chat; ein Bilderbuch gibt es nur bei Auftrag 6
    expect(s().screen).toEqual({ name: 'funk', play: ['l1-done'], then: { name: 'hq' } });
    const saved = (await repo.list())[0]!;
    expect(saved.story.log.map((l) => l.id)).toEqual(expect.arrayContaining(['l1-s25', 'l1-s50', 'l1-s75', 'l1-done']));
    expect(saved.lessons['m1-l1']?.mastered).toBe(true);
    expect(saved.badges.tastsinn).toBeDefined();
  });

  it('nach dem letzten Auftrag geht es direkt zum Einsatz – mit Intro, das danach als gesehen gilt', async () => {
    const { s } = setup([profile({ lessons: masteredModule(COURSE, 'm1') })]);
    await s().init();
    s().selectProfile('p1');
    await s().continueAfterMastery('m1-l6');
    expect(s().screen).toMatchObject({
      name: 'story',
      story: { kind: 'mastered' },
      then: { name: 'story', story: { kind: 'examIntro', moduleId: 'm1' }, then: { name: 'exam', moduleId: 'm1' } },
    });
    await s().beginExam('m1');
    expect(s().screen).toEqual({ name: 'exam', moduleId: 'm1' });
  });

  it('Einsatz aus dem HQ: Intro nur beim ersten Mal', async () => {
    const { s } = setup([profile({ lessons: masteredModule(COURSE, 'm1') })]);
    await s().init();
    s().selectProfile('p1');
    await s().beginExam('m1');
    expect(s().screen).toMatchObject({ story: { kind: 'examIntro' } });
    await s().beginExam('m1');
    expect(s().screen).toEqual({ name: 'exam', moduleId: 'm1' });
  });

  it('Einsatz: Fehlversuche, Spezialtraining, Hintertür, später bestanden', async () => {
    const { s, sound, env } = setup([profile({ lessons: masteredModule(COURSE, 'm1') })]);
    await s().init();
    s().selectProfile('p1');
    const short = startTyping('asdf jklö asdf jklö asdf jklö asdf jklö asdf jklö asdf');
    for (let i = 0; i < 3; i++) {
      const o = await s().recordExam('m1', short, 60_000);
      expect(o.evaluation.passed).toBe(false);
    }
    expect(sound.played).toContain('fail');
    s().startTraining('m1');
    expect(s().screen).toMatchObject({ name: 'mission', lessonId: 'm1-l6', training: { keys: ['f', 'j', 'd'] } }); // ohne Statistik: die ersten drei
    await s().takeBackdoor('m1');
    expect(s().current?.exams.m1?.outcome).toBe('backdoor');
    expect(s().screen).toMatchObject({ story: { kind: 'examBackdoor' } });
    const text = 'asdf jklö asdf jklö asdf jklö asdf jklö asdf jklö asdf';
    env.advance(1000);
    const ok = await s().recordExam('m1', cleanTyping(text, 300), 20_000);
    expect(ok.evaluation.passed).toBe(true);
    expect(ok.reward.newBadges).toEqual(expect.arrayContaining(['grundreihe', 'ehrenkodex']));
  });

  describe('Bennos Tippstunde', () => {
    const finished = (): Profile => {
      const lessons = Object.assign({}, ...COURSE.modules.map((m) => masteredModule(COURSE, m.id)));
      const exams = Object.fromEntries(COURSE.modules.map((m) => [m.id, { attempts: 1, outcome: 'passed' as const }]));
      return profile({ lessons, exams, story: storyLog([], { v: 99 }) });
    };
    const lastLesson = COURSE.modules.at(-1)!.lessons.at(-1)!.id;

    it('Start nach dem Finale: letzter Auftrag, die drei schwächsten Lerneinheiten über alle Tasten; vor dem Finale ins HQ', async () => {
      const { s } = setup([finished(), profile({ id: 'p2' })]);
      await s().init();
      s().selectProfile('p1');
      s().beginTraining();
      expect(s().screen).toMatchObject({ name: 'mission', lessonId: lastLesson, training: { kind: 'tippstunde', frame: 'Bennos Tippstunde' } });
      const keys = (s().screen as { training: { keys: string[] } }).training.keys;
      expect(keys).toHaveLength(3);
      s().selectProfile('p2');
      s().beginTraining();
      expect(s().screen).toEqual({ name: 'hq' });
    });

    it('die Runde steht als Art „tippstunde“ im Verlauf: Sterne und EP wie beim Training, kein Zähler eines Auftrags', async () => {
      const { s } = setup([finished()]);
      await s().init();
      s().selectProfile('p1');
      const before = s().current!;
      const r = await s().recordRound(lastLesson, 'tippstunde', cleanTyping('fff jjj'));
      const p = s().current!;
      expect(p.history.at(-1)).toMatchObject({ kind: 'tippstunde', lessonId: lastLesson });
      expect(p.xp).toBeGreaterThan(before.xp);
      expect(r.xp).toBeGreaterThan(0);
      expect(p.lessons[lastLesson]!.exercises).toBe(before.lessons[lastLesson]!.exercises);
      expect(p.days.count).toBeGreaterThanOrEqual(1);
    });

    it('zehn Runden bringen das Abzeichen „Tippstunde“', async () => {
      const { s } = setup([finished()]);
      await s().init();
      s().selectProfile('p1');
      for (let i = 0; i < 9; i++) await s().recordRound(lastLesson, 'tippstunde', cleanTyping('fff jjj'));
      expect(s().current!.badges.tippstunde).toBeUndefined();
      const r = await s().recordRound(lastLesson, 'tippstunde', cleanTyping('fff jjj'));
      expect(r.newBadges).toContain('tippstunde');
    });

    it('Szenen mit dem Auslöser „training“ sind nach der n-ten Runde fällig', async () => {
      const scene: StoryScene = { id: 'tp-2', chat: 'kruemel', trigger: { on: 'training', round: 2 }, lines: [{ speaker: 'kruemel', text: 'Zwei Runden.' }] };
      const { s } = setup([finished()]);
      await s().init();
      s().selectProfile('p1');
      const due = (p: Profile) => dueScenes(p, { ...s().story, scenes: [scene] }, s().rules);
      await s().recordRound(lastLesson, 'tippstunde', cleanTyping('fff jjj'));
      expect(due(s().current!)).toEqual([]);
      await s().recordRound(lastLesson, 'training', cleanTyping('fff jjj'));
      expect(due(s().current!)).toEqual([]);
      await s().recordRound(lastLesson, 'tippstunde', cleanTyping('fff jjj'));
      expect(due(s().current!)).toEqual(['tp-2']);
    });

    it('die Szenen des Trainings kommen als Funk-Nachricht nach der n-ten Runde, jede einmal; Fälle der Woche der Reihe nach, eine Fall-Runde zählt nicht', async () => {
      const { s } = setup([finished()]);
      await s().init();
      s().selectProfile('p1');
      const logged = () => s().current!.story.log.map((l) => l.id);
      const extra = () => hqView(s().current!, s().rules, s().story).extra.map((c) => c.id).filter((id) => id.startsWith('tr-'));
      const tippstunden = () => s().current!.history.filter((e) => e.kind === 'tippstunde').length;
      await s().recordRound(lastLesson, 'tippstunde', cleanTyping('fff jjj'));
      expect(logged()).toContain('tr-round-1');
      expect(unread(s().current!, s().story)).toContain('tr-round-1');
      expect(logged()).not.toContain('tr-round-2');
      expect(extra()).toEqual([]);
      await s().recordRound(lastLesson, 'tippstunde', cleanTyping('fff jjj'));
      expect(logged().filter((id) => id.startsWith('tr-round-'))).toEqual(['tr-round-1', 'tr-round-2']);
      // Fall 1 nach tr-round-2: Ankündigung im Funk, Karte im HQ; Fall 2 noch nicht
      expect(logged()).toContain('tr-case-pits-preisliste-open');
      expect(extra()).toEqual(['tr-pits-preisliste']);
      // eine Runde unter dem Rahmen des Falls ist Training, keine Tippstunden-Runde
      await s().beginCase('tr-pits-preisliste');
      expect(s().screen).toMatchObject({ name: 'funk', play: ['tr-case-pits-preisliste-intro'], then: { name: 'mission', training: { frame: 'Preise richtigstellen', caseId: 'tr-pits-preisliste' } } });
      await s().recordRound(lastLesson, 'training', cleanTyping('fff jjj'));
      expect(tippstunden()).toBe(2);
      expect(logged()).not.toContain('tr-round-3');
      await s().finishCase('tr-pits-preisliste', { open: [], side: null });
      expect(s().screen).toEqual({ name: 'funk', play: ['tr-case-pits-preisliste-outro'], then: { name: 'hq' } });
      // Fall 2 erst nach Fall 1; seine Ankündigung kommt mit der nächsten Runde
      await s().recordRound(lastLesson, 'tippstunde', cleanTyping('fff jjj'));
      expect(logged()).toContain('tr-round-3');
      expect(logged()).toContain('tr-case-hupfs-dankesbrief-open');
      expect(extra()).toEqual(['tr-pits-preisliste', 'tr-hupfs-dankesbrief']);
      // zehn Tippstunden-Runden: das Abzeichen löst seine Szene aus, kein Geschenk
      for (let i = 0; i < 7; i++) await s().recordRound(lastLesson, 'tippstunde', cleanTyping('fff jjj'));
      expect(tippstunden()).toBe(10);
      expect(logged()).toEqual(expect.arrayContaining(['tr-round-5', 'tr-round-8', 'tr-badge-tippstunde']));
      expect(logged()).not.toContain('tr-round-12');
    });

    it('alte Spielstände mit der neuen Art im Verlauf bleiben erhalten', () => {
      const raw = { ...finished(), history: [{ t: T0, lessonId: lastLesson, kind: 'tippstunde', apm: 40, accuracy: 0.9, chars: 50 }] };
      expect(migrateProfile(raw).history).toHaveLength(1);
    });
  });

  it('Spielhalle speichert Bestwert', async () => {
    const { s, repo } = setup([profile({ lessons: mastered('m1-l1') })]);
    await s().init();
    s().selectProfile('p1');
    const r = await s().recordArcade('tresor', 80, 15, 3);
    expect(r.newBadges).toContain('tresorknacker');
    expect((await repo.list())[0]?.arcade.tresor).toEqual({ best: 80, plays: 1, bestLevel: 3, medal: 'gold' });
    expect(r.newBadges).toContain('tresor-gold');
  });
});

describe('Story im Store', () => {
  const sc = (id: string, trigger: StoryScene['trigger']): StoryScene => ({ id, chat: 'intern', trigger, lines: [{ speaker: 'kruemel', text: id }] });
  const side = (id: string, strand: string): StoryScene => sc(id, { on: 'side', strand, order: 1, fromLesson: 'm1-l1' });
  const content: StoryContent = {
    version: 1,
    objects: [], items: [], cases: [], ...NO_BOOK,
    scenes: [
      sc('s25', { on: 'stage', lessonId: 'm1-l1', at: 0.25 }),
      sc('s50', { on: 'stage', lessonId: 'm1-l1', at: 0.5 }),
      sc('done', { on: 'mastered', lessonId: 'm1-l1' }),
      sc('ex', { on: 'exam', moduleId: 'm1' }),
      side('sideA', 'a'),
      side('sideB', 'b'),
    ],
  };
  async function ready(profiles: Profile[] = [profile()]) {
    const memory = memoryRepository(profiles);
    const store = createGameStore({ repo: memory, sound: soundRecorder(), env: fixedEnv() }, undefined, undefined, content);
    await store.getState().init();
    store.getState().selectProfile('p1');
    return { store, s: () => store.getState(), logIds: () => store.getState().current!.story.log.map((l) => l.id) };
  }
  const few = cleanTyping('ffff ffff'); // zu wenig für eine neue Stufe
  const run = (logStart: number, wasCurrent = true) => ({ last: true, logStart, wasCurrent, replay: false });

  it('Durchgang ohne neue Stufe bringt genau eine Nebenszene (als Hinweis, nicht zum Öffnen)', async () => {
    const { s, logIds } = await ready();
    const r = await s().recordRound('m1-l1', 'exercise', few, run(0));
    expect(r.story).toEqual({ open: [], side: 'sideA' });
    expect(logIds()).toEqual(['sideA']);
    // der nächste Durchgang: der andere Strang ist dran
    const r2 = await s().recordRound('m1-l1', 'exercise', few, run(1));
    expect(r2.story.side).toBe('sideB');
  });

  it('die Auswertung ist idempotent: doppelt aufgerufen ergibt genau eine Nebenszene', async () => {
    const { s, logIds } = await ready();
    await s().recordRound('m1-l1', 'exercise', few, run(0));
    const again = await s().recordRound('m1-l1', 'exercise', few, run(0));
    expect(again.story.side).toBe('sideA');
    expect(logIds()).toEqual(['sideA']);
  });

  it('nur die letzte Runde wertet aus', async () => {
    const { s, logIds } = await ready();
    const r = await s().recordRound('m1-l1', 'exercise', few, { last: false, logStart: 0, wasCurrent: true, replay: false });
    expect(r.story).toEqual({ open: [], side: null });
    expect(logIds()).toEqual([]);
  });

  it('ein Durchgang mit neuer Stufe öffnet sie; der Durchgang, der „geschafft“ bringt, liefert mastered', async () => {
    const { store, s, logIds } = await ready();
    const rewards = await playRun(store, 'm1-l1');
    const { story } = rewards.at(-1)!;
    expect(story.side).toBeNull();
    expect(story.open).toEqual(['s25', 's50', 'done']);
    expect(logIds()).toEqual(['s25', 's50', 'done']);
    expect(s().current?.story.read).toEqual([]); // ausgelöst, aber nicht gelesen
  });

  const stat = (samples: number) => keyStat({ samples, avgMs: 300 });

  it('ein Durchgang mit neuer Stufe (noch nicht geschafft) bringt keine Nebenszene', async () => {
    const { s, logIds } = await ready([profile({ stats: { f: stat(9), j: stat(9) } })]);
    const r = await s().recordRound('m1-l1', 'exercise', few, run(0));
    expect(r.story).toEqual({ open: ['s25'], side: null });
    expect(logIds()).toEqual(['s25']);
  });

  it('der Durchgang, der „geschafft“ bringt, bringt keine Nebenszene – auch ohne neue Stufe', async () => {
    const { s, logIds } = await ready([profile({ stats: { f: stat(29), j: stat(29) }, lessons: { 'm1-l1': { exercises: 1, bestStars: 1, mastered: false, best: 0.96 } }, story: storyLog(['s25', 's50'], { read: ['s25', 's50'] }) })]);
    const r = await s().recordRound('m1-l1', 'exercise', cleanTyping('ffff jjjj'), run(2));
    expect(s().current!.lessons['m1-l1']?.mastered).toBe(true);
    expect(r.story).toEqual({ open: ['done'], side: null });
    expect(logIds()).toEqual(['s25', 's50', 'done']);
  });

  it('Wiederholung eines geschafften Auftrags löst nichts aus', async () => {
    const { store, logIds } = await ready([profile({ lessons: mastered('m1-l1'), story: storyLog(['s25', 's50', 'done'], { read: ['s25', 's50', 'done'] }) })]);
    const rewards = await playRun(store, 'm1-l1');
    expect(rewards.at(-1)!.story).toEqual({ open: [], side: null });
    expect(logIds()).toEqual(['s25', 's50', 'done']);
  });

  it('die Hintertür löst die Einsatz-Szene aus, ebenso das Bestehen', async () => {
    const { store, logIds } = await ready([profile({ lessons: masteredModule(COURSE, 'm1') })]);
    await failExamUntilBackdoor(store, 'm1');
    expect(logIds()).toContain('ex');
    const second = await ready([profile({ lessons: masteredModule(COURSE, 'm1') })]);
    await second.s().recordExam('m1', cleanTyping('asdf jklö asdf jklö asdf jklö asdf jklö asdf jklö asdf', 300), 20_000);
    expect(second.logIds()).toContain('ex');
  });

  it('jede speichernde Aktion löst fällige Szenen aus (hier: Ton umschalten)', async () => {
    const { s, logIds } = await ready([profile({ lessons: mastered('m1-l1') })]);
    expect(logIds()).toEqual([]);
    await s().toggleSound();
    expect(logIds()).toEqual(['s25', 's50', 'done']);
  });

  it('Lesestand und Antworten werden gespeichert', async () => {
    const { s } = await ready();
    await s().readScenes(['a']);
    await s().pickChoice('a', 'ja');
    expect(s().current?.story).toMatchObject({ read: ['a'], picks: { a: ['ja'] } });
  });
});

// Ein Durchgang durch das ganze Spiel, je Modul ein Test: ein einziger Test für alle Akte reißt unter Last das Zeitlimit.
// Die Tests eines Blocks bauen aufeinander auf und teilen sich den Store (Vitest läuft sie in dieser Reihenfolge).
describe('Alle Akte komplett: Belohnungstakt', () => {
  let game: ReturnType<typeof setup>;
  let runs = 0;
  beforeAll(async () => {
    game = setup([profile()]);
    await game.s().init();
    game.s().selectProfile('p1');
  });

  it.each(COURSE.modules.map((m) => [m.id, m] as const))('%s: nie mehr als ein Geschenk je Durchgang', async (_, m) => {
    const { s, store } = game;
    const gifts = () => giftsInLog(s().current!, s().story);
    for (const { id } of m.lessons) {
      await s().beginLesson(id);
      while (!s().current!.lessons[id]?.mastered) {
        const before = gifts().length;
        await playRun(store, id);
        runs++;
        expect(gifts().length - before, `${id}, Durchgang ${runs}`).toBeLessThanOrEqual(1);
      }
    }
    await failExamUntilBackdoor(store, m.id);
  });

  it('Adas Polo am Ende von Auftrag 2 wartet nie: Geschenke der Geschichte haben Vorrang', () => {
    const log = game.s().current!.story.log.map((l) => l.id);
    expect(log.indexOf('gift-polo')).toBeGreaterThan(log.indexOf('l2-done'));
    expect(log.indexOf('gift-polo')).toBeLessThan(log.indexOf('l3-brief'));
  });
});

describe('Alle Akte komplett: Haupt-Szenen', () => {
  let game: ReturnType<typeof setup>;
  beforeAll(async () => {
    game = setup([profile()]);
    await game.s().init();
    game.s().selectProfile('p1');
  });

  it.each(COURSE.modules.map((m) => [m.id, m] as const))('%s: alle Aufträge gemeistert, Einsatz über die Hintertür', async (_, m) => {
    const { s, store } = game;
    for (const { id } of m.lessons) {
      await s().beginLesson(id);
      await playLessonToMastery(store, id);
    }
    await failExamUntilBackdoor(store, m.id);
  });

  it('alle Haupt-Szenen in der Reihenfolge der Drehbücher; jedes Geschenk der Geschichte überreicht oder fällig', () => {
    const { s } = game;
    const main = mainSceneIds(s().story);
    const inLog = s().current!.story.log.map((l) => l.id).filter((id) => main.includes(id));
    expect(inLog).toEqual(main);
    expect(main).toContain('exam-after');
    const log = s().current!.story.log.map((l) => l.id);
    // jedes Geschenk der Geschichte ist überreicht oder wartet auf den nächsten Durchgang; das Polo kommt direkt nach l2-done
    const waiting = pendingGifts(s().current!, s().story, s().rules).map((x) => x.id);
    for (const g of s().story.scenes.filter((x) => x.gift && !x.retired && x.trigger.on === 'mastered').map((x) => x.id)) expect([...log, ...waiting], g).toContain(g);
    expect(log.indexOf('gift-polo')).toBe(log.indexOf('l2-done') + 1);
    expect(main.indexOf('l1-s25')).toBeLessThan(main.indexOf('l1-done'));
    expect(main.indexOf('l3-brief')).toBeGreaterThan(main.indexOf('l2-done'));
  });
});

describe('Spielhalle bringt Gadgets', () => {
  it('Medaillen-Schwellen kommen aus den Regeln des Stores', async () => {
    const play = async (arcade: typeof RULES.arcade) => {
      const store = createGameStore({ repo: memoryRepository([profile({ story: storyLog([], { v: 99 }) })]), sound: soundRecorder(), env: fixedEnv() }, { ...RULES, arcade });
      await store.getState().init();
      store.getState().selectProfile('p1');
      await store.getState().recordArcade('regen', 10, 1, 2);
      return store.getState().current!.arcade.regen?.medal;
    };
    expect(await play({ ...RULES.arcade, regen: [1, 2, 3] })).toBe('silber');
    expect(await play({ ...RULES.arcade, regen: [5, 6, 7] })).toBeNull();
  });

  it('Spielhalle → Abzeichen sofort, den Kescher überreicht Krümel am Ende eines Durchgangs – je Durchgang ein Geschenk', async () => {
    const { s, store } = setup([profile({ lessons: mastered('m1-l1'), story: storyLog([], { v: 99 }) })]);
    await s().init();
    s().selectProfile('p1');
    const r = await s().recordArcade('regen', 40, 10, 2);
    expect(r.newBadges).toContain('spielhalle');
    expect(r.received).toEqual([]); // die Spielhalle gibt keine Geschenke frei
    expect(pendingGifts(s().current!, s().story, s().rules).map((x) => x.id)).toContain('badge-spielhalle');
    expect(ownedItems(s().current!, s().story).has('buchstabenkescher')).toBe(false);
    const run = await playUntilOwned(store, 'buchstabenkescher', 'm1-l2');
    expect(run.runs).toBeGreaterThan(0);
    expect(run.maxGiftsPerRun).toBeLessThanOrEqual(1);
    expect(unread(s().current!, s().story)).toContain('badge-spielhalle');
    expect(s().story.scenes.find((x) => x.id === 'badge-spielhalle')?.chat).toBe('kruemel');
  });
});

describe('Extra-Fälle', () => {
  it('Spielhalle → Kescher → Ankündigung → Fall → Blasenwerfer im Besitz → Einsatz-Intro bietet [Blasenwerfer]', async () => {
    const lessons = mastered('m1-l1', 'm1-l2');
    const { s, store } = setup([profile({ lessons: { ...lessons, 'm1-l3': { exercises: 0, bestStars: 0, mastered: false, best: 0 } }, story: storyLog([], { v: 99 }) })]);
    await s().init();
    s().selectProfile('p1');
    const locked = (id: string, title: string, gadget: string) => ({ id, title, solved: false, locked: true, hint: expect.stringContaining(`Braucht: ${gadget}.`) });
    // Auftrag 3 ist begonnen, aber es fehlen beide Gadgets: zwei gesperrte Karten mit dem Weg dorthin
    expect(hqView(s().current!, s().rules, s().story).extra).toEqual([
      locked('seifenblasen-brunnen', 'Der Seifenblasen-Brunnen', 'Buchstabenkescher'),
      locked('kringels-briefkasten', 'Kringels Briefkasten', 'Stethoskop'),
    ]);
    await s().recordArcade('regen', 40, 10, 2);
    // Krümel überreicht den Kescher am Ende des nächsten Durchgangs (nach anderen wartenden Geschenken)
    expect((await playUntilOwned(store, 'buchstabenkescher', 'm1-l3')).maxGiftsPerRun).toBeLessThanOrEqual(1);
    // Kescher im Besitz → die Ankündigung ist ausgelöst und der Fall steht im HQ
    expect(s().current!.story.log.map((l) => l.id)).toContain('case-seifenblasen-open');
    expect(hqView(s().current!, s().rules, s().story).extra).toEqual([
      { id: 'seifenblasen-brunnen', title: 'Der Seifenblasen-Brunnen', solved: false, locked: false, hint: expect.stringMatching(/^Mit dem Gadget: Buchstabenkescher\. Tipp:/) },
      locked('kringels-briefkasten', 'Kringels Briefkasten', 'Stethoskop'),
    ]);
    // Fall beginnen: Intro im Funk, danach die Trainingsrunde im Gewand des Falls
    await s().beginCase('seifenblasen-brunnen');
    const intro = s().screen;
    expect(intro).toMatchObject({ name: 'funk', play: ['case-seifenblasen-intro'], then: { name: 'mission', lessonId: 'm1-l3', training: { frame: 'Seifenblasen fangen', caseId: 'seifenblasen-brunnen' } } });
    // Intro nur beim ersten Mal
    await s().beginCase('seifenblasen-brunnen');
    expect(s().screen).toMatchObject({ name: 'mission', lessonId: 'm1-l3' });
    // lösen: Outro, Gadget, genau einmal gelöst
    await s().finishCase('seifenblasen-brunnen', { open: [], side: null });
    expect(s().screen).toEqual({ name: 'funk', play: ['case-seifenblasen-outro'], then: { name: 'hq' } });
    const solvedAt = s().current!.cases['seifenblasen-brunnen'];
    expect(solvedAt).toBeDefined();
    expect(ownedItems(s().current!, s().story).has('blasenwerfer')).toBe(true);
    // Wiederholung: kein Outro, der Zeitpunkt bleibt
    await s().finishCase('seifenblasen-brunnen', { open: ['l3-s25'], side: null });
    expect(s().screen).toEqual({ name: 'funk', play: ['l3-s25'], then: { name: 'hq' } });
    expect(s().current!.cases['seifenblasen-brunnen']).toBe(solvedAt);
    await s().finishCase('seifenblasen-brunnen', { open: [], side: null });
    expect(s().screen).toEqual({ name: 'hq' });
    // Einsatz-Intro: [Blasenwerfer] erscheint
    const intro1 = dialogStart(examStory(STORY, 'm1').intro, {}, { owned: ownedItems(s().current!, s().story), picks: {} }).queue[0]!;
    expect(intro1.choices?.map((c) => c.id)).toEqual(['schneller', 'knoechel', 'blasen']);
    expect(dialogStart(examStory(STORY, 'm1').intro).queue[0]!.choices?.map((c) => c.id)).toEqual(['schneller', 'knoechel']);
  });

  it('vor dem Briefing des aktuellen Auftrags gibt es den Fall nicht; danach spielt er auf diesem Auftrag, ohne Briefing nebenbei', async () => {
    const { s } = setup([profile({ lessons: mastered('m1-l1', 'm1-l2'), ...rewarded('spielhalle') })]);
    await s().init();
    s().selectProfile('p1');
    await s().toggleSound(); // speichern: fällige Szenen auslösen
    expect(hqView(s().current!, s().rules, s().story).extra).toEqual([]);
    await s().beginCase('seifenblasen-brunnen'); // ein veralteter Knopf führt ins HQ
    expect(s().screen).toEqual({ name: 'hq' });
    // Auftrag 3 beginnen: Briefing im Funk, danach ist der Fall da
    await s().beginLesson('m1-l3');
    expect(s().current!.story.log.map((l) => l.id)).toEqual(expect.arrayContaining(['l3-brief', 'case-seifenblasen-open']));
    await s().beginCase('seifenblasen-brunnen');
    expect(s().screen).toMatchObject({ name: 'funk', play: ['case-seifenblasen-intro'], then: { name: 'mission', lessonId: 'm1-l3', training: { caseId: 'seifenblasen-brunnen' } } });
    // ein echter Durchgang des Falls öffnet kein Briefing
    const logStart = s().current!.story.log.length;
    const r = await s().recordRound('m1-l3', 'training', cleanTyping('fff jjj'), { last: true, logStart, wasCurrent: true, replay: false });
    expect(r.story.open).not.toContain('l3-brief');
  });

  it('Besitz kommt mit der Übergabe: die Belohnung meldet, was wirklich überreicht wurde – am Ende des Durchgangs, eines', async () => {
    const { s, store } = setup([profile({ badges: { tastsinn: 1, spielhalle: 1 }, lessons: mastered('m1-l1'), story: storyLog([], { v: 99 }) })]);
    await s().init();
    s().selectProfile('p1');
    const rounds = await playRun(store, 'm1-l2');
    expect(rounds.slice(0, -1).flatMap((r) => r.received ?? [])).toEqual([]); // mitten im Durchgang nichts
    expect(rounds.at(-1)!.received).toHaveLength(1); // am Ende genau eines
    expect(ownedItems(s().current!, s().story).has(rounds.at(-1)!.received![0]!)).toBe(true);
  });

  it('Hinweise auf der Fall-Karte: Tipp nur vor dem ersten Einsatz-Versuch, gelöst, gesperrt', () => {
    const { s } = setup();
    const lessons: Profile['lessons'] = { ...mastered('m1-l1', 'm1-l2'), 'm1-l3': { exercises: 0, bestStars: 0, mastered: false, best: 0 } };
    const base: Partial<Profile> = { lessons, ...rewarded('spielhalle') };
    const brunnen = (p: Profile) => hqView(p, s().rules, s().story).extra.find((c) => c.id === 'seifenblasen-brunnen')!;
    expect(brunnen(profile(base)).hint).toBe('Mit dem Gadget: Buchstabenkescher. Tipp: Löse ihn vor dem Einsatz – sein Gadget hilft beim Einsatz oder gleich danach.');
    // Einsatz schon versucht (Intro gesehen) oder über die Hintertür geschafft: kein Tipp mehr
    expect(brunnen(profile({ ...base, seen: ['exam-intro:m1'] })).hint).toBe('Mit dem Gadget: Buchstabenkescher');
    expect(brunnen(profile({ ...base, exams: { m1: { attempts: 3, outcome: 'backdoor' } } })).hint).toBe('Mit dem Gadget: Buchstabenkescher');
    // gelöst
    expect(brunnen(profile({ ...base, cases: { 'seifenblasen-brunnen': 1 } }))).toMatchObject({ solved: true, locked: false, hint: 'Gelöst – noch einmal üben?' });
    // gesperrt: Gadget-Name, Abzeichen und dessen Beschreibung
    const kringel = hqView(profile(base), s().rules, s().story).extra.find((c) => c.id === 'kringels-briefkasten')!;
    expect(kringel.hint).toBe('Braucht: Stethoskop. Hol dafür das Abzeichen „Tresorknacker“: 15 Codes in einer Runde Tresorknacker geknackt.');
    // Junas Liste ist vor ihrer Szene weder sichtbar noch gesperrt zu sehen
    expect(hqView(profile(base), s().rules, s().story).extra.map((c) => c.id)).not.toContain('junas-liste');
  });

  it('unbekannter Fall', async () => {
    const { s } = setup([profile()]);
    await s().init();
    s().selectProfile('p1');
    await expect(s().beginCase('gibt-es-nicht')).rejects.toThrow('Unbekannter Fall');
  });
});

describe('Niemand bleibt stecken', () => {
  const STORY_GADGETS = ['dechiffrierscheibe', 'beweisfach'];
  /** ein Spielstand im Format von vor der Story: ohne story, best und cases */
  const old = (p: Profile): Profile => {
    const raw: Record<string, unknown> = { ...p, lessons: Object.fromEntries(Object.entries(p.lessons).map(([k, v]) => [k, { exercises: v.exercises, bestStars: v.bestStars, mastered: v.mastered }])) };
    delete raw.story;
    delete raw.cases;
    return raw as unknown as Profile;
  };

  it('Mindestweg: alle Akte ohne Spielhalle, ohne Extra-Fälle, nichts gelesen, Einsatz über die Hintertür – alles Wichtige kommt trotzdem an', async () => {
    const { s, store } = setup();
    await s().init();
    await s().createProfile({ firstName: 'Lena', codename: 'Vektor-07', avatar: defaultAvatar('w') });
    for (const m of COURSE.modules) {
      for (const { id } of m.lessons) {
        await s().beginLesson(id);
        const rewards = await playRun(store, id);
        if (!s().current!.lessons[id]?.mastered) await playLessonToMastery(store, id);
        await s().continueAfterMastery(id, rewards.at(-1)!.story.open); // „Esc“: der Chat wird nie gelesen
      }
      await failExamUntilBackdoor(store, m.id);
      await s().continueAfterExam(m.id);
    }
    const p = s().current!;
    for (const m of COURSE.modules) expect(isModuleDone(p, m.id), m.id).toBe(true); // das HQ bietet die Fallakten
    expect(p.story.log.map((l) => l.id)).toEqual(expect.arrayContaining(mainSceneIds(s().story)));
    expect(p.story.read).toEqual([]); // nie readScenes
    const owned = ownedItems(p, s().story);
    for (const g of STORY_GADGETS) expect(owned.has(g), g).toBe(true);
    expect(Object.keys(p.cases)).toEqual([]);
    expect(p.arcade).toEqual({});
  });

  it('Migration mitten in Auftrag 5: nichts ungelesen, Dechiffrierscheibe da, Beweisfach erst ab 75 %, die nächste Stufe kommt mit dem nächsten Durchgang', async () => {
    const stat = (samples: number) => keyStat({ samples, avgMs: 800 });
    const before = (samples: number) => old(profile({ lessons: mastered('m1-l1', 'm1-l2', 'm1-l3', 'm1-l4'), stats: { g: stat(samples), h: stat(samples) } }));
    // 18 von 30 Anschlägen: 60 %
    const mid = migrateProfile({ ...before(18), lessons: { ...before(18).lessons, 'm1-l5': { exercises: 1, bestStars: 1, mastered: false } } });
    expect(mid.lessons['m1-l5']!.best).toBeCloseTo(0.6);
    expect(unread(mid, STORY)).toEqual([]);
    expect(ownedItems(mid, STORY).has('dechiffrierscheibe')).toBe(true);
    expect(ownedItems(mid, STORY).has('beweisfach')).toBe(false);
    // genau 75 %: das Beweisfach ist da
    const at75 = migrateProfile({ ...before(23), lessons: { ...before(23).lessons, 'm1-l5': { exercises: 1, bestStars: 1, mastered: false } } });
    expect(at75.lessons['m1-l5']!.best).toBeGreaterThanOrEqual(0.75);
    expect(ownedItems(at75, STORY).has('beweisfach')).toBe(true);
    expect(unread(at75, STORY)).toEqual([]);
    // der nächste Durchgang löst die nächste fällige Stufe aus
    const { s, store } = setup([mid]);
    await s().init();
    s().selectProfile('p1');
    const rewards = await playRun(store, 'm1-l5');
    expect(rewards.at(-1)!.story.open).toContain('l5-s75');
    expect(ownedItems(s().current!, s().story).has('beweisfach')).toBe(true);
  });

  it('Migration eines abgeschlossenen Akt 1: nichts ungelesen, alle Story-Gadgets da, keine Paket-Flut', () => {
    const done = old(profile({ xp: 700, lessons: masteredModule(COURSE, 'm1'), badges: { tastsinn: 1, entschluesselt: 1, 'serie-3': 1, grundreihe: 1 }, exams: { m1: { attempts: 1, outcome: 'passed' } } }));
    const p = migrateProfile(done);
    expect(unread(p, STORY)).toEqual([]);
    const owned = ownedItems(p, STORY);
    for (const g of STORY_GADGETS) expect(owned.has(g), g).toBe(true);
    for (const id of ['exam-after', 'l6-done', 'l6-s75'].filter((x) => STORY.scenes.some((sc) => sc.id === x))) expect(p.story.log.map((l) => l.id), id).toContain(id);
  });
});

describe('Szenario-Helfer', () => {
  it('Auftrag 1 ist mit dem echten Kurs in höchstens 3 Durchgängen geschafft', async () => {
    const { s, store } = setup([profile()]);
    await s().init();
    s().selectProfile('p1');
    const runs = await playLessonToMastery(store, 'm1-l1');
    expect(runs).toBeLessThanOrEqual(3);
    expect(s().current?.lessons['m1-l1']).toMatchObject({ mastered: true, best: 1 });
  });
});

describe('Fallakte', () => {
  it('Öffnen merkt sich den Schlüssel einmal, auch im gespeicherten Profil', async () => {
    const { s, repo } = setup([profile()]);
    await s().init();
    s().selectProfile('p1');
    await s().markFallakteSeen('m1');
    await s().markFallakteSeen('m1');
    expect(s().current!.seen.filter((k) => k === 'fallakte:m1')).toHaveLength(1);
    expect((await repo.list())[0]?.seen).toContain('fallakte:m1');
  });
});

describe('Garderobe, Koffer und Meldungen', () => {
  it('ein Abzeichen löst die Paket-Meldung aus (Funk: neu); die Kleidung gehört dazu, und „neu“ verschwindet nach dem Ansehen', async () => {
    const { s, repo, store } = setup([profile({ badges: { tastsinn: 1 } })]);
    await s().init();
    s().selectProfile('p1');
    await s().toggleSound(); // speichern allein liefert kein Geschenk
    expect(s().current!.story.log.map((l) => l.id)).not.toContain('badge-tastsinn');
    await playRun(store, 'm1-l1'); // am Ende des Durchgangs kommt das Paket
    const p = s().current!;
    expect(p.story.log.map((l) => l.id)).toContain('badge-tastsinn');
    expect(unread(p, s().story)).toContain('badge-tastsinn');
    let view = hqView(p, s().rules, s().story);
    expect(view.funkNew).toBeGreaterThan(0);
    expect(view.freshItems).toBe(1);
    expect(ownedItems(p, s().story).has('cuffed')).toBe(true);
    await s().markItemsSeen(s().story.items.filter((i) => i.id === 'cuffed'));
    await s().markItemsSeen([]);
    view = hqView(s().current!, s().rules, s().story);
    expect(view.freshItems).toBe(0);
    s().go({ name: 'wardrobe' });
    const saved = s().wearAvatar({ ...defaultAvatar('w'), pants: 'cuffed' });
    expect(s().screen.name).toBe('hq'); // erst weiter, dann speichern – gegen doppeltes Speichern
    await saved;
    expect(s().current?.avatar.pants).toBe('cuffed');
    expect((await repo.list())[0]?.avatar.pants).toBe('cuffed');
  });

  it('HQ-Ansicht: aktueller Auftrag, Einsatz fällig, Spielhalle offen', () => {
    const { s } = setup();
    expect(hqView(profile(), s().rules, s().story)).toMatchObject({ current: 'm1-l1', examDueId: null, arcadeOpen: false });
    const done = profile({ lessons: masteredModule(COURSE, 'm1') });
    expect(hqView(done, s().rules, s().story)).toMatchObject({ current: null, examDueId: 'm1', arcadeOpen: true });
    const stats = { f: keyStat({ samples: 40 }) };
    const akte = akteView(profile({ stats, seen: ['briefing:m1-l1'] }), s().rules, T0);
    expect(akte).toMatchObject({ keys: ['f', 'j'], avgApm: null, avgWindow: 10, exercises: 0, tempo: [], heat: { f: 1, j: null }, shakyKeys: [] });
    expect(akte.heatScale).toMatchObject({ mid: 0.92, midAt: 0.6 });
    // Tasten eines noch nicht begonnenen Auftrags stehen nicht in der Wärmekarte
    expect(akteView(profile({ stats }), s().rules, T0).heat).toEqual({});
    expect(akteView(profile({ stats, lessons: mastered('m1-l1') }), s().rules, T0).heat).toHaveProperty('f');
    expect(storyVars(profile(), s().rules.rewards.ranks)).toMatchObject({ vorname: 'Lena', codename: 'Vektor-07', agent: 'Agentin', rang_rekrut: 'Rekrutin', rang_anwaerter: 'Anwärterin' });
    expect(storyVars(profile({ avatar: defaultAvatar('m') }), s().rules.rewards.ranks)).toMatchObject({ agent: 'Agent', rang_rekrut: 'Rekrut', rang_meisterhacker: 'Meisterhacker' });
  });
});

describe('Wackelige Tasten der Akte', () => {
  const stat = (samples: number, accuracy: number) => keyStat({ samples, accuracy });

  it('höchstens drei, nur gemessen und unter der Schwelle, die wackligste zuerst, Gleichstand nach Kursreihenfolge', () => {
    const { s } = setup();
    const keys = keysUpTo(COURSE, 'm1-l3');
    expect(keys.length).toBeGreaterThanOrEqual(6);
    const [a, b, c, d, e, f] = keys;
    const stats = {
      [a!]: stat(30, 0.84),
      [b!]: stat(30, 0.84), // gleich wie a: a kommt zuerst
      [c!]: stat(30, 0.917), // 91 %, nicht 92 %
      [d!]: stat(30, 0.8), // am wackligsten
      [e!]: stat(9, 0.1), // misst noch: nicht in der Liste
      [f!]: stat(30, 0.95), // sitzt
    };
    const akte = akteView(profile({ stats, lessons: mastered('m1-l1', 'm1-l2'), seen: ['briefing:m1-l3'] }), s().rules, T0);
    expect(akte.shakyKeys).toEqual([
      { key: d, accuracy: 0.8 },
      { key: a, accuracy: 0.84 },
      { key: b, accuracy: 0.84 },
    ]);
    expect(akte.heat[e!]).toBeNull();
    const rest = akteView(profile({ stats: { [c!]: stat(30, 0.917) }, lessons: mastered('m1-l1', 'm1-l2'), seen: ['briefing:m1-l3'] }), s().rules, T0);
    expect(rest.shakyKeys).toEqual([{ key: c, accuracy: 0.917 }]);
  });
});

describe('Sicherung und Migration', () => {
  it('Sicherung hin und zurück; fremde Dateien werden abgelehnt', async () => {
    const p = profile({ xp: 42 });
    const text = encodeBackup(p, 0);
    expect(migrateProfile(parseBackup(text))).toEqual(migrateProfile(p));
    expect(backupFileName(profile({ codename: 'Nebelkrähe-11' }))).toBe('zehn-akte-nebelkrähe-11.json');
    expect(() => parseBackup('kein json')).toThrow(InvalidProfileError);
    expect(() => parseBackup('{}')).toThrow('keine ZEHN-Akte');

    const { s } = setup();
    await s().init();
    await expect(s().importProfile(parseBackup(JSON.stringify({ app: 'zehn', profile: { id: 1 } })))).rejects.toThrow(InvalidProfileError);
    await s().importProfile(parseBackup(text));
    expect(s().current?.xp).toBe(42);
    expect(s().screen.name).toBe('hq');
  });

  it('Import migriert einmal, mit den Regeln und der Story des Stores', async () => {
    const scene: StoryScene = { id: 'nach-abzeichen', chat: 'kruemel', trigger: { on: 'badge', badgeId: 'x' }, lines: [{ speaker: 'kruemel', text: 'Hallo' }] };
    const story: StoryContent = { version: 1, objects: [], items: [], cases: [], ...NO_BOOK, scenes: [scene] };
    const store = createGameStore({ repo: memoryRepository([]), sound: soundRecorder(), env: fixedEnv() }, undefined, undefined, story);
    await store.getState().init();
    // alte Sicherung ohne Story-Stand: Was nach dem Spielstand schon fällig wäre, gilt als gelesen
    const old: Partial<Profile> = profile({ badges: { x: 1 } });
    delete old.story;
    await store.getState().importProfile(parseBackup(encodeBackup(old as Profile, 0)));
    expect(store.getState().current?.story.v).toBe(1);
    expect(unread(store.getState().current!, story)).toEqual([]);
  });

  it('Import einer Akte mit vorhandener ID fragt vorher', async () => {
    const { s, repo } = setup([profile({ xp: 5 })]);
    await s().init();
    const backup = parseBackup(encodeBackup(profile({ xp: 77 }), 0));
    expect(await s().importProfile(backup, () => false)).toBe(false);
    expect((await repo.list())[0]?.xp).toBe(5);
    expect(s().current).toBeNull();
    const asked: string[] = [];
    expect(await s().importProfile(backup, (p) => (asked.push(p.codename), true))).toBe(true);
    expect(asked).toEqual(['Vektor-07']);
    expect((await repo.list())[0]?.xp).toBe(77);
  });

  it('alte Spielstände bekommen fehlende Felder, kaputte Avatarwerte werden ersetzt', () => {
    const old = { ...profile(), avatar: { gender: 'm', skin: '#ffffff', outfit: 3 }, arcade: undefined, seen: undefined, settings: undefined } as unknown;
    const p = migrateProfile(old);
    expect(p.avatar).toEqual(normalizeAvatar({ gender: 'm' }));
    expect(p.arcade).toEqual({});
    expect(p.seen).toEqual([]);
    expect(p.settings).toEqual({ flow: false, sound: true, blind: false });
    expect(normalizeAvatar(undefined).gender).toBe('w');
    expect(p.avatar.head).toBe('none'); // Kopfbedeckung gab es früher nicht
    expect(normalizeAvatar({ head: 'gibt-es-nicht' }).head).toBe('none');
  });

  it('alte Spielstände laden unverändert (Tastenprofile); das Profil der Umschalttaste entsteht beim ersten Anschlag', () => {
    const stats = { f: keyStat({ samples: 40 }), j: keyStat({ samples: 40 }) };
    const old = profile({ stats, lessons: mastered('m1-l1') });
    const p = migrateProfile(JSON.parse(JSON.stringify(old)));
    expect(p.stats).toEqual(stats);
    expect(Object.keys(p.stats)).not.toContain('shift-right');
    // mit Umschalttaste im Profil: übernommen wie jede Taste
    const withShift = migrateProfile(JSON.parse(JSON.stringify({ ...old, stats: { ...stats, 'shift-right': keyStat({ samples: 5 }) } })));
    expect(withShift.stats['shift-right']?.samples).toBe(5);
  });

  it('Fehlerarten je Taste: alte Akten laden ohne das Feld, gültige bleiben gleich, kaputte Werte fallen weg', () => {
    const how = { up: 0.5, down: 0.25, hand: 0.25, ahead: 0, shift: 0 };
    const stats = { f: keyStat({ samples: 40 }), k: keyStat({ samples: 40, how, howSamples: 6 }) };
    const p = migrateProfile(JSON.parse(JSON.stringify(profile({ stats, lessons: mastered('m1-l1') }))));
    expect(p.stats).toEqual(stats);
    expect(p.stats.f).not.toHaveProperty('how');
    const raw = (extra: object) => migrateProfile(JSON.parse(JSON.stringify(profile({ stats: { k: { ...keyStat({ samples: 40 }), ...extra } as never }, lessons: mastered('m1-l1') })))).stats.k!;
    expect(raw({ how, howSamples: 6 })).toMatchObject({ how, howSamples: 6 });
    expect(raw({ how })).toMatchObject({ how, howSamples: 0 }); // Zähler fehlt
    expect(raw({ how, howSamples: -3.7 })).toMatchObject({ howSamples: 0 });
    for (const bad of [{ ...how, up: 1.5 }, { ...how, down: -0.1 }, { ...how, hand: 'x' }, { up: 1 }, 'viel', null]) {
      const k = raw({ how: bad, howSamples: 5 });
      expect(k).not.toHaveProperty('how');
      expect(k).not.toHaveProperty('howSamples');
      expect(k.samples).toBe(40);
    }
  });

  it('alte Spielstände: der Avatar wird gegen den Garderobe-Katalog geprüft, den man übergibt', () => {
    // kleiner Katalog mit einer Frisur, die WARDROBE nicht kennt
    const small: WardrobeCatalog = { ...WARDROBE, hairStyles: [{ id: 'nur-im-test', name: 'Test', parts: [] }] };
    const old = { ...profile(), avatar: { ...defaultAvatar('w'), hairStyle: 'nur-im-test' } } as unknown;
    expect(migrateProfile(old, RULES, STORY, small).avatar.hairStyle).toBe('nur-im-test');
    expect(migrateProfile(old, RULES, STORY, WARDROBE).avatar.hairStyle).toBe(defaultAvatar('w').hairStyle);
    expect(loadProfiles([old], RULES, STORY, small).profiles[0]?.avatar.hairStyle).toBe('nur-im-test');
  });

  it('alte Spielstände ohne Riegel: was heute offen ist, gilt als schon einmal offen', () => {
    const old = { ...profile({ stats: { f: keyStat({ samples: 40, accuracy: 0.95, avgMs: 500 }), j: keyStat({ samples: 5, accuracy: 1, avgMs: 300 }) } }), latches: undefined } as unknown;
    const p = migrateProfile(old);
    expect(p.latches.f).toEqual(['training', 'precision', 'tempo']);
    expect(p.latches.j).toBeUndefined(); // misst noch
    expect(migrateProfile({ ...p, latches: { f: ['precision', 'quatsch'] } }).latches.f).toEqual(['training', 'precision', 'tempo']);
  });

  it('alte Spielstände ohne headColor: das Stirnband behält die Farbe des Oberteils; ungültige Werte auch', () => {
    const old = { ...profile(), avatar: { ...defaultAvatar('w'), head: 'headband', outfitColor: 'green' } } as Record<string, unknown>;
    delete (old.avatar as Record<string, unknown>).headColor;
    expect(migrateProfile(old).avatar.headColor).toBe('green');
    expect(normalizeAvatar({ outfitColor: 'rose', headColor: 'gibt-es-nicht' }).headColor).toBe('rose');
    expect(normalizeAvatar({ outfitColor: 'rose', headColor: 7 }).headColor).toBe('rose');
    expect(normalizeAvatar({ outfitColor: 'rose', headColor: 'orange' }).headColor).toBe('orange');
  });

  it('alte Spielstände ohne Zubehör: keins, in der Farbe des Oberteils; ungültige Werte auch', () => {
    const old = { ...profile(), avatar: { ...defaultAvatar('w'), outfitColor: 'green' } } as Record<string, unknown>;
    delete (old.avatar as Record<string, unknown>).accessory;
    delete (old.avatar as Record<string, unknown>).accessoryColor;
    expect(migrateProfile(old).avatar).toMatchObject({ accessory: 'none', accessoryColor: 'green' });
    expect(normalizeAvatar({ accessory: 'gibt-es-nicht' }).accessory).toBe('none');
    expect(normalizeAvatar({ outfitColor: 'rose', accessoryColor: 7 }).accessoryColor).toBe('rose');
    expect(normalizeAvatar({ outfitColor: 'rose', accessoryColor: 'orange' }).accessoryColor).toBe('orange');
  });

  it('Spielstände mit der weggefallenen Stoff-Farbe bluegray: zurück auf die Grundfarben, Kopf und Zubehör in der Farbe des Oberteils', () => {
    const d = defaultAvatar('w');
    const old = { ...profile(), avatar: { ...d, outfitColor: 'bluegray', pantsColor: 'bluegray', shoesColor: 'bluegray', headColor: 'bluegray', accessoryColor: 'bluegray' } };
    expect(migrateProfile(old).avatar).toMatchObject({ outfitColor: d.outfitColor, pantsColor: d.pantsColor, shoesColor: d.shoesColor, headColor: d.outfitColor, accessoryColor: d.outfitColor });
  });

  it('alte Spielstände ohne best: geschaffte Aufträge 1, sonst der aktuelle Stand der Tasten', () => {
    const stat = keyStat({ samples: 30 });
    const old = {
      ...profile({ stats: { s: stat, l: { ...stat, samples: 15 } } }),
      lessons: {
        'm1-l1': { exercises: 2, bestStars: 2, mastered: true },
        'm1-l3': { exercises: 1, bestStars: 1, mastered: false },
        'gibt-es-nicht': { exercises: 1, bestStars: 1, mastered: false },
        kaputt: 7,
      },
    };
    const p = migrateProfile(old);
    expect(p.lessons['m1-l1']).toMatchObject({ mastered: true, best: 1 });
    expect(p.lessons['m1-l3']?.best).toBeCloseTo(0.5);
    expect(p.lessons['gibt-es-nicht']?.best).toBe(0);
    expect(p.lessons.kaputt).toBeUndefined();
  });

  it('alte Spielstände ohne story: fällige Szenen gelten als gelesen, es kommt keine Flut', () => {
    const old: Record<string, unknown> = { ...profile({ lessons: mastered('m1-l1'), badges: { tastsinn: 1 } }) };
    delete old.story;
    delete old.cases;
    const p = migrateProfile(old);
    expect(p.story.v).toBeGreaterThan(0);
    expect(p.story.log.length).toBeGreaterThan(0);
    expect(p.story.read).toEqual(p.story.log.map((l) => l.id));
    expect(p.cases).toEqual({});
    // zweites Laden ändert nichts mehr
    expect(migrateProfile(p)).toEqual(p);
  });

  it('Spielstände von vor der neuen Garderobe: Belohnungen, die schon fällig wären, sind sofort da – ohne Flut', () => {
    const before = profile({ xp: 600, lessons: mastered('m1-l1', 'm1-l2'), story: storyLog(['l1-done', 'l2-done', 'rank-anwaerter', 'rank-agent'], { v: 5, read: ['l1-done', 'l2-done', 'rank-anwaerter', 'rank-agent'] }) });
    const p = migrateProfile(before);
    const owned = ownedItems(p, STORY);
    for (const id of ['polo', 'colors-neon']) expect(owned.has(id), id).toBe(true); // Szene war schon dran bzw. Rang erreicht
    expect(owned.has('headband')).toBe(false); // Auftrag 3 noch nicht geschafft
    expect(unread(p, STORY)).toEqual([]);
  });

  it('alte Spielstände mit Abzeichen und Rängen: keine Paket-Flut, aber alles im Besitz', () => {
    const old: Record<string, unknown> = { ...profile({ xp: 600, badges: { tastsinn: 1, 'serie-3': 1, grundreihe: 1, spielhalle: 1 }, lessons: mastered('m1-l1', 'm1-l2') }) };
    delete old.story;
    delete old.cases;
    const p = migrateProfile(old);
    const ids = p.story.log.map((l) => l.id);
    expect(ids).toEqual(expect.arrayContaining(['badge-tastsinn', 'badge-serie-3', 'badge-grundreihe', 'badge-spielhalle', 'rank-anwaerter', 'rank-agent']));
    expect(unread(p, STORY)).toEqual([]);
    expect([...ownedItems(p, STORY)]).toEqual(expect.arrayContaining(['cuffed', 'cardigan', 'shades', 'buchstabenkescher']));
  });

  it('Inhaltsversion 7: Abzeichen von vor dem Belohnungsplan bringen ihr Paket beim Laden noch – ohne Flut; neue Stände nicht', () => {
    const later = { striped: 'serie-7', boots: 'sauber-100', agentboots: 'drei-sterne', sandals: 'tempo-100', bob: 'null-fehler', messy: 'ehrenkodex' };
    const badges = Object.fromEntries(Object.values(later).map((b) => [b, 1]));
    const before = profile({ xp: 600, badges, lessons: mastered('m1-l1', 'm1-l2'), story: storyLog(['l1-done', 'l2-done', 'rank-anwaerter', 'rank-agent'], { v: 6, read: ['l1-done', 'l2-done', 'rank-anwaerter', 'rank-agent'] }) });
    const p = migrateProfile(before);
    const owned = ownedItems(p, STORY);
    for (const id of Object.keys(later)) expect(owned.has(id), id).toBe(true);
    expect(unread(p, STORY)).toEqual([]);
    expect(migrateProfile(p)).toEqual(p);
    // wer die Pakete schon mit Version 7 nicht bekommen hat, holt sie nicht nach
    const now = migrateProfile({ ...before, story: { ...before.story, v: 7 } });
    for (const id of Object.keys(later)) expect(ownedItems(now, STORY).has(id), id).toBe(false);
  });

  it('Inhaltsversion 8: Akt 2 ist im Spiel – das Nachholen verschluckt nichts von Akt 2, sein erstes Briefing kommt mit dem Beginn von Auftrag 1', () => {
    const done = ['l1-done', 'l6-done', 'exam-after', 'exam-after-foto'];
    const before = profile({ xp: 600, badges: { grundreihe: 1 }, lessons: masteredModule(COURSE, 'm1'), exams: { m1: { attempts: 1, outcome: 'passed' } }, story: storyLog(done, { v: 7, read: done }) });
    const p = migrateProfile(before);
    expect(p.story.log.map((l) => l.id).filter((id) => id.startsWith('a2-'))).toEqual([]);
    // das Briefing von Auftrag 1 ist erst fällig, wenn der Auftrag begonnen ist
    expect(dueScenes(p, STORY, RULES)).not.toContain('a2-start');
    const begun = { ...p, lessons: { ...p.lessons, 'm2-l1': { exercises: 0, bestStars: 0 as const, best: 0, mastered: false } } };
    expect(dueScenes(begun, STORY, RULES)).toEqual(expect.arrayContaining(['a2-start', 'a2-l1-brief']));
    // Nebenszenen von Akt 2 kommen nicht in Durchgängen von Akt 1 (nur im eigenen Akt)
    expect(nextSideScene(p, STORY, RULES, 'm1-l3')?.startsWith('a2-')).not.toBe(true);
  });

  it('Inhaltsversion 9: Akt 3 ist im Spiel – das Nachholen verschluckt nichts von Akt 3, Leggings und Faltstiefel aus altem Besitz bleiben', () => {
    const done = ['l1-done', 'a2-l1-brief', 'a2-exam-after', 'a2-gift-shorts', 'badge-tempo-60', 'badge-sauber-100'];
    const before = profile({
      xp: 1200,
      badges: { grundreihe: 1, 'obere-reihe': 1, 'tempo-60': 1, 'sauber-100': 1 },
      lessons: { ...masteredModule(COURSE, 'm1'), ...masteredModule(COURSE, 'm2') },
      exams: { m1: { attempts: 1, outcome: 'passed' }, m2: { attempts: 1, outcome: 'passed' } },
      story: storyLog(done, { v: 8, read: done }),
    });
    const p = migrateProfile(before);
    expect(p.story.log.map((l) => l.id).filter((id) => id.startsWith('a3-'))).toEqual([]);
    // das Briefing von Auftrag 1 ist erst fällig, wenn der Auftrag begonnen ist
    expect(dueScenes(p, STORY, RULES)).not.toContain('a3-start');
    const begun = { ...p, lessons: { ...p.lessons, 'm3-l1': { exercises: 0, bestStars: 0 as const, best: 0, mastered: false } } };
    expect(dueScenes(begun, STORY, RULES)).toEqual(expect.arrayContaining(['a3-start', 'a3-l1-brief']));
    // Nebenszenen von Akt 3 kommen nicht in Durchgängen von Akt 2 (nur im eigenen Akt)
    expect(nextSideScene(p, STORY, RULES, 'm2-l3')?.startsWith('a3-')).not.toBe(true);
    // wer Leggings und Faltstiefel über die alten Pakete schon hat, behält sie
    const owned = ownedItems(p, STORY);
    expect(owned.has('leggings')).toBe(true);
    expect(owned.has('boots')).toBe(true);
  });

  it('Inhaltsversion 10: Akt 4 ist im Spiel – das Nachholen verschluckt nichts von Akt 4, Melone, Agentenlook und Nadelstreifen aus altem Besitz bleiben', () => {
    const done = ['l1-done', 'a2-l1-brief', 'a3-l1-brief', 'a3-exam-after', 'gift-melone', 'badge-uebungen-25', 'badge-serie-7'];
    const before = profile({
      xp: 2400,
      badges: { grundreihe: 1, 'obere-reihe': 1, 'untere-reihe': 1 },
      lessons: { ...masteredModule(COURSE, 'm1'), ...masteredModule(COURSE, 'm2'), ...masteredModule(COURSE, 'm3') },
      exams: { m1: { attempts: 1, outcome: 'passed' }, m2: { attempts: 1, outcome: 'passed' }, m3: { attempts: 1, outcome: 'passed' } },
      story: storyLog(done, { v: 9, read: done }),
    });
    const p = migrateProfile(before);
    expect(p.story.log.map((l) => l.id).filter((id) => id.startsWith('a4-'))).toEqual([]);
    // das Briefing von Auftrag 1 (und damit die Krawatte) ist erst fällig, wenn der Auftrag begonnen ist
    expect(dueScenes(p, STORY, RULES)).not.toContain('a4-start');
    const begun = { ...p, lessons: { ...p.lessons, 'm4-l1': { exercises: 0, bestStars: 0 as const, best: 0, mastered: false } } };
    expect(dueScenes(begun, STORY, RULES)).toEqual(expect.arrayContaining(['a4-start', 'a4-l1-brief']));
    // Nebenszenen von Akt 4 kommen nicht in Durchgängen von Akt 3 (nur im eigenen Akt)
    expect(nextSideScene(p, STORY, RULES, 'm3-l3')?.startsWith('a4-')).not.toBe(true);
    // wer Melone, Agentenlook und Nadelstreifen über die alten Szenen schon hat, behält sie
    const owned = ownedItems(p, STORY);
    for (const id of ['bowler', 'agent', 'striped']) expect(owned.has(id), id).toBe(true);
  });

  it('Inhaltsversion 11: Akt 5 ist im Spiel – das Nachholen verschluckt nichts von Akt 5, Bob und Strubbelig aus altem Besitz bleiben', () => {
    const done = ['l1-done', 'a2-l1-brief', 'a3-l1-brief', 'a4-l1-brief', 'a4-exam-after', 'badge-null-fehler', 'badge-ehrenkodex'];
    const before = profile({
      xp: 2800,
      badges: { grundreihe: 1, 'obere-reihe': 1, 'untere-reihe': 1, grossschreibung: 1 },
      lessons: { ...masteredModule(COURSE, 'm1'), ...masteredModule(COURSE, 'm2'), ...masteredModule(COURSE, 'm3'), ...masteredModule(COURSE, 'm4') },
      exams: { m1: { attempts: 1, outcome: 'passed' }, m2: { attempts: 1, outcome: 'passed' }, m3: { attempts: 1, outcome: 'passed' }, m4: { attempts: 1, outcome: 'passed' } },
      story: storyLog(done, { v: 10, read: done }),
    });
    const p = migrateProfile(before);
    expect(p.story.log.map((l) => l.id).filter((id) => id.startsWith('a5-'))).toEqual([]);
    // das Briefing von Auftrag 1 (und damit der Gürtel) ist erst fällig, wenn der Auftrag begonnen ist
    expect(dueScenes(p, STORY, RULES)).not.toContain('a5-start');
    const begun = { ...p, lessons: { ...p.lessons, 'm5-l1': { exercises: 0, bestStars: 0 as const, best: 0, mastered: false } } };
    expect(dueScenes(begun, STORY, RULES)).toEqual(expect.arrayContaining(['a5-start', 'a5-l1-brief']));
    // Nebenszenen von Akt 5 kommen nicht in Durchgängen von Akt 4 (nur im eigenen Akt)
    expect(nextSideScene(p, STORY, RULES, 'm4-l4')?.startsWith('a5-')).not.toBe(true);
    // wer Bob und Strubbelig über die alten Szenen schon hat, behält sie
    const owned = ownedItems(p, STORY);
    for (const id of ['bob', 'messy']) expect(owned.has(id), id).toBe(true);
  });

  it('Inhaltsversion 12: Akt 6 ist im Spiel – das Nachholen verschluckt nichts von Akt 6, Sandalen aus altem Besitz bleiben', () => {
    const done = ['l1-done', 'a2-l1-brief', 'a3-l1-brief', 'a4-l1-brief', 'a5-l1-brief', 'a5-exam-after', 'badge-tempo-100'];
    const passed = { attempts: 1, outcome: 'passed' as const };
    const before = profile({
      xp: 3400,
      badges: { grundreihe: 1, 'obere-reihe': 1, 'untere-reihe': 1, grossschreibung: 1, satzzeichen: 1 },
      lessons: Object.assign({}, ...['m1', 'm2', 'm3', 'm4', 'm5'].map((m) => masteredModule(COURSE, m))),
      exams: { m1: passed, m2: passed, m3: passed, m4: passed, m5: passed },
      story: storyLog(done, { v: 11, read: done }),
    });
    const p = migrateProfile(before);
    expect(p.story.log.map((l) => l.id).filter((id) => id.startsWith('a6-'))).toEqual([]);
    // das Briefing von Auftrag 1 (und damit die Epauletten) ist erst fällig, wenn der Auftrag begonnen ist
    expect(dueScenes(p, STORY, RULES)).not.toContain('a6-start');
    expect(dueScenes(p, STORY, RULES)).not.toContain('a6-gift-epauletten');
    const begun = { ...p, lessons: { ...p.lessons, 'm6-l1': { exercises: 0, bestStars: 0 as const, best: 0, mastered: false } } };
    expect(dueScenes(begun, STORY, RULES)).toEqual(expect.arrayContaining(['a6-start', 'a6-l1-brief']));
    // Nebenszenen von Akt 6 kommen nicht in Durchgängen von Akt 5 (nur im eigenen Akt)
    expect(nextSideScene(p, STORY, RULES, 'm5-l3')?.startsWith('a6-')).not.toBe(true);
    // wer die Sandalen über die alte Szene schon hat, behält sie
    expect(ownedItems(p, STORY).has('sandals')).toBe(true);
    expect(ownedItems(migrateProfile({ ...before, story: storyLog(['l1-done'], { v: 11, read: ['l1-done'] }) }), STORY).has('sandals')).toBe(false);
  });

  it('Inhaltsversion 13: Akt 7 ist im Spiel – das Nachholen verschluckt nichts von Akt 7, Agentenstiefel aus altem Besitz bleiben', () => {
    const done = ['l1-done', 'a2-l1-brief', 'a3-l1-brief', 'a4-l1-brief', 'a5-l1-brief', 'a6-l1-brief', 'a6-exam-after', 'badge-drei-sterne'];
    const passed = { attempts: 1, outcome: 'passed' as const };
    const before = profile({
      xp: 4200,
      badges: { grundreihe: 1, 'obere-reihe': 1, 'untere-reihe': 1, grossschreibung: 1, satzzeichen: 1, zahlen: 1 },
      lessons: Object.assign({}, ...['m1', 'm2', 'm3', 'm4', 'm5', 'm6'].map((m) => masteredModule(COURSE, m))),
      exams: { m1: passed, m2: passed, m3: passed, m4: passed, m5: passed, m6: passed },
      story: storyLog(done, { v: 12, read: done }),
    });
    const p = migrateProfile(before);
    expect(p.story.log.map((l) => l.id).filter((id) => id.startsWith('a7-'))).toEqual([]);
    // das Briefing von Auftrag 1 (und damit der Umhang) ist erst fällig, wenn der Auftrag begonnen ist
    expect(dueScenes(p, STORY, RULES)).not.toContain('a7-start');
    expect(dueScenes(p, STORY, RULES)).not.toContain('a7-gift-umhang');
    const begun = { ...p, lessons: { ...p.lessons, 'm7-l1': { exercises: 0, bestStars: 0 as const, best: 0, mastered: false } } };
    expect(dueScenes(begun, STORY, RULES)).toEqual(expect.arrayContaining(['a7-start', 'a7-l1-brief']));
    // Nebenszenen von Akt 7 kommen nicht in Durchgängen von Akt 6 (nur im eigenen Akt)
    expect(nextSideScene(p, STORY, RULES, 'm6-l3')?.startsWith('a7-')).not.toBe(true);
    // wer die Agentenstiefel über die alte Szene schon hat, behält sie; wer nicht, bekommt sie erst in Akt 7
    expect(ownedItems(p, STORY).has('agentboots')).toBe(true);
    expect(ownedItems(migrateProfile({ ...before, story: storyLog(['l1-done'], { v: 12, read: ['l1-done'] }) }), STORY).has('agentboots')).toBe(false);
  });

  it('alte Spielstände mit Serie: Agententage aus dem Verlauf geschätzt, nie weniger als die alte Serie', () => {
    const at = (n: number) => ({ t: T0 + n * DAY, lessonId: 'm1-l1', kind: 'exercise', apm: 40, accuracy: 1, chars: 60 });
    const history = [at(0), at(0), at(2), at(9)]; // drei verschiedene Tage
    const old = { ...profile(), history, streak: { current: 1, best: 2, lastDay: dayKey(T0 + 9 * DAY), freezes: 1 } } as Record<string, unknown>;
    delete old.days;
    expect(migrateProfile(old).days).toEqual({ count: 3, lastDay: dayKey(T0 + 9 * DAY) });
    // Die alte Serie war länger als der (gekürzte) Verlauf: sie zählt
    expect(migrateProfile({ ...old, streak: { current: 5, best: 8, lastDay: null, freezes: 0 } }).days).toEqual({ count: 8, lastDay: dayKey(T0 + 9 * DAY) });
    expect('streak' in migrateProfile(old)).toBe(false);
  });

  it('nach der Umstellung auf Agententage kommen schon verdiente Abzeichen bei der nächsten Übung – die Pakete einzeln', async () => {
    const old = { ...profile({ history: Array.from({ length: 8 }, (_, i) => ({ t: T0 + i * 2 * DAY, lessonId: 'm1-l1', kind: 'exercise' as const, apm: 40, accuracy: 1, chars: 60 })) }) } as Record<string, unknown>;
    delete old.days;
    const { s, store } = setup([migrateProfile(old)]);
    await s().init();
    await s().selectProfile('p1');
    await playRun(store, 'm1-l1');
    const badges = Object.keys(s().current!.badges);
    expect(badges).toEqual(expect.arrayContaining(['serie-3', 'serie-7']));
    // die Strickjacke kommt, je Durchgang höchstens ein Geschenk; das Paket zu Wochenagent ist stillgelegt (Teil für später)
    expect((await playUntilOwned(store, 'cardigan', 'm1-l1')).maxGiftsPerRun).toBeLessThanOrEqual(1);
    expect(unread(s().current!, STORY).filter((id) => id.startsWith('badge-serie'))).toEqual(['badge-serie-3']);
    expect(ownedItems(s().current!, s().story).has('striped')).toBe(false);
  });

  it('Inhaltsversion 5: die Antwort zum halben Foto zieht aus exam-after in die eigene Szene', () => {
    const old = { ...profile({ lessons: mastered(...lessonOrder(COURSE)), exams: { m1: { attempts: 1, outcome: 'passed' } } }) };
    const story = { v: 4, log: [{ id: 'exam-after', t: 5 }], picks: { 'exam-after': ['schweigen', 'ueberlegen'] }, read: ['exam-after'] };
    const p = migrateProfile({ ...old, story });
    expect(p.story.picks['exam-after']).toEqual(['schweigen']);
    expect(p.story.picks['exam-after-foto']).toEqual(['ueberlegen']);
    expect(p.story.read).toContain('exam-after-foto'); // als gelesen nachgetragen, im Krümel-Chat nachzulesen
    // neue Spielstände und schon umgezogene bleiben unberührt
    expect(migrateProfile(p).story.picks).toEqual(p.story.picks);
  });

  it('Inhaltsversion 5: war die Szene nach dem Einsatz noch ungelesen, bleibt auch das Foto ungelesen', () => {
    const old = { ...profile({ lessons: mastered(...lessonOrder(COURSE)), exams: { m1: { attempts: 1, outcome: 'passed' } } }) };
    const p = migrateProfile({ ...old, story: { v: 4, log: [{ id: 'exam-after', t: 5 }], picks: {}, read: [] } });
    expect(unread(p, STORY)).toEqual(expect.arrayContaining(['exam-after', 'exam-after-foto']));
  });

  it('veraltete Inhaltsversion gleicht erneut ab; kaputte story-Felder werden ersetzt', () => {
    const p = migrateProfile({ ...profile({ lessons: mastered('m1-l1') }), story: { v: 0, log: [{ id: 'alt', t: 3 }, 'kaputt'], picks: { a: ['x', 1] }, read: ['alt', 7] }, cases: { f: 5, g: 'x' } });
    expect(p.story.log.map((l) => l.id)).toContain('alt');
    expect(p.story.picks).toEqual({ a: ['x'] });
    expect(p.story.read).toContain('alt');
    expect(p.story.v).toBeGreaterThan(0);
    expect(p.cases).toEqual({ f: 5 });
    expect(migrateProfile({ ...profile(), story: 'kaputt' }).story.log).toEqual([]);
  });

  it('Akten mit fehlenden oder falschen Pflichtwerten werden aufgefüllt statt das Spiel zu brechen', () => {
    const p = migrateProfile({ id: 'x', codename: 'Delta-01', schema: 1, xp: 'viel', days: { count: 'drei' }, history: null, seen: ['a', 3] });
    expect(p).toMatchObject({ id: 'x', firstName: '', createdAt: 0, xp: 0, stats: {}, lessons: {}, history: [], seen: ['a'] });
    expect(p.days).toEqual({ count: 0, lastDay: null });
    expect(() => migrateProfile({ id: '', codename: 'x', schema: 1 })).toThrow(InvalidProfileError);
    expect(() => migrateProfile([])).toThrow(InvalidProfileError);
  });

  it('Spielhalle: Level und Medaille werden übernommen, Unsinn wird ersetzt', () => {
    const p = migrateProfile({
      ...profile(),
      arcade: { regen: { best: 40, plays: 2, bestLevel: 7.8, medal: 'silber' }, tresor: { best: 5, plays: 1, bestLevel: -2, medal: 'platin' } },
    });
    expect(p.arcade).toEqual({
      regen: { best: 40, plays: 2, bestLevel: 7, medal: 'silber' },
      tresor: { best: 5, plays: 1, bestLevel: 0, medal: null },
    });
  });

  it('kaputte Spielstände: Felder mit falschem Typ werden gefiltert oder ersetzt', () => {
    const good = { t: 1, lessonId: 'm1-l1', kind: 'exercise', apm: 80, accuracy: 0.9, chars: 40 };
    const p = migrateProfile({
      ...profile(),
      stats: { f: keyStat(), j: { samples: 'x' }, k: 3, d: { samples: 12, accuracy: 0.9, avgMs: null } },
      lessons: { 'm1-l1': { exercises: 1, bestStars: 7, mastered: false }, 'm1-l2': { bestStars: 1.6 } },
      exams: { m1: { attempts: 2, outcome: 'passed', usedBackdoor: true }, m2: { attempts: 1, outcome: 'egal' }, m3: 'x' },
      badges: { tastsinn: 5, kaputt: 'gestern', nan: Number.NaN },
      history: [good, { ...good, kind: 'quatsch' }, { ...good, apm: '80' }, null],
      settings: { flow: 'ja', sound: false, blind: 'nein' },
      arcade: { regen: { best: 40, plays: 2 }, tresor: { best: 'viel' } },
      seen: 'alles',
    });
    expect(p.stats).toEqual({ f: keyStat(), d: { samples: 12, accuracy: 0.9, avgMs: null, timedSamples: 0 } });
    expect(p.lessons['m1-l1']?.bestStars).toBe(3);
    expect(p.lessons['m1-l2']?.bestStars).toBe(1);
    expect(p.exams).toEqual({ m1: { attempts: 2, outcome: 'passed', usedBackdoor: true } });
    expect(p.badges).toEqual({ tastsinn: 5 });
    expect(p.history).toEqual([good]);
    expect(p.settings).toEqual({ flow: false, sound: false, blind: false });
    expect(p.arcade).toEqual({ regen: { best: 40, plays: 2, bestLevel: 0, medal: null } }); // alter Stand ohne Level und Medaille
    expect(p.seen).toEqual([]);
  });

  it('Laden: kaputte Akten zählen, der Rest wird nach Anlegedatum sortiert', () => {
    const { profiles, broken } = loadProfiles([profile({ id: 'b', createdAt: 2 }), null, profile({ id: 'a', createdAt: 1 })]);
    expect(profiles.map((p) => p.id)).toEqual(['a', 'b']);
    expect(broken).toBe(1);
  });
});
