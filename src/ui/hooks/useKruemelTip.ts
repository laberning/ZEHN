// Krümels Tipp – im HQ und in der Mission nach demselben Verfahren: die Liste nach den Lerneinheiten des Moduls
// (tipsFor; in der Mission das Modul des gespielten Auftrags, im HQ das des Auftrags, der dran ist – steht der Einsatz an
// oder ist der Kurs durch, das des zuletzt geschafften), darin der Reihe nach, je Übung der nächste (kruemelTip in domain/format.ts).
// Ohne Zufall: Tests sind stabil, und der Zufall der Runden bleibt unberührt.

import { tipsFor } from '../../content/texts/mission.ts';
import { findLesson, lessonOrder, moduleKeys } from '../../domain/course.ts';
import { kruemelTip } from '../../domain/format.ts';
import { learnKeys } from '../../domain/keyboard.ts';
import { activeLessonId } from '../../domain/progress.ts';
import { useGame } from '../app/game.ts';

export function useKruemelTip(lessonId?: string): string {
  const exercises = useGame((s) => s.current?.history.length ?? 0);
  const course = useGame((s) => s.rules.course);
  const shown = useGame((s) => {
    const p = s.current;
    if (lessonId || !p) return lessonId;
    return activeLessonId(p, course) ?? lessonOrder(course).findLast((id) => p.lessons[id]?.mastered) ?? lessonOrder(course)[0];
  });
  const units = shown ? learnKeys(moduleKeys(findLesson(course, shown).module)) : [];
  return kruemelTip(tipsFor(units), exercises);
}
