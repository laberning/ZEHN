import { describe, expect, it } from 'vitest';
import { examFailReason, examGoalText } from './exam.ts';

describe('Oberflächentexte: Einsatz', () => {
  it('Einsatz: Ziel und Grund des Scheiterns', () => {
    expect(examGoalText({ durationSec: 60, minAccuracy: 0.9 })).toBe('Ziel: alles in 60 Sekunden, mindestens 90 % genau.');
    expect(examFailReason({ inTime: false, accuracyOk: true }, 0.95, 0.9)).toBe('Die Zeit war zu knapp. ');
    expect(examFailReason({ inTime: true, accuracyOk: false }, 0.85, 0.9)).toBe('Genauigkeit 85 % – nötig sind 90 %.');
    expect(examFailReason({ inTime: false, accuracyOk: false }, 0.85, 0.9)).toBe('Die Zeit war zu knapp. Genauigkeit 85 % – nötig sind 90 %.');
  });
});
