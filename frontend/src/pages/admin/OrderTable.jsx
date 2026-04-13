import React from 'react';
import { Eye } from 'lucide-react';
import { formatDisplayOrderId } from '../../utils/orderId';

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const paymentBadgeClass = (status) => {
  const value = String(status || '').toLowerCase();
  return value === 'paid'
    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    : 'bg-rose-100 text-rose-700 border border-rose-200';
};

const getTotal = (order = {}) =>
  Number(order?.totalPrice ?? order?.priceDetails?.totalPrice ?? order?.amount ?? 0);

const getPaymentStatus = (order = {}) => {
  const value = String(order.paymentStatus || '').toLowerCase();
  return value === 'paid' ? 'paid' : 'unpaid';
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const OrderTable = ({
  loading,
  orders,
  statusSavingId,
  onStatusChange,
  onView,
  page,
  totalPages,
  onPrev,
  onNext,
}) => {
  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-10 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total (₹)</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Order Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No Orders Found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const paymentStatus = getPaymentStatus(order);
                const total = getTotal(order);
                const isHighValue = total >= 5000;
                return (
                  <tr key={order._id} className={`border-t hover:bg-gray-50 ${isHighValue ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-4 py-3 font-medium">#{formatDisplayOrderId(order)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order?.user?.name || 'Customer'}</p>
                      <p className="text-xs text-gray-500">{order?.user?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3">{Array.isArray(order.items) ? order.items.length : 0}</td>
                    <td className="px-4 py-3 font-semibold">₹{total.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${paymentBadgeClass(paymentStatus)}`}>
                        {paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="w-full rounded-md border px-2 py-1.5 text-sm"
                        value={String(order.orderStatus || order.status || 'pending')}
                        onChange={(e) => onStatusChange(order, e.target.value)}
                        disabled={statusSavingId === order._id}
                      >
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onView(order)}
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button onClick={onPrev} disabled={page <= 1} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">
            Prev
          </button>
          <button onClick={onNext} disabled={page >= totalPages} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
