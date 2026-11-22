---
id: ADR-0008
status: accepted
date: 2026-11-22
superseded_by: null
---
# ADR-0008: Commit-Nachrichten auf Deutsch

Ersetzt in ADR-0001 die Regel zur Sprache der Commit-Nachrichten; alles andere in ADR-0001 gilt weiter.

## Kontext und Problem

ADR-0001 legt englische Commit-Nachrichten fest. Spieltexte, Spieler-, Design- und Entwickler-Doku sowie die Entscheidungsprotokolle sind deutsch, und das Spiel richtet sich an Kinder und Eltern im deutschsprachigen Raum. Mit der Veröffentlichung ist die Historie zu einem Commit zusammengefasst; ab jetzt ist jeder Commit öffentlich. Eine einzige Sprache für alles, was Menschen im Repository lesen, ist einfacher.

## Erwogene Optionen

1. **Englisch bleibt**: wie in ADR-0001.
2. **Deutsch mit englischem Typ**: Betreff und Text deutsch, der Conventional-Commits-Typ (`feat:`, `fix:` …) bleibt englisch, damit Werkzeuge ihn weiter erkennen.

## Entscheidung

Option 2.

- Commit-Nachrichten folgen Conventional Commits; der Typ ist englisch (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `build:`, `ci:`), Betreff und Text sind deutsch.
- Betreff unter etwa 72 Zeichen, im Text das Warum; keine KI-Autor- oder Co-Autor-Zeilen.
- Bezeichner im Code bleiben englisch, Code-Kommentare deutsch oder englisch (ADR-0001).

## Folgen

- Der erste öffentliche Commit ist schon deutsch; die Regel in `AGENTS.md` ist angepasst.
