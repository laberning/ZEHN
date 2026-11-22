// Fallakte eines Akts: was gelöst ist, welche Spuren offen sind, Krümel schließt ab.
// Das Öffnen merkt sich das Profil (das „Neu“ im HQ verschwindet).

import { fallakteView } from '../../app/views/fallakte.ts';
import { fallakte, type FallakteEntry, type SuspectStatus } from '../../domain/book.ts';
import { useActions, useGame, useProfile } from '../../ui/app/game.ts';
import { SCRATCHED_KRUEMEL, SCRATCHES } from '../../content/texts/fallakte.ts';
import { KruemelSays } from '../../ui/components/KruemelSays.tsx';
import { StoryPicture } from '../../ui/pictures/StoryPicture.tsx';
import { BackButton } from '../../ui/components/common.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';
import { useOnRise } from '../../ui/hooks/useOnRise.ts';

function Entry({ entry }: { entry: FallakteEntry }) {
  return (
    <li>
      <span className="fa-pic">{entry.picture && <StoryPicture id={entry.picture} />}</span>
      <div className="fa-text">
        {entry.text}
        {entry.card && (
          <div className="chat-card goldcard">
            <p>{entry.card}</p>
          </div>
        )}
      </div>
    </li>
  );
}

const STAMPS: Record<SuspectStatus, string> = { verdaechtig: 'VERDÄCHTIG', gesucht: 'GESUCHT', entlastet: 'ENTLASTET', ueberfuehrt: 'ÜBERFÜHRT' };

export function Fallakte({ moduleId }: { moduleId: string }) {
  const p = useProfile();
  const { go, markFallakteSeen } = useActions();
  useKey('Escape', () => go({ name: 'hq' }));
  const story = useGame((s) => s.story);
  const file = fallakte(story, moduleId);
  const { scratched, firewall, solved, open, suspects } = fallakteView(p, story, moduleId);
  // Zerkratzt gilt als nicht gelesen: das „Neu“ im HQ bleibt, bis die Akte wieder lesbar ist und geöffnet wird
  useOnRise(!scratched, () => void markFallakteSeen(moduleId));
  // Kein Modul ohne Fallakte erreichbar; sicherheitshalber zurück ins HQ statt eines leeren Bildschirms
  if (!file) return <BackButton />;
  if (scratched) {
    return (
      <div className="screen fallakte">
        <BackButton />
        <h1>{file.title}</h1>
        <p className="fa-header">{file.header}</p>
        <section className="fa-folder fa-scratched">
          <ul>
            {SCRATCHES.map((line) => (
              <li key={line}>
                <div className="fa-text">{line}</div>
              </li>
            ))}
          </ul>
        </section>
        <KruemelSays size={56} className="kruemel-tip">
          {SCRATCHED_KRUEMEL}
        </KruemelSays>
      </div>
    );
  }
  return (
    <div className="screen fallakte">
      <BackButton />
      <h1>{file.title}</h1>
      <p className="fa-header">{file.header}</p>

      <section className="fa-folder">
        <h2>
          Gelöst <span className="fa-stamp solved">GELÖST</span>
        </h2>
        <ul>
          {solved.map((e) => (
            <Entry key={e.text} entry={e} />
          ))}
          <Entry entry={{ text: file.firewall[firewall] }} />
        </ul>
      </section>

      <section className="fa-folder">
        <h2>
          Offene Spuren <span className="fa-stamp open">OFFEN</span>
        </h2>
        <ul>
          {open.map((e) => (
            <Entry key={e.text} entry={e} />
          ))}
        </ul>
      </section>

      <section className="fa-folder">
        <h2>Verdächtige</h2>
        <ul>
          {suspects.map((s) => (
            <li key={s.name}>
              <span className="fa-pic">
                <StoryPicture id={s.picture} />
              </span>
              <div className="fa-text">
                <strong>{s.name}</strong> <span className={`fa-stamp ${s.status}`}>{STAMPS[s.status]}</span>
                <p className="fa-suspect">{s.text}</p>
                {s.hits.map((h) => (
                  <p key={h.text} className="fa-hit">
                    <span>Dein Treffer:</span> {h.text}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <KruemelSays size={56} className="kruemel-tip">
        {file.closing}
      </KruemelSays>
    </div>
  );
}
