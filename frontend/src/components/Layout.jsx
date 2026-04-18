import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { fetchPricingSettings } from '../services/api';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';

/** Fallback so content never sits under the fixed header before measure (mobile overlap fix). */
const DEFAULT_HEADER_HEIGHT_PX = 72;

const Layout = () => {
  const location = useLocation();
  const headerWrapRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT_PX);
  const [homeAnnouncementMarquee, setHomeAnnouncementMarquee] = useState(
    '1st Order - 50% Off ✦ Use Code SMELLGOOD5 for extra 5% off on prepaid orders ✦'
  );
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isHomePage) return;
    let ignore = false;
    (async () => {
      try {
        const pricing = await fetchPricingSettings();
        if (!ignore && pricing?.announcementMarquee && String(pricing.announcementMarquee).trim()) {
          setHomeAnnouncementMarquee(String(pricing.announcementMarquee).trim());
        }
      } catch {
        /* keep default */
      }
    })();
    return () => {
      ignore = true;
    };
  }, [isHomePage]);

  useLayoutEffect(() => {
    const el = headerWrapRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.offsetHeight;
      if (h > 0) setHeaderHeight(h);
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    window.addEventListener('resize', updateHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--brand-cream)]" style={{ '--app-header-height': `${headerHeight}px` }}>
      {/* Navbar and Header - Fixed at top */}
      <div ref={headerWrapRef} className="fixed top-0 left-0 right-0 z-[140] bg-[var(--brand-cream)]">
        <div className="border-t-0">
          <Navbar announcementMarquee={isHomePage ? homeAnnouncementMarquee : ''} />
        </div>
        <div className="h-px bg-black/10" aria-hidden="true" />
        <Header />
      </div>

      {/* Spacer equal to header height to avoid overlap */}
      <div aria-hidden="true" style={{ height: headerHeight }} className="bg-[var(--brand-cream)] border-b border-[var(--brand-border)]" />

      {/* Main Content Area with responsive padding */}
      <main className={`flex-grow ${isHomePage ? 'pb-0' : 'pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0'}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
