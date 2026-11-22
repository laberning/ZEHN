// Belohnungen: Sterne-Schwellen, Erfahrungspunkte und Ränge.

import type { RewardRules } from '../domain/rewards.ts';

export const REWARDS: RewardRules = {
  stars: { accuracyForTwo: 0.93, accuracyForThree: 0.97, speedFactorForThree: 1.05 },
  ranks: [
    { key: 'rekrut', title: 'Rekrut', titleW: 'Rekrutin', minXp: 0 },
    { key: 'anwaerter', title: 'Anwärter', titleW: 'Anwärterin', minXp: 150 },
    { key: 'agent', title: 'Agent', titleW: 'Agentin', minXp: 420 },
    { key: 'spezialagent', title: 'Spezialagent', titleW: 'Spezialagentin', minXp: 1500 },
    { key: 'geheimagent', title: 'Geheimagent', titleW: 'Geheimagentin', minXp: 3500 },
    { key: 'meisterhacker', title: 'Meisterhacker', titleW: 'Meisterhackerin', minXp: 7000 },
  ],
  // Bewusst knapp: eine Sitzung bringt etwa 20–40 EP, Akt 1 insgesamt etwa 500 (Rang Agent schon in Auftrag 6, nicht erst mit dem Einsatz).
  xp: { charsPerXp: 12, maxChars: 300, perStar: 4 },
  warmupXpFactor: 0.5,
  examPassXp: 60,
  examFailXp: 3,
  arcade: { pointsPerXp: 6, maxXp: 25 },
  recordMinAccuracy: 0.9,
};
