import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';

const EMPTY_URL = '';

const AdminHomeBanners = () => {
  const [desktopBanners, setDesktopBanners] = useState([EMPTY_URL]);
  const [mobileBanners, setMobileBanners] = useState([EMPTY_URL]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.admin.getHomeBanners();
      const desktops = Array.isArray(data?.desktopBanners)
        ? data.desktopBanners.filter((url) => String(url || '').trim())
        : [];
      const mobiles = Array.isArray(data?.mobileBanners)
        ? data.mobileBanners.filter((url) => String(url || '').trim())
        : [];
      setDesktopBanners(desktops.length ? desktops : [data?.desktopSrc || EMPTY_URL]);
      setMobileBanners(mobiles.length ? mobiles : [data?.mobileSrc || EMPTY_URL]);
    } catch (e) {
      console.error('Failed to load home banners:', e);
      setError('Failed to load home banner settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const cleanUrls = (list) => list.map((url) => String(url || '').trim()).filter(Boolean);

  const setBannerAt = (setFn, list, index, value) => {
    setFn(list.map((item, i) => (i === index ? value : item)));
  };

  const addBanner = (setFn) => setFn((prev) => [...prev, EMPTY_URL]);
  const removeBanner = (setFn, index) =>
    setFn((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [EMPTY_URL];
    });

  const handleSave = async () => {
    const desktopList = cleanUrls(desktopBanners);
    const mobileList = cleanUrls(mobileBanners);

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await api.admin.updateHomeBanners({
        desktopBanners: desktopList,
        mobileBanners: mobileList,
      });
      setSuccess('Home banners updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await loadBanners();
    } catch (e) {
      setError(e.message || 'Failed to update home banners');
    } finally {
      setSaving(false);
    }
  };

  const previewInTab = (url) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-4 py-3">
          <p className="font-semibold text-gray-900">Manage Home Banners</p>
          <p className="text-xs text-gray-500">Update top homepage banners for desktop and mobile.</p>
        </div>

        <div className="p-4 space-y-6">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-600">Loading banner settings...</div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Desktop Banners</label>
                  <button
                    type="button"
                    onClick={() => addBanner(setDesktopBanners)}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    + Add desktop banner
                  </button>
                </div>

                {desktopBanners.map((url, index) => (
                  <div key={`desktop-${index}`} className="rounded-lg border bg-gray-50 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-gray-700">Desktop Banner {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeBanner(setDesktopBanners, index)}
                        className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setBannerAt(setDesktopBanners, desktopBanners, index, e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      placeholder="Enter desktop banner image URL"
                    />
                    {url && (
                      <div className="flex flex-wrap items-center gap-4">
                        <img
                          src={url}
                          alt={`Desktop banner ${index + 1}`}
                          className="h-28 w-full max-w-md rounded border bg-white object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => previewInTab(url)}
                          className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                        >
                          Open in New Tab
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Mobile Banners</label>
                  <button
                    type="button"
                    onClick={() => addBanner(setMobileBanners)}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    + Add mobile banner
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  These banners are shown only on mobile/tablet view.
                </p>

                {mobileBanners.map((url, index) => (
                  <div key={`mobile-${index}`} className="rounded-lg border bg-gray-50 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-gray-700">Mobile Banner {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeBanner(setMobileBanners, index)}
                        className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setBannerAt(setMobileBanners, mobileBanners, index, e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      placeholder="Enter mobile banner image URL"
                    />
                    {url && (
                      <div className="flex flex-wrap items-center gap-4">
                        <img
                          src={url}
                          alt={`Mobile banner ${index + 1}`}
                          className="h-32 w-full max-w-xs rounded border bg-white object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => previewInTab(url)}
                          className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                        >
                          Open in New Tab
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={`admin-primary-btn rounded-lg px-6 py-2 text-sm font-medium ${
                    saving ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Home Banners'}
                </button>
                <button
                  type="button"
                  onClick={loadBanners}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHomeBanners;
