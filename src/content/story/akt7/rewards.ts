// Belohnungs-Szenen, die zur Geschichte von Akt 7 gehören: Umhang (Benno), Dreispitz (Juna), Agentenstiefel (Ada, von Frau Hubbel),
// das Farbpaket „Gold“ (Ada nach dem Einsatz) und das Paket zum Abzeichen „Sonderzeichen gesichert“ (Augenklappe). Alle tragen
// `gift` und überreichen mit `gives`. Das Gadget der Geschichte (die Blindflug-Brille) überreicht die Haupt-Szene `a7-l2-brief`.
// Szenen-IDs sind Speicherformat: nie umbenennen. Die Vorrang-Reihenfolge (höchstens ein Geschenk je Durchgang) steht in content/story/acts.ts;
// das Farbpaket steht nach `a7-exam-after` und `a7-fest`.
// Quelle der Texte: Drehbuch Akt 7 (liegt nicht im Repository), „Belohnungen in der Geschichte“. Die Zettel stehen in content/items.ts (NOTES) und sind emoji-frei.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ben, jun, wardrobeChoices } from '../builders.ts';
import { cloth, gift, packageScene } from '../rewardBuilders.ts';

export const REWARDS: StoryScene[] = [
  // Benno zum Briefing von Auftrag 1 (nicht Teil von `a7-l1-brief`)
  gift('a7-gift-umhang', 'cape', { on: 'briefing', lessonId: 'm7-l1' }, ben),
  // Juna in Auftrag 2 bei 50 %, ZEHN intern
  gift('a7-gift-dreispitz', 'tricorne', { on: 'stage', lessonId: 'm7-l2', at: 0.5 }, jun),
  // Ada zum Briefing von Auftrag 3 (von Frau Hubbel)
  gift('a7-gift-agentenstiefel', 'agentboots', { on: 'briefing', lessonId: 'm7-l3' }, ada),
  // Ada nach dem Einsatz, ZEHN intern: das Farbpaket „Gold“
  {
    id: 'a7-gift-gold',
    chat: 'intern',
    trigger: { on: 'exam', moduleId: 'm7' },
    gives: ['colors-gold'],
    gift: true,
    lines: [
      ada('Gold. Für das O, das wieder hängt. Gold im Haar, Bernstein im Blick. Der Teig ist aufgegangen.'),
      ada(cloth('colors-gold').description, wardrobeChoices),
    ],
  },
  // Paket von Herrn Kringel zum Abzeichen (Krümel kündigt es an)
  packageScene('sonderzeichen', 'Paket für {vorname}. Von der Backstube. Hab getanzt und es trotzdem getragen.', 'eyepatch', undefined, {
    id: 'a7-badge-sonderzeichen',
    intro: 'Sonderzeichen gesichert! Alle Zeichen, alle Tasten, alle deine. ⚡',
  }),
];
