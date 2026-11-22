// Belohnungs-Szenen, die zur Geschichte von Akt 6 gehören: Epauletten (Ada), Manschetten („???“), Sandalen (Juna) und das Paket
// zum Abzeichen „Zahlen gesichert“ (Hohe Socken). Alle tragen `gift` und überreichen mit `gives`. Das Gadget der Geschichte
// (Bennos Monokel) überreicht die Haupt-Szene `a6-l4-s50`. Szenen-IDs sind Speicherformat: nie umbenennen.
// Die Vorrang-Reihenfolge (höchstens ein Geschenk je Durchgang) steht in content/story/acts.ts.
// Quelle der Texte: Drehbuch Akt 6 (liegt nicht im Repository), „Belohnungen in der Geschichte“. Die Zettel stehen in content/items.ts (NOTES) und sind emoji-frei.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, jun, unb, wardrobeChoices } from '../builders.ts';
import { cloth, gift, packageScene } from '../rewardBuilders.ts';

export const REWARDS: StoryScene[] = [
  // Ada zum Briefing von Auftrag 1 (nicht Teil von `a6-l1-brief`)
  gift('a6-gift-epauletten', 'epaulets', { on: 'briefing', lessonId: 'm6-l1' }, ada),
  // „???“ in Auftrag 4 bei 50 %, ZEHN intern (nach dem Monokel in `a6-l4-s50`; ein Durchgang bringt höchstens ein Geschenk)
  gift('a6-gift-manschetten', 'cuffs', { on: 'stage', lessonId: 'm6-l4', at: 0.5 }, unb),
  // Juna nach dem Einsatz, Chat Juna, die zweite Szene nach `a6-exam-after`; ihr Zwinkern steht in der Zeile, nicht auf dem Zettel (Dinge sind emoji-frei)
  {
    ...gift('a6-gift-sandalen', 'sandals', { on: 'exam', moduleId: 'm6' }, jun, 'juna'),
    lines: [jun(`${cloth('sandals').description} 😉`, wardrobeChoices)],
  },
  // Paket von Herrn Kringel zum Abzeichen (Krümel kündigt es an)
  packageScene('zahlen', 'Paket für {vorname}. Von der Backstube. Agent Kringel hat es gezählt. Dreimal.', 'socks', undefined, {
    id: 'a6-badge-zahlen',
    intro: 'Zahlen gesichert! Alle zehn, von 1 bis 0. Beide Hände, einmal hoch. ⚡',
  }),
];
