import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import OrderTable from './OrderTable';
import OrderDetailsModal from './OrderDetailsModal';
import { formatDisplayOrderId } from '../../utils/orderId';

const ORDER_STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUS_OPTIONS = ['all', 'paid', 'unpaid'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.admin.listOrders();
        if (mounted) setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Failed to load orders');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const normalizedStatus = (o) => String(o.orderStatus || o.status || 'pending').toLowerCase();
  const normalizedPaymentStatus = (o) => (String(o.paymentStatus || '').toLowerCase() === 'paid' ? 'paid' : 'unpaid');

  const showToast = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
  };

  const filterByDate = (createdAt) => {
    if (!createdAt) return true;
    const ts = new Date(createdAt).getTime();
    if (dateFrom && ts < new Date(dateFrom).getTime()) return false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (ts > end.getTime()) return false;
    }
    return true;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const statusOk = orderStatus === 'all' || normalizedStatus(o) === orderStatus;
      const payOk = paymentStatus === 'all' || normalizedPaymentStatus(o) === paymentStatus;
      const dateOk = filterByDate(o.createdAt);
      const text = `${o.user?.name || ''} ${o.user?.email || ''} ${o._id || ''} ${formatDisplayOrderId(o)}`.toLowerCase();
      const searchOk = !q || text.includes(q);
      return statusOk && payOk && dateOk && searchOk;
    });
  }, [orders, search, orderStatus, paymentStatus, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const pageItems = useMemo(() => {
    const start = (page - 1) * 10;
    return filtered.slice(start, start + 10);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, orderStatus, paymentStatus, dateFrom, dateTo]);

  const updateStatus = async (order, nextStatus) => {
    if (!order?._id || normalizedStatus(order) === nextStatus) return;
    const backup = { ...order };
    setUpdatingId(order._id);
    setOrders((prev) => prev.map((item) => (item._id === order._id ? { ...item, orderStatus: nextStatus, status: nextStatus } : item)));
    try {
      const updated = await api.admin.updateOrder(order._id, { orderStatus: nextStatus });
      setOrders((prev) => prev.map((item) => (item._id === order._id ? updated : item)));
      showToast('Order status updated.');
    } catch (e) {
      setOrders((prev) => prev.map((item) => (item._id === order._id ? backup : item)));
      showToast(e.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  const openDetails = async (order) => {
    if (!order?._id) return;
    setSelectedOrder(order);
    setDetailsLoading(true);
    setDetailsError('');
    try {
      const details = await api.admin.getOrder(order._id);
      setSelectedOrder(details);
    } catch (e) {
      setDetailsError(e.message || 'Failed to load order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {toast.show && (
        <div className={`${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'} fixed bottom-4 right-4 z-50 rounded-lg px-4 py-2 text-white shadow-lg`}>
          {toast.text}
        </div>
      )}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID / Customer"
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all'
                  ? 'All Status'
                  : status === 'confirmed'
                  ? 'Processing'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'Payment: All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
        </div>
      </div>

      {error ? <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

      <OrderTable
        loading={loading}
        orders={pageItems}
        statusSavingId={updatingId}
        onStatusChange={updateStatus}
        onView={openDetails}
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      />

      <OrderDetailsModal
        order={selectedOrder}
        loading={detailsLoading}
        error={detailsError}
        onClose={() => {
          setSelectedOrder(null);
          setDetailsError('');
        }}
      />
    </div>
  );
};

export default AdminOrders;