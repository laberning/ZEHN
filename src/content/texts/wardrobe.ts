// Garderobe: Farbnamen und Warnung bei nur Getragenem.

/** Deutsche Namen der Farben in der Garderobe (Beschriftung der Farbfelder); unbekannte zeigen ihre Kennung */
export const COLOR_NAMES: Readonly<Record<'body' | 'hair' | 'eye' | 'cloth', Readonly<Record<string, string>>>> = {
  body: { light: 'Hell', amber: 'Bernstein', olive: 'Oliv', taupe: 'Taupe', bronze: 'Bronze', brown: 'Braun', black: 'Dunkelbraun' },
  hair: {
    black: 'Schwarz',
    dark_brown: 'Dunkelbraun',
    chestnut: 'Kastanie',
    light_brown: 'Hellbraun',
    blonde: 'Blond',
    platinum: 'Platinblond',
    redhead: 'Rotblond',
    gray: 'Grau',
    red: 'Rot',
    purple: 'Lila',
    blue: 'Blau',
    green: 'Grün',
    pink: 'Pink',
    gold: 'Gold',
    sandy: 'Sand',
  },
  eye: { brown: 'Braun', blue: 'Blau', green: 'Grün', gray: 'Grau', purple: 'Lila', yellow: 'Bernstein' },
  cloth: {
    white: 'Weiß',
    gray: 'Grau',
    black: 'Schwarz',
    navy: 'Marine',
    blue: 'Blau',
    red: 'Rot',
    green: 'Grün',
    yellow: 'Gelb',
    brown: 'Braun',
    sky: 'Himmelblau',
    teal: 'Türkis',
    pink: 'Himbeere',
    lavender: 'Violett',
    orange: 'Orange',
    tan: 'Ocker',
    rose: 'Rostrot',
    maroon: 'Weinrot',
    slate: 'Schiefer',
    charcoal: 'Anthrazit',
    purple: 'Pflaume',
    forest: 'Tannengrün',
    leather: 'Leder',
  },
};

/** Warnung an einem Teil, das man nur trägt, weil man es schon vorher hatte */
export const onlyWhileWornText = (hint: string): string => `Trägst du gerade. Ziehst du es aus: ${hint}.`;
