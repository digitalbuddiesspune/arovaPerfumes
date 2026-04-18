import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { fetchSarees, fetchPricingSettings } from '../services/api';
import { getProductPromoBadges } from '../utils/productBadges';
import { formatDiscountPercent } from '../utils/formatDiscountPercent';
import ProductImage from './ProductImage';

const readWishlist = () => {
  try {
    const raw = localStorage.getItem('wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeWishlist = (items) => {
  try {
    localStorage.setItem('wishlist', JSON.stringify(items));
  } catch {}
};

const ProductSuggestions = ({ currentProductId, category, maxProducts = 8 }) => {
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const s = await fetchPricingSettings();
        if (!ignore && typeof s.lowStockThreshold === 'number') setLowStockThreshold(s.lowStockThreshold);
      } catch {
        /* default */
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setLoading(true);
        // Fetch products from the same category
        const categoryName = category || '';
        const allProducts = await fetchSarees(categoryName);
        
        // Filter out the current product and limit to maxProducts
        const filtered = (allProducts || [])
          .filter(product => {
            const productId = product._id || product.id;
            return productId !== currentProductId;
          })
          .slice(0, maxProducts);
        
        setSuggestedProducts(filtered);
      } catch (error) {
        console.error('Error loading product suggestions:', error);
        setSuggestedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentProductId) {
      loadSuggestions();
    }
  }, [currentProductId, category, maxProducts]);

  useEffect(() => {
    const list = readWishlist();
    setWishlistItems(list);
    
    const handleWishlistUpdate = () => {
      const updatedList = readWishlist();
      setWishlistItems(updatedList);
    };
    
    window.addEventListener('wishlist:updated', handleWishlistUpdate);
    window.addEventListener('storage', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlist:updated', handleWishlistUpdate);
      window.removeEventListener('storage', handleWishlistUpdate);
    };
  }, []);

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    const pid = product._id || product.id;
    const list = readWishlist();
    const exists = list.some(p => (p._id || p.id) === pid);
    
    if (exists) {
      const next = list.filter(p => (p._id || p.id) !== pid);
      writeWishlist(next);
      setWishlistItems(next);
      try { window.dispatchEvent(new Event('wishlist:updated')); } catch {}
    } else {
      const sellingPrice = product.price || Math.round(product.mrp - (product.mrp * (product.discountPercent || 0) / 100));
      const item = {
        _id: pid,
        title: product.title,
        images: product.images,
        price: sellingPrice,
        mrp: product.mrp,
        discountPercent: product.discountPercent || 0,
      };
      const next = [item, ...list.filter((p) => (p._id || p.id) !== pid)];
      writeWishlist(next);
      setWishlistItems(next);
      try { window.dispatchEvent(new Event('wishlist:updated')); } catch {}
    }
  };

  const isWishlisted = (productId) => {
    return wishlistItems.some(p => (p._id || p.id) === productId);
  };

  if (loading) {
    return (
      <section className="border-t border-[var(--luxury-gold)]/15 bg-[var(--luxury-cream)] py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-[var(--font-cormorant)] text-2xl font-semibold text-[var(--luxury-brown)] sm:text-3xl">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-sm bg-[#f4ece8]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (suggestedProducts.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-[var(--luxury-gold)]/15 bg-[var(--luxury-cream)] py-10 text-[var(--luxury-brown)] sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 font-[var(--font-cormorant)] text-2xl font-semibold tracking-wide sm:mb-8 sm:text-3xl">
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {suggestedProducts.map((product) => {
            const productId = product._id || product.id;
            const sellingPrice = product.price || Math.round(product.mrp - (product.mrp * (product.discountPercent || 0) / 100));
            const imageUrl = product.images?.image1 || product.image;
            const { showBestSeller, showFewLeft } = getProductPromoBadges(product, lowStockThreshold);

            return (
              <div
                key={productId}
                className="group flex cursor-pointer flex-col overflow-hidden border border-[rgba(44,16,8,0.08)] bg-[#f4ece8] shadow-sm transition-shadow duration-300 hover:border-[var(--luxury-gold)]/25 hover:shadow-md"
                onClick={() => handleProductClick(productId)}
              >
                {/* Image Container */}
                <div className="relative bg-[var(--luxury-cream-deep)] pt-[130%]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,169,110,0.1),transparent_70%)]" />
                  <ProductImage
                    src={imageUrl}
                    alt={product.title || product.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* Wishlist Icon */}
                  <button
                    onClick={(e) => handleWishlistToggle(e, product)}
                    className="absolute right-2 top-2 z-10 rounded-full border border-[var(--luxury-gold)]/30 bg-[var(--luxury-cream)]/95 p-1.5 shadow-sm transition-all hover:bg-[var(--luxury-cream)] md:right-3 md:top-3 md:p-2"
                    aria-label={isWishlisted(productId) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isWishlisted(productId) ? (
                      <FaHeart className="h-3 w-3 text-[var(--brand-maroon)] md:h-4 md:w-4" />
                    ) : (
                      <FaRegHeart className="h-3 w-3 text-[var(--luxury-brown)]/70 md:h-4 md:w-4" />
                    )}
                  </button>

                  <div className="pointer-events-none absolute bottom-2 left-2 z-10 flex max-w-[80%] flex-col items-start gap-1">
                    {showBestSeller && (
                      <span className="bg-[var(--luxury-brown)] px-2 py-0.5 font-[var(--font-cinzel)] text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--luxury-gold)] shadow-sm sm:text-[10px]">
                        Bestseller
                      </span>
                    )}
                    {showFewLeft && (
                      <span className="border border-[var(--luxury-gold)]/40 bg-[rgba(44,16,8,0.85)] px-2 py-0.5 font-[var(--font-cinzel)] text-[9px] font-semibold uppercase tracking-[0.12em] leading-tight text-[var(--luxury-cream)] shadow-sm sm:text-[10px]">
                        Few left
                      </span>
                    )}
                  </div>
                  {formatDiscountPercent(product.discountPercent) > 0 && (
                    <div className="absolute left-2 top-2 z-10 bg-[var(--luxury-cream)] px-2 py-1 font-[var(--font-cinzel)] text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--luxury-brown)] shadow-sm ring-1 ring-[var(--luxury-gold)]/35 sm:text-[10px]">
                      {formatDiscountPercent(product.discountPercent)}% off
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col px-2 pb-4 pt-3 text-left">
                  <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-[var(--luxury-brown)]">
                    {product.title || product.name}
                  </h3>
                  <p className="mb-2 text-xs text-[var(--luxury-brown)]/60">
                    {product.product_info?.brand || ''}
                  </p>
                  <div className="mt-auto flex items-baseline gap-2">
                    <span className="font-[var(--font-cormorant)] text-base font-semibold text-[var(--luxury-brown)]">
                      ₹{sellingPrice.toLocaleString()}
                    </span>
                    {product.mrp && product.mrp > sellingPrice && (
                      <span className="text-xs text-[var(--luxury-brown)]/45 line-through">
                        ₹{product.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductSuggestions;

