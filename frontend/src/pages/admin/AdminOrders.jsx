import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { formatDisplayOrderId } from '../../utils/orderId';

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const paymentStatusClass = (status) => {
  const s = String(status || 'pending').toLowerCase();
  if (s === 'paid') return 'bg-green-100 text-green-700 border border-green-200';
  if (s === 'failed') return 'bg-rose-100 text-rose-700 border border-rose-200';
  if (s === 'refunded') return 'bg-blue-100 text-blue-700 border border-blue-200';
  return 'bg-gray-100 text-gray-700 border border-gray-200';
};

const orderStatusClass = (status) => {
  const s = String(status || 'pending').toLowerCase();
  if (s === 'pending') return 'bg-amber-100 text-amber-700 border border-amber-200';
  if (s === 'confirmed') return 'bg-blue-100 text-blue-700 border border-blue-200';
  if (s === 'packed') return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
  if (s === 'shipped') return 'bg-sky-100 text-sky-700 border border-sky-200';
  if (s === 'delivered') return 'bg-green-100 text-green-700 border border-green-200';
  if (s === 'returned') return 'bg-purple-100 text-purple-700 border border-purple-200';
  if (s === 'cancelled') return 'bg-rose-100 text-rose-700 border border-rose-200';
  return 'bg-gray-100 text-gray-700 border border-gray-200';
};

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const getOrderTotal = (order = {}) => {
  const candidates = [
    order.totalPrice,
    order.priceDetails?.totalPrice,
    order.amount,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  const items = Array.isArray(order.items) ? order.items : [];
  return items.reduce((sum, item) => sum + (Number(item?.price || 0) * Number(item?.quantity || 1)), 0);
};
const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

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
  const [pageSize, setPageSize] = useState(10);
  const [statusDrafts, setStatusDrafts] = useState({});
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
    return () => { mounted = false; };
  }, []);

  const normalizedStatus = (o) => o.orderStatus || o.status || 'pending';
  const normalizedPaymentStatus = (o) => o.paymentStatus || (o.status === 'failed' ? 'failed' : o.status === 'paid' ? 'paid' : 'pending');
  const normalizedPaymentMethod = (o) => (o.paymentMethod || (o.razorpayPaymentId ? 'razorpay' : 'cod')).toUpperCase();

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

  const metrics = useMemo(() => {
    const total = filtered.length;
    const pending = filtered.filter((o) => normalizedStatus(o) === 'pending').length;
    const shipped = filtered.filter((o) => ['shipped', 'delivered'].includes(normalizedStatus(o))).length;
    const paid = filtered.filter((o) => normalizedPaymentStatus(o) === 'paid').length;
    return { total, pending, shipped, paid };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, orderStatus, paymentStatus, pageSize, dateFrom, dateTo]);

  const renderAddress = (a) => {
    if (!a) return <span className="text-gray-400">No address</span>;
    return (
      <div className="max-w-xs">
        <div className="font-medium">{a.fullName}</div>
        <div className="text-gray-600 text-xs">{a.mobileNumber || a.alternatePhone}</div>
        <div className="text-gray-700 text-sm line-clamp-2">{a.address}{a.landmark ? `, ${a.landmark}` : ''}</div>
        <div className="text-gray-500 text-xs">{a.city}, {a.state} - {a.pincode}</div>
      </div>
    );
  };

  const draftStatus = (id, fallback) => statusDrafts[id] ?? normalizedStatus(fallback || {});

  const saveStatus = async (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;
    const nextStatus = draftStatus(orderId, order);
    if (nextStatus === normalizedStatus(order)) return;

    setUpdatingId(orderId);
    setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: nextStatus, status: nextStatus } : o));

    try {
      const updated = await api.admin.updateOrder(orderId, { orderStatus: nextStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? updated : o));
      showToast('Order status updated');
    } catch (e) {
      setOrders((prev) => prev.map((o) => o._id === orderId ? order : o));
      showToast(e.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  const quickAction = async (orderId, action) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;
    setUpdatingId(orderId);
    try {
      const updated = await api.admin.updateOrder(orderId, { action, ...(action === 'refund' ? { paymentStatus: 'refunded' } : {}) });
      setOrders((prev) => prev.map((o) => o._id === orderId ? updated : o));
      showToast(action === 'refund' ? 'Order refunded' : 'Order cancelled');
    } catch (e) {
      showToast(e.message || 'Update failed', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {toast.show && (
        <div className={`${toast.type==='error' ? 'bg-rose-600' : 'bg-amber-600'} fixed bottom-4 right-4 z-50 text-white px-4 py-2 rounded shadow-lg`}>
          {toast.text}
        </div>
      )}
      {loading ? (
        <div className="p-4">Loading...</div>
      ) : error ? (
        <div className="p-4 text-red-600">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 uppercase tracking-wide">Orders</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{metrics.total}</div>
            </div>
            <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 uppercase tracking-wide">Pending</div>
              <div className="text-xl font-semibold text-amber-600 mt-1">{metrics.pending}</div>
            </div>
            <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 uppercase tracking-wide">Shipped</div>
              <div className="text-xl font-semibold text-cyan-600 mt-1">{metrics.shipped}</div>
            </div>
            <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 uppercase tracking-wide">Paid</div>
              <div className="text-xl font-semibold text-emerald-600 mt-1">{metrics.paid}</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50/70">
              <div className="flex flex-col xl:flex-row xl:items-center gap-2 xl:gap-3">
                <select className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 min-w-[145px]">
                  <option>Order number</option>
                </select>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order number"
                className="h-9 border border-gray-200 rounded-lg px-3 w-full xl:max-w-[240px] text-sm"
              />
                <input
                  type="date"
                  className="h-9 border border-gray-200 rounded-lg px-3 text-sm"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <input
                  type="date"
                  className="h-9 border border-gray-200 rounded-lg px-3 text-sm"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
                <select className="h-9 border border-gray-200 rounded-lg px-3 text-sm" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                  <option value="all">All Order Status</option>
                  {ORDER_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select className="h-9 border border-gray-200 rounded-lg px-3 text-sm" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                  <option value="all">Payment: All</option>
                  {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rows</span>
                  <select className="h-9 border border-gray-200 rounded-lg px-2 text-sm" value={pageSize} onChange={(e)=>setPageSize(Number(e.target.value))}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setOrderStatus('all');
                    setPaymentStatus('all');
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y">
            {pageItems.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">No orders found for selected filters.</div>
            )}
            {pageItems.map((o) => (
              <div key={o._id} className="p-3 space-y-2 bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">#{formatDisplayOrderId(o)}</div>
                  <div className="text-sm font-semibold">{formatINR(getOrderTotal(o))}</div>
                </div>
                <div className="text-sm text-gray-800">{o.user?.name}</div>
                <div className="text-xs text-gray-500">{o.user?.email}</div>
                <div className="text-xs text-gray-500">
                  <div>{new Date(o.createdAt).toLocaleDateString('en-GB')}</div>
                  <div className="text-gray-400">{new Date(o.createdAt).toLocaleTimeString('en-GB')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${orderStatusClass(normalizedStatus(o))}`}>
                    {String(normalizedStatus(o)).replace(/_/g, ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusClass(normalizedPaymentStatus(o))}`}>
                    {String(normalizedPaymentStatus(o)).replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-gray-600 border rounded px-2 py-0.5">{normalizedPaymentMethod(o)}</span>
                </div>
                <select
                  className="border rounded-lg px-2 py-2 text-sm w-full"
                  value={draftStatus(o._id, o)}
                  onChange={(e) => setStatusDrafts((prev) => ({ ...prev, [o._id]: e.target.value }))}
                >
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => navigate(`/admin/orders/${o._id}`)}
                    className="px-3 py-1.5 rounded border text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => saveStatus(o._id)}
                    disabled={updatingId === o._id || draftStatus(o._id, o) === normalizedStatus(o)}
                    className={`px-3 py-1.5 rounded text-white text-sm ${updatingId===o._id ? 'bg-gray-400' : 'bg-rose-600 hover:bg-rose-700'} disabled:opacity-60`}
                  >
                    {updatingId === o._id ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full table-fixed text-[13px]">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[6%]" />
                <col className="w-[10%]" />
                <col className="w-[16%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-left border-b border-gray-200">
                  <th className="px-3 py-2.5 font-semibold truncate">Order ID</th>
                  <th className="px-2 py-2.5 font-semibold truncate">From</th>
                  <th className="px-2 py-2.5 font-semibold truncate">To</th>
                  <th className="px-2 py-2.5 font-semibold truncate">Full Name</th>
                  <th className="px-2 py-2.5 font-semibold truncate">Status</th>
                  <th className="px-2 py-2.5 font-semibold truncate">Total Price</th>
                  <th className="px-2 py-2.5 font-semibold truncate">Payment Method</th>
                  <th className="px-2 py-2.5 font-semibold truncate">Creation Date</th>
                  <th className="px-2 py-2.5 font-semibold truncate">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      No orders found for selected filters.
                    </td>
                  </tr>
                )}
                {pageItems.map((o) => (
                  <tr key={o._id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2.5 whitespace-nowrap font-semibold text-slate-800 truncate">#{formatDisplayOrderId(o)}</td>
                    <td className="px-2 py-2.5 text-slate-500 truncate">WH</td>
                    <td className="px-2 py-2.5 text-slate-700 truncate">{o.address?.city || o.shippingAddress?.city || '-'}</td>
                    <td className="px-2 py-2.5">
                      <div className="truncate text-slate-800">{o.user?.name || o.address?.fullName || 'Customer'}</div>
                    </td>
                    <td className="px-2 py-2.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium truncate max-w-full ${orderStatusClass(normalizedStatus(o))}`}>
                        {String(normalizedStatus(o)).replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap text-slate-800 font-medium truncate">{formatINR(getOrderTotal(o))}</td>
                    <td className="px-2 py-2.5 text-slate-700 truncate">{normalizedPaymentMethod(o)}</td>
                    <td className="px-2 py-2.5 whitespace-nowrap text-slate-500 truncate">{formatDateTime(o.createdAt)}</td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <select
                          className="h-8 min-w-[86px] flex-1 border border-slate-200 rounded-md px-2 text-[11px] bg-white"
                          value={draftStatus(o._id, o)}
                          onChange={(e) => setStatusDrafts((prev) => ({ ...prev, [o._id]: e.target.value }))}
                        >
                          {ORDER_STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveStatus(o._id)}
                          disabled={updatingId===o._id || draftStatus(o._id, o)===normalizedStatus(o)}
                          className={`h-8 min-w-[52px] px-2.5 rounded-md text-white text-[11px] font-medium ${updatingId===o._id ? 'bg-slate-400' : 'bg-slate-700 hover:bg-slate-800'} disabled:opacity-60`}
                        >
                          {updatingId===o._id ? '...' : 'Save'}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/orders/${o._id}`)}
                          className="h-8 min-w-[52px] px-2.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Showing {pageItems.length} of {filtered.length} filtered orders
            </div>
            <div className="flex gap-2">
              <button
                disabled={page<=1}
                onClick={()=>setPage(p=>Math.max(1,p-1))}
                className={`h-8 px-3 rounded-lg border text-sm ${page<=1? 'text-gray-400 bg-gray-50 border-gray-200' : 'hover:bg-gray-100 border-gray-200 text-gray-700'}`}
              >
                Prev
              </button>
              <button
                disabled={page>=totalPages}
                onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
                className={`h-8 px-3 rounded-lg border text-sm ${page>=totalPages? 'text-gray-400 bg-gray-50 border-gray-200' : 'hover:bg-gray-100 border-gray-200 text-gray-700'}`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;