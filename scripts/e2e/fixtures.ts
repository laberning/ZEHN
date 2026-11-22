// Schreibt die Profil-Sicherungen für die Browser-Tests nach e2e/fixtures/. Aufruf: `npm run e2e:fixture`.
// Nötig nach Änderungen am Kurs oder an den Inhalten, wenn src/test/e2eFixtures.test.ts meldet, dass eine Sicherung nicht mehr passt.

import { mkdirSync, writeFileSync } from 'node:fs';
import { FIXTURE_FILES, buildFixtures } from '../../src/test/finalFixtures.ts';

const dir = new URL('../../e2e/fixtures/', import.meta.url);
mkdirSync(dir, { recursive: true });
const files = await buildFixtures();
for (const key of Object.keys(FIXTURE_FILES) as (keyof typeof FIXTURE_FILES)[]) {
  writeFileSync(new URL(FIXTURE_FILES[key], dir), files[key]);
  console.log(`e2e/fixtures/${FIXTURE_FILES[key]} geschrieben.`);
}
