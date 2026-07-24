import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import DashboardCards from './DashboardCards';
import RevenueChart from './RevenueChart';
import StoreOverview from './StoreOverview';
import OrdersTable from './OrdersTable';
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  buildChartDataByYear,
  buildDayOrderStats,
  buildMonthOrderStats,
  buildProductStats,
  buildRevenueGrowth,
  buildTotalRevenue,
} from './dashboardStats';

const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(DEFAULT_LOW_STOCK_THRESHOLD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('thisMonth'); // today | thisMonth | lastMonth

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [statsData, ordersData, productsData, pricingData] = await Promise.all([
          api.admin.stats(),
          api.admin.listOrders(),
          api.admin.listProducts(),
          api.admin.getPricingSettings().catch(() => null),
        ]);

        if (!mounted) return;

        const orderList = unwrapList(ordersData);
        const productList = unwrapList(productsData);
        const computedRevenue = buildTotalRevenue(orderList);
        const apiRevenue = Number(statsData?.totalRevenue || 0);

        setStats({
          totalRevenue: apiRevenue > 0 ? apiRevenue : computedRevenue,
          totalProducts: Number(statsData?.totalProducts || productList.length || 0),
          totalUsers: Number(statsData?.totalUsers || 0),
        });
        setOrders(orderList);
        setProducts(productList);

        const threshold = pricingData?.settings?.lowStockThreshold;
        if (typeof threshold === 'number' && threshold >= 0) {
          setLowStockThreshold(threshold || DEFAULT_LOW_STOCK_THRESHOLD);
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const periodMeta = useMemo(() => {
    if (period === 'today') {
      return {
        mode: 'day',
        year: currentYear,
        month: currentMonth,
        day: now.getDate(),
        label: "Today's",
        rangeLabel: now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      };
    }

    const isLast = period === 'lastMonth';
    const year = isLast ? (currentMonth === 0 ? currentYear - 1 : currentYear) : currentYear;
    const month = isLast ? (currentMonth === 0 ? 11 : currentMonth - 1) : currentMonth;
    const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });

    return {
      mode: 'month',
      year,
      month,
      day: 1,
      label: monthName,
      rangeLabel: isLast ? `Last month (${monthName} ${year})` : `This month (${monthName} ${year})`,
    };
  }, [period, currentYear, currentMonth]);

  const periodStats = useMemo(() => {
    if (periodMeta.mode === 'day') {
      return buildDayOrderStats(orders, periodMeta.year, periodMeta.month, periodMeta.day);
    }
    return buildMonthOrderStats(orders, periodMeta.year, periodMeta.month);
  }, [orders, periodMeta]);

  const productStats = useMemo(
    () => buildProductStats(products, lowStockThreshold),
    [products, lowStockThreshold]
  );

  const summaryStats = useMemo(
    () => ({
      totalProducts: stats.totalProducts || productStats.totalProducts,
      totalCategories: productStats.totalCategories,
      totalRevenue: stats.totalRevenue || buildTotalRevenue(orders),
      revenueGrowth: buildRevenueGrowth(orders, currentYear, currentMonth),
    }),
    [stats, productStats, orders, currentYear, currentMonth]
  );

  const chartDataByYear = useMemo(() => buildChartDataByYear(orders), [orders]);

  const storeOverview = useMemo(
    () => ({
      activeProducts: productStats.activeProducts,
      outOfStock: productStats.outOfStock,
      lowStock: productStats.lowStock,
      activeUsers: stats.totalUsers,
    }),
    [productStats, stats.totalUsers]
  );

  const latestOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10);
  }, [orders]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-20 min-w-[140px] flex-1 animate-pulse rounded-xl border bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-24 animate-pulse rounded-xl border bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="h-80 animate-pulse rounded-xl border bg-white xl:col-span-2" />
          <div className="h-80 animate-pulse rounded-xl border bg-white" />
        </div>
        <div className="h-72 animate-pulse rounded-xl border bg-white" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <DashboardCards
        periodLabel={periodMeta.label}
        rangeLabel={periodMeta.rangeLabel}
        periodStats={periodStats}
        summaryStats={summaryStats}
        period={period}
        onPeriodChange={setPeriod}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart dataByYear={chartDataByYear} />
        </div>
        <StoreOverview stats={storeOverview} />
      </div>

      <OrdersTable orders={latestOrders} />
    </div>
  );
};

export default AdminDashboard;
