import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { formatDisplayOrderId } from '../../utils/orderId';

const AROVA_LOGO_URL = '/arova-logo.png';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const getPhone = (order) =>
  order?.shippingAddress?.mobileNumber ||
  order?.address?.mobileNumber ||
  order?.shippingAddress?.alternatePhone ||
  order?.address?.alternatePhone ||
  order?.user?.phone ||
  '-';

const paymentLabel = (order) => {
  if (order?.isPaid === true || String(order?.paymentStatus || '').toLowerCase() === 'paid') return 'Paid';
  return 'Unpaid';
};

const statusLabel = (order) => {
  const raw = String(order?.orderStatus || order?.status || 'pending').toLowerCase();
  if (raw === 'pending' || raw === 'created') return 'Pending';
  if (raw === 'confirmed' || raw === 'packed' || raw === 'processing' || raw === 'paid') return 'Confirmed';
  if (raw === 'shipped' || raw === 'on_the_way') return 'Shipping';
  if (raw === 'delivered') return 'Delivered';
  if (raw === 'cancelled' || raw === 'failed') return 'Cancelled';
  if (raw === 'returned') return 'Returned';
  return raw;
};

const AdminOrderInvoice = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.admin.getOrder(id);
        if (mounted) setOrder(data);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load invoice');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const address = order?.shippingAddress || order?.address;

  const itemsTotal = useMemo(() => {
    if (!order?.items) return Number(order?.itemsPrice || 0);
    return order.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  }, [order]);

  const shippingPrice = Number(order?.shippingPrice ?? order?.priceDetails?.shippingPrice ?? 0);
  const discount = Number(order?.discount ?? order?.couponDiscount ?? order?.priceDetails?.discount ?? 0);
  const taxPrice = Number(order?.taxPrice ?? order?.priceDetails?.taxPrice ?? 0);
  const totalAmount = Number(
    order?.totalPrice ?? order?.amount ?? itemsTotal + shippingPrice + taxPrice - discount
  );

  const paymentMode =
    String(order?.paymentMethod || 'cod').toLowerCase() === 'razorpay' ? 'Online (Razorpay)' : 'Cash / COD';

  const invoiceNo = order ? `INV-${formatDisplayOrderId(order)}` : '';
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const text = `Arova Bill / Invoice ${invoiceNo}\nOrder #${formatDisplayOrderId(order)}\nTotal: ${formatINR(totalAmount)}\nPayment: ${paymentLabel(order)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Bill Invoice ${invoiceNo}`, text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast('Invoice details copied');
      }
    } catch {
      showToast('Unable to share');
    }
  };

  if (loading) return <div className="p-4 text-sm text-gray-600">Loading bill / invoice...</div>;
  if (error) return <div className="p-4 text-sm text-rose-600">{error}</div>;
  if (!order) return <div className="p-4 text-sm text-gray-600">Order not found</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
      {toast ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg print:hidden">
          {toast}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bill / Invoice</h1>
          <Link to={`/admin/orders/${id}`} className="mt-1 inline-flex text-sm text-orange-500 hover:text-orange-600">
            ← Back to Order
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Share
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Print / Download
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <img
              src={`${AROVA_LOGO_URL}?v=2`}
              alt="AROVA — from earth to essence"
              className="h-14 w-auto object-contain sm:h-16"
            />
            <p className="mt-2 text-sm font-medium text-gray-600">Bill / Tax Invoice</p>
            <p className="mt-1 text-xs text-gray-500">Atraya Lifestyle Private Limited</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500">Invoice No.</p>
            <p className="text-lg font-semibold text-gray-900">{invoiceNo}</p>
            <p className="mt-2 text-sm text-gray-500">Date: {orderDate}</p>
            <p className="text-sm text-gray-500">Order ID: #{formatDisplayOrderId(order)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 border-b border-gray-200 pb-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bill To</p>
            <p className="mt-2 font-semibold text-gray-900">
              {order?.user?.name || address?.fullName || 'Customer'}
            </p>
            <p className="text-sm text-gray-600">{getPhone(order)}</p>
            <p className="text-sm text-gray-600">{order?.user?.email || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ship To</p>
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
              <p className="mt-2 text-sm text-gray-500">No address</p>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-b border-gray-200 pb-5 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500">Order Status</p>
            <p className="mt-1 font-medium capitalize text-gray-900">{statusLabel(order)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Payment Status</p>
            <p className="mt-1 font-medium text-gray-900">{paymentLabel(order)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Payment Mode</p>
            <p className="mt-1 font-medium text-gray-900">{paymentMode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Transaction</p>
            <p className="mt-1 break-all font-medium text-gray-900">
              {order.razorpayPaymentId || order.transactionId || '-'}
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">Variant</th>
                <th className="py-2 pr-3">Qty</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => {
                const title = item.name || item.product?.title || 'Product';
                const qty = Number(item.quantity || 1);
                const price = Number(item.price || 0);
                return (
                  <tr key={`${idx}-${title}`} className="border-b border-gray-100">
                    <td className="py-3 pr-3 text-gray-500">{idx + 1}</td>
                    <td className="py-3 pr-3 font-medium text-gray-900">{title}</td>
                    <td className="py-3 pr-3 text-gray-600">{item.size || '—'}</td>
                    <td className="py-3 pr-3 text-gray-700">{qty}</td>
                    <td className="py-3 pr-3 text-gray-700">{formatINR(price)}</td>
                    <td className="py-3 text-right font-medium text-gray-900">{formatINR(price * qty)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex justify-end">
          <div className="w-full max-w-sm space-y-2 text-sm text-gray-700">
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
              <span>Delivery</span>
              <span>{formatINR(shippingPrice)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
              <span>Total Amount</span>
              <span>{formatINR(totalAmount)}</span>
            </div>
            {order.couponCode ? (
              <p className="text-xs text-emerald-600">Coupon: {order.couponCode}</p>
            ) : null}
            <p className="text-xs text-gray-500">This document serves as Bill and Tax Invoice.</p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          Thank you for shopping with Arova — From Earth to Essence.
        </div>
      </div>
    </div>
  );
};

export default AdminOrderInvoice;
