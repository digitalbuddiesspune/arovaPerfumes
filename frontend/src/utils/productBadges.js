export const FEW_LEFT_TAG = 'Only Few Left Hurry';
export const BEST_SELLER_TAG = 'Best Seller';

export function getProductStockQty(product) {
  const q = product?.quantity ?? product?.stock?.quantity ?? product?.stock;
  const n = Number(q);
  return Number.isFinite(n) ? n : 0;
}

/**
 * @param {object} product
 * @param {number} lowStockThreshold from pricing settings; 0 disables auto "few left" from stock count
 */
export function getProductPromoBadges(product, lowStockThreshold = 8) {
  const tags = Array.isArray(product?.tags) ? product.tags : [];
  const qty = getProductStockQty(product);
  const showBestSeller =
    product?.isBestSeller === true || tags.includes(BEST_SELLER_TAG);
  const hasFewLeftTag = tags.includes(FEW_LEFT_TAG);
  const autoFewLeft =
    lowStockThreshold > 0 && qty > 0 && qty <= lowStockThreshold;
  const showFewLeft = hasFewLeftTag || autoFewLeft;
  return { showBestSeller, showFewLeft, qty };
}
