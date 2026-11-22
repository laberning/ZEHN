// Einsatz: Status, Ziel und Grund des Scheiterns.

import type { ExamCriteria, ExamEvaluation, ExamState } from '../../domain/exam.ts';
import { percent } from '../../domain/format.ts';

/** Zustand eines Einsatzes auf der Missionskarte */
export function examStatusLabel(outcome: ExamState['outcome'] | undefined, unlocked: boolean): string {
  if (outcome === 'passed') return 'Bestanden';
  if (outcome === 'backdoor') return 'Unsicher – geht jederzeit nochmal';
  return unlocked ? 'Bereit!' : 'Erst alle Aufträge schaffen';
}

/** Ziel über dem Einsatz, z. B. „Ziel: alles in 60 Sekunden, mindestens 90 % genau.“ */
export function examGoalText(c: Pick<ExamCriteria, 'durationSec' | 'minAccuracy'>): string {
  return `Ziel: alles in ${c.durationSec} Sekunden, mindestens ${percent(c.minAccuracy)} genau.`;
}

/** Warum ein Einsatz gescheitert ist: Zeit, Genauigkeit oder beides */
export function examFailReason(e: Pick<ExamEvaluation, 'inTime' | 'accuracyOk'>, accuracy: number, minAccuracy: number): string {
  return (e.inTime ? '' : 'Die Zeit war zu knapp. ') + (e.accuracyOk ? '' : `Genauigkeit ${percent(accuracy)} – nötig sind ${percent(minAccuracy)}.`);
}
