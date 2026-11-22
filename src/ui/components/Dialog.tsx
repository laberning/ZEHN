// Story-Dialog im Bilderbuch-Stil: Szene im Hintergrund, Figuren auf der Bühne, Textbox unten.
// Der Ablauf (Warteschlange, Antworten) steckt im Kern (domain/dialog.ts); hier wird gezeichnet.
// Bedienung: Enter = weiter / Auswahl bestätigen, 1–3 oder Pfeiltasten = Antwort wählen.

import { useLayoutEffect, useReducer, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { CHOICE_HINT } from '../../content/texts/funk.ts';
import { speakerName } from '../../content/texts/speakers.ts';
import {
  castAt,
  currentLine,
  dialogReducer,
  dialogStart,
  isLineComplete,
  sceneAt,
  visibleChoices,
  visibleText,
  type Line,
  type LineContext,
  type Speaker,
} from '../../domain/dialog.ts';
import type { Avatar } from '../../domain/profile.ts';
import { useChoiceKeys } from '../hooks/useChoiceKeys.ts';
import { useKey } from '../hooks/useKey.ts';
import { useOnRise } from '../hooks/useOnRise.ts';
import { useInterval } from '../hooks/useTimer.ts';
import { AdaPic, AvatarPic, BaronPic, BennoPic, JunaPic } from './Characters.tsx';
import { Keyboard } from './Keyboard.tsx';
import { KruemelPic } from '../pixel/Pixel.tsx';
import { Scene } from './Scene.tsx';
import { currentPixelScale } from '../hooks/usePixelScale.ts';
import { sceneLift } from '../pixel/stage.ts';

/** Schreibmaschinen-Effekt: so viele Zeichen pro Schritt */
export const CHARS_PER_TICK = 2;
export const TICK_MS = 18;

function Actor({ who, avatar }: { who: Speaker; avatar: Avatar }) {
  switch (who) {
    case 'ada':
      return <AdaPic scaled full />;
    case 'baron':
      return <BaronPic scaled full />;
    case 'benno':
      return <BennoPic scaled full />;
    case 'juna':
      return <JunaPic scaled full />;
    case 'kruemel':
      return <KruemelPic scaled />;
    case 'player':
      return <AvatarPic avatar={avatar} scaled full />;
    default:
      return null;
  }
}

/**
 * Die Figuren stehen auf der Textbox, der Hintergrund hängt am unteren Bildschirmrand.
 * Damit sie nicht in der Luft schweben, wird der Hintergrund so weit angehoben,
 * dass seine Fußlinie (FEET_Y in stage.ts) genau an der Oberkante der Textbox liegt.
 * Auch der Maßstab `--px` gilt je Bühne: Er hängt von der Höhe der Box ab (pixelScale, stage.ts) und wird am `.vn` gesetzt.
 * Die Box hat eine feste Höhe (dialog.css, `--dialog-h`): Sie ändert sich weder mit dem Text noch mit den
 * Antworten, gemessen wird also nur beim Erscheinen und wenn sich das Fenster ändert – die Szene steht still.
 */
function useStageMetrics(box: RefObject<HTMLElement | null>): { lift: number; px: number } {
  const [m, setM] = useState({ lift: 0, px: currentPixelScale() });
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const px = currentPixelScale(rect.height);
      const lift = sceneLift(px, window.innerHeight - rect.top);
      setM((old) => (old.px === px && old.lift === lift ? old : { px, lift }));
    };
    measure();
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    ro?.observe(el);
    window.addEventListener('resize', measure);
    // Die Box gleitet beim Erscheinen herein (CSS rise): danach noch einmal messen
    el.addEventListener('animationend', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
      el.removeEventListener('animationend', measure);
    };
  }, [box]);
  return m;
}

interface Props {
  lines: readonly Line[];
  vars: Record<string, string | number>;
  avatar: Avatar;
  /** Wird einmal am Ende aufgerufen */
  onDone: () => void;
  /** Gadgets im Koffer (Antworten mit `needs`) und frühere Antworten (Zeilen mit `ifPicked`) */
  context?: LineContext;
}

export function Dialog({ lines, vars, avatar, onDone, context }: Props) {
  const [s, dispatch] = useReducer(dialogReducer, undefined, () => dialogStart(lines, vars, context));
  const line = currentLine(s);
  const complete = isLineComplete(s);
  const choices = visibleChoices(s);

  useInterval(!complete && !s.done, TICK_MS, () => dispatch({ type: 'reveal', chars: CHARS_PER_TICK }));
  // Erscheinen Antworten, gilt die Sperrzeit neu – ein schnelles Doppel-Enter wählt sonst eine ungesehene Antwort
  useKey('Enter', s.done ? null : () => dispatch({ type: 'advance' }), choices ? `choices:${s.index}` : undefined);
  useChoiceKeys(
    choices ? s.index : null,
    choices?.length ?? 0,
    (index) => dispatch({ type: 'choose', index }),
    (delta) => dispatch({ type: 'pick', delta }),
  );

  useOnRise(s.done, onDone);
  const box = useRef<HTMLDivElement>(null);
  const { lift, px } = useStageMetrics(box);

  if (!line || s.done) return null;
  const speaker = line.speaker;
  const name = speakerName(speaker, vars);

  return (
    <div className="vn" role="dialog" aria-label="Geschichte" style={{ '--lift': `${lift}px`, '--px': `${px}px` } as CSSProperties}>
      <Scene name={sceneAt(s, 'keller')} />
      <div className="stage">
        <div className="cast left">
          {castAt(s).map((c) => (
            <div key={c} className={`actor actor-${c} ${speaker === c ? 'active' : 'dim'}`}>
              <Actor who={c} avatar={avatar} />
            </div>
          ))}
        </div>
        <div className="cast right">
          <div className={`actor actor-player ${speaker === 'player' || choices ? 'active' : 'dim'}`}>
            <Actor who="player" avatar={avatar} />
          </div>
        </div>
      </div>

      <div ref={box} className={`dialog-box speaker-${speaker}`} onClick={() => !choices && dispatch({ type: 'advance' })}>
        {/* über der Textbox, ohne die Figuren hochzuschieben */}
        {line.keys && complete && (
          <div className="dialog-keys" onClick={(e) => e.stopPropagation()}>
            <Keyboard highlightCodes={line.keys} small />
          </div>
        )}
        {name && <div className="who">{name}</div>}
        <p className={speaker === 'erzaehler' ? 'narration' : ''}>{visibleText(s)}</p>
        {choices ? (
          <div className="choices">
            {choices.map((c, n) => (
              <button
                key={c.id}
                className={`choice ${n === s.pick ? 'picked' : ''}`}
                onMouseEnter={() => dispatch({ type: 'pick', delta: n - s.pick })}
                onClick={(e) => (e.stopPropagation(), dispatch({ type: 'choose', index: n }))}
              >
                <span className="num">{n + 1}</span> {c.label}
              </button>
            ))}
            <p className="choice-hint">{CHOICE_HINT}</p>
          </div>
        ) : (
          <div className="dialog-foot">
            <button className="primary" onClick={(e) => (e.stopPropagation(), dispatch({ type: 'advance' }))}>
              Weiter ⏎
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
