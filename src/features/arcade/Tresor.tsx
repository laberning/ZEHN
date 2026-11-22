// Tresorknacker – Mechanik in domain/arcade/tresor.ts, hier nur Takt, Tasten, Töne und Zeichnen.

import type { Sfx } from '../../app/ports.ts';
import { CODES_PER_VAULT, TRESOR_SECONDS, TRESOR_TICK_MS, tresorNextChar, tresorReached, tresorStart, tresorTick, tresorTimeLeft, tresorType, type TresorEvent } from '../../domain/arcade/tresor.ts';
import { arcadeGame } from '../../content/arcadeGames.ts';
import { CapsLockHint } from '../../ui/components/TypingPanel.tsx';
import { useInterval } from '../../ui/hooks/useTimer.ts';
import { useTypingInput } from '../../ui/hooks/useTypingInput.ts';
import { ArcadeFrame } from './ArcadeFrame.tsx';
import { useArcadeRun } from './useArcadeRun.ts';

/** Lage der acht Rastmarken um das Drehrad (Raster-Offsets von der Mitte) */
const NOTCHES = [
  [0, -10],
  [7, -7],
  [10, 0],
  [7, 7],
  [0, 10],
  [-7, 7],
  [-10, 0],
  [-7, -7],
] as const;

/**
 * Der Tresor als Pixelgrafik (46×46 Raster, 5 Bildschirmpixel je Feld): Kontur, drei Töne, Licht von oben links.
 * Das Rad springt in acht Rasten weiter, statt sich stufenlos zu drehen – so bleiben die Pixel gerade.
 */
function Vault({ open, step, lamps }: { open: boolean; step: number; lamps: number }) {
  const K = '#12151f';
  const lit = step % NOTCHES.length;
  return (
    <svg className={`vault ${open ? 'open' : ''}`} viewBox="0 0 46 46" width={230} height={230} shapeRendering="crispEdges" aria-hidden="true">
      <rect width="46" height="46" fill={K} />
      <rect x="1" y="1" width="44" height="44" fill="#59627a" />
      <rect x="1" y="1" width="44" height="2" fill="#8a94ad" />
      <rect x="1" y="1" width="2" height="44" fill="#8a94ad" />
      <rect x="1" y="43" width="44" height="2" fill="#2a3044" />
      <rect x="43" y="1" width="2" height="44" fill="#2a3044" />
      <rect x="5" y="5" width="36" height="36" fill={K} />
      <rect x="6" y="6" width="34" height="34" fill={open ? '#ffd84d' : '#3b4257'} />
      <rect x="6" y="6" width="34" height="1" fill={open ? '#fff3c4' : '#59627a'} />
      <rect x="6" y="6" width="1" height="34" fill={open ? '#fff3c4' : '#59627a'} />
      <rect x="6" y="39" width="34" height="1" fill={open ? '#d9a82a' : '#232838'} />
      <rect x="39" y="6" width="1" height="34" fill={open ? '#d9a82a' : '#232838'} />
      {[
        [8, 8],
        [36, 8],
        [8, 36],
        [36, 36],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={2} height={2} fill="#8a94ad" />
      ))}
      {NOTCHES.map(([dx, dy], i) => (
        <rect key={i} x={21 + dx} y={17 + dy} width={3} height={3} fill={i === lit ? '#ff5a6a' : '#232838'} />
      ))}
      <rect x="15" y="11" width="15" height="15" fill={K} />
      <rect x="16" y="12" width="13" height="13" fill="#9aa4bd" />
      <rect x="16" y="12" width="13" height="2" fill="#c3cbe0" />
      <rect x="16" y="23" width="13" height="2" fill="#4b546c" />
      <rect x="21" y="17" width="3" height="3" fill={K} />
      {Array.from({ length: CODES_PER_VAULT }, (_, i) => {
        const x = 23 - (CODES_PER_VAULT * 6 - 2) / 2 + i * 6;
        return (
          <g key={i}>
            <rect x={x - 1} y={32} width={6} height={6} fill={K} />
            <rect className={i < lamps ? 'lamp on' : 'lamp'} x={x} y={33} width={4} height={4} fill={i < lamps ? '#4dff9a' : '#2a1820'} />
          </g>
        );
      })}
    </svg>
  );
}

const SOUND: Record<TresorEvent, Sfx> = { key: 'key', miss: 'error', cracked: 'segment', vault: 'badge' };

export function Tresor() {
  const { learned, state: s, setState: setS, phase, start } = useArcadeRun(tresorStart, SOUND);

  useInterval(phase === 'play', TRESOR_TICK_MS, (t) => setS((x) => tresorTick(x, t)));
  const { capsLock } = useTypingInput(phase === 'play', (ch, t) => setS((x) => tresorType(x, ch, t)));

  const left = phase === 'play' ? tresorTimeLeft(s) : TRESOR_SECONDS;
  return (
    <ArcadeFrame
      game="tresor"
      phase={phase}
      onStart={start}
      result={phase === 'over' ? { score: s.score, count: s.cracked, level: tresorReached(s), label: `${s.cracked} Codes geknackt, ${s.vault} Tresore offen` } : null}
      cheer={s.openUntil > s.now ? arcadeGame('tresor').cheer(s.vault) : null}
      keys={{ learned, next: tresorNextChar(s), press: s.press }}
      hud={
        <>
          <span>
            Punkte <b>{s.score}</b>
          </span>
          <span>
            Tresor <b>{s.vault + 1}</b>
          </span>
          <span>
            Zeit <b>{Math.ceil(left)}</b> s
          </span>
          {capsLock && <CapsLockHint />}
        </>
      }
    >
      <div className="tresor-arena">
        <Vault open={s.openUntil > s.now} step={s.cracked * 5 + s.typed} lamps={s.lamps} />
        {phase === 'play' && (
          <div className={`code ${s.shakeUntil > s.now ? 'shake' : ''}`} data-code={s.code}>
            {Array.from(s.code, (ch, i) => (
              <span key={i} className={i < s.typed ? 'ok' : i === s.typed ? 'next' : ''}>
                {ch}
              </span>
            ))}
          </div>
        )}
        <div className="timer">
          <div style={{ width: `${(left / TRESOR_SECONDS) * 100}%` }} />
        </div>
      </div>
    </ArcadeFrame>
  );
}
