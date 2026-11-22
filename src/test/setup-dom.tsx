// Gemeinsames Setup für Komponententests (happy-dom).

import '@testing-library/jest-dom/vitest';
import { cleanup, configure, getConfig } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { waitForGuard } from './waitForGuard.ts';

// LPC-Figuren zeichnen auf ein Canvas – im Test reicht ein Platzhalter.
vi.mock('../ui/lpc/LpcSprite.tsx', () => ({
  LpcSprite: ({ title, facing = 'down' }: { title?: string; facing?: string }) => (
    <span data-testid="lpc-sprite" data-facing={facing}>
      {title}
    </span>
  ),
}));

// Testing Library erkennt Fake-Timer nur über ein globales `jest` und wartet sonst ewig auf setTimeout(0).
// Mit diesem Shim schaltet es bei Vitest-Fake-Timern die Zeit selbst weiter.
(globalThis as unknown as { jest: unknown }).jest = { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) };

// Ein waitFor, das nach einem Test-Timeout weiterläuft, darf den nächsten Test nicht übernehmen (siehe waitForGuard.ts)
const guard = waitForGuard(getConfig().unstable_advanceTimersWrapper);
beforeEach(() => {
  configure({ unstable_advanceTimersWrapper: guard.nextTest() });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
