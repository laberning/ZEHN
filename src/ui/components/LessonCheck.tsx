// Zeigt in der Nachbesprechung, woran ein Auftrag noch hängt: Krümels Rat und die Tastensiegel groß,
// mit der Veränderung im Durchgang („Präzision 85 → 89 %“). Dazu, falls eine alte Taste abgerutscht ist, ein Satz von Krümel.

import { lessonAdvice, lessonRuleText, roundAdvice, slippedAdvice } from '../../domain/format.ts';
import type { Seal } from '../../domain/mastery.ts';
import type { LessonStatus } from '../../domain/progress.ts';
import type { RoundReview } from '../../domain/roundReview.ts';
import { KeySeals } from './KeySeals.tsx';
import { KruemelSays } from './KruemelSays.tsx';

interface Props {
  /** Stand nach dem Durchgang; seine Siegel werden gezeigt */
  status: LessonStatus;
  /** Siegel beim Start des Durchgangs */
  before: readonly Seal[];
  /** Rundenhinweis der letzten Runde (Krümel zur Taste mit den meisten Fehlern) */
  review?: RoundReview | null;
  /** früher gelernte Taste, die im Durchgang abgerutscht ist (Krümel sagt es mit Finger) */
  slipped?: { before: Seal; after: Seal } | null;
}

export function LessonCheck({ status, before, review = null, slipped = null }: Props) {
  const roundNote = roundAdvice(review);
  return (
    <div className="lesson-check">
      <KruemelSays size={64}>{lessonAdvice(status)}</KruemelSays>
      {roundNote && <KruemelSays size={64}>{roundNote}</KruemelSays>}
      {slipped && <KruemelSays size={64}>{slippedAdvice(slipped)}</KruemelSays>}
      <KeySeals seals={status.keys} before={before} big />
      <p className="muted rule">{lessonRuleText(status)}</p>
    </div>
  );
}
