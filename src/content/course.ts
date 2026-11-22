// Der Lehrplan von ZEHN. Die Module liegen im Bündel ihres Akts (story/aktN/index.ts) und kommen über ACTS; hier stehen
// der Rundenplan und die Begrüßungsfrist.

import type { Course } from '../domain/course.ts';
import { ACTS } from './story/acts.ts';

/** Nach so vielen Tagen Pause begrüßt das HQ den Spieler (eine Woche: nach einem Wochenende wäre es zu oft) */
export const WELCOME_AFTER_DAYS = 7;

export const COURSE: Course = {
  modules: ACTS.map((a) => a.module),
  practice: {
    exercisesPerLesson: 2,
    exerciseSec: 60,
    warmupSec: 20,
    warmupAfterKeys: 2,
    trainingSec: 60,
    weakShare: 0.3,
    trainingWeakShare: 0.5,
    minTextLength: 20,
    maxTextLength: 400,
  },
};
