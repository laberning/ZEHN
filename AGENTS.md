# AGENTS.md – Arbeitsregeln für ZEHN

Diese Datei gilt für alle, die am Projekt arbeiten – Menschen und KI-Agenten. Sie hält fest, **wie** wir bauen, testen und dokumentieren. Hintergründe: [Architektur](docs/technik/architektur.md), [Tests](docs/technik/tests.md), [Grafik-Pipeline](docs/technik/assets.md), [Wegweiser durch den Code](docs/technik/wegweiser.md), [Pipeline](docs/technik/pipeline.md). Für Story-Texte: [Story-Regeln](docs/design/story-regeln.md).

## Projekt in einem Satz

„ZEHN – Agenten der Tastatur“: ein Browser-Lernspiel, in dem Kinder und Jugendliche (und alle, die mögen) das Zehn-Finger-Schreiben auf der deutschen QWERTZ-Tastatur lernen. Statische Web-App (React 19, TypeScript, Vite, Zustand, Dexie), alle Daten lokal im Browser.

## Sprache

- Spieltexte und Dokumentation: **Deutsch**. Bezeichner im Code: **Englisch**. Code-Kommentare: Deutsch oder Englisch. Commit-Nachrichten: **Deutsch** nach Conventional Commits (ADR-0008): Typ englisch (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `build:`, `ci:`), Betreff und Text deutsch, Betreff unter etwa 72 Zeichen, im Text das Warum; keine KI-Autor- oder Co-Autor-Zeilen.
- Spieltexte sind für 10-Jährige: kurz, humorvoll, ohne Fachbegriffe. Keine Gewalt; der Baron ist ein eitler Meisterdieb.
- Programmiersprache: **nur TypeScript** – auch Skripte (`scripts/`) und Konfigurationen (`*.config.ts`); kein `.js`, `.mjs` oder `.cjs`. Node 26 führt `.ts` direkt aus (`node scripts/lpc/build.ts`), ESLint lädt seine Konfiguration über `jiti`.

## Befehle

Voraussetzung: Node.js 26 (LTS; die Version steht in `.nvmrc`, `nvm use`), einmal `npm install`. Eine Pipeline auf GitHub Actions prüft jeden Stand und veröffentlicht `main` auf GitHub Pages ([Pipeline](docs/technik/pipeline.md)).

```bash
npm run dev          # Dev-Server (http://localhost:5173, auch im Netz erreichbar); F9 tippt eine Übungs- oder Einsatzrunde fehlerfrei zu Ende
npm test             # alle Unit- und Komponententests (~3 s)
npm run test:watch   # Tests im Beobachtungsmodus
npm run check        # Typprüfung + ESLint (0 Warnungen) + Tests mit Coverage-Schwellen (~10 s) – vor jedem Commit
npm run test:coverage
npm run e2e          # Playwright-Browser-Tests (Smoke und Layout, Chromium, ~2,5 min) – nur vor Meilensteinen
npm run build
npm run assets:lpc   # LPC-Grafiken neu erzeugen (nach Änderungen an scripts/lpc/parts.ts); danach Dev-Server neu starten
npm run ids          # neue gespeicherte IDs (Szenen, Antworten, Dinge …) in src/content/knownIds.ts eintragen; entfernt nie etwas
npm run pictures:sheet -- <ordner>  # Bogen aller eigenen Bilder (HTML + PNG) in einen Ordner außerhalb des Repositorys
```

## Architektur-Regeln

Muster: **Functional Core, Imperative Shell** mit **Ports & Adapters**; die Schale ist nach Features geschnitten.

| Schicht | Was hinein gehört | Darf importieren |
| --- | --- | --- |
| `src/domain/` | Regeln **und Abläufe** als reine Funktionen/Reducer | nur `domain/` |
| `src/content/` | Spielinhalte als Daten (Kurs, Story, Abzeichen, Garderobe …) | `domain/` |
| `src/app/` | Store-Fabrik mit Aktionen, Ports, Migration, Navigation, Ansichten je Bildschirm (`views/`) | `content/`, `domain/` |
| `src/platform/` | Adapter: Dexie, Memory, Web Audio, Browser-Umgebung | `app/`, `domain/` |
| `src/ui/` | geteilte Komponenten, Hooks, LPC-Rendering, Styles, Store-Context | `app/`, `content/`, `domain/` |
| `src/features/<name>/` | Bildschirm-Container + ihre Tests | `ui/`, `app/`, `content/`, `domain/` – **kein anderes Feature** |
| `src/shell/` | App-Router (Bildschirm + Hintergrund) | alles außer `platform/` |
| `src/main.tsx` | Composition Root: verdrahtet echte Adapter | `shell/`, `app/`, `platform/`, `ui/` |

Verbote (prüft `src/architecture.test.ts` automatisch):

- Kein `Date.now()`, `new Date()`, `Math.random()`, `performance.now()`, `crypto.*`, kein Dexie außerhalb von `platform/`. Zeit und Zufall kommen als **Werte** (`now`, `seed`) aus dem Store (`env`) in die reinen Funktionen. Gewollte Ortszeit: der Kalendertag der Agententage (`dayKey`), `formatDate` und Wochentag und Tageszeit der Story (`timeOf`, `domain/daytime.ts`).
- `domain/`, `content/`, `app/` kennen keinen Browser (`window`, `document`, `navigator`, `globalThis`, `location`, `fetch`, Timer, Storage, IndexedDB, `AudioContext`).
- Pakete nur nach Positivliste je Schicht (`PACKAGES` im Architektur-Test): `domain/`/`content/` keine, `app/` nur `zustand/vanilla`, `platform/` nur `dexie`, `ui/` `react` und `zustand`, `features/`/`shell/` nur `react`, `main.tsx` zusätzlich `react-dom/client` und `@fontsource/*`.
- Kein `getState()` in `features/` und `shell/`. Lesen mit `useGame(selector)`, handeln mit `useActions()` (`ui/app/game.ts`, liefert nur Aktionen).
- `repo.save` nur in `app/store.ts`.
- **Inhaltsregel:** `ui/`, `features/` und `shell/` holen aus `content/` nur Oberflächentexte (`texts/`, eine Datei je Thema), `arcadeGames.ts`, `codenames.ts`, `credits.ts` und das LPC-Manifest (Liste `CONTENT_FOR_SCREENS`; reine Typ-Importe sind frei; `story/acts.ts` gehört nicht dazu). `app/` holt echte Inhalte nur in `app/rules.ts` (außer `content/texts/`); Bilderbuch, Beschriftungen, Fallakten und Medaillen-Schwellen liegen in `StoryContent` bzw. `GameRules` und kommen über den Store.
- Keine Imports aus `platform/` außer in `main.tsx` und Tests.
- Features importieren keine anderen Features; Gemeinsames gehört nach `ui/` oder `app/`.
- Keine Import-Kreise, in keiner Schicht (auch nicht über reine Typ-Importe); Bündel-Typen wie `StoryContent` (`domain/storyContent.ts`) liegen deshalb in eigener Datei, und eine Datei reicht nichts weiter, was sie importiert.
- Keine Emoji in den Quellen (alle Nicht-Test-Dateien), außer in den Chat-Zeilen unter `content/story/` nach ADR-0006 (Positivliste je Figur in `content/story/emoji.ts`).

Wohin gehört was?

- Eine **Regel** oder ein **Ablauf** (wann ist etwas geschafft, wie läuft eine Runde) → `domain/`, als reine Funktion oder Reducer. Die UI leitet nur Ereignisse weiter und zeichnet.
- **Speichern** passiert nur in Store-Aktionen (`app/store.ts`): Profil → Kernfunktion → `repo.save`.
- **Texte, Zahlenwerte, Listen** (Story, Schwellen, Wörter, Abzeichen, Ränge, EP, Rundenplan, Oberflächentexte) → `content/`. Regeln bekommen sie über `GameRules` (`course`, `badges`, `rewards`, `arcade`), `StoryContent` (Szenen, Objekte, Dinge, Fälle, Bilderbuch, Beschriftungen, Fallakten) und `WardrobeCatalog` (auch `migrateProfile` bekommt ihn hineingereicht).
- **Regeldaten lesen Bildschirme nur über den Store** (`useGame((s) => s.rules…)`, `s.story`, `s.wardrobe`), damit Tests eigene Sätze übergeben können. Oberflächentexte, Tipps und Labels dürfen direkt aus `content/` kommen (Inhaltsregel oben). Statische Beschriftungen bleiben im JSX; nach `content/texts/` kommen nur Texte, die aus Zuständen entstehen. Ausnahme: Krümels Satzbausteine (Ratgeber, Tipp-Auswahl) stehen mit ihren Regeln in `domain/format.ts`.
- **Fehler beim Speichern** brechen das Spiel nicht ab: `persist` setzt `saveFailed`, die Schale zeigt den Hinweis.
- **Aktionen, die den Bildschirm wechseln,** navigieren vor dem `await` – gegen doppeltes Absenden.
- **Abgeleitete Anzeigewerte** → Ansicht in `app/views/` (eine Datei je Bildschirm) oder Formatierer in `domain/format.ts`.
- Gespeicherte Profile werden nur in `app/profileMigration.ts` auf den neuen Stand gebracht.
- Bilderbuch-Szenen bekommen einen `StoryRef`, nie Textzeilen; „schon gesehen“ nur über `seenKey` (`domain/seen.ts`) – und nur Schlüssel, die auch gelesen werden. Chat-Szenen sind `StoryScene`s mit ID und Auslöser (`domain/scenes.ts`), ihr Stand liegt im Story-Log des Profils.
- **Szenen werden bei jedem Speichern ausgelöst** (`withStory` in `persist`, `app/store.ts`); neue Auslöser kommen in `isDue` (`domain/story.ts`), nicht in einzelne Aktionen. Besitz (Gadgets, Kleidung) wird nie gespeichert, sondern mit `ownedItems` berechnet.

## DRY-Checkliste

Jede Regel steht an einer Stelle. Vor dem Hinzufügen von Code im [Wegweiser](docs/technik/wegweiser.md) nachsehen, ob es das schon gibt; wer Code verschiebt oder ersetzt, zieht die Zeile dort im selben Schritt nach.

## Testen

- **Fast alles ohne Browser.** Kern und Anwendung in node, Bildschirme in happy-dom mit Testing Library und Fake-Timern. Details und Rezepte: [docs/technik/tests.md](docs/technik/tests.md).
- `*.test.ts` = node, `*.test.tsx` = happy-dom. Test-Hilfen aus `src/test/` verwenden statt neu zu bauen.
- Abläufe testet man über Reducer (Zeit als Wert) oder Store-Szenarien (`createGameStore` mit `memoryRepository`, `fixedEnv`, `soundRecorder`) – nicht im Browser.
- **Keine Zeitraffer- oder Test-Hooks im Produktcode.** Spielhallen-Zeit wird im Test über die Schritt-Funktionen (`regenTick`, `tresorTick` mit `now`) vorgespult. Einzige Ausnahme: die Entwickler-Abkürzung `SKIP_KEY` (F9) in `useTypingInput` – nur hinter `import.meta.env.DEV`, im fertigen Spiel nicht enthalten.
- Keine echten Wartezeiten (`waitForTimeout`) – Fake-Timer (`app.wait(ms)`).
- Playwright nur für den Smoke-Test und den Layout-Test (`e2e/layout.spec.ts`: passt alles auf den Zielgrößen ohne Scrollen ins Fenster); nur ausnahmsweise ein weiterer Browser-Test, wenn etwas nur im echten Browser prüfbar ist (Canvas, echte Tastatur, IndexedDB-Verhalten).
- Lange Testläufe nicht mehrfach hintereinander starten; erst gezielt die betroffene Datei (`npx vitest run <pfad>`), dann einmal `npm run check`.
- Inhaltstests (`src/content/`): `course.test.ts`, `story.test.ts`, `rewards.test.ts` gelten für alle Akte und lesen das Prüfprofil `check` des Bündels; `akt1.test.ts` nur für Besonderheiten von Akt 1. Gemeinsame Hilfen in `src/test/content.ts` (`ALL_ACTS`, `ALL_STORY`; `BUILT_ACTS` nur die Akte mit fertigen Szenen – ein Gerüst ohne Szenen wird für Briefing, Stufen, Fallakte und Szene nach dem Einsatz erst mit seinen Szenen geprüft; Einsatz-Bildschirm eines vorbereiteten Akts: `renderApp` mit `rules` (`ALL_COURSE`) und `story: ALL_STORY`). `knownIds.test.ts` verlangt, dass jede vorhandene ID in `knownIds.ts` steht (`npm run ids`).
- Ein Bug → zuerst ein Test, der ihn zeigt, dann der Fix.

## Rezepte

- **Neuer Auftrag / Akt:** Ein Akt ist ein Bündel (`ActContent`, `content/story/types.ts`) in einem eigenen Ordner `content/story/aktN/` – Vorbild `akt1/`: `book.ts` (Bilderbuch, Einsatz-Story `EXAM` mit `won`/`lost`/`segments`, Beschriftung), `chat.ts` (Briefing, drei Stufen 25/50/75 %, Abschluss als Chat-Szenen), `side.ts`, `cases.ts`, `objects.ts` (ein Story-Objekt je Auftrag), `fallakte.ts`, `rewards.ts`, `index.ts` (Modul mit Aufträgen, Schwellen, Einsatz-Kriterien, Wortliste, dazu `check`; die Wortliste darf Wörter mit später gelernten Buchstaben enthalten – gewählt wird nach den gelernten Tasten – und braucht je neuer Taste mindestens 3 Wörter, sobald der Auftrag mit Wörtern arbeitet). Szenen-IDs ab Akt 2 mit Präfix `aN-` (`a2-`). Ordner kopieren, das Bündel in `STAGED_ACTS` (`content/story/acts.ts`) eintragen – vorbereitet, im Spiel unsichtbar, aber von den Inhaltstests geprüft –, zum Schluss nach `ACTS` verschieben; Kurs, Szenen, Objekte, Fälle, Bilderbuch, Beschriftung und Fallakte werden daraus abgeleitet (`storyOf(acts)` in `acts.ts`; Tests vorbereiteter Akte nehmen `ALL_STORY` aus `src/test/content.ts`). Inhaltsversion erhöhen. Die Inhaltstests (`course.test.ts`, `story.test.ts`, `rewards.test.ts` in `src/content/`) prüfen Vollständigkeit und Regeln über `ACTS` und `STAGED_ACTS`, ohne dass man sie anfasst; was je Akt verschieden ist, steht im Prüfprofil `check` des Bündels (`typed`: getippte Antworten, `revealFrom`: ab welchem Auftrag der Name des Barons fallen darf, `spoilers`: Wörter, die die Fallakte nicht verraten darf). Beim Umzug nach `ACTS` `npm run ids` ausführen (trägt die neuen IDs in `knownIds.ts` ein; `knownIds.test.ts` schlägt sonst an). Erweiterungspunkte, die der Typcheck erzwingt: neue Sprecher (`Speaker` in `domain/dialog.ts`, Porträt in der Oberfläche), neue Chats (`ChatId`), neue Hintergründe (`SceneName`) und Bilder (`PictureId`) brauchen je eine Zuordnung in der Oberfläche (Bilder: Tabelle `PICTURES` in `ui/pictures/pictures.tsx` mit `akt1.tsx`, `akt2.tsx`, `akt3.tsx`, `akt4.tsx`, `akt5.tsx`, `akt6.tsx`, `akt7.tsx`, `cases.tsx`; Pixel-Bausteine in `ui/pixel/`).
- **Neues Abzeichen:** `BadgeRule` in `content/badges.ts` (Symbol nur aus Textzeichen); Fall knapp unter und über der Schwelle in `domain/badges.test.ts` (der Test verlangt jede ID). Nicht jedes Abzeichen braucht eine Belohnung. Hat es eine, überreicht sie eine Meldungs-Szene (Trigger `badge`, `gives`, `gift: true`; akt-neutral in `content/story/rewardScenes.ts`, zur Geschichte eines Akts gehörend in dessen `rewards.ts`) – erst dann besitzt das Kind sie. Kommt es mit dem Abschluss eines Auftrags, `...forLesson(id)` statt eigener Bedingung.
- **Neues Garderobe-Teil oder Farbpaket:** LPC-Teil in `scripts/lpc/parts.ts` (für `teen` prüfen, Lizenz ohne GPL zur Wahl) → `npm run assets:lpc` → Eintrag in `content/wardrobe.ts` (Teil in seiner Liste, Farbpaket in `COLOR_PACKS`) mit Quelle: `{ badge }` (je Abzeichen höchstens eine Belohnung, Gadgets und Kleidung zusammen; Paket-Szene mit `pkg` in `content/story/rewardScenes.ts`) oder `{ scene }` (Übergabe-Szene mit `gift(…)` bzw. Rang-Szene mit `gives`; jede Übergabe-Szene trägt `gift: true` und überreicht mit `gives` – erst dann besitzt man es); ohne Quelle ist es von Anfang an frei – nur für das, womit sich ein Kind selbst darstellt. Zettel in `NOTES` (`content/items.ts`). Getragenes bleibt wählbar (`wearable`), Zuordnungen nie umhängen.
- **Neues Gadget:** Eintrag in `content/items.ts` mit genau einer Quelle (`badge` – dazu eine Meldungs-Szene mit `gives` und `gift: true` in `rewardScenes.ts` bzw. dem `rewards.ts` des Akts –, `scene` + `gives` in der Szene oder `case`); es muss benutzt werden (Bedingung eines Falls oder zusätzliche Antwort mit `needs`). Haupt-Szenen verlangen nie ein Gadget, das nicht eine frühere Haupt-Szene verschenkt hat.
- **Neue Chat-Szene / Nebenszene:** Zeilen in `chat.ts` bzw. `side.ts` im Ordner des Akts (`content/story/akt1/`) mit den Helfern aus `builders.ts` (Antworten: `ans(id, Kurzform, ganzer Text, Reaktion)`, Kurzform höchstens drei Wörter; Beiträge in anderen Chats mit `inChat(chat, zeile)`; Antwort und Reaktion stehen im Chat der fragenden Zeile; eine Nebenszene kommt nur bei Durchgängen im Akt ihres `fromLesson`: im laufenden Akt am aktuellen, offenen Auftrag, in einem abgeschlossenen Akt (Einsatz gespielt) beim Wiederholen eines geschafften Auftrags (`RunStart.replay`, `nextSideScene` mit `wholeModule`: alle Aufträge des Moduls gelten als erreicht; das HQ zeigt dann `moreSides`), und eine mit `gives` kommt nie in einem Durchgang, der schon ein Geschenk gebracht hat; in Haupt-Szenen antwortet das Kind nie im Qwertz-Flüstern; Erwachsene schreiben nie in `kruemel`/`juna`; Echo auf eine frühere Antwort mit `picked(szene, antwort)`), Auslöser wählen (Nebenszenen: `afterScene`, wenn sie eine Figur oder einen Begriff voraussetzt, den erst eine Haupt-Szene einführt; `untilCase`, wenn sie nach einem gelösten Fall nicht mehr passt), Inhaltsversion erhöhen, danach `npm run ids` (neue Szenen- und Antwort-IDs in `knownIds.ts`). Emoji nur aus der Positivliste des Sprechers (`content/story/emoji.ts`), höchstens eines je Nachricht und zwei je Szene, nie allein als Information; Längen zählen Code-Punkte. Die Texte kommen aus dem Drehbuch des Akts, das nicht im Repository liegt; Kommentare nennen es nur mit Titel („Quelle der Texte: Drehbuch Akt 2 (liegt nicht im Repository)“). Vorher die Checkliste in [Story-Regeln](docs/design/story-regeln.md) durchgehen; `story.test.ts` prüft Längen (Chat ≤ 7 Nachrichten à ≤ 100 Zeichen, Nebenszene ≤ 4, Bilderbuch ≤ 10 Zeilen à ≤ 120 Zeichen) und Echos.
- **Neuer Extra-Fall:** `ExtraCase` samt Ankündigung (`caseOpen`), Intro und Outro (`case`) in `cases.ts` im Ordner des Akts, Gadget-Belohnung in `content/items.ts`; `story.test.ts` prüft Verweise und Erreichbarkeit.
- **Inhaltsversion erhöhen:** `STORY_VERSION` in `content/story/scenes.ts` (die Szenen selbst sammelt `acts.ts`), sobald Szenen dazukommen, die bei bestehenden Spielständen nicht nachträglich erscheinen sollen. `migrateProfile` markiert dann alles Fällige als gelesen.
- **Neues Spielhallen-Spiel:** Mechanik als reine Schritt-Funktionen in `domain/arcade/` (mit `events` und `over`), Name im Typ `ArcadeGame` (`domain/profile.ts`), Eintrag in `content/arcadeGames.ts` (mit `levelWord`, `cheer`; Medaillen-Schwellen in `ARCADE_MEDALS` derselben Datei, verdrahtet als `GameRules.arcade`; das Spiel meldet das zuletzt geschaffte Level über `levelsDone`), Bildschirm in `features/arcade/` mit `useArcadeRun` und `ArcadeFrame`, Zuordnung in `ARCADE` (`shell/App.tsx`), Liste in `rewards.test.ts` anpassen; Kern-Test mit vorgespulter Zeit + ein Komponententest.
- **Neue Bilderbuch-Szene** (nur für große Momente): Zeilen in `book.ts` im Ordner des Akts (`content/story/akt1/`) mit den Helfern aus `builders.ts` (Antworten über `choices` mit `ans`, Hintergrund über `scene`, Tasten zeigen über `keys`), Verweis-Art (`StoryRef`) und Auflösung der Zeilen (`storyLines`) in `domain/book.ts` (liest aus dem Bündel `s.story`).
- **Neues Bild** (Story-Bild, Gadget-Symbol): als Zeichen-Karte mit Palettennamen zeichnen (`fromPalette(rows, legende)`, `ui/pixel/pixelMap.ts`; Farben nur aus `ui/pixel/palette.ts`), in der Größe seiner Bildart (`Grid` mit `kind`: `gadget` 16×16, `evidence` 32×20, `object` 64×40, `panorama` 96×56; `ui/pixel/pictureKinds.ts`), eintragen in `PICTURES` (`ui/pictures/pictures.tsx`, mit `PictureId`) bzw. `ICONS` (`ui/components/gadgetIcons.ts`). `ui/pixel/pictures.test.ts` prüft jedes registrierte Bild (Größe, Palette, Rand, nur Rechtecke) ohne Ausnahme. Mit `npm run pictures:sheet` ansehen (Regeln in [Grafik](docs/design/grafik.md), „Eigene Bilder“).
- **Neues Profilfeld:** Typ in `domain/profile.ts`, Standardwert in `createProfile` (ebenfalls `domain/profile.ts`), in `migrateProfile` übernehmen (mit Typprüfung; fehlt es, gilt der Startwert aus `createProfile`), Test in `app/store.test.ts` („alte Spielstände …“ bzw. „kaputte Spielstände …“).

## Vorgehen bei größeren Änderungen

- Größere Änderungen werden vor der Umsetzung geplant (Ziel, Befunde, Lösung, Reihenfolge) und von einer zweiten Person oder einem zweiten Agenten geprüft. Die Planung liegt außerhalb des Repositorys (ADR-0001); hier landen nur Code, Doku und Entscheidungen.
- Umsetzen in Schritten, die jeweils grün sind (`npm run check`).
- Doku (`docs/technik/`, ggf. `docs/spiel/`, `docs/design/`) und diese Datei im selben Schritt aktualisieren.

## Entscheidungen (ADR)

- Jede Entscheidung, die das Projekt prägt, bekommt ein Entscheidungsprotokoll in `docs/adr/` (`NNNN-titel.md`, Format und Übersicht in `docs/adr/README.md`). Geschrieben wird es erst, wenn der Projektinhaber zugestimmt hat, dann als `accepted`.
- Bis zum ersten Commit darf ein ADR geändert werden; danach ersetzt ein neues ADR das alte ganz oder teilweise (`superseded_by`), das alte bleibt stehen.
- Wer beim Umsetzen eine Entscheidung braucht, hält an und fragt; nichts still entscheiden.

## Gespeicherte Daten

- Spielstände: Regeln in ADR-0005 und im Rezept „Neues Profilfeld“. Szenen-, Antwort- und Item-IDs nie umbenennen; `STORY_VERSION` erhöhen, wenn neue Szenen bei bestehenden Spielständen nicht nachträglich erscheinen sollen.
- Jede Änderung, die gespeicherte Profile betrifft, hat einen Test mit einem alten oder kaputten Spielstand.

## Öffentliches Repository

- Das Repository wird öffentlich. Keine persönlichen Daten außer der Commit-Identität: keine E-Mail-Adressen, keine lokalen Pfade mit Benutzernamen, keine Rechnernamen oder privaten Links in Code, Doku und Tests.
- Keine Planungsnotizen im Repository; Verweise auf Entscheidungen nur per ADR-Nummer.
- Keine Handlung über das Gebaute hinaus: Drehbücher der Akte, der Plan der kommenden Akte und die Auflösung der Geheimnisse liegen nicht im Repository, damit es die Geschichte nicht verrät. Im Repository stehen nur die Spieltexte in `content/story/`, die Mechanik ([story.md](docs/design/story.md)) und die [Story-Regeln](docs/design/story-regeln.md); ein Drehbuch wird nur mit seinem Titel genannt („Drehbuch Akt 4“), nie mit Pfad. Der Architektur-Test prüft, dass unter `docs/` kein Drehbuch liegt.
- Andere Projekte werden nur genannt, wenn ihr Code oder ihre Grafiken unter ihrer Lizenz verwendet werden; Code wird nicht kopiert.

## Fertig heißt

1. `npm run check` ist grün (Typen, ESLint ohne Warnungen, alle Tests mit Coverage-Schwellen); bei Änderungen am Start der App, an Navigation, Speicher oder Build zusätzlich `npm run build` und `npm run e2e`, vor Meilensteinen immer.
2. Neue oder geänderte Logik ist getestet, auf der niedrigsten passenden Stufe (node vor happy-dom vor Playwright); Kern und Anwendung halten die Coverage-Schwellen.
3. Kein Prüf-Gate abgeschwächt: keine niedrigere Schwelle, kein entfernter Test oder Architektur-Check, kein neues `eslint-disable` oder Ignorieren ohne Begründung daneben.
4. Keine doppelte Logik; jede Regel steht an einer Stelle ([Wegweiser](docs/technik/wegweiser.md)).
5. Doku ist aktuell (Architektur bei Strukturänderungen, Spieler-Doku bei sichtbaren Änderungen, Testrunden in `docs/design/feedback.md`).
6. Jede neue Entscheidung hat ein ADR; geänderte Entscheidungen ersetzen ihr ADR.
7. Änderungen an gespeicherten Profilen sind migriert und getestet; generierte Dateien sind nur über ihr Skript entstanden.
8. Commit mit deutscher Conventional-Commits-Nachricht (Typ wie `feat:` englisch), die das Warum erklärt.

## Fallstricke

- **Keine Emoji in der Oberfläche** (fehlen ohne Emoji-Schrift). Erlaubt sind einfache Textzeichen wie ★ ♛ ▶ ↓ ● ○ ⏎ ◀; der Architektur-Test prüft alle Quellen außer `content/story/` (`src/test/emoji.ts`). Einzige Ausnahme ist der Agentenfunk (ADR-0006): Emoji nur im Text einer Chat-Zeile einer Figur, aus der Liste ihres Sprechers; Bilderbuch, Fallakte, Dinge, Abzeichen und alle Antworten des Kindes bleiben emoji-frei.
- **Geschützte Leerzeichen:** In Quelltexten als Escape schreiben (`' '`), nie als echtes Zeichen – manche Editoren/Werkzeuge wandeln es um, ESLint meldet es dann.
- **IDs** nur über `env.id()` (in Produktion `platform/id.ts`): `crypto.randomUUID` fehlt außerhalb von HTTPS/localhost.
- **Generierte Dateien nicht von Hand ändern:** `src/content/lpc.generated.json`, `public/assets/lpc/`, `public/assets/CREDITS.csv`.
- **Deutsches Tastaturlayout:** Eingaben über `KeyboardEvent.key`; Umlaute und AltGr beachten (`useTypingInput`). Bei Feststelltaste zählen Buchstaben nicht.
- **Spielstände je Adresse:** `localhost` und IP-Adresse haben getrennte Datenbanken.
- **Szenen-IDs sind Speicherformat:** Szenen, Antwort-IDs und Item-IDs stehen in Spielständen – nie umbenennen. Nicht mehr gebrauchte IDs werden ignoriert.
- **Prozesse beenden:** nicht mit `pkill -f <muster>`, wenn das Muster in der eigenen Befehlszeile vorkommt.
