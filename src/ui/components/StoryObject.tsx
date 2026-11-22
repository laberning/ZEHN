// Ein Story-Objekt bei einem bestimmten Fortschritt: klein für die Mission, groß für Nachbesprechung und Chat.

import type { ReactNode } from 'react';
import { fill } from '../../domain/dialog.ts';
import { percentDown } from '../../domain/format.ts';
import { INK_BLOT, NODE_COUNT, stageAt, type IdCardPart, type StoryObject as StoryObjectData } from '../../domain/storyObject.ts';
import { rankTitle } from '../../app/views/common.ts';
import { useGame } from '../app/game.ts';
import { AvatarPic } from './Characters.tsx';
import { Grid, Rects } from '../pixel/Pixel.tsx';
import { disc, rect, stairs, type Px } from '../pixel/pixelMap.ts';
import { OUTLINE } from '../pixel/palette.ts';
import { OrtrudFoto } from '../pictures/akt3.tsx';
import { Brezel, InkMarkPic, StoryPicture } from '../pictures/StoryPicture.tsx';

interface Props {
  object: StoryObjectData;
  /** Fortschritt 0..1 */
  percent: number;
  vars?: Record<string, string | number>;
  big?: boolean;
  /** Überschrift mit Prozentwert ausblenden (im Chat steht der Titel schon im Text) */
  bare?: boolean;
}

/** Lage der NODE_COUNT Knoten (4 × 3) */
const NODE_POS: [number, number][] = [
  [10, 10], [40, 6], [70, 12], [100, 8],
  [14, 36], [44, 32], [72, 38], [102, 34],
  [8, 60], [38, 58], [68, 62], [98, 60],
];
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [8, 9], [9, 10], [10, 11],
  [0, 4], [4, 8], [1, 5], [5, 9], [2, 6], [6, 10], [3, 7], [7, 11],
];

/** Buchstaben unter Tintenklecksen (INK_BLOT) als Kleckse zeichnen */
function inked(text: string): ReactNode {
  if (!text.includes(INK_BLOT)) return text;
  return [...text].map((ch, i) => (ch === INK_BLOT ? <span key={i} className="ink-blot" aria-hidden="true" /> : ch));
}

/** Mehl im Gesicht: Flecken auf Stirn, Nase und Wange (Raster des Porträts, 32×32) */
const FLOUR: Px[] = [rect(13, 7, 4, 1, '#f4efe2'), rect(14, 6, 2, 1, '#f4efe2'), rect(16, 13, 2, 1, '#f4efe2'), rect(10, 14, 3, 2, '#f4efe2'), rect(11, 16, 1, 1, '#f4efe2'), rect(20, 15, 2, 1, '#f4efe2')];

/** Der Agentenausweis, so weit Krümels Drucker ihn schon gedruckt hat */
function IdCard({ parts, vars, big }: { parts: readonly IdCardPart[]; vars: Record<string, string | number>; big?: boolean }) {
  const current = useGame((s) => s.current);
  const rules = useGame((s) => s.rules);
  const avatar = current?.avatar;
  const has = (p: IdCardPart) => parts.includes(p);
  const photo = big ? 72 : 48;
  return (
    <div className="id-card so-idcard">
      <div className="id-head">{has('kopf') ? 'ZEHN · Agentenausweis' : 'Drucker wärmt sich auf …'}</div>
      <div className="so-idcard-body">
        <div className="so-idcard-photo" style={{ width: photo, height: photo }}>
          {has('foto') && avatar ? (
            <>
              <AvatarPic avatar={avatar} size={photo} still />
              <svg viewBox="0 0 32 32" className="so-flour" aria-hidden="true" shapeRendering="crispEdges">
                <Rects px={FLOUR} />
              </svg>
            </>
          ) : (
            <span className="so-printing" role="img" aria-label="Foto wird gedruckt" />
          )}
        </div>
        <div className="so-idcard-info">
          {has('name') && <b>{fill('{agent} {codename}', vars)}</b>}
          {has('name') && current && <small>Rang: {rankTitle(current, rules)}</small>}
          {has('stempel') && (
            <span className="so-stamp">
              <Brezel ink="stamp" size={big ? 39 : 26} />
              ECHT
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Code-Streifen (41×3): Striche in wechselnder Breite; erst mit dem Stempel „Code bereit“ ganz geschrieben (grün), vorher nur die erste Hälfte (grau) */
const CODE_BARS = [1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 2];
function codeStrip(ready: boolean): Px[] {
  let x = 0;
  const px: Px[] = [];
  CODE_BARS.forEach((w, i) => {
    if (ready || i < CODE_BARS.length / 2) px.push(rect(x, 0, w, 3, ready ? '#4dff9a' : '#5a6a98'));
    x += w + 1;
  });
  return px;
}

/** Ortruds Schlüsselkarte, so weit sie schon wieder beschrieben ist (Foto, „O.“-Logo, Name, Code-Streifen, Stempel); das Logo ist vorher nur blass zu sehen */
function KeyCard({ parts, big }: { parts: readonly IdCardPart[]; big?: boolean }) {
  const has = (p: IdCardPart) => parts.includes(p);
  // Ortruds Porträt ist 16×16: ganzzahlig vergrößert (3× bzw. 4×), damit jedes Rasterfeld gleich groß ist
  const photo = big ? 64 : 48;
  return (
    <div className="id-card so-idcard so-keycard">
      <div className="id-head">
        Schlüsselkarte <span className={has('logo') ? 'so-logo' : 'so-logo so-faint'}>O.</span>
      </div>
      <div className="so-idcard-body">
        <div className="so-idcard-photo" style={{ width: photo, height: photo }}>
          {has('foto') ? <OrtrudFoto size={photo} /> : <span className="so-printing" role="img" aria-label="Foto fehlt" />}
        </div>
        <div className="so-idcard-info">
          {parts.length === 0 && <small>Karte leer. Code gelöscht.</small>}
          {has('name') && <b>ORTRUD P.</b>}
          {has('code') && (
            <>
              <small>ZUTRITT: S.</small>
              <Grid px={codeStrip(has('stempel'))} w={41} h={3} size={big ? 123 : 82} title={has('stempel') ? 'Code-Streifen komplett' : 'Code-Streifen halb geschrieben'} />
            </>
          )}
          {has('stempel') && <span className="so-stamp so-ok">CODE BEREIT</span>}
        </div>
      </div>
    </div>
  );
}

/** Das Grundnetz: Knoten als Pixelscheiben mit Kontur, leuchtende Knoten und ihre Verbindungen in Cyan */
function NodeNet({ lit, size }: { lit: number; size: number }) {
  const on = (i: number) => i < lit;
  const px: Px[] = [
    ...LINKS.flatMap(([a, b]) => stairs(NODE_POS[a]!, NODE_POS[b]!, on(a) && on(b) ? '#2ee6ff' : '#2a3760')),
    ...NODE_POS.flatMap(([x, y], i) => [...disc(x, y, 5, OUTLINE), ...disc(x, y, 4, on(i) ? '#2ee6ff' : '#1b2440'), ...(on(i) ? [rect(x - 2, y - 2, 2, 1, '#c9f8ff')] : [])]),
  ];
  return <Grid px={px} w={110} h={70} size={size} title={`${lit} von ${NODE_COUNT} Knoten leuchten`} className="node-net" />;
}

export function StoryObject({ object, percent, vars = {}, big, bare }: Props) {
  const stage = stageAt(object, percent);
  return (
    <figure className={`story-object ${big ? 'big' : ''} kind-${object.kind} ${object.look ?? ''}`}>
      {!bare && (
        <figcaption>
          <b>{object.title}</b> <span className="so-percent">{percentDown(percent)}</span>
        </figcaption>
      )}
      {object.kind === 'text' && <p className="so-text">{fill(stage.text ?? '', vars)}</p>}
      {object.kind === 'lines' && (
        <div className="so-lines">
          {stage.watermark && <Brezel ink="watermark" size={big ? 104 : 65} className="so-watermark" />}
          {stage.marks?.map((m) => (
            <InkMarkPic key={m} mark={m} />
          ))}
          {(stage.lines ?? []).map((l, i, all) => (
            <p key={i} className={i >= all.length - (stage.finePrint ?? 0) ? 'so-fine' : undefined}>
              {inked(fill(l, vars))}
            </p>
          ))}
        </div>
      )}
      {object.kind === 'idcard' && (object.look === 'schluesselkarte' ? <KeyCard parts={stage.card ?? []} big={big} /> : <IdCard parts={stage.card ?? []} vars={vars} big={big} />)}
      {object.kind === 'nodes' && <NodeNet lit={stage.lit ?? 0} size={big ? 220 : 130} />}
      {object.kind === 'picture' && stage.picture && <StoryPicture id={stage.picture} />}
    </figure>
  );
}
