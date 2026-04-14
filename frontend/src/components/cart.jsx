import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart, FaTimes, FaCheck, FaTicketAlt, FaRedo, FaUndo } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { fetchPricingSettings, getMyOrders } from '../services/api';

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

function Cart() {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [pricingSettings, setPricingSettings] = useState({
    taxPercentage: 5,
    shippingCharge: 50,
    freeShippingMinAmount: 500,
    isFreeShippingEnabled: true
  });
  
  const {
    cart = [],
    updateQuantity,
    removeFromCart,
    cartTotal = 0,
    cartCount = 0,
    clearCart,
    appliedCoupon,
    couponDiscount,
    finalTotal,
    applyCouponCode,
    removeCoupon,
    eligibleCoupons,
    fetchEligibleCoupons,
    revalidatingCoupon,
    addToCart,
  } = useCart();

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
      setPastOrders(sorted.slice(0, 12));
    } catch {
      setPastOrders([]);
    } finally {
      setPastOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPastOrders();
  }, [loadPastOrders]);

  useEffect(() => {
    const onAuth = () => loadPastOrders();
    window.addEventListener('auth:updated', onAuth);
    window.addEventListener('storage', onAuth);
    return () => {
      window.removeEventListener('auth:updated', onAuth);
      window.removeEventListener('storage', onAuth);
    };
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
        } catch (e) {
          failed.push(it.name || 'Item');
        }
      }
      if (failed.length) {
        window.alert(`Some items could not be added (product may no longer be available): ${failed.join(', ')}`);
      } else {
        try {
          window.dispatchEvent(new CustomEvent('app:toast', { detail: { text: `Added order #${order.orderId || ''} to cart`, type: 'success' } }));
        } catch {
          /* ignore */
        }
      }
    } finally {
      setReorderingOrderId(null);
    }
  };

  const handleReturnClick = (order) => {
    const ref = order?.orderId || String(order?._id || '').slice(-8).toUpperCase();
    navigate(`/contact?topic=return&order=${encodeURIComponent(ref)}`);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Fetch pricing settings
    const loadPricingSettings = async () => {
      const settings = await fetchPricingSettings();
      setPricingSettings(settings);
    };
    loadPricingSettings();
  }, []);

  // Clear coupon message after 3 seconds
  useEffect(() => {
    if (couponMessage) {
      const timer = setTimeout(() => setCouponMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [couponMessage]);

  const handleQuantityChange = (itemId, newQuantity) => {
    console.log('Quantity change:', itemId, newQuantity); // Debug log
    
    // Simple validation and update
    if (newQuantity >= 0) {
      updateQuantity(itemId, newQuantity);
    } else {
      // Remove item if quantity goes negative
      removeFromCart(itemId);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: 'error', text: 'Please enter a coupon code' });
      return;
    }
    
    setApplyingCoupon(true);
    const result = await applyCouponCode(couponCode.trim());
    setApplyingCoupon(false);
    
    setCouponMessage({ 
      type: result.success ? 'success' : 'error', 
      text: result.message 
    });
    
    if (result.success) {
      setCouponCode('');
      fetchEligibleCoupons();
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage({ type: 'success', text: 'Coupon removed' });
  };

  // Calculate price details properly
  const calculatePriceDetails = () => {
    // Calculate from cart items directly
    const totalMRP = cart.reduce((sum, item) => {
      const mrp = item.mrp || item.pricing?.mrp || item.originalPrice || 0;
      return sum + (mrp * (item.quantity || 1));
    }, 0);
    
    const totalSalePrice = cart.reduce((sum, item) => {
      const price = item.price || item.pricing?.salePrice || item.salePrice || 0;
      return sum + (price * (item.quantity || 1));
    }, 0);
    
    const youSaved = Math.max(0, totalMRP - totalSalePrice);
    const couponDiscountAmount = couponDiscount || 0;
    const subtotalAfterCoupon = Math.max(0, totalSalePrice - couponDiscountAmount);
    
    // Product-level free delivery override:
    // if all cart products have freeDelivery enabled, shipping is always free.
    const allItemsFreeDelivery =
      cart.length > 0 &&
      cart.every((item) => Boolean(item?.freeDelivery));

    // Dynamic shipping calculation
    let shippingCharge = pricingSettings.shippingCharge;
    if (allItemsFreeDelivery) {
      shippingCharge = 0;
    } else if (pricingSettings.isFreeShippingEnabled && subtotalAfterCoupon >= pricingSettings.freeShippingMinAmount) {
      shippingCharge = 0;
    }
    
    const taxableAmount = subtotalAfterCoupon + shippingCharge;
    // Dynamic tax calculation
    const tax = Math.round(taxableAmount * (pricingSettings.taxPercentage / 100));
    const totalPayable = taxableAmount + tax;

    return {
      totalMRP,
      totalSalePrice,
      youSaved,
      couponDiscount: couponDiscountAmount,
      subtotalAfterCoupon,
      shippingCharge,
      tax,
      total: totalPayable,
      items: cart?.length || 0
    };
  };

  const priceDetails = calculatePriceDetails();
  const getProductId = (item) => item?.id || item?._id || item?.productId;

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Cart</h1>
          <button 
            onClick={clearCart}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cart.length === 0}
            title="Clear Cart"
          >
            <FaTrash className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Clear Cart</span>
          </button>
        </div>
      </div>

      {/* Cart page only: past purchases grouped by order number */}
      <div className="px-4 max-w-7xl mx-auto pt-2 pb-4">
        <h2 className="text-sm font-semibold tracking-wide text-gray-900 mb-1">Your orders</h2>
        <p className="text-xs text-gray-500 mb-3">
          Same order # groups the products you bought. Reorder adds them to this cart; Return opens contact with your order reference.
        </p>
        {!authToken() ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-center text-sm text-gray-600">
            <p className="mb-3">Sign in to see orders you can reorder or request a return from the cart.</p>
            <button
              type="button"
              onClick={() => navigate('/signin', { state: { from: { pathname: '/cart' } } })}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800"
            >
              Sign in
            </button>
          </div>
        ) : pastOrdersLoading ? (
          <div className="text-sm text-gray-500 py-4">Loading your orders…</div>
        ) : pastOrders.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">No past orders yet. After you shop, they will appear here.</div>
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
                        {busy ? 'Adding…' : 'Reorder'}
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

      {cart.length === 0 ? (
        <div className="text-center py-12 px-4">
          <FaShoppingCart className="mx-auto text-5xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 max-w-7xl mx-auto space-y-4">
          <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <FaTicketAlt className="text-gray-600" />
              Available coupons
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Showing only coupons that are currently applicable to this cart.
            </p>
            {Array.isArray(eligibleCoupons) && eligibleCoupons.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {eligibleCoupons.map((c) => {
                  const id = c._id || c.code;
                  const applicable = true;
                  const isApplied = appliedCoupon?.code === c.code;
                  const off =
                    c.discountType === 'percentage'
                      ? `${c.discountValue}% off`
                      : `₹${Number(c.discountValue || 0).toLocaleString('en-IN')} off`;
                  return (
                    <div
                      key={id}
                      className={`rounded-lg border p-3 flex flex-col gap-2 ${
                        applicable ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono font-bold text-gray-900">{c.code}</p>
                          <p className="text-sm text-gray-700">{off}</p>
                          {c.isFirstOrderOnly && (
                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              First order
                            </span>
                          )}
                        </div>
                        {isApplied ? (
                          <span className="shrink-0 text-xs font-semibold text-green-700 flex items-center gap-1">
                            <FaCheck className="w-3 h-3" /> Applied
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={!applicable || applyingCoupon}
                            onClick={async () => {
                              setApplyingCoupon(true);
                              const r = await applyCouponCode(c.code);
                              setApplyingCoupon(false);
                              setCouponMessage({ type: r.success ? 'success' : 'error', text: r.message });
                              if (r.success) fetchEligibleCoupons();
                            }}
                            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md bg-black text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                No applicable coupons for the current cart value.
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Listings - Left Side */}  
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex gap-4">
                    {/* Product Image - Left */}
                    <div className="w-32 h-32 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain cursor-pointer"
                        onError={(e) => {
                          if (e.currentTarget.src.endsWith('/no-image.png')) return;
                          e.currentTarget.src = '/no-image.png';
                        }}
                        onClick={() => {
                          const pid = getProductId(item);
                          if (!pid) return;
                          navigate(`/product/${pid}`);
                        }}
                      />
                    </div>

                    {/* Product Details - Right */}
                    <div className="flex-1 min-w-0">
                      {/* Product Title */}
                      <h3 
                        className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => {
                          const pid = getProductId(item);
                          if (!pid) return;
                          navigate(`/product/${pid}`);
                        }}
                      >
                        {item.name || item.title || 'Product'}
                      </h3>
                      
                      {/* Price Section */}
                      <div className="mb-3">
                        {(() => {
                          const salePrice = item.pricing?.salePrice || item.salePrice || item.price || 0;
                          const mrp = item.pricing?.mrp || item.mrp || item.originalPrice || salePrice;
                          const quantity = item.quantity || 1;
                          const hasDiscount = salePrice < mrp;
                          const totalPrice = salePrice * quantity;
                          const totalSaved = (mrp - salePrice) * quantity;
                          
                          return (
                            <div className="space-y-1">
                              {hasDiscount ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-bold text-gray-900">₹{salePrice.toLocaleString()}</span>
                                  <span className="text-sm text-gray-500 line-through">₹{mrp.toLocaleString()}</span>
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                    {Math.round(((mrp - salePrice) / mrp) * 100)}% OFF
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xl font-bold text-gray-900">₹{salePrice.toLocaleString()}</span>
                              )}
                              
                              {quantity > 1 && (
                                <p className="text-sm text-gray-600">
                                  × {quantity} = <span className="font-semibold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                                </p>
                              )}
                              
                              {hasDiscount && (
                                <p className="text-sm text-green-600 font-medium">
                                  You saved ₹{totalSaved.toLocaleString()}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Quantity and Actions */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentQty = item.quantity || 1;
                                const newQty = Math.max(0, currentQty - 1);
                                console.log('Minus clicked:', item.id, currentQty, '->', newQty);
                                handleQuantityChange(item.id, newQty);
                              }}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                              type="button"
                            >
                              <FaMinus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 border-x border-gray-300 text-sm font-medium">{item.quantity || 1}</span>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentQty = item.quantity || 1;
                                const newQty = currentQty + 1;
                                console.log('Plus clicked:', item.id, currentQty, '->', newQty);
                                handleQuantityChange(item.id, newQty);
                              }}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                              type="button"
                            >
                              <FaPlus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Delete clicked:', item.id);
                            removeFromCart(item.id);
                          }}
                          className="text-gray-500 hover:text-red-500 cursor-pointer"
                          title="Remove from cart"
                          type="button"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                      
                                          </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PRICE DETAILS - Right Side */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-20">
                <div className="bg-white shadow-sm rounded p-4 sticky top-4">
                  <h3 className="text-gray-500 text-sm font-medium mb-4">PRICE DETAILS</h3>

                  <div className="space-y-3 mb-4 pb-4 border-b">
                    {/* Total MRP */}
                    <div className="flex justify-between text-sm">
                      <span>Total MRP ({priceDetails.items} {priceDetails.items === 1 ? 'item' : 'items'})</span>
                      <span className="line-through text-gray-500">₹{priceDetails.totalMRP.toLocaleString()}</span>
                    </div>
                    
                    {/* Sale Price */}
                    <div className="flex justify-between text-sm">
                      <span>Sale Price</span>
                      <span>₹{priceDetails.totalSalePrice.toLocaleString()}</span>
                    </div>
                    
                    {/* You Saved (Product Discount) */}
                    {priceDetails.youSaved > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>You Saved</span>
                        <span className="text-green-600">-₹{priceDetails.youSaved.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Coupon Discount */}
                    {priceDetails.couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 font-medium">Coupon Discount ({appliedCoupon?.code})</span>
                        <span className="text-green-600 font-medium">-₹{priceDetails.couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Shipping */}
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className={priceDetails.shippingCharge > 0 ? 'text-gray-600' : 'text-green-600'}>
                        {priceDetails.shippingCharge > 0 ? `₹${priceDetails.shippingCharge.toLocaleString()}` : 'Free'}
                      </span>
                    </div>
                    
                    {/* Free Shipping Message */}
                    {pricingSettings.isFreeShippingEnabled && priceDetails.shippingCharge > 0 && (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        💡 Free shipping on orders above ₹{pricingSettings.freeShippingMinAmount}
                      </div>
                    )}
                    
                    {/* Tax */}
                    <div className="flex justify-between text-sm">
                      <span>Tax ({pricingSettings.taxPercentage}%)</span>
                      <span>₹{priceDetails.tax.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-medium text-base mb-4 pb-4 border-b">
                    <span>Total Payable</span>
                    <span>₹{priceDetails.total.toLocaleString()}</span>
                  </div>
                                    {/* Coupon Section */}
                  <div className="mb-4">
                    {/* Applied Coupon Display */}
                    {appliedCoupon ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FaCheck className="w-4 h-4 text-green-600" />
                            <div>
                              <span className="font-mono font-semibold text-green-800 text-sm">{appliedCoupon.code}</span>
                              <p className="text-xs text-green-600">
                                You saved ₹{appliedCoupon.discountAmount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-gray-500 hover:text-red-500 p-1"
                            title="Remove coupon"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-3">
                        <FaTicketAlt className="w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                          disabled={applyingCoupon}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {applyingCoupon ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    )}
                    
                    {/* Coupon Message */}
                    {couponMessage && (
                      <p className={`text-xs mt-2 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {couponMessage.text}
                      </p>
                    )}
                    {revalidatingCoupon && appliedCoupon && (
                      <p className="text-xs mt-2 text-gray-500">Updating coupon amount for current cart...</p>
                    )}
                    
                    {!appliedCoupon && !couponMessage && (!eligibleCoupons || eligibleCoupons.length === 0) && (
                      <p className="text-xs text-gray-500 mt-2">
                        Apply a coupon code to get discounts on your order
                      </p>
                    )}
                  </div>
                  
                  {/* Checkout Button */}
                  <button 
                    onClick={() => {
                      // Save coupon info to localStorage for checkout
                      if (appliedCoupon) {
                        localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
                      } else {
                        localStorage.removeItem('appliedCoupon');
                      }
                      navigate('/checkout/address');
                    }}
                    className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
