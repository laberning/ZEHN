// Dinge, Belohnungen, Abzeichen, Garderobe und Spielhalle prüfen. Weitere Inhaltstests: course.test.ts, story.test.ts, akt1.test.ts.

import { describe, expect, it } from 'vitest';
import type { Line } from '../domain/dialog.ts';
import { wearable } from '../domain/wardrobe.ts';
import { createRng } from '../domain/rng.ts';
import { rollCodename } from '../domain/profile.ts';
import { ALL_ACTS, ALL_CASES as EXTRA_CASES, ALL_SCENES as SCENES, EXAM_STORY, LESSON_STORY, actScenes, isMain, mainRank } from '../test/content.ts';
import { hasEmoji } from '../test/emoji.ts';
import { ARCADE_GAMES } from './arcadeGames.ts';
import { BADGES } from './badges.ts';
import { CODENAMES } from './codenames.ts';
import { CLOTH, ITEMS } from './items.ts';
import manifest from './lpc.generated.json';
import { REWARDS } from './rewards.ts';
import { REWARD_SCENES } from './story/rewardScenes.ts';
import { COLOR_NAMES } from './texts/wardrobe.ts';
import { ALL_ITEMS, COLOR_PACKS, SPECIAL_ITEMS, WARDROBE } from './wardrobe.ts';

describe('Dinge und Belohnungen', () => {
  const scenesGiving = (id: string) => SCENES.filter((s) => s.gives?.includes(id));
  const needed = (lines: readonly Line[]): string[] => lines.flatMap((l) => (l.choices ?? []).flatMap((c) => [...(c.needs ? [c.needs] : []), ...needed(c.reply ?? [])]));
  const allNeeds = new Set([
    ...SCENES.flatMap((s) => needed(s.lines)),
    ...ALL_ACTS.map((a) => a.module).flatMap((m) => [EXAM_STORY[m.id]!.intro, EXAM_STORY[m.id]!.success].flatMap(needed)),
    ...Object.values(LESSON_STORY).flatMap((x) => needed([...(x.briefing ?? []), ...(x.mastered ?? [])])),
  ]);

  it('jedes Ding hat genau eine existierende Quelle; IDs eindeutig', () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const it of ITEMS) {
      expect(hasEmoji(it.name + it.description), it.id).toBe(false);
      expect(Object.keys(it.source), it.id).toHaveLength(1);
      if ('badge' in it.source) expect(BADGES.map((b) => b.id), it.id).toContain(it.source.badge);
      // genau eine Szene überreicht es: bei Abzeichen die Meldung zum Abzeichen, sonst die Szene der Quelle
      // stillgelegte Meldungen zählen nicht, wenn das Ding inzwischen eine neue Quelle hat (Shorts, Sonnenbrille mit Akt 2)
      const live = scenesGiving(it.id).filter((g) => !g.retired || ('scene' in it.source && g.id === it.source.scene));
      const giver = 'badge' in it.source ? live.filter((g) => g.trigger.on === 'badge' && g.trigger.badgeId === (it.source as { badge: string }).badge) : live;
      if ('badge' in it.source) expect(giver, it.id).toHaveLength(1);
      if ('scene' in it.source) expect(giver.map((g) => g.id), it.id).toEqual([it.source.scene]);
      if ('case' in it.source) expect(EXTRA_CASES.map((c) => c.id), it.id).toContain(it.source.case);
    }
    // jedes `gives` passt zur Quelle des Dings: die Szene selbst oder das Abzeichen, das sie auslöst
    for (const sc of SCENES)
      for (const g of sc.gives ?? []) {
        const src = ITEMS.find((i) => i.id === g)?.source;
        // stillgelegte Szenen sind selbst die Quelle (das Ding ist für später zurückgelegt) – es sei denn, es hat inzwischen eine neue
        // Quelle in einem späteren Akt: dann bleibt die alte Meldung nur, damit wer sie schon hat, das Teil behält
        if (sc.retired && src && !('scene' in src && src.scene === sc.id)) {
          expect(scenesGiving(g).some((x) => !x.retired), `${sc.id}: ${g} hat eine neue Quelle`).toBe(true);
          continue;
        }
        expect(src, `${sc.id}: ${g}`).toEqual(sc.trigger.on === 'badge' && !sc.retired ? { badge: sc.trigger.badgeId } : { scene: sc.id });
      }
  });

  it('Beweisstücke: ihre Szene existiert, zeigt ihr Bild und kommt nicht vor der Szene, die das Gadget überreicht', () => {
    const withPieces = ITEMS.filter((i) => i.pieces);
    expect(withPieces.length).toBeGreaterThan(0);
    for (const it of withPieces) {
      const giver = scenesGiving(it.id)[0]!;
      const ids = it.pieces!.map((e) => e.id);
      expect(new Set(ids).size, it.id).toBe(ids.length);
      for (const e of it.pieces!) {
        const scene = SCENES.find((s) => s.id === e.scene);
        expect(scene, `${it.id}/${e.id}`).toBeDefined();
        // ein Beweisstück, das ein Story-Objekt ist, zeigt die Szene als Objekt (Zeitung, Plakat), alle anderen als Bild
        expect(scene!.lines.some((l) => (e.object ? l.object?.lessonId === e.object : l.picture === e.picture)), `${e.scene} zeigt ${e.object ?? e.picture}`).toBe(true);
        expect(hasEmoji(e.name + e.text), e.id).toBe(false);
        expect(mainRank(scene!), `${e.id} liegt vor ${giver.id}`).toBeGreaterThanOrEqual(mainRank(giver));
      }
    }
  });

  it('je Abzeichen höchstens eine Belohnung (Gadgets und Kleidung zusammen)', () => {
    const badges = ITEMS.flatMap((i) => ('badge' in i.source ? [i.source.badge] : []));
    expect(new Set(badges).size).toBe(badges.length);
  });

  it('jede Belohnung hat ihre Meldungs-Szene; jeder Rang ab dem zweiten auch', () => {
    for (const it of ITEMS) {
      if ('badge' in it.source) {
        const badgeId = it.source.badge;
        expect(SCENES.some((s) => s.trigger.on === 'badge' && s.trigger.badgeId === badgeId), `${it.id} (${badgeId})`).toBe(true);
      }
    }
    for (const r of REWARDS.ranks.slice(1)) expect(SCENES.some((s) => s.trigger.on === 'rank' && s.trigger.rank === r.key), r.key).toBe(true);
    expect(SCENES.some((s) => s.trigger.on === 'rank' && s.trigger.rank === REWARDS.ranks[0]!.key)).toBe(false);
  });

  it('Paket-Szenen nennen das Teil, das sie überreichen', () => {
    for (const s of SCENES.filter((x) => x.trigger.on !== 'caseOpen' && x.lines.some((l) => l.picture === 'paket'))) {
      const name = CLOTH.find((c) => c.id === s.gives?.[0])?.name;
      expect(name, s.id).toBeTruthy();
      expect(s.lines.some((l) => l.text.includes(`Im Paket: ${name}.`)), s.id).toBe(true);
    }
  });

  it('Gadgets aus Extra-Fällen zahlen sich als zusätzliche Antwort aus', () => {
    // die Gadgets, die Fälle verschenken (aus den Fällen abgeleitet)
    for (const c of EXTRA_CASES) if (c.gives) expect(allNeeds, c.gives).toContain(c.gives);
    // jede verlangte Sache existiert
    for (const n of allNeeds) expect(ITEMS.map((i) => i.id), n).toContain(n);
  });

  it('Haupt-Szenen verlangen nur Gadgets, die eine frühere Haupt-Szene gegeben hat – und nur als zusätzliche Antwort', () => {
    // Antworten mit `needs` sind nur Zusatz (siehe „an jeder Auswahl gibt es eine Antwort ohne Gadget“);
    // Story-Gadgets werden von Haupt-Szenen verschenkt
    for (const it of ITEMS.filter((i) => i.kind === 'gadget' && 'scene' in i.source)) {
      const giver = SCENES.find((s) => s.id === ('scene' in it.source ? it.source.scene : ''))!;
      expect(['briefing', 'stage', 'mastered']).toContain(giver.trigger.on);
      // eine Antwort mit diesem Gadget gibt es erst nach der Szene, die es verschenkt
      for (const s of SCENES.filter(isMain)) if (needed(s.lines).includes(it.id)) expect(mainRank(s), `${s.id} verlangt ${it.id}`).toBeGreaterThan(mainRank(giver));
    }
  });
});

describe('Belohnungsplan: Akt 1', () => {
  /** Höchstens so viele freispielbare Dinge (Teile und Farbpakete) kann ein Kind in Akt 1 erreichen; der Rest steht im Plan späterer Akte (docs/design/belohnungen.md) */
  const AKT1_BUDGET = 9;
  /** Etwa so viele EP bringt Akt 1 insgesamt (siehe content/rewards.ts) – bis dahin erreichbare Ränge gehören zu Akt 1 */
  const AKT1_XP = 500;

  it('Dinge mit einer Quelle in Akt 1 (Geschichte, Abzeichen, Ränge) liegen im Budget; stillgelegte zählen nicht', () => {
    const wardrobe = new Set([...SPECIAL_ITEMS, ...COLOR_PACKS].map((i) => i.id));
    const ranksInAct1 = new Set(REWARDS.ranks.filter((r) => r.minXp <= AKT1_XP).map((r) => r.key));
    // Szenen von Akt 1 (jeder Auslöser) und die akt-neutralen Übergaben (Abzeichen, Ränge); spätere Akte zählen nicht mit
    const act1 = [...actScenes(ALL_ACTS[0]!), ...REWARD_SCENES];
    const reachable = (s: (typeof SCENES)[number]) => !s.retired && (s.trigger.on !== 'rank' || ranksInAct1.has(s.trigger.rank));
    const found = [...new Set(act1.filter(reachable).flatMap((s) => s.gives ?? []))].filter((id) => wardrobe.has(id));
    expect(found.length, found.join(', ')).toBeLessThanOrEqual(AKT1_BUDGET);
    // Gegenprobe: die Auswahl aus dem Plan
    expect(found.sort()).toEqual(['colors-fresh', 'colors-neon', 'cardigan', 'cuffed', 'headband', 'nerd', 'polo', 'shades', 'vest'].sort());
  });

  it('zurückgelegte Teile hängen an einer stillgelegten Szene – das Abzeichen bleibt (zurzeit gibt es keine mehr)', () => {
    const parked = SPECIAL_ITEMS.filter((i) => 'scene' in i.source! && SCENES.find((s) => s.id === (i.source as { scene: string }).scene)?.retired);
    expect(parked.map((i) => i.id)).toEqual([]);
  });
});

describe('Belohnungsplan: Akt 2', () => {
  /** Höchstens so viele freispielbare Dinge (Teile) bringt Akt 2 (docs/design/belohnungen.md) */
  const AKT2_BUDGET = 5;

  it('Teile mit einer Quelle in Akt 2 liegen im Budget; jede Quelle ist eine Szene des Akts oder das Abzeichen mit seinem Paket', () => {
    const act = ALL_ACTS[1]!;
    const wardrobe = new Set(SPECIAL_ITEMS.map((i) => i.id));
    const scenes = actScenes(act);
    const found = [...new Set(scenes.flatMap((s) => s.gives ?? []))].filter((id) => wardrobe.has(id));
    expect(found.length, found.join(', ')).toBeLessThanOrEqual(AKT2_BUDGET);
    expect(found.sort()).toEqual(['cap', 'scarf', 'shorts', 'sun']);
    for (const id of found) {
      const src = SPECIAL_ITEMS.find((i) => i.id === id)!.source!;
      const giver = 'scene' in src ? src.scene : scenes.find((s) => s.trigger.on === 'badge' && s.trigger.badgeId === (src as { badge: string }).badge)?.id;
      expect(scenes.map((s) => s.id), id).toContain(giver);
    }
  });

  it('Akt 1 bringt die zurückgelegten Shorts und die Sonnenbrille nicht mehr neu: ihre alten Meldungen sind stillgelegt', () => {
    for (const id of ['badge-erster-auftrag', 'badge-sterne-12']) expect(SCENES.find((s) => s.id === id)!.retired).toEqual({ since: 6 });
  });
});

describe('Belohnungsplan: Akt 3', () => {
  /** Höchstens so viele freispielbare Dinge bringt Akt 3: vier Teile plus das Farbpaket „Herbst“ (docs/design/belohnungen.md) */
  const AKT3_BUDGET = 5;

  it('Dinge mit einer Quelle in Akt 3 liegen im Budget; Leggings und Faltstiefel kommen nicht mehr aus Akt 1', () => {
    const act = ALL_ACTS[2]!;
    const wardrobe = new Set(SPECIAL_ITEMS.map((i) => i.id));
    const scenes = actScenes(act);
    const found = [...new Set(scenes.flatMap((s) => s.gives ?? []))].filter((id) => wardrobe.has(id));
    // plus das Farbpaket „Herbst“ über den Rang Spezialagent (akt-neutral)
    expect(found.length + 1, found.join(', ')).toBeLessThanOrEqual(AKT3_BUDGET);
    expect(found.sort()).toEqual(['boots', 'headscarf', 'leggings', 'minerboots']);
    expect(COLOR_PACKS.find((p) => p.id === 'colors-autumn')!.source).toEqual({ scene: 'rank-spezialagent' });
    for (const id of ['badge-tempo-60', 'badge-sauber-100']) expect(SCENES.find((s) => s.id === id)!.retired, id).toBeTruthy();
  });
});

describe('Belohnungsplan: Akt 4', () => {
  /** Höchstens so viele freispielbare Dinge bringt Akt 4: fünf Teile, kein Farbpaket (docs/design/belohnungen.md) */
  const AKT4_BUDGET = 5;

  it('Dinge mit einer Quelle in Akt 4 liegen im Budget; Melone, Agentenlook und Nadelstreifen kommen nicht mehr aus Akt 1', () => {
    const act = ALL_ACTS[3]!;
    const wardrobe = new Set(SPECIAL_ITEMS.map((i) => i.id));
    const found = [...new Set(actScenes(act).flatMap((s) => s.gives ?? []))].filter((id) => wardrobe.has(id));
    expect(found.length, found.join(', ')).toBeLessThanOrEqual(AKT4_BUDGET);
    expect(found.sort()).toEqual(['agent', 'bowler', 'bowtie', 'necktie', 'striped']);
    const source = (id: string) => SPECIAL_ITEMS.find((i) => i.id === id)!.source;
    expect(source('agent')).toEqual({ badge: 'grossschreibung' });
    expect(source('striped')).toEqual({ scene: 'a4-gift-nadelstreifen' });
    expect(source('bowler')).toEqual({ scene: 'a4-gift-melone' });
    // Krawatte und Fliege sind Zubehör (eins zur Zeit)
    expect(WARDROBE.accessories.map((a) => a.id)).toEqual(expect.arrayContaining(['none', 'scarf', 'necktie', 'bowtie']));
    // die alten Meldungen bleiben stillgelegt, damit wer sie schon hat, das Teil behält
    for (const id of ['badge-serie-7', 'badge-uebungen-25', 'gift-melone']) expect(SCENES.find((s) => s.id === id)!.retired, id).toBeTruthy();
    // jedes Teil steht im LPC-Manifest
    for (const part of ['necktie', 'bowtie', 'bowler', 'pants-striped']) expect(Object.keys((manifest.parts as Record<string, { layers: object }>)[part]!.layers), part).toContain('teen');
  });
});

describe('Belohnungsplan: Akt 5', () => {
  /** Höchstens so viele freispielbare Dinge bringt Akt 5: vier Teile und das Farbpaket „Nacht“ (docs/design/belohnungen.md); das Gadget zählt nicht */
  const AKT5_BUDGET = 5;

  it('Dinge mit einer Quelle in Akt 5 liegen im Budget; Bob und Strubbelig kommen nicht mehr aus Akt 1', () => {
    const act = ALL_ACTS[4]!;
    const wardrobe = new Set([...SPECIAL_ITEMS, ...COLOR_PACKS].map((i) => i.id));
    const found = [...new Set(actScenes(act).flatMap((s) => s.gives ?? []))].filter((id) => wardrobe.has(id));
    expect(found.length, found.join(', ')).toBeLessThanOrEqual(AKT5_BUDGET);
    expect(found.sort()).toEqual(['belt', 'bob', 'colors-night', 'messy', 'suspenders']);
    const source = (id: string) => [...SPECIAL_ITEMS, ...COLOR_PACKS].find((i) => i.id === id)!.source;
    expect(source('belt')).toEqual({ scene: 'a5-gift-guertel' });
    expect(source('suspenders')).toEqual({ scene: 'a5-gift-hosentraeger' });
    expect(source('colors-night')).toEqual({ scene: 'a5-gift-nacht' });
    expect(source('messy')).toEqual({ scene: 'a5-gift-strubbelig' });
    expect(source('bob')).toEqual({ badge: 'satzzeichen' });
    // Gürtel und Hosenträger sind Zubehör (eins zur Zeit)
    expect(WARDROBE.accessories.map((a) => a.id)).toEqual(expect.arrayContaining(['belt', 'suspenders']));
    // die alten Meldungen bleiben stillgelegt, damit wer sie schon hat, das Teil behält
    for (const id of ['badge-null-fehler', 'badge-ehrenkodex']) expect(SCENES.find((s) => s.id === id)!.retired, id).toEqual({ since: 7 });
    // jedes Teil steht im LPC-Manifest (Gürtel und Hosenträger mit Palette „cloth“, färbbar wie die Krawatte)
    const parts = manifest.parts as Record<string, { layers: object; materials: string[] }>;
    for (const part of ['belt', 'suspenders', 'hair-bob', 'hair-messy']) expect(Object.keys(parts[part]!.layers), part).toContain('teen');
    for (const part of ['belt', 'suspenders']) expect(parts[part]!.materials, part).toEqual(['cloth']);
  });
});

describe('Belohnungsplan: Akt 6', () => {
  /** Höchstens so viele freispielbare Dinge bringt Akt 6: vier Teile und die Stachelfrisur über den Rang Geheimagent (docs/design/belohnungen.md); das Gadget zählt nicht */
  const AKT6_BUDGET = 5;

  it('Dinge mit einer Quelle in Akt 6 liegen im Budget; die Sandalen kommen nicht mehr aus Akt 1', () => {
    const act = ALL_ACTS[5]!;
    const wardrobe = new Set([...SPECIAL_ITEMS, ...COLOR_PACKS].map((i) => i.id));
    const found = [...new Set(actScenes(act).flatMap((s) => s.gives ?? []))].filter((id) => wardrobe.has(id));
    // plus die Stachelfrisur über den Rang Geheimagent (akt-neutral)
    expect(found.length + 1, found.join(', ')).toBeLessThanOrEqual(AKT6_BUDGET);
    expect(found.sort()).toEqual(['cuffs', 'epaulets', 'sandals', 'socks']);
    const source = (id: string) => [...SPECIAL_ITEMS, ...COLOR_PACKS].find((i) => i.id === id)!.source;
    expect(source('epaulets')).toEqual({ scene: 'a6-gift-epauletten' });
    expect(source('cuffs')).toEqual({ scene: 'a6-gift-manschetten' });
    expect(source('sandals')).toEqual({ scene: 'a6-gift-sandalen' });
    expect(source('socks')).toEqual({ badge: 'zahlen' });
    expect(source('spiked')).toEqual({ scene: 'rank-geheimagent' });
    // Epauletten, Manschetten und Hohe Socken sind Zubehör (eins zur Zeit)
    expect(WARDROBE.accessories.map((a) => a.id)).toEqual(['none', 'scarf', 'necktie', 'bowtie', 'belt', 'suspenders', 'epaulets', 'cuffs', 'socks', 'cape']); // Umhang kam mit Akt 7
    // die alte Meldung bleibt stillgelegt (mit ihrem alten Zettel), damit wer die Sandalen schon hat, sie behält
    const old = SCENES.find((s) => s.id === 'badge-tempo-100')!;
    expect(old.retired).toEqual({ since: 7 });
    expect(old.gives).toEqual(['sandals']);
    expect(old.lines.at(-1)!.text).toContain('Für die schnellsten Füße. Äh, Finger.');
    // jedes neue Teil steht im LPC-Manifest für `teen` und ist färbbar
    const parts = manifest.parts as Record<string, { layers: object; materials: string[] }>;
    for (const part of ['epaulets', 'cuffs', 'socks-high', 'sandals', 'hair-spiked']) expect(Object.keys(parts[part]!.layers), part).toContain('teen');
    for (const part of ['epaulets', 'cuffs', 'socks-high']) expect(parts[part]!.materials, part).toEqual(['cloth']);
  });
});

describe('Belohnungsplan: Akt 7', () => {
  /** Höchstens so viele freispielbare Dinge bringt Akt 7: vier Teile und das Farbpaket „Gold“ aus Szenen, dazu Locken lang über den Rang Meisterhacker (docs/design/belohnungen.md); das Gadget zählt nicht */
  const AKT7_BUDGET = 6;

  it('Dinge mit einer Quelle in Akt 7 liegen im Budget; die Agentenstiefel kommen nicht mehr aus Akt 1', () => {
    const act = ALL_ACTS[6]!;
    const wardrobe = new Set([...SPECIAL_ITEMS, ...COLOR_PACKS].map((i) => i.id));
    const found = [...new Set(actScenes(act).flatMap((s) => s.gives ?? []))].filter((id) => wardrobe.has(id));
    // plus Locken lang über den Rang Meisterhacker (akt-neutral)
    expect(found.length + 1, found.join(', ')).toBeLessThanOrEqual(AKT7_BUDGET);
    expect(found.sort()).toEqual(['agentboots', 'cape', 'colors-gold', 'eyepatch', 'tricorne']);
    const source = (id: string) => [...SPECIAL_ITEMS, ...COLOR_PACKS].find((i) => i.id === id)!.source;
    expect(source('cape')).toEqual({ scene: 'a7-gift-umhang' });
    expect(source('tricorne')).toEqual({ scene: 'a7-gift-dreispitz' });
    expect(source('agentboots')).toEqual({ scene: 'a7-gift-agentenstiefel' });
    expect(source('eyepatch')).toEqual({ badge: 'sonderzeichen' });
    expect(source('colors-gold')).toEqual({ scene: 'a7-gift-gold' });
    expect(source('curlylong')).toEqual({ scene: 'rank-meisterhacker' });
    // Plätze: Umhang als Zubehör, Dreispitz als Kopfbedeckung, Augenklappe als Brille (eins zur Zeit)
    expect(WARDROBE.accessories.map((a) => a.id)).toContain('cape');
    expect(WARDROBE.headwear.map((a) => a.id)).toContain('tricorne');
    expect(WARDROBE.glasses.map((a) => a.id)).toContain('eyepatch');
    // das Farbpaket mischt Haare, Augen und Kleidung; Namen stehen in der Garderobe
    expect(COLOR_PACKS.find((p) => p.id === 'colors-gold')!.colors).toEqual({ hair: ['gold', 'sandy'], eye: ['yellow'], cloth: ['leather'] });
    expect([COLOR_NAMES.hair.gold, COLOR_NAMES.hair.sandy, COLOR_NAMES.eye.yellow, COLOR_NAMES.cloth.leather]).toEqual(['Gold', 'Sand', 'Bernstein', 'Leder']);
    // die alte Meldung bleibt stillgelegt (mit ihrem alten Zettel), damit wer die Stiefel schon hat, sie behält
    const old = SCENES.find((s) => s.id === 'badge-drei-sterne')!;
    expect(old.retired).toEqual({ since: 7 });
    expect(old.gives).toEqual(['agentboots']);
    expect(old.lines.at(-1)!.text).toContain('Drei Sterne, drei Mal. Das verdient Stiefel.');
    // jedes neue Teil steht im LPC-Manifest für `teen`; der Umhang ist färbbar
    const parts = manifest.parts as Record<string, { layers: object; materials: string[] }>;
    for (const part of ['cape', 'tricorne', 'eyepatch']) expect(Object.keys(parts[part]!.layers), part).toContain('teen');
    expect(parts.cape!.materials).toEqual(['cloth']);
  });
});

describe('Abzeichen und Garderobe', () => {
  it('jede Farbe hat einen deutschen Namen; Teile-IDs je Liste eindeutig; jedes freispielbare Ding hat seinen Zettel', () => {
    for (const [m, list] of [['body', WARDROBE.skinTones], ['hair', WARDROBE.hairColors], ['eye', WARDROBE.eyeColors], ['cloth', WARDROBE.clothColors]] as const)
      for (const c of list) expect(COLOR_NAMES[m][c], `${m}: ${c}`).toBeTruthy();
    // „none“ (keine Brille, keine Kopfbedeckung) gibt es in zwei Listen – sonst ist jede ID einmalig
    const ids = ALL_ITEMS.map((i) => i.id).filter((id) => id !== 'none');
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CLOTH) expect(c.description, c.id).not.toBe('');
  });

  it('Farbpakete: jede Farbe in der LPC-Palette und höchstens in einem Paket; je Stoff-Paket vier Farben im eigenen Abschnitt', () => {
    const palettes = manifest.palettes as Record<string, { variants: Record<string, unknown> }>;
    for (const [m, list] of [['hair', WARDROBE.hairColors], ['eye', WARDROBE.eyeColors], ['cloth', WARDROBE.clothColors]] as const)
      for (const c of list) expect(Object.keys(palettes[m]!.variants), `${m}: ${c}`).toContain(c);
    for (const m of ['hair', 'eye', 'cloth'] as const) {
      const inPacks = COLOR_PACKS.flatMap((p) => p.colors[m] ?? []);
      expect(new Set(inPacks).size, m).toBe(inPacks.length);
    }
    // Abschnitte in der Garderobe: erst die freien Grundfarben, dann jedes Stoff-Paket zusammenhängend in seiner Reihenfolge
    const clothPacks = COLOR_PACKS.filter((p) => p.colors.cloth);
    const packed = clothPacks.flatMap((p) => p.colors.cloth!);
    // „Gold“ bringt nur eine Kleiderfarbe (Leder): die Kleider-Palette hat kein Gold, der Rest des Pakets sind Haare und Augen
    for (const p of clothPacks) expect(p.colors.cloth, p.id).toHaveLength(p.id === 'colors-gold' ? 1 : 4);
    expect(WARDROBE.clothColors.slice(-packed.length)).toEqual(packed);
    expect(WARDROBE.clothColors.slice(0, -packed.length)).toEqual(['white', 'gray', 'black', 'navy', 'blue', 'red', 'green', 'yellow', 'brown']);
  });

  it('Start-Avatar nutzt nur, was von Anfang an frei ist', () => {
    const free = wearable(WARDROBE, new Set());
    for (const g of ['w', 'm'] as const) {
      const a = WARDROBE.defaultAvatar(g);
      for (const id of [a.hairStyle, a.outfit, a.pants, a.shoes, a.glasses, a.head]) expect(free.items.has(id), `${g}: ${id}`).toBe(true);
      expect(free.colors.hair.has(a.hairColor), a.hairColor).toBe(true);
      expect(free.colors.eye.has(a.eyeColor), a.eyeColor).toBe(true);
      for (const c of [a.outfitColor, a.pantsColor, a.shoesColor]) expect(free.colors.cloth.has(c), c).toBe(true);
    }
  });

  it('Abzeichen: eindeutige IDs, Symbole ohne Emoji', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const b of BADGES) expect(hasEmoji(b.icon), `${b.id}: ${b.icon}`).toBe(false);
  });

  it('LPC-Grafiken enthalten alle vier Blickrichtungen (Figur drehen in der Garderobe)', () => {
    expect(manifest.directions).toEqual(['up', 'left', 'down', 'right']);
  });

  it('jedes Teil gibt es als LPC-Grafik; Freischalt-Abzeichen existieren; je Abzeichen höchstens ein Teil', () => {
    for (const item of ALL_ITEMS) for (const part of item.parts) expect(manifest.parts, `${item.id}: ${part}`).toHaveProperty(part);
    for (const item of [...SPECIAL_ITEMS, ...COLOR_PACKS]) {
      const s = item.source!;
      if ('badge' in s) expect(BADGES.map((b) => b.id), item.id).toContain(s.badge);
      // aus der Geschichte: die Szene gibt es, und sie verschenkt genau dieses Teil
      else if ('scene' in s) expect(SCENES.find((x) => x.id === s.scene)?.gives, item.id).toContain(item.id);
      else throw new Error(`${item.id}: Kleidung kommt nur über Abzeichen oder Szenen`);
    }
  });

  it('Spielhalle und Codenamen', () => {
    expect(ARCADE_GAMES.map((g) => g.id)).toEqual(['regen', 'tresor']);
    expect(rollCodename(CODENAMES, createRng(1))).toMatch(/^[\p{L}]+-\d\d$/u);
    expect(new Set(CODENAMES).size).toBe(CODENAMES.length);
  });
});
