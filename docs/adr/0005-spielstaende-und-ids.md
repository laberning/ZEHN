---
id: ADR-0005
status: accepted
date: 2026-10-26
superseded_by: null
---
# ADR-0005: Spielstände: IDs als Speicherformat, Migration an einer Stelle

## Kontext und Problem

Spielstände leben lange im Browser der Kinder, während Kurs, Story und Belohnungen weiter wachsen. Ein Spielstand darf nie kaputtgehen, und neue Szenen sollen bei bestehenden Ständen nicht plötzlich alle auf einmal erscheinen. (Nachträglich festgehalten.)

## Erwogene Optionen

1. **Versionierte Migrationsschritte je Änderung**: genau, aber viel Code für kleine Änderungen.
2. **Eine tolerante Migration**: jedes Feld mit Typprüfung übernehmen, Fehlendes mit dem Startwert füllen; IDs nie umbenennen; eine Inhaltsversion für die Story.

## Entscheidung

Option 2.

- Gespeicherte Profile werden nur in `src/app/profileMigration.ts` auf den neuen Stand gebracht; fehlt ein Feld oder hat es den falschen Typ, gilt der Startwert aus `createProfile`.
- Szenen-, Antwort- und Item-IDs sind Speicherformat: nie umbenennen; nicht mehr gebrauchte IDs werden ignoriert.
- Besitz (Gadgets, Kleidung) wird nie gespeichert, sondern aus dem Story-Log berechnet.
- `STORY_VERSION` (`src/content/story/scenes.ts`) steigt, wenn neue Szenen bei bestehenden Spielständen nicht nachträglich erscheinen sollen; die Migration markiert dann alles Fällige als gelesen.

## Folgen

- Jede Änderung am Profil braucht einen Test mit einem alten bzw. kaputten Spielstand (`src/app/store.test.ts`).
- Kaputte Akten brechen das Spiel nicht ab; die Oberfläche zeigt einen Hinweis.
