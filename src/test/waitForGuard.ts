// Schutz gegen hängende Testläufe: Läuft ein Komponententest in den Timeout, wartet sein findBy/waitFor weiter.
// Ab dem nächsten Test schaltet es dann dessen neue Fake-Uhr weiter – endlos, weil die eigene Frist von waitFor an der
// alten Uhr hängt. Jeder Durchlauf prüft vorher dazu die gesamte Seite für die Fehlermeldung: 100 % CPU, der Lauf wird
// nie fertig, und wird er abgebrochen, bleiben die Worker-Prozesse übrig.
// Deshalb bekommt jeder Test eine Nummer; ein waitFor aus einem früheren Test bricht beim nächsten Schritt mit einem
// klaren Fehler ab. Vitest zeigt ihn als „Unhandled Rejection“ (waitFor fängt Fehler aus seiner Schleife nicht) und
// lässt den Lauf scheitern – der Test davor ist ohnehin schon am Timeout gescheitert.

type AdvanceTimersWrapper = (cb: () => unknown) => unknown;

export const STALE_WAIT_FOR = 'waitFor aus einem früheren Test (wohl nach einem Timeout) abgebrochen';

export function waitForGuard(advance: AdvanceTimersWrapper) {
  let current = 0;
  return {
    /** Für den nächsten Test: liefert den Wrapper, den Testing Library beim Start eines waitFor übernimmt */
    nextTest(): AdvanceTimersWrapper {
      const test = ++current;
      return (cb) => {
        if (test !== current) throw new Error(STALE_WAIT_FOR);
        return advance(cb);
      };
    },
  };
}
