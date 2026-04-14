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
    <footer className="relative overflow-hidden border-t border-[#d8c6bf] bg-gradient-to-b from-[#3b1515] via-[var(--brand-maroon)] to-[#2a0f0f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,rgba(0,0,0,0.25),transparent)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-20 sm:pb-10">
        <div className="mb-8 sm:mb-10 rounded-2xl border border-white/20 bg-white/10 px-4 sm:px-6 py-5 sm:py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-white/20 bg-white/10 p-2.5">
              <img
                src={FOOTER_LOGO_URL}
                alt="Arova"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#ead7d0]">Arova Perfume</p>
              <p className="text-sm sm:text-base text-[#f3e9e5]">From Earth to Essence</p>
            </div>
          </div>
          <Link
            to="/products"
            onClick={scrollToTop}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide text-[var(--brand-maroon)] hover:bg-[#f8ece8] transition-colors"
          >
            Shop Collection
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.1]">
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-white">Explore</h3>
            <ul className="space-y-2">
              {primaryLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-sm text-[#eddeda] transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.1]">
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-white">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-sm text-[#eddeda] transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.1] sm:col-span-2 lg:col-span-1">
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-white">Orders & Shipping</h3>
            <ul className="space-y-2">
              {shippingLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-sm text-[#eddeda] transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-white/15 pt-4 text-center text-xs text-[#e8d7d2] sm:mt-8">
          © {new Date().getFullYear()} Arova Perfume. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
