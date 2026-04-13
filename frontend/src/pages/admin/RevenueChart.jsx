import React from 'react';

const buildPolyline = (data, key, width, height, padding) => {
  if (!data.length) return '';
  const values = data.map((item) => Number(item[key] || 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  return data
    .map((item, index) => {
      const x = padding + (index * (width - 2 * padding)) / Math.max(data.length - 1, 1);
      const yRatio = (Number(item[key] || 0) - min) / Math.max(max - min, 1);
      const y = height - padding - yRatio * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');
};

const RevenueChart = ({ data }) => {
  const width = 640;
  const height = 220;
  const padding = 26;

  if (!data.length) {
    return <div className="rounded-xl border bg-white p-4 text-sm text-gray-500 shadow-sm">No Data</div>;
  }

  const points = buildPolyline(data, 'revenue', width, height, padding);
  const values = data.map((item) => Number(item.orders || 0));
  const maxOrders = Math.max(...values, 1);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Revenue (Line) / Orders (Bar)</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-56 min-w-[640px]">
          <rect x="0" y="0" width={width} height={height} fill="white" />
          {data.map((item, index) => {
            const barWidth = (width - 2 * padding) / Math.max(data.length, 1) - 8;
            const x = padding + index * ((width - 2 * padding) / Math.max(data.length, 1)) + 4;
            const barHeight = (Number(item.orders || 0) / maxOrders) * (height - 2 * padding);
            return (
              <g key={item.label}>
                <rect x={x} y={height - padding - barHeight} width={Math.max(barWidth, 6)} height={barHeight} fill="#DBEAFE" rx="3" />
                <text x={x + barWidth / 2} y={height - 8} fontSize="10" textAnchor="middle" fill="#64748B">
                  {item.label}
                </text>
              </g>
            );
          })}
          <polyline points={points} fill="none" stroke="#10B981" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
};

export default RevenueChart;
