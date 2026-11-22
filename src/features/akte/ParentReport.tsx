// Bericht für Eltern: der Lernstand in einfachen Sätzen, ohne Spielbegriffe. Nur lesen, nichts einstellen.

import { parentTexts } from '../../content/texts/akte.ts';
import type { AkteView } from '../../app/views/akte.ts';
import { TempoChart } from '../../ui/components/TempoChart.tsx';

export function ParentReport({ view }: { view: AkteView }) {
  const t = parentTexts({ ...view.parent, apm: view.avgApm, shaky: view.shakyKeys });
  return (
    <div className="parent-report">
      <p className="muted">Der Stand Ihres Kindes in einfachen Worten. Hier gibt es nichts einzustellen.</p>
      <section>
        <h2>Lernstand</h2>
        <p>{t.progress}</p>
        <p>{t.keys}</p>
      </section>
      <section>
        <h2>Dranbleiben</h2>
        <p>{t.practice}</p>
      </section>
      <section>
        <h2>Genauigkeit und Tempo</h2>
        <p>{t.quality}</p>
        <TempoChart values={view.tempo} />
      </section>
      <section>
        <h2>Worauf achten</h2>
        <p>{t.attention}</p>
      </section>
    </div>
  );
}
