// Echte Uhr, echter Zufall, echte IDs – nur hier und in main.tsx.

import type { Env } from '../app/ports.ts';
import { newId } from './id.ts';

export const browserEnv: Env = {
  now: () => Date.now(),
  seed: () => Math.floor(Math.random() * 2 ** 32),
  id: () => newId(),
};
