import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { formatDisplayOrderId } from '../../utils/orderId';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const normalizeStatus = (order) => {
  const raw = String(order?.orderStatus || order?.status || 'pending').toLowerCase();
  if (raw === 'created' || raw === 'pending') return 'pending';
  if (raw === 'paid' || raw === 'processing') return 'confirmed';
  if (raw === 'on_the_way') return 'shipped';
  if (raw === 'failed') return 'cancelled';
  return raw;
};

const paymentLabel = (order) => {
  if (order?.isPaid === true || String(order?.paymentStatus || '').toLowerCase() === 'paid') return 'paid';
  return 'unpaid';
};

const getPhone = (order) =>
  order?.shippingAddress?.mobileNumber ||
  order?.address?.mobileNumber ||
  order?.shippingAddress?.alternatePhone ||
  order?.address?.alternatePhone ||
  order?.user?.phone ||
  '-';

const getItemImage = (item) => {
  if (item?.image) return item.image;
  const product = item?.product || {};
  if (Array.isArray(product.images)) return product.images[0]?.url || product.images[0] || '';
  return product.images?.image1 || '';
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.admin.getOrder(id);
        if (!mounted) return;
        setOrder(data);
      } catch (e) {
        setError(e.message || 'Failed to load order');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const address = order?.shippingAddress || order?.address;
  const currentStatus = normalizeStatus(order);
  const payStatus = paymentLabel(order);
  const paymentMode = String(order?.paymentMethod || 'cod').toLowerCase() === 'razorpay' ? 'online' : 'cash';

  const itemsTotal = useMemo(() => {
    if (!order?.items) return Number(order?.itemsPrice || 0);
    return order.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  }, [order]);

  const shippingPrice = Number(order?.shippingPrice ?? order?.priceDetails?.shippingPrice ?? 0);
  const discount = Number(order?.discount ?? order?.couponDiscount ?? order?.priceDetails?.discount ?? 0);
  const taxPrice = Number(order?.taxPrice ?? order?.priceDetails?.taxPrice ?? 0);
  const totalAmount = Number(order?.totalPrice ?? order?.amount ?? itemsTotal + shippingPrice + taxPrice - discount);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const updateOrder = async (payload) => {
    setSaving(true);
    setError('');
    try {
      const updated = await api.admin.updateOrder(id, payload);
      setOrder(updated);
      showToast('Order updated');
      return updated;
    } catch (e) {
      setError(e.message || 'Update failed');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const setOrderStatus = async (nextStatus) => {
    await updateOrder({ orderStatus: nextStatus });
  };

  const togglePayment = async () => {
    const next = payStatus === 'paid' ? 'pending' : 'paid';
    await updateOrder({ paymentStatus: next });
  };

  const deleteOrder = async () => {
    const ok = window.confirm(`Delete/cancel order #${formatDisplayOrderId(order)}?`);
    if (!ok) return;
    const updated = await updateOrder({ action: 'cancel' });
    if (updated) navigate('/admin/orders');
  };

  if (loading) return <div className="p-4 text-sm text-gray-600">Loading order details...</div>;
  if (error && !order) return <div className="p-4 text-sm text-rose-600">{error}</div>;
  if (!order) return <div className="p-4 text-sm text-gray-600">Order not found</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-10">
      {toast ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Order Details</h1>
          <Link to="/admin/orders" className="mt-1 inline-flex text-sm text-orange-500 hover:text-orange-600">
            ← Orders
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/orders/${id}/invoice`)}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Bill / Invoice
          </button>
          <button
            type="button"
            onClick={deleteOrder}
            disabled={saving}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-60"
          >
            Delete Order
          </button>
        </div>
      </div>

      {error ? <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Order ID</p>
            <p className="mt-1 text-xl font-bold text-gray-900">#{formatDisplayOrderId(order)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Order Status</p>
            <select
              value={currentStatus === 'pending' ? 'pending' : currentStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              disabled={saving}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-orange-400"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Processing</option>
              <option value="shipped">Shipping</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Payment Status</p>
            <button
              type="button"
              onClick={togglePayment}
              disabled={saving}
              className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                payStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {payStatus}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Customer</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {order?.user?.name || address?.fullName || 'Customer'}
              </p>
              <p className="text-sm text-gray-600">{getPhone(order)}</p>
              <p className="text-sm text-gray-500">{order?.user?.email || '-'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatINR(totalAmount)}</p>
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Address</p>
              <span className="text-xs text-gray-400">Edit address</span>
            </div>
            {address ? (
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {[
                  address.fullName,
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
            ) : (
              <p className="mt-2 text-sm text-gray-500">No address found</p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 border-t pt-4 text-sm text-gray-700 sm:grid-cols-3">
            <p>
              <span className="text-gray-500">Payment Mode:</span> {paymentMode}
            </p>
            <p>
              <span className="text-gray-500">Payment Status:</span> {payStatus}
            </p>
            <p>
              <span className="text-gray-500">Items total:</span> {formatINR(itemsTotal)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Billing Summary</h3>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(itemsTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>- {formatINR(discount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax / GST</span>
              <span>{formatINR(taxPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>{formatINR(shippingPrice)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold text-gray-900">
              <span>Total Amount</span>
              <span>{formatINR(totalAmount)}</span>
            </div>
            <p className="text-xs text-gray-500">All prices include GST.</p>
            {order.couponCode ? (
              <p className="text-xs text-emerald-600">Coupon applied: {order.couponCode}</p>
            ) : (
              <p className="text-xs text-gray-400">Apply eligible coupon — only before the order is shipped</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
          <span className="text-xs text-gray-500">{(order.items || []).length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => {
                const title = item.name || item.product?.title || 'Product';
                const qty = Number(item.quantity || 1);
                const price = Number(item.price || 0);
                const img = getItemImage(item);
                return (
                  <tr key={`${idx}-${title}`} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded border bg-gray-50">
                        {img ? <img src={img} alt={title} className="h-full w-full object-cover" /> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{title}</td>
                    <td className="px-4 py-3 text-gray-500">{item.size || '—'}</td>
                    <td className="px-4 py-3 text-gray-800">{qty}</td>
                    <td className="px-4 py-3 text-gray-800">{formatINR(price)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatINR(price * qty)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-2 border-t px-4 py-4 text-sm text-gray-700 sm:grid-cols-3">
          <div className="flex justify-between sm:block">
            <p className="text-gray-500">Subtotal (preview)</p>
            <p className="font-semibold text-gray-900">{formatINR(itemsTotal)}</p>
          </div>
          <div className="flex justify-between sm:block">
            <p className="text-gray-500">Delivery</p>
            <p className="font-semibold text-gray-900">{formatINR(shippingPrice)}</p>
          </div>
          <div className="flex justify-between sm:block">
            <p className="text-gray-500">Total (preview)</p>
            <p className="font-semibold text-gray-900">{formatINR(totalAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
