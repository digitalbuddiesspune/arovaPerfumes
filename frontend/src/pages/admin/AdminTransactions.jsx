import React, { useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { api } from '../../utils/api';
import { formatDisplayOrderId } from '../../utils/orderId';
import TransactionDetailsModal, {
  getOrderStatusLabel,
  getPaymentMeta,
  getPhone,
} from './TransactionDetailsModal';

const PAGE_SIZE = 15;

const isSuccessfulRazorpay = (order) => {
  const paymentId = order?.razorpayPaymentId || order?.transactionId || '';
  const hasRazorpayId =
    String(paymentId).startsWith('pay_') ||
    Boolean(order?.razorpayPaymentId) ||
    Boolean(order?.razorpayOrderId);
  const paid =
    order?.isPaid === true ||
    String(order?.paymentStatus || '').toLowerCase() === 'paid' ||
    String(order?.status || '').toLowerCase() === 'paid';
  return hasRazorpayId && paid;
};

const getProductText = (order = {}) =>
  (order.items || []).map((item) => item.name || item.product?.title || '').join(' ');

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const AdminTransactions = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.admin.listOrders();
        const list = Array.isArray(data) ? data : [];
        if (mounted) setOrders(list.filter(isSuccessfulRazorpay));
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load transactions');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getBucket = (order) => getOrderStatusLabel(order).toLowerCase();

  const filterByDate = (dateValue) => {
    if (!dateValue) return true;
    const ts = new Date(dateValue).getTime();
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
    return orders.filter((order) => {
      const statusOk = orderStatus === 'all' || getBucket(order) === orderStatus;
      const dateOk = filterByDate(order.paidAt || order.createdAt);
      if (!statusOk || !dateOk) return false;
      if (!q) return true;

      const text = [
        formatDisplayOrderId(order),
        order._id,
        order.user?.name,
        order.user?.email,
        getPhone(order),
        order.razorpayPaymentId,
        order.razorpayOrderId,
        order.transactionId,
        getProductText(order),
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(q);
    });
  }, [orders, search, orderStatus, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, orderStatus, dateFrom, dateTo]);

  const openDetails = async (order) => {
    if (!order?._id) return;
    setSelectedOrder(order);
    setDetailsLoading(true);
    setDetailsError('');
    try {
      const details = await api.admin.getOrder(order._id);
      setSelectedOrder(details);
    } catch (e) {
      setDetailsError(e.message || 'Failed to load payment details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const downloadXls = () => {
    const rows = [
      ['Order ID', 'Customer', 'Phone', 'Razorpay ID', 'Amount', 'Type', 'Status', 'Date'],
      ...filtered.map((order) => {
        const meta = getPaymentMeta(order);
        return [
          `#${formatDisplayOrderId(order)}`,
          order?.user?.name || order?.shippingAddress?.fullName || 'Customer',
          getPhone(order),
          order.razorpayPaymentId || order.transactionId || '-',
          meta.amountCharged,
          meta.paymentType,
          getOrderStatusLabel(order),
          formatDate(order.paidAt || order.createdAt),
        ];
      }),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `razorpay-transactions-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {filtered.length} successful Razorpay transactions
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Only verified Razorpay payments are shown here with the actual amount charged.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, Razorpay ID, product, or customer..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400"
          />
        </div>

        <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-end">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Start Date
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              End Date
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Order Status
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="all">All Status</option>
                <option value="attempted">Attempted</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipping">Shipping</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="animate-pulse space-y-3 p-4">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="h-12 rounded bg-gray-100" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-left text-xs font-semibold uppercase tracking-wide text-white">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Razorpay ID</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                        No successful Razorpay transactions found
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((order) => {
                      const meta = getPaymentMeta(order);
                      return (
                        <tr key={order._id} className="border-t border-gray-100 hover:bg-orange-50/30">
                          <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                            #{formatDisplayOrderId(order)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900">
                              {order?.user?.name || order?.shippingAddress?.fullName || 'Customer'}
                            </p>
                            <p className="text-xs text-gray-500">{getPhone(order)}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            {order.razorpayPaymentId || order.transactionId || '-'}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                            ₹{Number(meta.amountCharged || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{meta.paymentType}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {formatDate(order.paidAt || order.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => openDetails(order)}
                              className="rounded-md border border-orange-400 px-3 py-1.5 text-sm font-medium text-orange-500 hover:bg-orange-50"
                            >
                              View
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <TransactionDetailsModal
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

export default AdminTransactions;
