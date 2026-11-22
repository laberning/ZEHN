// Roll-Regel des Übungstext-Felds: Das Feld zeigt so viele ganze Zeilen, wie Platz ist, und rollt zeilenweise mit der
// Schreibmarke. Reine Funktionen (Maße in Pixeln); der Hook `useTextScroll` liest die Maße aus dem DOM.

/** Toleranz für Rundung der Maße (Pixel) */
const EPS = 1;

export interface ScrollInput {
  /** Höhe einer Zeile */
  lineHeight: number;
  /** Oberkante der Zeile mit der Schreibmarke, gemessen vom Anfang des Textes */
  cursorTop: number;
  /** sichtbare Höhe des Textfelds */
  viewHeight: number;
  /** Höhe des ganzen Textes */
  contentHeight: number;
  /** aktuelle Rollhöhe */
  scrollTop: number;
}

/**
 * Neue Rollhöhe. Die Zeile der Schreibmarke und die nächste (falls es sie gibt) bleiben ganz sichtbar:
 * Passen beide, bleibt alles; sonst wird die Zeile der Marke die erste sichtbare. Liegt sie oberhalb des Fensters
 * (Fenster wurde größer, neue Runde), rückt der Text zurück. Passt nur eine Zeile, bleibt die Marke sichtbar.
 */
export function nextScrollTop({ lineHeight, cursorTop, viewHeight, contentHeight, scrollTop }: ScrollInput): number {
  const hasNext = cursorTop + lineHeight < contentHeight - EPS;
  const needed = Math.min(cursorTop + (hasNext && viewHeight >= 2 * lineHeight - EPS ? 2 * lineHeight : lineHeight), contentHeight);
  const fits = cursorTop >= scrollTop - EPS && needed <= scrollTop + viewHeight + EPS;
  return fits ? scrollTop : cursorTop;
}

/** Oberkante der Zeile, in der ein Zeichen mit Mitte `middle` liegt (Zeilen sind gleich hoch) */
export function lineTopOf(middle: number, lineHeight: number): number {
  return Math.floor(middle / lineHeight) * lineHeight;
}

/** Ist unten eine Zeile angeschnitten (es gibt darunter noch Text, und sie ist nicht ganz zu sehen)? Dann blendet sie aus. */
export function cutBelow(scrollTop: number, viewHeight: number, lineHeight: number, contentHeight: number): boolean {
  const bottom = scrollTop + viewHeight;
  if (bottom >= contentHeight - EPS) return false;
  const rest = bottom % lineHeight;
  return rest > EPS && lineHeight - rest > EPS;
}
