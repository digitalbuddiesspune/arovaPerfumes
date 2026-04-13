import React from 'react';

const AdminBadge = ({ tone = 'gray', children }) => {
  const tones = {
    yellow: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-rose-100 text-rose-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.gray}`}>{children}</span>;
};

export default AdminBadge;
