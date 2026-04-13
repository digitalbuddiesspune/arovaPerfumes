import { Link } from 'react-router-dom';

const FOOTER_LOGO_URL =
  'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776088789/Untitled_design_10_uqvf6x.png';

const Footer = () => {
  const primaryLinks = [
    { name: 'Legal Pages', path: '/legal' },
    { name: 'About Us', path: '/about' },
    { name: 'Social Proofs', path: '/social-proofs' },
  ];

  const supportLinks = [
    { name: 'Contact', path: '/contact' },
    { name: 'For grievances', path: '/contact' },
    { name: 'Terms & Services', path: '/terms' },
  ];

  const shippingLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Delivery & Returns Policy', path: '/returns' },
    { name: 'Shipping Policy', path: '/shipping' },
    { name: 'Track My Order', path: '/profile?tab=track' },
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="relative overflow-hidden bg-[var(--brand-maroon)] text-white border-t border-[#4d2121]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_45%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-20 sm:pb-8">
        <div className="mb-8 sm:mb-10 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-5 sm:py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/10 border border-white/20 p-2.5">
              <img
                src={FOOTER_LOGO_URL}
                alt="Arova"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#ead7d0]">Arova Perfume</p>
              <p className="text-sm sm:text-base text-[#f3e9e5]">From earth to essence</p>
            </div>
          </div>
          <Link
            to="/products"
            onClick={scrollToTop}
            className="inline-flex items-center justify-center rounded-full bg-white text-[var(--brand-maroon)] px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide hover:bg-[#f8ece8] transition-colors"
          >
            Shop Collection
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h3 className="text-sm font-semibold mb-3 text-white">Explore</h3>
            <ul className="space-y-2">
              {primaryLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-sm text-[#eddeda] hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <h3 className="text-sm font-semibold mb-3 text-white">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-sm text-[#eddeda] hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold mb-3 text-white">Orders & Shipping</h3>
            <ul className="space-y-2">
              {shippingLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-sm text-[#eddeda] hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 border-t border-white/15 text-center text-xs text-[#e8d7d2]">
          © {new Date().getFullYear()} Arova Perfume. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
