import { afterEach, describe, expect, it, vi } from 'vitest';
import { newId } from './id.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('newId', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('funktioniert auch ohne crypto.randomUUID (unsichere Umgebung)', () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a.fill(7) });
    expect(newId()).toMatch(UUID);
  });

  it('funktioniert ganz ohne crypto', () => {
    vi.stubGlobal('crypto', undefined);
    const a = newId();
    expect(a).toMatch(UUID);
    expect(newId()).not.toBe(a);
  });
});
