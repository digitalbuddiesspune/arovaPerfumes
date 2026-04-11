import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI, couponAPI } from '../services/api'

const StatCard = ({ title, value, loading }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">{title}</p>
    <h3 className="text-3xl font-bold text-slate-900 mt-2">
      {loading ? '...' : value}
    </h3>
  </div>
)

const defaultCouponForm = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '0',
  maxDiscount: '',
  expiryDate: '',
  usageLimit: '',
  isActive: true,
  isFirstOrderOnly: false,
}

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [couponSummary, setCouponSummary] = useState({ total: 0, active: 0 })
  const [couponsLoading, setCouponsLoading] = useState(true)
  const [couponForm, setCouponForm] = useState(defaultCouponForm)
  const [couponSaving, setCouponSaving] = useState(false)
  const [couponMessage, setCouponMessage] = useState('')
  const [couponMessageType, setCouponMessageType] = useState('success')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await dashboardAPI.getStats()
        const data = res?.data || {}

        setStats({
          users: data.usersCount || data.totalUsers || data.users || 0,
          products: data.productsCount || data.totalProducts || data.products || 0,
          orders: data.ordersCount || data.totalOrders || data.orders || 0,
          revenue: data.revenue || data.totalRevenue || 0,
        })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const loadCouponSummary = async () => {
    try {
      setCouponsLoading(true)
      const res = await couponAPI.getAll()
      const list = res?.data?.data || []
      const now = new Date()
      const active = list.filter((c) => {
        if (!c.isActive) return false
        if (new Date(c.expiryDate) < now) return false
        if (c.usageLimit != null && c.usedCount >= c.usageLimit) return false
        return true
      }).length
      setCouponSummary({ total: list.length, active })
    } catch {
      setCouponSummary({ total: 0, active: 0 })
    } finally {
      setCouponsLoading(false)
    }
  }

  useEffect(() => {
    loadCouponSummary()
  }, [])

  const showCouponToast = (msg, type = 'success') => {
    setCouponMessage(msg)
    setCouponMessageType(type)
    setTimeout(() => setCouponMessage(''), 4000)
  }

  const handleCouponField = (e) => {
    const { name, value, type, checked } = e.target
    setCouponForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    if (!couponForm.code?.trim() || !couponForm.discountValue || !couponForm.expiryDate) {
      showCouponToast('Please fill code, discount value, and expiry date.', 'error')
      return
    }
    const payload = {
      code: couponForm.code.toUpperCase().trim(),
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      minOrderAmount: Number(couponForm.minOrderAmount) || 0,
      maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : null,
      expiryDate: couponForm.expiryDate,
      usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null,
      isActive: couponForm.isActive,
      isFirstOrderOnly: couponForm.isFirstOrderOnly,
    }
    try {
      setCouponSaving(true)
      await couponAPI.create(payload)
      showCouponToast(`Coupon ${payload.code} created. Customers can apply it in the cart.`)
      setCouponForm(defaultCouponForm)
      await loadCouponSummary()
    } catch (err) {
      showCouponToast(err.response?.data?.message || 'Failed to create coupon', 'error')
    } finally {
      setCouponSaving(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.users} loading={loading} />
        <StatCard title="Total Products" value={stats.products} loading={loading} />
        <StatCard title="Total Orders" value={stats.orders} loading={loading} />
        <StatCard title="Revenue" value={`₹${stats.revenue}`} loading={loading} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Coupons</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Create codes shoppers enter in the storefront cart. Same coupons as the{' '}
              <Link to="/coupons" className="text-purple-700 font-medium hover:underline">
                Coupons
              </Link>{' '}
              page.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600">
              Total:{' '}
              <span className="font-semibold text-slate-900">
                {couponsLoading ? '…' : couponSummary.total}
              </span>
            </span>
            <span className="text-slate-600">
              Usable now:{' '}
              <span className="font-semibold text-emerald-700">
                {couponsLoading ? '…' : couponSummary.active}
              </span>
            </span>
          </div>
        </div>

        {couponMessage && (
          <div
            className={`mx-5 mt-4 rounded-lg border px-3 py-2 text-sm ${
              couponMessageType === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-800'
            }`}
          >
            {couponMessage}
          </div>
        )}

        <form onSubmit={handleCreateCoupon} className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Coupon code <span className="text-red-500">*</span>
            </label>
            <input
              name="code"
              value={couponForm.code}
              onChange={handleCouponField}
              placeholder="e.g. WELCOME10"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Discount type</label>
            <select
              name="discountType"
              value={couponForm.discountType}
              onChange={handleCouponField}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Discount value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="discountValue"
              value={couponForm.discountValue}
              onChange={handleCouponField}
              min="0"
              max={couponForm.discountType === 'percentage' ? '100' : undefined}
              placeholder={couponForm.discountType === 'percentage' ? '20' : '500'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Min order (₹)</label>
            <input
              type="number"
              name="minOrderAmount"
              value={couponForm.minOrderAmount}
              onChange={handleCouponField}
              min="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max discount (₹)</label>
            <input
              type="number"
              name="maxDiscount"
              value={couponForm.maxDiscount}
              onChange={handleCouponField}
              min="0"
              disabled={couponForm.discountType === 'fixed'}
              placeholder="Cap for % coupons"
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                couponForm.discountType === 'fixed' ? 'bg-slate-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Expiry date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expiryDate"
              value={couponForm.expiryDate}
              onChange={handleCouponField}
              min={today}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usage limit</label>
            <input
              type="number"
              name="usageLimit"
              value={couponForm.usageLimit}
              onChange={handleCouponField}
              min="1"
              placeholder="Unlimited if empty"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex flex-col gap-3 justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={couponForm.isActive}
                onChange={handleCouponField}
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-700">Active (usable on site)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFirstOrderOnly"
                checked={couponForm.isFirstOrderOnly}
                onChange={handleCouponField}
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-700">First order only</span>
            </label>
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={couponSaving}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
            >
              {couponSaving ? 'Creating…' : 'Create coupon'}
            </button>
            <button
              type="button"
              onClick={() => setCouponForm(defaultCouponForm)}
              className="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200"
            >
              Reset form
            </button>
            <Link
              to="/coupons"
              className="text-sm text-purple-700 font-medium hover:underline"
            >
              Edit, delete, or toggle coupons →
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Dashboard
