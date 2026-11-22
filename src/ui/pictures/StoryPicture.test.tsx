import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PictureId } from '../../domain/storyObject.ts';
import { StoryPicture } from './StoryPicture.tsx';
import { WIND_GLYPHS } from '../pixel/glyphs.ts';
import { PROP_SIZES } from '../pixel/propSizes.ts';
import { PALETTE } from '../pixel/palette.ts';
import { inlineImages } from '../pixel/pixelImage.ts';
import { rectsIn } from '../../test/pixelRects.ts';

describe('Story-Bilder von Akt 1', () => {
  /** Farbe je Rasterfeld (`x,y`), das zuletzt gezeichnete Rechteck gilt */
  const cells = (id: PictureId): Map<string, string> => {
    const { container, unmount } = render(<StoryPicture id={id} />);
    const map = new Map<string, string>();
    for (const r of rectsIn(container)) {
      const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((a) => Number(r.getAttribute(a)));
      for (let j = y!; j < y! + h!; j++) for (let i = x!; i < x! + w!; i++) map.set(`${i},${j}`, r.getAttribute('fill')!);
    }
    unmount();
    return map;
  };
  /** Felder einer 3×5-Buchstabenkarte an Position (x, y) */
  const letter = (rows: string[], x: number, y: number) => rows.flatMap((row, j) => [...row].flatMap((ch, i) => (ch === 'p' ? [`${x + i},${y + j}`] : [])));
  const G = ['ppp', 'p..', 'p.p', 'p.p', 'ppp'];
  const H = ['p.p', 'p.p', 'ppp', 'p.p', 'p.p'];

  it('jedes Bild ist eine Zeichen-Karte seiner Bildart mit Titel; Ortsschild und Markt unscharf, die Hände auch', () => {
    const expected: [PictureId, string, string][] = [
      ['rauschen', 'Pixelrauschen', '0 0 32 20'],
      ['haende', 'Zwei verpixelte Hände', '0 0 32 20'],
      ['markt', 'Der Marktplatz, vorne das Ortsschild', '0 0 96 56'],
      ['ortsschild-unscharf', 'Ortsschild', '0 0 96 56'],
      ['ortsschild', 'Ortsschild', '0 0 96 56'],
      ['halbes-foto', 'Halbes Foto: die junge Ada in Schürze, daneben eine Hand mit einem Mehlsack', '0 0 64 40'],
      ['schilder-0', 'Schilder am Markt, es fehlen Buchstaben', '0 0 96 56'],
      ['schilder-100', 'Schilder am Markt: Apotheke und Gasthaus zur Gans', '0 0 96 56'],
    ];
    for (const [id, label, viewBox] of expected) {
      const { container, unmount } = render(<StoryPicture id={id} />);
      const svg = container.querySelector('svg')!;
      expect(svg.getAttribute('aria-label'), id).toBe(label);
      expect(svg.getAttribute('viewBox'), id).toBe(viewBox);
      expect(container.querySelector('text'), id).toBeNull();
      expect(svg.style.filter, id).toBe({ markt: 'blur(0.7px)', 'ortsschild-unscharf': 'blur(0.8px)', haende: 'blur(0.8px)' }[id as string] ?? '');
      unmount();
    }
  });

  it('Schilder: G (Gasthaus), dann H (Apotheke), am Ende G und Gans legen sich an ihre Stellen; jede Stufe sieht anders aus', () => {
    const [s0, s25, s50, s100] = (['schilder-0', 'schilder-25', 'schilder-50', 'schilder-100'] as const).map(cells);
    const light = PALETTE['paper-light'];
    for (const c of letter(G, 57, 14)) {
      expect(s0!.get(c), c).not.toBe(light);
      expect(s25!.get(c), c).toBe(light);
    }
    for (const c of letter(H, 30, 13)) {
      expect(s25!.get(c), c).not.toBe(light);
      expect(s50!.get(c), c).toBe(light);
    }
    for (const c of letter(G, 73, 21)) {
      expect(s50!.get(c), c).not.toBe(light);
      expect(s100!.get(c), c).toBe(light);
    }
    // die Gans steht unter dem Wirtshausschild (11×8 ab 62,42): ihr Schnabel in Gold
    expect(s50!.get('69,43')).not.toBe(PALETTE.gold);
    expect(s100!.get('69,43')).toBe(PALETTE.gold);
    const key = (m: Map<string, string>) => [...m].sort().join(';');
    expect(new Set([s0, s25, s50, s100].map((m) => key(m!))).size).toBe(4);
  });
});

describe('Story-Bilder von Akt 2', () => {
  const NEW: PictureId[] = ['elsternest', 'skizze-tuer', 'fahrkarte'];

  it('Elsternest, Skizze der Turmtür und Fahrkarte sind gezeichnet und beschriftet', () => {
    for (const id of NEW) {
      const { container, unmount } = render(<StoryPicture id={id} />);
      const svg = container.querySelector('svg.story-pic');
      expect(svg, id).not.toBeNull();
      expect(rectsIn(svg!).length, id).toBeGreaterThan(10);
      expect(svg!.getAttribute('aria-label') ?? container.querySelector('title')?.textContent, id).toBeTruthy();
      unmount();
    }
  });

  it('jede Stufenreihe hat fünf verschiedene Bilder (Fallbild 96×56, O-Schilder ab 75 % fertig) mit den Titeln je Stufe', () => {
    const TITLES: Record<string, string[]> = {
      peilgeraet: ['Peilgerät: 0 von 3 Türmen gehört', 'Peilgerät: 1 von 3 Türmen gehört', 'Peilgerät: 2 von 3 Türmen gehört', 'Peilgerät: 3 von 3 Türmen gehört', 'Peilgerät: der alte Sendeturm flüstert'],
      rotor: ['Krümels Rotor, verbogen', 'Krümels Rotor, halb gerade', 'Krümels Rotor, gerade mit Delle', 'Krümels Rotor, gerade, mit einer Feder darin', 'Krümels Rotor, gerade und blank'],
      'o-schilder': [...Array<string>(3).fill('Die O-Schilder: bei einigen fehlt das O'), ...Array<string>(2).fill('Die O-Schilder: BROT, POST, HOTEL, nur das Ortsschild bleibt KUR RT')],
      route: [...Array<string>(4).fill('Die Route des Pizzaroboters, noch nicht ganz gezeichnet'), 'Die Route des Pizzaroboters, ganze Runde'],
      schlossplatte: [...Array<string>(4).fill('Schlossplatte der Turmtür: das Ü leuchtet noch nicht ganz'), 'Schlossplatte der Turmtür: das ganze Ü leuchtet'],
    };
    for (const [art, titles] of Object.entries(TITLES)) {
      const looks = ([0, 25, 50, 75, 100] as const).map((level, i) => {
        const { container, unmount } = render(<StoryPicture id={`${art}-${level}` as PictureId} />);
        const svg = container.querySelector('svg')!;
        expect(svg.getAttribute('aria-label'), `${art}-${level}`).toBe(titles[i]);
        expect(svg.getAttribute('viewBox'), `${art}-${level}`).toBe('0 0 96 56');
        const html = svg.innerHTML;
        unmount();
        return html;
      });
      // die O-Schilder sind ab 75 % fertig (alle drei O zurück, das Ortsschild bleibt KUR RT): 75 und 100 sehen gleich aus
      expect(new Set(looks).size, art).toBe(art === 'o-schilder' ? 4 : 5);
    }
  });
});

describe('Story-Bilder von Akt 3', () => {
  const IDS: PictureId[] = (['netzplan', 'ladestation'] as const).flatMap((art) => ([0, 25, 50, 75, 100] as const).map((p) => `${art}-${p}` as const));

  it('jede Kennung des Netzplans und der Ladestation zeichnet ein Bild mit Titel, jede Stufe sieht anders aus', () => {
    expect(IDS).toHaveLength(10);
    const looks = new Map<string, string>();
    for (const id of IDS) {
      const { container, unmount } = render(<StoryPicture id={id} />);
      const svg = container.querySelector('svg.story-pic');
      expect(svg, id).not.toBeNull();
      expect(rectsIn(svg!).length, id).toBeGreaterThan(5);
      expect(svg!.getAttribute('aria-label'), id).toBeTruthy();
      looks.set(id, svg!.innerHTML);
      unmount();
    }
    for (const art of ['netzplan', 'ladestation']) expect(new Set([0, 25, 50, 75, 100].map((p) => looks.get(`${art}-${p}`))).size, art).toBe(5);
  });

  it('Netzplan: erst „BAH HOF“ und „ARKT“, am Ende BAHNHOF, MARKT und STADTARCHIV (Pixelschrift, lesbar über den Titel)', () => {
    const label = (id: PictureId) => {
      const { container, unmount } = render(<StoryPicture id={id} />);
      const t = container.querySelector('svg')!.getAttribute('aria-label');
      unmount();
      return t;
    };
    expect(label('netzplan-0')).toContain('BAH HOF');
    expect(label('netzplan-0')).not.toContain('STADTARCHIV');
    expect(label('netzplan-100')).toContain('BAHNHOF');
    expect(label('netzplan-100')).toContain('MARKT');
    expect(label('netzplan-100')).toContain('STADTARCHIV');
  });

  it('beide Stufenreihen: Fallbild 96×56 mit dem Titel je Stufe', () => {
    const TITLES: Record<string, string[]> = {
      netzplan: [
        'U-Bahn-Netzplan mit Lücken: BAH HOF, ARKT',
        'U-Bahn-Netzplan: eine Linie fährt nach unten, BAH HOF, ARKT',
        'U-Bahn-Netzplan: eine Linie fährt nach unten, BAHNHOF, ARKT',
        'U-Bahn-Netzplan: eine Linie fährt nach unten, BAHNHOF, MARKT',
        'U-Bahn-Netzplan: BAHNHOF, MARKT, Endstation STADTARCHIV',
      ],
      ladestation: [
        'Keks\u2019 Ladestation: ein Hohlraum unter dem Bahnsteig',
        'Keks\u2019 Ladestation: Umrisse eines flachen Tellers mit Mulde',
        'Keks\u2019 Ladestation: Teller mit Mulde, die Lampe leuchtet grün',
        'Keks\u2019 Ladestation: in der Mulde ein runder Abdruck, eine Dose',
        'Keks\u2019 Ladestation: Station hell, Kabel warm, der Abdruck passt zu Krümel',
      ],
    };
    for (const [art, titles] of Object.entries(TITLES))
      ([0, 25, 50, 75, 100] as const).forEach((level, i) => {
        const { container, unmount } = render(<StoryPicture id={`${art}-${level}` as PictureId} />);
        const svg = container.querySelector('svg')!;
        expect(svg.getAttribute('aria-label'), `${art}-${level}`).toBe(titles[i]);
        expect(svg.getAttribute('viewBox'), `${art}-${level}`).toBe('0 0 96 56');
        unmount();
      });
  });
});

describe('Story-Bilder von Akt 3: Beweisstücke', () => {
  const render1 = (id: PictureId) => {
    const { container, unmount } = render(<StoryPicture id={id} />);
    const svg = container.querySelector('svg.story-pic');
    const out = { svg, text: container.textContent ?? '', label: svg?.getAttribute('aria-label') ?? container.querySelector('title')?.textContent ?? '', rects: svg ? rectsIn(svg).length : 0 };
    unmount();
    return out;
  };

  it('Fahrplan: handgeschrieben mit dem Halt „S. (nur mit Karte)“ und der Unterschrift „O.“', () => {
    const f = render1('fahrplan');
    expect(f.svg).not.toBeNull();
    expect(f.rects).toBeGreaterThan(5);
    expect(f.label).toContain('Fahrplan');
    // die Schrift ist Pixelschrift in Großbuchstaben; der Titel nennt Halt und Unterschrift wörtlich
    expect(f.label).toContain('S. (nur mit Karte)');
    expect(f.label).toContain('„O.“');
  });

  it('Extra-Fall „Die verschluckte Durchsage“: Tunnelbild mit Titel', () => {
    const p = render1('durchsage');
    expect(p.svg).not.toBeNull();
    expect(p.rects).toBeGreaterThan(30);
    expect(p.label).toContain('Zuglautsprecher');
  });

  it('Durchsage: die fünf Buchstaben im Fahrtwind sind echte, verschiedene Buchstaben (5×5)', () => {
    const glyphs = Object.values(WIND_GLYPHS);
    expect(Object.keys(WIND_GLYPHS)).toEqual(['N', 'M', 'B', 'H', 'A']);
    for (const g of glyphs) expect(g.length === 5 && g.every((row) => /^[#.]{5}$/.test(row)), g.join('/')).toBe(true);
    expect(new Set(glyphs.map((g) => g.join('/'))).size).toBe(glyphs.length);
  });

  it('Durchsage: die fünf Kärtchen im Fahrtwind zeigen die Buchstaben aus WIND_GLYPHS in Tinte auf Papier', () => {
    const { container, unmount } = render(<StoryPicture id="durchsage" />);
    const cell = new Map<string, string>();
    for (const r of rectsIn(container)) {
      const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((a) => Number(r.getAttribute(a)));
      for (let j = y!; j < y! + h!; j++) for (let i = x!; i < x! + w!; i++) cell.set(`${i},${j}`, r.getAttribute('fill')!);
    }
    unmount();
    const drawnAt = (g: readonly string[], x: number, y: number) => g.every((row, j) => [...row].every((ch, i) => cell.get(`${x + i},${y + j}`) === (ch === '#' ? PALETTE.ink : PALETTE.paper)));
    const found = Object.entries(WIND_GLYPHS).filter(([, g]) => Array.from({ length: 96 * 56 }, (_, n) => drawnAt(g, n % 96, Math.floor(n / 96))).some(Boolean));
    expect(found.map(([letter]) => letter)).toEqual(['N', 'M', 'B', 'H', 'A']);
  });

  it('Notizbuch und „Hallo Keks“ sind gezeichnet und beschriftet', () => {
    for (const id of ['notizbuch', 'keks-gruss'] as const) {
      const p = render1(id);
      expect(p.svg, id).not.toBeNull();
      expect(p.rects, id).toBeGreaterThan(5);
      expect(p.label, id).toBeTruthy();
    }
  });
});

describe('Story-Bilder von Akt 4', () => {
  const IDS: PictureId[] = ([0, 25, 50, 75, 100] as const).map((p) => `strassenschild-${p}` as const);
  const render1 = (id: PictureId) => {
    const { container, unmount } = render(<StoryPicture id={id} />);
    const svg = container.querySelector('svg.story-pic')!;
    const out = { svg: inlineImages(svg.innerHTML), label: svg.getAttribute('aria-label'), text: container.textContent, rects: rectsIn(svg!).length };
    unmount();
    return out;
  };

  it('jede Kennung des Straßenschilds zeichnet ein Bild mit Titel, jede Stufe sieht anders aus', () => {
    expect(IDS).toHaveLength(5);
    const looks = IDS.map((id) => {
      const r = render1(id);
      expect(r.rects, id).toBeGreaterThan(5);
      expect(r.label, id).toBeTruthy();
      return r.svg;
    });
    expect(new Set(looks).size).toBe(5);
  });

  it('Straßenschild: erst leer, dann Back, Backspace-, Backspace-Stra e (Lücke), am Ende Backspace-Straße mit dem Turm (Pixelschrift, lesbar über den Titel)', () => {
    const words = IDS.map((id) => render1(id).label!.match(/^Straßenschild: (.*?),/)![1]);
    expect(words).toEqual(['leer', 'Back', 'Backspace-', 'Backspace-Stra e', 'Backspace-Straße']);
    expect(IDS.map((id) => render1(id).text)).toEqual(['', '', '', '', '']);
    expect(render1('strassenschild-100').label).toContain('Turm ohne Fenster');
    expect(render1('strassenschild-75').label).toContain('ein Buchstabe fehlt');
    expect(render1('strassenschild-50').label).not.toContain('Turm');
  });

  it('Stufenreihe: Fallbild 96×56 mit dem Titel je Stufe', () => {
    const TITLES = [
      'Straßenschild: leer, nur ein Pfeil bergauf',
      'Straßenschild: Back, dazu ein Pfeil bergauf',
      'Straßenschild: Backspace-, dazu ein Pfeil bergauf',
      'Straßenschild: Backspace-Stra e, ein Buchstabe fehlt, dazu ein Pfeil bergauf',
      'Straßenschild: Backspace-Straße, der Pfeil zeigt auf einen Turm ohne Fenster',
    ];
    IDS.forEach((id, i) => {
      const { container, unmount } = render(<StoryPicture id={id} />);
      const svg = container.querySelector('svg')!;
      expect(svg.getAttribute('aria-label'), id).toBe(TITLES[i]);
      expect(svg.getAttribute('viewBox'), id).toBe('0 0 96 56');
      unmount();
    });
  });

  it('die Beweisstücke Zeitung, Plakat, Kalenderblatt und das Foto von Benno sind gezeichnet und beschriftet, jedes sieht anders aus', () => {
    const ids = ['zeitung', 'plakat', 'kalenderblatt', 'foto-benno'] as const;
    const out = ids.map((id) => ({ id, ...render1(id) }));
    for (const p of out) {
      expect(p.rects, p.id).toBeGreaterThan(5);
      expect(p.label, p.id).toBeTruthy();
    }
    expect(new Set(out.map((p) => p.svg)).size).toBe(4);
    expect(out.find((p) => p.id === 'foto-benno')!.label).toContain('Benno');
  });
});

describe('Story-Bilder von Akt 5: Beweisstücke', () => {
  const IDS: PictureId[] = ['junas-post', 'booster-chip', 'durchsage-skript', 'signal-karte'];

  it('Junas Beitrag, Booster-Chip, Durchsage-Skript und Signal-Karte sind gezeichnet, beschriftet und verschieden', () => {
    const looks = new Set<string>();
    for (const id of IDS) {
      const { container, unmount } = render(<StoryPicture id={id} />);
      const svg = container.querySelector('svg.story-pic');
      expect(svg, id).not.toBeNull();
      expect(rectsIn(svg!).length, id).toBeGreaterThan(5);
      expect(svg!.getAttribute('aria-label') ?? container.querySelector('title')?.textContent, id).toBeTruthy();
      looks.add(svg!.innerHTML);
      unmount();
    }
    expect(looks.size).toBe(4);
  });
});

describe('Story-Bilder von Akt 6: Beweisstücke', () => {
  const IDS: PictureId[] = ['goldstaub', 'feind-karte', 'spurenwand-nadel', 'lieferbuch', 'lieferblatt'];

  it('Tüte Goldstaub, Goldrand-Karte, Nadel, Lieferbuch und Lieferblatt sind gezeichnet, beschriftet und verschieden', () => {
    const looks = new Set<string>();
    for (const id of IDS) {
      const { container, unmount } = render(<StoryPicture id={id} />);
      const svg = container.querySelector('svg.story-pic');
      expect(svg, id).not.toBeNull();
      expect(rectsIn(svg!).length, id).toBeGreaterThan(5);
      expect(svg!.getAttribute('aria-label') ?? container.querySelector('title')?.textContent, id).toBeTruthy();
      expect(svg!.getAttribute('viewBox'), id).toBe('0 0 32 20');
      looks.add(svg!.innerHTML);
      unmount();
    }
    expect(looks.size).toBe(5);
  });
});

describe('Story-Bilder von Akt 7: Beweisstücke', () => {
  const IDS: PictureId[] = ['preisliste', 'abdruck', 'schaltplan', 'zylinder', 'foto-ganz', 'lieferwagen'];
  // Beweisstücke 32×20, das ganze Foto ist ein Fallbild 96×56 (beide Hälften nebeneinander)
  const SIZE = (id: PictureId) => (id === 'foto-ganz' ? '0 0 96 56' : '0 0 32 20');

  it('Preisliste, Daumenabdruck, Schaltplan, Zylinder, ganzes Foto und Lieferwagen sind gezeichnet, beschriftet und verschieden', () => {
    const looks = new Set<string>();
    for (const id of IDS) {
      const { container, unmount } = render(<StoryPicture id={id} />);
      const svg = container.querySelector('svg.story-pic');
      expect(svg, id).not.toBeNull();
      expect(rectsIn(svg!).length, id).toBeGreaterThan(5);
      expect(svg!.getAttribute('aria-label') ?? container.querySelector('title')?.textContent, id).toBeTruthy();
      expect(svg!.getAttribute('viewBox'), id).toBe(SIZE(id));
      looks.add(svg!.innerHTML);
      unmount();
    }
    expect(looks.size).toBe(6);
  });
});

describe('Story-Bilder der Fälle der Woche', () => {
  it('Kiosk-Kasse und Maschine 4 sind gezeichnet und beschriftet, wiederverwendet werden Briefkasten und Feder', () => {
    for (const id of ['kasse', 'maschine-4', 'briefkasten', 'feder'] as PictureId[]) {
      const { container, unmount } = render(<StoryPicture id={id} />);
      const svg = container.querySelector('svg.story-pic');
      expect(svg, id).not.toBeNull();
      // Fallbilder 96×56, die Feder in Gadget-Größe (sie liegt im Beweisfach neben den Gadgets)
      expect(svg!.getAttribute('viewBox'), id).toBe(id === 'feder' ? '0 0 16 16' : '0 0 96 56');
      expect(rectsIn(svg!).length, id).toBeGreaterThan(10);
      expect(svg!.getAttribute('aria-label') ?? container.querySelector('title')?.textContent, id).toBeTruthy();
      unmount();
    }
  });
});

describe('Bildart Kachel', () => {
  it('das Paket ist eine Kachel aus public/assets/props im Rahmen der Story-Bilder: Titel, Datei, ein Kachelpixel je Rasterfeld, Kordel darüber', () => {
    const { container } = render(<StoryPicture id="paket" />);
    const svg = container.querySelector('svg.story-pic');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('aria-label')).toBe('Ein Paket von Herrn Kringel');
    const [w, h] = PROP_SIZES.paket;
    expect(svg!.getAttribute('viewBox')).toBe(`0 0 ${w} ${h}`);
    const image = svg!.querySelector('image');
    expect(image!.getAttribute('href')).toMatch(/assets\/props\/paket\.png$/);
    expect([image!.getAttribute('x'), image!.getAttribute('y'), image!.getAttribute('width'), image!.getAttribute('height')]).toEqual(['0', '0', String(w), String(h)]);
    expect(image!.getAttribute('class')).toBe('prop');
    // Kordel und Adresszettel liegen über der Kachel
    const tags = [...svg!.children].map((c) => c.tagName.toLowerCase());
    expect(tags[0]).toBe('image');
    expect(tags.slice(1).filter((t) => t === 'rect').length).toBeGreaterThan(10);
  });
});
