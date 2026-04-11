/**
 * Normalize pasted order lookup text to a continuous hex string (8 or 24 chars).
 * Prefers the longest [0-9a-f]{8,} run so values like "Order #069477F7" still work.
 */
export function extractOrderHexFromInput(raw) {
  const t = String(raw ?? '').trim().replace(/^#/, '').trim();
  if (!t) return '';
  const runs = t.match(/[0-9a-f]{8,}/gi);
  if (runs?.length) {
    return runs.sort((a, b) => b.length - a.length)[0].toLowerCase();
  }
  return t.replace(/[^0-9a-f]/gi, '').toLowerCase();
}

/**
 * Customer-facing order reference: last 8 hex chars of Mongo ObjectId, uppercase.
 * Matches backend `orderId` in order.controller / user order APIs.
 *
 * @param {string | { orderId?: string, _id?: string, id?: string } | null | undefined} input
 * @returns {string} Display code without "#" prefix
 */
export function formatDisplayOrderId(input) {
  if (input == null) return '';
  if (typeof input === 'object') {
    const o = input;
    if (o.orderId != null && String(o.orderId).trim() !== '') {
      return formatDisplayOrderId(String(o.orderId).trim());
    }
    const id = o._id ?? o.id;
    if (id == null || id === '') return '';
    return formatDisplayOrderId(String(id));
  }
  const s = String(input).trim().replace(/^#/, '');
  if (!s) return '';
  if (/^[0-9a-fA-F]{8}$/.test(s)) return s.toUpperCase();
  if (/^[0-9a-fA-F]{24}$/i.test(s)) return s.slice(-8).toUpperCase();
  const hex = s.replace(/[^0-9a-fA-F]/g, '');
  if (hex.length >= 8) return hex.slice(-8).toUpperCase();
  return s.toUpperCase();
}
