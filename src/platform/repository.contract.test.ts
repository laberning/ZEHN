// Contract-Test: Memory- und Dexie-Repository verhalten sich gleich (Dexie gegen fake-indexeddb).

import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { ProfileRepository } from '../app/ports.ts';
import type { Profile } from '../domain/profile.ts';
import { profile } from '../test/factories.ts';
import { dexieRepository } from './dexieRepository.ts';
import { memoryRepository } from './memoryRepository.ts';

let n = 0;
const implementations: [string, () => ProfileRepository][] = [
  ['Memory', () => memoryRepository()],
  ['Dexie', () => dexieRepository(`zehn-test-${++n}`)],
];

/** Der Port liefert ungeprüfte Datensätze in beliebiger Reihenfolge – hier als Profile, nach ID sortiert */
const listed = async (repo: ProfileRepository) => ((await repo.list()) as Profile[]).sort((a, b) => a.id.localeCompare(b.id));
const ids = async (repo: ProfileRepository) => (await listed(repo)).map((p) => p.id);

describe.each(implementations)('%s-Repository', (_name, make) => {
  it('speichert, aktualisiert und löscht', async () => {
    const repo = make();
    expect(await repo.list()).toEqual([]);
    await repo.save(profile({ id: 'b', createdAt: 2 }));
    await repo.save(profile({ id: 'a', createdAt: 1 }));
    expect(await ids(repo)).toEqual(['a', 'b']);
    await repo.save(profile({ id: 'a', createdAt: 1, xp: 99 }));
    expect((await listed(repo)).find((p) => p.id === 'a')?.xp).toBe(99);
    await repo.remove('a');
    expect(await ids(repo)).toEqual(['b']);
  });

  it('verliert keine alten Datensätze ohne Anlegedatum', async () => {
    const repo = make();
    const old: Partial<Profile> = profile({ id: 'alt' });
    delete old.createdAt;
    await repo.save(old as Profile);
    await repo.save(profile({ id: 'neu', createdAt: 5 }));
    expect(await ids(repo)).toEqual(['alt', 'neu']);
  });

  it('liefert Kopien (spätere Änderungen am Objekt landen nicht ungefragt im Speicher)', async () => {
    const repo = make();
    const p = profile();
    await repo.save(p);
    p.xp = 1234;
    expect((await listed(repo))[0]?.xp).toBe(0);
  });
});
