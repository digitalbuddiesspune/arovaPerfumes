import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHeart, FiSettings, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const BRAND_LOGO_URL =
  'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776086342/Untitled_design_9_fc6qsg.png';

const navItems = [
  { label: 'Collections', href: '#collections' },
  { label: 'Fragrance', href: '#notes' },
  { label: 'For Him & Her', href: '#gender' },
];

const Navbar = ({ announcementMarquee = '' }) => {
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('auth_is_admin') === 'true'
  );
  const [isScrolled, setIsScrolled] = useState(false);
  /** xl and up: keep scroll-based navbar. Below xl: solid bar, no transition (mobile/tablet). */
  const [isDesktopNav, setIsDesktopNav] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1280px)').matches : false
  );
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const { cartCount } = useCart();

  useEffect(() => {
    setIsAdminUser(localStorage.getItem('auth_is_admin') === 'true');
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const sync = () => setIsDesktopNav(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!isDesktopNav) return;
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isDesktopNav]);

  useEffect(() => {
    const SCROLL_DELTA_THRESHOLD = 8;
    const TOP_LOCK_THRESHOLD = 24;

    const onDirectionScroll = () => {
      const currentY = window.scrollY || 0;
      const previousY = lastScrollYRef.current;
      const delta = currentY - previousY;

      if (currentY <= TOP_LOCK_THRESHOLD) {
        setIsNavVisible(true);
        lastScrollYRef.current = currentY;
        return;
      }

      if (Math.abs(delta) < SCROLL_DELTA_THRESHOLD) return;

      setIsNavVisible(delta < 0);
      lastScrollYRef.current = currentY;
    };

    lastScrollYRef.current = window.scrollY || 0;
    window.addEventListener('scroll', onDirectionScroll, { passive: true });
    return () => window.removeEventListener('scroll', onDirectionScroll);
  }, []);

  const scrolledBar =
    'border-b border-[rgba(44,16,8,0.08)] bg-[rgba(245,240,232,0.88)] shadow-[0_8px_24px_rgba(44,16,8,0.12)] backdrop-blur-xl';

  const offerStripText = useMemo(() => String(announcementMarquee || '').trim(), [announcementMarquee]);
  const showOfferStrip = Boolean(offerStripText);
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-[160] transition-transform duration-300 ease-out ${
        isNavVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {showOfferStrip ? (
        <section
          aria-label="Offers and announcements"
          className="overflow-hidden border-b border-[var(--luxury-gold)]/25 bg-[var(--luxury-brown)] py-1 sm:py-1.5"
        >
          <div className="luxury-marquee-track flex min-w-max items-center whitespace-nowrap">
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                className="px-6 font-[var(--font-cinzel)] text-[9px] uppercase tracking-[0.2em] text-[var(--luxury-gold)] sm:text-[10px]"
              >
                {offerStripText}
              </span>
            ))}
          </div>
        </section>
      ) : null}
      <header
        className={`relative w-full ${scrolledBar}`}
      >
        <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 pt-1 sm:h-[60px] sm:px-8 sm:pt-1.5 lg:px-16">
        <Link
          to="/"
          onClick={handleLogoClick}
          className="inline-flex items-center"
        >
          <img
            src={BRAND_LOGO_URL}
            alt="AROVA"
            className="h-8 w-auto object-contain sm:h-9"
          />
        </Link>

        <div className="hidden items-center gap-10 xl:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={`/${item.href}`}
              className="relative [font-family:'Cinzel',serif] text-[11px] uppercase tracking-[0.22em] text-[#2C1008] transition-colors duration-300 hover:text-[#C9A96E]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/wishlist"
            className="hidden xl:inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#2C1008] transition-all duration-300 hover:border-[#2C1008]/20 hover:bg-white/70 hover:text-[#C9A96E]"
            aria-label="Wishlist"
          >
            <FiHeart className="h-4 w-4" />
          </Link>
          <Link
            to="/profile"
            className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#2C1008] transition-all duration-300 hover:border-[#2C1008]/20 hover:bg-white/70 hover:text-[#C9A96E]"
            aria-label="Profile"
          >
            <FiUser className="h-4 w-4" />
          </Link>
          <Link
            to="/cart"
            className="relative hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#2C1008] transition-all duration-300 hover:border-[#2C1008]/20 hover:bg-white/70 hover:text-[#C9A96E]"
            aria-label="Cart"
          >
            <FiShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-maroon)] px-1 text-[9px] font-semibold leading-none text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          {isAdminUser ? (
            <Link
              to="/admin"
              className="hidden min-h-10 items-center justify-center gap-1.5 border border-[#2C1008]/40 px-4 [font-family:'Cinzel',serif] text-[10px] uppercase tracking-[0.2em] text-[#2C1008] transition-all duration-300 hover:border-[#C9A96E] hover:bg-[rgba(44,16,8,0.04)] hover:text-[#5c2e0e] xl:inline-flex"
            >
              <FiSettings className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Admin
            </Link>
          ) : null}
          <Link
            to="/products"
            className="inline-flex min-h-10 items-center justify-center border border-[#2C1008] px-5 [font-family:'Cinzel',serif] text-[10px] uppercase tracking-[0.2em] text-[#2C1008] transition-all duration-300 hover:bg-[#2C1008] hover:text-[#F5F0E8] sm:px-6"
          >
            Shop Now
          </Link>
        </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
