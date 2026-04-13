import React from 'react';
import { FiBox, FiClock, FiShoppingBag, FiTrendingUp, FiUsers } from 'react-icons/fi';

const CARD_CONFIG = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: FiTrendingUp, color: 'bg-emerald-50 text-emerald-700' },
  { key: 'totalOrders', label: 'Total Orders', icon: FiShoppingBag, color: 'bg-blue-50 text-blue-700' },
  { key: 'totalProducts', label: 'Total Products', icon: FiBox, color: 'bg-violet-50 text-violet-700' },
  { key: 'activeOrders', label: 'Active Orders', icon: FiClock, color: 'bg-amber-50 text-amber-700' },
  { key: 'totalUsers', label: 'Total Users', icon: FiUsers, color: 'bg-rose-50 text-rose-700' },
];

const DashboardCards = ({ stats, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onCardClick?.(card.key)}
            className="rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              <div className={`rounded-lg p-2 ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{stats?.[card.key] ?? 0}</p>
          </button>
        );
      })}
    </div>
  );
};

export default DashboardCards;
