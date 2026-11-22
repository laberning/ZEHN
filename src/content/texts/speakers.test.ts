import { describe, expect, it } from 'vitest';
import { SPEAKER_INITIALS, speakerName } from './speakers.ts';

describe('Oberflächentexte: Sprecher', () => {
  it('Sprechername mit Platzhaltern; Erzähler ohne Namen', () => {
    expect(speakerName('player', { vorname: 'Mia' })).toBe('Mia');
    expect(speakerName('baron', {})).toBe('Baron von Backspace');
    expect(speakerName('erzaehler', {})).toBe('');
  });

  it('Frau Hubbel hat Namen und Kürzel „H“', () => {
    expect(speakerName('hubbel', {})).toBe('Frau Hubbel');
    expect(SPEAKER_INITIALS.hubbel).toBe('H');
  });

  it('Tippi (Kürzel „T“) und Benno (Kürzel „B“) haben Namen und Kürzel', () => {
    expect(speakerName('tippi', {})).toBe('Tippi');
    expect(SPEAKER_INITIALS.tippi).toBe('T');
    expect(speakerName('benno', {})).toBe('Benno');
    expect(SPEAKER_INITIALS.benno).toBe('B');
  });
});
