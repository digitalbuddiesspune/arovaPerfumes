import React, { useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import OrderTable, {
  formatDate,
  getCustomerPhone,
  getOrderStatusLabel,
  getPaymentStatus,
  getProductSummary,
  getQty,
  getTotal,
  getTransactionId,
} from './OrderTable';
import { formatDisplayOrderId } from '../../utils/orderId';

const PAGE_SIZE = 12;

const AdminOrders = () => {
  const navigate = useNavigate();
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
    return () => {
      mounted = false;
    };
  }, []);

  const showToast = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
  };

  const getBucket = (order) => {
    const label = getOrderStatusLabel(order).toLowerCase();
    if (label === 'pending') return 'pending';
    if (label === 'confirmed') return 'confirmed';
    if (label === 'shipping') return 'shipping';
    if (label === 'delivered') return 'delivered';
    if (label === 'cancelled') return 'cancelled';
    if (label === 'returned') return 'returned';
    return 'pending';
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

  const statusCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };
    orders.forEach((order) => {
      const bucket = getBucket(order);
      if (counts[bucket] != null) counts[bucket] += 1;
    });
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const statusOk = orderStatus === 'all' || getBucket(order) === orderStatus;
      const payOk = paymentStatus === 'all' || getPaymentStatus(order) === paymentStatus;
      const dateOk = filterByDate(order.createdAt);

      if (!statusOk || !payOk || !dateOk) return false;
      if (!q) return true;

      const productText = (order.items || [])
        .map((item) => `${item.name || ''} ${item.product?.title || ''}`)
        .join(' ');
      const text = [
        order.user?.name,
        order.user?.email,
        order.user?.phone,
        getCustomerPhone(order),
        order._id,
        formatDisplayOrderId(order),
        productText,
        getTransactionId(order),
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(q);
    });
  }, [orders, search, orderStatus, paymentStatus, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, orderStatus, paymentStatus, dateFrom, dateTo]);

  const openDetails = (order) => {
    if (!order?._id) return;
    navigate(`/admin/orders/${order._id}`);
  };

  const handleDelete = async (order) => {
    if (!order?._id) return;
    const ok = window.confirm(`Cancel order #${formatDisplayOrderId(order)}?`);
    if (!ok) return;

    const backup = { ...order };
    setUpdatingId(order._id);
    setOrders((prev) =>
      prev.map((item) =>
        item._id === order._id ? { ...item, orderStatus: 'cancelled', status: 'cancelled' } : item
      )
    );

    try {
      const updated = await api.admin.updateOrder(order._id, { orderStatus: 'cancelled' });
      setOrders((prev) => prev.map((item) => (item._id === order._id ? updated : item)));
      showToast('Order cancelled.');
    } catch (e) {
      setOrders((prev) => prev.map((item) => (item._id === order._id ? backup : item)));
      showToast(e.message || 'Failed to cancel order', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  const downloadXls = () => {
    const rows = [
      ['Order ID', 'Customer', 'Phone', 'Products', 'Qty', 'Price', 'Status', 'Payment', 'Transaction ID', 'Date'],
      ...filtered.map((order) => [
        `#${formatDisplayOrderId(order)}`,
        order?.user?.name || order?.address?.fullName || 'Customer',
        getCustomerPhone(order) || '',
        getProductSummary(order),
        getQty(order),
        getTotal(order),
        getOrderStatusLabel(order),
        getPaymentStatus(order),
        getTransactionId(order),
        formatDate(order.createdAt),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? '');
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      {toast.show && (
        <div
          className={`${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'} fixed bottom-4 right-4 z-50 rounded-lg px-4 py-2 text-white shadow-lg`}
        >
          {toast.text}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, product, customer, or phone..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400"
          />
        </div>

        <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-end">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Start Date
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-400"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              End Date
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-400"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Order Status
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-400"
              >
                <option value="all">All Status ({statusCounts.all})</option>
                <option value="pending">Pending ({statusCounts.pending})</option>
                <option value="confirmed">Confirmed ({statusCounts.confirmed})</option>
                <option value="shipping">Shipping ({statusCounts.shipping})</option>
                <option value="delivered">Delivered ({statusCounts.delivered})</option>
                <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
                <option value="returned">Returned ({statusCounts.returned})</option>
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Payment Status
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-400"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={downloadXls}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
          >
            <Download className="h-4 w-4" />
            Download XLS
          </button>
        </div>
      </div>

      {error ? <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

      <OrderTable
        loading={loading}
        orders={pageItems}
        deletingId={updatingId}
        onView={openDetails}
        onDelete={handleDelete}
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      />
    </div>
  );
};

export default AdminOrders;
