// Spielende (Finale): Aufbau wie der Startbildschirm. Krümel und Ada verabschieden sich in der Geschichte,
// darunter spricht ein Satz außerhalb der Geschichte. Der Bildschirm merkt sich beim Öffnen, dass er gezeigt wurde.

import { STORY_END_TEXTS as T } from '../../content/texts/ende.ts';
import { storyEnd } from '../../domain/progress.ts';
import { useActions, useGame, useProfile } from '../../ui/app/game.ts';
import { SpeakerPic } from '../../ui/components/Characters.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';
import { useOnRise } from '../../ui/hooks/useOnRise.ts';

export function EndScreen() {
  const p = useProfile();
  const rules = useGame((s) => s.rules);
  const { go, markStoryEndSeen } = useActions();
  const end = storyEnd(p, rules.course);
  const leave = () => go({ name: 'hq' });
  useOnRise(!!end, () => void markStoryEndSeen(end!.moduleId));
  useKey('Enter', leave);
  useKey('Escape', leave);
  // Kein Ende erreichbar (z. B. alter Link): zurück ins HQ statt eines leeren Bildschirms
  useOnRise(!end, leave);
  if (!end) return null;

  return (
    <div className="screen center start story-end">
      <h1 className="logo">ZEHN</h1>
      <p className="tagline">Agenten der Tastatur</p>
      <h2 className="start-headline">{T.headline}</h2>
      <ul className="end-story">
        {T.story.map((l) => (
          <li key={l.speaker}>
            <SpeakerPic speaker={l.speaker} size={48} />
            <span>{l.text}</span>
          </li>
        ))}
      </ul>
      <p className="pitch">{T.outside}</p>
      <h3>{T.doTitle}</h3>
      <ul className="start-chips">
        {T.todo.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {end.backdoor && <p className="muted">{T.backdoor}</p>}
      <button className="primary big" onClick={leave}>
        {T.button} ⏎
      </button>
    </div>
  );
}
