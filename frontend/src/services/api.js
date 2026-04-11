// VITE_API_URL can be set either to:
// - http://localhost:5001/api
// - http://localhost:5001
// We normalize it to always include `/api` since backend mounts routes under `/api/*`.
// Default port matches backend/.env PORT=5001 (see also utils/api.js).
import { extractOrderHexFromInput } from '../utils/orderId.js';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');
const API_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

export const fetchSarees = async (category, options = {}) => {
  try {
    const { page, limit } = options;
    const params = new URLSearchParams();
    
    if (category) {
      params.append('category', category);
    }
    if (page) {
      params.append('page', page.toString());
    }
    if (limit) {
      params.append('limit', limit.toString());
    }
    
    const queryString = params.toString();
    const url = `${API_URL}/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch sarees');
    }
    const data = await response.json();
    
    // Handle both old format (array) and new format (object with products and pagination)
    if (Array.isArray(data)) {
      return data;
    }
    return data;
  } catch (error) {
    console.error('Error fetching sarees:', error);
    throw error;
  }
};

export const fetchSareeById = async (id) => {
  try {
    if (!id || id === '0' || id === 'undefined' || id === 'null') {
      throw new Error('Invalid product id');
    }
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch saree details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching saree details:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    return data.navigation.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Fetch COLLECTION categories
export const fetchCollectionCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/collection`);
    if (!response.ok) {
      throw new Error('Failed to fetch COLLECTION categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching COLLECTION categories:', error);
    throw error;
  }
};

// Fetch MEN categories
export const fetchMenCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/men`);
    if (!response.ok) {
      throw new Error('Failed to fetch MEN categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching MEN categories:', error);
    throw error;
  }
};

// Fetch WOMEN categories
export const fetchWomenCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/women`);
    if (!response.ok) {
      throw new Error('Failed to fetch WOMEN categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching WOMEN categories:', error);
    throw error;
  }
};

// Fetch BOYS categories
export const fetchBoysCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/boys`);
    if (!response.ok) {
      throw new Error('Failed to fetch BOYS categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching BOYS categories:', error);
    throw error;
  }
};

// Fetch GIRLS categories
export const fetchGirlsCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/girls`);
    if (!response.ok) {
      throw new Error('Failed to fetch GIRLS categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching GIRLS categories:', error);
    throw error;
  }
};

// Fetch SISHU categories
export const fetchSishuCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/sishu`);
    if (!response.ok) {
      throw new Error('Failed to fetch SISHU categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching SISHU categories:', error);
    throw error;
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await fetch(`${API_URL}/header/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

const authHeaders = () => {
  const token = (() => { try { return localStorage.getItem('auth_token'); } catch { return null; } })();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMyAddress = async () => {
  const res = await fetch(`${API_URL}/address/me`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch address');
  return res.json();
};

export const saveMyAddress = async (payload) => {
  const res = await fetch(`${API_URL}/address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to save address');
  return res.json();
};

export const updateAddressById = async (id, payload) => {
  const res = await fetch(`${API_URL}/address/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to update address');
  return res.json();
};

export const deleteAddressById = async (id) => {
  const res = await fetch(`${API_URL}/address/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete address');
  return res.json();
};

export const createPaymentOrder = async (amount, notes = {}) => {
  const res = await fetch(`${API_URL}/payment/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ amount, currency: 'INR', notes }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const parts = [data.error, data.details].filter((x) => typeof x === 'string' && x.trim());
    const msg =
      parts.join(' — ') ||
      data.message ||
      `Failed to create payment order (${res.status})`;
    throw new Error(msg);
  }
  return data;
};

export const verifyPayment = async (payload) => {
  const res = await fetch(`${API_URL}/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to verify payment');
  return res.json();
};

export const createCODOrder = async () => {
  try {
    const res = await fetch(`${API_URL}/payment/cod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
    });
    
    const contentType = res.headers.get('content-type');
    let errorData = {};
    
    if (!res.ok) {
      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await res.json();
        } else {
          const text = await res.text();
          errorData = { message: text || `HTTP ${res.status} ${res.statusText}` };
        }
      } catch (parseError) {
        errorData = { message: `HTTP ${res.status} ${res.statusText}` };
      }
      
      const errorMessage = errorData?.error || errorData?.message || `Failed to create COD order (${res.status})`;
      console.error('COD Order Error:', errorMessage, errorData);
      throw new Error(errorMessage);
    }
    
    return await res.json();
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Network error: Unable to connect to server. Please check your connection.');
      console.error('COD Order Network Error:', networkError);
      throw networkError;
    }
    // Re-throw other errors (they already have the message)
    throw error;
  }
};

export const getMyOrders = async () => {
  const res = await fetch(`${API_URL}/orders`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
};

/** @param {string} orderIdOrCode Full Mongo order id or 8-char display code (see Profile / confirmation) */
export const getOrderById = async (orderIdOrCode) => {
  const id = extractOrderHexFromInput(String(orderIdOrCode || ''));
  if (!id || id.length < 8) {
    throw new Error('Enter your order ID or 8-character code.');
  }
  const qs = new URLSearchParams({ q: id });
  const res = await fetch(`${API_URL}/orders/lookup?${qs.toString()}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include',
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const msg = data.message || data.error || 'Failed to fetch order';
    throw new Error(typeof msg === 'string' ? msg : 'Failed to fetch order');
  }
  return data;
};

// Fetch pricing settings for dynamic tax and shipping calculation
export const fetchPricingSettings = async () => {
  try {
    const res = await fetch(`${API_URL}/settings/pricing`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch pricing settings');
    const data = await res.json();
    return (
      data.settings || {
        taxPercentage: 5,
        shippingCharge: 50,
        freeShippingMinAmount: 500,
        isFreeShippingEnabled: true,
        announcementMarquee:
          '• 1st Order - 50% Off • USE CODE SMELLGOOD5 TO GET EXTRA 5% OFF ON PREPAID ORDERS • GET A FREE SAMPLE ON EVERY ORDER •',
        lowStockThreshold: 8,
      }
    );
  } catch (error) {
    console.error('Error fetching pricing settings:', error);
    // Return default values if API fails
    return {
      taxPercentage: 5,
      shippingCharge: 50,
      freeShippingMinAmount: 500,
      isFreeShippingEnabled: true,
      announcementMarquee:
        '• 1st Order - 50% Off • USE CODE SMELLGOOD5 TO GET EXTRA 5% OFF ON PREPAID ORDERS • GET A FREE SAMPLE ON EVERY ORDER •',
      lowStockThreshold: 8,
    };
  }
};
