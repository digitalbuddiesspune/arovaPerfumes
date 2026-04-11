import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const PriceSettings = () => {
  const [settings, setSettings] = useState({
    taxPercentage: 5,
    shippingCharge: 50,
    freeShippingMinAmount: 500,
    isFreeShippingEnabled: true,
    announcementMarquee:
      '• 1st Order - 50% Off • USE CODE SMELLGOOD5 TO GET EXTRA 5% OFF ON PREPAID ORDERS • GET A FREE SAMPLE ON EVERY ORDER •',
    lowStockThreshold: 8,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await settingsAPI.getPricing();
        if (res.data?.success && res.data?.settings) {
          const s = res.data.settings;
          setSettings((prev) => ({
            ...prev,
            ...s,
            announcementMarquee: s.announcementMarquee ?? prev.announcementMarquee,
            lowStockThreshold: typeof s.lowStockThreshold === 'number' ? s.lowStockThreshold : prev.lowStockThreshold,
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setMessage('Failed to load settings. Using defaults.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
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
      const res = await settingsAPI.updatePricing(settings);
      if (res.data?.success) {
        setMessage('✅ Price settings saved successfully!');
      } else {
        setMessage('❌ Failed to save settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ Error saving settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Price Settings</h2>
          <p className="text-slate-600 mt-1">
            Configure tax, shipping, free-shipping rules, top announcement text, and low-stock badges for the storefront.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tax Percentage */}
          <div className="bg-slate-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Tax Percentage (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="taxPercentage"
                value={settings.taxPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-32 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
              <span className="text-slate-600">%</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Tax will be calculated as: Items Price × (Tax% / 100)
            </p>
          </div>

          {/* Shipping Charge */}
          <div className="bg-slate-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Shipping Charge (₹)
            </label>
            <div className="flex items-center gap-4">
              <span className="text-slate-600">₹</span>
              <input
                type="number"
                name="shippingCharge"
                value={settings.shippingCharge}
                onChange={handleChange}
                min="0"
                className="w-32 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Standard shipping charge applied to all orders (unless free shipping criteria is met)
            </p>
          </div>

          {/* Free Shipping Settings */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-slate-900">
                Enable Free Shipping
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isFreeShippingEnabled"
                  checked={settings.isFreeShippingEnabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>

            {settings.isFreeShippingEnabled && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Free Shipping Minimum Amount (₹)
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-slate-600">₹</span>
                  <input
                    type="number"
                    name="freeShippingMinAmount"
                    value={settings.freeShippingMinAmount}
                    onChange={handleChange}
                    min="0"
                    className="w-32 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Orders with items price ≥ this amount will get FREE shipping
                </p>
                <p className="text-sm text-green-700 mt-2 font-medium">
                  💡 Message shown to customers: "Free shipping on orders above ₹{settings.freeShippingMinAmount}"
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Top announcement (scrolling marquee)
              </label>
              <textarea
                name="announcementMarquee"
                value={settings.announcementMarquee || ''}
                onChange={handleChange}
                rows={3}
                maxLength={2000}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                placeholder="Offers, codes, and promos — shown on the site header"
              />
              <p className="text-xs text-slate-500 mt-1">
                Shown in the black bar above the main nav. Clear and save to reset to default copy (server).
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Low-stock threshold (auto &quot;Few left&quot; badge)
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={settings.lowStockThreshold}
                onChange={handleChange}
                min={0}
                max={9999}
                className="w-32 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
              <p className="text-xs text-slate-500 mt-2">
                If quantity is between 1 and this number (and the product does not already use the manual tag), the storefront shows &quot;Only few left&quot;. Use 0 to turn off auto badges (manual tag still works).
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">📊 Price Calculation Preview</h4>
            <div className="text-sm text-amber-800 space-y-1">
              <p>• Items Price: Sum of all products</p>
              <p>• Tax: Items Price × {settings.taxPercentage}%</p>
              <p>• Shipping: {settings.isFreeShippingEnabled 
                ? `FREE if items ≥ ₹${settings.freeShippingMinAmount}, else ₹${settings.shippingCharge}` 
                : `₹${settings.shippingCharge} (always)`}
              </p>
              <p>• Total: Items + Tax + Shipping - Discount</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PriceSettings;
