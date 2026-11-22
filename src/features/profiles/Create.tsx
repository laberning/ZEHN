// Rekrutierung: Vorname, Codename (würfeln oder selbst tippen), Avatar.

import { useState } from 'react';
import { CODENAMES } from '../../content/codenames.ts';
import { agentTitle, rollCodename, type Avatar } from '../../domain/profile.ts';
import { rankFor, rankName } from '../../domain/rewards.ts';
import { createRng } from '../../domain/rng.ts';
import { wearable } from '../../domain/wardrobe.ts';
import { useActions, useGame } from '../../ui/app/game.ts';
import { AvatarEditor } from '../../ui/components/AvatarEditor.tsx';
import { AvatarPic } from '../../ui/components/Characters.tsx';
import { DressingRoom } from '../../ui/components/DressingRoom.tsx';
import { TurnButtons } from '../../ui/components/TurnButtons.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';
import type { Facing } from '../../ui/lpc/compose.ts';

export function Create() {
  const firstRank = useGame((s) => rankFor(0, s.rules.rewards.ranks));
  const wardrobe = useGame((s) => s.wardrobe);
  const defaultAvatar = wardrobe.defaultAvatar;
  // Bei der Rekrutierung: nur, was frei ist
  const [allowed] = useState(() => wearable(wardrobe, new Set()));
  const { createProfile, go, seed } = useActions();
  const roll = () => rollCodename(CODENAMES, createRng(seed()));
  const [firstName, setFirstName] = useState('');
  const [codename, setCodename] = useState(roll);
  const [avatar, setAvatar] = useState<Avatar>(() => defaultAvatar('w'));
  const [facing, setFacing] = useState<Facing>('down');
  const valid = firstName.trim().length > 0 && codename.trim().length > 0;

  // Nur einmal absenden (Doppelklick, zweimal Enter)
  const [sent, setSent] = useState(false);
  const finish = () => {
    if (!valid || sent) return;
    setSent(true);
    void createProfile({ firstName, codename, avatar });
  };
  useKey('Enter', valid && !sent ? finish : null);
  const cancel = () => go({ name: 'profiles' });
  useKey('Escape', cancel);

  return (
    <div className="screen">
      <h1>Rekrutierungsbogen</h1>
      <p className="muted">Streng geheim. Nur für zukünftige Agentinnen und Agenten der ZEHN.</p>
      <DressingRoom
        preview={
          <>
            <div className="id-card">
              <div className="id-head">ZEHN · Dienstausweis</div>
              <AvatarPic avatar={avatar} size={160} full walk facing={facing} />
              <TurnButtons facing={facing} onChange={setFacing} />
              <b>{firstName || '…'}</b>
              <span>
                {agentTitle(avatar.gender)} {codename}
              </span>
              <small>Rang: {rankName(firstRank, avatar.gender)}</small>
            </div>
            <button className="primary big" disabled={!valid || sent} onClick={finish}>
              Rekrutierung abschließen ⏎
            </button>
            <button className="quiet" onClick={cancel}>
              Zurück zur Startseite
            </button>
          </>
        }
      >
        <label className="field">
          <span className="field-label">Vorname</span>
          <input value={firstName} maxLength={20} onChange={(e) => setFirstName(e.target.value)} placeholder="Wie heißt du?" autoFocus />
        </label>
        <div className="field">
          <span className="field-label">Codename</span>
          <div className="row">
            <input value={codename} maxLength={24} onChange={(e) => setCodename(e.target.value)} />
            <button onClick={() => setCodename(roll())} title="Neuen Codenamen würfeln">
              Würfeln
            </button>
          </div>
        </div>
        <AvatarEditor avatar={avatar} onChange={setAvatar} allowed={allowed} facing={facing} />
        <p className="muted small">Mehr Kleidung, Frisuren und Farben spielst du im Spiel frei.</p>
      </DressingRoom>
    </div>
  );
}
