import React from 'react';

const StatTile = ({ label, value, valueClass }) => (
  <div className="rounded-lg bg-gray-50 px-4 py-5">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${valueClass}`}>
      {Number(value || 0).toLocaleString('en-IN')}
    </p>
  </div>
);

const StoreOverview = ({ stats }) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">Store Overview</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile label="Active Products" value={stats.activeProducts} valueClass="text-emerald-600" />
        <StatTile label="Out of Stock" value={stats.outOfStock} valueClass="text-rose-600" />
        <StatTile label="Low Stock" value={stats.lowStock} valueClass="text-orange-500" />
        <StatTile label="Active Users" value={stats.activeUsers} valueClass="text-blue-600" />
      </div>
    </div>
  );
};

export default StoreOverview;
