// Profile für die Browser-Tests (e2e/fixtures/*.json): Ein Kind spielt das ganze Spiel mit den Szenario-Helfern.
// Gebaut wird hier, geschrieben von `npm run e2e:fixture` (scripts/e2e/fixtures.ts); ein Test (src/test/e2eFixtures.test.ts) hält die
// Dateien gültig. Der Browser lädt sie über die Datei-Sicherung der Akte (Profile-Übersicht), so erreicht er Akt 4 bis 7.

import { createGameStore } from '../app/store.ts';
import { encodeBackup } from '../app/backup.ts';
import { COURSE } from '../content/course.ts';
import { memoryRepository } from '../platform/memoryRepository.ts';
import { DAY, fixedEnv, profile, soundRecorder } from './factories.ts';
import { cleanTyping, failExamUntilBackdoor, playLessonToMastery, playRun } from './scenario.ts';

/** Auftrag, vor dem die zweite Sicherung steht: Akt 7 „Der Schaltplan“ hat vier neue Tasten, also vier Siegel */
export const FOUR_SEALS_LESSON = 'm7-l2';

/** Ein schnelles Kind (500 Anschläge pro Minute): Danach sind alle Übungstexte so lang wie möglich (400 Zeichen) */
const MS_PER_KEY = 120;

/** Dateinamen im Ordner e2e/fixtures */
export const FIXTURE_FILES = { finale: 'nach-finale.json', beforeFourSeals: 'vor-schaltplan.json' } as const;

/** Spielt das ganze Spiel; liefert die Sicherungen (Dateiinhalt) nach dem Finale und kurz vor dem Auftrag mit vier Siegeln */
export async function buildFixtures(): Promise<Record<keyof typeof FIXTURE_FILES, string>> {
  const env = fixedEnv();
  const store = createGameStore({ repo: memoryRepository([profile()]), sound: soundRecorder(), env });
  const s = () => store.getState();
  await s().init();
  s().selectProfile('p1');
  // Das Kind hat alles gelesen: sonst führt jeder Auftrag zuerst in den Funk zu den ungelesenen Nachrichten
  const backup = async () => {
    await s().readScenes(s().current!.story.log.map((l) => l.id));
    return encodeBackup(s().current!, env.now());
  };

  // Die Länge der nächsten Runde folgt dem Durchschnittstempo der letzten zehn Runden; Einsätze (auch misslungene) drücken ihn.
  // Darum vor jeder Sicherung ein paar schnelle Wiederholungen des zuletzt geschafften Auftrags.
  const fastRuns = async (lessonId: string) => {
    for (let i = 0; i < 4; i++) await playRun(store, lessonId, MS_PER_KEY);
  };

  let beforeFourSeals = '';
  let previous = COURSE.modules[0]!.lessons[0]!.id;
  for (const m of COURSE.modules) {
    env.advance(DAY);
    for (const { id } of m.lessons) {
      if (id === FOUR_SEALS_LESSON) await fastRuns(previous);
      previous = id;
      await s().beginLesson(id); // das Briefing wird fällig; die Sicherung davor hat es schon gelesen
      if (id === FOUR_SEALS_LESSON) beforeFourSeals = await backup();
      await playLessonToMastery(store, id, MS_PER_KEY);
    }
    await failExamUntilBackdoor(store, m.id);
    await s().recordExam(m.id, cleanTyping('asdf jklö asdf', 200), 8_000);
  }
  await fastRuns(previous);
  return { finale: await backup(), beforeFourSeals };
}
