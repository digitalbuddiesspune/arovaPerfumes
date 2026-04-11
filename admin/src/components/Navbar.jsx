import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ADMIN_NAV_ITEMS, navItemIsActive } from '../config/adminNav'

const titleMap = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/products/add': 'Add Product',
  '/categories': 'Categories',
  '/orders': 'Orders',
  '/users': 'Users',
  '/coupons': 'Coupons',
  '/price-settings': 'Price Settings',
}

const Navbar = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const pageTitle = location.pathname.startsWith('/products/edit/')
    ? 'Edit Product'
    : location.pathname.startsWith('/orders/')
      ? 'Order details'
      : titleMap[location.pathname] || 'Admin'

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="md:hidden shrink-0 rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
              aria-expanded={mobileMenuOpen}
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-slate-900 truncate">{pageTitle}</h2>
          </div>
          <span className="text-xs md:text-sm text-slate-500 shrink-0">Admin Console</span>
        </div>
      </header>

      {/* Mobile drawer: same links as desktop sidebar, including Coupons */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[min(18rem,88vw)] bg-slate-900 text-white shadow-xl flex flex-col">
            <div className="px-4 py-4 border-b border-slate-700 flex items-center justify-between">
              <span className="font-semibold text-sm">Menu</span>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-200"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
              {ADMIN_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={() =>
                    `block px-3 py-2.5 rounded-lg text-sm transition ${
                      navItemIsActive(location.pathname, item.to)
                        ? 'bg-white text-slate-900 font-semibold'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}

export default Navbar
