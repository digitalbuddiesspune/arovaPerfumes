import { Link } from 'react-router-dom';

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
    <footer className="bg-black text-white border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-20 sm:pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
          <div>
            <h3 className="text-sm font-semibold mb-3">Explore</h3>
            <ul className="space-y-1.5">
              {primaryLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} onClick={scrollToTop} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Support</h3>
            <ul className="space-y-1.5">
              {supportLinks.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link to={link.path} onClick={scrollToTop} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Orders and Shipping</h3>
            <ul className="space-y-1.5">
              {shippingLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} onClick={scrollToTop} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
