// Selbst getippte Antwort im Chat: ein Eingabefeld im Terminal-Stil. Die Zeichen kommen über useTypingInput;
// eine falsche Taste leuchtet rot, weiter geht es erst mit der richtigen. Zahlen und Enter zählen hier nicht als Auswahl.

import { useReducer } from 'react';
import { applyKey, isDone, startTyping, type KeyPress, type TypingState } from '../../domain/typing.ts';
import { useOnRise } from '../hooks/useOnRise.ts';
import { usePressSound } from '../hooks/usePressSound.ts';
import { useTypingInput } from '../hooks/useTypingInput.ts';
import { CapsLockHint } from './TypingPanel.tsx';

interface State {
  typing: TypingState;
  press: KeyPress | null;
}

function reduce(s: State, a: { ch: string; now: number }): State {
  const r = applyKey(s.typing, s.press, a.ch, a.now);
  return r ? { typing: r.typing, press: r.press } : s;
}

interface Props {
  word: string;
  /** Wird einmal aufgerufen, sobald das Wort fertig getippt ist */
  onComplete: () => void;
}

export function TypedAnswer({ word, onComplete }: Props) {
  const [s, dispatch] = useReducer(reduce, undefined, () => ({ typing: startTyping(word), press: null }));
  const done = isDone(s.typing);
  const { capsLock } = useTypingInput(!done, (ch, now) => dispatch({ ch, now }));

  usePressSound(s.press);
  useOnRise(done, onComplete);

  return (
    <div className="typed-answer" role="textbox" aria-label="Tippe deine Antwort" data-word={word}>
      <span className="prompt">&gt; </span>
      {Array.from(word, (ch, i) => (
        <span key={i} className={`ch ${s.typing.chars[i]} ${i === s.typing.position ? 'cursor' : ''}`}>
          {ch}
        </span>
      ))}
      {!done && <span className={`typed-hint ${s.press && !s.press.ok ? 'miss' : ''}`}> {s.press && !s.press.ok ? 'Nicht ganz – nochmal!' : 'Finger auf F und J – tippe selbst'}</span>}
      {done && <span className="typed-hint ok"> ✓ Enter ⏎</span>}
      {capsLock && !done && <CapsLockHint />}
    </div>
  );
}
