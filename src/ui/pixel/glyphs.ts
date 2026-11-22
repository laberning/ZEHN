// Kleine Pixel-Buchstaben (5×5, # = Strich) für Story-Bilder, in denen ein Buchstabe lesbar sein soll: die Vorlage für die Zeichen-Karte
// (die Durchsage in ui/pictures/cases.tsx zeichnet sie als Tinte auf Papier, StoryPicture.test.tsx prüft, dass sie dort stehen).

/** Die verschluckten Buchstaben im Fahrtwind (Extra-Fall Akt 3), N und M aus den Lücken in Ortruds Durchsagen („ ächster Halt: Bah hof“, „ ARKT“), B, H und A aus denselben Wörtern */
export const WIND_GLYPHS: Record<'N' | 'M' | 'B' | 'H' | 'A', readonly string[]> = {
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  B: ['####.', '#...#', '####.', '#...#', '####.'],
  H: ['#...#', '#...#', '#####', '#...#', '#...#'],
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
};
