// Belohnungs-Szenen, die zur Geschichte von Akt 2 gehören: Schal (Ada), Shorts (Krümel) und das Paket zum Abzeichen
// „Obere Reihe gesichert“ (Sonnenbrille). Alle tragen `gift` und überreichen mit `gives`. Die Lederkappe kommt in der
// Nebenszene `a2-side-juna-2` (side.ts). Szenen-IDs sind Speicherformat: nie umbenennen.
// Die Vorrang-Reihenfolge (höchstens ein Geschenk je Durchgang) steht in content/story/acts.ts.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, kr } from '../builders.ts';
import { gift, packageScene } from '../rewardBuilders.ts';

export const REWARDS: StoryScene[] = [
  // Ada zum Briefing von Auftrag 2 (nicht Teil von `a2-l2-brief`)
  gift('a2-gift-schal', 'scarf', { on: 'briefing', lessonId: 'm2-l2' }, ada),
  // Krümel nach dem Einsatz, die zweite Szene nach `a2-exam-after`
  gift('a2-gift-shorts', 'shorts', { on: 'exam', moduleId: 'm2' }, kr, 'kruemel'),
  // Paket von Herrn Kringel zum Abzeichen (Krümel kündigt es an)
  packageScene('obere-reihe', 'Paket für {vorname}. Von der Backstube. Ich stand drin. Ich frag nicht mehr.', 'sun', undefined, {
    id: 'a2-badge-obere-reihe',
    intro: 'Abzeichen: Obere Reihe gesichert! Elf Tasten, eine Reihe, null Höhenangst. Von dir. Von mir fast.',
  }),
];
