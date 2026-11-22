// Die Profil-Sicherungen der Browser-Tests (e2e/fixtures) bleiben gültig: sie laden mit der Migration und stehen dort, wo die Tests sie brauchen.
// Fällt ein Test um, weil sich Kurs oder Inhalte geändert haben: `npm run e2e:fixture` erzeugt die Dateien neu (scripts/e2e/fixtures.ts).

import { describe, expect, it } from 'vitest';
import { parseBackup } from '../app/backup.ts';
import { migrateProfile } from '../app/profileMigration.ts';
import { COURSE } from '../content/course.ts';
import { lessonOrder } from '../domain/course.ts';
import { averageApm } from '../domain/progress.ts';
import finale from '../../e2e/fixtures/nach-finale.json?raw';
import beforeFourSeals from '../../e2e/fixtures/vor-schaltplan.json?raw';
import { FIXTURE_FILES, FOUR_SEALS_LESSON } from './finalFixtures.ts';

const RAW = { [FIXTURE_FILES.finale]: finale, [FIXTURE_FILES.beforeFourSeals]: beforeFourSeals };
const load = (file: string) => migrateProfile(parseBackup(RAW[file as keyof typeof RAW]));
const HOW = 'Sicherung veraltet: `npm run e2e:fixture` erzeugt sie neu.';

describe('Profil-Sicherungen für die Browser-Tests', () => {
  it('nach dem Finale: alle Aufträge geschafft, alle Einsätze bestanden, Tempo hoch (lange Übungstexte)', () => {
    const p = load(FIXTURE_FILES.finale);
    expect(lessonOrder(COURSE).filter((id) => !p.lessons[id]?.mastered), HOW).toEqual([]);
    expect(COURSE.modules.filter((m) => p.exams[m.id]?.outcome !== 'passed').map((m) => m.id), HOW).toEqual([]);
    expect(averageApm(p) ?? 0, 'Durchschnittstempo für 400 Zeichen').toBeGreaterThanOrEqual(400);
  });

  it('vor dem Auftrag mit vier Siegeln: der Auftrag ist offen, alle davor sind geschafft', () => {
    const p = load(FIXTURE_FILES.beforeFourSeals);
    const order = lessonOrder(COURSE);
    const i = order.indexOf(FOUR_SEALS_LESSON);
    expect(order.slice(0, i).filter((id) => !p.lessons[id]?.mastered), HOW).toEqual([]);
    expect(p.lessons[FOUR_SEALS_LESSON]?.mastered ?? false, HOW).toBe(false);
    expect(COURSE.modules.flatMap((m) => m.lessons).find((l) => l.id === FOUR_SEALS_LESSON)!.newKeys, 'vier neue Tasten = vier Siegel').toHaveLength(4);
    expect(averageApm(p) ?? 0).toBeGreaterThanOrEqual(400);
  });

  it('die Sicherungen enthalten keine persönlichen Daten außer dem Spielernamen der Tests', () => {
    for (const text of Object.values(RAW)) {
      expect(text).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}|\/home\/|\/Users\//i);
    }
  });
});
