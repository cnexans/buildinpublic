"use client";

type MiniChartProps = {
  data: { date: string; value: number }[];
  color?: string;
};

export function MiniChart({ data, color = "#6366f1" }: MiniChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-gray-300 text-sm">
        No data
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 400;
  const height = 80;
  const padding = { top: 8, bottom: 8, left: 0, right: 0 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + (1 - d.value / max) * chartHeight;
    return `${x},${y}`;
  });

  const areaPoints = [
    `${padding.left},${height - padding.bottom}`,
    ...points,
    `${padding.left + chartWidth},${height - padding.bottom}`,
  ];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-20"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints.join(" ")}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
