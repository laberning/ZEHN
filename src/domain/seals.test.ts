// Tastensiegel: drei Riegel je Taste, Live-Werte beim Tippen, Hinweise.

import { describe, expect, it } from 'vitest';
import { SHIFT_COURSE, T0, TEST_COURSE, TEST_MASTERY, TEST_RULES, keyStat, profile, strokes } from '../test/factories.ts';
import { lessonTodo, sealAdvice } from './format.ts';
import { applyKeystrokes, updateKeyStat, type KeyStat } from './keyStats.ts';
import { HEAT_MID, MEASURE_MIN, accuracyHeat, blockingLatch, heatScale, hitsToOpen, isMastered, sealOf, sealsFor, shakyKeys, slippedSeal, type MasteryCriteria } from './mastery.ts';
import { liveSeals, missionReducer, missionStart, planRounds } from './mission.ts';
import { SHIFT_LEFT, SHIFT_RIGHT } from './keyboard.ts';
import { lessonStatus, recordStrokes } from './progress.ts';
import { recordExercise } from './record.ts';
import { startTyping, typingResult } from './typing.ts';

const C: MasteryCriteria = { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 };
/** knapp über den Schwellen von C */
const stat = (over: Partial<KeyStat> = {}): KeyStat => keyStat({ accuracy: 0.95, avgMs: 800, ...over });

describe('sealOf', () => {
  it('alle Riegel offen = gesichert', () => {
    const s = sealOf('f', stat(), C);
    expect(s).toMatchObject({ secured: true, measuring: false });
    expect([s.training.open, s.precision.open, s.tempo.open]).toEqual([true, true, true]);
  });

  it('jeder Riegel knapp unter und über seiner Schwelle', () => {
    expect(sealOf('f', stat({ samples: 9 }), C).training.open).toBe(false);
    expect(sealOf('f', stat({ samples: 10 }), C).training.open).toBe(true);
    expect(sealOf('f', stat({ accuracy: 0.89 }), C).precision.open).toBe(false);
    expect(sealOf('f', stat({ accuracy: 0.9 }), C).precision.open).toBe(true);
    expect(sealOf('f', stat({ avgMs: 1001 }), C).tempo.open).toBe(false);
    expect(sealOf('f', stat({ avgMs: 1000 }), C).tempo.open).toBe(true);
    expect(sealOf('f', stat({ accuracy: 0.89 }), C).secured).toBe(false);
  });

  it('weniger als 10 Anschläge: Präzision und Tempo messen noch und sind zu', () => {
    const s = sealOf('f', stat({ samples: MEASURE_MIN - 1, accuracy: 1, avgMs: 300 }), C);
    expect(s).toMatchObject({ measuring: true });
    expect(s.precision.open).toBe(false);
    expect(s.tempo.open).toBe(false);
    expect(sealOf('f', undefined, C)).toMatchObject({ measuring: true, secured: false, samples: 0, avgMs: null });
  });
});

describe('Riegel mit Schließschwelle', () => {
  const C92: MasteryCriteria = { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 };
  const sitting = keyStat({ samples: 40, accuracy: 0.92, avgMs: 1000 });

  it('ein einzelner Fehler schließt einen offenen Riegel nicht (92 % -> 84,6 %)', () => {
    const after = updateKeyStat(sitting, false, null);
    expect(after.accuracy).toBeCloseTo(0.846, 3);
    expect(sealOf('f', after, C92).precision.open).toBe(false); // ohne Merkmal zu
    const s = sealOf('f', after, C92, ['training', 'precision', 'tempo']);
    expect(s.precision.open).toBe(true);
    expect(s.secured).toBe(true);
    expect(isMastered(after, C92, ['precision'])).toBe(true);
    expect(isMastered(after, C92)).toBe(false);
  });

  it('ein zweiter Fehler kurz danach schließt ihn (77,8 %)', () => {
    const after = updateKeyStat(updateKeyStat(sitting, false, null), false, null);
    expect(after.accuracy).toBeCloseTo(0.779, 2);
    const s = sealOf('f', after, C92, ['training', 'precision', 'tempo']);
    expect(s.precision.open).toBe(false);
    expect(s.secured).toBe(false);
  });

  it('Genau schließt unter 82 %, Tempo über 1,25 x Grenze', () => {
    const opened = ['precision', 'tempo'] as const;
    expect(sealOf('f', keyStat({ accuracy: 0.82, avgMs: 1000 }), C92, opened).precision.open).toBe(true);
    expect(sealOf('f', keyStat({ accuracy: 0.81, avgMs: 1000 }), C92, opened).precision.open).toBe(false);
    expect(sealOf('f', keyStat({ accuracy: 1, avgMs: 1875 }), C92, opened).tempo.open).toBe(true);
    expect(sealOf('f', keyStat({ accuracy: 1, avgMs: 1876 }), C92, opened).tempo.open).toBe(false);
    expect(sealOf('f', keyStat({ accuracy: 1, avgMs: 1876 }), C92).tempo.open).toBe(false);
  });

  it('Zahl der fehlenden Treffer: null beim Messen, 0 darüber, sonst wirklich genug', () => {
    expect(hitsToOpen(undefined, C92)).toBeNull();
    expect(hitsToOpen(keyStat({ samples: 5, accuracy: 0.5 }), C92)).toBeNull();
    expect(hitsToOpen(sitting, C92)).toBe(0);
    const low = updateKeyStat(sitting, false, null);
    const n = hitsToOpen(low, C92)!;
    expect(n).toBeGreaterThan(0);
    let st = low;
    for (let i = 0; i < n - 1; i++) st = updateKeyStat(st, true, 500);
    expect(st.accuracy).toBeLessThan(0.92);
    expect(updateKeyStat(st, true, 500).accuracy).toBeGreaterThanOrEqual(0.92);
    expect(sealOf('f', low, C92).hitsToOpen).toBe(n);
    expect(sealOf('f', sitting, C92).hitsToOpen).toBeNull();
  });
});

describe('Hinweise', () => {
  it('sagt, welcher Riegel bremst, und lobt gesicherte Tasten', () => {
    const seals = [sealOf('l', stat(), C), sealOf('s', stat({ accuracy: 0.8 }), C)];
    expect(blockingLatch(seals[1]!)).toBe('precision');
    expect(blockingLatch(seals[0]!)).toBeNull();
    expect(sealAdvice(seals)).toBe(`L sitzt! S (linker Ringfinger) noch etwas genauer (noch ${seals[1]!.hitsToOpen} Treffer).`);
    expect(sealAdvice([sealOf('s', undefined, C)])).toBe('S (linker Ringfinger) braucht noch ein paar Anschläge.');
    expect(sealAdvice([sealOf('s', stat({ avgMs: 1500 }), C)])).toBe('S (linker Ringfinger) noch etwas flüssiger.');
    expect(sealAdvice([seals[0]!])).toMatch(/Alle Siegel sind offen/);
  });

  it('„Noch zu tun“ fürs HQ', () => {
    const p = profile({ stats: { f: stat(), j: stat({ accuracy: 0.5 }) } });
    expect(lessonTodo(lessonStatus(p, TEST_COURSE, 'a1'))).toBe('J (rechter Zeigefinger): genauer tippen');
    expect(lessonTodo(lessonStatus(profile(), TEST_COURSE, 'a1'))).toBe('F (linker Zeigefinger): mehr üben · J (rechter Zeigefinger): mehr üben');
    const ready = profile({ stats: { f: stat(), j: stat() } });
    expect(lessonTodo(lessonStatus(ready, TEST_COURSE, 'a1'))).toBe('Noch 2 Übungsrunden');
    expect(lessonTodo(lessonStatus(profile({ lessons: { a1: { exercises: 2, bestStars: 1, mastered: true, best: 1 } } }), TEST_COURSE, 'a1'))).toBeNull();
  });
});

describe('Live-Siegel in der Runde', () => {
  const rounds = planRounds(TEST_COURSE, 'a1');
  const base = applyKeystrokes({}, strokes('f', 12));
  const type = (s: ReturnType<typeof missionStart>, text: string, from = 0) =>
    [...text].reduce((st, ch, i) => missionReducer(st, { type: 'key', ch, now: (from + i) * 400 }), s);
  const samplesOfF = (s: ReturnType<typeof missionStart>) => liveSeals(s, ['f'], C)[0]!.samples;

  it('Werte ändern sich nur am Wortende', () => {
    let s = missionStart(rounds, startTyping('ff ff jj'), base);
    expect(samplesOfF(s)).toBe(12);
    s = type(s, 'ff');
    expect(samplesOfF(s)).toBe(12); // Wort noch nicht zu Ende
    s = type(s, ' ', 2);
    expect(samplesOfF(s)).toBe(14);
    s = type(s, 'f', 3);
    expect(samplesOfF(s)).toBe(14);
  });

  it('nach dem Speichern der Runde zählt nichts doppelt', () => {
    let s = missionStart(rounds, startTyping('ff ff'), base);
    s = type(s, 'ff ff');
    expect(s.phase).toBe('saving');
    expect(samplesOfF(s)).toBe(16);
    s = missionReducer(s, { type: 'recorded', reward: { stars: 1, xp: 1, newBadges: [], lessonJustMastered: false, rankUp: null, newRecord: false } });
    expect(s.phase).toBe('between');
    expect(samplesOfF(s)).toBe(16);
    expect(s.baseStats.f?.samples).toBe(16);
    expect(s.runStartStats.f?.samples).toBe(12);
    expect(sealsFor(s.runStartStats, ['f'], C)[0]!.samples).toBe(12);
  });

  it('ein gesichertes Siegel bleibt bei einem Fehler mitten in der Runde gesichert', () => {
    const sitting = { f: keyStat({ samples: 40, accuracy: 0.9, avgMs: 500 }) };
    const fresh = () => type(missionStart(rounds, startTyping('f ff'), sitting), 'xf ');
    expect(liveSeals(fresh(), ['f'], C)[0]).toMatchObject({ secured: false }); // ohne Merker: 0,9 -> 0,83 schließt
    const live = liveSeals(fresh(), ['f'], C, { f: ['training', 'precision', 'tempo'] })[0]!;
    expect(live.accuracy).toBeLessThan(0.9);
    expect(live.secured).toBe(true);
  });

  it('ein Riegel, der mitten in der Runde aufgeht, bleibt beim nächsten Fehler offen', () => {
    const almost = { f: keyStat({ samples: 40, accuracy: 0.88, avgMs: 500 }) };
    let s = type(missionStart(rounds, startTyping('fff f ff'), almost), 'fff ');
    expect(liveSeals(s, ['f'], C)[0]!.secured).toBe(true); // 3 Treffer: über 90 %
    s = type(s, 'xf ', 4);
    const live = liveSeals(s, ['f'], C)[0]!;
    expect(live.accuracy).toBeLessThan(0.9);
    expect(live.secured).toBe(true);
    // ohne die Merker wäre er bei diesem Wert zu: die Riegel folgen dem Verlauf, nicht nur dem Endwert
    expect(sealsFor(applyKeystrokes(almost, s.typing.scored), ['f'], C)[0]!.secured).toBe(false);
  });

  it('Live-Anzeige und gespeicherter Stand stimmen für dieselben Anschläge überein', () => {
    const lesson = TEST_COURSE.modules[0]!.lessons[0]!;
    const mastery = TEST_COURSE.modules[0]!.mastery;
    type Latched = Record<string, ('training' | 'precision' | 'tempo')[]>;
    const starts: { stats: Record<string, KeyStat>; latches: Latched }[] = [
      { stats: { f: keyStat({ samples: 40, accuracy: 0.88, avgMs: 500 }), j: keyStat({ samples: 40, accuracy: 0.95, avgMs: 500 }) }, latches: {} },
      { stats: { f: keyStat({ samples: 40, accuracy: 0.84, avgMs: 500 }), j: keyStat({ samples: 8, accuracy: 0.9, avgMs: 900 }) }, latches: { f: ['training', 'precision', 'tempo'] } },
      { stats: {}, latches: {} },
    ];
    const runs = [
      ['fff jj ff', 'fff jj ff'],
      ['fff jj ff', 'xfff jj fxf'],
      ['ff ff ff ff', 'xfxf ff xfxf ff'],
      ['jjj fff', 'jjxj fxxff'],
    ] as const;
    for (const start of starts) {
      for (const [text, typed] of runs) {
        const p = profile({ stats: start.stats, latches: start.latches });
        const s = type(missionStart(rounds, startTyping(text), p.stats, p.latches), typed);
        expect(s.phase).toBe('saving');
        const live = liveSeals(s, lesson.newKeys, mastery, p.latches);
        const saved = recordExercise(p, { lessonId: lesson.id, kind: 'exercise', result: typingResult(s.typing), scored: s.typing.scored, now: T0 }, TEST_RULES).profile;
        expect(live).toEqual(lessonStatus(saved, TEST_COURSE, lesson.id).keys);
        // auch in der kurzen Zeit, in der das Profil schon gespeichert ist, die Runde aber noch nicht als eingerechnet gilt
        expect(liveSeals(s, lesson.newKeys, mastery, saved.latches)).toEqual(live);
      }
    }
  });

  it('merkt sich die Riegel beim Start des Durchgangs für „vorher“', () => {
    const s = missionStart(rounds, startTyping('f'), {}, { f: ['training'] });
    expect(s.runStartLatches).toEqual({ f: ['training'] });
    expect(missionStart(rounds, startTyping('f')).runStartLatches).toEqual({});
  });

  it('missionStart braucht Runden', () => {
    expect(() => missionStart([], startTyping('f'))).toThrow();
  });
});

describe('Wärmekarte nach Präzision', () => {
  const A: MasteryCriteria = { minSamples: 40, minAccuracy: 0.92, maxAvgMs: 1200 };

  it('misst noch: unter MEASURE_MIN Anschlägen oder ohne Messung', () => {
    expect(accuracyHeat(stat({ samples: MEASURE_MIN - 1 }), A)).toBeNull();
    expect(accuracyHeat(stat({ samples: MEASURE_MIN }), A)).toEqual(expect.any(Number));
    expect(accuracyHeat(undefined, A)).toBeNull();
  });

  it('Skala hängt an minAccuracy: 80 / 92 / 98 %, bei 0,97 ist high = 1', () => {
    const s = heatScale(A);
    expect([s.low, s.mid, s.high, s.midAt]).toEqual([expect.closeTo(0.8), 0.92, expect.closeTo(0.98), HEAT_MID]);
    expect(heatScale({ ...A, minAccuracy: 0.97 }).high).toBe(1);
  });

  it('low / mid / high ergeben 0 / HEAT_MID / 1, außerhalb wird gekappt', () => {
    const s = heatScale(A);
    expect(accuracyHeat(stat({ accuracy: s.low }), A)).toBe(0);
    expect(accuracyHeat(stat({ accuracy: s.mid }), A)).toBe(HEAT_MID);
    expect(accuracyHeat(stat({ accuracy: s.high }), A)).toBe(1);
    expect(accuracyHeat(stat({ accuracy: 0.5 }), A)).toBe(0);
    expect(accuracyHeat(stat({ accuracy: 1 }), A)).toBe(1);
    expect(accuracyHeat(stat({ accuracy: 0.86 }), A)).toBeCloseTo(0.3);
    expect(accuracyHeat(stat({ accuracy: 0.95 }), A)).toBeCloseTo(0.8);
  });

  it('Gleichlauf mit dem Siegel: Stufe >= HEAT_MID genau dann, wenn der Präzisions-Riegel offen ist', () => {
    for (const c of [A, { ...A, minAccuracy: 0.97 }, TEST_MASTERY]) {
      for (const accuracy of [0.85, 0.91, 0.92, 0.93, 0.95, 0.97]) {
        for (const samples of [MEASURE_MIN, 30]) {
          const st = stat({ samples, accuracy });
          const heat = accuracyHeat(st, c)!;
          expect(heat >= HEAT_MID, `${c.minAccuracy}/${accuracy}/${samples}`).toBe(sealOf('f', st, c).precision.open);
        }
      }
    }
  });
});

describe('wacklige Tasten', () => {
  it('nur gemessene Tasten unter der Präzisionsschwelle, die wackligste zuerst, höchstens n', () => {
    const stats = {
      a: stat({ accuracy: 0.85 }),
      b: stat({ accuracy: 0.7 }),
      c: stat({ accuracy: 0.9 }), // genau auf der Schwelle: nicht wacklig
      d: stat({ accuracy: 0.5, samples: MEASURE_MIN - 1 }), // misst noch
      e: stat({ accuracy: 0.85 }),
      f: stat({ accuracy: 0.8 }),
    };
    const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'x'];
    expect(shakyKeys(stats, keys, C).map((k) => k.key)).toEqual(['b', 'f', 'a']);
    expect(shakyKeys(stats, keys, C, 5)).toEqual([
      { key: 'b', accuracy: 0.7 },
      { key: 'f', accuracy: 0.8 },
      { key: 'a', accuracy: 0.85 },
      { key: 'e', accuracy: 0.85 }, // Gleichstand: Reihenfolge der Tasten
    ]);
  });
});

describe('Siegel der Umschalttaste', () => {
  const left = 'QWERTASDFGYXCVB';

  it('15 Großbuchstaben einer Hand zeigen genau ein Siegel; es heißt wie die Umschalttaste', () => {
    const seals = sealsFor({}, [...left], C);
    expect(seals.map((s) => s.key)).toEqual([SHIFT_RIGHT]);
    expect(sealsFor({}, [...left, ...'ZUJ'], C).map((s) => s.key)).toEqual([SHIFT_RIGHT, SHIFT_LEFT]);
  });

  it('der Auftrag zeigt ein Siegel, das aus Anschlägen auf beliebige Großbuchstaben der Hand wächst', () => {
    const p = profile({ stats: applyKeystrokes({}, [...strokes('Q', 5), ...strokes('G', 5), ...strokes('B', 5)]) });
    const status = lessonStatus(p, SHIFT_COURSE, 's2a');
    expect(status.keys).toHaveLength(1);
    expect(status.keys[0]).toMatchObject({ key: SHIFT_RIGHT, samples: 15, secured: true });
  });

  it('die Riegel bleiben mit Schließschwelle offen (Fehler schließt nicht) und werden mit der Hand fortgeschrieben', () => {
    let p = profile();
    const run = (scored: ReturnType<typeof strokes>) => {
      p = { ...p, ...recordStrokes(p, scored, SHIFT_COURSE) };
    };
    run([...strokes('W', 30), ...strokes('T', 10)]);
    expect(p.latches[SHIFT_RIGHT]).toEqual(['training', 'precision', 'tempo']);
    run(strokes('E', 1, { correct: false }));
    expect(p.latches[SHIFT_RIGHT]).toEqual(['training', 'precision', 'tempo']);
    expect(p.stats[SHIFT_LEFT]).toBeUndefined();
  });

  it('Live-Siegel in der Runde: Anschläge auf Großbuchstaben füllen das Siegel der Umschalttaste', () => {
    const text = 'Wa Eb Qc Ad ';
    let s = missionStart([{ kind: 'exercise', n: 1, of: 2, seconds: 30, focus: [...left] }], startTyping(text, 'strict'), {}, {});
    let t = 0;
    for (const ch of text) s = missionReducer(s, { type: 'key', ch, now: (t += 400) });
    const [seal, ...more] = liveSeals(s, [...left], { minSamples: 4, minAccuracy: 0.9, maxAvgMs: 1000 });
    expect(more).toHaveLength(0);
    expect(seal).toMatchObject({ key: SHIFT_RIGHT, samples: 4 });
    expect(seal!.training.open).toBe(true);
  });

  it('Auftrag geschafft, wenn das Siegel der Umschalttaste offen ist (plus Übungsrunden)', () => {
    const rules = { ...TEST_RULES, course: SHIFT_COURSE };
    const stats = applyKeystrokes({}, strokes('Q', 40));
    const p = profile({ stats, lessons: { s2a: { exercises: 1, bestStars: 1, mastered: false, best: 0 } } });
    const done = recordExercise(p, { lessonId: 's2a', kind: 'exercise', result: typingResult(startTyping('Q', 'strict')), scored: strokes('G', 2), now: T0 }, rules);
    expect(done.reward.lessonJustMastered).toBe(true);
  });
});

describe('slippedSeal', () => {
  const open = ['training', 'precision', 'tempo'] as const;
  const seal = (key: string, s: Partial<KeyStat>, opened: readonly (typeof open)[number][] = open) => sealOf(key, stat(s), C, opened);

  it('keine abgerutschte Taste: Riegel war zu, bleibt offen oder war nie offen', () => {
    expect(slippedSeal([], [])).toBeNull();
    expect(slippedSeal([seal('f', {})], [seal('f', { accuracy: 0.85 })])).toBeNull(); // bleibt offen (Schließschwelle 0,8)
    expect(slippedSeal([seal('f', { accuracy: 0.7 }, [])], [seal('f', { accuracy: 0.6 }, [])])).toBeNull();
  });

  it('vorher offen, nachher zu: die Taste mit beiden Siegeln', () => {
    const b = seal('k', {});
    const a = seal('k', { accuracy: 0.7 });
    expect(slippedSeal([seal('f', {}), b], [seal('f', {}), a])).toEqual({ before: b, after: a });
  });

  it('mehrere: der größte Abfall der Genauigkeit gewinnt', () => {
    const r = slippedSeal(
      [seal('f', { accuracy: 0.95 }), seal('j', { accuracy: 0.95 }), seal('d', { accuracy: 0.95 })],
      [seal('f', { accuracy: 0.78 }), seal('j', { accuracy: 0.6 }), seal('d', { accuracy: 0.7 })],
    );
    expect(r?.before.key).toBe('j');
  });

  it('Tempo-Verlust zählt nicht', () => {
    expect(slippedSeal([seal('f', {})], [seal('f', { avgMs: 5000 })])).toBeNull();
  });
});
