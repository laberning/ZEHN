// Ein Auftrag: Aufwärmen + Übungsrunden (oder 1 Spezialtraining), danach Nachbesprechung.
// Der Ablauf ist domain/mission.ts (Reducer); dieser Bildschirm leitet Tasten weiter, speichert über den Store und zeichnet.

import { useReducer, useState } from 'react';
import { sideHint } from '../../content/texts/funk.ts';
import { BLIND_GADGET, BLIND_HINT, FLOW_HINT, blindLabel } from '../../content/texts/hq.ts';
import { TRAINING_CARD } from '../../content/texts/ende.ts';
import { FLOW_BADGE, blindNote, blindPending, nextSceneHint, roundLabel } from '../../content/texts/mission.ts';
import { funkScreen, type Screen } from '../../app/navigation.ts';
import { nextStageAt } from '../../domain/story.ts';
import { findScene } from '../../domain/scenes.ts';
import { sceneSender } from '../../domain/chat.ts';
import { ownedItems } from '../../domain/items.ts';
import { keysUpTo, findLesson } from '../../domain/course.ts';
import { formatResult, roundAdvice, sealAdvice } from '../../domain/format.ts';
import { sealsFor } from '../../domain/mastery.ts';
import { currentRound, debriefNext, learnerOf, objectShownLater, liveSeals, missionReducer, missionStart, planRounds, roundTyping, runInfo, showsSeals, summarizeRewards, type DebriefNext, type Round, type Training } from '../../domain/mission.ts';
import { trainingDebrief } from '../../app/views/training.ts';
import { findCase } from '../../domain/cases.ts';
import { lessonStatus, slippedOldKey } from '../../domain/progress.ts';
import { useActions, useGame, useProfile, useStoryVars } from '../../ui/app/game.ts';
import { objectOf, objectPercent } from '../../domain/storyObject.ts';
import { StoryObject } from '../../ui/components/StoryObject.tsx';
import { GadgetIcon } from '../../ui/components/GadgetIcon.tsx';
import { StoryPicture } from '../../ui/pictures/StoryPicture.tsx';
import { LessonCheck } from '../../ui/components/LessonCheck.tsx';
import { ProgressSince } from '../../ui/components/ProgressSince.tsx';
import { KeySeals } from '../../ui/components/KeySeals.tsx';
import { KruemelSays } from '../../ui/components/KruemelSays.tsx';
import { TypingPanel } from '../../ui/components/TypingPanel.tsx';
import { BackButton, RewardSummary, Stars } from '../../ui/components/common.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';
import { useKruemelTip } from '../../ui/hooks/useKruemelTip.ts';
import { useOnRise } from '../../ui/hooks/useOnRise.ts';
import { useTypingInput } from '../../ui/hooks/useTypingInput.ts';

export function Mission({ lessonId, training }: { lessonId: string; training?: Training }) {
  const p = useProfile();
  const rules = useGame((s) => s.rules);
  const story = useGame((s) => s.story);
  const object = objectOf(story.objects, lessonId);
  const percent = objectPercent(p.lessons[lessonId]);
  // Wann die nächste Szene kommt – in der Nachbesprechung (beim Tippen lenkt es ab); Extra-Fälle und Training bringen keine Stufen
  const nextHint = training ? null : nextSceneHint(nextStageAt(story, lessonId, p.lessons[lessonId]?.best ?? 0, p.lessons[lessonId]?.mastered ?? false));
  const vars = useStoryVars();
  const { go, beginTraining, recordRound, continueAfterMastery, toggleBlind, finishCase, seed } = useActions();
  // Beim Start festhalten: Länge des Story-Logs und ob der Auftrag noch offen war (die Auswertung hängt am letzten recordRound)
  const [run] = useState(() => runInfo(p, rules.course, lessonId, training));
  const [learned] = useState(() => new Set(keysUpTo(rules.course, lessonId)));
  const { module, lesson } = findLesson(rules.course, lessonId);
  const label = (r: Round) => roundLabel(r, lesson.title);

  const [s, dispatch] = useReducer(missionReducer, undefined, () => {
    const rounds = planRounds(rules.course, lessonId, training);
    return missionStart(rounds, roundTyping(rules.course, lessonId, rounds[0]!, learnerOf(p), seed(), story), p.stats, p.latches);
  });
  // Blindflug gilt je Runde (`blind`). Der Umschalter wirkt sofort, solange in der Runde noch nichts getippt ist (dann springt
  // nichts, was das Kind schon liest); sonst ab der nächsten Runde, und eine Zeile sagt es. Zwischen zwei Runden zeigt der
  // Bildschirm die fertige Runde, `blind` wird erst mit `next` nachgezogen.
  const hasBrille = ownedItems(p, story).has(BLIND_GADGET);
  const [blind, setBlind] = useState(p.settings.blind);
  const round = currentRound(s);
  const untouched = s.phase === 'typing' && s.typing.scored.length === 0;
  const switchBlind = () => {
    if (untouched) setBlind(!p.settings.blind);
    void toggleBlind();
  };
  const tip = useKruemelTip(lessonId);

  const { capsLock, numpad } = useTypingInput(s.phase === 'typing', (ch, now, o) => dispatch({ type: 'key', ch, now, shift: o?.shift }), s.typing.text.slice(s.typing.position));

  // Runde fertig getippt → speichern, Belohnung in den Ablauf geben
  const saving = s.phase === 'saving';
  useOnRise(saving, () => {
    void recordRound(lessonId, round.kind, s.typing, { ...run, last: s.index + 1 >= s.rounds.length }).then(({ story, ...reward }) => dispatch({ type: 'recorded', reward, story }));
  });

  const summary = summarizeRewards(s.done);
  const next = () => {
    setBlind(p.settings.blind);
    dispatch({ type: 'next', typing: roundTyping(rules.course, lessonId, s.rounds[s.index + 1]!, learnerOf(p), seed(), story) });
  };
  // Extra-Fall: statt der Nachbesprechung geht es in den Funk (Outro mit der Lösung)
  const caseId = training?.caseId;
  const caseDone = s.phase === 'debrief' && !!caseId;
  // Im Extra-Fall steht statt des Story-Objekts das Gadget, mit dem man ihn löst
  const extraCase = caseId ? findCase(story, caseId) : undefined;
  useOnRise(caseDone, () => void finishCase(caseId!, s.story));

  // Siegel der neuen Tasten – in Aufträgen und Extra-Fällen, nicht im Spezialtraining des Einsatzes
  const seals = showsSeals(training) ? liveSeals(s, lesson.newKeys, module.mastery, p.latches) : null;
  // „Noch eine Runde“: nach dem Spezialtraining zurück zum Einsatz, sonst derselbe Auftrag (auch aus dem Funk heraus)
  // Bennos Tippstunde: derselbe Bildschirm (aus dem Funk heraus mit den alten Tasten), der Knopf wählt die Tasten neu
  const tippstunde = training?.kind === 'tippstunde';
  const nextRound: Screen = tippstunde ? { name: 'mission', lessonId, training } : training ? { name: 'exam', moduleId: module.id } : { name: 'mission', lessonId };
  const again = () => (tippstunde ? beginTraining() : go(nextRound));

  // Nachbesprechung: wie es weitergeht, entscheidet der Kern; hier nur, wohin das führt
  const debrief = s.phase === 'debrief' ? debriefNext(summary, s.story, story) : null;
  const follow = (d: DebriefNext) => {
    switch (d.kind) {
      case 'story':
        return void continueAfterMastery(lessonId, d.open);
      case 'readOpen':
        return go(funkScreen(d.open, { name: 'hq' }, { again: nextRound }));
      case 'readSide':
        return go(funkScreen([d.side], { name: 'hq' }, { again: nextRound }));
      case 'again':
        return again();
    }
  };
  const debriefAction = debrief && (() => follow(debrief));
  // Enter = die Hauptaktion des jeweiligen Bildschirms, Esc = zurück ins HQ.
  // Ist der Auftrag gerade geschafft, führen beide weiter zur Story – sonst ginge sie verloren.
  const mastered = debrief?.kind === 'story';
  useKey('Enter', s.phase === 'between' ? next : debriefAction);
  useKey('Escape', mastered ? debriefAction : () => go({ name: 'hq' }));

  if (caseDone) return <div className="screen center muted">Fall abgeschlossen …</div>;

  if (debrief) {
    // Eine Nebenszene erscheint nur als Hinweis (Enter liest sie)
    const sideScene = debrief.kind === 'readSide' ? findScene(story, debrief.side) : undefined;
    const onNext = () => follow(debrief);
    return (
      <div className="screen center debrief">
        <div className="panel">
          {/* „Auftrag abgeschlossen“ erst, wenn der Auftrag geschafft ist; vorher steht darunter „Noch eine Runde!“ */}
          <h1>{tippstunde ? TRAINING_CARD.debriefTitle : training ? 'Training beendet' : summary.lessonJustMastered || p.lessons[lessonId]?.mastered ? 'Auftrag abgeschlossen' : 'Runde geschafft'}</h1>
          <Stars n={summary.stars} />
          <p className="big-num">+{summary.xp} EP</p>
          <RewardSummary reward={summary} />
          {tippstunde && <ProgressSince debrief={trainingDebrief(p, rules.course, s.done.at(-1)!.result)} />}
          {object && !training && !objectShownLater(s.story.open, story, lessonId) && <StoryObject object={object} percent={percent} vars={vars} big />}
          {object && nextHint && <p className="next-scene">{nextHint}</p>}
          {!summary.lessonJustMastered && !training && <LessonCheck status={lessonStatus(p, rules.course, lessonId)} before={sealsFor(s.runStartStats, lesson.newKeys, module.mastery, s.runStartLatches)} review={s.done.at(-1)?.review} slipped={slippedOldKey(p, rules.course, lessonId, s.runStartStats, s.runStartLatches)} />}
          {blind && <KruemelSays size={64}>{blindNote(hasBrille)}</KruemelSays>}
          {sideScene && (
            <p className="side-hint">
              {sideHint(sideScene.chat, sceneSender(sideScene))} – <kbd>⏎ Enter</kbd> liest
            </p>
          )}
          {debrief.kind === 'again' && !training && <p className="side-hint">{tip}</p>}
          <div className="row">
            {debrief.kind === 'story' ? (
              <button className="primary big" onClick={onNext}>
                Die Geschichte geht weiter … ⏎
              </button>
            ) : debrief.kind === 'readOpen' ? (
              <>
                <button className="primary big" onClick={onNext}>
                  Die Geschichte geht weiter … ⏎
                </button>
                <BackButton />
              </>
            ) : (
              <>
                <button className={sideScene ? 'big' : 'primary big'} onClick={again}>
                  {tippstunde ? TRAINING_CARD.again : training ? 'Zurück zum Einsatz ⏎' : 'Noch eine Runde ⏎'}
                </button>
                {sideScene && (
                  <button className="primary big" onClick={onNext}>
                    Lesen ⏎
                  </button>
                )}
                <BackButton label={tippstunde ? TRAINING_CARD.home : undefined} />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const last = s.done.at(-1);
  // Tippphase: der Bildschirm ist so hoch wie das Fenster, der Text rollt (typing.css). Mit Siegeln (Aufträge, Extra-Fälle)
  // steht auf quer-niedrigen Fenstern eine Seitenleiste neben dem Text; Tippstunde und Spezialtraining haben keine.
  const typingPhase = s.phase === 'typing' || s.phase === 'saving';
  const sealBar = seals && (
    <div className="seal-bar">
      {extraCase ? (
        <span className="case-gadget" title={extraCase.needs ? 'Dein Gadget für diesen Fall' : undefined}>
          <StoryPicture id={extraCase.picture} />
          {extraCase.needs && <GadgetIcon id={extraCase.needs} has title={story.items.find((i) => i.id === extraCase.needs)?.name} />}
        </span>
      ) : (
        object && <StoryObject object={object} percent={percent} vars={vars} />
      )}
      <KeySeals seals={seals} />
      <KruemelSays size={40} className="kruemel-say kruemel-hint">
        {sealAdvice(seals)}
      </KruemelSays>
    </div>
  );
  return (
    <div className={`screen mission-screen${typingPhase ? ' typing-phase' : ''}${typingPhase && seals ? ' with-side' : ''}`}>
      <div className="screen-side">
        <div className="mission-top">
          <BackButton />
          <button className="quiet blind-toggle" onClick={switchBlind} title={BLIND_HINT}>
            {blindLabel(p.settings.blind, hasBrille)}
          </button>
          {s.typing.mode === 'flow' && <span className="flow-badge" title={FLOW_HINT}>{FLOW_BADGE}</span>}
          <div className="round-dots">
            {s.rounds.map((r, i) => (
              <span key={i} className={i < s.index || (i === s.index && s.phase === 'between') ? 'done' : i === s.index ? 'now' : ''} title={label(r)} />
            ))}
          </div>
        </div>
        {s.phase !== 'between' && sealBar}
      </div>
      {s.phase === 'between' && last ? (
        <div className="between panel">
          <h2>{label(last.round)} geschafft</h2>
          <Stars n={last.reward.stars} />
          <p>{formatResult(last.result)}</p>
          {last.review && <p>{roundAdvice(last.review)}</p>}
          {blind && <p>{blindNote(hasBrille)}</p>}
          <button className="primary big" onClick={next}>
            Weiter ⏎
          </button>
        </div>
      ) : (
        <TypingPanel typing={s.typing} learned={learned} frame={label(round)} press={s.press} layoutHint={s.layoutHint} capsLock={capsLock} numpad={numpad} rings={seals ?? undefined} showKeyboard={!blind} notice={p.settings.blind !== blind ? blindPending(p.settings.blind) : undefined} />
      )}
    </div>
  );
}
