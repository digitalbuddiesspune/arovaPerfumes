import React from 'react';
import { FiGift, FiPackage, FiShoppingCart } from 'react-icons/fi';

const iconForType = (type) => {
  if (type === 'order') return FiShoppingCart;
  if (type === 'product') return FiPackage;
  return FiGift;
};

const ActivityFeed = ({ activities }) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Activity Feed</h3>
      </div>
      <div className="max-h-[440px] space-y-3 overflow-y-auto p-4">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">No Data</p>
        ) : (
          activities.map((activity) => {
            const Icon = iconForType(activity.type);
            return (
              <div key={activity.id} className="flex gap-3">
                <div className="mt-0.5 rounded-full bg-gray-100 p-2 text-gray-700">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
