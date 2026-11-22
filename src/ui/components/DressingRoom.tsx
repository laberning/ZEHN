// Aufbau von Rekrutierung und Garderobe: links groß die Figur (bleibt beim Scrollen stehen), rechts die Auswahl mit Reitern.

import type { ReactNode } from 'react';

export function DressingRoom({ preview, children }: { preview: ReactNode; children: ReactNode }) {
  return (
    <div className="create">
      <div className="create-preview">{preview}</div>
      <div className="create-form">{children}</div>
    </div>
  );
}
