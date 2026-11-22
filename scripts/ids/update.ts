// Trägt neue gespeicherte IDs (Szenen, Antworten, Dinge, Fälle, Abzeichen, Garderobe, Module, Aufträge, Spiele) in
// src/content/knownIds.ts ein. Aufruf: `npm run ids`. Entfernt nie etwas; die Arbeit steckt in `updateKnownIdsSource` (src/content/ids.ts).

import { readFileSync, writeFileSync } from 'node:fs';
import { presentIds, updateKnownIdsSource } from '../../src/content/ids.ts';

const file = new URL('../../src/content/knownIds.ts', import.meta.url);
const before = readFileSync(file, 'utf8');
const after = updateKnownIdsSource(before, presentIds());

if (after === before) {
  console.log('knownIds.ts: nichts zu ergänzen.');
} else {
  writeFileSync(file, after);
  console.log('knownIds.ts: ergänzt – bitte den Diff prüfen.');
}
