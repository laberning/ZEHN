// Agentenakte: Statistik, Tastatur-Wärmekarte, Tempokurve, Sichern/Laden.

import { useState } from 'react';
import { akteView } from '../../app/views/akte.ts';
import { HEAT_TEXTS } from '../../content/texts/akte.ts';
import { formatDate } from '../../domain/format.ts';
import { agentTitle } from '../../domain/profile.ts';
import { useActions, useGame, useProfile } from '../../ui/app/game.ts';
import { AvatarPic } from '../../ui/components/Characters.tsx';
import { HeatLegend } from '../../ui/components/HeatLegend.tsx';
import { Keyboard } from '../../ui/components/Keyboard.tsx';
import { TempoChart } from '../../ui/components/TempoChart.tsx';
import { BackButton, XpBar } from '../../ui/components/common.tsx';
import { downloadBackup } from '../../ui/download.ts';
import { ConfirmDelete } from '../../ui/components/ConfirmDelete.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';
import { Tabs } from '../../ui/components/Tabs.tsx';
import { ParentReport } from './ParentReport.tsx';

type Tab = 'akte' | 'eltern';
const AKTE_TABS: readonly { id: Tab; label: string }[] = [
  { id: 'akte', label: 'Akte' },
  { id: 'eltern', label: 'Für Eltern' },
];

export function Akte() {
  const p = useProfile();
  const rules = useGame((s) => s.rules);
  const { go, removeProfile, now } = useActions();
  const [deleting, setDeleting] = useState(false);
  // Solange die Rückfrage offen ist, gehört Esc ihr
  useKey('Escape', deleting ? null : () => go({ name: 'hq' }));
  const [tab, setTab] = useState<Tab>('akte');
  // Stichtag „letzte 7 Tage“ einmal beim Öffnen festhalten – Rendern bleibt rein
  const [openedAt] = useState(now);
  const view = akteView(p, rules, openedAt);
  const { keys, heat, heatScale, shakyText: shaky, movementTexts, tempo, avgApm: avg, avgWindow, exercises } = view;

  const download = () => downloadBackup(p, now());

  return (
    <div className="screen akte">
      <BackButton />
      <div className="akte-head">
        <AvatarPic avatar={p.avatar} size={120} />
        <div>
          <p className="stamp">Streng geheim</p>
          <h1>
            {agentTitle(p)} {p.codename}
          </h1>
          <p>
            Klarname: {p.firstName} · im Dienst seit {formatDate(p.createdAt)}
          </p>
          <XpBar xp={p.xp} />
        </div>
      </div>

      <Tabs tabs={AKTE_TABS} value={tab} onChange={setTab} label="Agentenakte">
        {tab === 'eltern' ? (
          <ParentReport view={view} />
        ) : (
          <>
            <div className="tiles">
              <div className="tile">
                <b>{exercises}</b>
                <small>Übungen</small>
              </div>
              <div className="tile">
                <b>{avg === null ? '–' : Math.round(avg)}</b>
                <small>Ø Anschläge/min (letzte {avgWindow})</small>
              </div>
              <div className="tile">
                <b>{Math.round(p.bestApm) || '–'}</b>
                <small>Tempo-Rekord</small>
              </div>
              <div className="tile">
                <b>{p.days.count}</b>
                <small>Agententage</small>
              </div>
            </div>

            <section>
              <h2>Tastatur-Wärmekarte</h2>
              <p className="muted">{HEAT_TEXTS.intro}</p>
              <Keyboard learned={new Set(keys)} heat={heat} small />
              <HeatLegend scale={heatScale} />
              {shaky && <p className="shaky">{shaky}</p>}
              {movementTexts.map((t) => (
                <p key={t} className="shaky">
                  {t}
                </p>
              ))}
            </section>

            <section>
              <h2>Tempokurve</h2>
              <TempoChart values={tempo} />
            </section>

            <section>
              <h2>Akte sichern</h2>
              <p className="muted">Der Spielstand liegt nur in diesem Browser. Sichere ihn ab und zu als Datei.</p>
              <div className="row">
                <button onClick={download}>Akte als Datei sichern</button>
                <button className="danger" onClick={() => setDeleting(true)}>
                  Akte löschen
                </button>
              </div>
            </section>
          </>
        )}
      </Tabs>
      {deleting && <ConfirmDelete profile={p} onCancel={() => setDeleting(false)} onConfirm={() => {
            setDeleting(false);
            void removeProfile(p.id);
          }} />}
    </div>
  );
}
