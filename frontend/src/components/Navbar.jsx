import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BRAND_LOGO_URL =
  'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776086342/Untitled_design_9_fc6qsg.png';

const navItems = [
  { label: 'Collections', href: '#collections' },
  { label: 'Our Story', href: '#story' },
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

        <Link
          to="/products"
          className="inline-flex min-h-11 items-center justify-center border border-[#2C1008] px-6 [font-family:'Cinzel',serif] text-[10px] uppercase tracking-[0.2em] text-[#2C1008] transition-all duration-300 hover:bg-[#2C1008] hover:text-[#F5F0E8]"
        >
          Shop Now
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
