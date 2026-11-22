// Testhilfe: die gezeichneten Rechtecke eines Bildes, auch die in den Pixelbildern (`<image href="data:…">`, ui/pixel/pixelImage.ts).

import { inlineImages } from '../ui/pixel/pixelImage.ts';

/** Rechtecke unter `root`: die Flächen aus den Bildern zuerst (in Zeichenreihenfolge), dann die einzeln gezeichneten Teile */
export function rectsIn(root: Element): Element[] {
  const holder = document.createElement('div');
  holder.innerHTML = inlineImages(root.innerHTML);
  return [...holder.querySelectorAll('rect')];
}
