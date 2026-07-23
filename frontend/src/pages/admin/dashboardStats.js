const DEFAULT_LOW_STOCK_THRESHOLD = 8;

/** Normalize legacy + current order statuses into one bucket. */
export const getOrderStatus = (order) => {
  const raw = String(order?.orderStatus || order?.status || 'pending').toLowerCase().trim();

  if (raw === 'created' || raw === 'pending') return 'pending';
  if (raw === 'confirmed' || raw === 'packed' || raw === 'processing' || raw === 'paid') return 'confirmed';
  if (raw === 'shipped' || raw === 'on_the_way') return 'shipped';
  if (raw === 'delivered') return 'delivered';
  if (raw === 'cancelled' || raw === 'returned' || raw === 'failed') return 'cancelled';

  return 'pending';
};

export const getPaymentStatus = (order) => {
  if (order?.isPaid === true) return 'paid';
  const raw = String(order?.paymentStatus || order?.status || 'pending').toLowerCase().trim();
  if (raw === 'paid') return 'paid';
  if (raw === 'failed') return 'failed';
  if (raw === 'refunded') return 'refunded';
  return 'pending';
};

export const getOrderAmount = (order) => {
  const total = Number(order?.totalPrice);
  if (Number.isFinite(total) && total > 0) return total;

  const amount = Number(order?.amount);
  if (Number.isFinite(amount) && amount > 0) return amount;

  const itemsPrice = Number(order?.itemsPrice || 0);
  const taxPrice = Number(order?.taxPrice || 0);
  const shippingPrice = Number(order?.shippingPrice || 0);
  const discount = Number(order?.discount ?? order?.couponDiscount ?? 0);
  const computed = itemsPrice + taxPrice + shippingPrice - discount;
  return Number.isFinite(computed) && computed > 0 ? computed : 0;
};

export const isInMonth = (date, year, month) => {
  if (!date) return false;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === year && d.getMonth() === month;
};

export const isInDay = (date, year, month, day) => {
  if (!date) return false;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
};

export const getOrderDate = (order) => order?.createdAt || order?.paidAt || order?.updatedAt;

export const getProductStock = (product) => {
  if (typeof product?.stock === 'number') return product.stock;
  if (typeof product?.quantity === 'number') return product.quantity;
  return Number(product?.stock?.quantity ?? 0);
};

/** Paid revenue that is not cancelled/returned (matches backend adminStats). */
export const isRevenueOrder = (order) => {
  const status = getOrderStatus(order);
  if (status === 'cancelled') return false;
  return getPaymentStatus(order) === 'paid';
};

/** Successful sale for chart (paid, not cancelled). */
export const isSaleOrder = (order) => isRevenueOrder(order);

/**
 * Month cards — mutually exclusive status buckets.
 * Orders = Attempted + Confirmed + Shipping + Delivered + Cancelled
 */
export const buildMonthOrderStats = (orders, year, month) => {
  const monthOrders = (orders || []).filter((order) => isInMonth(getOrderDate(order), year, month));

  let attempted = 0;
  let confirmed = 0;
  let shipping = 0;
  let delivered = 0;
  let cancelled = 0;

  monthOrders.forEach((order) => {
    const status = getOrderStatus(order);
    if (status === 'pending') attempted += 1;
    else if (status === 'confirmed') confirmed += 1;
    else if (status === 'shipped') shipping += 1;
    else if (status === 'delivered') delivered += 1;
    else if (status === 'cancelled') cancelled += 1;
    else attempted += 1;
  });

  return {
    orders: monthOrders.length,
    attempted,
    confirmed,
    shipping,
    delivered,
    cancelled,
  };
};

/** Same buckets as month stats, filtered to one calendar day. */
export const buildDayOrderStats = (orders, year, month, day) => {
  const dayOrders = (orders || []).filter((order) =>
    isInDay(getOrderDate(order), year, month, day)
  );

  let attempted = 0;
  let confirmed = 0;
  let shipping = 0;
  let delivered = 0;
  let cancelled = 0;

  dayOrders.forEach((order) => {
    const status = getOrderStatus(order);
    if (status === 'pending') attempted += 1;
    else if (status === 'confirmed') confirmed += 1;
    else if (status === 'shipped') shipping += 1;
    else if (status === 'delivered') delivered += 1;
    else if (status === 'cancelled') cancelled += 1;
    else attempted += 1;
  });

  return {
    orders: dayOrders.length,
    attempted,
    confirmed,
    shipping,
    delivered,
    cancelled,
  };
};

export const buildProductStats = (products, lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD) => {
  const list = Array.isArray(products) ? products : [];
  const threshold = Number(lowStockThreshold) > 0 ? Number(lowStockThreshold) : DEFAULT_LOW_STOCK_THRESHOLD;

  let activeProducts = 0;
  let outOfStock = 0;
  let lowStock = 0;

  list.forEach((product) => {
    const stock = getProductStock(product);
    if (stock <= 0) {
      outOfStock += 1;
      return;
    }
    activeProducts += 1;
    if (stock <= threshold) lowStock += 1;
  });

  const categories = new Set(
    list
      .map((product) => String(product?.category || '').trim())
      .filter((name) => name && name.toLowerCase() !== 'uncategorized')
  );

  // If everything is Uncategorized, still count it once
  if (categories.size === 0 && list.length > 0) {
    const fallback = list.some((p) => String(p?.category || '').trim());
    if (fallback) categories.add('Uncategorized');
  }

  return {
    activeProducts,
    outOfStock,
    lowStock,
    totalProducts: list.length,
    totalCategories: categories.size,
  };
};

export const buildTotalRevenue = (orders) =>
  (orders || [])
    .filter(isRevenueOrder)
    .reduce((sum, order) => sum + getOrderAmount(order), 0);

export const buildMonthRevenue = (orders, year, month) =>
  (orders || [])
    .filter((order) => isInMonth(getOrderDate(order), year, month))
    .filter(isRevenueOrder)
    .reduce((sum, order) => sum + getOrderAmount(order), 0);

export const buildRevenueGrowth = (orders, year, month) => {
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  const currentRevenue = buildMonthRevenue(orders, year, month);
  const previousRevenue = buildMonthRevenue(orders, prevYear, prevMonth);

  if (previousRevenue <= 0) {
    return currentRevenue > 0 ? 100 : 0;
  }

  return Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100);
};

export const buildChartDataByYear = (orders) => {
  const list = orders || [];
  const years = new Set([new Date().getFullYear()]);

  list.forEach((order) => {
    const d = new Date(getOrderDate(order));
    if (!Number.isNaN(d.getTime())) years.add(d.getFullYear());
  });

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dataByYear = {};

  [...years]
    .sort((a, b) => a - b)
    .forEach((year) => {
      dataByYear[year] = monthLabels.map((label, month) => {
        const monthOrders = list.filter((order) => isInMonth(getOrderDate(order), year, month));
        return {
          label,
          orders: monthOrders.length,
          sales: monthOrders.filter(isSaleOrder).length,
        };
      });
    });

  return dataByYear;
};

export { DEFAULT_LOW_STOCK_THRESHOLD };
