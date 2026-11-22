// Reiter (Garderobe, Akte): Reiterleiste und Inhalt nach WAI-ARIA – Pfeiltasten wechseln den Reiter.

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

interface Props<T extends string> {
  /** `mark`: kleiner Punkt am Reiter, z. B. wenn darin etwas neu ist */
  tabs: readonly { id: T; label: string; mark?: boolean }[];
  value: T;
  onChange: (id: T) => void;
  /** Wofür die Reiter stehen (für Screenreader) */
  label: string;
  /** Inhalt des gewählten Reiters */
  children: ReactNode;
}

export function Tabs<T extends string>({ tabs, value, onChange, label, children }: Props<T>) {
  const base = useId();
  const list = useRef<HTMLDivElement>(null);
  const tabId = (id: T) => `${base}-tab-${id}`;
  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === value);
    const next = tabs[(i + step + tabs.length) % tabs.length]!;
    onChange(next.id);
    list.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(tabId(next.id))}`)?.focus();
  };
  return (
    <>
      <div className="row tabs" role="tablist" aria-label={label} ref={list} onKeyDown={onKeyDown}>
        {tabs.map((t) => (
          <button
            key={t.id}
            id={tabId(t.id)}
            role="tab"
            aria-selected={t.id === value}
            aria-controls={`${base}-panel`}
            tabIndex={t.id === value ? 0 : -1}
            className={t.id === value ? 'sel' : ''}
            onClick={() => onChange(t.id)}
          >
            {t.label}
            {t.mark && (
              <>
                <span className="tab-mark" aria-hidden="true" />
                <span className="sr-only">, neu</span>
              </>
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-panel`} aria-labelledby={tabId(value)}>
        {children}
      </div>
    </>
  );
}
