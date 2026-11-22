import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { keyStat } from '../../test/factories.ts';
import { sealOf, type MasteryCriteria } from '../../domain/mastery.ts';
import { LessonCheck } from './LessonCheck.tsx';

const C: MasteryCriteria = { minSamples: 30, minAccuracy: 0.92, maxAvgMs: 1500 };
const status = { keys: [sealOf('k', keyStat({ samples: 40, accuracy: 0.85, avgMs: 500 }), C)], exercises: 1, minExercises: 2, mastered: false };

describe('LessonCheck', () => {
  it('Nachbesprechung: der Rundenhinweis der letzten Runde steht über den Siegeln', () => {
    const { container } = render(<LessonCheck status={status} before={status.keys} review={{ kind: 'key', unit: 'k', misses: 2 }} />);
    const note = screen.getByText('Die Taste K ging zweimal daneben: rechter Mittelfinger, bleib auf der Grundreihe.');
    const seals = container.querySelector('.lesson-check > :not(.kruemel-say)');
    expect(seals).not.toBeNull();
    expect(note.compareDocumentPosition(seals!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('abgerutschte alte Taste: der Satz steht unter dem Rundenhinweis und vor den Siegeln', () => {
    const slipped = { before: sealOf('d', keyStat({ accuracy: 0.95 }), C, ['precision']), after: sealOf('d', keyStat({ accuracy: 0.7 }), C) };
    const { container } = render(<LessonCheck status={status} before={status.keys} review={{ kind: 'key', unit: 'k', misses: 2 }} slipped={slipped} />);
    const round = screen.getByText(/Die Taste K ging zweimal daneben/);
    const note = screen.getByText(/Die Taste D ist abgerutscht: linker Mittelfinger, bleib auf der Grundreihe\./);
    const seals = container.querySelector('.lesson-check > :not(.kruemel-say)');
    expect(round.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(note.compareDocumentPosition(seals!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('ohne abgerutschte Taste kein Satz dazu', () => {
    render(<LessonCheck status={status} before={status.keys} />);
    expect(screen.queryByText(/abgerutscht/)).toBeNull();
  });

  it('ohne Hinweis nur Krümels Rat', () => {
    render(<LessonCheck status={status} before={status.keys} />);
    expect(screen.queryByText(/ging .* daneben|Ausrutscher/)).toBeNull();
  });
});
