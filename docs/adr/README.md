# Entscheidungsprotokolle (ADR)

Jede Entscheidung, die das Projekt prägt, steht hier als kurzes ADR (Architecture Decision Record).

## Ablauf

- Dateiname `NNNN-titel-in-kebab-case.md`, fortlaufend nummeriert, Nummern werden nie wiederverwendet.
- Format: Frontmatter `id`, `status`, `date`, `superseded_by`; Abschnitte Kontext und Problem, Erwogene Optionen, Entscheidung, Folgen.
- Status: `proposed` (in Diskussion), `accepted` (gilt), `superseded` (ersetzt; `superseded_by` nennt den Nachfolger). Bei teilweiser Ersetzung bleibt der Status `accepted`, und `superseded_by` nennt den Nachfolger mit dem ersetzten Teil.
- Ein ADR darf frei geändert werden, bis es zum ersten Mal committet ist. Danach ist eine Änderung ein neues ADR, das das alte ganz oder teilweise ersetzt; das alte bleibt stehen, nur `status` und `superseded_by` im Frontmatter werden angepasst.
- ADRs stehen für sich: Sie verweisen nicht auf Planungsnotizen außerhalb des Repositorys.

## Übersicht

| ID | Titel | Status | Datum |
|---|---|---|---|
| [ADR-0001](0001-repository-und-planung.md) | Repository, Planung und Commits | accepted, teilweise ersetzt durch ADR-0008 | 2026-11-01 |
| [ADR-0002](0002-statische-web-app-lokale-daten.md) | Statische Web-App, Daten nur lokal | accepted | 2026-10-25 |
| [ADR-0003](0003-functional-core-ports-adapters.md) | Functional Core, Ports & Adapters, Tests ohne Browser | accepted | 2026-10-26 |
| [ADR-0004](0004-lpc-grafiken.md) | LPC-Grafiken, im Browser umgefärbt, ohne GPL | accepted | 2026-10-25 |
| [ADR-0005](0005-spielstaende-und-ids.md) | Spielstände: IDs als Speicherformat, Migration an einer Stelle | accepted | 2026-10-26 |
| [ADR-0006](0006-emoji-nur-im-agentenfunk.md) | Emoji nur im Agentenfunk, aus einer Positivliste je Figur | accepted | 2026-11-06 |
| [ADR-0007](0007-veroeffentlichung-github-pages.md) | Veröffentlichung über GitHub Pages, gebaut von GitHub Actions | accepted | 2026-11-08 |
| [ADR-0008](0008-commit-nachrichten-deutsch.md) | Commit-Nachrichten auf Deutsch | accepted | 2026-11-22 |

## Vorlage

```markdown
---
id: ADR-NNNN
status: accepted
date: YYYY-MM-DD
superseded_by: null
---
# ADR-NNNN: <Titel>

## Kontext und Problem

## Erwogene Optionen

1. **<Option>**: <eine Zeile>.

## Entscheidung

Option <n>. <Was entschieden ist, als Regeln.>

## Folgen
```
