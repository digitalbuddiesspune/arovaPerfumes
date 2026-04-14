import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';

const EMPTY_SLIDE = { desktop: '', alt: '' };
const toSafeText = (value) => String(value || '').trim();

const AdminHeroSlider = () => {
  const [slides, setSlides] = useState([EMPTY_SLIDE]);
  const [mobileSrc, setMobileSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadHeroSlider();
  }, []);

  const loadHeroSlider = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.admin.getHeroSlider();
      const nextSlides = Array.isArray(data?.slides) && data.slides.length
        ? data.slides.map((slide) => ({
            desktop: toSafeText(slide?.desktop),
            alt: toSafeText(slide?.alt),
          }))
        : [EMPTY_SLIDE];
      setSlides(nextSlides);
      setMobileSrc(data.mobileSrc || '');
    } catch (e) {
      console.error('Failed to load hero slider:', e);
      setError('Failed to load hero slider settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = () => {
    setSlides((prev) => [...prev, { ...EMPTY_SLIDE }]);
  };

  const handleRemoveSlide = (index) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
    } else {
      setError('At least one slide is required');
    }
  };

  const handleSlideChange = (index, field, value) => {
    setSlides((prev) => prev.map((slide, i) => (
      i === index ? { ...slide, [field]: value } : slide
    )));
  };

  const moveSlide = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = temp;
      return next;
    });
  };

  const validSlides = slides
    .map((slide) => ({
      desktop: toSafeText(slide.desktop),
      alt: toSafeText(slide.alt),
    }))
    .filter((slide) => slide.desktop);

  const handleSave = async () => {
    if (validSlides.length === 0) {
      setError('At least one slide with a desktop URL is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await api.admin.updateHeroSlider({ 
        slides: validSlides, 
        mobileSrc: toSafeText(mobileSrc) || validSlides[0]?.desktop || '' 
      });
      
      setSuccess('Hero slider updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Reload to get the saved data
      await loadHeroSlider();
    } catch (e) {
      setError(e.message || 'Failed to update hero slider');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white border rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <p className="font-semibold text-gray-900">Manage Hero Slider Banners</p>
            <p className="text-xs text-gray-500">Control desktop slides and mobile fallback banner</p>
          </div>
          <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            Active slides: {validSlides.length}
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-600">Loading hero slider settings...</div>
          ) : (
            <>
              {/* Slides Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Desktop Slides ({slides.length})
                  </label>
                  <button
                    onClick={handleAddSlide}
                    className="admin-primary-btn rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    + Add Slide
                  </button>
                </div>
                
                <div className="space-y-4">
                  {slides.map((slide, index) => (
                    <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-800">Slide {index + 1}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveSlide(index, -1)}
                            disabled={index === 0}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSlide(index, 1)}
                            disabled={index === slides.length - 1}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Down
                          </button>
                          {slides.length > 1 && (
                            <button
                              onClick={() => handleRemoveSlide(index)}
                              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700 hover:bg-rose-100 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Desktop Image URL
                          </label>
                          <input
                            type="text"
                            value={slide.desktop}
                            onChange={(e) => handleSlideChange(index, 'desktop', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Enter desktop banner URL (e.g., Cloudinary URL)"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Alt Text (for accessibility)
                          </label>
                          <input
                            type="text"
                            value={slide.alt}
                            onChange={(e) => handleSlideChange(index, 'alt', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Enter alt text for this banner"
                          />
                        </div>
                        
                        {slide.desktop && (
                          <div className="rounded-lg border bg-white p-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
                            <div className="flex flex-wrap items-center gap-4">
                              <img 
                                src={slide.desktop} 
                                alt="Slide Preview" 
                                className="h-28 w-full max-w-md rounded border bg-white object-contain p-2"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const errorDiv = e.target.nextSibling;
                                  if (errorDiv) errorDiv.style.display = 'block';
                                }}
                              />
                              <div className="hidden text-xs text-rose-500">Failed to load image</div>
                              <button
                                onClick={() => handlePreview(slide.desktop)}
                                className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 transition-colors"
                              >
                                Open in New Tab
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Source Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={mobileSrc}
                    onChange={(e) => setMobileSrc(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Enter mobile banner URL (optional - will use first slide if not provided)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This image is shown on mobile devices. If left empty, the first desktop slide will be used.
                  </p>
                </div>
                
                {mobileSrc && (
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Mobile Preview:</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <img 
                        src={mobileSrc} 
                        alt="Mobile Banner Preview" 
                        className="h-32 w-full max-w-xs rounded border bg-white object-contain p-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorDiv = e.target.nextSibling;
                          if (errorDiv) errorDiv.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-red-500 text-sm">Failed to load image</div>
                      <button
                        onClick={() => handlePreview(mobileSrc)}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        Open in New Tab
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 border-t pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || validSlides.length === 0}
                  className={`admin-primary-btn rounded-lg px-6 py-2 text-sm font-medium ${
                    saving || validSlides.length === 0 ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Hero Slider'}
                </button>
                <button
                  onClick={loadHeroSlider}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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

export default AdminHeroSlider;







