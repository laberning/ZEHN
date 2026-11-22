// Belohnungs-Szenen, die zur Geschichte von Akt 4 gehören: Krawatte (Ada), Fliege (Juna), Melone (Ada), Nadelstreifen (Krümel) und das Paket
// zum Abzeichen „Großschreibung gesichert“ (Agentenlook). Alle tragen `gift` und überreichen mit `gives`.
// Szenen-IDs sind Speicherformat: nie umbenennen. Die Vorrang-Reihenfolge (höchstens ein Geschenk je Durchgang) steht in content/story/acts.ts.
// Quelle der Texte: Drehbuch Akt 4 (liegt nicht im Repository), „Belohnungen in der Geschichte“. Die Zettel stehen in content/items.ts (NOTES) und sind emoji-frei.

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, jun, kr, wardrobeChoices } from '../builders.ts';
import { cloth, gift, packageScene } from '../rewardBuilders.ts';

export const REWARDS: StoryScene[] = [
  // Ada zum Briefing von Auftrag 1 (nicht Teil von `a4-l1-brief`)
  gift('a4-gift-krawatte', 'necktie', { on: 'briefing', lessonId: 'm4-l1' }, ada),
  // Juna zum Abschluss von Auftrag 2, ZEHN intern; ihr Zwinkern steht in der Zeile, nicht auf dem Zettel (Dinge sind emoji-frei)
  {
    ...gift('a4-gift-fliege', 'bowtie', { on: 'mastered', lessonId: 'm4-l2' }, jun),
    lines: [jun(`${cloth('bowtie').description} 😉`, wardrobeChoices)],
  },
  // Ada zum Abschluss von Auftrag 3, nach dem Geständnis (`a4-l3-done` kommt davor)
  gift('a4-gift-melone', 'bowler', { on: 'mastered', lessonId: 'm4-l3' }, ada),
  // Krümel nach dem Einsatz, die zweite Szene nach `a4-exam-after`; die Herkunft aus dem Turm steht in der Zeile, der Zettel bleibt der alte
  {
    ...gift('a4-gift-nadelstreifen', 'striped', { on: 'exam', moduleId: 'm4' }, kr, 'kruemel'),
    lines: [kr(`Aus dem Turm, Garderobe unten: ${cloth('striped').name}. ${cloth('striped').description}`, wardrobeChoices)],
  },
  // Paket von Herrn Kringel zum Abzeichen (Krümel kündigt es an)
  packageScene('grossschreibung', 'Paket für {vorname}. Von der Backstube. Großes Paket. Großer Tag, sagt sie.', 'agent', undefined, {
    id: 'a4-badge-grossschreibung',
    intro: 'Großschreibung gesichert! Zwei Umschalttasten, ein ß, drei große Umlaute. Nichts bleibt klein. ⚡',
  }),
];
