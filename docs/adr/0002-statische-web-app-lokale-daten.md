---
id: ADR-0002
status: accepted
date: 2026-10-25
superseded_by: null
---
# ADR-0002: Statische Web-App, Daten nur lokal

## Kontext und Problem

ZEHN richtet sich an Kinder von 10 bis 15 Jahren. Es soll ohne Installation im Browser laufen, ohne Konten und ohne dass Daten das Gerät verlassen. Fast alles ist Oberfläche: Text, Bildschirmtastatur, Menüs, kurze Animationen. (Nachträglich festgehalten; entschieden beim Projektstart.)

## Erwogene Optionen

1. **Web-App mit Server und Konten**: Fortschritt geräteübergreifend, aber Datenschutz und Betrieb für Kinderdaten.
2. **Game-Engine (z. B. PixiJS, Phaser)**: stark bei Action, schwach bei Text und Formularen.
3. **Statische Web-App mit React, Daten in IndexedDB**: kein Server, Sicherung als Datei.

## Entscheidung

Option 3: React, TypeScript und Vite; Zustand für den globalen Zustand; Dexie für IndexedDB. Kein Server, keine Konten, keine Anfragen an Dritte; Schriften liegen lokal (`@fontsource`, nur `latin-*`). Spielstände sichert man als Datei („Akte sichern“). Eine Game-Engine bleibt eine Option für spätere Actionszenen.

## Folgen

- Browserdaten löschen heißt Spielstand weg; deshalb gibt es die Sicherung als Datei.
- `localhost` und eine IP-Adresse haben getrennte Datenbanken.
- IDs entstehen über `env.id()`, weil `crypto.randomUUID` außerhalb von HTTPS/localhost fehlt.
