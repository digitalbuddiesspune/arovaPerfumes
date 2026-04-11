/** Shared admin sidebar + mobile drawer links */
export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Products', to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'Orders', to: '/orders' },
  { label: 'Coupons', to: '/coupons' },
  { label: 'Users', to: '/users' },
  { label: 'Price Settings', to: '/price-settings' },
]

export function navItemIsActive(pathname, itemTo) {
  if (itemTo === '/orders') {
    return pathname.startsWith('/orders')
  }
  return pathname === itemTo || pathname.startsWith(`${itemTo}/`)
}
