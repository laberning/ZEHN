// Netz für Umbauten, in beide Richtungen: Jede ID, die schon in Spielständen stehen kann, muss es weiter geben – und jede ID,
// die es gibt (Akte in ACTS und globale Kataloge), muss in knownIds.ts stehen. Fehlt eine: `npm run ids`.
// Beim Umzug eines Akts von STAGED_ACTS nach ACTS erzwingt das den Lauf von `npm run ids`.

import { describe, expect, it } from 'vitest';
import { presentIds } from './ids.ts';
import { KNOWN_IDS } from './knownIds.ts';

const present = presentIds();
const { answers: presentAnswers, ...presentLists } = present;
const { answers: knownAnswers, ...knownLists } = KNOWN_IDS;

describe('Bekannte IDs bleiben', () => {
  for (const [kind, ids] of Object.entries(presentLists)) {
    it(kind, () => {
      const missing = knownLists[kind as keyof typeof knownLists].filter((id) => !ids.includes(id));
      expect(missing, `${kind}: verschwunden – nie umbenennen, nur ergänzen`).toEqual([]);
    });
  }

  it('Antworten je Szene', () => {
    const missing = Object.entries(knownAnswers).flatMap(([sceneId, ids]) => ids.filter((id) => !presentAnswers[sceneId]?.includes(id)).map((id) => `${sceneId}/${id}`));
    expect(missing).toEqual([]);
  });
});

describe('Vorhandene IDs sind eingetragen', () => {
  for (const [kind, ids] of Object.entries(presentLists)) {
    it(kind, () => {
      const unlisted = ids.filter((id) => !knownLists[kind as keyof typeof knownLists].includes(id));
      expect(unlisted, `${kind}: nicht in knownIds.ts – bitte \`npm run ids\` ausführen`).toEqual([]);
    });
  }

  it('Antworten je Szene', () => {
    const unlisted = Object.entries(presentAnswers).flatMap(([sceneId, ids]) => ids.filter((id) => !knownAnswers[sceneId]?.includes(id)).map((id) => `${sceneId}/${id}`));
    expect(unlisted, 'Antworten nicht in knownIds.ts – bitte `npm run ids` ausführen').toEqual([]);
  });
});
