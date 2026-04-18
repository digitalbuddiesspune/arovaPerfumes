import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const BRAND_LOGO_URL =
  'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776086342/Untitled_design_9_fc6qsg.png';

const navItems = [
  { label: 'Collections', href: '#collections' },
  { label: 'Fragrance', href: '#notes' },
  { label: 'For Him & Her', href: '#gender' },
];

const Navbar = ({ announcementMarquee = '' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  /** xl and up: keep scroll-based navbar. Below xl: solid bar, no transition (mobile/tablet). */
  const [isDesktopNav, setIsDesktopNav] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1280px)').matches : false
  );
  const { cartCount } = useCart();

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

  const scrolledBar =
    'border-b border-[rgba(44,16,8,0.08)] bg-[rgba(245,240,232,0.88)] shadow-[0_8px_24px_rgba(44,16,8,0.12)] backdrop-blur-xl';

  const showMobileOfferStrip = Boolean(String(announcementMarquee || '').trim());

  return (
    <div className="fixed left-0 right-0 top-0 z-[160]">
      {showMobileOfferStrip ? (
        <section
          aria-label="Offers and announcements"
          className="lg:hidden overflow-hidden border-b border-[var(--luxury-gold)]/25 bg-[var(--luxury-brown)] py-1 sm:py-1.5"
        >
          <div className="luxury-marquee-track flex min-w-max items-center whitespace-nowrap">
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                className="px-6 font-[var(--font-cinzel)] text-[9px] uppercase tracking-[0.2em] text-[var(--luxury-gold)] sm:text-[10px]"
              >
                {String(announcementMarquee).trim()}
              </span>
            ))}
          </div>
        </section>
      ) : null}
      <header
        className={
          isDesktopNav
            ? `relative w-full transition-all duration-500 ${
                isScrolled ? scrolledBar : 'bg-transparent shadow-none'
              }`
            : `relative w-full ${scrolledBar}`
        }
      >
        <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 pt-1 sm:h-[60px] sm:px-8 sm:pt-1.5 lg:px-16">
        <Link
          to="/"
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
