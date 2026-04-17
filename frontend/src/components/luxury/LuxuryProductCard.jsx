import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductImage from '../ProductImage';
import { getProductPromoBadges } from '../../utils/productBadges';

const getProductImages = (product) => {
  const fromGallery = Array.isArray(product?.imageGallery) ? product.imageGallery : [];
  const fromArray = Array.isArray(product?.images) ? product.images : [];
  const fromObject =
    product?.images && !Array.isArray(product.images) && typeof product.images === 'object'
      ? Object.values(product.images)
      : [];

  return [...fromGallery, ...fromArray, ...fromObject]
    .filter(Boolean)
    .map((img) => String(img).trim())
    .filter(Boolean);
};

const LuxuryProductCard = ({ product, onAddToCart, lowStockThreshold = 8, index = 0 }) => {
  const [isAdding, setIsAdding] = useState(false);
  const id = product?._id || product?.id;
  const title = product?.title || product?.name || 'Arova Perfume';
  const price = Math.round(
    product?.price ||
      (product?.mrp * (1 - (product?.discountPercent || 0) / 100)) ||
      product?.mrp ||
      0
  );
  const mrp = Number(product?.mrp || 0);
  const notes = product?.type || product?.subCategory || product?.category || 'Signature fragrance';
  const images = getProductImages(product);
  const primaryImage = images[0] || product?.images?.image1 || product?.image;
  const hoverImage = images[1];
  const { showBestSeller, showFewLeft } = getProductPromoBadges(product, lowStockThreshold);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleAdd = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onAddToCart) return;

    try {
      setIsAdding(true);
      await onAddToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-[220px] sm:max-w-[250px] lg:max-w-[270px]"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={id ? `/product/${id}` : '#'} className="group block h-full">
        <article className="flex h-full flex-col">
          <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[var(--luxury-cream-deep)] sm:mb-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,169,110,0.12),transparent_72%)]" />
            <div className="absolute left-2 top-2 z-10 flex max-w-[82%] flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
              {showBestSeller ? (
                <span className="bg-[var(--luxury-brown)] px-2 py-1 font-[var(--font-cinzel)] text-[8px] uppercase tracking-[0.12em] text-[var(--luxury-gold)] sm:px-3 sm:text-[9px] sm:tracking-[0.16em]">
                  Bestseller
                </span>
              ) : null}
              {showFewLeft ? (
                <span className="border border-[var(--luxury-gold)]/40 bg-[rgba(44,16,8,0.72)] px-2 py-1 font-[var(--font-cinzel)] text-[8px] uppercase tracking-[0.12em] text-[var(--luxury-cream)] sm:px-3 sm:text-[9px] sm:tracking-[0.16em]">
                  Few Left
                </span>
              ) : null}
            </div>
            {discountPercent > 0 ? (
              <div className="absolute right-2 top-2 z-10 bg-[var(--luxury-cream)] px-2 py-1 font-[var(--font-cinzel)] text-[8px] uppercase tracking-[0.12em] text-[var(--luxury-brown)] sm:right-4 sm:top-4 sm:px-3 sm:text-[9px] sm:tracking-[0.16em]">
                {discountPercent}% Off
              </div>
            ) : null}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="h-full w-full">
              <ProductImage
                src={primaryImage}
                alt={title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              {hoverImage ? (
                <ProductImage
                  src={hoverImage}
                  alt={`${title} alternate view`}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
                />
              ) : null}
            </motion.div>
          </div>

          <div className="flex flex-1 flex-col">
            <h3 className="min-h-[2.5rem] font-[var(--font-cormorant)] text-[1.2rem] leading-[1.02] text-[var(--luxury-brown)] sm:min-h-[2.8rem] sm:text-[1.45rem] lg:text-[1.7rem]">
              {title}
            </h3>
            <p className="mt-0.5 min-h-[1.7rem] font-[var(--font-cormorant)] text-[12px] italic leading-4 tracking-[0.04em] text-[var(--luxury-brown-light)] sm:mt-1 sm:min-h-[1.1rem] sm:text-sm sm:leading-5 sm:tracking-[0.08em]">
              {notes}
            </p>
            <div className="mt-3 flex flex-1 flex-col gap-2 sm:mt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <p className="font-[var(--font-cormorant)] text-[1.55rem] font-semibold leading-none text-[var(--luxury-brown)] sm:text-[1.9rem] lg:text-3xl">
                  ₹{price.toLocaleString('en-IN')}
                </p>
                {mrp > price ? (
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-[var(--font-jost)] text-[10px] text-[var(--luxury-brown-light)] sm:text-xs">
                    <span className="line-through">₹{mrp.toLocaleString('en-IN')}</span>
                    <span className="uppercase tracking-[0.14em] text-[var(--luxury-gold-dark)]">
                      Save {discountPercent}%
                    </span>
                  </div>
                ) : <div className="mt-1 h-4" />}
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={isAdding}
                className="mt-auto min-h-10 w-full shrink-0 border border-[var(--luxury-brown)] px-3 py-2 font-[var(--font-cinzel)] text-[8px] uppercase tracking-[0.18em] text-[var(--luxury-brown)] transition duration-300 hover:bg-[var(--luxury-brown)] hover:text-[var(--luxury-cream)] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-11 sm:w-auto sm:px-5 sm:py-2.5 sm:text-[9px] sm:tracking-[0.24em]"
              >
                {isAdding ? 'Adding' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

export default LuxuryProductCard;
