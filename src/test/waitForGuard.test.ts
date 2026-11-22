import { describe, expect, it } from 'vitest';
import { STALE_WAIT_FOR, waitForGuard } from './waitForGuard.ts';

describe('waitForGuard', () => {
  it('reicht im laufenden Test an den eigentlichen Wrapper durch', () => {
    const guard = waitForGuard((cb) => cb());
    const wrap = guard.nextTest();
    expect(wrap(() => 'weiter')).toBe('weiter');
  });

  it('bricht ein waitFor aus einem früheren Test ab, statt die neue Uhr weiterzuschalten', () => {
    let advanced = 0;
    const guard = waitForGuard((cb) => {
      advanced++;
      return cb();
    });
    const stale = guard.nextTest();
    const fresh = guard.nextTest();
    expect(() => stale(() => undefined)).toThrow(STALE_WAIT_FOR);
    expect(fresh(() => 'ok')).toBe('ok');
    expect(advanced).toBe(1);
  });
});
