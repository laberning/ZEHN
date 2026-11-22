// Link zu einer Seite außerhalb des Spiels: ruhige Knopfform (a.quiet), öffnet in einem neuen Tab, ohne Verweis auf das Spiel.
// Das Zeichen „neuer Tab“ ist gezeichnet (kein Emoji, ADR-0006); Screenreader hören „(öffnet neuen Tab)“.

import type { ReactNode } from 'react';

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="quiet" href={href} target="_blank" rel="noreferrer">
      {children}
      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 2H2v8h8V7M7 2h3v3M10 2 5.5 6.5" />
      </svg>
      <span className="sr-only"> (öffnet neuen Tab)</span>
    </a>
  );
}
