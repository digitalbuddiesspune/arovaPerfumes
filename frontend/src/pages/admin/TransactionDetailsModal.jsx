import React from 'react';
import { formatDisplayOrderId } from '../../utils/orderId';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const getOrderStatusLabel = (order = {}) => {
  const raw = String(order.orderStatus || order.status || 'pending').toLowerCase();
  if (raw === 'pending' || raw === 'created') return 'Pending';
  if (raw === 'confirmed' || raw === 'packed' || raw === 'processing' || raw === 'paid') return 'Confirmed';
  if (raw === 'shipped' || raw === 'on_the_way') return 'Shipping';
  if (raw === 'delivered') return 'Delivered';
  if (raw === 'cancelled' || raw === 'failed') return 'Cancelled';
  if (raw === 'returned') return 'Returned';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const getPaymentMeta = (order = {}) => {
  const total = Number(order.totalPrice ?? order.amount ?? 0);
  const charged = Number(
    order.amountCharged ??
      order.paidAmount ??
      order.razorpayAmount ??
      (order.paymentMethod === 'razorpay' ? total : total)
  );
  const ratio = total > 0 ? charged / total : 1;
  const isAdvance = ratio > 0 && ratio < 0.95;

  if (isAdvance) {
    const pct = Math.round(ratio * 100);
    return {
      paymentStatus: `Paid ${pct}%`,
      paymentType: `COD advance (${pct}%)`,
      amountCharged: charged || Math.round(total * 0.1),
    };
  }

  return {
    paymentStatus: 'Paid',
    paymentType: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid (Razorpay)',
    amountCharged: charged || total,
  };
};

const getPhone = (order = {}) =>
  order?.shippingAddress?.mobileNumber ||
  order?.address?.mobileNumber ||
  order?.shippingAddress?.alternatePhone ||
  order?.address?.alternatePhone ||
  order?.user?.phone ||
  '-';

const TransactionDetailsModal = ({ order, loading, error, onClose }) => {
  if (!order && !loading && !error) return null;

  const address = order?.shippingAddress || order?.address;
  const meta = order ? getPaymentMeta(order) : null;
  const total = Number(order?.totalPrice ?? order?.amount ?? 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-2 sm:p-4" onClick={onClose}>
      <div className="mx-auto flex h-full w-full items-end sm:items-center sm:justify-center">
        <div
          className="flex h-[94vh] w-full max-w-2xl flex-col rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900">Razorpay Payment</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
            >
              Close
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-4">
            {loading ? <div className="text-sm text-gray-600">Loading payment details...</div> : null}
            {error ? <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

            {!loading && !error && order ? (
              <>
                <section>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">Order</h4>
                  <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                    <p>
                      <span className="text-gray-500">Order ID:</span> #{formatDisplayOrderId(order)}
                    </p>
                    <p>
                      <span className="text-gray-500">Order status:</span> {getOrderStatusLabel(order)}
                    </p>
                    <p>
                      <span className="text-gray-500">Payment status:</span> {meta.paymentStatus}
                    </p>
                    <p>
                      <span className="text-gray-500">Payment type:</span> {meta.paymentType}
                    </p>
                    <p>
                      <span className="text-gray-500">Date:</span>{' '}
                      {formatDateTime(order.paidAt || order.createdAt)}
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">Customer</h4>
                  <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                    <p>
                      <span className="text-gray-500">Name:</span>{' '}
                      {order?.user?.name || address?.fullName || 'Customer'}
                    </p>
                    <p>
                      <span className="text-gray-500">Phone:</span> {getPhone(order)}
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span> {order?.user?.email || '-'}
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">Payment</h4>
                  <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                    <p>
                      <span className="text-gray-500">Razorpay payment ID:</span>{' '}
                      {order.razorpayPaymentId || order.transactionId || '-'}
                    </p>
                    <p>
                      <span className="text-gray-500">Razorpay order ID:</span>{' '}
                      {order.razorpayOrderId || '-'}
                    </p>
                    <p>
                      <span className="text-gray-500">Amount charged:</span>{' '}
                      <strong>{formatINR(meta.amountCharged)}</strong>
                    </p>
                    <p>
                      <span className="text-gray-500">Current order total:</span>{' '}
                      <strong>{formatINR(total)}</strong>
                    </p>
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">Products</h4>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    {(order.items || []).length === 0 ? (
                      <p className="text-sm text-gray-500">No products</p>
                    ) : (
                      <ul className="space-y-2 text-sm text-gray-700">
                        {(order.items || []).map((item, idx) => {
                          const title = item.name || item.product?.title || 'Product';
                          const qty = Number(item.quantity || 1);
                          const lineTotal = Number(item.price || 0) * qty;
                          return (
                            <li key={`${idx}-${title}`}>
                              {title} × {qty} — {formatINR(lineTotal)}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">Delivery address</h4>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                    {address ? (
                      <div className="space-y-1">
                        <p>
                          {[address.fullName || order?.user?.name, getPhone(order)].filter(Boolean).join(', ')}
                        </p>
                        {order?.user?.email ? <p>{order.user.email}</p> : null}
                        <p>
                          {[
                            address.address,
                            address.locality,
                            address.landmark,
                            address.city,
                            address.state,
                            address.pincode,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No delivery address found.</p>
                    )}
                  </div>
                </section>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;

export { getOrderStatusLabel, getPaymentMeta, getPhone, formatDateTime };
