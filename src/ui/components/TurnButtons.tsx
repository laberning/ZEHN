// Zwei Knöpfe zum Drehen der Figur (Garderobe, Rekrutierung). Die Pfeiltasten gehören den Reitern.

import { turn, type Facing } from '../lpc/compose.ts';

export function TurnButtons({ facing, onChange }: { facing: Facing; onChange: (f: Facing) => void }) {
  return (
    <div className="turn-buttons">
      <button aria-label="Figur nach links drehen" title="Nach links drehen" onClick={() => onChange(turn(facing, -1))}>
        ◀
      </button>
      <button aria-label="Figur nach rechts drehen" title="Nach rechts drehen" onClick={() => onChange(turn(facing, 1))}>
        ▶
      </button>
    </div>
  );
}
