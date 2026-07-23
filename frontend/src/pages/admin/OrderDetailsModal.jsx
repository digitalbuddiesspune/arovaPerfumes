import React from 'react';
import { FiX } from 'react-icons/fi';
import { formatDisplayOrderId } from '../../utils/orderId';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusLabel = (order) => {
  const raw = String(order?.orderStatus || order?.status || 'pending').toLowerCase();
  if (raw === 'pending' || raw === 'created') return 'Attempted';
  if (raw === 'confirmed' || raw === 'packed' || raw === 'processing' || raw === 'paid') return 'Confirmed';
  if (raw === 'shipped' || raw === 'on_the_way') return 'Shipping';
  if (raw === 'delivered') return 'Delivered';
  if (raw === 'cancelled' || raw === 'failed') return 'Cancelled';
  if (raw === 'returned') return 'Returned';
  return raw;
};

const paymentLabel = (order) => {
  if (order?.isPaid === true) return 'paid';
  return String(order?.paymentStatus || '').toLowerCase() === 'paid' ? 'paid' : 'unpaid';
};

const OrderDetailsModal = ({ order, loading, error, onClose }) => {
  if (!order && !loading && !error) return null;

  const itemsPrice = Number(order?.itemsPrice ?? order?.priceDetails?.itemsPrice ?? 0);
  const taxPrice = Number(order?.taxPrice ?? order?.priceDetails?.taxPrice ?? 0);
  const shippingPrice = Number(order?.shippingPrice ?? order?.priceDetails?.shippingPrice ?? 0);
  const discount = Number(order?.discount ?? order?.priceDetails?.discount ?? order?.couponDiscount ?? 0);
  const totalPrice = Number(
    order?.totalPrice ?? order?.priceDetails?.totalPrice ?? order?.amount ?? 0
  );
  const address = order?.address || order?.shippingAddress;
  const payment = paymentLabel(order);
  const txn =
    order?.transactionId || order?.razorpayPaymentId || order?.razorpayOrderId || '-';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-2 sm:p-4" onClick={onClose}>
      <div className="mx-auto flex h-full w-full items-end sm:items-center sm:justify-center">
        <div
          className="flex h-[94vh] w-full max-w-5xl flex-col rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Order Details #{formatDisplayOrderId(order || {})}
              </h3>
              <p className="text-xs text-gray-500">{formatDateTime(order?.createdAt)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100"
            >
              <FiX />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {loading ? <div className="text-sm text-gray-600">Loading order details...</div> : null}
            {error ? <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

            {!loading && !error && order ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                    <p className="mt-1 font-semibold text-gray-900">{statusLabel(order)}</p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Payment</p>
                    <p className="mt-1 font-semibold capitalize text-gray-900">{payment}</p>
                    <p className="text-xs text-gray-500">{(order.paymentMethod || 'cod').toUpperCase()}</p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Transaction ID</p>
                    <p className="mt-1 break-all font-semibold text-gray-900">{txn}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border p-3">
                    <h4 className="mb-2 text-sm font-semibold text-gray-900">Customer Info</h4>
                    <p className="text-sm text-gray-800">{order?.user?.name || address?.fullName || 'Customer'}</p>
                    <p className="text-sm text-gray-500">{order?.user?.email || '-'}</p>
                    <p className="text-sm text-gray-500">
                      {address?.mobileNumber || address?.alternatePhone || order?.user?.phone || '-'}
                    </p>
                  </div>
                  <div className="rounded-xl border p-3">
                    <h4 className="mb-2 text-sm font-semibold text-gray-900">Shipping Address</h4>
                    {address ? (
                      <div className="space-y-0.5 text-sm text-gray-700">
                        <p>{address.fullName}</p>
                        <p>{address.mobileNumber || address.alternatePhone}</p>
                        <p>{address.address}</p>
                        <p>
                          {[address.locality, address.city, address.state].filter(Boolean).join(', ')}
                          {address.pincode ? ` - ${address.pincode}` : ''}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No shipping address found.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border">
                  <div className="border-b px-3 py-2 text-sm font-semibold">Ordered Items</div>
                  <div className="divide-y">
                    {(order.items || []).map((item, idx) => {
                      const product = item.product || {};
                      const title = item.name || product.title || 'Product';
                      const image =
                        item.image ||
                        (Array.isArray(product.images) ? product.images[0] : '') ||
                        product.images?.image1 ||
                        '';
                      return (
                        <div key={`${idx}-${item._id || product?._id || 'item'}`} className="flex gap-3 p-3">
                          <div className="h-14 w-14 overflow-hidden rounded border bg-gray-50">
                            {image ? (
                              <img src={image} alt={title} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">{title}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity || 1}
                              {item.size ? ` • Size: ${item.size}` : ''}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatINR((item.price || 0) * (item.quantity || 1))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border p-3">
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">Price Details</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Items Price</span>
                      <span>{formatINR(itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatINR(taxPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{formatINR(shippingPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>- {formatINR(discount)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-base font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatINR(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
