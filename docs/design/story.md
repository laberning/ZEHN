# Story und Agenten-Chat – Mechanik

Stand 06.11.2026 · abgestimmt mit dem Projektinhaber · Belohnungen und Ausrüstung: [belohnungen.md](belohnungen.md)

**Für jede neue oder geänderte Szene gelten die [Story-Regeln](story-regeln.md)** (Kind löst selbst, Wahlen mit Echo, Spannungswelle, Längengrenzen). Akt 1 ist danach geschärft worden. Maßgeblich für den Wortlaut sind die Quelltexte in `src/content/story/`.

Dieses Dokument beschreibt nur, wie die Geschichte erzählt wird. Die Handlung selbst, der Plan der kommenden Akte und die Drehbücher der Akte liegen bewusst nicht im Repository, damit es die Geschichte nicht vorwegnimmt; Code-Kommentare nennen ein Drehbuch nur mit seinem Titel („Drehbuch Akt 2“).

## Ziel

Zwei Rückmeldungen aus den Testrunden:

1. **„Warum muss ich die Übung nochmal machen? Die Story geht nicht weiter.“** Heute steckt die Story nur im Briefing und im „Geschafft“ eines Auftrags. Dazwischen gibt es Durchgänge ohne Handlung, und Wiederholen fühlt sich wie Stillstand an.
2. **„Die Dialoge wirken gestellt.“** Vorbild ist *Gossip Harbor*: eine vielschichtige Geschichte mit Geheimnissen und etwas Drama, erzählt als Chat, in dem frühere Nachrichten sichtbar bleiben.

Ziel: **Jeder Durchgang bringt Geschichte.** Der Lernfortschritt *ist* der Story-Fortschritt, und die Geschichte hat genug Ebenen, dass Kinder wissen wollen, wie es weitergeht. Die Mastery-Regel bleibt streng.

**Begriffe:** Ein **Durchgang** ist, was das Kind als eine Runde erlebt: Aufwärmen und zwei Übungen, danach die Nachbesprechung (`planRounds` in `domain/mission.ts`). Story wird **einmal je Durchgang** ausgewertet, in der Nachbesprechung. Krümel ist **er**: eine Drohne, der beste Freund des Kindes.

## Mechanik

### A1 Fortschritt wird zum Story-Objekt

Jeder Auftrag hat ein **Story-Objekt**, das sich mit dem Lernfortschritt sichtbar repariert oder entschlüsselt.

| Auftrag | Story-Objekt | 0 % → 100 % |
| --- | --- | --- |
| 1 F J | Krümels Kamera-Auge | ein verpixeltes Bild vom Marktplatz wird scharf |
| 2 D K | Dein Agentenausweis | der alte Drucker druckt Zeile für Zeile: Logo, Foto, Codename, Stempel |
| 3 S L | Die Goldrand-Karte | Zeichensalat wird lesbar: „HEUTE UM 12 HOLE ICH MIR DAS F.“ |
| 4 A Ö | Rückseite der Karte | Unterschrift und Wasserzeichen erscheinen |
| 5 G H | Die Schilder am Markt | „APOT EKE“ → „APOTHEKE“, „ ASTHAUS ZUR  ANS“ → „GASTHAUS ZUR GANS“ |
| 6 Ä | Das Grundnetz | Stadtplan mit 12 Knoten, die nach und nach aufleuchten |

**Der Prozentwert:**

- **Wie er berechnet wird:** `lessonMastery` (`domain/progress.ts`) wird vom Mittelwert auf den **kleinsten Wert** der neuen Tasten umgestellt. HQ-Balken und Story-Objekt zeigen dieselbe Zahl.
- **Er sinkt nie:** Die Tastenwerte sind gleitende Mittelwerte und können sinken. Das Objekt zeigt deshalb den **höchsten erreichten Wert**, gespeichert als `lessons[id].best`.
- **100 % gibt es erst bei „geschafft“:** Bis dahin zeigt das Objekt höchstens 99 %. Für „geschafft“ braucht es weiterhin zusätzlich zwei Übungen.
- **Die Abschluss-Szene** hängt an „geschafft“ (`mastered`), nicht am Prozentwert.

### A2 Szenen an Stufen, Nebenszenen dazwischen

In der Nachbesprechung eines Durchgangs wird ausgewertet:

- **Stufen-Szenen:** Je Auftrag bei 25, 50 und 75 % (gemessen an `best`) und eine Abschluss-Szene. Wer in einem Durchgang über mehrere Stufen springt, bekommt alle erreichten Szenen nacheinander. Sie sind kurz.
- **Nebenszenen:** Bringt ein Durchgang keine neue Stufe, kommt *eine* Nebenszene. Die Stränge wechseln sich ab, jeder ist ab einem bestimmten Auftrag freigeschaltet. Wer länger braucht, bekommt also mehr Geschichte.
- **Ist der Vorrat leer,** kommt ein Tipp von Krümel (`KRUEMEL_TIPS`).

**Wie lange dauert ein Auftrag?** Grobe Schätzung bei 35 Anschlägen pro Minute:

| Auftrag | Durchgänge | Nebenszenen |
| --- | --- | --- |
| 1 | 1–2 | kaum, oft zwei Stufen in einem Durchgang |
| 3–4 | etwa 2 | wenige |
| 5–6 | 3–4 und mehr | die meisten, denn G, H und Ä sind seltene Zeichen; meist hängt es bei 75–100 % am Tempo |

Der Vorrat an Nebenszenen muss also vor allem für Auftrag 5 und 6 reichen.

**Regeln**

- Ausgewertet werden Durchgänge des Auftrags, an dem man arbeitet. Das schließt Extra-Fälle zu diesem Auftrag ein. Wiederholungen geschaffter Aufträge, die Spielhalle und das Training beim Einsatz bringen keine Stufen- und Nebenszenen.
- **Nebenszenen nur im eigenen Akt:** Eine Nebenszene kommt nur bei Durchgängen in dem Akt, in dem ihr Strang beginnt (ein Strangname wie `kringel` kann in mehreren Akten vorkommen; das sind getrennte Stränge): im laufenden Akt am aktuellen, offenen Auftrag; was übrig ist, kommt im nächsten Akt nicht, aber nach dem Einsatz beim Wiederholen eines geschafften Auftrags dieses Akts (das HQ deutet es mit einer kleinen Zeile ohne Zahl an). Eine Nebenszene, die etwas überreicht, kommt nie in einem Durchgang, der schon ein Geschenk gebracht hat (höchstens ein Ding je Durchgang); ihr Strang wartet dann.
- **Tippstunden-Szenen:** Im Training (nach dem Finale) kommen zehn feste Szenen nach der 1., 2., 3., 5., 8., 12., 16., 20., 30. und 50. Tippstunden-Runde (Auslöser `training { round }`) und eine Szene beim Abzeichen „Tippstunde“. Sie erscheinen als Funk-Hinweis, nie in der Nachbesprechung, nie als Geschenk, höchstens vier Nachrichten, und nennen keine Zahlen und keinen Vergleich zwischen Figuren (Quelle: Drehbuch Training, liegt nicht im Repository).
- **Haupt-Szenen öffnen sich nach der Nachbesprechung von selbst.** Haupt-Szenen sind die Stufen-, Abschluss- und Einsatz-Szenen. Eine Nebenszene erscheint nur als Hinweis („Krümel hat dir geschrieben – Enter zum Lesen“).
- **Keine festen Zahlen im Text** („50 %!“), denn Stufen können übersprungen werden. Die Zahl steht nur am Story-Objekt.

### A3 Beim Üben sehen, was noch fehlt: die Tastensiegel

Die Mastery-Regel bleibt streng. Damit sie sich nicht wie Willkür anfühlt, sieht man schon **beim Tippen**, woran man arbeitet.

**Jede neue Taste hat ein Siegel mit drei Riegeln.** Sind alle drei offen, ist der Buchstabe gesichert. Das passt zur Story, denn wir retten Buchstaben.

| Riegel | Was er misst | Darstellung |
| --- | --- | --- |
| Training | Anschläge (Schwelle aus `module.mastery`) | Funksignal: Punkte füllen sich |
| Präzision | Trefferquote | Fadenkreuz, das sich zur Mitte zieht |
| Tempo | Zeit je Anschlag | Krümels Rotor dreht schneller, bis er abhebt |

```
 Karte ▓▓▓▓▓▓░░░░ 61 %         Krümel: „L sitzt! S noch etwas genauer.“
 ┌─ S ──────────────┐  ┌─ L ──────────────┐
 │ ●●●●●●●●●○  ◎ 89% │  │ ✓ gesichert      │
 │ Rotor ▸▸▸▸▹       │  │                  │
 └──────────────────┘  └──────────────────┘
        fjfj sss lll dsl kls …   (Tipptext wie bisher)
```

**Beim Tippen**

- Über dem Tipptext stehen eine schmale Leiste mit dem Story-Objekt, ein Siegel je neuer Taste und Krümels Hinweis zum Riegel, der gerade bremst.
- Auf der Bildschirmtastatur tragen die neuen Tasten einen dünnen Ring aus drei Teilen in denselben Farben. Eine gesicherte Taste leuchtet mit ✓.

**Woher die Werte kommen**

- Live-Werte sind die gespeicherten Werte plus die Anschläge dieser Übung bis zum letzten Wortende. Sie werden aus den Werten beim Rundenstart berechnet, damit nichts doppelt zählt (siehe A7).
- Bei weniger als 10 Anschlägen steht bei Präzision und Tempo „misst noch …“.

**Damit es ruhig bleibt**

- Die Werte ändern sich nur am Wortende.
- Ein Riegel, der aufgeht, leuchtet kurz auf.
- Sinkt ein Wert, blinkt nichts rot.

**Vor und nach dem Durchgang**

- Die Nachbesprechung (`LessonCheck`) zeigt dieselben Siegel groß, mit der Veränderung im Durchgang („Präzision 85 → 89 %“).
- HQ und Briefing sagen in einem Satz, was noch zu tun ist („S: genauer tippen“).

### A4 Balance: Die Story läuft immer, und niemand verpasst etwas

| | Haupt-Szenen (Briefing, Stufen, Abschluss, Einsatz) | Nebenszenen |
| --- | --- | --- |
| Inhalt | alles, was für die Handlung zählt: Hinweise, Enthüllungen, neue Figuren, Gadgets | Humor, Stimmung, Stadtleben, zusätzliche kleine Hinweise |
| Wer sie sieht | **alle, immer, in fester Reihenfolge** | wer Durchgänge ohne neue Stufe spielt |
| Wer schnell vorankommt | bekommt erreichte Stufen nacheinander, keine fällt weg | bekommt weniger, verpasst aber nichts |

- **Was wichtig ist, steht nur in Haupt-Szenen.** Ein Hinweis in einer Nebenszene ist immer ein *zusätzlicher*; dasselbe Geheimnis kommt auch in einer Haupt-Szene vor.
- **Nebenszenen werden nicht falsch, wenn sie spät kommen.** Jede ist entweder zeitlos oder hat ein „bis Auftrag X“ und fällt danach weg. Zeitlose Szenen kommen in späteren Aufträgen; wer schnell ist, holt sie so nach.
- **Nachlesen:** Über „Funk“ lässt sich alles noch einmal lesen.

**Zerkratzte Fallakten (abgeleiteter Zustand):** Ein Akt kann die Fallakten der früheren Akte im HQ zeitweise zerkratzt zeigen. Er legt dazu im Bündel zwei Szenen fest (`fallaktenDamage: { from, until }`): Die Akten sind zerkratzt, sobald die Szene `from` gesehen ist, bis die Szene `until` gesehen ist. Der Zustand steht in keinem Profilfeld, er folgt aus dem Story-Log (`fallaktenScratched`, `domain/book.ts`); nichts am Spielstand ändert sich, und was das Kind kann, bleibt unberührt. Das HQ beschriftet den Knopf der Akte „Fallakte Akt N · zerkratzt“ statt „Neu“, der Fallakte-Bildschirm zeigt unter Titel und Kopfzeile Kratzer aus Textzeichen (kein Emoji) und Krümels Zeile dazu; Zeilen, Verdächtige und Treffer sind verdeckt, und das „Neu“ bleibt, bis die Akte wieder lesbar geöffnet wurde. Ohne Eintrag im Bündel ändert sich nichts.

### A5 Der Agenten-Chat

Dialoge laufen als **Chat auf Krümels Bildschirm**. Ältere Nachrichten bleiben stehen; man kann nach oben scrollen.

```
┌ ZEHN intern ──────────────────── 3 neu ┐
│ Krümel  Karte gescannt. Ein bisschen.  │
│        ┌──────────────────────┐        │
│        │ H??TE U? 1? H?LE …   │        │
│        └──────────────────────┘        │
│ Ada     Diesen Goldrand kenne ich …    │
│          Woher kennst du ihn, Ada? ◀ Du│
│ Ada     Später. Erst die Karte.        │
│ ─── Unbekannt ist dem Chat beigetreten │
│ ???     Hübscher Chat. Sehr gemütlich. │
│ ??? tippt …                            │
└────────────────────────────────────────┘
  [1] Wer bist du?   [2] Raus hier!
```

**Chats**

| Chat | Wer schreibt | Wofür |
| --- | --- | --- |
| ZEHN intern | Ada, Krümel, du, ab Akt 3 auch Juna (Funkerin) und Frau Hubbel – und ungebeten der Baron als „Unbekannt“ (ab Akt 6 unter seinem Namen Benno); ab Akt 6 ungebeten auch Tippi | Hauptfall |
| Krümel | privat | Croissant-Tagebuch, Tipps, Paket-Meldungen |
| Qwertz-Flüstern | Junas Klatschkanal; alle lesen mit (ab Akt 6 schreibt Tippi dazwischen) | Gerüchte: Hinweise und falsche Fährten |
| Juna | privat, ab Auftrag 6 | Gleichaltrige: Rivalin, später Freundin |

**Regeln für Figuren im Chat**

- **Erwachsene schreiben dem Kind nie privat.** Ada spricht nur in ZEHN intern. Tippi (eine Maschine) und Benno zählen dazu: nie in den Chats Krümel und Juna.
- **Herr Kringel und Otti kennen die ZEHN nicht und sind nie im Chat.** Krümel oder Juna zitieren sie („Kringel sagt: …“). Das gilt auch für spätere Figuren.
- **Großbuchstaben und „!!!“ sind Junas Stil; in traurigen Momenten schreibt sie klein** (ein Stilmittel, die Großbuchstaben fehlen dann, wo man sie erwartet). Krümel piept und macht Klammer-Witze („(Ja.)“). Der Baron schreibt mit Schnörkeln, „meine Lieben“, „Hochachtungsvoll“. Ada schreibt kurz und trocken.
- **Emoji nur im Chat-Text einer Figur, aus ihrer Liste** (`src/content/story/emoji.ts`, [ADR-0006](../adr/0006-emoji-nur-im-agentenfunk.md)). Höchstens eines je Nachricht und zwei je Szene; ein Emoji verrät nichts und trägt nie allein eine Information. Nicht in Antworten des Kindes, Systemzeilen, Karten, Bilderbuch, Erzähler, Fallakte, Dingen und Abzeichen.

| Sprecher | Erlaubt | Ton |
| --- | --- | --- |
| Juna | 😀 😂 😅 😉 😎 😮 😱 🙄 😴 👀 👋 🙌 ✨ 🔥 🎉 💛 ⭐ ❗ ❓ 🍕 🍪 | am meisten, teenagerhaft, nicht in jeder Nachricht; in traurigen Momenten klein geschrieben |
| Krümel | ⚡ 🔋 💡 🔦 📡 🍪 🥐 | nur Technik und Backstube; „Piep“ bleibt sein Markenzeichen |
| Ada | 👍 | fast nie; wenn, dann komisch (ein Daumen zur falschen Zeit) |
| Baron | 🎩 🧐 | theatralisch, nur unter seinem Namen, nie als „???“ |
| Frau Hubbel, „Unbekannt“, Erzähler, System, Kind | keine | Medienkompetenz, neutrale Stimmen |
| Tippi | keine | eine Maschine: korrigiert fremde Nachrichten, immer falsch; korrigiert nie ein Emoji |
| Benno | keine (ein späterer Akt kann welche geben) | kurz, ohne Schnörkel; Blase in der Farbe des Barons, aufrecht |

Reserve für spätere Akte: 🤔 😏 🤫 💥 ✅ ❌ 🎵 🔎 🔒 🔑 📁 🚇 🚆 🥨 🐦 🎧. Regel für jedes Emoji: ein Code-Punkt mit Emoji-Darstellung, Emoji 5.0 (2017) oder älter, kein Variantenselektor, keine Hauttöne, Flaggen oder ZWJ-Folgen. Neue Figuren späterer Akte bekommen ihre Regel mit ihrem Akt.

**Nachrichten-Arten:**

- Text
- System („Unbekannt ist dem Chat beigetreten“, „Ada ist offline“)
- Korrigiert (nur Tippi, Feld `strike`): der durchgestrichene Teil einer fremden Nachricht steht vor Tippis „Verbesserung“ in derselben Blase; die Längenregel zählt beides
- Story-Objekt mit einem festen Stand (z. B. die Karte bei 50 %)
- Mini-Tastatur (heute `keys`)

**Ablauf**

- Nachrichten erscheinen nacheinander mit „… tippt“ (je nach Länge ca. 0,5–1,5 s). Enter zeigt die nächste sofort.
- Ein Trennstrich „Neu“ markiert, wo die neuen Nachrichten anfangen.
- Esc geht zurück. Was nicht gelesen ist, bleibt ungelesen, aber ausgelöst.
- Im HQ gibt es immer den Knopf **„Funk“** mit der Zahl ungelesener Nachrichten und der Chatliste.

**Antworten**

- Die Auswahl zeigt eine **Kurzform** (höchstens drei Wörter). Gewählt wird per Klick oder mit 1–3.
- Danach steht die **ganze Antwort** als eigene Sprechblase im Chat, dann folgt die Reaktion. Die Wahl wird gespeichert und bleibt im Verlauf sichtbar.
- **Selbst tippen:** An wenigen Stellen tippt man die Antwort selbst. Das geht nur, wenn alle Zeichen schon gelernt sind; ein Test prüft das mit den Tasten früherer Aufträge, in der Abschluss-Szene auch denen des aktuellen.
  - In Akt 1 gibt es das genau einmal: „ja“ am Ende von Auftrag 4.
  - Ab Akt 2 kommt es regelmäßig.

**Bilderbuch-Szenen bleiben** für die großen Momente:

- der Prolog
- das Briefing von Auftrag 1, der Einstieg mit Tastatur
- der Auftritt des Barons am Ende von Auftrag 6
- Intro, Erfolg und Hintertür des Einsatzes
  - Auf der Bühne stehen Ada, der Baron (oder Benno, der Baron ohne Hut und Monokel, sobald er auf unserer Seite ist), Juna, Krümel und die Spielfigur. Wer sonst spricht, bekommt keine Figur; Gegner wie Otti erzählt der Erzähler, sie sind nie Sprecher. Wer nur über Funk spricht („FUNK: …“, Feld `offstage` der Zeile), steht nicht auf der Bühne: So funkt Juna in den Einsätzen von Akt 3 und 4 von draußen.
  - Die Gegenstimme über dem Tipptext des Einsatzes ist in Akt 1 bis 4 der Baron, ab Akt 5 ein Lautsprecher (Feld `voice` der Einsatz-Story): die Stimme aus den Lautsprechern ist nicht der Baron.

### A6 Zwischen den Sitzungen

- **Keine Wartezeiten, keine zeitgesteuerten Inhalte.** Die Timer in Gossip Harbor dienen dem Geldverdienen, nicht der Geschichte.
- **Ein Haken für das nächste Mal:** Jede Haupt-Szene endet offen. Ungelesenes zeigt das HQ als „Funk: 2 neu“.
- **Das Spielende:** Nach dem Einsatz des letzten Akts (Akt 7) kommt einmal der Bildschirm `ende`, das Ende der Geschichte: eine Überschrift, je ein Satz von Krümel und Ada, ein Satz außerhalb der Geschichte, die Liste dessen, was weiter geht, und im HQ die Karte „Bennos Tippstunde“ (Training, startet eine Trainingsrunde; darunter der Link „Das Ende noch einmal lesen“). Das alles ohne Namen, ohne Druck und ohne Wartezeit.
- **Bennos Tippstunde** (nach dem Finale): Die Karte im HQ startet eine Trainingsrunde im letzten Auftrag (alle Tasten, Fokus auf die drei schwächsten Lerneinheiten). Der Verlauf kennt die Runden als eigene Art `tippstunde`; sie bringen keine Stufen und keine Nebenszenen. Der Auslöser `training { round }` löst eine Szene nach der n-ten abgeschlossenen Tippstunden-Runde aus (Funk-Hinweis, die Nachbesprechung bleibt ruhig). Extra-Fälle brauchen weder Gadget (`needs`) noch bringen sie eins (`gives`); `afterCase` legt eine feste Reihenfolge fest (Fälle ohne Wartezeit, Story-Regel 11). Das Training bringt zehn Szenen nach Runden, die Abzeichen-Szene und die fünf **Fälle der Woche** (Pits Preisliste, Hupfs Dankesbrief, Die Elster zieht um, Die Nachbarstadt fragt, Maschine 4 fragt), der erste nach der zweiten Runde, jeder weitere nach dem vorigen; eine Runde unter dem Rahmen eines Falls zählt nicht als Tippstunden-Runde. Das Bündel ist kein Akt (`TrainingContent`, `content/story/training/`).
- Später vielleicht: eine Begrüßung nach ein paar Tagen Pause, nur freundlich.

### A7 Speicherung (Richtung, Details im Technik-Plan)

**Neu im Profil**

- `story.log`: ausgelöste Szenen mit Zeitpunkt, in Reihenfolge.
- `story.picks`: gewählte Antworten je Szene.
- `story.read`: gelesene Szenen.
- `lessons[id].best`: der höchste erreichte Fortschritt.
- `cases`: gelöste Extra-Fälle.

**Was nicht gespeichert, sondern berechnet wird**

- Chatverlauf, Reihenfolge der Nebenszenen und Besitz von Gadgets. Das folgt alles aus dem Log und den Abzeichen.

**Wann Szenen ausgelöst werden**

- Szenen, die am Spielstand hängen (Briefing, Stufe, geschafft, Einsatz, Abzeichen, Rang, Fall), prüft nach jeder speichernden Aktion eine reine Funktion `dueScenes`.
- Nebenszenen hängen am Ereignis „Durchgang ohne neue Stufe“ und werden nur in der Nachbesprechung ausgelöst.

**Alte Spielstände:** Alles, was nach dem Spielstand schon fällig wäre, gilt als ausgelöst und gelesen. So kommt keine Flut von Nachrichten.
