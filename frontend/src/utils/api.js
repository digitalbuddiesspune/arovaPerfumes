// Backend base URL – prefer VITE_API_URL, fallback to local 5001
// VITE_API_URL can be with or without `/api` suffix; we normalize below.
const normalizeApiBase = (url) => {
  const value = String(url || '').trim().replace(/\/$/, '');
  if (!value) return '';
  return value.endsWith('/api') ? value : `${value}/api`;
};

const RAW_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_BASE_URL = normalizeApiBase(RAW_API_BASE);

// Fallbacks prevent total admin-panel outage when one Render hostname is unavailable.
const FALLBACK_API_BASES = [
  import.meta.env.VITE_FALLBACK_API_URL,
  'https://arovaperfume.onrender.com',
  'https://arovaperfumes-backend.onrender.com',
]
  .map(normalizeApiBase)
  .filter(Boolean);

const API_BASE_CANDIDATES = [API_BASE_URL, ...FALLBACK_API_BASES].filter(
  (value, index, arr) => arr.indexOf(value) === index
);

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isCookieSession = token === 'cookie' || (token && !token.includes('.'));
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(!isCookieSession && token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let lastNetworkError = null;

  for (const baseUrl of API_BASE_CANDIDATES) {
    const url = `${baseUrl}${path}`;
    try {
      const res = await fetch(url, { ...options, headers, credentials: 'include' });
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
      if (!res.ok) throw new Error(data?.message || `Request failed with status ${res.status}`);
      return data;
    } catch (error) {
      const isNetworkError = error?.name === 'TypeError' && String(error?.message || '').includes('fetch');
      if (!isNetworkError) {
        throw error;
      }
      lastNetworkError = error;
    }
  }

  if (lastNetworkError) {
    throw new Error(
      `Network error: Unable to connect to server. Tried: ${API_BASE_CANDIDATES.join(', ')}`
    );
  }
}

export const api = {
  signin: (payload) => request('/auth/signin', { method: 'POST', body: JSON.stringify(payload) }),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  sendOTP: (payload) => request('/auth/send-otp', { method: 'POST', body: JSON.stringify(payload) }),
  verifyOTP: (payload) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) }),
  me: async () => {
    try {
      return await request('/me', { method: 'GET' });
    } catch (e) {
      // Fallback for header-token based auth
      return await request('/auth/me', { method: 'GET' });
    }
  },
  // Cart endpoints
  getCart: () => request('/cart', { method: 'GET' }),
  addToCart: ({ productId, quantity = 1, size }) => request('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity, size }) }),
  removeFromCart: (productId) => request(`/cart/remove/${productId}`, { method: 'DELETE' }),
  updateCart: ({ productId, quantity }) => request('/cart/update', { method: 'PUT', body: JSON.stringify({ productId, quantity }) }),
  // Coupon endpoints (both now use JWT token for user identification)
  applyCoupon: (payload) => request('/coupons/apply', { method: 'POST', body: JSON.stringify(payload) }),
  getCoupons: (opts = {}) => {
    const params = new URLSearchParams();
    if (opts.cartTotal != null && opts.cartTotal !== '' && !Number.isNaN(Number(opts.cartTotal))) {
      params.set('cartTotal', String(Math.round(Number(opts.cartTotal))));
    }
    const qs = params.toString();
    return request(`/coupons${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },
  // Cart coupon endpoints
  applyCouponToCart: (payload) => request('/cart/coupon', { method: 'POST', body: JSON.stringify(payload) }),
  removeCouponFromCart: () => request('/cart/coupon', { method: 'DELETE' }),
  // Admin endpoints
  admin: {
    stats: () => request('/admin/stats', { method: 'GET' }),
    createProduct: (payload) => request('/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
    updateProduct: (id, payload) => request(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    listProducts: () => request('/admin/products', { method: 'GET' }),
    deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    listOrders: () => request('/admin/orders', { method: 'GET' }),
    getOrder: (id) => request(`/admin/orders/${id}`, { method: 'GET' }),
    listAddresses: () => request('/admin/addresses', { method: 'GET' }),
    updateOrderStatus: (id, status) => request(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ orderStatus: status }) }),
    updateOrder: (id, payload) => request(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    // Policy endpoints
    getPolicies: () => request('/admin/policies', { method: 'GET' }),
    getPolicy: (type) => request(`/admin/policies/${type}`, { method: 'GET' }),
    updatePolicy: (type, payload) => request(`/admin/policies/${type}`, { method: 'PUT', body: JSON.stringify(payload) }),
    // Logo endpoints
    getLogo: () => request('/admin/logo', { method: 'GET' }),
    updateLogo: (payload) => request('/admin/logo', { method: 'PUT', body: JSON.stringify(payload) }),
    // Hero Slider endpoints
    getHeroSlider: () => request('/admin/hero-slider', { method: 'GET' }),
    updateHeroSlider: (payload) => request('/admin/hero-slider', { method: 'PUT', body: JSON.stringify(payload) }),
    // Home banners endpoints
    getHomeBanners: () => request('/admin/home-banners', { method: 'GET' }),
    updateHomeBanners: (payload) =>
      request('/admin/home-banners', { method: 'PUT', body: JSON.stringify(payload) }),
    // Coupons (same routes as standalone admin app; requires isAdmin JWT)
    couponsList: () => request('/coupons/admin/all', { method: 'GET' }),
    couponCreate: (payload) => request('/coupons', { method: 'POST', body: JSON.stringify(payload) }),
    couponUpdate: (id, payload) => request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    couponDelete: (id) => request(`/coupons/${id}`, { method: 'DELETE' }),
    couponToggle: (id) => request(`/coupons/${id}/toggle`, { method: 'PATCH' }),
    /** Storefront tax, shipping, free-shipping rules, marquee, low-stock (admin JWT) */
    getPricingSettings: () => request('/settings/pricing', { method: 'GET' }),
    updatePricingSettings: (payload) =>
      request('/settings/pricing', { method: 'PUT', body: JSON.stringify(payload) }),
  },
  // Public policy endpoint
  getPolicy: (type) => request(`/policy/${type}`, { method: 'GET' }),
  // Public settings endpoint
  getLogo: () => request('/settings/logo', { method: 'GET' }),
  // Public hero slider endpoint
  getHeroSlider: () => request('/settings/hero-slider', { method: 'GET' }),
  // Public homepage desktop/mobile banner endpoint
  getHomeBanners: () => request('/settings/home-banners', { method: 'GET' }),
};

export default api;



