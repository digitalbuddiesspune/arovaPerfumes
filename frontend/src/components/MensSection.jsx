import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSarees, fetchPricingSettings } from '../services/api';
import ProductImage from './ProductImage';
import { getProductPromoBadges } from '../utils/productBadges';

const getProductImages = (item) => {
  const fromGallery = Array.isArray(item?.imageGallery) ? item.imageGallery : [];
  const fromArray = Array.isArray(item?.images) ? item.images : [];
  const fromObject =
    item?.images && !Array.isArray(item.images) && typeof item.images === 'object'
      ? Object.values(item.images)
      : [];
  return [...fromGallery, ...fromArray, ...fromObject]
    .filter(Boolean)
    .map((img) => String(img).trim())
    .filter(Boolean);
};

const MensSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(8);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const [response, pricing] = await Promise.all([
          fetchSarees('men', { limit: 8 }),
          fetchPricingSettings(),
        ]);
        const list = Array.isArray(response) ? response : response?.products || [];
        if (!ignore) setProducts(list.slice(0, 4));
        if (!ignore && typeof pricing?.lowStockThreshold === 'number') {
          setLowStockThreshold(pricing.lowStockThreshold);
        }
      } catch {
        if (!ignore) setProducts([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="w-full bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-black tracking-wide">Men</h2>
          <p className="mt-2 text-xs sm:text-sm text-[#5f5f5f]">
            Discover your signature fragrance from our exclusive collection for Men
          </p>
          <Link
            to="/category/men"
            className="inline-block mt-3 bg-black text-white px-6 py-2 text-xs sm:text-sm tracking-wide hover:bg-gray-800 transition-colors"
          >
            DISCOVER
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((item) => {
            const id = item._id || item.id;
            if (!id) return null;
            const name = item.title || item.name || 'Perfume';
            const notes = item.type || item.subcategory || item.category || '';
            const price = Number(item.price || item.salePrice || item.mrp || 0);
            const mrp = Number(item.mrp || 0);
            const productImages = getProductImages(item);
            const img = productImages[0] || item.images?.image1 || item.image;
            const hoverImg = productImages[1];
            const { showBestSeller, showFewLeft } = getProductPromoBadges(item, lowStockThreshold);
            const highly = Array.isArray(item.tags) && item.tags.includes('Highly Recommended');

            return (
              <Link key={id} to={`/product/${id}`} className="group block">
                <div className="relative bg-white border border-gray-200 overflow-hidden">
                  <ProductImage src={img} alt={name} className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-500" />
                  {hoverImg ? (
                    <ProductImage
                      src={hoverImg}
                      alt={`${name} preview`}
                      className="absolute inset-0 w-full aspect-[4/5] object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                    />
                  ) : null}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start max-w-[88%] pointer-events-none">
                    {showBestSeller && (
                      <span className="bg-amber-500 text-white text-[9px] px-2 py-1 rounded-full font-semibold shadow-sm">
                        BEST SELLER
                      </span>
                    )}
                    {showFewLeft && (
                      <span className="bg-rose-600 text-white text-[9px] px-2 py-1 rounded-full font-semibold shadow-sm leading-tight">
                        FEW LEFT — HURRY
                      </span>
                    )}
                    {highly && (
                      <span className="bg-[#f16b80] text-white text-[9px] px-2 py-1 rounded-full font-semibold">
                        HIGHLY RECOMMENDED
                      </span>
                    )}
                  </div>
                </div>
                <div className="pt-3 text-center">
                  <h3 className="text-xs sm:text-sm font-semibold text-black line-clamp-1">{name}</h3>
                  {notes ? <p className="text-[11px] sm:text-xs text-gray-600 mt-1 line-clamp-1">{notes}</p> : <div className="h-4" />}
                  <p className="mt-1 text-sm font-bold text-black">Rs.{price.toLocaleString('en-IN')}</p>
                  {mrp > price ? (
                    <p className="text-xs text-gray-400 line-through">Rs.{mrp.toLocaleString('en-IN')}</p>
                  ) : (
                    <div className="h-4" />
                  )}
                  <span className="mt-3 block w-full border border-gray-400 text-xs sm:text-sm py-2.5 hover:bg-gray-50 transition-colors">
                    View Details
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MensSection;
