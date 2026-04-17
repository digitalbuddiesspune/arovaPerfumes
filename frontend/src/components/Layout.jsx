import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const headerWrapRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const updateHeight = () => {
      if (headerWrapRef.current) {
        setHeaderHeight(headerWrapRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--brand-cream)]" style={{ '--app-header-height': `${headerHeight}px` }}>
      {/* Navbar and Header - Fixed at top */}
      <div ref={headerWrapRef} className="fixed top-0 left-0 right-0 z-[140] bg-[var(--brand-cream)]">
        <div className="border-t-0">
          <Navbar />
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
