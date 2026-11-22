# Wegweiser: Wo finde ich was?

Vor dem Hinzufügen von Code kurz nachsehen, ob es das schon gibt. Wer Code verschiebt, benennt oder ersetzt, zieht die Zeile hier im selben Schritt nach. Die Regeln dazu stehen in [AGENTS.md](../../AGENTS.md), der Aufbau der Schichten in [Architektur](architektur.md), die Tests in [Tests](tests.md), die Pipeline in [Pipeline](pipeline.md), die Grafik in [Grafik-Pipeline](assets.md) und [Grafik-Stil](../design/grafik.md).

## Tippen und Tasten

| Bedarf | Schon vorhanden |
| --- | --- |
| Tastatureingabe zum Tippen | `ui/hooks/useTypingInput` |
| Übungstext rollt mit der Schreibmarke (Roll-Regel, Hook) | `nextScrollTop`, `lineTopOf`, `cutBelow` (`ui/components/textScroll.ts`), `useTextScroll` (`ui/hooks/useTextScroll.ts`), `.text-scroll` in `TypingPanel`; Anordnungen in `ui/styles/typing.css` (Klassen `typing-phase`, `with-side`, `.screen-side`) |
| Profil-Sicherungen für die Browser-Tests (Akt 7, nach dem Finale) | `buildFixtures` (`src/test/finalFixtures.ts`), `npm run e2e:fixture` (`scripts/e2e/fixtures.ts`), Dateien in `e2e/fixtures/`, `loadBackup` (`e2e/helpers.ts`) |
| Enter/Esc auf einem Bildschirm | `ui/hooks/useKey` (mit Doppel-Enter-Schutz; `rearm`, wenn Enter auf derselben Seite plötzlich etwas Neues tut) |
| Takt/Animation, einmaliges Warten | `ui/hooks/useTimer` (`useInterval`, `useAnimationFrame`, `useTimeout`) |
| Einmal handeln, sobald ein Zustand eintritt (Speichern bei Rundenende, `onDone`) | `ui/hooks/useOnRise` – statt `useEffect` mit `eslint-disable` |
| Antworten per Ziffern/Pfeilen wählen | `ui/hooks/useChoiceKeys` (mit `repeat`- und Doppeldruck-Schutz) |
| Tastenton zu jedem Anschlag | `ui/hooks/usePressSound` |
| Neuester Handler für einen Listener | `ui/hooks/useLatest` |
| Feststelltaste-Hinweis, Ziffernblock-Hinweis | `capsLock`/`numpad` aus `useTypingInput` + `CapsLockHint`/`NumpadHint` (`ui/components/TypingPanel.tsx`), Text `NUMPAD_HINT` (`content/texts/mission.ts`) |
| Hand eines Fingers, Grundstellungstaste (A S D F / J K L Ö, Daumen: Leertaste) | `handOf`, `homeKeyOf`, `HOME_KEYS` (`domain/keyboard.ts`) |
| Tastendruck in einem Ablauf | `applyKey` in `domain/typing.ts` (dazu `liveAccuracy`) |
| Bildschirmtastatur mit allen Tasten (Story, Chat) | `Keyboard` ohne `learned` |
| Lerneinheit eines Zeichens (Großbuchstabe A–Z → Umschalttaste, Ä Ö Ü → „Große Umlaute“, sonst das Zeichen), Kennungen `SHIFT_LEFT`/`SHIFT_RIGHT`/`UMLAUTE_GROSS` im Tastenprofil | `learnKey`, `learnKeys`, `charsOf`, `isShiftKey`, Umschalt-Einheit oder große Umlaute `isCapitalUnit`, `isCapitalLetter`, `isCapitalUmlaut` (`domain/keyboard.ts`); Siegel, Fortschritt, Generator und Anzeige zählen über sie |
| Tastensiegel, Live-Werte beim Tippen | `sealOf`/`sealsFor`, `blockingLatch` (welcher Riegel bremst), `sealScore`, gemerkte Riegel mit Schließschwelle `applyLatched`, fehlende Treffer `hitsToOpen` (`domain/mastery.ts`), Abgleich beim Laden `updateLatches` (`domain/progress.ts`), `liveSeals` (`domain/mission.ts`), `KeySeals` (`ui/components/`); `LessonStatus.keys` sind Siegel |

## Abläufe

| Bedarf | Schon vorhanden |
| --- | --- |
| Übungs- und Einsatz-Text erzeugen (Gewichte, Nachsteuerung, Satzzeichen an Wörtern, Großbuchstaben am Einheitenanfang), Satzzeichen erkennen | `generateText`, `charWeights`, `usableWords`, `PUNCTUATION`, `isPunctuation`, Wort-Zeichen (Apostroph) `WORD_ONLY`, `isWordOnly`, Ziffern der Zahlengruppen `DIGITS`, `isDigit`, Sonderzeichen der Alt-Gr-Ebene `SPECIAL`, `isSpecial`, Großschreibung am Einheitenanfang `CAPITAL_UNIT_FACTOR` (`domain/textGenerator.ts`); Einsatz-Text `examTyping` (`domain/examRun.ts`, `ExamCriteria.keys`, Fehlermodus des Einsatzes `ExamCriteria.mode`) |
| Spielhallen-Gerüst (Tasten, Start, Phase, Töne) | `features/arcade/useArcadeRun` + `ArcadeFrame` |
| Level, Medaille, nächstes Ziel, Startlevel eines Spielhallen-Spiels | `medalFor`, `nextGoal`, `startLevels`, `levelsDone`, `betterMedal` (`domain/arcade/levels.ts`), Schwellen und Wörter je Spiel in `content/arcadeGames.ts` |
| Prozent, Ergebnis, Tastenname in Sätzen `keyName` (Satzzeichen und Sonderzeichen ausgeschrieben), Beschriftung in Listen und Chips `keyLabel` (Satzzeichen und Sonderzeichen selbst), Fingerhinweis `describeKey`, Finger zur Taste `fingerOf`/`keyWithFinger` (Klammer-Angabe in Ratgeber-Sätzen), Finger-Regel `keyRuleText`, Krümels Rat, Sekunden, Datum, Regelsatz der Siegel | `domain/format.ts` (`formatSeconds`, `formatDate`, `lessonRuleText` …) |
| Spieltage zählen, Tage seit der letzten Runde (Begrüßung im HQ: `s.welcome`, `WELCOME_AFTER_DAYS` über `GameRules`, Text `welcomeText`) | `countDay`, `dayKey`, `daysAway` (`domain/days.ts`) – keine Serie, nichts, was man verlieren kann (Story-Regel 11) |
| Modul geschafft, Einsatz begonnen/gespielt | `isModuleDone`, `examBegun` (Intro gesehen), `examAttempted` (Ergebnis steht) in `domain/progress.ts` |
| Übung, Einsatz, Spielhallen-Runde auswerten, Hintertür nehmen | `recordExercise`, `recordExam`, `recordArcade`, `takeBackdoor` mit `Reward` (`domain/record.ts`; die Abfragen dazu bleiben in `domain/progress.ts`) |
| Durchgang auswerten, Nachbesprechung | `runInfo`, `showsSeals`, `debriefNext` (`domain/mission.ts`), `evaluateRun` (`domain/story.ts`) |
| Gültige Zeitmessung eines Anschlags (vorhanden, größer 0, keine Pause über 3 s) | `isTimed` (`domain/keyStats.ts`); Tastenprofil (`updateKeyStat`) und Hast-Muster im Rundenhinweis nutzen sie |
| Fehlerart je Anschlag (`MissHow`, `missKind`, `strokeHow`, falsche Umschalt-Hand als `shift`; an den Umschalt-Einheiten zählt jeder Großbuchstabe mit bekannter Hand, die richtige als `fine`, damit das Muster verblasst), gleitende Anteile je Lerneinheit im Tastenprofil (`KeyStat.how`/`howSamples`, gepflegt von `updateKeyStat`; Migration `keyStatOf`) und die häufigste Bewegung (`dominantHow`: ab vier gezählten Anschlägen mit Art, Anteil ab 0,5) | `domain/movement.ts`; Satz `movementText` (`content/texts/akte.ts`), View `movementTexts` (`app/views/akte.ts`), Anzeige in der Akte |
| Rundenhinweis (falsche Umschalt-Hand ab zwei, sonst welche Taste ging daneben, ab zwei Fehlern, mit Fehlerart `missKind` (`domain/movement.ts`) ab zwei gleichen; dann Muster Wortanfang, Hast, derselbe Finger je ab drei Fehlern und mindestens der Hälfte; Streuung ab drei) | `roundReview` (`domain/roundReview.ts`, im Reducer als `RoundDone.review`), `mirrorFinger` (`domain/keyboard.ts`), Satz `roundAdvice` (`domain/format.ts`), Anzeige im Zwischen-Panel (`Mission`) und in `LessonCheck` |
| Abgerutschte alte Taste in der Nachbesprechung (Riegel „Genau“ vorher offen, nachher zu) | `slippedSeal` (`domain/mastery.ts`), `slippedOldKey` (`domain/progress.ts`), Satz `slippedAdvice` (`domain/format.ts`), Anzeige in `LessonCheck` |
| Krümels Tipps nach Thema, Rundenüberschrift „Spezialtraining: K Ö S“ | `KRUEMEL_TIPS`, `tipsFor`, `roundLabel` (`content/texts/mission.ts`), Hook `useKruemelTip`; Knopf „Spezialtraining (K Ö S)“ `trainingButtonLabel` (`app/views/exam.ts`) |
| Briefing schon gesehen? (Finger-Regel auf der Missionskarte `hqView.keyRule`) | `briefingSeen` (`app/navigation.ts`) |
| Trainingstasten, direkt zum Einsatz | `examTraining`, `caseTrainingKeys`, `examNext`, Bennos Tippstunde `tippstundeTraining` (`domain/progress.ts`), Store-Aktion `beginTraining`, Texte `TRAINING_CARD` (`content/texts/ende.ts`) |
| Trainingsrunde erkennen (Spezialtraining, Extra-Fall, Tippstunde zählen gleich) | `isTrainingKind` (`domain/profile.ts`) |
| Szenen und Fälle des Trainings (Tippstunden-Szenen, Fälle der Woche) | `TRAINING` (`content/story/training/`, Typ `TrainingContent` in `content/story/types.ts`), eingereiht in `scenesOf`, `EXTRA_CASES`, `storyOf` (`content/story/acts.ts`) |
| Sätze aus der Geschichte als Tippmaterial (Tippstunde), Anteil im Text | `storySentences` (`domain/storyText.ts`), `GeneratorInput.sentences`, `SENTENCE_SHARE` (`domain/textGenerator.ts`) |
| Eigene Entwicklung in der Nachbesprechung der Tippstunde (Stand aus Akt 1) | `trainingDebrief` (`app/views/training.ts`), `ProgressSince` (`ui/components/`) |
| Zuletzt begonnener Auftrag (Extra-Fälle, Wärmekarte) | `begunLessonId` (`domain/progress.ts`) |
| Lehrplan-Abfragen | `domain/course.ts` (`findLesson`, `keysUpTo`, `allWords` …) |
| Story-Bildschirm ansteuern | `storyScreen(ref, then)` in `app/navigation.ts` |
| Spielende: Texte und HQ-Karte des Endes | `storyEnd(p, course)` (`domain/progress.ts`), `STORY_END_TEXTS`, `TRAINING_CARD` (`content/texts/ende.ts`) |
| Weg mit „beim ersten Mal“ (Briefing, Einsatz-Intro, Szene nach dem Einsatz), Knöpfe am Ende des Funks | `briefingRoute`, `examRoute` (liefern `{ screen, save? }`), `afterExamScreen`, `chatEnd` (`app/navigation.ts`) |

## Story und Chat

| Bedarf | Schon vorhanden |
| --- | --- |
| Story-Zeilen aufschreiben (Chat und Bilderbuch) | `content/story/builders.ts`: Sprecher (`ada`, `kr`, `jun`, `bar`, `hub`, `erz`, `unb`, `tip`, `ben`, `sys`; korrigierte Nachricht Tippis mit `tip(text, { strike })`), Antworten `ans`, andere Chats `inChat`, Knöpfe „Zur Garderobe“/„Später“ `wardrobeChoices`, Post des Diebs `goldCard`; Beschreibung eines Dings zitieren mit `itemDescription` (`content/items.ts`) |
| Emoji im Funk: erlaubte Emoji je Sprecher, Reserve, Positivliste; in Tests die gefundenen Emoji einer Zeichenkette | `content/story/emoji.ts` (`EMOJI_BY_SPEAKER`, `EMOJI_RESERVE`, `EMOJI_ALLOWED`, ADR-0006); `emojisIn`, `hasEmoji` in `src/test/emoji.ts` |
| Gegenstimme des Einsatzes (Baron oder Lautsprecher) | Feld `ExamStory.voice` (`domain/book.ts`), `LoudspeakerPic` (`ui/pixel/Pixel.tsx`), gezeichnet in `features/exam/Exam.tsx` |
| Bilderbuch-Zeilen, Einsatz-Story, Modul-Beschriftung | `storyLines`, `examStory`, `moduleLabel`, `fallakte`, `fallaktenScratched` (zerkratzte Fallakten aus dem Story-Log; Texte der Kratzer und Krümels Zeile in `content/texts/fallakte.ts`) (`domain/book.ts`, über das Bündel `s.story`) |
| Story-Platzhalter | im Bildschirm `useStoryVars()` (`ui/app/game.ts`), sonst `storyVars` (`app/views/common.ts`); `fill`/`fillLine` in `domain/dialog.ts` |
| Wochentag, Tageszeit, Bäckerei offen in der Story (`{jetzt}`, `{gruss}`, Zeilen mit `ifTime`) | `timeOf`, `timeVars`, `matchesTime` (`domain/daytime.ts`); im Bildschirm `useStoryTime()` (liest die Uhr einmal) und `time` in `LineContext`; Chat-Verlauf `chatHistory(…, time)` |
| Szene suchen (nach ID, nach Auslöser), steht sie im Log? | `findScene`, `sceneFor`, `isLogged` (`domain/scenes.ts`; `domain/story.ts` reicht nichts weiter) |
| Szene auslösen, Nebenszene wählen, Lesestand | `dueScenes`, `nextSideScene`, `logScenes`, `markRead`, `pick`, `unread` (`domain/story.ts`); im Store `withStory` (nicht selbst loggen) |
| Chatverlauf, Abspielen einer Szene | `chatHistory`, `playStart`/`playReducer`, `typingMs`, `lineTypingMs` (mit durchgestrichenem Teil) (`domain/chat.ts`), `Chat` + `FunkScreen` |
| Wie viele Nachrichten ein Chat zeigt („Frühere Nachrichten“, Stelle halten), gemerkte Blase | `HISTORY_PAGE`, `Chat`, `Bubble` (`memo`) in `ui/components/Chat.tsx`; stabiler Verlauf und stabile Platzhalter in `features/funk/FunkScreen.tsx` |
| Neue Nachricht (Benachrichtigung im HQ), Vorschau in der Chatliste | `incomingMessage`, `chatPreview` (`domain/chat.ts`), `hqView.incoming`, `funkChats` (`app/views/funk.ts`); Ton `sfx('message')` |
| Kleines Gesicht einer Figur (Chat, Benachrichtigung) | `SpeakerPic` (`ui/components/Characters.tsx`, Ada, Krümel, Baron, Benno (`BENNO`: der Baron ohne Hut und Monokel), Juna, Frau Hubbel, Spielfigur; ohne Bild das Kürzel, z. B. Tippi); Bild je Chat `CHAT_FACES` (`content/texts/funk.ts`) |
| Karte oder Gadget in einer Chat-Nachricht | Zeilenfelder `card` (mit `look: 'goldcard'` für die Post des Diebs) und `item` (Gadget-ID, zeigt `GadgetIcon`) |
| Wann die nächste Szene eines Auftrags kommt | `nextStageAt` (`domain/story.ts`), Text `nextSceneHint` (`content/texts/mission.ts`) |
| Story-Objekt eines Auftrags | `stageAt`/`objectOf`/`objectPercent` (`domain/storyObject.ts`), `StoryObject` (`ui/components/`, auch Ausweis `idcard`, Ortruds Schlüsselkarte `look: 'schluesselkarte'`, Goldrand-Karte `look`, gezeichnete Tinte `marks`, Tintenkleckse `INK_BLOT` in Zeilen, Kleingedrucktes `finePrint`); Bilder über `PictureId` und `StoryPicture` (`ui/pictures/StoryPicture.tsx`, Tabelle aller Story-Bilder `PICTURES` in `ui/pictures/pictures.tsx`); Adas Brezel `Brezel` (`ui/pictures/StoryPicture.tsx`); die Bilder je Akt in `ui/pictures/` (`akt1.tsx`, `akt2.tsx`, `akt3.tsx`, `akt4.tsx`, `akt5.tsx`, `akt6.tsx`, `akt7.tsx`, `cases.tsx`); in der Nachbesprechung verborgen, wenn der Chat die Stufe gleich zeigt (`objectShownLater`) |

## Belohnungen und Dinge

| Bedarf | Schon vorhanden |
| --- | --- |
| Belohnungen anzeigen (Rang, Rekord, Abzeichen, überreichte Dinge, „unterwegs“) | `RewardSummary` in `ui/components/common.tsx`; überreichte Dinge `received` aus dem Store, getrennt mit `receivedItems` (`domain/items.ts`), wartendes Geschenk `giftWaiting` (`app/views/common.ts`) |
| „Agentin“/„Agent“, Rang in passender Form | `agentTitle(profil oder geschlecht)` in `domain/profile.ts`, `rankName` in `domain/rewards.ts`; in Story-Texten `{agent}` und `{rang_<key>}` |
| Rang, nächster Rang, EP-Leiste, Bestwert Spielhalle, Abzeichen suchen | `rankFor`/`nextRank`/`rankProgress` (`domain/rewards.ts`), `arcadeBest` (`domain/progress.ts`), `findBadge` (`domain/badges.ts`) |
| Geheime Abzeichen verbergen | `isBadgeHidden` (`domain/badges.ts`), `badgeTitleFor` (`content/texts/badges.ts`) |
| Belohnungstakt: höchstens ein Geschenk je Durchgang | Szenen mit `gift` (Vorrang = Reihenfolge von `SCENES` in `content/story/acts.ts`), stillgelegt `retired`; `dueScenes(…, { gift })` nur am Durchgangsende (`recordRound` mit `run.last`, `recordExam`), `catchUp` ohne Bremse; wartende `pendingGifts` (`domain/story.ts`), `pendingGiftItems` (`app/views/common.ts`) und Missionskarte `hqView.nextGift` (`app/views/hq.ts`); Besitz nur über `gives` (`ownedItems`), was überreicht wurde `received` (Store), Anzeige `receivedItems` |
| Woher ein gesperrtes Ding kommt | `sourceHintsFor` (`app/views/common.ts`, einmal je Ansicht bauen; nennt unterwegs, Abzeichen, Fall oder Moment der Geschichte), Texte `sourceHint`/`sceneMomentText` (`content/texts/items.ts`) |
| Besitz eines Gadgets oder Kleidungsstücks | `ownedItems` (`domain/items.ts`); Zeilen nach Besitz (`needs`) und früheren Antworten (`ifPicked`) filtern mit `availableLines` und `LineContext` (`domain/dialog.ts`) |
| Extra-Fälle | `caseVisible` (dran, Gadget egal), `caseAvailable`, `solveCase` (`domain/cases.ts`), `caseCardHint` (`content/texts/hq.ts`)/`sourceHint` (`content/texts/items.ts`); Store: `beginCase`, `finishCase` |

## Garderobe

| Bedarf | Schon vorhanden |
| --- | --- |
| Garderobe (Farben, Teile, Start-Avatar) | `s.wardrobe` (`WardrobeCatalog`, `domain/wardrobe.ts`), alle Teile `wardrobeItems`, Farbpakete `colorPacks`/`colorPackOf`; was man wählen darf `wearable`, Warnung bei nur Getragenem `onlyWhileWorn`; Editor `AvatarEditor` (Reiter, Kacheln); Figur zeichnen `AvatarPic` (auch `legs`, Blickrichtung `facing`), drehen mit `TurnButtons` und `turn` (`ui/lpc/compose.ts`); deutsche Farbnamen `COLOR_NAMES` |

## Bildschirme und Grafik

| Bedarf | Schon vorhanden |
| --- | --- |
| Zurück-Knopf | `BackButton` (Esc verdrahtet jeder Bildschirm selbst mit `useKey`) |
| „Krümel sagt …“-Kasten | `KruemelSays` (`ui/components/`) |
| Tempokurve | `TempoChart` (`ui/components/`) |
| Datei zum Herunterladen anbieten, Akte als Sicherung herunterladen | `downloadFile`, `downloadBackup` (`ui/download.ts`) |
| Nebenaktion als ruhiger Knopf (`button.quiet`), Link nach draußen (`ExternalLink`, `a.quiet` mit gezeichnetem „neuer Tab“-Zeichen) und seine Adresse | Klasse `quiet` (`ui/styles/base.css`), `ExternalLink` (`ui/components/`), `REPO_URL`, `HELP_LINK_LABEL` (`content/texts/shell.ts`); unterstrichene Textlinks gibt es nicht mehr (Architektur-Test) |
| Rückfrage vor dem Löschen einer Akte (Codename tippen) | `ConfirmDelete` (`ui/components/`), `codenameMatches` (`domain/profile.ts`); benutzt von Startseite (Verwaltungsmodus) und Agentenakte |
| Reiter (Garderobe, Akte) | `Tabs` (`ui/components/`, WAI-ARIA mit Pfeiltasten) |
| Pixelgrafik zeichnen (Kulisse, Gadget, Story-Bild) | Stilregeln in `docs/design/grafik.md` („Kulissen“, „Eigene Bilder“); Bausteine `fromMap`, Zeichen-Karte mit Palettennamen `fromPalette` (Legende `Legend`), `rect`, `disc`, `stairs` (gerade Linie als Treppe), `shift` (Karte verschieben, auch Überlagerung), `patch` (Stufe eines Stufenbilds: Grundkarte plus ersetztes Rechteck) (`ui/pixel/pixelMap.ts`), Stufenbild als Fallbild `StagePic` und Stufe `Level` (`ui/pictures/akt2.tsx`), Palette `PALETTE`/`COLORS`/`FAMILIES`, Tinte `INK`, Konturfarbe `OUTLINE` (`ui/pixel/palette.ts`), Bildarten mit fester Größe `PICTURE_KINDS`/`kindOfSize` (`ui/pixel/pictureKinds.ts`; `Grid` mit `kind` setzt Größe und Klasse `pic-<art>`), Prüfung eines Bildes `pictureProblems` (`ui/pixel/pictureCheck.ts`), alle registrierten Bilder `registeredPictures` (`ui/pictures/registry.ts`; auch die Symbole Schloss `LockIcon` und Lautsprecher `LoudspeakerPic` aus `ui/pixel/Pixel.tsx`), Gadget-Symbole `ICONS` (`ui/components/gadgetIcons.ts`), Porträts der Verdächtigen `PORTRAIT_PICTURES`, ihre Karten `PORTRAITS` (`ui/pictures/portraits.tsx`; jeder Verdächtige einer Fallakte braucht eins, `Suspect.picture` in `domain/book.ts`), Bogen zum Anschauen `npm run pictures:sheet`, lesbare 5×5-Buchstaben (`ui/pixel/glyphs.ts`), Zeichnen mit `Grid`/`Rects` (`ui/pixel/Pixel.tsx`; `Grid` zeigt die Karte als ein `<image>` mit der Adresse `pixelImageUrl` aus `ui/pixel/pixelImage.ts`, `inlineImages` setzt sie für Prüfungen wieder in Rechtecke ein, Testhilfe `rectsIn` in `src/test/pixelRects.ts`; Unschärfe über `style` an `Grid`; blinkende Lämpchen: `Rects` mit `className="led"`); Kacheln aus LPC-Paketen: in Kulissen `Prop` (Mitte, Unterkante) und `Mehlsack` (Kachel mit Aufschrift) in `ui/pixel/sceneProps.tsx`, `Tile` (linke obere Ecke) und als Story-Bild die Bildart „Kachel“ `TilePicture`/`TilePic` (`ui/pixel/Tile.tsx`), Größen in `PROP_SIZES` (`ui/pixel/propSizes.ts`), Herkunft in `public/assets/props/QUELLEN.md` (Weg: `docs/technik/assets.md`) |
| Gemeinsamer Pixelmaßstab | `--px` (gesetzt von `usePixelScale` in der Schale, berechnet mit `pixelScale` in `ui/pixel/stage.ts`); Größen im Bilderbuch in `--px` ausdrücken |
| Akte-, HQ-, Garderoben-Ansicht | `akteView` (mit Teil `parent` für den Elternbericht, Sätze `parentTexts` (`content/texts/akte.ts`), Komponente `features/akte/ParentReport`), `hqView` (mit Missionskarte), `wardrobeView`/`dressingView`, `funkChats`, `fallakteView`, je in `app/views/<bildschirm>.ts` |
| Wärmekarte der Akte | `accuracyHeat`/`heatScale`/`HEAT_MID`, `shakyKeys` (`domain/mastery.ts`), `heatColor` (`ui/components/heat.ts`), `HeatLegend` (`ui/components/`), `shakyKeysText` (`content/texts/akte.ts`) |

## Texte

| Bedarf | Schon vorhanden |
| --- | --- |
| Krümels Tipp (HQ, Mission) | `useKruemelTip` (`ui/hooks/`), Tipps `KRUEMEL_TIPS` (`content/texts/mission.ts`), Auswahl `kruemelTip` (`domain/format.ts`) |
| Rundenüberschrift, Einsatz-Status, -Ziel und -Grund des Scheiterns, Agententage, kaputte Akten, Lade-/Speicherhinweise | `content/texts/` (`mission.ts`: `roundLabel`; `exam.ts`: `examStatusLabel`, `examGoalText`, `examFailReason`; `hq.ts`: `daysLabel`; `shell.ts`: `brokenProfilesText`, Lade-/Speicherhinweise); statische Beschriftungen bleiben im JSX |
| Fehlermodus (Pflicht-Korrektur oder Fluss), Flow-Chip | `ErrorMode` (`domain/typing.ts`), Modus der Übungsrunden aus `settings.flow` in `learnerOf` (`domain/mission.ts`; Einsätze legen ihn selbst fest, `domain/examRun.ts`); Store: `toggleFlow`; Texte `flowLabel`, `FLOW_HINT` (`content/texts/hq.ts`), `FLOW_BADGE` (`content/texts/mission.ts`) |
| Blindflug (Bildschirmtastatur ausblenden) | `Settings.blind` (`domain/profile.ts`), Store: `toggleBlind`; `showKeyboard` von `TypingPanel` in `features/mission/Mission.tsx` (gilt je Runde); Gadget-ID `BLIND_GADGET`, Texte `blindLabel`, `BLIND_HINT` (`content/texts/hq.ts`), `blindNote`, `blindPending` (`content/texts/mission.ts`; die Zeile „ab der nächsten Runde“ zeigt `TypingPanel` über `notice`; der Umschalter wirkt sofort, solange `scored` leer ist) |
| Name und Kürzel einer Figur | `speakerName(speaker, vars)`, `SPEAKER_NAMES`, `SPEAKER_INITIALS` (`content/texts/speakers.ts`) |
| Hinweis unter einer Auswahl | `CHOICE_HINT` (`content/texts/funk.ts`) |
| Neuer Oberflächentext, der aus einem Zustand entsteht | eine Datei je Thema in `content/texts/` (`speakers`, `funk`, `mission`, `exam`, `hq`, `akte`, `items`, `badges`, `wardrobe`, `shell`, `ende`); jeder Importeur nennt die Themendatei (keine Sammeldatei), Bildschirme dürfen den ganzen Ordner lesen (`CONTENT_FOR_SCREENS`) |

## Tests

| Bedarf | Schon vorhanden |
| --- | --- |
| Test-Profile, Anschläge, Tastenwerte, Story-Log, Mini-Kurs, Kriterien, feste Uhr, Spielabläufe, App rendern | `src/test/`: `profile`, `strokes`, `keyStat`, `storyLog`, `rewarded` (Abzeichen samt überreichender Meldung), `mastered`, `TEST_COURSE`/`TEST_RULES`, `TEST_MASTERY`, `T0`/`DAY`, `fixedEnv`, `cleanTyping`/`playRun`/`playUntilOwned`, `giftsInLog`, `mainSceneIds` (`scenario.ts`), `renderApp`; Story-Zeilen mit `kr`, `ada` … aus `builders.ts` |
