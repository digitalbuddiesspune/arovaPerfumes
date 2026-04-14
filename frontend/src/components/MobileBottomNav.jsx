import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// SVG Icons with dynamic color based on active state
const HomeIcon = ({ isActive }) => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" 
      stroke={isActive ? 'var(--brand-maroon)' : 'var(--brand-muted)'} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
    <path d="M9 22V12H15V22" 
      stroke={isActive ? 'var(--brand-maroon)' : 'var(--brand-muted)'} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
  </svg>
);

const WishlistIcon = ({ isActive }) => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.84 4.60999C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.49999C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12087 20.84 4.60999V4.60999Z" 
      stroke={isActive ? 'var(--brand-maroon)' : 'var(--brand-muted)'} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
  </svg>
);

const CartIcon = ({ isActive }) => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" 
      stroke={isActive ? 'var(--brand-maroon)' : 'var(--brand-muted)'} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
    <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" 
      stroke={isActive ? 'var(--brand-maroon)' : 'var(--brand-muted)'} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
    <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" 
      stroke={isActive ? 'var(--brand-maroon)' : 'var(--brand-muted)'} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
  </svg>
);

const AccountIcon = ({ isActive }) => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" 
      stroke={isActive ? 'var(--brand-maroon)' : 'var(--brand-muted)'} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" 
      stroke={isActive ? 'var(--brand-maroon)' : 'var(--brand-muted)'} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
  </svg>
);

const ShopIcon = ({ isActive }) => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 9.5L4.5 4.5H19.5L21 9.5M3 9.5V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9.5M3 9.5H21"
      stroke={isActive ? 'var(--brand-maroon)' : 'var(--brand-muted)'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M9 20V14H15V20"
      stroke={isActive ? 'var(--brand-maroon)' : 'var(--brand-muted)'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const MobileBottomNav = () => {
  const { cartCount } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const readWishlistCount = () => {
      try {
        const raw = localStorage.getItem('wishlist');
        const list = raw ? JSON.parse(raw) : [];
        setWishlistCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    readWishlistCount();
    const onStorage = (e) => { if (!e || e.key === 'wishlist') readWishlistCount(); };
    const onCustom = () => readWishlistCount();
    window.addEventListener('storage', onStorage);
    window.addEventListener('wishlist:updated', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wishlist:updated', onCustom);
    };
  }, []);

  const handleHomeClick = (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isShopActive =
    location.pathname === '/products' ||
    location.pathname.startsWith('/category/');

  return (
    <div className="fixed bottom-2 left-3 right-3 md:hidden z-40">
      <div className="relative h-16 rounded-[24px] border border-[var(--brand-border)] bg-white/95 backdrop-blur-lg shadow-[0_10px_24px_rgba(56,19,19,0.14)] px-2 pt-3">
        <div className="grid grid-cols-5 items-start">
          <Link
            to="/products"
            className={`flex flex-col items-center justify-center rounded-xl py-0.5 ${isShopActive ? 'text-[var(--brand-maroon)]' : 'text-[var(--brand-muted)]'} transition-all duration-300 group`}
            aria-label="Shop now"
            title="Shop now"
          >
            <div className={`p-1.5 rounded-full ${isShopActive ? 'bg-[#f5e9e4]' : 'group-hover:bg-[#f8f1ee]'} transition-all duration-300`}>
              <ShopIcon isActive={isShopActive} />
            </div>
          </Link>

          <Link
            to="/wishlist"
            className={`flex flex-col items-center justify-center rounded-xl py-0.5 ${isActive('/wishlist') ? 'text-[var(--brand-maroon)]' : 'text-[var(--brand-muted)]'} transition-all duration-300 group`}
            aria-label="Wishlist"
            title="Wishlist"
          >
            <div className={`p-1.5 rounded-full ${isActive('/wishlist') ? 'bg-[#f5e9e4]' : 'group-hover:bg-[#f8f1ee]'} transition-all duration-300 relative`}>
              <WishlistIcon isActive={isActive('/wishlist')} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--brand-maroon)] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </div>
          </Link>

          <div />

          <Link
            to="/cart"
            className={`flex flex-col items-center justify-center rounded-xl py-0.5 ${isActive('/cart') ? 'text-[var(--brand-maroon)]' : 'text-[var(--brand-muted)]'} transition-all duration-300 relative group`}
            aria-label="Cart"
            title="Cart"
          >
            <div className={`p-1.5 rounded-full ${isActive('/cart') ? 'bg-[#f5e9e4]' : 'group-hover:bg-[#f8f1ee]'} transition-all duration-300 relative`}>
              <CartIcon isActive={isActive('/cart')} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--brand-maroon)] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center rounded-xl py-0.5 ${isActive('/profile') ? 'text-[var(--brand-maroon)]' : 'text-[var(--brand-muted)]'} transition-all duration-300 group`}
            aria-label="Account"
            title="Account"
          >
            <div className={`p-1.5 rounded-full ${isActive('/profile') ? 'bg-[#f5e9e4]' : 'group-hover:bg-[#f8f1ee]'} transition-all duration-300`}>
              <AccountIcon isActive={isActive('/profile')} />
            </div>
          </Link>
        </div>

        <a
          href="/"
          onClick={handleHomeClick}
          className="absolute left-1/2 -translate-x-1/2 -top-4 flex flex-col items-center"
          aria-label="Home"
          title="Home"
        >
          <div className={`h-12 w-12 rounded-full border-[3px] border-white shadow-[0_6px_14px_rgba(56,19,19,0.18)] flex items-center justify-center ${isActive('/') ? 'bg-[#f5e9e4]' : 'bg-white'}`}>
            <span className="scale-110">
              <HomeIcon isActive={isActive('/')} />
            </span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default MobileBottomNav;
