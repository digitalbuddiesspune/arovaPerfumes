import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDisplayOrderId } from '../../utils/orderId';

const badgeClass = (status) => {
  const value = String(status || '').toLowerCase();
  if (value === 'pending') return 'bg-amber-100 text-amber-700';
  if (value === 'confirmed' || value === 'processing') return 'bg-blue-100 text-blue-700';
  if (value === 'delivered') return 'bg-emerald-100 text-emerald-700';
  if (value === 'cancelled') return 'bg-rose-100 text-rose-700';
  if (value === 'shipped') return 'bg-sky-100 text-sky-700';
  return 'bg-gray-100 text-gray-700';
};

const OrdersTable = ({ orders }) => {
  const navigate = useNavigate();
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No Data
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="cursor-pointer border-t hover:bg-gray-50"
                  onClick={() => navigate(`/admin/orders/${order._id}`)}
                >
                  <td className="px-4 py-3 font-medium">#{formatDisplayOrderId(order)}</td>
                  <td className="px-4 py-3">{order?.user?.name || 'Customer'}</td>
                  <td className="px-4 py-3">{Array.isArray(order.items) ? order.items.length : 0}</td>
                  <td className="px-4 py-3">₹{Number(order.totalPrice ?? order.amount ?? 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${badgeClass(order.orderStatus || order.status)}`}>
                      {String(order.orderStatus || order.status || 'pending')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
