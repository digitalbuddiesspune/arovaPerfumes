import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDisplayOrderId } from '../../utils/orderId';

const statusLabel = (status) => {
  const value = String(status || 'pending').toLowerCase();
  if (value === 'pending' || value === 'created') return 'Attempted';
  if (value === 'confirmed' || value === 'packed' || value === 'processing' || value === 'paid') return 'Confirmed';
  if (value === 'shipped' || value === 'on_the_way') return 'Shipping';
  if (value === 'delivered') return 'Delivered';
  if (value === 'cancelled' || value === 'failed') return 'Cancelled';
  if (value === 'returned') return 'Returned';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const badgeClass = (status) => {
  const value = String(status || '').toLowerCase();
  if (value === 'pending' || value === 'created') return 'bg-amber-100 text-amber-700';
  if (value === 'confirmed' || value === 'processing' || value === 'packed' || value === 'paid') return 'bg-blue-100 text-blue-700';
  if (value === 'delivered') return 'bg-emerald-100 text-emerald-700';
  if (value === 'cancelled' || value === 'failed') return 'bg-rose-100 text-rose-700';
  if (value === 'shipped' || value === 'on_the_way') return 'bg-sky-100 text-sky-700';
  return 'bg-gray-100 text-gray-700';
};

const OrdersTable = ({ orders }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-base font-semibold text-gray-900">Latest Orders</h3>
        <Link to="/admin/orders" className="text-sm font-medium text-orange-500 hover:text-orange-600">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const status = order.orderStatus || order.status || 'pending';
                return (
                  <tr
                    key={order._id}
                    className="cursor-pointer border-t border-gray-100 hover:bg-orange-50/40"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">#{formatDisplayOrderId(order)}</td>
                    <td className="px-4 py-3 text-gray-800">{order?.user?.name || 'Customer'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {Array.isArray(order.items)
                        ? order.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
                        : 0}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{Number(order.totalPrice ?? order.amount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(status)}`}>
                        {statusLabel(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
