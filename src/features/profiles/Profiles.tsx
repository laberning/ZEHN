// Startseite: worum es geht; Profil wählen, neu rekrutieren oder gesicherte Akte laden.
// Ohne Akten macht sie neugierig: verschwindendes F, Überschrift, Krümels Funk-Zeile, ein Absatz zur Geschichte, drei Chips.

import { useRef, useState } from 'react';
import { parseBackup } from '../../app/backup.ts';
import { HELP_LINK_LABEL, REPO_URL, START_TEXTS, brokenProfilesText } from '../../content/texts/shell.ts';
import { agentTitle } from '../../domain/profile.ts';
import { rankTitle } from '../../app/views/common.ts';
import { useActions, useGame } from '../../ui/app/game.ts';
import { AvatarPic } from '../../ui/components/Characters.tsx';
import { ConfirmDelete } from '../../ui/components/ConfirmDelete.tsx';
import { ExternalLink } from '../../ui/components/ExternalLink.tsx';
import { downloadBackup } from '../../ui/download.ts';
import { useKey } from '../../ui/hooks/useKey.ts';
import { StartTeaser } from './StartTeaser.tsx';

export function Profiles() {
  const profiles = useGame((s) => s.profiles);
  const rules = useGame((s) => s.rules);
  const broken = useGame((s) => s.brokenProfiles);
  const { selectProfile, go, importProfile, removeProfile, now } = useActions();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const first = profiles.length === 0;
  // Verwaltungsmodus: Karten wählen nicht mehr, sondern sichern und löschen; ohne Akten gibt es nichts zu verwalten
  const [manage, setManage] = useState(false);
  const managing = manage && !first;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toDelete = profiles.find((p) => p.id === deleteId);
  const recruit = () => go({ name: 'create' });
  useKey('Enter', first ? recruit : null);
  // Esc beendet den Modus – nicht, solange die Rückfrage offen ist (dann gehört Esc ihr)
  useKey('Escape', managing && !toDelete ? () => setManage(false) : null);

  const importFile = async (f: File) => {
    try {
      await importProfile(parseBackup(await f.text()), (p) => confirm(`Die Akte von ${p.codename} gibt es schon. Überschreiben?`));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className={first ? 'screen center start first' : 'screen center start'}>
      <h1 className="logo">ZEHN</h1>
      <p className="tagline">Agenten der Tastatur</p>
      {first ? (
        <>
          <StartTeaser />
          <h2 className="start-headline">{START_TEXTS.headline}</h2>
          <p className="start-kruemel">
            <small>
              Krümel<span className="sr-only">:</span>
            </small>{' '}
            {START_TEXTS.kruemel}
          </p>
          <p className="pitch">{START_TEXTS.pitch}</p>
          <ul className="start-chips">
            {START_TEXTS.chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <button className="primary big" onClick={recruit}>
            Agentin oder Agent werden ⏎
          </button>
          <p className="muted small">Du brauchst eine echte Tastatur. Dein Spielstand bleibt auf deinem Gerät. ZEHN ist kostenlos und Open Source.</p>
        </>
      ) : (
        <>
          <p className="pitch">Das Geheimagenten-Spiel, mit dem du das Zehn-Finger-Schreiben lernst.</p>
          <h2>Wer meldet sich zum Dienst?</h2>
          <div className="profile-grid">
            {profiles.map((p) => {
              const body = (
                <>
                  <AvatarPic avatar={p.avatar} size={88} />
                  <b>{p.firstName}</b>
                  <span>
                    {agentTitle(p)} {p.codename}
                  </span>
                  <small>{rankTitle(p, rules)}</small>
                </>
              );
              return managing ? (
                <div key={p.id} className="profile-card managing">
                  {body}
                  <div className="row">
                    <button aria-label={`Sichern: ${p.codename}`} onClick={() => downloadBackup(p, now())}>
                      Sichern
                    </button>
                    <button className="danger" aria-label={`Löschen: ${p.codename}`} onClick={() => setDeleteId(p.id)}>
                      Löschen
                    </button>
                  </div>
                </div>
              ) : (
                <button key={p.id} className="profile-card" onClick={() => selectProfile(p.id)}>
                  {body}
                </button>
              );
            })}
            {!managing && (
              <button className="profile-card new" onClick={recruit}>
                <span className="plus">+</span>
                <b>Neu rekrutieren</b>
              </button>
            )}
          </div>
          <button className="quiet" onClick={() => setManage(!managing)}>
            {managing ? 'Fertig' : 'Agenten verwalten'}
          </button>
        </>
      )}
      {broken > 0 && (
        <p className="warn" role="alert">
          {brokenProfilesText(broken)}
        </p>
      )}
      {error && (
        <p className="warn" role="alert">
          {error}
        </p>
      )}
      <div className="start-links">
        <button className="quiet" onClick={() => fileRef.current?.click()}>
          Gesicherte Akte laden
        </button>
        <button className="quiet" onClick={() => go({ name: 'credits' })}>
          Credits
        </button>
        <ExternalLink href={REPO_URL}>{HELP_LINK_LABEL}</ExternalLink>
      </div>
      {toDelete && (
        <ConfirmDelete
          profile={toDelete}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            setDeleteId(null);
            void removeProfile(toDelete.id);
          }}
        />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        data-testid="backup-input"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
