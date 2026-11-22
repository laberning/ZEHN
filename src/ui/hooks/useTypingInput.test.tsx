// Tippeingabe: die Ziffer der Zahlenreihe zählt, die des Ziffernblocks nicht; Alt Gr (unter Windows Strg+Alt) liefert das Zeichen der Alt-Gr-Ebene.

import { fireEvent, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createGameStore } from '../../app/store.ts';
import { memoryRepository } from '../../platform/memoryRepository.ts';
import { clockEnv, soundRecorder } from '../../test/factories.ts';
import { GameProvider } from '../app/GameProvider.tsx';
import { useTypingInput } from './useTypingInput.ts';

function setup() {
  const store = createGameStore({ repo: memoryRepository([]), sound: soundRecorder(), env: clockEnv() });
  const wrapper = ({ children }: { children: ReactNode }) => <GameProvider store={store}>{children}</GameProvider>;
  const onChar = vi.fn();
  renderHook(() => useTypingInput(true, onChar), { wrapper });
  return onChar;
}

describe('useTypingInput', () => {
  it('die Ziffer von Digit4 zählt, die von Numpad4 nicht', () => {
    const onChar = setup();
    fireEvent.keyDown(window, { key: '4', code: 'Digit4' });
    expect(onChar).toHaveBeenCalledTimes(1);
    expect(onChar.mock.calls[0]![0]).toBe('4');
    fireEvent.keyDown(window, { key: '4', code: 'Numpad4' });
    fireEvent.keyDown(window, { key: ',', code: 'NumpadDecimal' });
    expect(onChar).toHaveBeenCalledTimes(1);
  });

  it('Buchstaben zählen weiter', () => {
    const onChar = setup();
    fireEvent.keyDown(window, { key: 'a', code: 'KeyA' });
    expect(onChar).toHaveBeenCalledTimes(1);
  });

  it('Alt Gr zählt: Strg+Alt+Q (so meldet Windows Alt Gr) liefert das @, auch mit Alt Gr allein; Strg allein und Cmd nicht', () => {
    const onChar = setup();
    fireEvent.keyDown(window, { key: '@', code: 'KeyQ', ctrlKey: true, altKey: true });
    fireEvent.keyDown(window, { key: '€', code: 'KeyE', altKey: true });
    expect(onChar.mock.calls.map((c) => c[0])).toEqual(['@', '€']);
    fireEvent.keyDown(window, { key: 'q', code: 'KeyQ', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'q', code: 'KeyQ', metaKey: true });
    expect(onChar).toHaveBeenCalledTimes(2);
  });
});

describe('useTypingInput: Umschalt-Hand', () => {
  const shifts = (onChar: ReturnType<typeof setup>) => onChar.mock.calls.map((c) => c[2]?.shift);

  it('ShiftLeft/ShiftRight über keydown/keyup; beide gedrückt oder keine Codes: keine Aussage', () => {
    const onChar = setup();
    fireEvent.keyDown(window, { key: 'Shift', code: 'ShiftRight' });
    fireEvent.keyDown(window, { key: 'T', code: 'KeyT', shiftKey: true });
    fireEvent.keyUp(window, { key: 'Shift', code: 'ShiftRight' });
    fireEvent.keyDown(window, { key: 'Shift', code: 'ShiftLeft' });
    fireEvent.keyDown(window, { key: 'K', code: 'KeyK', shiftKey: true });
    fireEvent.keyDown(window, { key: 'Shift', code: 'ShiftRight' });
    fireEvent.keyDown(window, { key: 'A', code: 'KeyA', shiftKey: true });
    fireEvent.keyUp(window, { key: 'Shift', code: 'ShiftLeft' });
    fireEvent.keyUp(window, { key: 'Shift', code: 'ShiftRight' });
    fireEvent.keyDown(window, { key: 'B', shiftKey: true }); // Bildschirmtastatur: ohne Code
    fireEvent.keyDown(window, { key: 'b', code: 'KeyB' });
    expect(shifts(onChar)).toEqual(['right', 'left', undefined, undefined, undefined]);
  });

  it('Verlassen des Fensters setzt die Merker zurück', () => {
    const onChar = setup();
    fireEvent.keyDown(window, { key: 'Shift', code: 'ShiftLeft' });
    fireEvent.blur(window);
    fireEvent.keyDown(window, { key: 'a', code: 'KeyA' });
    expect(shifts(onChar)).toEqual([undefined]);
  });
});
