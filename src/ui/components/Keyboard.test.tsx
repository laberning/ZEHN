import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { keyStat } from '../../test/factories.ts';
import { UMLAUTE_GROSS } from '../../domain/keyboard.ts';
import { sealOf, type MasteryCriteria } from '../../domain/mastery.ts';
import { Keyboard } from './Keyboard.tsx';

const C: MasteryCriteria = { minSamples: 10, minAccuracy: 0.9, maxAvgMs: 1000 };
const sitting = keyStat({ samples: 20, accuracy: 1, avgMs: 500 });

/** Die Umschalttasten sind Deko-Zellen; die linke ist die erste, die rechte die letzte der unteren Reihe */
const shiftCells = (container: HTMLElement) => {
  const row = container.querySelectorAll('.kb-row')[3]!;
  const cells = row.querySelectorAll('.kb-key');
  return { left: cells[0]!, right: cells[cells.length - 1]! };
};

describe('Keyboard: Umschalttasten', () => {
  it('leuchten, sobald ein Großbuchstabe ihrer Hand gelernt ist; ohne Großbuchstaben bleiben sie dunkel', () => {
    const none = shiftCells(render(<Keyboard learned={new Set([...'asdf'])} />).container);
    expect(none.left).not.toHaveClass('learned');
    expect(none.right).not.toHaveClass('learned');
    // Großbuchstaben der linken Hand werden mit der rechten Umschalttaste getippt
    const leftHand = shiftCells(render(<Keyboard learned={new Set([...'asdfQ'])} />).container);
    expect(leftHand.right).toHaveClass('learned');
    expect(leftHand.left).not.toHaveClass('learned');
    const rightHand = shiftCells(render(<Keyboard learned={new Set([...'asdfJ'])} />).container);
    expect(rightHand.left).toHaveClass('learned');
    expect(rightHand.right).not.toHaveClass('learned');
  });

  it('das Siegel der Umschalttaste zeichnet den Ring auf der Umschalttaste, gesichert mit Haken', () => {
    const seal = sealOf('shift-right', keyStat({ samples: 12, accuracy: 0.5, avgMs: 3000 }), C);
    const { container } = render(<Keyboard learned={new Set(['Q'])} rings={{ 'shift-right': seal }} />);
    const { left, right } = shiftCells(container);
    expect(right).toHaveClass('ringed', 'ring-1');
    expect(right).not.toHaveClass('ring-2');
    expect(left).not.toHaveClass('ringed');
    expect(container.querySelectorAll('.kb-key.ringed')).toHaveLength(1);
    const secured = render(<Keyboard learned={new Set(['Q'])} rings={{ 'shift-right': sealOf('shift-right', sitting, C, ['training', 'precision', 'tempo']) }} />);
    expect(shiftCells(secured.container).right.querySelector('.kb-check')).not.toBeNull();
  });

  it('Ä Ö Ü haben ein gemeinsames Siegel: der Ring liegt auf allen drei Tasten (ä, ö, ü), nicht auf einer Umschalttaste', () => {
    const { container } = render(<Keyboard learned={new Set([...'äöüÄÖÜ'])} rings={{ [UMLAUTE_GROSS]: sealOf(UMLAUTE_GROSS, sitting, C, ['training', 'precision', 'tempo']) }} />);
    const ringed = [...container.querySelectorAll('.kb-key.ringed')];
    expect(ringed.map((r) => r.textContent?.replace('✓', ''))).toEqual(['Ü', 'Ö', 'Ä']);
    expect(ringed.every((r) => r.querySelector('.kb-check'))).toBe(true);
    expect(shiftCells(container).left).not.toHaveClass('ringed');
    expect(shiftCells(container).right).not.toHaveClass('ringed');
  });

  it('die Umschalttaste leuchtet als Ziel, wenn das nächste Zeichen sie braucht', () => {
    const { container } = render(<Keyboard target="J" />);
    expect(shiftCells(container).left).toHaveClass('target');
  });
});

describe('Keyboard: Zeichen mit Umschalttaste auf geteilten Tasten', () => {
  const open = (key: string) => sealOf(key, keyStat({ samples: 12, accuracy: 0.5, avgMs: 3000 }), C);
  const secured = (key: string) => sealOf(key, sitting, C, ['training', 'precision', 'tempo']);
  /** Taste mit diesem Grundzeichen (ohne Buchstaben-Label) */
  const keyOf = (container: HTMLElement, base: string) => [...container.querySelectorAll('.kb-key')].find((k) => k.querySelector('span:not(.kb-shift):not(.kb-check)')?.textContent === base)!;
  const learned = new Set(['ß', '?', '1', '!']);

  it('ß gesichert und ? offen: der Ring von ? liegt auf der Taste', () => {
    const { container } = render(<Keyboard learned={learned} rings={{ ß: secured('ß'), '?': open('?') }} />);
    const key = keyOf(container, 'ß');
    expect(key).toHaveClass('ringed', 'ring-1');
    expect(key.querySelector('.kb-check')).toBeNull();
  });

  it('beide offen: der Ring von ß (Grundzeichen); beide gesichert: das Grundzeichen mit Haken', () => {
    // ß: Übung und Genau offen, nicht gesichert; ?: nur Übung offen
    const both = render(<Keyboard learned={learned} rings={{ ß: sealOf('ß', keyStat({ samples: 20, accuracy: 1, avgMs: 3000 }), C), '?': open('?') }} />);
    expect(keyOf(both.container, 'ß')).toHaveClass('ringed', 'ring-1', 'ring-2');
    const done = render(<Keyboard learned={learned} rings={{ ß: secured('ß'), '?': secured('?') }} />);
    expect(keyOf(done.container, 'ß').querySelector('.kb-check')).not.toBeNull();
  });

  it('die Taste leuchtet, wenn nur ihr Umschaltzeichen gelernt ist (! auf der 1); ohne beides bleibt sie dunkel', () => {
    expect(keyOf(render(<Keyboard learned={new Set(['!'])} />).container, '1')).toHaveClass('learned');
    expect(keyOf(render(<Keyboard learned={new Set(['a'])} />).container, '1')).toHaveClass('off');
  });

  it('Wärme: die Taste 1 färbt sich aus ! (Grundzeichen fehlt), ß bleibt bei seiner eigenen Farbe', () => {
    const { container } = render(<Keyboard heat={{ '!': 1, ß: 0, '?': 1 }} />);
    expect(keyOf(container, '1')).toHaveClass('heat');
    expect(keyOf(container, 'ß')).toHaveClass('heat');
    const measuring = render(<Keyboard heat={{ '!': null }} />);
    expect(keyOf(measuring.container, '1')).toHaveClass('measuring');
    expect(keyOf(measuring.container, '2')).toHaveClass('off');
  });
});

describe('Keyboard: Zahlenreihe', () => {
  const open = (key: string) => sealOf(key, keyStat({ samples: 12, accuracy: 0.5, avgMs: 3000 }), C);
  const secured = (key: string) => sealOf(key, sitting, C, ['training', 'precision', 'tempo']);
  const keyOf = (container: HTMLElement, base: string) => [...container.querySelectorAll('.kb-key')].find((k) => k.querySelector('span:not(.kb-shift):not(.kb-check)')?.textContent === base)!;

  it('die 4 leuchtet, trägt den Ring ihres Siegels und ihre Wärme', () => {
    const { container } = render(<Keyboard learned={new Set(['4'])} rings={{ '4': open('4') }} heat={{ '4': 1 }} />);
    const key = keyOf(container, '4');
    expect(key).toHaveClass('ringed', 'ring-1', 'heat');
    expect(keyOf(render(<Keyboard learned={new Set(['4'])} />).container, '4')).toHaveClass('learned');
    expect(keyOf(container, '5')).not.toHaveClass('ringed');
  });

  it('auf der 1 gilt das offene Siegel zuerst: ! gesichert, 1 offen zeigt den Ring von 1', () => {
    const { container } = render(<Keyboard learned={new Set(['1', '!'])} rings={{ '!': secured('!'), '1': open('1') }} />);
    const key = keyOf(container, '1');
    expect(key).toHaveClass('ringed', 'ring-1');
    expect(key.querySelector('.kb-check')).toBeNull();
  });
});

describe('Keyboard: Alt-Gr-Zeichen', () => {
  const open = (key: string) => sealOf(key, keyStat({ samples: 12, accuracy: 0.5, avgMs: 3000 }), C);
  const secured = (key: string) => sealOf(key, sitting, C, ['training', 'precision', 'tempo']);
  /** Taste mit diesem Code in der Reihe (Q: zweite Reihe, 7: erste Reihe): über ihre Beschriftung gefunden */
  const keyWith = (container: HTMLElement, text: string) => [...container.querySelectorAll('.kb-key')].find((k) => k.textContent?.replace('✓', '') === text)!;
  const learned = new Set([...'qwe@']);

  it('das @ gilt als gelernt: Q leuchtet auch ohne q, mit klein eingeblendetem @; ungelernt ist es nicht zu sehen', () => {
    const only = render(<Keyboard learned={new Set(['@'])} />).container;
    expect(keyWith(only, 'Q@')).toHaveClass('learned');
    expect(only.querySelector('.kb-altgr')?.textContent).toBe('@');
    const none = render(<Keyboard learned={new Set(['q'])} />).container;
    expect(none.querySelector('.kb-altgr')).toBeNull();
    expect(render(<Keyboard />).container.querySelector('.kb-altgr')).toBeNull();
  });

  it('Ring: das offene Siegel zuerst, auch das des @ auf dem gesicherten Q; gesichert mit Haken', () => {
    const ring = render(<Keyboard learned={learned} rings={{ q: secured('q'), '@': open('@') }} />).container;
    const key = keyWith(ring, 'Q@');
    expect(key).toHaveClass('ringed', 'ring-1');
    expect(key.querySelector('.kb-check')).toBeNull();
    const done = render(<Keyboard learned={learned} rings={{ q: secured('q'), '@': secured('@') }} />).container;
    expect(keyWith(done, 'Q@').querySelector('.kb-check')).not.toBeNull();
    expect(keyWith(done, 'W')).not.toHaveClass('ringed');
  });

  it('Wärme: das Q färbt sich aus @, wenn das q fehlt; das q hat Vorrang', () => {
    const fromAt = render(<Keyboard learned={learned} heat={{ '@': 1 }} />).container;
    expect(keyWith(fromAt, 'Q@')).toHaveClass('heat');
    expect(keyWith(fromAt, 'W')).toHaveClass('off');
    const heat = render(<Keyboard learned={learned} heat={{ '@': 1, q: 0 }} />).container;
    expect(keyWith(heat, 'Q@')).toHaveClass('heat');
    const measuring = render(<Keyboard learned={learned} heat={{ '@': null }} />).container;
    expect(keyWith(measuring, 'Q@')).toHaveClass('measuring');
  });
});
