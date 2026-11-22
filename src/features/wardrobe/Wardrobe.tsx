// Garderobe und Agentenkoffer im HQ: Avatar ändern, Kleidung tragen; im Koffer liegen die Gadgets.

import { useEffect, useRef, useState } from 'react';
import { dressingView } from '../../app/views/wardrobe.ts';
import type { Avatar } from '../../domain/profile.ts';
import { useActions, useGame, useProfile } from '../../ui/app/game.ts';
import { AvatarEditor } from '../../ui/components/AvatarEditor.tsx';
import { AvatarPic } from '../../ui/components/Characters.tsx';
import { DressingRoom } from '../../ui/components/DressingRoom.tsx';
import { TurnButtons } from '../../ui/components/TurnButtons.tsx';
import { BackButton } from '../../ui/components/common.tsx';
import { GadgetIcon } from '../../ui/components/GadgetIcon.tsx';
import { StoryPicture } from '../../ui/pictures/StoryPicture.tsx';
import { Tabs } from '../../ui/components/Tabs.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';
import type { Facing } from '../../ui/lpc/compose.ts';
import { EvidenceViewer } from './EvidenceViewer.tsx';

type Tab = 'kleidung' | 'koffer';
const WARDROBE_TABS: readonly { id: Tab; label: string }[] = [
  { id: 'kleidung', label: 'Kleidung' },
  { id: 'koffer', label: 'Koffer' },
];

export function Wardrobe({ tab: startTab = 'kleidung' }: { tab?: Tab }) {
  const p = useProfile();
  const wardrobe = useGame((s) => s.wardrobe);
  const story = useGame((s) => s.story);
  const rules = useGame((s) => s.rules);
  const { wearAvatar, markItemsSeen, go } = useActions();
  const [tab, setTab] = useState<Tab>(startTab);
  const [avatar, setAvatar] = useState<Avatar>(p.avatar);
  const [facing, setFacing] = useState<Facing>('down');
  // Betrachter des Beweisfachs: welches Gadget, welches Stück; der Knopf bekommt beim Schließen den Fokus zurück
  const [viewer, setViewer] = useState<{ gadget: string; index: number } | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const openViewer = (gadget: string, index: number, from: HTMLElement) => {
    opener.current = from;
    setViewer({ gadget, index });
  };
  const closeViewer = () => {
    setViewer(null);
    opener.current?.focus();
  };
  // Stand beim Öffnen: Neue Dinge bleiben als „neu“ markiert, obwohl sie gleich als gesehen gelten
  const [view] = useState(() => dressingView(p, rules, story, wardrobe));
  const { fresh } = view;
  useEffect(() => {
    void markItemsSeen(fresh);
  }, [fresh, markItemsSeen]);

  const done = () => void wearAvatar(avatar);
  // Enter zieht nur in der Kleidung an – im Koffer gibt es nichts anzuziehen
  useKey('Enter', tab === 'kleidung' ? done : null);
  // Esc schließt zuerst den Betrachter, sonst zurück ins HQ
  useKey('Escape', viewer ? closeViewer : () => go({ name: 'hq' }));
  const shown = viewer && view.gadgets.find((g) => g.id === viewer.gadget);

  return (
    <div className="screen">
      <BackButton label="Zurück ohne Umziehen" />
      <h1>
        Garderobe{' '}
        <small>
          {view.special.unlocked} / {view.special.total} Spezialteile · {view.gadgetCount.owned} / {view.gadgetCount.total} Gadgets
        </small>
      </h1>
      <Tabs tabs={WARDROBE_TABS} value={tab} onChange={setTab} label="Garderobe">
        {tab === 'kleidung' ? (
          <>
            <p className="muted">Kringel bringt dir Pakete mit neuer Kleidung. Das Aussehen ist nur für den Look – Gadgets musst du nicht anziehen.</p>
            <DressingRoom
              preview={
                <>
                  <div className="id-card mirror">
                    <div className="id-head">Spiegel</div>
                    <AvatarPic avatar={avatar} size={180} full walk facing={facing} />
                    <TurnButtons facing={facing} onChange={setFacing} />
                  </div>
                  <button className="primary big" onClick={done}>
                    Anziehen und zurück ⏎
                  </button>
                  {view.freshCloth.length > 0 && <p className="rankup">Neu: {view.freshCloth.join(', ')}</p>}
                </>
              }
            >
              <AvatarEditor avatar={avatar} onChange={setAvatar} allowed={view.allowed} owned={view.owned} fresh={view.freshIds} hintFor={view.hintFor} facing={facing} />
            </DressingRoom>
          </>
        ) : (
          <>
            <p className="muted">Agenten nehmen immer den ganzen Koffer mit – was drin liegt, hast du dabei.</p>
            <ul className="koffer">
              {view.gadgets.map((g) => (
                <li key={g.id} className={`gadget ${g.has ? 'has' : 'missing'}`}>
                  <span className="gadget-icon" aria-hidden="true">
                    <GadgetIcon id={g.id} has={g.has} />
                  </span>
                  <div className="gadget-body">
                    <b>{g.name}</b> {g.fresh && <span className="new-pill">Neu</span>}
                    <small>{g.text}</small>
                    {g.pieces.length > 0 && (
                      <ul className="evidence-strip" aria-label={`Inhalt: ${g.pieces.length === 1 ? 'ein Beweisstück' : `${g.pieces.length} Beweisstücke`}`}>
                        {g.pieces.map((e, i) => (
                          <li key={e.id}>
                            <button className="evidence-thumb" aria-haspopup="dialog" aria-label={`${e.name} ansehen`} onClick={(ev) => openViewer(g.id, i, ev.currentTarget)}>
                              <StoryPicture id={e.picture} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Tabs>
      {viewer && shown && (
        <EvidenceViewer
          title={shown.name}
          pieces={shown.pieces}
          index={viewer.index}
          onIndex={(index) => setViewer({ ...viewer, index })}
          onClose={closeViewer}
          onFallakte={shown.fallakte ? () => go({ name: 'fallakte', moduleId: shown.fallakte as string }) : undefined}
        />
      )}
    </div>
  );
}
