import { useEffect, useRef, type RefObject } from 'react';

/** Hält immer den neuesten Wert (z. B. einen Handler) – für Listener, die nicht neu registriert werden sollen. */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
