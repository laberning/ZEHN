---
id: ADR-0004
status: accepted
date: 2026-10-25
superseded_by: null
---
# ADR-0004: LPC-Grafiken, im Browser umgefärbt, ohne GPL

## Kontext und Problem

Kinder gestalten ihre Figur selbst, mit vielen Teilen und Farben. Fertige Pixel-Art in allen Farbkombinationen wäre riesig; eigene Figuren zu zeichnen, wäre zu viel Arbeit. Die Lizenzen der Teile müssen zu einem öffentlichen Projekt passen. (Nachträglich festgehalten.)

## Erwogene Optionen

1. **Kaufpakete (z. B. LimeZu)**: schön, aber proprietär, keine Weitergabe der Dateien.
2. **Universal LPC Spritesheet Character Generator**: Figuren in Ebenen, freie Lizenzen je Teil (CC0, CC-BY, OGA-BY, CC-BY-SA, GPL).

## Entscheidung

Option 2. Ein Build-Skript (`npm run assets:lpc`, `scripts/lpc/`) holt nur die benötigten Teile, schneidet vier Blickrichtungen aus und erzeugt Manifest und Credits; im Browser werden die Ebenen umgefärbt und gestapelt. Ein Teil kommt nur hinein, wenn es eine Lizenz ohne GPL zur Wahl hat. Kulissen, Krümel, Story-Bilder und Gadget-Symbole werden im Code gezeichnet.

## Folgen

- Credits-Seite im Spiel, `public/assets/CREDITS.csv` und `public/assets/LIZENZEN.md`; abgeleitete CC-BY-SA-Figuren stehen ebenfalls unter CC-BY-SA.
- Generierte Dateien werden nie von Hand geändert.
- Details: `docs/technik/assets.md`, `docs/design/grafik.md`.
