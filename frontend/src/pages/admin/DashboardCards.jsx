import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  Package,
  Truck,
  Wallet,
  XCircle,
} from 'lucide-react';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const SmallStatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="flex min-w-[140px] flex-1 items-center gap-2.5 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <p className="truncate text-[11px] leading-tight text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const LargeStatCard = ({ icon: Icon, label, value, iconBg, iconColor, to, growth }) => (
  <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold leading-tight text-gray-900">{value}</p>
      </div>
    </div>
    <div className="mt-2 flex items-center justify-between gap-2">
      {growth != null ? (
        <p className={`text-xs font-medium ${growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}% vs last month
        </p>
      ) : (
        <span />
      )}
      {to && (
        <Link to={to} className="text-xs font-medium text-orange-500 hover:text-orange-600">
          View All →
        </Link>
      )}
    </div>
  </div>
);

const DashboardCards = ({ monthName, dateLabel, monthStats, summaryStats, dateValue, onDateChange }) => {
  const smallCards = [
    {
      key: 'orders',
      label: `${monthName} Orders`,
      value: monthStats.orders,
      icon: ClipboardList,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      key: 'confirmed',
      label: `${monthName} Confirmed`,
      value: monthStats.confirmed,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      key: 'shipping',
      label: `${monthName} Shipping`,
      value: monthStats.shipping,
      icon: Truck,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-500',
    },
    {
      key: 'delivered',
      label: `${monthName} Delivered`,
      value: monthStats.delivered,
      icon: Check,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      key: 'cancelled',
      label: `${monthName} Cancelled`,
      value: monthStats.cancelled,
      icon: XCircle,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{monthName} Order Stats</p>
            <p className="text-xs text-gray-500">Filtered by calendar date: {dateLabel}</p>
          </div>
          <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date</span>
            <input
              type="date"
              value={dateValue || ''}
              onChange={(e) => onDateChange?.(e.target.value)}
              className="border-0 bg-transparent p-0 text-sm font-medium text-gray-900 outline-none"
            />
          </label>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {smallCards.map((card) => (
            <SmallStatCard key={card.key} {...card} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <LargeStatCard
          icon={Package}
          label="Total Products"
          value={summaryStats.totalProducts.toLocaleString('en-IN')}
          iconBg="bg-violet-50"
          iconColor="text-violet-500"
          to="/admin/products"
        />
        <LargeStatCard
          icon={FolderOpen}
          label="Total Categories"
          value={summaryStats.totalCategories.toLocaleString('en-IN')}
          iconBg="bg-sky-50"
          iconColor="text-sky-500"
          to="/admin/products"
        />
        <LargeStatCard
          icon={Wallet}
          label="Total Revenue"
          value={formatCurrency(summaryStats.totalRevenue)}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          to="/admin/orders"
          growth={summaryStats.revenueGrowth}
        />
      </div>
    </div>
  );
};

export default DashboardCards;
