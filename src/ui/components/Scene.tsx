// Pixel-Hintergründe (320×180), die den ganzen Bildschirm füllen.
// Jede Szene hat ihren Boden ab y = 150; die Figuren im Bilderbuch stehen auf FEET_Y (stage.ts).

import { memo, type CSSProperties } from 'react';
import type { SceneName } from '../../domain/dialog.ts';
import { Rects } from '../pixel/Pixel.tsx';
import { disc } from '../pixel/pixelMap.ts';
import { Mehlsack, Prop } from '../pixel/sceneProps.tsx';
import { Tile } from '../pixel/Tile.tsx';

/** Umriss in den nächtlichen Szenen (Keller, Schreibtisch) */
const O = '#0a0e1b';

const BRICKS = (
  <pattern id="bricks" width="32" height="16" patternUnits="userSpaceOnUse">
    <rect width="32" height="16" fill="#121829" />
    <rect x="0" y="0" width="15" height="7" fill="#1e2640" />
    <rect x="16" y="0" width="15" height="7" fill="#1a2139" />
    <rect x="0" y="8" width="7" height="7" fill="#1a2139" />
    <rect x="8" y="8" width="15" height="7" fill="#202945" />
    <rect x="24" y="8" width="8" height="7" fill="#1c233c" />
  </pattern>
);

/** Dunklere Ziegel für den Schreibtisch (statt eines halbtransparenten Schleiers darüber) */
const BRICKS_DARK = (
  <pattern id="bricksDark" width="32" height="16" patternUnits="userSpaceOnUse">
    <rect width="32" height="16" fill="#0c101c" />
    <rect x="0" y="0" width="15" height="7" fill="#131a2d" />
    <rect x="16" y="0" width="15" height="7" fill="#11172a" />
    <rect x="0" y="8" width="7" height="7" fill="#11172a" />
    <rect x="8" y="8" width="15" height="7" fill="#151c32" />
    <rect x="24" y="8" width="8" height="7" fill="#121829" />
  </pattern>
);

/**
 * Server-Lampe: meist ruhig an; zwei von drei flackern oder dunkeln ab und zu dezent ab, alle 8 bis 20 Sekunden.
 * Takt und Versatz hängen fest an der Position (n) – jede Lampe anders, aber ohne Zufall.
 */
function ServerLed({ x, y, fill, n }: { x: number; y: number; fill: string; n: number }) {
  const style = { '--led-t': `${8 + ((n * 7) % 11) * 1.2}s`, '--led-d': `${-((n * 13) % 17) * 0.7}s` } as CSSProperties;
  const kind = ['flicker', 'blink', ''][(n * 5) % 3];
  return <rect x={x} y={y} width={2} height={2} fill={fill} className={`server-led ${kind}`} style={style} />;
}

function Rack({ x }: { x: number }) {
  const units = Array.from({ length: 9 }, (_, i) => i);
  return (
    <g>
      <rect x={x} y={44} width={44} height={106} fill="#070a14" />
      <rect x={x + 1} y={45} width={42} height={104} fill="#151c31" />
      <rect x={x + 1} y={45} width={42} height={1} fill="#26304f" />
      <rect x={x + 1} y={45} width={1} height={104} fill="#26304f" />
      <rect x={x + 42} y={46} width={1} height={103} fill="#0e1424" />
      {units.map((i) => (
        <g key={i}>
          <rect x={x + 4} y={49 + i * 11} width={36} height={8} fill="#070a14" />
          <rect x={x + 5} y={50 + i * 11} width={34} height={6} fill="#0d1324" />
          <rect x={x + 5} y={50 + i * 11} width={34} height={1} fill="#1a2240" />
          <rect x={x + 6} y={52 + i * 11} width={14} height={2} fill="#26304f" />
          <ServerLed x={x + 30} y={51 + i * 11} fill={i % 3 ? '#4dff9a' : '#2ee6ff'} n={x + i * 2} />
          <ServerLed x={x + 34} y={51 + i * 11} fill={i % 4 ? '#ffd84d' : '#ff4d6d'} n={x + i * 2 + 1} />
        </g>
      ))}
    </g>
  );
}

/** Kabel als Treppe aus kleinen Rechtecken (kein Bogen): hängt zwischen x1 und x2 bis zu `sag` durch */
function Cable({ x1, x2, y, sag }: { x1: number; x2: number; y: number; sag: number }) {
  return (
    <>
      {Array.from({ length: x2 - x1 }, (_, i) => {
        const t = i / (x2 - x1 - 1);
        return <rect key={i} x={x1 + i} y={y + Math.round(sag * 4 * t * (1 - t))} width={1} height={2} fill="#070a14" />;
      })}
    </>
  );
}

function Keller() {
  return (
    <>
      <rect width="320" height="150" fill="url(#bricks)" />
      {/* Rohre unter der Decke: Umriss, hell oben, Grundton, Schatten unten */}
      <rect y="4" width="320" height="9" fill={O} />
      <rect y="5" width="320" height="1" fill="#56627f" />
      <rect y="6" width="320" height="4" fill="#39435f" />
      <rect y="10" width="320" height="2" fill="#262e46" />
      {[30, 110, 210, 290].map((x) => (
        <g key={x}>
          <rect x={x - 1} y="3" width="6" height="11" fill={O} />
          <rect x={x} y="4" width="4" height="9" fill="#262e46" />
          <rect x={x} y="4" width="1" height="9" fill="#39435f" />
        </g>
      ))}
      <rect x="299" y="13" width="7" height="137" fill={O} />
      <rect x="300" y="13" width="1" height="137" fill="#56627f" />
      <rect x="301" y="13" width="3" height="137" fill="#39435f" />
      <rect x="304" y="13" width="1" height="137" fill="#262e46" />
      {/* Kabel */}
      <Cable x1={60} x2={90} y={13} sag={18} />
      <Cable x1={180} x2={222} y={13} sag={24} />
      {/* Leuchtschild */}
      <rect x="127" y="19" width="66" height="22" fill={O} />
      <rect x="128" y="20" width="64" height="20" fill="#070a14" />
      <rect x="128" y="20" width="64" height="1" fill="#1c2848" />
      <rect x="128" y="20" width="1" height="20" fill="#1c2848" />
      <rect x="191" y="21" width="1" height="19" fill="#0c1428" />
      <text x="160" y="35" textAnchor="middle" className="neon">
        ZEHN
      </text>
      <Rack x={8} />
      <Rack x={256} />
      {/* Werkzeugwand aus „[LPC] Woodshop“ über den Säcken */}
      <Tile name="werkzeugwand" x={60} y={58} />
      {/* Mehlsäcke aus „[LPC] Containers“: zwei unten, einer obendrauf */}
      <Mehlsack x={56} y={125} />
      <Mehlsack x={88} y={125} />
      <Mehlsack x={72} y={103} />
      {/* Treppe nach oben in die Backstube: Stufenfläche hell, Stirn im Grundton, Umriss darunter */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={225 - i * 6} y={150 - (i + 1) * 8} width={26} height={9} fill={O} />
          <rect x={226 - i * 6} y={151 - (i + 1) * 8} width={24} height={2} fill="#3a4262" />
          <rect x={226 - i * 6} y={153 - (i + 1) * 8} width={24} height={5} fill="#2c334c" />
        </g>
      ))}
      <rect x="196" y="56" width="30" height="56" fill="#ffcf7a" opacity="0.12" />
      {/* Boden */}
      <rect y="150" width="320" height="30" fill="#0c1020" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <rect key={i} x={i * 40} y="150" width="1" height="30" fill="#161d33" />
      ))}
      <rect y="150" width="320" height="1" fill="#1c2440" />
    </>
  );
}

const K = '#1f120a'; // Umriss der Backstube (warm)

/** Regalbrett: Oberkante hell, Grundton, Schatten, Umriss; die Brote stehen auf `y` */
function Board({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={5} fill={K} />
      <rect x={x + 1} y={y + 1} width={w - 2} height={1} fill="#a8744a" />
      <rect x={x + 1} y={y + 2} width={w - 2} height={1} fill="#8a5a34" />
      <rect x={x + 1} y={y + 3} width={w - 2} height={1} fill="#5a3420" />
    </>
  );
}

function Backstube() {
  const shelf = [
    { y: 60, items: ['brot-kreuz', 'brot-rund', 'brot-wiener', 'brot-kasten'] },
    { y: 84, items: ['brot-roggen', 'brot-ciabatta', 'brot-zopf', 'brot-kreuz'] },
    { y: 108, items: ['brot-rund', 'brot-kasten', 'brot-roggen', 'brot-wiener'] },
  ] as const;
  return (
    <>
      {/* Wand: drei Töne, Dielen als dünne Linien */}
      <rect width="320" height="50" fill="#4a2d1b" />
      <rect y="50" width="320" height="50" fill="#432818" />
      <rect y="100" width="320" height="50" fill="#3b2314" />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={i * 16 + 8} y="0" width="1" height="146" fill="#33200f" />
      ))}
      {/* Fenster: Rahmen, drei Himmelstöne, Sonne aus Rechtecken, Fensterbank (tiefer gesetzt: oben schneidet das Bilderbuch ab) */}
      <g transform="translate(0 14)">
      <rect x="16" y="24" width="76" height="66" fill={K} />
      <rect x="18" y="26" width="72" height="62" fill="#6b4226" />
      <rect x="22" y="30" width="64" height="18" fill="#ffd9a0" />
      <rect x="22" y="48" width="64" height="18" fill="#ffbf84" />
      <rect x="22" y="66" width="64" height="18" fill="#ff9f6b" />
      <rect x="66" y="36" width="8" height="1" fill="#fff3c4" />
      <rect x="64" y="37" width="12" height="6" fill="#fff3c4" />
      <rect x="66" y="43" width="8" height="1" fill="#fff3c4" />
      <rect x="53" y="30" width="2" height="54" fill="#6b4226" />
      <rect x="22" y="56" width="64" height="2" fill="#6b4226" />
      <rect x="14" y="88" width="80" height="4" fill={K} />
      <rect x="15" y="89" width="78" height="1" fill="#a8744a" />
      <rect x="15" y="90" width="78" height="1" fill="#8a5a34" />
      </g>
      {/* Schild */}
      <g transform="translate(-4 26)">
      <rect x="112" y="12" width="96" height="22" fill={K} />
      <rect x="114" y="14" width="92" height="18" fill="#6b4226" />
      <rect x="114" y="14" width="92" height="1" fill="#a8744a" />
      <rect x="116" y="16" width="88" height="14" fill="#8a5a34" />
      <text x="160" y="27" textAnchor="middle" className="shop">
        Adas Backstube
      </text>
      </g>
      {/* Regale mit Brot aus den LPC-Kacheln */}
      {shelf.map(({ y, items }) => (
        <g key={y}>
          {items.map((name, i) => (
            <Prop key={i} name={name} x={220 + i * 24} y={y} />
          ))}
          <Board x={206} y={y} w={104} />
        </g>
      ))}
      {/* Fußleiste und Dielenboden */}
      <rect y="145" width="320" height="1" fill={K} />
      <rect y="146" width="320" height="4" fill="#3a2214" />
      <rect y="150" width="320" height="30" fill="#6b4329" />
      {[150, 157, 165, 174].map((y, i) => (
        <rect key={y} y={y} width="320" height="1" fill={i ? '#5a3720' : '#8a5a36'} />
      ))}
      {[24, 88, 152, 216, 280].map((x, i) => (
        <rect key={x} x={x + (i % 2) * 20} y={157 + (i % 3) * 8} width="1" height="8" fill="#5a3720" />
      ))}
      {/* Herd mit Backofen aus „[LPC] Wooden Furniture“ unter dem Fenster */}
      <Prop name="ofen" x={54} y={150} />
      {/* Theke: Unterbau mit Füllung, Platte oben; die Vitrine steht darauf, die Figuren links und rechts davon */}
      <rect x="95" y="111" width="106" height="43" fill={K} />
      <rect x="96" y="112" width="104" height="41" fill="#5a3420" />
      <rect x="96" y="112" width="104" height="1" fill="#a8744a" />
      <rect x="96" y="113" width="104" height="3" fill="#8a5a34" />
      <rect x="96" y="116" width="104" height="1" fill="#3a2214" />
      <rect x="101" y="121" width="94" height="26" fill={K} />
      <rect x="102" y="122" width="92" height="24" fill="#4a2a18" />
      <rect x="102" y="122" width="92" height="1" fill="#3a2214" />
      <rect x="96" y="148" width="104" height="5" fill="#3a2214" />
      {/* Vitrine: Backwaren dahinter, Glas darüber (Transparenz nur hier) */}
      <Prop name="brot-kreuz-paar" x={114} y={111} />
      <Prop name="brot-roggen-paar" x={148} y={111} />
      <Prop name="brot-wiener-paar" x={183} y={111} />
      <rect x="95" y="80" width="106" height="32" fill="#cfe9ff" opacity="0.2" />
      <rect x="95" y="80" width="106" height="1" fill="#e8f5ff" opacity="0.7" />
      <rect x="95" y="80" width="1" height="32" fill="#e8f5ff" opacity="0.5" />
      <rect x="200" y="80" width="1" height="32" fill={K} opacity="0.6" />
    </>
  );
}

/** Scheibe aus Rechtecken (kein Kreis): Mitte (cx, cy), Radius r */

function Schreibtisch() {
  return (
    <>
      <rect width="320" height="120" fill="url(#bricksDark)" />
      {/* Poster Grundstellung: Umriss, Papier in drei Tönen, zwei Klebestreifen */}
      <rect x="21" y="21" width="52" height="36" fill={O} />
      <rect x="22" y="22" width="50" height="34" fill="#e9dfc4" />
      <rect x="22" y="22" width="50" height="1" fill="#f6efd9" />
      <rect x="22" y="22" width="1" height="34" fill="#f6efd9" />
      <rect x="22" y="55" width="50" height="1" fill="#bfb18e" />
      <rect x="71" y="23" width="1" height="33" fill="#bfb18e" />
      <rect x="20" y="20" width="6" height="3" fill="#c4b78f" />
      <rect x="68" y="20" width="6" height="3" fill="#c4b78f" />
      <text x="47" y="34" textAnchor="middle" className="poster">
        ASDF
      </text>
      <text x="47" y="46" textAnchor="middle" className="poster">
        JKLÖ
      </text>
      {/* Uhr: Scheibe mit Umriss, Zeiger */}
      <Rects px={[...disc(282, 36, 13, O), ...disc(282, 36, 12, '#bfb18e'), ...disc(281, 35, 11, '#e9dfc4')]} />
      <rect x="281" y="27" width="2" height="10" fill="#2b2418" />
      <rect x="282" y="35" width="7" height="2" fill="#2b2418" />
      {/* Tisch: Kante hell, Platte, Maserung */}
      <rect y="117" width="320" height="1" fill={O} />
      <rect y="118" width="320" height="2" fill="#8a5a36" />
      <rect y="120" width="320" height="1" fill="#6b4226" />
      <rect y="121" width="320" height="59" fill="#5a3a22" />
      {[128, 140, 152, 166].map((y, i) => (
        <rect key={y} x={i * 30} y={y} width={180 + i * 20} height="1" fill="#4d311c" />
      ))}
      {/* Laptop aus „[LPC Revised] The Office“ */}
      <Prop name="laptop" x={62} y={118} />
      {/* Tasse: Umriss, hell links, Schatten rechts, Henkel; der Dampf steigt in Stufen */}
      <rect x="17" y="99" width="18" height="19" fill={O} />
      <rect x="18" y="100" width="16" height="17" fill="#e9e3d3" />
      <rect x="18" y="100" width="2" height="17" fill="#f6f1e4" />
      <rect x="31" y="100" width="3" height="17" fill="#bfb8a4" />
      <rect x="18" y="100" width="16" height="4" fill="#6b3e1f" />
      <rect x="18" y="100" width="16" height="1" fill="#8a5a34" />
      <rect x="35" y="103" width="5" height="11" fill={O} />
      <rect x="35" y="104" width="3" height="9" fill="#e9e3d3" />
      <rect x="35" y="106" width="2" height="5" fill={O} />
      {/* Dampf über der Tasse */}
      <g fill="#ffffff" opacity="0.25">
        <rect x="24" y="93" width="1" height="3" />
        <rect x="25" y="90" width="1" height="3" />
        <rect x="24" y="87" width="1" height="3" />
      </g>
      {/* Lampe: Fuß, Arm, Schirm in drei Tönen; das Licht als gestufter Kegel (Licht darf durchscheinen) */}
      <rect x="289" y="69" width="5" height="49" fill={O} />
      <rect x="290" y="72" width="3" height="46" fill="#2a2f3d" />
      <rect x="290" y="72" width="1" height="46" fill="#3d4456" />
      <rect x="277" y="63" width="24" height="10" fill={O} />
      <rect x="278" y="64" width="22" height="8" fill="#2a2f3d" />
      <rect x="278" y="64" width="22" height="2" fill="#3d4456" />
      <rect x="278" y="70" width="22" height="2" fill="#1c212d" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={279 - i * 2} y={73 + i * 6} width={20 + i * 4} height={6} fill="#ffe7a8" opacity="0.07" />
      ))}
    </>
  );
}

/** Funkturm: Nachthimmel, drei Türme mit Funkbrücken dazwischen, unten die Dächer der Stadt (Boden ab y = 150) */
function Funkturm() {
  const TOWERS = [
    { x: 44, top: 62, w: 12 },
    { x: 150, top: 30, w: 16 },
    { x: 262, top: 74, w: 12 },
  ];
  return (
    <>
      <rect width="320" height="180" fill="#101a38" />
      <rect y="90" width="320" height="30" fill="#17224a" />
      <rect y="120" width="320" height="30" fill="#1f2c5a" />
      {[[20, 14], [70, 30], [118, 10], [200, 18], [236, 40], [296, 12], [300, 52], [100, 52]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="2" height="2" fill="#dfe8ff" opacity="0.8" />
      ))}
      {/* Funkbrücken: gestufte Seile zwischen den Türmen, dazu Lämpchen */}
      {[0, 1].map((i) => {
        const a = TOWERS[i]!;
        const b = TOWERS[i + 1]!;
        const steps = 16;
        return Array.from({ length: steps }, (_, k) => {
          const x = a.x + a.w / 2 + ((b.x - a.x - a.w / 2) * k) / steps;
          const t = k / (steps - 1);
          const y = a.top + 24 + (b.top - a.top) * t + Math.sin(t * Math.PI) * 8;
          return <rect key={`${i}-${k}`} x={x} y={y} width={Math.ceil((b.x - a.x) / steps) + 1} height="2" fill={k % 5 === 2 ? '#2ee6ff' : '#5a6a98'} />;
        });
      })}
      {TOWERS.map((t) => (
        <g key={t.x}>
          {/* Gitterturm: Kontur, zwei Streben, Querstreben, Lampe oben */}
          <rect x={t.x - 1} y={t.top} width={t.w + 2} height={150 - t.top} fill={O} />
          <rect x={t.x} y={t.top} width="2" height={150 - t.top} fill="#4a5784" />
          <rect x={t.x + t.w - 2} y={t.top} width="2" height={150 - t.top} fill="#2c3558" />
          {Array.from({ length: Math.floor((150 - t.top) / 10) }, (_, i) => (
            <rect key={i} x={t.x + 2} y={t.top + 6 + i * 10} width={t.w - 4} height="2" fill="#3a4570" />
          ))}
          <rect x={t.x + t.w / 2 - 1} y={t.top - 8} width="2" height="8" fill="#4a5784" />
          <rect x={t.x + t.w / 2 - 2} y={t.top - 11} width="4" height="3" fill="#ff5a5a" />
        </g>
      ))}
      {/* Dächer der Stadt */}
      <rect y="150" width="320" height="30" fill="#2a1f2e" />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={i * 16} y={150 + (i % 3) * 4} width="16" height="30" fill={i % 2 ? '#3b2a3a' : '#33263a'} />
      ))}
      <rect y="150" width="320" height="2" fill="#4c3850" />
    </>
  );
}

/** Tunnel unter dem Archiv: links und rechts Konsolen, in der Mitte die Tunnelröhre, vorn Bahnsteigkante und Gleise, an der Decke Lampen (Boden ab y = 130) */
function Tunnel() {
  /** Konsolen aus dem „LPC Sci Fi Megapack“: drei links, drei rechts der Röhre, abwechselnd zwei Bauarten */
  const CONSOLES = [8, 40, 72, 216, 248, 280];
  return (
    <>
      <rect width="320" height="180" fill="#0a0f1c" />
      {/* Tunnelröhre in der Mitte: gestufter Bogen, innen dunkler */}
      <rect x="104" y="44" width="112" height="90" fill={O} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={110 + i * 2} y={38 + i * 4} width={100 - i * 4} height={14} fill="#161e38" />
      ))}
      <rect x="108" y="52" width="104" height="82" fill="#05070d" />
      <rect x="150" y="84" width="20" height="50" fill="#0a0f1c" />
      <rect x="156" y="96" width="8" height="38" fill="#05070d" />
      {/* Konsolen links und rechts, sie stehen auf der Bahnsteigkante */}
      {CONSOLES.map((x, i) => (
        <Tile key={x} name={i % 2 ? 'konsole-2' : 'konsole'} x={x} y={70} />
      ))}
      {/* Decke mit Lampen: dazu ein gestufter Lichtkegel */}
      <rect width="320" height="16" fill="#12192e" />
      <rect y="16" width="320" height="2" fill="#2c3a66" />
      {[40, 160, 280].map((x) => (
        <g key={x}>
          <rect x={x - 11} y="16" width="22" height="4" fill={O} />
          <rect x={x - 9} y="17" width="18" height="2" fill="#ffe7a8" />
          <rect x={x - 14} y="20" width="28" height="10" fill="#ffe7a8" opacity="0.07" />
          <rect x={x - 20} y="30" width="40" height="14" fill="#ffe7a8" opacity="0.05" />
        </g>
      ))}
      {/* Bahnsteigkante mit Warnstreifen, darunter die Gleise */}
      <rect y="134" width="320" height="46" fill="#161a28" />
      <rect y="134" width="320" height="4" fill={O} />
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={i * 8} y="135" width="4" height="2" fill={i % 2 ? '#ffd84d' : '#3a3220'} />
      ))}
      <rect y="138" width="320" height="2" fill="#4a5784" />
      {/* Gleis aus „LPC Mine Carts and Tracks“, Kachel an Kachel */}
      {Array.from({ length: 10 }, (_, i) => (
        <Tile key={i} name="gleis" x={i * 32} y={152} />
      ))}
    </>
  );
}

/** Treppenhaus im Turm des Barons: Wendeltreppe aus acht Leuchtstufen, die abwechselnd links und rechts hochsteigen, oben eine Tür mit Licht (Boden ab y = 160) */
function Turm() {
  const STEPS = 8;
  return (
    <>
      {/* Mauer: links und rechts steinerne Säulen, dazwischen das dunkle Treppenhaus */}
      <rect width="320" height="180" fill="#0f1426" />
      <rect x="0" width="44" height="180" fill="#161e38" />
      <rect x="44" width="3" height="180" fill={O} />
      <rect x="273" width="3" height="180" fill={O} />
      <rect x="276" width="44" height="180" fill="#161e38" />
      <rect x="0" width="2" height="180" fill="#2c3a66" />
      <rect x="276" width="2" height="180" fill="#2c3a66" />
      {[30, 70, 110, 150].map((y) => (
        <rect key={y} x="0" y={y} width="44" height="2" fill="#0e1428" />
      ))}
      {[50, 90, 130].map((y) => (
        <rect key={y} x="276" y={y} width="44" height="2" fill="#0e1428" />
      ))}
      {/* Tür oben, innen warmes Licht, davor ein gestufter Lichtkegel */}
      <g>
        <rect x="134" y="14" width="52" height="60" fill={O} />
        <rect x="137" y="17" width="46" height="57" fill="#ffe7a8" />
        <rect x="137" y="17" width="46" height="3" fill="#fff6d8" />
        <rect x="156" y="17" width="3" height="57" fill="#e0b860" />
        <rect x="120" y="74" width="80" height="6" fill="#ffe7a8" opacity="0.1" />
        <rect x="100" y="80" width="120" height="10" fill="#ffe7a8" opacity="0.06" />
      </g>
      {/* Leuchtstufen: von unten nach oben, abwechselnd links und rechts, oben kleiner (Perspektive) */}
      {Array.from({ length: STEPS }, (_, i) => {
        const w = 104 - i * 6;
        const x = i % 2 === 0 ? 50 : 270 - w;
        const y = 156 - i * 11;
        return (
          <g key={i}>
            <rect x={x - 1} y={y - 1} width={w + 2} height="10" fill={O} />
            <rect x={x} y={y} width={w} height="8" fill="#2a3760" />
            <rect x={x} y={y} width={w} height="2" fill="#2ee6ff" />
            <rect x={x} y={y + 6} width={w} height="2" fill="#1c2540" />
            <rect x={x} y={y - 6} width={w} height="5" fill="#2ee6ff" opacity="0.06" />
          </g>
        );
      })}
      <rect y="168" width="320" height="12" fill="#161a28" />
      <rect y="168" width="320" height="2" fill={O} />
    </>
  );
}

/** Marktplatz am Abend: Bühne mit zwei Lautsprechern in der Mitte, Lichterkette darüber, links und rechts je ein Marktstand (Boden ab y = 150) */
function Marktplatz() {
  const BULBS = [10, 42, 74, 106, 138, 170, 202, 234, 266, 298];
  return (
    <>
      {/* Abendhimmel in drei Streifen */}
      <rect width="320" height="180" fill="#121a3a" />
      <rect y="52" width="320" height="40" fill="#2a2450" />
      <rect y="92" width="320" height="58" fill="#4a3358" />
      {/* Lichterkette: Schnur in Stufen, daran zehn Lampen */}
      <rect x="0" y="12" width="320" height="2" fill={O} />
      {BULBS.map((x, i) => (
        <g key={x}>
          <rect x={x} y={14 + (i % 2) * 3} width="6" height="2" fill={O} />
          <rect x={x} y={16 + (i % 2) * 3} width="6" height="7" fill={i % 3 === 0 ? '#ff8aa8' : i % 3 === 1 ? '#ffe7a8' : '#7de3ff'} />
          <rect x={x - 2} y={14 + (i % 2) * 3} width="10" height="12" fill="#ffe7a8" opacity="0.08" />
        </g>
      ))}
      {/* Marktstände links und rechts: Dach in zwei Farben, Tisch */}
      {[16, 236].map((x) => (
        <g key={x}>
          <rect x={x} y="104" width="68" height="46" fill="#241c3c" />
          <rect x={x - 3} y="96" width="74" height="10" fill="#e8587c" />
          <rect x={x - 3} y="96" width="12" height="10" fill="#fff6d8" />
          <rect x={x + 21} y="96" width="12" height="10" fill="#fff6d8" />
          <rect x={x + 45} y="96" width="12" height="10" fill="#fff6d8" />
          <rect x={x + 6} y="126" width="56" height="6" fill="#8a5a38" />
          <rect x={x + 8} y="118" width="8" height="8" fill="#f2c36b" />
          <rect x={x + 22} y="118" width="8" height="8" fill="#f2c36b" />
        </g>
      ))}
      {/* Bühne: Podest, Rückwand, zwei Lautsprecher mit Membran, Mikrofon in der Mitte */}
      <rect x="96" y="104" width="128" height="46" fill="#1c2540" />
      <rect x="96" y="104" width="128" height="3" fill="#2ee6ff" opacity="0.5" />
      {[104, 200].map((x) => (
        <g key={x}>
          <rect x={x - 1} y="108" width="18" height="30" fill={O} />
          <rect x={x} y="109" width="16" height="28" fill="#2a3760" />
          <rect x={x + 4} y="114" width="8" height="8" fill="#0e1428" />
          <rect x={x + 3} y="125" width="10" height="10" fill="#0e1428" />
        </g>
      ))}
      <rect x="159" y="116" width="2" height="26" fill="#c8d0e8" />
      <rect x="157" y="112" width="6" height="5" fill="#c8d0e8" />
      <rect y="150" width="320" height="30" fill="#161a28" />
      <rect y="150" width="320" height="2" fill={O} />
      {/* Pflasterfugen */}
      {[158, 168].map((y) => (
        <rect key={y} y={y} width="320" height="1" fill="#0e1428" />
      ))}
      {/* Laternen aus „LPC Lamp Posts Rework“ zwischen Ständen und Bühne */}
      <Prop name="laterne" x={90} y={152} />
      <Prop name="laterne" x={230} y={152} />
    </>
  );
}

/** Keller unter dem Laden am Marktplatz: Stahltür mit vier Rädchen, drei Maschinen mit Glasröhren voller Zeichen, Goldstaub am Boden */
function Tresor() {
  // Maschinen: zwei links, die dritte rechts (größer, mit dem Glas)
  const MACHINES = [
    { x: 10, w: 46, tubes: 2 },
    { x: 64, w: 46, tubes: 2 },
    { x: 214, w: 96, tubes: 4 },
  ];
  /** Zeichen in den Röhren als kleine farbige Pixel, fest verteilt (ohne Zufall) */
  const BITS = ['#7de3ff', '#ffe7a8', '#ff8aa8', '#b8f5a0'];
  const DUST = [18, 44, 71, 96, 118, 131, 152, 176, 197, 205, 228, 251, 270, 293, 309];
  return (
    <>
      {/* Mauer aus Ziegeln, warm angeleuchtet wie eine Backstube */}
      <rect width="320" height="180" fill="url(#bricks)" />
      <rect width="320" height="150" fill="#ffb060" opacity="0.06" />
      {/* Maschinen: Gehäuse, oben Glasröhren mit Zeichen, unten Lämpchen und Lüftungsschlitze */}
      {MACHINES.map(({ x, w, tubes }, m) => (
        <g key={x}>
          <rect x={x - 1} y="62" width={w + 2} height="88" fill={O} />
          <rect x={x} y="63" width={w} height="87" fill="#3a3f52" />
          <rect x={x} y="63" width={w} height="3" fill="#5a6280" />
          {Array.from({ length: tubes }, (_, t) => {
            const tx = x + 6 + t * ((w - 12) / tubes);
            const tw = (w - 12) / tubes - 4;
            return (
              <g key={t}>
                <rect x={tx} y="70" width={tw} height="40" fill="#1a2a3a" />
                <rect x={tx} y="70" width="2" height="40" fill="#c8f0ff" opacity="0.3" />
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <rect key={k} x={tx + 3 + ((k * 5 + t * 3) % Math.max(1, tw - 6))} y={74 + k * 6} width="3" height="3" fill={BITS[(k + t + m) % BITS.length]} />
                ))}
              </g>
            );
          })}
          {[0, 1, 2].map((k) => (
            <rect key={k} x={x + 6 + k * 8} y="118" width="4" height="4" fill={k === m ? '#ff8a3c' : '#2ee6ff'} />
          ))}
          {[128, 134, 140].map((y) => (
            <rect key={y} x={x + 6} y={y} width={w - 12} height="2" fill="#262a38" />
          ))}
        </g>
      ))}
      {/* im Glas der dritten Maschine: ein goldenes O aus Pixeln */}
      <rect x="276" y="44" width="26" height="18" fill="#1a2a3a" />
      <rect x="276" y="44" width="26" height="2" fill="#c8f0ff" opacity="0.4" />
      <rect x="283" y="47" width="12" height="2" fill="#ffd34d" />
      <rect x="283" y="57" width="12" height="2" fill="#ffd34d" />
      <rect x="281" y="49" width="2" height="8" fill="#ffd34d" />
      <rect x="295" y="49" width="2" height="8" fill="#ffd34d" />
      {/* Stahltür: Rahmen, Platte mit Nieten, Griff, darüber vier Rädchen */}
      <rect x="122" y="38" width="80" height="112" fill={O} />
      <rect x="125" y="41" width="74" height="109" fill="#6a7388" />
      <rect x="125" y="41" width="74" height="3" fill="#9aa4bc" />
      {[46, 145].map((y) =>
        [130, 192].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" fill="#3a4152" />),
      )}
      <rect x="186" y="96" width="6" height="22" fill="#3a4152" />
      {[0, 1, 2, 3].map((i) => (
        <g key={`rad${i}`}>
          <rect x={132 + i * 16} y="64" width="12" height="16" fill={O} />
          <rect x={133 + i * 16} y="65" width="10" height="14" fill="#c8d0e8" />
          <rect x={133 + i * 16} y="71" width="10" height="2" fill="#3a4152" />
        </g>
      ))}
      {/* Boden und Goldstaub */}
      <rect y="150" width="320" height="30" fill="#1a1622" />
      <rect y="150" width="320" height="2" fill={O} />
      {DUST.map((x, i) => (
        <rect key={x} x={x} y={154 + ((i * 7) % 20)} width={i % 3 === 0 ? 3 : 2} height="2" fill="#ffd34d" opacity={i % 2 === 0 ? 0.9 : 0.6} />
      ))}
    </>
  );
}

/**
 * Ottis Laden am Marktplatz 10 (TIPPNIX-Zentrale): links ein Regal voller Lollis, in der Mitte ein Bildschirm mit unserem Chat über dem Tresen,
 * rechts die Treppe nach unten, in der vier Maschinen angedeutet sind (Boden ab y = 150). Vier Gruppen: Regal, Bildschirm, Tresen, Treppe.
 */
function Zentrale() {
  /** Lollis im Regal: Farben von Zuckerstangen, fest verteilt (ohne Zufall) */
  const SWEETS = ['#ff8aa8', '#ffe7a8', '#7de3ff', '#b8f5a0', '#d9a6ff'];
  const ROWS = [64, 88, 112];
  /** Chat auf dem Bildschirm: Balken links (andere) und rechts (wir), als Nachrichtenblasen */
  const BUBBLES = [
    { x: 118, y: 40, w: 44, c: '#2ee6ff' },
    { x: 150, y: 50, w: 52, c: '#b8f5a0' },
    { x: 118, y: 60, w: 36, c: '#2ee6ff' },
  ];
  return (
    <>
      {/* Wand in Bonbonrosa-Dunkel mit hellem Sockel, warm beleuchtet wie ein Laden bei Nacht */}
      <rect width="320" height="180" fill="#2e2040" />
      <rect y="132" width="320" height="18" fill="#3c2a52" />
      <rect y="132" width="320" height="2" fill="#4f386b" />
      <rect width="320" height="150" fill="#ffb060" opacity="0.05" />
      {/* Regal mit drei Brettern, darauf je sieben Lollis (Kopf und Stiel) */}
      <g>
        <rect x="7" y="38" width="86" height="112" fill={O} />
        <rect x="9" y="40" width="82" height="110" fill="#4a3358" />
        {ROWS.map((y, r) => (
          <g key={y}>
            <rect x="9" y={y + 14} width="82" height="3" fill="#8a5a38" />
            {Array.from({ length: 7 }, (_, i) => (
              <g key={i}>
                <rect x={14 + i * 11} y={y + 6} width="1" height="8" fill="#c8d0e8" />
                <rect x={12 + i * 11} y={y} width="5" height="6" fill={SWEETS[(i + r * 2) % SWEETS.length]} />
              </g>
            ))}
          </g>
        ))}
      </g>
      {/* Bildschirm an der Wand: unser Chat in Blasen, darunter eine Leiste */}
      <g>
        <rect x="109" y="26" width="108" height="50" fill={O} />
        <rect x="111" y="28" width="104" height="46" fill="#0e1428" />
        {BUBBLES.map(({ x, y, w, c }) => (
          <rect key={y} x={x} y={y} width={w} height="6" fill={c} opacity="0.85" />
        ))}
        <rect x="111" y="68" width="104" height="6" fill="#26304f" />
        <rect x="111" y="28" width="104" height="1" fill="#c8f0ff" opacity="0.4" />
      </g>
      {/* Tresen mit Kasse und einem Glas Lollis; ein Lolli im Mund der Chefin ist nur erzählt */}
      <g>
        <rect x="103" y="108" width="118" height="42" fill={O} />
        <rect x="105" y="110" width="114" height="40" fill="#6b3f52" />
        <rect x="103" y="106" width="118" height="5" fill="#a86d4a" />
        <rect x="112" y="92" width="22" height="14" fill="#3a4152" />
        <rect x="115" y="95" width="16" height="5" fill="#9ad0b8" />
        <rect x="170" y="88" width="14" height="18" fill="#c8f0ff" opacity="0.35" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={172 + i * 4} y={91 + (i % 2) * 3} width="3" height="8" fill={SWEETS[i]} />
        ))}
      </g>
      {/* Treppe nach unten: dunkle Öffnung, Stufen, unten vier Maschinen mit je einem Lämpchen */}
      <g>
        <rect x="233" y="62" width="80" height="88" fill={O} />
        <rect x="236" y="65" width="74" height="85" fill="#0a0e1b" />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={236 + i * 4} y={96 + i * 10} width={74 - i * 4} height="4" fill={i % 2 === 0 ? '#4a3358' : '#3c2a52'} />
        ))}
        {[0, 1, 2, 3].map((m) => (
          <g key={m}>
            <rect x={262 + m * 12} y="70" width="10" height="16" fill="#3a3f52" />
            <rect x={265 + m * 12} y="74" width="4" height="4" fill={m === 3 ? '#ff8a3c' : '#2ee6ff'} />
          </g>
        ))}
      </g>
      <rect y="150" width="320" height="30" fill="#1a1622" />
      <rect y="150" width="320" height="2" fill={O} />
      {[158, 168].map((y) => (
        <rect key={y} y={y} width="320" height="1" fill="#0e1428" />
      ))}
    </>
  );
}

function Firewall() {
  return (
    <>
      <rect width="320" height="180" fill="#12060c" />
      {Array.from({ length: 12 }, (_, i) => (
        <text key={i} x={10 + i * 27} y={20 + ((i * 37) % 60)} className="binary">
          {['0110', '1001', '0011', '1110'][i % 4]}
        </text>
      ))}
      {/* Gitterboden in Perspektive */}
      {Array.from({ length: 17 }, (_, i) => (
        <line key={`v${i}`} x1={160} y1={92} x2={i * 20} y2={180} stroke="#5a1a36" strokeWidth="0.6" />
      ))}
      {[100, 112, 128, 150, 178].map((y) => (
        <line key={y} x1={0} y1={y} x2={320} y2={y} stroke="#5a1a36" strokeWidth="0.6" />
      ))}
      {/* Glühen über dem Horizont in drei Stufen (kein Verlauf) */}
      <rect y="52" width="320" height="14" fill="#ff3fb4" opacity="0.03" />
      <rect y="66" width="320" height="14" fill="#ff3fb4" opacity="0.06" />
      <rect y="80" width="320" height="12" fill="#ff3fb4" opacity="0.1" />
    </>
  );
}

/** Gemeinsam mit `memo`: Der Hintergrund zeichnet sich nicht bei jeder Dialogzeile neu (viele Rechtecke und Bilder) */
export const Scene = memo(function Scene({ name }: { name: SceneName }) {
  return (
    <div className={`scene scene-${name}`} aria-hidden="true">
      <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges">
        <defs>
          {BRICKS}
          {BRICKS_DARK}
        </defs>
        {name === 'keller' && <Keller />}
        {name === 'backstube' && <Backstube />}
        {name === 'schreibtisch' && <Schreibtisch />}
        {name === 'firewall' && <Firewall />}
        {name === 'funkturm' && <Funkturm />}
        {name === 'tunnel' && <Tunnel />}
        {name === 'turm' && <Turm />}
        {name === 'marktplatz' && <Marktplatz />}
        {name === 'tresor' && <Tresor />}
        {name === 'zentrale' && <Zentrale />}
      </svg>
    </div>
  );
});
