import { describe, expect, it } from 'vitest';
import { learnKeys } from '../../domain/keyboard.ts';
import { HOW_KINDS } from '../../domain/movement.ts';
import { keysUpTo, lessonOrder } from '../../domain/course.ts';
import { ALL_COURSE } from '../../test/content.ts';
import { MOVEMENT_TEXT_MAX, movementText } from './akte.ts';

describe('Oberflächentexte: Sätze zur häufigsten Bewegung', () => {
  const units = learnKeys(keysUpTo(ALL_COURSE, lessonOrder(ALL_COURSE).at(-1)!)).filter((u) => u !== ' ');

  it('Beispiele: Reihe, Hand, Vorgreifen, Umschalttaste, große Umlaute', () => {
    expect(movementText('k', 'up')).toBe('Beim K greifst du meist eine Reihe zu hoch: rechter Mittelfinger, bleib auf der Grundreihe.');
    expect(movementText('k', 'down')).toContain('eine Reihe zu tief');
    expect(movementText('k', 'hand')).toContain('andere Hand');
    expect(movementText('k', 'ahead')).toContain('zu früh vor');
    expect(movementText('shift-left', 'shift')).toBe('Beim Großschreiben hält meist die falsche Hand: linker kleiner Finger hält, die rechte Hand tippt.');
    expect(movementText('umlaute-gross', 'shift')).toContain('großen Umlaute');
  });

  it('Art und Einheit passen zusammen: Umschalt-Fehler nur an der Umschalttaste', () => {
    expect(movementText('k', 'shift')).toBeNull();
    expect(movementText('shift-right', 'up')).toBeNull();
  });

  it('jede Lerneinheit mit jeder Art: höchstens 100 Zeichen, mit Finger, ohne Zahlen, Prozent und Wertung', () => {
    expect(units.length).toBeGreaterThan(30);
    for (const unit of units) {
      for (const how of HOW_KINDS) {
        const t = movementText(unit, how);
        if (!t) continue;
        expect(t.length, t).toBeLessThanOrEqual(MOVEMENT_TEXT_MAX);
        expect(t, t).toMatch(/finger|Daumen/i);
        expect(t, t).not.toMatch(/%|schlecht|schlimm|besser|schlechter|immer|nie |noch nicht|verlier|nur heute/i);
        expect(t, t).not.toMatch(/\d{2}|mal\b/);
      }
    }
  });
});
