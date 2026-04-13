import { useEffect, useState } from 'react';
import { api } from '../../utils/api';

const emptyForm = {
  code: '',
  discountPlan: 'P10',
  discountType: 'percentage',
  discountValue: '10',
  expiryDate: '',
  usageLimit: '',
  isActive: true,
};

const DISCOUNT_PLANS = [
  { id: 'P10', label: '10% OFF', discountType: 'percentage', discountValue: 10 },
  { id: 'P20', label: '20% OFF', discountType: 'percentage', discountValue: 20 },
  { id: 'P30', label: '30% OFF', discountType: 'percentage', discountValue: 30 },
  { id: 'F100', label: 'Flat Rs100 OFF', discountType: 'fixed', discountValue: 100 },
  { id: 'F200', label: 'Flat Rs200 OFF', discountType: 'fixed', discountValue: 200 },
  { id: 'F500', label: 'Flat Rs500 OFF', discountType: 'fixed', discountValue: 500 },
];

const getPlanIdFromCoupon = (coupon) => {
  const found = DISCOUNT_PLANS.find(
    (plan) =>
      plan.discountType === coupon.discountType &&
      Number(plan.discountValue) === Number(coupon.discountValue)
  );
  return found?.id || 'P10';
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCouponId, setDeleteCouponId] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.admin.couponsList();
      setCoupons(res?.data || []);
    } catch (e) {
      showMessage(e.message || 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'discountPlan') {
        const selected = DISCOUNT_PLANS.find((plan) => plan.id === value);
        if (selected) {
          next.discountType = selected.discountType;
          next.discountValue = String(selected.discountValue);
        }
      }
      return next;
    });
  };

  const resetForm = () => {
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountPlan || !formData.expiryDate) {
      showMessage('Please fill all required fields', 'error');
      return;
    }
    const payload = {
      code: formData.code.toUpperCase().trim(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: 0,
      maxDiscount: null,
      expiryDate: formData.expiryDate,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      isActive: formData.isActive,
      isFirstOrderOnly: false,
    };
    try {
      await api.admin.couponCreate(payload);
      showMessage('Coupon created successfully!');
      resetForm();
      setShowForm(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (e) {
      showMessage(e.message || 'Failed to create coupon', 'error');
    }
  };

  const confirmDelete = (id) => {
    setDeleteCouponId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await api.admin.couponDelete(deleteCouponId);
      showMessage('Coupon deleted successfully!');
      fetchCoupons();
    } catch (e) {
      showMessage(e.message || 'Failed to delete coupon', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteCouponId(null);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.admin.couponToggle(id);
      showMessage('Coupon status updated!');
      fetchCoupons();
    } catch (e) {
      showMessage(e.message || 'Failed to toggle status', 'error');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountPlan: getPlanIdFromCoupon(coupon),
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      isActive: coupon.isActive,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCoupon) return;
    const payload = {
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: 0,
      maxDiscount: null,
      expiryDate: formData.expiryDate,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      isActive: formData.isActive,
      isFirstOrderOnly: false,
    };
    try {
      await api.admin.couponUpdate(editingCoupon._id, payload);
      showMessage('Coupon updated successfully!');
      resetForm();
      setShowForm(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (e) {
      showMessage(e.message || 'Failed to update coupon', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    const isExpired = now > expiry;
    const isLimitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
    if (!coupon.isActive) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">Inactive</span>;
    }
    if (isExpired) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">Expired</span>;
    }
    if (isLimitReached) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">Limit reached</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Active</span>;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Codes apply in the storefront cart when customers are signed in.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Total: {coupons.length}</span>
          <button
            type="button"
            onClick={() => {
              if (showForm && editingCoupon) {
                setEditingCoupon(null);
                resetForm();
              }
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700"
          >
            {showForm ? (editingCoupon ? 'Cancel edit' : 'Close') : '+ Create coupon'}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            messageType === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-800'
          }`}
        >
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingCoupon ? 'Edit coupon' : 'New coupon'}</h2>
          <form onSubmit={editingCoupon ? handleUpdate : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                disabled={!!editingCoupon}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase disabled:bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">How should discount work? *</label>
              <select
                name="discountPlan"
                value={formData.discountPlan}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {DISCOUNT_PLANS.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry date *</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage limit (optional)</label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                min="1"
                placeholder="Unlimited if empty"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === true}
                    onChange={() => setFormData((prev) => ({ ...prev, isActive: true }))}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === false}
                    onChange={() => setFormData((prev) => ({ ...prev, isActive: false }))}
                  />
                  Deactive
                </label>
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-2">
              <button type="submit" className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700">
                {editingCoupon ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditingCoupon(null);
                  setShowForm(false);
                }}
                className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-gray-500">Loading…</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No coupons yet. Create one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded text-sm">{coupon.code}</span>
                      {coupon.isFirstOrderOnly && (
                        <span className="ml-2 text-xs text-blue-600">First order</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : formatPrice(coupon.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(coupon.expiryDate)}</td>
                    <td className="px-4 py-3">{getStatusBadge(coupon)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(coupon._id)}
                          className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200"
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button type="button" onClick={() => handleEdit(coupon)} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200">
                          Edit
                        </button>
                        <button type="button" onClick={() => confirmDelete(coupon._id)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete coupon?</h3>
            <p className="text-sm text-gray-500 mb-4">This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
