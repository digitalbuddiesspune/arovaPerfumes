import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';

const defaults = {
  taxPercentage: 5,
  shippingCharge: 50,
  freeShippingMinAmount: 500,
  isFreeShippingEnabled: true,
  announcementMarquee:
    '• 1st Order - 50% Off • USE CODE SMELLGOOD5 TO GET EXTRA 5% OFF ON PREPAID ORDERS • GET A FREE SAMPLE ON EVERY ORDER •',
  lowStockThreshold: 8,
};

export default function AdminPriceSettings() {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.admin.getPricingSettings();
        if (!cancelled && res?.success && res?.settings) {
          const s = res.settings;
          setSettings((prev) => ({
            ...prev,
            ...s,
            announcementMarquee: s.announcementMarquee ?? prev.announcementMarquee,
            lowStockThreshold:
              typeof s.lowStockThreshold === 'number' ? s.lowStockThreshold : prev.lowStockThreshold,
          }));
        }
      } catch (e) {
        if (!cancelled) setMessage('Failed to load settings. Using defaults.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'announcementMarquee') {
      setSettings((prev) => ({ ...prev, announcementMarquee: value }));
      return;
    }
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      const res = await api.admin.updatePricingSettings(settings);
      if (res?.success) {
        setMessage('Settings saved.');
        if (res.settings) {
          setSettings((prev) => ({
            ...prev,
            ...res.settings,
            announcementMarquee: res.settings.announcementMarquee ?? prev.announcementMarquee,
          }));
        }
      } else {
        setMessage('Could not save settings.');
      }
    } catch (err) {
      setMessage(err?.message || 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-gray-600">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-900 mx-auto" />
        <p className="mt-4">Loading pricing…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900">Shipping &amp; pricing</h1>
        <p className="text-sm text-gray-600 mt-1 mb-6">
          Shipping charge, free-shipping threshold, tax, header marquee, and low-stock badge threshold for the storefront.
        </p>

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm ${
              message.includes('saved')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Tax (%)</label>
            <input
              type="number"
              name="taxPercentage"
              value={settings.taxPercentage}
              onChange={handleChange}
              min={0}
              max={100}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Shipping charge (₹)</label>
            <p className="text-xs text-gray-500">Applied when free shipping does not apply.</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">₹</span>
              <input
                type="number"
                name="shippingCharge"
                value={settings.shippingCharge}
                onChange={handleChange}
                min={0}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 space-y-4">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm font-semibold text-gray-900">Enable free shipping</span>
              <input
                type="checkbox"
                name="isFreeShippingEnabled"
                checked={settings.isFreeShippingEnabled}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
            </label>
            {settings.isFreeShippingEnabled && (
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Free shipping from cart subtotal (₹)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">₹</span>
                  <input
                    type="number"
                    name="freeShippingMinAmount"
                    value={settings.freeShippingMinAmount}
                    onChange={handleChange}
                    min={0}
                    className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 p-4 space-y-3">
            <label className="block text-sm font-semibold text-gray-900">Announcement marquee</label>
            <textarea
              name="announcementMarquee"
              value={settings.announcementMarquee || ''}
              onChange={handleChange}
              rows={3}
              maxLength={2000}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <label className="block text-sm font-semibold text-gray-900">Low-stock threshold</label>
            <input
              type="number"
              name="lowStockThreshold"
              value={settings.lowStockThreshold}
              onChange={handleChange}
              min={0}
              max={9999}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500">0 turns off automatic &quot;few left&quot; badges.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
