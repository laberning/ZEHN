---
id: ADR-0003
status: accepted
date: 2026-10-26
superseded_by: null
---
# ADR-0003: Functional Core, Ports & Adapters, Tests ohne Browser

## Kontext und Problem

Spielregeln (wann sitzt eine Taste, wann kommt eine Szene, wann ein Geschenk) und Abläufe (Übungsrunde, Einsatz, Chat) wurden mit dem Inhalt schnell komplex. Sie sollen schnell und ohne Browser testbar sein, und Inhalte sollen ohne Codeänderung wachsen. (Nachträglich festgehalten.)

## Erwogene Optionen

1. **Logik in Komponenten und Hooks**: schnell geschrieben, aber nur im Browser bzw. mit DOM testbar, Abhängigkeiten kreuz und quer.
2. **Functional Core / Imperative Shell mit Ports & Adapters**: Regeln und Abläufe als reine Funktionen und Reducer; Seiteneffekte in einer dünnen Schale hinter Schnittstellen.

## Entscheidung

Option 2, mit den Schichten `domain/`, `content/`, `app/`, `platform/`, `ui/`, `features/`, `shell/` und dem Composition Root `main.tsx`. Zeit, Zufall und IDs kommen als Werte in die reinen Funktionen. Die Schale ist nach Features geschnitten; Features importieren einander nicht. Die Regeln prüft `src/architecture.test.ts` automatisch. Getestet wird fast alles ohne Browser (Vitest in node und happy-dom), dazu ein einziger Playwright-Smoke-Test.

## Folgen

- Die Tests laufen in Sekunden; Abläufe werden über Reducer oder Store-Szenarien mit Attrappen getestet.
- Keine Zeitraffer- oder Test-Hooks im Produktcode.
- Details: `docs/technik/architektur.md`, `docs/technik/tests.md`, Regeln in `AGENTS.md`.
