import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Box, LayoutGrid, LogOut, Search, ShoppingBag, SlidersHorizontal, Tag, Truck, User } from 'lucide-react';

const Title = () => {
  const { pathname } = useLocation();
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.startsWith('/admin/products')) return 'Products';
  if (pathname.startsWith('/admin/orders')) return 'Orders';
  if (pathname.startsWith('/admin/policies')) return 'Policies';
  if (pathname.startsWith('/admin/hero-slider')) return 'Hero Slider';
  if (pathname.startsWith('/admin/coupons')) return 'Coupons';
  if (pathname.startsWith('/admin/shipping-pricing')) return 'Shipping & pricing';
  return 'Admin';
};

const AdminLayout = () => {
  const adminLogoUrl = 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776088789/Untitled_design_10_uqvf6x.png';
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_is_admin');
    } catch {}
    navigate('/signin', { replace: true });
  };

  const navItem = (to, label, Icon) => (
    <NavLink
      to={to}
      end={to === '/admin'}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        'flex items-center gap-3 rounded-md border-l-2 px-4 py-2 transition-colors ' +
        (isActive
          ? 'border-l-white bg-white/15 text-white'
          : 'border-l-transparent text-white/85 hover:bg-white/10 hover:text-white')
      }
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </NavLink>
  );

  return (
    <div className="admin-theme h-screen overflow-hidden bg-[var(--bg)]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] text-white p-4 space-y-2 shadow-xl">
          <div className="px-2 py-3">
            <img src={adminLogoUrl} alt="Arova Admin" className="h-10 w-auto object-contain" />
          </div>
          {navItem('/admin', 'Dashboard', LayoutGrid)}
          {navItem('/admin/products', 'Products', Box)}
          {navItem('/admin/orders', 'Orders', ShoppingBag)}
          {navItem('/admin/policies', 'Policies', BookOpen)}
          {navItem('/admin/hero-slider', 'Hero Slider', SlidersHorizontal)}
          {navItem('/admin/coupons', 'Coupons', Tag)}
          {navItem('/admin/shipping-pricing', 'Shipping & pricing', Truck)}
          <button
            onClick={() => navigate('/')}
            className="mt-auto flex items-center gap-3 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 rounded-md text-white/90 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </aside>

        {open && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] text-white p-4 space-y-2 shadow-xl">
              <div className="px-2 py-3">
                <img src={adminLogoUrl} alt="Arova Admin" className="h-10 w-auto object-contain" />
              </div>
              {navItem('/admin', 'Dashboard', LayoutGrid)}
              {navItem('/admin/products', 'Products', Box)}
              {navItem('/admin/orders', 'Orders', ShoppingBag)}
              {navItem('/admin/policies', 'Policies', BookOpen)}
              {navItem('/admin/hero-slider', 'Hero Slider', SlidersHorizontal)}
              {navItem('/admin/coupons', 'Coupons', Tag)}
              {navItem('/admin/shipping-pricing', 'Shipping & pricing', Truck)}
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/');
                }}
                className="mt-auto flex items-center gap-3 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Home</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-2 rounded-md text-white/90 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 min-w-0 md:ml-64 h-screen flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white shadow-sm border-b px-4 sm:px-6 py-3 flex items-center gap-3">
            <button className="md:hidden p-2 rounded bg-gray-100 text-gray-700" onClick={() => setOpen(true)}>
              <span className="sr-only">Menu</span>
              <div className="w-5 h-0.5 bg-gray-700 mb-1" />
              <div className="w-4 h-0.5 bg-gray-700 mb-1" />
              <div className="w-3 h-0.5 bg-gray-700" />
            </button>
            <h1 className="admin-title text-lg font-semibold mr-auto">{<Title />}</h1>
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-3">
              <Search className="h-4 w-4 text-gray-500" />
              <input className="bg-transparent px-2 py-1 outline-none text-sm" placeholder="Search..." />
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              <User className="h-4 w-4" />
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
