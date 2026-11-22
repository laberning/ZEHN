// Betrachter für das Beweisfach im Koffer: ein Beweisstück groß in einem festen Rahmen, Blättern mit Pfeilen.
// Esc schließt (das übernimmt die Garderobe, damit Esc nicht gleichzeitig ins HQ führt); Tab bleibt im Fenster.

import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import type { EvidencePiece } from '../../domain/items.ts';
import { StoryPicture } from '../../ui/pictures/StoryPicture.tsx';

export function EvidenceViewer({
  title,
  pieces,
  index,
  onIndex,
  onClose,
  onFallakte,
}: {
  title: string;
  pieces: readonly EvidencePiece[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  /** nur wenn die Fallakte schon offen ist */
  onFallakte?: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const nameId = useId();
  useEffect(() => closeBtn.current?.focus(), []);

  const piece = pieces[index]!;
  const many = pieces.length > 1;
  const step = (d: number) => onIndex((index + d + pieces.length) % pieces.length);

  const onKeyDown = (e: KeyboardEvent) => {
    if (many && e.key === 'ArrowLeft') step(-1);
    else if (many && e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') {
      // Fokus im Fenster halten – auch wenn er nach einem Klick auf Bild oder Text auf dem Fenster selbst liegt
      const items = [...(panel.current?.querySelectorAll<HTMLElement>('button') ?? [])];
      const at = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && at <= 0) items.at(-1)?.focus();
      else if (!e.shiftKey && (at === -1 || at === items.length - 1)) items[0]?.focus();
      else return;
    } else return;
    e.preventDefault();
  };

  return (
    <div className="evidence-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} className="evidence-viewer" role="dialog" aria-modal="true" aria-labelledby={nameId} tabIndex={-1} onKeyDown={onKeyDown}>
        <div className="evidence-stage">
          <StoryPicture id={piece.picture} />
        </div>
        <div className="evidence-info">
          <small className="evidence-kicker">
            {title}
            {many && ` · ${index + 1} / ${pieces.length}`}
          </small>
          <h2 id={nameId}>{piece.name}</h2>
          <p>{piece.text}</p>
          <div className="evidence-actions">
            {many && (
              <span className="evidence-nav">
                <button aria-label="Voriges Beweisstück" onClick={() => step(-1)}>
                  ◀
                </button>
                <button aria-label="Nächstes Beweisstück" onClick={() => step(1)}>
                  ▶
                </button>
              </span>
            )}
            {onFallakte && <button onClick={onFallakte}>Zur Fallakte</button>}
            <button ref={closeBtn} onClick={onClose}>
              Schließen <kbd>Esc</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
