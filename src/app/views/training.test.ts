// Eigene Entwicklung in der Nachbesprechung der Tippstunde: Stand aus Akt 1, Rückfall, ohne Verlauf.

import { describe, expect, it } from 'vitest';
import { COURSE } from '../../content/course.ts';
import type { HistoryEntry } from '../../domain/profile.ts';
import { T0 } from '../../test/factories.ts';
import { trainingDebrief } from './training.ts';

const entry = (lessonId: string, kind: HistoryEntry['kind'], apm: number, accuracy: number, i = 0): HistoryEntry => ({ t: T0 + i, lessonId, kind, apm, accuracy, chars: 60 });
const now = { apm: 41, accuracy: 0.93 };

describe('trainingDebrief', () => {
  it('Stand aus Akt 1: Mittel der Übungen von Modul 1 (Aufwärmen, Training und andere Module zählen nicht)', () => {
    const history = [
      entry('m1-l1', 'warmup', 5, 0.5),
      entry('m1-l1', 'exercise', 20, 0.8),
      entry('m1-l2', 'exercise', 24, 0.9),
      entry('m1-l2', 'training', 90, 0.99),
      entry('m2-l1', 'exercise', 60, 0.99),
    ];
    const d = trainingDebrief({ history }, COURSE, now);
    expect(d.now).toEqual(now);
    expect(d.then).toMatchObject({ apm: 22, label: 'Akt 1' });
    expect(d.then!.accuracy).toBeCloseTo(0.85);
  });

  it('fehlen die Übungen von Akt 1 im Verlauf: die ältesten zehn gewerteten Einträge (ohne Aufwärmen)', () => {
    const history = [entry('m3-l1', 'warmup', 1, 0.1), ...Array.from({ length: 12 }, (_, i) => entry('m3-l1', 'exercise', i < 10 ? 30 : 100, 0.9, i + 1))];
    expect(trainingDebrief({ history }, COURSE, now).then).toMatchObject({ apm: 30, label: 'Akt 1' });
  });

  it('Runden der Tippstunde selbst zählen nie als früherer Stand', () => {
    const history = [...Array.from({ length: 3 }, (_, i) => entry('m7-l3', 'tippstunde', 80, 0.97, i)), entry('m3-l1', 'exercise', 30, 0.9, 5)];
    expect(trainingDebrief({ history }, COURSE, now).then).toMatchObject({ apm: 30 });
    expect(trainingDebrief({ history: history.slice(0, 3) }, COURSE, now).then).toBeNull();
  });

  it('ohne Verlauf: nur die Runde', () => {
    expect(trainingDebrief({ history: [] }, COURSE, now)).toEqual({ now, then: null });
  });
});
