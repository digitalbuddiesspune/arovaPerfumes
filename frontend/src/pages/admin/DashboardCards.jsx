import React from 'react';
import { Box, Clock3, ShoppingBag, TrendingUp, Users } from 'lucide-react';

const CARD_CONFIG = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: TrendingUp, color: 'bg-[#f7f0f0] text-[#381313]' },
  { key: 'totalOrders', label: 'Total Orders', icon: ShoppingBag, color: 'bg-[#f9f4f4] text-[#381313]' },
  { key: 'totalProducts', label: 'Total Products', icon: Box, color: 'bg-[#f7f0f0] text-[#381313]' },
  { key: 'activeOrders', label: 'Active Orders', icon: Clock3, color: 'bg-[#f9f4f4] text-[#381313]' },
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'bg-[#f7f0f0] text-[#381313]' },
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
              <p className="admin-title text-sm font-medium text-gray-700">{card.label}</p>
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
