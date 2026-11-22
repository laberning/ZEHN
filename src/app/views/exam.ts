// Ansicht des Einsatzes: Beschriftung des Knopfs „Spezialtraining (K Ö S)“ aus den Tasten, die das Training wählt.

import type { Course } from '../../domain/course.ts';
import { keyList } from '../../domain/format.ts';
import type { Profile } from '../../domain/profile.ts';
import { examTraining } from '../../domain/progress.ts';

export function trainingButtonLabel(p: Pick<Profile, 'stats'>, course: Course, moduleId: string): string {
  const { keys } = examTraining(p, course, moduleId);
  return keys.length ? `Spezialtraining (${keyList(keys)})` : 'Spezialtraining';
}
