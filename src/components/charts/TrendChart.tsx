import type { TimeSeriesPoint } from "@/types";

interface TrendChartProps {
  data: TimeSeriesPoint[];
  label?: string;
}

export function TrendChart({
  data,
  label = "Community responses over time",
}: TrendChartProps) {
  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 36, left: 36 };
  const values = data.map((point) => point.count);
  const max = Math.max(...values, 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const points = data.map((point, index) => {
    const x =
      padding.left +
      (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
    const y = padding.top + innerHeight - (point.count / max) * innerHeight;
    return { ...point, x, y };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padding.left},${padding.top + innerHeight} ${polyline} ${
    points.at(-1)?.x ?? padding.left
  },${padding.top + innerHeight}`;

  return (
    <svg
      className="trend-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      <polygon points={area} fill="rgba(18,60,42,0.08)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#123C2A"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {points.map((point) => (
        <g key={point.month}>
          <circle
            cx={point.x}
            cy={point.y}
            r={point === points.at(-1) ? 4.5 : 3}
            fill={point === points.at(-1) ? "#E8B04A" : "#123C2A"}
          />
          <text x={point.x} y={height - 10} textAnchor="middle">
            {point.month.replace(" 2026", "")}
          </text>
        </g>
      ))}
      <text x={padding.left} y={14}>
        {max}
      </text>
    </svg>
  );
}
