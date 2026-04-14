import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiMenu, FiSearch, FiShoppingBag, FiUser, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { searchProducts, fetchPricingSettings } from '../services/api';
import ProductImage from './ProductImage';

const DEFAULT_ANNOUNCEMENT =
  '• 1st Order - 50% Off • USE CODE SMELLGOOD5 TO GET EXTRA 5% OFF ON PREPAID ORDERS • GET A FREE SAMPLE ON EVERY ORDER •';
const BRAND_LOGO_URL =
  'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776086342/Untitled_design_9_fc6qsg.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchUiOpen, setSearchUiOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchWrapRefMobile = useRef(null);
  const searchWrapRefDesktop = useRef(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [announcementMarquee, setAnnouncementMarquee] = useState(DEFAULT_ANNOUNCEMENT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await fetchPricingSettings();
        const line = (s?.announcementMarquee && String(s.announcementMarquee).trim()) || DEFAULT_ANNOUNCEMENT;
        if (!cancelled) setAnnouncementMarquee(line);
      } catch {
        /* keep default */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
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
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const adminFlag = localStorage.getItem('auth_is_admin') === 'true';
        setIsAuthenticated(Boolean(token));
        setIsAdminUser(Boolean(token) && adminFlag);
      } catch {
        setIsAuthenticated(false);
        setIsAdminUser(false);
      }
    };

    checkAuth();
    const onStorage = (e) => {
      if (!e || e.key === 'auth_token') {
        checkAuth();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_is_admin');
    } catch {}
    setIsAuthenticated(false);
    setIsAdminUser(false);
    navigate('/signin');
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
    if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    setSearchOpen(true);
    const t = setTimeout(async () => {
      try {
        const data = await searchProducts(q);
        const items = data?.results || [];
        setSearchResults(items);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const onClick = (e) => {
      const inMobile = searchWrapRefMobile.current && searchWrapRefMobile.current.contains(e.target);
      const inDesktop = searchWrapRefDesktop.current && searchWrapRefDesktop.current.contains(e.target);
      if (!inMobile && !inDesktop) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    let timer;
    if (searchOpen) {
      setSearchUiOpen(true);
    } else {
      timer = setTimeout(() => setSearchUiOpen(false), 180);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Navigation links matching suuupply style
  const navLinks = [
    { name: 'Shop Now', path: '/products' },
    { name: 'MEN', path: '/category/men' },
    { name: 'WOMEN', path: '/category/women' },
  ];
  const mobileQuickLinks = [
    ...navLinks,
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative z-[70]">
      <div className="bg-[var(--brand-maroon)] text-white text-[10px] sm:text-xs md:text-sm font-medium tracking-wide py-1.5 overflow-hidden whitespace-nowrap">
        <div className="animate-scroll inline-flex min-w-max">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="px-4 sm:px-6">
              {announcementMarquee}
            </span>
          ))}
        </div>
      </div>
      <nav
        className={`bg-[var(--brand-cream)] border-b border-[var(--brand-border)] border-t-0 transition-shadow ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="relative flex items-center justify-between h-12 sm:h-14 md:h-16 gap-2 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:h-16">
          {/* Mobile left: menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-700 hover:text-black hover:bg-white active:bg-gray-100 border border-transparent hover:border-[var(--brand-border)] focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <FiX className="h-5 w-5 sm:h-6 sm:w-6" /> : <FiMenu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>

          {/* Left: Search + Category Links */}
          <div className="hidden lg:flex items-center justify-start gap-4 xl:gap-6 2xl:gap-8">
            {/* Search Icon - Desktop (left of categories) */}
            <div className="relative flex items-center gap-2 pr-2 xl:pr-3" ref={searchWrapRefDesktop}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="inline-flex items-center justify-center align-middle p-2.5 rounded-xl text-[var(--brand-text)] hover:text-[var(--brand-maroon)] hover:bg-white border border-transparent hover:border-[var(--brand-border)] transition-all"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              {searchUiOpen && (
                <div
                  className={`flex items-center gap-2 overflow-hidden bg-white border border-[var(--brand-border)] rounded-xl shadow-sm p-1.5 origin-left transition-all duration-300 ease-out ${
                    searchOpen
                      ? 'opacity-100 scale-100 translate-x-0 w-[320px]'
                      : 'opacity-0 scale-95 -translate-x-1 w-0 pointer-events-none border-transparent p-0'
                  }`}
                >
                  <FiSearch className="w-4 h-4 text-gray-400 ml-1 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => { const v = e.target.value; setSearchQuery(v); setSearchOpen(v.trim().length >= 2); }}
                    onKeyPress={handleSearchKeyPress}
                    className="w-full px-2 py-1.5 text-sm bg-transparent focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-[var(--brand-maroon)] hover:bg-[var(--brand-cream)]"
                    aria-label="Close search"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}
              {searchOpen && (
                <div className="absolute left-12 top-full mt-2 w-[320px] bg-white border border-[var(--brand-border)] rounded-xl shadow-lg z-[90] overflow-hidden animate-fade-in">
                  {searchLoading && (
                    <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
                  )}
                  {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
                  )}
                  {!searchLoading && searchResults.length > 0 && (
                    <ul className="max-h-80 overflow-auto divide-y divide-gray-100">
                      {searchResults.slice(0, 8).map((p) => (
                        <li key={p._id || p.id || p.slug}>
                          <button
                            type="button"
                            onClick={() => {
                              const id = p._id || p.id;
                              if (!id) return;
                              setSearchOpen(false);
                              navigate(`/product/${id}`);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--brand-cream)] text-left transition-colors"
                          >
                            <ProductImage
                              src={p.images?.image1 || p.image}
                              alt={p.title || p.name || 'Product'}
                              className="w-12 h-16 object-cover rounded-md border border-gray-100"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{p.title || p.name || 'Product'}</p>
                              {p.price && (
                                <p className="text-xs text-gray-600">₹{Number(p.price).toLocaleString()}</p>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={scrollToTop}
                className="group relative inline-flex items-center text-gray-700 hover:text-[var(--brand-maroon)] transition-all duration-300 text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2.5 py-2"
              >
                <span className="transition-transform duration-300 group-hover:-translate-y-[1px]">{link.name}</span>
                <span className="pointer-events-none absolute left-2.5 right-2.5 -bottom-[1px] h-[2px] rounded-full bg-[var(--brand-maroon)] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* Center: Brand Logo Text */}
          {!searchOpen && (
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 z-10 lg:static lg:translate-x-0 lg:justify-self-center"
              onClick={scrollToTop}
            >
              <img
                src={BRAND_LOGO_URL}
                alt="Arova"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain"
              />
            </Link>
          )}

          {/* Right Side Icons */}
            <div className="flex items-center justify-end gap-2 sm:gap-2 md:gap-2 lg:gap-3 xl:gap-4 flex-shrink-0 ml-auto lg:ml-0">
            {/* Mobile Search Toggle */}
            <div className="md:hidden relative min-w-0" ref={searchWrapRefMobile}>
              {searchUiOpen ? (
                <div
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    searchOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 pointer-events-none'
                  }`}
                >
                  <div className="relative w-[58vw] max-w-[250px] min-w-[170px]">
                    <svg
                      className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-[var(--brand-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all duration-200"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-md transition-all"
                    aria-label="Close search"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="inline-flex items-center justify-center align-middle p-2.5 rounded-xl text-[var(--brand-text)] hover:text-[var(--brand-maroon)] hover:bg-white border border-transparent hover:border-[var(--brand-border)] transition-all"
                  type="button"
                  aria-label="Search"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Mobile profile icon - right of search */}
            <div className="md:hidden">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center align-middle p-2.5 rounded-xl text-[var(--brand-text)] hover:text-[var(--brand-maroon)] hover:bg-white border border-transparent hover:border-[var(--brand-border)] transition-all"
                  title="Profile"
                  aria-label="Profile"
                >
                  <FiUser className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={handleLogin}
                  className="inline-flex items-center justify-center align-middle p-2.5 rounded-xl text-[var(--brand-text)] hover:text-[var(--brand-maroon)] hover:bg-white border border-transparent hover:border-[var(--brand-border)] transition-all"
                  title="Sign In"
                  aria-label="Sign In"
                >
                  <FiUser className="w-5 h-5" />
                </button>
              )}
            </div>

            {isAuthenticated && isAdminUser ? (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center justify-center rounded-xl border border-[var(--brand-border)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-maroon)] hover:bg-[var(--brand-cream)] transition-all"
                title="Admin Dashboard"
              >
                Admin Dashboard
              </Link>
            ) : null}

            {/* User Icon - Hidden on mobile */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center align-middle p-2.5 rounded-xl text-[var(--brand-text)] hover:text-[var(--brand-maroon)] hover:bg-white border border-transparent hover:border-[var(--brand-border)] transition-all flex-shrink-0"
                  title="Profile"
                >
                  <FiUser className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={handleLogin}
                  className="inline-flex items-center justify-center align-middle p-2.5 rounded-xl text-[var(--brand-text)] hover:text-[var(--brand-maroon)] hover:bg-white border border-transparent hover:border-[var(--brand-border)] transition-all flex-shrink-0"
                  title="Sign In"
                >
                  <FiUser className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Wishlist Icon - Hidden on mobile */}
            <Link to="/wishlist" className="hidden md:inline-flex items-center justify-center align-middle p-2.5 rounded-xl text-[var(--brand-text)] hover:text-[var(--brand-maroon)] hover:bg-white border border-transparent hover:border-[var(--brand-border)] relative flex-shrink-0 transition-all" title="Wishlist">
              <FiHeart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[var(--brand-maroon)] text-white text-[9px] sm:text-[10px] md:text-xs rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex items-center justify-center font-medium">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon - Hidden on mobile */}
            <Link to="/cart" className="hidden md:inline-flex items-center justify-center align-middle p-2.5 rounded-xl text-[var(--brand-text)] hover:text-[var(--brand-maroon)] hover:bg-white border border-transparent hover:border-[var(--brand-border)] relative flex-shrink-0 transition-all">
              <FiShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[var(--brand-maroon)] text-white text-[9px] sm:text-[10px] md:text-xs rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

          </div>
        </div>
        </div>
        {/* Mobile side drawer */}
        <div
          id="mobile-menu"
          className={`lg:hidden fixed inset-0 z-[95] transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <aside
            className={`absolute top-0 left-0 h-full w-[84%] max-w-[320px] bg-[var(--brand-cream)] border-r border-[var(--brand-border)] shadow-2xl transition-transform duration-300 ease-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="px-3 py-3 space-y-3 h-full overflow-y-auto">
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] uppercase tracking-wide text-[var(--brand-muted)]">Navigation</p>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-md text-[var(--brand-text)] hover:bg-white/70"
                  aria-label="Close menu"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="theme-card p-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--brand-muted)] mb-2">Quick Access</p>
                <nav className="grid grid-cols-1 gap-2">
                  {mobileQuickLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToTop();
                      }}
                      className="flex items-center justify-between rounded-lg border border-[var(--brand-border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--brand-text)] hover:bg-[var(--brand-cream)]"
                    >
                      <span className="uppercase tracking-wide">{link.name}</span>
                      <span className="text-[var(--brand-muted)]">›</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="theme-card p-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--brand-muted)] mb-2">Your Account</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg border border-[var(--brand-border)] bg-white px-3 py-2 text-sm text-center font-medium text-[var(--brand-text)] hover:bg-[var(--brand-cream)]">Profile</Link>
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg border border-[var(--brand-border)] bg-white px-3 py-2 text-sm text-center font-medium text-[var(--brand-text)] hover:bg-[var(--brand-cream)]">Wishlist</Link>
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg border border-[var(--brand-border)] bg-white px-3 py-2 text-sm text-center font-medium text-[var(--brand-text)] hover:bg-[var(--brand-cream)]">Cart</Link>
                  <Link to="/profile?tab=track" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg border border-[var(--brand-border)] bg-white px-3 py-2 text-sm text-center font-medium text-[var(--brand-text)] hover:bg-[var(--brand-cream)]">Track</Link>
                  {isAuthenticated && isAdminUser ? (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="col-span-2 rounded-lg border border-[var(--brand-border)] bg-white px-3 py-2 text-sm text-center font-semibold text-[var(--brand-maroon)] hover:bg-[var(--brand-cream)]"
                    >
                      Admin Dashboard
                    </Link>
                  ) : null}
                </div>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full rounded-xl bg-[var(--brand-maroon)] text-white py-3 text-sm font-semibold hover:bg-[var(--brand-maroon-2)]"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full rounded-xl bg-[var(--brand-maroon)] text-white py-3 text-sm font-semibold hover:bg-[var(--brand-maroon-2)]"
                >
                  Sign In
                </button>
              )}
            </div>
          </aside>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
