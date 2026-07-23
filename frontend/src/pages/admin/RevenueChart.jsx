import React, { useMemo, useRef, useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RevenueChart = ({ dataByYear }) => {
  const chartWrapRef = useRef(null);
  const years = useMemo(
    () => Object.keys(dataByYear || {}).map(Number).sort((a, b) => b - a),
    [dataByYear]
  );
  const [year, setYear] = useState(years[0] || new Date().getFullYear());
  const [tooltip, setTooltip] = useState(null);

  const chartData = dataByYear?.[year] || MONTHS.map((label) => ({ label, orders: 0, sales: 0 }));
  const maxValue = Math.max(...chartData.map((item) => Math.max(item.orders, item.sales)), 1);
  const yTicks = [0, Math.round(maxValue * 0.25), Math.round(maxValue * 0.5), Math.round(maxValue * 0.75), maxValue];

  const chartHeight = 220;
  const chartWidth = 720;
  const padding = { top: 16, right: 16, bottom: 36, left: 40 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const groupWidth = plotWidth / MONTHS.length;
  const barWidth = Math.min(14, groupWidth * 0.28);

  const barHeight = (value) => (Number(value || 0) / maxValue) * plotHeight;

  const showTooltip = (item, event) => {
    const wrap = chartWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setTooltip({
      label: item.label,
      orders: Number(item.orders || 0),
      sales: Number(item.sales || 0),
      x,
      y,
    });
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Order Statistics</h3>
          <p className="mt-1 text-sm text-gray-500">Orders and Sales by Month — {year}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-900" />
              Orders
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              Sales
            </span>
          </div>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-orange-400"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        ref={chartWrapRef}
        className="relative mt-6"
        onMouseLeave={() => setTooltip(null)}
      >
        {tooltip && (
          <div
            className="pointer-events-none absolute z-50 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-md"
            style={{
              left: Math.min(Math.max(tooltip.x + 12, 8), (chartWrapRef.current?.clientWidth || 300) - 140),
              top: Math.max(tooltip.y - 72, 8),
              color: '#111827',
              minWidth: 120,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 12, color: '#111827', marginBottom: 4 }}>
              {tooltip.label}
            </div>
            <div style={{ fontSize: 12, color: '#374151', marginBottom: 2 }}>
              Orders: <strong style={{ color: '#111827' }}>{tooltip.orders}</strong>
            </div>
            <div style={{ fontSize: 12, color: '#374151' }}>
              Sales: <strong style={{ color: '#ea580c' }}>{tooltip.sales}</strong>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-64 min-w-[720px] w-full">
            {yTicks.map((tick) => {
              const y = padding.top + plotHeight - (tick / maxValue) * plotHeight;
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                  />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
                    {tick}
                  </text>
                </g>
              );
            })}

            <text
              x={14}
              y={padding.top + plotHeight / 2}
              transform={`rotate(-90 14 ${padding.top + plotHeight / 2})`}
              textAnchor="middle"
              fontSize="11"
              fill="#9ca3af"
            >
              Orders
            </text>

            {chartData.map((item, index) => {
              const groupX = padding.left + index * groupWidth + groupWidth / 2;
              const ordersHeight = Math.max(barHeight(item.orders), item.orders > 0 ? 4 : 0);
              const salesHeight = Math.max(barHeight(item.sales), item.sales > 0 ? 4 : 0);
              const ordersX = groupX - barWidth - 2;
              const salesX = groupX + 2;
              const baseY = padding.top + plotHeight;
              const hitHeight = Math.max(ordersHeight, salesHeight, 28);
              const isActive = tooltip?.label === item.label;

              return (
                <g
                  key={item.label}
                  onMouseEnter={(e) => showTooltip(item, e)}
                  onMouseMove={(e) => showTooltip(item, e)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={groupX - groupWidth / 2}
                    y={baseY - hitHeight}
                    width={groupWidth}
                    height={hitHeight + 10}
                    fill={isActive ? 'rgba(249, 115, 22, 0.06)' : 'transparent'}
                  />
                  <rect
                    x={ordersX}
                    y={baseY - ordersHeight}
                    width={barWidth}
                    height={ordersHeight}
                    rx="3"
                    fill="#111827"
                  />
                  <rect
                    x={salesX}
                    y={baseY - salesHeight}
                    width={barWidth}
                    height={salesHeight}
                    rx="3"
                    fill="#f97316"
                  />
                  <text x={groupX} y={chartHeight - 10} textAnchor="middle" fontSize="11" fill="#9ca3af">
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
