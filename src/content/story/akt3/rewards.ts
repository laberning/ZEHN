// Belohnungs-Szenen, die zur Geschichte von Akt 3 gehören: Kopftuch (Ada), Grubenstiefel (Frau Hubbel), Faltstiefel (Krümel) und
// das Paket zum Abzeichen „Untere Reihe gesichert“ (Leggings). Alle tragen `gift` und überreichen mit `gives`.
// Szenen-IDs sind Speicherformat: nie umbenennen. Die Vorrang-Reihenfolge (höchstens ein Geschenk je Durchgang) steht in content/story/acts.ts.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, hub, kr } from '../builders.ts';
import { gift, packageScene } from '../rewardBuilders.ts';

export const REWARDS: StoryScene[] = [
  // Ada zum Briefing von Auftrag 1 (nicht Teil von `a3-l1-brief`)
  gift('a3-gift-kopftuch', 'headscarf', { on: 'briefing', lessonId: 'm3-l1' }, ada),
  // Frau Hubbel zum Briefing von Auftrag 4
  gift('a3-gift-grubenstiefel', 'minerboots', { on: 'briefing', lessonId: 'm3-l4' }, hub),
  // Krümel nach dem Einsatz, die zweite Szene nach `a3-exam-after`
  gift('a3-gift-faltstiefel', 'boots', { on: 'exam', moduleId: 'm3' }, kr, 'kruemel'),
  // Paket von Herrn Kringel zum Abzeichen (Krümel kündigt es an)
  packageScene('untere-reihe', 'Paket für {vorname}. Von der Backstube. Mit der U-Bahn. Wegen der Beine.', 'leggings', undefined, {
    id: 'a3-badge-untere-reihe',
    intro: 'Untere Reihe gesichert! Sieben Buchstaben, drei Zeichen. Von unten bis oben sitzt alles. 🔋',
  }),
];
