// Agentenfunk: Chatliste und Chatansicht. Spielt Szenen ab (Nachrichten erscheinen nacheinander),
// merkt sich Lesestand und gewählte Antworten über Store-Aktionen. Der Ablauf selbst steckt in domain/chat.ts.

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { chatEnd, type Screen } from '../../app/navigation.ts';
import { funkChats } from '../../app/views/funk.ts';
import { CHAT_FACES, CHAT_SUBTITLES, CHAT_TITLES, CHOICE_HINT } from '../../content/texts/funk.ts';
import { speakerName } from '../../content/texts/speakers.ts';
import { chatHistory, currentItem, GAP_MS, isEnd, isTyping, lineTypingMs, offeredChoices, playReducer, playStart, visibleItems } from '../../domain/chat.ts';
import { fill, type ChatId, type Choice } from '../../domain/dialog.ts';
import { ownedItems } from '../../domain/items.ts';
import { unread } from '../../domain/story.ts';
import { findScene, type StoryScene } from '../../domain/scenes.ts';
import { useActions, useGame, useProfile, useStoryTime, useStoryVars } from '../../ui/app/game.ts';
import { SpeakerPic } from '../../ui/components/Characters.tsx';
import { Chat } from '../../ui/components/Chat.tsx';
import { TypedAnswer } from '../../ui/components/TypedAnswer.tsx';
import { BackButton } from '../../ui/components/common.tsx';
import { useChoiceKeys } from '../../ui/hooks/useChoiceKeys.ts';
import { useKey } from '../../ui/hooks/useKey.ts';
import { useTimeout } from '../../ui/hooks/useTimer.ts';

interface Props {
  play?: string[];
  chat?: ChatId;
  then?: Screen;
  label?: string;
  again?: Screen;
}

export function FunkScreen({ play, chat, then, label, again }: Props) {
  if (!play && !chat) return <ChatListView />;
  return <ChatView play={play} chat={chat} then={then} label={label} again={again} />;
}

/** Chatliste: links neben dem offenen Chat, auf schmalen Bildschirmen allein */
function ChatSide({ current }: { current?: ChatId }) {
  const p = useProfile();
  const story = useGame((s) => s.story);
  const time = useStoryTime();
  const vars = useStoryVars(undefined, time);
  const { go } = useActions();
  const chats = funkChats(p, story, time);
  if (chats.length === 0) return <p className="muted funk-empty">Noch keine Nachrichten. Spiel einen Auftrag – dann meldet sich Krümel.</p>;
  return (
    <nav className="funk-chats" aria-label="Chats">
      {chats.map((c) => (
        <button key={c.id} className={`funk-chat ${c.id === current ? 'open' : ''} ${c.unread ? 'unread' : ''}`} onClick={() => go({ name: 'funk', chat: c.id })}>
          <SpeakerPic speaker={CHAT_FACES[c.id]} size={40} />
          <span className="funk-chat-text">
            <b>{CHAT_TITLES[c.id]}</b>
            {c.preview && (
              <small>
                {c.preview.line.speaker === 'player' ? 'Du: ' : ''}
                {fill(c.preview.line.text, vars)}
              </small>
            )}
          </span>
          {c.unread > 0 && <span className="new-pill">{c.unread} neu</span>}
        </button>
      ))}
    </nav>
  );
}

function ChatListView() {
  const p = useProfile();
  const story = useGame((s) => s.story);
  const { go } = useActions();
  const time = useStoryTime();
  const first = funkChats(p, story, time).find((c) => c.unread > 0);
  useKey('Enter', first ? () => go({ name: 'funk', chat: first.id }) : null);
  useKey('Escape', () => go({ name: 'hq' }));
  return (
    <div className="screen funk list">
      <div className="funk-device">
        <aside className="funk-side">
          <div className="funk-side-head">
            <h1>Agentenfunk</h1>
            <BackButton label="Hauptquartier" />
          </div>
          <ChatSide />
        </aside>
        <section className="funk-main funk-idle">
          <p className="muted">{first ? 'Neue Nachrichten! Enter öffnet den Chat.' : 'Wähle einen Chat.'}</p>
        </section>
      </div>
    </div>
  );
}

const sameValues = (a: Record<string, string | number>, b: Record<string, string | number>) => {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
};

function ChatView({ play, chat, then, label, again }: Props) {
  const p = useProfile();
  const story = useGame((s) => s.story);
  const { go, readScenes, pickChoice, sfx } = useActions();
  const time = useStoryTime();
  // Platzhalter bleiben dasselbe Objekt, solange ihr Inhalt gleich ist (sonst zeichnen sich die gemerkten Blasen neu)
  const freshVars = useStoryVars(undefined, time);
  const [vars, setVars] = useState(freshVars);
  if (!sameValues(vars, freshVars)) setVars(freshVars);

  // Beim Öffnen festhalten, was abgespielt wird: die übergebenen Szenen oder die ungelesenen des Chats
  const [setup] = useState(() => {
    const ids = play ?? (chat ? unread(p, story, chat) : []);
    const scenes = ids.map((id) => findScene(story, id)).filter((s): s is StoryScene => !!s);
    return { scenes, ids: new Set(scenes.map((s) => s.id)), start: chat ?? scenes[0]?.chat ?? 'intern' };
  });
  const [s, dispatch] = useReducer(playReducer, undefined, () => playStart(setup.scenes, { owned: ownedItems(p, story), picks: p.story.picks, time }, vars));

  // Takt: „tippt …“ dauert je nach Länge, danach kommt die nächste Nachricht
  const item = currentItem(s);
  const waitingChoice = !!offeredChoices(s)?.length;
  const typing = s.phase === 'typing';
  const delay = !item ? null : typing ? lineTypingMs(item.line) : !waitingChoice && !isEnd(s) ? GAP_MS : null;
  useTimeout(delay, () => dispatch({ type: typing ? 'shown' : 'next' }), s);

  // Gelesen = bis zum Ende gesehen
  useEffect(() => {
    const fresh = s.finished.filter((id) => !p.story.read.includes(id));
    if (fresh.length) void readScenes(fresh);
  }, [s.finished, p.story.read, readScenes]);

  const choices = offeredChoices(s);
  // Eine selbst getippte Antwort steht allein zur Wahl: erst tippen, dann mit Enter weiter
  const typedChoice = choices?.find((c) => c.typed);
  // Eine Antwort kann eine Aktion mitbringen (Paket: „Zur Garderobe“); sie gilt am Ende der Szene
  const [action, setAction] = useState<Choice['action']>();
  const [typedDone, setTypedDone] = useState<number | null>(null);
  const typedReady = !!typedChoice && !!item && typedDone === item.id;
  // Szenen, in denen in diesem Durchlauf schon gewählt wurde (die erste Wahl ersetzt alte Antworten)
  const [picked] = useState(() => new Set<string>());
  const choose = (index: number) => {
    const c = choices?.[index];
    if (!c || !item) return;
    void pickChoice(item.sceneId, c.id, !picked.has(item.sceneId));
    picked.add(item.sceneId);
    if (c.action) setAction(c.action);
    dispatch({ type: 'choose', index });
  };
  useChoiceKeys(choices?.length && !typedChoice ? item?.id : null, choices?.length ?? 0, choose, (delta) => dispatch({ type: 'pick', delta }));

  const end = isEnd(s);
  // Am Ende eines abgespielten Stücks: Hauptknopf (Enter) und, bei „Noch eine Runde“ oder Paket, dazu der Weg zurück
  const { leave, primary, secondary } = chatEnd({ play, then, label, again }, action);
  // Enter: am Ende weiter, bei Antworten die markierte wählen (über choose, damit sie gespeichert wird), sonst nächste Nachricht.
  // Erscheinen Antworten oder ist das Ende erreicht, gilt die Sperrzeit neu – ein schnelles Doppel-Enter wählt oder verlässt nichts ungesehen.
  const enter = end
    ? primary && (() => go(primary.to))
    : typedChoice
      ? typedReady && (() => choose(choices!.indexOf(typedChoice)))
      : choices?.length
        ? () => choose(s.pick)
        : () => dispatch({ type: 'advance' });
  useKey('Enter', enter || null, end ? 'end' : choices?.length && !typedChoice ? `choices:${item!.id}` : undefined);
  useKey('Escape', () => go(leave));

  // Pling bei jeder neuen Nachricht einer anderen Figur
  const lastShown = visibleItems(s).at(-1);
  useEffect(() => {
    if (lastShown && lastShown.line.speaker !== 'player' && lastShown.line.speaker !== 'system') sfx('message');
  }, [lastShown, sfx]);

  // immer ans Ende scrollen
  const log = useRef<HTMLDivElement>(null);
  const shown = visibleItems(s).length;
  useEffect(() => {
    const el = log.current?.querySelector('.chat-log');
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, s.phase, choices]);

  const typingNow = isTyping(s) ? item! : null;
  // Verlauf nur neu zusammenstellen, wenn sich Log oder Antworten ändern (nicht bei jeder neuen Nachricht)
  const history = useMemo(() => chatHistory(p, story, setup.start, setup.ids, time), [p.story.log, p.story.picks, story, setup, time]); // eslint-disable-line react-hooks/exhaustive-deps -- chatHistory liest von p nur Log und Antworten
  return (
    <div className="screen funk" ref={log} data-end={end}>
      <div className="funk-device">
        <aside className="funk-side">
          <h2>Agentenfunk</h2>
          <ChatSide current={setup.start} />
        </aside>
        <section className="funk-main">
          <header className="funk-head">
            <SpeakerPic speaker={CHAT_FACES[setup.start]} size={44} />
            <div>
              <h1>{CHAT_TITLES[setup.start]}</h1>
              <small className={typingNow ? 'typing' : ''}>{typingNow ? `${speakerName(typingNow.line.speaker, vars) || 'Jemand'} tippt …` : CHAT_SUBTITLES[setup.start]}</small>
            </div>
            <BackButton to={leave} label={play ? 'Später lesen' : 'Hauptquartier'} />
          </header>
          <Chat chat={setup.start} history={history} items={visibleItems(s)} typing={typingNow} vars={vars} />
          <div className="funk-answer">
            {typedChoice && item && <TypedAnswer key={item.id} word={typedChoice.typed!} onComplete={() => setTypedDone(item.id)} />}
            {choices && choices.length > 0 && !typedChoice && (
              <div className="chat-choices">
                {choices.map((c, n) => (
                  <button key={c.id} className={`choice ${n === s.pick ? 'picked' : ''}`} onMouseEnter={() => dispatch({ type: 'pick', delta: n - s.pick })} onClick={() => choose(n)}>
                    <span className="num">{n + 1}</span> {c.label}
                  </button>
                ))}
                <p className="choice-hint">{CHOICE_HINT}</p>
              </div>
            )}
            {end && primary && (
              <div className="funk-end">
                <button className="primary big" onClick={() => go(primary.to)}>
                  {primary.label}
                </button>
                {secondary && <button onClick={() => go(secondary.to)}>{secondary.label}</button>}
              </div>
            )}
            {!end && !choices?.length && !typedChoice && <p className="funk-hint muted">Enter zeigt die nächste Nachricht sofort</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
