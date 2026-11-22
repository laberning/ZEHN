// Tempokurve der Akte: Anschläge pro Minute der letzten Übungen als Linie mit Achse.

/** Mit weniger als zwei Werten erscheint nur ein Hinweis */
export function TempoChart({ values }: { values: number[] }) {
  if (values.length < 2) return <p className="muted">Die Tempokurve erscheint nach ein paar Übungen.</p>;
  const w = 600;
  const h = 160;
  const max = Math.max(...values, 60) * 1.1;
  const x = (i: number) => (i / (values.length - 1)) * (w - 40) + 30;
  const y = (v: number) => h - 20 - (v / max) * (h - 30);
  const path = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const ticks = [0, Math.round(max / 2 / 10) * 10, Math.round((max * 0.9) / 10) * 10];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart" role="img" aria-label="Tempo der letzten Übungen in Anschlägen pro Minute">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={30} x2={w - 10} y1={y(t)} y2={y(t)} className="grid" />
          <text x={0} y={y(t) + 4} className="tick">
            {t}
          </text>
        </g>
      ))}
      <path d={path} className="line" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={3} className="dot">
          <title>{Math.round(v)} Anschläge/min</title>
        </circle>
      ))}
    </svg>
  );
}
