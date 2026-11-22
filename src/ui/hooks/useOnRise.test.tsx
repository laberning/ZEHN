import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useOnRise } from './useOnRise.ts';

describe('useOnRise', () => {
  it('ruft einmal je Wechsel von falsch auf wahr – mit der neuesten Funktion', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ flag, fn }) => useOnRise(flag, fn), { initialProps: { flag: false, fn: first } });
    expect(first).not.toHaveBeenCalled();
    rerender({ flag: true, fn: second });
    expect(second).toHaveBeenCalledTimes(1);
    rerender({ flag: true, fn: second });
    rerender({ flag: true, fn: first });
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    rerender({ flag: false, fn: first });
    rerender({ flag: true, fn: first });
    expect(first).toHaveBeenCalledTimes(1);
  });

  it('ruft sofort, wenn das Flag schon beim Start wahr ist', () => {
    const fn = vi.fn();
    renderHook(() => useOnRise(true, fn));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
