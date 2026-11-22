// Mitrollen des Übungstext-Felds: Maße kennt happy-dom nicht (kein Layout) und werden hier vorgegeben.
// Die Regel selbst steht in ui/components/textScroll.test.ts; hier: der Hook liest die Maße, setzt die Rollhöhe und reagiert auf Größenänderungen.

import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTextScroll } from './useTextScroll.ts';

const LH = 20;
/** Maße des Rollfelds, von den Tests gesetzt */
const dims = { view: 70, content: 160 };

/** Ein Zeichen je Zeile, damit die Zeile der Marke ihrem Index entspricht */
function Probe({ text, position }: { text: string; position: number }) {
  const ref = useTextScroll(text, position);
  return (
    <span className="text-scroll" data-testid="scroll" ref={ref} style={{ lineHeight: `${LH}px` }}>
      {Array.from(text, (ch, i) => (
        <span key={i} data-top={i * LH} className={i === position ? 'cursor' : ''}>
          {ch}
        </span>
      ))}
    </span>
  );
}

let observers: (() => void)[] = [];

beforeEach(() => {
  observers = [];
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', { configurable: true, get() { return Number(this.dataset.top ?? 0); } });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { return LH; } });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return this.classList.contains('text-scroll') ? dims.view : 0; } });
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get() { return this.classList.contains('text-scroll') ? dims.content : 0; } });
  vi.stubGlobal('ResizeObserver', class { constructor(cb: () => void) { observers.push(cb); } observe() {} disconnect() {} });
  dims.view = 70; // 3,5 Zeilen
  dims.content = 160; // 8 Zeilen
});
afterEach(() => {
  for (const p of ['offsetTop', 'offsetHeight', 'clientHeight', 'scrollHeight'] as const) delete (HTMLElement.prototype as unknown as Record<string, unknown>)[p];
});

const TEXT = 'abcdefgh';

describe('useTextScroll', () => {
  it('rollt nicht, solange Marke und nächste Zeile passen', () => {
    const { getByTestId } = render(<Probe text={TEXT} position={1} />);
    expect(getByTestId('scroll').scrollTop).toBe(0);
  });

  it('rückt zeilenweise nach, sobald unter der Marke keine Zeile mehr Platz hat', () => {
    const { getByTestId, rerender } = render(<Probe text={TEXT} position={1} />);
    rerender(<Probe text={TEXT} position={2} />);
    expect(getByTestId('scroll').scrollTop).toBe(2 * LH);
    rerender(<Probe text={TEXT} position={3} />);
    expect(getByTestId('scroll').scrollTop).toBe(2 * LH); // Zeile 3 und 4 passen
    rerender(<Probe text={TEXT} position={4} />);
    expect(getByTestId('scroll').scrollTop).toBe(4 * LH);
  });

  it('ein neuer Text beginnt von vorn', () => {
    const { getByTestId, rerender } = render(<Probe text={TEXT} position={5} />);
    expect(getByTestId('scroll').scrollTop).toBe(5 * LH);
    rerender(<Probe text="stuvwxyz" position={0} />);
    expect(getByTestId('scroll').scrollTop).toBe(0);
  });

  it('ohne Schreibmarke (Text fertig) bleibt die Rollhöhe', () => {
    const { getByTestId, rerender } = render(<Probe text={TEXT} position={4} />);
    rerender(<Probe text={TEXT} position={TEXT.length} />);
    expect(getByTestId('scroll').scrollTop).toBe(4 * LH);
  });

  it('eine Größenänderung (Drehung) ruft die Regel erneut auf: die Marke kommt wieder ins Bild', () => {
    const { getByTestId } = render(<Probe text={TEXT} position={4} />);
    const box = getByTestId('scroll');
    box.scrollTop = 0; // nach dem Umbruch der Zeilen steht die Marke unter dem sichtbaren Teil
    dims.view = 50; // 2,5 Zeilen
    observers.forEach((cb) => cb());
    expect(box.scrollTop).toBe(4 * LH);
  });

  it('meldet über data-cut, ob unten eine Zeile angeschnitten ist', () => {
    const { getByTestId, rerender } = render(<Probe text={TEXT} position={0} />);
    expect(getByTestId('scroll').dataset.cut).toBe('true'); // 3,5 Zeilen sichtbar, darunter mehr Text
    dims.view = 80; // genau vier Zeilen
    rerender(<Probe text={TEXT} position={1} />);
    expect(getByTestId('scroll').dataset.cut).toBe('false');
  });
});
