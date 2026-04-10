import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSarees } from '../services/api';

const BestSellers = () => {
  const FALLBACK_IMAGE = 'https://res.cloudinary.com/dnyp5jknp/image/upload/v1775567474/d3b4e9cd-feaf-4362-9a38-20c30bbb5db9.png';
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        setLoading(true);

        // Fetch all products without category filter
        const res = await fetchSarees(null, { limit: 50 });
        const products = Array.isArray(res) ? res : res?.products || [];

        // Filter products marked as isBestSeller
        const bestSellersList = products.filter((p) => p.isBestSeller === true).slice(0, 4);

        if (!ignore) {
          setBestSellers(bestSellersList);
        }
      } catch {
        if (!ignore) {
          setBestSellers([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-wide text-[#1f1a17] mb-3">
            BEST SELLERS
          </h2>
          <p className="text-sm sm:text-base text-[#6a5d52]">
            Most loved picks from our premium collection
          </p>
        </div>

        {loading ? (
          <p className="text-center text-sm text-[#7a6a5d] mb-6">Loading best sellers...</p>
        ) : bestSellers.length === 0 ? (
          <p className="text-center text-sm text-[#7a6a5d] mb-6">No best sellers found.</p>
        ) : null}

        {bestSellers.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => {
            const id = product._id || product.id;
            const price = Number(product.price || product.salePrice || product.mrp || 0);
            const mrp = Number(product.mrp || 0);
            const image = product.images?.image1 || product.image || FALLBACK_IMAGE;
            const rating = Number(product.rating || 0);
            const reviews = Number(product.totalReviews || 0);

            return (
              <Link key={id} to={`/product/${id}`} className="group">
                <div className="rounded-2xl border border-[#eee7e1] bg-[#fcfaf8] overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[3/4] bg-[#f2ebe6] overflow-hidden">
                    <img
                      src={image}
                      alt={product.title || 'Best seller perfume'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 text-[#6f5039] text-[10px] px-2 py-1 rounded-full font-semibold tracking-wide">
                      BEST SELLER
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm sm:text-base font-semibold text-[#2b231d] line-clamp-1">
                      {product.title || 'Perfume'}
                    </h3>
                    <p className="text-xs text-[#7a6a5d] mt-1">
                      {product.brand || product.product_info?.brand || 'Arova Perfume'}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[#4a3023] font-bold">Rs.{price.toLocaleString('en-IN')}</span>
                        {mrp > price && <span className="text-xs text-gray-400 line-through">Rs.{mrp.toLocaleString('en-IN')}</span>}
                      </div>
                      <span className="text-[11px] text-[#5f554d]">{rating.toFixed(1)} ({reviews})</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;

