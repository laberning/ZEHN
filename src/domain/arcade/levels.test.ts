// Level, Medaillen und Startlevel der Spielhalle (gemeinsame Bausteine).

import { describe, expect, it } from 'vitest';
import { betterMedal, levelsDone, medalFor, nextGoal, startLevels } from './levels.ts';

const TH = [3, 6, 9] as const;

describe('Level und Medaillen', () => {
  it('Medaille nach dem geschafften Level, an den Schwellen genau', () => {
    expect([0, 2, 3, 5, 6, 8, 9, 30].map((l) => medalFor(l, TH))).toEqual([null, null, 'bronze', 'bronze', 'silber', 'silber', 'gold', 'gold']);
  });

  it('nächstes Ziel: die nächste Medaille, bei Gold keins', () => {
    expect(nextGoal(0, TH)).toEqual({ medal: 'bronze', level: 3 });
    expect(nextGoal(3, TH)).toEqual({ medal: 'silber', level: 6 });
    expect(nextGoal(8, TH)).toEqual({ medal: 'gold', level: 9 });
    expect(nextGoal(9, TH)).toBeNull();
  });

  it('bessere Medaille gewinnt, keine zählt am wenigsten', () => {
    expect(betterMedal(null, 'bronze')).toBe('bronze');
    expect(betterMedal('gold', 'silber')).toBe('gold');
    expect(betterMedal('bronze', 'silber')).toBe('silber');
    expect(betterMedal(null, null)).toBeNull();
  });

  it('Startlevel: 1 bis zum höchsten erreichten, mindestens 1', () => {
    expect(startLevels(0)).toEqual([1]);
    expect(startLevels(1)).toEqual([1]);
    expect(startLevels(4)).toEqual([1, 2, 3, 4]);
  });

  it('geschaffte Level: die beim Start übersprungenen zählen mit, das Startlevel erst, wenn man es besteht', () => {
    expect(levelsDone(1, 1)).toBe(0);
    expect(levelsDone(1, 4)).toBe(3);
    expect(levelsDone(4, 4)).toBe(3);
    expect(levelsDone(4, 5)).toBe(4);
  });
});
