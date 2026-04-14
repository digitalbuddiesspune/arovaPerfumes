import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const CartContext = createContext();
const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    // Load coupon from localStorage on init
    try {
      const saved = localStorage.getItem('appliedCoupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [couponDiscount, setCouponDiscount] = useState(() => {
    // Calculate initial discount from loaded coupon
    try {
      const saved = localStorage.getItem('appliedCoupon');
      if (saved) {
        const coupon = JSON.parse(saved);
        return coupon?.discountAmount || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  });
  const [eligibleCoupons, setEligibleCoupons] = useState([]);
  const [revalidatingCoupon, setRevalidatingCoupon] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hasToken = () => Boolean(localStorage.getItem('auth_token'));
  const getUserId = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user._id || user.id;
      }
    } catch { }
    return null;
  };
  const isUnauthorizedError = (error) => /no token|invalid token|unauthorized|401/i.test(String(error?.message || ''));

  const mapServerCartToUI = useCallback((data) => {
    const items = data?.items || [];
    // Filter out invalid products (deleted products or placeholder items)
    const validItems = items.filter((i) => {
      const product = i.product || i.productId;
      // Keep only if product exists and has valid data
      return product && (product._id || product.id) && (product.title || product.name);
    });
    return validItems.map((i) => {
      const p = i.product || i.productId || {};
      const price = typeof p.pricing?.salePrice === 'number'
        ? p.pricing.salePrice
        : (typeof p.price === 'number' ? p.price : (typeof p.mrp === 'number' ? Math.round(p.mrp - (p.mrp * (p.discountPercent || 0) / 100)) : 0));
      
      return {
        id: p._id || i.productId, // used by UI and for remove
        name: p.title || p.name || 'Product',
        title: p.title || p.name || 'Product',
        image: p.images?.[0] || p.images?.image1 || p.image,
        images: p.images || [],
        brand: p.brand || p.product_info?.brand || '',
        category: p.category || '',
        subcategory: p.subcategory || '',
        type: p.type || '',
        gender: p.gender || '',
        color: p.color || p.product_info?.KurtiColor || p.product_info?.SareeColor || '',
        size: i.size || p.size || '',
        sku: p.stock?.sku || p.sku || '',
        stock: p.stock?.quantity || p.stock || 0,
        description: p.description || '',
        notes: p.notes || {},
        freeDelivery: Boolean(p.services?.freeDelivery ?? p.freeDelivery ?? false),
        pricing: p.pricing || {
          salePrice: price,
          mrp: p.pricing?.mrp || p.mrp || price,
          discountPercent: p.pricing?.discountPercent || p.discountPercent || 0
        },
        price,
        originalPrice: p.pricing?.mrp || p.mrp || price,
        mrp: p.pricing?.mrp || p.mrp || price,
        salePrice: price,
        quantity: i.quantity || 1,
        // Legacy fields for compatibility
        material: p.product_info?.SareeMaterial,
        work: p.product_info?.IncludedComponents,
      };
    });
  }, []);

  const loadCart = useCallback(async () => {
    if (!hasToken()) {
      setCart([]);
      return;
    }
    const data = await api.getCart();
    setCart(mapServerCartToUI(data));
  }, [mapServerCartToUI]);

  const addToCart = useCallback(async (productIdOrObj, quantity = 1, size = null) => {
    const isObj = typeof productIdOrObj === 'object' && productIdOrObj;
    const productId = String(isObj ? (productIdOrObj._id || productIdOrObj.id) : productIdOrObj || '');
    const qty = Math.max(1, Number(quantity) || 1);
    if (!productId) return { ok: false, redirected: false };

    if (!hasToken()) {
      navigate('/signin', { state: { from: location } });
      return { ok: false, redirected: true };
    }

    if (!isMongoObjectId(productId)) {
      throw new Error('This product is not cart-enabled yet (invalid productId).');
    }

    // Optimistic update for instant cart count/UI feedback.
    if (isObj) {
      const p = productIdOrObj;
      const price = Number(p.pricing?.salePrice || p.price || p.salePrice || p.mrp || 0);
      setCart((prev) => {
        const list = [...prev];
        const idx = list.findIndex((i) => String(i.id) === String(productId));
        if (idx > -1) {
          list[idx] = { ...list[idx], quantity: (list[idx].quantity || 1) + qty };
          return list;
        }
        list.push({
          id: String(productId),
          name: p.title || p.name || 'Product',
          title: p.title || p.name || 'Product',
          image: p.images?.[0] || p.images?.image1 || p.image || '',
          images: p.images || [],
          brand: p.brand || p.product_info?.brand || '',
          category: p.category || '',
          subcategory: p.subcategory || '',
          type: p.type || '',
          gender: p.gender || '',
          color: p.color || p.product_info?.KurtiColor || p.product_info?.SareeColor || '',
          size: size || p.size || '',
          sku: p.stock?.sku || p.sku || '',
          stock: p.stock?.quantity || p.stock || 0,
          description: p.description || '',
          notes: p.notes || {},
          freeDelivery: Boolean(p.services?.freeDelivery ?? p.freeDelivery ?? false),
          pricing: p.pricing || {
            salePrice: price,
            mrp: p.pricing?.mrp || p.mrp || price,
            discountPercent: p.pricing?.discountPercent || p.discountPercent || 0
          },
          price,
          originalPrice: Number(p.pricing?.mrp || p.mrp || price),
          mrp: Number(p.pricing?.mrp || p.mrp || price),
          salePrice: price,
          quantity: qty,
          // Legacy fields for compatibility
          material: p.product_info?.SareeMaterial,
          work: p.product_info?.IncludedComponents,
        });
        return list;
      });
    }

    try {
      await api.addToCart({ productId, quantity: qty, size });
      await loadCart();
      try {
        window.dispatchEvent(new CustomEvent('app:toast', { detail: { text: 'Added to cart', type: 'success' } }));
      } catch {}
      return { ok: true, redirected: false };
    } catch (error) {
      if (isUnauthorizedError(error)) {
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_is_admin');
        } catch {}
        navigate('/signin', { state: { from: location } });
        return { ok: false, redirected: true };
      }
      await loadCart(); // rollback optimistic state from server truth
      throw error;
    }
  }, [loadCart, navigate, location]);

  const removeFromCart = useCallback(async (productId) => {
    if (!hasToken()) {
      navigate('/signin', { state: { from: location } });
      return;
    }
    setCart((prev) => prev.filter((i) => String(i.id) !== String(productId)));
    try {
      await api.removeFromCart(productId);
      await loadCart();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_is_admin');
        } catch {}
        navigate('/signin', { state: { from: location } });
        return;
      }
      await loadCart();
      throw error;
    }
  }, [loadCart, navigate, location]);

  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (!hasToken()) {
      navigate('/signin', { state: { from: location } });
      return;
    }

    const qty = Number(newQuantity);
    if (!Number.isFinite(qty)) return;

    if (qty < 0) {
      await removeFromCart(productId);
      return;
    }

    const previousCart = cart;
    
    // Optimistic update - update UI immediately
    setCart((prev) => prev.map((item) => (
      String(item.id) === String(productId) ? { ...item, quantity: qty } : item
    )));

    try {
      // Update server asynchronously (don't wait for success)
      api.updateCart({ productId, quantity: qty }).catch(error => {
        console.warn('Failed to update cart on server:', error);
        // Don't revert the UI update - keep the optimistic state
        // The user can continue shopping even if server sync fails
      });
    } catch (error) {
      console.warn('Cart update error:', error);
      // Don't revert - keep the optimistic state
    }
  }, [removeFromCart, cart, navigate, location]);

  const clearCart = useCallback(async () => {
    if (!hasToken()) {
      setCart([]);
      setAppliedCoupon(null);
      setCouponDiscount(0);
      return;
    }

    const current = [...cart];
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    try {
      for (const item of current) {
        await api.removeFromCart(item.id);
      }
      await loadCart();
    } catch (error) {
      setCart(current);
      throw error;
    }
  }, [cart, loadCart]);

  // Derived cart values
  const cartTotal = cart.reduce((total, item) => {
    // Use backend calculated price (from formatCartResponse)
    const price = item.price || item.pricing?.salePrice || item.salePrice || 0;
    return total + (price * (item.quantity || 1));
  }, 0);
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  // Fetch eligible coupons - API uses JWT token to identify user
  const fetchEligibleCoupons = useCallback(async () => {
    if (!hasToken()) {
      setEligibleCoupons([]);
      return;
    }
    try {
      const result = await api.getCoupons({ cartTotal });
      if (result.success) {
        setEligibleCoupons(result.data || []);
      } else {
        setEligibleCoupons([]);
      }
    } catch (error) {
      console.warn('Failed to fetch eligible coupons:', error);
      setEligibleCoupons([]);
    }
  }, [cartTotal]);

  // Coupon functions
  const applyCouponCode = useCallback(async (code) => {
    if (!code || !cartTotal) {
      return { success: false, message: 'Invalid coupon or empty cart' };
    }

    try {
      // Backend uses JWT token to identify user, no need to send userId
      const result = await api.applyCoupon({ code, orderAmount: cartTotal });

      if (result.success) {
        const couponData = {
          code: result.data.couponCode,
          discountType: result.data.discountType,
          discountValue: result.data.discountValue,
          discountAmount: result.data.discountAmount,
          finalAmount: result.data.finalAmount,
          originalAmount: result.data.originalAmount
        };
        
        // Save coupon to backend cart (important for order creation)
        try {
          await api.applyCouponToCart({
            code: couponData.code,
            discountType: couponData.discountType,
            discountValue: couponData.discountValue,
            discountAmount: couponData.discountAmount,
            minOrderAmount: result.data.minOrderAmount || 0
          });
          console.log('[CartContext] Coupon saved to cart backend');
        } catch (cartError) {
          console.error('[CartContext] Failed to save coupon to cart:', cartError);
          // Continue even if cart save fails - at least frontend has it
        }
        
        setAppliedCoupon(couponData);
        setCouponDiscount(result.data.discountAmount);
        // Save to localStorage
        localStorage.setItem('appliedCoupon', JSON.stringify(couponData));
        try {
          await fetchEligibleCoupons();
        } catch {
          /* ignore */
        }
        return {
          success: true,
          message: `Coupon applied! You saved ₹${result.data.discountAmount.toLocaleString()}`,
          data: result.data
        };
      }

      return { success: false, message: result.message || 'Failed to apply coupon' };
    } catch (error) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      localStorage.removeItem('appliedCoupon');
      return {
        success: false,
        message: error.message || 'Failed to apply coupon'
      };
    }
  }, [cartTotal, fetchEligibleCoupons]);

  const removeCoupon = useCallback(async () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    localStorage.removeItem('appliedCoupon');
    
    // Remove coupon from backend cart
    try {
      await api.removeCouponFromCart();
    } catch (cartError) {
      console.error('[CartContext] Failed to remove coupon from cart:', cartError);
    }
    try {
      await fetchEligibleCoupons();
    } catch {
      /* ignore */
    }
  }, [fetchEligibleCoupons]);

  // Final amount after coupon discount
  const finalTotal = Math.max(0, cartTotal - couponDiscount);

  // Keep coupon discount accurate when cart amount changes.
  useEffect(() => {
    const code = appliedCoupon?.code;
    if (!code || !hasToken()) return;
    if (!cartTotal || cartTotal <= 0) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      localStorage.removeItem('appliedCoupon');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setRevalidatingCoupon(true);
        const result = await api.applyCoupon({ code, orderAmount: cartTotal });
        if (cancelled) return;
        if (result?.success) {
          const nextDiscount = Number(result.data?.discountAmount || 0);
          const nextCoupon = {
            code: result.data.couponCode,
            discountType: result.data.discountType,
            discountValue: result.data.discountValue,
            discountAmount: nextDiscount,
            finalAmount: result.data.finalAmount,
            originalAmount: result.data.originalAmount,
          };
          setAppliedCoupon(nextCoupon);
          setCouponDiscount(nextDiscount);
          localStorage.setItem('appliedCoupon', JSON.stringify(nextCoupon));
          try {
            await api.applyCouponToCart({
              code: nextCoupon.code,
              discountType: nextCoupon.discountType,
              discountValue: nextCoupon.discountValue,
              discountAmount: nextCoupon.discountAmount,
              minOrderAmount: result.data.minOrderAmount || 0,
            });
          } catch {
            // Ignore sync errors and keep UI state consistent.
          }
        } else {
          setAppliedCoupon(null);
          setCouponDiscount(0);
          localStorage.removeItem('appliedCoupon');
          try {
            await api.removeCouponFromCart();
          } catch {
            // no-op
          }
        }
      } catch {
        if (!cancelled) {
          setAppliedCoupon(null);
          setCouponDiscount(0);
          localStorage.removeItem('appliedCoupon');
        }
      } finally {
        if (!cancelled) setRevalidatingCoupon(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cartTotal, appliedCoupon?.code]);

  const visibleEligibleCoupons = eligibleCoupons.filter(
    (c) => c?.applicableForUser !== false && c?.code !== appliedCoupon?.code
  );

  useEffect(() => {
    loadCart();
    fetchEligibleCoupons();
    const onStorage = (e) => {
      if (!e || e.key === 'auth_token') {
        loadCart();
        fetchEligibleCoupons();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadCart, fetchEligibleCoupons]);

  // Also reload on route changes to reflect auth changes in the same tab.
  useEffect(() => {
    loadCart();
  }, [location.pathname, loadCart]);

  // Reload in same tab on auth updates.
  useEffect(() => {
    const onAuthUpdated = () => {
      loadCart();
      fetchEligibleCoupons();
    };
    window.addEventListener('auth:updated', onAuthUpdated);
    return () => window.removeEventListener('auth:updated', onAuthUpdated);
  }, [loadCart, fetchEligibleCoupons]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      loadCart,
      appliedCoupon,
      couponDiscount,
      finalTotal,
      revalidatingCoupon,
      applyCouponCode,
      removeCoupon,
      eligibleCoupons: visibleEligibleCoupons,
      fetchEligibleCoupons,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
