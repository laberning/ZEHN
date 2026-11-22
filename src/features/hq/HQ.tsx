// Hauptquartier: Missionskarte, Rang, Agententage, Spielhalle, Zugang zu Akte, Abzeichen, Garderobe.
// Alles Abgeleitete kommt aus app/views/hq.ts, alle Aktionen aus dem Store.

import { hqView } from '../../app/views/hq.ts';
import { ARCADE_GAMES, medalLabel } from '../../content/arcadeGames.ts';
import { examStory, moduleLabel } from '../../domain/book.ts';
import { TRAINING_CARD } from '../../content/texts/ende.ts';
import { CHAT_TITLES } from '../../content/texts/funk.ts';
import { CASE_LOCKED_LABEL, BLIND_GADGET, BLIND_HINT, FLOW_HINT, blindLabel, daysLabel, flowLabel, welcomeText } from '../../content/texts/hq.ts';
import { HELP_LINK_LABEL, REPO_URL } from '../../content/texts/shell.ts';
import { SCRATCHED_LABEL } from '../../content/texts/fallakte.ts';
import { moreSidesText } from '../../content/texts/mission.ts';
import { speakerName } from '../../content/texts/speakers.ts';
import { fill } from '../../domain/dialog.ts';
import { agentTitle } from '../../domain/profile.ts';
import { arcadeBest, arcadeMedal } from '../../domain/progress.ts';
import { objectOf, objectPercent } from '../../domain/storyObject.ts';
import { ownedItems } from '../../domain/items.ts';
import { useActions, useGame, useProfile, useStoryTime, useStoryVars } from '../../ui/app/game.ts';
import { AvatarPic, SpeakerPic } from '../../ui/components/Characters.tsx';
import { ExternalLink } from '../../ui/components/ExternalLink.tsx';
import { KruemelSays } from '../../ui/components/KruemelSays.tsx';
import { LockIcon } from '../../ui/pixel/Pixel.tsx';
import { Meter, Stars, XpBar } from '../../ui/components/common.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';
import { useKruemelTip } from '../../ui/hooks/useKruemelTip.ts';
import { useOnRise } from '../../ui/hooks/useOnRise.ts';

export function HQ() {
  const p = useProfile();
  const rules = useGame((s) => s.rules);
  const { go, logout, beginLesson, beginExam, beginTraining, beginCase, toggleSound, toggleFlow, toggleBlind, sfx, announce, dismissWelcome } = useActions();
  const time = useStoryTime();
  const vars = useStoryVars(undefined, time);
  const tip = useKruemelTip();
  const story = useGame((s) => s.story);
  const welcome = useGame((s) => s.welcome);
  const view = hqView(p, rules, story, time);
  const hasBrille = ownedItems(p, story).has(BLIND_GADGET);

  // Enter startet den aktuellen Auftrag (oder den Einsatz, wenn er dran ist)
  // nach dem Finale startet Enter Bennos Tippstunde
  const enter = view.current ? () => void beginLesson(view.current!) : view.examDueId ? () => void beginExam(view.examDueId!) : view.storyEnd ? beginTraining : null;
  useKey('Enter', enter);
  const object = view.current ? objectOf(story.objects, view.current) : undefined;
  const hello = welcomeText(object ? { title: object.title, percent: objectPercent(p.lessons[object.lessonId]) } : view.examDueId ? { title: examStory(story, view.examDueId).title } : null);
  // Neue Nachricht im Funk: Benachrichtigung, solange sie ungelesen ist; Pling nur einmal je Szene (nicht bei jedem Besuch)
  const incoming = view.incoming;
  const announced = useGame((s) => s.announced);
  useOnRise(!!incoming && !announced.includes(incoming.sceneId), () => {
    sfx('message');
    announce(incoming!.sceneId);
  });

  return (
    <div className="screen hq">
      <header className="hq-head">
        <AvatarPic avatar={p.avatar} size={72} />
        <div className="hq-who">
          <small className="hq-place">Hauptquartier der ZEHN</small>
          <b>
            {agentTitle(p)} {p.codename}
          </b>
          <XpBar xp={p.xp} />
        </div>
        <div className="agent-days" title="An so vielen Tagen hast du trainiert">
          <b>{p.days.count}</b>
          <small>{daysLabel(p.days.count)}</small>
        </div>
      </header>

      <nav className="hq-nav">
        <button onClick={() => go({ name: 'funk' })} className={view.funkNew ? 'has-new' : ''}>
          Funk {view.funkNew > 0 && <span className="new-pill">{view.funkNew} neu</span>}
        </button>
        <button onClick={() => go({ name: 'akte' })}>Agentenakte</button>
        <button onClick={() => go({ name: 'badges' })}>Abzeichen ({Object.keys(p.badges).length})</button>
        <button onClick={() => go({ name: 'wardrobe' })} className={view.freshItems ? 'has-new' : ''}>
          Garderobe {view.freshItems > 0 && <span className="new-pill">Neu {view.freshItems}</span>}
        </button>
        <button onClick={() => void toggleSound()}>Sound: {p.settings.sound ? 'an' : 'aus'}</button>
        <button onClick={() => void toggleFlow()} title={FLOW_HINT}>
          {flowLabel(p.settings.flow)}
        </button>
        <button onClick={() => void toggleBlind()} title={BLIND_HINT}>
          {blindLabel(p.settings.blind, hasBrille)}
        </button>
        <span className="nav-right">
          <ExternalLink href={REPO_URL}>{HELP_LINK_LABEL}</ExternalLink>
          <button className="quiet" onClick={() => go({ name: 'credits' })}>
            Credits
          </button>
          <button className="quiet" onClick={logout}>
            Profil wechseln
          </button>
        </span>
      </nav>

      {incoming && (
        <button className="funk-toast" onClick={() => go({ name: 'funk', chat: incoming.chat })}>
          <SpeakerPic speaker={incoming.line.speaker} size={44} />
          <span className="funk-toast-text">
            <small>Neue Nachricht · {CHAT_TITLES[incoming.chat]}</small>
            <span>
              <b>{speakerName(incoming.line.speaker, vars)}:</b> {fill(incoming.line.text, vars)}
            </span>
          </span>
          <span className="funk-toast-go">Lesen</span>
        </button>
      )}

      {view.modules.map((m) => {
        const label = moduleLabel(story, m.id);
        return (
          <section key={m.id} className="mission-map">
            <h2>
              {label?.act} · {m.title} <small>{label?.place}</small>
            </h2>
            <ol className="missions">
              {m.lessons.map((l, i) => (
                <li key={l.id} className={`mission ${l.unlocked ? '' : 'locked'} ${l.mastered ? 'mastered' : ''} ${l.current ? 'current' : ''}`}>
                  <button disabled={!l.unlocked} onClick={() => void beginLesson(l.id)}>
                    <span className="m-num">{i + 1}</span>
                    <span className="m-title">
                      <b>
                        {l.title} {l.current && <kbd className="go">⏎</kbd>}
                      </b>
                      <span className="m-keys">{l.keys}</span>
                      {l.current && view.keyRule && <span className="m-rule">{view.keyRule}</span>}
                      {l.current && view.todo && <span className="m-todo">Noch zu tun: {view.todo}</span>}
                      {l.current && view.nextGift && <span className="m-gift">{view.nextGift}</span>}
                    </span>
                    <span className="m-status">
                      {l.unlocked ? (
                        <>
                          <Stars n={l.stars} />
                          {l.progress !== null && <Meter value={l.progress} label="Wie sicher die neuen Tasten sitzen" />}
                        </>
                      ) : (
                        <LockIcon />
                      )}
                    </span>
                  </button>
                </li>
              ))}
              <li className={`mission exam ${m.exam.open ? '' : 'locked'} ${m.exam.outcome === 'passed' ? 'mastered' : ''} ${m.exam.outcome === 'backdoor' ? 'unsure' : ''}`}>
                <button disabled={!m.exam.open} onClick={() => void beginExam(m.id)}>
                  <span className="m-num">!</span>
                  <span className="m-title">
                    <b>{examStory(story, m.id).title}</b>
                    <span className="m-keys">{m.exam.status}</span>
                  </span>
                  <span className="m-status">{!m.exam.open && <LockIcon />}</span>
                </button>
              </li>
            </ol>
            {m.moreSides && <p className="m-more">{moreSidesText(label?.act ?? '')}</p>}
            {m.done && (
              <div className="fallakte-link">
                <button onClick={() => go({ name: 'fallakte', moduleId: m.id })} className={m.fallakteNew && !m.fallakteScratched ? 'has-new' : ''}>
                  Fallakte {label?.act}
                  {m.fallakteScratched ? ` · ${SCRATCHED_LABEL}` : m.fallakteNew && <> <span className="new-pill">Neu</span></>}
                </button>
              </div>
            )}
            {view.storyEnd?.moduleId === m.id && (
              <>
                <ol className="missions">
                  <li className="mission">
                    <button onClick={beginTraining}>
                      <span className="m-num">∞</span>
                      <span className="m-title">
                        <b>
                          {TRAINING_CARD.title} <kbd className="go">⏎</kbd>
                        </b>
                        <span className="m-keys">{TRAINING_CARD.hint}</span>
                      </span>
                    </button>
                  </li>
                </ol>
                <div className="fallakte-link">
                  <button onClick={() => go({ name: 'ende' })}>{TRAINING_CARD.link}</button>
                </div>
              </>
            )}
          </section>
        );
      })}

      {view.extra.length > 0 && (
        <section className="extra-cases">
          <h2>
            Extra <small>Kleine Fälle – zählen als Training</small>
          </h2>
          <div className="arcade-cards">
            {view.extra.map((c) =>
              c.locked ? (
                <div key={c.id} className="arcade-card extra-card locked">
                  <b>
                    {c.title} <small>{CASE_LOCKED_LABEL}</small>
                  </b>
                  <span>{c.hint}</span>
                </div>
              ) : (
                <button key={c.id} className={`arcade-card extra-card ${c.solved ? 'solved' : ''}`} onClick={() => void beginCase(c.id)}>
                  <b>
                    {c.title} {c.solved && <span aria-label="gelöst">✓</span>}
                  </b>
                  <span>{c.hint}</span>
                </button>
              ),
            )}
          </div>
        </section>
      )}

      <section className="arcade-hall">
        <h2>
          Krümels Spielhalle <small>Freies Training mit deinen sicheren Tasten</small>
        </h2>
        {view.arcadeOpen ? (
          <div className="arcade-cards">
            {ARCADE_GAMES.map((g) => (
              <button key={g.id} className={`arcade-card arcade-card-${g.id}`} onClick={() => go({ name: 'arcade', game: g.id })}>
                <b>{g.title}</b>
                <span>{g.teaser}</span>
                <small>
                  Bestwert: {arcadeBest(p, g.id)}
                  {arcadeMedal(p, g.id) && ` · ${medalLabel(arcadeMedal(p, g.id)!)}`}
                </small>
              </button>
            ))}
          </div>
        ) : (
          <p className="muted arcade-locked">
            <LockIcon /> Öffnet sich, sobald du deinen ersten Auftrag geschafft hast.
          </p>
        )}
      </section>

      {welcome ? (
        <KruemelSays size={56} className="kruemel-tip welcome">
          <b>{hello.greeting}</b>
          <br />
          {hello.status}
          {enter && (
            <>
              <br />
              {hello.offer}
            </>
          )}
          <span className="welcome-actions">
            {enter && (
              <button className="primary" onClick={enter}>
                Los geht&apos;s <kbd className="go">⏎</kbd>
              </button>
            )}
            <button className="quiet" onClick={dismissWelcome}>
              Später
            </button>
          </span>
        </KruemelSays>
      ) : (
        <KruemelSays size={56} className="kruemel-tip">
          {tip}
        </KruemelSays>
      )}
    </div>
  );
}
