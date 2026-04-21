import { Link } from 'react-router-dom';

const FOOTER_LOGO_URL =
  'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776088789/Untitled_design_10_uqvf6x.png';

const Footer = () => {
  const supportLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Track My Order', path: '/profile?tab=track' },
  ];

  const shippingLinks = [
    { name: 'Terms & Services', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Return & Refund Policy', path: '/returns' },
    { name: 'Shipping Policy', path: '/shipping' },
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="relative overflow-hidden bg-[#1a0a04] text-white">
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8 lg:px-12">
        <div className="mb-14 grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <Link to="/" onClick={scrollToTop} className="rounded-full border border-white/15 bg-white/5 p-3">
                <img
                  src={FOOTER_LOGO_URL}
                  alt="Arova"
                  className="h-10 w-auto object-contain sm:h-12"
                  loading="lazy"
                />
              </Link>
              <div>
                <p className="font-[var(--font-cinzel)] text-[11px] uppercase tracking-[0.34em] text-[var(--luxury-gold)]">
                  AROVA
                </p>
                <p className="mt-1 font-[var(--font-cormorant)] text-xl italic text-[#f1e4de]">
                  From Earth to Essence
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-sm font-[var(--font-jost)] text-sm leading-7 text-[rgba(245,240,232,0.58)]">
              Clean, long-lasting perfumery crafted from earth&apos;s finest essences. Skin-friendly formulas for those who live beautifully.
            </p>
            <Link
              to="/products"
              onClick={scrollToTop}
              className="mt-7 inline-flex items-center justify-center border border-[var(--luxury-gold)] px-6 py-3 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.24em] text-[var(--luxury-gold)] transition duration-300 hover:bg-[var(--luxury-gold)] hover:text-[#1a0a04]"
            >
              Shop Collection
            </Link>
          </div>

          <div>
            <h3 className="mb-5 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.28em] text-[var(--luxury-gold)]">
              Support
            </h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="font-[var(--font-jost)] text-sm text-[rgba(245,240,232,0.58)] transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.28em] text-[var(--luxury-gold)]">
              Legal Pages
            </h3>
            <ul className="space-y-2">
              {shippingLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="font-[var(--font-jost)] text-sm text-[rgba(245,240,232,0.58)] transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-[rgba(245,240,232,0.48)] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-[var(--font-jost)]">
            © {new Date().getFullYear()} Arova. All rights reserved. Crafted in Nagpur, India.
          </p>
          <p className="font-[var(--font-cinzel)] uppercase tracking-[0.22em] text-[var(--luxury-gold)]/80">
            Luxury. Layered. Lasting.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
