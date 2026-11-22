// Einsatz: Die Firewall halten. Ablauf in domain/examRun.ts; hier: Tasten, Takt, Speichern, Zeichnen.

import { useEffect, useReducer, useState } from 'react';
import { trainingButtonLabel } from '../../app/views/exam.ts';
import { examStory } from '../../domain/book.ts';
import { examFailReason, examGoalText } from '../../content/texts/exam.ts';
import { fill } from '../../domain/dialog.ts';
import { findModule, moduleKeys } from '../../domain/course.ts';
import { COUNTDOWN_STEP_MS, TICK_MS, examReducer, examRunStart, examTyping, firewallSegments, tauntFor, timeLeftMs } from '../../domain/examRun.ts';
import { formatResult } from '../../domain/format.ts';
import { examCanUseBackdoor } from '../../domain/progress.ts';
import { useActions, useGame, useProfile, useStoryVars } from '../../ui/app/game.ts';
import { AdaPic, BaronPic } from '../../ui/components/Characters.tsx';
import { LoudspeakerPic } from '../../ui/pixel/Pixel.tsx';
import { KruemelSays } from '../../ui/components/KruemelSays.tsx';
import { TypingPanel } from '../../ui/components/TypingPanel.tsx';
import { BackButton, RewardSummary, Stars } from '../../ui/components/common.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';
import { useOnRise } from '../../ui/hooks/useOnRise.ts';
import { useInterval } from '../../ui/hooks/useTimer.ts';
import { useTypingInput } from '../../ui/hooks/useTypingInput.ts';

export function Exam({ moduleId }: { moduleId: string }) {
  const p = useProfile();
  const vars = useStoryVars();
  const rules = useGame((s) => s.rules);
  const { go, recordExam, takeBackdoor, continueAfterExam, startTraining, sfx, seed } = useActions();
  const module = findModule(rules.course, moduleId);
  const story = examStory(useGame((s) => s.story), moduleId);
  const [learned] = useState(() => new Set(moduleKeys(module)));
  const [s, dispatch] = useReducer(examReducer, undefined, () => examRunStart(module, examTyping(rules.course, moduleId, seed())));

  useInterval(s.phase === 'countdown', COUNTDOWN_STEP_MS, (now) => dispatch({ type: 'countdown', now }));
  useInterval(s.phase === 'run', TICK_MS, (now) => dispatch({ type: 'tick', now }));
  const { capsLock, numpad } = useTypingInput(s.phase === 'run', (ch, now) => dispatch({ type: 'key', ch, now }), s.typing.text.slice(s.typing.position));

  const segments = firewallSegments(s.typing.text, s.typing.position);
  useEffect(() => {
    if (segments.done > 0) sfx('segment');
  }, [segments.done, sfx]);

  // fertig getippt oder Zeit um → auswerten und speichern
  const saving = s.phase === 'saving';
  useOnRise(saving, () => {
    void recordExam(moduleId, s.typing, s.now).then((outcome) => dispatch({ type: 'recorded', outcome }));
  });

  const retry = () => dispatch({ type: 'retry', typing: examTyping(rules.course, moduleId, seed()) });
  const success = () => void continueAfterExam(moduleId);
  const outcome = s.outcome;

  // Enter = Hauptaktion: starten, nach Erfolg weiter, nach Misserfolg nochmal. Esc = zurück (nicht während des Einsatzes)
  useKey('Enter', s.phase === 'ready' ? () => dispatch({ type: 'begin' }) : outcome ? (outcome.evaluation.passed ? success : retry) : null);
  // Nach dem Erfolg führt auch Esc in die Story (wie „geschafft“ in der Mission), sonst ginge der Erfolg verloren
  const passed = !!outcome?.evaluation.passed;
  useKey('Escape', s.phase === 'run' || s.phase === 'countdown' ? null : passed ? success : () => go({ name: 'hq' }));

  const pctTime = timeLeftMs(s) / s.durationMs;
  // Tippphase des Einsatzes (bereit, Countdown, Tippen): Bildschirm in Fensterhöhe, auf quer-niedrigen Fenstern mit Seitenleiste; das Ergebnis ist eine normale Seite
  const typingPhase = s.phase !== 'result';
  const taunt = s.phase === 'run' ? tauntFor(s.errors, story.taunts) : story.ready;

  return (
    <div className={`screen exam-screen${typingPhase ? ' typing-phase with-side' : ''}`}>
      <div className="screen-side">
        {s.phase !== 'run' && s.phase !== 'countdown' && !passed && <BackButton />}
        <div className="exam-top panel">
          <div className="villain">
            {story.voice === 'speaker' ? <LoudspeakerPic size={96} /> : <BaronPic size={96} />}
            <div className="taunt">{taunt}</div>
          </div>
          <div className="exam-info">
            <h1>{story.title}</h1>
            <p className="muted">{examGoalText(module.exam)}</p>
            <div className={`timer ${pctTime < 0.25 ? 'low' : ''}`}>
              <div style={{ width: `${pctTime * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="firewall" aria-label={fill(story.segments, { n: segments.done, gesamt: segments.total })}>
          {Array.from({ length: segments.total }, (_, i) => (
            <span key={i} className={i < segments.done ? 'up' : ''} />
          ))}
        </div>
      </div>

      {s.phase === 'ready' && (
        <div className="center panel">
          <button className="primary big" onClick={() => dispatch({ type: 'begin' })}>
            Einsatz starten ⏎
          </button>
        </div>
      )}
      {s.phase === 'countdown' && (
        <div className="countdown" aria-live="polite">
          {s.count}
        </div>
      )}
      {s.phase === 'run' && <TypingPanel typing={s.typing} learned={learned} frame={story.frame} press={s.press} capsLock={capsLock} numpad={numpad} />}
      {s.phase === 'result' && outcome && (
        <div className="center exam-result panel">
          {outcome.evaluation.passed ? (
            <>
              <h2>{story.won}</h2>
              <Stars n={outcome.reward.stars} />
              <p>
                {formatResult(outcome.result)} · +{outcome.reward.xp} EP
              </p>
              <RewardSummary reward={outcome.reward} />
              <button className="primary big" onClick={success}>
                Weiter ⏎
              </button>
            </>
          ) : (
            <>
              <h2>{story.lost}</h2>
              <KruemelSays size={64}>{story.fail.map((l) => fill(l.text, { ...vars, prozent: Math.round(outcome.evaluation.progress * 100) })).join(' ')}</KruemelSays>
              <p className="muted">{examFailReason(outcome.evaluation, outcome.result.accuracy, module.exam.minAccuracy)}</p>
              <div className="row">
                <button className="primary big" onClick={retry}>
                  Nochmal versuchen ⏎
                </button>
                <button onClick={() => startTraining(moduleId)}>{trainingButtonLabel(p, rules.course, moduleId)}</button>
              </div>
              {examCanUseBackdoor(p, moduleId) && (
                <div className="backdoor">
                  <AdaPic size={56} />
                  <div>
                    {story.backdoorOffer.map((l, i) => (
                      <p key={i}>{fill(l.text, vars)}</p>
                    ))}
                    <button onClick={() => void takeBackdoor(moduleId)}>Hintertür nehmen</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
