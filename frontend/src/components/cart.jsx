import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart, FaTimes, FaCheck, FaTicketAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { fetchPricingSettings } from '../services/api';
import { formatDiscountPercent } from '../utils/formatDiscountPercent';

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
  } = useCart();

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
    <div className="min-h-screen bg-[var(--brand-cream)] pb-4 pt-12 sm:pt-14">
      {/* Header */}
      <div className="bg-[var(--brand-cream)] sticky top-[var(--app-header-height,0px)] z-10 border-b border-[var(--brand-border)]">
        <div className="relative flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-[var(--brand-text)] hover:text-[var(--brand-maroon)] cursor-pointer"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-[var(--brand-maroon)]">
            Cart
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearCart}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--brand-maroon)] hover:text-[var(--brand-maroon-2)] hover:bg-white rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cart.length === 0}
              title="Clear Cart"
            >
              <FaTrash className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Clear Cart</span>
            </button>
          </div>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12 px-4">
          <FaShoppingCart className="mx-auto mb-4 text-5xl text-[var(--brand-muted)]/50" />
          <h2 className="mb-4 text-2xl font-semibold text-[var(--brand-maroon)]">Your cart is empty</h2>
          <p className="mb-6 text-[var(--brand-muted)]">Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => navigate('/')}
            className="rounded-md bg-[var(--brand-maroon)] px-6 py-2 text-white transition-colors hover:bg-[var(--brand-maroon-2)] cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 max-w-7xl mx-auto space-y-4">
          <section className="rounded-lg border border-[var(--brand-border)] bg-white shadow-sm p-4">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-[var(--brand-maroon)]">
              <FaTicketAlt className="text-[var(--brand-muted)]" />
              Available coupons
            </h3>
            <p className="mb-2 text-[11px] text-[var(--brand-muted)]">
              Showing all active coupons created by admin.
            </p>
            {Array.isArray(eligibleCoupons) && eligibleCoupons.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
                {eligibleCoupons.map((c) => {
                  const id = c._id || c.code;
                  const applicable = c?.applicableForUser !== false;
                  const isApplied = appliedCoupon?.code === c.code;
                  const off =
                    c.discountType === 'percentage'
                      ? `${formatDiscountPercent(c.discountValue)}% off`
                      : `₹${Number(c.discountValue || 0).toLocaleString('en-IN')} off`;
                  return (
                    <div
                      key={id}
                      className={`rounded-md border p-2 md:p-2.5 flex flex-col gap-1 md:gap-1.5 ${
                        applicable ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-[12px] font-bold text-gray-900">{c.code}</p>
                          <p className="text-xs text-gray-700">{off}</p>
                          {c.isFirstOrderOnly ? (
                            <p className="mt-1 text-[10px] text-blue-700 leading-tight truncate">
                              First order
                              {!applicable && c?.unavailableReason ? ` • ${c.unavailableReason}` : ''}
                            </p>
                          ) : null}
                        </div>
                        {isApplied ? (
                          <span className="shrink-0 text-[11px] font-semibold text-green-700 flex items-center gap-1">
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
                            className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded bg-black text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800"
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
                <div key={item.id} className="rounded-lg border border-[var(--brand-border)] bg-white shadow-sm p-4">
                  <div className="flex gap-4">
                    {/* Product Image - Left */}
                    <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-md bg-[var(--brand-cream)]">
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
                        className="mb-2 cursor-pointer text-lg font-semibold text-[var(--brand-maroon)] transition-colors hover:text-[var(--brand-maroon-2)]"
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
                                    {formatDiscountPercent(((mrp - salePrice) / mrp) * 100)}% OFF
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
                <div className="sticky top-4 rounded border border-[var(--brand-border)] bg-white p-4 shadow-sm">
                  <h3 className="mb-4 text-sm font-medium text-[var(--brand-muted)]">PRICE DETAILS</h3>

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
                    className="w-full rounded-lg bg-[var(--brand-maroon)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--brand-maroon-2)] cursor-pointer"
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
