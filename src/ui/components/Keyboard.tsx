// Bildschirmtastatur: Fingerfarben, gelernte Tasten leuchten, ungelernte sind "gelöscht",
// die nächste Taste pulsiert, Anschläge werden animiert.

import { useEffect, useState } from 'react';
import { KEYS, SHIFT_LEFT, SHIFT_RIGHT, isShiftKey, keystrokeFor, learnKey, learnKeys, type Finger, type PhysicalKey } from '../../domain/keyboard.ts';
import type { Seal } from '../../domain/mastery.ts';
import type { KeyPress } from '../../domain/typing.ts';
import { heatColor } from './heat.ts';

const FINGER_COLORS: Record<Finger, string> = {
  lPinky: 'var(--f-pinky)',
  lRing: 'var(--f-ring)',
  lMiddle: 'var(--f-middle)',
  lIndex: 'var(--f-index)',
  thumb: 'var(--f-thumb)',
  rIndex: 'var(--f-index)',
  rMiddle: 'var(--f-middle)',
  rRing: 'var(--f-ring)',
  rPinky: 'var(--f-pinky)',
};

interface Deco {
  code: string;
  label: string;
  w: number;
}

type Cell = PhysicalKey | Deco;
const isKey = (c: Cell): c is PhysicalKey => 'finger' in c;

const byCode = new Map(KEYS.map((k) => [k.code, k]));
const key = (code: string) => byCode.get(code) as PhysicalKey;
const rowKeys = (row: number) => KEYS.filter((k) => k.row === row);

const ROWS: { cells: Cell[] }[] = [
  { cells: [...rowKeys(0), { code: 'Backspace', label: '⟵', w: 2 }] },
  { cells: [{ code: 'Tab', label: 'Tab', w: 1.5 }, ...rowKeys(1), { code: 'Enter', label: '⏎', w: 1.5 }] },
  { cells: [{ code: 'CapsLock', label: '⇪', w: 1.75 }, ...rowKeys(2), { code: 'Enter2', label: '', w: 1.25 }] },
  { cells: [{ code: 'ShiftLeft', label: '⇧', w: 1.25 }, ...rowKeys(3), { code: 'ShiftRight', label: '⇧', w: 2.75 }] },
  {
    cells: [
      { code: 'ControlLeft', label: 'Strg', w: 1.5 },
      { code: 'MetaLeft', label: '', w: 1.25 },
      { code: 'AltLeft', label: 'Alt', w: 1.25 },
      key('Space'),
      { code: 'AltRight', label: 'Alt Gr', w: 1.25 },
      { code: 'MetaRight', label: '', w: 1.25 },
      { code: 'ControlRight', label: 'Strg', w: 1.5 },
    ],
  },
];

/** Die Umschalttasten sind keine Kurstasten, sondern Lerneinheiten: Sie leuchten, sobald ein Großbuchstabe ihrer Hand gelernt ist */
const SHIFT_CELLS: Readonly<Record<string, string>> = { ShiftLeft: SHIFT_LEFT, ShiftRight: SHIFT_RIGHT };

const widthOf = (c: Cell) => (isKey(c) ? (c.code === 'Space' ? 6.25 : 1) : c.w);


interface Props {
  /** Bereits gelernte Zeichen; fehlt es, gelten alle als gelernt */
  learned?: ReadonlySet<string>;
  /** Nächstes erwartetes Zeichen */
  target?: string;
  /** Letzter Anschlag (für Treffer-/Fehler-Animation) */
  press?: KeyPress | null;
  /** Wärmekarte statt Fingerfarben (Akte): Taste → 0..1, null = misst noch, fehlt = nicht gelernt */
  heat?: Readonly<Record<string, number | null>>;
  small?: boolean;
  /** Siegel neuer Tasten (Lerneinheit → Siegel; die Umschalttasten heißen `shift-left` / `shift-right`): dünner Ring aus drei Teilen, gesichert mit ✓ */
  rings?: Readonly<Record<string, Seal>>;
  /** Zusätzlich hervorgehobene Tasten (KeyboardEvent.code), z. B. zum Erklären von Enter */
  highlightCodes?: readonly string[];
}

export function Keyboard({ learned, target, press, heat, small, rings, highlightCodes = [] }: Props) {
  const [down, setDown] = useState<ReadonlySet<string>>(new Set());

  // Gedrückte Tasten (echte Tastatur) sinken ein – auch auf der Wärmekarte, dort leuchten sie zusätzlich auf
  useEffect(() => {
    const on = (e: KeyboardEvent) => setDown((s) => new Set(s).add(e.code));
    const off = (e: KeyboardEvent) =>
      setDown((s) => {
        const n = new Set(s);
        n.delete(e.code);
        return n;
      });
    const clear = () => setDown(new Set());
    window.addEventListener('keydown', on);
    window.addEventListener('keyup', off);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', on);
      window.removeEventListener('keyup', off);
      window.removeEventListener('blur', clear);
    };
  }, []);

  const learnedUnits = learned && new Set(learnKeys([...learned]));
  const stroke = target !== undefined ? keystrokeFor(target) : undefined;
  const pressCode = press ? keystrokeFor(press.ch)?.key.code : undefined;
  const highlight = new Set<string>();
  if (stroke) {
    highlight.add(stroke.key.code);
    if (stroke.shift) highlight.add(stroke.shift === 'left' ? 'ShiftLeft' : 'ShiftRight');
    if (stroke.altGr) highlight.add('AltRight');
  }
  for (const code of highlightCodes) {
    highlight.add(code);
    if (code === 'Enter') highlight.add('Enter2'); // Enter ist zweizeilig
  }

  return (
    <div className={`keyboard ${small ? 'small' : ''} ${heat ? 'heatmap' : ''}`} aria-hidden="true">
      {ROWS.map((row, ri) => (
        <div className="kb-row" key={ri}>
          {row.cells.map((c) => {
            const w = widthOf(c);
            const cls = ['kb-key'];
            const style: React.CSSProperties & Record<string, string | number> = { flexGrow: w, flexBasis: 0 };
            let label: React.ReactNode;
            let check = false;
            if (isKey(c)) {
              // Eine Taste leuchtet auch, wenn nur ihr Umschaltzeichen (`!` auf der 1) oder ihr Alt-Gr-Zeichen (`@` auf dem Q) gelernt ist; Großbuchstaben zählen für die Umschalttaste
              const altGrLearned = c.altGr !== undefined && !!learned?.has(c.altGr);
              const isLearned = !learned || c.code === 'Space' || learned.has(c.base) || (c.shift !== undefined && !/^[A-ZÄÖÜ]$/.test(c.shift) && learned.has(c.shift)) || altGrLearned;
              if (heat) {
                // Zeichen mit Umschalttaste oder Alt Gr hängen an ihrer Taste: Farbe des Grundzeichens, sonst des Umschaltzeichens (`!` auf der 1), sonst des Alt-Gr-Zeichens
                const heatKey = [c.base, c.shift, c.altGr].find((k) => k !== undefined && k in heat);
                const v = heatKey !== undefined ? heat[heatKey] : undefined;
                if (v === undefined || c.code === 'Space') cls.push('off');
                else if (v === null) cls.push('measuring');
                else {
                  cls.push('heat');
                  style.background = heatColor(v);
                }
              } else {
                style['--finger'] = FINGER_COLORS[c.finger];
                cls.push(isLearned ? 'learned' : 'off');
              }
              if (c.bump) cls.push('bump');
              // Siegel der Taste: das ihres Grundzeichens, das ihres Umschaltzeichens, wenn das keine Umschalttaste ist (deren Ring sitzt auf
              // der Umschalttaste), und das ihres Alt-Gr-Zeichens. Eine Taste trägt einen Ring: das erste offene Siegel, sonst das des Grundzeichens,
              // sonst das des Umschaltzeichens, sonst das des Alt-Gr-Zeichens.
              // Ä Ö Ü haben ein gemeinsames Siegel (Lerneinheit „Große Umlaute“), sein Ring liegt auf allen drei Tasten.
              const shiftUnit = c.shift ? learnKey(c.shift) : undefined;
              const baseSeal = rings?.[c.base];
              const shiftSeal = shiftUnit && !isShiftKey(shiftUnit) ? rings?.[shiftUnit] : undefined;
              const altSeal = c.altGr ? rings?.[c.altGr] : undefined;
              const seal = [baseSeal, shiftSeal, altSeal].find((x) => x && !x.secured) ?? baseSeal ?? shiftSeal ?? altSeal;
              if (seal) {
                cls.push('ringed');
                if (seal.training.open) cls.push('ring-1');
                if (seal.precision.open) cls.push('ring-2');
                if (seal.tempo.open) cls.push('ring-3');
                if (seal.secured) check = true;
              }
              const letter = /^[a-zäöü]$/.test(c.base);
              // das Alt-Gr-Zeichen steht klein unten rechts, sobald es gelernt ist
              const altGrMark = altGrLearned && <span className="kb-altgr">{c.altGr}</span>;
              label = letter ? (
                <>
                  {c.base.toUpperCase()}
                  {altGrMark}
                </>
              ) : (
                <>
                  {c.shift && <span className="kb-shift">{c.shift}</span>}
                  <span>{c.base === ' ' ? '' : c.base}</span>
                  {altGrMark}
                </>
              );
            } else {
              cls.push('deco');
              label = c.label;
              const unit = SHIFT_CELLS[c.code];
              if (unit) {
                if (learnedUnits?.has(unit)) cls.push('learned');
                const seal = rings?.[unit];
                if (seal) {
                  cls.push('ringed');
                  if (seal.training.open) cls.push('ring-1');
                  if (seal.precision.open) cls.push('ring-2');
                  if (seal.tempo.open) cls.push('ring-3');
                  if (seal.secured) check = true;
                }
              }
            }
            if (highlight.has(c.code)) cls.push('target');
            if (down.has(c.code)) cls.push('down');
            const pressHere = press && pressCode === c.code;
            return (
              <div
                key={pressHere ? `${c.code}-${press.n}` : c.code}
                className={`${cls.join(' ')} ${pressHere ? (press.ok ? 'hit' : 'miss') : ''}`}
                style={style}
              >
                {label}
                {check && <span className="kb-check">✓</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
