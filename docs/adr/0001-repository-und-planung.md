---
id: ADR-0001
status: accepted
date: 2026-11-01
superseded_by: ADR-0008 (teilweise: Sprache der Commit-Nachrichten)
---
# ADR-0001: Repository, Planung und Commits

## Kontext und Problem

Bisher lagen Konzepte und Umsetzungspläne als Dateien in `docs/technik/` und nach der Umsetzung in `docs/technik/archiv/`. Das Repository soll öffentlich werden; Planungsnotizen, halbfertige Ideen und persönliche Werkzeug-Einstellungen gehören nicht hinein. Die Arbeit läuft überwiegend mit KI-Agenten.

## Erwogene Optionen

1. **Pläne weiter im Repository**: alles an einem Ort, aber Planung wird öffentlich und die Doku wächst mit Historie zu.
2. **Planung privat außerhalb des Repositorys, Regeln für den Code im Repository**: das Repository enthält nur, was für den Code gilt.

## Entscheidung

Option 2.

- Im Repository: Code, Tests, Spieler-, Design- und Entwickler-Doku, diese Entscheidungsprotokolle und `AGENTS.md` (Regeln für alle, die am Code arbeiten).
- Außerhalb, privat: Planung (Stories, Recherchen, erledigte Pläne) und persönliche Werkzeug-Dateien der KI-Agenten (`CLAUDE.md`, `.claude/`). Diese sind über `.git/info/exclude` ausgeschlossen, nicht über `.gitignore`.
- Repository-Dateien verweisen auf Entscheidungen nur per ADR-Nummer, nie auf Planungsnotizen.
- Commit-Nachrichten auf Englisch nach Conventional Commits (`feat:`, `fix:`, `docs:` …), ohne KI-Autor- oder Co-Autor-Zeilen. Spieltexte und Doku bleiben deutsch; Code-Kommentare deutsch oder englisch.

## Folgen

- `docs/technik/archiv/` entfällt; Verweise darauf sind entfernt.
- Größere Änderungen werden vor der Umsetzung geplant und geprüft, aber nicht mehr als Datei im Repository.
- Vor der Veröffentlichung wird die Historie zusammengefasst (squash); ältere Commits bleiben bis dahin, wie sie sind.
