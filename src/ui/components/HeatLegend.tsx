// Legende der Wärmekarte: Farbverlauf mit Prozentmarken, dazu „misst noch“ und „noch nicht gelernt“.

import { HEAT_TEXTS } from '../../content/texts/akte.ts';
import { percent } from '../../domain/format.ts';
import type { HeatScale } from '../../domain/mastery.ts';
import { heatColor } from './heat.ts';

const STOPS = [0, 0.25, 0.5, 0.75, 1];

export function HeatLegend({ scale }: { scale: HeatScale }) {
  const gradient = `linear-gradient(90deg, ${[...STOPS, scale.midAt]
    .sort((a, b) => a - b)
    .map((v) => `${heatColor(v)} ${Math.round(v * 100)}%`)
    .join(', ')})`;
  return (
    <div className="heat-legend">
      <div className="heat-bar" style={{ background: gradient }} />
      <div className="heat-marks">
        <span style={{ left: 0 }}>{percent(scale.low)}</span>
        <span style={{ left: `${scale.midAt * 100}%`, transform: 'translateX(-50%)' }}>{percent(scale.mid)}</span>
        <span style={{ right: 0 }}>{percent(scale.high)}</span>
      </div>
      <div className="heat-notes">
        <span>
          <i className="heat-swatch measuring" /> {HEAT_TEXTS.measuring}
        </span>
        <span>
          <i className="heat-swatch" /> {HEAT_TEXTS.unlearned}
        </span>
      </div>
    </div>
  );
}
