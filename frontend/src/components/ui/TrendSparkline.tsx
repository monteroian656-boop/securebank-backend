interface Point {
  day: string;
  availability: number;
}

// Gráfico de tendencia simple en SVG para la evolución de disponibilidad de SLA en el dashboard
export function TrendSparkline({ data }: { data: Point[] }) {
  const width = 480;
  const height = 120;
  const padding = 24;

  if (data.length < 2) {
    return (
      <p className="text-xs text-muted">
        Todavía no hay suficientes mediciones para mostrar una tendencia.
      </p>
    );
  }

  const min = Math.min(...data.map((d) => d.availability)) - 0.2;
  const max = Math.max(...data.map((d) => d.availability)) + 0.2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.availability - min) / (max - min)) * (height - padding * 2);
    return { x, y, ...d };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <path d={path} fill="none" stroke="#2F6F5E" strokeWidth={2} />
      {points.map((p) => (
        <g key={p.day}>
          <circle cx={p.x} cy={p.y} r={3} fill="#2F6F5E" />
          <text x={p.x} y={height - 4} textAnchor="middle" className="fill-muted text-[10px] font-mono">
            {p.day}
          </text>
        </g>
      ))}
    </svg>
  );
}
