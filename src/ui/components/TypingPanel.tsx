// Tippansicht (rein darstellend): Übungstext auf dem Monitor, Hinweis auf Taste und Finger, Bildschirmtastatur.
// Die Eingabe verarbeitet das Feature (useTypingInput + Reducer); hier wird nur gezeichnet und der Tastenton gespielt.

import { NUMPAD_HINT } from '../../content/texts/mission.ts';
import { describeKey, percent } from '../../domain/format.ts';
import type { Seal } from '../../domain/mastery.ts';
import { expectedChar, liveAccuracy, type KeyPress, type TypingState } from '../../domain/typing.ts';
import { usePressSound } from '../hooks/usePressSound.ts';
import { useTextScroll } from '../hooks/useTextScroll.ts';
import { Keyboard } from './Keyboard.tsx';

interface Props {
  typing: TypingState;
  learned: ReadonlySet<string>;
  /** Überschrift, z. B. "Kalibrierung 1/2" */
  frame?: string;
  press: KeyPress | null;
  layoutHint?: boolean;
  /** Feststelltaste ist an (Buchstaben werden dann nicht gezählt) */
  capsLock?: boolean;
  /** Eine Ziffer kam vom Ziffernblock (zählt nicht) */
  numpad?: boolean;
  showKeyboard?: boolean;
  /** Gut sichtbare Zeile an der Stelle der Tastatur (z. B. „Die Tastatur verschwindet ab der nächsten Runde.“) */
  notice?: string;
  /** Siegel neuer Tasten für die Ringe auf der Tastatur */
  rings?: readonly Seal[];
}

export function TypingPanel({ typing, learned, frame, press, layoutHint, capsLock, numpad, showKeyboard = true, notice, rings }: Props) {
  usePressSound(press);
  const scroll = useTextScroll(typing.text, typing.position);

  const accuracy = liveAccuracy(typing);
  const next = expectedChar(typing);

  return (
    <div className="typing">
      <div className="monitor">
        <div className="typing-head">
          {frame && <span className="frame">› {frame}</span>}
          <span className="live">
            {typing.position}/{typing.text.length} · {percent(accuracy)} genau
          </span>
        </div>
        {layoutHint && (
          <p className="warn" role="alert">
            Achtung: Es sieht so aus, als wäre kein deutsches Tastaturlayout eingestellt. Bitte in den Systemeinstellungen „Deutsch“ wählen.
          </p>
        )}
        {capsLock && <CapsLockHint />}
        {numpad && <NumpadHint />}
        {/* Der Text rollt mit der Schreibmarke (useTextScroll): Rahmen und Innenabstand liegen außen, gerollt wird innen */}
        <p className="text" aria-label="Übungstext" data-text={typing.text}>
          <span className="text-scroll" ref={scroll}>
            {Array.from(typing.text, (ch, i) => (
              <span key={i} className={`ch ${typing.chars[i]} ${ch === ' ' ? 'space' : ''} ${i === typing.position ? 'cursor' : ''}`}>
                {ch === ' ' ? '\u00a0' : ch}
              </span>
            ))}
          </span>
        </p>
        <p className="hint">{next !== undefined ? describeKey(next) : '\u00a0'}</p>
      </div>
      {notice && (
        <p className="desk-notice" role="status">
          {notice}
        </p>
      )}
      {showKeyboard && (
        <div className="desk-keyboard">
          <Keyboard learned={learned} target={next} press={press} rings={rings && Object.fromEntries(rings.map((r) => [r.key, r]))} />
        </div>
      )}
    </div>
  );
}

/** Hinweis, wenn die Feststelltaste an ist */
export function CapsLockHint() {
  return (
    <p className="warn" role="alert">
      Die Feststelltaste ist an – alles kommt in GROSSBUCHSTABEN. Drück einmal die Feststelltaste links neben dem A.
    </p>
  );
}

/** Hinweis, wenn eine Ziffer vom Ziffernblock kam: der Anschlag zählt nicht, die Position bleibt */
export function NumpadHint() {
  return (
    <p className="warn" role="alert">
      {NUMPAD_HINT}
    </p>
  );
}
