// Auswahl für den Avatar – bei der Rekrutierung und in der Garderobe.
// Reiter statt langem Formular: Figur, Haare, Oberteil, Hose, Schuhe, Extras. Teile sind Bildkacheln mit der eigenen Figur.
// Gesperrtes zeigt die Garderobe mit dem Weg dorthin (Ansporn); bei der Rekrutierung ist es ausgeblendet.

import { useState } from 'react';
import { COLOR_NAMES, onlyWhileWornText } from '../../content/texts/wardrobe.ts';
import type { ItemSource } from '../../domain/items.ts';
import { agentTitle, type Avatar, type Gender } from '../../domain/profile.ts';
import { colorPackOf, onlyWhileWorn, type ColorMaterial, type WardrobeCatalog, type WardrobeItem, type Wearable } from '../../domain/wardrobe.ts';
import { useGame } from '../app/game.ts';
import { hasMaterial, swatchColor, type Facing, type Material } from '../lpc/compose.ts';
import { AvatarPic } from './Characters.tsx';
import { LockIcon } from '../pixel/Pixel.tsx';
import { Tabs } from './Tabs.tsx';

/** Welches Feld des Avatars ein Teil belegt bzw. eine Farbe färbt */
type Slot = 'hairStyle' | 'outfit' | 'pants' | 'shoes' | 'glasses' | 'head' | 'accessory';
type ColorField = 'skin' | 'eyeColor' | 'hairColor' | 'outfitColor' | 'pantsColor' | 'shoesColor' | 'headColor' | 'accessoryColor';

/** Eine Reihe in einem Reiter: Ich bin, Kacheln (Teile eines Felds) oder Farbfelder */
type Row =
  | { kind: 'gender' }
  | {
      kind: 'tiles';
      label: string;
      slot: Slot;
      items: (w: WardrobeCatalog) => readonly WardrobeItem[];
      legs?: boolean;
      /** nur zeigen, wenn das zutrifft (z. B. wenn der Katalog solche Teile hat) */
      when?: (a: Avatar, w: WardrobeCatalog) => boolean;
    }
  | {
      kind: 'colors';
      label: string;
      field: ColorField;
      material: Material;
      colors: (w: WardrobeCatalog) => readonly string[];
      /** nur zeigen, wenn das (z. B. das gewählte Teil) zutrifft */
      when?: (a: Avatar, w: WardrobeCatalog) => boolean;
    };

type Tab = 'figur' | 'haare' | 'oberteil' | 'hose' | 'schuhe' | 'extras';

/** Die Reiter und ihr Inhalt – eine Stelle für Aufbau und „Neu“-Punkt */
const TABS: readonly { id: Tab; label: string; rows: readonly Row[] }[] = [
  {
    id: 'figur',
    label: 'Figur',
    rows: [
      { kind: 'gender' },
      { kind: 'colors', label: 'Hautfarbe', field: 'skin', material: 'body', colors: (w) => w.skinTones },
      { kind: 'colors', label: 'Augenfarbe', field: 'eyeColor', material: 'eye', colors: (w) => w.eyeColors },
    ],
  },
  {
    id: 'haare',
    label: 'Haare',
    rows: [
      { kind: 'tiles', label: 'Frisur', slot: 'hairStyle', items: (w) => w.hairStyles },
      { kind: 'colors', label: 'Haarfarbe', field: 'hairColor', material: 'hair', colors: (w) => w.hairColors },
    ],
  },
  {
    id: 'oberteil',
    label: 'Oberteil',
    rows: [
      { kind: 'tiles', label: 'Oberteil', slot: 'outfit', items: (w) => w.outfits },
      { kind: 'colors', label: 'Farbe des Oberteils', field: 'outfitColor', material: 'cloth', colors: (w) => w.clothColors },
    ],
  },
  {
    id: 'hose',
    label: 'Hose',
    rows: [
      { kind: 'tiles', label: 'Hose', slot: 'pants', items: (w) => w.pants, legs: true },
      { kind: 'colors', label: 'Farbe der Hose', field: 'pantsColor', material: 'cloth', colors: (w) => w.clothColors },
    ],
  },
  {
    id: 'schuhe',
    label: 'Schuhe',
    rows: [
      { kind: 'tiles', label: 'Schuhe', slot: 'shoes', items: (w) => w.shoes, legs: true },
      { kind: 'colors', label: 'Farbe der Schuhe', field: 'shoesColor', material: 'cloth', colors: (w) => w.clothColors },
    ],
  },
  {
    id: 'extras',
    label: 'Extras',
    rows: [
      { kind: 'tiles', label: 'Brille', slot: 'glasses', items: (w) => w.glasses },
      { kind: 'tiles', label: 'Kopfbedeckung', slot: 'head', items: (w) => w.headwear },
      {
        kind: 'colors',
        label: 'Farbe der Kopfbedeckung',
        field: 'headColor',
        material: 'cloth',
        colors: (w) => w.clothColors,
        when: (a, w) => (w.headwear.find((h) => h.id === a.head)?.parts ?? []).some((p) => hasMaterial(p, 'cloth')),
      },
      // erst zeigen, wenn es ein Teil außer „Ohne“ gibt; sonst sähen Kinder einen leeren Platz
      { kind: 'tiles', label: 'Zubehör', slot: 'accessory', items: (w) => w.accessories, when: (_a, w) => w.accessories.length > 1 },
      {
        kind: 'colors',
        label: 'Farbe des Zubehörs',
        field: 'accessoryColor',
        material: 'cloth',
        colors: (w) => w.clothColors,
        when: (a, w) => (w.accessories.find((x) => x.id === a.accessory)?.parts ?? []).some((p) => hasMaterial(p, 'cloth')),
      },
    ],
  },
];

interface Props {
  avatar: Avatar;
  onChange: (a: Avatar) => void;
  /** was das Kind wählen darf (`wearable`) */
  allowed: Wearable;
  /** Besitz – nur in der Garderobe: dann ist Gesperrtes sichtbar, und getragene, eigentlich gesperrte Dinge bekommen eine Warnung */
  owned?: ReadonlySet<string>;
  /** frisch freigespielte Dinge (Markierung „Neu“) */
  fresh?: ReadonlySet<string>;
  /** Woher ein gesperrtes Ding kommt (`sourceHintsFor`, nur in der Garderobe) */
  hintFor?: (source: ItemSource, itemId: string) => string;
  /** Blickrichtung der Figur daneben; alle Kacheln drehen mit */
  facing?: Facing;
}

/** Was die Reihen eines Reiters zum Zeichnen brauchen */
interface Ctx extends Required<Omit<Props, 'owned' | 'onChange' | 'avatar'>> {
  w: WardrobeCatalog;
  owned?: ReadonlySet<string>;
  set: (a: Partial<Avatar>) => void;
  avatar: Avatar;
}

const NOTHING: ReadonlySet<string> = new Set();
const NO_HINT = () => '';

/** Zugänglicher Name einer Kachel oder eines Farbfelds: gesperrt mit Weg dorthin, sonst Name, „neu“ und Warnung */
function accessibleName(name: string, s: { open: boolean; fresh: boolean; warn: string; hint: string }): string {
  if (!s.open) return `${name}, gesperrt: ${s.hint}`;
  return name + (s.fresh ? ', neu' : '') + (s.warn ? ` – ${s.warn}` : '');
}

/** Kacheln: die eigene Figur mit genau diesem Teil */
function ItemTiles({ row, ctx }: { row: Extract<Row, { kind: 'tiles' }>; ctx: Ctx }) {
  const { w, allowed, owned, fresh, hintFor, avatar, set, facing } = ctx;
  return (
    <div className="field">
      <span className="field-label">{row.label}</span>
      <div className="tiles-pick">
        {row
          .items(w)
          .filter((it) => owned || allowed.items.has(it.id))
          .map((it) => {
            const open = allowed.items.has(it.id);
            const hint = it.source ? hintFor(it.source, it.id) : '';
            const warn = open && owned && onlyWhileWorn(w, owned, 'item', it.id) ? onlyWhileWornText(hint) : '';
            const chosen = avatar[row.slot] === it.id;
            return (
              <button
                key={it.id}
                className={`tile-pick ${chosen ? 'sel' : ''} ${open ? '' : 'locked'} ${warn ? 'warn' : ''}`}
                aria-pressed={chosen}
                aria-label={accessibleName(it.name, { open, fresh: fresh.has(it.id), warn, hint })}
                title={(open ? warn : hint) || it.name}
                disabled={!open}
                onClick={() => set({ [row.slot]: it.id })}
              >
                <span className="tile-pic" aria-hidden="true">
                  <AvatarPic avatar={{ ...avatar, [row.slot]: it.id }} size={64} legs={row.legs} facing={facing} still />
                </span>
                <span className="tile-name">
                  {!open && <LockIcon />} {it.name}
                </span>
                {fresh.has(it.id) && <span className="new-pill">Neu</span>}
                {warn && (
                  <span className="tile-warn" aria-hidden="true">
                    !
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}

/** Farbfelder; gesperrte (aus einem fehlenden Farbpaket) mit Schloss und Hinweis */
function ColorSwatches({ row, ctx }: { row: Extract<Row, { kind: 'colors' }>; ctx: Ctx }) {
  const { w, allowed, owned, fresh, hintFor, avatar, set } = ctx;
  // Hautfarben sind immer frei; alle anderen Farben können in einem Farbpaket stecken
  const m: ColorMaterial | null = row.material === 'body' ? null : row.material;
  return (
    <div className="field">
      <span className="field-label">{row.label}</span>
      <div className="swatches">
        {row
          .colors(w)
          .filter((c) => !m || owned || allowed.colors[m].has(c))
          .map((c) => {
            const open = !m || allowed.colors[m].has(c);
            const pack = m ? colorPackOf(w, m, c) : undefined;
            const name = COLOR_NAMES[row.material][c] ?? c;
            const packHint = pack ? hintFor(pack.source, pack.id) : '';
            const warn = open && m && owned && pack && onlyWhileWorn(w, owned, m, c) ? onlyWhileWornText(packHint) : '';
            const hint = pack ? `${pack.name}: ${packHint}` : '';
            return (
              <button
                key={c}
                className={`swatch ${c === avatar[row.field] ? 'sel' : ''} ${open ? '' : 'locked-swatch'} ${warn ? 'warn' : ''}`}
                style={{ background: swatchColor(row.material, c) }}
                onClick={() => set({ [row.field]: c })}
                disabled={!open}
                aria-pressed={c === avatar[row.field]}
                aria-label={accessibleName(name, { open, fresh: !!pack && fresh.has(pack.id), warn, hint })}
                title={open ? (warn ? `${name} – ${warn}` : name) : `${name} – ${hint}`}
              >
                {!open && <LockIcon />}
              </button>
            );
          })}
      </div>
    </div>
  );
}

function GenderRow({ ctx }: { ctx: Ctx }) {
  return (
    <div className="field">
      <span className="field-label">Ich bin</span>
      <div className="row">
        {(['w', 'm'] as Gender[]).map((g) => (
          <button key={g} className={ctx.avatar.gender === g ? 'sel' : ''} aria-pressed={ctx.avatar.gender === g} onClick={() => ctx.set({ gender: g })}>
            {agentTitle(g)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Steckt in einer Reihe etwas Neues? (Teil oder Farbpaket für dieses Material) */
function rowIsFresh(row: Row, w: WardrobeCatalog, fresh: ReadonlySet<string>): boolean {
  if (row.kind === 'tiles') return row.items(w).some((i) => fresh.has(i.id));
  if (row.kind === 'colors' && row.material !== 'body') {
    const m = row.material;
    return w.colorPacks.some((p) => p.colors[m] && fresh.has(p.id));
  }
  return false;
}

export function AvatarEditor({ avatar, onChange, allowed, owned, fresh = NOTHING, hintFor = NO_HINT, facing = 'down' }: Props) {
  const w = useGame((s) => s.wardrobe);
  const [tab, setTab] = useState<Tab>('figur');
  const ctx: Ctx = { w, allowed, owned, fresh, hintFor, facing, avatar, set: (a) => onChange({ ...avatar, ...a }) };
  // nur sichtbare Reihen zählen – auch für den Punkt „neu“ am Reiter
  const shown = (r: Row) => r.kind === 'gender' || !r.when || r.when(avatar, w);
  const tabs = TABS.map((t) => ({ id: t.id, label: t.label, mark: t.rows.some((r) => shown(r) && rowIsFresh(r, w, fresh)) }));
  const rows = TABS.find((t) => t.id === tab)!.rows.filter(shown);

  return (
    <div className="avatar-editor">
      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Aussehen">
        <div className="editor-panel">
          {rows.map((row, i) =>
            row.kind === 'gender' ? <GenderRow key={i} ctx={ctx} /> : row.kind === 'tiles' ? <ItemTiles key={i} row={row} ctx={ctx} /> : <ColorSwatches key={i} row={row} ctx={ctx} />,
          )}
        </div>
      </Tabs>
    </div>
  );
}
