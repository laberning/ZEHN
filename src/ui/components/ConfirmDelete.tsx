// Rückfrage vor dem Löschen einer Akte (Startseite und Agentenakte): im Stil des Spiels, kein Browser-Fenster.
// Gelöscht wird erst, wenn der Codename eingetippt ist. Fokusfalle und Esc wie im Betrachter des Beweisfachs
// (features/wardrobe/EvidenceViewer.tsx); kein natives <dialog>, damit die Komponententests in happy-dom laufen.
// Enter hängt am Eingabefeld statt an useKey: Dessen Sperrzeit würde ein schnelles Enter nach dem letzten Buchstaben verschlucken.

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { agentTitle, codenameMatches, type Profile } from '../../domain/profile.ts';
import { useActions } from '../app/game.ts';
import { downloadBackup } from '../download.ts';
import { useKey } from '../hooks/useKey.ts';
import { AvatarPic } from './Characters.tsx';

export function ConfirmDelete({ profile, onConfirm, onCancel }: { profile: Profile; onConfirm: () => void; onCancel: () => void }) {
  const { now } = useActions();
  const [typed, setTyped] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const ok = codenameMatches(typed, profile.codename);
  useEffect(() => input.current?.focus(), []);
  useKey('Escape', onCancel);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    // Fokus im Fenster halten – auch wenn er nach einem Klick auf Text oder Bild auf dem Fenster selbst liegt
    const items = [...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input') ?? [])];
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && at <= 0) items.at(-1)?.focus();
    else if (!e.shiftKey && (at === -1 || at === items.length - 1)) items[0]?.focus();
    else return;
    e.preventDefault();
  };

  return (
    <div className="confirm-backdrop">
      <div ref={panel} className="confirm-panel panel" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={onKeyDown}>
        <AvatarPic avatar={profile.avatar} size={72} />
        <h2 id={titleId}>Akte löschen?</h2>
        <p>
          <b>{profile.firstName}</b> · {agentTitle(profile)} <b>{profile.codename}</b>
        </p>
        <p className="muted">Das kann nicht rückgängig gemacht werden. Die ganze Akte ist danach weg.</p>
        <button onClick={() => downloadBackup(profile, now())}>Vorher sichern</button>
        <label className="field">
          <span className="field-label">Tippe den Codenamen zum Bestätigen</span>
          <input
            ref={input}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && ok) {
                e.preventDefault();
                onConfirm();
              }
            }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </label>
        <div className="row">
          <button className="danger" disabled={!ok} onClick={onConfirm}>
            Endgültig löschen
          </button>
          <button onClick={onCancel}>
            Abbrechen <kbd>Esc</kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
