import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const CartContext = createContext();
const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const hasToken = () => Boolean(localStorage.getItem('auth_token'));
  const isUnauthorizedError = (error) => /no token|invalid token|unauthorized|401/i.test(String(error?.message || ''));

  const mapServerCartToUI = useCallback((data) => {
    const items = data?.items || [];
    return items.map((i) => {
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
      return;
    }

    const current = [...cart];
    setCart([]);
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

  const cartTotal = cart.reduce((total, item) => {
    const price = item.pricing?.salePrice || item.salePrice || item.price || 0;
    return total + (price * (item.quantity || 1));
  }, 0);
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  useEffect(() => {
    loadCart();
    const onStorage = (e) => {
      if (!e || e.key === 'auth_token') loadCart();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadCart]);

  // Also reload on route changes to reflect auth changes in the same tab.
  useEffect(() => {
    loadCart();
  }, [location.pathname, loadCart]);

  // Reload in same tab on auth updates.
  useEffect(() => {
    const onAuthUpdated = () => loadCart();
    window.addEventListener('auth:updated', onAuthUpdated);
    return () => window.removeEventListener('auth:updated', onAuthUpdated);
  }, [loadCart]);

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
