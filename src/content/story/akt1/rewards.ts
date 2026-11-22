// Belohnungs-Szenen, die zur Geschichte von Akt 1 gehören: Adas Agentenbrille zum bestandenen Einsatz und die Kleidung zu
// Abschlüssen der Aufträge. Alle tragen `gift` und überreichen mit `gives`. Szenen-IDs sind Speicherformat: nie umbenennen.
// Die Vorrang-Reihenfolge (höchstens ein Geschenk je Durchgang) steht in content/story/acts.ts.

import type { StoryScene } from '../../../domain/scenes.ts';
import { itemDescription } from '../../items.ts';
import { ada, kr, wardrobeChoices } from '../builders.ts';
import { RETIRED, gift } from '../rewardBuilders.ts';

export const REWARDS: StoryScene[] = [
  // Ada zum bestandenen Einsatz
  {
    id: 'badge-grundreihe',
    chat: 'intern',
    trigger: { on: 'badge', badgeId: 'grundreihe' },
    gives: ['shades'],
    gift: true,
    lines: [ada('Etwas von mir persönlich: die Agentenbrille.'), ada(itemDescription('shades')), kr('Sie liegt schon im Kleiderschrank.', wardrobeChoices)],
  },

  // Kleidung aus der Geschichte (zum Abschluss eines Auftrags oder nach dem Einsatz)
  gift('gift-polo', 'polo', { on: 'mastered', lessonId: 'm1-l2' }, ada),
  gift('gift-stirnband', 'headband', { on: 'mastered', lessonId: 'm1-l3' }, kr, 'kruemel'),
  gift('gift-weste', 'vest', { on: 'mastered', lessonId: 'm1-l5' }, ada),
  // stillgelegt: der Einsatz bringt nur die Agentenbrille; die Melone ist für einen späteren Akt zurückgelegt
  { ...gift('gift-melone', 'bowler', { on: 'exam', moduleId: 'm1' }, ada), retired: RETIRED },
];
