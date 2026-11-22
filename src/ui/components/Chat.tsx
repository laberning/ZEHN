// Chat auf Krümels Bildschirm: Sprechblasen mit Gesichtern, Systemzeilen, Objekte, Karten, Bilder, Mini-Tastatur.
// Rein darstellend – den Ablauf steuert domain/chat.ts, den Takt der Funk-Bildschirm.

import { memo, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { CHAT_DIVIDERS } from '../../content/texts/funk.ts';
import { speakerName } from '../../content/texts/speakers.ts';
import type { ChatMessage, PlayItem } from '../../domain/chat.ts';
import { dividerBefore } from '../../domain/chat.ts';
import { fill, type ChatId, type Line } from '../../domain/dialog.ts';
import { objectOf } from '../../domain/storyObject.ts';
import { useGame } from '../app/game.ts';
import { SpeakerPic } from './Characters.tsx';
import { GadgetIcon } from './GadgetIcon.tsx';
import { Keyboard } from './Keyboard.tsx';
import { StoryObject } from './StoryObject.tsx';
import { StoryPicture } from '../pictures/StoryPicture.tsx';

/** Eine Sprechblase. `first`: erste Blase einer Folge desselben Absenders – nur sie zeigt Gesicht und Namen. */
type BubbleProps = { line: Line; vars: Record<string, string | number>; first: boolean; fresh?: boolean };

const sameShallow = (a: object, b: object) => {
  const [ka, kb] = [Object.keys(a), Object.keys(b)];
  return ka.length === kb.length && ka.every((k) => Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
};

/** `memo`: der Verlauf wird bei jeder neuen Nachricht neu zusammengestellt (neue Zeilen-Objekte); gleiche Zeilen zeichnen sich nicht neu */
const Bubble = memo(BubbleView, (a, b) => a.first === b.first && a.fresh === b.fresh && a.vars === b.vars && sameShallow(a.line, b.line));

function BubbleView({ line, vars, first, fresh }: BubbleProps) {
  const objects = useGame((s) => s.story.objects);
  const items = useGame((s) => s.story.items);
  if (line.speaker === 'system') return <p className="chat-system">{fill(line.text, vars)}</p>;
  const mine = line.speaker === 'player';
  const name = speakerName(line.speaker, vars);
  const obj = line.object ? objectOf(objects, line.object.lessonId) : undefined;
  return (
    <div className={`chat-msg speaker-${line.speaker} ${mine ? 'mine' : ''} ${first ? 'first' : ''} ${fresh ? 'fresh' : ''}`}>
      {first ? <SpeakerPic speaker={line.speaker} /> : <span className="speaker-pic-gap" />}
      <div className="chat-bubble">
        {first && !mine && name && <b className="chat-name">{name}</b>}
        {line.strike ? (
          <p>
            <s className="chat-strike">{fill(line.strike, vars)}</s>{' '}
            {fill(line.text, vars)}
          </p>
        ) : (
          line.text && <p>{fill(line.text, vars)}</p>
        )}
        {obj && line.object && <StoryObject object={obj} percent={line.object.at} vars={vars} big bare />}
        {line.card && (
          <div className={`chat-card ${line.card.look ?? ''}`}>
            {line.card.look !== 'goldcard' && <b>{fill(line.card.title, vars)}</b>}
            <p>{fill(line.card.text, vars)}</p>
          </div>
        )}
        {line.item && (
          <span className="chat-item">
            <GadgetIcon id={line.item} has title={items.find((i) => i.id === line.item)?.name} />
          </span>
        )}
        {line.picture && <StoryPicture id={line.picture} />}
        {line.keys && (
          <div className="chat-keys">
            <Keyboard highlightCodes={line.keys} small />
          </div>
        )}
      </div>
    </div>
  );
}

function Divider({ children }: { children: ReactNode }) {
  return <p className="chat-divider">{children}</p>;
}

/** Folgt die Zeile einer Blase desselben Absenders (ohne Trennzeile dazwischen)? */
const sameSender = (line: Line, prev: Line | undefined) => !!prev && prev.speaker === line.speaker && line.speaker !== 'system';

interface Props {
  /** der geöffnete Chat */
  chat: ChatId;
  /** Verlauf bis jetzt (nur Zeilen dieses Chats) */
  history: readonly ChatMessage[];
  /** gerade abgespielte Nachrichten (alle Chats; Wechsel bekommen eine Trennzeile) */
  items: readonly PlayItem[];
  /** wer gerade „tippt“ */
  typing: PlayItem | null;
  vars: Record<string, string | number>;
}

/** So viele Nachrichten aus dem Verlauf zeigt ein Chat beim Öffnen und je Klick auf „Frühere Nachrichten“ mehr */
export const HISTORY_PAGE = 60;

export function Chat({ chat, history, items, typing, vars }: Props) {
  const [count, setCount] = useState(HISTORY_PAGE);
  const log = useRef<HTMLDivElement>(null);
  // Stelle halten: Höhe und Lage vor dem Nachladen merken, danach um die neue Höhe nachrücken
  const anchor = useRef<{ height: number; top: number } | null>(null);
  useLayoutEffect(() => {
    const el = log.current;
    if (anchor.current && el) el.scrollTop = anchor.current.top + (el.scrollHeight - anchor.current.height);
    anchor.current = null;
  }, [count]);
  const loadEarlier = () => {
    const el = log.current;
    if (el) anchor.current = { height: el.scrollHeight, top: el.scrollTop };
    setCount((n) => n + HISTORY_PAGE);
  };
  const all = typing ? [...items, typing] : items;
  // Vorab: wo eine Trennzeile steht und welche Blase eine neue Folge beginnt
  const rows = [
    ...history.map((m) => ({ key: m.key, line: m.line, fresh: false, divider: null as ChatId | null })),
    ...items.map((m, i) => ({ key: String(m.id), line: m.line, fresh: true, divider: dividerBefore(all, i, chat) })),
  ].map((r, i, list) => ({ ...r, first: !!r.divider || !sameSender(r.line, list[i - 1]?.line) }));
  // die ältesten Nachrichten bleiben zunächst verborgen
  const hidden = Math.max(0, history.length - count);
  const typingFirst = !!typing && (items.length === 0 || !sameSender(typing.line, rows.at(-1)?.line));
  return (
    <div className="chat-log" role="log" aria-live="polite" aria-label="Chatverlauf" ref={log}>
      {hidden > 0 && (
        // nimmt den Fokus nicht mit, damit Enter danach weiter die nächste Nachricht abspielt
        <button type="button" className="chat-earlier" onMouseDown={(e) => e.preventDefault()} onClick={loadEarlier}>
          Frühere Nachrichten
        </button>
      )}
      {rows.slice(hidden, history.length).map((r, i) => (
        <Bubble key={r.key} line={r.line} vars={vars} first={r.first || i === 0} />
      ))}
      {all.length > 0 && <Divider>Neu</Divider>}
      {rows.slice(history.length).map((r) => (
        <div key={r.key}>
          {r.divider && <Divider>{CHAT_DIVIDERS[r.divider]}</Divider>}
          <Bubble line={r.line} vars={vars} first={r.first || r === rows[history.length]} fresh />
        </div>
      ))}
      {typing && (
        <div className={`chat-msg chat-typing speaker-${typing.line.speaker} ${typingFirst ? 'first' : ''}`} aria-hidden="true">
          {typingFirst ? <SpeakerPic speaker={typing.line.speaker} /> : <span className="speaker-pic-gap" />}
          <div className="chat-bubble">
            <span className="typing-dots">
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
