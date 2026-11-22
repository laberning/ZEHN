// Textgenerator: Form der Satzzeichen, der Großschreibung, der Zahlen und der Sonderzeichen, Menge, unveränderter Text ohne diese Zeichen.

import { describe, expect, it } from 'vitest';
import { NUMBER_COURSE, PUNCT_COURSE, SHIFT_COURSE, SPECIAL_COURSE, keyStat } from '../test/factories.ts';
import { allWords, findLesson, keysUpTo } from './course.ts';
import { SHIFT_LEFT, SHIFT_RIGHT, UMLAUTE_GROSS, learnKey } from './keyboard.ts';
import { createRng } from './rng.ts';
import { DIGITS, PUNCTUATION, SPECIAL, WORD_ONLY, charWeights, generateText, isDigit, isSpecial } from './textGenerator.ts';

const LETTERS = [...'asdfgjklö'];
const WORDS = ['das', 'lass', 'falls', 'glas', 'gaga', 'fass', 'dass', 'jagd', 'flag', 'alaska', 'öl', 'gös'];
const SEEDS = Array.from({ length: 300 }, (_, i) => i + 1);

const make = (allowed: string[], focus: string[] | undefined, seed: number, length = 40) =>
  generateText({ allowed, focus, words: WORDS, length, rng: createRng(seed) });

describe('Satzzeichen im Text', () => {
  const allowed = [...LETTERS, ',', '.', '-'];

  it('Form: nie am Anfang, nie doppelt, Komma und Punkt vor Leerzeichen oder Ende, Bindestrich zwischen zwei Nicht-Leerzeichen, nie mitten in einer Gruppe', () => {
    for (const focus of [undefined, [','], ['.', '-'], [',', '.', '-', 'ö']]) {
      for (const seed of SEEDS) {
        const t = make(allowed, focus, seed, 60);
        expect(t, `${focus} ${seed}`).not.toMatch(/^[,.-]/);
        expect(t).not.toMatch(/[,.-]{2}/);
        expect(t).not.toMatch(/[,.][^ ]/);
        expect(t).not.toMatch(/ [,.-]/);
        expect(t).not.toMatch(/-$/);
        expect(t).not.toMatch(/ $/);
        // Einheiten (durch Leerzeichen getrennt) haben höchstens ein Satzzeichen am Ende, dazu Bindestriche zwischen Teilen
        for (const unit of t.split(' ')) for (const part of unit.split('-')) expect(part).toMatch(/^[a-zö]+[,.]?$/);
        // am Textende nur ein Punkt
        expect(t).not.toMatch(/,$/);
      }
    }
  });

  it('Fokus-Satzzeichen kommen auf mindestens 80 % ihres Gewichts', () => {
    for (const focus of [[','], ['.'], ['-']]) {
      const share = charWeights({ allowed, focus });
      const counts = new Map<string, number>();
      let total = 0;
      for (const seed of SEEDS) {
        const t = make(allowed, focus, seed).replaceAll(' ', '');
        total += t.length;
        for (const c of t) counts.set(c, (counts.get(c) ?? 0) + 1);
      }
      for (const k of focus) expect((counts.get(k) ?? 0) / total, `${focus} ${k}`).toBeGreaterThanOrEqual(0.8 * (share.get(k) ?? 0));
    }
  });

  // Wie Buchstaben: Gewicht aus dem Zufall, die Nachsteuerung nur als Netz darunter – im Mittel also das volle Gewicht.
  // Kurs etwa so groß wie Akt 3 (29 Buchstaben und die drei Satzzeichen) mit längeren Wörtern.
  const MANY = [...'asdfghjklöäeiruztwoqpünmcvbxy', ',', '.', '-'];
  const LONG = ['stadt', 'kugel', 'wiese', 'tiger', 'zitrone', 'flugzeug', 'quelle', 'pause', 'garage', 'leiter', 'tasse', 'sport', 'kiste', 'regal', 'treppe', 'gurke', 'hafer', 'wolke', 'fluss', 'zettel'];
  const shareOf = (focus: string[], length: number) => {
    const counts = new Map<string, number>();
    let total = 0;
    for (const seed of SEEDS) {
      const t = generateText({ allowed: MANY, focus, words: LONG, length, rng: createRng(seed) }).replaceAll(' ', '');
      total += t.length;
      for (const c of t) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const weights = charWeights({ allowed: MANY, focus });
    return (k: string) => (counts.get(k) ?? 0) / total / (weights.get(k) ?? 1);
  };

  it('ein Fokus-Satzzeichen kommt im Mittel auf sein volles Gewicht, nicht nur auf das Netz der Nachsteuerung', () => {
    for (const k of [',', '.', '-']) expect(shareOf([k], 40)(k), k).toBeGreaterThanOrEqual(1);
  });

  // Je Einheit höchstens ein Satzzeichen: Zwei Fokus-Satzzeichen erreichen ihr Soll. Bei dreien (Spezialtraining mit den drei
  // schwächsten Tasten) bleibt in kurzen Texten das letzte darunter, weil die Nachsteuerung sie der Reihe nach holt.
  it('zwei Fokus-Satzzeichen erreichen je mindestens 80 % ihres Gewichts', () => {
    const share = shareOf([',', '.'], 60);
    for (const k of [',', '.']) expect(share(k), k).toBeGreaterThanOrEqual(0.8);
  });

  it('nicht erlaubte Satzzeichen kommen nicht vor', () => {
    for (const seed of SEEDS.slice(0, 60)) expect(make([...LETTERS, ','], [','], seed)).not.toMatch(/[.-]/);
  });

  it('Satzzeichen stehen nie als einziges Zeichen des Kurses (kein Absturz)', () => {
    expect(make([','], [','], 1)).toMatch(/^[,]+(?: [,]+)*$/);
  });
});

describe('Kurse ohne Satzzeichen', () => {
  it('liefern für feste Startwerte denselben Text wie vor den Satzzeichen', () => {
    expect([1, 42].map((seed) => make(LETTERS, ['ö'], seed, 60))).toEqual([
      'öl gös klg gsgd öl fass öag gös falls öl lgl sfö glas gös lass',
      'öl sjdkö glas söjkk öl jad öl asög gaa flag gös gaga ddöda gös',
    ]);
    expect([1, 42].map((seed) => make(LETTERS, undefined, seed))).toEqual([
      'das gös jkf gsfd fass gaga saf alaska falls',
      'fass sgdjl falls dsgkj fass jad falls aslg',
    ]);
  });

  it('PUNCTUATION sind Komma, Punkt, Bindestrich, Fragezeichen, Ausrufezeichen, Doppelpunkt, Semikolon, Anführungszeichen; WORD_ONLY der Apostroph', () => {
    expect([...PUNCTUATION]).toEqual([',', '.', '-', '?', '!', ':', ';', '"']);
    expect([...WORD_ONLY]).toEqual(["'"]);
  });
});

describe('Großschreibung im Text', () => {
  const words = allWords(SHIFT_COURSE);
  const text = (lessonId: string, seed: number, over: Partial<Parameters<typeof generateText>[0]> = {}, length = 40) =>
    generateText({ allowed: keysUpTo(SHIFT_COURSE, lessonId), focus: findLesson(SHIFT_COURSE, lessonId).lesson.newKeys, words, length, rng: createRng(seed), ...over });
  const unitsOf = (t: string) => t.split(' ').flatMap((u) => u.split('-'));

  it('Form: Großbuchstaben nur am Anfang einer Einheit, nie mitten im Wort, nie nach einem Bindestrich', () => {
    for (const lesson of ['s2a', 's2b', 's2c', 's2d']) {
      for (const seed of SEEDS.slice(0, 100)) {
        const t = text(lesson, seed, {}, 60);
        for (const unit of t.split(' ')) expect(unit, `${lesson} ${seed}`).toMatch(/^[A-ZÄÖÜ]?[a-zäöüß]+$/);
      }
    }
    // mit Satzzeichen: auch hinter Komma und Punkt nur am Einheitenanfang, nie nach dem Bindestrich
    const allowed = [...keysUpTo(SHIFT_COURSE, 's2b'), ',', '.', '-'];
    for (const seed of SEEDS.slice(0, 100)) {
      const t = generateText({ allowed, focus: ['.', '-'], words, length: 60, rng: createRng(seed) });
      expect(t, String(seed)).not.toMatch(/-[A-ZÄÖÜ]/);
      for (const unit of t.split(' ')) for (const part of unit.split('-')) expect(part).toMatch(/^[A-ZÄÖÜ]?[a-zäöüß]+[,.]?$/);
    }
  });

  it('nur gelernte Großbuchstaben: der Auftrag der linken Hand bringt keine Großbuchstaben der rechten', () => {
    for (const seed of SEEDS.slice(0, 100)) {
      expect(text('s2a', seed)).not.toMatch(/[ZUIOPHJKLNMÄÖÜ]/);
      expect(text('s2b', seed)).not.toMatch(/[ÄÖÜ]/);
    }
  });

  it('nach einem Punkt beginnt die nächste Einheit groß, sobald ihr Großbuchstabe gelernt ist', () => {
    const allowed = [...keysUpTo(SHIFT_COURSE, 's2d'), '.'];
    let sentences = 0;
    for (const seed of SEEDS) {
      const t = generateText({ allowed, focus: ['.'], words, length: 80, rng: createRng(seed) });
      for (const m of t.matchAll(/\. ([^ß])/g)) {
        sentences++;
        expect(m[1], `${seed} ${t}`).toMatch(/[A-ZÄÖÜ]/);
      }
    }
    expect(sentences).toBeGreaterThan(100);
    // (ß hat keinen Großbuchstaben) ist der Großbuchstabe noch nicht gelernt, bleibt die Einheit klein
    const left = [...keysUpTo(SHIFT_COURSE, 's2a'), '.'];
    for (const seed of SEEDS.slice(0, 100)) for (const m of generateText({ allowed: left, focus: ['.'], words, length: 80, rng: createRng(seed) }).matchAll(/\. ([a-zäöüß])/g)) expect(m[1]).toMatch(/[hjklnmzuiopäöü]/);
  });

  it('Menge: im eigenen Auftrag mindestens vier große Einheiten je 40-Zeichen-Runde, später etwa jede vierte', () => {
    const share = (lessonId: string, focus?: string[]) => {
      let caps = 0;
      let units = 0;
      for (const seed of SEEDS) for (const u of text(lessonId, seed, focus ? { focus } : {}).split(' ')) {
        units++;
        if (/^[A-ZÄÖÜ]/.test(u)) caps++;
      }
      return { perRound: caps / SEEDS.length, fraction: caps / units };
    };
    const own = share('s2a');
    expect(own.perRound).toBeGreaterThanOrEqual(4);
    expect(own.fraction).toBeGreaterThan(0.4);
    expect(share('s2b').perRound).toBeGreaterThanOrEqual(4);
    // später (ohne Fokus): etwa jede vierte Einheit
    const later = share('s2c', []);
    expect(later.fraction).toBeGreaterThan(0.15);
    expect(later.fraction).toBeLessThan(0.35);
  });

  it('Gewicht je Lerneinheit: 15 Großbuchstaben haben zusammen das Gewicht einer Umschalttaste', () => {
    const allowed = keysUpTo(SHIFT_COURSE, 's2a');
    const w = charWeights({ allowed, focus: findLesson(SHIFT_COURSE, 's2a').lesson.newKeys });
    expect([...w.keys()].filter((k) => k.length > 1)).toEqual([SHIFT_RIGHT]);
    expect(w.get(SHIFT_RIGHT)).toBeCloseTo(2 * (w.get('a') ?? 0));
    expect([...w.values()].reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    // der Fokus darf Zeichen oder Lerneinheit nennen
    expect(charWeights({ allowed, focus: [SHIFT_RIGHT] })).toEqual(charWeights({ allowed, focus: ['Q'] }));
  });

  it('Schwäche der Umschalttaste: öfter groß; ein Fokus mit der Umschalttaste bringt Großbuchstaben ihrer Hand', () => {
    const allowed = keysUpTo(SHIFT_COURSE, 's2b');
    const criteria = { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 };
    const weak = { stats: { [SHIFT_LEFT]: keyStat({ samples: 30, accuracy: 0.5 }) }, criteria, maxShare: 0.3 };
    const w = charWeights({ allowed, weak });
    expect(w.get(SHIFT_LEFT)).toBeGreaterThan(2 * (w.get(SHIFT_RIGHT) ?? 0));
    let hand = 0;
    for (const seed of SEEDS) {
      const t = generateText({ allowed, focus: [SHIFT_LEFT], words, length: 40, rng: createRng(seed) });
      if (unitsOf(t).some((u) => learnKey(u[0]!) === SHIFT_LEFT)) hand++;
    }
    expect(hand).toBeGreaterThan(SEEDS.length * 0.95);
  });

  it('Große Umlaute: Ä Ö Ü haben zusammen ein Gewicht und kommen im eigenen Auftrag auf mindestens 80 % davon, über Wörter mit ä-, ö-, ü-Anfang', () => {
    const allowed = keysUpTo(SHIFT_COURSE, 's2d');
    const focus = ['Ä', 'Ö', 'Ü'];
    const share = charWeights({ allowed, focus });
    expect([...share.keys()].filter((k) => k.length > 1).sort()).toEqual([SHIFT_LEFT, SHIFT_RIGHT, UMLAUTE_GROSS]);
    expect(share.get(UMLAUTE_GROSS)).toBeCloseTo(2 * (share.get('a') ?? 0));
    let count = 0;
    let letters = 0;
    let wordStarts = 0;
    for (const seed of SEEDS) {
      const t = generateText({ allowed, focus, words, length: 40, rng: createRng(seed) });
      letters += t.replaceAll(' ', '').length;
      for (const u of t.split(' ')) {
        if (/^[ÄÖÜ]/.test(u)) {
          count++;
          if (words.includes(u.toLowerCase()) || words.includes(u[0]!.toLowerCase() + u.slice(1))) wordStarts++;
        }
      }
    }
    expect(count / letters).toBeGreaterThanOrEqual(0.8 * (share.get(UMLAUTE_GROSS) ?? 0));
    expect(wordStarts).toBeGreaterThan(SEEDS.length);
  });

  it('ohne erlaubte Großbuchstaben: nie ein Großbuchstabe und derselbe Text wie vorher, auch im Kurs mit Großschreibung', () => {
    for (const seed of SEEDS.slice(0, 60)) {
      const t = text('s1d', seed, { focus: ['ä'] });
      expect(t).not.toMatch(/[A-ZÄÖÜ]/);
    }
    // fester Text: unverändert gegenüber dem Stand vor der Großschreibung
    const allowed = keysUpTo(PUNCT_COURSE, 'p1b');
    const w = allWords(PUNCT_COURSE);
    expect([1, 42].map((seed) => generateText({ allowed, focus: ['j', 'e'], words: w, length: 60, rng: createRng(seed) }))).toEqual([
      'jadelf dkljj sejd jadelf elfe saj kekse kalk jadelf jlj sfe kalk',
      'jadelf jjdke seele sjjkk fass jad seele asej jaa elfe seele ddjda',
    ]);
  });

  it('Satzzeichen-Testkurs: unverändert, auch mit allen drei Satzzeichen', () => {
    const allowed = keysUpTo(PUNCT_COURSE, 'p2c');
    const w = allWords(PUNCT_COURSE);
    expect([1, 42].map((seed) => generateText({ allowed, focus: ['-'], words: w, length: 60, rng: createRng(seed) }))).toEqual([
      'das-alles-jkf-fsfs, das-jadelf-fall-seele. skj-kfl-jadelf, seele.',
      'seele-sjdjl-fall-dsjkj-fass-jad, jadelf-das-kekse. faa-dass.',
    ]);
  });
});

describe('Zeichen mit Umschalttaste im Text', () => {
  const words = allWords(PUNCT_COURSE);
  const text = (lessonId: string, seed: number, length = 60, over: Partial<Parameters<typeof generateText>[0]> = {}) =>
    generateText({ allowed: keysUpTo(PUNCT_COURSE, lessonId), focus: findLesson(PUNCT_COURSE, lessonId).lesson.newKeys, words, length, rng: createRng(seed), ...over });
  /** Einheiten ohne Anführungszeichen und Satzzeichen am Ende */
  const unitsOf = (t: string) => t.split(/[ -]/).map((u) => u.replace(/^"|"$/g, '').replace(/[,.?!:;]$/, ''));

  it('Form: ? ! : ; hängen am Ende einer Einheit (danach Leerzeichen oder Ende), : ; nie am Textende, nie am Anfang, nie doppelt', () => {
    let seen = 0;
    for (const lesson of ['p3a', 'p3b', 'p3c']) {
      for (const seed of SEEDS) {
        const t = text(lesson, seed);
        expect(t, `${lesson} ${seed}`).not.toMatch(/^[?!:;]|[?!:;]["?!:;,.]|[?!:;,.]["?!:;]|[?!:;][^ ]|[ -][?!:;]|[:;]$| $/);
        seen += (t.match(/[?!:;]/g) ?? []).length;
        // höchstens ein schließendes Satzzeichen je Einheit
        for (const u of t.split(' ')) expect((u.replace(/"/g, '').match(/[,.?!:;]/g) ?? []).length, `${lesson} ${seed} ${u}`).toBeLessThanOrEqual(1);
      }
    }
    expect(seen).toBeGreaterThan(500);
  });

  it('nach ? und ! beginnt die nächste Einheit groß, sobald ihr Großbuchstabe gelernt ist', () => {
    let sentences = 0;
    for (const seed of SEEDS) {
      const t = text('p3a', seed, 80);
      for (const m of t.matchAll(/[?!] (")?(.)/g)) {
        sentences++;
        // gelernt sind A S D F G
        expect(m[2], `${seed} ${t}`).not.toMatch(/[asdfg]/);
      }
    }
    expect(sentences).toBeGreaterThan(100);
    // der Großbuchstabe steht dann wirklich da
    expect([...new Set(SEEDS.flatMap((seed) => [...text('p3a', seed, 80).matchAll(/[?!] "?([ASDFG])/g)].map((m) => m[1])))].length).toBeGreaterThan(1);
  });

  it('Anführungszeichen stehen paarweise um genau eine Einheit, die kein weiteres Satzzeichen bekommt, auch am Textende', () => {
    let pairs = 0;
    let atEnd = 0;
    for (const seed of SEEDS) {
      const t = text('p3c', seed);
      expect((t.match(/"/g) ?? []).length % 2, t).toBe(0);
      for (const u of t.split(' ')) {
        if (!u.includes('"')) continue;
        pairs++;
        expect(u, `${seed} ${t}`).toMatch(/^"[A-Za-z']+[A-Za-z]"$|^"[A-Za-z']+"$/);
      }
      if (t.endsWith('"')) atEnd++;
      expect(t).not.toMatch(/-"/);
    }
    expect(pairs).toBeGreaterThan(300);
    expect(atEnd).toBeGreaterThan(10);
  });

  it('Apostroph: nur in Wörtern der Liste, nie in Gruppen, nie am Anfang oder Ende, nie über den Satzzeichen-Schritt', () => {
    const apo = words.filter((w) => w.includes("'"));
    let seen = 0;
    for (const lesson of ['p3c']) {
      for (const seed of SEEDS) {
        const t = text(lesson, seed);
        for (const u of unitsOf(t)) {
          if (!u.includes("'")) continue;
          seen++;
          expect(apo.map((w) => w.toLowerCase()), `${seed} ${t}`).toContain(u.toLowerCase());
        }
      }
    }
    expect(seen).toBeGreaterThan(300);
    // nicht erlaubt: kommt nicht vor, auch wenn die Wörter in der Liste stehen
    for (const seed of SEEDS.slice(0, 100)) expect(text('p3b', seed)).not.toMatch(/['"]/);
  });

  it('ohne Wörter mit Apostroph läuft die Runde ohne ihn (kein Absturz, keine Gruppe mit ihm)', () => {
    for (const seed of SEEDS.slice(0, 100)) {
      const t = text('p3c', seed, 60, { words: words.filter((w) => !w.includes("'")) });
      expect(t).not.toContain("'");
      expect(t).toMatch(/"/);
    }
    for (const seed of SEEDS.slice(0, 30)) expect(text('p3c', seed, 60, { words: [] })).not.toContain("'");
  });

  it('nicht erlaubte Zeichen kommen nicht vor', () => {
    for (const seed of SEEDS.slice(0, 100)) {
      expect(text('p3a', seed)).not.toMatch(/[:;"']/);
      expect(text('p3b', seed)).not.toMatch(/["']/);
      expect(text('p2c', seed)).not.toMatch(/[?!:;"']/);
    }
  });

  it('Menge: jedes der Zeichen kommt im eigenen Auftrag auf mindestens 80 % seines Gewichts', () => {
    for (const [lesson, keys] of [['p3a', '?!'], ['p3b', ':;'], ['p3c', '"\'']] as const) {
      const allowed = keysUpTo(PUNCT_COURSE, lesson);
      const focus = findLesson(PUNCT_COURSE, lesson).lesson.newKeys;
      const share = charWeights({ allowed, focus });
      const counts = new Map<string, number>();
      let total = 0;
      for (const seed of SEEDS) {
        const t = generateText({ allowed, focus, words, length: 40, rng: createRng(seed) }).replaceAll(' ', '');
        total += t.length;
        for (const c of t) counts.set(c, (counts.get(c) ?? 0) + 1);
      }
      for (const k of keys) expect((counts.get(k) ?? 0) / total, `${lesson} ${k}`).toBeGreaterThanOrEqual(0.8 * (share.get(k) ?? 0));
    }
  });

  it('Regression: Kurse ohne die neuen Zeichen liefern für feste Startwerte denselben Text (Reihenfolge der Zufallsaufrufe unverändert)', () => {
    const allowed = keysUpTo(PUNCT_COURSE, 'p2c');
    const w = allWords(PUNCT_COURSE).filter((x) => !x.includes("'"));
    // die Wörter von p3 bringen Buchstaben mit, die bis p2c fehlen: nur Wörter aus erlaubten Zeichen zählen
    expect([1, 42].map((seed) => generateText({ allowed, focus: ['-'], words: w, length: 60, rng: createRng(seed) }))).toEqual([
      'das-alles-jkf-fsfs, das-jadelf-fall-seele. skj-kfl-jadelf, seele.',
      'seele-sjdjl-fall-dsjkj-fass-jad, jadelf-das-kekse. faa-dass.',
    ]);
  });
});

describe('Zahlen im Text', () => {
  const words = allWords(NUMBER_COURSE);
  const text = (lessonId: string, seed: number, length = 60, over: Partial<Parameters<typeof generateText>[0]> = {}) =>
    generateText({ allowed: keysUpTo(NUMBER_COURSE, lessonId), focus: findLesson(NUMBER_COURSE, lessonId).lesson.newKeys, words, length, rng: createRng(seed), ...over });
  const LESSONS = ['n1a', 'n1b', 'n1c', 'n1d'];
  /** Einheiten ohne Satzzeichen am Ende und ohne Bindestrich-Teile */
  const partsOf = (t: string) => t.split(/[ -]/).map((u) => u.replace(/["]/g, '').replace(/[,.?!:;]$/, ''));

  it('DIGITS sind die zehn Ziffern', () => {
    expect([...DIGITS].join('')).toBe('0123456789');
    expect(isDigit('4')).toBe(true);
    expect(isDigit('a')).toBe(false);
  });

  it('Form: jede Einheit ist ein Wort oder eine Zahl aus zwei bis vier Ziffern, nie eine Ziffer im Wort, kein Anführungszeichen um Zahlen', () => {
    let numbers = 0;
    for (const lesson of LESSONS) {
      for (const seed of SEEDS.slice(0, 100)) {
        const t = text(lesson, seed);
        expect(t, `${lesson} ${seed}`).not.toMatch(/[a-zäöüß'][0-9]|[0-9][a-zäöüß']/i);
        expect(t).not.toMatch(/"[0-9]|[0-9]"/);
        expect(t).not.toMatch(/ $/);
        for (const part of partsOf(t)) {
          if (/[0-9]/.test(part)) {
            expect(part, `${lesson} ${seed}`).toMatch(/^[0-9]{2,4}$/);
            numbers++;
          } else {
            expect(part, `${lesson} ${seed}`).toMatch(/^[A-ZÄÖÜ]?[a-zäöüß']+$/);
          }
        }
      }
    }
    expect(numbers).toBeGreaterThan(500);
  });

  it('Satzzeichen an Zahlen: Komma, Punkt und Co. hinter einer Zahl, Bindestrich zwischen Zahl und Wort oder zwei Zahlen', () => {
    const all = SEEDS.map((seed) => text('n1d', seed, 80)).join(' ');
    expect(all).toMatch(/[0-9][,.?!:;](?: |$)/);
    expect(all).toMatch(/[0-9]-[a-zäöüß]/);
    expect(all).toMatch(/[a-zäöüß]-[0-9]/);
    expect(all).toMatch(/[0-9]-[0-9]/);
    // am Textende nur Punkt, Fragezeichen, Ausrufezeichen
    for (const seed of SEEDS) expect(text('n1d', seed, 40)).not.toMatch(/[0-9][,:;-]$/);
  });

  it('Großschreibung: nach „10.“ beginnt die nächste Einheit groß, sobald ein Großbuchstabe gelernt ist', () => {
    let after = 0;
    for (const seed of SEEDS) {
      const t = text('n1c', seed, 80);
      for (const m of t.matchAll(/[0-9][.?!] (\S)/g)) {
        // gelernt sind die Großbuchstaben A S D F G; ein Wort mit anderem Anfang bleibt klein
        if (/[asdfg]/.test(m[1]!)) throw new Error(`${seed} ${t}: klein nach Satzende`);
        after++;
      }
      // eine Zahl beginnt nie mit einer Großbuchstaben-Änderung
      expect(t).not.toMatch(/(^| )[A-Z][0-9]/);
    }
    expect(after).toBeGreaterThan(20);
  });

  it('nur erlaubte Ziffern: der Auftrag n1a bringt keine 3, 8, 1, 0, 2, 9; vor den Zahlen keine Ziffer', () => {
    for (const seed of SEEDS) {
      expect(text('n1a', seed)).not.toMatch(/[381029]/);
      expect(text('n1b', seed)).not.toMatch(/[1029]/);
      expect(text('p3c', seed, 60, { words })).not.toMatch(/[0-9]/);
    }
  });

  it('Menge: jede Ziffer im eigenen Auftrag kommt auf mindestens 80 % ihres Gewichts', () => {
    for (const lesson of LESSONS) {
      const allowed = keysUpTo(NUMBER_COURSE, lesson);
      const focus = findLesson(NUMBER_COURSE, lesson).lesson.newKeys;
      const share = charWeights({ allowed, focus });
      const counts = new Map<string, number>();
      let total = 0;
      for (const seed of SEEDS) {
        const t = text(lesson, seed, 40).replaceAll(' ', '');
        total += t.length;
        for (const c of t) counts.set(c, (counts.get(c) ?? 0) + 1);
      }
      for (const k of focus) expect((counts.get(k) ?? 0) / total, `${lesson} ${k}`).toBeGreaterThanOrEqual(0.8 * (share.get(k) ?? 0));
    }
  });

  it('Anteil: auf lange Sicht entspricht der Anteil der Ziffern an den Zeichen ihrem Gewichtsanteil (im eigenen Auftrag etwa ein Drittel)', () => {
    for (const lesson of LESSONS) {
      const allowed = keysUpTo(NUMBER_COURSE, lesson);
      const focus = findLesson(NUMBER_COURSE, lesson).lesson.newKeys;
      let digitW = 0;
      let letterW = 0;
      for (const [k, v] of charWeights({ allowed, focus })) {
        if (isDigit(k)) digitW += v;
        else if (/^[a-zäöüß]$/.test(k)) letterW += v;
      }
      let digits = 0;
      let letters = 0;
      for (const seed of SEEDS.slice(0, 100)) {
        for (const c of text(lesson, seed, 300)) {
          if (isDigit(c)) digits++;
          else if (/[a-zäöüß]/i.test(c)) letters++;
        }
      }
      const expected = digitW / (digitW + letterW);
      expect(expected, lesson).toBeGreaterThan(0.25);
      expect(digits / (digits + letters), lesson).toBeGreaterThan(expected - 0.05);
      expect(digits / (digits + letters), lesson).toBeLessThan(expected + 0.05);
    }
  });

  it('Anteil in kurzen Texten: jede neue Ziffer kommt früh, darum etwa jede zweite Einheit eine Zahl, nie fast nur Zahlen', () => {
    const ratio = (lesson: string) => {
      let nums = 0;
      let units = 0;
      for (const seed of SEEDS) {
        for (const part of partsOf(text(lesson, seed, 60))) {
          units++;
          if (/[0-9]/.test(part)) nums++;
        }
      }
      return nums / units;
    };
    for (const lesson of LESSONS) {
      expect(ratio(lesson), lesson).toBeGreaterThan(0.4);
      expect(ratio(lesson), lesson).toBeLessThan(0.62);
    }
  });

  it('Regression: ohne erlaubte Ziffern keine Ziffer (die festen Texte der Kurse ohne Zahlen stehen oben)', () => {
    const w = allWords(PUNCT_COURSE);
    for (const seed of [1, 42, 77]) {
      for (const lesson of ['p1b', 'p2c', 'p3c']) {
        const args = { allowed: keysUpTo(PUNCT_COURSE, lesson), focus: findLesson(PUNCT_COURSE, lesson).lesson.newKeys, words: w, length: 60 };
        expect(generateText({ ...args, rng: createRng(seed) })).not.toMatch(/[0-9]/);
      }
    }
  });

  it('Kurs nur aus Ziffern: Gruppen aus Ziffern, kein Absturz', () => {
    const t = generateText({ allowed: [...'4567'], focus: [...'4567'], length: 30, rng: createRng(3) });
    expect(t).toMatch(/^[4567 ]+$/);
  });
});

describe('Sonderzeichen im Text', () => {
  const words = allWords(SPECIAL_COURSE);
  const text = (lessonId: string, seed: number, length = 60, over: Partial<Parameters<typeof generateText>[0]> = {}) =>
    generateText({ allowed: keysUpTo(SPECIAL_COURSE, lessonId), focus: findLesson(SPECIAL_COURSE, lessonId).lesson.newKeys, words, length, rng: createRng(seed), ...over });
  const LESSONS = ['x1a', 'x1b', 'x1c'];
  const WORD = /^[A-ZÄÖÜ]?[a-zäöüß']+$/;
  const PREFIXED = /^[\\~][a-zäöüß']+$/;
  const NUMBER = /^[0-9]{2,4}€?$/;
  const isUnit = (u: string) => WORD.test(u) || PREFIXED.test(u) || NUMBER.test(u);

  /** Prüft die Form eines Textes und zählt, welche Rollen vorkamen */
  function check(t: string, label: string, roles: Record<string, number>) {
    expect(t, label).not.toMatch(/^ | $| {2}/);
    const tokens = t.split(' ');
    tokens.forEach((token, i) => {
      if (token === '|') {
        expect(i, `${label} Strich am Rand`).toBeGreaterThan(0);
        expect(i, `${label} Strich am Rand`).toBeLessThan(tokens.length - 1);
        roles['|'] = (roles['|'] ?? 0) + 1;
        return;
      }
      const parts = token.split(/[-@]/);
      const joins = token.match(/[-@]/g) ?? [];
      expect(token, label).not.toMatch(/€-|@.*@|@[^a-zäöüß]|[^a-zäöüß'ÄÖÜA-Z]@/);
      parts.forEach((part, j) => {
        let p = part;
        if (j === parts.length - 1) p = p.replace(/[,.?!:;]$/, '');
        const frame = /^(\{.+\}|\[.+\]|".+")$/.exec(p);
        if (frame) {
          expect(parts.length, `${label} ${token}: Paar nur allein`).toBe(1);
          const inner = p.slice(1, -1);
          expect(p.startsWith('"') ? WORD.test(inner) || PREFIXED.test(inner) : isUnit(inner), `${label} ${token}`).toBe(true);
          roles[p[0]!] = (roles[p[0]!] ?? 0) + 1;
          return;
        }
        expect(isUnit(p), `${label} ${token}`).toBe(true);
        if (j > 0 && joins[j - 1] === '@') {
          expect(p, `${label} ${token}: Wort rechts von @`).toMatch(/^[a-zäöüß']+$/);
          expect(parts[j - 1], `${label} ${token}: Wort links von @`).toMatch(WORD);
        }
        if (p[0] === '\\' || p[0] === '~') {
          expect(j, `${label} ${token}: Präfix nicht nach - oder @`).toBe(0);
          roles[p[0]] = (roles[p[0]] ?? 0) + 1;
        }
        if (p.endsWith('€')) roles['€'] = (roles['€'] ?? 0) + 1;
      });
      for (const j of joins) if (j === '@') roles['@'] = (roles['@'] ?? 0) + 1;
    });
  }

  it('SPECIAL sind die neun Zeichen der Alt-Gr-Ebene (ohne ² ³)', () => {
    expect([...SPECIAL].sort().join('')).toBe([...'@€{[]}\\~|'].sort().join(''));
    expect(isSpecial('@')).toBe(true);
    expect(isSpecial('²')).toBe(false);
    expect(isSpecial('a')).toBe(false);
  });

  it('Form je Rolle: @ zwischen zwei Wörtern, | allein zwischen Einheiten, Paare geschlossen, Präfix vor Wort, € an Zahl; keines in Wörtern oder Gruppen', () => {
    const roles: Record<string, number> = {};
    for (const lesson of LESSONS) {
      for (const seed of SEEDS.slice(0, 100)) check(text(lesson, seed), `${lesson} ${seed}`, roles);
    }
    for (const role of ['@', '€', '{', '[', '|', '\\', '~']) expect(roles[role] ?? 0, role).toBeGreaterThan(30);
  });

  it('die Textlänge wird nur um die letzte Einheit überschritten, kein Text endet mit @ oder |', () => {
    for (const lesson of LESSONS) {
      for (const seed of SEEDS) {
        const t = text(lesson, seed, 40);
        expect(t, `${lesson} ${seed}`).not.toMatch(/[@|-]$/);
        expect(t, `${lesson} ${seed}`).not.toMatch(/[\\~]$/);
      }
    }
  });

  it('nur erlaubte Zeichen: x1a bringt keine Klammer, Backslash, Tilde und keinen Strich; x1b keinen Backslash, keine Tilde und keinen Strich', () => {
    for (const seed of SEEDS) {
      expect(text('x1a', seed)).not.toMatch(/[{}[\]\\~|]/);
      expect(text('x1b', seed)).not.toMatch(/[\\~|]/);
      for (const lesson of ['p3c', 'n1d']) {
        expect(text(lesson, seed, 60, { allowed: keysUpTo(SPECIAL_COURSE, lesson), focus: findLesson(SPECIAL_COURSE, lesson).lesson.newKeys })).not.toMatch(/[@€{}[\]\\~|]/);
      }
    }
  });

  it('€ nur mit erlaubten Ziffern, ein Paar nur mit beiden Hälften', () => {
    for (const seed of SEEDS.slice(0, 100)) {
      expect(generateText({ allowed: [...'asdfgjklö€'], focus: ['€'], words: WORDS, length: 60, rng: createRng(seed) })).not.toContain('€');
      expect(generateText({ allowed: [...'asdfgjklö{'], focus: ['{'], words: WORDS, length: 60, rng: createRng(seed) })).not.toMatch(/[{}]/);
    }
  });

  it('Menge: jedes Zeichen im eigenen Auftrag kommt auf mindestens 80 % seines Gewichts', () => {
    for (const lesson of LESSONS) {
      const allowed = keysUpTo(SPECIAL_COURSE, lesson);
      const focus = findLesson(SPECIAL_COURSE, lesson).lesson.newKeys;
      const share = charWeights({ allowed, focus });
      const counts = new Map<string, number>();
      let total = 0;
      for (const seed of SEEDS) {
        const t = text(lesson, seed, 40).replaceAll(' ', '');
        total += t.length;
        for (const c of t) counts.set(c, (counts.get(c) ?? 0) + 1);
      }
      for (const k of focus) expect((counts.get(k) ?? 0) / total, `${lesson} ${k}`).toBeGreaterThanOrEqual(0.8 * (share.get(k) ?? 0));
    }
  });

  it('Regression: ohne Sonderzeichen derselbe Text und dieselben Zufallsaufrufe wie vorher', () => {
    const w = allWords(NUMBER_COURSE);
    const args = { allowed: keysUpTo(NUMBER_COURSE, 'n1d'), focus: findLesson(NUMBER_COURSE, 'n1d').lesson.newKeys, words: w, length: 60 };
    expect([1, 42].map((seed) => generateText({ ...args, rng: createRng(seed) }))).toEqual([
      "219 289! hab's-432-80 01 8296 36. Seele-969; bruch kasse lass",
      '922. ritt mumm; 12: 940, 62: 98 441: 672 sage, bruch 8955, 094',
    ]);
  });

  it('Kurs nur aus Sonderzeichen: kein Absturz', () => {
    const t = generateText({ allowed: [...'@€'], focus: [...'@€'], length: 30, rng: createRng(3) });
    expect(t).toMatch(/^[@€ ]+$/);
  });
});

describe('Sätze aus der Geschichte (Bennos Tippstunde)', () => {
  const allowed = [...LETTERS, '.', ',', '!'];
  const SENTENCES = ['das lass falls glas.', 'jagd das alaska, das gaga!', 'fass das glas, das fass.'];
  const gen = (seed: number, length = 120, sentences: readonly string[] = SENTENCES) =>
    generateText({ allowed, focus: ['ö'], words: WORDS, length, rng: createRng(seed), sentences });

  it('ohne Sätze (leer oder nicht gesetzt) bleibt der Text unverändert', () => {
    for (const seed of SEEDS.slice(0, 50)) {
      const plain = generateText({ allowed, focus: ['ö'], words: WORDS, length: 80, rng: createRng(seed) });
      expect(gen(seed, 80, [])).toBe(plain);
    }
  });

  it('Sätze stehen ganz im Text, nur aus erlaubten Zeichen, und etwa ein Drittel der Länge', () => {
    let share = 0;
    let runs = 0;
    for (const seed of SEEDS) {
      const t = gen(seed);
      expect(t).not.toMatch(/ {2}|^ | $/);
      expect([...t].every((c) => c === ' ' || allowed.includes(c)), t).toBe(true);
      const used = SENTENCES.filter((s) => t.includes(s));
      expect(used.length, t).toBeGreaterThan(0);
      share += used.reduce((n, s) => n + s.length, 0) / t.length;
      runs++;
    }
    expect(share / runs).toBeGreaterThan(0.2);
    expect(share / runs).toBeLessThan(0.45);
  });

  it('ein Satz kommt höchstens einmal je Text vor; kurze Texte ohne passenden Satz bleiben ohne', () => {
    for (const seed of SEEDS) {
      const t = gen(seed, 200);
      for (const s of SENTENCES) expect(t.split(s).length - 1, `${seed} ${s}`).toBeLessThanOrEqual(1);
    }
    const short = gen(1, 30, ['ein langer satz, den man nicht tippen kann in dreißig zeichen.']);
    expect(short).toBe(generateText({ allowed, focus: ['ö'], words: WORDS, length: 30, rng: createRng(1) }));
  });
});
