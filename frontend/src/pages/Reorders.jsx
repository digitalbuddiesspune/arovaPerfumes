import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRedo, FaUndo } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { getMyOrders } from '../services/api';

const authToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

const formatOrderDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

function Reorders() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [pastOrders, setPastOrders] = useState([]);
  const [pastOrdersLoading, setPastOrdersLoading] = useState(false);
  const [reorderingOrderId, setReorderingOrderId] = useState(null);

  const loadPastOrders = useCallback(async () => {
    if (!authToken()) {
      setPastOrders([]);
      return;
    }
    setPastOrdersLoading(true);
    try {
      const data = await getMyOrders();
      const list = data?.orders || (Array.isArray(data) ? data : []);
      const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPastOrders(sorted.slice(0, 20));
    } catch {
      setPastOrders([]);
    } finally {
      setPastOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPastOrders();
  }, [loadPastOrders]);

  const handleReorder = async (order) => {
    const oid = order?._id;
    if (!oid || !Array.isArray(order.items) || order.items.length === 0) return;
    setReorderingOrderId(oid);
    const failed = [];
    try {
      for (const it of order.items) {
        const pid = it.productId || it.product?._id || it.product;
        if (!pid) continue;
        try {
          await addToCart(String(pid), Number(it.quantity) || 1, it.size || null);
        } catch {
          failed.push(it.name || 'Item');
        }
      }
      if (failed.length) {
        window.alert(`Some items could not be added: ${failed.join(', ')}`);
      } else {
        navigate('/cart');
      }
    } finally {
      setReorderingOrderId(null);
    }
  };

  const handleReturnClick = (order) => {
    const ref = order?.orderId || String(order?._id || '').slice(-8).toUpperCase();
    navigate(`/contact?topic=return&order=${encodeURIComponent(ref)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="text-gray-700 hover:text-gray-900 cursor-pointer"
            aria-label="Back to cart"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Reorders</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="px-4 max-w-7xl mx-auto pt-4">
        <h2 className="text-sm font-semibold tracking-wide text-gray-900 mb-1">Your previous orders</h2>
        <p className="text-xs text-gray-500 mb-3">
          Click reorder to add all items from that order to cart. Returns open contact with your order reference.
        </p>

        {!authToken() ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-center text-sm text-gray-600">
            <p className="mb-3">Sign in to see your reorders.</p>
            <button
              type="button"
              onClick={() => navigate('/signin', { state: { from: { pathname: '/reorders' } } })}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800"
            >
              Sign in
            </button>
          </div>
        ) : pastOrdersLoading ? (
          <div className="text-sm text-gray-500 py-4">Loading your orders...</div>
        ) : pastOrders.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">No past orders yet.</div>
        ) : (
          <div className="space-y-3">
            {pastOrders.map((order) => {
              const orderRef = order.orderId || String(order._id || '').slice(-8).toUpperCase();
              const busy = reorderingOrderId === order._id;
              const cancelled = String(order.orderStatus || '').toLowerCase() === 'cancelled';
              return (
                <div
                  key={order._id}
                  className={`rounded-lg border bg-white p-3 sm:p-4 shadow-sm ${cancelled ? 'opacity-75 border-gray-200' : 'border-gray-200'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Order #{orderRef}
                        <span className="font-normal text-gray-500"> · {formatOrderDate(order.createdAt)}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">
                        {(order.orderStatus || order.status || 'pending').replace(/_/g, ' ')}
                        {order.priceDetails?.totalPrice != null && (
                          <span className="text-gray-400"> · ₹{Number(order.priceDetails.totalPrice).toLocaleString('en-IN')}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={busy || cancelled || !order.items?.length}
                        onClick={() => handleReorder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-900 bg-gray-900 text-white text-xs font-semibold hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FaRedo className="w-3 h-3" />
                        {busy ? 'Adding...' : 'Reorder'}
                      </button>
                      <button
                        type="button"
                        disabled={cancelled}
                        onClick={() => handleReturnClick(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-900 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FaUndo className="w-3 h-3" />
                        Return
                      </button>
                    </div>
                  </div>
                  <ul className="mt-2 divide-y divide-gray-100 border-t border-gray-100 pt-2">
                    {(order.items || []).map((line, idx) => (
                      <li key={`${order._id}-${idx}-${line.productId || line.name}`} className="flex gap-2 py-1.5 text-xs text-gray-700">
                        <div className="w-10 h-10 rounded bg-gray-100 shrink-0 overflow-hidden">
                          <img
                            src={line.image || '/no-image.png'}
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/no-image.png';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{line.name}</p>
                          <p className="text-gray-500">
                            Qty {line.quantity || 1}
                            {line.size ? ` · ${line.size}` : ''}
                            {line.price != null ? ` · ₹${Number(line.price).toLocaleString('en-IN')} each` : ''}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reorders;
