# ZEHN – Agenten der Tastatur

Spielkonzept · Stand 25.10.2026 · Story, Chat und Belohnungen überarbeitet am 26.10.2026 · Handlung ohne Vorgriff seit 06.11.2026

> **Weiterführend:** [Story und Agenten-Chat – Mechanik](story.md) · [Story-Regeln](story-regeln.md) · [Belohnungen und Ausrüstung](belohnungen.md) (Gadgets, Kleidung, Extra-Fälle). Wo dieses Dokument davon abweicht, gelten diese Konzepte.


## Überblick

ZEHN ist ein Browserspiel, in dem Kinder das Zehn-Finger-Schreiben auf der deutschen QWERTZ-Tastatur lernen, indem sie als Geheimagent die gestohlenen Buchstaben der Stadt Bad Qwertz zurückholen. Jeder neu gelernte Buchstabe ist in der Story ein geretteter Buchstabe – Lernweg und Handlung sind dasselbe.

**Ziele**

- Sauberes Zehn-Finger-Schreiben nach bewährtem didaktischem Aufbau: erst Grundreihe, dann obere und untere Reihe, Großschreibung, Satzzeichen, Zahlen, Sonderzeichen.
- Motivation durch eine humorvolle, spannende Geschichte und Gamification – ohne Vergleich mit anderen.
- Jedes Kind wird in seiner eigenen Leistungsklasse gefordert und belohnt; Scheitern blockiert nie.

**Rahmen**

| Punkt | Festlegung |
| --- | --- |
| Zielgruppe | 10–15 Jahre, Ton und Texte zuerst auf 10-Jährige ausgerichtet |
| Einsatz | Zuerst die eigenen Kinder zu Hause, allein; später evtl. Schulklassen |
| Plattform | Browser, ohne Installation |
| Daten | Lokal im Browser, keine Konten, kein Server |
| Sitzungsdauer | 5–10 Minuten |
| Sprache | Deutsch |

## Welt und Figuren

Die Geschichte spielt in der verschlafenen Kleinstadt **Bad Qwertz**, deren Buchstaben nach und nach verschwinden. Der Ton ist humorvoll und augenzwinkernd, nie düster.

**Die Welt**

- **Bad Qwertz:** Kleinstadt mit Kurort-Charme. Der Name ist ein Tastatur-Wortspiel, das Kinder selbst entdecken sollen.
- **ZEHN:** Geheime Organisation, benannt nach den zehn Fingern. Schützt die Zeichen der Stadt.
- **Adas Backstube:** Die Bäckerei ist die Tarnung; im Keller liegt das Hauptquartier der ZEHN.
- **Tastatur als Landkarte:** Jede Tastenreihe ist ein Ort der Stadt (siehe Handlung).

**Figuren**

| Figur | Rolle | Charakter |
| --- | --- | --- |
| Spielerfigur | Rekrut/Rekrutin der ZEHN | Selbst gestaltet, mit Vorname und Codename |
| Ada | Mentorin, betreibt die Backstube | Älter, schrullig, warmherzig, trockener Humor; hat ein Geheimnis |
| Krümel | Kleine Drohne aus einer alten Keksdose, ständiger Begleiter und bester Freund (er) | Frech, liebenswert; gibt Tipps zur Fingerhaltung und kommentiert die Leistung – so wird Lernfeedback Teil der Story |
| Baron von Backspace | Gegenspieler | Theatralischer Meisterdieb nach dem Vorbild von Arsène Lupin: kündigt Coups an, hinterlässt Karten mit Goldrand, verkleidet sich, entkommt immer, verletzt nie jemanden |

Dazu kommen Juna Pösel (Kiosk-Tochter, Freundin und Rivalin, Kanal „Qwertz-Flüstern“) und Herr Kringel (Postbote, in Ada verliebt). Weitere Figuren treten als Gäste auf, höchstens eine neue je Akt und vor allem in Nebenszenen.

**Botschaft:** Fehler und Scheitern sind okay, Dranbleiben lohnt sich.

**Story-Vorlage:** Eigene Welt, Dramaturgie angelehnt an die gemeinfreien Arsène-Lupin-Romane von Maurice Leblanc (angekündigte Coups, Visitenkarten, Verkleidungen, Duell der Klügsten, Ehrenkodex). Gegen künstlich wirkende Texte: konkrete Figuren mit Macken, kurze Dialoge, Gegenlesen und Testen mit den Kindern.

## Handlung

Die Handlung läuft in sieben Akten, einer pro Lernmodul; jeder Akt bringt neue Tasten und endet mit einem Einsatz (Prüfung). Jede beantwortete Frage öffnet eine größere. Die Handlung der Akte steht bewusst nicht in diesem Repository: Was die Kinder selbst herausfinden sollen, verrät keine Datei hier. Die Texte der gebauten Akte stehen im Quellcode (`src/content/story/`).

| Akt / Modul | Schauplatz | Neue Tasten | Einsatz (was er beweist) |
| --- | --- | --- | --- |
| 1 Grundreihe | Hauptquartier und Grundnetz | A S D F G H J K L Ö Ä | Die Firewall: die Grundreihe sitzt |
| 2 Obere Reihe | Dächer und Funktürme | Q W E R T Z U I O P Ü | Die Verfolgungsjagd: Tempo |
| 3 Untere Reihe | Untergrund: U-Bahn und Stadtarchiv | Y X C V B N M , . - | Die Datenflut: Fluss ohne Pflicht-Korrektur |
| 4 Großschreibung | Der Turm des Barons | Umschalttasten, ß, Ä Ö Ü (groß) | Sturm auf den Turm: Großschreibung unter Druck |
| 5 Satzzeichen | Ganz Bad Qwertz, Stadtfest | ? ! : ; " ' | Die Durchsage: Satzzeichen |
| 6 Zahlen | Der Tresor | 4 5 6 7 3 8 1 0 2 9 | Der Tresor: Zahlen |
| 7 Sonderzeichen | Finale | @ € { [ ] } \ ~ \| (AltGr) | Das Duell: alles, in hohem Tempo |
| ∞ Training | – | alle Tasten | – (eigene Entwicklung seit Akt 1) |

**Story-Regeln**

- Die Geschichte läuft **nach jedem Durchgang** als Chat im Agentenfunk (Kurzform wählen, danach steht die ganze Antwort im Chat; selten tippt man sie selbst). Große Momente bleiben Bilderbuch-Szenen: Prolog, Briefing von Auftrag 1, der Auftritt des Barons am Ende von Auftrag 6, Einsatz-Intro, -Erfolg und -Hintertür.
- Haupt-Szenen (Briefing, Stufen bei 25/50/75 %, Abschluss, Einsatz) bekommen alle in fester Reihenfolge; wer länger braucht, bekommt zusätzlich Nebenszenen. Ein Story-Objekt je Auftrag (z. B. Krümels Kamera-Auge) zeigt den Fortschritt.
- Erwachsene schreiben dem Kind nie privat; Herr Kringel und Otti sind nie im Chat. Keine Wartezeiten.
- Die getippten Texte sind Teil der Handlung (Zugangscodes, entschlüsselte Botschaften, Funksprüche).
- Während des Tippens keine Unterbrechungen; über dem Tipptext stehen nur das Story-Objekt, die Tastensiegel und Krümels Hinweis. Die Story-Szenen sind kurz.
- Siegel sind milde: Ein Riegel (Genau, Tempo), der einmal offen war, schließt sich nicht wegen eines einzelnen Fehlers, sondern erst bei deutlich schlechteren Werten (Genau unter Schwelle − 10 Punkte, Tempo über 1,25 × Grenze). Das gilt für Anzeige und Freischaltung gleich. Ist „Genau“ zu, zeigt das Siegel „noch N Treffer“. Gewertet wird weiter genau, und schwache Tasten kommen nach den echten Werten öfter dran.
- Jede Sitzung endet mit einem kleinen Cliffhanger.

## Didaktik

Der Kurs folgt der klassischen Reihenfolge deutscher Tastschreibkurse (z. B. Tipp10, Schulunterricht) und schaltet neue Tasten erst frei, wenn die bisherigen sicher sitzen.

**Module und Tastenreihenfolge**

| Modul | Tasten (Reihenfolge) | Textform |
| --- | --- | --- |
| 1 Grundreihe | f j → d k → s l → a ö → g h → ä | Ab a s d f j k l ö echte Wörter: das, als, lass, Saal |
| 2 Obere Reihe | e i → r u → t z → w o → q p → ü | Kurze Sätze |
| 3 Untere Reihe | n m → c , → v . → b - → x y | Fast alle Wörter |
| 4 Großschreibung | Shift rechts → Shift links → ß → gemischt (vier Aufträge) | Echte deutsche Sätze |
| 5 Satzzeichen | ? ! : ; " ' | Dialoge, Nachrichten |
| 6 Zahlen | 4 5 6 7 → 3 8 → 1 0 → 2 9 (vier Aufträge, nach Fingern: Zeige-, Mittel-, kleine, Ringfinger) | Codes, Koordinaten |
| 7 Sonderzeichen | AltGr: @ € { } [ ] u. a. | „Hacker-Befehle“ |
| ∞ Training | alle | Bennos Tippstunde: 60-Sekunden-Runden mit allen Tasten, Fokus auf die drei schwächsten Lerneinheiten, Sätze aus der Geschichte (ein Drittel des Texts); danach die eigene Entwicklung seit Akt 1, nur Vergleich mit sich selbst; Abzeichen „Tippstunde“ (zehn Runden) |

**Stand der Module:** Alle sieben Module sind im Spiel, die Geschichte ist vollständig; nach dem Einsatz von Akt 7 zeigt der Bildschirm `ende` das Finale und das HQ die Karte „Bennos Tippstunde“ (Mechanik in `story.md`, A6). Extra-Fälle gibt es in Akt 1 (drei, über Spielhallen-Gadgets) und Akt 3 („Die verschluckte Durchsage“); Akt 4 bis 7 haben keine eigenen, nach dem Finale kommen die fünf Fälle der Woche des Trainings. Je Modul festgelegt:

- **Modul 3 (Untere Reihe):** fünf Aufträge in der Tastenreihenfolge der Tabelle, fünf Story-Objekte, Einsatz „Flucht vor der Datenflut“ (Fluss-Modus, Hintergrund `tunnel`, Sprecherin Frau Hubbel).
- **Modul 4 (Großschreibung):** vier Aufträge (Q W E R T A S D F G Y X C V B → Z U I O P H J K L N M → ß → Ä Ö Ü; die Zeichen sind die Großbuchstaben), vier Story-Objekte, Einsatz „Sturm auf den Turm“ (strikt, Hintergrund `turm`).
- **Modul 5 (Satzzeichen):** drei Aufträge (`?` `!` → `:` `;` → `"` `'`; alle auf der Umschalt-Ebene, je eine Lerneinheit mit eigenem Siegel), Wortliste mit Festwörtern und Apostroph-Wörtern, drei Story-Objekte, Einsatz „Die Durchsage“ (strikt, Hintergrund `marktplatz`), zerkratzte Fallakten im HQ als abgeleiteter Zustand, Gadget Notfunkgerät.
- **Modul 6 (Zahlen):** vier Aufträge nach Fingern (`4` `5` `6` `7` → `3` `8` → `1` `0` → `2` `9`, jede Ziffer eine Lerneinheit; eigene Zahlengruppen im Übungstext), vier Story-Objekte, Einsatz „Der Tresor“ (strikt, Hintergrund `tresor`), Sprecher Tippi (korrigierte Nachrichten) und Benno, getippte Codes in den Abschlüssen, Gadget Bennos Monokel.
- **Modul 7 (Sonderzeichen):** drei Aufträge (`@` `€` → `{` `[` `]` `}` → `\` `~` `|`; alle auf der Alt-Gr-Ebene, der rechte Daumen hält Alt Gr), drei Story-Objekte, Einsatz „Das Duell“ (strikt, Tempo-Ziel 60 Anschläge je Minute, Hintergrund `zentrale`, Lautsprecherstimme als Gegenstimme), Abschlussakte mit den Taten des Kindes aus allen Akten, Gadget Blindflug-Brille, Fest im Chat Juna.

Jedes Modul besteht aus mehreren **Aufträgen** (Lektionen) und endet mit einem **Einsatz** (Prüfung): 6 · 6 · 5 · 4 · 3 · 4 · 3 Aufträge. Akt 4 und 6 bekommen einen vierten Auftrag, weil Großschreibung und Zahlen viel Übung brauchen und diese Akte die Mitte und die Wendung der Geschichte tragen.

**Anpassung an das Kind**

- **Tastenprofil:** Pro Taste werden Trefferquote und Reaktionszeit gemessen.
- **Schwache Tasten:** Kommen häufiger vor, aber höchstens zu etwa einem Viertel bis einem Drittel des Textes, damit es nicht frustriert.
- **Textlänge:** Richtet sich nach dem aktuellen Tempo, sodass eine Übung 1–2 Minuten dauert.
- **Freischaltung:** Neue Tasten erst, wenn die bisherigen sicher sitzen (Mastery-Prinzip).

**Fehlermodus**

- **Anfang (Pflicht):** Bei einem Fehler geht es erst weiter, wenn die richtige Taste gedrückt wird. So schleichen sich keine Fehlgewohnheiten ein.
- **Ab etwa Modul 3 (optional):** Krümel erfindet den **Flow-Chip**. Im Hauptquartier lässt sich einstellen, dass Fehler nur rot aufleuchten und man weitertippt. Jederzeit umschaltbar. Der Schalter „Flow-Chip: an/aus“ steht im HQ neben „Sound“ von Anfang an zur Verfügung (Gadgets schalten keine Bedienung frei); er gilt für alle Übungsrunden, in der Übung zeigt ein Schild „Flow-Chip an“ den Modus. Einsätze und Spielhalle haben eigene Regeln: der Einsatz von Modul 3 läuft immer im Fluss-Modus (Fehler leuchten, man tippt weiter; bewertet über Genauigkeit und Tempo wie jeder Einsatz), die Einsätze der Module 1 und 2 bleiben strikt (`ExamCriteria.mode`).

**Feedback nach der Runde** (nur melden, nichts werten, nichts speichern)

- **Rundenhinweis:** Nach jeder Übungsrunde (Zwischen-Panel) und in der Nachbesprechung (über den Siegeln) sagt Krümel in einem Satz, welche Lerneinheit in dieser Runde am häufigsten danebenging, mit Finger und Rückweg: „Die 4 ging dreimal daneben: linker Zeigefinger, hoch und zurück auf F.“ Ab zwei Fehlern auf derselben Lerneinheit, bei Gleichstand die zuerst danebengegangene; Umschalt-Einheiten nennen die haltende Hand („Umschalt rechts hielt nicht: rechter kleiner Finger hält, die linke Hand tippt.“). Gibt es keine Taste mit zwei Fehlern, aber ab drei Fehlern über beide Hände, erinnert er an die Grundstellung („Viele kleine Ausrutscher: Finger zurück auf F und J, Hubbel fühlen, dann weiter.“). Hat die Taste mit den meisten Fehlern mindestens zwei Fehler derselben Art (gleicher Finger, aber eine Reihe zu hoch oder zu tief; die gleiche Taste der anderen Hand; vorgegriffen, also das nächste Zeichen getippt), nennt der Satz sie: „Die Taste K ging dreimal daneben, meist eine Reihe zu hoch: rechter Mittelfinger, bleib auf der Grundreihe.“ Wurden mindestens zwei Großbuchstaben mit der falschen Hand gehalten (auch richtig getippte), kommt dieser Satz zuerst: „Das große T: die Umschalttaste hielt die falsche Hand. Rechter kleiner Finger hält, die linke Hand tippt.“ Die Hand kennt nur die echte Tastatur (`ShiftLeft`/`ShiftRight`); ohne Codes gibt es keinen solchen Hinweis. Gibt es keine Taste mit zwei Fehlern, aber ein Muster mit mindestens drei Fehlern, die mindestens die Hälfte der Fehler der Runde sind, nennt er das Muster: am Wortanfang (direkt nach der Leertaste: „Die Fehler kamen meist am Wortanfang: nach der Leertaste kurz atmen, Finger auf F und J, dann los.“), Hast (schneller als 60 % der mittleren Zeit der richtigen Anschläge dieser Runde; ohne Zeitmessung oder nach einer Pause über 3 s zählt ein Fehler nicht: „Die Fehler kamen meist zu schnell: einen Tick langsamer, dann sitzt jeder Anschlag.“) oder derselbe Finger (direkt nach einer anderen Taste desselben Fingers: „Zweimal derselbe Finger hintereinander, da rutscht er: kurz absetzen, dann weiter.“); „zu langsam“ sagt er nie. Ein Satz je Runde: Umschalt-Hand vor Fehlerart vor Taste vor Wortanfang vor Hast vor derselbe Finger vor Streuung. Sonst kein Satz. Der Hinweis wird aus den Anschlägen der Runde abgeleitet (`roundReview`, `roundAdvice`), ändert nichts an Siegeln, Sternen oder Profil und wird nicht gespeichert; Krümel spricht, nie ein Vergleich.
- **Finger in allen Ratgeber-Sätzen:** Wo Krümel, das HQ („Noch zu tun“), die Akte („Übe besonders“) oder der Elternbericht eine Taste nennen, steht der Finger in Klammern („K (rechter Mittelfinger): genauer tippen“).
- **Ziffernblock:** Eine Ziffer vom Ziffernblock zählt weiter nicht, zeigt aber unter dem Text einen Hinweis wie bei der Feststelltaste („Der Ziffernblock zählt nicht …“); er verschwindet mit dem nächsten gültigen Anschlag, die Position im Text ändert sich nicht.
- **Spezialtraining** nennt seine Tasten (Überschrift „Spezialtraining: K Ö S“, Knopf „Spezialtraining (K Ö S)“).
- **Krümels Tipps nach Thema:** allgemein, Umschalttaste, Zahlen, Alt Gr (vorbereitet); gewählt wird die Liste nach den Lerneinheiten des aktuellen Moduls, darin der Reihe nach.
- **Finger-Regel beim Wiederholen:** Die Missionskarte im HQ zeigt für den aktuellen Auftrag die Finger der neuen Tasten („D – linker Mittelfinger · K – rechter Mittelfinger“), sobald das Briefing gesehen ist.

**Ziele**

- **Prüfungen:** Feste, faire Mindestschwelle, vor allem bei der Genauigkeit; Tempo moderat.
- **Sterne, Punkte, viele Abzeichen:** Am eigenen Fortschritt gemessen, z. B. „+10 % schneller als dein Durchschnitt“ oder neuer persönlicher Rekord.
- **Orientierung am Kursende:** Etwa 120–180 Anschläge pro Minute bei mindestens 95 % Genauigkeit – als Richtwert, nicht als Pflicht.

## Spielablauf

Eine Sitzung dauert 5–10 Minuten und folgt immer demselben Muster: Briefing, Tippen, Belohnung, Cliffhanger.

**Ablauf einer Sitzung**

1. **Hauptquartier:** Avatar, Karte von Bad Qwertz, Funk („neu“), Abzeichen, Akte, Garderobe und Koffer, Extra-Fälle, Einstellungen (z. B. Flow-Chip).
2. **Briefing:** wenige Nachrichten von Ada oder Krümel im Funk, z. B. „Der Baron hat das E aus dem Funkturm geklaut. Wir holen es zurück.“
3. **Aufwärmen:** 20 Sekunden mit bekannten Tasten.
4. **Übungen:** 2–3 Übungen à 1–2 Minuten. Der Text erscheint als Terminal-Eingabe, Botschaft oder Code. Keine Story-Unterbrechungen beim Tippen.
5. **Abschluss:** Sterne, Erfahrungspunkte, ggf. Abzeichen, Siegel mit der Veränderung im Durchgang, danach neue Szenen im Funk (oder ein Hinweis auf eine Nebenszene) mit Cliffhanger.

**Bildschirmtastatur**

- Finger farbig zugeordnet; die nächste Taste und der richtige Finger sind hervorgehoben.
- Gelernte Tasten leuchten, noch nicht gelernte sind „gelöscht“: ausgegraut und glitchig.
- Kurze Animation bei jedem Tastendruck, deutliche Rückmeldung bei Fehlern.
- Passt sich der Höhe und Breite des Fensters an: Auf kleinen Bildschirmen und Tablets werden Tasten, Übungstext und Siegel-Leiste kleiner (die Tastenschrift bleibt lesbar), damit die ganze Tastatur ohne Scrollen sichtbar bleibt; ab 760 px Fensterhöhe und 1100 px Breite wie am großen Monitor (schmale Fenster wie ein Tablet hochkant bekommen einen kleineren Übungstext).
- **Die Tastatur ist fest, der Text gibt nach.** In Übung, Einsatz und Tippstunde ist der Bildschirm so hoch wie das Fenster: Auch bei einem langen Text (schnelle Kinder bekommen bis zu 400 Zeichen) bleiben Kopf, Siegel, Hinweiszeile und die ganze Tastatur im Bild. Das Textfeld zeigt so viele ganze Zeilen, wie Platz ist (mindestens zwei), und rollt mit der Schreibmarke zeilenweise mit; die aktuelle und die nächste Zeile sind immer zu sehen, eine unten angeschnittene Zeile blendet weich aus.
- **Quer und niedrig** (Tablet quer, kleiner Laptop, auch ein Handy quer): Kopf, Story-Objekt, Siegel und Krümels Hinweis (im Einsatz Baron, Ziel, Zeitbalken und Firewall) stehen in einer Seitenleiste links, Text und Tastatur rechts; die Tasten sind dort höher. **Hochkant** (Tablet hochkant) und **ab 760 px Höhe** steht alles untereinander. Auf einem schmalen Handy brechen Siegel und Köpfe um, nichts ragt aus dem Fenster.
- Ausblendbar als **Blindflug** (Einstellung `blind`, von Anfang an, freiwillig, jederzeit umschaltbar): Im HQ und in der Kopfzeile des Schreibtischs steht ein Knopf, der die Bildschirmtastatur in Aufträgen, Training und Tippstunde wegnimmt (der Einsatz bleibt, wie er ist). Die Hinweiszeile mit Finger und Taste, der Text und die Siegel bleiben, Fehler zeigen weiter nur Text und Ton. Der Knopf wirkt sofort, solange in der Runde noch keine Taste getippt ist (oder zwischen zwei Runden), sonst ab der nächsten Runde, und eine Zeile an der Stelle der Tastatur sagt es; nach einer Blindflug-Runde sagt Krümel einen Satz ohne Zahl und ohne Vergleich. Mit der Blindflug-Brille (Akt 7) heißt der Knopf „Blindflug“, sonst „Tastatur“. Eine zweite Stufe (halbe Tastatur) ist nicht gebaut.

**Einsatz (Prüfung)**

Erkennt das System, dass die Tasten eines Moduls sicher sitzen, ruft Ada zum Einsatz. Der nächste Akt beginnt erst danach (bestanden oder über die Hintertür). Es ist eine Actionszene mit Zeitvorgabe und Mindestgenauigkeit, zum Beispiel: jedes richtige Wort zerstört ein Firewall-Segment. Der Druck entsteht durch die Szene, nicht durch davonlaufenden Text.

Wenn es nicht klappt:

1. Krümel ermutigt und nennt den Stand („Verbindung verloren. Stand: 80 %. Die Firewall wartet, noch mal!“). Sofort neuer Versuch mit neuem Text.
2. Oder **Spezialtraining** von 1–2 Minuten mit genau den Tasten, an denen es gehakt hat, danach neuer Versuch.
3. Nach 3 Fehlversuchen öffnet Ada eine **Hintertür:** Man spielt weiter, der Einsatz bleibt auf der Karte als „unsicher“ markiert und kehrt später als Bonusauftrag zurück. Niemand bleibt stecken, aber Fehler bleiben nicht unbemerkt.

## Gamification

Von allem etwas, aber nur im Vergleich mit sich selbst – keine Bestenlisten, keine Duelle mit anderen.

| Element | Funktion |
| --- | --- |
| Agentenrang | Erfahrungspunkte führen über sechs Ränge vom Rekruten bis zum Meisterhacker (Akt 1 ≈ 500 EP; Rang „Agent“ ab 420 EP, also gegen Ende von Akt 1). Ada gratuliert im Chat, Krümel druckt den Ausweis neu. |
| Sterne pro Auftrag | Bis zu 3 Sterne für Genauigkeit und Tempo, gemessen am eigenen Durchschnitt; lädt zum Wiederholen ein. |
| Abzeichen | Kategorien Fortschritt („Grundreihe gesichert“), Präzision („50 Anschläge fehlerfrei“), Ausdauer („an 7 Tagen trainiert“) und geheime Abzeichen als Easter Eggs. |
| Agententage | Zählen die Tage, an denen trainiert wurde; die Zahl sinkt nie. Ersetzt die frühere Serie „Tage am Stück“, die über Verlustangst band ([Story-Regeln](story-regeln.md), Regel 11). |
| Ausrüstung | Zwei Arten: **Gadgets** (Agentenkoffer: Story, Spielhalle, Extra-Fälle; nur für die Geschichte) und **Kleidung** (Garderobe, nur für den Look). Kleidung kommt aus Abzeichen als Paket von Herrn Kringel, Gadgets von Krümel; jede Belohnung überreicht eine Figur. Details: [Belohnungen](belohnungen.md). |
| Extra-Fälle | Kleine Fälle neben der Hauptgeschichte; sie zählen wie ein Training. Die Fälle von Akt 1 und 3 öffnet ein Spezial-Gadget aus der Spielhalle, und sie bringen ein neues Gadget; die Fälle der Woche im Training brauchen und bringen keins. |
| Agentenakte | Tempokurve, Tastatur-Wärmekarte mit stärksten und schwächsten Tasten, persönliche Rekorde. Eltern können hineinschauen; es gibt keine Kontrollfunktionen. |

## Profile und Charakter

Jedes Kind hat ein eigenes lokales Profil mit Vorname, Codename und Avatar; ein festes Profil-Limit gibt es nicht.

**Namen**

- **Vorname:** Damit sprechen Ada und Krümel das Kind persönlich an („Gut gemacht, Lena!“).
- **Codename:** Steht auf Agentenausweis und Akte. Frei eingeben (gleich die erste kleine Tippübung) oder würfeln.
- **Würfel:** Name aus der Liste plus zweistellige Nummer, z. B. „Agentin Vektor-07“ oder „Agent Proxy-42“. Die Liste wird auf etwa 40 Namen ausgebaut.

| Kategorie | Beispiele |
| --- | --- |
| Technik | Cipher, Proxy, Vektor, Kernel, Cursor, Signal, Pixel, Router, Firewall |
| Agenten-Klassiker | Phantom, Schatten, Delta, Sigma, Orbit, Nova, Zero, Falke |
| Zusammengesetzt | Nachtschreiber, Datenfalke, Codebrecher, Funkstille, Tastengeist, Netzläufer |

**Avatar**

Bewusst kleine Auswahl: Geschlecht, Hautfarbe, Haarfarbe, Augenfarbe, Kleidungsstil. Weitere Kleidung und Gadgets kommen über Abzeichen dazu.

**Profilverwaltung**

- Kein festes Limit; die Auswahl ist auf 4–6 Profile ausgelegt und scrollt bei Bedarf.
- Keine Passwörter, Auswahl über den Avatar.
- Alles lokal im Browser.

## Gestaltung und Sound

Die Oberfläche ist eine dunkle Agentenzentrale im Terminal-Look, die Figuren sind Pixel-Art; Sound gibt es nur als kurze Effekte, keine Musik.

**Optik**

- **Oberfläche:** Dunkler Hintergrund mit Neonakzenten (Cyan, Magenta, Grün), hoher Kontrast, gut lesbarer Tipptext.
- **Figuren und Welt:** Pixel-Art – beliebt in der Altersgruppe und passend zum Retro-Hacker-Flair. Die Backstube oben darf gemütlich-warm wirken, das HQ darunter kühl-neonfarben.
- **Avatar in Ebenen:** Körper, Haare, Augen, Kleidung. Freie Grafiksammlungen (siehe [Grafik](grafik.md)) sind die Basis.

**Sound** (alles abschaltbar)

- Leises mechanisches Klicken beim Tippen
- Kurzes, sanftes „Glitch“ bei Fehlern, nicht schrill
- Kleiner Jingle bei Levelende und Abzeichen

## Erste Version: Akt 1

Die erste spielbare Version umfasst Modul 1 (Grundreihe) mit Story-Akt 1, um sie mit den Kindern zu testen und dann weiterzubauen.

**Aufträge in Akt 1**

| Nr. | Tasten | Story |
| --- | --- | --- |
| 0 | – | Prolog: Die Schilder in Bad Qwertz verlieren Buchstaben. In Adas Backstube führt eine Klappe in den Keller: das HQ der ZEHN. Profil anlegen, Vorname, Codename, Avatar. |
| 1 | f j | „Erstkontakt“: Die fühlbaren Erhebungen auf den Tasten sind die Geheimzeichen der Agenten. Grundstellung lernen. |
| 2 | d k | Grundausbildung bei Ada, Krümel stellt sich vor. |
| 3 | s l | Die erste Visitenkarte des Barons wird entschlüsselt. |
| 4 | a ö | Erste echte Wörter (das, als, lass, Saal) – die Botschaft wird lesbar. |
| 5 | g h | Die Spur führt in die Stadt. |
| 6 | ä + Wiederholung | Das Grundnetz wird gesichert. |
| E | alle | Einsatz: Der Baron greift das Grundnetz an, die Firewall halten. Er entkommt und hinterlässt ein Rätsel als Cliffhanger für Akt 2. |

Ein Auftrag kann mehrere Sitzungen dauern; das Mastery-Prinzip entscheidet, wann es weitergeht.

**Enthalten in der ersten Version**

- Profilverwaltung mit Vorname, Codename-Würfel und einfachem Avatar
- Hauptquartier mit Karte, Akte und Abzeichen
- Bildschirmtastatur mit Fingerfarben und Animation
- Tastenprofil, adaptive Übungstexte und Textlänge
- Übungstexte mit Satzzeichen: Komma und Punkt hängen am Ende eines Wortes (danach Leerzeichen, am Textende nur der Punkt), der Bindestrich verbindet zwei Wörter ohne Leerzeichen („tunnel-karte“). Ab Akt 5 kommen die Zeichen mit Umschalttaste dazu: Fragezeichen und Ausrufezeichen schließen einen Satz wie der Punkt (auch am Textende), Doppelpunkt und Semikolon hängen wie das Komma an ein Wort (nie am Textende), Anführungszeichen stehen paarweise um genau eine Einheit („"komm"“, auch am Textende, beide Anschläge zählen), und der Apostroph steht nur in Wörtern der Wortliste („geht's“, „gibt's“), nie in Übungsgruppen; gibt es kein passendes Wort, läuft die Runde ohne ihn. Sie stehen nie am Anfang, nie doppelt und nie mitten in einer Übungsgruppe; je Einheit gibt es höchstens ein Satzzeichen; nach einem Punkt, Fragezeichen oder Ausrufezeichen beginnt die nächste Einheit groß, sobald ihr Großbuchstabe gelernt ist (siehe Großschreibung unten). Gewicht wie jede Taste (neue doppelt); liegt eine neue Satzzeichen-Taste unter ihrem Soll, kommt sie als Nächstes. Der Einsatz kann mit `keys: 'learned'` alle bis dahin gelernten Tasten nutzen (Modul-Tasten als Fokus), wenn die Tasten des Moduls allein keine Wörter ergeben (Akt 3)
- Übungstexte mit Großschreibung (ab Akt 4): Großbuchstaben stehen wie in echtem Text am Anfang einer Einheit (Wort oder Übungsgruppe), nie mitten im Wort und nie nach einem Bindestrich; nach einem Punkt immer, sobald der Großbuchstabe gelernt ist. Die Wortlisten bleiben klein geschrieben. Gelernt wird der Griff zur Umschalttaste der anderen Hand, nicht „das große T“: Alle Großbuchstaben A–Z einer Hand zählen für ein Tastenprofil und ein Siegel ihrer Umschalttaste („Umschalt rechts“ für die Buchstaben der linken Hand, „Umschalt links“ für die der rechten); ein Auftrag mit 15 Großbuchstaben zeigt also ein Siegel. ß behält ein eigenes Siegel; Ä Ö Ü haben zusammen ein Siegel „Große Umlaute“ (eine Lerneinheit, der Ring liegt auf den drei Tasten ä, ö, ü; geübt wird der Griff mit der linken Umschalttaste und dem rechten kleinen Finger). Die Umschalttaste hat ihr Gewicht als Lerneinheit (neu doppelt, Schwächen wie bei jeder Taste), umgerechnet auf Einheiten: Im eigenen Auftrag beginnt etwa jede zweite Einheit groß (rund fünf Großbuchstaben je 40-Zeichen-Runde), später etwa jede vierte; liegt eine Umschalttaste unter ihrem Soll, kommt sie als Nächstes (die großen Umlaute über Wörter mit ä, ö, ü am Anfang; im Auftrag mit ihnen beginnt etwa jede dritte Einheit mit einem großen Umlaut, dazu kommen die Großbuchstaben der Umschalttasten). Ist eine Umschalttaste schwach, liegt der Fokus des Spezialtrainings auf den Großbuchstaben ihrer Hand. Die Bildschirmtastatur zeigt den Siegel-Ring auf der Umschalttaste und leuchtet sie, sobald ein Großbuchstabe ihrer Hand gelernt ist; Wärmekarte und „Übe besonders“ färben weiter nur Buchstabentasten. Die Spielhalle bleibt in Kleinschrift (ß, Ä Ö Ü kommen dazu wie jede Taste). Die Feststelltaste bleibt gesperrt: Großbuchstaben gibt es nur mit der Umschalttaste.
- Übungstexte mit Zahlen (ab Akt 6): Ziffern stehen in Zahlengruppen aus zwei bis vier Ziffern („4765“, „10“) als eigene Einheiten zwischen den Wörtern, nie mitten in Buchstabengruppen und nie in einem Wort; eine Zahl besteht nur aus Ziffern, die schon gelernt sind. Vor jeder Einheit entscheidet ein eigener Schritt, ob eine Zahl kommt: sicher, wenn eine neue Ziffer unter ihrem Soll liegt, sonst mit der Wahrscheinlichkeit des Gewichtsanteils der Ziffern an allen Buchstaben- und Ziffern-Lerneinheiten (auf lange Sicht ist etwa ein Drittel der Zeichen im eigenen Auftrag eine Ziffer, später weniger; in einer kurzen Übungsrunde mit vier neuen Ziffern ist etwa jede zweite Einheit eine Zahl, weil jede neue Ziffer gleich zu Beginn einmal kommt). Jede Ziffer hat Gewicht, Siegel und Profil wie jede Taste (neue doppelt). Hinter einer Zahl darf wie hinter einem Wort ein Satzzeichen stehen („4765,“ „10.“), der Bindestrich darf zwei Zahlen oder Zahl und Wort verbinden („12-13“), Anführungszeichen stehen nicht um Zahlen; nach „10.“ beginnt die nächste Einheit groß. Gelernt wird der Griff zur Zahlenreihe über den Buchstaben, ohne Umschalttaste; die Ziffern des Ziffernblocks zählen nicht (die Eingabe ignoriert `Numpad…`). Ziffern geschaffter Aufträge kommen in der Spielhalle wie Satzzeichen vor, Ring und Wärme der Bildschirmtastatur wirken ohne Änderung.
- Übungstexte mit Sonderzeichen (ab Akt 7): Die neun Zeichen der Alt-Gr-Ebene stehen wie in echtem Text nur in einer Rolle, nie in Wörtern oder Übungsgruppen. `@` verbindet zwei Wörter ohne Leerzeichen („otti@tippnix“, nie mit Zahlen, nie zwei hintereinander), `€` hängt ohne Leerzeichen an einer Zahl („15€“), `{ }` und `[ ]` rahmen eine Einheit paarweise („{stopp}“, „[12]“; beide Anschläge zählen, nie hinter Bindestrich oder `@`, nie um ein Anführungszeichen-Paar), `\` und `~` stehen als Präfix direkt vor einem Wort („\stopp“, „~ort“; die Einheit beginnt dann nicht groß) und `|` steht als eigene Einheit mit Leerzeichen beidseitig zwischen zwei Einheiten (nie am Anfang oder Ende). `@`, `|` und die Paare gehören zum Satzzeichen-Schritt nach der Einheit (je Einheit höchstens ein Zeichen daraus), die Präfixe zu einem Schritt vor der Einheit, `€` zum Zahl-Schritt. Jedes Zeichen hat Gewicht, Siegel und Profil wie jede Taste (neue doppelt); liegt ein Fokus-Zeichen unter seinem Soll, kommt seine Form als Nächstes (für `€` entsteht eine Zahl), sonst entscheidet der Zufall nach dem Gewicht. `€` kommt nur, wenn Ziffern erlaubt sind, ein Paar nur mit beiden Hälften. Gelernt wird der Griff mit gehaltener Alt-Gr-Taste (rechter Daumen), der Finger der Taste tippt; am Mac liegen die Zeichen anders (Wahltaste), gezählt wird das Zeichen. Die Bildschirmtastatur zeigt Ring und Wärme auch für das Alt-Gr-Zeichen einer Taste (zuerst das offene Siegel unter Grundzeichen, Umschalt-Zeichen und Alt-Gr-Zeichen) und blendet das gelernte Zeichen klein unten rechts ein; die Namen der Zeichen (At-Zeichen, Euro-Zeichen, geschweifte und eckige Klammer auf/zu, Backslash, Tilde, senkrechter Strich) stehen in Lob und Hinweisen. Ziffern und Sonderzeichen geschaffter Aufträge kommen in der Spielhalle wie Satzzeichen vor.
- Fehlermodus „Pflicht“ und Flow-Chip (Schalter im HQ, gilt für Übungsrunden)
- Einsatz mit Wiederholung, Spezialtraining und Hintertür
- Rang, Sterne, erste Abzeichen, Agententage
- Soundeffekte

## Offene Punkte und nächste Schritte

- [x] Technik festlegen (siehe [Architektur](../technik/architektur.md))
- [ ] Grafik-Sammlungen auswählen und Lizenzen prüfen
- [ ] Konkrete Schwellen für Mastery und Einsatz (Genauigkeit, Tempo je Modul)
- [x] Anzahl Fehlversuche vor der Hintertür: 3
- [x] Reihenfolge der Tasten in Modul 3: n m → c , → v . → b - → x y
- [x] Reihenfolge der Tasten in Modul 4: Großbuchstaben der linken Hand → der rechten Hand → ß → Ä Ö Ü
- [x] Story-Texte für Akt 1 geschrieben und umgesetzt (`src/content/story/akt1/`)
- [ ] Wortlisten je Buchstabenstand
- [x] Abzeichen-Liste und Belohnungen für Akt 1 (siehe [Belohnungen](belohnungen.md))
- [ ] Codename-Liste auf etwa 40 Namen erweitern
