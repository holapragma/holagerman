import { cn } from "@/lib/utils";

type Point = { x: number; y: number };

function smoothPath(pts: Point[]): string {
  if (!pts.length) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(
      2,
    )} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export function AreaChart({
  data,
  height = 180,
  className,
}: {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
}) {
  const width = 600;
  const padX = 0;
  const padY = 16;

  const max = Math.max(...data.map((d) => d.value), 1);
  const pts = data.map((d, i) => {
    const x = data.length > 1 ? padX + (i * (width - padX * 2)) / (data.length - 1) : width / 2;
    const y = padY + (1 - d.value / max) * (height - padY * 2);
    return { x, y, value: d.value };
  });

  const line = smoothPath(pts);
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const last = pts[pts.length - 1];

  const gridLines = [0.25, 0.5, 0.75].map((f) => ({
    y: padY + f * (height - padY * 2),
  }));

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-hidden
      >
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g, i) => (
          <line
            key={i}
            x1={0}
            x2={width}
            y1={g.y}
            y2={g.y}
            stroke="var(--border)"
            strokeDasharray="3 6"
            strokeWidth={1}
          />
        ))}

        <path d={area} fill="url(#area-fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {last ? (
          <>
            <circle cx={last.x} cy={last.y} r={9} fill="var(--primary)" opacity={0.12} />
            <circle cx={last.x} cy={last.y} r={3.5} fill="var(--primary)" stroke="#fff" strokeWidth={2} />
          </>
        ) : null}
      </svg>

      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}