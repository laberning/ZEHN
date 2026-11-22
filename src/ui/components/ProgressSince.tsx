// Nachbesprechung von Bennos Tippstunde: Tempo und Genauigkeit der Runde neben dem eigenen Stand aus Akt 1.
// Zwei Zeilen, keine Wertung im Text, kein Vergleich mit anderen.

import type { TrainingDebrief } from '../../app/views/training.ts';
import { formatResult } from '../../domain/format.ts';

export function ProgressSince({ debrief }: { debrief: TrainingDebrief }) {
  return (
    <ul className="progress-since">
      <li>Heute: {formatResult(debrief.now)}</li>
      {debrief.then && (
        <li>
          {debrief.then.label}: {formatResult(debrief.then)}
        </li>
      )}
    </ul>
  );
}
