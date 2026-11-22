---
id: ADR-0007
status: accepted
date: 2026-11-08
superseded_by: null
---
# ADR-0007: Veröffentlichung über GitHub Pages, gebaut von GitHub Actions

## Kontext und Problem

ZEHN ist eine statische Web-App ohne Server (ADR-0002). Kinder sollen das Spiel ohne Installation unter einer festen Adresse spielen können; die README nennt dafür `https://laberning.github.io/ZEHN/`. Gebraucht wird ein Weg, der jeden Stand prüft, baut und dort ablegt, ohne dass jemand von Hand Dateien hochlädt, und der nur geprüfte Stände veröffentlicht.

## Erwogene Optionen

1. **Von Hand bauen und einen `gh-pages`-Zweig pushen**: kein Werkzeug nötig, aber ungeprüfte Stände sind möglich und der Zweig bläht die Historie auf.
2. **GitHub Actions baut, GitHub Pages veröffentlicht das Build-Artefakt**: Prüfung und Veröffentlichung in einem Lauf, kein zusätzlicher Zweig.
3. **Fremder Hoster (Netlify, Cloudflare Pages o. Ä.)**: Vorschauen je Pull Request, aber ein weiteres Konto und ein weiterer Dienst.

## Entscheidung

Option 2.

- Ein Workflow in `.github/workflows/` prüft bei jedem Push auf `main` und bei jedem Pull Request: `npm run check`, `npm run build` und `npm run e2e` (Chromium). Bei Pull Requests wird nichts veröffentlicht.
- Veröffentlicht wird bei jedem Push auf `main` und auf Knopfdruck (`workflow_dispatch`), und nur wenn alle Prüfungen grün sind. Der Inhalt ist `dist/` aus `npm run build`.
- Runner ist das neueste Ubuntu-Image mit festem Namen (heute `ubuntu-26.04`), nicht `ubuntu-latest`. Actions stehen auf ihrer aktuellen Hauptversion.
- Die Node-Version steht an einer Stelle, in `.nvmrc` (heute 26, die aktuelle LTS); `engines` in `package.json` und der Workflow folgen ihr. Lokal und in der Pipeline läuft dieselbe Version.
- Der Workflow hat nur die Rechte, die er braucht: Lesen für die Prüfungen, `pages: write` und `id-token: write` nur für das Veröffentlichen.

## Folgen

- In den Repository-Einstellungen muss GitHub Pages einmal auf die Quelle „GitHub Actions“ gestellt werden.
- Ein roter Stand auf `main` lässt die letzte veröffentlichte Version stehen.
- Alle Seiten unter `laberning.github.io` teilen sich einen Ursprung und damit IndexedDB. Der Name der Datenbank muss eindeutig für ZEHN bleiben.
- `vite.config.ts` baut mit relativen Pfaden (`base: './'`), damit das Spiel im Unterpfad `/ZEHN/` läuft. Das Spiel kommt ohne URL-Routing aus; damit gibt es keine Unterseiten, die auf Pages ins Leere führen.
- Neue Hauptversionen von Node, Runner oder Actions sind eine bewusste Änderung am Workflow, kein automatischer Wechsel.
