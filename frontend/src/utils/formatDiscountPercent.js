/**
 * Whole-number % for UI (API/backend may send decimals).
 */
export function formatDiscountPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}
