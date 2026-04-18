import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getMyAddress, getMyOrders, getOrderById, fetchPricingSettings } from '../services/api';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiSettings, FiUser, FiPackage, FiMapPin, FiLogOut, FiRefreshCw, FiShoppingBag, FiMail, FiPhone, FiEdit2, FiHeart, FiHome, FiSearch } from 'react-icons/fi';
import ProductImage from '../components/ProductImage';
import { formatDisplayOrderId } from '../utils/orderId';
import { formatDiscountPercent } from '../utils/formatDiscountPercent';

const PROFILE_TABS = ['profile', 'orders', 'track', 'addresses'];

export default function Profile() {
  const initialTab = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      return tab && PROFILE_TABS.includes(tab) ? tab : 'profile';
    } catch {
      return 'profile';
    }
  })();
  const [activeSection, setActiveSection] = useState(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: 'male'
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [pricingSettings, setPricingSettings] = useState({
    taxPercentage: 5,
    shippingCharge: 50,
    freeShippingMinAmount: 500,
    isFreeShippingEnabled: true
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Order Timeline Component
  const OrderTimeline = ({ status, compact = false }) => {
    const steps = [
      { key: 'pending', label: 'Pending', icon: '⏳' },
      { key: 'confirmed', label: 'Confirmed', icon: '⏳' },
      { key: 'packed', label: 'Packed', icon: '📦' },
      { key: 'shipped', label: 'Shipped', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '✅' }
    ];
    
    const currentStatus = String(status || '').toLowerCase();
    const cancelled = currentStatus === 'cancelled';
    const returned = currentStatus === 'returned';
    
    // Find current step index
    let currentIndex = steps.findIndex(s => s.key === currentStatus);
    if (currentIndex === -1) currentIndex = 0;
    
    if (compact) {
      // Compact horizontal timeline for order cards
      return (
        <div className="py-2">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = index <= currentIndex && !cancelled;
              const isCurrent = index === currentIndex && !cancelled && !returned;
              
              return (
                <div key={step.key} className="flex flex-col items-center flex-1 relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 ${
                      index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`} style={{ transform: 'translateX(50%)' }} />
                  )}
                  
                  {/* Step circle - smaller for compact */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 z-10 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  
                  {/* Step label - smaller */}
                  <span className={`text-[10px] mt-1 ${
                    isCompleted || isCurrent ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {(cancelled || returned) && (
            <div className={`mt-2 p-2 rounded text-center text-xs ${
              cancelled ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
            }`}>
              <span className="mr-1">{cancelled ? '❌' : '🔄'}</span>
              Order {cancelled ? 'Cancelled' : 'Returned'}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex && !cancelled;
            const isCurrent = index === currentIndex && !cancelled && !returned;
            
            return (
              <div key={step.key} className="flex flex-col items-center flex-1 relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`} style={{ transform: 'translateX(50%)' }} />
                )}
                
                {/* Step circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 z-10 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? '✓' : step.icon}
                </div>
                
                {/* Step label */}
                <span className={`text-xs mt-2 font-medium ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        
        {(cancelled || returned) && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            cancelled ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
          }`}>
            <span className="text-lg mr-2">{cancelled ? '❌' : '🔄'}</span>
            <span className="font-medium">Order {cancelled ? 'Cancelled' : 'Returned'}</span>
          </div>
        )}
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const s = String(status || '').toLowerCase();
    const map = {
      created: 'bg-amber-50 text-amber-700 border border-amber-200',
      confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
      on_the_way: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      failed: 'bg-rose-50 text-rose-700 border border-rose-200',
      paid: 'bg-green-50 text-green-700 border border-green-200',
      pending: 'bg-gray-50 text-gray-700 border border-gray-200',
    };
    const cls = map[s] || 'bg-gray-50 text-gray-700 border border-gray-200';
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{String(status).replace(/_/g, ' ').toUpperCase()}</span>;
  };

  const fetchUserData = async () => {
    try {
      const userData = await api.me();
      const [firstName, ...lastNameParts] = userData.user?.name?.split(' ') || [];
      const lastName = lastNameParts.join(' ');
      const adminStatus = !!userData.user?.isAdmin;
      try {
        if (adminStatus) {
          localStorage.setItem('auth_is_admin', 'true');
        } else {
          localStorage.removeItem('auth_is_admin');
        }
      } catch {}

      setUser({
        firstName: firstName || '',
        lastName: lastName || '',
        email: userData.user?.email || '',
        mobile: userData.user?.phone || '',
        gender: userData.user?.gender || 'male'
      });
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const addressData = await getMyAddress();
      if (addressData && addressData._id) {
        setAddresses([addressData]);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAddresses();
    
    // Load wishlist count
    const readWishlistCount = () => {
      try {
        const raw = localStorage.getItem('wishlist');
        const list = raw ? JSON.parse(raw) : [];
        setWishlistCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    readWishlistCount();
    const onStorage = (e) => {
      if (!e || e.key === 'wishlist') readWishlistCount();
    };
    const onCustom = () => readWishlistCount();
    window.addEventListener('storage', onStorage);
    window.addEventListener('wishlist:updated', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wishlist:updated', onCustom);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && PROFILE_TABS.includes(tab)) {
      setActiveSection(tab);
    } else {
      setActiveSection('profile');
    }
  }, [location.search]);

  // Load orders when orders section is active
  useEffect(() => {
    if (activeSection === 'orders' && orders.length === 0 && !loadingOrders) {
      refreshOrders();
    }
  }, [activeSection]);


  const refreshOrders = async (opts = { showLoading: true }) => {
    const showLoading = opts.showLoading !== false;
    try {
      if (showLoading) setLoadingOrders(true);
      const settings = await fetchPricingSettings();
      setPricingSettings(settings);
      const data = await getMyOrders();
      const ordersArray = data?.orders || (Array.isArray(data) ? data : []);
      setOrders(ordersArray);
    } catch (e) {
      console.error('Error fetching orders:', e);
      if (showLoading) setOrders([]);
    } finally {
      if (showLoading) setLoadingOrders(false);
    }
  };

  const handleTrackOrderSubmit = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);
    const id = trackQuery.trim().replace(/^#/, '').trim();
    if (!id) {
      setTrackError('Enter your order ID or 8-character code.');
      return;
    }
    setTrackLoading(true);
    try {
      const data = await getOrderById(id);
      if (data?.success && data.order) {
        setTrackedOrder(data.order);
        setTrackQuery('');
        await refreshOrders({ showLoading: false });
      } else {
        setTrackError('Order not found.');
      }
    } catch (err) {
      setTrackError(err?.message || 'Could not load this order.');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_is_admin');
      navigate('/signin');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    navigate(`/profile?tab=${section}`, { replace: true });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--brand-cream)]">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--brand-border)] border-t-[var(--brand-maroon)]"></div>
          </div>
          <p className="mt-4 text-[var(--brand-muted)]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-cream)] pt-14 sm:pt-16">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-[var(--brand-cream)] shadow-sm border-b border-[var(--brand-border)] sticky top-0 z-30" style={{ top: 'var(--app-header-height, 0px)' }}>
          <div className="px-4 py-3 flex items-center justify-between bg-[var(--brand-cream)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-text)] text-lg font-bold shadow-sm">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs text-[var(--brand-muted)]">Hello,</div>
                <div className="font-semibold text-[var(--brand-text)]">{user.firstName} {user.lastName}</div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-1 inline-flex items-center gap-1 rounded-md border border-[var(--brand-border)] bg-white px-2 py-1 text-[10px] font-semibold text-[var(--brand-maroon)]"
                  >
                    <FiSettings className="w-3.5 h-3.5" />
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-[var(--brand-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 z-40 lg:z-0
          transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-300 ease-in-out
          w-72 bg-[var(--brand-cream)] border-r border-[var(--brand-border)] shadow-xl lg:shadow-none
          flex flex-col
        `} style={{ top: 'var(--app-header-height, 0px)' }}>
          {/* Overlay for mobile */}
          {mobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/30 -z-10"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* User Profile Header - Desktop */}
          <div className="hidden lg:block p-6 border-b border-[var(--brand-border)] bg-[var(--brand-cream)]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-text)] text-2xl font-bold shadow-sm ring-2 ring-[#f2e8e4]">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[var(--brand-muted)] font-medium mb-1">Welcome back,</div>
                <div className="font-bold text-[var(--brand-text)] text-lg truncate">{user.firstName} {user.lastName}</div>
                <div className="text-xs text-[var(--brand-muted)] truncate">{user.email}</div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="mt-2 inline-flex items-center gap-1 rounded-md border border-[var(--brand-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--brand-maroon)] hover:bg-[var(--brand-cream)]"
                    >
                      <FiSettings className="w-3.5 h-3.5" />
                      Admin Dashboard
                    </Link>
                  )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 pb-28 lg:pb-6 bg-[var(--brand-cream)] lg:bg-transparent">
            <div className="space-y-2">
              {/* Quick Actions */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-[var(--brand-muted)] uppercase tracking-wider px-4 mb-2">Quick Actions</div>
                <Link to="/" className="block">
                  <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[var(--brand-text)] hover:bg-[#f6ece8] bg-white border border-[var(--brand-border)] hover:border-[var(--brand-maroon)]">
                    <div className="p-2 rounded-lg bg-[#f4ece8]">
                      <FiHome className="w-5 h-5 text-[var(--brand-text)]" />
                    </div>
                    <span className="font-medium">Back to Home</span>
                    <span className="ml-auto text-[var(--brand-muted)]">›</span>
                  </div>
                </Link>
              </div>

              {/* Main Menu */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-[var(--brand-muted)] uppercase tracking-wider px-4 mb-2">My Account</div>
                <button
                  onClick={() => handleSectionChange('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative ${
                    activeSection === 'profile'
                      ? 'bg-[var(--brand-maroon)] text-white shadow-md'
                      : 'text-[var(--brand-text)] hover:bg-[#f6ece8] bg-white border border-[var(--brand-border)] hover:border-[var(--brand-maroon)]'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeSection === 'profile' ? 'bg-white/20' : 'bg-[#f4ece8]'}`}>
                    <FiUser className={`w-5 h-5 ${activeSection === 'profile' ? 'text-white' : 'text-[var(--brand-text)]'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Profile</div>
                    <div className={`text-xs ${activeSection === 'profile' ? 'text-white/80' : 'text-[var(--brand-muted)]'}`}>
                      Personal information
                    </div>
                  </div>
                  {activeSection === 'profile' && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </button>

                <button
                  onClick={() => handleSectionChange('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 mt-2 relative ${
                    activeSection === 'orders'
                      ? 'bg-[var(--brand-maroon)] text-white shadow-md'
                      : 'text-[var(--brand-text)] hover:bg-[#f6ece8] bg-white border border-[var(--brand-border)] hover:border-[var(--brand-maroon)]'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeSection === 'orders' ? 'bg-white/20' : 'bg-[#f4ece8]'}`}>
                    <FiPackage className={`w-5 h-5 ${activeSection === 'orders' ? 'text-white' : 'text-[var(--brand-text)]'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">My Orders</div>
                    <div className={`text-xs ${activeSection === 'orders' ? 'text-white/80' : 'text-[var(--brand-muted)]'}`}>
                      View order history
                    </div>
                  </div>
                  {activeSection === 'orders' && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                  <span className={`${activeSection === 'orders' ? 'text-white/60' : 'text-[var(--brand-muted)]'}`}>›</span>
                </button>

                <button
                  onClick={() => handleSectionChange('track')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 mt-2 relative ${
                    activeSection === 'track'
                      ? 'bg-[var(--brand-maroon)] text-white shadow-md'
                      : 'text-[var(--brand-text)] hover:bg-[#f6ece8] bg-white border border-[var(--brand-border)] hover:border-[var(--brand-maroon)]'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeSection === 'track' ? 'bg-white/20' : 'bg-[#f4ece8]'}`}>
                    <FiSearch className={`w-5 h-5 ${activeSection === 'track' ? 'text-white' : 'text-[var(--brand-text)]'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Track order</div>
                    <div className={`text-xs ${activeSection === 'track' ? 'text-white/80' : 'text-[var(--brand-muted)]'}`}>
                      Look up by order ID
                    </div>
                  </div>
                  {activeSection === 'track' && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                  <span className={`${activeSection === 'track' ? 'text-white/60' : 'text-[var(--brand-muted)]'}`}>›</span>
                </button>

                <button
                  onClick={() => handleSectionChange('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 mt-2 relative ${
                    activeSection === 'addresses'
                      ? 'bg-[var(--brand-maroon)] text-white shadow-md'
                      : 'text-[var(--brand-text)] hover:bg-[#f6ece8] bg-white border border-[var(--brand-border)] hover:border-[var(--brand-maroon)]'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeSection === 'addresses' ? 'bg-white/20' : 'bg-[#f4ece8]'}`}>
                    <FiMapPin className={`w-5 h-5 ${activeSection === 'addresses' ? 'text-white' : 'text-[var(--brand-text)]'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">My Addresses</div>
                    <div className={`text-xs ${activeSection === 'addresses' ? 'text-white/80' : 'text-[var(--brand-muted)]'}`}>
                      Manage delivery addresses
                    </div>
                  </div>
                  {activeSection === 'addresses' && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                  <span className={`${activeSection === 'addresses' ? 'text-white/60' : 'text-[var(--brand-muted)]'}`}>›</span>
                </button>

                <Link to="/wishlist" className="block mt-2">
                  <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-[var(--brand-text)] hover:bg-[#f6ece8] bg-white border border-[var(--brand-border)] hover:border-[var(--brand-maroon)] relative">
                    <div className="p-2 rounded-lg bg-[#f4ece8]">
                      <FiHeart className="w-5 h-5 text-[var(--brand-text)]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Wishlist</div>
                      <div className="text-xs text-[var(--brand-muted)]">
                        {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
                      </div>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                    <span className="text-[var(--brand-muted)]">›</span>
                  </div>
                </Link>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-[var(--brand-border)]"></div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-[var(--brand-maroon)] hover:bg-[#f6ece8] bg-white border border-[var(--brand-border)] hover:border-[var(--brand-maroon)]"
              >
                <div className="p-2 rounded-lg bg-[#f4ece8]">
                  <FiLogOut className="w-5 h-5 text-[var(--brand-maroon)]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Logout</div>
                  <div className="text-xs text-[var(--brand-muted)]">Sign out of your account</div>
                </div>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[var(--brand-cream)] lg:bg-transparent">
          <div className="max-w-6xl mx-auto">
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden mb-6">
              <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-[var(--brand-border)] overflow-x-auto">
                <button
                  onClick={() => handleSectionChange('profile')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeSection === 'profile'
                      ? 'bg-[var(--brand-maroon)] text-white shadow-sm'
                      : 'text-[var(--brand-muted)] hover:text-[var(--brand-text)] hover:bg-[#f6ece8] bg-white'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => handleSectionChange('orders')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeSection === 'orders'
                      ? 'bg-[var(--brand-maroon)] text-white shadow-sm'
                      : 'text-[var(--brand-muted)] hover:text-[var(--brand-text)] hover:bg-[#f6ece8] bg-white'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => handleSectionChange('track')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeSection === 'track'
                      ? 'bg-[var(--brand-maroon)] text-white shadow-sm'
                      : 'text-[var(--brand-muted)] hover:text-[var(--brand-text)] hover:bg-[#f6ece8] bg-white'
                  }`}
                >
                  Track
                </button>
                <button
                  onClick={() => handleSectionChange('addresses')}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeSection === 'addresses'
                      ? 'bg-[var(--brand-maroon)] text-white shadow-sm'
                      : 'text-[var(--brand-muted)] hover:text-[var(--brand-text)] hover:bg-[#f6ece8] bg-white'
                  }`}
                >
                  Addresses
                </button>
              </div>
            </div>

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-[var(--brand-border)] overflow-hidden">
                  <div className="bg-gradient-to-r from-[var(--brand-maroon)] to-[var(--brand-maroon-2)] px-6 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white/30">
                        {user.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                          <h1 className="text-xl sm:text-2xl font-bold text-white mb-0 sm:mb-1 break-words">{user.firstName} {user.lastName}</h1>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              className="w-fit shrink-0 inline-flex items-center gap-1 rounded-md border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition-colors"
                            >
                              <FiSettings className="w-3.5 h-3.5" />
                              Admin Dashboard
                            </Link>
                          )}
                        </div>
                        <p className="text-[#eadfdb] text-sm">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-[var(--brand-border)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[var(--brand-border)] bg-[var(--brand-cream)]">
                    <h2 className="text-lg font-bold text-[var(--brand-text)] flex items-center gap-2">
                      <FiUser className="w-5 h-5" />
                      Personal Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[var(--brand-muted)] mb-2">First Name</label>
                        <div className="px-4 py-3 bg-[var(--brand-cream)] border border-[var(--brand-border)] rounded-xl text-[var(--brand-text)] font-medium">
                          {user.firstName || '—'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--brand-muted)] mb-2">Last Name</label>
                        <div className="px-4 py-3 bg-[var(--brand-cream)] border border-[var(--brand-border)] rounded-xl text-[var(--brand-text)] font-medium">
                          {user.lastName || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-[var(--brand-border)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[var(--brand-border)] bg-[var(--brand-cream)]">
                    <h2 className="text-lg font-bold text-[var(--brand-text)] flex items-center gap-2">
                      <FiMail className="w-5 h-5" />
                      Contact Information
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-muted)] mb-2 flex items-center gap-2">
                        <FiMail className="w-4 h-4" />
                        Email Address
                      </label>
                      <div className="px-4 py-3 bg-[var(--brand-cream)] border border-[var(--brand-border)] rounded-xl text-[var(--brand-text)] font-medium">
                        {user.email || '—'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-muted)] mb-2 flex items-center gap-2">
                        <FiPhone className="w-4 h-4" />
                        Mobile Number
                      </label>
                      <div className="px-4 py-3 bg-[var(--brand-cream)] border border-[var(--brand-border)] rounded-xl text-[var(--brand-text)] font-medium">
                        {user.mobile || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Section */}
            {activeSection === 'orders' && (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiPackage className="w-5 h-5" />
                    My Orders ({orders.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => refreshOrders()}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-black"></div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const dateTime = formatDate(order.createdAt);
                      const totalItems = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;
                      
                      // Use priceDetails from backend if available, otherwise calculate with dynamic settings
                      // Use ?? (nullish coalescing) to preserve 0 as valid value
                      const priceDetails = order.priceDetails ?? {};
                      const itemsPrice = priceDetails.itemsPrice ?? order.items?.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0) ?? 0;
                      
                      // Dynamic tax calculation
                      const taxPrice = priceDetails.taxPrice ?? Math.round(itemsPrice * (pricingSettings.taxPercentage / 100)) ?? 0;
                      
                      // Dynamic shipping calculation
                      let calculatedShipping = pricingSettings.shippingCharge;
                      if (pricingSettings.isFreeShippingEnabled && itemsPrice >= pricingSettings.freeShippingMinAmount) {
                        calculatedShipping = 0;
                      }
                      const shippingPrice = priceDetails.shippingPrice ?? calculatedShipping ?? 0;
                      
                      // Try priceDetails first, then fall back to order fields
                      const discount = priceDetails.discount ?? order.discount ?? order.couponDiscount ?? 0;
                      const totalPrice = priceDetails.totalPrice ?? (itemsPrice + taxPrice + shippingPrice - discount) ?? order.totalPrice ?? order.amount ?? 0;
                      const couponCode = priceDetails.couponCode ?? order.couponCode;
                      
                      return (
                        <div 
                          key={order._id} 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        >
                          {/* Order Header */}
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-900">#{formatDisplayOrderId(order)}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">{dateTime.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={order.orderStatus || order.status} />
                              <span className="text-xs text-blue-600 font-medium">View Details →</span>
                            </div>
                          </div>

                          {/* Order Timeline - Compact for list view */}
                          <div className="px-4 py-2 bg-white border-b border-gray-100">
                            <OrderTimeline status={order.orderStatus || order.status} compact={true} />
                          </div>

                          {/* Products */}
                          <div className="p-4">
                            {order.items?.map((it, idx) => {
                              const product = it.product;
                              // Use product data if available, otherwise fall back to item data
                              const productTitle = it.name || product?.title || product?.name || it.title || 'Product';
                              const productBrand = product?.brand || it.brand || '';
                              const productImage = it.image || product?.images?.[0] || product?.image || '/no-image.png';
                              // The price stored in order is the sale price user paid
                              const salePrice = it.price || 0;
                              const quantity = it.quantity || 1;
                              const itemTotal = salePrice * quantity;
                              
                              // Only show discount if product data has pricing info
                              const productMrp = product?.pricing?.mrp;
                              const hasDiscount = productMrp && productMrp > salePrice;
                              
                              return (
                                <div key={idx} className={`flex gap-3 ${idx > 0 ? 'mt-3 pt-3 border-t border-gray-100' : ''}`}>
                                  <ProductImage
                                    src={productImage}
                                    alt={productTitle}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                      {productTitle}
                                    </h4>
                                    {productBrand && (
                                      <p className="text-xs text-gray-500">{productBrand}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className="text-sm font-semibold text-gray-900">₹{salePrice.toLocaleString('en-IN')}</span>
                                      {hasDiscount && (
                                        <>
                                          <span className="text-xs text-gray-400 line-through">₹{productMrp.toLocaleString('en-IN')}</span>
                                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                                            {formatDiscountPercent(((productMrp - salePrice) / productMrp) * 100)}% off
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Qty: {quantity}{it.size && ` • Size: ${it.size}`}
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-semibold text-gray-900">₹{itemTotal.toLocaleString('en-IN')}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Price Details */}
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <h5 className="text-xs font-semibold text-gray-700 uppercase mb-2">Price Details</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Items Price ({totalItems} item{totalItems > 1 ? 's' : ''})</span>
                                <span className="text-gray-900">₹{itemsPrice.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tax ({pricingSettings.taxPercentage}%)</span>
                                <span className="text-gray-900">₹{taxPrice.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className={shippingPrice === 0 ? 'text-green-600' : 'text-gray-900'}>
                                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toLocaleString('en-IN')}`}
                                </span>
                              </div>
                              {discount > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-green-700 font-medium">
                                    Discount {couponCode && `(${couponCode})`}
                                  </span>
                                  <span className="text-green-600 font-medium">-₹{discount.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              <div className="border-t border-gray-300 my-2 pt-2">
                                <div className="flex justify-between font-semibold text-base">
                                  <span className="text-gray-900">Total Price</span>
                                  <span className="text-gray-900">₹{totalPrice.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Footer */}
                          <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Payment: <span className="font-medium text-gray-700">{(order.paymentMethod || 'COD').toUpperCase()}</span>
                              {' • '}
                              Status: <span className="font-medium text-gray-700">{(order.paymentStatus || (order.isPaid ? 'Paid' : 'Pending')).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Order Total:</span>
                              <span className="text-lg font-bold text-gray-900">₹{totalPrice.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                      <FiShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Start shopping to see your orders here</p>
                    <button 
                      onClick={() => navigate('/')} 
                      className="px-5 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Shop Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'track' && (
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiSearch className="w-5 h-5" />
                    Track order
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    8-character code from your order card or confirmation, or the full 24-character order ID.
                  </p>
                </div>

                <form onSubmit={handleTrackOrderSubmit} className="space-y-3">
                  <label htmlFor="profile-track-id" className="sr-only">
                    Order ID or code
                  </label>
                  <input
                    id="profile-track-id"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. 069477F7"
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={trackLoading}
                    className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors"
                  >
                    {trackLoading ? 'Searching…' : 'Track'}
                  </button>
                </form>
                {trackError ? <p className="text-sm text-red-600 mt-3">{trackError}</p> : null}

                {trackedOrder && (
                  <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
                    <div className="flex justify-between items-baseline gap-2 text-sm">
                      <span className="text-gray-500">Order</span>
                      <span className="font-mono font-semibold text-gray-900">#{formatDisplayOrderId(trackedOrder)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Order status</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {String(trackedOrder.orderStatus || trackedOrder.status || 'pending').replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {trackedOrder.paymentStatus || (trackedOrder.isPaid ? 'paid' : 'pending')} ·{' '}
                        {trackedOrder.paymentMethod || 'cod'}
                      </span>
                    </div>
                    {trackedOrder.createdAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Placed</span>
                        <span className="text-gray-900">{formatDate(trackedOrder.createdAt).date}</span>
                      </div>
                    )}
                    {trackedOrder.priceDetails?.totalPrice != null && (
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                        <span className="text-gray-700">Total</span>
                        <span className="text-gray-900">
                          ₹{Number(trackedOrder.priceDetails.totalPrice).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(trackedOrder)}
                      className="w-full pt-2 text-sm font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600"
                    >
                      Full details, timeline & address
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
              <div 
                className="fixed inset-0 z-[220] flex items-center justify-center bg-black/55 p-4"
                onClick={() => setSelectedOrder(null)}
              >
                <div 
                  className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Order #{formatDisplayOrderId(selectedOrder)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(selectedOrder.createdAt).date}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Order Timeline */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Order Status</h3>
                      <OrderTimeline status={selectedOrder.orderStatus || selectedOrder.status} />
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Order Items ({selectedOrder.items?.length || 0})
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item, idx) => {
                          const product = item.product || {};
                          const title = item.name || product?.title || product?.name || 'Product';
                          const image = item.image || product?.images?.[0] || product?.image || '/no-image.png';
                          const price = item.price || 0;
                          const qty = item.quantity || 1;
                          
                          return (
                            <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                              <img 
                                src={image} 
                                alt={title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{title}</h4>
                                <p className="text-xs text-gray-500">Qty: {qty}</p>
                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                  ₹{(price * qty).toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price Details */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Details</h3>
                      {(() => {
                        const pd = selectedOrder.priceDetails || {};
                        const itemsTotal = pd.itemsPrice ?? selectedOrder.items?.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0) ?? 0;
                        
                        // Dynamic tax calculation
                        const tax = pd.taxPrice ?? Math.round(itemsTotal * (pricingSettings.taxPercentage / 100)) ?? 0;
                        
                        // Dynamic shipping calculation
                        let calculatedShipping = pricingSettings.shippingCharge;
                        if (pricingSettings.isFreeShippingEnabled && itemsTotal >= pricingSettings.freeShippingMinAmount) {
                          calculatedShipping = 0;
                        }
                        const shipping = pd.shippingPrice ?? calculatedShipping ?? 0;
                        
                        // Try priceDetails first, then fall back to order fields
                        const disc = pd.discount ?? selectedOrder.discount ?? selectedOrder.couponDiscount ?? 0;
                        const total = pd.totalPrice ?? (itemsTotal + tax + shipping - disc) ?? selectedOrder.totalPrice ?? selectedOrder.amount ?? 0;
                        
                        return (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Items Price</span>
                              <span className="text-gray-900">₹{itemsTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax ({pricingSettings.taxPercentage}%)</span>
                              <span className="text-gray-900">₹{tax.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping</span>
                              <span className={shipping === 0 ? 'text-green-600' : 'text-gray-900'}>
                                {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                              </span>
                            </div>
                            {pricingSettings.isFreeShippingEnabled && shipping > 0 && (
                              <div className="text-xs text-amber-600 bg-amber-50 p-1.5 rounded">
                                💡 Free shipping on orders above ₹{pricingSettings.freeShippingMinAmount}
                              </div>
                            )}
                            {disc > 0 && (
                              <div className="flex justify-between">
                                <span className="text-green-700 font-medium">
                                  Discount {(pd.couponCode ?? selectedOrder.couponCode) ? `(${pd.couponCode ?? selectedOrder.couponCode})` : ''}
                                </span>
                                <span className="text-green-600 font-medium">-₹{disc.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            <div className="border-t border-gray-300 pt-2 mt-2">
                              <div className="flex justify-between font-semibold text-base">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Shipping Address */}
                    {selectedOrder.shippingAddress && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h3>
                        <div className="bg-gray-50 rounded-xl p-4 text-sm">
                          <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                          <p className="text-gray-600">{selectedOrder.shippingAddress.address}</p>
                          {selectedOrder.shippingAddress.locality && (
                            <p className="text-gray-600">{selectedOrder.shippingAddress.locality}</p>
                          )}
                          <p className="text-gray-600">
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                          </p>
                          <p className="text-gray-600 mt-1">Phone: {selectedOrder.shippingAddress.mobileNumber}</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Method</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {selectedOrder.paymentMethod || 'COD'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className="font-medium text-gray-900">
                            {selectedOrder.paymentStatus || (selectedOrder.isPaid ? 'Paid' : 'Pending')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Section */}
            {activeSection === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    My Addresses
                  </h2>
                  <Link
                    to="/checkout/address"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Add Address
                  </Link>
                </div>
                <div className="p-6">
                  {loadingAddresses ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address, index) => (
                        <div key={index} className="border-2 border-gray-200 rounded-xl p-5 hover:border-black hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-gray-900 text-lg">{address.fullName}</h3>
                            {address.isDefault && (
                              <span className="px-3 py-1 text-xs font-bold bg-black text-white rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm text-gray-700">
                            <p className="leading-relaxed">{address.address || address.addressLine1}</p>
                            {address.landmark && (
                              <p className="text-gray-600">Landmark: {address.landmark}</p>
                            )}
                            <p className="font-medium text-gray-900">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-200">
                              <FiPhone className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">{address.mobileNumber || address.alternatePhone || '—'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                        <FiMapPin className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Addresses Saved</h3>
                      <p className="text-gray-600 mb-6">You haven't added any addresses yet.</p>
                      <Link
                        to="/checkout/address"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Add New Address
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
