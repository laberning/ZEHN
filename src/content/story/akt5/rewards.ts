// Belohnungs-Szenen, die zur Geschichte von Akt 5 gehören: Gürtel (Ada), Hosenträger (Frau Hubbel), Farbpaket „Nacht“ (Krümel in Bruchstücken),
// Strubbelig (Juna) und das Paket zum Abzeichen „Satzzeichen gesichert“ (Bob). Alle tragen `gift` und überreichen mit `gives`.
// Szenen-IDs sind Speicherformat: nie umbenennen. Die Vorrang-Reihenfolge (höchstens ein Geschenk je Durchgang) steht in content/story/acts.ts.
// Quelle der Texte: Drehbuch Akt 5 (liegt nicht im Repository), „Belohnungen in der Geschichte“. Die Zettel stehen in content/items.ts (NOTES) und sind emoji-frei.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, hub, jun, kr, wardrobeChoices } from '../builders.ts';
import { cloth, gift, packageScene } from '../rewardBuilders.ts';

const BADGE_PACKAGE = packageScene('satzzeichen', 'Paket für {vorname}. Von der Backstube. Agent Kringel trug es. Mit Mantel.', 'bob', undefined, { id: 'a5-badge-satzzeichen' });

export const REWARDS: StoryScene[] = [
  // Ada zum Briefing von Auftrag 1 (nicht Teil von `a5-l1-brief`)
  gift('a5-gift-guertel', 'belt', { on: 'briefing', lessonId: 'm5-l1' }, ada),
  // Frau Hubbel in der Stufe 75 % von Auftrag 2, ZEHN intern (sie überreicht selbst, nicht Ada in ihrem Namen)
  gift('a5-gift-hosentraeger', 'suspenders', { on: 'stage', lessonId: 'm5-l2', at: 0.75 }, hub),
  // Krümel in Auftrag 3 bei 50 %, Chat Krümel: das Farbpaket in Bruchstücken (Ein-Wort-Sätze, Klammern erlaubt, keine Emoji)
  {
    id: 'a5-gift-nacht',
    chat: 'kruemel',
    trigger: { on: 'stage', lessonId: 'm5-l3', at: 0.5 },
    gives: ['colors-night'],
    gift: true,
    lines: [kr('Farben. Nacht. Für die Nachtschicht am Notfunk. (Von mir. Ganz.)'), kr(cloth('colors-night').description, wardrobeChoices)],
  },
  // Juna nach dem Einsatz, Chat Juna, die zweite Szene nach `a5-exam-after`; ihr Zwinkern steht in der Zeile, nicht auf dem Zettel (Dinge sind emoji-frei)
  {
    ...gift('a5-gift-strubbelig', 'messy', { on: 'exam', moduleId: 'm5' }, jun, 'juna'),
    lines: [jun(`${cloth('messy').description} 😉`, wardrobeChoices)],
  },
  // Paket von Herrn Kringel zum Abzeichen (Krümel kündigt es an)
  // (die Ankündigung ist auf zwei Nachrichten verteilt, im Wortlaut des Drehbuchs: die Längengrenze lässt sie nicht in einer zu)
  { ...BADGE_PACKAGE, lines: [kr('Satzzeichen gesichert!'), kr('Fragezeichen, Ausrufezeichen, Doppelpunkt, Semikolon, Anführungszeichen, Apostroph. ⚡'), ...BADGE_PACKAGE.lines] },
];
