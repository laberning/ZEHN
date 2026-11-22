// Gemeinsamer Rahmen für die Spielhalle: Start, Ergebnis, Bestwert, Tasten. Speichert das Ergebnis einmal.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { arcadeGame, medalLabel, goalText, roundDoneText } from '../../content/arcadeGames.ts';
import { medalFor, nextGoal, startLevels, type Medal } from '../../domain/arcade/levels.ts';
import type { ArcadeGame } from '../../domain/profile.ts';
import { arcadeBest, arcadeBestLevel, arcadeMedal } from '../../domain/progress.ts';
import type { Reward } from '../../domain/record.ts';
import { useActions, useGame, useProfile } from '../../ui/app/game.ts';
import type { KeyPress } from '../../domain/typing.ts';
import { Keyboard } from '../../ui/components/Keyboard.tsx';
import { KruemelPic } from '../../ui/pixel/Pixel.tsx';
import { BackButton, RewardSummary } from '../../ui/components/common.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';
import { useLatest } from '../../ui/hooks/useLatest.ts';
import { useOnRise } from '../../ui/hooks/useOnRise.ts';

export type ArcadePhase = 'ready' | 'play' | 'over';

interface Props {
  game: ArcadeGame;
  phase: ArcadePhase;
  /** startLevel: gewähltes Startlevel (1 ohne Wahl) */
  onStart: (startLevel: number) => void;
  /** Ergebnis, sobald phase === 'over'; level: zuletzt geschafftes Level (0: keins) */
  result: { score: number; count: number; level: number; label: string } | null;
  /** Kurzer Jubel über dem Spielfeld (z. B. „Welle 2 geschafft!“), solange er gelten soll */
  cheer?: string | null;
  /** Zusätzlicher Satz unter der Spielerklärung */
  extraIntro?: ReactNode;
  hud?: ReactNode;
  /** Bildschirmtastatur unter dem Spielfeld: sichere Tasten, nächstes Zeichen, letzter Anschlag */
  keys: { learned: ReadonlySet<string>; next: string | undefined; press: KeyPress | null };
  children: ReactNode;
}

/** Medaille als Sterne und Wort */
function MedalTag({ medal }: { medal: Medal | null }) {
  if (!medal) return <span className="medal none">noch keine Medaille</span>;
  return <span className={`medal ${medal}`}>{medalLabel(medal)}</span>;
}

export function ArcadeFrame({ game, phase, onStart, result, cheer, extraIntro, hud, keys, children }: Props) {
  const info = arcadeGame(game);
  const medals = useGame((s) => s.rules.arcade[game]);
  const p = useProfile();
  const { go, recordArcade } = useActions();
  const [reward, setReward] = useState<Reward | null>(null);
  // Nummer der Runde: Ein Ergebnis, das erst nach einem Neustart fertig gespeichert ist, gehört nicht mehr zur Anzeige
  const runNo = useRef(0);
  // Startlevel: 1 bis zum höchsten schon geschafften
  const levels = startLevels(arcadeBestLevel(p, game));
  const [chosen, setChosen] = useState(1);
  const startLevel = Math.min(chosen, levels.length);
  const pick = useLatest((delta: number) => setChosen(Math.min(levels.length, Math.max(1, startLevel + delta))));
  useEffect(() => {
    if (phase !== 'ready' || levels.length < 2) return;
    const on = (e: KeyboardEvent) => {
      const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!delta) return;
      e.preventDefault();
      pick.current(delta);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [phase, levels.length, pick]);

  // Ergebnis einmal je Spielende speichern
  const over = phase === 'over';
  useOnRise(over && !!result, () => {
    const no = runNo.current;
    void recordArcade(game, result!.score, result!.count, result!.level).then((r) => no === runNo.current && setReward(r));
  });

  const start = () => {
    runNo.current++;
    setReward(null);
    onStart(startLevel);
  };
  useKey('Enter', phase === 'play' ? null : start);
  useKey('Escape', () => go({ name: 'hq' }));

  return (
    <div className={`screen arcade arcade-${game}`}>
      <div className="arcade-top">
        <BackButton />
        <h1>{info.title}</h1>
        <div className="arcade-best">
          Bestwert <b>{arcadeBest(p, game)}</b> <MedalTag medal={arcadeMedal(p, game)} />
        </div>
      </div>
      {hud && <div className="arcade-hud panel">{hud}</div>}
      <div className="arcade-stage">
        {children}
        {phase === 'play' && cheer && (
          <div className="arcade-cheer" role="status" key={cheer}>
            {cheer}
          </div>
        )}
        {phase === 'ready' && (
          <div className="arcade-overlay panel">
            <KruemelPic size={96} />
            <h2>{info.title}</h2>
            <div className="arcade-intro">
              <p>{info.intro}</p>
              <p className="muted">
                {extraIntro} {info.rules}
              </p>
            </div>
            {levels.length > 1 && (
              <div className="level-pick" role="group" aria-label="Startlevel">
                <button onClick={() => pick.current(-1)} disabled={startLevel <= 1} aria-label={`Weniger: ${info.levelWord} früher`}>
                  ◀
                </button>
                <span>
                  Start bei {info.levelWord} <b>{startLevel}</b>
                </span>
                <button onClick={() => pick.current(1)} disabled={startLevel >= levels.length} aria-label={`Mehr: ${info.levelWord} später`}>
                  ▶
                </button>
              </div>
            )}
            <button className="primary big" onClick={start}>
              Los geht's ⏎
            </button>
          </div>
        )}
        {over && result && (
          <div className="arcade-overlay panel">
            <h2>{roundDoneText(game, result.level)}</h2>
            <MedalTag medal={medalFor(result.level, medals)} />
            <p className="big-num">{result.score} Punkte</p>
            <p>{result.label}</p>
            <p className="muted">{goalText(game, nextGoal(result.level, medals))}</p>
            {reward?.newRecord && <p className="rankup">Neuer Bestwert!</p>}
            {reward && (
              <>
                <p className="muted">+{reward.xp} EP</p>
                {/* den Rekord zeigt die Spielhalle oben als „Neuer Bestwert!“ */}
                <RewardSummary reward={{ ...reward, newRecord: false }} />
              </>
            )}
            <div className="row">
              <button className="primary big" onClick={start}>
                Nochmal ⏎
              </button>
              <BackButton />
            </div>
          </div>
        )}
      </div>
      <div className="arcade-keys">
        <Keyboard learned={keys.learned} target={phase === 'play' ? keys.next : undefined} press={keys.press} small />
      </div>
    </div>
  );
}
