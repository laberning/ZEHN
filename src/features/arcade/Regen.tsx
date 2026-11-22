// Buchstabenregen – Mechanik in domain/arcade/regen.ts, hier nur Takt, Tasten, Töne und Zeichnen.

import { useState } from 'react';
import type { Sfx } from '../../app/ports.ts';
import { allWords } from '../../domain/course.ts';
import { keyList } from '../../domain/format.ts';
import { REGEN_LIVES, regenMultiplier, regenNextChar, regenReached, regenStart, waveBonus, regenTick, regenType, type RegenEvent } from '../../domain/arcade/regen.ts';
import { arcadeGame } from '../../content/arcadeGames.ts';
import { useGame } from '../../ui/app/game.ts';
import { KruemelPic } from '../../ui/pixel/Pixel.tsx';
import { CapsLockHint } from '../../ui/components/TypingPanel.tsx';
import { useAnimationFrame } from '../../ui/hooks/useTimer.ts';
import { useTypingInput } from '../../ui/hooks/useTypingInput.ts';
import { ArcadeFrame } from './ArcadeFrame.tsx';
import { useArcadeRun } from './useArcadeRun.ts';

const SOUND: Record<RegenEvent, Sfx> = { hit: 'segment', key: 'key', miss: 'error', landed: 'fail', wave: 'badge' };

export function Regen() {
  const course = useGame((s) => s.rules.course);
  // Wortschatz des ganzen Kurses; regenItem nimmt nur Wörter aus sicheren Tasten
  const [words] = useState(() => allWords(course));
  const { keys, learned, state: s, setState: setS, phase, start } = useArcadeRun((k, seed, now, level) => regenStart(k, words, seed, now, level), SOUND);

  useAnimationFrame(phase === 'play', (t) => setS((x) => regenTick(x, t)));
  const { capsLock } = useTypingInput(phase === 'play', (ch, t) => setS((x) => regenType(x, ch, t)));

  const t = s.lastTick;
  const multiplier = regenMultiplier(s);
  return (
    <ArcadeFrame
      game="regen"
      phase={phase}
      onStart={start}
      result={phase === 'over' ? { score: s.score, count: s.hits, level: regenReached(s), label: `${s.hits} Treffer` } : null}
      cheer={s.pauseUntil > t ? `${arcadeGame('regen').cheer(s.level - 1)} +${waveBonus(s.level - 1)}` : null}
      keys={{ learned, next: regenNextChar(s), press: s.press }}
      extraIntro={
        <>
          Gespielt wird mit deinen sicheren Tasten: <b>{keyList(keys)}</b>.
        </>
      }
      hud={
        <>
          <span>
            Punkte <b>{s.score}</b>
          </span>
          <span>
            Serie <b>{s.combo}</b> {multiplier > 1 && <em>×{multiplier}</em>}
          </span>
          <span>
            Welle <b>{s.level}</b>
          </span>
          <span className="lives" aria-label={`${s.lives} Leben`}>
            {'●'.repeat(Math.max(0, s.lives)) + '○'.repeat(REGEN_LIVES - Math.max(0, s.lives))}
          </span>
          {capsLock && <CapsLockHint />}
        </>
      }
    >
      <div className={`regen-arena ${s.missUntil > t ? 'miss' : ''}`}>
        {s.drops.map((d) => (
          <div key={d.id} className={`drop ${d.id === s.target ? 'target' : ''}`} style={{ left: `${d.x * 100}%`, top: `${d.y * 100}%` }}>
            <span className="done">{d.text.slice(0, d.typed)}</span>
            {d.text.slice(d.typed)}
          </div>
        ))}
        {s.laser && s.laser.until > t && (
          <svg className="laser" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="50" y1="100" x2={s.laser.x * 100} y2={s.laser.y * 100} />
          </svg>
        )}
        <div className="grundnetz" />
        <div className="regen-kruemel">
          <KruemelPic size={70} />
        </div>
      </div>
    </ArcadeFrame>
  );
}
