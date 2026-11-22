// Fremde Werke, die im Spiel stecken (außer den LPC-Figuren, die kommen aus lpc.generated.json).

export const LICENSE_URLS: Readonly<Record<string, string>> = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/deed.de',
  'CC-BY 3.0': 'https://creativecommons.org/licenses/by/3.0/deed.de',
  'CC-BY 4.0': 'https://creativecommons.org/licenses/by/4.0/deed.de',
  'CC-BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/deed.de',
  'CC-BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/deed.de',
  'OGA-BY 3.0': 'https://static.opengameart.org/OGA-BY-3.0.txt',
  'GPL 2.0': 'https://www.gnu.org/licenses/old-licenses/gpl-2.0.html',
  'GPL 3.0': 'https://www.gnu.org/licenses/gpl-3.0.html',
};

/** Einleitung der Credits-Seite (verrät den Namen des Meisterdiebs nicht – die Seite ist von Anfang an offen) */
export const CREDITS_INTRO =
  'ZEHN – Agenten der Tastatur ist ein Familienprojekt von Marlene und Lars. Der Meisterdieb der Geschichte ist inspiriert von Arsène Lupin aus den Romanen von Maurice Leblanc (gemeinfrei). Krümel und die Symbole sind eigene Pixelgrafiken. Code, Texte und eigene Grafiken stehen unter der MIT-Lizenz.';

/** Weitere Quellen (Requisiten, Schriften, Software). `changes`: was wir verändert haben (CC-BY-SA verlangt das) */
export const OTHER_CREDITS: readonly { what: string; who: string; license: string; url: string; changes?: string }[] = [
  { what: 'Schrift „Silkscreen“', who: 'Jason Kottke', license: 'SIL Open Font License 1.1', url: 'https://fonts.google.com/specimen/Silkscreen' },
  { what: 'Schrift „JetBrains Mono“', who: 'JetBrains', license: 'SIL Open Font License 1.1', url: 'https://www.jetbrains.com/lp/mono/' },
  { what: 'Brot-Kacheln in der Backstube („[LPC] Foods“)', who: 'bluecarrot16, Daniel Eddeland, Joshua Taylor, Richard Kettering, thekingphoenix, RedVoxel, Molly „Cougarmint“ Willits', license: 'CC-BY-SA 3.0', url: 'https://opengameart.org/content/lpc-food', changes: 'einzeln ausgeschnitten und auf den sichtbaren Teil zugeschnitten, sonst unverändert' },
  { what: 'Paket („CC0 Storage Icons“)', who: '7Soul1, gesammelt von AntumDeluge', license: 'CC0', url: 'https://opengameart.org/content/cc0-storage-icons', changes: 'zugeschnitten, Kordel und Adresszettel darübergezeichnet' },
  { what: 'Mehlsack im Keller („[LPC] Containers“)', who: 'bluecarrot16, Lanea Zimmerman (Sharm), William Thompson, Tuomo Untinen (Reemax), Evert, Buch, Blarumyrran, n2liquid, Jetrel, Guido Bos, Hyptosis, Bonsaiheldin, NaRNeRZz, PriorBlue, Jerom, 7Soul, Wolthera van Hövell tot Westerflier (TheraHedwig)', license: 'CC-BY-SA 4.0', url: 'https://opengameart.org/content/lpc-containers', changes: 'ausgeschnitten und zugeschnitten, Aufschrift „MEHL“ darübergezeichnet' },
  { what: 'Ofen in der Backstube („[LPC] Wooden Furniture“)', who: 'bluecarrot16, Baŝto, Lanea Zimmerman (Sharm), William Thompson, Tuomo Untinen (Reemax), Janna/Lilius/Jannax', license: 'CC-BY-SA 3.0', url: 'https://opengameart.org/content/lpc-wooden-furniture', changes: 'ausgeschnitten und zugeschnitten (ohne Schatten), sonst unverändert' },
  { what: 'Werkzeugwand im Keller („[LPC] Woodshop“)', who: 'bluecarrot16', license: 'CC-BY 3.0', url: 'https://opengameart.org/content/lpc-woodshop', changes: 'einzeln ausgeschnitten und auf den sichtbaren Teil zugeschnitten, sonst unverändert' },
  { what: 'Laptop am Schreibtisch („[LPC Revised] The Office“)', who: 'Eliza Wyatt, Lanea Zimmerman (Sharm)', license: 'OGA-BY 3.0', url: 'https://opengameart.org/content/lpc-revised-the-office', changes: 'einzeln ausgeschnitten und auf den sichtbaren Teil zugeschnitten, sonst unverändert' },
  { what: 'Laternen am Marktplatz („LPC Lamp Posts Rework“)', who: 'Curt, Lanea Zimmerman (Sharm), William.Thompsonj, mold, AntumDeluge', license: 'CC-BY 3.0', url: 'https://opengameart.org/content/lpc-lamp-posts-rework', changes: 'einzeln ausgeschnitten und auf den sichtbaren Teil zugeschnitten, sonst unverändert' },
  { what: 'Gleis im Tunnel („LPC Mine Carts and Tracks“)', who: 'Xenodora', license: 'CC-BY-SA 3.0', url: 'https://opengameart.org/content/lpc-mine-carts-and-tracks', changes: 'einzeln ausgeschnitten und auf den sichtbaren Teil zugeschnitten, sonst unverändert' },
  { what: 'Konsolen im Tunnel („LPC Sci Fi Megapack“)', who: 'Blue Moon Bear nach oparaskos, Jannax, Baŝto, Skorpio, Lanea Zimmerman (Sharm), bluecarrot16, Eliza Wyatt, William Thompson, Tuomo Untinen (Reemax)', license: 'CC-BY-SA 4.0', url: 'https://opengameart.org/content/lpc-sci-fi-megapack', changes: 'einzeln ausgeschnitten und auf den sichtbaren Teil zugeschnitten, sonst unverändert' },
  { what: 'React', who: 'Meta Platforms und Mitwirkende', license: 'MIT', url: 'https://react.dev' },
  { what: 'Zustand', who: 'Poimandres', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
  { what: 'Dexie.js', who: 'David Fahlander und Mitwirkende', license: 'Apache 2.0', url: 'https://dexie.org' },
  { what: 'Vite', who: 'Evan You und Mitwirkende', license: 'MIT', url: 'https://vite.dev' },
];

/** Kurzfassung einer Credit-Liste für die zugeklappte Box: wie viele Teile, wie viele Urheber, welche Lizenzen (in der Reihenfolge des ersten Auftretens) */
export function creditSummary(list: readonly { authors: readonly string[]; licenses: readonly string[] }[]): { parts: number; authors: number; licenses: string[] } {
  return {
    parts: list.length,
    authors: new Set(list.flatMap((c) => c.authors)).size,
    licenses: [...new Set(list.flatMap((c) => c.licenses))],
  };
}
