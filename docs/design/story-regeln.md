# Story-Regeln – so bleibt die Geschichte spannend

Diese Regeln gelten für jede neue oder geänderte Szene. Sie fassen eine Auswertung von Akt 1 mit Forschungsquellen zusammen (Story-Auswertung, liegt nicht im Repository). Wie die Geschichte erzählt wird (Chats, Figurenstimmen, Emoji), steht in [story.md](story.md).

Das Ziel ist **gutes Dranbleiben:** Kinder spielen weiter, weil sie neugierig sind und merken, dass sie etwas können. Nicht weil sie Angst haben, etwas zu verpassen.

## Die dreizehn Regeln

1. **Tippen ist die Handlung.** Was das Kind sicher tippt, rettet etwas in der Geschichte (Weltregel, Story-Objekt). Eine Szene ist nie nur Belohnung *nach* dem Tippen; sie zeigt, was das Tippen bewirkt hat.
2. **Das Kind löst, die Figuren helfen.** In jedem Auftrag zieht das Kind mindestens einmal selbst den Schluss: Krümel liefert die Teile, das Kind wählt die Deutung. Bei so einer Deutungs-Wahl ist eine Antwort richtig; bei den anderen hilft eine freundliche Reaktion weiter, nie eine Strafe. Geschmacks-Wahlen („Hände!“ / „Was noch?“) haben keine richtige Antwort. Die Kurzform verrät die Lösung nicht.
3. **Getippte Antworten sind Lösungen.** Sobald die gelernten Tasten Wörter hergeben, tippt das Kind Wörter, die in der Geschichte etwas bewirken (Passwort, Codewort, Name). In Akt 1 mindestens in jedem zweiten Auftrag ab Auftrag 4, ab Akt 2 in jedem Auftrag. Nur die allererste getippte Antwort darf eine Bestätigung sein („ja“) – zum Kennenlernen. Die Zeile davor erinnert an die Grundstellung, jedes Mal anders (Blick auf den Schirm, Hubbel auf F und J, der richtige Finger, der Baron tippt mit zwei Fingern, Frau Hubbel). Kein Lob fürs Blindtippen danach: Das Spiel sieht nicht, ob jemand hingeschaut hat.
4. **Jede offene Frage ist konkret und lösbar.** Jede Haupt-Szene endet mit einer Frage, die das Kind sich selbst stellen kann („Welches ‚heute‘?“), oder mit einer kleinen Auflösung. Eine Frage wird spätestens zwei Aufträge später wenigstens teilweise beantwortet.
5. **Jede Antwort öffnet eine größere Frage.** Weicht eine Figur aus, gibt sie trotzdem ein Krümelchen Wahrheit preis. Nie zweimal hintereinander bloß „später“.
6. **Spannung als Welle.** Je Auftrag: 25 % Aufbau, 50 % Wendung oder Hinweis, 75 % Spitze, Abschluss mit Auflösung und Haken. Über den Akt steigt die Welle bis zum Einsatz. Im letzten Auftrag vor dem Einsatz gibt es in Haupt-Szenen keine reinen Gags; die kommen in Nebenszenen.
7. **Der Gegner ist spürbar.** Der Gegner eines Akts zeigt sich spätestens im Abschluss des ersten Auftrags und hinterlässt mindestens in jedem zweiten Auftrag eine Spur in einer Haupt-Szene.
8. **Wahlen haben ein Echo.** Je Akt greifen spätere Zeilen Antworten aus mindestens drei verschiedenen Szenen auf (`ifPicked`), und zwar ohne Gadget erreichbar; `choice: null` zählt dabei nicht. Keine Wahl wird bestraft, keine verbaut den Weg.
9. **Lob nennt echtes Können.** Abschluss-Szenen nennen die Tasten, die jetzt sitzen. Lob ist konkret („D und K sitzen“), nicht pauschal („Weiter so“).
10. **Kurz.** Siehe Grenzen unten. Lieber zwei kurze Nachrichten als eine lange. Wenn eine Szene zu lang wird, wandert der Rest in eine Nebenszene oder in die nächste Stufe.
11. **Rastpunkte statt Sog.** Jeder Akt endet mit einem Triumph-Moment, erst danach kommt der Haken. Keine Wartezeiten, keine Countdowns in echter Zeit, kein „nur heute“, keine Drohung mit Verlust, keine Nachricht, die zurücklockt.
12. **Alles Wichtige steht in Haupt-Szenen.** Nebenszenen sind Bonus (Humor, Stadtleben, zusätzliche Hinweise). Figurenstimmen und Chat-Regeln: [story.md](story.md), Abschnitt A5. Die Leitplanken für Drama gehören zur Handlung und stehen beim Drehbuch des Akts (liegt nicht im Repository).
13. **Das Briefing nennt zu jeder neuen Taste den Finger und den Rückweg zur Grundstellung; der Abschluss wiederholt zu jeder neuen Taste die Taste und den Finger.** Bei Umschalt-Einheiten sagt das Briefing, welche Hand hält („hält“). Die Mini-Tastatur zeigt die Tasten, der Text sagt, wer sie tippt. Geprüft in `story.test.ts` (je Lerneinheit ein passendes Fingerwort, im Briefing und im Abschluss; bei Umschalt-Einheiten im Abschluss „hält“ oder „gehalten“); die Seite (links/rechts) und den Rückweg prüft das Lektorat.

## Grenzen für die Länge

Geprüft in `src/content/story.test.ts`. Gezählt wird der **längste Weg** durch eine Szene: Bei einer Wahl zählen die ganze Antwort und die längste Reaktion. Systemzeilen zählen nicht, Karten und Bilder auch nicht.

| | Höchstens |
| --- | --- |
| Chat-Szene (Haupt-Szene, Paket, Fall) | 7 Nachrichten |
| Nebenszene | 4 Nachrichten |
| Chat-Nachricht | 100 Zeichen (Code-Punkte, ein Emoji zählt 1; Platzhalter wie `{vorname}` zählen mit ihrem Namen, nicht mit dem Inhalt) |
| Briefing-Zeile mit Mini-Tastatur (`keys`) | 120 Zeichen: Anweisungszeilen tragen Geschichte und Finger-Regel zugleich; alle anderen Zeilen bleiben bei 100 |
| Bilderbuch-Stück (Prolog, Briefing, Einsatz-Intro …) | 10 Zeilen |
| Bilderbuch-Zeile | 120 Zeichen (Code-Punkte) |
| Emoji | 1 je Chat-Nachricht, 2 je Chat-Szene; nur Figuren-Zeilen, nur aus der Liste des Sprechers (story.md, A5) |
| Kurzform einer Antwort | 3 Wörter |
| Getippte Antwort | ein Wort; ab Akt 5 ein kurzer Satz bis etwa 20 Zeichen |

Zeilen mit `ifPicked` auf dieselbe Szene, die direkt aufeinander folgen, schließen sich aus – es zählt nur die längste.

Längere Texte gehören auf eine **Karte** (`card`): Briefe, Zettel und Werbung stehen dort, nicht in der Sprechblase.

## Werkzeuge

| Wofür | Wie |
| --- | --- |
| Zeile nur, wenn früher etwas gewählt wurde | `ifPicked: { scene, choice }` an der Zeile (im Chat mit `picked(scene, choice)`); `choice: null` heißt „dort nichts gewählt“ (`domain/dialog.ts`). Die Bezugsszene ist eine Haupt-Szene aus einem **früheren Auftrag** (Stufe und Abschluss desselben Auftrags werden oft zusammen abgespielt). Echo-Zeilen tragen **keine eigenen Antworten**. Bilderbuch-Antworten werden nicht gespeichert, also kann man sich nur auf Chat-Szenen beziehen. Prüft `story.test.ts`. |
| Zeile nur zu bestimmter Zeit (echte Uhr) | `ifTime: { daypart?, shopOpen?, sunday? }` an der Zeile (`domain/daytime.ts`); siehe „Echte Tageszeit“ unten. |
| Selbst getippte Antwort | `ans(…, { typed: 'wort' })`; nur gelernte Zeichen (prüft `story.test.ts` gegen das Prüfprofil `check.typed` des Akts) |
| Antwort nur mit Gadget | `ans(…, { needs: 'item-id' })` |
| Brief, Zettel, Werbung | `card: { title, text }` |
| Wann die nächste Szene kommt | zeigt die Nachbesprechung von selbst (`nextStageAt`, `domain/story.ts`) |

## Echte Tageszeit

Wo die Geschichte einen Wochentag oder eine Tageszeit nennt, darf sie die echte Zeit des Kindes nehmen – grob als Tageszeit, nie als Uhrzeit. Die Uhr des Geräts wird beim Öffnen einer Szene einmal gelesen (lokale Zeit) und nicht gespeichert.

- **Platzhalter:** `{wochentag}` („Dienstag“), `{jetzt}` („Dienstagmorgen“, „Sonntagabend“; zwischen 0 und 4 Uhr der Vortag: „Montagnacht“), `{gruss}` („Guten Morgen“, „Guten Tag“, „Guten Abend“). Ohne Zeitangabe (Tests, alte Aufrufer) gilt Dienstagmorgen, Bäckerei offen.
- **Tageszeiten:** morgens 5–10, mittags 11–13, nachmittags 14–17, abends 18–21, nachts 22–4 Uhr. Bäckerei offen: Mo–Sa 6–18, So 7–11 Uhr.
- **Varianten:** Passt eine Zeile nicht zu jeder Zeit, schreibt man Varianten mit `ifTime` direkt hintereinander; zu jeder Zeit gilt genau eine. Zeilen mit `ifTime` tragen keine eigenen Antworten (die Reihenfolge gespeicherter Antworten darf sich nie verschieben). `story.test.ts` prüft, dass jede Szene zu jeder Stunde jedes Wochentags gleich viele Zeilen hat; für die Länge zählt die längste Variante.
- **Fest bleibt, was Handlung ist:** der 12-Uhr-Countdown des Barons (10:30, 11:58, „um 12“) und Redewendungen wie „über Nacht“ in anderen Szenen.
- **Chat-Verlauf:** Wer einen alten Chat liest, sieht die Fassung zur jetzigen Zeit, nicht die vom ersten Lesen.
- Nur wo es die Geschichte besser macht (Einstieg, Begrüßungen, Bäckerei und Post); Regel 11 gilt weiter: nichts, was zurücklockt, keine Wartezeit.

## Checkliste für eine neue Szene oder einen neuen Akt

1. Bewirkt das Tippen hier etwas in der Geschichte?
2. Zieht das Kind in diesem Auftrag selbst einen Schluss oder tippt eine Lösung?
3. Endet die Szene mit einer konkreten Frage oder einer kleinen Auflösung?
4. Gibt eine ausweichende Figur trotzdem etwas preis?
5. Passt die Szene an ihre Stelle in der Welle (Aufbau, Wendung, Spitze, Auflösung)?
6. Ist der Gegner in diesem oder im letzten Auftrag spürbar?
7. Greift im Akt mindestens dreimal eine Zeile eine frühere Wahl auf?
8. Nennt das Lob, was das Kind wirklich kann?
9. Hält die Szene die Längengrenzen ein (der Test sagt es)?
10. Kann das Kind nach dieser Szene zufrieden aufhören?
11. Würden Eltern die Szene fair finden?
12. Verrät nichts, was früher sichtbar ist, die Entdeckung dieser Szene? Gemeint sind auch Texte außerhalb der Story: Spielhalle, Abzeichen, Credits, Nebenszenen und Belohnungs-Szenen. Diese sind schon früh möglich. Den Namen des Barons prüft `story.test.ts` („Spoiler“). Er fällt erst ab dem Abschluss des Auftrags `check.revealFrom` (Akt 1: Auftrag 4); die Wörter, die eine Fallakte nicht verraten darf, stehen in `check.spoilers`.
13. Nennt das Briefing zu jeder neuen Taste den Finger und den Rückweg, und wiederholt der Abschluss zu jeder neuen Taste Taste und Finger?
14. Stehen Emoji nur in Chat-Zeilen, passen sie zur Figur (Tabelle in story.md, A5), verraten sie nichts und trägt keines allein eine Information? Die Grenzen prüft der Test.
