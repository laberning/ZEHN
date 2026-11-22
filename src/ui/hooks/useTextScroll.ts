// Lässt das Übungstext-Feld mit der Schreibmarke mitrollen (Regel: ui/components/textScroll.ts).
// Läuft nach jedem Anschlag (vor dem Zeichnen, damit nichts ruckelt) und bei jeder Größenänderung des Felds (Drehung, Zoom).

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLatest } from './useLatest.ts';
import { cutBelow, lineTopOf, nextScrollTop } from '../components/textScroll.ts';

/** Gibt die Referenz für das Rollfeld zurück (`.text-scroll`); darin steht die Schreibmarke als `.cursor` */
export function useTextScroll(text: string, position: number) {
  const ref = useRef<HTMLSpanElement>(null);
  const lastText = useRef<string | null>(null);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    // neuer Text: von vorn, ohne sichtbares Zurückrollen
    if (lastText.current !== text) {
      lastText.current = text;
      const behavior = el.style.scrollBehavior;
      el.style.scrollBehavior = 'auto';
      el.scrollTop = 0;
      el.style.scrollBehavior = behavior;
    }
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    if (!(lineHeight > 0)) return;
    const cursor = el.querySelector<HTMLElement>('.cursor');
    let top = el.scrollTop;
    // ohne Schreibmarke (Text fertig) bleibt die Rollhöhe
    if (cursor) {
      const input = {
        lineHeight,
        cursorTop: lineTopOf(cursor.offsetTop + cursor.offsetHeight / 2, lineHeight),
        viewHeight: el.clientHeight,
        contentHeight: el.scrollHeight,
        scrollTop: top,
      };
      const next = nextScrollTop(input);
      if (next !== top) {
        el.scrollTop = next;
        top = Math.min(next, input.contentHeight - input.viewHeight);
      }
    }
    el.dataset.cut = String(cutBelow(top, el.clientHeight, lineHeight, el.scrollHeight));
  };

  const latest = useLatest(update);
  useLayoutEffect(update, [text, position]);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => latest.current());
    observer.observe(el);
    return () => observer.disconnect();
  }, [latest]);
  return ref;
}
