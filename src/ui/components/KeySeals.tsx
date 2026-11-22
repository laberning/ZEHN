// Tastensiegel: je Taste drei Riegel – Übung (Anschläge), Genauigkeit, Tempo – jeweils mit Wort, Fortschritt und Ziel.
// Klein beim Tippen, groß in der Nachbesprechung (dort mit der Veränderung im Durchgang).

import { MEASURING_TEXT } from '../../content/texts/akte.ts';
import { formatSeconds, hitsText, keyLabel, keyName, percent } from '../../domain/format.ts';
import type { Latch, Seal } from '../../domain/mastery.ts';
import { useState } from 'react';

interface LatchProps {
  /** kurzes Wort vor der Reihe */
  label: string;
  /** Erklärung beim Darüberfahren */
  hint: string;
  latch: Latch;
  /** Text neben dem Riegel; ersetzt die Anzeige, wenn noch gemessen wird */
  text: string;
  measuring?: boolean;
  /** Anzahl der Teilstriche der Anzeige */
  steps?: number;
}

function LatchRow({ label, hint, latch, text, measuring, steps = 5 }: LatchProps) {
  // Leuchtet nur auf, wenn der Riegel während des Tippens aufgeht – nicht schon beim Anzeigen
  const [openAtMount] = useState(latch.open);
  // Offen: Haken; misst noch: leere Punkte (es gibt noch keinen Wert); sonst so viele Punkte wie Fortschritt
  const filled = measuring ? 0 : Math.round(latch.value * steps);
  return (
    <div className={`latch ${latch.open ? 'open' : ''} ${latch.open && !openAtMount ? 'flash' : ''}`} title={hint}>
      <span className="latch-label">{label}</span>
      <span className="latch-dots" aria-hidden="true">
        {latch.open ? '✓' : Array.from({ length: steps }, (_, i) => (i < filled ? '●' : '○')).join('')}
      </span>
      <span className="latch-text">{measuring ? `${MEASURING_TEXT} …` : text}</span>
      <span className="sr-only">{latch.open ? `${label}: Ziel erreicht` : `${label}: Ziel noch nicht erreicht`}</span>
    </div>
  );
}

function KeySeal({ seal, big, before }: { seal: Seal; big?: boolean; before?: Seal }) {
  return (
    <div className={`seal ${big ? 'big' : ''} ${seal.secured ? 'secured' : ''}`} data-key={seal.key}>
      <div className="seal-key">
        <b>{keyLabel(seal.key)}</b>
        {seal.secured && <span className="seal-ok">✓ gesichert</span>}
      </div>
      {!seal.secured && (
        <>
          <LatchRow
            label="Übung"
            hint={`So oft hast du ${keyName(seal.key)} schon getippt. Ziel: ${seal.goal.minSamples} Anschläge.`}
            latch={seal.training}
            text={`${Math.min(seal.samples, seal.goal.minSamples)}/${seal.goal.minSamples}`}
          />
          <LatchRow
            label="Genau"
            hint={`So oft triffst du ${keyName(seal.key)} richtig. Ziel: mindestens ${percent(seal.goal.minAccuracy)}. Ein einzelner Fehler schließt einen offenen Riegel nicht wieder.`}
            latch={seal.precision}
            measuring={seal.measuring}
            text={`${big && before && !before.measuring ? `${percent(before.accuracy)} → ${percent(seal.accuracy)}` : percent(seal.accuracy)}${seal.hitsToOpen ? ` · ${hitsText(seal.hitsToOpen)}` : ''}`}
          />
          <LatchRow
            label="Tempo"
            hint={`So schnell findest du ${keyName(seal.key)}. Ziel: höchstens ${formatSeconds(seal.goal.maxAvgMs)} je Anschlag.`}
            latch={seal.tempo}
            measuring={seal.measuring}
            steps={4}
            text={big && before && !before.measuring ? `${formatSeconds(before.avgMs)} → ${formatSeconds(seal.avgMs)}` : formatSeconds(seal.avgMs)}
          />
        </>
      )}
    </div>
  );
}

export function KeySeals({ seals, big, before }: { seals: readonly Seal[]; big?: boolean; before?: readonly Seal[] }) {
  return (
    <div className="seals-wrap">
      <div className={`seals ${big ? 'big' : ''}`}>
        {seals.map((s) => (
          <KeySeal key={s.key} seal={s} big={big} before={before?.find((b) => b.key === s.key)} />
        ))}
      </div>
      <p className="seals-legend">Hat eine Taste bei Übung, Genau und Tempo ein ✓, ist sie gesichert.</p>
    </div>
  );
}
