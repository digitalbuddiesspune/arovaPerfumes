import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatDisplayOrderId } from '../../utils/orderId';

const getTotal = (order = {}) =>
  Number(order?.totalPrice ?? order?.priceDetails?.totalPrice ?? order?.amount ?? 0);

const getPaymentStatus = (order = {}) => {
  if (order?.isPaid === true) return 'paid';
  const value = String(order.paymentStatus || '').toLowerCase();
  return value === 'paid' ? 'paid' : 'unpaid';
};

const getOrderStatusLabel = (order = {}) => {
  const raw = String(order.orderStatus || order.status || 'pending').toLowerCase();
  if (raw === 'pending' || raw === 'created') return 'Attempted';
  if (raw === 'confirmed' || raw === 'packed' || raw === 'processing' || raw === 'paid') return 'Confirmed';
  if (raw === 'shipped' || raw === 'on_the_way') return 'Shipping';
  if (raw === 'delivered') return 'Delivered';
  if (raw === 'cancelled' || raw === 'failed') return 'Cancelled';
  if (raw === 'returned') return 'Returned';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const getCustomerPhone = (order = {}) =>
  order?.address?.mobileNumber ||
  order?.shippingAddress?.mobileNumber ||
  order?.address?.alternatePhone ||
  order?.shippingAddress?.alternatePhone ||
  order?.user?.phone ||
  '';

const getProductSummary = (order = {}) => {
  const items = Array.isArray(order.items) ? order.items : [];
  if (!items.length) return '-';
  const names = items.map((item) => item.name || item.product?.title || 'Product');
  const text = names.join(', ');
  return text.length > 48 ? `${text.slice(0, 48)}...` : text;
};

const getQty = (order = {}) => {
  const items = Array.isArray(order.items) ? order.items : [];
  return items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
};

const getTransactionId = (order = {}) =>
  order?.transactionId || order?.razorpayPaymentId || order?.razorpayOrderId || '-';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const paymentBadgeClass = (status) =>
  status === 'paid'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-amber-100 text-amber-800';

const OrderTable = ({
  loading,
  orders,
  deletingId,
  onView,
  onDelete,
  page,
  totalPages,
  onPrev,
  onNext,
}) => {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="animate-pulse space-y-3 p-4">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-12 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-900 text-left text-xs font-semibold uppercase tracking-wide text-white">
              <th className="px-4 py-3 whitespace-nowrap">Order ID</th>
              <th className="px-4 py-3 whitespace-nowrap">Customer</th>
              <th className="px-4 py-3 whitespace-nowrap">Products</th>
              <th className="px-4 py-3 whitespace-nowrap">Qty</th>
              <th className="px-4 py-3 whitespace-nowrap">Price</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap">Payment</th>
              <th className="px-4 py-3 whitespace-nowrap">Transaction ID</th>
              <th className="px-4 py-3 whitespace-nowrap">Date</th>
              <th className="px-4 py-3 whitespace-nowrap text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                  No Orders Found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const paymentStatus = getPaymentStatus(order);
                const total = getTotal(order);
                return (
                  <tr
                    key={order._id}
                    onClick={() => onView?.(order)}
                    className="cursor-pointer border-t border-gray-100 hover:bg-orange-50/40"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      #{formatDisplayOrderId(order)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{order?.user?.name || order?.address?.fullName || 'Customer'}</p>
                      <p className="text-xs text-gray-500">{getCustomerPhone(order) || order?.user?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="truncate text-gray-800" title={getProductSummary(order)}>
                        {getProductSummary(order)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{getQty(order)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      ₹{total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{getOrderStatusLabel(order)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${paymentBadgeClass(paymentStatus)}`}>
                        {paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{getTransactionId(order)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        title="Cancel order"
                        disabled={deletingId === order._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(order);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
          <button
            type="button"
            onClick={onPrev}
            disabled={page <= 1}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={page >= totalPages}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTable;

// re-export helpers used by parent filters/export
export {
  getTotal,
  getPaymentStatus,
  getOrderStatusLabel,
  getCustomerPhone,
  getProductSummary,
  getQty,
  getTransactionId,
  formatDate,
};
