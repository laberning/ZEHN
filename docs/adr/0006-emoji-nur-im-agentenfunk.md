---
id: ADR-0006
status: accepted
date: 2026-11-06
superseded_by: null
---
# ADR-0006: Emoji nur im Agentenfunk, aus einer Positivliste je Figur

## Kontext und Problem

Bisher gilt überall „keine Emoji“ (Quellen, Oberfläche, Geschichte), weil Emoji eine Emoji-Schrift brauchen, die nicht auf jedem Gerät vorhanden ist, und weil Screenreader ihren Namen vorlesen. Der Agentenfunk ist aber wie ein Kurznachrichtendienst gebaut; dort schreiben die Figuren wie echte Leute, und echte Leute benutzen Emoji, jede nach ihrer Art. Gebraucht wird eine Regel, die den Funk lebendiger macht, ohne dass bei einem Kind leere Kästchen stehen oder eine Information nur im Emoji steckt.

## Erwogene Optionen

1. **Alles bleibt wie es ist**: keine Emoji, auch nicht im Funk.
2. **Positivliste und Schriftstapel**: eine kurze Liste erlaubter Emoji je Figur, nur aus älteren Unicode-Versionen (bis Emoji 5.0, 2017) und nur Einzel-Code-Punkte mit Emoji-Darstellung; die Schriftliste der App nennt die Emoji-Schriften der Systeme ausdrücklich. Keine Schrift wird mitgeliefert.
3. **Emoji-Schrift mitliefern**: `@fontsource/noto-color-emoji` lokal wie die anderen Schriften (ADR-0002). Geprüft: Das Paket ist die SVG-in-OpenType-Fassung; Chromium-Browser (Chrome, Edge) zeigen sie nicht in Farbe. Eine brauchbare Fassung (COLRv1, auf die Liste verkleinert) wäre eine eigene Pipeline mit Lizenz und Credits.

## Entscheidung

Option 2.

- **Wo:** Emoji stehen nur im Text einer Chat-Nachricht einer Figur im Funk. Nicht in Antworten des Kindes (Kurzformen, ganze Antworten, getippte Antworten), nicht in Systemzeilen und Karten, nicht im Bilderbuch, beim Erzähler, in Fallakten, Dingen, Abzeichen, Einsatz-Stories und in der Oberfläche. Im Code heißt das: nur in `src/content/story/`; alle anderen Quellen bleiben emoji-frei (Architektur-Test).
- **Welche:** Eine Positivliste je Sprecher (`src/content/story/emoji.ts`, `Record<Speaker, …>`, jeder neue Sprecher bekommt einen Eintrag). Jedes Emoji ist ein einzelner Code-Punkt mit `Emoji_Presentation`, aus Emoji 5.0 (2017) oder älter; keine Variantenselektoren, Hauttöne, Flaggen oder ZWJ-Folgen. Erweiterungen je Akt sind erlaubt, wenn sie diese Regel einhalten.
- **Wie viel:** höchstens ein Emoji je Nachricht und zwei je Szene; ein Emoji trägt nie allein eine Information, die das Kind für die Geschichte braucht. Die Persönlichkeit entscheidet: Juna am meisten, Krümel nur Technik und Backstube, Ada fast nie (ein Daumen zur falschen Zeit), der Baron ein festes Zeichen, nur unter seinem Namen; Frau Hubbel, „Unbekannt“, Erzähler, System und das Kind keine. Die Tabelle steht in `docs/design/story.md` (A5).
- **Anzeige:** Die Schriftliste der App endet mit `'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji'`; keine Emoji-Schrift wird mitgeliefert. Längen zählen Code-Punkte, nicht UTF-16-Einheiten; der Schreibmaschinen-Effekt zerschneidet kein Emoji.

## Folgen

- Die Inhaltstests prüfen Positivliste, Grenzen und Figurenregel; der Architektur-Test prüft den Rest der Quellen weiter auf „keine Emoji“.
- Auf einem Gerät ohne Emoji-Schrift (Linux ohne Noto Color Emoji) steht ein Kästchen; der Text bleibt verständlich, weil das Emoji nie allein etwas trägt. Zeigen Testrunden Kästchen bei vielen Kindern, ist eine verkleinerte COLRv1-Schrift (Option 3, eigene Pipeline) der nächste Schritt und ein neues ADR.
- ADR-0002 (Schriften liegen lokal) bleibt unverändert: Es gilt für Text-Schriften; Emoji kommen vom System.
