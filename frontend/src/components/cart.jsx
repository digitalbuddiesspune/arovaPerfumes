import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

function Cart() {
  const navigate = useNavigate();
  const { 
    cart = [], 
    updateQuantity, 
    removeFromCart, 
    cartTotal = 0, 
    cartCount = 0,
    clearCart 
  } = useCart();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  // Calculate price details similar to checkout
  const calculatePriceDetails = () => {
    const subtotal = cartTotal || 0;
    const shippingCharge = subtotal < 5000 ? 99 : 0;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const totalPayable = subtotal + shippingCharge + tax;
    const savings = Math.round(subtotal * 0.35); // Assuming 35% savings

    return {
      subtotal,
      shippingCharge,
      tax,
      total: totalPayable,
      savings,
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
            className="text-gray-700 hover:text-gray-900 cursor-pointer disabled:cursor-not-allowed"
            disabled={cart.length === 0}
          >
            <FaTrash className="w-5 h-5" />
          </button>
        </div>
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
        <div className="px-4 py-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Listings - Left Side */}  
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                  {/* Debug info - remove later */}
                  {console.log('Cart item:', item.id, item.name, item.quantity)}
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
                    <div className="flex justify-between text-sm">
                      <span>Price ({priceDetails.items} {priceDetails.items === 1 ? 'item' : 'items'})</span>
                      <span>₹{priceDetails.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>You saved</span>
                      <span className="text-green-600">-₹{priceDetails.savings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span>Coupon savings</span>
                      <button
                        type="button"
                        className="text-[#2f6f89] font-semibold hover:text-[#24586d] transition-colors"
                      >
                        Apply coupon
                      </button>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className={priceDetails.shippingCharge > 0 ? 'text-gray-600' : 'text-green-600'}>
                        {priceDetails.shippingCharge > 0 ? `₹${priceDetails.shippingCharge.toLocaleString()}` : 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (5%)</span>
                      <span>₹{priceDetails.tax.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-medium text-base mb-4 pb-4 border-b">
                    <span>Total Payable</span>
                    <span>₹{priceDetails.total.toLocaleString()}</span>
                  </div>
                  
                  {/* Coupon Section */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                      />
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                        Apply
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Get 10% off on your first order! Use code: FIRST10
                    </p>
                  </div>
                  
                  {/* Checkout Button */}
                  <button 
                    onClick={() => navigate('/checkout/address')}
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
