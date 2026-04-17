import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser } from 'react-icons/fi';

const BRAND_LOGO_URL =
  'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776086342/Untitled_design_9_fc6qsg.png';

const navItems = [
  { label: 'Collections', href: '#collections' },
  { label: 'Fragrance', href: '#notes' },
  { label: 'For Him & Her', href: '#gender' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-[160] transition-all duration-500 ${
        isScrolled
          ? 'bg-[rgba(245,240,232,0.88)] shadow-[0_8px_24px_rgba(44,16,8,0.12)] backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-5 pt-1 sm:h-[60px] sm:px-8 sm:pt-1.5 lg:px-16">
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
              href={item.href}
              className="relative [font-family:'Cinzel',serif] text-[11px] uppercase tracking-[0.22em] text-[#2C1008] transition-colors duration-300 hover:text-[#C9A96E]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#2C1008] transition-all duration-300 hover:border-[#2C1008]/20 hover:bg-white/70 hover:text-[#C9A96E]"
            aria-label="Profile"
          >
            <FiUser className="h-4 w-4" />
          </Link>
          <Link
            to="/cart"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#2C1008] transition-all duration-300 hover:border-[#2C1008]/20 hover:bg-white/70 hover:text-[#C9A96E]"
            aria-label="Cart"
          >
            <FiShoppingCart className="h-4 w-4" />
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
  );
};

export default Navbar;
